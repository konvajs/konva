import { Util, Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';
import { GetSet } from '../types';

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
export class Circle extends Shape {
  className = 'Circle';
  _centroid = true;

  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.radius(), 0, Math.PI * 2, false);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radius() * 2;
  }
  getHeight() {
    return this.radius() * 2;
  }
  setWidth(width) {
    if (this.radius() !== width / 2) {
      this.radius(width / 2);
    }
  }
  setHeight(height) {
    if (this.radius() !== height / 2) {
      this.radius(height / 2);
    }
  }

  radius: GetSet<number, this>;
}

Circle.prototype.className = 'Circle';

// add getters setters
Factory.addGetterSetter(Circle, 'radius', 0, Validators.getNumberValidator());

/**
 * get/set radius
 * @name Konva.Arrow#radius
 * @method
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radius
 * var radius = circle.radius();
 *
 * // set radius
 * circle.radius(10);
 */

Collection.mapMethods(Circle);
