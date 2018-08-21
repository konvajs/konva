(function(Konva) {
  'use strict';
  // the 0.0001 offset fixes a bug in Chrome 27
  var PIx2 = Math.PI * 2 - 0.0001,
    CIRCLE = 'Circle';

  /**
   * Circle constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} config.radius
   * @@shapeParams
   * @@nodeParams
   * @example
   * // create circle
   * var circle = new Konva.Circle({
   *   radius: 40,
   *   fill: 'red',
   *   stroke: 'black'
   *   strokeWidth: 5
   * });
   */
  Konva.Circle = function(config) {
    this.___init(config);
  };

  Konva.Circle.prototype = {
    _centroid: true,
    ___init: function(config) {
      // call super constructor
      Konva.Shape.call(this, config);
      this.className = CIRCLE;
      this.sceneFunc(this._sceneFunc);
    },
    _sceneFunc: function(context) {
      context.beginPath();
      context.arc(0, 0, this.getRadius(), 0, PIx2, false);
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
  Konva.Util.extend(Konva.Circle, Konva.Shape);

  // add getters setters
  Konva.Factory.addGetterSetter(
    Konva.Circle,
    'radius',
    0,
    Konva.Validators.getNumberValidator()
  );
  Konva.Factory.addOverloadedGetterSetter(Konva.Circle, 'radius');

  /**
   * get/set radius
   * @name radius
   * @method
   * @memberof Konva.Circle.prototype
   * @param {Number} radius
   * @returns {Number}
   * @example
   * // get radius
   * var radius = circle.radius();
   *
   * // set radius
   * circle.radius(10);
   */

  Konva.Collection.mapMethods(Konva.Circle);
})(Konva);
