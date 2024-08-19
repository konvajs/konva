import { Factory } from '../Factory';
import { Node, Filter, LegalCanvas } from '../Node';
import { getNumberValidator } from '../Validators';
/**
 * Posterize Filter. Adjusts the channels so that there are no more
 *  than n different values for that channel. This is also applied
 *  to the alpha channel.
 * @function
 * @name Posterize
 * @author ippo615
 * @memberof Konva.Filters
 * * @param {LegalCanvas} canvas
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Posterize]);
 * node.levels(0.8); // between 0 and 1
 */

export const Posterize: Filter = function (canvas: LegalCanvas) {
  const imageData = canvas.context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  // level must be between 1 and 255
  var levels = Math.round(this.levels() * 254) + 1,
    data = imageData.data,
    len = data.length,
    scale = 255 / levels,
    i;

  for (i = 0; i < len; i += 1) {
    data[i] = Math.floor(data[i] / scale) * scale;
  }
  canvas.context.putImageData(imageData, 0, 0);
  return canvas;
};

Factory.addGetterSetter(
  Node,
  'levels',
  0.5,
  getNumberValidator(),
  Factory.afterSetFilter
);

/**
 * get/set levels.  Must be a number between 0 and 1.  Use with {@link Konva.Filters.Posterize} filter.
 * @name Konva.Node#levels
 * @method
 * @param {Number} level between 0 and 1
 * @returns {Number}
 */
