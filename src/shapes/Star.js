///////////////////////////////////////////////////////////////////////
//  Star
///////////////////////////////////////////////////////////////////////
/**
 * Star constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Star = function(config) {
    this.setDefaultAttrs({
        numPoints: 0,
        innerRadius: 0,
        outerRadius: 0
    });

    this.shapeType = "Star";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        context.moveTo(0, 0 - this.attrs.outerRadius);

        for(var n = 1; n < this.attrs.numPoints * 2; n++) {
            var radius = n % 2 === 0 ? this.attrs.outerRadius : this.attrs.innerRadius;
            var x = radius * Math.sin(n * Math.PI / this.attrs.numPoints);
            var y = -1 * radius * Math.cos(n * Math.PI / this.attrs.numPoints);
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
Kinetic.GlobalObject.extend(Kinetic.Star, Kinetic.Shape);

// add setters and getters
Kinetic.GlobalObject.addSetters(Kinetic.Star, ['numPoints', 'innerRadius', 'outerRadius']);
Kinetic.GlobalObject.addGetters(Kinetic.Star, ['numPoints', 'innerRadius', 'outerRadius']);

/**
 * set number of points
 * @param {Integer} points
 */

/**
 * set outer radius
 * @param {Number} radius
 */

/**
 * set inner radius
 * @param {Number} radius
 */

/**
 * get number of points
 */

/**
 * get outer radius
 */

/**
 * get inner radius
 */