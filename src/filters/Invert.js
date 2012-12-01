(function() {
    /**
     * Invert Filter
     * @function
     * @memberOf Kinetic.Filters
     * @param {Object} imageData
     * @param {Object} config
     */
    Kinetic.Filters.Invert = function(imageData, config) {
        var data = imageData.data;
        for(var i = 0; i < data.length; i += 4) {
            // red
            data[i] = 255 - data[i];
            // green
            data[i + 1] = 255 - data[i + 1];
            // blue
            data[i + 2] = 255 - data[i + 2];
        }
    };
})();
