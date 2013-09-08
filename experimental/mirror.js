MirrorX = (function () {
  var MirrorX = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
	  xMid = Math.ceil(xSize / 2),
      i, m, x, y;
    for (x = 0; x <= xMid; x += 1) {
      for (y = 0; y < ySize; y += 1) {
        // copy the original
        i = (y * xSize + x) * 4;
        dstPixels[i + 0] = srcPixels[i + 0];
        dstPixels[i + 1] = srcPixels[i + 1];
        dstPixels[i + 2] = srcPixels[i + 2];
        dstPixels[i + 3] = srcPixels[i + 3];
		// copy the mirrored
		m = (y * xSize + xSize - x) * 4;
		dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
      }
    }
  };
  return MirrorX;
})();

MirrorY = (function () {
  var MirrorY = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
	  yMid = Math.ceil(ySize / 2),
      i, m, x, y;
    for (x = 0; x < xSize; x += 1) {
      for (y = 0; y <= yMid; y += 1) {
        // copy the original
        i = (y * xSize + x) * 4;
        dstPixels[i + 0] = srcPixels[i + 0];
        dstPixels[i + 1] = srcPixels[i + 1];
        dstPixels[i + 2] = srcPixels[i + 2];
        dstPixels[i + 3] = srcPixels[i + 3];
		// copy the mirrored
		m = ( (ySize-y) * xSize + x) * 4;
		dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
      }
    }
  };
  return MirrorY;
})();
