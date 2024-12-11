import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { _registerNode } from '../Global';

import { Util } from '../Util';
import { GetSet } from '../types';
import { Context } from '../Context';
import { getNumberOrArrayOfNumbersValidator } from '../Validators';

export interface RectConfig extends ShapeConfig {
  cornerRadius?: number | number[];
}

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
export class Rect extends Shape<RectConfig> {
  _sceneFunc(context: Context) {
    const cornerRadius = this.cornerRadius(),
      width = this.width(),
      height = this.height();

    context.beginPath();

    if (!cornerRadius) {
      // simple rect - don't bother doing all that complicated maths stuff.
      context.rect(0, 0, width, height);
    } else {
      Util.drawRoundedRectPath(context, width, height, cornerRadius);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }

  cornerRadius: GetSet<number | number[], this>;
}

Rect.prototype.className = 'Rect';
_registerNode(Rect);

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
 *
 * // set different corner radius values
 * // top-left, top-right, bottom-right, bottom-left
 * rect.cornerRadius([0, 10, 20, 30]);
 */
Factory.addGetterSetter(
  Rect,
  'cornerRadius',
  0,
  getNumberOrArrayOfNumbersValidator(4)
);
