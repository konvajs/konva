(function () {

  /**
   * Threshold Filter. Pushes any value above the mid point to 
   *  the max and any value below the mid point to the min.
   *  This affects the alpha channel.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.thresholdLevel=128] the value which divides
   *  the channel value into 2 groups (between 0 and 255)
   */

  var Threshold = function (src, dst, opt) {
    var level = 128;
    if( opt.hasOwnProperty ){
      level = opt.thresholdLevel;
    }
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      i;
    for (i = 0; i < nPixels; i += 1) {
      if (srcPixels[i] < level) {
        dstPixels[i] = 0;
      } else {
        dstPixels[i] = 255;
      }
    }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'threshold', 128);

  Kinetic.Filters.Threshold = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      Threshold(src, dst||src, opt );
    }else{
      Threshold.call(this, src, dst||src, opt || {
        thresholdLevel: this.getThresholdLevel()
      });
    }
  };

    /**
    * get threshold level.  Returns the level which divides the color channel (0-255).
    * @name getThresholdLevel
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * set threshold level.  Sets the level which divides the color channel (0-255).
    * @name setThresholdLevel
    * @method
    * @memberof Kinetic.Image.prototype
    */
})();