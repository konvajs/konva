(function () {

  /**
   * Invert Filter. Moves all color channels toward the opposite extreme
   *  ie 0 becomes 255, 10 becomes 245 etc... It does not alter the 
   *  alpha channel.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt, There are no options for this filter
   */

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

  Kinetic.Filters.Invert = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      Invert(src, dst||src, opt );
    }else{
      Invert.call(this, src, dst||src, {} );
    }
  };
})();