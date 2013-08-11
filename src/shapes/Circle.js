(function() {
    // the 0.0001 offset fixes a bug in Chrome 27
    var PIx2 = (Math.PI * 2) - 0.0001,
        CIRCLE = 'Circle';

    /**
     * Circle constructor
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Number} config.radius
     * @@shapeParams
     * @@nodeParams
     * @example
     * // create simple circle
     * var circle = new Kinetic.Circle({<br>
     *   radius: 40,<br>
     *   fill: 'red',<br>
     *   stroke: 'black'<br>
     *   strokeWidth: 5<br>
     * });<br><br>
     *
     * // create ellipse<br>
     * var circle = new Kinetic.Circle({<br>
     *   radius: 5,<br>
     *   fill: 'red',<br>
     *   stroke: 'black'<br>
     *   strokeWidth: 5,<br>
     *   scaleX: 2,<br>
     *   strokeScaleEnabled: false<br>
     * });
     */
    Kinetic.Circle = function(config) {
        this.___init(config);
    };

    Kinetic.Circle.prototype = {
        ___init: function(config) {
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = CIRCLE;
        },
        drawFunc: function(canvas) {
            var context = canvas.getContext();

            context.beginPath();
            context.arc(0, 0, this.getRadius(), 0, PIx2, false);
            context.closePath();
            canvas.fillStroke(this);
        },
        getWidth: function() {
            return this.getRadius() * 2;
        },
        getHeight: function() {
            return this.getRadius() * 2;
        },
        setWidth: function(width) {
            Kinetic.Node.prototype.setWidth.call(this, width);
            this.setRadius(width / 2);
        },
        setHeight: function(height) {
            Kinetic.Node.prototype.setHeight.call(this, height);
            this.setRadius(height / 2);
        }
    };
    Kinetic.Util.extend(Kinetic.Circle, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.Circle, 'radius', 0);

    /**
     * set radius
     * @method
     * @memberof Kinetic.Circle.prototype
     * @param {Number} radius
     */

    /**
     * get radius
     * @method
     * @memberof Kinetic.Circle.prototype
     */
})();
