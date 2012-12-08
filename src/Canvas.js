(function() {
    /**
     * Canvas wrapper constructor
     * @constructor
     * @param {Number} width
     * @param {Number} height
     */
    Kinetic.Canvas = function(width, height, isHit) {
        this.element = document.createElement('canvas');
        this.context = this.element.getContext('2d');

        // set dimensions
        this.element.width = width || 0;
        this.element.height = height || 0;

        this.context.renderer = isHit ? new Kinetic.HitRenderer(this.context) : new Kinetic.SceneRenderer(this.context);
    };

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
         * get element
         * @name getElement
         * @methodOf Kinetic.Canvas.prototype
         */
        getElement: function() {
            return this.element;
        },
        /**
         * get context
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
         */
        setWidth: function(width) {
            this.element.width = width;
        },
        /**
         * set height
         * @name setHeight
         * @methodOf Kinetic.Canvas.prototype
         */
        setHeight: function(height) {
            this.element.height = height;
        },
        /**
         * get width
         * @name getWidth
         * @methodOf Kinetic.Canvas.prototype
         */
        getWidth: function() {
            return this.element.width;
        },
        /**
         * get height
         * @name getHeight
         * @methodOf Kinetic.Canvas.prototype
         */
        getHeight: function() {
            return this.element.height;
        },
        /**
         * set size
         * @name setSize
         * @methodOf Kinetic.Canvas.prototype
         */
        setSize: function(width, height) {
            this.setWidth(width);
            this.setHeight(height);
        },
        /**
         * toDataURL
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
        }
    };

    Kinetic.SceneRenderer = function(context) {
        this.context = context;
    };

    Kinetic.SceneRenderer.prototype = {
        _fill: function(shape, skipShadow) {
            var context = this.context, fill = shape.getFill(), fillType = shape._getFillType(fill), shadow = shape.getShadow();
            if(fill) {
                context.save();

                if(!skipShadow && shadow) {
                    this._applyShadow(shape);
                }

                // color fill
                switch(fillType) {
                    case 'COLOR':
                        context.fillStyle = fill;
                        context.fill(context);
                        break;
                    case 'PATTERN':
                        if(fill.x || fill.y) {
                            context.translate(fill.x || 0, fill.y || 0);
                        }
                        if(fill.rotation) {
                            context.rotate(fill.rotation);
                        }
                        if(fill.scale) {
                            context.scale(fill.scale.x, fill.scale.y);
                        }
                        if(fill.offset) {
                            context.translate(-1 * fill.offset.x, -1 * fill.offset.y);
                        }

                        context.fillStyle = context.createPattern(fill.image, fill.repeat || 'repeat');
                        context.fill(context);
                        break;
                    case 'LINEAR_GRADIENT':
                        var s = fill.start;
                        var e = fill.end;
                        var grd = context.createLinearGradient(s.x, s.y, e.x, e.y);
                        var colorStops = fill.colorStops;

                        // build color stops
                        for(var n = 0; n < colorStops.length; n += 2) {
                            grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        }
                        context.fillStyle = grd;
                        context.fill(context);

                        break;
                    case 'RADIAL_GRADIENT':
                        var s = fill.start;
                        var e = fill.end;
                        var grd = context.createRadialGradient(s.x, s.y, s.radius, e.x, e.y, e.radius);
                        var colorStops = fill.colorStops;

                        // build color stops
                        for(var n = 0; n < colorStops.length; n += 2) {
                            grd.addColorStop(colorStops[n], colorStops[n + 1]);
                        }
                        context.fillStyle = grd;
                        context.fill(context);
                        break;
                    default:
                        context.fillStyle = 'black';
                        context.fill(context);
                        break;
                }

                context.restore();

                if(!skipShadow && shadow && shadow.opacity) {
                    this._fill(shape, true);
                }
            }
        },
        _stroke: function(shape, skipShadow) {
            var context = this.context, stroke = shape.getStroke(), strokeWidth = shape.getStrokeWidth(), shadow = shape.getShadow(), dashArray = shape.getDashArray();
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
                if(!skipShadow && shadow) {
                    this._applyShadow(shape);
                }
                context.lineWidth = strokeWidth || 2;
                context.strokeStyle = stroke || 'black';
                context.stroke(context);
                context.restore();

                if(!skipShadow && shadow && shadow.opacity) {
                    this._stroke(shape, true);
                }
            }
        },
        _applyShadow: function(shape) {
            var context = this.context, shadow = shape.getShadow();
            if(shadow) {
                var aa = shape.getAbsoluteOpacity();
                // defaults
                var color = shadow.color || 'black';
                var blur = shadow.blur || 5;
                var offset = shadow.offset || {
                    x: 0,
                    y: 0
                };

                if(shadow.opacity) {
                    context.globalAlpha = shadow.opacity * aa;
                }
                context.shadowColor = color;
                context.shadowBlur = blur;
                context.shadowOffsetX = offset.x;
                context.shadowOffsetY = offset.y;
            }
        },
        _applyLineCap: function(shape) {
            var lineCap = shape.getLineCap();
            if(lineCap) {
                this.context.lineCap = lineCap;
            }
        }
    };

    Kinetic.HitRenderer = function(context) {
        this.context = context;
    };

    Kinetic.HitRenderer.prototype = {
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
        },
        _applyLineCap: function(shape) {
            var lineCap = shape.getLineCap();
            if(lineCap) {
                this.context.lineCap = lineCap;
            }
        }
    };
})();
