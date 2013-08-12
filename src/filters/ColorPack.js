(function() {

    var rgb_to_hsl = function(r,g,b){
        // Input colors are in 0-255, calculations are between 0-1
        r /= 255; g /= 255; b /= 255;

        // http://en.wikipedia.org/wiki/HSL_and_HSV
        // Convert to HSL
        var max = Math.max(r,g,b),
            min = Math.min(r,g,b),
            chroma = max - min,
            luminance = chroma / 2,
            saturation = chroma / (1 - Math.abs(2*luminance-1)),
            hue = 0;
        
        if( max == r ){ hue = ((g-b)/chroma) % 6; }else
        if( max == g ){ hue =  (b-r)/chroma  + 2; }else
        if( max == b ){ hue =  (r-g)/chroma  + 4; }

        return [(hue*60+360) % 360, saturation, luminance];
    };

    var pixelShiftHue = function(r,g,b,deg){

        // Input colors are in 0-255, calculations are between 0-1
        r /= 255; g /= 255; b /= 255;

        // http://en.wikipedia.org/wiki/HSL_and_HSV
        // Convert to HSL
        var max = Math.max(r,g,b),
            min = Math.min(r,g,b),
            chroma = max - min,
            luminance = chroma / 2,
            saturation = chroma / (1 - Math.abs(2*luminance-1)),
            hue = 0;
        
        if( max == r ){ hue = ((g-b)/chroma) % 6; }else
        if( max == g ){ hue =  (b-r)/chroma  + 2; }else
        if( max == b ){ hue =  (r-g)/chroma  + 4; }
        
        hue *= 60;
        hue %= 360;
            
        // Shift hue
        hue += deg;
        hue %= 360;
        //hue /= 360;
            
        // hsl to rgb:
        hue /= 60;
        var rR = 0, rG = 0, rB = 0,
            //chroma = saturation*(1 - Math.abs(2*luminance - 1)),
            tmp = chroma * (1-Math.abs(hue % 2 - 1)),
            m = luminance - chroma/2;
            
        if( 0 <= hue && hue < 1 ){ rR = chroma; rG = tmp; }else
        if( 1 <= hue && hue < 2 ){ rG = chroma; rR = tmp; }else
        if( 2 <= hue && hue < 3 ){ rG = chroma; rB = tmp; }else
        if( 3 <= hue && hue < 4 ){ rB = chroma; rG = tmp; }else
        if( 4 <= hue && hue < 5 ){ rB = chroma; rR = tmp; }else
        if( 5 <= hue && hue < 6 ){ rR = chroma; rB = tmp; }
            
        rR += m; rG += m; rB += m;
        rR = (255*rR);
        rG = (255*rG);
        rB = (255*rB);
        
        return [rR,rG,rB];
    };

    var shift_hue = function(imageData,deg){
        var data = imageData.data,
            pixel;
        for(var i = 0; i < data.length; i += 4) {
            pixel = pixelShiftHue(data[i+0],data[i+1],data[i+2],deg);
            data[i+0] = pixel[0];
            data[i+1] = pixel[1];
            data[i+2] = pixel[2];
        }
    };

    /**
     * Shift Hue Filter.
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @author ippo615
     */
    Kinetic.Filters.ShiftHue = function(imageData) {
        shift_hue(imageData, this.getFilterHueShiftDeg() % 360 );
    };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterHueShiftDeg', 0);
    /**
     * get hue shift amount.  The shift amount is a number between 0 and 360.
     * @name getFilterBrightness
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * set hue shift amount
     * @name setFilterBrightness
     * @method
     * @memberof Kinetic.Image.prototype
     */


    /**
     * Colorize Filter.
     *  colorizes the image so that it is just varying shades of the specified color
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @author ippo615
     */
    Kinetic.Filters.Colorize = function(imageData) {
        var data = imageData.data;

        // First we'll colorize it red, then shift by the hue specified
        var color = this.getFilterColorizeColor(),
            hsl = rgb_to_hsl(color[0],color[1],color[2]),
            hue = hsl[0];

        // Color it red, by removing green and blue
        for(var i = 0; i < data.length; i += 4) {
            data[i + 1] = 0;
            data[i + 2] = 0;
        }

        // Shift by the hue
        shift_hue(imageData,hue);
    };

    Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filterColorizeColor', [255,0,0] );
    /**
     * Gets the colorizing color.
     * @name getFilterColorizeColor
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * Gets the colorizing color. Should be an array [r,g,b] ie [255,0,128].
     *  note that white [255,255,255] black [0,0,0] and greys [r,r,r] get treated as red.
     * @name setFilterColorizeColor
     * @method
     * @memberof Kinetic.Image.prototype
     */

})();

