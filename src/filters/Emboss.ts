import { Factory } from '../Factory.ts';
import type { Filter } from '../Node.ts';
import { Node } from '../Node.ts';
import { getNumberValidator } from '../Validators.ts';
/**
 * Emboss Filter.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Emboss]);
 * node.embossStrength(0.8);
 * node.embossWhiteLevel(0.3);
 * node.embossDirection('right');
 * node.embossBlend(true);
 */
export const Emboss: Filter = function (imageData) {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // Inputs from Konva node
  const strength01 = Math.min(1, Math.max(0, this.embossStrength?.() ?? 0.5)); // [0..1]
  const whiteLevel01 = Math.min(
    1,
    Math.max(0, this.embossWhiteLevel?.() ?? 0.5)
  ); // [0..1]
  // Convert string direction to degrees
  const directionMap = {
    'top-left': 315,
    top: 270,
    'top-right': 225,
    right: 180,
    'bottom-right': 135,
    bottom: 90,
    'bottom-left': 45,
    left: 0,
  };
  const directionDeg =
    directionMap[this.embossDirection?.() ?? 'top-left'] ?? 315; // degrees
  const blend = !!(this.embossBlend?.() ?? false);

  // Internal mapping:
  // -  "strength" was 0..10; we honor your 0..1 API and scale accordingly.
  // - Sobel directional response is roughly in [-1020..1020] for 8-bit luminance; scale to ~±128.
  const strength = strength01 * 10;
  const bias = whiteLevel01 * 255;
  const dirRad = (directionDeg * Math.PI) / 180;
  const cx = Math.cos(dirRad);
  const cy = Math.sin(dirRad);
  const SCALE = (128 / 1020) * strength; // ≈0.1255 * strength

  // Precompute luminance (Rec.709)
  const lum = new Float32Array(w * h);
  for (let p = 0, i = 0; i < data.length; i += 4, p++) {
    lum[p] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }

  // Sobel kernels (flattened)
  const Gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const Gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const clamp8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

  // Extend the edge pixels so the same kernel applies at every position.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sx = 0,
        sy = 0,
        k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const row = Math.max(0, Math.min(h - 1, y + dy)) * w;
        for (let dx = -1; dx <= 1; dx++, k++) {
          const sample = lum[row + Math.max(0, Math.min(w - 1, x + dx))];
          sx += sample * Gx[k];
          sy += sample * Gy[k];
        }
      }
      const p = y * w + x;
      const r = cx * sx + cy * sy; // directional response
      const outGray = clamp8(bias + r * SCALE); // biased, scaled, clamped

      const o = p * 4;
      if (blend) {
        // Add the emboss "relief" around chosen bias to original RGB
        const delta = outGray - bias; // symmetric around whiteLevel
        data[o] = clamp8(data[o] + delta);
        data[o + 1] = clamp8(data[o + 1] + delta);
        data[o + 2] = clamp8(data[o + 2] + delta);
      } else {
        // Grayscale embossed output
        data[o] = data[o + 1] = data[o + 2] = outGray;
      }
    }
  }

  return imageData;
};

Factory.addGetterSetter(
  Node,
  'embossStrength',
  0.5,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set emboss strength. Use with {@link Konva.Filters.Emboss} filter.
 * @name Konva.Node#embossStrength
 * @method
 * @param {Number} level between 0 and 1.  Default is 0.5
 * @returns {Number}
 */

Factory.addGetterSetter(
  Node,
  'embossWhiteLevel',
  0.5,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set emboss white level. Use with {@link Konva.Filters.Emboss} filter.
 * @name Konva.Node#embossWhiteLevel
 * @method
 * @param {Number} embossWhiteLevel between 0 and 1.  Default is 0.5
 * @returns {Number}
 */

Factory.addGetterSetter(
  Node,
  'embossDirection',
  'top-left',
  undefined,
  Factory.afterSetFilter
);
/**
 * get/set emboss direction. Use with {@link Konva.Filters.Emboss} filter.
 * @name Konva.Node#embossDirection
 * @method
 * @param {String} embossDirection can be top-left, top, top-right, right, bottom-right, bottom, bottom-left or left
 *   The default is top-left
 * @returns {String}
 */

Factory.addGetterSetter(
  Node,
  'embossBlend',
  false,
  undefined,
  Factory.afterSetFilter
);
/**
 * get/set emboss blend. Use with {@link Konva.Filters.Emboss} filter.
 * @name Konva.Node#embossBlend
 * @method
 * @param {Boolean} embossBlend
 * @returns {Boolean}
 */
