import { Factory } from '../Factory.ts';
import { Util } from '../Util.ts';
import type { Filter } from '../Node.ts';
import { Node } from '../Node.ts';
import { getNumberValidator } from '../Validators.ts';

/**
 * Pixelate Filter. Averages groups of pixels and redraws
 *  them as larger pixels
 * @function
 * @name Pixelate
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Pixelate]);
 * node.pixelSize(10);
 */

export const Pixelate: Filter = function (imageData, pixelRatio = 1) {
  let pixelSize = Math.ceil(this.pixelSize() * pixelRatio),
    width = imageData.width,
    height = imageData.height,
    nBinsX = Math.ceil(width / pixelSize),
    nBinsY = Math.ceil(height / pixelSize),
    data = imageData.data;

  if (pixelSize <= 0) {
    Util.error('pixelSize value can not be <= 0');
    return;
  }

  for (let xBin = 0; xBin < nBinsX; xBin += 1) {
    for (let yBin = 0; yBin < nBinsY; yBin += 1) {
      // Initialize the color accumlators to 0
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      // Determine which pixels are included in this bin
      const xBinStart = xBin * pixelSize;
      const xBinEnd = Math.min(xBinStart + pixelSize, width);
      const yBinStart = yBin * pixelSize;
      const yBinEnd = Math.min(yBinStart + pixelSize, height);

      // Add all of the pixels to this bin!
      for (let x = xBinStart; x < xBinEnd; x += 1) {
        for (let y = yBinStart; y < yBinEnd; y += 1) {
          const i = (width * y + x) * 4;
          const a = data[i + 3];
          red += data[i + 0] * a;
          green += data[i + 1] * a;
          blue += data[i + 2] * a;
          alpha += a;
        }
      }

      // average premultiplied colour so transparent pixels do not darken the block
      if (alpha) {
        red = red / alpha;
        green = green / alpha;
        blue = blue / alpha;
      }
      alpha = alpha / ((xBinEnd - xBinStart) * (yBinEnd - yBinStart));

      // Draw this bin
      for (let x = xBinStart; x < xBinEnd; x += 1) {
        for (let y = yBinStart; y < yBinEnd; y += 1) {
          const i = (width * y + x) * 4;
          data[i + 0] = red;
          data[i + 1] = green;
          data[i + 2] = blue;
          data[i + 3] = alpha;
        }
      }
    }
  }
};

Factory.addGetterSetter(
  Node,
  'pixelSize',
  8,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set pixel size. Use with {@link Konva.Filters.Pixelate} filter.
 * @name Konva.Node#pixelSize
 * @method
 * @param {Integer} pixelSize
 * @returns {Integer}
 */
