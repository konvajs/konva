(function() {
    /**
     * Shape constructor.  Shapes are primitive objects such as rectangles,
     *  circles, text, lines, etc.
     * @constructor
     * @augments Kinetic.Node
     * @param {Object} config
     * {{ShapeParams}}
     * {{NodeParams}}
     */
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

    Kinetic.Global.addMethods(Kinetic.Shape, {
        _initShape: function(config) {
            this.nodeType = 'Shape';
            this._fillFunc = _fillFunc;
            this._strokeFunc = _strokeFunc;
            this._fillFuncHit = _fillFuncHit;
            this._strokeFuncHit = _strokeFuncHit;

            // set colorKey
            var shapes = Kinetic.Global.shapes;
            var key;

            while(true) {
                key = Kinetic.Type.getRandomColor();
                if(key && !( key in shapes)) {
                    break;
                }
            }

            this.colorKey = key;
            shapes[key] = this;

            this.createAttrs();
            // call super constructor
            Kinetic.Node.call(this, config);
        },
        /**
         * get canvas context tied to the layer
         * @name getContext
         * @methodOf Kinetic.Shape.prototype
         */
        getContext: function() {
            return this.getLayer().getContext();
        },
        /**
         * get canvas renderer tied to the layer.  Note that this returns a canvas renderer, not a canvas element
         * @name getCanvas
         * @methodOf Kinetic.Shape.prototype
         */
        getCanvas: function() {
            return this.getLayer().getCanvas();
        },
        /**
         * returns whether or not a shadow will be rendered
         * @name hasShadow
         * @methodOf Kinetic.Shape.prototype
         */
        hasShadow: function() {
            return !!(this.getShadowColor() || this.getShadowBlur() || this.getShadowOffsetX() || this.getShadowOffsetY());
        },
        /**
         * returns whether or not a fill is present
         * @name hasFill
         * @methodOf Kinetic.Shape.prototype
         */
        hasFill: function() {
            return !!(this.getFill() || this.getFillPatternImage() || this.getFillLinearGradientColorStops() || this.getFillRadialGradientColorStops());
        },
        _get: function(selector) {
            return this.nodeType === selector || this.shapeType === selector ? [this] : [];
        },
        /**
         * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
         * this method clears a temp hit canvas, and redraws the shape, it performs very poorly if executed many times
         * consecutively.  If possible, it's better to use the stage.getIntersections() method instead
         * @name intersects
         * @methodOf Kinetic.Shape.prototype
         * @param {Object} point point can be an object containing
         *  an x and y property, or it can be an array with two elements
         *  in which the first element is the x component and the second
         *  element is the y component
         */
        intersects: function() {
            var pos = Kinetic.Type._getXY(Array.prototype.slice.call(arguments));
            var stage = this.getStage();
            var hitCanvas = stage.hitCanvas;
            hitCanvas.clear();
            this.drawScene(hitCanvas);
            var p = hitCanvas.context.getImageData(pos.x | 0, pos.y | 0, 1, 1).data;
            return p[3] > 0;
        },
        /**
         * enable fill
         */
        enableFill: function() {
            this.setAttr('fillEnabled', true);
        },
        /**
         * disable fill
         */
        disableFill: function() {
            this.setAttr('fillEnabled', false);
        },
        /**
         * enable stroke
         */
        enableStroke: function() {
            this.setAttr('strokeEnabled', true);
        },
        /**
         * disable stroke
         */
        disableStroke: function() {
            this.setAttr('strokeEnabled', false);
        },
        /**
         * enable stroke scale
         */
        enableStrokeScale: function() {
            this.setAttr('strokeScaleEnabled', true);
        },
        /**
         * disable stroke scale
         */
        disableStrokeScale: function() {
            this.setAttr('strokeScaleEnabled', false);
        },
        /**
         * enable shadow
         */
        enableShadow: function() {
            this.setAttr('shadowEnabled', true);
        },
        /**
         * disable shadow
         */
        disableShadow: function() {
            this.setAttr('shadowEnabled', false);
        },
        /**
         * enable dash array
         */
        enableDashArray: function() {
            this.setAttr('dashArrayEnabled', true);
        },
        /**
         * disable dash array
         */
        disableDashArray: function() {
            this.setAttr('dashArrayEnabled', false);
        },
        /**
         * get shape type.  Ex. 'Circle', 'Rect', 'Text', etc.
         * @name getShapeType
         * @methodOf Kinetic.Shape.prototype
         */
        getShapeType: function() {
            return this.shapeType;
        },
        destroy: function() {
            Kinetic.Node.prototype.destroy.call(this);
            delete Kinetic.Global.shapes[this.colorKey];
        },
        drawScene: function(canvas) {
            var drawFunc = this.getDrawFunc(), 
                canvas = canvas || this.getLayer().getCanvas(), 
                context = canvas.getContext();

            if(drawFunc && this.isVisible()) {
                context.save();
                canvas._applyOpacity(this);
                canvas._applyLineJoin(this);                
                canvas._applyAncestorTransforms(this);
                drawFunc.call(this, canvas);
                context.restore();
            }
        },
        drawHit: function() {
            var attrs = this.getAttrs(), 
                drawFunc = attrs.drawHitFunc || attrs.drawFunc, 
                canvas = this.getLayer().hitCanvas, 
                context = canvas.getContext();

            if(drawFunc && this.shouldDrawHit()) {
                context.save();
                canvas._applyLineJoin(this);
                canvas._applyAncestorTransforms(this);

                drawFunc.call(this, canvas);
                context.restore();
            }
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
    Kinetic.Global.extend(Kinetic.Shape, Kinetic.Node);

    // add getters and setters
    Kinetic.Node.addColorGetterSetter(Kinetic.Shape, 'stroke');

    /**
     * set stroke color
     * @name setStroke
     * @methodOf Kinetic.Shape.prototype
     * @param {String} color
     */

     /**
     * set stroke color with an object literal
     * @name setStrokeRGB
     * @methodOf Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     */

     /**
     * set stroke color red component
     * @name setStrokeR
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} red
     */

     /**
     * set stroke color green component
     * @name setStrokeG
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} green
     */

     /**
     * set stroke color blue component
     * @name setStrokeB
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} blue
     */

     /**
     * get stroke color
     * @name getStroke
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get stroke color as an object literal
     * @name getStrokeRGB
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get stroke color red component
     * @name getStrokeR
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get stroke color green component
     * @name getStrokeG
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get stroke color blue component
     * @name getStrokeB
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'lineJoin');

    /**
     * set line join
     * @name setLineJoin
     * @methodOf Kinetic.Shape.prototype
     * @param {String} lineJoin.  Can be miter, round, or bevel.  The
     *  default is miter
     */

     /**
     * get line join
     * @name getLineJoin
     * @methodOf Kinetic.Shape.prototype
     */


    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'lineCap');

    /**
     * set line cap.  Can be butt, round, or square
     * @name setLineCap
     * @methodOf Kinetic.Shape.prototype
     * @param {String} lineCap
     */

     /**
     * get line cap
     * @name getLineCap
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'strokeWidth');

    /**
     * set stroke width
     * @name setStrokeWidth
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} strokeWidth
     */

     /**
     * get stroke width
     * @name getStrokeWidth
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'drawFunc');

    /**
     * set draw function
     * @name setDrawFunc
     * @methodOf Kinetic.Shape.prototype
     * @param {Function} drawFunc drawing function
     */

     /**
     * get draw function
     * @name getDrawFunc
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'drawHitFunc');

    /**
     * set draw hit function used for hit detection
     * @name setDrawHitFunc
     * @methodOf Kinetic.Shape.prototype
     * @param {Function} drawHitFunc drawing function used for hit detection
     */

     /**
     * get draw hit function
     * @name getDrawHitFunc
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'dashArray');

    /**
     * set dash array.
     * @name setDashArray
     * @methodOf Kinetic.Shape.prototype
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
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addColorGetterSetter(Kinetic.Shape, 'shadowColor');

    /**
     * set shadow color
     * @name setShadowColor
     * @methodOf Kinetic.Shape.prototype
     * @param {String} color
     */

     /**
     * set shadow color with an object literal
     * @name setShadowColorRGB
     * @methodOf Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     */

     /**
     * set shadow color red component
     * @name setShadowColorR
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} red
     */

     /**
     * set shadow color green component
     * @name setShadowColorG
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} green
     */

     /**
     * set shadow color blue component
     * @name setShadowColorB
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} blue
     */

     /**
     * get shadow color
     * @name getShadowColor
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get shadow color as an object literal
     * @name getShadowColorRGB
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get shadow color red component
     * @name getShadowColorR
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get shadow color green component
     * @name getShadowColorG
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get shadow color blue component
     * @name getShadowColorB
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'shadowBlur');

    /**
     * set shadow blur
     * @name setShadowBlur
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} blur
     */

     /**
     * get shadow blur
     * @name getShadowBlur
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'shadowOpacity');

    /**
     * set shadow opacity
     * @name setShadowOpacity
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} opacity must be a value between 0 and 1
     */

     /**
     * get shadow opacity
     * @name getShadowOpacity
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillPatternImage');

    /**
     * set fill pattern image
     * @name setFillPatternImage
     * @methodOf Kinetic.Shape.prototype
     * @param {Image} image object
     */

     /**
     * get fill pattern image
     * @name getFillPatternImage
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addColorGetterSetter(Kinetic.Shape, 'fill');

    /**
     * set fill color
     * @name setFill
     * @methodOf Kinetic.Shape.prototype
     * @param {String} color
     */

     /**
     * set fill color with an object literal
     * @name setFillRGB
     * @methodOf Kinetic.Shape.prototype
     * @param {Obect} color requires an object literal containing an r, g, and b component
     */

     /**
     * set fill color red component
     * @name setFillR
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} red
     */

     /**
     * set fill color green component
     * @name setFillG
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} green
     */

     /**
     * set fill color blue component
     * @name setFillB
     * @methodOf Kinetic.Shape.prototype
     * @param {Integer} blue
     */

     /**
     * get fill color
     * @name getFill
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill color as an object literal
     * @name getFillRGB
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill color red component
     * @name getFillR
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill color green component
     * @name getFillG
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill color blue component
     * @name getFillB
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillPatternX');

    /**
     * set fill pattern x
     * @name setFillPatternX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * get fill pattern x
     * @name getFillPatternX
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillPatternY');

    /**
     * set fill pattern y
     * @name setFillPatternY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill pattern y
     * @name getFillPatternY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillLinearGradientColorStops');

    /**
     * set fill linear gradient color stops
     * @name setFillLinearGradientColorStops
     * @methodOf Kinetic.Shape.prototype
     * @param {Array} colorStops
     */

     /**
     * get fill linear gradient color stops
     * @name getFillLinearGradientColorStops
     * @methodOf Kinetic.Shape.prototype
     * @param {Array} colorStops
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillRadialGradientStartRadius');

    /**
     * set fill radial gradient start radius
     * @name setFillRadialGradientStartRadius
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} radius
     */

     /**
     * get fill radial gradient start radius
     * @name getFillRadialGradientStartRadius
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillRadialGradientEndRadius');

    /**
     * set fill radial gradient end radius
     * @name setFillRadialGradientEndRadius
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} radius
     */

     /**
     * get fill radial gradient end radius
     * @name getFillRadialGradientEndRadius
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillRadialGradientColorStops');

    /**
     * set fill radial gradient color stops
     * @name setFillRadialGradientColorStops
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} colorStops
     */

     /**
     * get fill radial gradient color stops
     * @name getFillRadialGradientColorStops
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillPatternRepeat');

    /**
     * set fill pattern repeat
     * @name setFillPatternRepeat
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} repeat can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'no-repeat'
     */

     /**
     * get fill pattern repeat
     * @name getFillPatternRepeat
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillEnabled', true);

    /**
     * set fill enabled
     * @name setFillEnabled
     * @methodOf Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get fill enabled
     * @name getFillEnabled
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'strokeEnabled', true);

    /**
     * set stroke enabled
     * @name setStrokeEnabled
     * @methodOf Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get stroke enabled
     * @name getStrokeEnabled
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'shadowEnabled', true);

    /**
     * set shadow enabled
     * @name setShadowEnabled
     * @methodOf Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get shadow enabled
     * @name getShadowEnabled
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'dashArrayEnabled', true);

    /**
     * set dash array enabled
     * @name setDashArrayEnabled
     * @methodOf Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get dash array enabled
     * @name getDashArrayEnabled
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'fillPriority', 'color');

    /**
     * set fill priority
     * @name setFillPriority
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} priority can be color, pattern, linear-gradient, or radial-gradient
     *  The default is color.
     */

     /**
     * get fill priority
     * @name getFillPriority
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Shape, 'strokeScaleEnabled', true);

     /**
     * set stroke scale enabled
     * @name setStrokeScaleEnabled
     * @methodOf Kinetic.Shape.prototype
     * @param {Boolean} enabled
     */

     /**
     * get stroke scale enabled
     * @name getStrokeScaleEnabled
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'fillPatternOffset', 0);

    /**
     * set fill pattern offset
     * @name setFillPatternOffset
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} offset
     */

     /**
     * set fill pattern offset x
     * @name setFillPatternOffsetX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill pattern offset y
     * @name setFillPatternOffsetY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill pattern offset
     * @name getFillPatternOffset
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill pattern offset x
     * @name getFillPatternOffsetX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill pattern offset y
     * @name getFillPatternOffsetY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'fillPatternScale', 1);

    /**
     * set fill pattern scale
     * @name setFillPatternScale
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} scale
     */

     /**
     * set fill pattern scale x
     * @name setFillPatternScaleX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill pattern scale y
     * @name setFillPatternScaleY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill pattern scale
     * @name getFillPatternScale
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill pattern scale x
     * @name getFillPatternScaleX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill pattern scale y
     * @name getFillPatternScaleY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'fillLinearGradientStartPoint', 0);

    /**
     * set fill linear gradient start point
     * @name setFillLinearGradientStartPoint
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} startPoint
     */

     /**
     * set fill linear gradient start point x
     * @name setFillLinearGradientStartPointX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill linear gradient start point y
     * @name setFillLinearGradientStartPointY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill linear gradient start point
     * @name getFillLinearGradientStartPoint
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient start point x
     * @name getFillLinearGradientStartPointX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient start point y
     * @name getFillLinearGradientStartPointY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'fillLinearGradientEndPoint', 0);

    /**
     * set fill linear gradient end point
     * @name setFillLinearGradientEndPoint
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} endPoint
     */

     /**
     * set fill linear gradient end point x
     * @name setFillLinearGradientEndPointX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill linear gradient end point y
     * @name setFillLinearGradientEndPointY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill linear gradient end point
     * @name getFillLinearGradientEndPoint
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient end point x
     * @name getFillLinearGradientEndPointX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill linear gradient end point y
     * @name getFillLinearGradientEndPointY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'fillRadialGradientStartPoint', 0);

    /**
     * set fill radial gradient start point
     * @name setFillRadialGradientStartPoint
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} startPoint
     */

     /**
     * set fill radial gradient start point x
     * @name setFillRadialGradientStartPointX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill radial gradient start point y
     * @name setFillRadialGradientStartPointY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill radial gradient start point
     * @name getFillRadialGradientStartPoint
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient start point x
     * @name getFillRadialGradientStartPointX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient start point y
     * @name getFillRadialGradientStartPointY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'fillRadialGradientEndPoint', 0);

    /**
     * set fill radial gradient end point
     * @name setFillRadialGradientEndPoint
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} endPoint
     */

     /**
     * set fill radial gradient end point x
     * @name setFillRadialGradientEndPointX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set fill radial gradient end point y
     * @name setFillRadialGradientEndPointY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

     /**
     * get fill radial gradient end point
     * @name getFillRadialGradientEndPoint
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient end point x
     * @name getFillRadialGradientEndPointX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get fill radial gradient end point y
     * @name getFillRadialGradientEndPointY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Shape, 'shadowOffset', 0);

    /**
     * set shadow offset
     * @name setShadowOffset
     * @methodOf Kinetic.Shape.prototype
     * @param {Number|Array|Object} offset
     */

     /**
     * set shadow offset x
     * @name setShadowOffsetX
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} x
     */

     /**
     * set shadow offset y
     * @name setShadowOffsetY
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} y
     */

    /**
     * get shadow offset
     * @name getShadowOffset
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get shadow offset x
     * @name getShadowOffsetX
     * @methodOf Kinetic.Shape.prototype
     */

     /**
     * get shadow offset y
     * @name getShadowOffsetY
     * @methodOf Kinetic.Shape.prototype
     */

    Kinetic.Node.addRotationGetterSetter(Kinetic.Shape, 'fillPatternRotation', 0);

    /**
     * set fill pattern rotation in radians
     * @name setFillPatternRotation
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} rotation
     */

    /**
     * set fill pattern rotation in degrees
     * @name setFillPatternRotationDeg
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} rotationDeg
     */

    /**
     * get fill pattern rotation in radians
     * @name getFillPatternRotation
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get fill pattern rotation in degrees
     * @name getFillPatternRotationDeg
     * @methodOf Kinetic.Shape.prototype
     */

})();
