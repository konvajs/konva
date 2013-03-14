(function() {
    /**
     * RegularPolygon constructor.&nbsp; Examples include triangles, squares, pentagons, hexagons, etc.
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Number} config.sides
     * @param {Number} config.radius
     * {{ShapeParams}}
     * {{NodeParams}}
     */
    Kinetic.Plugins.RegularPolygon = function(config) {
        this._initRegularPolygon(config);
    };

    Kinetic.Plugins.RegularPolygon.prototype = {
        _initRegularPolygon: function(config) {
            this.setDefaultAttrs({
                radius: 0,
                sides: 0
            });

            // call super constructor
            Kinetic.Shape.call(this, config);
            this.shapeType = 'RegularPolygon';
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
        	var context = canvas.getContext(), sides = this.attrs.sides, radius = this.attrs.radius;
            context.beginPath();
            context.moveTo(0, 0 - radius);

            for(var n = 1; n < sides; n++) {
                var x = radius * Math.sin(n * 2 * Math.PI / sides);
                var y = -1 * radius * Math.cos(n * 2 * Math.PI / sides);
                context.lineTo(x, y);
            }
            context.closePath();
            canvas.fillStroke(this);
        }
    };
    Kinetic.Global.extend(Kinetic.Plugins.RegularPolygon, Kinetic.Shape);

    // add getters setters
    Kinetic.Node.addGettersSetters(Kinetic.Plugins.RegularPolygon, ['radius', 'sides']);

    /**
     * set radius
     * @name setRadius
     * @methodOf Kinetic.Plugins.RegularPolygon.prototype
     * @param {Number} radius
     */

    /**
     * set number of sides
     * @name setSides
     * @methodOf Kinetic.Plugins.RegularPolygon.prototype
     * @param {int} sides
     */
    
    /**
     * get radius
     * @name getRadius
     * @methodOf Kinetic.Plugins.RegularPolygon.prototype
     */

    /**
     * get number of sides
     * @name getSides
     * @methodOf Kinetic.Plugins.RegularPolygon.prototype
     */
})();
