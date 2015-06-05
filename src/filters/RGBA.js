(function () {
    /**
     * RGBA Filter
     * @function
     * @name RGBA
     * @memberof Konva.Filters
     * @param {Object} imageData
     * @author codefo
     * @example
     * node.cache();
     * node.filters([Konva.Filters.RGBA]);
     * node.blue(120);
     * node.green(200);
     * node.alpha(0.3);
     */
    Konva.Filters.RGBA = function (imageData) {
        var data = imageData.data,
            nPixels = data.length,
            red = this.red(),
            green = this.green(),
            blue = this.blue(),
            alpha = this.alpha(),
            i, brightness;

        for (i = 0; i < nPixels; i += 4) {
            brightness = (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2])/255;
            data[i] = brightness*red; // r
            data[i + 1] = brightness*green; // g
            data[i + 2] = brightness*blue; // b
            data[i + 3] = brightness*alpha; // alpha
        }
    };

    Konva.Factory.addGetterSetter(Konva.Node, 'red', 0, function(val) {
        this._filterUpToDate = false;
        if (val > 255) {
            return 255;
        }
        else if (val < 0) {
            return 0;
        }
        else {
            return Math.round(val);
        }
    });
    /**
    * get/set filter red value. Use with {@link Konva.Filters.RGBA} filter.
    * @name red
    * @method
    * @memberof Konva.Node.prototype
    * @param {Integer} red value between 0 and 255
    * @returns {Integer}
    */

    Konva.Factory.addGetterSetter(Konva.Node, 'green', 0, function(val) {
        this._filterUpToDate = false;
        if (val > 255) {
            return 255;
        }
        else if (val < 0) {
            return 0;
        }
        else {
            return Math.round(val);
        }
    });
    /**
    * get/set filter green value. Use with {@link Konva.Filters.RGBA} filter.
    * @name green
    * @method
    * @memberof Konva.Node.prototype
    * @param {Integer} green value between 0 and 255
    * @returns {Integer}
    */

    Konva.Factory.addGetterSetter(Konva.Node, 'blue', 0, Konva.Validators.RGBComponent, Konva.Factory.afterSetFilter);
    /**
    * get/set filter blue value. Use with {@link Konva.Filters.RGBA} filter.
    * @name blue
    * @method
    * @memberof Konva.Node.prototype
    * @param {Integer} blue value between 0 and 255
    * @returns {Integer}
    */

    Konva.Factory.addGetterSetter(Konva.Node, 'alpha', 0, function(val) {
        this._filterUpToDate = false;
        if (val > 1) {
            return 1;
        }
        else if (val < 0) {
            return 0;
        }
        else {
            return Math.round(val);
        }
    });
    /**
     * get/set filter alpha value. Use with {@link Konva.Filters.RGBA} filter.
     * @name alpha
     * @method
     * @memberof Konva.Node.prototype
     * @param {Float} alpha value between 0 and 1
     * @returns {Float}
     */
})();
