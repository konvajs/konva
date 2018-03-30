(function() {
  'use strict';

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'redBalance',
    0,
    null, // Konva.Validators.MultiplyComponent,
    Konva.Factory.afterSetFilter
  );
  /**
    * get/set filter redBalance value. Use with {@link Konva.Filters.ColorBalance} filter.
    * @name redBalance
    * @method
    * @memberof Konva.Node.prototype
    * @param {Integer} redBalance value between 0 and 255
    * @returns {Integer}
    */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'greenBalance',
    0,
    null, // Konva.Validators.MultiplyComponent,
    Konva.Factory.afterSetFilter
  );
  /**
    * get/set filter greenBalance value. Use with {@link Konva.Filters.ColorBalance} filter.
    * @name greenBalance
    * @method
    * @memberof Konva.Node.prototype
    * @param {Integer} greenBalance value between 0 and 255
    * @returns {Integer}
    */

  Konva.Factory.addGetterSetter(
    Konva.Node,
    'blueBalance',
    0,
    null, // Konva.Validators.MultiplyComponent,
    Konva.Factory.afterSetFilter
  );
  /**
    * get/set filter blueBalance value. Use with {@link Konva.Filters.ColorBalance} filter.
    * @name blueBalance
    * @method
    * @memberof Konva.Node.prototype
    * @param {Integer} blueBalance value between 0 and 255
    * @returns {Integer}
    */

  /**
     * ColorBalance Filter
     * @function
     * @name ColorBalance
     * @memberof Konva.Filters
     * @param {Object} imageData
     * @author ippo615
     * @example
     * node.cache();
     * node.filters([Konva.Filters.ColorBalance]);
     * node.blueBalance(1.2);
     * node.greenBalance(0.5);
     */
  Konva.Filters.ColorBalance = function(imageData) {
    var data = imageData.data,
      nPixels = data.length,
      redBalance = this.redBalance(),
      greenBalance = this.greenBalance(),
      blueBalance = this.blueBalance(),
      i;

    function validate (val) {
      if (val > 255) {
        val = 255;
        return val;
      }
      return val;
    }

    for (i = 0; i < nPixels; i += 4) {
      data[i] = validate(data[i] * redBalance); // r
      data[i + 1] = validate(data[i + 1] * greenBalance); // g
      data[i + 2] = validate(data[i + 2] * blueBalance); // b
    }
  };

})();
