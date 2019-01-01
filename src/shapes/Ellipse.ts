import { Util, Collection } from '../Util';
import { Factory, Validators } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';

import { GetSet, Vector2d } from '../types';

// the 0.0001 offset fixes a bug in Chrome 27
var PIx2 = Math.PI * 2 - 0.0001,
  ELLIPSE = 'Ellipse';

/**
 * Ellipse constructor
 * @constructor
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
 *   } *   fill: 'red'
 * });
 */
export class Ellipse extends Shape {
  //TODO: move all centroids to prototype
  _centroid = true;

  constructor(config) {
    super(config);
    this.className = ELLIPSE;
    this.sceneFunc(this._sceneFunc);
  }

  _sceneFunc(context) {
    var rx = this.radiusX(),
      ry = this.radiusY();

    context.beginPath();
    context.save();
    if (rx !== ry) {
      context.scale(1, ry / rx);
    }
    context.arc(0, 0, rx, 0, PIx2, false);
    context.restore();
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.radiusX() * 2;
  }
  getHeight() {
    return this.radiusY() * 2;
  }
  setWidth(width) {
    // TODO: remove this line?
    Node.prototype['setWidth'].call(this, width);
    this.radiusX(width / 2);
  }
  setHeight(height) {
    // TODO: remove this line?
    Node.prototype['setHeight'].call(this, height);
    this.radiusY(height / 2);
  }

  radius: GetSet<Vector2d, this>;
  radiusX: GetSet<number, this>;
  radiusY: GetSet<number, this>;
}

// add getters setters
Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);

/**
 * get/set radius
 * @name radius
 * @method
 * @memberof Konva.Ellipse.prototype
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

Factory.addGetterSetter(Ellipse, 'radiusX', 0, Validators.getNumberValidator());
/**
 * get/set radius x
 * @name radiusX
 * @method
 * @memberof Konva.Ellipse.prototype
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get radius x
 * var radiusX = ellipse.radiusX();
 *
 * // set radius x
 * ellipse.radiusX(200);
 */

Factory.addGetterSetter(Ellipse, 'radiusY', 0, Validators.getNumberValidator());
/**
 * get/set radius y
 * @name radiusY
 * @method
 * @memberof Konva.Ellipse.prototype
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get radius y
 * var radiusY = ellipse.radiusY();
 *
 * // set radius y
 * ellipse.radiusY(200);
 */

Collection.mapMethods(Ellipse);
