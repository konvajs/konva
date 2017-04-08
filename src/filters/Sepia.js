(function() {
    'use strict';
    /**
     * Sepia Filter
     * Based on: Pixastic Lib - Sepia filter - v0.1.0
     * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
     * @function
     * @name Sepia
     * @memberof Konva.Filters
     * @param {Object} imageData
     * @author Jacob Seidelin <jseidelin@nihilogic.dk>
     * @license MPL v1.1 [http://www.pixastic.com/lib/license.txt]
     * @example
     * node.cache();
     * node.filters([Konva.Filters.Sepia]);
     */
    Konva.Filters.Sepia = function (imageData) {
        var data = imageData.data,
            w = imageData.width,
            y = imageData.height,
            w4 = w * 4,
            offsetY, x, offset, or, og, ob, r, g, b;

        do {
            offsetY = (y - 1) * w4;
            x = w;
            do {
                offset = offsetY + (x - 1) * 4;

                or = data[offset];
                og = data[offset + 1];
                ob = data[offset + 2];

                r = or * 0.393 + og * 0.769 + ob * 0.189;
                g = or * 0.349 + og * 0.686 + ob * 0.168;
                b = or * 0.272 + og * 0.534 + ob * 0.131;

                data[offset] = r > 255 ? 255 : r;
                data[offset + 1] = g > 255 ? 255 : g;
                data[offset + 2] = b > 255 ? 255 : b;
                data[offset + 3] = data[offset + 3];
            } while (--x);
        } while (--y);
    };
})();
