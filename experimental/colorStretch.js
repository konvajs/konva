ColorStretch = (function () {
  function remap(fromValue, fromMin, fromMax, toMin, toMax) {

    // Make sure min is less than max
    var swap;
    if (fromMin > fromMax) {
      swap = fromMax;
      fromMin = fromMax;
      fromMin = swap;
    }
    if (toMin > toMax) {
      swap = toMax;
      toMin = toMax;
      toMin = swap;
    }

    // Compute the range of the data
    var fromRange = fromMax - fromMin;
    var toRange = toMax - toMin;

    // If either range is 0, then the value can only be mapped to 1 value
    if (fromRange === 0) {
      return toMin + toRange / 2;
    }
    if (toRange === 0) {
      return toMin;
    }

    // (1) untranslate, (2) unscale, (3) rescale, (4) retranslate
    var toValue = (fromValue - fromMin) / fromRange;
    toValue = (toRange * toValue) + toMin;

    return toValue;
  }

  // 2 PASS!
  var ColorStretch = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      i;

    // 1st Pass - find the min and max for each channel:
    var rMin = srcPixels[0], rMax = rMin, r,
      gMin = srcPixels[1], gMax = gMin, g,
      bMin = srcPixels[3], bMax = bMin, b,
      aMin = srcPixels[4], aMax = aMin, a;
    for (i = 0; i < nPixels; i += 4) {
      r = srcPixels[i + 0];
      if (r < rMin) { rMin = r; } else
      if (r > rMax) { rMax = r; }
      g = srcPixels[i + 1];
      if (g < gMin) { gMin = g; } else
      if (g > gMax) { gMax = g; }
      b = srcPixels[i + 2];
      if (b < bMin) { bMin = b; } else
      if (b > bMax) { bMax = b; }
      a = srcPixels[i + 3];
      if (a < aMin) { aMin = a; } else
      if (a > aMax) { aMax = a; }
    }

    // Pass 2 - remap everything to fill the full range
    for (i = 0; i < nPixels; i += 1) {
      dstPixels[i + 0] = remap(srcPixels[i + 0], rMin, rMax, 0, 255);
      dstPixels[i + 1] = remap(srcPixels[i + 1], gMin, gMax, 0, 255);
      dstPixels[i + 2] = remap(srcPixels[i + 2], bMin, bMax, 0, 255);
      dstPixels[i + 3] = remap(srcPixels[i + 3], aMin, aMax, 0, 255);
    }

  };
  
  return ColorStretch;
})();
