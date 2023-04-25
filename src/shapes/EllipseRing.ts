import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { GetSet } from '../types';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';
import { Context } from '../Context';

export interface EllipseRingConfig extends ShapeConfig {
  innerRadiusX: number;
  innerRadiusY: number;
  outerRadiusX: number;
  outerRadiusY: number;
}

const PIx2 = Math.PI * 2;

/**
 * EllipseRing constructor
 * @constructor
 * @augments Konva.Shape
 * @memberof Konva
 * @param {Object} config
 * @param {Number} config.innerRadiusX
 * @param {Number} config.innerRadiusY
 * @param {Number} config.outerRadiusX
 * @param {Number} config.outerRadiusY
 * @@shapeParams
 * @@nodeParams
 * @example
 * var EllipseRing = new Konva.EllipseRing({
 *   innerRadiusX: 40,
 *   innerRadiusY: 20,
 *   outerRadiusX: 80,
 *   outerRadiusY: 40,
 *   fill: 'red',
 *   stroke: 'black',
 *   strokeWidth: 5
 * });
 */
export class EllipseRing extends Shape<EllipseRingConfig> {

  _sceneFunc(context: Context) {
    const irx = this.innerRadiusX();
    const iry = this.innerRadiusY();
    const orx = this.outerRadiusX();
    const ory = this.outerRadiusY();

    context.beginPath();
    // context.ellipse(0, 0, orx - ringWidth, ory - ringWidth, 0, 0, PIx2, false);
    context.ellipse(0, 0, irx, iry, 0, 0, PIx2, false);
    context.moveTo(orx, 0);
    context.ellipse(0, 0, orx, ory, 0, PIx2, 0, true);

    context.closePath();
    context.fillStrokeShape(this);
  }

  getWidth() {
    return this.outerRadiusX() * 2;
  }

  getHeight() {
    return this.outerRadiusY() * 2;
  }

  setWidth(width: number) {
    this.outerRadiusX(width / 2);
  }

  setHeight(height: number) {
    this.outerRadiusY(height / 2);
  }

  innerRadiusX: GetSet<number, this>;
  innerRadiusY: GetSet<number, this>;
  outerRadiusX: GetSet<number, this>;
  outerRadiusY: GetSet<number, this>;
}

EllipseRing.prototype.className = 'EllipseRing';
EllipseRing.prototype._centroid = true;
EllipseRing.prototype._attrsAffectingSize = ['innerRadiusX', 'innerRadiusY', 'outerRadiusX', 'outerRadiusY'];
_registerNode(EllipseRing);

/**
 * get/set innerRadiusX
 * @method
 * @name Konva.Ring#innerRadiusX
 * @param {Number} innerRadiusX
 * @returns {Number}
 * @example
 * // get inner radiusX
 * var innerRadiusX = ring.innerRadiusX();
 *
 * // set inner radiusX
 * ring.innerRadiusX(20);
 */
Factory.addGetterSetter(EllipseRing, 'innerRadiusX', 0, getNumberValidator());

/**
 * get/set innerRadiusY
 * @method
 * @name Konva.Ring#innerRadiusY
 * @param {Number} innerRadiusY
 * @returns {Number}
 * @example
 * // get inner radiusY
 * var innerRadiusY = ring.innerRadiusY();
 *
 * // set inner radiusY
 * ring.innerRadiusY(20);
 */
Factory.addGetterSetter(EllipseRing, 'innerRadiusY', 0, getNumberValidator());

/**
 * get/set outerRadiusX
 * @name Konva.Ring#outerRadiusX
 * @method
 * @param {Number} outerRadiusX
 * @returns {Number}
 * @example
 * // get outer radiusX
 * var outerRadiusX = ring.outerRadiusX();
 *
 * // set outer radiusX
 * ring.outerRadiusX(20);
 */
Factory.addGetterSetter(EllipseRing, 'outerRadiusX', 0, getNumberValidator());

/**
 * get/set outerRadiusY
 * @name Konva.Ring#outerRadiusY
 * @method
 * @param {Number} outerRadiusY
 * @returns {Number}
 * @example
 * // get outer radiusY
 * var outerRadiusY = ring.outerRadiusY();
 *
 * // set outer radiusY
 * ring.outerRadiusY(20);
 */
Factory.addGetterSetter(EllipseRing, 'outerRadiusY', 0, getNumberValidator());
