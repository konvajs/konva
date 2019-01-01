import { Util, Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';
import { GetSet } from '../types';

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
export class Circle extends Shape {
  _centroid = true;

  constructor(config) {
    super(config);
    this.className = CIRCLE;
    this.sceneFunc(this._sceneFunc);
  }

  _sceneFunc(context) {
    context.beginPath();
    context.arc(0, 0, this.radius(), 0, PIx2, false);
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
    // TODO: remove this line?
    Node.prototype['setWidth'].call(this, width);
    if (this.radius() !== width / 2) {
      this.radius(width / 2);
    }
  }
  setHeight(height) {
    // TODO: remove this line?
    Node.prototype['setHeight'].call(this, height);
    if (this.radius() !== height / 2) {
      this.radius(height / 2);
    }
  }

  radius: GetSet<number, this>;
}

// add getters setters
Factory.addGetterSetter(Circle, 'radius', 0, Validators.getNumberValidator());
Factory.addOverloadedGetterSetter(Circle, 'radius');

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

Collection.mapMethods(Circle);
