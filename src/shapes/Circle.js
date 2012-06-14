///////////////////////////////////////////////////////////////////////
//  Circle
///////////////////////////////////////////////////////////////////////
/**
 * Circle constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Circle = function(config) {
    this.setDefaultAttrs({
        radius: 0
    });

    this.shapeType = "Circle";

    config.drawFunc = function() {
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.arc(0, 0, this.attrs.radius, 0, Math.PI * 2, true);
        context.closePath();
        this.fill();
        this.stroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Circle, Kinetic.Shape);
// add setters and getters
Kinetic.GlobalObject.addSetters(Kinetic.Circle, ['radius']);
Kinetic.GlobalObject.addGetters(Kinetic.Circle, ['radius']);

/**
 * set radius
 * @name setRadius
 * @methodOf Kinetic.Circle.prototype
 * @param {Number} radius
 */

/**
 * get radius
 * @name getRadius
 * @methodOf Kinetic.Circle.prototype
 */