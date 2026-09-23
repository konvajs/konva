import { Factory } from '../Factory.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { Konva } from '../Global.ts';
import type { GetSet } from '../types.ts';
import { getNumberValidator, getBooleanValidator } from '../Validators.ts';
import { _registerNode } from '../Global.ts';
import type { Context } from '../Context.ts';

export interface ArcConfig extends ShapeConfig {
  angle: number;
  innerRadius: number;
  outerRadius: number;
  clockwise?: boolean;
}

/**
 * Arc constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Number} config.angle in degrees
 * @param {Number} config.innerRadius
 * @param {Number} config.outerRadius
 * @param {Boolean} [config.clockwise]
 * @@shapeParams
 * @@nodeParams
 * @example
 * // draw a Arc that's pointing downwards
 * var arc = new Konva.Arc({
 *   innerRadius: 40,
 *   outerRadius: 80,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 5,
 *   angle: 60,
 *   rotation: -120
 * });
 */
export class Arc extends Shape<ArcConfig> {
  _sceneFunc(context: Context) {
    const angle = Konva.getAngle(this.angle()),
      clockwise = this.clockwise();

    context.beginPath();
    context.arc(0, 0, Math.abs(this.outerRadius()), 0, angle, clockwise);
    context.arc(0, 0, Math.abs(this.innerRadius()), angle, 0, !clockwise);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return Math.abs(this.outerRadius()) * 2;
  }
  getHeight() {
    return Math.abs(this.outerRadius()) * 2;
  }
  setWidth(width: number) {
    this.outerRadius(width / 2);
  }
  setHeight(height: number) {
    this.outerRadius(height / 2);
  }

  getSelfRect() {
    const r1 = Math.abs(this.innerRadius()),
      r2 = Math.abs(this.outerRadius());
    const innerRadius = Math.min(r1, r2),
      outerRadius = Math.max(r1, r2);
    const clockwise = this.clockwise();

    // canvas draws a full circle for any non-zero full-turn end angle regardless
    // of direction, and nothing for angle 0. Keep exact turns distinct from
    // the modulo-normalized partial sweep below.
    const rawAngle = Konva.getAngle(this.angle());
    if (rawAngle % (Math.PI * 2) === 0) {
      return rawAngle !== 0
        ? {
            x: -outerRadius,
            y: -outerRadius,
            width: outerRadius * 2,
            height: outerRadius * 2,
          }
        : { x: innerRadius, y: 0, width: outerRadius - innerRadius, height: 0 };
    }

    const turn = Math.PI * 2;
    const sweep = clockwise ? -rawAngle : rawAngle;
    const angle = sweep >= turn ? turn : ((sweep % turn) + turn) % turn;

    const boundLeftRatio = Math.cos(Math.min(angle, Math.PI));
    const boundRightRatio = 1;
    const boundTopRatio = Math.sin(
      Math.min(Math.max(Math.PI, angle), (3 * Math.PI) / 2)
    );
    const boundBottomRatio = Math.sin(Math.min(angle, Math.PI / 2));
    const boundLeft =
      boundLeftRatio * (boundLeftRatio > 0 ? innerRadius : outerRadius);
    const boundRight =
      boundRightRatio * (boundRightRatio > 0 ? outerRadius : innerRadius);
    const boundTop =
      boundTopRatio * (boundTopRatio > 0 ? innerRadius : outerRadius);
    const boundBottom =
      boundBottomRatio * (boundBottomRatio > 0 ? outerRadius : innerRadius);

    return {
      x: boundLeft,
      y: clockwise ? -1 * boundBottom : boundTop,
      width: boundRight - boundLeft,
      height: boundBottom - boundTop,
    };
  }

  innerRadius: GetSet<number, this>;
  outerRadius: GetSet<number, this>;
  angle: GetSet<number, this>;
  clockwise: GetSet<boolean, this>;
}

Arc.prototype._centroid = true;
Arc.prototype.className = 'Arc';
Arc.prototype._attrsAffectingSize = [
  'innerRadius',
  'outerRadius',
  'angle',
  'clockwise',
];
_registerNode(Arc, true);

// add getters setters
Factory.addGetterSetter(Arc, 'innerRadius', 0, getNumberValidator());

/**
 * get/set innerRadius
 * @name Konva.Arc#innerRadius
 * @method
 * @param {Number} innerRadius
 * @returns {Number}
 * @example
 * // get inner radius
 * var innerRadius = arc.innerRadius();
 *
 * // set inner radius
 * arc.innerRadius(20);
 */

Factory.addGetterSetter(Arc, 'outerRadius', 0, getNumberValidator());

/**
 * get/set outerRadius
 * @name Konva.Arc#outerRadius
 * @method
 * @param {Number} outerRadius
 * @returns {Number}
 * @example
 * // get outer radius
 * var outerRadius = arc.outerRadius();
 *
 * // set outer radius
 * arc.outerRadius(20);
 */

Factory.addGetterSetter(Arc, 'angle', 0, getNumberValidator());

/**
 * get/set angle in degrees
 * @name Konva.Arc#angle
 * @method
 * @param {Number} angle
 * @returns {Number}
 * @example
 * // get angle
 * var angle = arc.angle();
 *
 * // set angle
 * arc.angle(20);
 */

Factory.addGetterSetter(Arc, 'clockwise', false, getBooleanValidator());

/**
 * get/set clockwise flag
 * @name Konva.Arc#clockwise
 * @method
 * @param {Boolean} clockwise
 * @returns {Boolean}
 * @example
 * // get clockwise flag
 * var clockwise = arc.clockwise();
 *
 * // draw arc counter-clockwise
 * arc.clockwise(false);
 *
 * // draw arc clockwise
 * arc.clockwise(true);
 */
