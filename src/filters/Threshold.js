(function () {

  /**
   * Threshold Filter. Pushes any value above the mid point to 
   *  the max and any value below the mid point to the min.
   *  This affects the alpha channel.
   * @function
   * @memberof Kinetic.Filters
   * @param {Object} imageData
   * @author ippo615
   */

  Kinetic.Filters.Threshold = function (imageData) {
    var level = this.threshold() * 255,
        data = imageData.data,
        len = data.length,
        i;

    for (i = 0; i < len; i += 1) {
      data[i] = data[i] < level ? 0 : 255;
    }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'threshold', 0.5);

  /**
  * get/set threshold.  Value between 0 and 1
  * @name threshold
  * @method
  * @memberof Kinetic.Image.prototype
  * @param {Number} threshold
  * @returns {Number}
  */
})();