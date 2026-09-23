import { Factory } from '../Factory.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { getNumberValidator } from '../Validators.ts';
import { _registerNode } from '../Global.ts';
import type { Context } from '../Context.ts';

import type { GetSet, Vector2d } from '../types.ts';

export interface EllipseConfig extends ShapeConfig {
  radius?: Vector2d;
  radiusX?: number;
  radiusY?: number;
}

/**
 * Ellipse constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Object} config.radius defines x and y radius
 * @@shapeParams
 * @@nodeParams
 * @example
 * var ellipse = new Konva.Ellipse({
 *   radius : {
 *     x : 50,
 *     y : 50
 *   },
 *   fill: 'red'
 * });
 */
export class Ellipse extends Shape<EllipseConfig> {
  _getStrokePadding() {
    return super._getStrokePadding(1);
  }
  _sceneFunc(context: Context) {
    const rx = Math.abs(this.radiusX()),
      ry = Math.abs(this.radiusY());

    context.beginPath();
    context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return Math.abs(this.radiusX()) * 2;
  }
  getHeight() {
    return Math.abs(this.radiusY()) * 2;
  }
  setWidth(width: number) {
    this.radiusX(width / 2);
  }
  setHeight(height: number) {
    this.radiusY(height / 2);
  }

  radius: GetSet<Vector2d, this>;
  radiusX: GetSet<number, this>;
  radiusY: GetSet<number, this>;
}

Ellipse.prototype.className = 'Ellipse';
Ellipse.prototype._centroid = true;
Ellipse.prototype._attrsAffectingSize = ['radiusX', 'radiusY'];
_registerNode(Ellipse, true);

// add getters setters
Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);

/**
 * get/set radius
 * @name Konva.Ellipse#radius
 * @method
 * @param {Object} radius
 * @param {Number} radius.x
 * @param {Number} radius.y
 * @returns {Object}
 * @example
 * // get radius
 * var radius = ellipse.radius();
 *
 * // set radius
 * ellipse.radius({
 *   x: 200,
 *   y: 100
 * });
 */

Factory.addGetterSetter(Ellipse, 'radiusX', 0, getNumberValidator());
/**
 * get/set radius x
 * @name Konva.Ellipse#radiusX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get radius x
 * var radiusX = ellipse.radiusX();
 *
 * // set radius x
 * ellipse.radiusX(200);
 */

Factory.addGetterSetter(Ellipse, 'radiusY', 0, getNumberValidator());
/**
 * get/set radius y
 * @name Konva.Ellipse#radiusY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get radius y
 * var radiusY = ellipse.radiusY();
 *
 * // set radius y
 * ellipse.radiusY(200);
 */
