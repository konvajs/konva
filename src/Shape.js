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
    this.className = 'Shape';

    // defaults
    if(config.stroke !== undefined || config.strokeWidth !== undefined) {
        if(config.stroke === undefined) {
            config.stroke = 'black';
        }
        else if(config.strokeWidth === undefined) {
            config.strokeWidth = 2;
        }
    }

    if(config.detectionType === undefined) {
        config.detectionType = 'path';
    }

    // required
    this.drawFunc = config.drawFunc;

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

        if(this.fill !== undefined) {
            context.fillStyle = this.fill;
            context.fill();
        }
        if(this.stroke !== undefined) {
            context.lineWidth = this.strokeWidth === undefined ? 1 : this.strokeWidth;
            context.strokeStyle = this.stroke;
            context.stroke();
        }
    },
    /**
     * helper method to set the line join of a shape
     * based on the lineJoin property
     */
    applyLineJoin: function() {
        var context = this.getContext();
        if(this.lineJoin !== undefined) {
            context.lineJoin = this.lineJoin;
        }
    },
    /**
     * set fill which can be a color, gradient object,
     *  or pattern object
     * @param {String|CanvasGradient|CanvasPattern} fill
     */
    setFill: function(fill) {
        this.fill = fill;
    },
    /**
     * get fill
     */
    getFill: function() {
        return this.fill;
    },
    /**
     * set stroke color
     * @param {String} stroke
     */
    setStroke: function(stroke) {
        this.stroke = stroke;
    },
    /**
     * get stroke color
     */
    getStroke: function() {
        return this.stroke;
    },
    /**
     * set line join
     * @param {String} lineJoin.  Can be "miter", "round", or "bevel".  The
     *  default is "miter"
     */
    setLineJoin: function(lineJoin) {
        this.lineJoin = lineJoin;
    },
    /**
     * get line join
     */
    getLineJoin: function() {
        return this.lineJoin;
    },
    /**
     * set stroke width
     * @param {Number} strokeWidth
     */
    setStrokeWidth: function(strokeWidth) {
        this.strokeWidth = strokeWidth;
    },
    /**
     * get stroke width
     */
    getStrokeWidth: function() {
        return this.strokeWidth;
    },
    /**
     * set draw function
     * @param {Function} func drawing function
     */
    setDrawFunc: function(func) {
        this.drawFunc = func;
    },
    /**
     * draw shape
     * @param {Layer} layer Layer that the shape will be drawn on
     */
    _draw: function(layer) {
        if(this.visible) {
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
                var m = node.getTransform().getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

                if(node.getAbsoluteAlpha() !== 1) {
                    context.globalAlpha = node.getAbsoluteAlpha();
                }
            }
            this.tempLayer = layer;
            this.drawFunc.call(this);
            context.restore();
        }
    },
    /**
     * custom isPointInPath method which can use path detection
     * or pixel detection
     */
    _isPointInShape: function(pos) {
        var stage = this.getStage();

        if(this.detectionType === 'path') {
            var pathLayer = stage.pathLayer;
            var pathLayerContext = pathLayer.getContext();

            this._draw(pathLayer);

            return pathLayerContext.isPointInPath(pos.x, pos.y);
        }
        else {
            var bufferLayer = stage.bufferLayer;
            var bufferLayerContext = bufferLayer.getContext();

            this._draw(bufferLayer);

            var w = stage.width;
            var h = stage.height;
            var x = pos.x;
            var y = pos.y;
            var imageData = bufferLayerContext.getImageData(0, 0, w, h);
            var data = imageData.data;
            var alpha = data[((w * y) + x) * 4 + 3];

            return (alpha !== undefined && alpha !== 0);
        }
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);
