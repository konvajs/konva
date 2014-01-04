(function () {

  /**
   * Levels Filter. Adjusts the channels so that there are no more
   *  than n different values for that channel. This is also applied
   *  to the alpha channel.
   * @function
   * @author ippo615
   * @memberof Kinetic.Filters
   * @param {Object} imageData
   */

  Kinetic.Filters.Levels = function (imageData) {
    // level must be between 1 and 255
    var level = Math.round(this.level() * 254) + 1,
        data = imageData.data,
        len = data.length,
        scale = (255 / level),
        i;

    for (i = 0; i < len; i += 1) {
      data[i] = Math.floor(data[i] / scale) * scale;
    }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'level', 0.5);

  /**
  * get/set levels.  Must be a number between 0 and 1
  * @name level
  * @method
  * @memberof Kinetic.Node.prototype
  * @param {Number} level between 0 and 1
  * @returns {Number}
  */
})();