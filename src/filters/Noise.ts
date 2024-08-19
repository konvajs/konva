import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { getNumberValidator } from '../Validators';

/**
 * Noise Filter. Randomly adds or substracts to the color channels
 * @function
 * @name Noise
 * @memberof Konva.Filters
 * * @param {LegalCanvas} canvas
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Noise]);
 * node.noise(0.8);
 */
export const Noise: Filter = function (canvas: LegalCanvas) {
  const imageData = canvas.context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  var amount = this.noise() * 255,
    data = imageData.data,
    nPixels = data.length,
    half = amount / 2,
    i;

  for (i = 0; i < nPixels; i += 4) {
    data[i + 0] += half - 2 * half * Math.random();
    data[i + 1] += half - 2 * half * Math.random();
    data[i + 2] += half - 2 * half * Math.random();
  }
  canvas.context.putImageData(imageData, 0, 0);
  return canvas;
};

Factory.addGetterSetter(
  Node,
  'noise',
  0.2,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set noise amount.  Must be a value between 0 and 1. Use with {@link Konva.Filters.Noise} filter.
 * @name Konva.Node#noise
 * @method
 * @param {Number} noise
 * @returns {Number}
 */
