(function() {
    /**
     * Arrow constructor
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Array} config.points
     * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
     *   The default is 0
     * @param {Number} config.pointerLength
     * @param {Number} config.pointerWidth
     * @@shapeParams
     * @@nodeParams
     * @example
     * var line = new Kinetic.Line({
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],
     *   stroke: 'red',
     *   tension: 1,
     *   pointerLength : 10,
     *   pointerWidth : 12
     * });
     */
    Kinetic.Arrow = function(config) {
        this.____init(config);
    };

    Kinetic.Arrow.prototype = {
        ____init : function(config) {
            // call super constructor
            Kinetic.Line.call(this, config);
            this.className = 'Arrow';
        },
        _sceneFunc : function(ctx) {
            var PI2 = Math.PI * 2;
            var points = this.points();
            var n = points.length;
            var dx = points[n-2] - points[n-4];
            var dy = points[n-1] - points[n-3];
            var radians = (Math.atan2(dy, dx) + PI2) % PI2;
            var length = this.pointerLength();
            var width = this.pointerWidth();

            ctx.save();
            ctx.beginPath();
            ctx.translate(points[n-2], points[n-1]);
            ctx.rotate(radians);
            ctx.moveTo(0, 0);
            ctx.lineTo(-length, width / 2);
            ctx.lineTo(-length, -width / 2);
            ctx.closePath();
            ctx.restore();

            if (this.pointerAtBeginning()) {
                ctx.save();
                ctx.translate(points[0], points[1]);
                dx = points[2] - points[0];
                dy = points[3] - points[1];
                ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
                ctx.moveTo(0, 0);
                ctx.lineTo(-10, 6);
                ctx.lineTo(-10, -6);
                ctx.closePath();
                ctx.restore();
            }

            ctx.fillStrokeShape(this);
            Kinetic.Line.prototype._sceneFunc.apply(this, arguments);
        }
    };

    Kinetic.Util.extend(Kinetic.Arrow, Kinetic.Line);
    /**
     * get/set pointerLength
     * @name pointerLength
     * @method
     * @memberof Kinetic.Arrow.prototype
     * @param {Number} Length of pointer of arrow.
     *   The default is 10.
     * @returns {Number}
     * @example
     * // get tension
     * var pointerLength = line.pointerLength();
     *
     * // set tension
     * line.pointerLength(15);
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Arrow, 'pointerLength', 10);
    /**
     * get/set pointerWidth
     * @name pointerWidth
     * @method
     * @memberof Kinetic.Arrow.prototype
     * @param {Number} Width of pointer of arrow.
     *   The default is 10.
     * @returns {Number}
     * @example
     * // get tension
     * var pointerWidth = line.pointerWidth();
     *
     * // set tension
     * line.pointerWidth(15);
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Arrow, 'pointerWidth', 10);
    /**
     * get/set pointerAtBeginning
     * @name pointerAtBeginning
     * @method
     * @memberof Kinetic.Arrow.prototype
     * @param {Number} Should pointer displayed at beginning of arrow.
     *   The default is false.
     * @returns {Boolean}
     * @example
     * // get tension
     * var pointerAtBeginning = line.pointerAtBeginning();
     *
     * // set tension
     * line.pointerAtBeginning(true);
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Arrow, 'pointerAtBeginning', false);
    Kinetic.Collection.mapMethods(Kinetic.Arrow);

})();

