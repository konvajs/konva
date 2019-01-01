import { Util, Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';

import { GetSet } from '../types';

/**
 * RegularPolygon constructor.&nbsp; Examples include triangles, squares, pentagons, hexagons, etc.
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} config.sides
 * @param {Number} config.radius
 * @@shapeParams
 * @@nodeParams
 * @example
 * var hexagon = new Konva.RegularPolygon({
 *   x: 100,
 *   y: 200,
 *   sides: 6,
 *   radius: 70,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 4
 * });
 */
export class RegularPolygon extends Shape {
  _centroid = true;

  constructor(config) {
    // call super constructor
    super(config);
    this.className = 'RegularPolygon';
    this.sceneFunc(this._sceneFunc);
  }

  _sceneFunc(context) {
    var sides = this.sides(),
      radius = this.radius(),
      n,
      x,
      y;

    context.beginPath();
    context.moveTo(0, 0 - radius);

    for (n = 1; n < sides; n++) {
      x = radius * Math.sin((n * 2 * Math.PI) / sides);
      y = -1 * radius * Math.cos((n * 2 * Math.PI) / sides);
      context.lineTo(x, y);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radius() * 2;
  }
  // implements Shape.prototype.getHeight()
  getHeight() {
    return this.radius() * 2;
  }
  // implements Shape.prototype.setWidth()
  setWidth(width) {
    // TODO: remove this line
    Node.prototype['setWidth'].call(this, width);
    if (this.radius() !== width / 2) {
      this.radius(width / 2);
    }
  }
  // implements Shape.prototype.setHeight()
  setHeight(height) {
    Node.prototype['setHeight'].call(this, height);
    if (this.radius() !== height / 2) {
      this.radius(height / 2);
    }
  }

  radius: GetSet<number, this>;
  sides: GetSet<number, this>;
}

/**
 * get/set radius
 * @name radius
 * @method
 * @memberof Konva.RegularPolygon.prototype
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radius
 * var radius = shape.radius();
 *
 * // set radius
 * shape.radius(10);
 */
Factory.addGetterSetter(
  RegularPolygon,
  'radius',
  0,
  Validators.getNumberValidator()
);

/**
 * get/set sides
 * @name sides
 * @method
 * @memberof Konva.RegularPolygon.prototype
 * @param {Number} sides
 * @returns {Number}
 * @example
 * // get sides
 * var sides = shape.sides();
 *
 * // set sides
 * shape.sides(10);
 */
Factory.addGetterSetter(
  RegularPolygon,
  'sides',
  0,
  Validators.getNumberValidator()
);

Collection.mapMethods(RegularPolygon);
