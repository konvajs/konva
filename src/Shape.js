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
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined,
        lineJoin: undefined,
        detectionType: 'path',
        shadow: {
            blur: 5,
            alpha: 1
        }
    });

    this.data = [];
    this.nodeType = 'Shape';

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
        if(this.tempLayer === undefined) {
            return null;
        }
        else {
            return this.tempLayer.getContext();
        }
    },
    /**
     * get shape temp layer canvas
     */
    getCanvas: function() {
        return this.tempLayer.getCanvas();
    },
    /**
     * helper method to stroke shape
     */
    stroke: function() {
        var context = this.getContext();

        if(!!this.attrs.stroke || !!this.attrs.strokeWidth) {
            var stroke = !!this.attrs.stroke ? this.attrs.stroke : 'black';
            var strokeWidth = !!this.attrs.strokeWidth ? this.attrs.strokeWidth : 2;

            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke;
            context.stroke();
        }
    },
    /**
     * applies shadow, fill, and stroke
     */
    applyStyles: function() {
        var context = this.getContext();
        var aa = this.getAbsoluteAlpha();

        /*
         * if fill is defined, apply shadow to
         * fill only and not the stroke
         */
        if(!!this.attrs.fill) {
            var sa = this.attrs.shadow.alpha;

            context.save();

            if(sa === 1) {
                this.applyShadow();
                this.fill();
            }
            else {
                context.save();
                context.globalAlpha = sa * aa;
                this.applyShadow();
                this.fill();
                context.restore();
                this.fill();
            }

            context.restore();
            this.stroke();
        }
        /*
         * if fill is not defined, apply the shadow
         * to the stroke
         */
        else {
            if(sa === 1) {
                this.applyShadow();
                this.stroke();
            }
            else {
                context.save();
                context.globalAlpha = sa * aa;
                this.applyShadow();
                this.stroke();
                context.restore();
                this.stroke();
            }
        }
    },
    /**
     * helper method to fill the shape with a color, linear gradient,
     * radial gradient, or pattern
     */
    fill: function() {
        var context = this.getContext();
        var fill = this.attrs.fill;
        if(!!fill) {
            var s = fill.start;
            var e = fill.end;
            var f = null;

            // color fill
            if( typeof fill == 'string') {
                f = this.attrs.fill;
                context.fillStyle = f;
                context.fill();
            }
            // pattern fill
            else if(fill.image !== undefined) {
                var repeat = fill.repeat === undefined ? 'repeat' : fill.repeat;
                f = context.createPattern(fill.image, repeat);

                context.save();
                context.translate(fill.offset.x, fill.offset.y);
                context.fillStyle = f;
                context.fill();
                context.restore();
            }
            // gradient fill
            else if(s.x !== undefined && s.y !== undefined && e.x !== undefined && e.y !== undefined) {
                var context = this.getContext();
                var grd = context.createLinearGradient(s.x, s.y, e.x, e.y);
                grd.addColorStop(0, s.color);
                grd.addColorStop(1, e.color);
                f = grd;
                context.fillStyle = f;
                context.fill();
            }
            // radial gradient
            else if(s.radius !== undefined && e.radius !== undefined) {
                var context = this.getContext();
                var grd = context.createRadialGradient(s.x, s.y, s.radius, s.x, s.y, e.radius);
                grd.addColorStop(0, s.color);
                grd.addColorStop(1, e.color);
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
    },
    /**
     * helper method to set the line join of a shape
     * based on the lineJoin property
     */
    applyLineJoin: function() {
        var context = this.getContext();
        if(this.attrs.lineJoin !== undefined) {
            context.lineJoin = this.attrs.lineJoin;
        }
    },
    /**
     * apply shadow based on shadow color, blur,
     * and offset properties
     */
    applyShadow: function() {
        var context = this.getContext();
        var s = this.attrs.shadow;

        if(s.color !== undefined) {
            context.shadowColor = s.color;
            context.shadowBlur = s.blur;
            context.shadowOffsetX = s.offset.x;
            context.shadowOffsetY = s.offset.y;
        }
    },
    /**
     * set fill which can be a color, linear gradient object,
     *  radial gradient object, or pattern object
     * @param {String|Object} fill
     */
    setFill: function(fill) {
        this.attrs.fill = fill;
    },
    /**
     * get fill
     */
    getFill: function() {
        return this.attrs.fill;
    },
    /**
     * set stroke color
     * @param {String} stroke
     */
    setStroke: function(stroke) {
        this.attrs.stroke = stroke;
    },
    /**
     * get stroke color
     */
    getStroke: function() {
        return this.attrs.stroke;
    },
    /**
     * set line join
     * @param {String} lineJoin.  Can be miter, round, or bevel.  The
     *  default is miter
     */
    setLineJoin: function(lineJoin) {
        this.attrs.lineJoin = lineJoin;
    },
    /**
     * get line join
     */
    getLineJoin: function() {
        return this.attrs.lineJoin;
    },
    /**
     * set stroke width
     * @param {Number} strokeWidth
     */
    setStrokeWidth: function(strokeWidth) {
        this.attrs.strokeWidth = strokeWidth;
    },
    /**
     * get stroke width
     */
    getStrokeWidth: function() {
        return this.attrs.strokeWidth;
    },
    /**
     * set shadow object
     * @param {Object} config
     */
    setShadowColor: function(config) {
        this.attrs.shadow = config;
    },
    /**
     * get shadow object
     */
    getShadow: function() {
        return this.attrs.shadow;
    },
    /**
     * set draw function
     * @param {Function} func drawing function
     */
    setDrawFunc: function(func) {
        this.attrs.drawFunc = func;
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
     */
    intersects: function() {
        var pos = Kinetic.GlobalObject._getXY(arguments);
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
            return (alpha !== undefined && alpha !== 0);
        }
    },
    _draw: function(layer) {
        if(layer !== undefined && this.attrs.drawFunc !== undefined) {
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
                if(node.attrs.centerOffset.x !== 0 || node.attrs.centerOffset.y !== 0) {
                    t.translate(-1 * node.attrs.centerOffset.x, -1 * node.attrs.centerOffset.y);
                }

                var m = t.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }

            this.tempLayer = layer;

            /*
             * pre styles include alpha, linejoin, and line cap
             */
            if(this.getAbsoluteAlpha() !== 1) {
                context.globalAlpha = this.getAbsoluteAlpha();
            }
            this.applyLineJoin();

            // draw the shape
            this.attrs.drawFunc.call(this);
            context.restore();
        }
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);
