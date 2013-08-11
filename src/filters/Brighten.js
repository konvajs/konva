(function() {
    /**
     * Brighten Filter.  
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.Brighten = function(imageData) {
        var brightness = this.getFilterBrightness();
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

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterBrightness', 0);
    /**
    * get filter brightness.  The brightness is a number between -255 and 255.&nbsp; Positive values 
    *  increase the brightness and negative values decrease the brightness, making the image darker
    * @name getFilterBrightness
    * @method
    * @memberof Kinetic.Image.prototype
    */

    /**
    * set filter brightness
    * @name setFilterBrightness
    * @method
    * @memberof Kinetic.Image.prototype
    */
})();
