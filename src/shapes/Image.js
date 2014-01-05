(function() {

    // CONSTANTS
    var IMAGE = 'Image',
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
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = IMAGE;
            this.sceneFunc(this._sceneFunc);
            this.hitFunc(this._hitFunc);
        },
        _useBufferCanvas: function() {
            return (this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke();
        },
        _sceneFunc: function(context) {
            var width = this.getWidth(), 
                height = this.getHeight(), 
                image = this.getImage(),
                crop, cropWidth, cropHeight, params;

            if (image) {
                crop = this.getCrop(),
                cropWidth = crop.width;
                cropHeight = crop.height;
                if (cropWidth && cropHeight) {
                    params = [image, crop.x, crop.y, cropWidth, cropHeight, 0, 0, width, height];
                } 
                else {
                    params = [image, 0, 0, width, height];
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
        _hitFunc: function(context) {
            var width = this.getWidth(), 
                height = this.getHeight();

            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        },
        getWidth: function() {
            var image = this.getImage();
            return this.attrs.width || (image ? image.width : 0);
        },
        getHeight: function() {
            var image = this.getImage();
            return this.attrs.height || (image ? image.height : 0);
        }
    };
    Kinetic.Util.extend(Kinetic.Image, Kinetic.Shape);

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

    Kinetic.Factory.addBoxGetterSetter(Kinetic.Image, 'crop', 0);
    /**
     * set crop
     * @method
     * @name setCrop
     * @memberof Kinetic.Image.prototype
     * @param {Object} crop 
     * @param {Number} crop.x
     * @param {Number} crop.y
     * @param {Number} crop.width
     * @param {Number} crop.height
     * @example
     * // set crop x, y, width and height<br>
     * image.setCrop({<br>
     *   x: 20,<br>
     *   y: 20,<br>
     *   width: 20,<br>
     *   height: 20<br>
     * });
     */

    /**
     * get crop
     * @name getCrop
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Object}
     */

     /**
     * set crop x
     * @method
     * @name setCropX
     * @memberof Kinetic.Image.prototype
     * @param {Number} x
     */

    /**
     * get crop x
     * @name getCropX
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

     /**
     * set crop y
     * @name setCropY
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} y
     */

    /**
     * get crop y
     * @name getCropY
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

     /**
     * set cropWidth
     * @name setCropWidth
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} width
     */

    /**
     * get crop width
     * @name getCropWidth
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */

     /**
     * set cropHeight
     * @name setCropHeight
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} height
     */

    /**
     * get crop height
     * @name getCropHeight
     * @method
     * @memberof Kinetic.Image.prototype
     * @returns {Number}
     */
})();
