(function () {

  /**
   * BlurX Filter. Blurs the image in the X direction (horizontally). It
   *  performs w*h pixel reads, and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.blurWidth] how many neighboring pixels to will affect the
   *  blurred pixel, default: 5
   */

  var BlurX = function(src,dst,opt){

    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y, k, tmp, r=0,g=0,b=0,a=0;

    // DONT USE: kSize = opt.blurWidth || 5;
    // HINT: consider when (opt.blurWidth = 0)
    var kSize = 5;
    if( opt.hasOwnProperty('blurWidth') ){
      kSize = Math.round( Math.abs(opt.blurWidth) )+1;
    }
    var kMid = Math.floor(kSize/2);

    //console.info('Blur Width: '+kSize);
    //console.info('Blur Middle: '+kMid);

    var xEnd = xSize - kMid;

    for (y = 0; y < ySize; y += 1) {
      r=0;g=0;b=0;a=0;
      for (x=-kMid; x<kMid; x+=1 ){
        // Add the new
        //if( y === 0 ){ console.info('Loading pixel at: '+((x+xSize)%xSize) ); }
        i = (y * xSize + (x+xSize)%xSize ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
      }

      for (x = 0; x < xSize; x += 1) {
        //if( y === 0 ){ console.info('Added pixel at: '+(x+kMid)); }
        //if( y === 0 ){ console.info('Recorded pixel at: '+x); }
        //if( y === 0 ){ console.info('Removed pixel at: '+((x-kMid+xSize)%xSize) ); }
        // Add the new
        i = (y * xSize + (x+kMid)%xSize ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
        // Store the result
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
        // Subtract the old
        i = (y * xSize + (x-kMid+xSize)%xSize ) * 4;
        r -= srcPixels[i+0];
        g -= srcPixels[i+1];
        b -= srcPixels[i+2];
        a -= srcPixels[i+3];
      }

    }

  };

  var _BlurX = function(src,dst,opt){

    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y, k, tmp, r=0,g=0,b=0,a=0;

    var kSize = opt.blurWidth || 5,
      kMid = Math.floor(kSize/2);

    var xEnd = xSize - kMid;

    for (y = 0; y < ySize; y += 1) {
      // Let's pretend we have a row of pixels with values: [1,2,3,4,5,6,7,8]
      // To blur them, we need to compute a moving average as we move across it
      // Let's say the moving average will have 5 elements in it, that means
      // we need a buffer of 5 elements but we're summing them everytime so
      // we'll just store the sum.
      // To start we add everything before the (5/2)=2.5, 2nd element
      // Then we add the 3rd element
      // 12345 12345 12345 12345 12345
      // 123   1234  12345  2345   345
      // 6     6A    6AF   6AFE  6AFEC
      r=0;g=0;b=0;a=0;
      for (x=0; x<kMid; x+=1 ){
        // Add the new
        i = (y * xSize + x ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
      }
      for (x=0, tmp=kMid; x<kMid; x+=1,tmp+=1 ){
        // Add the new
        i = (y * xSize + x+kMid ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
        // Store it
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
      }
      for (x = kMid; x < xEnd; x += 1) {
        // Add the new
        i = (y * xSize + x+kMid ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
        // Subtract the old
        i = (y * xSize + x-kMid ) * 4;
        r -= srcPixels[i+0];
        g -= srcPixels[i+1];
        b -= srcPixels[i+2];
        a -= srcPixels[i+3];
        // Store the result
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
      }
      for (x=xEnd; x<xSize; x+=1 ){
        // Subtract the old
        i = (y * xSize + x - kMid ) * 4;
        r -= srcPixels[i+0];
        g -= srcPixels[i+1];
        b -= srcPixels[i+2];
        a -= srcPixels[i+3];
        // Store it
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
      }
    }

  };

  /**
   * BlurY Filter. Blurs the image in the Y direction (vertically). It
   *  performs w*h pixel reads, and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.blurHeight] how many neighboring pixels to will affect the
   *  blurred pixel, default: 5
   */

  var BlurY = function(src,dst,opt){

    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y, k, tmp, r=0,g=0,b=0,a=0;

    var kSize = 5;
    if( opt.hasOwnProperty('blurHeight') ){
      kSize = Math.round( Math.abs(opt.blurHeight) )+1;
    }
    var kMid = Math.floor(kSize/2);

    var yEnd = ySize - kMid;

    for (x = 0; x < xSize; x += 1) {
      r=0;g=0;b=0;a=0;
      for (y=-kMid; y<kMid; y+=1 ){
        // Add the new
        i = ((y+ySize)%ySize * xSize + x ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
      }

      for (y = 0; y < ySize; y += 1) {
        // Add the new
        i = ((y+kMid+ySize)%ySize * xSize + x ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
        // Store the result
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
        // Subtract the old
        i = ((y-kMid+ySize)%ySize * xSize + x ) * 4;
        r -= srcPixels[i+0];
        g -= srcPixels[i+1];
        b -= srcPixels[i+2];
        a -= srcPixels[i+3];
      }

    }

  };

  var _BlurY = function(src,dst,opt){

    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      i, m, x, y, k, tmp, r=0,g=0,b=0,a=0;

    var kSize = opt.blurHeight || 5,
      kMid = Math.floor(kSize/2);

    var yEnd = ySize - kMid;

    for (x = 0; x < xSize; x += 1) {
      r=0;g=0;b=0;a=0;
      for (y=0; y<kMid; y+=1 ){
        // Add the new
        i = (y * xSize + x ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
      }
      for (y=0, tmp=kMid; y<kMid; y+=1,tmp+=1 ){
        // Add the new
        i = ((y+kMid) * xSize + x ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
        // Store it
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
      }
      for (y = kMid; y < yEnd; y += 1) {
        // Add the new
        i = ((y+kMid) * xSize + x ) * 4;
        r += srcPixels[i+0];
        g += srcPixels[i+1];
        b += srcPixels[i+2];
        a += srcPixels[i+3];
        // Subtract the old
        i = ((y-kMid) * xSize + x ) * 4;
        r -= srcPixels[i+0];
        g -= srcPixels[i+1];
        b -= srcPixels[i+2];
        a -= srcPixels[i+3];
        // Store the result
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
      }
      for (y=yEnd; y<ySize; y+=1 ){
        // Subtract the old
        i = ((y-kMid) * xSize + x ) * 4;
        r -= srcPixels[i+0];
        g -= srcPixels[i+1];
        b -= srcPixels[i+2];
        a -= srcPixels[i+3];
        // Store it
        i = (y * xSize + x) * 4;
        dstPixels[i+0] = r/kSize;
        dstPixels[i+1] = g/kSize;
        dstPixels[i+2] = b/kSize;
        dstPixels[i+3] = a/kSize;
      }
    }

  };

  Kinetic.Filters.BlurX = Kinetic.Util._FilterWrapSingleBuffer(BlurX);
  Kinetic.Filters.BlurY = Kinetic.Util._FilterWrapSingleBuffer(BlurY);

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterRadius', 5);

  Kinetic.Filters.Blur  = Kinetic.Util._FilterWrapSingleBuffer(function(src,dst,opt){
    opt = opt || {
      blurWidth: this.getFilterRadius(),
      blurHeight: this.getFilterRadius()
    };
    Kinetic.Filters.BlurX(src,src,opt);
    Kinetic.Filters.BlurY(src,dst,opt);
    // Move the destination to the source
    //Kinetic.Util._FilterReplaceBuffer(dst,src);
  });
  
})();
