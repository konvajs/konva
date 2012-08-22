///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
/**
 * Image constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 * @param {ImageObject} config.image
 * @param {Number} [config.width]
 * @param {Number} [config.height]
 * @param {Object} [config.crop]
 */
Kinetic.Image = Kinetic.Shape.extend({
    init: function(config) {
        this.shapeType = "Image";
        config.drawFunc = this.drawFunc;
        // call super constructor
        this._super(config);

        var that = this;
        this.on('imageChange', function(evt) {
            that._syncSize();
        });

        this._syncSize();
    },
    drawFunc: function(context) {
        var width = this.getWidth();
        var height = this.getHeight();

        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        this.fill(context);
        this.stroke(context);

        if(this.attrs.image) {
            // if cropping
            if(this.attrs.crop && this.attrs.crop.width && this.attrs.crop.height) {
                var cropX = this.attrs.crop.x ? this.attrs.crop.x : 0;
                var cropY = this.attrs.crop.y ? this.attrs.crop.y : 0;
                var cropWidth = this.attrs.crop.width;
                var cropHeight = this.attrs.crop.height;
                this.drawImage(context, this.attrs.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
            }
            // no cropping
            else {
                this.drawImage(context, this.attrs.image, 0, 0, width, height);
            }
        }
    },
    /**
     * set width and height
     * @name setSize
     * @methodOf Kinetic.Image.prototype
     */
    setSize: function() {
        var size = Kinetic.Type._getSize(Array.prototype.slice.call(arguments));
        this.setAttrs(size);
    },
    /**
     * return image size
     * @name getSize
     * @methodOf Kinetic.Image.prototype
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    },
    /**
     * apply filter
     * @name applyFilter
     * @methodOf Kinetic.Image.prototype
     * @param {Object} config
     * @param {Function} config.filter filter function
     * @param {Function} [config.callback] callback function to be called once
     *  filter has been applied
     */
    applyFilter: function(config) {
    	var canvas = new Kinetic.Canvas(this.attrs.width, this.attrs.height);
        var context = canvas.getContext();
        context.drawImage(this.attrs.image, 0, 0);
		try {
			var imageData = context.getImageData(0, 0, canvas.getWidth(), canvas.getHeight());
            config.filter(imageData, config);
            var that = this;
            Kinetic.Type._getImage(imageData, function(imageObj) {
                that.setImage(imageObj);

                if(config.callback) {
                    config.callback();
                }
            });
        }
        catch(e) {
            Kinetic.Global.warn('Unable to apply filter.');
        }
    },
    /**
     * create image buffer which enables more accurate hit detection mapping of the image
     *  by avoiding event detections for transparent pixels
     * @name createImageBuffer
     * @methodOf Kinetic.Image.prototype
     * @param {Function} [callback] callback function to be called once
     *  the buffer image has been created and set
     */
    createImageBuffer: function(callback) {
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
                that.bufferImage = imageObj;
                if(callback) {
                    callback();
                }
            });
        }
        catch(e) {
            Kinetic.Global.warn('Unable to create buffer image.');
        }
    },
    /**
     * clear buffer image
     * @name clearBufferImage
     * @methodOf Kinetic.Image.prototype
     */
    clearBufferImage: function() {
        delete this.bufferImage;
    },
    _syncSize: function() {
        if(this.attrs.image) {
            if(!this.attrs.width) {
                this.setAttrs({
                    width: this.attrs.image.width
                });
            }
            if(!this.attrs.height) {
                this.setAttrs({
                    height: this.attrs.image.height
                });
            }
        }
    }
});

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Image, ['image', 'crop', 'filter', 'width', 'height']);

/**
 * set width
 * @name setWidth
 * @methodOf Kinetic.Image.prototype
 * @param {Number} width
 */

/**
 * set height
 * @name setHeight
 * @methodOf Kinetic.Image.prototype
 * @param {Number} height
 */

/**
 * set image
 * @name setImage
 * @methodOf Kinetic.Image.prototype
 * @param {ImageObject} image
 */

/**
 * set crop
 * @name setCrop
 * @methodOf Kinetic.Image.prototype
 * @param {Object} config
 */

/**
 * set filter
 * @name setFilter
 * @methodOf Kinetic.Image.prototype
 * @param {Object} config
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

/**
 * get filter
 * @name getFilter
 * @methodOf Kinetic.Image.prototype
 */

/**
 * get width
 * @name getWidth
 * @methodOf Kinetic.Image.prototype
 */

/**
 * get height
 * @name getHeight
 * @methodOf Kinetic.Image.prototype
 */