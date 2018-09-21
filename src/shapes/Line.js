(function() {
  'use strict';
  /**
   * Line constructor.&nbsp; Lines are defined by an array of points and
   *  a tension
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
   * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
   *   The default is 0
   * @param {Boolean} [config.closed] defines whether or not the line shape is closed, creating a polygon or blob
   * @param {Boolean} [config.bezier] if no tension is provided but bezier=true, we draw the line as a bezier using the passed points
   * @@shapeParams
   * @@nodeParams
   * @example
   * var line = new Konva.Line({
   *   x: 100,
   *   y: 50,
   *   points: [73, 70, 340, 23, 450, 60, 500, 20],
   *   stroke: 'red',
   *   tension: 1
   * });
   */
  Konva.Line = function(config) {
    this.___init(config);
  };

  Konva.Line.prototype = {
    ___init: function(config) {
      // call super constructor
      Konva.Shape.call(this, config);
      this.className = 'Line';

      this.on(
        'pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva',
        function() {
          this._clearCache('tensionPoints');
        }
      );

      this.sceneFunc(this._sceneFunc);
    },
    _sceneFunc: function(context) {
      var points = this.getPoints(),
        length = points.length,
        tension = this.getTension(),
        closed = this.getClosed(),
        bezier = this.getBezier(),
        tp,
        len,
        n;

      if (!length) {
        return;
      }

      context.beginPath();
      context.moveTo(points[0], points[1]);

      // tension
      if (tension !== 0 && length > 4) {
        tp = this.getTensionPoints();
        len = tp.length;
        n = closed ? 0 : 4;

        if (!closed) {
          context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
        }

        while (n < len - 2) {
          context.bezierCurveTo(
            tp[n++],
            tp[n++],
            tp[n++],
            tp[n++],
            tp[n++],
            tp[n++]
          );
        }

        if (!closed) {
          context.quadraticCurveTo(
            tp[len - 2],
            tp[len - 1],
            points[length - 2],
            points[length - 1]
          );
        }
      } else if (bezier) {
        // no tension but bezier
        n = 2;

        while (n < length) {
          context.bezierCurveTo(
            points[n++],
            points[n++],
            points[n++],
            points[n++],
            points[n++],
            points[n++]
          );
        }
      } else {
        // no tension
        for (n = 2; n < length; n += 2) {
          context.lineTo(points[n], points[n + 1]);
        }
      }

      // closed e.g. polygons and blobs
      if (closed) {
        context.closePath();
        context.fillStrokeShape(this);
      } else {
        // open e.g. lines and splines
        context.strokeShape(this);
      }
    },
    getTensionPoints: function() {
      return this._getCache('tensionPoints', this._getTensionPoints);
    },
    _getTensionPoints: function() {
      if (this.getClosed()) {
        return this._getTensionPointsClosed();
      } else {
        return Konva.Util._expandPoints(this.getPoints(), this.getTension());
      }
    },
    _getTensionPointsClosed: function() {
      var p = this.getPoints(),
        len = p.length,
        tension = this.getTension(),
        util = Konva.Util,
        firstControlPoints = util._getControlPoints(
          p[len - 2],
          p[len - 1],
          p[0],
          p[1],
          p[2],
          p[3],
          tension
        ),
        lastControlPoints = util._getControlPoints(
          p[len - 4],
          p[len - 3],
          p[len - 2],
          p[len - 1],
          p[0],
          p[1],
          tension
        ),
        middle = Konva.Util._expandPoints(p, tension),
        tp = [firstControlPoints[2], firstControlPoints[3]]
          .concat(middle)
          .concat([
            lastControlPoints[0],
            lastControlPoints[1],
            p[len - 2],
            p[len - 1],
            lastControlPoints[2],
            lastControlPoints[3],
            firstControlPoints[0],
            firstControlPoints[1],
            p[0],
            p[1]
          ]);

      return tp;
    },
    getWidth: function() {
      return this.getSelfRect().width;
    },
    getHeight: function() {
      return this.getSelfRect().height;
    },
    // overload size detection
    getSelfRect: function() {
      var points;
      if (this.getTension() !== 0) {
        points = this._getTensionPoints();
      } else {
        points = this.getPoints();
      }
      var minX = points[0];
      var maxX = points[0];
      var minY = points[1];
      var maxY = points[1];
      var x, y;
      for (var i = 0; i < points.length / 2; i++) {
        x = points[i * 2];
        y = points[i * 2 + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      return {
        x: Math.round(minX),
        y: Math.round(minY),
        width: Math.round(maxX - minX),
        height: Math.round(maxY - minY)
      };
    }
  };
  Konva.Util.extend(Konva.Line, Konva.Shape);

  // add getters setters
  Konva.Factory.addGetterSetter(Konva.Line, 'closed', false);

  /**
   * get/set closed flag.  The default is false
   * @name closed
   * @method
   * @memberof Konva.Line.prototype
   * @param {Boolean} closed
   * @returns {Boolean}
   * @example
   * // get closed flag
   * var closed = line.closed();
   *
   * // close the shape
   * line.closed(true);
   *
   * // open the shape
   * line.closed(false);
   */

  Konva.Factory.addGetterSetter(Konva.Line, 'bezier', false);

  /**
   * get/set bezier flag.  The default is false
   * @name bezier
   * @method
   * @memberof Konva.Line.prototype
   * @param {Boolean} bezier
   * @returns {Boolean}
   * @example
   * // get whether the line is a bezier
   * var isBezier = line.bezier();
   *
   * // set whether the line is a bezier
   * line.bezier(true);
   */

  Konva.Factory.addGetterSetter(
    Konva.Line,
    'tension',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set tension
   * @name tension
   * @method
   * @memberof Konva.Line.prototype
   * @param {Number} Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
   *   The default is 0
   * @returns {Number}
   * @example
   * // get tension
   * var tension = line.tension();
   *
   * // set tension
   * line.tension(3);
   */

  Konva.Factory.addGetterSetter(
    Konva.Line,
    'points',
    [],
    Konva.Validators.getNumberArrayValidator()
  );
  /**
   * get/set points array
   * @name points
   * @method
   * @memberof Konva.Line.prototype
   * @param {Array} points
   * @returns {Array}
   * @example
   * // get points
   * var points = line.points();
   *
   * // set points
   * line.points([10, 20, 30, 40, 50, 60]);
   *
   * // push a new point
   * line.points(line.points().concat([70, 80]));
   */

  Konva.Collection.mapMethods(Konva.Line);
})();
