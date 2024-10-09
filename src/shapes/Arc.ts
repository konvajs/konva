import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { Konva } from '../Global';
import { GetSet } from '../types';
import { getNumberValidator, getBooleanValidator } from '../Validators';
import { _registerNode } from '../Global';
import { Context } from '../Context';

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
 *   stroke: 'black'
 *   strokeWidth: 5,
 *   angle: 60,
 *   rotationDeg: -120
 * });
 */
export class Arc extends Shape<ArcConfig> {
  _sceneFunc(context: Context) {
    const angle = Konva.getAngle(this.angle()),
      clockwise = this.clockwise();

    context.beginPath();
    context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
    context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.outerRadius() * 2;
  }
  getHeight() {
    return this.outerRadius() * 2;
  }
  setWidth(width: number) {
    this.outerRadius(width / 2);
  }
  setHeight(height: number) {
    this.outerRadius(height / 2);
  }

  getSelfRect() {
    const innerRadius = this.innerRadius();
    const outerRadius = this.outerRadius();
    const clockwise = this.clockwise();
    const angle = Konva.getAngle(clockwise ? 360 - this.angle() : this.angle());

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
Arc.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
_registerNode(Arc);

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
