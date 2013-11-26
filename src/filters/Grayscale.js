(function () {

  /**
   * Grayscale Filter. Converts the image to shades of gray.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

  var Grayscale = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      i, brightness;
    for (i = 0; i < nPixels; i += 4) {
      brightness = 0.34 * srcPixels[i] + 0.5 * srcPixels[i + 1] + 0.16 * srcPixels[i + 2];
      dstPixels[i] = brightness; // r
      dstPixels[i + 1] = brightness; // g
      dstPixels[i + 2] = brightness; // b
      dstPixels[i + 3] = srcPixels[i + 3]; // alpha
    }
  };

  Kinetic.Filters.Grayscale = Kinetic.Util._FilterWrapSingleBuffer(Grayscale);

})();
