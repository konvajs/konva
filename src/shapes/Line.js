(function() {
    /**
     * Line constructor.&nbsp; Lines are defined by an array of points
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Array} config.points can be a flattened array of points, or an array of point objects.
     *  e.g. [0,1,2,3] and [{x:1,y:2},{x:3,y:4}] are equivalent
     */
    Kinetic.Line = function(config) {
        this._initLine(config);
    };
    // function written by Rob Spencer
    function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var fa = t * d01 / (d01 + d12);
        var fb = t * d12 / (d01 + d12);
        var p1x = x1 - fa * (x2 - x0);
        var p1y = y1 - fa * (y2 - y0);
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);
        return [p1x, p1y, p2x, p2y];
    }

    Kinetic.Line.prototype = {
        _initLine: function(config) {
            this.setDefaultAttrs({
                points: [],
                lineCap: 'butt',
                dashArray: [],
                detectionType: 'pixel',
                spline: 0
            });

            this.shapeType = "Line";

            // call super constructor
            Kinetic.Shape.call(this, config);
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
            var points = this.getPoints(), length = points.length, dashArray = this.getDashArray(), dashLength = dashArray.length, context = canvas.getContext(), spline = this.getSpline();
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            // spline
            if(spline !== 0 && length > 2) {
                var ap = this.allPoints, len = ap.length;
                context.quadraticCurveTo(ap[0].x, ap[0].y, ap[1].x, ap[1].y);

                var n = 2;
                while(n < len - 1) {
                    context.bezierCurveTo(ap[n].x, ap[n++].y, ap[n].x, ap[n++].y, ap[n].x, ap[n++].y);
                }

                context.quadraticCurveTo(ap[len - 1].x, ap[len - 1].y, points[length - 1].x, points[length - 1].y);

            }
            // no spline
            else {
                for(var n = 1; n < length; n++) {
                    var point = points[n];
                    context.lineTo(point.x, point.y);
                }
            }

            canvas.stroke(this);
        },
        /**
         * set points array
         * @name setPoints
         * @methodOf Kinetic.Line.prototype
         * @param {Array} can be an array of point objects or an array
         *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
         */
        setPoints: function(val) {
            this.setAttr('points', Kinetic.Type._getPoints(val));
            this._setAllPoints();
        },
        /**
         * set spline
         * @name setSpline
         * @methodOf Kinetic.Line.prototype
         * @param {Number} spline
         */
        setSpline: function(spline) {
        	this.setAttr('spline', spline);
        	this._setAllPoints();
        },
        _setAllPoints: function() {
            var points = this.getPoints(), length = points.length, spline = this.getSpline(), allPoints = [];

            for(var n = 1; n < length - 1; n++) {
                var p0 = points[n - 1], p1 = points[n], p2 = points[n + 1], cp = getControlPoints(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, spline);
                allPoints.push({
                    x: cp[0],
                    y: cp[1]
                });
                allPoints.push(p1);
                allPoints.push({
                    x: cp[2],
                    y: cp[3]
                });
            }

            this.allPoints = allPoints;
        }
    };
    Kinetic.Global.extend(Kinetic.Line, Kinetic.Shape);

    // add getters setters
    Kinetic.Node.addGetters(Kinetic.Line, ['points', 'spline']);

    /**
     * get points array
     * @name getPoints
     * @methodOf Kinetic.Line.prototype
     */
})();
