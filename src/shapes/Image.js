///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
Kinetic.Image = Kinetic.Shape.extend({
    /**
     * Image constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     */
    init: function(config) {
        this.shapeType = "Image";
        config.drawFunc = function() {
            if(!!this.attrs.image) {
                var width = !!this.attrs.width ? this.attrs.width : this.attrs.image.width;
                var height = !!this.attrs.height ? this.attrs.height : this.attrs.image.height;
                var canvas = this.getCanvas();
                var context = this.getContext();

                context.beginPath();
                context.rect(0, 0, width, height);
                context.closePath();
                this.fill();
                this.stroke();

                // if cropping
                if(this.attrs.crop && this.attrs.crop.width && this.attrs.crop.height) {
                    var cropX = this.attrs.crop.x ? this.attrs.crop.x : 0;
                    var cropY = this.attrs.crop.y ? this.attrs.crop.y : 0;
                    var cropWidth = this.attrs.crop.width;
                    var cropHeight = this.attrs.crop.height;
                    this.drawImage(this.attrs.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
                }
                // no cropping
                else {
                    this.drawImage(this.attrs.image, 0, 0, width, height);
                }
            }
        };
        // call super constructor
        this._super(config);
    },
    /**
     * set width and height
     */
    setSize: function() {
        var size = Kinetic.GlobalObject._getSize(Array.prototype.slice.call(arguments));
        this.setAttrs(size);
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
});

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Image, ['height', 'width', 'image', 'crop']);

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
 * get crop
 * @name getCrop
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

/**
 * get image
 * @name getImage
 * @methodOf Kinetic.Image.prototype
 */