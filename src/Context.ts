import { Util, Collection } from './Util';
import { getAngle, getGlobalKonva } from './Global';
import { Canvas } from './Canvas';

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
    'translate'
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
  'globalCompositeOperation'
];

/**
 * Konva wrapper around native 2d canvas context. It has almost the same API of 2d context with some additional functions.
 * With core Konva shapes you don't need to use this object. But you have to use it if you want to create
 * a custom shape or a custom hit regions.
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

  constructor(canvas) {
    this.init(canvas);
  }

  init(canvas) {
    this.canvas = canvas;
    this._context = canvas._canvas.getContext('2d');

    if (getGlobalKonva().enableTrace) {
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
  fillShape(shape) {
    if (shape.getFillEnabled()) {
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
  strokeShape(shape) {
    if (shape.getStrokeEnabled()) {
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
  fillStrokeShape(shape) {
    var fillEnabled = shape.getFillEnabled();
    if (fillEnabled) {
      this._fill(shape);
    }
    if (shape.getStrokeEnabled()) {
      this._stroke(shape);
    }
  }

  getTrace(relaxed) {
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

    if (len >= getGlobalKonva().traceArrMax) {
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
  _applyLineJoin(shape) {
    var lineJoin = shape.getLineJoin();
    if (lineJoin) {
      this.setAttr('lineJoin', lineJoin);
    }
  }

  setAttr(attr, val) {
    this._context[attr] = val;
  }

  // context pass through methods
  arc(a0, a1, a2, a3, a4, a5) {
    this._context.arc(a0, a1, a2, a3, a4, a5);
  }
  arcTo(a0, a1, a2, a3, a4, a5) {
    this._context.arc(a0, a1, a2, a3, a4, a5);
  }
  beginPath() {
    this._context.beginPath();
  }
  bezierCurveTo(a0, a1, a2, a3, a4, a5) {
    this._context.bezierCurveTo(a0, a1, a2, a3, a4, a5);
  }
  clearRect(a0, a1, a2, a3) {
    this._context.clearRect(a0, a1, a2, a3);
  }
  clip() {
    this._context.clip();
  }
  closePath() {
    this._context.closePath();
  }
  createImageData(a0, a1) {
    var a = arguments;
    if (a.length === 2) {
      return this._context.createImageData(a0, a1);
    } else if (a.length === 1) {
      return this._context.createImageData(a0);
    }
  }
  createLinearGradient(a0, a1, a2, a3) {
    return this._context.createLinearGradient(a0, a1, a2, a3);
  }
  createPattern(a0, a1) {
    return this._context.createPattern(a0, a1);
  }
  createRadialGradient(a0, a1, a2, a3, a4, a5) {
    return this._context.createRadialGradient(a0, a1, a2, a3, a4, a5);
  }
  drawImage(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
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
  isPointInPath(x, y) {
    return this._context.isPointInPath(x, y);
  }
  fill() {
    this._context.fill();
  }
  fillRect(x, y, width, height) {
    this._context.fillRect(x, y, width, height);
  }
  strokeRect(x, y, width, height) {
    this._context.strokeRect(x, y, width, height);
  }
  fillText(a0, a1, a2) {
    this._context.fillText(a0, a1, a2);
  }
  measureText(text) {
    return this._context.measureText(text);
  }
  getImageData(a0, a1, a2, a3) {
    return this._context.getImageData(a0, a1, a2, a3);
  }
  lineTo(a0, a1) {
    this._context.lineTo(a0, a1);
  }
  moveTo(a0, a1) {
    this._context.moveTo(a0, a1);
  }
  rect(a0, a1, a2, a3) {
    this._context.rect(a0, a1, a2, a3);
  }
  putImageData(a0, a1, a2) {
    this._context.putImageData(a0, a1, a2);
  }
  quadraticCurveTo(a0, a1, a2, a3) {
    this._context.quadraticCurveTo(a0, a1, a2, a3);
  }
  restore() {
    this._context.restore();
  }
  rotate(a0) {
    this._context.rotate(a0);
  }
  save() {
    this._context.save();
  }
  scale(a0, a1) {
    this._context.scale(a0, a1);
  }
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
  getLineDash() {
    return this._context.getLineDash();
  }
  setTransform(a0, a1, a2, a3, a4, a5) {
    this._context.setTransform(a0, a1, a2, a3, a4, a5);
  }
  stroke() {
    this._context.stroke();
  }
  strokeText(a0, a1, a2, a3) {
    this._context.strokeText(a0, a1, a2, a3);
  }
  transform(a0, a1, a2, a3, a4, a5) {
    this._context.transform(a0, a1, a2, a3, a4, a5);
  }
  translate(a0, a1) {
    this._context.translate(a0, a1);
  }
  _enableTrace() {
    var that = this,
      len = CONTEXT_METHODS.length,
      _simplifyArray = Util._simplifyArray,
      origSetter = this.setAttr,
      n,
      args;

    // to prevent creating scope function at each loop
    var func = function(methodName) {
      var origMethod = that[methodName],
        ret;

      that[methodName] = function() {
        args = _simplifyArray(Array.prototype.slice.call(arguments, 0));
        ret = origMethod.apply(that, arguments);

        that._trace({
          method: methodName,
          args: args
        });

        return ret;
      };
    };
    // methods
    for (n = 0; n < len; n++) {
      func(CONTEXT_METHODS[n]);
    }

    // attrs
    that.setAttr = function() {
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
        val: val
      });
    };
  }
}

CONTEXT_PROPERTIES.forEach(function(prop) {
  Object.defineProperty(Context.prototype, prop, {
    get() {
      return this._context[prop];
    },
    set(val) {
      this._context[prop] = val;
    }
  });
});

export class SceneContext extends Context {
  _fillColor(shape) {
    var fill = shape.fill();

    this.setAttr('fillStyle', fill);
    shape._fillFunc(this);
  }
  _fillPattern(shape) {
    var fillPatternX = shape.getFillPatternX(),
      fillPatternY = shape.getFillPatternY(),
      fillPatternScale = shape.getFillPatternScale(),
      fillPatternRotation = getAngle(shape.getFillPatternRotation()),
      fillPatternOffset = shape.getFillPatternOffset();

    if (fillPatternX || fillPatternY) {
      this.translate(fillPatternX || 0, fillPatternY || 0);
    }

    if (fillPatternRotation) {
      this.rotate(fillPatternRotation);
    }

    // TODO: optimize to fillPatternScaleX and fillPatternScaleY
    // otherwise it is object (always true)
    // do the same for offset
    if (fillPatternScale) {
      this.scale(fillPatternScale.x, fillPatternScale.y);
    }
    if (fillPatternOffset) {
      this.translate(-1 * fillPatternOffset.x, -1 * fillPatternOffset.y);
    }

    this.setAttr(
      'fillStyle',
      this.createPattern(
        shape.getFillPatternImage(),
        shape.getFillPatternRepeat() || 'repeat'
      )
    );
    shape._fillFunc(this);
  }
  _fillLinearGradient(shape) {
    var start = shape.getFillLinearGradientStartPoint(),
      end = shape.getFillLinearGradientEndPoint(),
      colorStops = shape.getFillLinearGradientColorStops(),
      grd = this.createLinearGradient(start.x, start.y, end.x, end.y);

    if (colorStops) {
      // build color stops
      for (var n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n], colorStops[n + 1]);
      }
      this.setAttr('fillStyle', grd);
      shape._fillFunc(this);
    }
  }
  _fillRadialGradient(shape) {
    var start = shape.getFillRadialGradientStartPoint(),
      end = shape.getFillRadialGradientEndPoint(),
      startRadius = shape.getFillRadialGradientStartRadius(),
      endRadius = shape.getFillRadialGradientEndRadius(),
      colorStops = shape.getFillRadialGradientColorStops(),
      grd = this.createRadialGradient(
        start.x,
        start.y,
        startRadius,
        end.x,
        end.y,
        endRadius
      );

    // build color stops
    for (var n = 0; n < colorStops.length; n += 2) {
      grd.addColorStop(colorStops[n], colorStops[n + 1]);
    }
    this.setAttr('fillStyle', grd);
    shape._fillFunc(this);
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

      // TODO - do we need to make like a fill function?

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
    var util = Util,
      color = util.get(shape.getShadowRGBA(), 'black'),
      blur = util.get(shape.getShadowBlur(), 5),
      offset = util.get(shape.getShadowOffset(), {
        x: 0,
        y: 0
      }),
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
  _applyGlobalCompositeOperation(shape) {
    var globalCompositeOperation = shape.getGlobalCompositeOperation();
    if (globalCompositeOperation !== 'source-over') {
      this.setAttr('globalCompositeOperation', globalCompositeOperation);
    }
  }
}

export class HitContext extends Context {
  _fill(shape) {
    this.save();
    this.setAttr('fillStyle', shape.colorKey);
    shape._fillFuncHit(this);
    this.restore();
  }
  _stroke(shape) {
    if (shape.hasStroke() && shape.strokeHitEnabled()) {
      // ignore strokeScaleEnabled for Text
      var strokeScaleEnabled = shape.getStrokeScaleEnabled();
      if (!strokeScaleEnabled) {
        this.save();
        var pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);
      this.setAttr('lineWidth', shape.strokeWidth());
      this.setAttr('strokeStyle', shape.colorKey);
      shape._strokeFuncHit(this);
      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
}
