(function() {
    /**
     * Shape constructor.  Shapes are primitive objects such as rectangles,
     *  circles, text, lines, etc.
     * @constructor
     * @augments Kinetic.Node
     * @param {Object} config
     * @param {String|Object} [config.fill] can be a string color, a linear gradient object, a radial
     *  gradient object, or a pattern object.
     * @param {Image} [config.fill.image] image object if filling the shape with a pattern
     * @param {Object} [config.fill.offset] pattern offset if filling the shape with a pattern
     * @param {Number} [config.fill.offset.x]
     * @param {Number} [config.fill.offset.y]
     * @param {Object} [config.fill.start] start point if using a linear gradient or
     *  radial gradient fill
     * @param {Number} [config.fill.start.x]
     * @param {Number} [config.fill.start.y]
     * @param {Number} [config.fill.start.radius] start radius if using a radial gradient fill
     * @param {Object} [config.fill.end] end point if using a linear gradient or
     *  radial gradient fill
     * @param {Number} [config.fill.end.x]
     * @param {Number} [config.fill.end.y]
     * @param {Number} [config.fill.end.radius] end radius if using a radial gradient fill
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {String} [config.lineJoin] line join can be miter, round, or bevel.  The default
     *  is miter
     * @param {Object} [config.shadow] shadow object
     * @param {String} [config.shadow.color]
     * @param {Number} [config.shadow.blur]
     * @param {Obect} [config.shadow.blur.offset]
     * @param {Number} [config.shadow.blur.offset.x]
     * @param {Number} [config.shadow.blur.offset.y]
     * @param {Number} [config.shadow.opacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Array} [config.dashArray]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     */
    Kinetic.Shape = function(config) {
        this._initShape(config);
    };

    Kinetic.Shape.prototype = {
        _initShape: function(config) {
            this.nodeType = 'Shape';

            // set colorKey
            var shapes = Kinetic.Global.shapes;
            var key;

            while(true) {
                key = Kinetic.Type._getRandomColorKey();
                if(key && !( key in shapes)) {
                    break;
                }
            }

            this.colorKey = key;
            shapes[key] = this;

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
        _getFillType: function(fill) {
            var type = Kinetic.Type;
            if(!fill) {
                return undefined;
            }
            else if(type._isString(fill)) {
                return 'COLOR';
            }
            else if(fill.image) {
                return 'PATTERN';
            }
            else if(fill.start && fill.end && !fill.start.radius && !fill.end.radius) {
                return 'LINEAR_GRADIENT';
            }
            else if(fill.start && fill.end && type._isNumber(fill.start.radius) && type._isNumber(fill.end.radius)) {
                return 'RADIAL_GRADIENT';
            }
            else {
                return 'UNKNOWN';
            }
        },
        /**
         * set shadow object
         * @name setShadow
         * @methodOf Kinetic.Shape.prototype
         * @param {Object} config
         * @param {String} config.color
         * @param {Number} config.blur
         * @param {Array|Object|Number} config.offset
         * @param {Number} config.opacity
         */
        setShadow: function(config) {
            var type = Kinetic.Type;
            if(config.offset !== undefined) {
                config.offset = type._getXY(config.offset);
            }
            this.setAttr('shadow', type._merge(config, this.getShadow()));
        },
        /**
         * set fill which can be a color, linear gradient object,
         *  radial gradient object, or pattern object
         * @name setFill
         * @methodOf Kinetic.Shape.prototype
         * @param {Object} fill
         */
        setFill: function(fill) {
            var type = Kinetic.Type;
            var oldFill = this.getFill();
            var fillType = this._getFillType(fill);
            var oldFillType = this._getFillType(oldFill);
            var newOrOldFillIsColor = fillType === 'COLOR' || oldFillType === 'COLOR';
            var changedFillType = fillType === oldFillType || fillType === 'UNKNOWN';

            // normalize properties
            if(fill.offset !== undefined) {
                fill.offset = type._getXY(fill.offset);
            }
            if(fill.scale !== undefined) {
                fill.scale = type._getXY(fill.scale);
            }
            if(fill.rotationDeg !== undefined) {
                fill.rotation = type._degToRad(fill.rotationDeg);
            }

            /*
             * merge fill objects if neither the new or old fill
             * is type is COLOR, and if if the fill type has not changed.  Otherwise,
             * overwrite the fill entirely
             */
            if(!newOrOldFillIsColor && changedFillType) {
                fill = type._merge(fill, oldFill);
            }

            this.setAttr('fill', fill);
        },
        /**
         * set width and height
         * @name setSize
         * @methodOf Kinetic.Shape.prototype
         * @param {Number} width
         * @param {Number} height
         */
        setSize: function() {
            var size = Kinetic.Type._getSize(Array.prototype.slice.call(arguments));
            this.setWidth(size.width);
            this.setHeight(size.height);
        },
        /**
         * return shape size
         * @name getSize
         * @methodOf Kinetic.Shape.prototype
         */
        getSize: function() {
            return {
                width: this.getWidth(),
                height: this.getHeight()
            };
        },
        _get: function(selector) {
            return this.nodeType === selector || this.shapeType === selector ? [this] : [];
        },
        /**
         * determines if point is in the shape
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
            var p = hitCanvas.context.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
            return p[3] > 0;
        },
        remove: function() {
            Kinetic.Node.prototype.remove.call(this);
            delete Kinetic.Global.shapes[this.colorKey];
        },
        drawScene: function(canvas) {
            var attrs = this.attrs, drawFunc = attrs.drawFunc, canvas = canvas || this.getLayer().getCanvas(), context = canvas.getContext();

            if(drawFunc && this.isVisible()) {
                var stage = this.getStage(), family = [], parent = this.parent;

                family.unshift(this);
                while(parent) {
                    family.unshift(parent);
                    parent = parent.parent;
                }

                context.save();
                canvas._handlePixelRatio();
                canvas._applyOpacity(this);
                canvas._applyLineJoin(this);
                var len = family.length;
                for(var n = 0; n < len; n++) {
                    var node = family[n], t = node.getTransform(), m = t.getMatrix();
                    context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                }

                drawFunc.call(this, canvas);
                context.restore();
            }
        },
        drawHit: function() {
            var attrs = this.attrs, drawFunc = attrs.drawHitFunc || attrs.drawFunc, canvas = this.getLayer().hitCanvas, context = canvas.getContext();

            if(drawFunc && this.isVisible() && this.isListening()) {
                var stage = this.getStage(), family = [], parent = this.parent;

                family.unshift(this);
                while(parent) {
                    family.unshift(parent);
                    parent = parent.parent;
                }

                context.save();
                canvas._applyLineJoin(this);
                var len = family.length;
                for(var n = 0; n < len; n++) {
                    var node = family[n], t = node.getTransform(), m = t.getMatrix();
                    context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
                }

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
    };
    Kinetic.Global.extend(Kinetic.Shape, Kinetic.Node);

    // add getters and setters
    Kinetic.Node.addGettersSetters(Kinetic.Shape, ['stroke', 'lineJoin', 'lineCap', 'strokeWidth', 'drawFunc', 'drawHitFunc', 'dashArray']);
    Kinetic.Node.addGetters(Kinetic.Shape, ['shadow', 'fill']);

    /**
     * set stroke color
     * @name setStroke
     * @methodOf Kinetic.Shape.prototype
     * @param {String} stroke
     */

    /**
     * set line join
     * @name setLineJoin
     * @methodOf Kinetic.Shape.prototype
     * @param {String} lineJoin.  Can be miter, round, or bevel.  The
     *  default is miter
     */

    /**
     * set stroke width
     * @name setStrokeWidth
     * @methodOf Kinetic.Shape.prototype
     * @param {Number} strokeWidth
     */

    /**
     * set draw function
     * @name setDrawFunc
     * @methodOf Kinetic.Shape.prototype
     * @param {Function} drawFunc drawing function
     */

    /**
     * set draw hit function used for hit detection
     * @name setDrawHitFunc
     * @methodOf Kinetic.Shape.prototype
     * @param {Function} drawHitFunc drawing function used for hit detection
     */

    /**
     * set line cap.  Can be butt, round, or square
     * @name setLineCap
     * @methodOf Kinetic.Shape.prototype
     * @param {String} lineCap
     */

    /**
     * set dash array.
     * @name setDashArray
     * @methodOf Kinetic.Line.prototype
     * @param {Array} dashArray
     *  examples:<br>
     *  [10, 5] dashes are 10px long and 5 pixels apart
     *  [10, 20, 0.001, 20] if using a round lineCap, the line will
     *  be made up of alternating dashed lines that are 10px long
     *  and 20px apart, and dots that have a radius of 5px and are 20px
     *  apart
     */

    /**
     * get stroke color
     * @name getStroke
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get line join
     * @name getLineJoin
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get stroke width
     * @name getStrokeWidth
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get draw function
     * @name getDrawFunc
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get draw hit function
     * @name getDrawHitFunc
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get shadow object
     * @name getShadow
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get fill
     * @name getFill
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get line cap
     * @name getLineCap
     * @methodOf Kinetic.Shape.prototype
     */

    /**
     * get dash array
     * @name getDashArray
     * @methodOf Kinetic.Line.prototype
     */
})();
