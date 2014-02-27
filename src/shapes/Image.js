(function() {

    // CONSTANTS
    var IMAGE = 'Image';

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
                crop = this.getCrop();
                cropWidth = crop.width;
                cropHeight = crop.height;
                if (cropWidth && cropHeight) {
                    params = [image, crop.x, crop.y, cropWidth, cropHeight, 0, 0, width, height];
                } else {
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

    Kinetic.Factory.addComponentsGetterSetter(Kinetic.Image, 'crop', ['x', 'y', 'width', 'height']);
    /**
     * get/set crop
     * @method
     * @name crop
     * @memberof Kinetic.Image.prototype
     * @param {Object} crop 
     * @param {Number} crop.x
     * @param {Number} crop.y
     * @param {Number} crop.width
     * @param {Number} crop.height
     * @returns {Object}
     * @example
     * // get crop<br>
     * var crop = image.crop();<br><br>
     *
     * // set crop<br>
     * image.crop({<br>
     *   x: 20,<br>
     *   y: 20,<br>
     *   width: 20,<br>
     *   height: 20<br>
     * });
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Image, 'cropX', 0);
    /**
     * get/set crop x
     * @method
     * @name cropX
     * @memberof Kinetic.Image.prototype
     * @param {Number} x
     * @returns {Number}
     * @example
     * // get crop x<br>
     * var cropX = image.cropX();<br><br>
     *
     * // set crop x<br>
     * image.cropX(20);
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Image, 'cropY', 0);
    /**
     * get/set crop y
     * @name cropY
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} y
     * @returns {Number}
     * @example
     * // get crop y<br>
     * var cropY = image.cropY();<br><br>
     *
     * // set crop y<br>
     * image.cropY(20);
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Image, 'cropWidth', 0);
    /**
     * get/set crop width
     * @name cropWidth
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} width
     * @returns {Number}
     * @example
     * // get crop width<br>
     * var cropWidth = image.cropWidth();<br><br>
     *
     * // set crop width<br>
     * image.cropWidth(20);
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Image, 'cropHeight', 0);
    /**
     * get/set crop height
     * @name cropHeight
     * @method
     * @memberof Kinetic.Image.prototype
     * @param {Number} height
     * @returns {Number}
     * @example
     * // get crop height<br>
     * var cropHeight = image.cropHeight();<br><br>
     *
     * // set crop height<br>
     * image.cropHeight(20);
     */

    Kinetic.Collection.mapMethods(Kinetic.Image);
})();
