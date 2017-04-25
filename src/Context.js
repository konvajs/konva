(function() {
  'use strict';
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
     * Canvas Context constructor
     * @constructor
     * @abstract
     * @memberof Konva
     */
  Konva.Context = function(canvas) {
    this.init(canvas);
  };

  Konva.Context.prototype = {
    init: function(canvas) {
      this.canvas = canvas;
      this._context = canvas._canvas.getContext('2d');

      if (Konva.enableTrace) {
        this.traceArr = [];
        this._enableTrace();
      }
    },
    /**
         * fill shape
         * @method
         * @memberof Konva.Context.prototype
         * @param {Konva.Shape} shape
         */
    fillShape: function(shape) {
      if (shape.getFillEnabled()) {
        this._fill(shape);
      }
    },
    /**
         * stroke shape
         * @method
         * @memberof Konva.Context.prototype
         * @param {Konva.Shape} shape
         */
    strokeShape: function(shape) {
      if (shape.getStrokeEnabled()) {
        this._stroke(shape);
      }
    },
    /**
         * fill then stroke
         * @method
         * @memberof Konva.Context.prototype
         * @param {Konva.Shape} shape
         */
    fillStrokeShape: function(shape) {
      var fillEnabled = shape.getFillEnabled();
      if (fillEnabled) {
        this._fill(shape);
      }
      if (shape.getStrokeEnabled()) {
        this._stroke(shape);
      }
    },
    /**
         * get context trace if trace is enabled
         * @method
         * @memberof Konva.Context.prototype
         * @param {Boolean} relaxed if false, return strict context trace, which includes method names, method parameters
         *  properties, and property values.  If true, return relaxed context trace, which only returns method names and
         *  properites.
         * @returns {String}
         */
    getTrace: function(relaxed) {
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
            if (Konva.Util._isArray(args[0])) {
              str +=
                OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
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
    },
    /**
         * clear trace if trace is enabled
         * @method
         * @memberof Konva.Context.prototype
         */
    clearTrace: function() {
      this.traceArr = [];
    },
    _trace: function(str) {
      var traceArr = this.traceArr, len;

      traceArr.push(str);
      len = traceArr.length;

      if (len >= Konva.traceArrMax) {
        traceArr.shift();
      }
    },
    /**
         * reset canvas context transform
         * @method
         * @memberof Konva.Context.prototype
         */
    reset: function() {
      var pixelRatio = this.getCanvas().getPixelRatio();
      this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
    },
    /**
         * get canvas
         * @method
         * @memberof Konva.Context.prototype
         * @returns {Konva.Canvas}
         */
    getCanvas: function() {
      return this.canvas;
    },
    /**
         * clear canvas
         * @method
         * @memberof Konva.Context.prototype
         * @param {Object} [bounds]
         * @param {Number} [bounds.x]
         * @param {Number} [bounds.y]
         * @param {Number} [bounds.width]
         * @param {Number} [bounds.height]
         */
    clear: function(bounds) {
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
    },
    _applyLineCap: function(shape) {
      var lineCap = shape.getLineCap();
      if (lineCap) {
        this.setAttr('lineCap', lineCap);
      }
    },
    _applyOpacity: function(shape) {
      var absOpacity = shape.getAbsoluteOpacity();
      if (absOpacity !== 1) {
        this.setAttr('globalAlpha', absOpacity);
      }
    },
    _applyLineJoin: function(shape) {
      var lineJoin = shape.getLineJoin();
      if (lineJoin) {
        this.setAttr('lineJoin', lineJoin);
      }
    },
    setAttr: function(attr, val) {
      this._context[attr] = val;
    },

    // context pass through methods
    arc: function() {
      var a = arguments;
      this._context.arc(a[0], a[1], a[2], a[3], a[4], a[5]);
    },
    beginPath: function() {
      this._context.beginPath();
    },
    bezierCurveTo: function() {
      var a = arguments;
      this._context.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
    },
    clearRect: function() {
      var a = arguments;
      this._context.clearRect(a[0], a[1], a[2], a[3]);
    },
    clip: function() {
      this._context.clip();
    },
    closePath: function() {
      this._context.closePath();
    },
    createImageData: function() {
      var a = arguments;
      if (a.length === 2) {
        return this._context.createImageData(a[0], a[1]);
      } else if (a.length === 1) {
        return this._context.createImageData(a[0]);
      }
    },
    createLinearGradient: function() {
      var a = arguments;
      return this._context.createLinearGradient(a[0], a[1], a[2], a[3]);
    },
    createPattern: function() {
      var a = arguments;
      return this._context.createPattern(a[0], a[1]);
    },
    createRadialGradient: function() {
      var a = arguments;
      return this._context.createRadialGradient(
        a[0],
        a[1],
        a[2],
        a[3],
        a[4],
        a[5]
      );
    },
    drawImage: function() {
      var a = arguments, _context = this._context;

      if (a.length === 3) {
        _context.drawImage(a[0], a[1], a[2]);
      } else if (a.length === 5) {
        _context.drawImage(a[0], a[1], a[2], a[3], a[4]);
      } else if (a.length === 9) {
        _context.drawImage(
          a[0],
          a[1],
          a[2],
          a[3],
          a[4],
          a[5],
          a[6],
          a[7],
          a[8]
        );
      }
    },
    isPointInPath: function(x, y) {
      return this._context.isPointInPath(x, y);
    },
    fill: function() {
      this._context.fill();
    },
    fillRect: function(x, y, width, height) {
      this._context.fillRect(x, y, width, height);
    },
    strokeRect: function(x, y, width, height) {
      this._context.strokeRect(x, y, width, height);
    },
    fillText: function() {
      var a = arguments;
      this._context.fillText(a[0], a[1], a[2]);
    },
    measureText: function(text) {
      return this._context.measureText(text);
    },
    getImageData: function() {
      var a = arguments;
      return this._context.getImageData(a[0], a[1], a[2], a[3]);
    },
    lineTo: function() {
      var a = arguments;
      this._context.lineTo(a[0], a[1]);
    },
    moveTo: function() {
      var a = arguments;
      this._context.moveTo(a[0], a[1]);
    },
    rect: function() {
      var a = arguments;
      this._context.rect(a[0], a[1], a[2], a[3]);
    },
    putImageData: function() {
      var a = arguments;
      this._context.putImageData(a[0], a[1], a[2]);
    },
    quadraticCurveTo: function() {
      var a = arguments;
      this._context.quadraticCurveTo(a[0], a[1], a[2], a[3]);
    },
    restore: function() {
      this._context.restore();
    },
    rotate: function() {
      var a = arguments;
      this._context.rotate(a[0]);
    },
    save: function() {
      this._context.save();
    },
    scale: function() {
      var a = arguments;
      this._context.scale(a[0], a[1]);
    },
    setLineDash: function() {
      var a = arguments, _context = this._context;

      // works for Chrome and IE11
      if (this._context.setLineDash) {
        _context.setLineDash(a[0]);
      } else if ('mozDash' in _context) {
        // verified that this works in firefox
        _context.mozDash = a[0];
      } else if ('webkitLineDash' in _context) {
        // does not currently work for Safari
        _context.webkitLineDash = a[0];
      }

      // no support for IE9 and IE10
    },
    getLineDash: function() {
      return this._context.getLineDash();
    },
    setTransform: function() {
      var a = arguments;
      this._context.setTransform(a[0], a[1], a[2], a[3], a[4], a[5]);
    },
    stroke: function() {
      this._context.stroke();
    },
    strokeText: function() {
      var a = arguments;
      this._context.strokeText(a[0], a[1], a[2]);
    },
    transform: function() {
      var a = arguments;
      this._context.transform(a[0], a[1], a[2], a[3], a[4], a[5]);
    },
    translate: function() {
      var a = arguments;
      this._context.translate(a[0], a[1]);
    },
    _enableTrace: function() {
      var that = this,
        len = CONTEXT_METHODS.length,
        _simplifyArray = Konva.Util._simplifyArray,
        origSetter = this.setAttr,
        n,
        args;

      // to prevent creating scope function at each loop
      var func = function(methodName) {
        var origMethod = that[methodName], ret;

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
  };

  CONTEXT_PROPERTIES.forEach(function(prop) {
    Object.defineProperty(Konva.Context.prototype, prop, {
      get: function() {
        return this._context[prop];
      },
      set: function(val) {
        this._context[prop] = val;
      }
    });
  });

  Konva.SceneContext = function(canvas) {
    Konva.Context.call(this, canvas);
  };

  Konva.SceneContext.prototype = {
    _fillColor: function(shape) {
      var fill = shape.fill();

      this.setAttr('fillStyle', fill);
      shape._fillFunc(this);
    },
    _fillPattern: function(shape) {
      var fillPatternX = shape.getFillPatternX(),
        fillPatternY = shape.getFillPatternY(),
        fillPatternScale = shape.getFillPatternScale(),
        fillPatternRotation = Konva.getAngle(shape.getFillPatternRotation()),
        fillPatternOffset = shape.getFillPatternOffset();

      if (fillPatternX || fillPatternY) {
        this.translate(fillPatternX || 0, fillPatternY || 0);
      }
      if (fillPatternRotation) {
        this.rotate(fillPatternRotation);
      }
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
      this.fill();
    },
    _fillLinearGradient: function(shape) {
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
    },
    _fillRadialGradient: function(shape) {
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
      this.fill();
    },
    _fill: function(shape) {
      var hasColor = shape.fill(),
        hasPattern = shape.getFillPatternImage(),
        hasLinearGradient = shape.getFillLinearGradientColorStops(),
        hasRadialGradient = shape.getFillRadialGradientColorStops(),
        fillPriority = shape.getFillPriority();

      // priority fills
      if (hasColor && fillPriority === 'color') {
        this._fillColor(shape);
      } else if (hasPattern && fillPriority === 'pattern') {
        this._fillPattern(shape);
      } else if (hasLinearGradient && fillPriority === 'linear-gradient') {
        this._fillLinearGradient(shape);
      } else if (hasRadialGradient && fillPriority === 'radial-gradient') {
        this._fillRadialGradient(shape);
      } else if (hasColor) {
        // now just try and fill with whatever is available
        this._fillColor(shape);
      } else if (hasPattern) {
        this._fillPattern(shape);
      } else if (hasLinearGradient) {
        this._fillLinearGradient(shape);
      } else if (hasRadialGradient) {
        this._fillRadialGradient(shape);
      }
    },
    _stroke: function(shape) {
      var dash = shape.dash(),
        // ignore strokeScaleEnabled for Text
        strokeScaleEnabled =
          shape.getStrokeScaleEnabled() || shape instanceof Konva.Text;

      if (shape.hasStroke()) {
        if (!strokeScaleEnabled) {
          this.save();
          this.setTransform(1, 0, 0, 1, 0, 0);
        }

        this._applyLineCap(shape);
        if (dash && shape.dashEnabled()) {
          this.setLineDash(dash);
          this.setAttr('lineDashOffset', shape.dashOffset());
        }

        this.setAttr('lineWidth', shape.strokeWidth());
        this.setAttr('strokeStyle', shape.stroke());

        if (!shape.getShadowForStrokeEnabled()) {
          this.setAttr('shadowColor', 'rgba(0,0,0,0)');
        }
        shape._strokeFunc(this);

        if (!strokeScaleEnabled) {
          this.restore();
        }
      }
    },
    _applyShadow: function(shape) {
      var util = Konva.Util,
        color = util.get(shape.getShadowRGBA(), 'black'),
        blur = util.get(shape.getShadowBlur(), 5),
        offset = util.get(shape.getShadowOffset(), {
          x: 0,
          y: 0
        }),
        // TODO: get this info from transform??
        scale = shape.getAbsoluteScale(),
        ratio = this.canvas.getPixelRatio(),
        scaleX = scale.x * ratio,
        scaleY = scale.y * ratio;

      this.setAttr('shadowColor', color);
      this.setAttr(
        'shadowBlur',
        blur * ratio * Math.min(Math.abs(scaleX), Math.abs(scaleY))
      );
      this.setAttr('shadowOffsetX', offset.x * scaleX);
      this.setAttr('shadowOffsetY', offset.y * scaleY);
    },
    _applyGlobalCompositeOperation: function(shape) {
      var globalCompositeOperation = shape.getGlobalCompositeOperation();
      if (globalCompositeOperation !== 'source-over') {
        this.setAttr('globalCompositeOperation', globalCompositeOperation);
      }
    }
  };
  Konva.Util.extend(Konva.SceneContext, Konva.Context);

  Konva.HitContext = function(canvas) {
    Konva.Context.call(this, canvas);
  };

  Konva.HitContext.prototype = {
    _fill: function(shape) {
      this.save();
      this.setAttr('fillStyle', shape.colorKey);
      shape._fillFuncHit(this);
      this.restore();
    },
    _stroke: function(shape) {
      if (shape.hasStroke() && shape.strokeHitEnabled()) {
        // ignore strokeScaleEnabled for Text
        var strokeScaleEnabled =
          shape.getStrokeScaleEnabled() || shape instanceof Konva.Text;
        if (!strokeScaleEnabled) {
          this.save();
          this.setTransform(1, 0, 0, 1, 0, 0);
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
  };
  Konva.Util.extend(Konva.HitContext, Konva.Context);
})();
