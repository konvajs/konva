(function(Konva) {
  'use strict';
  var HAS_SHADOW = 'hasShadow';
  var SHADOW_RGBA = 'shadowRGBA';

  function _fillFunc(context) {
    context.fill();
  }
  function _strokeFunc(context) {
    context.stroke();
  }
  function _fillFuncHit(context) {
    context.fill();
  }
  function _strokeFuncHit(context) {
    context.stroke();
  }

  function _clearHasShadowCache() {
    this._clearCache(HAS_SHADOW);
  }

  function _clearGetShadowRGBACache() {
    this._clearCache(SHADOW_RGBA);
  }

  /**
   * Shape constructor.  Shapes are primitive objects such as rectangles,
   *  circles, text, lines, etc.
   * @constructor
   * @memberof Konva
   * @augments Konva.Node
   * @param {Object} config
   * @@shapeParams
   * @@nodeParams
   * @example
   * var customShape = new Konva.Shape({
   *   x: 5,
   *   y: 10,
   *   fill: 'red',
   *   // a Konva.Canvas renderer is passed into the sceneFunc function
   *   sceneFunc: function(context, shape) {
   *     context.beginPath();
   *     context.moveTo(200, 50);
   *     context.lineTo(420, 80);
   *     context.quadraticCurveTo(300, 100, 260, 170);
   *     context.closePath();
   *     // Konva specific method
   *     context.fillStrokeShape(shape);
   *   }
   *});
   */
  Konva.Shape = function(config) {
    this.__init(config);
  };

  Konva.Util.addMethods(Konva.Shape, {
    __init: function(config) {
      this.nodeType = 'Shape';
      this._fillFunc = _fillFunc;
      this._strokeFunc = _strokeFunc;
      this._fillFuncHit = _fillFuncHit;
      this._strokeFuncHit = _strokeFuncHit;

      // set colorKey
      var shapes = Konva.shapes;
      var key;

      while (true) {
        key = Konva.Util.getRandomColor();
        if (key && !(key in shapes)) {
          break;
        }
      }

      this.colorKey = key;
      shapes[key] = this;

      // call super constructor
      Konva.Node.call(this, config);

      this.on(
        'shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva',
        _clearHasShadowCache
      );

      this.on(
        'shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva',
        _clearGetShadowRGBACache
      );
    },
    hasChildren: function() {
      return false;
    },
    getChildren: function() {
      return [];
    },
    /**
     * get canvas context tied to the layer
     * @method
     * @memberof Konva.Shape.prototype
     * @returns {Konva.Context}
     */
    getContext: function() {
      return this.getLayer().getContext();
    },
    /**
     * get canvas renderer tied to the layer.  Note that this returns a canvas renderer, not a canvas element
     * @method
     * @memberof Konva.Shape.prototype
     * @returns {Konva.Canvas}
     */
    getCanvas: function() {
      return this.getLayer().getCanvas();
    },
    /**
     * returns whether or not a shadow will be rendered
     * @method
     * @memberof Konva.Shape.prototype
     * @returns {Boolean}
     */
    hasShadow: function() {
      return this._getCache(HAS_SHADOW, this._hasShadow);
    },
    _hasShadow: function() {
      return (
        this.getShadowEnabled() &&
        (this.getShadowOpacity() !== 0 &&
          !!(
            this.getShadowColor() ||
            this.getShadowBlur() ||
            this.getShadowOffsetX() ||
            this.getShadowOffsetY()
          ))
      );
    },
    getShadowRGBA: function() {
      return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
    },
    _getShadowRGBA: function() {
      if (this.hasShadow()) {
        var rgba = Konva.Util.colorToRGBA(this.shadowColor());
        return (
          'rgba(' +
          rgba.r +
          ',' +
          rgba.g +
          ',' +
          rgba.b +
          ',' +
          rgba.a * (this.getShadowOpacity() || 1) +
          ')'
        );
      }
    },
    /**
     * returns whether or not the shape will be filled
     * @method
     * @memberof Konva.Shape.prototype
     * @returns {Boolean}
     */
    hasFill: function() {
      return !!(
        this.getFill() ||
        this.getFillPatternImage() ||
        this.getFillLinearGradientColorStops() ||
        this.getFillRadialGradientColorStops()
      );
    },
    /**
     * returns whether or not the shape will be stroked
     * @method
     * @memberof Konva.Shape.prototype
     * @returns {Boolean}
     */
    hasStroke: function() {
      return (
        this.strokeEnabled() &&
        !!(this.stroke() || this.getStrokeLinearGradientColorStops())
        // TODO: do we need radial gradient
        // this.getStrokeRadialGradientColorStops()
      );
    },
    /**
     * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
     *  this method clears a temporary canvas and then redraws the shape, it performs very poorly if executed many times
     *  consecutively.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
     *  because it performs much better
     * @method
     * @memberof Konva.Shape.prototype
     * @param {Object} point
     * @param {Number} point.x
     * @param {Number} point.y
     * @returns {Boolean}
     */
    intersects: function(point) {
      var stage = this.getStage(),
        bufferHitCanvas = stage.bufferHitCanvas,
        p;

      bufferHitCanvas.getContext().clear();
      this.drawHit(bufferHitCanvas);
      p = bufferHitCanvas.context.getImageData(
        Math.round(point.x),
        Math.round(point.y),
        1,
        1
      ).data;
      return p[3] > 0;
    },
    // extends Node.prototype.destroy
    destroy: function() {
      Konva.Node.prototype.destroy.call(this);
      delete Konva.shapes[this.colorKey];
      return this;
    },
    _useBufferCanvas: function(caching) {
      return (
        (!caching &&
          (this.perfectDrawEnabled() &&
            this.getAbsoluteOpacity() !== 1 &&
            this.hasFill() &&
            this.hasStroke() &&
            this.getStage())) ||
        (this.perfectDrawEnabled() &&
          this.hasShadow() &&
          this.getAbsoluteOpacity() !== 1 &&
          this.hasFill() &&
          this.hasStroke() &&
          this.getStage())
      );
    },
    /**
     * return self rectangle (x, y, width, height) of shape.
     * This method are not taken into account transformation and styles.
     * @method
     * @memberof Konva.Shape.prototype
     * @returns {Object} rect with {x, y, width, height} properties
     * @example
     *
     * rect.getSelfRect();  // return {x:0, y:0, width:rect.width(), height:rect.height()}
     * circle.getSelfRect();  // return {x: - circle.width() / 2, y: - circle.height() / 2, width:circle.width(), height:circle.height()}
     *
     */
    getSelfRect: function() {
      var size = this.getSize();
      return {
        x: this._centroid ? Math.round(-size.width / 2) : 0,
        y: this._centroid ? Math.round(-size.height / 2) : 0,
        width: size.width,
        height: size.height
      };
    },
    getClientRect: function(attrs) {
      attrs = attrs || {};
      var skipTransform = attrs.skipTransform;

      var relativeTo = attrs.relativeTo;

      var fillRect = this.getSelfRect();

      var applyStroke = !attrs.skipStroke && this.hasStroke();
      var strokeWidth = (applyStroke && this.strokeWidth()) || 0;

      // var scale = {
      //   x: 1,
      //   y: 1
      // };
      // if (!this.strokeScaleEnabled()) {
      //   var scale = this.getAbsoluteScale();
      //   // scale = {
      //   //   x: Math.abs(scale.x)
      //   // }
      // }

      var fillAndStrokeWidth = fillRect.width + strokeWidth;
      var fillAndStrokeHeight = fillRect.height + strokeWidth;

      var applyShadow = !attrs.skipShadow && this.hasShadow();
      var shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
      var shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;

      var preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
      var preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);

      var blurRadius = (applyShadow && this.shadowBlur()) || 0;

      var width = preWidth + blurRadius * 2;
      var height = preHeight + blurRadius * 2;

      // if stroke, for example = 3
      // we need to set x to 1.5, but after Math.round it will be 2
      // as we have additional offset we need to increase width and height by 1 pixel
      var roundingOffset = 0;
      if (Math.round(strokeWidth / 2) !== strokeWidth / 2) {
        roundingOffset = 1;
      }
      var rect = {
        width: width + roundingOffset,
        height: height + roundingOffset,
        x:
          -Math.round(strokeWidth / 2 + blurRadius) +
          Math.min(shadowOffsetX, 0) +
          fillRect.x,
        y:
          -Math.round(strokeWidth / 2 + blurRadius) +
          Math.min(shadowOffsetY, 0) +
          fillRect.y
      };
      if (!skipTransform) {
        return this._transformedRect(rect, relativeTo);
      }
      return rect;
    },
    drawScene: function(can, top, caching, skipBuffer) {
      var layer = this.getLayer(),
        canvas = can || layer.getCanvas(),
        context = canvas.getContext(),
        cachedCanvas = this._cache.canvas,
        drawFunc = this.sceneFunc(),
        hasShadow = this.hasShadow(),
        hasStroke = this.hasStroke(),
        stage,
        bufferCanvas,
        bufferContext;

      if (!this.isVisible() && !caching) {
        return this;
      }
      if (cachedCanvas) {
        context.save();
        layer._applyTransform(this, context, top);
        this._drawCachedSceneCanvas(context);
        context.restore();
        return this;
      }
      if (!drawFunc) {
        return this;
      }
      context.save();
      // if buffer canvas is needed
      if (this._useBufferCanvas(caching) && !skipBuffer) {
        stage = this.getStage();
        bufferCanvas = stage.bufferCanvas;
        bufferContext = bufferCanvas.getContext();
        bufferContext.clear();
        bufferContext.save();
        bufferContext._applyLineJoin(this);
        // layer might be undefined if we are using cache before adding to layer
        if (!caching) {
          if (layer) {
            layer._applyTransform(this, bufferContext, top);
          } else {
            var m = this.getAbsoluteTransform(top).getMatrix();
            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
          }
        }

        drawFunc.call(this, bufferContext, this);
        bufferContext.restore();

        var ratio = bufferCanvas.pixelRatio;
        if (hasShadow && !canvas.hitCanvas) {
          context.save();

          context._applyShadow(this);
          context._applyOpacity(this);
          context._applyGlobalCompositeOperation(this);
          context.drawImage(
            bufferCanvas._canvas,
            0,
            0,
            bufferCanvas.width / ratio,
            bufferCanvas.height / ratio
          );
          context.restore();
        } else {
          context._applyOpacity(this);
          context._applyGlobalCompositeOperation(this);
          context.drawImage(
            bufferCanvas._canvas,
            0,
            0,
            bufferCanvas.width / ratio,
            bufferCanvas.height / ratio
          );
        }
      } else {
        // if buffer canvas is not needed
        context._applyLineJoin(this);
        // layer might be undefined if we are using cache before adding to layer
        if (!caching) {
          if (layer) {
            layer._applyTransform(this, context, top);
          } else {
            var o = this.getAbsoluteTransform(top).getMatrix();
            context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
          }
        }

        if (hasShadow && hasStroke && !canvas.hitCanvas) {
          context.save();
          // apply shadow
          if (!caching) {
            context._applyOpacity(this);
            context._applyGlobalCompositeOperation(this);
          }
          context._applyShadow(this);

          drawFunc.call(this, context, this);
          context.restore();
          // if shape has stroke we need to redraw shape
          // otherwise we will see a shadow under stroke (and over fill)
          // but I think this is unexpected behavior
          if (this.hasFill() && this.getShadowForStrokeEnabled()) {
            drawFunc.call(this, context, this);
          }
        } else if (hasShadow && !canvas.hitCanvas) {
          context.save();
          if (!caching) {
            context._applyOpacity(this);
            context._applyGlobalCompositeOperation(this);
          }
          context._applyShadow(this);
          drawFunc.call(this, context, this);
          context.restore();
        } else {
          if (!caching) {
            context._applyOpacity(this);
            context._applyGlobalCompositeOperation(this);
          }
          drawFunc.call(this, context, this);
        }
      }
      context.restore();
      return this;
    },
    drawHit: function(can, top, caching) {
      var layer = this.getLayer(),
        canvas = can || layer.hitCanvas,
        context = canvas.getContext(),
        drawFunc = this.hitFunc() || this.sceneFunc(),
        cachedCanvas = this._cache.canvas,
        cachedHitCanvas = cachedCanvas && cachedCanvas.hit;

      if (!this.shouldDrawHit(canvas) && !caching) {
        return this;
      }
      if (layer) {
        layer.clearHitCache();
      }
      if (cachedHitCanvas) {
        context.save();
        layer._applyTransform(this, context, top);
        this._drawCachedHitCanvas(context);
        context.restore();
        return this;
      }
      if (!drawFunc) {
        return this;
      }
      context.save();
      context._applyLineJoin(this);
      if (!caching) {
        if (layer) {
          layer._applyTransform(this, context, top);
        } else {
          var o = this.getAbsoluteTransform(top).getMatrix();
          context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
        }
      }
      drawFunc.call(this, context, this);
      context.restore();
      return this;
    },
    /**
     * draw hit graph using the cached scene canvas
     * @method
     * @memberof Konva.Shape.prototype
     * @param {Integer} alphaThreshold alpha channel threshold that determines whether or not
     *  a pixel should be drawn onto the hit graph.  Must be a value between 0 and 255.
     *  The default is 0
     * @returns {Konva.Shape}
     * @example
     * shape.cache();
     * shape.drawHitFromCache();
     */
    drawHitFromCache: function(alphaThreshold) {
      var threshold = alphaThreshold || 0,
        cachedCanvas = this._cache.canvas,
        sceneCanvas = this._getCachedSceneCanvas(),
        hitCanvas = cachedCanvas.hit,
        hitContext = hitCanvas.getContext(),
        hitWidth = hitCanvas.getWidth(),
        hitHeight = hitCanvas.getHeight(),
        hitImageData,
        hitData,
        len,
        rgbColorKey,
        i,
        alpha;

      hitContext.clear();
      hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);

      try {
        hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
        hitData = hitImageData.data;
        len = hitData.length;
        rgbColorKey = Konva.Util._hexToRgb(this.colorKey);

        // replace non transparent pixels with color key
        for (i = 0; i < len; i += 4) {
          alpha = hitData[i + 3];
          if (alpha > threshold) {
            hitData[i] = rgbColorKey.r;
            hitData[i + 1] = rgbColorKey.g;
            hitData[i + 2] = rgbColorKey.b;
            hitData[i + 3] = 255;
          } else {
            hitData[i + 3] = 0;
          }
        }
        hitContext.putImageData(hitImageData, 0, 0);
      } catch (e) {
        Konva.Util.error(
          'Unable to draw hit graph from cached scene canvas. ' + e.message
        );
      }

      return this;
    }
  });
  Konva.Util.extend(Konva.Shape, Konva.Node);

  // add getters and setters
  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'stroke',
    undefined,
    Konva.Validators.getStringValidator()
  );

  /**
   * get/set stroke color
   * @name stroke
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} color
   * @returns {String}
   * @example
   * // get stroke color
   * var stroke = shape.stroke();
   *
   * // set stroke color with color string
   * shape.stroke('green');
   *
   * // set stroke color with hex
   * shape.stroke('#00ff00');
   *
   * // set stroke color with rgb
   * shape.stroke('rgb(0,255,0)');
   *
   * // set stroke color with rgba and make it 50% opaque
   * shape.stroke('rgba(0,255,0,0.5');
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'strokeWidth',
    2,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set stroke width
   * @name strokeWidth
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} strokeWidth
   * @returns {Number}
   * @example
   * // get stroke width
   * var strokeWidth = shape.strokeWidth();
   *
   * // set stroke width
   * shape.strokeWidth();
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'strokeHitEnabled',
    true,
    Konva.Validators.getBooleanValidator()
  );

  /**
   * get/set strokeHitEnabled property. Useful for performance optimization.
   * You may set `shape.strokeHitEnabled(false)`. In this case stroke will be no draw on hit canvas, so hit area
   * of shape will be decreased (by lineWidth / 2). Remember that non closed line with `strokeHitEnabled = false`
   * will be not drawn on hit canvas, that is mean line will no trigger pointer events (like mouseover)
   * Default value is true
   * @name strokeHitEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} strokeHitEnabled
   * @returns {Boolean}
   * @example
   * // get strokeHitEnabled
   * var strokeHitEnabled = shape.strokeHitEnabled();
   *
   * // set strokeHitEnabled
   * shape.strokeHitEnabled();
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'perfectDrawEnabled',
    true,
    Konva.Validators.getBooleanValidator()
  );

  /**
   * get/set perfectDrawEnabled. If a shape has fill, stroke and opacity you may set `perfectDrawEnabled` to false to improve performance.
   * See http://konvajs.github.io/docs/performance/Disable_Perfect_Draw.html for more information.
   * Default value is true
   * @name perfectDrawEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} perfectDrawEnabled
   * @returns {Boolean}
   * @example
   * // get perfectDrawEnabled
   * var perfectDrawEnabled = shape.perfectDrawEnabled();
   *
   * // set perfectDrawEnabled
   * shape.perfectDrawEnabled();
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'shadowForStrokeEnabled',
    true,
    Konva.Validators.getBooleanValidator()
  );

  /**
   * get/set shadowForStrokeEnabled. Useful for performance optimization.
   * You may set `shape.shadowForStrokeEnabled(false)`. In this case stroke will be no draw shadow for stroke.
   * Remember if you set `shadowForStrokeEnabled = false` for non closed line - that line with have no shadow!.
   * Default value is true
   * @name shadowForStrokeEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} shadowForStrokeEnabled
   * @returns {Boolean}
   * @example
   * // get shadowForStrokeEnabled
   * var shadowForStrokeEnabled = shape.shadowForStrokeEnabled();
   *
   * // set shadowForStrokeEnabled
   * shape.shadowForStrokeEnabled();
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'lineJoin');

  /**
   * get/set line join.  Can be miter, round, or bevel.  The
   *  default is miter
   * @name lineJoin
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} lineJoin
   * @returns {String}
   * @example
   * // get line join
   * var lineJoin = shape.lineJoin();
   *
   * // set line join
   * shape.lineJoin('round');
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'lineCap');

  /**
   * get/set line cap.  Can be butt, round, or square
   * @name lineCap
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} lineCap
   * @returns {String}
   * @example
   * // get line cap
   * var lineCap = shape.lineCap();
   *
   * // set line cap
   * shape.lineCap('round');
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'sceneFunc');

  /**
   * get/set scene draw function
   * @name sceneFunc
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Function} drawFunc drawing function
   * @returns {Function}
   * @example
   * // get scene draw function
   * var sceneFunc = shape.sceneFunc();
   *
   * // set scene draw function
   * shape.sceneFunc(function(context) {
   *   context.beginPath();
   *   context.rect(0, 0, this.width(), this.height());
   *   context.closePath();
   *   context.fillStrokeShape(this);
   * });
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'hitFunc');

  /**
   * get/set hit draw function
   * @name hitFunc
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Function} drawFunc drawing function
   * @returns {Function}
   * @example
   * // get hit draw function
   * var hitFunc = shape.hitFunc();
   *
   * // set hit draw function
   * shape.hitFunc(function(context) {
   *   context.beginPath();
   *   context.rect(0, 0, this.width(), this.height());
   *   context.closePath();
   *   context.fillStrokeShape(this);
   * });
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'dash');

  /**
   * get/set dash array for stroke.
   * @name dash
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Array} dash
   * @returns {Array}
   * @example
   *  // apply dashed stroke that is 10px long and 5 pixels apart
   *  line.dash([10, 5]);
   *  // apply dashed stroke that is made up of alternating dashed
   *  // lines that are 10px long and 20px apart, and dots that have
   *  // a radius of 5px and are 20px apart
   *  line.dash([10, 20, 0.001, 20]);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'dashOffset',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set dash offset for stroke.
   * @name dash
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} dash offset
   * @returns {Number}
   * @example
   *  // apply dashed stroke that is 10px long and 5 pixels apart with an offset of 5px
   *  line.dash([10, 5]);
   *  line.dashOffset(5);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'shadowColor',
    undefined,
    Konva.Validators.getStringValidator()
  );

  /**
   * get/set shadow color
   * @name shadowColor
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} color
   * @returns {String}
   * @example
   * // get shadow color
   * var shadow = shape.shadowColor();
   *
   * // set shadow color with color string
   * shape.shadowColor('green');
   *
   * // set shadow color with hex
   * shape.shadowColor('#00ff00');
   *
   * // set shadow color with rgb
   * shape.shadowColor('rgb(0,255,0)');
   *
   * // set shadow color with rgba and make it 50% opaque
   * shape.shadowColor('rgba(0,255,0,0.5');
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'shadowBlur',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set shadow blur
   * @name shadowBlur
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} blur
   * @returns {Number}
   * @example
   * // get shadow blur
   * var shadowBlur = shape.shadowBlur();
   *
   * // set shadow blur
   * shape.shadowBlur(10);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'shadowOpacity',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set shadow opacity.  must be a value between 0 and 1
   * @name shadowOpacity
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} opacity
   * @returns {Number}
   * @example
   * // get shadow opacity
   * var shadowOpacity = shape.shadowOpacity();
   *
   * // set shadow opacity
   * shape.shadowOpacity(0.5);
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Shape, 'shadowOffset', [
    'x',
    'y'
  ]);

  /**
   * get/set shadow offset
   * @name shadowOffset
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} offset
   * @param {Number} offset.x
   * @param {Number} offset.y
   * @returns {Object}
   * @example
   * // get shadow offset
   * var shadowOffset = shape.shadowOffset();
   *
   * // set shadow offset
   * shape.shadowOffset({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'shadowOffsetX',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set shadow offset x
   * @name shadowOffsetX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get shadow offset x
   * var shadowOffsetX = shape.shadowOffsetX();
   *
   * // set shadow offset x
   * shape.shadowOffsetX(5);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'shadowOffsetY',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set shadow offset y
   * @name shadowOffsetY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get shadow offset y
   * var shadowOffsetY = shape.shadowOffsetY();
   *
   * // set shadow offset y
   * shape.shadowOffsetY(5);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillPatternImage');

  /**
   * get/set fill pattern image
   * @name fillPatternImage
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Image} image object
   * @returns {Image}
   * @example
   * // get fill pattern image
   * var fillPatternImage = shape.fillPatternImage();
   *
   * // set fill pattern image
   * var imageObj = new Image();
   * imageObj.onload = function() {
   *   shape.fillPatternImage(imageObj);
   * };
   * imageObj.src = 'path/to/image/jpg';
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fill',
    undefined,
    Konva.Validators.getStringValidator()
  );

  /**
   * get/set fill color
   * @name fill
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} color
   * @returns {String}
   * @example
   * // get fill color
   * var fill = shape.fill();
   *
   * // set fill color with color string
   * shape.fill('green');
   *
   * // set fill color with hex
   * shape.fill('#00ff00');
   *
   * // set fill color with rgb
   * shape.fill('rgb(0,255,0)');
   *
   * // set fill color with rgba and make it 50% opaque
   * shape.fill('rgba(0,255,0,0.5');
   *
   * // shape without fill
   * shape.fill(null);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillPatternX',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set fill pattern x
   * @name fillPatternX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill pattern x
   * var fillPatternX = shape.fillPatternX();
   * // set fill pattern x
   * shape.fillPatternX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillPatternY',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set fill pattern y
   * @name fillPatternY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill pattern y
   * var fillPatternY = shape.fillPatternY();
   * // set fill pattern y
   * shape.fillPatternY(20);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillLinearGradientColorStops');

  /**
   * get/set fill linear gradient color stops
   * @name fillLinearGradientColorStops
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Array} colorStops
   * @returns {Array} colorStops
   * @example
   * // get fill linear gradient color stops
   * var colorStops = shape.fillLinearGradientColorStops();
   *
   * // create a linear gradient that starts with red, changes to blue
   * // halfway through, and then changes to green
   * shape.fillLinearGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'strokeLinearGradientColorStops');

  /**
   * get/set stroke linear gradient color stops
   * @name strokeLinearGradientColorStops
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Array} colorStops
   * @returns {Array} colorStops
   * @example
   * // get stroke linear gradient color stops
   * var colorStops = shape.strokeLinearGradientColorStops();
   *
   * // create a linear gradient that starts with red, changes to blue
   * // halfway through, and then changes to green
   * shape.strokeLinearGradientColorStops([0, 'red', 0.5, 'blue', 1, 'green']);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillRadialGradientStartRadius',
    0
  );

  /**
   * get/set fill radial gradient start radius
   * @name fillRadialGradientStartRadius
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radial gradient start radius
   * var startRadius = shape.fillRadialGradientStartRadius();
   *
   * // set radial gradient start radius
   * shape.fillRadialGradientStartRadius(0);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillRadialGradientEndRadius', 0);

  /**
   * get/set fill radial gradient end radius
   * @name fillRadialGradientEndRadius
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radial gradient end radius
   * var endRadius = shape.fillRadialGradientEndRadius();
   *
   * // set radial gradient end radius
   * shape.fillRadialGradientEndRadius(100);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillRadialGradientColorStops');

  /**
   * get/set fill radial gradient color stops
   * @name fillRadialGradientColorStops
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} colorStops
   * @returns {Array}
   * @example
   * // get fill radial gradient color stops
   * var colorStops = shape.fillRadialGradientColorStops();
   *
   * // create a radial gradient that starts with red, changes to blue
   * // halfway through, and then changes to green
   * shape.fillRadialGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillPatternRepeat', 'repeat');

  /**
   * get/set fill pattern repeat.  Can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'repeat'
   * @name fillPatternRepeat
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} repeat
   * @returns {String}
   * @example
   * // get fill pattern repeat
   * var repeat = shape.fillPatternRepeat();
   *
   * // repeat pattern in x direction only
   * shape.fillPatternRepeat('repeat-x');
   *
   * // do not repeat the pattern
   * shape.fillPatternRepeat('no repeat');
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillEnabled', true);

  /**
   * get/set fill enabled flag
   * @name fillEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get fill enabled flag
   * var fillEnabled = shape.fillEnabled();
   *
   * // disable fill
   * shape.fillEnabled(false);
   *
   * // enable fill
   * shape.fillEnabled(true);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'strokeEnabled', true);

  /**
   * get/set stroke enabled flag
   * @name strokeEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get stroke enabled flag
   * var strokeEnabled = shape.strokeEnabled();
   *
   * // disable stroke
   * shape.strokeEnabled(false);
   *
   * // enable stroke
   * shape.strokeEnabled(true);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'shadowEnabled', true);

  /**
   * get/set shadow enabled flag
   * @name shadowEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get shadow enabled flag
   * var shadowEnabled = shape.shadowEnabled();
   *
   * // disable shadow
   * shape.shadowEnabled(false);
   *
   * // enable shadow
   * shape.shadowEnabled(true);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'dashEnabled', true);

  /**
   * get/set dash enabled flag
   * @name dashEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get dash enabled flag
   * var dashEnabled = shape.dashEnabled();
   *
   * // disable dash
   * shape.dashEnabled(false);
   *
   * // enable dash
   * shape.dashEnabled(true);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'strokeScaleEnabled', true);

  /**
   * get/set strokeScale enabled flag
   * @name strokeScaleEnabled
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get stroke scale enabled flag
   * var strokeScaleEnabled = shape.strokeScaleEnabled();
   *
   * // disable stroke scale
   * shape.strokeScaleEnabled(false);
   *
   * // enable stroke scale
   * shape.strokeScaleEnabled(true);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillPriority', 'color');

  /**
   * get/set fill priority.  can be color, pattern, linear-gradient, or radial-gradient.  The default is color.
   *   This is handy if you want to toggle between different fill types.
   * @name fillPriority
   * @method
   * @memberof Konva.Shape.prototype
   * @param {String} priority
   * @returns {String}
   * @example
   * // get fill priority
   * var fillPriority = shape.fillPriority();
   *
   * // set fill priority
   * shape.fillPriority('linear-gradient');
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Shape, 'fillPatternOffset', [
    'x',
    'y'
  ]);

  /**
   * get/set fill pattern offset
   * @name fillPatternOffset
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} offset
   * @param {Number} offset.x
   * @param {Number} offset.y
   * @returns {Object}
   * @example
   * // get fill pattern offset
   * var patternOffset = shape.fillPatternOffset();
   *
   * // set fill pattern offset
   * shape.fillPatternOffset({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillPatternOffsetX',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set fill pattern offset x
   * @name fillPatternOffsetX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill pattern offset x
   * var patternOffsetX = shape.fillPatternOffsetX();
   *
   * // set fill pattern offset x
   * shape.fillPatternOffsetX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillPatternOffsetY',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set fill pattern offset y
   * @name fillPatternOffsetY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill pattern offset y
   * var patternOffsetY = shape.fillPatternOffsetY();
   *
   * // set fill pattern offset y
   * shape.fillPatternOffsetY(10);
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Shape, 'fillPatternScale', [
    'x',
    'y'
  ]);

  /**
   * get/set fill pattern scale
   * @name fillPatternScale
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} scale
   * @param {Number} scale.x
   * @param {Number} scale.y
   * @returns {Object}
   * @example
   * // get fill pattern scale
   * var patternScale = shape.fillPatternScale();
   *
   * // set fill pattern scale
   * shape.fillPatternScale({
   *   x: 2
   *   y: 2
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillPatternScaleX',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set fill pattern scale x
   * @name fillPatternScaleX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill pattern scale x
   * var patternScaleX = shape.fillPatternScaleX();
   *
   * // set fill pattern scale x
   * shape.fillPatternScaleX(2);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillPatternScaleY',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set fill pattern scale y
   * @name fillPatternScaleY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill pattern scale y
   * var patternScaleY = shape.fillPatternScaleY();
   *
   * // set fill pattern scale y
   * shape.fillPatternScaleY(2);
   */

  Konva.Factory.addComponentsGetterSetter(
    Konva.Shape,
    'fillLinearGradientStartPoint',
    ['x', 'y']
  );

  /**
   * get/set fill linear gradient start point
   * @name fillLinearGradientStartPoint
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} startPoint
   * @param {Number} startPoint.x
   * @param {Number} startPoint.y
   * @returns {Object}
   * @example
   * // get fill linear gradient start point
   * var startPoint = shape.fillLinearGradientStartPoint();
   *
   * // set fill linear gradient start point
   * shape.fillLinearGradientStartPoint({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addComponentsGetterSetter(
    Konva.Shape,
    'strokeLinearGradientStartPoint',
    ['x', 'y']
  );

  /**
   * get/set stroke linear gradient start point
   * @name strokeLinearGradientStartPoint
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} startPoint
   * @param {Number} startPoint.x
   * @param {Number} startPoint.y
   * @returns {Object}
   * @example
   * // get stroke linear gradient start point
   * var startPoint = shape.strokeLinearGradientStartPoint();
   *
   * // set stroke linear gradient start point
   * shape.strokeLinearGradientStartPoint({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillLinearGradientStartPointX',
    0
  );

  /**
   * get/set fill linear gradient start point x
   * @name fillLinearGradientStartPointX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill linear gradient start point x
   * var startPointX = shape.fillLinearGradientStartPointX();
   *
   * // set fill linear gradient start point x
   * shape.fillLinearGradientStartPointX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'strokeLinearGradientStartPointX',
    0
  );

  /**
   * get/set stroke linear gradient start point x
   * @name linearLinearGradientStartPointX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get stroke linear gradient start point x
   * var startPointX = shape.strokeLinearGradientStartPointX();
   *
   * // set stroke linear gradient start point x
   * shape.strokeLinearGradientStartPointX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillLinearGradientStartPointY',
    0
  );

  /**
   * get/set fill linear gradient start point y
   * @name fillLinearGradientStartPointY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill linear gradient start point y
   * var startPointY = shape.fillLinearGradientStartPointY();
   *
   * // set fill linear gradient start point y
   * shape.fillLinearGradientStartPointY(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'strokeLinearGradientStartPointY',
    0
  );
  /**
   * get/set stroke linear gradient start point y
   * @name strokeLinearGradientStartPointY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get stroke linear gradient start point y
   * var startPointY = shape.strokeLinearGradientStartPointY();
   *
   * // set stroke linear gradient start point y
   * shape.strokeLinearGradientStartPointY(20);
   */

  Konva.Factory.addComponentsGetterSetter(
    Konva.Shape,
    'fillLinearGradientEndPoint',
    ['x', 'y']
  );

  /**
   * get/set fill linear gradient end point
   * @name fillLinearGradientEndPoint
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} endPoint
   * @param {Number} endPoint.x
   * @param {Number} endPoint.y
   * @returns {Object}
   * @example
   * // get fill linear gradient end point
   * var endPoint = shape.fillLinearGradientEndPoint();
   *
   * // set fill linear gradient end point
   * shape.fillLinearGradientEndPoint({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addComponentsGetterSetter(
    Konva.Shape,
    'strokeLinearGradientEndPoint',
    ['x', 'y']
  );

  /**
   * get/set stroke linear gradient end point
   * @name strokeLinearGradientEndPoint
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} endPoint
   * @param {Number} endPoint.x
   * @param {Number} endPoint.y
   * @returns {Object}
   * @example
   * // get stroke linear gradient end point
   * var endPoint = shape.strokeLinearGradientEndPoint();
   *
   * // set stroke linear gradient end point
   * shape.strokeLinearGradientEndPoint({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillLinearGradientEndPointX', 0);
  /**
   * get/set fill linear gradient end point x
   * @name fillLinearGradientEndPointX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill linear gradient end point x
   * var endPointX = shape.fillLinearGradientEndPointX();
   *
   * // set fill linear gradient end point x
   * shape.fillLinearGradientEndPointX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'strokeLinearGradientEndPointX',
    0
  );
  /**
   * get/set fill linear gradient end point x
   * @name strokeLinearGradientEndPointX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get stroke linear gradient end point x
   * var endPointX = shape.strokeLinearGradientEndPointX();
   *
   * // set stroke linear gradient end point x
   * shape.strokeLinearGradientEndPointX(20);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillLinearGradientEndPointY', 0);
  /**
   * get/set fill linear gradient end point y
   * @name fillLinearGradientEndPointY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill linear gradient end point y
   * var endPointY = shape.fillLinearGradientEndPointY();
   *
   * // set fill linear gradient end point y
   * shape.fillLinearGradientEndPointY(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'strokeLinearGradientEndPointY',
    0
  );
  /**
   * get/set stroke linear gradient end point y
   * @name strokeLinearGradientEndPointY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get stroke linear gradient end point y
   * var endPointY = shape.strokeLinearGradientEndPointY();
   *
   * // set stroke linear gradient end point y
   * shape.strokeLinearGradientEndPointY(20);
   */

  Konva.Factory.addComponentsGetterSetter(
    Konva.Shape,
    'fillRadialGradientStartPoint',
    ['x', 'y']
  );

  /**
   * get/set fill radial gradient start point
   * @name fillRadialGradientStartPoint
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} startPoint
   * @param {Number} startPoint.x
   * @param {Number} startPoint.y
   * @returns {Object}
   * @example
   * // get fill radial gradient start point
   * var startPoint = shape.fillRadialGradientStartPoint();
   *
   * // set fill radial gradient start point
   * shape.fillRadialGradientStartPoint({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillRadialGradientStartPointX',
    0
  );
  /**
   * get/set fill radial gradient start point x
   * @name fillRadialGradientStartPointX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill radial gradient start point x
   * var startPointX = shape.fillRadialGradientStartPointX();
   *
   * // set fill radial gradient start point x
   * shape.fillRadialGradientStartPointX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Shape,
    'fillRadialGradientStartPointY',
    0
  );
  /**
   * get/set fill radial gradient start point y
   * @name fillRadialGradientStartPointY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill radial gradient start point y
   * var startPointY = shape.fillRadialGradientStartPointY();
   *
   * // set fill radial gradient start point y
   * shape.fillRadialGradientStartPointY(20);
   */

  Konva.Factory.addComponentsGetterSetter(
    Konva.Shape,
    'fillRadialGradientEndPoint',
    ['x', 'y']
  );

  /**
   * get/set fill radial gradient end point
   * @name fillRadialGradientEndPoint
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Object} endPoint
   * @param {Number} endPoint.x
   * @param {Number} endPoint.y
   * @returns {Object}
   * @example
   * // get fill radial gradient end point
   * var endPoint = shape.fillRadialGradientEndPoint();
   *
   * // set fill radial gradient end point
   * shape.fillRadialGradientEndPoint({
   *   x: 20
   *   y: 10
   * });
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillRadialGradientEndPointX', 0);
  /**
   * get/set fill radial gradient end point x
   * @name fillRadialGradientEndPointX
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get fill radial gradient end point x
   * var endPointX = shape.fillRadialGradientEndPointX();
   *
   * // set fill radial gradient end point x
   * shape.fillRadialGradientEndPointX(20);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillRadialGradientEndPointY', 0);
  /**
   * get/set fill radial gradient end point y
   * @name fillRadialGradientEndPointY
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get fill radial gradient end point y
   * var endPointY = shape.fillRadialGradientEndPointY();
   *
   * // set fill radial gradient end point y
   * shape.fillRadialGradientEndPointY(20);
   */

  Konva.Factory.addGetterSetter(Konva.Shape, 'fillPatternRotation', 0);

  /**
   * get/set fill pattern rotation in degrees
   * @name fillPatternRotation
   * @method
   * @memberof Konva.Shape.prototype
   * @param {Number} rotation
   * @returns {Konva.Shape}
   * @example
   * // get fill pattern rotation
   * var patternRotation = shape.fillPatternRotation();
   *
   * // set fill pattern rotation
   * shape.fillPatternRotation(20);
   */

  Konva.Factory.backCompat(Konva.Shape, {
    dashArray: 'dash',
    getDashArray: 'getDash',
    setDashArray: 'getDash',

    drawFunc: 'sceneFunc',
    getDrawFunc: 'getSceneFunc',
    setDrawFunc: 'setSceneFunc',

    drawHitFunc: 'hitFunc',
    getDrawHitFunc: 'getHitFunc',
    setDrawHitFunc: 'setHitFunc'
  });

  Konva.Collection.mapMethods(Konva.Shape);
})(Konva);
