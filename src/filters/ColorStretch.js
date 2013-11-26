(function () {
  function remap(fromValue, fromMin, fromMax, toMin, toMax) {

    // Make sure min is less than max (covered outside)
    /*
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
    */

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


  /**
   * ColorStretch Filter. Adjusts the colors so that they span the widest
   *  possible range (ie 0-255). Performs w*h pixel reads and w*h pixel
   *  writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

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

    // If there is only 1 level - don't remap
    if( rMax === rMin ){ rMax = 255; rMin = 0; }
    if( gMax === gMin ){ gMax = 255; gMin = 0; }
    if( bMax === bMin ){ bMax = 255; bMin = 0; }
    if( aMax === aMin ){ aMax = 255; aMin = 0; }

    // Pass 2 - remap everything to fill the full range
    for (i = 0; i < nPixels; i += 1) {
      dstPixels[i + 0] = remap(srcPixels[i + 0], rMin, rMax, 0, 255);
      dstPixels[i + 1] = remap(srcPixels[i + 1], gMin, gMax, 0, 255);
      dstPixels[i + 2] = remap(srcPixels[i + 2], bMin, bMax, 0, 255);
      dstPixels[i + 3] = remap(srcPixels[i + 3], aMin, aMax, 0, 255);
    }

  };

  Kinetic.Filters.ColorStretch = Kinetic.Util._FilterWrapSingleBuffer(ColorStretch);

})();
