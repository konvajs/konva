(function() {
    /**
     * AnnularSection constructor
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
     * // draw a AnnularSection that's pointing downwards<br>
     * var AnnularSection = new Kinetic.AnnularSection({<br>
     *   innerRadius: 40,<br>
     *   outerRadius: 80,<br>
     *   fill: 'red',<br>
     *   stroke: 'black'<br>
     *   strokeWidth: 5,<br>
     *   angleDeg: 60,<br>
     *   rotationDeg: -120<br>
     * });
     */
    Kinetic.AnnularSection = function(config) {
        this.___init(config);
    };

    Kinetic.AnnularSection.prototype = {
        ___init: function(config) {
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'AnnularSection';
        },
        drawFunc: function(context) {
            context.beginPath();
            context.arc(0, 0, this.getOuterRadius(), 0, this.getAngle(), this.getClockwise());
            context.arc(0, 0, this.getInnerRadius(), this.getAngle(), 0, !this.getClockwise());
            context.closePath();
            context.fillStrokeShape(this);
        }
    };
    Kinetic.Util.extend(Kinetic.AnnularSection, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.AnnularSection, 'innerRadius', function() {
        return 0;
    });

    /**
     * set innerRadius
     * @name setInnerRadius
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @param {Number} innerRadius
     */

     /**
     * get innerRadius
     * @name getInnerRadius
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @returns {Number}
     */
     
    Kinetic.Factory.addGetterSetter(Kinetic.AnnularSection, 'outerRadius', function() {
        return 0;
    });

    /**
     * set outerRadius
     * @name setOuterRadius
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @param {Number} innerRadius
     */

     /**
     * get outerRadius
     * @name getOuterRadius
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addRotationGetterSetter(Kinetic.AnnularSection, 'angle', 0);

    /**
     * set angle
     * @name setAngle
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @param {Number} angle
     */

     /**
     * set angle in degrees
     * @name setAngleDeg
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @param {Number} angleDeg
     */

     /**
     * get angle
     * @name getAngle
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @returns {Number}
     */

     /**
     * get angle in degrees
     * @name getAngleDeg
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @returns {Number}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.AnnularSection, 'clockwise', false);

    /**
     * set clockwise draw direction.  If set to true, the AnnularSection will be drawn clockwise
     *  If set to false, the AnnularSection will be drawn anti-clockwise.  The default is false.
     * @name setClockwise
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @param {Boolean} clockwise
     */

    /**
     * get clockwise
     * @name getClockwise
     * @method
     * @memberof Kinetic.AnnularSection.prototype
     * @returns {Boolean}
     */
})();
