(function() {
  'use strict';
  /**
   * Noise Filter. Randomly adds or substracts to the color channels
   * @function
   * @name Noise
   * @memberof Konva.Filters
   * @param {Object} imageData
   * @author ippo615
   * @example
   * node.cache();
   * node.filters([Konva.Filters.Noise]);
   * node.noise(0.8);
   */
  Konva.Filters.Noise = function(imageData) {
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

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'noise',
    0.2,
    Konva.Validators.getNumberValidator(),
    Konva.Factory.afterSetFilter
  );
  /**
   * get/set noise amount.  Must be a value between 0 and 1. Use with {@link Konva.Filters.Noise} filter.
   * @name noise
   * @method
   * @memberof Konva.Node.prototype
   * @param {Number} noise
   * @returns {Number}
   */
})();
