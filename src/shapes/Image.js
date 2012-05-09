///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
/**
 * Image constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Image = function(config) {
    this.setDefaultAttrs({
        crop: {
            x: 0,
            y: 0,
            width: undefined,
            height: undefined
        }
    });

    this.shapeType = "Image";
    config.drawFunc = function() {
        if(this.image !== undefined) {
            var width = this.attrs.width !== undefined ? this.attrs.width : this.image.width;
            var height = this.attrs.height !== undefined ? this.attrs.height : this.image.height;
            var cropX = this.attrs.crop.x;
            var cropY = this.attrs.crop.y;
            var cropWidth = this.attrs.crop.width;
            var cropHeight = this.attrs.crop.height;
            var canvas = this.getCanvas();
            var context = this.getContext();

            context.beginPath();
            this.applyLineJoin();
            context.rect(0, 0, width, height);
            context.closePath();
            this.shadowFillStroke();

            // if cropping
            if(cropWidth !== undefined && cropHeight !== undefined) {
                context.drawImage(this.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
            }
            // no cropping
            else {
                context.drawImage(this.image, 0, 0, width, height);
            }
        }
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Image methods
 */
Kinetic.Image.prototype = {
    /**
     * set image
     * @param {ImageObject} image
     */
    setImage: function(image) {
        this.image = image;
    },
    /**
     * get image
     */
    getImage: function() {
        return this.image;
    },
    /**
     * set width
     * @param {Number} width
     */
    setWidth: function(width) {
        this.attrs.width = width;
    },
    /**
     * get width
     */
    getWidth: function() {
        return this.attrs.width;
    },
    /**
     * set height
     * @param {Number} height
     */
    setHeight: function(height) {
        this.attrs.height = height;
    },
    /**
     * get height
     */
    getHeight: function() {
        return this.attrs.height;
    },
    /**
     * set width and height
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function(width, height) {
        this.attrs.width = width;
        this.attrs.height = height;
    },
    /**
     * return image size
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    },
    /**
     * return cropping
     */
    getCrop: function() {
        return this.attrs.crop;
    },
    /**
     * set cropping
     * @param {Object} crop
     * @config {Number} [x] crop x
     * @config {Number} [y] crop y
     * @config {Number} [width] crop width
     * @config {Number} [height] crop height
     */
    setCrop: function(config) {
        var c = {};
        c.crop = config;
        this.setAttrs(c);
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape);
