(function() {
    'use strict';
    /**
     * Brighten Filter.
     * @function
     * @memberof Konva.Filters
     * @param {Object} imageData
     * @example
     * node.cache();
     * node.filters([Konva.Filters.Brighten]);
     * node.brightness(0.8);
     */
    Konva.Filters.Brighten = function(imageData) {
        var brightness = this.brightness() * 255,
            data = imageData.data,
            len = data.length,
            i;

        for(i = 0; i < len; i += 4) {
            // red
            data[i] += brightness;
            // green
            data[i + 1] += brightness;
            // blue
            data[i + 2] += brightness;
        }
    };

    Konva.Factory.addGetterSetter(Konva.Node, 'brightness', 0, null, Konva.Factory.afterSetFilter);
    /**
    * get/set filter brightness.  The brightness is a number between -1 and 1.&nbsp; Positive values
    *  brighten the pixels and negative values darken them. Use with {@link Konva.Filters.Brighten} filter.
    * @name brightness
    * @method
    * @memberof Konva.Node.prototype
    * @param {Number} brightness value between -1 and 1
    * @returns {Number}
    */

})();
