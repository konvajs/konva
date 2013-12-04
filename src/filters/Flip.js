(function () {

  /**
   * FlipX Filter. Flips the image horizontally so that the 
   *  left-most pixels become the right-most pixels and vice-versa.
   *  Performs w*h pixel reads, 0 computations, and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

  var FlipX = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      xEnd = Math.ceil(0.5*xSize),
      ySize = src.height,
      i, m, x, y, r,g,b,a;
    for (x = 0; x < xEnd; x += 1) {
      for (y = 0; y < ySize; y += 1) {
        i = (y * xSize + x) * 4; // original 
        m = (y * xSize + (xSize-1) - x) * 4; // flipped
        // Instead of copying each row from the source to the destiation
        // swap rows - this let's us achive a full flip in a single buffer
        r = srcPixels[m + 0];
        g = srcPixels[m + 1];
        b = srcPixels[m + 2];
        a = srcPixels[m + 3];
        dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
        dstPixels[i + 0] = r;
        dstPixels[i + 1] = g;
        dstPixels[i + 2] = b;
        dstPixels[i + 3] = a;
      }
    }
  };

  /**
   * FlipY Filter. Flips the image vertically so that the top-most
   *  pixels become the bottom-most pixels and vice-versa.
   *  Performs w*h pixel reads, 0 computations, and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

  var FlipY = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      yEnd = Math.ceil(0.5*ySize),
      i, m, x, y, r,g,b,a;
    for (x = 0; x < xSize; x += 1) {
      for (y = 0; y < yEnd; y += 1) {
        i = (y * xSize + x) * 4; // original 
        m = ((ySize-1 - y) * xSize + x) * 4; // flipped
        // Instead of copying each row from the source to the destiation
        // swap rows - this let's us achive a full flip in a single buffer
        r = srcPixels[m + 0];
        g = srcPixels[m + 1];
        b = srcPixels[m + 2];
        a = srcPixels[m + 3];
        dstPixels[m + 0] = srcPixels[i + 0];
        dstPixels[m + 1] = srcPixels[i + 1];
        dstPixels[m + 2] = srcPixels[i + 2];
        dstPixels[m + 3] = srcPixels[i + 3];
        dstPixels[i + 0] = r;
        dstPixels[i + 1] = g;
        dstPixels[i + 2] = b;
        dstPixels[i + 3] = a;
      }
    }
  };

  Kinetic.Filters.FlipX = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      FlipX(src, dst||src, opt );
    }else{
      FlipX.call(this, src, dst||src, opt);
    }
  };

  Kinetic.Filters.FlipY = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      FlipY(src, dst||src, opt );
    }else{
      FlipY.call(this, src, dst||src, opt);
    }
  };

})();
