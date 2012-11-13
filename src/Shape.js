/**
 * Shape constructor.  Shapes are primitive objects such as rectangles,
 *  circles, text, lines, etc.
 * @constructor
 * @augments Kinetic.Node
 * @param {Object} config
 * @config {String|Object} [config.fill] can be a string color, a linear gradient object, a radial
 *  gradient object, or a pattern object.
 * @config {Image} [config.fill.image] image object if filling the shape with a pattern
 * @config {Object} [config.fill.offset] pattern offset if filling the shape with a pattern
 * @config {Number} [config.fill.offset.x]
 * @config {Number} [config.fill.offset.y]
 * @config {Object} [config.fill.start] start point if using a linear gradient or
 *  radial gradient fill
 * @config {Number} [config.fill.start.x]
 * @config {Number} [config.fill.start.y]
 * @config {Number} [config.fill.start.radius] start radius if using a radial gradient fill
 * @config {Object} [config.fill.end] end point if using a linear gradient or
 *  radial gradient fill
 * @config {Number} [config.fill.end.x]
 * @config {Number} [config.fill.end.y]
 * @config {Number} [config.fill.end.radius] end radius if using a radial gradient fill
 * @config {String} [config.stroke] stroke color
 * @config {Number} [config.strokeWidth] stroke width
 * @config {String} [config.lineJoin] line join can be miter, round, or bevel.  The default
 *  is miter
 * @config {Object} [config.shadow] shadow object
 * @config {String} [config.shadow.color]
 * @config {Number} [config.shadow.blur]
 * @config {Obect} [config.shadow.blur.offset]
 * @config {Number} [config.shadow.blur.offset.x]
 * @config {Number} [config.shadow.blur.offset.y]
 * @config {Number} [config.shadow.opacity] shadow opacity.  Can be any real number
 *  between 0 and 1
 * @param {Number} [config.x]
 * @param {Number} [config.y]
 * @param {Boolean} [config.visible]
 * @param {Boolean} [config.listening] whether or not the node is listening for events
 * @param {String} [config.id] unique id
 * @param {String} [config.name] non-unique name
 * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
 * @param {Object} [config.scale]
 * @param {Number} [config.scale.x]
 * @param {Number} [config.scale.y]
 * @param {Number} [config.rotation] rotation in radians
 * @param {Number} [config.rotationDeg] rotation in degrees
 * @param {Object} [config.offset] offsets default position point and rotation point
 * @param {Number} [config.offset.x]
 * @param {Number} [config.offset.y]
 * @param {Boolean} [config.draggable]
 * @param {String} [config.dragConstraint] can be vertical, horizontal, or none.  The default
 *  is none
 * @param {Object} [config.dragBounds]
 * @param {Number} [config.dragBounds.top]
 * @param {Number} [config.dragBounds.right]
 * @param {Number} [config.dragBounds.bottom]
 * @param {Number} [config.dragBounds.left]
 */
Kinetic.Shape = function(config) {
    this._initShape(config);
};

Kinetic.Shape.prototype = {
    _initShape: function(config) {
        this.nodeType = 'Shape';
        this.appliedShadow = false;

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
     * get canvas tied to the layer
     * @name getCanvas
     * @methodOf Kinetic.Shape.prototype
     */
    getCanvas: function() {
        return this.getLayer().getCanvas();
    },
    /**
     * helper method to stroke the shape
     * @name stroke
     * @methodOf Kinetic.Shape.prototype
     */
    stroke: function(context) {
        if(context.type === 'scene') {
            this._strokeScene(context);
        }
        else if(context.type === 'buffer') {
            this._strokeBuffer(context);
        }
    },
    _strokeScene: function(context) {
        var strokeWidth = this.getStrokeWidth(), stroke = this.getStroke();
        if(stroke || strokeWidth) {
            var appliedShadow = false;

            context.save();
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow(context);
            }

            context.lineWidth = strokeWidth || 2;
            context.strokeStyle = stroke || 'black';
            context.stroke(context);
            context.restore();

            if(appliedShadow) {
                this.stroke(context);
            }
        }
    },
    _strokeBuffer: function(context) {
        var strokeWidth = this.getStrokeWidth(), stroke = this.colorKey;
        if(stroke || strokeWidth) {
            context.save();
            context.lineWidth = strokeWidth || 2;
            context.strokeStyle = stroke || 'black';
            context.stroke(context);
            context.restore();
        }
    },
    _getFillType: function(fill) {
        if(!fill) {
            return undefined;
        }
        else if(Kinetic.Type._isString(fill)) {
            return 'COLOR';
        }
        else if(fill.image) {
            return 'PATTERN';
        }
        else if(fill.start && fill.end && !fill.start.radius && !fill.end.radius) {
            return 'LINEAR_GRADIENT';
        }
        else if(fill.start && fill.end && Kinetic.Type._isNumber(fill.start.radius) && Kinetic.Type._isNumber(fill.end.radius)) {
            return 'RADIAL_GRADIENT';
        }
        else {
            return 'UNKNOWN';
        }
    },
    /**
     * helper method to fill the shape
     * @name fill
     * @methodOf Kinetic.Shape.prototype
     * */
    fill: function(context) {
        if(context.type === 'scene') {
            this._fillScene(context);
        }
        else if(context.type === 'buffer') {
            this._fillBuffer(context);
        }
    },
    _fillScene: function(context) {
        var appliedShadow = false, fill = this.getFill(), fillType = this._getFillType(fill);
        if(fill) {
            context.save();
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow(context);
            }

            var s = fill.start;
            var e = fill.end;

            // color fill
            switch(fillType) {
                case 'COLOR':
                    context.fillStyle = fill;
                    context.fill(context);
                    break;
                case 'PATTERN':
                    var repeat = !fill.repeat ? 'repeat' : fill.repeat;
                    if(fill.scale) {
                        context.scale(fill.scale.x, fill.scale.y);
                    }
                    if(fill.offset) {
                        context.translate(fill.offset.x, fill.offset.y);
                    }

                    context.fillStyle = context.createPattern(fill.image, repeat);
                    context.fill(context);
                    break;
                case 'LINEAR_GRADIENT':
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
        }

        if(appliedShadow) {
            this.fill(context);
        }
    },
    _fillBuffer: function(context) {
        context.save();
        context.fillStyle = this.colorKey;
        context.fill(context);
        context.restore();
    },
    /**
     * helper method to draw an image and apply
     * a shadow if neede
     * @name drawImage
     * @methodOf Kinetic.Shape.prototype
     */
    drawImage: function() {
        var appliedShadow = false;
        var context = arguments[0];
        context.save();
        var a = Array.prototype.slice.call(arguments);

        if(a.length === 6 || a.length === 10) {
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow(context);
            }

            if(a.length === 6) {
                context.drawImage(a[1], a[2], a[3], a[4], a[5]);
            }
            else {
                context.drawImage(a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
            }
        }

        context.restore();

        if(appliedShadow) {
            this.drawImage.apply(this, a);
        }
    },
    applyOpacity: function(context) {
        var absOpacity = this.getAbsoluteOpacity();
        if(absOpacity !== 1) {
            context.globalAlpha = absOpacity;
        }
    },
    /**
     * helper method to set the line join of a shape
     * based on the applyLineJoin property
     * @name lineJoin
     * @methodOf Kinetic.Shape.prototype
     */
    applyLineJoin: function(context) {
        if(this.attrs.lineJoin) {
            context.lineJoin = this.attrs.lineJoin;
        }
    },
    /**
     * helper method to set the line cap of a path
     * based on the lineCap property
     * @name applyLineCap
     * @methodOf Kinetic.Shape.prototype
     */
    applyLineCap: function(context) {
        if(this.attrs.lineCap) {
            context.lineCap = this.attrs.lineCap;
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
        if(config.offset !== undefined) {
            config.offset = Kinetic.Type._getXY(config.offset);
        }
        this.setAttr('shadow', Kinetic.Type._merge(config, this.getShadow()));
    },
    /**
     * set fill which can be a color, linear gradient object,
     *  radial gradient object, or pattern object
     * @name setFill
     * @methodOf Kinetic.Shape.prototype
     * @param {String|Object} fill
     */
    setFill: function(fill) {
        var oldFill = this.getFill();
        var fillType = this._getFillType(fill);
        var oldFillType = this._getFillType(oldFill);
        var newOrOldFillIsColor = fillType === 'COLOR' || oldFillType === 'COLOR';
        var changedFillType = fillType === oldFillType || fillType === 'UNKNOWN';

        // if fill.offset is defined, normalize the xy value
        if(fill.offset !== undefined) {
            fill.offset = Kinetic.Type._getXY(fill.offset);
        }

        /*
         * merge fill objects if neither the new or old fill
         * is type is COLOR, and if if the fill type has not changed.  Otherwise,
         * overwrite the fill entirely
         */
        if(!newOrOldFillIsColor && changedFillType) {
            fill = Kinetic.Type._merge(fill, oldFill);
        }

        this.setAttr('fill', fill);
    },
    /**
     * set width and height
     * @name setSize
     * @methodOf Kinetic.Shape.prototype
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
     * apply shadow.  return true if shadow was applied
     * and false if it was not
     */
    _applyShadow: function(context) {
        var s = this.attrs.shadow;
        if(s) {
            var aa = this.getAbsoluteOpacity();
            // defaults
            var color = s.color ? s.color : 'black';
            var blur = s.blur ? s.blur : 5;
            var offset = s.offset ? s.offset : {
                x: 0,
                y: 0
            };

            if(s.opacity) {
                context.globalAlpha = s.opacity * aa;
            }
            context.shadowColor = color;
            context.shadowBlur = blur;
            context.shadowOffsetX = offset.x;
            context.shadowOffsetY = offset.y;
            this.appliedShadow = true;
            return true;
        }

        return false;
    },
    /**
     * determines if point is in the shape
     * @param {Object|Array} point point can be an object containing
     *  an x and y property, or it can be an array with two elements
     *  in which the first element is the x component and the second
     *  element is the y component
     */
    intersects: function() {
        var pos = Kinetic.Type._getXY(Array.prototype.slice.call(arguments));
        var stage = this.getStage();
        var bufferCanvas = stage.bufferCanvas;
        bufferCanvas.clear();
        this.draw(bufferCanvas);
        var p = bufferCanvas.context.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
        return p[3] > 0;
    },
    remove: function() {
        Kinetic.Node.prototype.remove.call(this);
        delete Kinetic.Global.shapes[this.colorKey];
    },
    draw: function(canvas) {
        if(this.attrs.drawFunc && Kinetic.Node.prototype._shouldDraw.call(this, canvas)) {
            var stage = this.getStage();
            var context = canvas.getContext();
            var family = [];
            var parent = this.parent;

            family.unshift(this);
            while(parent) {
                family.unshift(parent);
                parent = parent.parent;
            }

            context.save();
            for(var n = 0; n < family.length; n++) {
                var node = family[n];
                var t = node.getTransform();
                var m = t.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }

            var type = canvas.getContext().type;

            if(type === 'scene') {
                this.applyOpacity(context);
            }

            this.applyLineJoin(context);
            this.applyLineCap(context);

            // draw the shape
            this.appliedShadow = false;

            var drawFunc = (type === 'buffer' && this.attrs.drawBufferFunc) ? this.attrs.drawBufferFunc : this.attrs.drawFunc;

            drawFunc.call(this, canvas.getContext());
            context.restore();
        }
    }
};
Kinetic.Global.extend(Kinetic.Shape, Kinetic.Node);

// add getters and setters
Kinetic.Node.addGettersSetters(Kinetic.Shape, ['stroke', 'lineJoin', 'strokeWidth', 'drawFunc', 'cornerRadius']);
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
 * set corner radius
 * @name setCornerRadius
 * @methodOf Kinetic.Shape.prototype
 * @param {Number} corner radius
 */

/**
 * set line cap.  Can be butt, round, or square
 * @name setLineCap
 * @methodOf Kinetic.Shape.prototype
 * @param {String} lineCap
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
 * get corner radius
 * @name getCornerRadius
 * @methodOf Kinetic.Shape.prototype
 */

/**
 * get draw function
 * @name getDrawFunc
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