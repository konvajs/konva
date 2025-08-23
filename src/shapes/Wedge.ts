import { Factory } from '../Factory.ts';
import type { Context } from '../Context.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { Konva } from '../Global.ts';
import { getNumberValidator } from '../Validators.ts';
import { _registerNode } from '../Global.ts';

import type { GetSet } from '../types.ts';

export interface WedgeConfig extends ShapeConfig {
  angle: number;
  radius: number;
  clockwise?: boolean;
}

/**
 * Wedge constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} config.angle in degrees
 * @param {Number} config.radius
 * @param {Boolean} [config.clockwise]
 * @@shapeParams
 * @@nodeParams
 * @example
 * // draw a wedge that's pointing downwards
 * var wedge = new Konva.Wedge({
 *   radius: 40,
 *   fill: 'red',
 *   stroke: 'black'
 *   strokeWidth: 5,
 *   angleDeg: 60,
 *   rotationDeg: -120
 * });
 */
export class Wedge extends Shape<WedgeConfig> {
  _sceneFunc(context: Context) {
    context.beginPath();
    context.arc(
      0,
      0,
      this.radius(),
      0,
      Konva.getAngle(this.angle()),
      this.clockwise()
    );
    context.lineTo(0, 0);
    context.closePath();
    context.fillStrokeShape(this);
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
  angle: GetSet<number, this>;
  clockwise: GetSet<boolean, this>;
}

Wedge.prototype.className = 'Wedge';
Wedge.prototype._centroid = true;
Wedge.prototype._attrsAffectingSize = ['radius'];
_registerNode(Wedge);

/**
 * get/set radius
 * @name Konva.Wedge#radius
 * @method
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radius
 * var radius = wedge.radius();
 *
 * // set radius
 * wedge.radius(10);
 */
Factory.addGetterSetter(Wedge, 'radius', 0, getNumberValidator());

/**
 * get/set angle in degrees
 * @name Konva.Wedge#angle
 * @method
 * @param {Number} angle
 * @returns {Number}
 * @example
 * // get angle
 * var angle = wedge.angle();
 *
 * // set angle
 * wedge.angle(20);
 */
Factory.addGetterSetter(Wedge, 'angle', 0, getNumberValidator());

/**
 * get/set clockwise flag
 * @name Konva.Wedge#clockwise
 * @method
 * @param {Number} clockwise
 * @returns {Number}
 * @example
 * // get clockwise flag
 * var clockwise = wedge.clockwise();
 *
 * // draw wedge counter-clockwise
 * wedge.clockwise(false);
 *
 * // draw wedge clockwise
 * wedge.clockwise(true);
 */
Factory.addGetterSetter(Wedge, 'clockwise', false);

Factory.backCompat(Wedge, {
  angleDeg: 'angle',
  getAngleDeg: 'getAngle',
  setAngleDeg: 'setAngle',
});
