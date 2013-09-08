Grayscale = (function () {
  var Grayscale = function (src, dst) {
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
  return Grayscale;
})();
