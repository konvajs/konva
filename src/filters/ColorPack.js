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

  Kinetic.Filters.ShiftHue = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      HSV(src, dst||src, opt );
    }else{
      HSV.call(this, src, dst||src, opt || {
        hue: this.getFilterHueShiftDeg()
      });
    }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterHueShiftDeg', 0);

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




    /**
     * Colorize Filter.
     *  colorizes the image so that it is just varying shades of the specified color
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @author ippo615
     */
  var Colorize = function (src, dst, opt) {
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      color = opt.colorizeColor || [255,0,0],
      i, brightness;

    for (i = 0; i < nPixels; i += 4) {
      brightness = (0.34 * srcPixels[i] + 0.5 * srcPixels[i + 1] + 0.16 * srcPixels[i + 2])/255;
      dstPixels[i    ] = brightness*color[0]; // r
      dstPixels[i + 1] = brightness*color[1]; // g
      dstPixels[i + 2] = brightness*color[2]; // b
      dstPixels[i + 3] = srcPixels[i + 3]; // alpha
    }
  };

  Kinetic.Filters.Colorize = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      Colorize(src, dst||src, opt );
    }else{
      Colorize.call(this, src, dst||src, opt || {
        colorizeColor: this.getFilterColorizeColor()
      });
    }
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

