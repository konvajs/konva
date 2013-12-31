(function () {

  /**
   * Noise Filter. Randomly adds or substracts to the color channels.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {ImageData} src, the source image data (what will be transformed)
   * @param {ImageData} dst, the destination image data (where it will be saved)
   * @param {Object} opt
   * @param {Number} [opt.noiseAmount] The amount of noise to add. Between 0 and 255.
   *  Each channel of each pixel will change by a random amount
   *  between +- amount/2. Default is 0.
   * @param {Number} [opt.affectAlpha] 1 to add noise to the alpha channel.
   *  Default is 0.
   */
  var Noise = function (src, dst, opt) {
    var amount = opt.noiseAmount || 0,
      affectAlpha = opt.affectAlpha || 0;
    var srcPixels = src.data,
      dstPixels = dst.data,
      nPixels = srcPixels.length,
      half = amount / 2,
      i;
    if (affectAlpha) {
      for (i = 0; i < nPixels; i += 4) {
        dstPixels[i + 0] = srcPixels[i + 0] + half - 2 * half * Math.random();
        dstPixels[i + 1] = srcPixels[i + 1] + half - 2 * half * Math.random();
        dstPixels[i + 2] = srcPixels[i + 2] + half - 2 * half * Math.random();
        dstPixels[i + 3] = srcPixels[i + 3] + half - 2 * half * Math.random();
      }
    } else {
      for (i = 0; i < nPixels; i += 4) {
        dstPixels[i + 0] = srcPixels[i + 0] + half - 2 * half * Math.random();
        dstPixels[i + 1] = srcPixels[i + 1] + half - 2 * half * Math.random();
        dstPixels[i + 2] = srcPixels[i + 2] + half - 2 * half * Math.random();
        dstPixels[i + 3] = srcPixels[i + 3];
      }
    }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'noise', 32);

  Kinetic.Filters.Noise = function(src,dst,opt){
    if( this === Kinetic.Filters ){
      Noise(src, dst||src, opt );
    }else{
      Noise.call(this, src, dst||src, opt || {
        noiseAmount: this.getNoiseAmount()
      });
    }
  };

    /**
    * get noise amount.  Returns the amount of noise. Between 0 and 255.
    * @name getNoiseAmount
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * set noise amount.  Sets the amount of noise. Between 0 and 255.
    * @name setNoiseAmount
    * @method
    * @memberof Kinetic.Image.prototype
    */

})();
