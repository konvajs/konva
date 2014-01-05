(function () {

  /*
   * ToPolar Filter. Converts image data to polar coordinates. Performs 
   *  w*h*4 pixel reads and w*h pixel writes. The r axis is placed along
   *  what would be the y axis and the theta axis along the x axis.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.polarCenterX] horizontal location for the center of the circle,
   *  default is in the middle
   * @param {Number} [opt.polarCenterY] vertical location for the center of the circle,
   *  default is in the middle
   */

  var ToPolar = function(src,dst,opt){

    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      xMid = opt.polarCenterX || xSize/2,
      yMid = opt.polarCenterY || ySize/2,
      i, m, x, y, k, tmp, r=0,g=0,b=0,a=0;

    // Find the largest radius
    var rad, rMax = Math.sqrt( xMid*xMid + yMid*yMid );
    x = xSize - xMid;
    y = ySize - yMid;
    rad = Math.sqrt( x*x + y*y );
    rMax = (rad > rMax)?rad:rMax;

    // We'll be uisng y as the radius, and x as the angle (theta=t)
    var rSize = ySize,
      tSize = xSize,
      radius, theta;

    // We want to cover all angles (0-360) and we need to convert to
    // radians (*PI/180)
    var conversion = 360/tSize*Math.PI/180, sin, cos;

    var x1, x2, x1i, x2i, y1, y2, y1i, y2i, scale;

    for( theta=0; theta<tSize; theta+=1 ){
      sin = Math.sin(theta*conversion);
      cos = Math.cos(theta*conversion);
      for( radius=0; radius<rSize; radius+=1 ){
        x = xMid+rMax*radius/rSize*cos;
        y = yMid+rMax*radius/rSize*sin;
        if( x <= 1 ){ x = 1; }
        if( x >= xSize-0.5 ){ x = xSize-1; }
        if( y <= 1 ){ y = 1; }
        if( y >= ySize-0.5 ){ y = ySize-1; }

        // Interpolate x and y by going +-0.5 around the pixel's central point
        // this gives us the 4 nearest pixels to our 1x1 non-aligned pixel.
        // We average the vaules of those pixels based on how much of our
        // non-aligned pixel overlaps each of them.
        x1 = x - 0.5;
        x2 = x + 0.5;
        x1i = Math.floor(x1);
        x2i = Math.floor(x2);
        y1 = y - 0.5;
        y2 = y + 0.5;
        y1i = Math.floor(y1);
        y2i = Math.floor(y2);

        scale = (1-(x1-x1i))*(1-(y1-y1i));
        i = (y1i*xSize + x1i)*4;
        r = srcPixels[i+0]*scale;
        g = srcPixels[i+1]*scale;
        b = srcPixels[i+2]*scale;
        a = srcPixels[i+3]*scale;

        scale = (1-(x1-x1i))*(y2-y2i);
        i = (y2i*xSize + x1i)*4;
        r += srcPixels[i+0]*scale;
        g += srcPixels[i+1]*scale;
        b += srcPixels[i+2]*scale;
        a += srcPixels[i+3]*scale;

        scale = (x2-x2i)*(y2-y2i);
        i = (y2i*xSize + x2i)*4;
        r += srcPixels[i+0]*scale;
        g += srcPixels[i+1]*scale;
        b += srcPixels[i+2]*scale;
        a += srcPixels[i+3]*scale;

        scale = (x2-x2i)*(1-(y1-y1i));
        i = (y1i*xSize + x2i)*4;
        r += srcPixels[i+0]*scale;
        g += srcPixels[i+1]*scale;
        b += srcPixels[i+2]*scale;
        a += srcPixels[i+3]*scale;

        // Store it
        //i = (theta * xSize + radius) * 4;
        i = (theta + radius*xSize) * 4;
        dstPixels[i+0] = r;
        dstPixels[i+1] = g;
        dstPixels[i+2] = b;
        dstPixels[i+3] = a;

      }
    }
  };

  /*
   * FromPolar Filter. Converts image data from polar coordinates back to rectangular.
   *  Performs w*h*4 pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.polarCenterX] horizontal location for the center of the circle,
   *  default is in the middle
   * @param {Number} [opt.polarCenterY] vertical location for the center of the circle,
   *  default is in the middle
   * @param {Number} [opt.polarRotation] amount to rotate the image counterclockwis,
   *  0 is no rotation, 360 degrees is a full rotation
   */

  var FromPolar = function(src,dst,opt){

    var srcPixels = src.data,
      dstPixels = dst.data,
      xSize = src.width,
      ySize = src.height,
      xMid = opt.polarCenterX || xSize/2,
      yMid = opt.polarCenterY || ySize/2,
      i, m, x, y, dx, dy, k, tmp, r=0,g=0,b=0,a=0;


    // Find the largest radius
    var rad, rMax = Math.sqrt( xMid*xMid + yMid*yMid );
    x = xSize - xMid;
    y = ySize - yMid;
    rad = Math.sqrt( x*x + y*y );
    rMax = (rad > rMax)?rad:rMax;

    // We'll be uisng x as the radius, and y as the angle (theta=t)
    var rSize = ySize,
      tSize = xSize,
      radius, theta,
      phaseShift = opt.polarRotation || 0;

    // We need to convert to degrees and we need to make sure
    // it's between (0-360)
    // var conversion = tSize/360*180/Math.PI;
    var conversion = tSize/360*180/Math.PI;

    var x1, x2, x1i, x2i, y1, y2, y1i, y2i, scale;

    for( x=0; x<xSize; x+=1 ){
      for( y=0; y<ySize; y+=1 ){
        dx = x - xMid;
        dy = y - yMid;
        radius = Math.sqrt(dx*dx + dy*dy)*rSize/rMax;
        theta = (Math.atan2(dy,dx)*180/Math.PI + 360 + phaseShift)%360;
        theta = theta*tSize/360;

        // Interpolate x and y by going +-0.5 around the pixel's central point
        // this gives us the 4 nearest pixels to our 1x1 non-aligned pixel.
        // We average the vaules of those pixels based on how much of our
        // non-aligned pixel overlaps each of them.
        x1 = theta - 0.5; 
        x2 = theta + 0.5; 
        x1i = Math.floor(x1);
        x2i = Math.floor(x2);
        y1 = radius - 0.5;
        y2 = radius + 0.5;
        y1i = Math.floor(y1);
        y2i = Math.floor(y2);

        scale = (1-(x1-x1i))*(1-(y1-y1i));
        i = (y1i*xSize + x1i)*4;
        r = srcPixels[i+0]*scale;
        g = srcPixels[i+1]*scale;
        b = srcPixels[i+2]*scale;
        a = srcPixels[i+3]*scale;

        scale = (1-(x1-x1i))*(y2-y2i);
        i = (y2i*xSize + x1i)*4;
        r += srcPixels[i+0]*scale;
        g += srcPixels[i+1]*scale;
        b += srcPixels[i+2]*scale;
        a += srcPixels[i+3]*scale;

        scale = (x2-x2i)*(y2-y2i);
        i = (y2i*xSize + x2i)*4;
        r += srcPixels[i+0]*scale;
        g += srcPixels[i+1]*scale;
        b += srcPixels[i+2]*scale;
        a += srcPixels[i+3]*scale;

        scale = (x2-x2i)*(1-(y1-y1i));
        i = (y1i*xSize + x2i)*4;
        r += srcPixels[i+0]*scale;
        g += srcPixels[i+1]*scale;
        b += srcPixels[i+2]*scale;
        a += srcPixels[i+3]*scale;

        // Store it
        i = (y*xSize + x)*4;
        dstPixels[i+0] = r;
        dstPixels[i+1] = g;
        dstPixels[i+2] = b;
        dstPixels[i+3] = a;
      }
    }

  };

  //Kinetic.Filters.ToPolar = Kinetic.Util._FilterWrapDoubleBuffer(ToPolar);
  //Kinetic.Filters.FromPolar = Kinetic.Util._FilterWrapDoubleBuffer(FromPolar);

  // create a temporary canvas for working - shared between multiple calls
  var tempCanvas = document.createElement('canvas');

  /*
   * Kalidescope Filter. 
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   */
  Kinetic.Filters.Kalidescope = function(imageData){
    var xSize = imageData.width,
        ySize = imageData.height;
    var nCopies = Math.round( this.kalidescopeSides() );
    var size = Math.round( this.kalidescopeSides() );
    var offset = this.kalidescopeOffset() || 0;
    if( nCopies < 1 ){return;}

    // Work with our shared buffer canvas
    tempCanvas.width = xSize;
    tempCanvas.height = ySize;
    var scratchData = tempCanvas.getContext('2d').getImageData(0,0,xSize,ySize);

    // Convert thhe original to polar coordinates
    ToPolar( imageData, scratchData, {
      polarCenterX:xSize/2,
      polarCenterY:ySize/2
    });

    // Copy/repeat a section along the r axis for effect
    //var sectionSize = size; //Math.floor(xSize/nCopies);
    //var nCopies = xSize/sectionSize;
    var sectionSize = Math.ceil(xSize/nCopies);
    var x,y,xoff,i, r,g,b,a, srcPos, dstPos;

    // Copy the offset region to 0
    for( y=0; y<ySize; y+=1 ){
      for( x=0; x<sectionSize; x+=1 ){
        xoff = Math.round(x+offset)%xSize;
        srcPos = (xSize*y+xoff)*4;
        r = scratchData.data[srcPos+0];
        g = scratchData.data[srcPos+1];
        b = scratchData.data[srcPos+2];
        a = scratchData.data[srcPos+3];
        dstPos = (xSize*y+x)*4;
        scratchData.data[dstPos+0] = r;
        scratchData.data[dstPos+1] = g;
        scratchData.data[dstPos+2] = b;
        scratchData.data[dstPos+3] = a;
      }
    }
    // Perform the actual effect
    for( y=0; y<ySize; y+=1 ){
      for( x=0; x<sectionSize; x+=1 ){
        srcPos = (xSize*y+x)*4;
        r = scratchData.data[srcPos+0];
        g = scratchData.data[srcPos+1];
        b = scratchData.data[srcPos+2];
        a = scratchData.data[srcPos+3];
        for( i=1; i<nCopies; i+=1 ){
          dstPos = (xSize*y+x+sectionSize*i)*4;
          scratchData.data[dstPos+0] = r;
          scratchData.data[dstPos+1] = g;
          scratchData.data[dstPos+2] = b;
          scratchData.data[dstPos+3] = a;
        }
      }
    }

    // Convert back from polar coordinates
    FromPolar(scratchData,imageData,{polarRotation:0});
  };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'kalidescopeSides', 5);
    Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'kalidescopeOffset', 0);

    /**
    * get/set kalidescope side
    * @name kalidescopeSides
    * @method
    * @memberof Kinetic.Node.prototype
    * @param {Integer} number of sides
    * @returns {Integer}
    */

    /**
    * get/set kalidescope offset
    * @name kalidescopeOffset
    * @method
    * @memberof Kinetic.Node.prototype
    * @param {Integer} offset
    * @returns {Integer}
    */
})();
