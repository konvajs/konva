import { Factory } from '../Factory';
import { Util } from '../Util';
import { Node, Filter } from '../Node';
import { getNumberValidator } from '../Validators';

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

export const Pixelate: Filter = function (imageData) {
  let pixelSize = Math.ceil(this.pixelSize()),
    width = imageData.width,
    height = imageData.height,
    //pixelsPerBin = pixelSize * pixelSize,
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
      const xBinEnd = xBinStart + pixelSize;
      const yBinStart = yBin * pixelSize;
      const yBinEnd = yBinStart + pixelSize;

      // Add all of the pixels to this bin!
      let pixelsInBin = 0;
      for (let x = xBinStart; x < xBinEnd; x += 1) {
        if (x >= width) {
          continue;
        }
        for (let y = yBinStart; y < yBinEnd; y += 1) {
          if (y >= height) {
            continue;
          }
          const i = (width * y + x) * 4;
          red += data[i + 0];
          green += data[i + 1];
          blue += data[i + 2];
          alpha += data[i + 3];
          pixelsInBin += 1;
        }
      }

      // Make sure the channels are between 0-255
      red = red / pixelsInBin;
      green = green / pixelsInBin;
      blue = blue / pixelsInBin;
      alpha = alpha / pixelsInBin;

      // Draw this bin
      for (let x = xBinStart; x < xBinEnd; x += 1) {
        if (x >= width) {
          continue;
        }
        for (let y = yBinStart; y < yBinEnd; y += 1) {
          if (y >= height) {
            continue;
          }
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
