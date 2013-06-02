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
        this._initLine(config);
    };

    Kinetic.Line.prototype = {
        _initLine: function(config) {
            this.createAttrs();

            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Line';
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
            var points = this.getPoints(), 
                length = points.length, 
                context = canvas.getContext(),
                n, point;

            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            for(n = 1; n < length; n++) {
                point = points[n];
                context.lineTo(point.x, point.y);
            }

            canvas.stroke(this);
        },
        /**
         * set points array
         * @method
         * @memberof Kinetic.Line.prototype
         * @param {Array} can be an array of point objects or an array
         *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
         */
        setPoints: function(val) {
            var points = Kinetic.Util._getPoints(val);
            this._setAttr('points', points);
            this._points = points;
        },
        setEndPoints: function(val) {
            var points = Kinetic.Util._getPoints(val);
            this._setAttr('endPoints', points);
        },
        setPointsPosition: function(val) {
            var points = this._points,
                endPoints = this.getEndPoints(),
                len = points.length,
                newPoints = [],
                n, point, endPoint, diff;

            for (n=0; n<len; n++) {
                point = points[n];
                endPoint = endPoints[n];

                diffX = (endPoint.x - point.x) * val;
                diffY = (endPoint.y - point.y) * val;

                newPoints.push({
                    x: point.x + diffX,
                    y: point.y + diffY
                });
            }

            this._setAttr('pointsPosition', val);
            this._setAttr('points', newPoints);
        },
        getPointsPosition: function() {
            return this.attrs.pointsPosition;
        },
        /**
         * get points array
         * @method
         * @memberof Kinetic.Line.prototype
         */
         // NOTE: cannot use getter method because we need to return a new
         // default array literal each time because arrays are modified by reference
        getPoints: function() {
            return this.attrs.points || [];
        },
        getEndPoints: function() {
            return this.attrs.endPoints || [];
        }
    };
    Kinetic.Util.extend(Kinetic.Line, Kinetic.Shape);
})();
