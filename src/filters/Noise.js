(function () {

  /**
   * Noise Filter. Randomly adds or substracts to the color channels.
   *  Performs w*h pixel reads and w*h pixel writes.
   * @function
   * @memberof Kinetic.Filters
   * @param {Object} imagedata
   * @author ippo615
   */
  Kinetic.Filters.Noise = function (imageData) {
    var amount = this.noise() * 255,
        data = imageData.data,
        nPixels = data.length,
        half = amount / 2,
        i;

      for (i = 0; i < nPixels; i += 4) {
        data[i + 0] += half - 2 * half * Math.random();
        data[i + 1] += half - 2 * half * Math.random();
        data[i + 2] += half - 2 * half * Math.random();
      }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'noise', 0.2);

  /**
  * get/set noise amount.  Returns the amount of noise. Between 0 and 1.
  * @name noise
  * @method
  * @memberof Kinetic.Node.prototype
  * @param {Number} noise
  * @returns {Number}
  */



})();
