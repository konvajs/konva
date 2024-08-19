import { Filter } from '../Node';
/**
 * Invert Filter
 * @function
 * @memberof Konva.Filters
 * * @param {LegalCanvas} canvas
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Invert]);
 */
export const Invert: Filter = function (canvas: LegalCanvas) {
  const imageData = canvas.context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  var data = imageData.data,
    len = data.length,
    i;

  for (i = 0; i < len; i += 4) {
    // red
    data[i] = 255 - data[i];
    // green
    data[i + 1] = 255 - data[i + 1];
    // blue
    data[i + 2] = 255 - data[i + 2];
  }
  canvas.context.putImageData(imageData, 0, 0);
  return canvas;
};
