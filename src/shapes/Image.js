(function() {
  'use strict';
  // CONSTANTS
  var IMAGE = 'Image';

  /**
   * Image constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {Image} config.image
   * @param {Object} [config.crop]
   * @@shapeParams
   * @@nodeParams
   * @example
   * var imageObj = new Image();
   * imageObj.onload = function() {
   *   var image = new Konva.Image({
   *     x: 200,
   *     y: 50,
   *     image: imageObj,
   *     width: 100,
   *     height: 100
   *   });
   * };
   * imageObj.src = '/path/to/image.jpg'
   */
  Konva.Image = function(config) {
    this.___init(config);
  };

  Konva.Image.prototype = {
    ___init: function(config) {
      // call super constructor
      Konva.Shape.call(this, config);
      this.className = IMAGE;
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
    },
    _useBufferCanvas: function() {
      return (
        (this.hasShadow() || this.getAbsoluteOpacity() !== 1) &&
        this.hasStroke() &&
        this.getStage()
      );
    },
    _sceneFunc: function(context) {
      var width = this.getWidth(),
        height = this.getHeight(),
        image = this.getImage(),
        cropWidth,
        cropHeight,
        params;

      if (image) {
        cropWidth = this.getCropWidth();
        cropHeight = this.getCropHeight();
        if (cropWidth && cropHeight) {
          params = [
            image,
            this.getCropX(),
            this.getCropY(),
            cropWidth,
            cropHeight,
            0,
            0,
            width,
            height
          ];
        } else {
          params = [image, 0, 0, width, height];
        }
      }

      if (this.hasFill() || this.hasStroke()) {
        context.beginPath();
        context.rect(0, 0, width, height);
        context.closePath();
        context.fillStrokeShape(this);
      }

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
  Konva.Util.extend(Konva.Image, Konva.Shape);

  // add getters setters
  Konva.Factory.addGetterSetter(Konva.Image, 'image');

  /**
   * set image
   * @name setImage
   * @method
   * @memberof Konva.Image.prototype
   * @param {Image} image
   */

  /**
   * get image
   * @name getImage
   * @method
   * @memberof Konva.Image.prototype
   * @returns {Image}
   */

  Konva.Factory.addComponentsGetterSetter(Konva.Image, 'crop', [
    'x',
    'y',
    'width',
    'height'
  ]);
  /**
   * get/set crop
   * @method
   * @name crop
   * @memberof Konva.Image.prototype
   * @param {Object} crop
   * @param {Number} crop.x
   * @param {Number} crop.y
   * @param {Number} crop.width
   * @param {Number} crop.height
   * @returns {Object}
   * @example
   * // get crop
   * var crop = image.crop();
   *
   * // set crop
   * image.crop({
   *   x: 20,
   *   y: 20,
   *   width: 20,
   *   height: 20
   * });
   */

  Konva.Factory.addGetterSetter(
    Konva.Image,
    'cropX',
    0,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set crop x
   * @method
   * @name cropX
   * @memberof Konva.Image.prototype
   * @param {Number} x
   * @returns {Number}
   * @example
   * // get crop x
   * var cropX = image.cropX();
   *
   * // set crop x
   * image.cropX(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Image,
    'cropY',
    0,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set crop y
   * @name cropY
   * @method
   * @memberof Konva.Image.prototype
   * @param {Number} y
   * @returns {Number}
   * @example
   * // get crop y
   * var cropY = image.cropY();
   *
   * // set crop y
   * image.cropY(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Image,
    'cropWidth',
    0,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set crop width
   * @name cropWidth
   * @method
   * @memberof Konva.Image.prototype
   * @param {Number} width
   * @returns {Number}
   * @example
   * // get crop width
   * var cropWidth = image.cropWidth();
   *
   * // set crop width
   * image.cropWidth(20);
   */

  Konva.Factory.addGetterSetter(
    Konva.Image,
    'cropHeight',
    0,
    Konva.Validators.getNumberValidator()
  );
  /**
   * get/set crop height
   * @name cropHeight
   * @method
   * @memberof Konva.Image.prototype
   * @param {Number} height
   * @returns {Number}
   * @example
   * // get crop height
   * var cropHeight = image.cropHeight();
   *
   * // set crop height
   * image.cropHeight(20);
   */

  Konva.Collection.mapMethods(Konva.Image);

  /**
   * load image from given url and create `Konva.Image` instance
   * @method
   * @memberof Konva.Image
   * @param {String} url image source
   * @param {Function} callback with Konva.Image instance as first argument
   * @example
   *  Konva.Image.fromURL(imageURL, function(image){
   *    // image is Konva.Image instance
   *    layer.add(image);
   *    layer.draw();
   *  });
   */
  Konva.Image.fromURL = function(url, callback) {
    var img = new Image();
    img.onload = function() {
      var image = new Konva.Image({
        image: img
      });
      callback(image);
    };
    img.crossOrigin = 'Anonymous';
    img.src = url;
  };
})();
