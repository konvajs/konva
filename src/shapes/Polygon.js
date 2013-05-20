(function() {
    /**
     * Polygon constructor.&nbsp; Polygons are defined by an array of points
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Array} config.points can be a flattened array of points, an array of point arrays, or an array of point objects.
     *  e.g. [0,1,2,3], [[0,1],[2,3]] and [{x:0,y:1},{x:2,y:3}] are equivalent
     * {{ShapeParams}}
     * {{NodeParams}}
     * @example
     * var polygon = new Kinetic.Polygon({<br>
     *   points: [73, 192, 73, 160, 340, 23, 500, 109, 499, 139, 342, 93],<br>
     *   fill: '#00D2FF',<br>
     *   stroke: 'black',<br>
     *   strokeWidth: 5<br>
     * });
     */
    Kinetic.Polygon = function(config) {
        this._initPolygon(config);
    };

    Kinetic.Polygon.prototype = {
        _initPolygon: function(config) {
            this.createAttrs();

            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Polygon';
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
            var context = canvas.getContext(), points = this.getPoints(), length = points.length;
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);
            for(var n = 1; n < length; n++) {
                context.lineTo(points[n].x, points[n].y);
            }
            context.closePath();
            canvas.fillStroke(this);
        },
        /**
         * set points array
         * @method
         * @memberof Kinetic.Polygon.prototype
         * @param {Array} can be an array of point objects or an array
         *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
         */
        setPoints: function(val) {
            this._setAttr('points', Kinetic.Util._getPoints(val));
        },
        /**
         * get points array
         * @method
         * @memberof Kinetic.Polygon.prototype
         */
         // NOTE: cannot use getter method because we need to return a new
         // default array literal each time because arrays are modified by reference
        getPoints: function() {
            return this.attrs.points || [];
        }
    };
    Kinetic.Util.extend(Kinetic.Polygon, Kinetic.Shape);
})();
