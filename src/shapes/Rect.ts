import { Util, Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Shape } from '../Shape';

import { GetSet } from '../types';

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
export class Rect extends Shape {
  _sceneFunc(context) {
    var cornerRadius = this.cornerRadius(),
      width = this.width(),
      height = this.height();

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
        (Math.PI * 3) / 2,
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
        (Math.PI * 3) / 2,
        false
      );
    }
    context.closePath();
    context.fillStrokeShape(this);
  }

  cornerRadius: GetSet<number, this>;
}

Rect.prototype.className = 'Rect';

/**
 * get/set corner radius
 * @method
 * @name Konva.Rect#cornerRadius
 * @param {Number} cornerRadius
 * @returns {Number}
 * @example
 * // get corner radius
 * var cornerRadius = rect.cornerRadius();
 *
 * // set corner radius
 * rect.cornerRadius(10);
 */
Factory.addGetterSetter(
  Rect,
  'cornerRadius',
  0,
  Validators.getNumberValidator()
);

Collection.mapMethods(Rect);
