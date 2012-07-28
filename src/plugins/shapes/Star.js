///////////////////////////////////////////////////////////////////////
//  Star
///////////////////////////////////////////////////////////////////////
/**
 * Star constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Plugins.Star = Kinetic.Shape.extend({
    init: function(config) {
        this.setDefaultAttrs({
            numPoints: 0,
            innerRadius: 0,
            outerRadius: 0
        });

        this.shapeType = "Star";
        config.drawFunc = this.drawFunc;
        // call super constructor
        this._super(config);
    },
    drawFunc: function(context) {
        context.beginPath();
        context.moveTo(0, 0 - this.attrs.outerRadius);

        for(var n = 1; n < this.attrs.numPoints * 2; n++) {
            var radius = n % 2 === 0 ? this.attrs.outerRadius : this.attrs.innerRadius;
            var x = radius * Math.sin(n * Math.PI / this.attrs.numPoints);
            var y = -1 * radius * Math.cos(n * Math.PI / this.attrs.numPoints);
            context.lineTo(x, y);
        }
        context.closePath();

        this.fill(context);
        this.stroke(context);
    }
});

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Plugins.Star, ['numPoints', 'innerRadius', 'outerRadius']);

/**
 * set number of points
 * @name setNumPoints
 * @methodOf Kinetic.Plugins.Star.prototype
 * @param {Integer} points
 */

/**
 * set outer radius
 * @name setOuterRadius
 * @methodOf Kinetic.Plugins.Star.prototype
 * @param {Number} radius
 */

/**
 * set inner radius
 * @name setInnerRadius
 * @methodOf Kinetic.Plugins.Star.prototype
 * @param {Number} radius
 */

/**
 * get number of points
 * @name getNumPoints
 * @methodOf Kinetic.Plugins.Star.prototype
 */

/**
 * get outer radius
 * @name getOuterRadius
 * @methodOf Kinetic.Plugins.Star.prototype
 */

/**
 * get inner radius
 * @name getInnerRadius
 * @methodOf Kinetic.Plugins.Star.prototype
 */