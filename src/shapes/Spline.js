(function() {
    /**
     * Spline constructor.&nbsp; Splines are defined by an array of points and
     *  a tension
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Number} config.tension default value is 1.  Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
     * @augments Kinetic.Line
     */
    Kinetic.Spline = function(config) {
        this._initSpline(config);
    };
    Kinetic.Spline._getControlPoints = function(p0, p1, p2, t) {
        var x0 = p0.x;
        var y0 = p0.y;
        var x1 = p1.x;
        var y1 = p1.y;
        var x2 = p2.x;
        var y2 = p2.y;
        var d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        var d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        var fa = t * d01 / (d01 + d12);
        var fb = t * d12 / (d01 + d12);
        var p1x = x1 - fa * (x2 - x0);
        var p1y = y1 - fa * (y2 - y0);
        var p2x = x1 + fb * (x2 - x0);
        var p2y = y1 + fb * (y2 - y0);
        return [{
            x: p1x,
            y: p1y
        }, {
            x: p2x,
            y: p2y
        }];
    };

    Kinetic.Spline.prototype = {
        _initSpline: function(config) {
            this.setDefaultAttrs({
                tension: 1
            });

            // call super constructor
            Kinetic.Line.call(this, config);
            this.shapeType = 'Spline';
        },
        drawFunc: function(canvas) {
            var points = this.getPoints(), length = points.length, context = canvas.getContext(), tension = this.getTension();
            context.beginPath();
            context.moveTo(points[0].x, points[0].y);

            // tension
            if(tension !== 0 && length > 2) {
                var ap = this.allPoints, len = ap.length;
                context.quadraticCurveTo(ap[0].x, ap[0].y, ap[1].x, ap[1].y);

                var n = 2;
                while(n < len - 1) {
                    context.bezierCurveTo(ap[n].x, ap[n++].y, ap[n].x, ap[n++].y, ap[n].x, ap[n++].y);
                }

                context.quadraticCurveTo(ap[len - 1].x, ap[len - 1].y, points[length - 1].x, points[length - 1].y);

            }
            // no tension
            else {
                for(var n = 1; n < length; n++) {
                    var point = points[n];
                    context.lineTo(point.x, point.y);
                }
            }

            canvas.stroke(this);
        },
        setPoints: function(val) {
            Kinetic.Line.prototype.setPoints.call(this, val);
            this._setAllPoints();
        },
        /**
         * set tension
         * @name setTension
         * @methodOf Kinetic.Spline.prototype
         * @param {Number} tension
         */
        setTension: function(tension) {
            this.setAttr('tension', tension);
            this._setAllPoints();
        },
        _setAllPoints: function() {
            var points = this.getPoints(), length = points.length, tension = this.getTension(), allPoints = [];

            for(var n = 1; n < length - 1; n++) {
                var cp = Kinetic.Spline._getControlPoints(points[n - 1], points[n], points[n + 1], tension);
                allPoints.push(cp[0]);
                allPoints.push(points[n]);
                allPoints.push(cp[1]);
            }

            this.allPoints = allPoints;
        }
    };
    Kinetic.Global.extend(Kinetic.Spline, Kinetic.Line);

    // add getters setters
    Kinetic.Node.addGetters(Kinetic.Spline, ['tension']);

    /**
     * get tension
     * @name getTension
     * @methodOf Kinetic.Spline.prototype
     */
})();
