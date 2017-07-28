(function() {
  'use strict';
  /**
     * Star constructor
     * @constructor
     * @memberof Konva
     * @augments Konva.Shape
     * @param {Object} config
     * @param {Integer} config.numPoints
     * @param {Number} config.innerRadius
     * @param {Number} config.outerRadius
     * @@shapeParams
     * @@nodeParams
     * @example
     * var star = new Konva.Star({
     *   x: 100,
     *   y: 200,
     *   numPoints: 5,
     *   innerRadius: 70,
     *   outerRadius: 70,
     *   fill: 'red',
     *   stroke: 'black',
     *   strokeWidth: 4
     * });
     */
  Konva.Star = function(config) {
    this.___init(config);
  };

  Konva.Star.prototype = {
    _centroid: true,
    ___init: function(config) {
      // call super constructor
      Konva.Shape.call(this, config);
      this.className = 'Star';
      this.sceneFunc(this._sceneFunc);
    },
    _sceneFunc: function(context) {
      var innerRadius = this.innerRadius(),
        outerRadius = this.outerRadius(),
        numPoints = this.numPoints();

      context.beginPath();
      context.moveTo(0, 0 - outerRadius);

      for (var n = 1; n < numPoints * 2; n++) {
        var radius = n % 2 === 0 ? outerRadius : innerRadius;
        var x = radius * Math.sin(n * Math.PI / numPoints);
        var y = -1 * radius * Math.cos(n * Math.PI / numPoints);
        context.lineTo(x, y);
      }
      context.closePath();

      context.fillStrokeShape(this);
    },
    // implements Shape.prototype.getWidth()
    getWidth: function() {
      return this.getOuterRadius() * 2;
    },
    // implements Shape.prototype.getHeight()
    getHeight: function() {
      return this.getOuterRadius() * 2;
    },
    // implements Shape.prototype.setWidth()
    setWidth: function(width) {
      Konva.Node.prototype.setWidth.call(this, width);
      if (this.outerRadius() !== width / 2) {
        this.setOuterRadius(width / 2);
      }
    },
    // implements Shape.prototype.setHeight()
    setHeight: function(height) {
      Konva.Node.prototype.setHeight.call(this, height);
      if (this.outerRadius() !== height / 2) {
        this.setOuterRadius(height / 2);
      }
    }
  };
  Konva.Util.extend(Konva.Star, Konva.Shape);

  // add getters setters
  Konva.Factory.addGetterSetter(Konva.Star, 'numPoints', 5);

  /**
     * set number of points
     * @name setNumPoints
     * @method
     * @memberof Konva.Star.prototype
     * @param {Integer} points
     */

  /**
     * get number of points
     * @name getNumPoints
     * @method
     * @memberof Konva.Star.prototype
     */

  Konva.Factory.addGetterSetter(Konva.Star, 'innerRadius', 0);

  /**
     * set inner radius
     * @name setInnerRadius
     * @method
     * @memberof Konva.Star.prototype
     * @param {Number} radius
     */

  /**
     * get inner radius
     * @name getInnerRadius
     * @method
     * @memberof Konva.Star.prototype
     */

  Konva.Factory.addGetterSetter(Konva.Star, 'outerRadius', 0);

  /**
     * set outer radius
     * @name setOuterRadius
     * @method
     * @memberof Konva.Star.prototype
     * @param {Number} radius
     */

  /**
     * get outer radius
     * @name getOuterRadius
     * @method
     * @memberof Konva.Star.prototype
     */

  Konva.Collection.mapMethods(Konva.Star);
})();
