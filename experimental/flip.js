FlipX = (function () {
  var FlipX = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y;
    for (x = 0; x < xSize; x += 1) {
      for (y = 0; y < ySize; y += 1) {
        i = (y * xSize + x) * 4; // original 
        m = ((y + 1) * xSize - x) * 4; // flipped
        dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
      }
    }
  };
  return FlipX;
})();

FlipY = (function () {
  var FlipY = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y;
    for (x = 0; x < xSize; x += 1) {
      for (y = 0; y < ySize; y += 1) {
        i = (y * xSize + x) * 4; // original 
        m = ((ySize - y) * xSize + x) * 4; // flipped
        dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
      }
    }
  };
  return FlipY;
})();
