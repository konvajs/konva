(function () {

  /**
   * Threshold Filter. Pushes any value above the mid point to 
   *  the max and any value below the mid point to the min.
   *  This affects the alpha channel.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.thresholdLevel=128] the value which divides
   *  the channel value into 2 groups (between 0 and 255)
   */

  var Threshold = function (src, dst, opt) {
    var level = opt.thresholdLevel || 128;
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      i;
    for (i = 0; i < nPixels; i += 1) {
      if (srcPixels[i] < level) {
        dstPixels[i] = 0;
      } else {
        dstPixels[i] = 255;
      }
    }
  };

  Kinetic.Filters.Threshold = Kinetic.Util._FilterWrapSingleBuffer(Threshold);
})();