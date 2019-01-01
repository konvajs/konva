import { Util, Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';
import { getAngle } from '../Global';
import { GetSet } from '../types';

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
export class Arc extends Shape {
  _centroid = true;
  constructor(config) {
    super(config);
    this.className = 'Arc';
    this.sceneFunc(this._sceneFunc);
  }

  _sceneFunc(context) {
    var angle = getAngle(this.angle()),
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
  setWidth(width) {
    // TODO: remove this line?
    Node.prototype['setWidth'].call(this, width);
    if (this.outerRadius() !== width / 2) {
      this.outerRadius(width / 2);
    }
  }
  setHeight(height) {
    // TODO: remove this line?
    Node.prototype['setHeight'].call(this, height);
    if (this.outerRadius() !== height / 2) {
      this.outerRadius(height / 2);
    }
  }

  innerRadius: GetSet<number, this>;
  outerRadius: GetSet<number, this>;
  angle: GetSet<number, this>;
  clockwise: GetSet<boolean, this>;
}

// add getters setters
Factory.addGetterSetter(Arc, 'innerRadius', 0, Validators.getNumberValidator());

/**
 * get/set innerRadius
 * @name innerRadius
 * @method
 * @memberof Konva.Arc.prototype
 * @param {Number} innerRadius
 * @returns {Number}
 * @example
 * // get inner radius
 * var innerRadius = arc.innerRadius();
 *
 * // set inner radius
 * arc.innerRadius(20);
 */

Factory.addGetterSetter(Arc, 'outerRadius', 0, Validators.getNumberValidator());

/**
 * get/set outerRadius
 * @name outerRadius
 * @method
 * @memberof Konva.Arc.prototype
 * @param {Number} outerRadius
 * @returns {Number}
 * @example
 * // get outer radius
 * var outerRadius = arc.outerRadius();
 *
 * // set outer radius
 * arc.outerRadius(20);
 */

Factory.addGetterSetter(Arc, 'angle', 0, Validators.getNumberValidator());

/**
 * get/set angle in degrees
 * @name angle
 * @method
 * @memberof Konva.Arc.prototype
 * @param {Number} angle
 * @returns {Number}
 * @example
 * // get angle
 * var angle = arc.angle();
 *
 * // set angle
 * arc.angle(20);
 */

Factory.addGetterSetter(Arc, 'clockwise', false);

/**
 * get/set clockwise flag
 * @name clockwise
 * @method
 * @memberof Konva.Arc.prototype
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

Collection.mapMethods(Arc);
