import { Factory } from '../Factory';
import { Node, Filter } from '../Node';
import { getNumberValidator } from '../Validators';
/**
 * Threshold Filter. Pushes any value above the mid point to
 *  the max and any value below the mid point to the min.
 *  This affects the alpha channel.
 * @function
 * @name Threshold
 * @memberof Konva.Filters
 * * @param {LegalCanvas} canvas
 * @author ippo615
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Threshold]);
 * node.threshold(0.1);
 */

export const Threshold: Filter = function (canvas: LegalCanvas) {
  const imageData = canvas.context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  var level = this.threshold() * 255,
    data = imageData.data,
    len = data.length,
    i;

  for (i = 0; i < len; i += 1) {
    data[i] = data[i] < level ? 0 : 255;
  }
  canvas.context.putImageData(imageData, 0, 0);
  return canvas;
};

Factory.addGetterSetter(
  Node,
  'threshold',
  0.5,
  getNumberValidator(),
  Factory.afterSetFilter
);
/**
 * get/set threshold.  Must be a value between 0 and 1. Use with {@link Konva.Filters.Threshold} or {@link Konva.Filters.Mask} filter.
 * @name threshold
 * @method
 * @memberof Konva.Node.prototype
 * @param {Number} threshold
 * @returns {Number}
 */
