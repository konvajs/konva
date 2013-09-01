(function() {
    var COMMA = ',',
        OPEN_PAREN = '(',
        CLOSE_PAREN = ')',
        EMPTY_STRING = '',
        EQUALS = '=',
        SET = 'set',
        CONTEXT_METHODS = [
            'arc',
            'arcTo',
            'beginPath',
            'clearRect', 
            'closePath',
            'fill', 
            'fillText', 
            'lineTo',
            'moveTo',
            'rect', 
            'restore', 
            'save', 
            'setTransform', 
            'stroke', 
            'strokeText', 
            'transform'
        ],
        CONTEXT_PROPERTIES = [
            'fillStyle', 
            'lineWidth', 
            'strokeStyle'
        ];

    /**
     * Canvas Context constructor
     * @constructor
     * @abstract
     * @memberof Kinetic
     */
    Kinetic.Context = function(canvas) {
        this.init(canvas);
    };

    Kinetic.Context.prototype = {
        init: function(canvas) {
            this.canvas = canvas;
            this._context = canvas._canvas.getContext('2d');

            if (Kinetic.enableTrace) {
                this.traceArr = [];
                this._enableTrace();
            }
        },
        /**
         * get context trace if trace is enabled
         * @method
         * @memberof Kinetic.Context.prototype
         * @returns {String}
         */
        getTrace: function() {
            return this.traceArr.join(';');

        },
        _trace: function(str) {
            var traceArr = this.traceArr,
                len;
 
            traceArr.push(str);
            len = traceArr.length;

            if (len >= Kinetic.traceArrMax) {
                traceArr.shift();
            }
        },
        /**
         * reset canvas context transform
         * @method
         * @memberof Kinetic.Context.prototype
         */
        reset: function() {
            var pixelRatio = this.getCanvas().getPixelRatio();
            this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
        },
        getCanvas: function() {
            return this.canvas;
        },
        /**
         * clear canvas
         * @method
         * @memberof Kinetic.Context.prototype
         */
        clear: function(clip) {
            var canvas = this.getCanvas(),
                pos, size;
            
            if (clip) {
                pos = Kinetic.Util._getXY(clip);
                size = Kinetic.Util._getSize(clip);
                this.clearRect(pos.x || 0, pos.y || 0, size.width, size.height);
            }
            else {
                this.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
            }
        },
        /**
         * fill shape
         * @method
         * @memberof Kinetic.Context.prototype
         * @param {Kinetic.Shape} shape
         */
        fillShape: function(shape) {
            if(shape.getFillEnabled()) {
                this._fill(shape);
            }
        },
        /**
         * stroke shape
         * @method
         * @memberof Kinetic.Context.prototype
         * @param {Kinetic.Shape} shape
         */
        strokeShape: function(shape) {
            if(shape.getStrokeEnabled()) {
                this._stroke(shape);
            }
        },
        /**
         * fill, stroke, and apply shadows
         *  will only be applied to either the fill or stroke.&nbsp; Fill
         *  is given priority over stroke.
         * @method
         * @memberof Kinetic.Context.prototype
         * @param {Kinetic.Shape} shape
         */
        fillStroke: function(shape) {
            var fillEnabled = shape.getFillEnabled();
            if(fillEnabled) {
                this._fill(shape);
            }

            if(shape.getStrokeEnabled()) {
                this._stroke(shape, shape.hasShadow() && shape.hasFill() && fillEnabled);
            }
        },
        _applyLineCap: function(shape) {
            var lineCap = shape.getLineCap();
            if(lineCap) {
                this._context.lineCap = lineCap;
            }
        },
        _applyOpacity: function(shape) {
            var absOpacity = shape.getAbsoluteOpacity();
            if(absOpacity !== 1) {
                this._context.globalAlpha = absOpacity;
            }
        },
        _applyLineJoin: function(shape) {
            var lineJoin = shape.getLineJoin();
            if(lineJoin) {
                this._context.lineJoin = lineJoin;
            }
        },
        _applyAncestorTransforms: function(shape) {
            var m = shape.getAbsoluteTransform().getMatrix();
            this.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        },
        _clip: function(container) {
            var _context = this._context,
                clipX = container.getClipX() || 0,
                clipY = container.getClipY() || 0,
                clipWidth = container.getClipWidth(),
                clipHeight = container.getClipHeight();

            this.save();
            this._applyAncestorTransforms(container);
            _context.beginPath();
            this.rect(clipX, clipY, clipWidth, clipHeight);
            _context.clip();
            this.reset();
            container._drawChildren(this.getCanvas());
            this.restore();
        },

        // context property setters
        setFillStyle: function(val) {
            this._context.fillStyle = val;
        },
        setLineWidth: function(val) {
            this._context.lineWidth = val;
        },
        setStrokeStyle: function(val) {
            this._context.strokeStyle = val;
        },

        // context pass through methods
        arc: function() {
            var a = arguments;
            this._context.arc(a[0], a[1], a[2], a[3], a[4], a[5]);
        },
        beginPath: function() {
            this._context.beginPath();
        },
        clearRect: function(x, y, width, height) {
            this._context.clearRect(x, y, width, height);
        },
        closePath: function() {
            this._context.closePath();
        },
        fill: function() {
            this._context.fill();
        },
        fillText: function(str, x, y) {
            this._context.fillText(str, x, y);
        },
        lineTo: function() {
            var a = arguments;
            this._context.lineTo(a[0], a[1]);
        },
        moveTo: function() {
            var a = arguments;
            this._context.moveTo(a[0], a[1]);
        },
        rect: function(x, y, width, height) {
            this._context.rect(x, y, width, height);
        },
        restore: function() {
            this._context.restore();
        },
        save: function() {
            this._context.save();
        },
        setTransform: function(a, b, c, d, e, f) {
            this._context.setTransform(a, b, c, d, e, f);
        },
        stroke: function() {
            this._context.stroke();
        },
        strokeText: function(str, x, y) {
            this._context.strokeText(str, x, y);
        },
        transform: function(a, b, c, d, e, f) {
            this._context.transform(a, b, c, d, e, f);
        },
        _enableTrace: function() {
            var that = this,
                len = CONTEXT_METHODS.length,
                _roundArrValues = Kinetic.Util._roundArrValues,
                n;

            // methods
            for (n=0; n<len; n++) {
                (function(contextMethod) {
                    var method = that[contextMethod],
                        args;

                    that[contextMethod] = function() {
                        args = _roundArrValues(Array.prototype.slice.call(arguments, 0));
                        method.apply(that, arguments);
                        that._trace(contextMethod + OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN);
                    };
                })(CONTEXT_METHODS[n]);
            }

            // properties
            len = CONTEXT_PROPERTIES.length;
            for (n=0; n<len; n++) {
                (function(contextProperty) {
                    var methodName = SET + Kinetic.Util._capitalize(contextProperty),
                        method = that[methodName];

                    that[methodName] = function(val) {
                        method.call(that, val);
                        that._trace(contextProperty + EQUALS + val);
                    };
                })(CONTEXT_PROPERTIES[n]);
            }
        }
    };

    Kinetic.SceneContext = function(canvas) {
        Kinetic.Context.call(this, canvas);
    };

    Kinetic.SceneContext.prototype = {
        _fillColor: function(shape) {
            var _context = this._context, 
                fill = shape.getFill();

            this.setFillStyle(fill);
            shape._fillFunc(this);
        },
        _fillPattern: function(shape) {
            var _context = this._context,
                fillPatternImage = shape.getFillPatternImage(),
                fillPatternX = shape.getFillPatternX(),
                fillPatternY = shape.getFillPatternY(),
                fillPatternScale = shape.getFillPatternScale(),
                fillPatternRotation = shape.getFillPatternRotation(),
                fillPatternOffset = shape.getFillPatternOffset(),
                fillPatternRepeat = shape.getFillPatternRepeat();

            if(fillPatternX || fillPatternY) {
                _context.translate(fillPatternX || 0, fillPatternY || 0);
            }
            if(fillPatternRotation) {
                _context.rotate(fillPatternRotation);
            }
            if(fillPatternScale) {
                _context.scale(fillPatternScale.x, fillPatternScale.y);
            }
            if(fillPatternOffset) {
                _context.translate(-1 * fillPatternOffset.x, -1 * fillPatternOffset.y);
            }

            this.setFillStyle(_context.createPattern(fillPatternImage, fillPatternRepeat || 'repeat'));
            this.fill();
        },
        _fillLinearGradient: function(shape) {
            var _context = this._context,
                start = shape.getFillLinearGradientStartPoint(),
                end = shape.getFillLinearGradientEndPoint(),
                colorStops = shape.getFillLinearGradientColorStops(),
                grd = _context.createLinearGradient(start.x, start.y, end.x, end.y);

            if (colorStops) {
                // build color stops
                for(var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                this.setFillStyle(grd);
                this.fill();
            }
        },
        _fillRadialGradient: function(shape) {
            var _context = this._context,
            start = shape.getFillRadialGradientStartPoint(),
            end = shape.getFillRadialGradientEndPoint(),
            startRadius = shape.getFillRadialGradientStartRadius(),
            endRadius = shape.getFillRadialGradientEndRadius(),
            colorStops = shape.getFillRadialGradientColorStops(),
            grd = _context.createRadialGradient(start.x, start.y, startRadius, end.x, end.y, endRadius);

            // build color stops
            for(var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            this.setFillStyle(grd);
            this.fill();
        },
        _fill: function(shape, skipShadow) {
            var _context = this._context,
                hasColor = shape.getFill(),
                hasPattern = shape.getFillPatternImage(),
                hasLinearGradient = shape.getFillLinearGradientColorStops(),
                hasRadialGradient = shape.getFillRadialGradientColorStops(),
                fillPriority = shape.getFillPriority();

            _context.save();

            if(!skipShadow && shape.hasShadow()) {
                this._applyShadow(shape);
            }

            // priority fills
            if(hasColor && fillPriority === 'color') {
                this._fillColor(shape);
            }
            else if(hasPattern && fillPriority === 'pattern') {
                this._fillPattern(shape);
            }
            else if(hasLinearGradient && fillPriority === 'linear-gradient') {
                this._fillLinearGradient(shape);
            }
            else if(hasRadialGradient && fillPriority === 'radial-gradient') {
                this._fillRadialGradient(shape);
            }
            // now just try and fill with whatever is available
            else if(hasColor) {
                this._fillColor(shape);
            }
            else if(hasPattern) {
                this._fillPattern(shape);
            }
            else if(hasLinearGradient) {
                this._fillLinearGradient(shape);
            }
            else if(hasRadialGradient) {
                this._fillRadialGradient(shape);
            }
            _context.restore();

            if(!skipShadow && shape.hasShadow()) {
                this._fill(shape, true);
            }
        },
        _stroke: function(shape, skipShadow) {
            var _context = this._context,
                stroke = shape.getStroke(),
                strokeWidth = shape.getStrokeWidth(),
                dashArray = shape.getDashArray();

            if(stroke || strokeWidth) {
                this.save();
                if (!shape.getStrokeScaleEnabled()) {
                    this.setTransform(1, 0, 0, 1, 0, 0);
                }
                this._applyLineCap(shape);
                if(dashArray && shape.getDashArrayEnabled()) {
                    if(_context.setLineDash) {
                        _context.setLineDash(dashArray);
                    }
                    else if('mozDash' in _context) {
                        _context.mozDash = dashArray;
                    }
                    else if('webkitLineDash' in _context) {
                        _context.webkitLineDash = dashArray;
                    }
                }
                if(!skipShadow && shape.hasShadow()) {
                    this._applyShadow(shape);
                }
                this.setLineWidth(strokeWidth || 2);
                this.setStrokeStyle(stroke || 'black');
                shape._strokeFunc(this);
                this.restore();

                if(!skipShadow && shape.hasShadow()) {
                    this._stroke(shape, true);
                }
            }
        },
        _applyShadow: function(shape) {
            var _context = this._context,
                util, absOpacity, color, blur, offset, shadowOpacity;

            if(shape.hasShadow() && shape.getShadowEnabled()) {
                util = Kinetic.Util;
                absOpacity = shape.getAbsoluteOpacity();
                color = util.get(shape.getShadowColor(), 'black');
                blur = util.get(shape.getShadowBlur(), 5);
                shadowOpacity = util.get(shape.getShadowOpacity(), 0);
                offset = util.get(shape.getShadowOffset(), {
                    x: 0,
                    y: 0
                });

                if(shadowOpacity) {
                    _context.globalAlpha = shadowOpacity * absOpacity;
                }

                _context.shadowColor = color;
                _context.shadowBlur = blur;
                _context.shadowOffsetX = offset.x;
                _context.shadowOffsetY = offset.y;
            }
        }
    };
    Kinetic.Util.extend(Kinetic.SceneContext, Kinetic.Context);

    Kinetic.HitContext = function(canvas) {
        Kinetic.Context.call(this, canvas);
    };

    Kinetic.HitContext.prototype = {
        _fill: function(shape) {
            var _context = this._context;
            _context.save();
            this.setFillStyle(shape.colorKey);
            shape._fillFuncHit(_context);
            _context.restore();
        },
        _stroke: function(shape) {
            var _context = this._context,
                stroke = shape.getStroke(),
                strokeWidth = shape.getStrokeWidth();

            if(stroke || strokeWidth) {
                this._applyLineCap(shape);
                _context.lineWidth = strokeWidth || 2;
                _context.strokeStyle = shape.colorKey;
                shape._strokeFuncHit(_context);
            }
        }
    };
    Kinetic.Util.extend(Kinetic.HitContext, Kinetic.Context);
})();
