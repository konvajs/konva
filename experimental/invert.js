Invert = (function () {
  var Invert = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      i;
    for (i = 0; i < nPixels; i += 4) {
      dstPixels[i+0] = 255 - srcPixels[i+0]; // r
      dstPixels[i+1] = 255 - srcPixels[i+1]; // g
      dstPixels[i+2] = 255 - srcPixels[i+2]; // b
      dstPixels[i+3] =       srcPixels[i+3]; // copy alpha
    }
  };
  return Invert;
})();