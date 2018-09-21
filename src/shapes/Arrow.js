(function(Konva) {
  'use strict';
  /**
   * Arrow constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
   * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
   *   The default is 0
   * @param {Number} config.pointerLength Arrow pointer length. Default value is 10.
   * @param {Number} config.pointerWidth Arrow pointer width. Default value is 10.
   * @param {Boolean} config.pointerAtBeginning Do we need to draw pointer on both sides?. Default false.
   * @@shapeParams
   * @@nodeParams
   * @example
   * var line = new Konva.Line({
   *   points: [73, 70, 340, 23, 450, 60, 500, 20],
   *   stroke: 'red',
   *   tension: 1,
   *   pointerLength : 10,
   *   pointerWidth : 12
   * });
   */
  Konva.Arrow = function(config) {
    this.____init(config);
  };

  Konva.Arrow.prototype = {
    ____init: function(config) {
      // call super constructor
      Konva.Line.call(this, config);
      this.className = 'Arrow';
    },
    _sceneFunc: function(ctx) {
      Konva.Line.prototype._sceneFunc.apply(this, arguments);
      var PI2 = Math.PI * 2;
      var points = this.points();

      var tp = points;
      var fromTension = this.getTension() !== 0 && points.length > 4;
      if (fromTension) {
        tp = this.getTensionPoints();
      }

      var n = points.length;

      var dx, dy;
      if (fromTension) {
        dx = points[n - 2] - tp[n - 2];
        dy = points[n - 1] - tp[n - 1];
      } else {
        dx = points[n - 2] - points[n - 4];
        dy = points[n - 1] - points[n - 3];
      }

      var radians = (Math.atan2(dy, dx) + PI2) % PI2;
      var length = this.pointerLength();
      var width = this.pointerWidth();

      ctx.save();
      ctx.beginPath();
      ctx.translate(points[n - 2], points[n - 1]);
      ctx.rotate(radians);
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, width / 2);
      ctx.lineTo(-length, -width / 2);
      ctx.closePath();
      ctx.restore();

      if (this.pointerAtBeginning()) {
        ctx.save();
        ctx.translate(points[0], points[1]);
        if (fromTension) {
          dx = tp[0] - points[0];
          dy = tp[1] - points[1];
        } else {
          dx = points[2] - points[0];
          dy = points[3] - points[1];
        }

        ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
        ctx.moveTo(0, 0);
        ctx.lineTo(-length, width / 2);
        ctx.lineTo(-length, -width / 2);
        ctx.closePath();
        ctx.restore();
      }

      // here is a tricky part
      // we need to disable dash for arrow pointers
      var isDashEnabled = this.dashEnabled();
      if (isDashEnabled) {
        // manually disable dash for head
        // it is better not to use setter here,
        // because it will trigger attr change event
        this.attrs.dashEnabled = false;
        ctx.setLineDash([]);
      }

      ctx.fillStrokeShape(this);

      // restore old value
      if (isDashEnabled) {
        this.attrs.dashEnabled = true;
      }
    }
  };

  Konva.Util.extend(Konva.Arrow, Konva.Line);
  /**
   * get/set pointerLength
   * @name pointerLength
   * @method
   * @memberof Konva.Arrow.prototype
   * @param {Number} Length of pointer of arrow.
   *   The default is 10.
   * @returns {Number}
   * @example
   * // get tension
   * var pointerLength = line.pointerLength();
   *
   * // set tension
   * line.pointerLength(15);
   */

  Konva.Factory.addGetterSetter(
    Konva.Arrow,
    'pointerLength',
    10,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set pointerWidth
   * @name pointerWidth
   * @method
   * @memberof Konva.Arrow.prototype
   * @param {Number} Width of pointer of arrow.
   *   The default is 10.
   * @returns {Number}
   * @example
   * // get tension
   * var pointerWidth = line.pointerWidth();
   *
   * // set tension
   * line.pointerWidth(15);
   */

  Konva.Factory.addGetterSetter(
    Konva.Arrow,
    'pointerWidth',
    10,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set pointerAtBeginning
   * @name pointerAtBeginning
   * @method
   * @memberof Konva.Arrow.prototype
   * @param {Number} Should pointer displayed at beginning of arrow.
   *   The default is false.
   * @returns {Boolean}
   * @example
   * // get tension
   * var pointerAtBeginning = line.pointerAtBeginning();
   *
   * // set tension
   * line.pointerAtBeginning(true);
   */

  Konva.Factory.addGetterSetter(Konva.Arrow, 'pointerAtBeginning', false);
  Konva.Collection.mapMethods(Konva.Arrow);
})(Konva);
