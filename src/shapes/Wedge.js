(function() {
  'use strict';
  /**
     * Wedge constructor
     * @constructor
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Number} config.angle in degrees
     * @param {Number} config.radius
     * @param {Boolean} [config.clockwise]
     * @@shapeParams
     * @@nodeParams
     * @example
     * // draw a wedge that's pointing downwards
     * var wedge = new Konva.Wedge({
     *   radius: 40,
     *   fill: 'red',
     *   stroke: 'black'
     *   strokeWidth: 5,
     *   angleDeg: 60,
     *   rotationDeg: -120
     * });
     */
  Konva.Wedge = function(config) {
    this.___init(config);
  };

  Konva.Wedge.prototype = {
    _centroid: true,
    ___init: function(config) {
      // call super constructor
      Konva.Shape.call(this, config);
      this.className = 'Wedge';
      this.sceneFunc(this._sceneFunc);
    },
    _sceneFunc: function(context) {
      context.beginPath();
      context.arc(
        0,
        0,
        this.getRadius(),
        0,
        Konva.getAngle(this.getAngle()),
        this.getClockwise()
      );
      context.lineTo(0, 0);
      context.closePath();
      context.fillStrokeShape(this);
    },
    // implements Shape.prototype.getWidth()
    getWidth: function() {
      return this.getRadius() * 2;
    },
    // implements Shape.prototype.getHeight()
    getHeight: function() {
      return this.getRadius() * 2;
    },
    // implements Shape.prototype.setWidth()
    setWidth: function(width) {
      Konva.Node.prototype.setWidth.call(this, width);
      if (this.radius() !== width / 2) {
        this.setRadius(width / 2);
      }
    },
    // implements Shape.prototype.setHeight()
    setHeight: function(height) {
      Konva.Node.prototype.setHeight.call(this, height);
      if (this.radius() !== height / 2) {
        this.setRadius(height / 2);
      }
    }
  };
  Konva.Util.extend(Konva.Wedge, Konva.Shape);

  // add getters setters
  Konva.Factory.addGetterSetter(Konva.Wedge, 'radius', 0);

  /**
     * get/set radius
     * @name radius
     * @method
     * @memberof Konva.Wedge.prototype
     * @param {Number} radius
     * @returns {Number}
     * @example
     * // get radius
     * var radius = wedge.radius();
     *
     * // set radius
     * wedge.radius(10);
     */

  Konva.Factory.addGetterSetter(Konva.Wedge, 'angle', 0);

  /**
     * get/set angle in degrees
     * @name angle
     * @method
     * @memberof Konva.Wedge.prototype
     * @param {Number} angle
     * @returns {Number}
     * @example
     * // get angle
     * var angle = wedge.angle();
     *
     * // set angle
     * wedge.angle(20);
     */

  Konva.Factory.addGetterSetter(Konva.Wedge, 'clockwise', false);

  /**
     * get/set clockwise flag
     * @name clockwise
     * @method
     * @memberof Konva.Wedge.prototype
     * @param {Number} clockwise
     * @returns {Number}
     * @example
     * // get clockwise flag
     * var clockwise = wedge.clockwise();
     *
     * // draw wedge counter-clockwise
     * wedge.clockwise(false);
     *
     * // draw wedge clockwise
     * wedge.clockwise(true);
     */

  Konva.Factory.backCompat(Konva.Wedge, {
    angleDeg: 'angle',
    getAngleDeg: 'getAngle',
    setAngleDeg: 'setAngle'
  });

  Konva.Collection.mapMethods(Konva.Wedge);
})();
