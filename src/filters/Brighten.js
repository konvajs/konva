(function() {
    /**
     * Brighten Filter.  
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @example
     * node.cache();
     * node.filters([Kinetic.Filters.Brighten]);
     * node.brightness(0.8);
     */
    Kinetic.Filters.Brighten = function(imageData) {
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

    Kinetic.Factory.addGetterSetter(Kinetic.Node, 'brightness', 0, null, Kinetic.Factory.afterSetFilter);
    /**
    * get/set filter brightness.  The brightness is a number between -1 and 1.&nbsp; Positive values 
    *  brighten the pixels and negative values darken them. Use with {@link Kinetic.Filters.Brighten} filter.
    * @name brightness
    * @method
    * @memberof Kinetic.Node.prototype
    * @param {Number} brightness value between -1 and 1
    * @returns {Number}
    */

})();
