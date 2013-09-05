Levels = (function () {
  var Levels = function (src, dst, opt) {
    var nLevels = opt.levels || 2;
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      scale = (255 / nLevels),
      i;
    for (i = 0; i < nPixels; i += 1) {
      dstPixels[i] = Math.floor(srcPixels[i] / scale) * scale;
    }
  };
  return Levels;
})();