///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/**
 * Shape constructor.  Shapes are used to objectify drawing bits of a KineticJS
 * application
 * @constructor
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Shape = function(config) {
    this.className = "Shape";

    // defaults
    if(config.stroke !== undefined || config.strokeWidth !== undefined) {
        if(config.stroke === undefined) {
            config.stroke = "black";
        } else if(config.strokeWidth === undefined) {
            config.strokeWidth = 2;
        }
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
     * get layer context that the shape is being drawn.  When
     * the shape is being rendered, .getContext() returns the context of the
     * user created layer that contains the shape.  When the event detection
     * engine is determining whether or not an event has occured on that shape,
     * .getContext() returns the context of the invisible backstage layer.
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
     * helper method to fill and stroke a shape based on its
     * fill, stroke, and strokeWidth properties
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
     * set fill which can be a color, gradient object,
     * or pattern object
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
     * draw shape
     * @param {Layer} layer Layer that the shape will be drawn on
     */
    _draw: function(layer) {
        if(this.visible) {
            var stage = layer.getStage();
            var context = layer.getContext();

            var family = [];

            family.unshift(this);
            var parent = this.parent;
            while(parent.className !== "Stage") {
                family.unshift(parent);
                parent = parent.parent;
            }

            // children transforms
            for(var n = 0; n < family.length; n++) {
                var obj = family[n];

                context.save();
                if(obj.x !== 0 || obj.y !== 0) {
                    context.translate(obj.x, obj.y);
                }
                if(obj.centerOffset.x !== 0 || obj.centerOffset.y !== 0) {
                    context.translate(obj.centerOffset.x, obj.centerOffset.y);
                }
                if(obj.rotation !== 0) {
                    context.rotate(obj.rotation);
                }
                if(obj.scale.x !== 1 || obj.scale.y !== 1) {
                    context.scale(obj.scale.x, obj.scale.y);
                }
                if(obj.centerOffset.x !== 0 || obj.centerOffset.y !== 0) {
                    context.translate(-1 * obj.centerOffset.x, -1 * obj.centerOffset.y);
                }
                if(obj.getAbsoluteAlpha() !== 1) {
                    context.globalAlpha = obj.getAbsoluteAlpha();
                }
            }

            // stage transform
            context.save();
            if(stage && (stage.scale.x !== 1 || stage.scale.y !== 1)) {
                context.scale(stage.scale.x, stage.scale.y);
            }

            this.tempLayer = layer;
            this.drawFunc.call(this);

            // children restore
            for(var i = 0; i < family.length; i++) {
                context.restore();
            }

            // stage restore
            context.restore();
        }
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);
