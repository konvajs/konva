import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { RGBComponent } from '../Validators';

/**
 * RGB Filter
 * @function
 * @name RGB
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.RGB]);
 * node.blue(120);
 * node.green(200);
 */
export const RGB: Filter = function (imageData) {
  const data = imageData.data,
    nPixels = data.length,
    red = this.red(),
    green = this.green(),
    blue = this.blue();

  for (let i = 0; i < nPixels; i += 4) {
    const brightness =
      (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
    data[i] = brightness * red; // r
    data[i + 1] = brightness * green; // g
    data[i + 2] = brightness * blue; // b
    data[i + 3] = data[i + 3]; // alpha
  }
};

Factory.addGetterSetter(Node, 'red', 0, function (this: Node, val) {
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
 * get/set filter red value. Use with {@link Konva.Filters.RGB} filter.
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
 * get/set filter green value. Use with {@link Konva.Filters.RGB} filter.
 * @name green
 * @method
 * @memberof Konva.Node.prototype
 * @param {Integer} green value between 0 and 255
 * @returns {Integer}
 */

Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);
/**
 * get/set filter blue value. Use with {@link Konva.Filters.RGB} filter.
 * @name blue
 * @method
 * @memberof Konva.Node.prototype
 * @param {Integer} blue value between 0 and 255
 * @returns {Integer}
 */
