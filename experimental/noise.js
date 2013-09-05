Noise = (function () {
  var Noise = function (src, dst, opt) {
    var amount = opt.amount || 32,
      affectAlpha = opt.affectAlpha || 0;
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      half = amount / 2,
      i;
    if (affectAlpha) {
      for (i = 0; i < nPixels; i += 4) {
        dstPixels[i + 0] = srcPixels[i + 0] + half - 2 * half * Math.random();
        dstPixels[i + 1] = srcPixels[i + 1] + half - 2 * half * Math.random();
        dstPixels[i + 2] = srcPixels[i + 2] + half - 2 * half * Math.random();
        dstPixels[i + 3] = srcPixels[i + 3] + half - 2 * half * Math.random();
      }
    } else {
      for (i = 0; i < nPixels; i += 4) {
        dstPixels[i + 0] = srcPixels[i + 0] + half - 2 * half * Math.random();
        dstPixels[i + 1] = srcPixels[i + 1] + half - 2 * half * Math.random();
        dstPixels[i + 2] = srcPixels[i + 2] + half - 2 * half * Math.random();
        dstPixels[i + 3] = srcPixels[i + 3];
      }
    }
  };
  return Noise;
})();