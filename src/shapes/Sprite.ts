import { Factory } from '../Factory';
import { Context } from '../Context';
import { Shape, ShapeConfig } from '../Shape';
import { Animation } from '../Animation';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

import { GetSet } from '../types';

export interface SpriteConfig extends ShapeConfig {
  animation: string;
  animations: any;
  frameIndex?: number;
  image: HTMLImageElement;
  frameRate?: number;
}

/**
 * Sprite constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} config.animation animation key
 * @param {Object} config.animations animation map
 * @param {Integer} [config.frameIndex] animation frame index
 * @param {Image} config.image image object
 * @param {Integer} [config.frameRate] animation frame rate
 * @@shapeParams
 * @@nodeParams
 * @example
 * var imageObj = new Image();
 * imageObj.onload = function() {
 *   var sprite = new Konva.Sprite({
 *     x: 200,
 *     y: 100,
 *     image: imageObj,
 *     animation: 'standing',
 *     animations: {
 *       standing: [
 *         // x, y, width, height (6 frames)
 *         0, 0, 49, 109,
 *         52, 0, 49, 109,
 *         105, 0, 49, 109,
 *         158, 0, 49, 109,
 *         210, 0, 49, 109,
 *         262, 0, 49, 109
 *       ],
 *       kicking: [
 *         // x, y, width, height (6 frames)
 *         0, 109, 45, 98,
 *         45, 109, 45, 98,
 *         95, 109, 63, 98,
 *         156, 109, 70, 98,
 *         229, 109, 60, 98,
 *         287, 109, 41, 98
 *       ]
 *     },
 *     frameRate: 7,
 *     frameIndex: 0
 *   });
 * };
 * imageObj.src = '/path/to/image.jpg'
 */
export class Sprite extends Shape<SpriteConfig> {
  _updated = true;
  anim: Animation;
  interval: any;
  constructor(config: SpriteConfig) {
    super(config);
    this.anim = new Animation(() => {
      // if we don't need to redraw layer we should return false
      const updated = this._updated;
      this._updated = false;
      return updated;
    });
    this.on('animationChange.konva', function () {
      // reset index when animation changes
      this.frameIndex(0);
    });
    this.on('frameIndexChange.konva', function () {
      this._updated = true;
    });
    // smooth change for frameRate
    this.on('frameRateChange.konva', function () {
      if (!this.anim.isRunning()) {
        return;
      }
      clearInterval(this.interval);
      this._setInterval();
    });
  }

  _sceneFunc(context: Context) {
    const anim = this.animation(),
      index = this.frameIndex(),
      ix4 = index * 4,
      set = this.animations()[anim],
      offsets = this.frameOffsets(),
      x = set[ix4 + 0],
      y = set[ix4 + 1],
      width = set[ix4 + 2],
      height = set[ix4 + 3],
      image = this.image();

    if (this.hasFill() || this.hasStroke()) {
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    }

    if (image) {
      if (offsets) {
        const offset = offsets[anim],
          ix2 = index * 2;
        context.drawImage(
          image,
          x,
          y,
          width,
          height,
          offset[ix2 + 0],
          offset[ix2 + 1],
          width,
          height
        );
      } else {
        context.drawImage(image, x, y, width, height, 0, 0, width, height);
      }
    }
  }
  _hitFunc(context: Context) {
    const anim = this.animation(),
      index = this.frameIndex(),
      ix4 = index * 4,
      set = this.animations()[anim],
      offsets = this.frameOffsets(),
      width = set[ix4 + 2],
      height = set[ix4 + 3];

    context.beginPath();
    if (offsets) {
      const offset = offsets[anim];
      const ix2 = index * 2;
      context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
    } else {
      context.rect(0, 0, width, height);
    }
    context.closePath();
    context.fillShape(this);
  }

  _useBufferCanvas() {
    return super._useBufferCanvas(true);
  }

  _setInterval() {
    const that = this;
    this.interval = setInterval(function () {
      that._updateIndex();
    }, 1000 / this.frameRate());
  }
  /**
   * start sprite animation
   * @method
   * @name Konva.Sprite#start
   */
  start() {
    if (this.isRunning()) {
      return;
    }
    const layer = this.getLayer();

    /*
     * animation object has no executable function because
     *  the updates are done with a fixed FPS with the setInterval
     *  below.  The anim object only needs the layer reference for
     *  redraw
     */
    this.anim.setLayers(layer);
    this._setInterval();
    this.anim.start();
  }
  /**
   * stop sprite animation
   * @method
   * @name Konva.Sprite#stop
   */
  stop() {
    this.anim.stop();
    clearInterval(this.interval);
  }
  /**
   * determine if animation of sprite is running or not.  returns true or false
   * @method
   * @name Konva.Sprite#isRunning
   * @returns {Boolean}
   */
  isRunning() {
    return this.anim.isRunning();
  }
  _updateIndex() {
    const index = this.frameIndex(),
      animation = this.animation(),
      animations = this.animations(),
      anim = animations[animation],
      len = anim.length / 4;

    if (index < len - 1) {
      this.frameIndex(index + 1);
    } else {
      this.frameIndex(0);
    }
  }

  frameIndex: GetSet<number, this>;
  animation: GetSet<string, this>;
  image: GetSet<CanvasImageSource, this>;
  animations: GetSet<any, this>;
  frameOffsets: GetSet<any, this>;
  frameRate: GetSet<number, this>;
}

Sprite.prototype.className = 'Sprite';
_registerNode(Sprite);

// add getters setters
Factory.addGetterSetter(Sprite, 'animation');

/**
 * get/set animation key
 * @name Konva.Sprite#animation
 * @method
 * @param {String} anim animation key
 * @returns {String}
 * @example
 * // get animation key
 * var animation = sprite.animation();
 *
 * // set animation key
 * sprite.animation('kicking');
 */

Factory.addGetterSetter(Sprite, 'animations');

/**
 * get/set animations map
 * @name Konva.Sprite#animations
 * @method
 * @param {Object} animations
 * @returns {Object}
 * @example
 * // get animations map
 * var animations = sprite.animations();
 *
 * // set animations map
 * sprite.animations({
 *   standing: [
 *     // x, y, width, height (6 frames)
 *     0, 0, 49, 109,
 *     52, 0, 49, 109,
 *     105, 0, 49, 109,
 *     158, 0, 49, 109,
 *     210, 0, 49, 109,
 *     262, 0, 49, 109
 *   ],
 *   kicking: [
 *     // x, y, width, height (6 frames)
 *     0, 109, 45, 98,
 *     45, 109, 45, 98,
 *     95, 109, 63, 98,
 *     156, 109, 70, 98,
 *     229, 109, 60, 98,
 *     287, 109, 41, 98
 *   ]
 * });
 */

Factory.addGetterSetter(Sprite, 'frameOffsets');

/**
 * get/set offsets map
 * @name Konva.Sprite#offsets
 * @method
 * @param {Object} offsets
 * @returns {Object}
 * @example
 * // get offsets map
 * var offsets = sprite.offsets();
 *
 * // set offsets map
 * sprite.offsets({
 *   standing: [
 *     // x, y (6 frames)
 *     0, 0,
 *     0, 0,
 *     5, 0,
 *     0, 0,
 *     0, 3,
 *     2, 0
 *   ],
 *   kicking: [
 *     // x, y (6 frames)
 *     0, 5,
 *     5, 0,
 *     10, 0,
 *     0, 0,
 *     2, 1,
 *     0, 0
 *   ]
 * });
 */

Factory.addGetterSetter(Sprite, 'image');

/**
 * get/set image
 * @name Konva.Sprite#image
 * @method
 * @param {Image} image
 * @returns {Image}
 * @example
 * // get image
 * var image = sprite.image();
 *
 * // set image
 * sprite.image(imageObj);
 */

Factory.addGetterSetter(Sprite, 'frameIndex', 0, getNumberValidator());

/**
 * set/set animation frame index
 * @name Konva.Sprite#frameIndex
 * @method
 * @param {Integer} frameIndex
 * @returns {Integer}
 * @example
 * // get animation frame index
 * var frameIndex = sprite.frameIndex();
 *
 * // set animation frame index
 * sprite.frameIndex(3);
 */

Factory.addGetterSetter(Sprite, 'frameRate', 17, getNumberValidator());

/**
 * get/set frame rate in frames per second.  Increase this number to make the sprite
 *  animation run faster, and decrease the number to make the sprite animation run slower
 *  The default is 17 frames per second
 * @name Konva.Sprite#frameRate
 * @method
 * @param {Integer} frameRate
 * @returns {Integer}
 * @example
 * // get frame rate
 * var frameRate = sprite.frameRate();
 *
 * // set frame rate to 2 frames per second
 * sprite.frameRate(2);
 */

Factory.backCompat(Sprite, {
  index: 'frameIndex',
  getIndex: 'getFrameIndex',
  setIndex: 'setFrameIndex',
});
