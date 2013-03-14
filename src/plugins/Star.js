(function() {
    /**
     * Star constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Integer} config.numPoints
     * @param {Number} config.innerRadius
     * @param {Number} config.outerRadius
     * {{ShapeParams}}
     * {{NodeParams}}
     */
    Kinetic.Plugins.Star = function(config) {
        this._initStar(config);
    };

    Kinetic.Plugins.Star.prototype = {
        _initStar: function(config) {
            this.setDefaultAttrs({
                numPoints: 0,
                innerRadius: 0,
                outerRadius: 0
            });

            // call super constructor
            Kinetic.Shape.call(this, config);
            this.shapeType = 'Star';
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
            var context = canvas.getContext(), innerRadius = this.attrs.innerRadius, outerRadius = this.attrs.outerRadius, numPoints = this.attrs.numPoints;

            context.beginPath();
            context.moveTo(0, 0 - this.attrs.outerRadius);

            for(var n = 1; n < numPoints * 2; n++) {
                var radius = n % 2 === 0 ? outerRadius : innerRadius;
                var x = radius * Math.sin(n * Math.PI / numPoints);
                var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
                context.lineTo(x, y);
            }
            context.closePath();

            canvas.fillStroke(this);
        }
    };
    Kinetic.Global.extend(Kinetic.Plugins.Star, Kinetic.Shape);

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
})();
