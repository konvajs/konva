import { Collection } from '../Util';
import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { GetSet } from '../types';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

export interface RegularPolygonConfig extends ShapeConfig {
  sides: number;
  radius: number;
}
/**
 * RegularPolygon constructor. Examples include triangles, squares, pentagons, hexagons, etc.
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
export class RegularPolygon extends Shape<RegularPolygonConfig> {
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
  getHeight() {
    return this.radius() * 2;
  }
  setWidth(width) {
    this.radius(width / 2);
  }
  setHeight(height) {
    this.radius(height / 2);
  }

  radius: GetSet<number, this>;
  sides: GetSet<number, this>;
}

RegularPolygon.prototype.className = 'RegularPolygon';
RegularPolygon.prototype._centroid = true;
RegularPolygon.prototype._attrsAffectingSize = ['radius'];
_registerNode(RegularPolygon);

/**
 * get/set radius
 * @method
 * @name Konva.RegularPolygon#radius
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radius
 * var radius = shape.radius();
 *
 * // set radius
 * shape.radius(10);
 */
Factory.addGetterSetter(RegularPolygon, 'radius', 0, getNumberValidator());

/**
 * get/set sides
 * @method
 * @name Konva.RegularPolygon#sides
 * @param {Number} sides
 * @returns {Number}
 * @example
 * // get sides
 * var sides = shape.sides();
 *
 * // set sides
 * shape.sides(10);
 */
Factory.addGetterSetter(RegularPolygon, 'sides', 0, getNumberValidator());

Collection.mapMethods(RegularPolygon);
