import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { Util } from '../Util';
import { getNumberValidator } from '../Validators';
/**
 * Emboss Filter.
 * Pixastic Lib - Emboss filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
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
  // pixastic strength is between 0 and 10.  I want it between 0 and 1
  // pixastic greyLevel is between 0 and 255.  I want it between 0 and 1.  Also,
  // a max value of greyLevel yields a white emboss, and the min value yields a black
  // emboss.  Therefore, I changed greyLevel to whiteLevel
  let strength = this.embossStrength() * 10,
    greyLevel = this.embossWhiteLevel() * 255,
    direction = this.embossDirection(),
    blend = this.embossBlend(),
    dirY = 0,
    dirX = 0,
    data = imageData.data,
    w = imageData.width,
    h = imageData.height,
    w4 = w * 4,
    y = h;

  switch (direction) {
    case 'top-left':
      dirY = -1;
      dirX = -1;
      break;
    case 'top':
      dirY = -1;
      dirX = 0;
      break;
    case 'top-right':
      dirY = -1;
      dirX = 1;
      break;
    case 'right':
      dirY = 0;
      dirX = 1;
      break;
    case 'bottom-right':
      dirY = 1;
      dirX = 1;
      break;
    case 'bottom':
      dirY = 1;
      dirX = 0;
      break;
    case 'bottom-left':
      dirY = 1;
      dirX = -1;
      break;
    case 'left':
      dirY = 0;
      dirX = -1;
      break;
    default:
      Util.error('Unknown emboss direction: ' + direction);
  }

  do {
    const offsetY = (y - 1) * w4;

    let otherY = dirY;
    if (y + otherY < 1) {
      otherY = 0;
    }
    if (y + otherY > h) {
      otherY = 0;
    }

    const offsetYOther = (y - 1 + otherY) * w * 4;

    let x = w;
    do {
      const offset = offsetY + (x - 1) * 4;

      let otherX = dirX;
      if (x + otherX < 1) {
        otherX = 0;
      }
      if (x + otherX > w) {
        otherX = 0;
      }

      const offsetOther = offsetYOther + (x - 1 + otherX) * 4;

      const dR = data[offset] - data[offsetOther];
      const dG = data[offset + 1] - data[offsetOther + 1];
      const dB = data[offset + 2] - data[offsetOther + 2];

      let dif = dR;
      const absDif = dif > 0 ? dif : -dif;

      const absG = dG > 0 ? dG : -dG;
      const absB = dB > 0 ? dB : -dB;

      if (absG > absDif) {
        dif = dG;
      }
      if (absB > absDif) {
        dif = dB;
      }

      dif *= strength;

      if (blend) {
        const r = data[offset] + dif;
        const g = data[offset + 1] + dif;
        const b = data[offset + 2] + dif;

        data[offset] = r > 255 ? 255 : r < 0 ? 0 : r;
        data[offset + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
        data[offset + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
      } else {
        let grey = greyLevel - dif;
        if (grey < 0) {
          grey = 0;
        } else if (grey > 255) {
          grey = 255;
        }

        data[offset] = data[offset + 1] = data[offset + 2] = grey;
      }
    } while (--x);
  } while (--y);
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
  null,
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
  null,
  Factory.afterSetFilter
);
/**
 * get/set emboss blend. Use with {@link Konva.Filters.Emboss} filter.
 * @name Konva.Node#embossBlend
 * @method
 * @param {Boolean} embossBlend
 * @returns {Boolean}
 */
