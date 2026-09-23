import { Transform, Util } from './Util.ts';
import type { IRect } from './types.ts';
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
   * var pixelRatio = layer.getCanvas().getPixelRatio();
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
  private _isolationCanvas?: SceneCanvas;
  // The device pixels of the parent canvas this surface currently holds.
  _isolationRect?: IRect;
  // The largest width and height requested since the last trim.
  private _isolationPeak = { width: 0, height: 0 };
  // Consecutive frames that used less than a quarter of the surface.
  private _isolationLowFrames = 0;

  // A cleared surface over `rect` (in the current drawing space), or over the
  // whole canvas, in this canvas's device pixels. Siblings reuse it; nested
  // groups borrow from the surface itself, so they cannot clear a parent's
  // unfinished image.
  _prepareIsolationCanvas(rect?: IRect) {
    const { a, b, c, d, e, f } = this.getContext()._context.getTransform();
    const view = this._isolationRect || this;
    let x = 0,
      y = 0,
      width = view.width,
      height = view.height;
    if (rect) {
      const box = new Transform([a, b, c, d, e, f])._getTransformedRect(rect);
      // Round outwards, with a pixel for antialiasing.
      x = Math.max(0, Math.floor(box.x) - 1);
      y = Math.max(0, Math.floor(box.y) - 1);
      width = Math.min(width, Math.ceil(box.x + box.width) + 1) - x;
      height = Math.min(height, Math.ceil(box.y + box.height) + 1) - y;
    }
    if (!(width > 0 && height > 0)) {
      // An empty source must still composite for copy/destination-in/etc.
      x = y = 0;
      width = height = 1;
    }
    const surface = (this._isolationCanvas ||= new SceneCanvas({
      width: 0,
      height: 0,
      pixelRatio: this.pixelRatio,
    }));
    if (surface.width < width || surface.height < height) {
      // Headroom on a short side, so a growing group does not reallocate
      // every frame.
      const ratio = this.pixelRatio;
      const grow = (need: number, have: number, max: number) =>
        Math.min(
          max,
          Math.ceil((have < need ? Math.max(need, have * 1.5) : have) / ratio)
        );
      surface.setSize(
        grow(width, surface.width, this._logicalWidth),
        grow(height, surface.height, this._logicalHeight)
      );
    }
    surface._isolationRect = { x, y, width, height };
    const peak = surface._isolationPeak;
    peak.width = Math.max(peak.width, width);
    peak.height = Math.max(peak.height, height);
    const context = surface.getContext();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.setTransform(a, b, c, d, e - x, f - y);
    context.imageSmoothingEnabled = this.getContext().imageSmoothingEnabled;
    context.direction = this.getContext().direction;
    return surface;
  }

  // After a frame, free surfaces that ten frames in a row did not use or used
  // a small part of. Content that changes size keeps its surface.
  _trimIsolationCanvas() {
    const surface = this._isolationCanvas;
    if (!surface) return;
    const peak = surface._isolationPeak;
    const low = surface.width * surface.height > 4 * peak.width * peak.height;
    surface._isolationLowFrames = low ? surface._isolationLowFrames + 1 : 0;
    if (surface._isolationLowFrames >= 10) {
      this._releaseIsolationCanvas();
    } else {
      peak.width = peak.height = 0;
      surface._trimIsolationCanvas();
    }
  }

  _releaseIsolationCanvas() {
    const surface = this._isolationCanvas;
    if (surface) {
      surface._releaseIsolationCanvas();
      Util.releaseCanvas(surface._canvas);
      this._isolationCanvas = undefined;
    }
  }

  setSize(width, height) {
    // A bitmap reset also resets its origin-clean state. A surface from the
    // previous lifetime may be tainted even after clearing its pixels.
    this._releaseIsolationCanvas();
    super.setSize(width, height);
  }

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
