(function() {
    /**
     * Line constructor.&nbsp; Lines are defined by an array of points
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Array} config.points can be a flattened array of points, an array of point arrays, or an array of point objects.
     *  e.g. [0,1,2,3], [[0,1],[2,3]] and [{x:0,y:1},{x:2,y:3}] are equivalent
     * @@shapeParams
     * @@nodeParams
     * @example
     * // simple line
     * var line = new Kinetic.Line({<br>
     *   x: 100,<br>
     *   y: 50,<br>
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],<br>
     *   stroke: 'red'<br>
     * });<br><br>
     *
     * // dashed line with shadow<br>
     * var line = new Kinetic.Line({<br>
     *   x: 100,<br>
     *   y: 50,<br>
     *   points: [73, 70, 340, 23, 450, 60, 500, 20],<br>
     *   stroke: 'red',<br>
     *   dashArray: [33, 10],<br>
     *   shadowColor: 'black',<br>
     *   shadowBlur: 10,<br>
     *   shadowOffset: 10,<br>
     *   shadowOpacity: 0.5<br>
     * });
     */
    Kinetic.Line = function(config) {
        this.___init(config);
    };

    Kinetic.Line.prototype = {
        ___init: function(config) {
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Line';
        },
        drawFunc: function(context) {
            var points = this.getPoints(),
                length = points.length,
                n, point;

            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            for(n = 1; n < length; n++) {
                point = points[n];
                context.lineTo(point.x, point.y);
            }

            context.strokeShape(this);
        }
    };
    Kinetic.Util.extend(Kinetic.Line, Kinetic.Shape);

    Kinetic.Factory.addPointsGetterSetter(Kinetic.Line, 'points');
    /**
     * set points array
     * @name setPoints
     * @method
     * @memberof Kinetic.Line.prototype
     * @param {Array} can be an array of point objects or an array
     *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
     */

    /**
     * get points array
     * @name getPoints
     * @method
     * @memberof Kinetic.Line.prototype
     * @returns {Array}
     */
})();
