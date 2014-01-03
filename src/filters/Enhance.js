(function () {
  function remap(fromValue, fromMin, fromMax, toMin, toMax) {
    // Compute the range of the data
    var fromRange = fromMax - fromMin,
        toRange = toMax - toMin,
        toValue;

    // If either range is 0, then the value can only be mapped to 1 value
    if (fromRange === 0) {
      return toMin + toRange / 2;
    }
    if (toRange === 0) {
      return toMin;
    }

    // (1) untranslate, (2) unscale, (3) rescale, (4) retranslate
    toValue = (fromValue - fromMin) / fromRange;
    toValue = (toRange * toValue) + toMin;

    return toValue;
  }


  /**
   * Enhance Filter. Adjusts the colors so that they span the widest
   *  possible range (ie 0-255). Performs w*h pixel reads and w*h pixel
   *  writes.
   * @function
   * @memberof Kinetic.Filters
   * @param {Object} imageData
   * @author ippo615
   */
  Kinetic.Filters.Enhance = function (imageData) {
    var data = imageData.data,
        nPixels = data.length,
        rMin = data[0], rMax = rMin, r,
        gMin = data[1], gMax = gMin, g,
        bMin = data[3], bMax = bMin, b,
        aMin = data[4], aMax = aMin, a,
        i;

    // 1st Pass - find the min and max for each channel:
    for (i = 0; i < nPixels; i += 4) {
      r = data[i + 0];
      if (r < rMin) { rMin = r; } else
      if (r > rMax) { rMax = r; }
      g = data[i + 1];
      if (g < gMin) { gMin = g; } else
      if (g > gMax) { gMax = g; }
      b = data[i + 2];
      if (b < bMin) { bMin = b; } else
      if (b > bMax) { bMax = b; }
      a = data[i + 3];
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
      data[i + 0] = remap(data[i + 0], rMin, rMax, 0, 255);
      data[i + 1] = remap(data[i + 1], gMin, gMax, 0, 255);
      data[i + 2] = remap(data[i + 2], bMin, bMax, 0, 255);
      data[i + 3] = remap(data[i + 3], aMin, aMax, 0, 255);
    }
  };
})();
