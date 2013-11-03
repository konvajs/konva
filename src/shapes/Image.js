(function() {

    // CONSTANTS
    var IMAGE = 'Image',
        CROP = 'crop',
        SET = 'set';

    /**
     * Image constructor
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {ImageObject} config.image
     * @param {Object} [config.crop]
     * @@shapeParams
     * @@nodeParams
     * @example
     * var imageObj = new Image();<br>
     * imageObj.onload = function() {<br>
     *   var image = new Kinetic.Image({<br>
     *     x: 200,<br>
     *     y: 50,<br>
     *     image: imageObj,<br>
     *     width: 100,<br>
     *     height: 100<br>
     *   });<br>
     * };<br>
     * imageObj.src = '/path/to/image.jpg'
     */
    Kinetic.Image = function(config) {
        this.___init(config);
    };

    Kinetic.Image.prototype = {
        ___init: function(config) {
            var that = this;

            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = IMAGE;
        },
        _useBufferCanvas: function() {
            return (this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke();
        },
        drawFunc: function(context) {
            var width = this.getWidth(), 
                height = this.getHeight(), 
                that = this, 
                crop,
                params, 
                image;

            //TODO: this logic needs to hook int othe new caching system

            // if a filter is set, and the filter needs to be updated, reapply
            if (this.getFilter() && this._applyFilter) {
                this.applyFilter();
                this._applyFilter = false;
            }

            // NOTE: this.filterCanvas may be set by the above code block
            // In that case, cropping is already applied.
            if (this.filterCanvas) {
                image = this.filterCanvas._canvas;
                params = [image, 0, 0, width, height];
            }
            else {
                image = this.getImage();

                if (image) {
                    crop = this.getCrop();
                    if (crop) {
                        crop.x = crop.x || 0;
                        crop.y = crop.y || 0;
                        crop.width = crop.width || image.width - crop.x;
                        crop.height = crop.height || image.height - crop.y;
                        params = [image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height];
                    } else {
                        params = [image, 0, 0, width, height];
                    }
                }
            }

            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);

            if (image) {
                context.drawImage.apply(context, params);
            }
        },
        drawHitFunc: function(context) {
            var width = this.getWidth(), 
                height = this.getHeight(), 
                imageHitRegion = this.imageHitRegion;

            if(imageHitRegion) {
                context.drawImage(imageHitRegion, 0, 0);
                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                context.strokeShape(this);
            }
            else {
                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                context.fillStrokeShape(this);
            }
        },
        applyFilter: function() {
            var image = this.getImage(),
                that = this,
                width = this.getWidth(),
                height = this.getHeight(),
                filter = this.getFilter(),
                crop = this.getCrop() || {},
                filterCanvas, context, imageData;

            // Determine the region we are cropping
            crop.x = crop.x || 0;
            crop.y = crop.y || 0;
            crop.width = crop.width || image.width - crop.x;
            crop.height = crop.height || image.height - crop.y;

            // Make a filterCanvas the same size as the cropped image
            if (this.filterCanvas &&
                    this.filterCanvas.getWidth() === crop.width &&
                    this.filterCanvas.getHeight() === crop.height) {
                filterCanvas = this.filterCanvas;
                filterCanvas.getContext().clear();
            }
            else {
                filterCanvas = this.filterCanvas = new Kinetic.SceneCanvas({
                    width: crop.width, 
                    height: crop.height,
                    pixelRatio: 1
                });
            }

            context = filterCanvas.getContext();

            try {
                // Crop the image onto the filterCanvas then apply
                // the filter to the filterCanvas
                context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0,0,crop.width, crop.height);
                imageData = context.getImageData(0, 0, crop.width, crop.height);
                filter.call(this, imageData);
                context.putImageData(imageData, 0, 0);
            }
            catch(e) {
                this.clearFilter();
                Kinetic.Util.warn('Unable to apply filter. ' + e.message);
            }
        },
        /**
         * clear filter
         * @method
         * @memberof Kinetic.Image.prototype
         */
        clearFilter: function() {
            this.filterCanvas = null;
            this._applyFilter = false;
        },
        /**
         * create image hit region which enables more accurate hit detection mapping of the image
         *  by avoiding event detections for transparent pixels
         * @method
         * @memberof Kinetic.Image.prototype
         * @param {Function} [callback] callback function to be called once
         *  the image hit region has been created
         * @example
         * image.createImageHitRegion(function() {<br>
         *   layer.drawHit();<br>
         * });
         */
        createImageHitRegion: function(callback) {
            var that = this,
                width = this.getWidth(),
                height = this.getHeight(),
                canvas = new Kinetic.SceneCanvas({
                    width: width,
                    height: height,
                    pixelRatio: 1
                }),
                _context = canvas.getContext()._context,
                image = this.getImage(),
                imageData, data, rgbColorKey, i, len;

            _context.drawImage(image, 0, 0);

            try {
                imageData = _context.getImageData(0, 0, width, height);
                data = imageData.data;
                len = data.length;
                rgbColorKey = Kinetic.Util._hexToRgb(this.colorKey);

                // replace non transparent pixels with color key
                for(i = 0; i < len; i += 4) {
                    if (data[i + 3] > 0) {
                        data[i] = rgbColorKey.r;
                        data[i + 1] = rgbColorKey.g;
                        data[i + 2] = rgbColorKey.b;
                    }
                }

                Kinetic.Util._getImage(imageData, function(imageObj) {
                    that.imageHitRegion = imageObj;
                    if(callback) {
                        callback();
                    }
                });
            }
            catch(e) {
                Kinetic.Util.warn('Unable to create image hit region. ' + e.message);
            }
        },
        /**
         * clear image hit region
         * @method
         * @memberof Kinetic.Image.prototype
         */
        clearImageHitRegion: function() {
            delete this.imageHitRegion;
        },
        getWidth: function() {
            var image = this.getImage();
            return this.attrs.width || (image ? image.width : 0);
        },
        getHeight: function() {
            var image = this.getImage();
            return this.attrs.height || (image ? image.height : 0);
        },
        destroy: function(){
            Kinetic.Shape.prototype.destroy.call(this);
            delete this.filterCanvas;
            delete this.attrs;
            return this;
        }
    };
    Kinetic.Util.extend(Kinetic.Image, Kinetic.Shape);


    Kinetic.Factory.addFilterGetterSetter = function(constructor, attr, def) {
        this.addGetter(constructor, attr, def);
        this.addFilterSetter(constructor, attr);
    };

    Kinetic.Factory.addFilterSetter = function(constructor, attr) {
        var that = this,
            method = SET + Kinetic.Util._capitalize(attr);

        constructor.prototype[method] = function(val) {
            this._setAttr(attr, val);
            this._applyFilter = true;
        };
    };

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.Image, 'image');

    /**
     * set image
     * @name setImage
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {ImageObject} image
     */

    /**
     * get image
     * @name getImage
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {ImageObject}
     */

    Kinetic.Factory.addBoxGetterSetter(Kinetic.Image, 'crop');
    /**
     * set crop
     * @method
     * @name setCrop
     * @memberof Kinetic.Image.prototype
     * @param {Object|Array}
     * @example
     * // set crop x, y, width and height with an array<br>
     * image.setCrop([20, 20, 100, 100]);<br><br>
     *
     * // set crop x, y, width and height with an object<br>
     * image.setCrop({<br>
     *   x: 20,<br>
     *   y: 20,<br>
     *   width: 20,<br>
     *   height: 20<br>
     * });
     */

     /**
     * set cropX
     * @method
     * @name setCropX
     * @memberof Kinetic.Image.prototype
     * @param {Number} x
     */

     /**
     * set cropY
     * @name setCropY
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} y
     */

     /**
     * set cropWidth
     * @name setCropWidth
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} width
     */

     /**
     * set cropHeight
     * @name setCropHeight
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} height
     */

    /**
     * get crop
     * @name getCrop
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Object}
     */

    /**
     * get crop x
     * @name getCropX
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

    /**
     * get crop y
     * @name getCropY
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

    /**
     * get crop width
     * @name getCropWidth
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

    /**
     * get crop height
     * @name getCropHeight
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

     Kinetic.Factory.addFilterGetterSetter(Kinetic.Image, 'filter');

     /**
     * set filter
     * @name setFilter
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Function} filter
     */

    /**
     * get filter
     * @name getFilter
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Function}
     */
})();
