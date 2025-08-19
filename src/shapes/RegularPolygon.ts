import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { GetSet, Vector2d } from '../types';
import {
  getNumberOrArrayOfNumbersValidator,
  getNumberValidator,
} from '../Validators';
import { _registerNode } from '../Global';
import { Context } from '../Context';
import { Util } from '../Util';

export interface RegularPolygonConfig extends ShapeConfig {
  sides: number;
  radius: number;
  cornerRadius?: number | number[];
}
/**
 * RegularPolygon constructor. Examples include triangles, squares, pentagons, hexagons, etc.
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} [config.cornerRadius]
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
  _sceneFunc(context: Context) {
    const points = this._getPoints(),
      radius = this.radius(),
      sides = this.sides(),
      cornerRadius = this.cornerRadius();

    context.beginPath();

    if (!cornerRadius) {
      context.moveTo(points[0].x, points[0].y);
      for (let n = 1; n < points.length; n++) {
        context.lineTo(points[n].x, points[n].y);
      }
    } else {
      Util.drawRoundedPolygonPath(context, points, sides, radius, cornerRadius);
    }

    context.closePath();
    context.fillStrokeShape(this);
  }
  _getPoints() {
    const sides = this.attrs.sides as number;
    const radius = this.attrs.radius || 0;
    const points: Vector2d[] = [];
    for (let n = 0; n < sides; n++) {
      points.push({
        x: radius * Math.sin((n * 2 * Math.PI) / sides),
        y: -1 * radius * Math.cos((n * 2 * Math.PI) / sides),
      });
    }
    return points;
  }
  getSelfRect() {
    const points = this._getPoints();

    let minX = points[0].x;
    let maxX = points[0].y;
    let minY = points[0].x;
    let maxY = points[0].y;
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  getWidth() {
    return this.radius() * 2;
  }
  getHeight() {
    return this.radius() * 2;
  }
  setWidth(width: number) {
    this.radius(width / 2);
  }
  setHeight(height: number) {
    this.radius(height / 2);
  }

  radius: GetSet<number, this>;
  sides: GetSet<number, this>;
  cornerRadius: GetSet<number | number[], this>;
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

/**
 * get/set corner radius
 * @method
 * @name Konva.RegularPolygon#cornerRadius
 * @param {Number} cornerRadius
 * @returns {Number}
 * @example
 * // get corner radius
 * var cornerRadius = poly.cornerRadius();
 *
 * // set corner radius
 * poly.cornerRadius(10);
 *
 * // set different corner radius values (pentagon)
 * poly.cornerRadius([0, 10, 20, 30, 40]);
 */
Factory.addGetterSetter(
  RegularPolygon,
  'cornerRadius',
  0,
  getNumberOrArrayOfNumbersValidator(4)
);
