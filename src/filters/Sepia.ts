import { Filter } from '../Node';

// based on https://stackoverflow.com/questions/1061093/how-is-a-sepia-tone-created

/**
 * @function
 * @name Sepia
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Sepia]);
 */
export const Sepia: Filter = function (imageData) {
  let data = imageData.data,
    nPixels = data.length,
    i,
    r,
    g,
    b;

  for (i = 0; i < nPixels; i += 4) {
    r = data[i + 0];
    g = data[i + 1];
    b = data[i + 2];

    data[i + 0] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
  }
};
