import { Filter } from '../Node';

/**
 * Brightness Filter.
 * CSS-compatible brightness filter that uses multiplicative approach.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Brightness]);
 * node.brightness(1.5); // 50% brighter (CSS-compatible)
 */
export const Brightness: Filter = function (imageData) {
  const brightness = this.brightness(),
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

// Note: brightness property is already defined in Brighten.ts
// This filter reuses the existing brightness property but with CSS-compatible behavior
