(function() {
    /**
     * Star constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {Integer} config.numPoints
     * @param {Number} config.innerRadius
     * @param {Number} config.outerRadius
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
    Kinetic.Star = function(config) {
        this._initStar(config);
    };

    Kinetic.Star.prototype = {
        _initStar: function(config) {
            this.setDefaultAttrs({
                numPoints: 0,
                innerRadius: 0,
                outerRadius: 0
            });

            // call super constructor
            Kinetic.Shape.call(this, config);
            this.shapeType = 'Star';
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
            var context = canvas.getContext(), innerRadius = this.attrs.innerRadius, outerRadius = this.attrs.outerRadius, numPoints = this.attrs.numPoints;

            context.beginPath();
            context.moveTo(0, 0 - this.attrs.outerRadius);

            for(var n = 1; n < numPoints * 2; n++) {
                var radius = n % 2 === 0 ? outerRadius : innerRadius;
                var x = radius * Math.sin(n * Math.PI / numPoints);
                var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
                context.lineTo(x, y);
            }
            context.closePath();

            canvas.fillStroke(this);
        }
    };
    Kinetic.Global.extend(Kinetic.Star, Kinetic.Shape);

    // add getters setters
    Kinetic.Node.addGettersSetters(Kinetic.Star, ['numPoints', 'innerRadius', 'outerRadius']);

    /**
     * set number of points
     * @name setNumPoints
     * @methodOf Kinetic.Star.prototype
     * @param {Integer} points
     */

    /**
     * set outer radius
     * @name setOuterRadius
     * @methodOf Kinetic.Star.prototype
     * @param {Number} radius
     */

    /**
     * set inner radius
     * @name setInnerRadius
     * @methodOf Kinetic.Star.prototype
     * @param {Number} radius
     */

    /**
     * get number of points
     * @name getNumPoints
     * @methodOf Kinetic.Star.prototype
     */

    /**
     * get outer radius
     * @name getOuterRadius
     * @methodOf Kinetic.Star.prototype
     */

    /**
     * get inner radius
     * @name getInnerRadius
     * @methodOf Kinetic.Star.prototype
     */
})();
