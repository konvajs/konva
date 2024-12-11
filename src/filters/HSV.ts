import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { getNumberValidator } from '../Validators';

/**
 * HSV Filter. Adjusts the hue, saturation and value
 * @function
 * @name HSV
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * image.filters([Konva.Filters.HSV]);
 * image.value(200);
 */

export const HSV: Filter = function (imageData) {
  const data = imageData.data,
    nPixels = data.length,
    v = Math.pow(2, this.value()),
    s = Math.pow(2, this.saturation()),
    h = Math.abs(this.hue() + 360) % 360;

  // Basis for the technique used:
  // http://beesbuzz.biz/code/hsv_color_transforms.php
  // V is the value multiplier (1 for none, 2 for double, 0.5 for half)
  // S is the saturation multiplier (1 for none, 2 for double, 0.5 for half)
  // H is the hue shift in degrees (0 to 360)
  // vsu = V*S*cos(H*PI/180);
  // vsw = V*S*sin(H*PI/180);
  //[ .299V+.701vsu+.168vsw    .587V-.587vsu+.330vsw    .114V-.114vsu-.497vsw ] [R]
  //[ .299V-.299vsu-.328vsw    .587V+.413vsu+.035vsw    .114V-.114vsu+.292vsw ]*[G]
  //[ .299V-.300vsu+1.25vsw    .587V-.588vsu-1.05vsw    .114V+.886vsu-.203vsw ] [B]

  // Precompute the values in the matrix:
  const vsu = v * s * Math.cos((h * Math.PI) / 180),
    vsw = v * s * Math.sin((h * Math.PI) / 180);
  // (result spot)(source spot)
  const rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw,
    rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw,
    rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
  const gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw,
    gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw,
    gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
  const br = 0.299 * v - 0.3 * vsu + 1.25 * vsw,
    bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw,
    bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;

  let r, g, b, a;

  for (let i = 0; i < nPixels; i += 4) {
    r = data[i + 0];
    g = data[i + 1];
    b = data[i + 2];
    a = data[i + 3];

    data[i + 0] = rr * r + rg * g + rb * b;
    data[i + 1] = gr * r + gg * g + gb * b;
    data[i + 2] = br * r + bg * g + bb * b;
    data[i + 3] = a; // alpha
  }
};

Factory.addGetterSetter(
  Node,
  'hue',
  0,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set hsv hue in degrees. Use with {@link Konva.Filters.HSV} or {@link Konva.Filters.HSL} filter.
 * @name Konva.Node#hue
 * @method
 * @param {Number} hue value between 0 and 359
 * @returns {Number}
 */

Factory.addGetterSetter(
  Node,
  'saturation',
  0,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set hsv saturation. Use with {@link Konva.Filters.HSV} or {@link Konva.Filters.HSL} filter.
 * @name Konva.Node#saturation
 * @method
 * @param {Number} saturation 0 is no change, -1.0 halves the saturation, 1.0 doubles, etc..
 * @returns {Number}
 */

Factory.addGetterSetter(
  Node,
  'value',
  0,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set hsv value. Use with {@link Konva.Filters.HSV} filter.
 * @name Konva.Node#value
 * @method
 * @param {Number} value 0 is no change, -1.0 halves the value, 1.0 doubles, etc..
 * @returns {Number}
 */
