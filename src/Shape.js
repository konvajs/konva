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
         * @returns {Kinetic.Context}
         */
        getContext: function() {
            return this.getLayer().getContext();
        },
        /**
         * get canvas renderer tied to the layer.  Note that this returns a canvas renderer, not a canvas element
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kinetic.Canvas}
         */
        getCanvas: function() {
            return this.getLayer().getCanvas();
        },
        /**
         * returns whether or not a shadow will be rendered
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Boolean}
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
         * @returns {Boolean}
         */
        hasFill: function() {
            return !!(this.getFill() || this.getFillPatternImage() || this.getFillLinearGradientColorStops() || this.getFillRadialGradientColorStops());
        },
        /**
         * returns whether or not the shape will be stroked
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Boolean}
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
         * @param {Object} point 
         * @param {Number} point.x
         * @param {Number} point.y
         * @returns {Boolean}
         */
        intersects: function(pos) {
            var stage = this.getStage(),
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
         * @returns {Kineitc.Shape}
         */
        enableFill: function() {
            this._setAttr('fillEnabled', true);
            return this;
        },
        /**
         * disable fill
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        disableFill: function() {
            this._setAttr('fillEnabled', false);
            return this;
        },
        /**
         * enable stroke
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        enableStroke: function() {
            this._setAttr('strokeEnabled', true);
            return this;
        },
        /**
         * disable stroke
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        disableStroke: function() {
            this._setAttr('strokeEnabled', false);
            return this;
        },
        /**
         * enable stroke scale
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        enableStrokeScale: function() {
            this._setAttr('strokeScaleEnabled', true);
            return this;
        },
        /**
         * disable stroke scale
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        disableStrokeScale: function() {
            this._setAttr('strokeScaleEnabled', false);
            return this;
        },
        /**
         * enable shadow
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        enableShadow: function() {
            this._setAttr('shadowEnabled', true);
            return this;
        },
        /**
         * disable shadow
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        disableShadow: function() {
            this._setAttr('shadowEnabled', false);
            return this;
        },
        /**
         * enable dash array
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        enableDashArray: function() {
            this._setAttr('dashArrayEnabled', true);
            return this;
        },
        /**
         * disable dash array
         * @method
         * @memberof Kinetic.Shape.prototype
         * @returns {Kineitc.Shape}
         */
        disableDashArray: function() {
            this._setAttr('dashArrayEnabled', false);
            return this;
        },
        // extends Node.prototype.destroy 
        destroy: function() {
            Kinetic.Node.prototype.destroy.call(this);
            delete Kinetic.shapes[this.colorKey];
        },
        _useBufferCanvas: function() {
            return (this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasFill() && this.hasStroke();
        },
        drawScene: function(can) {
            var canvas = can || this.getLayer().getCanvas(),
                context = canvas.getContext(),
                cachedCanvas = this._cache.canvas,
                drawFunc = this.sceneFunc(),
                hasShadow = this.hasShadow(),
                stage, bufferCanvas, bufferContext;

            if(this.isVisible()) { 
                if (cachedCanvas) {
                    this._drawCachedSceneCanvas(context);
                }
                else if (drawFunc) {
                    context.save();
                    // if buffer canvas is needed
                    if (this._useBufferCanvas()) {
                        stage = this.getStage();
                        bufferCanvas = stage.bufferCanvas;
                        bufferContext = bufferCanvas.getContext();
                        bufferContext.clear();
                        bufferContext.save();
                        bufferContext._applyLineJoin(this);
                        bufferContext._applyTransform(this);
                     
                        drawFunc.call(this, bufferContext);
                        bufferContext.restore();

                        if (hasShadow) {
                            context.save();
                            context._applyShadow(this);
                            context.drawImage(bufferCanvas._canvas, 0, 0); 
                            context.restore();
                        }

                        context._applyOpacity(this);
                        context.drawImage(bufferCanvas._canvas, 0, 0);
                    }
                    // if buffer canvas is not needed
                    else {
                        context._applyLineJoin(this);
                        context._applyTransform(this);
               
                        if (hasShadow) {
                            context.save();
                            context._applyShadow(this);
                            drawFunc.call(this, context);
                            context.restore();
                        }   

                        context._applyOpacity(this);
                        drawFunc.call(this, context);
                    }   
                    context.restore(); 
                }
            }

            return this;
        },
        drawHit: function(can) {
            var canvas = can || this.getLayer().hitCanvas,
                context = canvas.getContext(),
                drawFunc = this.hitFunc() || this.sceneFunc(),
                cachedCanvas = this._cache.canvas,
                cachedHitCanvas = cachedCanvas && cachedCanvas.hit;

            if(this.shouldDrawHit()) {
                
                if (cachedHitCanvas) {
                    this._drawCachedHitCanvas(context);
                }
                else if (drawFunc) {
                    context.save();
                    context._applyLineJoin(this);
                    context._applyTransform(this);
                   
                    drawFunc.call(this, context);   
                    context.restore();
                }
                
            }

            return this;
        },
        /**
        * draw hit graph using the cached scene canvas
        * @method
        * @memberof Kinetic.Shape.prototype
        * @param {Integer} alphaThreshold alpha channel threshold that determines whether or not
        *  a pixel should be drawn onto the hit graph.  Must be a value between 0 and 255.  
        *  The default is 0
        * @returns {Kinetic.Shape}
        * @example
        * shape.cache();
        * shape.drawHitFromCache();
        */
        drawHitFromCache: function(alphaThreshold) {
            var threshold = alphaThreshold || 0,
                cachedCanvas = this._cache.canvas,
                sceneCanvas = this._getCachedSceneCanvas(),
                sceneContext = sceneCanvas.getContext(),
                hitCanvas = cachedCanvas.hit,
                hitContext = hitCanvas.getContext(),
                width = sceneCanvas.getWidth(),
                height = sceneCanvas.getHeight(),
                sceneImageData, sceneData, hitImageData, hitData, len, rgbColorKey, i, alpha;

            hitContext.clear();

            //try {
                sceneImageData = sceneContext.getImageData(0, 0, width, height);
                sceneData = sceneImageData.data;
                hitImageData = hitContext.getImageData(0, 0, width, height);
                hitData = hitImageData.data;
                len = sceneData.length;
                rgbColorKey = Kinetic.Util._hexToRgb(this.colorKey);

                // replace non transparent pixels with color key
                for(i = 0; i < len; i += 4) {
                    alpha = sceneData[i + 3];
                    if (alpha > threshold) {
                        hitData[i] = rgbColorKey.r;
                        hitData[i + 1] = rgbColorKey.g;
                        hitData[i + 2] = rgbColorKey.b;
                        hitData[i + 3] = 255;
                    }
                }

                hitContext.putImageData(hitImageData, 0, 0);
            // }
            // catch(e) {
            //     Kinetic.Util.warn('Unable to draw hit graph from cached scene canvas. ' + e.message);
            // }

            return this;
        },
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
     * @returns {Kineitc.Shape}
     */

     /**
     * set stroke color with an object literal
     * @name setStrokeRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     * @returns {Kineitc.Shape}
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
     * @returns {Kineitc.Shape}
     */

     /**
     * set stroke color green component
     * @name setStrokeG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} green
     * @returns {Kineitc.Shape}
     */

     /**
     * set stroke color blue component
     * @name setStrokeB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} blue
     * @returns {Kineitc.Shape}
     */

     /**
     * get stroke color
     * @name getStroke
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} color
     * @returns {Kineitc.Shape}
     */

     /**
     * get stroke color as an object literal
     * @name getStrokeRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

     /**
     * get stroke color red component
     * @name getStrokeR
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Integer}
     */

     /**
     * get stroke color green component
     * @name getStrokeG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Integer}
     */

     /**
     * get stroke color blue component
     * @name getStrokeB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Integer}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'lineJoin');

    /**
     * set line join
     * @name setLineJoin
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} lineJoin.  Can be miter, round, or bevel.  The
     *  default is miter
     * @returns {Kineitc.Shape}
     */

     /**
     * get line join
     * @name getLineJoin
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */


    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'lineCap');

    /**
     * set line cap.  Can be butt, round, or square
     * @name setLineCap
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} lineCap
     * @returns {Kineitc.Shape}
     */

     /**
     * get line cap
     * @name getLineCap
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'strokeWidth');

    /**
     * set stroke width
     * @name setStrokeWidth
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} strokeWidth
     * @returns {Kineitc.Shape}
     */

     /**
     * get stroke width
     * @name getStrokeWidth
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'sceneFunc');

    /**
     * set draw function
     * @name setDrawFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Function} drawFunc drawing function
     * @returns {Kineitc.Shape}
     */

     /**
     * get draw function
     * @name getDrawFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Function}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'hitFunc');

    /**
     * set draw hit function used for hit detection
     * @name setDrawHitFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Function} drawHitFunc drawing function used for hit detection
     * @returns {Kineitc.Shape}
     */

     /**
     * get draw hit function
     * @name getDrawHitFunc
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Function}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'dashArray');

    /**
     * set dash array for stroke.
     * @name setDashArray
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Array} dashArray
     * @example
     *  // stroke dashes will be 10px long and 5 pixels apart<br>
     *  line.setDashArray([10, 5]);<br><br>
     *  
     *  // stroke dashes will be be made up of alternating dashed<br> 
     *  // lines that are 10px long and 20px apart, and dots that have<br> 
     *  // a radius of 5px and are 20px apart<br>
     *  line.setDashArray([10, 20, 0.001, 20]);
     */

     /**
     * get dash array
     * @name getDashArray
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Array}
     */

    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, 'shadowColor');

    /**
     * set shadow color
     * @name setShadowColor
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} color
     * @returns {Kineitc.Shape}
     */

     /**
     * set shadow color with an object literal
     * @name setShadowColorRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     * @returns {Kineitc.Shape}
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
     * @returns {Kineitc.Shape}
     */

     /**
     * set shadow color green component
     * @name setShadowColorG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} green
     * @returns {Kineitc.Shape}
     */

     /**
     * set shadow color blue component
     * @name setShadowColorB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} blue
     * @returns {Kineitc.Shape}
     */

     /**
     * get shadow color
     * @name getShadowColor
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

     /**
     * get shadow color as an object literal
     * @name getShadowColorRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

     /**
     * get shadow color red component
     * @name getShadowColorR
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

     /**
     * get shadow color green component
     * @name getShadowColorG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

     /**
     * get shadow color blue component
     * @name getShadowColorB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'shadowBlur');

    /**
     * set shadow blur
     * @name setShadowBlur
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} blur
     * @returns {Kineitc.Shape}
     */

     /**
     * get shadow blur
     * @name getShadowBlur
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'shadowOpacity');

    /**
     * set shadow opacity
     * @name setShadowOpacity
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} opacity must be a value between 0 and 1
     * @returns {Kineitc.Shape}
     */

     /**
     * get shadow opacity
     * @name getShadowOpacity
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'shadowOffset', 0);

    /**
     * set shadow offset
     * @name setShadowOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} offset
     * @param {Number} offset.x
     * @param {Number} offset.y
     * @returns {Kineitc.Shape}
     * @example
     * // set x and y<br>
     * shape.setShadowOffset({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get shadow offset
     * @name getShadowOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

     /**
     * set shadow offset x
     * @name setShadowOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kineitc.Shape}
     */

     /**
     * get shadow offset x
     * @name getShadowOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

     /**
     * set shadow offset y
     * @name setShadowOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kineitc.Shape}
     */

     /**
     * get shadow offset y
     * @name getShadowOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternImage');

    /**
     * set fill pattern image
     * @name setFillPatternImage
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Image} image object
     * @returns {Kineitc.Shape}
     */

     /**
     * get fill pattern image
     * @name getFillPatternImage
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Image}
     */

    Kinetic.Factory.addColorGetterSetter(Kinetic.Shape, 'fill');

    /**
     * set fill color
     * @name setFill
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {String} color
     * @returns {Kineitc.Shape}
     */

     /**
     * set fill color with an object literal
     * @name setFillRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     * @returns {Kineitc.Shape}
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
     * @returns {Kineitc.Shape}
     */

     /**
     * set fill color green component
     * @name setFillG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} green
     * @returns {Kineitc.Shape}
     */

     /**
     * set fill color blue component
     * @name setFillB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Integer} blue
     * @returns {Kineitc.Shape}
     */

     /**
     * get fill color
     * @name getFill
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

     /**
     * get fill color as an object literal
     * @name getFillRGB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

     /**
     * get fill color red component
     * @name getFillR
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

     /**
     * get fill color green component
     * @name getFillG
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

     /**
     * get fill color blue component
     * @name getFillB
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternX', 0);

    /**
     * set fill pattern x
     * @name setFillPatternX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill pattern x
     * @name getFillPatternX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternY', 0);

    /**
     * set fill pattern y
     * @name setFillPatternY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill pattern y
     * @name getFillPatternY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillLinearGradientColorStops');

    /**
     * set fill linear gradient color stops
     * @name setFillLinearGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Array} colorStops
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill linear gradient color stops
     * @name getFillLinearGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Array} colorStops
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillRadialGradientStartRadius', 0);

    /**
     * set fill radial gradient start radius
     * @name setFillRadialGradientStartRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} radius
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill radial gradient start radius
     * @name getFillRadialGradientStartRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillRadialGradientEndRadius', 0);

    /**
     * set fill radial gradient end radius
     * @name setFillRadialGradientEndRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} radius
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill radial gradient end radius
     * @name getFillRadialGradientEndRadius
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillRadialGradientColorStops');

    /**
     * set fill radial gradient color stops
     * @name setFillRadialGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} colorStops
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill radial gradient color stops
     * @name getFillRadialGradientColorStops
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Array}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPatternRepeat');

    /**
     * set fill pattern repeat
     * @name setFillPatternRepeat
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} repeat can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'no-repeat'
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill pattern repeat
     * @name getFillPatternRepeat
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillEnabled', true);

    /**
     * set fill enabled
     * @name setFillEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill enabled
     * @name getFillEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Boolean}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'strokeEnabled', true);

    /**
     * set stroke enabled
     * @name setStrokeEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     * @returns {Kinetic.Shape}
     */

     /**
     * get stroke enabled
     * @name getStrokeEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Boolean}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'shadowEnabled', true);

    /**
     * set shadow enabled
     * @name setShadowEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     * @returns {Kinetic.Shape}
     */

     /**
     * get shadow enabled
     * @name getShadowEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Boolean}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'dashArrayEnabled', true);

    /**
     * set dash array enabled
     * @name setDashArrayEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     * @returns {Kinetic.Shape}
     */

     /**
     * get dash array enabled
     * @name getDashArrayEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Boolean}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'strokeScaleEnabled', true);

     /**
     * set stroke scale enabled
     * @name setStrokeScaleEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Boolean} enabled
     * @returns {Kinetic.Shape}
     */

     /**
     * get stroke scale enabled
     * @name getStrokeScaleEnabled
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Boolean}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Shape, 'fillPriority', 'color');

    /**
     * set fill priority
     * @name setFillPriority
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} priority can be color, pattern, linear-gradient, or radial-gradient
     *  The default is color.
     * @returns {Kinetic.Shape}
     */

     /**
     * get fill priority
     * @name getFillPriority
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {String}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillPatternOffset', 0);

    /**
     * set fill pattern offset
     * @name setFillPatternOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} offset
     * @param {Number} offset.x
     * @param {Number} offset.y
     * @returns {Kinetic.Shape}
     * @example
     * // set x and y <br>
     * shape.setFillPatternOffset({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get fill pattern offset
     * @name getFillPatternOffset
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

    /**
     * set fill pattern offset x
     * @name setFillPatternOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill pattern offset x
     * @name getFillPatternOffsetX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * set fill pattern offset y
     * @name setFillPatternOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill pattern offset y
     * @name getFillPatternOffsetY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillPatternScale', 1);

    /**
     * set fill pattern scale
     * @name setFillPatternScale
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} scale
     * @param {Number} scale.x
     * @param {Number} scale.y
     * @returns {Kinetic.Shape}
     * @example
     * // set x and y <br>
     * shape.setFillPatternScale({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get fill pattern scale
     * @name getFillPatternScale
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

    /**
     * set fill pattern scale x
     * @name setFillPatternScaleX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill pattern scale x
     * @name getFillPatternScaleX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * set fill pattern scale y
     * @name setFillPatternScaleY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill pattern scale y
     * @name getFillPatternScaleY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillLinearGradientStartPoint', 0);

    /**
     * set fill linear gradient start point
     * @name setFillLinearGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} startPoint
     * @param {Number} startPoint.x
     * @param {Number} startPoint.y
     * @returns {Kinetic.Shape}
     * @example
     * // set x and y <br>
     * shape.setFillLinearGradientStartPoint({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get fill linear gradient start point
     * @name getFillLinearGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

    /**
     * set fill linear gradient start point x
     * @name setFillLinearGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill linear gradient start point x
     * @name getFillLinearGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * set fill linear gradient start point y
     * @name setFillLinearGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill linear gradient start point y
     * @name getFillLinearGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillLinearGradientEndPoint', 0);

    /**
     * set fill linear gradient end point
     * @name setFillLinearGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} endPoint
     * @returns {Kinetic.Shape}
     * @example
     * // set x only <br>
     * shape.setFillLinearGradientEndPoint({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get fill linear gradient end point
     * @name getFillLinearGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

    /**
     * set fill linear gradient end point x
     * @name setFillLinearGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill linear gradient end point x
     * @name getFillLinearGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * set fill linear gradient end point y
     * @name setFillLinearGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill linear gradient end point y
     * @name getFillLinearGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillRadialGradientStartPoint', 0);

    /**
     * set fill radial gradient start point
     * @name setFillRadialGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} startPoint
     * @param {Number} startPoint.x
     * @param {Number} startPoint.y
     * @returns {Kinetic.Shape}
     * @example
     * // set x and y <br>
     * shape.setFillRadialGradientStartPoint({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get fill radial gradient start point
     * @name getFillRadialGradientStartPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

    /**
     * set fill radial gradient start point x
     * @name setFillRadialGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill radial gradient start point x
     * @name getFillRadialGradientStartPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * set fill radial gradient start point y
     * @name setFillRadialGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill radial gradient start point y
     * @name getFillRadialGradientStartPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addPointGetterSetter(Kinetic.Shape, 'fillRadialGradientEndPoint', 0);

    /**
     * set fill radial gradient end point
     * @name setFillRadialGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Object} endPoint
     * @param {Number} endPoint.x
     * @param {Number} endPoint.y
     * @returns {Kinetic.Shape}
     * @example
     * // set x and y <br>
     * shape.setFillRadialGradientEndPoint({<br>
     *   x: 20<br>
     *   y: 10
     * });
     */

    /**
     * get fill radial gradient end point
     * @name getFillRadialGradientEndPoint
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Object}
     */

     /**
     * set fill radial gradient end point x
     * @name setFillRadialGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} x
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill radial gradient end point x
     * @name getFillRadialGradientEndPointX
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * set fill radial gradient end point y
     * @name setFillRadialGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} y
     * @returns {Kinetic.Shape}
     */ 
     
    /**
     * get fill radial gradient end point y
     * @name getFillRadialGradientEndPointY
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addRotationGetterSetter(Kinetic.Shape, 'fillPatternRotation', 0);

    /**
     * set fill pattern rotation in radians
     * @name setFillPatternRotation
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} rotation
     * @returns {Kinetic.Shape}
     */

    /**
     * set fill pattern rotation in degrees
     * @name setFillPatternRotationDeg
     * @method
     * @memberof Kinetic.Shape.prototype
     * @param {Number} rotationDeg
     * @returns {Kinetic.Shape}
     */

    /**
     * get fill pattern rotation in radians
     * @name getFillPatternRotation
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

    /**
     * get fill pattern rotation in degrees
     * @name getFillPatternRotationDeg
     * @method
     * @memberof Kinetic.Shape.prototype
     * @returns {Number}
     */

})();
