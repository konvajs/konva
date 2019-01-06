import { Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Shape } from '../Shape';
import { GetSet } from '../types';

var PIx2 = Math.PI * 2;
/**
 * Ring constructor
 * @constructor
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} config.innerRadius
 * @param {Number} config.outerRadius
 * @param {Boolean} [config.clockwise]
 * @@shapeParams
 * @@nodeParams
 * @example
 * var ring = new Konva.Ring({
 *   innerRadius: 40,
 *   outerRadius: 80,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 5
 * });
 */
export class Ring extends Shape {
  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
    context.moveTo(this.outerRadius(), 0);
    context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.outerRadius() * 2;
  }
  getHeight() {
    return this.outerRadius() * 2;
  }
  setWidth(width) {
    if (this.outerRadius() !== width / 2) {
      this.outerRadius(width / 2);
    }
  }
  setHeight(height) {
    if (this.outerRadius() !== height / 2) {
      this.outerRadius(height / 2);
    }
  }

  outerRadius: GetSet<number, this>;
  innerRadius: GetSet<number, this>;
}

Ring.prototype.className = 'Ring';
Ring.prototype._centroid = true;

/**
 * get/set innerRadius
 * @method
 * @name Konva.Ring#innerRadius
 * @param {Number} innerRadius
 * @returns {Number}
 * @example
 * // get inner radius
 * var innerRadius = ring.innerRadius();
 *
 * // set inner radius
 * ring.innerRadius(20);
 */

Factory.addGetterSetter(
  Ring,
  'innerRadius',
  0,
  Validators.getNumberValidator()
);

/**
 * get/set outerRadius
 * @name Konva.Ring#outerRadius
 * @method
 * @param {Number} outerRadius
 * @returns {Number}
 * @example
 * // get outer radius
 * var outerRadius = ring.outerRadius();
 *
 * // set outer radius
 * ring.outerRadius(20);
 */
Factory.addGetterSetter(
  Ring,
  'outerRadius',
  0,
  Validators.getNumberValidator()
);

Collection.mapMethods(Ring);
