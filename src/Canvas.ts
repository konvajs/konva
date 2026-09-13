import { Util } from './Util.ts';
import type { Context } from './Context.ts';
import { SceneContext, HitContext } from './Context.ts';
import { Konva } from './Global.ts';

interface ICanvasConfig {
  width?: number;
  height?: number;
  pixelRatio?: number;
  willReadFrequently?: boolean;
}

/**
 * Canvas Renderer constructor. It is a wrapper around native canvas element.
 * Usually you don't need to use it manually.
 * @constructor
 * @abstract
 * @memberof Konva
 * @param {Object} config
 * @param {Number} config.width
 * @param {Number} config.height
 * @param {Number} config.pixelRatio
 */
export class Canvas {
  pixelRatio = 1;
  _canvas: HTMLCanvasElement;
  context: Context;
  // the bitmap size, in device pixels
  width = 0;
  height = 0;
  // the size the canvas was given, in CSS pixels; the bitmap truncates it
  _logicalWidth = 0;
  _logicalHeight = 0;

  isCache = false;
  // origin of a buffer canvas in the coordinate space of the canvas it is
  // drawn back into, see Shape.drawScene
  x = 0;
  y = 0;

  constructor(config: ICanvasConfig) {
    const conf = config || {};

    // a Konva.pixelRatio reset to undefined or 0 means the device ratio
    const pixelRatio =
      conf.pixelRatio ||
      Konva.pixelRatio ||
      Konva._global.devicePixelRatio ||
      1;

    this.pixelRatio = pixelRatio;

    this._canvas = Util.createCanvasElement();
    // set inline styles
    this._canvas.style.padding = '0';
    this._canvas.style.margin = '0';
    this._canvas.style.border = '0';
    this._canvas.style.background = 'transparent';
    this._canvas.style.position = 'absolute';
    this._canvas.style.top = '0';
    this._canvas.style.left = '0';
  }

  /**
   * get canvas context
   * @method
   * @name Konva.Canvas#getContext
   * @returns {CanvasContext} context
   */
  getContext() {
    return this.context;
  }
  /**
   * get pixel ratio
   * @method
   * @name Konva.Canvas#getPixelRatio
   * @returns {Number} pixel ratio
   * @example
   * var pixelRatio = layer.getCanvas.getPixelRatio();
   */
  getPixelRatio() {
    return this.pixelRatio;
  }
  /**
   * set pixel ratio
   * KonvaJS automatically handles pixel ratio adustments in order to render crisp drawings
   *  on all devices. Most desktops, low end tablets, and low end phones, have device pixel ratios
   *  of 1.  Some high end tablets and phones, like iPhones and iPads have a device pixel ratio
   *  of 2.  Some Macbook Pros, and iMacs also have a device pixel ratio of 2.  Some high end Android devices have pixel
   *  ratios of 2 or 3.  Some browsers like Firefox allow you to configure the pixel ratio of the viewport.  Unless otherwise
   *  specificed, the pixel ratio will be defaulted to the actual device pixel ratio.  You can override the device pixel
   *  ratio for special situations, or, if you don't want the pixel ratio to be taken into account, you can set it to 1.
   * @method
   * @name Konva.Canvas#setPixelRatio
   * @param {Number} pixelRatio
   * @example
   * layer.getCanvas().setPixelRatio(3);
   */
  setPixelRatio(pixelRatio) {
    this.pixelRatio = pixelRatio;
    this.setSize(this._logicalWidth, this._logicalHeight);
  }
  setWidth(width) {
    this.setSize(width, this._logicalHeight);
  }
  setHeight(height) {
    this.setSize(this._logicalWidth, height);
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  // the bitmap holds whole pixels: a fractional pixel ratio truncates, and
  // a size that does not match the bitmap would resample every draw of it
  _bitmapSize(size: number) {
    return Math.floor((size || 0) * this.pixelRatio);
  }
  setSize(width, height) {
    // a NaN or Infinity size would silently give an empty bitmap
    if (!isFinite(width ?? 0) || !isFinite(height ?? 0)) {
      Util.error(
        `Canvas size must be finite numbers, got ${width}x${height}. The canvas is left empty.`
      );
      width = height = 0;
    }
    width = width || 0;
    height = height || 0;
    const pixelRatio = this.pixelRatio;
    const context = this.getContext()._context;
    const imageSmoothingEnabled = context.imageSmoothingEnabled;
    this._logicalWidth = width;
    this._logicalHeight = height;
    // take into account pixel ratio. Assigning a dimension reallocates the
    // bitmap and resets the whole context state, so scale once after both
    this.width = this._canvas.width = this._bitmapSize(width);
    this.height = this._canvas.height = this._bitmapSize(height);
    this._canvas.style.width = width + 'px';
    this._canvas.style.height = height + 'px';
    context.scale(pixelRatio, pixelRatio);
    context.imageSmoothingEnabled = imageSmoothingEnabled;
  }
  // setSize() re-allocates and clears the canvas even for the same size,
  // so lazily sized canvases use this to stay untouched when nothing changed
  setSizeIfChanged(width: number, height: number) {
    if (
      this.width !== this._bitmapSize(width) ||
      this.height !== this._bitmapSize(height)
    ) {
      this.setSize(width, height);
    }
  }
  /**
   * to data url
   * @method
   * @name Konva.Canvas#toDataURL
   * @param {String} mimeType
   * @param {Number} quality between 0 and 1 for jpg mime types
   * @returns {String} data url string
   */
  toDataURL(mimeType, quality) {
    try {
      // If the requested encoding fails, retry with the default PNG encoding.
      return this._canvas.toDataURL(mimeType, quality);
    } catch (e) {
      try {
        return this._canvas.toDataURL();
      } catch (err: any) {
        Util.error(
          'Unable to get data URL. ' +
            err.message +
            ' For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.'
        );
        throw err;
      }
    }
  }
}

export class SceneCanvas extends Canvas {
  constructor(
    config: ICanvasConfig = { width: 0, height: 0, willReadFrequently: false }
  ) {
    super(config);
    this.context = new SceneContext(this, {
      willReadFrequently: config.willReadFrequently,
    });
    this.setSize(config.width, config.height);
  }
}

export class HitCanvas extends Canvas {
  hitCanvas = true;
  constructor(config: ICanvasConfig = { width: 0, height: 0 }) {
    super(config);

    this.context = new HitContext(this);
    this.context.imageSmoothingEnabled = false;
    this.setSize(config.width, config.height);
  }
}
