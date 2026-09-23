import { Util } from '../Util.ts';
import type { Context, SceneContext } from '../Context.ts';
import { Factory } from '../Factory.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { Konva } from '../Global.ts';
import {
  getNumberValidator,
  getStringValidator,
  getNumberOrAutoValidator,
  getBooleanValidator,
} from '../Validators.ts';
import { _registerNode } from '../Global.ts';

import type { GetSet } from '../types.ts';

export interface CharRenderProps {
  char: string;
  index: number;
  x: number;
  y: number;
  lineIndex: number;
  column: number;
  isLastInLine: boolean;
  width: number;
  context: Context;
}

// grapheme segmentation: one entry per user-perceived character, so flags,
// ZWJ emoji sequences and combining marks stay together
const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;
// canvas has no API for the underline thickness of a font. This is close to
// what browsers draw for the common fonts
export function getDecorationLineWidth(fontSize: number) {
  return fontSize / 15;
}

export function stringToArray(string: string): string[] {
  if (!segmenter) {
    // no Intl.Segmenter (Firefox < 125): flags, then a code point with its
    // combining marks, skin tone modifiers, variation selectors and ZWJ joins
    return (
      string.match(
        /\p{RI}\p{RI}|\P{M}(?:\p{M}|\p{Emoji_Modifier}|\uFE0F|\u200D\P{M})*|\p{M}+/gu
      ) || []
    );
  }
  return Array.from(segmenter.segment(string), (s) => s.segment);
}

export interface TextConfig extends ShapeConfig {
  direction?: string;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: string;
  fontVariant?: string;
  textDecoration?: string;
  underlineOffset?: number;
  align?: string;
  verticalAlign?: string;
  padding?: number;
  lineHeight?: number;
  letterSpacing?: number;
  wrap?: string;
  ellipsis?: boolean;
  charRenderFunc?: null | ((props: CharRenderProps) => void);
}

// constants
const AUTO = 'auto',
  //CANVAS = 'canvas',
  CENTER = 'center',
  INHERIT = 'inherit',
  JUSTIFY = 'justify',
  CHANGE_KONVA = 'Change.konva',
  CONTEXT_2D = '2d',
  DASH = '-',
  LEFT = 'left',
  TEXT = 'text',
  TEXT_UPPER = 'Text',
  TOP = 'top',
  BOTTOM = 'bottom',
  MIDDLE = 'middle',
  NORMAL = 'normal',
  PX_SPACE = 'px ',
  SPACE = ' ',
  RIGHT = 'right',
  RTL = 'rtl',
  WORD = 'word',
  CHAR = 'char',
  NONE = 'none',
  ELLIPSIS = '…',
  ATTR_CHANGE_LIST = [
    'direction',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontVariant',
    'padding',
    'align',
    'verticalAlign',
    'lineHeight',
    'text',
    'width',
    'height',
    'wrap',
    'ellipsis',
    'letterSpacing',
  ];

// Safari on macOS renders text shadow even when globalAlpha is 0.
// This feature check detects that bug so we can work around it with a buffer canvas.
// Not covered by automated tests (our CI doesn't run Safari).
// Once Safari fixes the issue this check can be removed.
let _shadowOpacityBuggy: boolean | null = null;
function hasShadowOpacityBug(): boolean {
  if (_shadowOpacityBuggy !== null) {
    return _shadowOpacityBuggy;
  }
  _shadowOpacityBuggy = false;
  let c;
  try {
    c = Util.createCanvasElement();
    c.width = 10;
    c.height = 10;
    const ctx = c.getContext(CONTEXT_2D);
    if (ctx) {
      ctx.globalAlpha = 0;
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = 'black';
      ctx.font = '10px Arial';
      ctx.fillText('X', 0, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
          _shadowOpacityBuggy = true;
          break;
        }
      }
    }
  } catch (e) {
    // no-op (SSR or restricted canvas)
  } finally {
    if (c) {
      Util.releaseCanvas(c);
    }
  }
  return _shadowOpacityBuggy;
}

function normalizeFontFamily(fontFamily: string) {
  return fontFamily
    .split(',')
    .map((family) => {
      family = family.trim();
      const hasSpace = family.indexOf(' ') >= 0;
      const hasQuotes = family.indexOf('"') >= 0 || family.indexOf("'") >= 0;
      if (hasSpace && !hasQuotes) {
        family = `"${family}"`;
      }
      return family;
    })
    .join(', ');
}

let dummyContext: CanvasRenderingContext2D;
export function getDummyContext() {
  if (dummyContext) {
    return dummyContext;
  }
  dummyContext = Util.createCanvasElement().getContext(
    CONTEXT_2D
  ) as CanvasRenderingContext2D;
  return dummyContext;
}

function _fillFunc(this: Text, context: Context) {
  // re-apply a per-character style set by charRenderFunc (see _sceneFunc)
  if (this._partialFillStyle) {
    context.setAttr('fillStyle', this._partialFillStyle);
  }
  context.fillText(this._partialText, this._partialTextX, this._partialTextY);
}
function _strokeFunc(this: Text, context: Context) {
  context.setAttr('miterLimit', 2);
  if (this._partialStrokeStyle) {
    context.setAttr('strokeStyle', this._partialStrokeStyle);
  }
  context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
}

function checkDefaultFill(config?: TextConfig) {
  config = config || {};

  // set default color to black, without mutating the caller's config
  const hasFill =
    config.fill ||
    config.fillLinearGradientColorStops ||
    config.fillRadialGradientColorStops ||
    config.fillPatternImage;
  return hasFill ? config : { ...config, fill: 'black' };
}

/**
 * Text constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} [config.direction] default is inherit
 * @param {String} [config.fontFamily] default is Arial
 * @param {Number} [config.fontSize] in pixels.  Default is 12
 * @param {String} [config.fontStyle] can be 'normal', 'italic', or 'bold', '500' or even 'italic bold'.  'normal' is the default.
 * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
 * @param {String} [config.textDecoration] can be line-through, underline or empty string. Default is empty string.
 * @param {Number} [config.underlineOffset] offset for underline line. Default is calculated based on font size.
 * @param {String} config.text
 * @param {String} [config.align] can be left, center, right or justify
 * @param {String} [config.verticalAlign] can be top, middle or bottom
 * @param {Number} [config.padding]
 * @param {Number} [config.lineHeight] default is 1
 * @param {String} [config.wrap] can be "word", "char", or "none". Default is word
 * @param {Boolean} [config.ellipsis] can be true or false. Default is false. If true, text that does not fit is cut and ends with "…". That needs a fixed height or wrap="none"
 * @@shapeParams
 * @@nodeParams
 * @example
 * var text = new Konva.Text({
 *   x: 10,
 *   y: 15,
 *   text: 'Simple Text',
 *   fontSize: 30,
 *   fontFamily: 'Calibri',
 *   fill: 'green'
 * });
 */
export class Text extends Shape<TextConfig> {
  textArr: Array<{ text: string; width: number; lastInParagraph: boolean }>;
  _partialText: string;
  _partialTextX = 0;
  _partialTextY = 0;
  _partialFillStyle?: string | CanvasGradient | CanvasPattern;
  _partialStrokeStyle?: string | CanvasGradient | CanvasPattern;

  textWidth: number;
  textHeight: number;
  // distance from the line box center to the baseline, see _setTextData
  _baselineShift = 0;
  constructor(config?: TextConfig) {
    super(checkDefaultFill(config));
    this._setTextData();
  }

  _sceneFunc(context: SceneContext) {
    const textArr = this.textArr,
      textArrLen = textArr.length;

    if (!this.text()) {
      return;
    }

    let padding = this.padding(),
      fontSize = this.fontSize(),
      lineHeightPx = this.lineHeight() * fontSize,
      verticalAlign = this.verticalAlign(),
      direction = this.direction(),
      alignY = 0,
      align = this.align(),
      totalWidth = this.getWidth(),
      letterSpacing = this.letterSpacing(),
      charRenderFunc = this.charRenderFunc(),
      textDecoration = this.textDecoration(),
      shouldUnderline = textDecoration.indexOf('underline') !== -1,
      shouldLineThrough = textDecoration.indexOf('line-through') !== -1,
      n;

    let translateY = lineHeightPx / 2;
    let baseline = MIDDLE;
    if (!Konva.legacyTextRendering) {
      const metrics = this.measureSize('M'); // Use a sample character to get the ascent

      baseline = 'alphabetic';
      const ascent =
        metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
      const descent =
        metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;

      translateY = (ascent - descent) / 2 + lineHeightPx / 2;
    }

    if (direction !== INHERIT) {
      context.setAttr('direction', direction);
    } else {
      // 'inherit' resolves to the direction the canvas already has, so that
      // an inherited rtl still takes the single native run below
      direction = context.direction;
    }

    context.setAttr('font', this._getContextFont());

    context.setAttr('textBaseline', baseline);

    context.setAttr('textAlign', LEFT);

    // handle vertical alignment
    if (verticalAlign === MIDDLE) {
      alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
    } else if (verticalAlign === BOTTOM) {
      alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
    }

    context.translate(padding, alignY + padding);

    // Start the callback with the same fill that normal drawing would use.
    // Assigning that color again then needs no override, including black.
    if (charRenderFunc) {
      const style = context._getFillStyle(this);
      if (style !== undefined) context.fillStyle = style;
      if (this.hasStroke()) context._applyStrokeStyle(this);
    }

    // context styles entering the loop, used to detect styles set by
    // charRenderFunc; every character is drawn inside save()/restore(),
    // so the entry state is the same for each one
    const fillStyleBefore = charRenderFunc ? context.fillStyle : undefined;
    const strokeStyleBefore = charRenderFunc ? context.strokeStyle : undefined;

    // global grapheme index passed to charRenderFunc, runs across lines
    let charIndex = 0;

    // draw text lines
    for (n = 0; n < textArrLen; n++) {
      let lineTranslateX = 0;
      let lineTranslateY = 0;
      const obj = textArr[n],
        text = obj.text,
        width = obj.width,
        lastLine = obj.lastInParagraph;

      // horizontal alignment
      context.save();
      if (align === RIGHT) {
        lineTranslateX += totalWidth - width - padding * 2;
      } else if (align === CENTER) {
        lineTranslateX += (totalWidth - width - padding * 2) / 2;
      }

      if (shouldUnderline) {
        context.save();
        context.beginPath();

        const yOffset = this._getUnderlineOffset();
        const x = lineTranslateX;
        const y = translateY + lineTranslateY + yOffset;
        context.moveTo(x, y);
        const lineWidth =
          align === JUSTIFY && !lastLine ? totalWidth - padding * 2 : width;
        context.lineTo(x + Math.round(lineWidth), y);

        context.lineWidth = getDecorationLineWidth(fontSize);

        context.strokeStyle = context._getFillStyle(this)!;
        context.stroke();
        context.restore();
      }

      // store the starting x position for line-through which is drawn after text
      const lineThroughStartX = lineTranslateX;

      // Render graphemes separately for spacing, justification and callbacks.
      // Keep RTL text in one native run to preserve shaping.
      if (
        direction !== RTL &&
        (letterSpacing !== 0 || align === JUSTIFY || charRenderFunc)
      ) {
        const spacesNumber = text.split(' ').length - 1;
        const array = stringToArray(text);
        for (let li = 0; li < array.length; li++) {
          const letter = array[li];
          // skip justify for the last line
          if (letter === ' ' && !lastLine && align === JUSTIFY) {
            lineTranslateX += (totalWidth - padding * 2 - width) / spacesNumber;
          }
          this._partialTextX = lineTranslateX;
          this._partialTextY = translateY + lineTranslateY;
          this._partialText = letter;
          // the font of the shape is already set on the context
          const letterWidth = context.measureText(letter).width;

          if (charRenderFunc) {
            context.save();
            charRenderFunc({
              char: letter,
              index: charIndex,
              x: lineTranslateX,
              y: translateY + lineTranslateY,
              lineIndex: n,
              column: li,
              isLastInLine: li === array.length - 1,
              width: letterWidth,
              context,
            });
            // a style the callback set on the context wins for this character;
            // fillStrokeShape() overwrites the context styles from the shape
            // attributes, so stash them for _fillFunc/_strokeFunc to re-apply
            const fillStyleAfter = context.fillStyle;
            if (fillStyleAfter !== fillStyleBefore) {
              this._partialFillStyle = fillStyleAfter;
            }
            const strokeStyleAfter = context.strokeStyle;
            if (strokeStyleAfter !== strokeStyleBefore) {
              this._partialStrokeStyle = strokeStyleAfter;
            }
          }
          context.fillStrokeShape(this);
          if (charRenderFunc) {
            this._partialFillStyle = undefined;
            this._partialStrokeStyle = undefined;
            context.restore();
          }
          lineTranslateX += letterWidth + letterSpacing;
          charIndex++;
        }
      } else {
        if (letterSpacing !== 0) {
          context.setAttr('letterSpacing', `${letterSpacing}px`);
        }
        this._partialTextX = lineTranslateX;
        this._partialTextY = translateY + lineTranslateY;
        this._partialText = text;

        context.fillStrokeShape(this);
      }

      // draw line-through above the text content
      if (shouldLineThrough) {
        context.save();
        context.beginPath();
        const yOffset = !Konva.legacyTextRendering
          ? -Math.round(fontSize / 4)
          : 0;
        const x = lineThroughStartX;
        context.moveTo(x, translateY + lineTranslateY + yOffset);
        const lineWidth =
          align === JUSTIFY && !lastLine ? totalWidth - padding * 2 : width;

        context.lineTo(
          x + Math.round(lineWidth),
          translateY + lineTranslateY + yOffset
        );
        context.lineWidth = getDecorationLineWidth(fontSize);
        context.strokeStyle = context._getFillStyle(this)!;
        context.stroke();
        context.restore();
      }

      context.restore();
      if (textArrLen > 1) {
        translateY += lineHeightPx;
      }
    }
  }
  _getUnderlineOffset() {
    return (
      this.underlineOffset() ??
      Math.round(this.fontSize() / (!Konva.legacyTextRendering ? 4 : 2))
    );
  }
  getSelfRect() {
    const rect = super.getSelfRect();
    const lines = this.textArr.length;
    if (!lines || this.textDecoration().indexOf('underline') === -1) {
      return rect;
    }
    // the underline of the last line is drawn below the text block
    const fontSize = this.fontSize(),
      lineHeightPx = this.lineHeight() * fontSize,
      padding = this.padding(),
      verticalAlign = this.verticalAlign(),
      blockHeight = lines * lineHeightPx + padding * 2;
    let bottom = lines * lineHeightPx - lineHeightPx / 2 + padding;
    if (!Konva.legacyTextRendering) {
      bottom += this._baselineShift;
    }
    if (verticalAlign === MIDDLE) {
      bottom += (rect.height - blockHeight) / 2;
    } else if (verticalAlign === BOTTOM) {
      bottom += rect.height - blockHeight;
    }
    bottom += this._getUnderlineOffset() + getDecorationLineWidth(fontSize) / 2;
    rect.height = Math.max(rect.height, bottom);
    return rect;
  }
  _getSelfRectForDrawing() {
    // Lines can be wider than the box, negative spacing moves the pen back,
    // and glyph ink passes the advance box (italics, accents): up to 0.6em
    // in common fonts, so pad by 1em.
    const rect = this.getSelfRect(),
      fontSize = this.fontSize(),
      padding = this.padding(),
      lineHeightPx = this.lineHeight() * fontSize,
      available = this.getWidth() - padding * 2,
      align = this.align(),
      blockHeight = this.textArr.length * lineHeightPx;
    let top = padding;
    if (this.verticalAlign() === MIDDLE) {
      top += (this.getHeight() - blockHeight - padding * 2) / 2;
    } else if (this.verticalAlign() === BOTTOM) {
      top += this.getHeight() - blockHeight - padding * 2;
    }
    let left = rect.x,
      right = rect.x + rect.width;
    for (const { text, width } of this.textArr) {
      const x =
        padding +
        (align === RIGHT
          ? available - width
          : align === CENTER
            ? (available - width) / 2
            : 0);
      const back = Math.min(0, this.letterSpacing()) * text.length;
      left = Math.min(left, x + back);
      right = Math.max(right, x + width - back);
    }
    const underline = this.textDecoration().includes('underline');
    const y = Math.min(
      rect.y,
      top + (underline ? Math.min(0, this._getUnderlineOffset()) : 0)
    );
    return {
      x: left - fontSize,
      y: y - fontSize,
      width: right - left + fontSize * 2,
      height:
        Math.max(rect.y + rect.height, top + blockHeight) - y + fontSize * 2,
    };
  }
  _hitFunc(context: Context) {
    const width = this.getWidth(),
      height = this.getHeight();

    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.fillStrokeShape(this);
  }
  setText(text: string) {
    const str = Util._isString(text)
      ? text
      : text === null || text === undefined
        ? ''
        : text + '';
    this._setAttr(TEXT, str);
    return this;
  }
  getWidth() {
    const isAuto = this.attrs.width === AUTO || this.attrs.width === undefined;
    return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
  }
  getHeight() {
    const isAuto =
      this.attrs.height === AUTO || this.attrs.height === undefined;
    return isAuto
      ? this.fontSize() * this.textArr.length * this.lineHeight() +
          this.padding() * 2
      : this.attrs.height;
  }
  /**
   * get pure text width without padding
   * @method
   * @name Konva.Text#getTextWidth
   * @returns {Number}
   */
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    Util.warn(
      'text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.'
    );
    return this.textHeight;
  }

  /**
   * measure string with the font of current text shape.
   * That method can't handle multiline text.
   * @method
   * @name Konva.Text#measureSize
   * @param {String} text text to measure
   * @returns {Object} { width , height } of measured text
   */
  measureSize(text: string) {
    let _context = getDummyContext(),
      fontSize = this.fontSize(),
      metrics: TextMetrics;

    _context.save();
    _context.font = this._getContextFont();

    metrics = _context.measureText(text);
    _context.restore();

    // Scale the fallback values based on the provided fontSize compared to the sample size (100 in your new case)
    const scaleFactor = fontSize / 100;

    // Note, fallback values are from chrome browser with 100px font size and font-family "Arial"
    return {
      actualBoundingBoxAscent:
        metrics.actualBoundingBoxAscent ?? 71.58203125 * scaleFactor,
      actualBoundingBoxDescent: metrics.actualBoundingBoxDescent ?? 0, // Remains zero as there is no descent in the provided metrics
      actualBoundingBoxLeft:
        metrics.actualBoundingBoxLeft ?? -7.421875 * scaleFactor,
      actualBoundingBoxRight:
        metrics.actualBoundingBoxRight ?? 75.732421875 * scaleFactor,
      alphabeticBaseline: metrics.alphabeticBaseline ?? 0, // Remains zero as it's typically relative to the baseline itself
      emHeightAscent: metrics.emHeightAscent ?? 100 * scaleFactor,
      emHeightDescent: metrics.emHeightDescent ?? -20 * scaleFactor,
      fontBoundingBoxAscent: metrics.fontBoundingBoxAscent ?? 91 * scaleFactor,
      fontBoundingBoxDescent:
        metrics.fontBoundingBoxDescent ?? 21 * scaleFactor,
      hangingBaseline:
        metrics.hangingBaseline ?? 72.80000305175781 * scaleFactor,
      ideographicBaseline: metrics.ideographicBaseline ?? -21 * scaleFactor,
      width: metrics.width,
      height: fontSize, // Typically set to the font size
    };
  }
  _getContextFont() {
    return (
      this.fontStyle() +
      SPACE +
      this.fontVariant() +
      SPACE +
      (this.fontSize() + PX_SPACE) +
      // wrap font family into " so font families with spaces works ok
      normalizeFontFamily(this.fontFamily())
    );
  }
  _addTextLine(line: string) {
    const align = this.align();
    if (align === JUSTIFY) {
      line = line.trim();
    }
    const width = this._getTextWidth(line);
    return this.textArr.push({
      text: line,
      width: width,
      lastInParagraph: false,
    });
  }
  _getTextWidth(text: string, graphemes?: number) {
    const letterSpacing = this.letterSpacing();
    // one spacing per grapheme, as the per-character rendering draws them
    const spacing = letterSpacing
      ? letterSpacing * (graphemes ?? stringToArray(text).length)
      : 0;
    return getDummyContext().measureText(text).width + spacing;
  }
  _setTextData() {
    let lines = this.text().split('\n'),
      fontSize = +this.fontSize(),
      lineHeightPx = this.lineHeight() * fontSize,
      width = this.attrs.width,
      height = this.attrs.height,
      fixedWidth = width !== AUTO && width !== undefined,
      fixedHeight = height !== AUTO && height !== undefined,
      padding = this.padding(),
      maxWidth = width - padding * 2,
      maxHeightPx = height - padding * 2,
      currentHeightPx = 0,
      wrap = this.wrap(),
      // align = this.align(),
      shouldWrap = wrap !== NONE,
      wrapAtWord = wrap !== CHAR && shouldWrap,
      shouldAddEllipsis = this.ellipsis();

    // measured here so getSelfRect, which runs per drag frame, needs no
    // measureText of its own
    const sample = this.measureSize('M');
    this._baselineShift =
      (sample.fontBoundingBoxAscent - sample.fontBoundingBoxDescent) / 2;

    this.textArr = [];
    const dummyContext = getDummyContext();
    dummyContext.font = this._getContextFont();
    // the per-character draw path (same condition as in _sceneFunc) advances
    // by unkerned glyph widths, so measure the line the same way
    dummyContext.fontKerning =
      this.direction() !== RTL &&
      (this.letterSpacing() !== 0 ||
        this.align() === JUSTIFY ||
        !!this.charRenderFunc())
        ? 'none'
        : 'auto';
    const additionalWidth = shouldAddEllipsis
      ? this._getTextWidth(ELLIPSIS)
      : 0;
    for (let i = 0, max = lines.length; i < max; ++i) {
      let line = lines[i];

      let lineWidth = this._getTextWidth(line);
      if (fixedWidth && lineWidth > maxWidth) {
        /*
         * if width is fixed and line does not fit entirely
         * break the line into multiple fitting lines
         */
        const graphemes = stringToArray(line);
        const length = graphemes.length;
        let start = 0;
        const text = (end: number) => graphemes.slice(start, end).join('');
        const isBreak = (char: string) => char === SPACE || char === DASH;
        // graphemes per line, estimated from the average grapheme width
        const perLine = Math.max(1, Math.ceil((length * maxWidth) / lineWidth));
        while (start < length) {
          // only reserve the ellipsis width on a line that may be the last
          // visible one
          const extraWidth =
            shouldAddEllipsis &&
            fixedHeight &&
            currentHeightPx + lineHeightPx > maxHeightPx
              ? additionalWidth
              : 0;
          const fits = (end: number) => {
            const width = this._getTextWidth(text(end), end - start);
            if (width + extraWidth > maxWidth) {
              return false;
            }
            return true;
          };
          /*
           * find the longest prefix that fits in the specified width:
           * grow a window from the estimate until it stops fitting, then
           * binary search inside it. Every probe measures about one line,
           * not the whole remaining text, so wrapping stays linear
           */
          let low = start,
            high = Math.min(length, start + perLine);
          while (fits(high)) {
            low = high;
            if (high === length) {
              break;
            }
            high = Math.min(length, high + (high - start));
          }
          while (high - low > 1) {
            const mid = (low + high) >>> 1;
            if (fits(mid)) {
              low = mid;
            } else {
              high = mid;
            }
          }
          if (low === start) {
            // not even one character could fit in the element, abort
            break;
          }
          if (low === length) {
            // the rest of the paragraph fits on one line: kept untrimmed and
            // without the ellipsis check, like a paragraph that never wrapped
            this._addTextLine(text(length));
            currentHeightPx += lineHeightPx;
            if (
              fixedHeight &&
              currentHeightPx + lineHeightPx > maxHeightPx &&
              i < max - 1
            ) {
              this._tryToAddEllipsisToLastLine();
            }
            break;
          }
          if (wrapAtWord && !isBreak(graphemes[low])) {
            // wrap at the last space or dash of the line instead
            let wrapIndex = low - 1;
            while (wrapIndex >= start && !isBreak(graphemes[wrapIndex])) {
              wrapIndex--;
            }
            if (wrapIndex >= start) {
              low = wrapIndex + 1;
            }
          }
          this._addTextLine(text(low).trimRight());
          currentHeightPx += lineHeightPx;

          if (this._shouldHandleEllipsis(currentHeightPx)) {
            this._tryToAddEllipsisToLastLine();
            /*
             * stop wrapping if wrapping is disabled or if adding
             * one more line would overflow the fixed height
             */
            break;
          }
          // the next line starts after the whitespace of the break
          start = low;
          while (start < length && !graphemes[start].trim()) {
            start++;
          }
        }
      } else {
        // element width is automatically adjusted to max line width
        this._addTextLine(line);
        currentHeightPx += lineHeightPx;
        if (
          fixedHeight &&
          currentHeightPx + lineHeightPx > maxHeightPx &&
          i < max - 1
        ) {
          this._tryToAddEllipsisToLastLine();
        }
      }
      // if element height is fixed, abort if adding one more line would overflow
      if (this.textArr[this.textArr.length - 1]) {
        this.textArr[this.textArr.length - 1].lastInParagraph = true;
      }
      if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
        break;
      }
    }
    this.textHeight = fontSize;
    this.textWidth = this.textArr.reduce(
      (width, line) => Math.max(width, line.width),
      0
    );
  }

  /**
   * whether to handle ellipsis, there are two cases:
   * 1. the current line is the last line
   * 2. wrap is NONE
   * @param {Number} currentHeightPx
   * @returns {Boolean}
   */
  _shouldHandleEllipsis(currentHeightPx: number): boolean {
    const fontSize = +this.fontSize(),
      lineHeightPx = this.lineHeight() * fontSize,
      height = this.attrs.height,
      fixedHeight = height !== AUTO && height !== undefined,
      padding = this.padding(),
      maxHeightPx = height - padding * 2,
      wrap = this.wrap(),
      shouldWrap = wrap !== NONE;

    return (
      !shouldWrap ||
      (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)
    );
  }

  _tryToAddEllipsisToLastLine(): void {
    const width = this.attrs.width,
      fixedWidth = width !== AUTO && width !== undefined,
      padding = this.padding(),
      maxWidth = width - padding * 2,
      shouldAddEllipsis = this.ellipsis();

    const lastLine = this.textArr[this.textArr.length - 1];
    if (!lastLine || !shouldAddEllipsis) {
      return;
    }

    let text = lastLine.text + ELLIPSIS;
    if (fixedWidth) {
      const graphemes = stringToArray(lastLine.text);
      while (graphemes.length && this._getTextWidth(text) > maxWidth) {
        graphemes.pop();
        text = graphemes.join('') + ELLIPSIS;
      }
      if (this._getTextWidth(text) > maxWidth) text = '';
    }
    lastLine.text = text;
    lastLine.width = this._getTextWidth(text);
  }

  // for text we can't disable stroke scaling
  // if we do, the result will be unexpected
  getStrokeScaleEnabled() {
    return true;
  }

  _getStrokePadding() {
    // _strokeFunc uses a miter limit of two for glyph outlines.
    return super._getStrokePadding(2);
  }
  _useBufferCanvas(forceFill?: boolean, opacity = this.getAbsoluteOpacity()) {
    if (this.attrs.perfectDrawEnabled === false) return false;
    const hasLine =
      this.textDecoration().indexOf('underline') !== -1 ||
      this.textDecoration().indexOf('line-through') !== -1;
    const hasShadow = this.hasShadow();
    if (hasLine && hasShadow) {
      return true;
    }
    if (hasShadow && opacity !== 1 && hasShadowOpacityBug()) {
      return true;
    }
    return super._useBufferCanvas(forceFill, opacity);
  }

  direction: GetSet<string, this>;
  fontFamily: GetSet<string, this>;
  fontSize: GetSet<number, this>;
  fontStyle: GetSet<string, this>;
  fontVariant: GetSet<string, this>;
  align: GetSet<string, this>;
  letterSpacing: GetSet<number, this>;
  verticalAlign: GetSet<string, this>;
  padding: GetSet<number, this>;
  lineHeight: GetSet<number, this>;
  textDecoration: GetSet<string, this>;
  underlineOffset: GetSet<number, this>;
  text: GetSet<string, this>;
  wrap: GetSet<string, this>;
  ellipsis: GetSet<boolean, this>;
  charRenderFunc: GetSet<null | ((props: CharRenderProps) => void), this>;
  // 'auto' resets the fixed size; the getters return the measured size
  width: GetSet<number, this, number | 'auto' | null | undefined>;
  height: GetSet<number, this, number | 'auto' | null | undefined>;
}

Text.prototype._fillFunc = _fillFunc;
Text.prototype._strokeFunc = _strokeFunc;
Text.prototype.className = TEXT_UPPER;
// the decoration attrs are not in ATTR_CHANGE_LIST: they change the bounds
// through getSelfRect, but need no relayout
Text.prototype._attrsAffectingSize = ATTR_CHANGE_LIST.filter(
  (attr) => attr !== 'width' && attr !== 'height'
).concat(['textDecoration', 'underlineOffset']);
_registerNode(Text, true);

// update text data for certain attr changes
Text.prototype.on(
  ATTR_CHANGE_LIST.map((attr) => attr + CHANGE_KONVA).join(' '),
  function () {
    this._setTextData();
  }
);

/**
 * get/set width of text area, which includes padding.
 * @name Konva.Text#width
 * @method
 * @param {Number} width
 * @returns {Number}
 * @example
 * // get width
 * var width = text.width();
 *
 * // set width
 * text.width(20);
 *
 * // set to auto
 * text.width('auto');
 * text.width() // will return calculated width, and not "auto"
 */
Factory.overWriteSetter(Text, 'width', getNumberOrAutoValidator());

/**
 * get/set the height of the text area, which takes into account multi-line text, line heights, and padding.
 * @name Konva.Text#height
 * @method
 * @param {Number} height
 * @returns {Number}
 * @example
 * // get height
 * var height = text.height();
 *
 * // set height
 * text.height(20);
 *
 * // set to auto
 * text.height('auto');
 * text.height() // will return calculated height, and not "auto"
 */

Factory.overWriteSetter(Text, 'height', getNumberOrAutoValidator());

/**
 * get/set direction
 * @name Konva.Text#direction
 * @method
 * @param {String} direction
 * @returns {String}
 * @example
 * // get direction
 * var direction = text.direction();
 *
 * // set direction
 * text.direction('rtl');
 */
Factory.addGetterSetter(Text, 'direction', INHERIT);

/**
 * get/set font family
 * @name Konva.Text#fontFamily
 * @method
 * @param {String} fontFamily
 * @returns {String}
 * @example
 * // get font family
 * var fontFamily = text.fontFamily();
 *
 * // set font family
 * text.fontFamily('Arial');
 */
Factory.addGetterSetter(Text, 'fontFamily', 'Arial');

/**
 * get/set font size in pixels
 * @name Konva.Text#fontSize
 * @method
 * @param {Number} fontSize
 * @returns {Number}
 * @example
 * // get font size
 * var fontSize = text.fontSize();
 *
 * // set font size to 22px
 * text.fontSize(22);
 */
Factory.addGetterSetter(Text, 'fontSize', 12, getNumberValidator());

/**
 * get/set font style.  Can be 'normal', 'italic', or 'bold', '500' or even 'italic bold'.  'normal' is the default.
 * @name Konva.Text#fontStyle
 * @method
 * @param {String} fontStyle
 * @returns {String}
 * @example
 * // get font style
 * var fontStyle = text.fontStyle();
 *
 * // set font style
 * text.fontStyle('bold');
 */

Factory.addGetterSetter(Text, 'fontStyle', NORMAL);

/**
 * get/set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
 * @name Konva.Text#fontVariant
 * @method
 * @param {String} fontVariant
 * @returns {String}
 * @example
 * // get font variant
 * var fontVariant = text.fontVariant();
 *
 * // set font variant
 * text.fontVariant('small-caps');
 */

Factory.addGetterSetter(Text, 'fontVariant', NORMAL);

/**
 * get/set padding
 * @name Konva.Text#padding
 * @method
 * @param {Number} padding
 * @returns {Number}
 * @example
 * // get padding
 * var padding = text.padding();
 *
 * // set padding to 10 pixels
 * text.padding(10);
 */

Factory.addGetterSetter(Text, 'padding', 0, getNumberValidator());

/**
 * get/set horizontal align of text.  Can be 'left', 'center', 'right' or 'justify'
 * @name Konva.Text#align
 * @method
 * @param {String} align
 * @returns {String}
 * @example
 * // get text align
 * var align = text.align();
 *
 * // center text
 * text.align('center');
 *
 * // align text to right
 * text.align('right');
 *
 * // justify text
 */

Factory.addGetterSetter(Text, 'align', LEFT);

/**
 * get/set vertical align of text.  Can be 'top', 'middle', 'bottom'.
 * @name Konva.Text#verticalAlign
 * @method
 * @param {String} verticalAlign
 * @returns {String}
 * @example
 * // get text vertical align
 * var verticalAlign = text.verticalAlign();
 *
 * // center text
 * text.verticalAlign('middle');
 */

Factory.addGetterSetter(Text, 'verticalAlign', TOP);

/**
 * get/set line height.  The default is 1.
 * @name Konva.Text#lineHeight
 * @method
 * @param {Number} lineHeight
 * @returns {Number}
 * @example
 * // get line height
 * var lineHeight = text.lineHeight();
 *
 * // set the line height
 * text.lineHeight(2);
 */

Factory.addGetterSetter(Text, 'lineHeight', 1, getNumberValidator());

/**
 * get/set wrap.  Can be "word", "char", or "none". Default is "word".
 * In "word" wrapping any word still can be wrapped if it can't be placed in the required width
 * without breaks.
 * @name Konva.Text#wrap
 * @method
 * @param {String} wrap
 * @returns {String}
 * @example
 * // get wrap
 * var wrap = text.wrap();
 *
 * // set wrap
 * text.wrap('word');
 */

Factory.addGetterSetter(Text, 'wrap', WORD);

/**
 * get/set ellipsis. Can be true or false. Default is false. If ellipsis is true,
 * Konva cuts the text that does not fit and ends it with "…" (one character).
 * That needs a fixed height or wrap set to "none"
 * @name Konva.Text#ellipsis
 * @method
 * @param {Boolean} ellipsis
 * @returns {Boolean}
 * @example
 * // get ellipsis param, returns true or false
 * var ellipsis = text.ellipsis();
 *
 * // set ellipsis
 * text.ellipsis(true);
 */

Factory.addGetterSetter(Text, 'ellipsis', false, getBooleanValidator());

/**
 * set letter spacing property. Default value is 0.
 * @name Konva.Text#letterSpacing
 * @method
 * @param {Number} letterSpacing
 */

Factory.addGetterSetter(Text, 'letterSpacing', 0, getNumberValidator());

/**
 * get/set text
 * @name Konva.Text#text
 * @method
 * @param {String} text
 * @returns {String}
 * @example
 * // get text
 * var text = text.text();
 *
 * // set text
 * text.text('Hello world!');
 */

Factory.addGetterSetter(Text, 'text', '', getStringValidator());

/**
 * get/set text decoration of a text.  Possible values are 'underline', 'line-through' or combination of these values separated by space
 * @name Konva.Text#textDecoration
 * @method
 * @param {String} textDecoration
 * @returns {String}
 * @example
 * // get text decoration
 * var textDecoration = text.textDecoration();
 *
 * // underline text
 * text.textDecoration('underline');
 *
 * // strike text
 * text.textDecoration('line-through');
 *
 * // underline and strike text
 * text.textDecoration('underline line-through');
 */

Factory.addGetterSetter(Text, 'textDecoration', '');

/**
 * get/set text underline decoration offset. Offset for underline line. Default is calculated based on font size.
 * @name Konva.Text#underlineOffset
 * @method
 * @param {Number} underlineOffset
 * @returns {Number}
 * @example
 * // get underline offset
 * var underlineOffset = text.underlineOffset();
 *
 * // set underline offset
 * text.underlineOffset(5);
 */
Factory.addGetterSetter(
  Text,
  'underlineOffset',
  undefined,
  getNumberValidator()
);

/**
 * get/set per-character render hook. The callback is invoked for each grapheme before drawing, except for RTL text.
 * It can mutate the provided context (e.g. translate, rotate, change styles) and should return void.
 * Note: per-character rendering may disable native kerning/ligatures.
 * @name Konva.Text#charRenderFunc
 * @method
 * @param {Function} charRenderFunc
 * @returns {Function}
 * @example
 * // apply small x-translation and a custom color to every second character
 * text.charRenderFunc(function(props) {
 *   if (props.index % 2 === 1) {
 *     props.context.translate(2, 0);
 *     props.context.fillStyle = 'red';
 *   }
 * });
 */
Factory.addGetterSetter(Text, 'charRenderFunc', undefined);
