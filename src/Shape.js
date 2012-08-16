///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
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
Kinetic.Shape = Kinetic.Node.extend({
    init: function(config) {
        this.nodeType = 'Shape';
        this.appliedShadow = false;

        // call super constructor
        this._super(config);
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
     * helper method to stroke the shape and apply
     * shadows if needed
     * @name stroke
     * @methodOf Kinetic.Shape.prototype
     */
    stroke: function(context) {
        var strokeWidth = this.getStrokeWidth();
        var stroke = this.getStroke();
        if(stroke || strokeWidth) {
            var go = Kinetic.Global;
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
    /**
     * helper method to fill the shape with a color, linear gradient,
     * radial gradient, or pattern, and also apply shadows if needed
     * @name fill
     * @methodOf Kinetic.Shape.prototype
     * */
    fill: function(context) {
        var appliedShadow = false;
        var fill = this.attrs.fill;
        if(fill) {
            context.save();
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow(context);
            }

            var s = fill.start;
            var e = fill.end;
            var f = null;

            // color fill
            if(Kinetic.Type._isString(fill)) {
                context.fillStyle = fill;
                context.fill(context);
            }
            // pattern
            else if(fill.image) {
                var repeat = !fill.repeat ? 'repeat' : fill.repeat;
                if(fill.scale) {
                    context.scale(fill.scale.x, fill.scale.y);
                }
                if(fill.offset) {
                    context.translate(fill.offset.x, fill.offset.y);
                }

                context.fillStyle = context.createPattern(fill.image, repeat);
                context.fill(context);
            }
            // linear gradient
            else if(!s.radius && !e.radius) {
                var grd = context.createLinearGradient(s.x, s.y, e.x, e.y);
                var colorStops = fill.colorStops;

                // build color stops
                for(var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                context.fillStyle = grd;
                context.fill(context);
            }
            // radial gradient
            else if((s.radius || s.radius === 0) && (e.radius || e.radius === 0)) {
                var grd = context.createRadialGradient(s.x, s.y, s.radius, e.x, e.y, e.radius);
                var colorStops = fill.colorStops;

                // build color stops
                for(var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                context.fillStyle = grd;
                context.fill(context);
            }
            else {
                context.fillStyle = 'black';
                context.fill(context);
            }
            context.restore();
        }

        if(appliedShadow) {
            this.fill(context);
        }
    },
    /**
     * helper method to fill text and appy shadows if needed
     * @param {String} text
     * @name fillText
     * @methodOf Kinetic.Shape.prototype
     */
    fillText: function(context, text) {
        var appliedShadow = false;
        if(this.attrs.textFill) {
            context.save();
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow(context);
            }
            context.fillStyle = this.attrs.textFill;
            context.fillText(text, 0, 0);
            context.restore();
        }
        if(appliedShadow) {
            this.fillText(context, text, 0, 0);
        }
    },
    /**
     * helper method to stroke text and apply shadows
     * if needed
     * @name strokeText
     * @methodOf Kinetic.Shape.prototype
     * @param {String} text
     */
    strokeText: function(context, text) {
        var appliedShadow = false;

        if(this.attrs.textStroke || this.attrs.textStrokeWidth) {
            context.save();
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow(context);
            }
            // defaults
            var textStroke = this.attrs.textStroke ? this.attrs.textStroke : 'black';
            var textStrokeWidth = this.attrs.textStrokeWidth ? this.attrs.textStrokeWidth : 2;
            context.lineWidth = textStrokeWidth;
            context.strokeStyle = textStroke;
            context.strokeText(text, 0, 0);
            context.restore();
        }

        if(appliedShadow) {
            this.strokeText(context, text, 0, 0);
        }
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
    /**
     * helper method to set the line join of a shape
     * based on the lineJoin property
     * @name applyLineJoin
     * @methodOf Kinetic.Shape.prototype
     */
    applyLineJoin: function(context) {
        if(this.attrs.lineJoin) {
            context.lineJoin = this.attrs.lineJoin;
        }
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

        // TODO: need to re-implement

        // default
        return false;
    },
    _draw: function(canvas) {
        if(this.attrs.drawFunc) {
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

            /*
             * pre styles include opacity, linejoin
             */
            var absOpacity = this.getAbsoluteOpacity();
            if(absOpacity !== 1) {
                context.globalAlpha = absOpacity;
            }
            this.applyLineJoin(context);

            // draw the shape
            this.appliedShadow = false;

            var wl = Kinetic.Global.BUFFER_WHITELIST;
            var bl = Kinetic.Global.BUFFER_BLACKLIST;
            var attrs = {};

            if(canvas.name === 'buffer') {
 
                for(var n = 0; n < wl.length; n++) {
                    var key = wl[n];
                    attrs[key] = this.attrs[key];
                    if(this.attrs[key]) {
                        this.attrs[key] = '#' + this.colorKey;
                    }
                }
                
                if('image' in this.attrs) {
                    this.attrs.fill = '#' + this.colorKey;
                }
                
                for(var n = 0; n < bl.length; n++) {
                    var key = bl[n];
                    attrs[key] = this.attrs[key];
                    this.attrs[key] = '';
                }

                context.globalAlpha = 1;
            }

            this.attrs.drawFunc.call(this, canvas.getContext());

            if(canvas.name === 'buffer') {
                var bothLists = wl.concat(bl);
                for(var n = 0; n < bothLists.length; n++) {
                    var key = bothLists[n];
                    this.attrs[key] = attrs[key];
                }
            }

            context.restore();
        }
    }
});

// add getters and setters
Kinetic.Node.addGettersSetters(Kinetic.Shape, ['fill', 'stroke', 'lineJoin', 'strokeWidth', 'shadow', 'drawFunc', 'filter']);

/**
 * set fill which can be a color, linear gradient object,
 *  radial gradient object, or pattern object
 * @name setFill
 * @methodOf Kinetic.Shape.prototype
 * @param {String|Object} fill
 */

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
 * set shadow object
 * @name setShadow
 * @methodOf Kinetic.Shape.prototype
 * @param {Object} config
 */

/**
 * set draw function
 * @name setDrawFunc
 * @methodOf Kinetic.Shape.prototype
 * @param {Function} drawFunc drawing function
 */

/**
 * get fill
 * @name getFill
 * @methodOf Kinetic.Shape.prototype
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
 * get shadow object
 * @name getShadow
 * @methodOf Kinetic.Shape.prototype
 */

/**
 * get draw function
 * @name getDrawFunc
 * @methodOf Kinetic.Shape.prototype
 */