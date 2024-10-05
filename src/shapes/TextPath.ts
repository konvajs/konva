import { Util } from '../Util';
import { Factory } from '../Factory';
import { Context } from '../Context';
import { Shape, ShapeConfig } from '../Shape';
import { Path } from './Path';
import { Text, stringToArray } from './Text';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

import { GetSet, PathSegment, Vector2d } from '../types';

export interface TextPathConfig extends ShapeConfig {
  text?: string;
  data?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: string;
  letterSpacing?: number;
}

const EMPTY_STRING = '',
  NORMAL = 'normal';

function _fillFunc(this: TextPath, context) {
  context.fillText(this.partialText, 0, 0);
}
function _strokeFunc(this: TextPath, context) {
  context.strokeText(this.partialText, 0, 0);
}

/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} [config.fontFamily] default is Arial
 * @param {Number} [config.fontSize] default is 12
 * @param {String} [config.fontStyle] Can be 'normal', 'italic', or 'bold', '500' or even 'italic bold'.  'normal' is the default.
 * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
 * @param {String} [config.textBaseline] Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'. Default is middle
 * @param {String} config.text
 * @param {String} config.data SVG data string
 * @param {Function} config.kerningFunc a getter for kerning values for the specified characters
 * @@shapeParams
 * @@nodeParams
 * @example
 * var kerningPairs = {
 *   'A': {
 *     ' ': -0.05517578125,
 *     'T': -0.07421875,
 *     'V': -0.07421875
 *   }
 *   'V': {
 *     ',': -0.091796875,
 *     ":": -0.037109375,
 *     ";": -0.037109375,
 *     "A": -0.07421875
 *   }
 * }
 * var textpath = new Konva.TextPath({
 *   x: 100,
 *   y: 50,
 *   fill: '#333',
 *   fontSize: '24',
 *   fontFamily: 'Arial',
 *   text: 'All the world\'s a stage, and all the men and women merely players.',
 *   data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50',
 *   kerningFunc(leftChar, rightChar) {
 *     return kerningPairs.hasOwnProperty(leftChar) ? pairs[leftChar][rightChar] || 0 : 0
 *   }
 * });
 */
export class TextPath extends Shape<TextPathConfig> {
  dummyCanvas = Util.createCanvasElement();
  dataArray: PathSegment[] = [];
  glyphInfo: Array<{
    transposeX: number;
    transposeY: number;
    text: string;
    rotation: number;
    p0: Vector2d;
    p1: Vector2d;
  }>;
  partialText: string;
  pathLength: number;
  textWidth: number;
  textHeight: number;

  constructor(config?: TextPathConfig) {
    // call super constructor
    super(config);

    this._readDataAttribute();

    this.on('dataChange.konva', function () {
      this._readDataAttribute();
      this._setTextData();
    });

    // update text data for certain attr changes
    this.on(
      'textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva fontSizeChange.konva fontFamilyChange.konva',
      this._setTextData
    );

    this._setTextData();
  }

  _getTextPathLength() {
    return Path.getPathLength(this.dataArray);
  }
  _getPointAtLength(length: number) {
    // if path is not defined yet, do nothing
    if (!this.attrs.data) {
      return null;
    }

    const totalLength = this.pathLength;
    // -1px for rounding of the last symbol
    if (length - 1 > totalLength) {
      return null;
    }

    return Path.getPointAtLengthOfDataArray(length, this.dataArray);
  }

  _readDataAttribute() {
    this.dataArray = Path.parsePathData(this.attrs.data);
    this.pathLength = this._getTextPathLength();
  }

  _sceneFunc(context: Context) {
    context.setAttr('font', this._getContextFont());
    context.setAttr('textBaseline', this.textBaseline());
    context.setAttr('textAlign', 'left');
    context.save();

    const textDecoration = this.textDecoration();
    const fill = this.fill();
    const fontSize = this.fontSize();

    const glyphInfo = this.glyphInfo;
    if (textDecoration === 'underline') {
      context.beginPath();
    }
    for (let i = 0; i < glyphInfo.length; i++) {
      context.save();

      const p0 = glyphInfo[i].p0;

      context.translate(p0.x, p0.y);
      context.rotate(glyphInfo[i].rotation);
      this.partialText = glyphInfo[i].text;

      context.fillStrokeShape(this);
      if (textDecoration === 'underline') {
        if (i === 0) {
          context.moveTo(0, fontSize / 2 + 1);
        }

        context.lineTo(fontSize, fontSize / 2 + 1);
      }
      context.restore();

      //// To assist with debugging visually, uncomment following
      //
      // if (i % 2) context.strokeStyle = 'cyan';
      // else context.strokeStyle = 'green';
      // var p1 = glyphInfo[i].p1;
      // context.moveTo(p0.x, p0.y);
      // context.lineTo(p1.x, p1.y);
      // context.stroke();
    }
    if (textDecoration === 'underline') {
      context.strokeStyle = fill;
      context.lineWidth = fontSize / 20;
      context.stroke();
    }

    context.restore();
  }
  _hitFunc(context: Context) {
    context.beginPath();

    const glyphInfo = this.glyphInfo;
    if (glyphInfo.length >= 1) {
      const p0 = glyphInfo[0].p0;
      context.moveTo(p0.x, p0.y);
    }
    for (let i = 0; i < glyphInfo.length; i++) {
      const p1 = glyphInfo[i].p1;
      context.lineTo(p1.x, p1.y);
    }
    context.setAttr('lineWidth', this.fontSize());
    context.setAttr('strokeStyle', this.colorKey);
    context.stroke();
  }
  /**
   * get text width in pixels
   * @method
   * @name Konva.TextPath#getTextWidth
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
  setText(text: string) {
    return Text.prototype.setText.call(this, text);
  }

  _getContextFont() {
    return Text.prototype._getContextFont.call(this);
  }

  _getTextSize(text: string) {
    const dummyCanvas = this.dummyCanvas;
    const _context = dummyCanvas.getContext('2d')!;

    _context.save();

    _context.font = this._getContextFont();
    const metrics = _context.measureText(text);

    _context.restore();

    return {
      width: metrics.width,
      height: parseInt(`${this.fontSize()}`, 10),
    };
  }
  _setTextData() {
    const { width, height } = this._getTextSize(this.attrs.text);
    this.textWidth = width;
    this.textHeight = height;
    this.glyphInfo = [];

    if (!this.attrs.data) {
      return null;
    }

    const letterSpacing = this.letterSpacing();
    const align = this.align();
    const kerningFunc = this.kerningFunc();

    // defines the width of the text on a straight line
    const textWidth = Math.max(
      this.textWidth + ((this.attrs.text || '').length - 1) * letterSpacing,
      0
    );

    let offset = 0;
    if (align === 'center') {
      offset = Math.max(0, this.pathLength / 2 - textWidth / 2);
    }
    if (align === 'right') {
      offset = Math.max(0, this.pathLength - textWidth);
    }

    const charArr = stringToArray(this.text());

    // Algorithm for calculating glyph positions:
    // 1. Get the begging point of the glyph on the path using the offsetToGlyph,
    // 2. Get the ending point of the glyph on the path using the offsetToGlyph plus glyph width,
    // 3. Calculate the rotation, width, and midpoint of the glyph using the start and end points,
    // 4. Add glyph width to the offsetToGlyph and repeat
    let offsetToGlyph = offset;
    for (let i = 0; i < charArr.length; i++) {
      const charStartPoint = this._getPointAtLength(offsetToGlyph);
      if (!charStartPoint) return;

      let glyphWidth = this._getTextSize(charArr[i]).width + letterSpacing;
      if (charArr[i] === ' ' && align === 'justify') {
        const numberOfSpaces = this.text().split(' ').length - 1;
        glyphWidth += (this.pathLength - textWidth) / numberOfSpaces;
      }

      const charEndPoint = this._getPointAtLength(offsetToGlyph + glyphWidth);
      if (!charEndPoint) return;

      const width = Path.getLineLength(
        charStartPoint.x,
        charStartPoint.y,
        charEndPoint.x,
        charEndPoint.y
      );

      let kern = 0;
      if (kerningFunc) {
        try {
          // getKerning is a user provided getter. Make sure it never breaks our logic
          kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
        } catch (e) {
          kern = 0;
        }
      }

      charStartPoint.x += kern;
      charEndPoint.x += kern;
      this.textWidth += kern;

      const midpoint = Path.getPointOnLine(
        kern + width / 2.0,
        charStartPoint.x,
        charStartPoint.y,
        charEndPoint.x,
        charEndPoint.y
      );

      const rotation = Math.atan2(
        charEndPoint.y - charStartPoint.y,
        charEndPoint.x - charStartPoint.x
      );
      this.glyphInfo.push({
        transposeX: midpoint.x,
        transposeY: midpoint.y,
        text: charArr[i],
        rotation: rotation,
        p0: charStartPoint,
        p1: charEndPoint,
      });

      offsetToGlyph += glyphWidth;
    }
  }
  getSelfRect() {
    if (!this.glyphInfo.length) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }
    const points: number[] = [];

    this.glyphInfo.forEach(function (info) {
      points.push(info.p0.x);
      points.push(info.p0.y);
      points.push(info.p1.x);
      points.push(info.p1.y);
    });
    let minX = points[0] || 0;
    let maxX = points[0] || 0;
    let minY = points[1] || 0;
    let maxY = points[1] || 0;
    let x, y;
    for (let i = 0; i < points.length / 2; i++) {
      x = points[i * 2];
      y = points[i * 2 + 1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    const fontSize = this.fontSize();
    return {
      x: minX - fontSize / 2,
      y: minY - fontSize / 2,
      width: maxX - minX + fontSize,
      height: maxY - minY + fontSize,
    };
  }
  destroy(): this {
    Util.releaseCanvas(this.dummyCanvas);
    return super.destroy();
  }

  fontFamily: GetSet<string, this>;
  fontSize: GetSet<number, this>;
  fontStyle: GetSet<string, this>;
  fontVariant: GetSet<string, this>;
  align: GetSet<string, this>;
  letterSpacing: GetSet<number, this>;
  text: GetSet<string, this>;
  data: GetSet<string, this>;

  kerningFunc: GetSet<(leftChar: string, rightChar: string) => number, this>;
  textBaseline: GetSet<string, this>;
  textDecoration: GetSet<string, this>;
}

TextPath.prototype._fillFunc = _fillFunc;
TextPath.prototype._strokeFunc = _strokeFunc;
TextPath.prototype._fillFuncHit = _fillFunc;
TextPath.prototype._strokeFuncHit = _strokeFunc;
TextPath.prototype.className = 'TextPath';
TextPath.prototype._attrsAffectingSize = ['text', 'fontSize', 'data'];
_registerNode(TextPath);

/**
 * get/set SVG path data string.  This method
 *  also automatically parses the data string
 *  into a data array.  Currently supported SVG data:
 *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
 * @name Konva.TextPath#data
 * @method
 * @param {String} data svg path string
 * @returns {String}
 * @example
 * // get data
 * var data = shape.data();
 *
 * // set data
 * shape.data('M200,100h100v50z');
 */
Factory.addGetterSetter(TextPath, 'data');

/**
 * get/set font family
 * @name Konva.TextPath#fontFamily
 * @method
 * @param {String} fontFamily
 * @returns {String}
 * @example
 * // get font family
 * var fontFamily = shape.fontFamily();
 *
 * // set font family
 * shape.fontFamily('Arial');
 */
Factory.addGetterSetter(TextPath, 'fontFamily', 'Arial');

/**
 * get/set font size in pixels
 * @name Konva.TextPath#fontSize
 * @method
 * @param {Number} fontSize
 * @returns {Number}
 * @example
 * // get font size
 * var fontSize = shape.fontSize();
 *
 * // set font size to 22px
 * shape.fontSize(22);
 */

Factory.addGetterSetter(TextPath, 'fontSize', 12, getNumberValidator());

/**
 * get/set font style.  Can be 'normal', 'italic', or 'bold', '500' or even 'italic bold'.  'normal' is the default.
 * @name Konva.TextPath#fontStyle
 * @method
 * @param {String} fontStyle
 * @returns {String}
 * @example
 * // get font style
 * var fontStyle = shape.fontStyle();
 *
 * // set font style
 * shape.fontStyle('bold');
 */

Factory.addGetterSetter(TextPath, 'fontStyle', NORMAL);

/**
 * get/set horizontal align of text.  Can be 'left', 'center', 'right' or 'justify'
 * @name Konva.TextPath#align
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
 */
Factory.addGetterSetter(TextPath, 'align', 'left');

/**
 * get/set letter spacing.  The default is 0.
 * @name Konva.TextPath#letterSpacing
 * @method
 * @param {Number} letterSpacing
 * @returns {Number}
 * @example
 * // get letter spacing value
 * var letterSpacing = shape.letterSpacing();
 *
 * // set the letter spacing value
 * shape.letterSpacing(2);
 */

Factory.addGetterSetter(TextPath, 'letterSpacing', 0, getNumberValidator());

/**
 * get/set text baseline.  The default is 'middle'. Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'
 * @name Konva.TextPath#textBaseline
 * @method
 * @param {String} textBaseline
 * @returns {String}
 * @example
 * // get current text baseline
 * var textBaseline = shape.textBaseline();
 *
 * // set new text baseline
 * shape.textBaseline('top');
 */
Factory.addGetterSetter(TextPath, 'textBaseline', 'middle');

/**
 * get/set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
 * @name Konva.TextPath#fontVariant
 * @method
 * @param {String} fontVariant
 * @returns {String}
 * @example
 * // get font variant
 * var fontVariant = shape.fontVariant();
 *
 * // set font variant
 * shape.fontVariant('small-caps');
 */
Factory.addGetterSetter(TextPath, 'fontVariant', NORMAL);

/**
 * get/set text
 * @name Konva.TextPath#getText
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
Factory.addGetterSetter(TextPath, 'text', EMPTY_STRING);

/**
 * get/set text decoration of a text.  Can be '' or 'underline'.
 * @name Konva.TextPath#textDecoration
 * @method
 * @param {String} textDecoration
 * @returns {String}
 * @example
 * // get text decoration
 * var textDecoration = shape.textDecoration();
 *
 * // underline text
 * shape.textDecoration('underline');
 */
Factory.addGetterSetter(TextPath, 'textDecoration', null);

/**
 * get/set kerning function.
 * @name Konva.TextPath#kerningFunc
 * @method
 * @param {String} kerningFunc
 * @returns {String}
 * @example
 * // get text decoration
 * var kerningFunc = text.kerningFunc();
 *
 * // center text
 * text.kerningFunc(function(leftChar, rightChar) {
 *   return 1;
 * });
 */
Factory.addGetterSetter(TextPath, 'kerningFunc', null);
