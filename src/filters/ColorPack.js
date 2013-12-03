(function () {

  /**
   * HSV Filter. Adjusts the hue, saturation and value of an image.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.hue] amount to shift to the hue (in degrees)
   *  0 represents no shift, while 360 is the maximum. Default: 0
   * @param {Number} [opt.saturation] amount to scale the saturation.
   *  1 means no change, 0.5 halves (more gray), 2.0 doubles
   *  (more color), etc... Default is 1.
   * @param {Number} [opt.value] amount to scale the value.
   *  1 means no change, 0.5 halves (darker), 2.0 doubles (lighter), etc..
   *  Default is 1.
   */

  var HSV = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      i;

    var v = opt.value || 1,
      s = opt.saturation || 1,
      h = Math.abs((opt.hue || 0) + 360) % 360;

    // Basis for the technique used:
    // http://beesbuzz.biz/code/hsv_color_transforms.php
    // V is the value multiplier (1 for none, 2 for double, 0.5 for half)
    // S is the saturation multiplier (1 for none, 2 for double, 0.5 for half)
    // H is the hue shift in degrees (0 to 360)
    // vsu = V*S*cos(H*PI/180);
    // vsw = V*S*sin(H*PI/180);
    //[ .299V+.701vsu+.168vsw    .587V-.587vsu+.330vsw    .114V-.114vsu-.497vsw ] [R]
    //[ .299V-.299vsu-.328vsw    .587V+.413vsu+.035vsw    .114V-.114vsu+.292vsw ]*[G]
    //[ .299V-.300vsu+1.25vsw    .587V-.588vsu-1.05vsw    .114V+.886vsu-.203vsw ] [B]

    // Precompute the values in the matrix:
    var vsu = v*s*Math.cos(h*Math.PI/180),
        vsw = v*s*Math.sin(h*Math.PI/180);
    // (result spot)(source spot)
    var rr = 0.299*v+0.701*vsu+0.167*vsw,
        rg = 0.587*v-0.587*vsu+0.330*vsw,
        rb = 0.114*v-0.114*vsu-0.497*vsw;
    var gr = 0.299*v-0.299*vsu-0.328*vsw,
        gg = 0.587*v+0.413*vsu+0.035*vsw,
        gb = 0.114*v-0.114*vsu+0.293*vsw;
    var br = 0.299*v-0.300*vsu+1.250*vsw,
        bg = 0.587*v-0.586*vsu-1.050*vsw,
        bb = 0.114*v+0.886*vsu-0.200*vsw;

    var r,g,b,a;

    for (i = 0; i < nPixels; i += 4) {
      r = srcPixels[i+0];
      g = srcPixels[i+1];
      b = srcPixels[i+2];
      a = srcPixels[i+3];

      dstPixels[i+0] = rr*r + rg*g + rb*b;
      dstPixels[i+1] = gr*r + gg*g + gb*b;
      dstPixels[i+2] = br*r + bg*g + bb*b;
      dstPixels[i+3] = a; // alpha
    }

  };

  Kinetic.Filters.HSV = Kinetic.Util._FilterWrapSingleBuffer(HSV);

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterHue', 0);
  Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterSaturation', 1);
  Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterValue', 1);

  Kinetic.Filters.HSV = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      HSV(src, dst||src, opt );
    }else{
      HSV.call(this, src, dst||src, opt || {
        hue: this.getFilterHue(),
        saturation: this.getFilterSaturation(),
        value: this.getFilterValue()
      });
    }
  };

    /**
    * get filter hue.  Returns the hue shift for the HSV filter.
    * 0 is no change, 359 is the maximum shift.
    * @name getFilterHue
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * set filter hue.  Sets the hue shift for the HSV filter.
    * 0 is no change, 359 is the maximum shift.
    * @name setFilterHue
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * get filter saturation.  Returns the saturation scale for the HSV
    * filter. 1 is no change, 0.5 halves the saturation, 2.0 doubles, etc..
    * @name getFilterSaturation
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * set filter saturation.  Set the saturation scale for the HSV
    * filter. 1 is no change, 0.5 halves the saturation, 2.0 doubles, etc..
    * @name setFilterSaturation
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * get filter value.  Returns the value scale for the HSV
    * filter. 1 is no change, 0.5 halves the value, 2.0 doubles, etc..
    * @name getFilterValue
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * set filter value.  Set the value scale for the HSV
    * filter. 1 is no change, 0.5 halves the value, 2.0 doubles, etc..
    * @name setFilterValue
    * @method
    * @memberof Kinetic.Image.prototype
    */

})();

(function() {

    var rgb_to_hsl = function(r,g,b){
        // Input colors are in 0-255, calculations are between 0-1
        r /= 255; g /= 255; b /= 255;

        // http://en.wikipedia.org/wiki/HSL_and_HSV
        // Convert to HSL
        var max = Math.max(r,g,b),
            min = Math.min(r,g,b),
            chroma = max - min,
            luminance = chroma / 2,
            saturation = chroma / (1 - Math.abs(2*luminance-1)),
            hue = 0;
        
        if( max == r ){ hue = ((g-b)/chroma) % 6; }else
        if( max == g ){ hue =  (b-r)/chroma  + 2; }else
        if( max == b ){ hue =  (r-g)/chroma  + 4; }

        return [(hue*60+360) % 360, saturation, luminance];
    };

    var pixelShiftHue = function(r,g,b,deg){

        // Input colors are in 0-255, calculations are between 0-1
        r /= 255; g /= 255; b /= 255;

        // http://en.wikipedia.org/wiki/HSL_and_HSV
        // Convert to HSL
        var max = Math.max(r,g,b),
            min = Math.min(r,g,b),
            chroma = max - min,
            luminance = chroma / 2,
            saturation = chroma / (1 - Math.abs(2*luminance-1)),
            hue = 0;
        
        if( max == r ){ hue = ((g-b)/chroma) % 6; }else
        if( max == g ){ hue =  (b-r)/chroma  + 2; }else
        if( max == b ){ hue =  (r-g)/chroma  + 4; }
        
        hue *= 60;
        hue %= 360;
            
        // Shift hue
        hue += deg;
        hue %= 360;
        //hue /= 360;
            
        // hsl to rgb:
        hue /= 60;
        var rR = 0, rG = 0, rB = 0,
            //chroma = saturation*(1 - Math.abs(2*luminance - 1)),
            tmp = chroma * (1-Math.abs(hue % 2 - 1)),
            m = luminance - chroma/2;
            
        if( 0 <= hue && hue < 1 ){ rR = chroma; rG = tmp; }else
        if( 1 <= hue && hue < 2 ){ rG = chroma; rR = tmp; }else
        if( 2 <= hue && hue < 3 ){ rG = chroma; rB = tmp; }else
        if( 3 <= hue && hue < 4 ){ rB = chroma; rG = tmp; }else
        if( 4 <= hue && hue < 5 ){ rB = chroma; rR = tmp; }else
        if( 5 <= hue && hue < 6 ){ rR = chroma; rB = tmp; }
            
        rR += m; rG += m; rB += m;
        rR = (255*rR);
        rG = (255*rG);
        rB = (255*rB);
        
        return [rR,rG,rB];
    };

    var shift_hue = function(imageData,deg){
        var data = imageData.data,
            pixel;
        for(var i = 0; i < data.length; i += 4) {
            pixel = pixelShiftHue(data[i+0],data[i+1],data[i+2],deg);
            data[i+0] = pixel[0];
            data[i+1] = pixel[1];
            data[i+2] = pixel[2];
        }
    };

    /**
     * Shift Hue Filter.
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @author ippo615
     */
    Kinetic.Filters.ShiftHue = function(imageData) {
        shift_hue(imageData, this.getFilterHueShiftDeg() % 360 );
    };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterHueShiftDeg', 0);
    /**
     * get hue shift amount.  The shift amount is a number between 0 and 360.
     * @name getFilterBrightness
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * set hue shift amount
     * @name setFilterBrightness
     * @method
     * @memberof Kinetic.Image.prototype
     */


    /**
     * Colorize Filter.
     *  colorizes the image so that it is just varying shades of the specified color
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @author ippo615
     */
    Kinetic.Filters.Colorize = function(imageData) {
        var data = imageData.data;

        // First we'll colorize it red, then shift by the hue specified
        var color = this.getFilterColorizeColor(),
            hsl = rgb_to_hsl(color[0],color[1],color[2]),
            hue = hsl[0];

        // Color it red, by removing green and blue
        for(var i = 0; i < data.length; i += 4) {
            data[i + 1] = 0;
            data[i + 2] = 0;
        }

        // Shift by the hue
        shift_hue(imageData,hue);
    };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterColorizeColor', [255,0,0] );
    /**
     * Gets the colorizing color.
     * @name getFilterColorizeColor
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * Gets the colorizing color. Should be an array [r,g,b] ie [255,0,128].
     *  note that white [255,255,255] black [0,0,0] and greys [r,r,r] get treated as red.
     * @name setFilterColorizeColor
     * @method
     * @memberof Kinetic.Image.prototype
     */

})();

