(function() {
    /**
     * Brighten Filter.  
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.Brighten = function(imageData) {
        var brightness = this.brightness() * 255;
        var data = imageData.data;
        for(var i = 0; i < data.length; i += 4) {
            // red
            data[i] += brightness;
            // green
            data[i + 1] += brightness;
            // blue
            data[i + 2] += brightness;
        }
    };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Node, 'brightness', 0);
    /**
    * get/set filter brightness.  The brightness is a number between -1 and 1.&nbsp; Positive values 
    *  brighten the node and negative values darken it.
    * @name brightness
    * @method
    * @memberof Kinetic.Image.prototype
    * @param {Number} brightness value between -1 and 1
    * @returns {Number}
    */

})();
