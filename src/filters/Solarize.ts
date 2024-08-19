import { Filter } from '../Node';
/**
 * Solarize Filter
 * Pixastic Lib - Solarize filter - v0.1.0
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * License: [http://www.pixastic.com/lib/license.txt]
 * @function
 * @name Solarize
 * @memberof Konva.Filters
 * * @param {LegalCanvas} canvas
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Solarize]);
 */

export const Solarize: Filter = function (canvas: LegalCanvas) {
  const imageData = canvas.context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  var data = imageData.data,
    w = imageData.width,
    h = imageData.height,
    w4 = w * 4,
    y = h;

  do {
    var offsetY = (y - 1) * w4;
    var x = w;
    do {
      var offset = offsetY + (x - 1) * 4;
      var r = data[offset];
      var g = data[offset + 1];
      var b = data[offset + 2];

      if (r > 127) {
        r = 255 - r;
      }
      if (g > 127) {
        g = 255 - g;
      }
      if (b > 127) {
        b = 255 - b;
      }

      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
    } while (--x);
  } while (--y);
  canvas.context.putImageData(imageData, 0, 0);
  return canvas;
};
