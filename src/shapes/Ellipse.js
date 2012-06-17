///////////////////////////////////////////////////////////////////////
//  Ellipse
///////////////////////////////////////////////////////////////////////
/**
 * Ellipse constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Ellipse = function(config) {
    this.setDefaultAttrs({
        radius: {
            x: 0,
            y: 0
        }
    });

    this.shapeType = "Ellipse";

    config.drawFunc = function() {
        var canvas = this.getCanvas();
        var context = this.getContext();
        var r = this.getRadius();
        context.beginPath();
        context.save();
        if(r.x !== r.y) {
            context.scale(1, r.y / r.x);
        }
        context.arc(0, 0, r.x, 0, Math.PI * 2, true);
        context.restore();
        context.closePath();
        this.fill();
        this.stroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

Kinetic.Ellipse.prototype = {
    /**
     * set radius
     * @param {Number|Object|Array} radius
     *  radius can be a number, in which the ellipse becomes a circle,
     *  it can be an object with an x and y component, or it
     *  can be an array in which the first element is the x component
     *  and the second element is the y component.  The x component
     *  defines the horizontal radius and the y component
     *  defines the vertical radius
     */
    setRadius: function() {
        this.setAttrs({
            radius: arguments
        });
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Ellipse, Kinetic.Shape);

// add setters and getters
Kinetic.GlobalObject.addGetters(Kinetic.Ellipse, ['radius']);

/**
 * get radius
 * @name getRadius
 * @methodOf Kinetic.Ellipse.prototype
 */