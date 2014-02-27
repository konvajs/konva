(function() {
    /**
     * RegularPolygon constructor.&nbsp; Examples include triangles, squares, pentagons, hexagons, etc.
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Number} config.sides
     * @param {Number} config.radius
     * @@shapeParams
     * @@nodeParams
     * @example
     * var hexagon = new Kinetic.RegularPolygon({<br>
     *   x: 100,<br>
     *   y: 200,<br>
     *   sides: 6,<br>
     *   radius: 70,<br>
     *   fill: 'red',<br>
     *   stroke: 'black',<br>
     *   strokeWidth: 4<br>
     * });
     */
    Kinetic.RegularPolygon = function(config) {
        this.___init(config);
    };

    Kinetic.RegularPolygon.prototype = {
        ___init: function(config) {
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'RegularPolygon';
            this.sceneFunc(this._sceneFunc);
        },
        _sceneFunc: function(context) {
            var sides = this.attrs.sides,
                radius = this.attrs.radius,
                n, x, y;

            context.beginPath();
            context.moveTo(0, 0 - radius);

            for(n = 1; n < sides; n++) {
                x = radius * Math.sin(n * 2 * Math.PI / sides);
                y = -1 * radius * Math.cos(n * 2 * Math.PI / sides);
                context.lineTo(x, y);
            }
            context.closePath();
            context.fillStrokeShape(this);
        }
    };
    Kinetic.Util.extend(Kinetic.RegularPolygon, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.RegularPolygon, 'radius', 0);

    /**
     * set radius
     * @name setRadius
     * @method
     * @memberof Kinetic.RegularPolygon.prototype
     * @param {Number} radius
     */

     /**
     * get radius
     * @name getRadius
     * @method
     * @memberof Kinetic.RegularPolygon.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.RegularPolygon, 'sides', 0);

    /**
     * set number of sides
     * @name setSides
     * @method
     * @memberof Kinetic.RegularPolygon.prototype
     * @param {int} sides
     */

    /**
     * get number of sides
     * @name getSides
     * @method
     * @memberof Kinetic.RegularPolygon.prototype
     */

    Kinetic.Collection.mapMethods(Kinetic.RegularPolygon);
})();
