(function () {

  /**
   * FlipX Filter. Flips the image horizontally so that the 
   *  left-most pixels become the right-most pixels and vice-versa.
   *  Performs w*h pixel reads, 0 computations, and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

  var FlipX = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y;
    for (x = 0; x < xSize; x += 1) {
      for (y = 0; y < ySize; y += 1) {
        i = (y * xSize + x) * 4; // original 
        m = (y * xSize + (xSize-1) - x) * 4; // flipped
        dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
      }
    }
  };

  /**
   * FlipY Filter. Flips the image vertically so that the top-most
   *  pixels become the bottom-most pixels and vice-versa.
   *  Performs w*h pixel reads, 0 computations, and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

  var FlipY = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y;
    for (x = 0; x < xSize; x += 1) {
      for (y = 0; y < ySize; y += 1) {
        i = (y * xSize + x) * 4; // original 
        m = ((ySize-1 - y) * xSize + x) * 4; // flipped
        dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
      }
    }
  };

  Kinetic.Filters.FlipX = Kinetic.Util._FilterWrapSingleBuffer(FlipX);
  Kinetic.Filters.FlipY = Kinetic.Util._FilterWrapSingleBuffer(FlipY);
})();
