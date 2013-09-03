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
            'bezierCurveTo',
            'clearRect', 
            'clip',
            'closePath',
            'createLinearGradient',
            'createPattern',
            'createRadialGradient',
            'fill', 
            'fillText', 
            'lineTo',
            'moveTo',
            'rect', 
            'restore', 
            'rotate',
            'save', 
            'scale',
            'setTransform', 
            'stroke', 
            'strokeText', 
            'transform',
            'translate'
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
        /**
         * clear trace if trace is enabled
         * @method
         * @memberof Kinetic.Context.prototype
         */
        clearTrace: function() {
            this.traceArr = [];
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
        /**
         * get canvas
         * @method
         * @memberof Kinetic.Context.prototype
         * @returns {Kinetic.Canvas}
         */
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
         * fill, stroke, and apply shadows to shape.  Shadows 
         *  will only be applied to either the fill or stroke.&nbsp; Fill
         *  is given priority over stroke.
         * @method
         * @memberof Kinetic.Context.prototype
         * @param {Kinetic.Shape} shape
         */
        fillStrokeShape: function(shape) {
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
                this.setAttr('lineCap', lineCap);
            }
        },
        _applyOpacity: function(shape) {
            var absOpacity = shape.getAbsoluteOpacity();
            if(absOpacity !== 1) {
                this.setAttr('globalAlpha', absOpacity);
            }
        },
        _applyLineJoin: function(shape) {
            var lineJoin = shape.getLineJoin();
            if(lineJoin) {
                this.setAttr('lineJoin', lineJoin);
            }
        },
        _applyAncestorTransforms: function(shape) {
            var m = shape.getAbsoluteTransform().getMatrix();
            this.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        },
        _clip: function(container) {
            var clipX = container.getClipX() || 0,
                clipY = container.getClipY() || 0,
                clipWidth = container.getClipWidth(),
                clipHeight = container.getClipHeight();

            this.save();
            this._applyAncestorTransforms(container);
            this.beginPath();
            this.rect(clipX, clipY, clipWidth, clipHeight);
            this.clip();
            this.reset();
            container._drawChildren(this.getCanvas());
            this.restore();
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
        createLinearGradient: function() {
            var a = arguments;
            return this._context.createLinearGradient(a[0], a[1], a[2], a[3]);
        },
        createPattern: function() {
            var a = arguments;
            this._context.createPattern(a[0], a[1]);
        },
        createRadialGradient: function() {
            var a = arguments;
            return this._context.createRadialGradient(a[0], a[1], a[2], a[3], a[4], a[5]);
        },
        fill: function() {
            this._context.fill();
        },
        fillText: function() {
            var a = arguments;
            this._context.fillText(a[0], a[1], a[2]);
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
                _roundArrValues = Kinetic.Util._roundArrValues,
                origSetter = this.setAttr,
                n, args;

            // methods
            for (n=0; n<len; n++) {
                (function(methodName) {
                    var origMethod = that[methodName],
                        ret;

                    that[methodName] = function() {
                        args = _roundArrValues(Array.prototype.slice.call(arguments, 0));
                        ret = origMethod.apply(that, arguments);
                        that._trace(methodName + OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN);
                        return ret;
                    };
                })(CONTEXT_METHODS[n]);
            }

            // attrs
            that.setAttr = function() {
                origSetter.apply(that, arguments);
                that._trace(arguments[0] + EQUALS + arguments[1]);
            };
        }
    };

    Kinetic.SceneContext = function(canvas) {
        Kinetic.Context.call(this, canvas);
    };

    Kinetic.SceneContext.prototype = {
        _fillColor: function(shape) {
            var fill = shape.getFill();

            this.setAttr('fillStyle', fill);
            shape._fillFunc(this);
        },
        _fillPattern: function(shape) {
            var fillPatternImage = shape.getFillPatternImage(),
                fillPatternX = shape.getFillPatternX(),
                fillPatternY = shape.getFillPatternY(),
                fillPatternScale = shape.getFillPatternScale(),
                fillPatternRotation = shape.getFillPatternRotation(),
                fillPatternOffset = shape.getFillPatternOffset(),
                fillPatternRepeat = shape.getFillPatternRepeat();

            if(fillPatternX || fillPatternY) {
                this.translate(fillPatternX || 0, fillPatternY || 0);
            }
            if(fillPatternRotation) {
                this.rotate(fillPatternRotation);
            }
            if(fillPatternScale) {
                this.scale(fillPatternScale.x, fillPatternScale.y);
            }
            if(fillPatternOffset) {
                this.translate(-1 * fillPatternOffset.x, -1 * fillPatternOffset.y);
            }

            this.setAttr('fillStyle', this.createPattern(fillPatternImage, fillPatternRepeat || 'repeat'));
            this.fill();
        },
        _fillLinearGradient: function(shape) {
            var start = shape.getFillLinearGradientStartPoint(),
                end = shape.getFillLinearGradientEndPoint(),
                colorStops = shape.getFillLinearGradientColorStops(),
                grd = this.createLinearGradient(start.x, start.y, end.x, end.y);

            if (colorStops) {
                // build color stops
                for(var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                this.setAttr('fillStyle', grd);
                this.fill();
            }
        },
        _fillRadialGradient: function(shape) {
            var start = shape.getFillRadialGradientStartPoint(),
            end = shape.getFillRadialGradientEndPoint(),
            startRadius = shape.getFillRadialGradientStartRadius(),
            endRadius = shape.getFillRadialGradientEndRadius(),
            colorStops = shape.getFillRadialGradientColorStops(),
            grd = this.createRadialGradient(start.x, start.y, startRadius, end.x, end.y, endRadius);

            // build color stops
            for(var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            this.setAttr('fillStyle', grd);
            this.fill();
        },
        _fill: function(shape, skipShadow) {
            var hasColor = shape.getFill(),
                hasPattern = shape.getFillPatternImage(),
                hasLinearGradient = shape.getFillLinearGradientColorStops(),
                hasRadialGradient = shape.getFillRadialGradientColorStops(),
                fillPriority = shape.getFillPriority();

            if(!skipShadow && shape.hasShadow()) {
                this.save();
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
            
            if(!skipShadow && shape.hasShadow()) {
                this.restore();
                this._fill(shape, true);
            }
        },
        _stroke: function(shape, skipShadow) {
            var _context = this._context,
                stroke = shape.getStroke(),
                strokeWidth = shape.getStrokeWidth(),
                dashArray = shape.getDashArray();

            if(stroke || strokeWidth) {
                if (!shape.getStrokeScaleEnabled()) {
                    this.save();
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
                this.setAttr('lineWidth', strokeWidth || 2);
                this.setAttr('strokeStyle', stroke || 'black');
                shape._strokeFunc(this);
                
                if(!skipShadow && shape.hasShadow()) {
                    this.restore();
                    this._stroke(shape, true);
                }
            }
        },
        _applyShadow: function(shape) {
            var util, absOpacity, color, blur, offset, shadowOpacity;

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
                    this.setAttr('globalAlpha', shadowOpacity * absOpacity);
                }

                this.setAttr('shadowColor', color);
                this.setAttr('shadowBlur', blur);
                this.setAttr('shadowOffsetX', offset.x);
                this.setAttr('shadowOffsetY', offset.y);
            }
        }
    };
    Kinetic.Util.extend(Kinetic.SceneContext, Kinetic.Context);

    Kinetic.HitContext = function(canvas) {
        Kinetic.Context.call(this, canvas);
    };

    Kinetic.HitContext.prototype = {
        _fill: function(shape) {
            this.save();
            this.setAttr('fillStyle', shape.colorKey);
            shape._fillFuncHit(this);
            this.restore();
        },
        _stroke: function(shape) {
            var stroke = shape.getStroke(),
                strokeWidth = shape.getStrokeWidth();

            if(stroke || strokeWidth) {
                this._applyLineCap(shape);
                this.setAttr('lineWidth', strokeWidth || 2);
                this.setAttr('strokeStyle', shape.colorKey);
                shape._strokeFuncHit(this);
            }
        }
    };
    Kinetic.Util.extend(Kinetic.HitContext, Kinetic.Context);
})();
