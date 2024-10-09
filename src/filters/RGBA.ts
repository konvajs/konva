import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { RGBComponent } from '../Validators';

/**
 * RGBA Filter
 * @function
 * @name RGBA
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author codefo
 * @example
 * node.cache();
 * node.filters([Konva.Filters.RGBA]);
 * node.blue(120);
 * node.green(200);
 * node.alpha(0.3);
 */

export const RGBA: Filter = function (imageData) {
  const data = imageData.data,
    nPixels = data.length,
    red = this.red(),
    green = this.green(),
    blue = this.blue(),
    alpha = this.alpha();

  for (let i = 0; i < nPixels; i += 4) {
    const ia = 1 - alpha;

    data[i] = red * alpha + data[i] * ia; // r
    data[i + 1] = green * alpha + data[i + 1] * ia; // g
    data[i + 2] = blue * alpha + data[i + 2] * ia; // b
  }
};

Factory.addGetterSetter(Node, 'red', 0, function (this: Node, val: number) {
  this._filterUpToDate = false;
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  } else {
    return Math.round(val);
  }
});
/**
 * get/set filter red value. Use with {@link Konva.Filters.RGBA} filter.
 * @name red
 * @method
 * @memberof Konva.Node.prototype
 * @param {Integer} red value between 0 and 255
 * @returns {Integer}
 */

Factory.addGetterSetter(Node, 'green', 0, function (this: Node, val) {
  this._filterUpToDate = false;
  if (val > 255) {
    return 255;
  } else if (val < 0) {
    return 0;
  } else {
    return Math.round(val);
  }
});
/**
 * get/set filter green value. Use with {@link Konva.Filters.RGBA} filter.
 * @name green
 * @method
 * @memberof Konva.Node.prototype
 * @param {Integer} green value between 0 and 255
 * @returns {Integer}
 */

Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);
/**
 * get/set filter blue value. Use with {@link Konva.Filters.RGBA} filter.
 * @name blue
 * @method
 * @memberof Konva.Node.prototype
 * @param {Integer} blue value between 0 and 255
 * @returns {Integer}
 */

Factory.addGetterSetter(Node, 'alpha', 1, function (this: Node, val) {
  this._filterUpToDate = false;
  if (val > 1) {
    return 1;
  } else if (val < 0) {
    return 0;
  } else {
    return val;
  }
});
/**
 * get/set filter alpha value. Use with {@link Konva.Filters.RGBA} filter.
 * @name alpha
 * @method
 * @memberof Konva.Node.prototype
 * @param {Float} alpha value between 0 and 1
 * @returns {Float}
 */
