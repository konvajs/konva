import { Factory } from '../Factory.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet } from '../types.ts';
import { getNumberValidator } from '../Validators.ts';
import { _registerNode } from '../Global.ts';
import type { Context } from '../Context.ts';

export interface CircleConfig extends ShapeConfig {
  radius?: number;
}

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
 *   stroke: 'black',
 *   strokeWidth: 5
 * });
 */
export class Circle extends Shape<CircleConfig> {
  _getStrokePadding() {
    return super._getStrokePadding(1);
  }
  _sceneFunc(context: Context) {
    context.beginPath();
    context.arc(0, 0, Math.abs(this.attrs.radius || 0), 0, Math.PI * 2, false);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return Math.abs(this.radius()) * 2;
  }
  getHeight() {
    return Math.abs(this.radius()) * 2;
  }
  setWidth(width: number) {
    this.radius(width / 2);
  }
  setHeight(height: number) {
    this.radius(height / 2);
  }

  radius: GetSet<number, this>;
}

Circle.prototype._centroid = true;
Circle.prototype.className = 'Circle';
Circle.prototype._attrsAffectingSize = ['radius'];
_registerNode(Circle, true);

/**
 * get/set radius
 * @name Konva.Circle#radius
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
Factory.addGetterSetter(Circle, 'radius', 0, getNumberValidator());
