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
	this._initCircle(config);	
};

Kinetic.Circle.prototype = {
    _initCircle: function(config) {
        this.setDefaultAttrs({
            radius: 0
        });

        this.shapeType = "Circle";
        config.drawFunc = this.drawFunc;

        // call super constructor
        Kinetic.Shape.call(this, config);
    },
    drawFunc: function(context) {
        context.beginPath();
        context.arc(0, 0, this.getRadius(), 0, Math.PI * 2, true);
        context.closePath();
        this.fill(context);
        this.stroke(context);
    }
};
Kinetic.Global.extend(Kinetic.Circle, Kinetic.Shape);

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Circle, ['radius']);

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