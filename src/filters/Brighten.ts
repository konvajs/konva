import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { getNumberValidator } from '../Validators';

/**
 * Brighten Filter.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Brighten]);
 * node.brightness(0.8);
 */
export const Brighten: Filter = function (imageData) {
  let brightness = this.brightness() * 255,
    data = imageData.data,
    len = data.length,
    i;

  for (i = 0; i < len; i += 4) {
    // red
    data[i] += brightness;
    // green
    data[i + 1] += brightness;
    // blue
    data[i + 2] += brightness;
  }
};

Factory.addGetterSetter(
  Node,
  'brightness',
  0,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set filter brightness.  The brightness is a number between -1 and 1.&nbsp; Positive values
 *  brighten the pixels and negative values darken them. Use with {@link Konva.Filters.Brighten} filter.
 * @name Konva.Node#brightness
 * @method

 * @param {Number} brightness value between -1 and 1
 * @returns {Number}
 */
