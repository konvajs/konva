import type { Filter } from '../Node.ts';
// The shared brightness accessor is registered by Brighten.
import './Brighten.ts';

/**
 * Brightness Filter.
 * CSS-compatible brightness multiplier. An unset brightness leaves pixels unchanged.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Brightness]);
 * node.brightness(1.5); // 50% brighter (CSS-compatible)
 */
export const Brightness: Filter = function (imageData) {
  const brightness =
      this.attrs.brightness === undefined ? 1 : this.brightness(),
    data = imageData.data,
    len = data.length;

  for (let i = 0; i < len; i += 4) {
    // red
    data[i] = Math.min(255, data[i] * brightness);
    // green
    data[i + 1] = Math.min(255, data[i + 1] * brightness);
    // blue
    data[i + 2] = Math.min(255, data[i + 2] * brightness);
  }
};
