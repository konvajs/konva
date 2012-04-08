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
    // default attrs
    if(this.attrs === undefined) {
        this.attrs = {};
    }

    // special
    this.image = config.image;

    this.shapeType = "Image";
    config.drawFunc = function() {
        if(this.image !== undefined) {
            var width = this.attrs.width !== undefined ? this.attrs.width : this.image.width;
            var height = this.attrs.height !== undefined ? this.attrs.height : this.image.height;
            var canvas = this.getCanvas();
            var context = this.getContext();
            context.beginPath();
            this.applyLineJoin();
            context.rect(0, 0, width, height);
            context.closePath();
            this.fillStroke();
            context.drawImage(this.image, 0, 0, width, height);
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
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape);
