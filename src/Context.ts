import { Util } from './Util';
import { Konva } from './Global';
import { Canvas } from './Canvas';
import { Shape } from './Shape';
import { IRect } from './types';
import type { Node } from './Node';

function simplifyArray(arr: Array<any>) {
  let retArr: Array<any> = [],
    len = arr.length,
    util = Util,
    n,
    val;

  for (n = 0; n < len; n++) {
    val = arr[n];
    if (util._isNumber(val)) {
      val = Math.round(val * 1000) / 1000;
    } else if (!util._isString(val)) {
      val = val + '';
    }

    retArr.push(val);
  }

  return retArr;
}

const COMMA = ',',
  OPEN_PAREN = '(',
  CLOSE_PAREN = ')',
  OPEN_PAREN_BRACKET = '([',
  CLOSE_BRACKET_PAREN = '])',
  SEMICOLON = ';',
  DOUBLE_PAREN = '()',
  // EMPTY_STRING = '',
  EQUALS = '=',
  // SET = 'set',
  CONTEXT_METHODS = [
    'arc',
    'arcTo',
    'beginPath',
    'bezierCurveTo',
    'clearRect',
    'clip',
    'closePath',
    'createLinearGradient',
    'createPattern',
    'createRadialGradient',
    'drawImage',
    'ellipse',
    'fill',
    'fillText',
    'getImageData',
    'createImageData',
    'lineTo',
    'moveTo',
    'putImageData',
    'quadraticCurveTo',
    'rect',
    'roundRect',
    'restore',
    'rotate',
    'save',
    'scale',
    'setLineDash',
    'setTransform',
    'stroke',
    'strokeText',
    'transform',
    'translate',
  ];

const CONTEXT_PROPERTIES = [
  'fillStyle',
  'strokeStyle',
  'shadowColor',
  'shadowBlur',
  'shadowOffsetX',
  'shadowOffsetY',
  'letterSpacing',
  'lineCap',
  'lineDashOffset',
  'lineJoin',
  'lineWidth',
  'miterLimit',
  'direction',
  'font',
  'textAlign',
  'textBaseline',
  'globalAlpha',
  'globalCompositeOperation',
  'imageSmoothingEnabled',
] as const;

const traceArrMax = 100;

interface ExtendedCanvasRenderingContext2D extends CanvasRenderingContext2D {
  letterSpacing: string;
}

/**
 * Konva wrapper around native 2d canvas context. It has almost the same API of 2d context with some additional functions.
 * With core Konva shapes you don't need to use this object. But you will use it if you want to create
 * a [custom shape](/docs/react/Custom_Shape.html) or a [custom hit regions](/docs/events/Custom_Hit_Region.html).
 * For full information about each 2d context API use [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * @constructor
 * @memberof Konva
 * @example
 * const rect = new Konva.Shape({
 *    fill: 'red',
 *    width: 100,
 *    height: 100,
 *    sceneFunc: (ctx, shape) => {
 *      // ctx - is context wrapper
 *      // shape - is instance of Konva.Shape, so it equals to "rect" variable
 *      ctx.rect(0, 0, shape.getAttr('width'), shape.getAttr('height'));
 *
 *      // automatically fill shape from props and draw hit region
 *      ctx.fillStrokeShape(shape);
 *    }
 * })
 */
export class Context {
  canvas: Canvas;
  _context: CanvasRenderingContext2D;
  traceArr: Array<string>;

  constructor(canvas: Canvas) {
    this.canvas = canvas;

    if (Konva.enableTrace) {
      this.traceArr = [];
      this._enableTrace();
    }
  }

  /**
   * fill shape
   * @method
   * @name Konva.Context#fillShape
   * @param {Konva.Shape} shape
   */
  fillShape(shape: Shape) {
    if (shape.fillEnabled()) {
      this._fill(shape);
    }
  }

  _fill(shape: Shape) {
    // abstract
  }
  /**
   * stroke shape
   * @method
   * @name Konva.Context#strokeShape
   * @param {Konva.Shape} shape
   */
  strokeShape(shape: Shape) {
    if (shape.hasStroke()) {
      this._stroke(shape);
    }
  }

  _stroke(shape: Shape) {
    // abstract
  }

  /**
   * fill then stroke
   * @method
   * @name Konva.Context#fillStrokeShape
   * @param {Konva.Shape} shape
   */
  fillStrokeShape(shape: Shape) {
    if (shape.attrs.fillAfterStrokeEnabled) {
      this.strokeShape(shape);
      this.fillShape(shape);
    } else {
      this.fillShape(shape);
      this.strokeShape(shape);
    }
  }

  getTrace(relaxed?: boolean, rounded?: boolean) {
    let traceArr = this.traceArr,
      len = traceArr.length,
      str = '',
      n,
      trace,
      method,
      args;

    for (n = 0; n < len; n++) {
      trace = traceArr[n];
      method = trace.method;

      // methods
      if (method) {
        args = trace.args;
        str += method;
        if (relaxed) {
          str += DOUBLE_PAREN;
        } else {
          if (Util._isArray(args[0])) {
            str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
          } else {
            if (rounded) {
              args = args.map((a) =>
                typeof a === 'number' ? Math.floor(a) : a
              );
            }
            str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
          }
        }
      } else {
        // properties
        str += trace.property;
        if (!relaxed) {
          str += EQUALS + trace.val;
        }
      }

      str += SEMICOLON;
    }

    return str;
  }

  clearTrace() {
    this.traceArr = [];
  }
  _trace(str) {
    let traceArr = this.traceArr,
      len;

    traceArr.push(str);
    len = traceArr.length;

    if (len >= traceArrMax) {
      traceArr.shift();
    }
  }
  /**
   * reset canvas context transform
   * @method
   * @name Konva.Context#reset
   */
  reset() {
    const pixelRatio = this.getCanvas().getPixelRatio();
    this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
  }
  /**
   * get canvas wrapper
   * @method
   * @name Konva.Context#getCanvas
   * @returns {Konva.Canvas}
   */
  getCanvas() {
    return this.canvas;
  }
  /**
   * clear canvas
   * @method
   * @name Konva.Context#clear
   * @param {Object} [bounds]
   * @param {Number} [bounds.x]
   * @param {Number} [bounds.y]
   * @param {Number} [bounds.width]
   * @param {Number} [bounds.height]
   */
  clear(bounds?: IRect) {
    const canvas = this.getCanvas();

    if (bounds) {
      this.clearRect(
        bounds.x || 0,
        bounds.y || 0,
        bounds.width || 0,
        bounds.height || 0
      );
    } else {
      this.clearRect(
        0,
        0,
        canvas.getWidth() / canvas.pixelRatio,
        canvas.getHeight() / canvas.pixelRatio
      );
    }
  }
  _applyLineCap(shape: Shape) {
    const lineCap = shape.attrs.lineCap;
    if (lineCap) {
      this.setAttr('lineCap', lineCap);
    }
  }
  _applyOpacity(shape: Node) {
    const absOpacity = shape.getAbsoluteOpacity();
    if (absOpacity !== 1) {
      this.setAttr('globalAlpha', absOpacity);
    }
  }
  _applyLineJoin(shape: Shape) {
    const lineJoin = shape.attrs.lineJoin;
    if (lineJoin) {
      this.setAttr('lineJoin', lineJoin);
    }
  }

  setAttr(attr: string, val) {
    this._context[attr] = val;
  }

  /**
   * arc function.
   * @method
   * @name Konva.Context#arc
   */
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterClockwise?: boolean
  ) {
    this._context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
  }
  /**
   * arcTo function.
   * @method
   * @name Konva.Context#arcTo
   *
   */
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this._context.arcTo(x1, y1, x2, y2, radius);
  }
  /**
   * beginPath function.
   * @method
   * @name Konva.Context#beginPath
   */
  beginPath() {
    this._context.beginPath();
  }
  /**
   * bezierCurveTo function.
   * @method
   * @name Konva.Context#bezierCurveTo
   */

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ) {
    this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }
  /**
   * clearRect function.
   * @method
   * @name Konva.Context#clearRect
   */
  clearRect(x: number, y: number, width: number, height: number) {
    this._context.clearRect(x, y, width, height);
  }
  /**
   * clip function.
   * @method
   * @name Konva.Context#clip
   */
  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(...args: any[]) {
    this._context.clip.apply(this._context, args as any);
  }
  /**
   * closePath function.
   * @method
   * @name Konva.Context#closePath
   */
  closePath() {
    this._context.closePath();
  }
  /**
   * createImageData function.
   * @method
   * @name Konva.Context#createImageData
   */
  createImageData(width, height) {
    const a = arguments;
    if (a.length === 2) {
      return this._context.createImageData(width, height);
    } else if (a.length === 1) {
      return this._context.createImageData(width);
    }
  }
  /**
   * createLinearGradient function.
   * @method
   * @name Konva.Context#createLinearGradient
   */
  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    return this._context.createLinearGradient(x0, y0, x1, y1);
  }
  /**
   * createPattern function.
   * @method
   * @name Konva.Context#createPattern
   */
  createPattern(image: CanvasImageSource, repetition: string | null) {
    return this._context.createPattern(image, repetition);
  }
  /**
   * createRadialGradient function.
   * @method
   * @name Konva.Context#createRadialGradient
   */
  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ) {
    return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }
  /**
   * drawImage function.
   * @method
   * @name Konva.Context#drawImage
   */
  drawImage(
    image: CanvasImageSource,
    sx: number,
    sy: number,
    sWidth?: number,
    sHeight?: number,
    dx?: number,
    dy?: number,
    dWidth?: number,
    dHeight?: number
  ) {
    // this._context.drawImage(...arguments);
    const a = arguments,
      _context = this._context;
    if (a.length === 3) {
      _context.drawImage(image, sx, sy);
    } else if (a.length === 5) {
      _context.drawImage(image, sx, sy, sWidth as number, sHeight as number);
    } else if (a.length === 9) {
      _context.drawImage(
        image,
        sx,
        sy,
        sWidth as number,
        sHeight as number,
        dx as number,
        dy as number,
        dWidth as number,
        dHeight as number
      );
    }
  }
  /**
   * ellipse function.
   * @method
   * @name Konva.Context#ellipse
   */
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ) {
    this._context.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      rotation,
      startAngle,
      endAngle,
      counterclockwise
    );
  }
  /**
   * isPointInPath function.
   * @method
   * @name Konva.Context#isPointInPath
   */
  isPointInPath(
    x: number,
    y: number,
    path?: Path2D,
    fillRule?: CanvasFillRule
  ) {
    if (path) {
      return this._context.isPointInPath(path, x, y, fillRule);
    }
    return this._context.isPointInPath(x, y, fillRule);
  }
  /**
   * fill function.
   * @method
   * @name Konva.Context#fill
   */
  fill(fillRule?: CanvasFillRule): void;
  fill(path: Path2D, fillRule?: CanvasFillRule): void;
  fill(...args: any[]) {
    // this._context.fill();
    this._context.fill.apply(this._context, args as any);
  }
  /**
   * fillRect function.
   * @method
   * @name Konva.Context#fillRect
   */
  fillRect(x: number, y: number, width: number, height: number) {
    this._context.fillRect(x, y, width, height);
  }
  /**
   * strokeRect function.
   * @method
   * @name Konva.Context#strokeRect
   */
  strokeRect(x: number, y: number, width: number, height: number) {
    this._context.strokeRect(x, y, width, height);
  }
  /**
   * fillText function.
   * @method
   * @name Konva.Context#fillText
   */
  fillText(text: string, x: number, y: number, maxWidth?: number) {
    if (maxWidth) {
      this._context.fillText(text, x, y, maxWidth);
    } else {
      this._context.fillText(text, x, y);
    }
  }
  /**
   * measureText function.
   * @method
   * @name Konva.Context#measureText
   */
  measureText(text: string) {
    return this._context.measureText(text);
  }
  /**
   * getImageData function.
   * @method
   * @name Konva.Context#getImageData
   */
  getImageData(sx: number, sy: number, sw: number, sh: number) {
    return this._context.getImageData(sx, sy, sw, sh);
  }
  /**
   * lineTo function.
   * @method
   * @name Konva.Context#lineTo
   */
  lineTo(x: number, y: number) {
    this._context.lineTo(x, y);
  }
  /**
   * moveTo function.
   * @method
   * @name Konva.Context#moveTo
   */
  moveTo(x: number, y: number) {
    this._context.moveTo(x, y);
  }
  /**
   * rect function.
   * @method
   * @name Konva.Context#rect
   */
  rect(x: number, y: number, width: number, height: number) {
    this._context.rect(x, y, width, height);
  }
  /**
   * roundRect function.
   * @method
   * @name Konva.Context#roundRect
   */
  roundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radii: number | DOMPointInit | (number | DOMPointInit)[]
  ) {
    this._context.roundRect(x, y, width, height, radii);
  }
  /**
   * putImageData function.
   * @method
   * @name Konva.Context#putImageData
   */
  putImageData(imageData: ImageData, dx: number, dy: number) {
    this._context.putImageData(imageData, dx, dy);
  }
  /**
   * quadraticCurveTo function.
   * @method
   * @name Konva.Context#quadraticCurveTo
   */
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this._context.quadraticCurveTo(cpx, cpy, x, y);
  }
  /**
   * restore function.
   * @method
   * @name Konva.Context#restore
   */
  restore() {
    this._context.restore();
  }
  /**
   * rotate function.
   * @method
   * @name Konva.Context#rotate
   */
  rotate(angle: number) {
    this._context.rotate(angle);
  }
  /**
   * save function.
   * @method
   * @name Konva.Context#save
   */
  save() {
    this._context.save();
  }
  /**
   * scale function.
   * @method
   * @name Konva.Context#scale
   */
  scale(x: number, y: number) {
    this._context.scale(x, y);
  }
  /**
   * setLineDash function.
   * @method
   * @name Konva.Context#setLineDash
   */
  setLineDash(segments: number[]) {
    // works for Chrome and IE11
    if (this._context.setLineDash) {
      this._context.setLineDash(segments);
    } else if ('mozDash' in this._context) {
      // verified that this works in firefox
      (<any>this._context['mozDash']) = segments;
    } else if ('webkitLineDash' in this._context) {
      // does not currently work for Safari
      (<any>this._context['webkitLineDash']) = segments;
    }

    // no support for IE9 and IE10
  }
  /**
   * getLineDash function.
   * @method
   * @name Konva.Context#getLineDash
   */
  getLineDash() {
    return this._context.getLineDash();
  }
  /**
   * setTransform function.
   * @method
   * @name Konva.Context#setTransform
   */
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) {
    this._context.setTransform(a, b, c, d, e, f);
  }
  /**
   * stroke function.
   * @method
   * @name Konva.Context#stroke
   */
  stroke(path2d?: Path2D) {
    if (path2d) {
      this._context.stroke(path2d);
    } else {
      this._context.stroke();
    }
  }
  /**
   * strokeText function.
   * @method
   * @name Konva.Context#strokeText
   */
  strokeText(text: string, x: number, y: number, maxWidth?: number) {
    this._context.strokeText(text, x, y, maxWidth);
  }
  /**
   * transform function.
   * @method
   * @name Konva.Context#transform
   */
  transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    this._context.transform(a, b, c, d, e, f);
  }
  /**
   * translate function.
   * @method
   * @name Konva.Context#translate
   */
  translate(x: number, y: number) {
    this._context.translate(x, y);
  }
  _enableTrace() {
    let that = this,
      len = CONTEXT_METHODS.length,
      origSetter = this.setAttr,
      n,
      args;

    // to prevent creating scope function at each loop
    const func = function (methodName) {
      let origMethod = that[methodName],
        ret;

      that[methodName] = function () {
        args = simplifyArray(Array.prototype.slice.call(arguments, 0));
        ret = origMethod.apply(that, arguments);

        that._trace({
          method: methodName,
          args: args,
        });

        return ret;
      };
    };
    // methods
    for (n = 0; n < len; n++) {
      func(CONTEXT_METHODS[n]);
    }

    // attrs
    that.setAttr = function () {
      origSetter.apply(that, arguments as any);
      const prop = arguments[0];
      let val = arguments[1];
      if (
        prop === 'shadowOffsetX' ||
        prop === 'shadowOffsetY' ||
        prop === 'shadowBlur'
      ) {
        val = val / this.canvas.getPixelRatio();
      }
      that._trace({
        property: prop,
        val: val,
      });
    };
  }
  _applyGlobalCompositeOperation(node) {
    const op = node.attrs.globalCompositeOperation;
    const def = !op || op === 'source-over';
    if (!def) {
      this.setAttr('globalCompositeOperation', op);
    }
  }
}

// supported context properties
type CanvasContextProps = Pick<
  ExtendedCanvasRenderingContext2D,
  (typeof CONTEXT_PROPERTIES)[number]
>;

export interface Context extends CanvasContextProps {}

CONTEXT_PROPERTIES.forEach(function (prop) {
  Object.defineProperty(Context.prototype, prop, {
    get() {
      return this._context[prop];
    },
    set(val) {
      this._context[prop] = val;
    },
  });
});

export class SceneContext extends Context {
  constructor(canvas: Canvas, { willReadFrequently = false } = {}) {
    super(canvas);
    this._context = canvas._canvas.getContext('2d', {
      willReadFrequently,
    }) as CanvasRenderingContext2D;
  }
  _fillColor(shape: Shape) {
    const fill = shape.fill();

    this.setAttr('fillStyle', fill);
    shape._fillFunc(this);
  }
  _fillPattern(shape: Shape) {
    this.setAttr('fillStyle', shape._getFillPattern());
    shape._fillFunc(this);
  }
  _fillLinearGradient(shape: Shape) {
    const grd = shape._getLinearGradient();

    if (grd) {
      this.setAttr('fillStyle', grd);
      shape._fillFunc(this);
    }
  }
  _fillRadialGradient(shape: Shape) {
    const grd = shape._getRadialGradient();
    if (grd) {
      this.setAttr('fillStyle', grd);
      shape._fillFunc(this);
    }
  }
  _fill(shape) {
    const hasColor = shape.fill(),
      fillPriority = shape.getFillPriority();

    // priority fills
    if (hasColor && fillPriority === 'color') {
      this._fillColor(shape);
      return;
    }

    const hasPattern = shape.getFillPatternImage();
    if (hasPattern && fillPriority === 'pattern') {
      this._fillPattern(shape);
      return;
    }

    const hasLinearGradient = shape.getFillLinearGradientColorStops();
    if (hasLinearGradient && fillPriority === 'linear-gradient') {
      this._fillLinearGradient(shape);
      return;
    }

    const hasRadialGradient = shape.getFillRadialGradientColorStops();
    if (hasRadialGradient && fillPriority === 'radial-gradient') {
      this._fillRadialGradient(shape);
      return;
    }

    // now just try and fill with whatever is available
    if (hasColor) {
      this._fillColor(shape);
    } else if (hasPattern) {
      this._fillPattern(shape);
    } else if (hasLinearGradient) {
      this._fillLinearGradient(shape);
    } else if (hasRadialGradient) {
      this._fillRadialGradient(shape);
    }
  }
  _strokeLinearGradient(shape) {
    const start = shape.getStrokeLinearGradientStartPoint(),
      end = shape.getStrokeLinearGradientEndPoint(),
      colorStops = shape.getStrokeLinearGradientColorStops(),
      grd = this.createLinearGradient(start.x, start.y, end.x, end.y);

    if (colorStops) {
      // build color stops
      for (let n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
      }
      this.setAttr('strokeStyle', grd);
    }
  }
  _stroke(shape) {
    const dash = shape.dash(),
      // ignore strokeScaleEnabled for Text
      strokeScaleEnabled = shape.getStrokeScaleEnabled();

    if (shape.hasStroke()) {
      if (!strokeScaleEnabled) {
        this.save();
        const pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }

      this._applyLineCap(shape);
      if (dash && shape.dashEnabled()) {
        this.setLineDash(dash);
        this.setAttr('lineDashOffset', shape.dashOffset());
      }

      this.setAttr('lineWidth', shape.strokeWidth());

      if (!shape.getShadowForStrokeEnabled()) {
        this.setAttr('shadowColor', 'rgba(0,0,0,0)');
      }

      const hasLinearGradient = shape.getStrokeLinearGradientColorStops();
      if (hasLinearGradient) {
        this._strokeLinearGradient(shape);
      } else {
        this.setAttr('strokeStyle', shape.stroke());
      }

      shape._strokeFunc(this);

      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
  _applyShadow(shape) {
    const color = shape.getShadowRGBA() ?? 'black',
      blur = shape.getShadowBlur() ?? 5,
      offset = shape.getShadowOffset() ?? {
        x: 0,
        y: 0,
      },
      scale = shape.getAbsoluteScale(),
      ratio = this.canvas.getPixelRatio(),
      scaleX = scale.x * ratio,
      scaleY = scale.y * ratio;

    this.setAttr('shadowColor', color);
    this.setAttr(
      'shadowBlur',
      blur * Math.min(Math.abs(scaleX), Math.abs(scaleY))
    );
    this.setAttr('shadowOffsetX', offset.x * scaleX);
    this.setAttr('shadowOffsetY', offset.y * scaleY);
  }
}

export class HitContext extends Context {
  constructor(canvas: Canvas) {
    super(canvas);
    this._context = canvas._canvas.getContext('2d', {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
  }
  _fill(shape: Shape) {
    this.save();
    this.setAttr('fillStyle', shape.colorKey);
    shape._fillFuncHit(this);
    this.restore();
  }
  strokeShape(shape: Shape) {
    if (shape.hasHitStroke()) {
      this._stroke(shape);
    }
  }
  _stroke(shape) {
    if (shape.hasHitStroke()) {
      // ignore strokeScaleEnabled for Text
      const strokeScaleEnabled = shape.getStrokeScaleEnabled();
      if (!strokeScaleEnabled) {
        this.save();
        const pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);

      const hitStrokeWidth = shape.hitStrokeWidth();
      const strokeWidth =
        hitStrokeWidth === 'auto' ? shape.strokeWidth() : hitStrokeWidth;

      this.setAttr('lineWidth', strokeWidth);
      this.setAttr('strokeStyle', shape.colorKey);
      shape._strokeFuncHit(this);
      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
}
