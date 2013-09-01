(function() {
    /**
     * Rect constructor
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Number} [config.cornerRadius]
     * @@shapeParams
     * @@nodeParams
     * @example
     * var rect = new Kinetic.Rect({<br>
     *   width: 100,<br>
     *   height: 50,<br>
     *   fill: 'red',<br>
     *   stroke: 'black'<br>
     *   strokeWidth: 5<br>
     * });
     */
    Kinetic.Rect = function(config) {
        this.___init(config);
    };

    Kinetic.Rect.prototype = {
        ___init: function(config) {
            Kinetic.Shape.call(this, config);
            this.className = 'Rect';
        },
        drawFunc: function(context) {
            var _context = context._context,
                cornerRadius = this.getCornerRadius(),
                width = this.getWidth(),
                height = this.getHeight();

            _context.beginPath();

            if(!cornerRadius) {
                // simple rect - don't bother doing all that complicated maths stuff.
                _context.rect(0, 0, width, height);
            }
            else {
                // arcTo would be nicer, but browser support is patchy (Opera)
                _context.moveTo(cornerRadius, 0);
                _context.lineTo(width - cornerRadius, 0);
                _context.arc(width - cornerRadius, cornerRadius, cornerRadius, Math.PI * 3 / 2, 0, false);
                _context.lineTo(width, height - cornerRadius);
                _context.arc(width - cornerRadius, height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
                _context.lineTo(cornerRadius, height);
                _context.arc(cornerRadius, height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
                _context.lineTo(0, cornerRadius);
                _context.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, Math.PI * 3 / 2, false);
            }
            _context.closePath();
            context.fillStroke(this);
        }
    };

    Kinetic.Util.extend(Kinetic.Rect, Kinetic.Shape);

    Kinetic.Factory.addGetterSetter(Kinetic.Rect, 'cornerRadius', 0);

    /**
     * set corner radius
     * @name setCornerRadius
     * @method
     * @memberof Kinetic.Rect.prototype
     * @param {Number} corner radius
     */

    /**
     * get corner radius
     * @name getCornerRadius
     * @method
     * @memberof Kinetic.Rect.prototype
     */

})();
