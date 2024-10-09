import { Factory } from '../Factory';
import { Context } from '../Context';
import { Shape, ShapeConfig } from '../Shape';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

import { GetSet } from '../types';

export interface StarConfig extends ShapeConfig {
  numPoints: number;
  innerRadius: number;
  outerRadius: number;
}

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
export class Star extends Shape<StarConfig> {
  _sceneFunc(context: Context) {
    const innerRadius = this.innerRadius(),
      outerRadius = this.outerRadius(),
      numPoints = this.numPoints();

    context.beginPath();
    context.moveTo(0, 0 - outerRadius);

    for (let n = 1; n < numPoints * 2; n++) {
      const radius = n % 2 === 0 ? outerRadius : innerRadius;
      const x = radius * Math.sin((n * Math.PI) / numPoints);
      const y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
      context.lineTo(x, y);
    }
    context.closePath();

    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.outerRadius() * 2;
  }
  getHeight() {
    return this.outerRadius() * 2;
  }
  setWidth(width: number) {
    this.outerRadius(width / 2);
  }
  setHeight(height: number) {
    this.outerRadius(height / 2);
  }

  outerRadius: GetSet<number, this>;
  innerRadius: GetSet<number, this>;
  numPoints: GetSet<number, this>;
}

Star.prototype.className = 'Star';
Star.prototype._centroid = true;
Star.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
_registerNode(Star);

/**
 * get/set number of points
 * @name Konva.Star#numPoints
 * @method
 * @param {Number} numPoints
 * @returns {Number}
 * @example
 * // get inner radius
 * var numPoints = star.numPoints();
 *
 * // set inner radius
 * star.numPoints(20);
 */
Factory.addGetterSetter(Star, 'numPoints', 5, getNumberValidator());

/**
 * get/set innerRadius
 * @name Konva.Star#innerRadius
 * @method
 * @param {Number} innerRadius
 * @returns {Number}
 * @example
 * // get inner radius
 * var innerRadius = star.innerRadius();
 *
 * // set inner radius
 * star.innerRadius(20);
 */
Factory.addGetterSetter(Star, 'innerRadius', 0, getNumberValidator());

/**
 * get/set outerRadius
 * @name Konva.Star#outerRadius
 * @method
 * @param {Number} outerRadius
 * @returns {Number}
 * @example
 * // get inner radius
 * var outerRadius = star.outerRadius();
 *
 * // set inner radius
 * star.outerRadius(20);
 */

Factory.addGetterSetter(Star, 'outerRadius', 0, getNumberValidator());
