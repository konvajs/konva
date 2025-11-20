import { Util } from './Util.ts';
import type { Context } from './Context.ts';
import { SceneContext, HitContext } from './Context.ts';
import { Konva } from './Global.ts';

// calculate pixel ratio
let _pixelRatio;
function getDevicePixelRatio() {
  if (_pixelRatio) {
    return _pixelRatio;
  }
  const canvas = Util.createCanvasElement();
  const context = canvas.getContext('2d') as any;
  _pixelRatio = (function () {
    const devicePixelRatio = Konva._global.devicePixelRatio || 1,
      backingStoreRatio =
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio ||
        1;
    return devicePixelRatio / backingStoreRatio;
  })();
  Util.releaseCanvas(canvas);
  return _pixelRatio;
}

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
  _canvas: HTMLCanvasElement | OffscreenCanvas;
  context: Context;
  width = 0;
  height = 0;

  isCache = false;

  constructor(config: ICanvasConfig) {
    const conf = config || {};

    const pixelRatio =
      conf.pixelRatio || Konva.pixelRatio || getDevicePixelRatio();

    this.pixelRatio = pixelRatio;

    this._canvas = this._createCanvas(conf);

    if ('style' in this._canvas) {
      // set inline styles
      (this._canvas as HTMLCanvasElement).style.padding = '0';
      (this._canvas as HTMLCanvasElement).style.margin = '0';
      (this._canvas as HTMLCanvasElement).style.border = '0';
      (this._canvas as HTMLCanvasElement).style.background = 'transparent';
      (this._canvas as HTMLCanvasElement).style.position = 'absolute';
      (this._canvas as HTMLCanvasElement).style.top = '0';
      (this._canvas as HTMLCanvasElement).style.left = '0';
    }
  }

  _createCanvas(config: ICanvasConfig): HTMLCanvasElement | OffscreenCanvas {
    return Util.createCanvasElement();
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
    const previousRatio = this.pixelRatio;
    this.pixelRatio = pixelRatio;
    this.setSize(
      this.getWidth() / previousRatio,
      this.getHeight() / previousRatio
    );
  }
  setWidth(width) {
    // take into account pixel ratio
    // take into account pixel ratio
    this.width = this._canvas.width = width * this.pixelRatio;
    if ('style' in this._canvas) {
      (this._canvas as HTMLCanvasElement).style.width = width + 'px';
    }

    const pixelRatio = this.pixelRatio,
      _context = this.getContext()._context;
    _context.scale(pixelRatio, pixelRatio);
  }
  setHeight(height) {
    // take into account pixel ratio
    // take into account pixel ratio
    this.height = this._canvas.height = height * this.pixelRatio;
    if ('style' in this._canvas) {
      (this._canvas as HTMLCanvasElement).style.height = height + 'px';
    }
    const pixelRatio = this.pixelRatio,
      _context = this.getContext()._context;
    _context.scale(pixelRatio, pixelRatio);
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setSize(width, height) {
    this.setWidth(width || 0);
    this.setHeight(height || 0);
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
      // If this call fails (due to browser bug, like in Firefox 3.6),
      // then revert to previous no-parameter image/png behavior
      // then revert to previous no-parameter image/png behavior
      return (this._canvas as HTMLCanvasElement).toDataURL(mimeType, quality);
    } catch (e) {
      try {
        return (this._canvas as HTMLCanvasElement).toDataURL();
      } catch (err: any) {
        Util.error(
          'Unable to get data URL. ' +
          err.message +
          ' For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.'
        );
        return '';
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

// function checks if canvas farbling is active
// canvas farbling is a Browser security feature, it break konva internals
let _isCanvasFarblingActive: boolean | undefined;
function isCanvasFarblingActive() {
  if (_isCanvasFarblingActive !== undefined) {
    return _isCanvasFarblingActive;
  }
  const c = Util.createCanvasElement();
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#010203';
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  const isFarbling = data[0] !== 1 || data[1] !== 2 || data[2] !== 3;
  if (isFarbling) {
    Util.warn(
      'Konva: Canvas farbling is detected. Konva may not work correctly. You can try to disable it in browser settings.'
    );
  }
  _isCanvasFarblingActive = isFarbling;
  return isFarbling;
}

export class HitCanvas extends Canvas {
  hitCanvas = true;
  constructor(config: ICanvasConfig = { width: 0, height: 0 }) {
    super(config);
    this.context = new HitContext(this);
    this.setSize(config.width, config.height);
  }
  _createCanvas(config: ICanvasConfig) {
    return Util.createOffscreenCanvas(config.width || 0, config.height || 0);
  }
}

export { isCanvasFarblingActive };
