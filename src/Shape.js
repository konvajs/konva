///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/**
 * Shape constructor.  Shapes are used to objectify drawing bits of a KineticJS
 * application
 * @constructor
 * @augments Kinetic.Node
 * @param {Object} config
 * @config {String|Object} [fill] can be a string color, a linear gradient object, a radial
 *  gradient object, or a pattern object.
 * @config {String} [stroke] stroke color
 * @config {Number} [strokeWidth] stroke width
 * @config {String} [lineJoin] line join can be "miter", "round", or "bevel".  The default
 *  is "miter"
 * @config {Object} [shadow] shadow object
 * @config {String} [detectionType] shape detection type.  Can be "path" or "pixel".
 *  The default is "path" because it performs better
 */
Kinetic.Shape = function(config) {
    this.setDefaultAttrs({
        detectionType: 'path'
    });

    this.data = [];
    this.nodeType = 'Shape';
    this.appliedShadow = false;

    // call super constructor
    Kinetic.Node.apply(this, [config]);
};
/*
 * Shape methods
 */
Kinetic.Shape.prototype = {
    /**
     * get layer context where the shape is being drawn.  When
     * the shape is being rendered, .getContext() returns the context of the
     * user created layer that contains the shape.  When the event detection
     * engine is determining whether or not an event has occured on that shape,
     * .getContext() returns the context of the invisible path layer.
     */
    getContext: function() {
        return this.tempLayer.getContext();
    },
    /**
     * get shape temp layer canvas
     */
    getCanvas: function() {
        return this.tempLayer.getCanvas();
    },
    /**
     * helper method to stroke the shape and apply
     * shadows if needed
     */
    stroke: function() {
        var go = Kinetic.GlobalObject;
        var appliedShadow = false;
        var context = this.getContext();

        if(this.attrs.stroke || this.attrs.strokeWidth) {
            context.save();
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow();
            }

            var stroke = this.attrs.stroke ? this.attrs.stroke : 'black';
            var strokeWidth = this.attrs.strokeWidth ? this.attrs.strokeWidth : 2;

            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke;
            context.stroke();
            context.restore();
        }

        if(appliedShadow) {
            this.stroke();
        }
    },
    /**
     * helper method to fill the shape with a color, linear gradient,
     * radial gradient, or pattern, and also apply shadows if needed
     * */
    fill: function() {
        var appliedShadow = false;
        var context = this.getContext();
        context.save();

        var fill = this.attrs.fill;

        if(fill) {
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow();
            }

            var s = fill.start;
            var e = fill.end;
            var f = null;

            // color fill
            if( typeof fill == 'string') {
                f = this.attrs.fill;
                context.fillStyle = f;
                context.fill();
            }
            // pattern
            else if(fill.image) {
                var repeat = !fill.repeat ? 'repeat' : fill.repeat;
                f = context.createPattern(fill.image, repeat);

                context.save();

                if(fill.scale) {
                    context.scale(fill.scale.x, fill.scale.y);
                }
                if(fill.offset) {
                    context.translate(fill.offset.x, fill.offset.y);
                }

                context.fillStyle = f;
                context.fill();
                context.restore();
            }
            // linear gradient
            else if(!s.radius && !e.radius) {
                var context = this.getContext();
                var grd = context.createLinearGradient(s.x, s.y, e.x, e.y);
                var colorStops = fill.colorStops;

                // build color stops
                for(var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                f = grd;
                context.fillStyle = f;
                context.fill();
            }
            // radial gradient
            else if((s.radius || s.radius === 0) && (e.radius || e.radius === 0)) {
                var context = this.getContext();
                var grd = context.createRadialGradient(s.x, s.y, s.radius, e.x, e.y, e.radius);
                var colorStops = fill.colorStops;

                // build color stops
                for(var n = 0; n < colorStops.length; n += 2) {
                    grd.addColorStop(colorStops[n], colorStops[n + 1]);
                }
                f = grd;
                context.fillStyle = f;
                context.fill();
            }
            else {
                f = 'black';
                context.fillStyle = f;
                context.fill();
            }
        }
        context.restore();

        if(appliedShadow) {
            this.fill();
        }
    },
    /**
     * helper method to fill text and appy shadows if needed
     * @param {String} text
     */
    fillText: function(text) {
        var appliedShadow = false;
        var context = this.getContext();
        context.save();
        if(this.attrs.textFill) {
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow();
            }
            context.fillStyle = this.attrs.textFill;
            context.fillText(text, 0, 0);
        }
        context.restore();

        if(appliedShadow) {
            this.fillText(text, 0, 0);
        }
    },
    /**
     * helper method to stroke text and apply shadows
     * if needed
     * @param {String} text
     * @param {Number} x
     * @param {Number} y
     */
    strokeText: function(text) {
        var appliedShadow = false;
        var context = this.getContext();
        context.save();
        if(this.attrs.textStroke || this.attrs.textStrokeWidth) {
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow();
            }

            // defaults
            if(!this.attrs.textStroke) {
                this.attrs.textStroke = 'black';
            }
            else if(!this.attrs.textStrokeWidth && this.attrs.textStrokeWidth !== 0) {
                this.attrs.textStrokeWidth = 2;
            }
            context.lineWidth = this.attrs.textStrokeWidth;
            context.strokeStyle = this.attrs.textStroke;
            context.strokeText(text, 0, 0);
        }
        context.restore();

        if(appliedShadow) {
            this.strokeText(text, 0, 0);
        }
    },
    /**
     * helper method to draw an image and apply
     * a shadow if neede
     */
    drawImage: function() {
        var appliedShadow = false;
        var context = this.getContext();
        context.save();
        var a = Array.prototype.slice.call(arguments);

        if(a.length === 5 || a.length === 9) {
            if(this.attrs.shadow && !this.appliedShadow) {
                appliedShadow = this._applyShadow();
            }
            switch(a.length) {
                case 5:
                    context.drawImage(a[0], a[1], a[2], a[3], a[4]);
                    break;
                case 9:
                    context.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
                    break;
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
     */
    applyLineJoin: function() {
        var context = this.getContext();
        if(this.attrs.lineJoin) {
            context.lineJoin = this.attrs.lineJoin;
        }
    },
    /**
     * apply shadow.  return true if shadow was applied
     * and false if it was not
     */
    _applyShadow: function() {
        var context = this.getContext();
        var s = this.attrs.shadow;
        if(s) {
            var aa = this.getAbsoluteAlpha();
            // defaults
            var color = s.color ? s.color : 'black';
            var blur = s.blur ? s.blur : 5;
            var offset = s.offset ? s.offset : {
                x: 0,
                y: 0
            };

            if(s.alpha) {
                context.globalAlpha = s.alpha * aa;
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
     * save shape data when using pixel detection.
     */
    saveData: function() {
        var stage = this.getStage();
        var w = stage.attrs.width;
        var h = stage.attrs.height;

        var bufferLayer = stage.bufferLayer;
        var bufferLayerContext = bufferLayer.getContext();

        bufferLayer.clear();
        this._draw(bufferLayer);

        var imageData = bufferLayerContext.getImageData(0, 0, w, h);
        this.data = imageData.data;
    },
    /**
     * clear shape data
     */
    clearData: function() {
        this.data = [];
    },
    /**
     * determines if point is in the shape
     * @param {Object|Array} point point can be an object containing
     *  an x and y property, or it can be an array with two elements
     *  in which the first element is the x component and the second
     *  element is the y component
     */
    intersects: function() {
        var pos = Kinetic.GlobalObject._getXY(Array.prototype.slice.call(arguments));
        var stage = this.getStage();

        if(this.attrs.detectionType === 'path') {
            var pathLayer = stage.pathLayer;
            var pathLayerContext = pathLayer.getContext();

            this._draw(pathLayer);

            return pathLayerContext.isPointInPath(pos.x, pos.y);
        }
        else {
            var w = stage.attrs.width;
            var alpha = this.data[((w * pos.y) + pos.x) * 4 + 3];
            return (!!alpha);
        }
    },
    _draw: function(layer) {
        if(layer && this.attrs.drawFunc) {
            var stage = layer.getStage();
            var context = layer.getContext();
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

                // center offset
                if(node.attrs.offset.x !== 0 || node.attrs.offset.y !== 0) {
                    t.translate(-1 * node.attrs.offset.x, -1 * node.attrs.offset.y);
                }

                var m = t.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }

            this.tempLayer = layer;

            /*
             * pre styles include alpha, linejoin
             */
            var absAlpha = this.getAbsoluteAlpha();
            if(absAlpha !== 1) {
                context.globalAlpha = absAlpha;
            }
            this.applyLineJoin();

            // draw the shape
            this.appliedShadow = false;
            this.attrs.drawFunc.call(this);
            context.restore();
        }
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);

// add setters and getters
Kinetic.GlobalObject.addSettersGetters(Kinetic.Shape, ['fill', 'stroke', 'lineJoin', 'strokeWidth', 'shadow', 'drawFunc']);

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
 * @name getStrokeColor
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