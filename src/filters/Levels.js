(function () {

  /**
   * Levels Filter. Adjusts the channels so that there are no more
   *  than n different values for that channel. This is also applied
   *  to the alpha channel.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.quantizationLevels], the number of values allowed for each
   *  channel. Between 2 and 255. Default is 2. 
   */

  var Levels = function (src, dst, opt) {
    var nLevels = opt.quantizationLevels || 2;
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      scale = (255 / nLevels),
      i;
    for (i = 0; i < nPixels; i += 1) {
      dstPixels[i] = Math.floor(srcPixels[i] / scale) * scale;
    }
  };

  Kinetic.Filters.Levels = Kinetic.Util._FilterWrapSingleBuffer(Levels);
})();