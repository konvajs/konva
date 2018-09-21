(function() {
  'use strict';
  /**
   * Rect constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Number} [config.cornerRadius]
   * @@shapeParams
   * @@nodeParams
   * @example
   * var rect = new Konva.Rect({
   *   width: 100,
   *   height: 50,
   *   fill: 'red',
   *   stroke: 'black',
   *   strokeWidth: 5
   * });
   */
  Konva.Rect = function(config) {
    this.___init(config);
  };

  Konva.Rect.prototype = {
    ___init: function(config) {
      Konva.Shape.call(this, config);
      this.className = 'Rect';
      this.sceneFunc(this._sceneFunc);
    },
    _sceneFunc: function(context) {
      var cornerRadius = this.getCornerRadius(),
        width = this.getWidth(),
        height = this.getHeight();

      context.beginPath();

      if (!cornerRadius) {
        // simple rect - don't bother doing all that complicated maths stuff.
        context.rect(0, 0, width, height);
      } else {
        // arcTo would be nicer, but browser support is patchy (Opera)
        cornerRadius = Math.min(cornerRadius, width / 2, height / 2);
        context.moveTo(cornerRadius, 0);
        context.lineTo(width - cornerRadius, 0);
        context.arc(
          width - cornerRadius,
          cornerRadius,
          cornerRadius,
          Math.PI * 3 / 2,
          0,
          false
        );
        context.lineTo(width, height - cornerRadius);
        context.arc(
          width - cornerRadius,
          height - cornerRadius,
          cornerRadius,
          0,
          Math.PI / 2,
          false
        );
        context.lineTo(cornerRadius, height);
        context.arc(
          cornerRadius,
          height - cornerRadius,
          cornerRadius,
          Math.PI / 2,
          Math.PI,
          false
        );
        context.lineTo(0, cornerRadius);
        context.arc(
          cornerRadius,
          cornerRadius,
          cornerRadius,
          Math.PI,
          Math.PI * 3 / 2,
          false
        );
      }
      context.closePath();
      context.fillStrokeShape(this);
    }
  };

  Konva.Util.extend(Konva.Rect, Konva.Shape);

  Konva.Factory.addGetterSetter(
    Konva.Rect,
    'cornerRadius',
    0,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set corner radius
   * @name cornerRadius
   * @method
   * @memberof Konva.Rect.prototype
   * @param {Number} cornerRadius
   * @returns {Number}
   * @example
   * // get corner radius
   * var cornerRadius = rect.cornerRadius();
   *
   * // set corner radius
   * rect.cornerRadius(10);
   */

  Konva.Collection.mapMethods(Konva.Rect);
})();
