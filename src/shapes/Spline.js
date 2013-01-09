(function() {
    /**
     * Spline constructor.&nbsp; Splines are defined by an array of points and
     *  a tension
     * @constructor
     * @augments Kinetic.Line
     * @param {Object} config
     * @param {Array} config.points can be a flattened array of points, an array of point arrays, or an array of point objects.
     *  e.g. [0,1,2,3], [[0,1],[2,3]] and [{x:0,y:1},{x:2,y:3}] are equivalent
     * @param {Number} [config.tension] default value is 1.  Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
     * 
     *
     * @param {String} [config.fill] fill color
     *
     * @param {Image} [config.fillPatternImage] fill pattern image
     * @param {Number} [config.fillPatternX]
     * @param {Number} [config.fillPatternY]
     * @param {Array|Object} [config.fillPatternOffset] array with two elements or object with x and y component
     * @param {Array|Object} [config.fillPatternScale] array with two elements or object with x and y component
     * @param {Number} [config.fillPatternRotation]
     * @param {String} [config.fillPatternRepeat] can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'no-repeat'
     *
     * @param {Array|Object} [config.fillLinearGradientStartPoint] array with two elements or object with x and y component
     * @param {Array|Object} [config.fillLinearGradientEndPoint] array with two elements or object with x and y component
     * @param {Array} [config.fillLinearGradientColorStops] array of color stops
     *
     * @param {Array|Object} [config.fillRadialGradientStartPoint] array with two elements or object with x and y component
     * @param {Array|Object} [config.fillRadialGradientEndPoint] array with two elements or object with x and y component
     * @param {Number} [config.fillRadialGradientStartRadius]
     * @param {Number} [config.fillRadialGradientEndRadius]
     * @param {Array} [config.fillRadialGradientColorStops] array of color stops
     *
     * @param {String} [config.stroke] stroke color
     * @param {Number} [config.strokeWidth] stroke width
     * @param {String} [config.lineJoin] can be miter, round, or bevel.  The default
     *  is miter
     * @param {String} [config.lineCap] can be butt, round, or sqare.  The default
     *  is butt
     * @param {String} [config.shadowColor]
     * @param {Number} [config.shadowBlur]
     * @param {Obect} [config.shadowOffset]
     * @param {Number} [config.shadowOffset.x]
     * @param {Number} [config.shadowOffset.y]
     * @param {Number} [config.shadowOpacity] shadow opacity.  Can be any real number
     *  between 0 and 1
     * @param {Array} [config.dashArray]
     * 
     * 
     * 
     * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Boolean} [config.visible]
     * @param {Boolean} [config.listening] whether or not the node is listening for events
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @param {Object} [config.scale]
     * @param {Number} [config.scale.x]
     * @param {Number} [config.scale.y]
     * @param {Number} [config.rotation] rotation in radians
     * @param {Number} [config.rotationDeg] rotation in degrees
     * @param {Object} [config.offset] offset from center point and rotation point
     * @param {Number} [config.offset.x]
     * @param {Number} [config.offset.y]
     * @param {Boolean} [config.draggable]
     * @param {Function} [config.dragBoundFunc]
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
