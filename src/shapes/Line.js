(function() {
    /**
     * Line constructor.&nbsp; Lines are defined by an array of points and
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
     * var line = new Kinetic.Line({<br>
     *   x: 100,<br>
     *   y: 50,<br>
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],<br>
     *   stroke: 'red',<br>
     *   tension: 1<br>
     * });
     */
    Kinetic.Line = function(config) {
        this.___init(config);
    };

    Kinetic.Line.prototype = {
        ___init: function(config) {
            var that = this;
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Line';

            this.on('pointsChange.kinetic tensionChange.kinetic closedChange.kinetic', function() {
                this._clearCache('tensionPoints');
            });
        },
        drawFunc: function(context) {
            var points = this.getPoints(),
                length = points.length,
                tension = this.getTension(),
                closed = this.getClosed(),
                tp, len, n, point;

            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            // tension
            if(tension !== 0 && length > 2) {
                tp = this.getTensionPoints();
                len = tp.length;
                n = closed ? 0 : 2;

                if (!closed) {
                    context.quadraticCurveTo(tp[0].x, tp[0].y, tp[1].x, tp[1].y);
                }

                while(n < len - 1) {
                    context.bezierCurveTo(tp[n].x, tp[n++].y, tp[n].x, tp[n++].y, tp[n].x, tp[n++].y);
                }

                if (!closed) {
                    context.quadraticCurveTo(tp[len - 1].x, tp[len - 1].y, points[length - 1].x, points[length - 1].y);
                }
            }
            // no tension
            else {
                for(n = 1; n < length; n++) {
                    point = points[n];
                    context.lineTo(point.x, point.y);
                }
            }

            // closed e.g. polygons and blobs
            if (closed) {
                context.closePath();
                context.fillStrokeShape(this);   
            }
            // open e.g. lines and splines
            else {
                context.strokeShape(this);
            };
        },
        getTensionPoints: function() {
            return this._getCache('tensionPoints', this._getTensionPoints); 
        },
        _getTensionPoints: function() {
            if (this.getClosed()) {
                return this._getTensionPointsClosed();  
            }
            else {
                return Kinetic.Util._expandPoints(this.getPoints(), this.getTension());
            }
        },
        _getTensionPointsClosed: function() {
            var points = this.getPoints(),
                length = points.length,
                tension = this.getTension(),
                util = Kinetic.Util,
                firstControlPoints = util._getControlPoints(points[length - 1], points[0], points[1], tension),
                lastControlPoints = util._getControlPoints(points[length - 2], points[length - 1], points[0], tension),
                tensionPoints = Kinetic.Util._expandPoints(points, tension);

            // prepend control point
            tensionPoints.unshift(firstControlPoints[1]);

            // append cp, point, cp, cp, first point
            tensionPoints.push(lastControlPoints[0]);
            tensionPoints.push(points[length - 1]);
            tensionPoints.push(lastControlPoints[1]);
            tensionPoints.push(firstControlPoints[0]);
            tensionPoints.push(points[0]);

            return tensionPoints;
        }
    };
    Kinetic.Util.extend(Kinetic.Line, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.Line, 'closed', false);

    /**
     * get closed
     * @name getClosed
     * @method
     * @memberof Kinetic.Line.prototype
     * @returns {Boolean}
     */

    /**
     * set closed
     * @name setClosed
     * @method
     * @memberof Kinetic.Line.prototype
     * @param {Boolean} closed
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Line, 'tension', 0);

    /**
     * get tension
     * @name getTension
     * @method
     * @memberof Kinetic.Line.prototype
     * @returns {Number}
     */

    /**
     * set tension
     * @name setTension
     * @method
     * @memberof Kinetic.Line.prototype
     * @param {Number} tension
     */

    Kinetic.Factory.addPointsGetterSetter(Kinetic.Line, 'points');
    /**
     * get points array
     * @name getPoints
     * @method
     * @memberof Kinetic.Line.prototype
     * @returns {Array}
     */

    /**
     * set points array
     * @name setPoints
     * @method
     * @memberof Kinetic.Line.prototype
     * @param {Array} can be an array of point objects or an array
     *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
     */
})();
