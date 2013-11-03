(function() {
    var HAS_SHADOW = 'hasShadow';

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

    Kinetic.Util.addMethods(Kinetic.Shape, {
        __init: function(config) {
            this.nodeType = 'Shape';
            this._fillFunc = _fillFunc;
            this._strokeFunc = _strokeFunc;
            this._fillFuncHit = _fillFuncHit;
            this._strokeFuncHit = _strokeFuncHit;

            // set colorKey
            var shapes = Kinetic.shapes;
            var key;

            while(true) {
                key = Kinetic.Util.getRandomColor();
                if(key && !( key in shapes)) {
                    break;
                }
            }

            this.colorKey = key;
            shapes[key] = this;

            // call super constructor
            Kinetic.Node.call(this, config);

            this._setDrawFuncs();

            this.on('shadowColorChange.kinetic shadowBlurChange.kinetic shadowOffsetChange.kinetic shadowOpacityChange.kinetic shadowEnabledChanged.kinetic', _clearHasShadowCache);
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
         * @memberof Kinetic.Shape.prototype
         */
        getContext: function() {
            return this.getLayer().getContext();
        },
        /**
         * get canvas renderer tied to the layer.  Note that this returns a canvas renderer, not a canvas element
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        getCanvas: function() {
            return this.getLayer().getCanvas();
        },
        /**
         * returns whether or not a shadow will be rendered
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        hasShadow: function() {
            return this._getCache(HAS_SHADOW, this._hasShadow);  
        },
        _hasShadow: function() {
            return this.getShadowEnabled() && (this.getShadowOpacity() !== 0 && !!(this.getShadowColor() || this.getShadowBlur() || this.getShadowOffsetX() || this.getShadowOffsetY()));
        },
        /**
         * returns whether or not the shape will be filled
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        hasFill: function() {
            return !!(this.getFill() || this.getFillPatternImage() || this.getFillLinearGradientColorStops() || this.getFillRadialGradientColorStops());
        },
        /**
         * returns whether or not the shape will be stroked
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        hasStroke: function() {
            return !!(this.getStroke() || this.getStrokeWidth());
        },
        _get: function(selector) {
            return this.className === selector || this.nodeType === selector ? [this] : [];
        },
        /**
         * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
         *  this method clears a temporary canvas and then redraws the shape, it performs very poorly if executed many times
         *  consecutively.  Please use the {@link Kinetic.Stage#getIntersection} method if at all possible
         *  because it performs much better
         * @method
         * @memberof Kinetic.Shape.prototype
         * @param {Object} point point can be an object containing
         *  an x and y property, or it can be an array with two elements
         *  in which the first element is the x component and the second
         *  element is the y component
         */
        intersects: function() {
            var pos = Kinetic.Util._getXY(Array.prototype.slice.call(arguments)),
                stage = this.getStage(),
                bufferHitCanvas = stage.bufferHitCanvas,
                p;

            bufferHitCanvas.getContext().clear();
            this.drawScene(bufferHitCanvas);
            p = bufferHitCanvas.context.getImageData(pos.x | 0, pos.y | 0, 1, 1).data;
            return p[3] > 0;
        },
        /**
         * enable fill
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        enableFill: function() {
            this._setAttr('fillEnabled', true);
            return this;
        },
        /**
         * disable fill
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        disableFill: function() {
            this._setAttr('fillEnabled', false);
            return this;
        },
        /**
         * enable stroke
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        enableStroke: function() {
            this._setAttr('strokeEnabled', true);
            return this;
        },
        /**
         * disable stroke
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        disableStroke: function() {
            this._setAttr('strokeEnabled', false);
            return this;
        },
        /**
         * enable stroke scale
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        enableStrokeScale: function() {
            this._setAttr('strokeScaleEnabled', true);
            return this;
        },
        /**
         * disable stroke scale
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        disableStrokeScale: function() {
            this._setAttr('strokeScaleEnabled', false);
            return this;
        },
        /**
         * enable shadow
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        enableShadow: function() {
            this._setAttr('shadowEnabled', true);
            return this;
        },
        /**
         * disable shadow
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        disableShadow: function() {
            this._setAttr('shadowEnabled', false);
            return this;
        },
        /**
         * enable dash array
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        enableDashArray: function() {
            this._setAttr('dashArrayEnabled', true);
            return this;
        },
        /**
         * disable dash array
         * @method
         * @memberof Kinetic.Shape.prototype
         */
        disableDashArray: function() {
            this._setAttr('dashArrayEnabled', false);
            return this;
        },
        // extends Node.prototype.destroy 
        destroy: function() {
            Kinetic.Node.prototype.destroy.call(this);
            delete Kinetic.shapes[this.colorKey];
            return this;
        },
        _useBufferCanvas: function() {
            return (this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasFill() && this.hasStroke();
        },
        drawScene: function(can) {
            var canvas = can || this.getLayer().getCanvas(),
                context = canvas.getContext(),
                drawFunc = this.getDrawFunc(),
                hasShadow = this.hasShadow(),
                stage, bufferCanvas, bufferContext;

            if(drawFunc && this.isVisible()) { 
                // if buffer canvas is needed
                if (this._useBufferCanvas()) {
                    stage = this.getStage();
                    bufferCanvas = stage.bufferCanvas;
                    bufferContext = bufferCanvas.getContext();
                    bufferContext.clear();
                    bufferContext.save();
                    bufferContext._applyLineJoin(this);
                    bufferContext._applyAncestorTransforms(this);
                    drawFunc.call(this, bufferContext);
                    bufferContext.restore();

                    context.save();
                    if (hasShadow) {
                        context.save();
                        context._applyShadow(this);
                        context.drawImage(bufferCanvas._canvas, 0, 0); 
                        context.restore();
                    }

                    context._applyOpacity(this);
                    context.drawImage(bufferCanvas._canvas, 0, 0);
                    context.restore();
                }
                // if buffer canvas is not needed
                else {
                    context.save();
                    context._applyLineJoin(this);
                    context._applyAncestorTransforms(this);

                    if (hasShadow) {
                        context.save();
                        context._applyShadow(this);
                        drawFunc.call(this, context);
                        context.restore();
                    }   

                    context._applyOpacity(this);
                    drawFunc.call(this, context);
                    context.restore();
                }
            }

            return this;
        },
        drawHit: function() {
            var attrs = this.getAttrs(),
                drawFunc = attrs.drawHitFunc || attrs.drawFunc,
                canvas = this.getLayer().hitCanvas,
                context = canvas.getContext();

            if(drawFunc && this.shouldDrawHit()) {
                context.save();
                context._applyLineJoin(this);
                context._applyAncestorTransforms(this);
                drawFunc.call(this, context);
                context.restore();
            }
            return this;
        },
        _setDrawFuncs: function() {
            if(!this.attrs.drawFunc && this.drawFunc) {
                this.setDrawFunc(this.drawFunc);
            }
            if(!this.attrs.drawHitFunc && this.drawHitFunc) {
                this.setDrawHitFunc(this.drawHitFunc);
            }
        }
    });
    Kinetic.Util.extend(Kinetic.Shape, Kinetic.Node);

    // add getters and setters
    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, 'stroke');

    /**
     * set stroke color
     * @name setStroke
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} color
     */

     /**
     * set stroke color with an object literal
     * @name setStrokeRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     * @example
     * shape.setStrokeRGB({<br>
     *   r: 200,<br>
     *   g: 50,<br>
     *   b: 100<br>
     * });
     */

     /**
     * set stroke color red component
     * @name setStrokeR
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} red
     */

     /**
     * set stroke color green component
     * @name setStrokeG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} green
     */

     /**
     * set stroke color blue component
     * @name setStrokeB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} blue
     */

     /**
     * get stroke color
     * @name getStroke
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get stroke color as an object literal
     * @name getStrokeRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get stroke color red component
     * @name getStrokeR
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get stroke color green component
     * @name getStrokeG
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get stroke color blue component
     * @name getStrokeB
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'lineJoin');

    /**
     * set line join
     * @name setLineJoin
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} lineJoin.  Can be miter, round, or bevel.  The
     *  default is miter
     */

     /**
     * get line join
     * @name getLineJoin
     * @method
     * @memberof Kinetic.Shape.prototype
     */


    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'lineCap');

    /**
     * set line cap.  Can be butt, round, or square
     * @name setLineCap
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} lineCap
     */

     /**
     * get line cap
     * @name getLineCap
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'strokeWidth');

    /**
     * set stroke width
     * @name setStrokeWidth
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} strokeWidth
     */

     /**
     * get stroke width
     * @name getStrokeWidth
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'drawFunc');

    /**
     * set draw function
     * @name setDrawFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Function} drawFunc drawing function
     */

     /**
     * get draw function
     * @name getDrawFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'drawHitFunc');

    /**
     * set draw hit function used for hit detection
     * @name setDrawHitFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Function} drawHitFunc drawing function used for hit detection
     */

     /**
     * get draw hit function
     * @name getDrawHitFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'dashArray');

    /**
     * set dash array.
     * @name setDashArray
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Array} dashArray
     *  examples:<br>
     *  [10, 5] dashes are 10px long and 5 pixels apart
     *  [10, 20, 0.001, 20] if using a round lineCap, the line will
     *  be made up of alternating dashed lines that are 10px long
     *  and 20px apart, and dots that have a radius of 5px and are 20px
     *  apart
     */

     /**
     * get dash array
     * @name getDashArray
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, 'shadowColor');

    /**
     * set shadow color
     * @name setShadowColor
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} color
     */

     /**
     * set shadow color with an object literal
     * @name setShadowColorRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     * @example
     * shape.setShadowRGB({<br>
     *   r: 200,<br>
     *   g: 50,<br>
     *   b: 100<br>
     * });
     */

     /**
     * set shadow color red component
     * @name setShadowColorR
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} red
     */

     /**
     * set shadow color green component
     * @name setShadowColorG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} green
     */

     /**
     * set shadow color blue component
     * @name setShadowColorB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} blue
     */

     /**
     * get shadow color
     * @name getShadowColor
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get shadow color as an object literal
     * @name getShadowColorRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get shadow color red component
     * @name getShadowColorR
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get shadow color green component
     * @name getShadowColorG
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get shadow color blue component
     * @name getShadowColorB
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'shadowBlur');

    /**
     * set shadow blur
     * @name setShadowBlur
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} blur
     */

     /**
     * get shadow blur
     * @name getShadowBlur
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'shadowOpacity');

    /**
     * set shadow opacity
     * @name setShadowOpacity
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} opacity must be a value between 0 and 1
     */

     /**
     * get shadow opacity
     * @name getShadowOpacity
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternImage');

    /**
     * set fill pattern image
     * @name setFillPatternImage
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Image} image object
     */

     /**
     * get fill pattern image
     * @name getFillPatternImage
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, 'fill');

    /**
     * set fill color
     * @name setFill
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} color
     */

     /**
     * set fill color with an object literal
     * @name setFillRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     * @example
     * shape.setFillRGB({<br>
     *   r: 200,<br>
     *   g: 50,<br>
     *   b: 100<br>
     * });
     */

     /**
     * set fill color red component
     * @name setFillR
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} red
     */

     /**
     * set fill color green component
     * @name setFillG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} green
     */

     /**
     * set fill color blue component
     * @name setFillB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} blue
     */

     /**
     * get fill color
     * @name getFill
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill color as an object literal
     * @name getFillRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill color red component
     * @name getFillR
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill color green component
     * @name getFillG
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill color blue component
     * @name getFillB
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternX');

    /**
     * set fill pattern x
     * @name setFillPatternX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * get fill pattern x
     * @name getFillPatternX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternY');

    /**
     * set fill pattern y
     * @name setFillPatternY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill pattern y
     * @name getFillPatternY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillLinearGradientColorStops');

    /**
     * set fill linear gradient color stops
     * @name setFillLinearGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Array} colorStops
     */

     /**
     * get fill linear gradient color stops
     * @name getFillLinearGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Array} colorStops
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillRadialGradientStartRadius');

    /**
     * set fill radial gradient start radius
     * @name setFillRadialGradientStartRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} radius
     */

     /**
     * get fill radial gradient start radius
     * @name getFillRadialGradientStartRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillRadialGradientEndRadius');

    /**
     * set fill radial gradient end radius
     * @name setFillRadialGradientEndRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} radius
     */

     /**
     * get fill radial gradient end radius
     * @name getFillRadialGradientEndRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillRadialGradientColorStops');

    /**
     * set fill radial gradient color stops
     * @name setFillRadialGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} colorStops
     */

     /**
     * get fill radial gradient color stops
     * @name getFillRadialGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternRepeat');

    /**
     * set fill pattern repeat
     * @name setFillPatternRepeat
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} repeat can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'no-repeat'
     */

     /**
     * get fill pattern repeat
     * @name getFillPatternRepeat
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillEnabled', true);

    /**
     * set fill enabled
     * @name setFillEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get fill enabled
     * @name getFillEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'strokeEnabled', true);

    /**
     * set stroke enabled
     * @name setStrokeEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get stroke enabled
     * @name getStrokeEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'shadowEnabled', true);

    /**
     * set shadow enabled
     * @name setShadowEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get shadow enabled
     * @name getShadowEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'dashArrayEnabled', true);

    /**
     * set dash array enabled
     * @name setDashArrayEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get dash array enabled
     * @name getDashArrayEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPriority', 'color');

    /**
     * set fill priority
     * @name setFillPriority
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} priority can be color, pattern, linear-gradient, or radial-gradient
     *  The default is color.
     */

     /**
     * get fill priority
     * @name getFillPriority
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'strokeScaleEnabled', true);

     /**
     * set stroke scale enabled
     * @name setStrokeScaleEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get stroke scale enabled
     * @name getStrokeScaleEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillPatternOffset', 0);

    /**
     * set fill pattern offset
     * @name setFillPatternOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number|Array|Object} offset
     * @example
     * // set x and y<br>
     * shape.setFillPatternOffset(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setFillPatternOffset({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setFillPatternOffset([20, 40]);<br><br>
     *
     * // set x and y to the same value<br>
     * shape.setFillPatternOffset(5);
     */

     /**
     * set fill pattern offset x
     * @name setFillPatternOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill pattern offset y
     * @name setFillPatternOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill pattern offset
     * @name getFillPatternOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill pattern offset x
     * @name getFillPatternOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill pattern offset y
     * @name getFillPatternOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillPatternScale', 1);

    /**
     * set fill pattern scale
     * @name setFillPatternScale
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} scale
     * @example
     * // set x and y to the same value<br>
     * shape.setFillPatternScale(5);<br><br>
     *
     * // set x and y<br>
     * shape.setFillPatternScale(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setFillPatternScale({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setFillPatternScale([20, 40]);
     */

     /**
     * set fill pattern scale x
     * @name setFillPatternScaleX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill pattern scale y
     * @name setFillPatternScaleY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill pattern scale
     * @name getFillPatternScale
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill pattern scale x
     * @name getFillPatternScaleX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill pattern scale y
     * @name getFillPatternScaleY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillLinearGradientStartPoint', 0);

    /**
     * set fill linear gradient start point
     * @name setFillLinearGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number|Array|Object} startPoint
     * @example
     * // set x and y<br>
     * shape.setFillLinearGradientStartPoint(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setFillLinearGradientStartPoint({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setFillLinearGradientStartPoint([20, 40]);<br><br>
     *
     * // set x and y to the same value<br>
     * shape.setFillLinearGradientStartPoint(5);
     */

     /**
     * set fill linear gradient start point x
     * @name setFillLinearGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill linear gradient start point y
     * @name setFillLinearGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill linear gradient start point
     * @name getFillLinearGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient start point x
     * @name getFillLinearGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient start point y
     * @name getFillLinearGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillLinearGradientEndPoint', 0);

    /**
     * set fill linear gradient end point
     * @name setFillLinearGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number|Array|Object} endPoint
     * @example
     * // set x and y<br>
     * shape.setFillLinearGradientEndPoint(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setFillLinearGradientEndPoint({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setFillLinearGradientEndPoint([20, 40]);<br><br>
     *
     * // set x and y to the same value<br>
     * shape.setFillLinearGradientEndPoint(5);
     */

     /**
     * set fill linear gradient end point x
     * @name setFillLinearGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill linear gradient end point y
     * @name setFillLinearGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill linear gradient end point
     * @name getFillLinearGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient end point x
     * @name getFillLinearGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient end point y
     * @name getFillLinearGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillRadialGradientStartPoint', 0);

    /**
     * set fill radial gradient start point
     * @name setFillRadialGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number|Array|Object} startPoint
     * @example
     * // set x and y<br>
     * shape.setFillRadialGradientStartPoint(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setFillRadialGradientStartPoint({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setFillRadialGradientStartPoint([20, 40]);<br><br>
     *
     * // set x and y to the same value<br>
     * shape.setFillRadialGradientStartPoint(5);
     */

     /**
     * set fill radial gradient start point x
     * @name setFillRadialGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill radial gradient start point y
     * @name setFillRadialGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill radial gradient start point
     * @name getFillRadialGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient start point x
     * @name getFillRadialGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient start point y
     * @name getFillRadialGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillRadialGradientEndPoint', 0);

    /**
     * set fill radial gradient end point
     * @name setFillRadialGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number|Array|Object} endPoint
     * @example
     * // set x and y<br>
     * shape.setFillRadialGradientEndPoint(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setFillRadialGradientEndPoint({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setFillRadialGradientEndPoint([20, 40]);<br><br>
     *
     * // set x and y to the same value<br>
     * shape.setFillRadialGradientEndPoint(5);
     */

     /**
     * set fill radial gradient end point x
     * @name setFillRadialGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill radial gradient end point y
     * @name setFillRadialGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill radial gradient end point
     * @name getFillRadialGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient end point x
     * @name getFillRadialGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient end point y
     * @name getFillRadialGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'shadowOffset', 0);

    /**
     * set shadow offset
     * @name setShadowOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number|Array|Object} offset
     * @example
     * // set x and y<br>
     * shape.setShadowOffset(20, 40);<br><br>
     *
     * // set x only <br>
     * shape.setShadowOffset({<br>
     *   x: 20<br>
     * });<br><br>
     *
     * // set x and y using an array<br>
     * shape.setShadowOffset([20, 40]);<br><br>
     *
     * // set x and y to the same value<br>
     * shape.setShadowOffset(5);
     */

     /**
     * set shadow offset x
     * @name setShadowOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set shadow offset y
     * @name setShadowOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     */

    /**
     * get shadow offset
     * @name getShadowOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get shadow offset x
     * @name getShadowOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     */

     /**
     * get shadow offset y
     * @name getShadowOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    Kinetic.Factory.addRotationGetterSetter(Kinetic.Shape, 'fillPatternRotation', 0);

    /**
     * set fill pattern rotation in radians
     * @name setFillPatternRotation
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} rotation
     */

    /**
     * set fill pattern rotation in degrees
     * @name setFillPatternRotationDeg
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} rotationDeg
     */

    /**
     * get fill pattern rotation in radians
     * @name getFillPatternRotation
     * @method
     * @memberof Kinetic.Shape.prototype
     */

    /**
     * get fill pattern rotation in degrees
     * @name getFillPatternRotationDeg
     * @method
     * @memberof Kinetic.Shape.prototype
     */

})();
