(function() {
    /**
     * Canvas Renderer constructor
     * @constructor
     * @param {Number} width
     * @param {Number} height
     */
    Kinetic.Canvas = function(width, height) {
        this.width = width;
        this.height = height;
        this.element = document.createElement('canvas');
        this.context = this.element.getContext('2d');
        this.setSize(width || 0, height || 0);
    };
    // calculate pixel ratio
    var canvas = document.createElement('canvas'), context = canvas.getContext('2d'), devicePixelRatio = window.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    Kinetic.Canvas.pixelRatio = devicePixelRatio / backingStoreRatio;

    Kinetic.Canvas.prototype = {
        /**
         * clear canvas
         * @name clear
         * @methodOf Kinetic.Canvas.prototype
         */
        clear: function() {
            var context = this.getContext();
            var el = this.getElement();
            context.clearRect(0, 0, el.width, el.height);
        },
        /**
         * get canvas element
         * @name getElement
         * @methodOf Kinetic.Canvas.prototype
         */
        getElement: function() {
            return this.element;
        },
        /**
         * get canvas context
         * @name getContext
         * @methodOf Kinetic.Canvas.prototype
         */
        getContext: function() {
            return this.context;
        },
        /**
         * set width
         * @name setWidth
         * @methodOf Kinetic.Canvas.prototype
         * @param {Number} width
         */
        setWidth: function(width) {
            this.width = width;
            // take into account pixel ratio
            this.element.width = width * Kinetic.Canvas.pixelRatio;
            this.element.style.width = width + 'px';
        },
        /**
         * set height
         * @name setHeight
         * @methodOf Kinetic.Canvas.prototype
         * @param {Number} height
         */
        setHeight: function(height) {
            this.height = height;
            // take into account pixel ratio
            this.element.height = height * Kinetic.Canvas.pixelRatio;
            this.element.style.height = height + 'px';
        },
        /**
         * get width
         * @name getWidth
         * @methodOf Kinetic.Canvas.prototype
         */
        getWidth: function() {
            return this.width;
        },
        /**
         * get height
         * @name getHeight
         * @methodOf Kinetic.Canvas.prototype
         */
        getHeight: function() {
            return this.height;
        },
        /**
         * set size
         * @name setSize
         * @methodOf Kinetic.Canvas.prototype
         * @param {Number} width
         * @param {Number} height
         */
        setSize: function(width, height) {
            this.setWidth(width);
            this.setHeight(height);
        },
        /**
         * to data url
         * @name toDataURL
         * @methodOf Kinetic.Canvas.prototype
         * @param {String} mimeType
         * @param {Number} quality between 0 and 1 for jpg mime types
         */
        toDataURL: function(mimeType, quality) {
            try {
                // If this call fails (due to browser bug, like in Firefox 3.6),
                // then revert to previous no-parameter image/png behavior
                return this.element.toDataURL(mimeType, quality);
            }
            catch(e) {
                try {
                    return this.element.toDataURL();
                }
                catch(e) {
                    Kinetic.Global.warn('Unable to get data URL. ' + e.message)
                    return '';
                }
            }
        },
        /**
         * fill shape
         * @name fill
         * @methodOf Kinetic.Canvas.prototype
         * @param {Kinetic.Shape} shape
         */
        fill: function(shape) {
            this._fill(shape);
        },
        /**
         * stroke shape
         * @name stroke
         * @methodOf Kinetic.Canvas.prototype
         * @param {Kinetic.Shape} shape
         */
        stroke: function(shape) {
            this._stroke(shape);
        },
        /**
         * fill, stroke, and apply shadows
         *  will only be applied to either the fill or stroke.&nbsp; Fill
         *  is given priority over stroke.
         * @name fillStroke
         * @methodOf Kinetic.Canvas.prototype
         * @param {Kinetic.Shape} shape
         */
        fillStroke: function(shape) {
            this._fill(shape);
            this._stroke(shape, shape.hasShadow() && shape.getFill());
        },
        /**
         * apply shadow
         * @name applyShadow
         * @methodOf Kinetic.Canvas.prototype
         * @param {Kinetic.Shape} shape
         * @param {Function} drawFunc
         */
        applyShadow: function(shape, drawFunc) {
            var context = this.context;
            context.save();
            this._applyShadow(shape);
            drawFunc();
            context.restore();
            drawFunc();
        },
        _applyLineCap: function(shape) {
            var lineCap = shape.getLineCap();
            if(lineCap) {
                this.context.lineCap = lineCap;
            }
        },
        _applyOpacity: function(shape) {
            var absOpacity = shape.getAbsoluteOpacity();
            if(absOpacity !== 1) {
                this.context.globalAlpha = absOpacity;
            }
        },
        _applyLineJoin: function(shape) {
            var lineJoin = shape.getLineJoin();
            if(lineJoin) {
                this.context.lineJoin = lineJoin;
            }
        },
        _handlePixelRatio: function() {
            var pixelRatio = Kinetic.Canvas.pixelRatio;
            if(pixelRatio !== 1) {
                this.getContext().scale(pixelRatio, pixelRatio);
            }
        },
        _counterPixelRatio: function() {
            var pixelRatio = Kinetic.Canvas.pixelRatio;
            if(pixelRatio !== 1) {
                pixelRatio = 1 / pixelRatio;
                this.getContext().scale(pixelRatio, pixelRatio);
            }
        },
        _applyAncestorTransforms: function(node) {
            var context = this.context;
            node._eachAncestorReverse(function(no) {
                var t = no.getTransform(), m = t.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }, true);
        }
    };

    Kinetic.SceneCanvas = function(width, height) {
        Kinetic.Canvas.call(this, width, height);
    };

    Kinetic.SceneCanvas.prototype = {
        _fillColor: function(shape) {
            var context = this.context, fill = shape.getFill();
            context.fillStyle = fill;
            context.fill(context);
        },
        _fillPattern: function(shape) {
            var context = this.context, fillPatternImage = shape.getFillPatternImage(), fillPatternX = shape.getFillPatternX(), fillPatternY = shape.getFillPatternY(), fillPatternScale = shape.getFillPatternScale(), fillPatternRotation = shape.getFillPatternRotation(), fillPatternOffset = shape.getFillPatternOffset(), fillPatternRepeat = shape.getFillPatternRepeat();

            if(fillPatternX || fillPatternY) {
                context.translate(fillPatternX || 0, fillPatternY || 0);
            }
            if(fillPatternRotation) {
                context.rotate(fillPatternRotation);
            }
            if(fillPatternScale) {
                context.scale(fillPatternScale.x, fillPatternScale.y);
            }
            if(fillPatternOffset) {
                context.translate(-1 * fillPatternOffset.x, -1 * fillPatternOffset.y);
            }

            context.fillStyle = context.createPattern(fillPatternImage, fillPatternRepeat || 'repeat');
            context.fill(context);
        },
        _fillLinearGradient: function(shape) {
            var context = this.context, start = shape.getFillLinearGradientStartPoint(), end = shape.getFillLinearGradientEndPoint(), colorStops = shape.getFillLinearGradientColorStops(), grd = context.createLinearGradient(start.x, start.y, end.x, end.y);

            // build color stops
            for(var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            context.fillStyle = grd;
            context.fill(context);
        },
        _fillRadialGradient: function(shape) {
            var context = this.context, start = shape.getFillRadialGradientStartPoint(), end = shape.getFillRadialGradientEndPoint(), startRadius = shape.getFillRadialGradientStartRadius(), endRadius = shape.getFillRadialGradientEndRadius(), colorStops = shape.getFillRadialGradientColorStops(), grd = context.createRadialGradient(start.x, start.y, startRadius, end.x, end.y, endRadius);

            // build color stops
            for(var n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            context.fillStyle = grd;
            context.fill(context);
        },
        _fill: function(shape, skipShadow) {
            var context = this.context, fill = shape.getFill(), fillPatternImage = shape.getFillPatternImage(), fillLinearGradientStartPoint = shape.getFillLinearGradientStartPoint(), fillRadialGradientStartPoint = shape.getFillRadialGradientStartPoint();

            context.save();

            if(!skipShadow && shape.hasShadow()) {
                this._applyShadow(shape);
            }

            if(fill) {
                this._fillColor(shape);
            }
            else if(fillPatternImage) {
                this._fillPattern(shape);
            }
            else if(fillLinearGradientStartPoint) {
                this._fillLinearGradient(shape);
            }
            else if(fillRadialGradientStartPoint) {
                this._fillRadialGradient(shape);
            }
            context.restore();

            if(!skipShadow && shape.hasShadow()) {
                this._fill(shape, true);
            }
        },
        _stroke: function(shape, skipShadow) {
            var context = this.context, stroke = shape.getStroke(), strokeWidth = shape.getStrokeWidth(), dashArray = shape.getDashArray();
            if(stroke || strokeWidth) {
                context.save();
                this._applyLineCap(shape);
                if(dashArray) {
                    if(context.setLineDash) {
                        context.setLineDash(dashArray);
                    }
                    else {
                        Kinetic.Global.warn('Could not apply dash array because your browser does not support it.');
                    }
                }
                if(!skipShadow && shape.hasShadow()) {
                    this._applyShadow(shape);
                }
                context.lineWidth = strokeWidth || 2;
                context.strokeStyle = stroke || 'black';
                context.stroke(context);
                context.restore();

                if(!skipShadow && shape.hasShadow()) {
                    this._stroke(shape, true);
                }
            }
        },
        _applyShadow: function(shape) {
            var context = this.context;
            if(shape.hasShadow()) {
                var aa = shape.getAbsoluteOpacity();
                // defaults
                var color = shape.getShadowColor() || 'black';
                var blur = shape.getShadowBlur() || 5;
                var offset = shape.getShadowOffset() || {
                    x: 0,
                    y: 0
                };

                if(shape.getShadowOpacity()) {
                    context.globalAlpha = shape.getShadowOpacity() * aa;
                }
                context.shadowColor = color;
                context.shadowBlur = blur;
                context.shadowOffsetX = offset.x;
                context.shadowOffsetY = offset.y;
            }
        }
    };
    Kinetic.Global.extend(Kinetic.SceneCanvas, Kinetic.Canvas);

    Kinetic.HitCanvas = function(width, height) {
        Kinetic.Canvas.call(this, width, height);
    };

    Kinetic.HitCanvas.prototype = {
        _fill: function(shape) {
            var context = this.context;
            context.save();
            context.fillStyle = '#' + shape.colorKey;
            context.fill(context);
            context.restore();
        },
        _stroke: function(shape) {
            var context = this.context, stroke = shape.getStroke(), strokeWidth = shape.getStrokeWidth();
            if(stroke || strokeWidth) {
                this._applyLineCap(shape);
                context.save();
                context.lineWidth = strokeWidth || 2;
                context.strokeStyle = '#' + shape.colorKey;
                context.stroke(context);
                context.restore();
            }
        }
    };
    Kinetic.Global.extend(Kinetic.HitCanvas, Kinetic.Canvas);
})();
