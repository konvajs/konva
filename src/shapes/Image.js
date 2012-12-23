(function() {
    /**
     * Image constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {ImageObject} config.image
     * @param {Object} [config.crop]
     */
    Kinetic.Image = function(config) {
        this._initImage(config);
    };

    Kinetic.Image.prototype = {
        _initImage: function(config) {
            this.shapeType = "Image";

            // call super constructor
            Kinetic.Shape.call(this, config);
            this._setDrawFuncs();

            var that = this;
            this.on('imageChange', function(evt) {
                that._syncSize();
            });

            this._syncSize();
        },
        drawFunc: function(canvas) {
            var width = this.getWidth(), height = this.getHeight(), params, that = this, context = canvas.getContext();

            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            canvas.fillStroke(this);

            if(this.attrs.image) {
                // if cropping
                if(this.attrs.crop && this.attrs.crop.width && this.attrs.crop.height) {
                    var cropX = this.attrs.crop.x || 0;
                    var cropY = this.attrs.crop.y || 0;
                    var cropWidth = this.attrs.crop.width;
                    var cropHeight = this.attrs.crop.height;
                    params = [this.attrs.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height];
                }
                // no cropping
                else {
                    params = [this.attrs.image, 0, 0, width, height];
                }

                if(this.getShadow()) {
                    canvas.applyShadow(this, function() {
                        that._drawImage(context, params);
                    });
                }
                else {
                    this._drawImage(context, params);
                }

            }

        },
        drawHitFunc: function(canvas) {
            var width = this.getWidth(), height = this.getHeight(), imageHitRegion = this.imageHitRegion, appliedShadow = false, context = canvas.getContext();

            if(imageHitRegion) {
                context.drawImage(imageHitRegion, 0, 0, width, height);
                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                canvas.stroke(this);
            }
            else {
                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                canvas.fillStroke(this);
            }
        },
        /**
         * apply filter
         * @name applyFilter
         * @methodOf Kinetic.Image.prototype
         * @param {Object} config
         * @param {Function} filter filter function
         * @param {Object} [config] optional config object used to configure filter
         * @param {Function} [callback] callback function to be called once
         *  filter has been applied
         */
        applyFilter: function(filter, config, callback) {
            var canvas = new Kinetic.Canvas(this.attrs.image.width, this.attrs.image.height);
            var context = canvas.getContext();
            context.drawImage(this.attrs.image, 0, 0);
            try {
                var imageData = context.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());
                filter(imageData, config);
                var that = this;
                Kinetic.Type._getImage(imageData, function(imageObj) {
                    that.setImage(imageObj);

                    if(callback) {
                        callback();
                    }
                });
            }
            catch(e) {
                Kinetic.Global.warn('Unable to apply filter. ' + e.message);
            }
        },
        /**
         * set crop
         * @name setCrop
         * @methodOf Kinetic.Image.prototype
         * @param {Object|Array} config
         * @param {Number} config.x
         * @param {Number} config.y
         * @param {Number} config.width
         * @param {Number} config.height
         */
        setCrop: function() {
            var config = [].slice.call(arguments);
            var pos = Kinetic.Type._getXY(config);
            var size = Kinetic.Type._getSize(config);
            var both = Kinetic.Type._merge(pos, size);
            this.setAttr('crop', Kinetic.Type._merge(both, this.getCrop()));
        },
        /**
         * create image hit region which enables more accurate hit detection mapping of the image
         *  by avoiding event detections for transparent pixels
         * @name createImageHitRegion
         * @methodOf Kinetic.Image.prototype
         * @param {Function} [callback] callback function to be called once
         *  the image hit region has been created
         */
        createImageHitRegion: function(callback) {
            var canvas = new Kinetic.Canvas(this.attrs.width, this.attrs.height);
            var context = canvas.getContext();
            context.drawImage(this.attrs.image, 0, 0);
            try {
                var imageData = context.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());
                var data = imageData.data;
                var rgbColorKey = Kinetic.Type._hexToRgb(this.colorKey);
                // replace non transparent pixels with color key
                for(var i = 0, n = data.length; i < n; i += 4) {
                    data[i] = rgbColorKey.r;
                    data[i + 1] = rgbColorKey.g;
                    data[i + 2] = rgbColorKey.b;
                    // i+3 is alpha (the fourth element)
                }

                var that = this;
                Kinetic.Type._getImage(imageData, function(imageObj) {
                    that.imageHitRegion = imageObj;
                    if(callback) {
                        callback();
                    }
                });
            }
            catch(e) {
                Kinetic.Global.warn('Unable to create image hit region. ' + e.message);
            }
        },
        /**
         * clear image hit region
         * @name clearImageHitRegion
         * @methodOf Kinetic.Image.prototype
         */
        clearImageHitRegion: function() {
            delete this.imageHitRegion;
        },
        _syncSize: function() {
            if(this.attrs.image) {
                if(!this.attrs.width) {
                    this.setWidth(this.attrs.image.width);
                }
                if(!this.attrs.height) {
                    this.setHeight(this.attrs.image.height);
                }
            }
        },
        _drawImage: function(context, a) {
            if(a.length === 5) {
                context.drawImage(a[0], a[1], a[2], a[3], a[4]);
            }
            else if(a.length === 9) {
                context.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
            }
        }
    };
    Kinetic.Global.extend(Kinetic.Image, Kinetic.Shape);

    // add getters setters
    Kinetic.Node.addGettersSetters(Kinetic.Image, ['image']);
    Kinetic.Node.addGetters(Kinetic.Image, ['crop']);

    /**
     * set image
     * @name setImage
     * @methodOf Kinetic.Image.prototype
     * @param {ImageObject} image
     */

    /**
     * get crop
     * @name getCrop
     * @methodOf Kinetic.Image.prototype
     */

    /**
     * get image
     * @name getImage
     * @methodOf Kinetic.Image.prototype
     */
})();
