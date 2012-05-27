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
        if(this.attrs.image !== undefined) {
            var width = this.attrs.width !== undefined ? this.attrs.width : this.attrs.image.width;
            var height = this.attrs.height !== undefined ? this.attrs.height : this.attrs.image.height;
            var cropX = this.attrs.crop.x;
            var cropY = this.attrs.crop.y;
            var cropWidth = this.attrs.crop.width;
            var cropHeight = this.attrs.crop.height;
            var canvas = this.getCanvas();
            var context = this.getContext();

            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            this.fill();
            this.stroke();

            // if cropping
            if(cropWidth !== undefined && cropHeight !== undefined) {
                this.drawImage(this.attrs.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
            }
            // no cropping
            else {
                this.drawImage(this.attrs.image, 0, 0, width, height);
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
        this.attrs.image = image;
    },
    /**
     * get image
     */
    getImage: function() {
        return this.attrs.image;
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
     */
    setSize: function() {
        this.setAttrs(arguments);
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
     */
    setCrop: function() {
        this.setAttrs({
            crop: arguments
        });
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape);
