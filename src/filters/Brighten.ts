import { Factory } from '../Factory.ts';
import type { Filter } from '../Node.ts';
import { Node } from '../Node.ts';
import { getNumberValidator } from '../Validators.ts';

/**
 * Brighten Filter.
 * @deprecated Use {@link Konva.Filters.Brightness} instead for CSS-compatible behavior.
 * This filter uses additive brightness adjustment (adds a constant value to RGB channels).
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Brighten]);
 * node.brightness(0.8);
 */
export const Brighten: Filter = function (imageData) {
  const brightness = this.brightness() * 255,
    data = imageData.data,
    len = data.length;

  for (let i = 0; i < len; i += 4) {
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
 * get/set filter brightness. With {@link Konva.Filters.Brighten} it is a number between -1 and 1
 *  added to every channel: positive values brighten the pixels and negative values darken them.
 *  With {@link Konva.Filters.Brightness} it is a CSS-like multiplier: 1 is no change, 1.5 is 50% brighter.
 *  Both filters leave pixels unchanged when the attribute is unset. An explicit 0 makes Brightness black.
 * @name Konva.Node#brightness
 * @method
 * @param {Number} brightness
 * @returns {Number}
 */
