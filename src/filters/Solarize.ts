import { Filter } from '../Node';
/**
 * Solarize Filter
 * @function
 * @name Solarize
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Solarize]);
 */

export const Solarize: Filter = function (imageData) {
  const threshold = 128;
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2];
    // sRGB luma
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (L >= threshold) {
      d[i] = 255 - r;
      d[i + 1] = 255 - g;
      d[i + 2] = 255 - b;
    }
  }
  return imageData;
};
