///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
/**
 * Image constructor
 * @constructor
 * @augments Kinetic.Rect
 * @param {Object} config
 */
Kinetic.Image = function(config) {
    this.shapeType = "Image";

    // call super constructor
    Kinetic.Rect.apply(this, [config]);

    // update attrs when one of the following changes
    this.on('widthChange', this._setAttrs);
    this.on('heightChange', this._setAttrs);
    this.on('imageChange', this._setAttrs);
    this.on('cropChange', this._setAttrs);

    this._setAttrs();
};

Kinetic.Image.prototype = {
    _setAttrs: function() {
        var a = this.attrs;
        if(a.image) {
            if(!a.width) {
                a.width = a.image.width;
            }
            if(!a.height) {
                a.height = a.image.height;
            }

            var scale;
            var offset;

            if(a.crop) {
                scale = [a.width / a.crop.width, a.height / a.crop.height];
                offset = [-1 * a.crop.x, -1 * a.crop.y];
            }
            else {
                scale = [a.width / a.image.width, a.height / a.image.height];
            }

            this.setFill({
                image: a.image,
                repeat: 'no-repeat',
                scale: scale,
                offset: offset
            });
        }
    }
};

// extend Rect
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Rect);

// add setters and getters
Kinetic.GlobalObject.addSettersGetters(Kinetic.Image, ['image', 'crop']);

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
 * get image
 * @name getImage
 * @methodOf Kinetic.Image.prototype
 */