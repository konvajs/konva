Threshold = (function () {
  var Threshold = function (src, dst, opt) {
    var level = opt.level || 128;
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
  return Threshold;
})();