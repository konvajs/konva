(function () {
  /**
   * RGB Filter
   * @function
   * @memberof Kinetic.Filters
   * @param {Object} imageData
   * @author ippo615
   */
  Kinetic.Filters.RGB = function (imageData) {
    var data = imageData.data,
        nPixels = data.length,
        red = this.red(),
        green = this.green(),
        blue = this.blue(),
        i, brightness;

    for (i = 0; i < nPixels; i += 4) {
      brightness = (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2])/255;
      data[i    ] = brightness*red; // r
      data[i + 1] = brightness*green; // g
      data[i + 2] = brightness*blue; // b
      data[i + 3] = data[i + 3]; // alpha
    }
  };

  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'red', 255);
  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'green', 0);
  Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'blue', 0);

  /**
  * get/set filter red value
  * @name red
  * @method
  * @memberof Kinetic.Node.prototype
  * @param {Integer} red value between 0 and 255
  * @returns {Integer}
  */

  /**
  * get/set filter green value
  * @name green
  * @method
  * @memberof Kinetic.Node.prototype
  * @param {Integer} green value between 0 and 255
  * @returns {Integer}
  */

  /**
  * get/set filter blue value
  * @name blue
  * @method
  * @memberof Kinetic.Node.prototype
  * @param {Integer} blue value between 0 and 255
  * @returns {Integer}
  */
})();
