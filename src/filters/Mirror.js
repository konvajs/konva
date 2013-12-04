(function () {

  /**
   * MirrorX Filter. Copies and flips the left half of the image
   *  to the right side of the image
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

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

  /**
   * MirrorY Filter. Copies and flips the top half of the image
   *  to the bottom of the image
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */
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

  Kinetic.Filters.MirrorX = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      MirrorX(src, dst||src, opt );
    }else{
      MirrorX.call(this, src, dst||src, opt);
    }
  };

  Kinetic.Filters.MirrorY = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      MirrorY(src, dst||src, opt );
    }else{
      MirrorY.call(this, src, dst||src, opt);
    }
  };

})();
