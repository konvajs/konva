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
  const src = new Uint8ClampedArray(data); // snapshot
  const lum = new Float32Array(w * h);
  for (let p = 0, i = 0; i < data.length; i += 4, p++) {
    lum[p] = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2];
  }

  // Sobel kernels (flattened)
  const Gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const Gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  // neighbor offsets around center pixel in lum space
  const OFF = [-w - 1, -w, -w + 1, -1, 0, 1, w - 1, w, w + 1];

  // Helpers
  const clamp8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

  // Process: leave a 1px border unchanged (faster/cleaner)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;

      // Directional derivative = (cosθ * Gx + sinθ * Gy) • neighborhood(lum)
      let sx = 0,
        sy = 0;
      // unroll loop for speed
      sx += lum[p + OFF[0]] * Gx[0];
      sy += lum[p + OFF[0]] * Gy[0];
      sx += lum[p + OFF[1]] * Gx[1];
      sy += lum[p + OFF[1]] * Gy[1];
      sx += lum[p + OFF[2]] * Gx[2];
      sy += lum[p + OFF[2]] * Gy[2];
      sx += lum[p + OFF[3]] * Gx[3];
      sy += lum[p + OFF[3]] * Gy[3];
      // center has 0 weights in both Sobel masks; can skip if desired
      sx += lum[p + OFF[5]] * Gx[5];
      sy += lum[p + OFF[5]] * Gy[5];
      sx += lum[p + OFF[6]] * Gx[6];
      sy += lum[p + OFF[6]] * Gy[6];
      sx += lum[p + OFF[7]] * Gx[7];
      sy += lum[p + OFF[7]] * Gy[7];
      sx += lum[p + OFF[8]] * Gx[8];
      sy += lum[p + OFF[8]] * Gy[8];

      const r = cx * sx + cy * sy; // directional response
      const outGray = clamp8(bias + r * SCALE); // biased, scaled, clamped

      const o = p * 4;
      if (blend) {
        // Add the emboss "relief" around chosen bias to original RGB
        const delta = outGray - bias; // symmetric around whiteLevel
        data[o] = clamp8(src[o] + delta);
        data[o + 1] = clamp8(src[o + 1] + delta);
        data[o + 2] = clamp8(src[o + 2] + delta);
        data[o + 3] = src[o + 3];
      } else {
        // Grayscale embossed output
        data[o] = data[o + 1] = data[o + 2] = outGray;
        data[o + 3] = src[o + 3];
      }
    }
  }

  // Copy border (untouched) to keep edges clean
  // top & bottom rows
  for (let x = 0; x < w; x++) {
    let oTop = x * 4,
      oBot = ((h - 1) * w + x) * 4;
    data[oTop] = src[oTop];
    data[oTop + 1] = src[oTop + 1];
    data[oTop + 2] = src[oTop + 2];
    data[oTop + 3] = src[oTop + 3];
    data[oBot] = src[oBot];
    data[oBot + 1] = src[oBot + 1];
    data[oBot + 2] = src[oBot + 2];
    data[oBot + 3] = src[oBot + 3];
  }
  // left & right columns
  for (let y = 1; y < h - 1; y++) {
    let oL = y * w * 4,
      oR = (y * w + (w - 1)) * 4;
    data[oL] = src[oL];
    data[oL + 1] = src[oL + 1];
    data[oL + 2] = src[oL + 2];
    data[oL + 3] = src[oL + 3];
    data[oR] = src[oR];
    data[oR + 1] = src[oR + 1];
    data[oR + 2] = src[oR + 2];
    data[oR + 3] = src[oR + 3];
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
