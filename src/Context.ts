import { Util } from './Util';
import { Konva } from './Global';
import { Canvas } from './Canvas';
import { Shape } from './Shape';

function simplifyArray(arr: Array<any>) {
  var retArr = [],
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

var COMMA = ',',
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

var CONTEXT_PROPERTIES = [
  'fillStyle',
  'strokeStyle',
  'shadowColor',
  'shadowBlur',
  'shadowOffsetX',
  'shadowOffsetY',
  'lineCap',
  'lineDashOffset',
  'lineJoin',
  'lineWidth',
  'miterLimit',
  'font',
  'textAlign',
  'textBaseline',
  'globalAlpha',
  'globalCompositeOperation',
  'imageSmoothingEnabled',
];

const traceArrMax = 100;
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
  traceArr: Array<String>;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this._context = canvas._canvas.getContext('2d') as CanvasRenderingContext2D;

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

  _fill(shape) {
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

  _stroke(shape) {
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

  getTrace(relaxed?, rounded?) {
    var traceArr = this.traceArr,
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
    var traceArr = this.traceArr,
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
    var pixelRatio = this.getCanvas().getPixelRatio();
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
  clear(bounds?) {
    var canvas = this.getCanvas();

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
  _applyLineCap(shape) {
    var lineCap = shape.getLineCap();
    if (lineCap) {
      this.setAttr('lineCap', lineCap);
    }
  }
  _applyOpacity(shape) {
    var absOpacity = shape.getAbsoluteOpacity();
    if (absOpacity !== 1) {
      this.setAttr('globalAlpha', absOpacity);
    }
  }
  _applyLineJoin(shape: Shape) {
    var lineJoin = shape.attrs.lineJoin;
    if (lineJoin) {
      this.setAttr('lineJoin', lineJoin);
    }
  }

  setAttr(attr, val) {
    this._context[attr] = val;
  }

  /**
   * arc function.
   * @method
   * @name Konva.Context#arc
   */
  arc(a0, a1, a2, a3, a4, a5) {
    this._context.arc(a0, a1, a2, a3, a4, a5);
  }
  /**
   * arcTo function.
   * @method
   * @name Konva.Context#arcTo
   */
  arcTo(a0, a1, a2, a3, a4) {
    this._context.arcTo(a0, a1, a2, a3, a4);
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
  bezierCurveTo(a0, a1, a2, a3, a4, a5) {
    this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
  }
  /**
   * clearRect function.
   * @method
   * @name Konva.Context#clearRect
   */
  clearRect(a0, a1, a2, a3) {
    this._context.clearRect(a0, a1, a2, a3);
  }
  /**
   * clip function.
   * @method
   * @name Konva.Context#clip
   */
  clip() {
    this._context.clip();
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
  createImageData(a0, a1) {
    var a = arguments;
    if (a.length === 2) {
      return this._context.createImageData(a0, a1);
    } else if (a.length === 1) {
      return this._context.createImageData(a0);
    }
  }
  /**
   * createLinearGradient function.
   * @method
   * @name Konva.Context#createLinearGradient
   */
  createLinearGradient(a0, a1, a2, a3) {
    return this._context.createLinearGradient(a0, a1, a2, a3);
  }
  /**
   * createPattern function.
   * @method
   * @name Konva.Context#createPattern
   */
  createPattern(a0, a1) {
    return this._context.createPattern(a0, a1);
  }
  /**
   * createRadialGradient function.
   * @method
   * @name Konva.Context#createRadialGradient
   */
  createRadialGradient(a0, a1, a2, a3, a4, a5) {
    return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
  }
  /**
   * drawImage function.
   * @method
   * @name Konva.Context#drawImage
   */
  drawImage(
    a0: CanvasImageSource,
    a1: number,
    a2: number,
    a3?: number,
    a4?: number,
    a5?: number,
    a6?: number,
    a7?: number,
    a8?: number
  ) {
    // this._context.drawImage(...arguments);
    var a = arguments,
      _context = this._context;
    if (a.length === 3) {
      _context.drawImage(a0, a1, a2);
    } else if (a.length === 5) {
      _context.drawImage(a0, a1, a2, a3, a4);
    } else if (a.length === 9) {
      _context.drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8);
    }
  }
  /**
   * ellipse function.
   * @method
   * @name Konva.Context#ellipse
   */
  ellipse(
    a0: number,
    a1: number,
    a2: number,
    a3: number,
    a4: number,
    a5: number,
    a6: number,
    a7?: boolean
  ) {
    this._context.ellipse(a0, a1, a2, a3, a4, a5, a6, a7);
  }
  /**
   * isPointInPath function.
   * @method
   * @name Konva.Context#isPointInPath
   */
  isPointInPath(x, y) {
    return this._context.isPointInPath(x, y);
  }
  /**
   * fill function.
   * @method
   * @name Konva.Context#fill
   */
  fill(path2d?: Path2D) {
    if (path2d) {
      this._context.fill(path2d);
    } else {
      this._context.fill();
    }
  }
  /**
   * fillRect function.
   * @method
   * @name Konva.Context#fillRect
   */
  fillRect(x, y, width, height) {
    this._context.fillRect(x, y, width, height);
  }
  /**
   * strokeRect function.
   * @method
   * @name Konva.Context#strokeRect
   */
  strokeRect(x, y, width, height) {
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
  measureText(text) {
    return this._context.measureText(text);
  }
  /**
   * getImageData function.
   * @method
   * @name Konva.Context#getImageData
   */
  getImageData(a0, a1, a2, a3) {
    return this._context.getImageData(a0, a1, a2, a3);
  }
  /**
   * lineTo function.
   * @method
   * @name Konva.Context#lineTo
   */
  lineTo(a0, a1) {
    this._context.lineTo(a0, a1);
  }
  /**
   * moveTo function.
   * @method
   * @name Konva.Context#moveTo
   */
  moveTo(a0, a1) {
    this._context.moveTo(a0, a1);
  }
  /**
   * rect function.
   * @method
   * @name Konva.Context#rect
   */
  rect(a0, a1, a2, a3) {
    this._context.rect(a0, a1, a2, a3);
  }
  /**
   * putImageData function.
   * @method
   * @name Konva.Context#putImageData
   */
  putImageData(a0, a1, a2) {
    this._context.putImageData(a0, a1, a2);
  }
  /**
   * quadraticCurveTo function.
   * @method
   * @name Konva.Context#quadraticCurveTo
   */
  quadraticCurveTo(a0, a1, a2, a3) {
    this._context.quadraticCurveTo(a0, a1, a2, a3);
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
  rotate(a0) {
    this._context.rotate(a0);
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
  scale(a0, a1) {
    this._context.scale(a0, a1);
  }
  /**
   * setLineDash function.
   * @method
   * @name Konva.Context#setLineDash
   */
  setLineDash(a0) {
    // works for Chrome and IE11
    if (this._context.setLineDash) {
      this._context.setLineDash(a0);
    } else if ('mozDash' in this._context) {
      // verified that this works in firefox
      (<any>this._context['mozDash']) = a0;
    } else if ('webkitLineDash' in this._context) {
      // does not currently work for Safari
      (<any>this._context['webkitLineDash']) = a0;
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
  setTransform(a0, a1, a2, a3, a4, a5) {
    this._context.setTransform(a0, a1, a2, a3, a4, a5);
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
  strokeText(a0, a1, a2, a3) {
    this._context.strokeText(a0, a1, a2, a3);
  }
  /**
   * transform function.
   * @method
   * @name Konva.Context#transform
   */
  transform(a0, a1, a2, a3, a4, a5) {
    this._context.transform(a0, a1, a2, a3, a4, a5);
  }
  /**
   * translate function.
   * @method
   * @name Konva.Context#translate
   */
  translate(a0, a1) {
    this._context.translate(a0, a1);
  }
  _enableTrace() {
    var that = this,
      len = CONTEXT_METHODS.length,
      origSetter = this.setAttr,
      n,
      args;

    // to prevent creating scope function at each loop
    var func = function (methodName) {
      var origMethod = that[methodName],
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
      origSetter.apply(that, arguments);
      var prop = arguments[0];
      var val = arguments[1];
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
    var def = !op || op === 'source-over';
    if (!def) {
      this.setAttr('globalCompositeOperation', op);
    }
  }
}

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
  _fillColor(shape: Shape) {
    var fill = shape.fill();

    this.setAttr('fillStyle', fill);
    shape._fillFunc(this);
  }
  _fillPattern(shape) {
    this.setAttr('fillStyle', shape._getFillPattern());
    shape._fillFunc(this);
  }
  _fillLinearGradient(shape) {
    var grd = shape._getLinearGradient();

    if (grd) {
      this.setAttr('fillStyle', grd);
      shape._fillFunc(this);
    }
  }
  _fillRadialGradient(shape) {
    var grd = shape._getRadialGradient();
    if (grd) {
      this.setAttr('fillStyle', grd);
      shape._fillFunc(this);
    }
  }
  _fill(shape) {
    var hasColor = shape.fill(),
      fillPriority = shape.getFillPriority();

    // priority fills
    if (hasColor && fillPriority === 'color') {
      this._fillColor(shape);
      return;
    }

    var hasPattern = shape.getFillPatternImage();
    if (hasPattern && fillPriority === 'pattern') {
      this._fillPattern(shape);
      return;
    }

    var hasLinearGradient = shape.getFillLinearGradientColorStops();
    if (hasLinearGradient && fillPriority === 'linear-gradient') {
      this._fillLinearGradient(shape);
      return;
    }

    var hasRadialGradient = shape.getFillRadialGradientColorStops();
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
    var start = shape.getStrokeLinearGradientStartPoint(),
      end = shape.getStrokeLinearGradientEndPoint(),
      colorStops = shape.getStrokeLinearGradientColorStops(),
      grd = this.createLinearGradient(start.x, start.y, end.x, end.y);

    if (colorStops) {
      // build color stops
      for (var n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n], colorStops[n + 1]);
      }
      this.setAttr('strokeStyle', grd);
    }
  }
  _stroke(shape) {
    var dash = shape.dash(),
      // ignore strokeScaleEnabled for Text
      strokeScaleEnabled = shape.getStrokeScaleEnabled();

    if (shape.hasStroke()) {
      if (!strokeScaleEnabled) {
        this.save();
        var pixelRatio = this.getCanvas().getPixelRatio();
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

      var hasLinearGradient = shape.getStrokeLinearGradientColorStops();
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
    var color = shape.getShadowRGBA() ?? 'black',
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
  _fill(shape) {
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
      var strokeScaleEnabled = shape.getStrokeScaleEnabled();
      if (!strokeScaleEnabled) {
        this.save();
        var pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);

      var hitStrokeWidth = shape.hitStrokeWidth();
      var strokeWidth =
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
