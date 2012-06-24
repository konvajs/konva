///////////////////////////////////////////////////////////////////////
//  RegularPolygon
///////////////////////////////////////////////////////////////////////
/**
 * RegularPolygon constructor.&nbsp; Examples include triangles, squares, pentagons, hexagons, etc.
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.RegularPolygon = function(config) {
    this.setDefaultAttrs({
        radius: 0,
        sides: 0
    });

    this.shapeType = "RegularPolygon";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        context.moveTo(0, 0 - this.attrs.radius);

        for(var n = 1; n < this.attrs.sides; n++) {
            var x = this.attrs.radius * Math.sin(n * 2 * Math.PI / this.attrs.sides);
            var y = -1 * this.attrs.radius * Math.cos(n * 2 * Math.PI / this.attrs.sides);
            context.lineTo(x, y);
        }
        context.closePath();
        this.fill();
        this.stroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.RegularPolygon, Kinetic.Shape);

// add setters and getters
Kinetic.GlobalObject.addSettersGetters(Kinetic.Rect, ['radius', 'sides']);

/**
 * set radius
 * @name setRadius
 * @methodOf Kinetic.RegularPolygon.prototype
 * @param {Number} radius
 */

/**
 * set number of sides
 * @name setSides
 * @methodOf Kinetic.RegularPolygon.prototype
 * @param {int} sides
 */
/**
 * get radius
 * @name getRadius
 * @methodOf Kinetic.RegularPolygon.prototype
 */

/**
 * get number of sides
 * @name getSides
 * @methodOf Kinetic.RegularPolygon.prototype
 */