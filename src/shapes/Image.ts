import { Util } from '../Util';
import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { _registerNode } from '../Global';
import {
  getNumberOrArrayOfNumbersValidator,
  getNumberValidator,
} from '../Validators';

import { GetSet, IRect } from '../types';
import { Context } from '../Context';

export interface ImageConfig extends ShapeConfig {
  image: CanvasImageSource | undefined;
  crop?: IRect;
  cornerRadius?: number | number[];
}

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
export class Image extends Shape<ImageConfig> {
  constructor(attrs: ImageConfig) {
    super(attrs);
    this.on('imageChange.konva', () => {
      this._setImageLoad();
    });

    this._setImageLoad();
  }
  _setImageLoad() {
    const image = this.image() as any;
    // check is image is already loaded
    if (image && image.complete) {
      return;
    }
    // check is video is already loaded
    if (image && image.readyState === 4) {
      return;
    }
    if (image && image['addEventListener']) {
      image['addEventListener']('load', () => {
        this._requestDraw();
      });
    }
  }
  _useBufferCanvas() {
    const hasCornerRadius = !!this.cornerRadius();
    const hasShadow = this.hasShadow();
    if (hasCornerRadius && hasShadow) {
      return true;
    }
    return super._useBufferCanvas(true);
  }
  _sceneFunc(context: Context) {
    const width = this.getWidth();
    const height = this.getHeight();
    const cornerRadius = this.cornerRadius();
    const image = this.attrs.image;
    let params;

    if (image) {
      const cropWidth = this.attrs.cropWidth;
      const cropHeight = this.attrs.cropHeight;
      if (cropWidth && cropHeight) {
        params = [
          image,
          this.cropX(),
          this.cropY(),
          cropWidth,
          cropHeight,
          0,
          0,
          width,
          height,
        ];
      } else {
        params = [image, 0, 0, width, height];
      }
    }

    if (this.hasFill() || this.hasStroke() || cornerRadius) {
      context.beginPath();
      cornerRadius
        ? Util.drawRoundedRectPath(context, width, height, cornerRadius)
        : context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    }

    if (image) {
      if (cornerRadius) {
        context.clip();
      }
      context.drawImage.apply(context, params);
    }
    // If you need to draw later, you need to execute save/restore
  }
  _hitFunc(context: Context) {
    const width = this.width(),
      height = this.height(),
      cornerRadius = this.cornerRadius();

    context.beginPath();
    if (!cornerRadius) {
      context.rect(0, 0, width, height);
    } else {
      Util.drawRoundedRectPath(context, width, height, cornerRadius);
    }
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.attrs.width ?? (this.image() as any)?.width;
  }
  getHeight() {
    return this.attrs.height ?? (this.image() as any)?.height;
  }

  /**
   * load image from given url and create `Konva.Image` instance
   * @method
   * @memberof Konva.Image
   * @param {String} url image source
   * @param {Function} callback with Konva.Image instance as first argument
   * @param {Function} onError optional error handler
   * @example
   *  Konva.Image.fromURL(imageURL, function(image){
   *    // image is Konva.Image instance
   *    layer.add(image);
   *    layer.draw();
   *  });
   */
  static fromURL(
    url: string,
    callback: (img: Image) => void,
    onError: OnErrorEventHandler = null
  ) {
    const img = Util.createImageElement();
    img.onload = function () {
      const image = new Image({
        image: img,
      });
      callback(image);
    };
    img.onerror = onError;
    img.crossOrigin = 'Anonymous';
    img.src = url;
  }

  image: GetSet<CanvasImageSource | undefined, this>;
  crop: GetSet<IRect, this>;
  cropX: GetSet<number, this>;
  cropY: GetSet<number, this>;
  cropWidth: GetSet<number, this>;
  cropHeight: GetSet<number, this>;
  cornerRadius: GetSet<number | number[], this>;
}

Image.prototype.className = 'Image';
_registerNode(Image);

/**
 * get/set corner radius
 * @method
 * @name Konva.Image#cornerRadius
 * @param {Number} cornerRadius
 * @returns {Number}
 * @example
 * // get corner radius
 * var cornerRadius = image.cornerRadius();
 *
 * // set corner radius
 * image.cornerRadius(10);
 *
 * // set different corner radius values
 * // top-left, top-right, bottom-right, bottom-left
 * image.cornerRadius([0, 10, 20, 30]);
 */
Factory.addGetterSetter(
  Image,
  'cornerRadius',
  0,
  getNumberOrArrayOfNumbersValidator(4)
);

/**
 * get/set image source. It can be image, canvas or video element
 * @name Konva.Image#image
 * @method
 * @param {Object} image source
 * @returns {Object}
 * @example
 * // get value
 * var image = shape.image();
 *
 * // set value
 * shape.image(img);
 */
Factory.addGetterSetter(Image, 'image');

Factory.addComponentsGetterSetter(Image, 'crop', ['x', 'y', 'width', 'height']);
/**
 * get/set crop
 * @method
 * @name Konva.Image#crop
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

Factory.addGetterSetter(Image, 'cropX', 0, getNumberValidator());
/**
 * get/set crop x
 * @method
 * @name Konva.Image#cropX
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get crop x
 * var cropX = image.cropX();
 *
 * // set crop x
 * image.cropX(20);
 */

Factory.addGetterSetter(Image, 'cropY', 0, getNumberValidator());
/**
 * get/set crop y
 * @name Konva.Image#cropY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get crop y
 * var cropY = image.cropY();
 *
 * // set crop y
 * image.cropY(20);
 */

Factory.addGetterSetter(Image, 'cropWidth', 0, getNumberValidator());
/**
 * get/set crop width
 * @name Konva.Image#cropWidth
 * @method
 * @param {Number} width
 * @returns {Number}
 * @example
 * // get crop width
 * var cropWidth = image.cropWidth();
 *
 * // set crop width
 * image.cropWidth(20);
 */

Factory.addGetterSetter(Image, 'cropHeight', 0, getNumberValidator());
/**
 * get/set crop height
 * @name Konva.Image#cropHeight
 * @method
 * @param {Number} height
 * @returns {Number}
 * @example
 * // get crop height
 * var cropHeight = image.cropHeight();
 *
 * // set crop height
 * image.cropHeight(20);
 */
