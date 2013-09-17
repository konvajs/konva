(function() {
    /**
     * Spline constructor.&nbsp; Splines are defined by an array of points and
     *  a tension
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Array} config.points can be a flattened array of points, an array of point arrays, or an array of point objects.
     *  e.g. [0,1,2,3], [[0,1],[2,3]] and [{x:0,y:1},{x:2,y:3}] are equivalent
     * @param {Number} [config.tension] default value is 1.  Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
     * @@shapeParams
     * @@nodeParams
     * @example
     * var spline = new Kinetic.Spline({<br>
     *   x: 100,<br>
     *   y: 50,<br>
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],<br>
     *   stroke: 'red',<br>
     *   tension: 1<br>
     * });
     */
    Kinetic.Spline = function(config) {
        this.___init(config);
    };

    Kinetic.Spline.prototype = {
        ___init: function(config) {
            var that = this;
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Spline';

            this.on('pointsChange.kinetic tensionChange.kinetic', function() {
                that._setAllPoints();
            });

            this._setAllPoints();
        },
        drawFunc: function(context) {
            var points = this.getPoints(),
                length = points.length,
                tension = this.getTension(),
                ap, len, n, point;

            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            // tension
            if(tension !== 0 && length > 2) {
                ap = this.allPoints;
                len = ap.length;
                n = 2;

                context.quadraticCurveTo(ap[0].x, ap[0].y, ap[1].x, ap[1].y);

                while(n < len - 1) {
                    context.bezierCurveTo(ap[n].x, ap[n++].y, ap[n].x, ap[n++].y, ap[n].x, ap[n++].y);
                }

                context.quadraticCurveTo(ap[len - 1].x, ap[len - 1].y, points[length - 1].x, points[length - 1].y);
            }
            // no tension
            else {
                for(n = 1; n < length; n++) {
                    point = points[n];
                    context.lineTo(point.x, point.y);
                }
            }

            context.strokeShape(this);
        },
        _setAllPoints: function() {
            this.allPoints = Kinetic.Util._expandPoints(this.getPoints(), this.getTension());
        }
    };
    Kinetic.Util.extend(Kinetic.Spline, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.Spline, 'tension', 1);

    /**
     * get tension
     * @name getTension
     * @method
     * @memberof Kinetic.Spline.prototype
     * @returns {Number}
     */

    /**
     * set tension
     * @name setTension
     * @method
     * @memberof Kinetic.Spline.prototype
     * @param {Number} tension
     */

    Kinetic.Factory.addPointsGetterSetter(Kinetic.Spline, 'points');
    /**
     * get points array
     * @name getPoints
     * @method
     * @memberof Kinetic.Spline.prototype
     * @returns {Array}
     */

    /**
     * set points array
     * @name setPoints
     * @method
     * @memberof Kinetic.Spline.prototype
     * @param {Array} can be an array of point objects or an array
     *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
     */
})();
