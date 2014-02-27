(function () {
    function remap(fromValue, fromMin, fromMax, toMin, toMax) {
        // Compute the range of the data
        var fromRange = fromMax - fromMin,
          toRange = toMax - toMin,
          toValue;

        // If either range is 0, then the value can only be mapped to 1 value
        if (fromRange === 0) {
            return toMin + toRange / 2;
        }
        if (toRange === 0) {
            return toMin;
        }

        // (1) untranslate, (2) unscale, (3) rescale, (4) retranslate
        toValue = (fromValue - fromMin) / fromRange;
        toValue = (toRange * toValue) + toMin;

        return toValue;
    }


    /**
    * Enhance Filter. Adjusts the colors so that they span the widest
    *  possible range (ie 0-255). Performs w*h pixel reads and w*h pixel
    *  writes.
    * @function
    * @memberof Kinetic.Filters
    * @param {Object} imageData
    * @author ippo615
    */
    Kinetic.Filters.Enhance = function (imageData) {
        var data = imageData.data,
            nSubPixels = data.length,
            rMin = data[0], rMax = rMin, r,
            gMin = data[1], gMax = gMin, g,
            bMin = data[2], bMax = bMin, b,
            aMin = data[3], aMax = aMin,
            i;

        // If we are not enhancing anything - don't do any computation
        var enhanceAmount = this.enhance();
        if( enhanceAmount === 0 ){ return; }

        // 1st Pass - find the min and max for each channel:
        for (i = 0; i < nSubPixels; i += 4) {
            r = data[i + 0];
            if (r < rMin) { rMin = r; }
            else if (r > rMax) { rMax = r; }
            g = data[i + 1];
            if (g < gMin) { gMin = g; } else
            if (g > gMax) { gMax = g; }
            b = data[i + 2];
            if (b < bMin) { bMin = b; } else
            if (b > bMax) { bMax = b; }
            //a = data[i + 3];
            //if (a < aMin) { aMin = a; } else
            //if (a > aMax) { aMax = a; }
        }

        // If there is only 1 level - don't remap
        if( rMax === rMin ){ rMax = 255; rMin = 0; }
        if( gMax === gMin ){ gMax = 255; gMin = 0; }
        if( bMax === bMin ){ bMax = 255; bMin = 0; }
        if( aMax === aMin ){ aMax = 255; aMin = 0; }

        var rMid, rGoalMax,rGoalMin,
            gMid, gGoalMax,gGoalMin,
            bMid, bGoalMax,aGoalMin,
            aMid, aGoalMax,bGoalMin;

        // If the enhancement is positive - stretch the histogram 
        if ( enhanceAmount > 0 ){
            rGoalMax = rMax + enhanceAmount*(255-rMax);
            rGoalMin = rMin - enhanceAmount*(rMin-0);
            gGoalMax = gMax + enhanceAmount*(255-gMax);
            gGoalMin = gMin - enhanceAmount*(gMin-0);
            bGoalMax = bMax + enhanceAmount*(255-bMax);
            bGoalMin = bMin - enhanceAmount*(bMin-0);
            aGoalMax = aMax + enhanceAmount*(255-aMax);
            aGoalMin = aMin - enhanceAmount*(aMin-0);
        // If the enhancement is negative - compress the histogram
        } else {
            rMid = (rMax + rMin)*0.5;
            rGoalMax = rMax + enhanceAmount*(rMax-rMid);
            rGoalMin = rMin + enhanceAmount*(rMin-rMid);
            gMid = (gMax + gMin)*0.5;
            gGoalMax = gMax + enhanceAmount*(gMax-gMid);
            gGoalMin = gMin + enhanceAmount*(gMin-gMid);
            bMid = (bMax + bMin)*0.5;
            bGoalMax = bMax + enhanceAmount*(bMax-bMid);
            bGoalMin = bMin + enhanceAmount*(bMin-bMid);
            aMid = (aMax + aMin)*0.5;
            aGoalMax = aMax + enhanceAmount*(aMax-aMid);
            aGoalMin = aMin + enhanceAmount*(aMin-aMid);
        }

        // Pass 2 - remap everything, except the alpha
        for (i = 0; i < nSubPixels; i += 4) {
            data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
            data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
            data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
            //data[i + 3] = remap(data[i + 3], aMin, aMax, aGoalMin, aGoalMax);
        }
    };

    Kinetic.Factory.addGetterSetter(Kinetic.Node, 'enhance', 0, null, Kinetic.Factory.afterSetFilter);

    /**
    * get/set enhance
    * @name enhance
    * @method
    * @memberof Kinetic.Node.prototype
    * @param {Float} amount
    * @returns {Float}
    */
})();
