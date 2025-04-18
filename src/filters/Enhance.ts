import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { getNumberValidator } from '../Validators';

function remap(fromValue: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
  // Compute the range of the data
  const fromRange = fromMax - fromMin,
    toRange = toMax - toMin;

  // If either range is 0, then the value can only be mapped to 1 value
  if (fromRange === 0) {
    return toMin + toRange / 2;
  }
  if (toRange === 0) {
    return toMin;
  }

  // (1) untranslate, (2) unscale, (3) rescale, (4) retranslate
  let toValue = (fromValue - fromMin) / fromRange;
  toValue = toRange * toValue + toMin;

  return toValue;
}

/**
 * Enhance Filter. Adjusts the colors so that they span the widest
 *  possible range (ie 0-255). Performs w*h pixel reads and w*h pixel
 *  writes.
 * @function
 * @name Enhance
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Enhance]);
 * node.enhance(0.4);
 */
export const Enhance: Filter = function (imageData) {
  const data = imageData.data,
    nSubPixels = data.length;
  let rMin = data[0],
    rMax = rMin,
    r,
    gMin = data[1],
    gMax = gMin,
    g,
    bMin = data[2],
    bMax = bMin,
    b;

  // If we are not enhancing anything - don't do any computation
  const enhanceAmount = this.enhance();
  if (enhanceAmount === 0) {
    return;
  }

  // 1st Pass - find the min and max for each channel:
  for (let i = 0; i < nSubPixels; i += 4) {
    r = data[i + 0];
    if (r < rMin) {
      rMin = r;
    } else if (r > rMax) {
      rMax = r;
    }
    g = data[i + 1];
    if (g < gMin) {
      gMin = g;
    } else if (g > gMax) {
      gMax = g;
    }
    b = data[i + 2];
    if (b < bMin) {
      bMin = b;
    } else if (b > bMax) {
      bMax = b;
    }
    //a = data[i + 3];
    //if (a < aMin) { aMin = a; } else
    //if (a > aMax) { aMax = a; }
  }

  // If there is only 1 level - don't remap
  if (rMax === rMin) {
    rMax = 255;
    rMin = 0;
  }
  if (gMax === gMin) {
    gMax = 255;
    gMin = 0;
  }
  if (bMax === bMin) {
    bMax = 255;
    bMin = 0;
  }

  let rGoalMax: number,
    rGoalMin: number,
    gGoalMax: number,
    gGoalMin: number,
    bGoalMax: number,
    bGoalMin: number;

  // If the enhancement is positive - stretch the histogram
  if (enhanceAmount > 0) {
    rGoalMax = rMax + enhanceAmount * (255 - rMax);
    rGoalMin = rMin - enhanceAmount * (rMin - 0);
    gGoalMax = gMax + enhanceAmount * (255 - gMax);
    gGoalMin = gMin - enhanceAmount * (gMin - 0);
    bGoalMax = bMax + enhanceAmount * (255 - bMax);
    bGoalMin = bMin - enhanceAmount * (bMin - 0);
    // If the enhancement is negative -   compress the histogram
  } else {
    const rMid = (rMax + rMin) * 0.5;
    rGoalMax = rMax + enhanceAmount * (rMax - rMid);
    rGoalMin = rMin + enhanceAmount * (rMin - rMid);
    const gMid = (gMax + gMin) * 0.5;
    gGoalMax = gMax + enhanceAmount * (gMax - gMid);
    gGoalMin = gMin + enhanceAmount * (gMin - gMid);
    const bMid = (bMax + bMin) * 0.5;
    bGoalMax = bMax + enhanceAmount * (bMax - bMid);
    bGoalMin = bMin + enhanceAmount * (bMin - bMid);
  }

  // Pass 2 - remap everything, except the alpha
  for (let i = 0; i < nSubPixels; i += 4) {
    data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
    data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
    data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
    //data[i + 3] = remap(data[i + 3], aMin, aMax, aGoalMin, aGoalMax);
  }
};

/**
 * get/set enhance. Use with {@link Konva.Filters.Enhance} filter. -1 to 1 values
 * @name Konva.Node#enhance
 * @method
 * @param {Float} amount
 * @returns {Float}
 */
Factory.addGetterSetter(
  Node,
  'enhance',
  0,
  getNumberValidator(),
  Factory.afterSetFilter
);
