///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/**
 * Shape constructor.  Shapes are used to objectify drawing bits of a KineticJS
 * application
 * @constructor
 * @augments Kinetic.Node
 * @param {Object} config
 * @config {String|CanvasGradient|CanvasPattern} [fill] fill
 * @config {String} [stroke] stroke color
 * @config {Number} [strokeWidth] stroke width
 * @config {String} [lineJoin] line join.  Can be "miter", "round", or "bevel".  The default
 *  is "miter"
 * @config {String} [detectionType] shape detection type.  Can be "path" or "pixel".
 *  The default is "path" because it performs better
 */
Kinetic.Shape = function(config) {
    this.setDefaultAttrs({
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined,
        lineJoin: undefined,
        detectionType: 'path'
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
        return this.tempLayer.getContext();
    },
    /**
     * get shape temp layer canvas
     */
    getCanvas: function() {
        return this.tempLayer.getCanvas();
    },
    /**
     * helper method to fill and stroke a shape
     *  based on its fill, stroke, and strokeWidth, properties
     */
    fillStroke: function() {
        var context = this.getContext();

        /*
         * expect that fill, stroke, and strokeWidth could be
         * undfined, '', null, or 0.  Use !!
         */
        if(!!this.attrs.fill) {
            context.fillStyle = this.attrs.fill;
            context.fill();
        }

        if(!!this.attrs.stroke || !!this.attrs.strokeWidth) {
            var stroke = !!this.attrs.stroke ? this.attrs.stroke : 'black';
            var strokeWidth = !!this.attrs.strokeWidth ? this.attrs.strokeWidth : 2;

            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke;
            context.stroke();
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
     * set fill which can be a color, gradient object,
     *  or pattern object
     * @param {String|CanvasGradient|CanvasPattern} fill
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
     * @param {String} lineJoin.  Can be "miter", "round", or "bevel".  The
     *  default is "miter"
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
     * set draw function
     * @param {Function} func drawing function
     */
    setDrawFunc: function(func) {
        this.drawFunc = func;
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
        var pos = Kinetic.GlobalObject._getPoint(arguments);
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
    /**
     * draw shape
     * @param {Layer} layer Layer that the shape will be drawn on
     */
    _draw: function(layer) {
        if(layer !== undefined && this.drawFunc !== undefined) {
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

            if(this.getAbsoluteAlpha() !== 1) {
                context.globalAlpha = this.getAbsoluteAlpha();
            }

            this.tempLayer = layer;
            this.drawFunc.call(this);
            context.restore();
        }
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);
