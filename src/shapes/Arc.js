(function() {
    /**
     * Arc constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Number} config.angle
     * @param {Number} config.angleDeg angle in degrees
     * @param {Number} config.innerRadius
     * @param {Number} config.outerRadius
     * @param {Boolean} [config.clockwise]
     * @@shapeParams
     * @@nodeParams
     * @example
     * // draw a Arc that's pointing downwards<br>
     * var Arc = new Kinetic.Arc({<br>
     *   innerRadius: 40,<br>
     *   outerRadius: 80,<br>
     *   fill: 'red',<br>
     *   stroke: 'black'<br>
     *   strokeWidth: 5,<br>
     *   angleDeg: 60,<br>
     *   rotationDeg: -120<br>
     * });
     */
    Kinetic.Arc = function(config) {
        this.___init(config);
    };

    Kinetic.Arc.prototype = {
        ___init: function(config) {
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Arc';
            this.setDrawFunc(this._drawFunc);
        },
        _drawFunc: function(context) {
            context.beginPath();
            context.arc(0, 0, this.getOuterRadius(), 0, this.getAngle(), this.getClockwise());
            context.arc(0, 0, this.getInnerRadius(), this.getAngle(), 0, !this.getClockwise());
            context.closePath();
            context.fillStrokeShape(this);
        }
    };
    Kinetic.Util.extend(Kinetic.Arc, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.Arc, 'innerRadius', function() {
        return 0;
    });

    /**
     * set innerRadius
     * @name setInnerRadius
     * @method
     * @memberof Kinetic.Arc.prototype
     * @param {Number} innerRadius
     */

     /**
     * get innerRadius
     * @name getInnerRadius
     * @method
     * @memberof Kinetic.Arc.prototype
     * @returns {Number}
     */
     
    Kinetic.Factory.addGetterSetter(Kinetic.Arc, 'outerRadius', function() {
        return 0;
    });

    /**
     * set outerRadius
     * @name setOuterRadius
     * @method
     * @memberof Kinetic.Arc.prototype
     * @param {Number} innerRadius
     */

     /**
     * get outerRadius
     * @name getOuterRadius
     * @method
     * @memberof Kinetic.Arc.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addRotationGetterSetter(Kinetic.Arc, 'angle', 0);

    /**
     * set angle
     * @name setAngle
     * @method
     * @memberof Kinetic.Arc.prototype
     * @param {Number} angle
     */

     /**
     * set angle in degrees
     * @name setAngleDeg
     * @method
     * @memberof Kinetic.Arc.prototype
     * @param {Number} angleDeg
     */

     /**
     * get angle
     * @name getAngle
     * @method
     * @memberof Kinetic.Arc.prototype
     * @returns {Number}
     */

     /**
     * get angle in degrees
     * @name getAngleDeg
     * @method
     * @memberof Kinetic.Arc.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Arc, 'clockwise', false);

    /**
     * set clockwise draw direction.  If set to true, the Arc will be drawn clockwise
     *  If set to false, the Arc will be drawn anti-clockwise.  The default is false.
     * @name setClockwise
     * @method
     * @memberof Kinetic.Arc.prototype
     * @param {Boolean} clockwise
     */

    /**
     * get clockwise
     * @name getClockwise
     * @method
     * @memberof Kinetic.Arc.prototype
     * @returns {Boolean}
     */
})();
