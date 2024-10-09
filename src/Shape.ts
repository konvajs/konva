import { Konva } from './Global';
import { Transform, Util } from './Util';
import { Factory } from './Factory';
import { Node, NodeConfig } from './Node';
import {
  getNumberValidator,
  getNumberOrAutoValidator,
  getStringValidator,
  getBooleanValidator,
  getStringOrGradientValidator,
} from './Validators';

import { Context, SceneContext } from './Context';
import { _registerNode } from './Global';
import * as PointerEvents from './PointerEvents';

import { GetSet, Vector2d } from './types';
import { HitCanvas, SceneCanvas } from './Canvas';

// hack from here https://stackoverflow.com/questions/52667959/what-is-the-purpose-of-bivariancehack-in-typescript-types/52668133#52668133
export type ShapeConfigHandler<TTarget> = {
  bivarianceHack(ctx: Context, shape: TTarget): void;
}['bivarianceHack'];

export type LineJoin = 'round' | 'bevel' | 'miter';
export type LineCap = 'butt' | 'round' | 'square';

export interface ShapeConfig extends NodeConfig {
  fill?: string | CanvasGradient;
  fillPatternImage?: HTMLImageElement;
  fillPatternX?: number;
  fillPatternY?: number;
  fillPatternOffset?: Vector2d;
  fillPatternOffsetX?: number;
  fillPatternOffsetY?: number;
  fillPatternScale?: Vector2d;
  fillPatternScaleX?: number;
  fillPatternScaleY?: number;
  fillPatternRotation?: number;
  fillPatternRepeat?: string;
  fillLinearGradientStartPoint?: Vector2d;
  fillLinearGradientStartPointX?: number;
  fillLinearGradientStartPointY?: number;
  fillLinearGradientEndPoint?: Vector2d;
  fillLinearGradientEndPointX?: number;
  fillLinearGradientEndPointY?: number;
  fillLinearGradientColorStops?: Array<number | string>;
  fillRadialGradientStartPoint?: Vector2d;
  fillRadialGradientStartPointX?: number;
  fillRadialGradientStartPointY?: number;
  fillRadialGradientEndPoint?: Vector2d;
  fillRadialGradientEndPointX?: number;
  fillRadialGradientEndPointY?: number;
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: Array<number | string>;
  fillEnabled?: boolean;
  fillPriority?: string;
  fillRule?: CanvasFillRule;
  stroke?: string | CanvasGradient;
  strokeWidth?: number;
  fillAfterStrokeEnabled?: boolean;
  hitStrokeWidth?: number | string;
  strokeScaleEnabled?: boolean;
  strokeHitEnabled?: boolean;
  strokeEnabled?: boolean;
  lineJoin?: LineJoin;
  lineCap?: LineCap;
  sceneFunc?: (con: Context, shape: Shape) => void;
  hitFunc?: (con: Context, shape: Shape) => void;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: Vector2d;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  shadowEnabled?: boolean;
  shadowForStrokeEnabled?: boolean;
  dash?: number[];
  dashOffset?: number;
  dashEnabled?: boolean;
  perfectDrawEnabled?: boolean;
}

export interface ShapeGetClientRectConfig {
  skipTransform?: boolean;
  skipShadow?: boolean;
  skipStroke?: boolean;
  relativeTo?: Node;
}

export type FillFuncOutput =
  | void
  | [Path2D | CanvasFillRule]
  | [Path2D, CanvasFillRule];

const HAS_SHADOW = 'hasShadow';
const SHADOW_RGBA = 'shadowRGBA';
const patternImage = 'patternImage';
const linearGradient = 'linearGradient';
const radialGradient = 'radialGradient';

let dummyContext: CanvasRenderingContext2D;
function getDummyContext(): CanvasRenderingContext2D {
  if (dummyContext) {
    return dummyContext;
  }
  dummyContext = Util.createCanvasElement().getContext('2d')!;
  return dummyContext;
}

export const shapes: { [key: string]: Shape } = {};

// TODO: idea - use only "remove" (or destroy method)
// how? on add, check that every inner shape has reference in konva store with color
// on remove - clear that reference
// the approach is good. But what if we want to cache the shape before we add it into the stage
// what color to use for hit test?

function _fillFunc(this: Node, context) {
  const fillRule = this.attrs.fillRule;
  if (fillRule) {
    context.fill(fillRule);
  } else {
    context.fill();
  }
}
function _strokeFunc(context) {
  context.stroke();
}
function _fillFuncHit(this: Node, context) {
  const fillRule = this.attrs.fillRule;
  if (fillRule) {
    context.fill(fillRule);
  } else {
    context.fill();
  }
}
function _strokeFuncHit(context) {
  context.stroke();
}

function _clearHasShadowCache(this: Node) {
  this._clearCache(HAS_SHADOW);
}

function _clearGetShadowRGBACache(this: Node) {
  this._clearCache(SHADOW_RGBA);
}

function _clearFillPatternCache(this: Node) {
  this._clearCache(patternImage);
}

function _clearLinearGradientCache(this: Node) {
  this._clearCache(linearGradient);
}

function _clearRadialGradientCache(this: Node) {
  this._clearCache(radialGradient);
}

/**
 * Shape constructor.  Shapes are primitive objects such as rectangles,
 *  circles, text, lines, etc.
 * @constructor
 * @memberof Konva
 * @augments Konva.Node
 * @param {Object} config
 * @@shapeParams
 * @@nodeParams
 * @example
 * var customShape = new Konva.Shape({
 *   x: 5,
 *   y: 10,
 *   fill: 'red',
 *   // a Konva.Canvas renderer is passed into the sceneFunc function
 *   sceneFunc (context, shape) {
 *     context.beginPath();
 *     context.moveTo(200, 50);
 *     context.lineTo(420, 80);
 *     context.quadraticCurveTo(300, 100, 260, 170);
 *     context.closePath();
 *     // Konva specific method
 *     context.fillStrokeShape(shape);
 *   }
 *});
 */
export class Shape<
  Config extends ShapeConfig = ShapeConfig
> extends Node<Config> {
  _centroid: boolean;
  colorKey: string;

  _fillFunc: (ctx: Context) => FillFuncOutput;
  _strokeFunc: (ctx: Context) => void;
  _fillFuncHit: (ctx: Context) => void;
  _strokeFuncHit: (ctx: Context) => void;

  constructor(config?: Config) {
    super(config);
    // set colorKey
    let key: string;

    while (true) {
      key = Util.getRandomColor();
      if (key && !(key in shapes)) {
        break;
      }
    }

    this.colorKey = key;
    shapes[key] = this;
  }

  getContext() {
    Util.warn('shape.getContext() method is deprecated. Please do not use it.');
    return this.getLayer()!.getContext();
  }
  getCanvas() {
    Util.warn('shape.getCanvas() method is deprecated. Please do not use it.');
    return this.getLayer()!.getCanvas();
  }

  getSceneFunc() {
    return this.attrs.sceneFunc || this['_sceneFunc'];
  }

  getHitFunc() {
    return this.attrs.hitFunc || this['_hitFunc'];
  }
  /**
   * returns whether or not a shadow will be rendered
   * @method
   * @name Konva.Shape#hasShadow
   * @returns {Boolean}
   */
  hasShadow() {
    return this._getCache(HAS_SHADOW, this._hasShadow);
  }
  _hasShadow() {
    return (
      this.shadowEnabled() &&
      this.shadowOpacity() !== 0 &&
      !!(
        this.shadowColor() ||
        this.shadowBlur() ||
        this.shadowOffsetX() ||
        this.shadowOffsetY()
      )
    );
  }
  _getFillPattern() {
    return this._getCache(patternImage, this.__getFillPattern);
  }
  __getFillPattern() {
    if (this.fillPatternImage()) {
      const ctx = getDummyContext();
      const pattern = ctx.createPattern(
        this.fillPatternImage(),
        this.fillPatternRepeat() || 'repeat'
      );
      if (pattern && pattern.setTransform) {
        const tr = new Transform();

        tr.translate(this.fillPatternX(), this.fillPatternY());
        tr.rotate(Konva.getAngle(this.fillPatternRotation()));
        tr.scale(this.fillPatternScaleX(), this.fillPatternScaleY());
        tr.translate(
          -1 * this.fillPatternOffsetX(),
          -1 * this.fillPatternOffsetY()
        );

        const m = tr.getMatrix();

        const matrix =
          typeof DOMMatrix === 'undefined'
            ? {
                a: m[0], // Horizontal scaling. A value of 1 results in no scaling.
                b: m[1], // Vertical skewing.
                c: m[2], // Horizontal skewing.
                d: m[3],
                e: m[4], // Horizontal translation (moving).
                f: m[5], // Vertical translation (moving).
              }
            : new DOMMatrix(m);

        pattern.setTransform(matrix);
      }
      return pattern;
    }
  }
  _getLinearGradient() {
    return this._getCache(linearGradient, this.__getLinearGradient);
  }
  __getLinearGradient() {
    const colorStops = this.fillLinearGradientColorStops();
    if (colorStops) {
      const ctx = getDummyContext();

      const start = this.fillLinearGradientStartPoint();
      const end = this.fillLinearGradientEndPoint();
      const grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);

      // build color stops
      for (let n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
      }
      return grd;
    }
  }

  _getRadialGradient() {
    return this._getCache(radialGradient, this.__getRadialGradient);
  }
  __getRadialGradient() {
    const colorStops = this.fillRadialGradientColorStops();
    if (colorStops) {
      const ctx = getDummyContext();

      const start = this.fillRadialGradientStartPoint();
      const end = this.fillRadialGradientEndPoint();
      const grd = ctx.createRadialGradient(
        start.x,
        start.y,
        this.fillRadialGradientStartRadius(),
        end.x,
        end.y,
        this.fillRadialGradientEndRadius()
      );

      // build color stops
      for (let n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
      }
      return grd;
    }
  }
  getShadowRGBA() {
    return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
  }
  _getShadowRGBA() {
    if (!this.hasShadow()) {
      return;
    }
    const rgba = Util.colorToRGBA(this.shadowColor());
    if (rgba) {
      return (
        'rgba(' +
        rgba.r +
        ',' +
        rgba.g +
        ',' +
        rgba.b +
        ',' +
        rgba.a * (this.shadowOpacity() || 1) +
        ')'
      );
    }
  }
  /**
   * returns whether or not the shape will be filled
   * @method
   * @name Konva.Shape#hasFill
   * @returns {Boolean}
   */
  hasFill() {
    return this._calculate(
      'hasFill',
      [
        'fillEnabled',
        'fill',
        'fillPatternImage',
        'fillLinearGradientColorStops',
        'fillRadialGradientColorStops',
      ],
      () => {
        return (
          this.fillEnabled() &&
          !!(
            this.fill() ||
            this.fillPatternImage() ||
            this.fillLinearGradientColorStops() ||
            this.fillRadialGradientColorStops()
          )
        );
      }
    );
  }
  /**
   * returns whether or not the shape will be stroked
   * @method
   * @name Konva.Shape#hasStroke
   * @returns {Boolean}
   */
  hasStroke() {
    return this._calculate(
      'hasStroke',
      [
        'strokeEnabled',
        'strokeWidth',
        'stroke',
        'strokeLinearGradientColorStops',
      ],
      () => {
        return (
          this.strokeEnabled() &&
          this.strokeWidth() &&
          !!(this.stroke() || this.strokeLinearGradientColorStops())
          // this.getStrokeRadialGradientColorStops()
        );
      }
    );
    // return (
    //   this.strokeEnabled() &&
    //   this.strokeWidth() &&
    //   !!(this.stroke() || this.strokeLinearGradientColorStops())
    //   // this.getStrokeRadialGradientColorStops()
    // );
  }
  hasHitStroke() {
    const width = this.hitStrokeWidth();

    // on auto just check by stroke
    if (width === 'auto') {
      return this.hasStroke();
    }

    // we should enable hit stroke if stroke is enabled
    // and we have some value from width
    return this.strokeEnabled() && !!width;
  }
  /**
   * determines if point is in the shape, regardless if other shapes are on top of it.  Note: because
   *  this method clears a temporary canvas and then redraws the shape, it performs very poorly if executed many times
   *  consecutively.  Please use the {@link Konva.Stage#getIntersection} method if at all possible
   *  because it performs much better
   * @method
   * @name Konva.Shape#intersects
   * @param {Object} point
   * @param {Number} point.x
   * @param {Number} point.y
   * @returns {Boolean}
   */
  intersects(point) {
    const stage = this.getStage();
    if (!stage) {
      return false;
    }
    const bufferHitCanvas = stage.bufferHitCanvas;

    bufferHitCanvas.getContext().clear();
    this.drawHit(bufferHitCanvas, undefined, true);
    const p = bufferHitCanvas.context.getImageData(
      Math.round(point.x),
      Math.round(point.y),
      1,
      1
    ).data;
    return p[3] > 0;
  }

  destroy() {
    Node.prototype.destroy.call(this);
    delete shapes[this.colorKey];
    delete (this as any).colorKey;
    return this;
  }
  // why do we need buffer canvas?
  // it give better result when a shape has
  // stroke with fill and with some opacity
  _useBufferCanvas(forceFill?: boolean): boolean {
    // image and sprite still has "fill" as image
    // so they use that method with forced fill
    // it probably will be simpler, then copy/paste the code

    // force skip buffer canvas
    const perfectDrawEnabled = this.attrs.perfectDrawEnabled ?? true;
    if (!perfectDrawEnabled) {
      return false;
    }
    const hasFill = forceFill || this.hasFill();
    const hasStroke = this.hasStroke();
    const isTransparent = this.getAbsoluteOpacity() !== 1;

    if (hasFill && hasStroke && isTransparent) {
      return true;
    }

    const hasShadow = this.hasShadow();
    const strokeForShadow = this.shadowForStrokeEnabled();
    if (hasFill && hasStroke && hasShadow && strokeForShadow) {
      return true;
    }
    return false;
  }
  setStrokeHitEnabled(val: number) {
    Util.warn(
      'strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.'
    );
    if (val) {
      this.hitStrokeWidth('auto');
    } else {
      this.hitStrokeWidth(0);
    }
  }
  getStrokeHitEnabled() {
    if (this.hitStrokeWidth() === 0) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * return self rectangle (x, y, width, height) of shape.
   * This method are not taken into account transformation and styles.
   * @method
   * @name Konva.Shape#getSelfRect
   * @returns {Object} rect with {x, y, width, height} properties
   * @example
   *
   * rect.getSelfRect();  // return {x:0, y:0, width:rect.width(), height:rect.height()}
   * circle.getSelfRect();  // return {x: - circle.width() / 2, y: - circle.height() / 2, width:circle.width(), height:circle.height()}
   *
   */
  getSelfRect() {
    const size = this.size();
    return {
      x: this._centroid ? -size.width / 2 : 0,
      y: this._centroid ? -size.height / 2 : 0,
      width: size.width,
      height: size.height,
    };
  }
  getClientRect(config: ShapeGetClientRectConfig = {}) {
    // if we have a cached parent, it will use cached transform matrix
    // but we don't want to that
    let hasCachedParent = false;
    let parent = this.getParent();
    while (parent) {
      if (parent.isCached()) {
        hasCachedParent = true;
        break;
      }
      parent = parent.getParent();
    }
    const skipTransform = config.skipTransform;

    // force relative to stage if we have a cached parent
    const relativeTo =
      config.relativeTo || (hasCachedParent && this.getStage()) || undefined;

    const fillRect = this.getSelfRect();

    const applyStroke = !config.skipStroke && this.hasStroke();
    const strokeWidth: number = (applyStroke && this.strokeWidth()) || 0;

    const fillAndStrokeWidth = fillRect.width + strokeWidth;
    const fillAndStrokeHeight = fillRect.height + strokeWidth;

    const applyShadow = !config.skipShadow && this.hasShadow();
    const shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
    const shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;

    const preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
    const preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);

    const blurRadius = (applyShadow && this.shadowBlur()) || 0;

    const width = preWidth + blurRadius * 2;
    const height = preHeight + blurRadius * 2;

    const rect = {
      width: width,
      height: height,
      x:
        -(strokeWidth / 2 + blurRadius) +
        Math.min(shadowOffsetX, 0) +
        fillRect.x,
      y:
        -(strokeWidth / 2 + blurRadius) +
        Math.min(shadowOffsetY, 0) +
        fillRect.y,
    };
    if (!skipTransform) {
      return this._transformedRect(rect, relativeTo);
    }
    return rect;
  }
  drawScene(can?: SceneCanvas, top?: Node, bufferCanvas?: SceneCanvas) {
    // basically there are 3 drawing modes
    // 1 - simple drawing when nothing is cached.
    // 2 - when we are caching current
    // 3 - when node is cached and we need to draw it into layer

    const layer = this.getLayer();
    let canvas = can || layer!.getCanvas(),
      context = canvas.getContext() as SceneContext,
      cachedCanvas = this._getCanvasCache(),
      drawFunc = this.getSceneFunc(),
      hasShadow = this.hasShadow(),
      stage,
      bufferContext;

    const skipBuffer = canvas.isCache;
    const cachingSelf = top === this;

    if (!this.isVisible() && !cachingSelf) {
      return this;
    }
    // if node is cached we just need to draw from cache
    if (cachedCanvas) {
      context.save();

      const m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedSceneCanvas(context);
      context.restore();
      return this;
    }

    if (!drawFunc) {
      return this;
    }

    context.save();
    // if buffer canvas is needed
    if (this._useBufferCanvas() && !skipBuffer) {
      stage = this.getStage();
      const bc = bufferCanvas || stage.bufferCanvas;
      bufferContext = bc.getContext();
      bufferContext.clear();
      bufferContext.save();
      bufferContext._applyLineJoin(this);
      // layer might be undefined if we are using cache before adding to layer
      var o = this.getAbsoluteTransform(top).getMatrix();
      bufferContext.transform(o[0], o[1], o[2], o[3], o[4], o[5]);

      drawFunc.call(this, bufferContext, this);
      bufferContext.restore();

      const ratio = bc.pixelRatio;

      if (hasShadow) {
        context._applyShadow(this);
      }
      context._applyOpacity(this);
      context._applyGlobalCompositeOperation(this);
      context.drawImage(bc._canvas, 0, 0, bc.width / ratio, bc.height / ratio);
    } else {
      context._applyLineJoin(this);

      if (!cachingSelf) {
        var o = this.getAbsoluteTransform(top).getMatrix();
        context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
        context._applyOpacity(this);
        context._applyGlobalCompositeOperation(this);
      }

      if (hasShadow) {
        context._applyShadow(this);
      }

      drawFunc.call(this, context, this);
    }
    context.restore();
    return this;
  }
  drawHit(can?: HitCanvas, top?: Node, skipDragCheck = false) {
    if (!this.shouldDrawHit(top, skipDragCheck)) {
      return this;
    }

    const layer = this.getLayer(),
      canvas = can || layer!.hitCanvas,
      context = canvas && canvas.getContext(),
      drawFunc = this.hitFunc() || this.sceneFunc(),
      cachedCanvas = this._getCanvasCache(),
      cachedHitCanvas = cachedCanvas && cachedCanvas.hit;

    if (!this.colorKey) {
      Util.warn(
        'Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. If you want to reuse shape you should call remove() instead of destroy()'
      );
    }

    if (cachedHitCanvas) {
      context.save();

      const m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

      this._drawCachedHitCanvas(context);
      context.restore();
      return this;
    }
    if (!drawFunc) {
      return this;
    }
    context.save();
    context._applyLineJoin(this);

    const selfCache = this === top;
    if (!selfCache) {
      const o = this.getAbsoluteTransform(top).getMatrix();
      context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
    }
    drawFunc.call(this, context, this);
    context.restore();
    return this;
  }
  /**
   * draw hit graph using the cached scene canvas
   * @method
   * @name Konva.Shape#drawHitFromCache
   * @param {Integer} alphaThreshold alpha channel threshold that determines whether or not
   *  a pixel should be drawn onto the hit graph.  Must be a value between 0 and 255.
   *  The default is 0
   * @returns {Konva.Shape}
   * @example
   * shape.cache();
   * shape.drawHitFromCache();
   */
  drawHitFromCache(alphaThreshold = 0) {
    let cachedCanvas = this._getCanvasCache(),
      sceneCanvas = this._getCachedSceneCanvas(),
      hitCanvas = cachedCanvas.hit,
      hitContext = hitCanvas.getContext(),
      hitWidth = hitCanvas.getWidth(),
      hitHeight = hitCanvas.getHeight(),
      hitImageData,
      hitData,
      len,
      rgbColorKey,
      i,
      alpha;

    hitContext.clear();
    hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);

    try {
      hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
      hitData = hitImageData.data;
      len = hitData.length;
      rgbColorKey = Util._hexToRgb(this.colorKey);

      // replace non transparent pixels with color key
      for (i = 0; i < len; i += 4) {
        alpha = hitData[i + 3];
        if (alpha > alphaThreshold) {
          hitData[i] = rgbColorKey.r;
          hitData[i + 1] = rgbColorKey.g;
          hitData[i + 2] = rgbColorKey.b;
          hitData[i + 3] = 255;
        } else {
          hitData[i + 3] = 0;
        }
      }
      hitContext.putImageData(hitImageData, 0, 0);
    } catch (e: any) {
      Util.error(
        'Unable to draw hit graph from cached scene canvas. ' + e.message
      );
    }

    return this;
  }

  hasPointerCapture(pointerId: number): boolean {
    return PointerEvents.hasPointerCapture(pointerId, this);
  }

  setPointerCapture(pointerId: number) {
    PointerEvents.setPointerCapture(pointerId, this);
  }

  releaseCapture(pointerId: number) {
    PointerEvents.releaseCapture(pointerId, this);
  }

  draggable: GetSet<boolean, this>;
  embossBlend: GetSet<boolean, this>;

  dash: GetSet<number[], this>;
  dashEnabled: GetSet<boolean, this>;
  dashOffset: GetSet<number, this>;
  fill: GetSet<string | CanvasGradient, this>;
  fillEnabled: GetSet<boolean, this>;
  fillLinearGradientColorStops: GetSet<Array<number | string>, this>;
  fillLinearGradientStartPoint: GetSet<Vector2d, this>;
  fillLinearGradientStartPointX: GetSet<number, this>;
  fillLinearGradientStartPointY: GetSet<number, this>;
  fillLinearGradientEndPoint: GetSet<Vector2d, this>;
  fillLinearGradientEndPointX: GetSet<number, this>;
  fillLinearGradientEndPointY: GetSet<number, this>;
  fillLinearRadialStartPoint: GetSet<Vector2d, this>;
  fillLinearRadialStartPointX: GetSet<number, this>;
  fillLinearRadialStartPointY: GetSet<number, this>;
  fillLinearRadialEndPoint: GetSet<Vector2d, this>;
  fillLinearRadialEndPointX: GetSet<number, this>;
  fillLinearRadialEndPointY: GetSet<number, this>;
  fillPatternImage: GetSet<HTMLImageElement | HTMLCanvasElement, this>;
  fillRadialGradientStartRadius: GetSet<number, this>;
  fillRadialGradientEndRadius: GetSet<number, this>;
  fillRadialGradientColorStops: GetSet<Array<number | string>, this>;
  fillRadialGradientStartPoint: GetSet<Vector2d, this>;
  fillRadialGradientStartPointX: GetSet<number, this>;
  fillRadialGradientStartPointY: GetSet<number, this>;
  fillRadialGradientEndPoint: GetSet<Vector2d, this>;
  fillRadialGradientEndPointX: GetSet<number, this>;
  fillRadialGradientEndPointY: GetSet<number, this>;
  fillPatternOffset: GetSet<Vector2d, this>;
  fillPatternOffsetX: GetSet<number, this>;
  fillPatternOffsetY: GetSet<number, this>;
  fillPatternRepeat: GetSet<string, this>;
  fillPatternRotation: GetSet<number, this>;
  fillPatternScale: GetSet<Vector2d, this>;
  fillPatternScaleX: GetSet<number, this>;
  fillPatternScaleY: GetSet<number, this>;
  fillPatternX: GetSet<number, this>;
  fillPatternY: GetSet<number, this>;
  fillPriority: GetSet<string, this>;
  hitFunc: GetSet<ShapeConfigHandler<this>, this>;
  lineCap: GetSet<LineCap, this>;
  lineJoin: GetSet<LineJoin, this>;
  perfectDrawEnabled: GetSet<boolean, this>;
  sceneFunc: GetSet<ShapeConfigHandler<this>, this>;
  shadowColor: GetSet<string, this>;
  shadowEnabled: GetSet<boolean, this>;
  shadowForStrokeEnabled: GetSet<boolean, this>;
  shadowOffset: GetSet<Vector2d, this>;
  shadowOffsetX: GetSet<number, this>;
  shadowOffsetY: GetSet<number, this>;
  shadowOpacity: GetSet<number, this>;
  shadowBlur: GetSet<number, this>;
  stroke: GetSet<string | CanvasGradient, this>;
  strokeEnabled: GetSet<boolean, this>;
  fillAfterStrokeEnabled: GetSet<boolean, this>;
  strokeScaleEnabled: GetSet<boolean, this>;
  strokeHitEnabled: GetSet<boolean, this>;
  strokeWidth: GetSet<number, this>;
  hitStrokeWidth: GetSet<number | 'auto', this>;
  strokeLinearGradientStartPoint: GetSet<Vector2d, this>;
  strokeLinearGradientEndPoint: GetSet<Vector2d, this>;
  strokeLinearGradientColorStops: GetSet<Array<number | string>, this>;
}

Shape.prototype._fillFunc = _fillFunc;
Shape.prototype._strokeFunc = _strokeFunc;
Shape.prototype._fillFuncHit = _fillFuncHit;
Shape.prototype._strokeFuncHit = _strokeFuncHit;

Shape.prototype._centroid = false;
Shape.prototype.nodeType = 'Shape';
_registerNode(Shape);

Shape.prototype.eventListeners = {};
Shape.prototype.on.call(
  Shape.prototype,
  'shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva',
  _clearHasShadowCache
);

Shape.prototype.on.call(
  Shape.prototype,
  'shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva',
  _clearGetShadowRGBACache
);

Shape.prototype.on.call(
  Shape.prototype,
  'fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva fillPatternOffsetXChange.konva fillPatternOffsetYChange.konva fillPatternXChange.konva fillPatternYChange.konva fillPatternRotationChange.konva',
  _clearFillPatternCache
);

Shape.prototype.on.call(
  Shape.prototype,
  'fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva',
  _clearLinearGradientCache
);

Shape.prototype.on.call(
  Shape.prototype,
  'fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva',
  _clearRadialGradientCache
);

// add getters and setters
Factory.addGetterSetter(
  Shape,
  'stroke',
  undefined,
  getStringOrGradientValidator()
);

/**
 * get/set stroke color
 * @name Konva.Shape#stroke
 * @method
 * @param {String} color
 * @returns {String}
 * @example
 * // get stroke color
 * var stroke = shape.stroke();
 *
 * // set stroke color with color string
 * shape.stroke('green');
 *
 * // set stroke color with hex
 * shape.stroke('#00ff00');
 *
 * // set stroke color with rgb
 * shape.stroke('rgb(0,255,0)');
 *
 * // set stroke color with rgba and make it 50% opaque
 * shape.stroke('rgba(0,255,0,0.5');
 */

Factory.addGetterSetter(Shape, 'strokeWidth', 2, getNumberValidator());

/**
 * get/set stroke width
 * @name Konva.Shape#strokeWidth
 * @method
 * @param {Number} strokeWidth
 * @returns {Number}
 * @example
 * // get stroke width
 * var strokeWidth = shape.strokeWidth();
 *
 * // set stroke width
 * shape.strokeWidth(10);
 */

Factory.addGetterSetter(Shape, 'fillAfterStrokeEnabled', false);

/**
 * get/set fillAfterStrokeEnabled property. By default Konva is drawing filling first, then stroke on top of the fill.
 * In rare situations you may want a different behavior. When you have a stroke first then fill on top of it.
 * Especially useful for Text objects.
 * Default is false.
 * @name Konva.Shape#fillAfterStrokeEnabled
 * @method
 * @param {Boolean} fillAfterStrokeEnabled
 * @returns {Boolean}
 * @example
 * // get stroke width
 * var fillAfterStrokeEnabled = shape.fillAfterStrokeEnabled();
 *
 * // set stroke width
 * shape.fillAfterStrokeEnabled(true);
 */

Factory.addGetterSetter(
  Shape,
  'hitStrokeWidth',
  'auto',
  getNumberOrAutoValidator()
);

/**
 * get/set stroke width for hit detection. Default value is "auto", it means it will be equals to strokeWidth
 * @name Konva.Shape#hitStrokeWidth
 * @method
 * @param {Number} hitStrokeWidth
 * @returns {Number}
 * @example
 * // get stroke width
 * var hitStrokeWidth = shape.hitStrokeWidth();
 *
 * // set hit stroke width
 * shape.hitStrokeWidth(20);
 * // set hit stroke width always equals to scene stroke width
 * shape.hitStrokeWidth('auto');
 */

Factory.addGetterSetter(Shape, 'strokeHitEnabled', true, getBooleanValidator());

/**
 * **deprecated, use hitStrokeWidth instead!** get/set strokeHitEnabled property. Useful for performance optimization.
 * You may set `shape.strokeHitEnabled(false)`. In this case stroke will be no draw on hit canvas, so hit area
 * of shape will be decreased (by lineWidth / 2). Remember that non closed line with `strokeHitEnabled = false`
 * will be not drawn on hit canvas, that is mean line will no trigger pointer events (like mouseover)
 * Default value is true.
 * @name Konva.Shape#strokeHitEnabled
 * @method
 * @param {Boolean} strokeHitEnabled
 * @returns {Boolean}
 * @example
 * // get strokeHitEnabled
 * var strokeHitEnabled = shape.strokeHitEnabled();
 *
 * // set strokeHitEnabled
 * shape.strokeHitEnabled();
 */

Factory.addGetterSetter(
  Shape,
  'perfectDrawEnabled',
  true,
  getBooleanValidator()
);

/**
 * get/set perfectDrawEnabled. If a shape has fill, stroke and opacity you may set `perfectDrawEnabled` to false to improve performance.
 * See http://konvajs.org/docs/performance/Disable_Perfect_Draw.html for more information.
 * Default value is true
 * @name Konva.Shape#perfectDrawEnabled
 * @method
 * @param {Boolean} perfectDrawEnabled
 * @returns {Boolean}
 * @example
 * // get perfectDrawEnabled
 * var perfectDrawEnabled = shape.perfectDrawEnabled();
 *
 * // set perfectDrawEnabled
 * shape.perfectDrawEnabled();
 */

Factory.addGetterSetter(
  Shape,
  'shadowForStrokeEnabled',
  true,
  getBooleanValidator()
);

/**
 * get/set shadowForStrokeEnabled. Useful for performance optimization.
 * You may set `shape.shadowForStrokeEnabled(false)`. In this case stroke will no effect shadow.
 * Remember if you set `shadowForStrokeEnabled = false` for non closed line - that line will have no shadow!.
 * Default value is true
 * @name Konva.Shape#shadowForStrokeEnabled
 * @method
 * @param {Boolean} shadowForStrokeEnabled
 * @returns {Boolean}
 * @example
 * // get shadowForStrokeEnabled
 * var shadowForStrokeEnabled = shape.shadowForStrokeEnabled();
 *
 * // set shadowForStrokeEnabled
 * shape.shadowForStrokeEnabled();
 */

Factory.addGetterSetter(Shape, 'lineJoin');

/**
 * get/set line join.  Can be miter, round, or bevel.  The
 *  default is miter
 * @name Konva.Shape#lineJoin
 * @method
 * @param {String} lineJoin
 * @returns {String}
 * @example
 * // get line join
 * var lineJoin = shape.lineJoin();
 *
 * // set line join
 * shape.lineJoin('round');
 */

Factory.addGetterSetter(Shape, 'lineCap');

/**
 * get/set line cap.  Can be butt, round, or square
 * @name Konva.Shape#lineCap
 * @method
 * @param {String} lineCap
 * @returns {String}
 * @example
 * // get line cap
 * var lineCap = shape.lineCap();
 *
 * // set line cap
 * shape.lineCap('round');
 */

Factory.addGetterSetter(Shape, 'sceneFunc');

/**
 * get/set scene draw function. That function is used to draw the shape on a canvas.
 * Also that function will be used to draw hit area of the shape, in case if hitFunc is not defined.
 * @name Konva.Shape#sceneFunc
 * @method
 * @param {Function} drawFunc drawing function
 * @returns {Function}
 * @example
 * // get scene draw function
 * var sceneFunc = shape.sceneFunc();
 *
 * // set scene draw function
 * shape.sceneFunc(function(context, shape) {
 *   context.beginPath();
 *   context.rect(0, 0, shape.width(), shape.height());
 *   context.closePath();
 *   // important Konva method that fill and stroke shape from its properties
 *   // like stroke and fill
 *   context.fillStrokeShape(shape);
 * });
 */

Factory.addGetterSetter(Shape, 'hitFunc');

/**
 * get/set hit draw function. That function is used to draw custom hit area of a shape.
 * @name Konva.Shape#hitFunc
 * @method
 * @param {Function} drawFunc drawing function
 * @returns {Function}
 * @example
 * // get hit draw function
 * var hitFunc = shape.hitFunc();
 *
 * // set hit draw function
 * shape.hitFunc(function(context) {
 *   context.beginPath();
 *   context.rect(0, 0, shape.width(), shape.height());
 *   context.closePath();
 *   // important Konva method that fill and stroke shape from its properties
 *   context.fillStrokeShape(shape);
 * });
 */

Factory.addGetterSetter(Shape, 'dash');

/**
 * get/set dash array for stroke.
 * @name Konva.Shape#dash
 * @method
 * @param {Array} dash
 * @returns {Array}
 * @example
 *  // apply dashed stroke that is 10px long and 5 pixels apart
 *  line.dash([10, 5]);
 *  // apply dashed stroke that is made up of alternating dashed
 *  // lines that are 10px long and 20px apart, and dots that have
 *  // a radius of 5px and are 20px apart
 *  line.dash([10, 20, 0.001, 20]);
 */

Factory.addGetterSetter(Shape, 'dashOffset', 0, getNumberValidator());

/**
 * get/set dash offset for stroke.
 * @name Konva.Shape#dash
 * @method
 * @param {Number} dash offset
 * @returns {Number}
 * @example
 *  // apply dashed stroke that is 10px long and 5 pixels apart with an offset of 5px
 *  line.dash([10, 5]);
 *  line.dashOffset(5);
 */

Factory.addGetterSetter(Shape, 'shadowColor', undefined, getStringValidator());

/**
 * get/set shadow color
 * @name Konva.Shape#shadowColor
 * @method
 * @param {String} color
 * @returns {String}
 * @example
 * // get shadow color
 * var shadow = shape.shadowColor();
 *
 * // set shadow color with color string
 * shape.shadowColor('green');
 *
 * // set shadow color with hex
 * shape.shadowColor('#00ff00');
 *
 * // set shadow color with rgb
 * shape.shadowColor('rgb(0,255,0)');
 *
 * // set shadow color with rgba and make it 50% opaque
 * shape.shadowColor('rgba(0,255,0,0.5');
 */

Factory.addGetterSetter(Shape, 'shadowBlur', 0, getNumberValidator());

/**
 * get/set shadow blur
 * @name Konva.Shape#shadowBlur
 * @method
 * @param {Number} blur
 * @returns {Number}
 * @example
 * // get shadow blur
 * var shadowBlur = shape.shadowBlur();
 *
 * // set shadow blur
 * shape.shadowBlur(10);
 */

Factory.addGetterSetter(Shape, 'shadowOpacity', 1, getNumberValidator());

/**
 * get/set shadow opacity.  must be a value between 0 and 1
 * @name Konva.Shape#shadowOpacity
 * @method
 * @param {Number} opacity
 * @returns {Number}
 * @example
 * // get shadow opacity
 * var shadowOpacity = shape.shadowOpacity();
 *
 * // set shadow opacity
 * shape.shadowOpacity(0.5);
 */

Factory.addComponentsGetterSetter(Shape, 'shadowOffset', ['x', 'y']);

/**
 * get/set shadow offset
 * @name Konva.Shape#shadowOffset
 * @method
 * @param {Object} offset
 * @param {Number} offset.x
 * @param {Number} offset.y
 * @returns {Object}
 * @example
 * // get shadow offset
 * var shadowOffset = shape.shadowOffset();
 *
 * // set shadow offset
 * shape.shadowOffset({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addGetterSetter(Shape, 'shadowOffsetX', 0, getNumberValidator());

/**
 * get/set shadow offset x
 * @name Konva.Shape#shadowOffsetX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get shadow offset x
 * var shadowOffsetX = shape.shadowOffsetX();
 *
 * // set shadow offset x
 * shape.shadowOffsetX(5);
 */

Factory.addGetterSetter(Shape, 'shadowOffsetY', 0, getNumberValidator());

/**
 * get/set shadow offset y
 * @name Konva.Shape#shadowOffsetY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get shadow offset y
 * var shadowOffsetY = shape.shadowOffsetY();
 *
 * // set shadow offset y
 * shape.shadowOffsetY(5);
 */

Factory.addGetterSetter(Shape, 'fillPatternImage');

/**
 * get/set fill pattern image
 * @name Konva.Shape#fillPatternImage
 * @method
 * @param {Image} image object
 * @returns {Image}
 * @example
 * // get fill pattern image
 * var fillPatternImage = shape.fillPatternImage();
 *
 * // set fill pattern image
 * var imageObj = new Image();
 * imageObj.onload = function() {
 *   shape.fillPatternImage(imageObj);
 * };
 * imageObj.src = 'path/to/image/jpg';
 */

Factory.addGetterSetter(
  Shape,
  'fill',
  undefined,
  getStringOrGradientValidator()
);

/**
 * get/set fill color
 * @name Konva.Shape#fill
 * @method
 * @param {String} color
 * @returns {String}
 * @example
 * // get fill color
 * var fill = shape.fill();
 *
 * // set fill color with color string
 * shape.fill('green');
 *
 * // set fill color with hex
 * shape.fill('#00ff00');
 *
 * // set fill color with rgb
 * shape.fill('rgb(0,255,0)');
 *
 * // set fill color with rgba and make it 50% opaque
 * shape.fill('rgba(0,255,0,0.5');
 *
 * // shape without fill
 * shape.fill(null);
 */

Factory.addGetterSetter(Shape, 'fillPatternX', 0, getNumberValidator());

/**
 * get/set fill pattern x
 * @name Konva.Shape#fillPatternX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill pattern x
 * var fillPatternX = shape.fillPatternX();
 * // set fill pattern x
 * shape.fillPatternX(20);
 */

Factory.addGetterSetter(Shape, 'fillPatternY', 0, getNumberValidator());

/**
 * get/set fill pattern y
 * @name Konva.Shape#fillPatternY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill pattern y
 * var fillPatternY = shape.fillPatternY();
 * // set fill pattern y
 * shape.fillPatternY(20);
 */

Factory.addGetterSetter(Shape, 'fillLinearGradientColorStops');

/**
 * get/set fill linear gradient color stops
 * @name Konva.Shape#fillLinearGradientColorStops
 * @method
 * @param {Array} colorStops
 * @returns {Array} colorStops
 * @example
 * // get fill linear gradient color stops
 * var colorStops = shape.fillLinearGradientColorStops();
 *
 * // create a linear gradient that starts with red, changes to blue
 * // halfway through, and then changes to green
 * shape.fillLinearGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
 */

Factory.addGetterSetter(Shape, 'strokeLinearGradientColorStops');

/**
 * get/set stroke linear gradient color stops
 * @name Konva.Shape#strokeLinearGradientColorStops
 * @method
 * @param {Array} colorStops
 * @returns {Array} colorStops
 * @example
 * // get stroke linear gradient color stops
 * var colorStops = shape.strokeLinearGradientColorStops();
 *
 * // create a linear gradient that starts with red, changes to blue
 * // halfway through, and then changes to green
 * shape.strokeLinearGradientColorStops([0, 'red', 0.5, 'blue', 1, 'green']);
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientStartRadius', 0);

/**
 * get/set fill radial gradient start radius
 * @name Konva.Shape#fillRadialGradientStartRadius
 * @method
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radial gradient start radius
 * var startRadius = shape.fillRadialGradientStartRadius();
 *
 * // set radial gradient start radius
 * shape.fillRadialGradientStartRadius(0);
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientEndRadius', 0);

/**
 * get/set fill radial gradient end radius
 * @name Konva.Shape#fillRadialGradientEndRadius
 * @method
 * @param {Number} radius
 * @returns {Number}
 * @example
 * // get radial gradient end radius
 * var endRadius = shape.fillRadialGradientEndRadius();
 *
 * // set radial gradient end radius
 * shape.fillRadialGradientEndRadius(100);
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientColorStops');

/**
 * get/set fill radial gradient color stops
 * @name Konva.Shape#fillRadialGradientColorStops
 * @method
 * @param {Number} colorStops
 * @returns {Array}
 * @example
 * // get fill radial gradient color stops
 * var colorStops = shape.fillRadialGradientColorStops();
 *
 * // create a radial gradient that starts with red, changes to blue
 * // halfway through, and then changes to green
 * shape.fillRadialGradientColorStops(0, 'red', 0.5, 'blue', 1, 'green');
 */

Factory.addGetterSetter(Shape, 'fillPatternRepeat', 'repeat');

/**
 * get/set fill pattern repeat.  Can be 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'.  The default is 'repeat'
 * @name Konva.Shape#fillPatternRepeat
 * @method
 * @param {String} repeat
 * @returns {String}
 * @example
 * // get fill pattern repeat
 * var repeat = shape.fillPatternRepeat();
 *
 * // repeat pattern in x direction only
 * shape.fillPatternRepeat('repeat-x');
 *
 * // do not repeat the pattern
 * shape.fillPatternRepeat('no-repeat');
 */

Factory.addGetterSetter(Shape, 'fillEnabled', true);

/**
 * get/set fill enabled flag
 * @name Konva.Shape#fillEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get fill enabled flag
 * var fillEnabled = shape.fillEnabled();
 *
 * // disable fill
 * shape.fillEnabled(false);
 *
 * // enable fill
 * shape.fillEnabled(true);
 */

Factory.addGetterSetter(Shape, 'strokeEnabled', true);

/**
 * get/set stroke enabled flag
 * @name Konva.Shape#strokeEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get stroke enabled flag
 * var strokeEnabled = shape.strokeEnabled();
 *
 * // disable stroke
 * shape.strokeEnabled(false);
 *
 * // enable stroke
 * shape.strokeEnabled(true);
 */

Factory.addGetterSetter(Shape, 'shadowEnabled', true);

/**
 * get/set shadow enabled flag
 * @name Konva.Shape#shadowEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get shadow enabled flag
 * var shadowEnabled = shape.shadowEnabled();
 *
 * // disable shadow
 * shape.shadowEnabled(false);
 *
 * // enable shadow
 * shape.shadowEnabled(true);
 */

Factory.addGetterSetter(Shape, 'dashEnabled', true);

/**
 * get/set dash enabled flag
 * @name Konva.Shape#dashEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get dash enabled flag
 * var dashEnabled = shape.dashEnabled();
 *
 * // disable dash
 * shape.dashEnabled(false);
 *
 * // enable dash
 * shape.dashEnabled(true);
 */

Factory.addGetterSetter(Shape, 'strokeScaleEnabled', true);

/**
 * get/set strokeScale enabled flag
 * @name Konva.Shape#strokeScaleEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get stroke scale enabled flag
 * var strokeScaleEnabled = shape.strokeScaleEnabled();
 *
 * // disable stroke scale
 * shape.strokeScaleEnabled(false);
 *
 * // enable stroke scale
 * shape.strokeScaleEnabled(true);
 */

Factory.addGetterSetter(Shape, 'fillPriority', 'color');

/**
 * get/set fill priority.  can be color, pattern, linear-gradient, or radial-gradient.  The default is color.
 *   This is handy if you want to toggle between different fill types.
 * @name Konva.Shape#fillPriority
 * @method
 * @param {String} priority
 * @returns {String}
 * @example
 * // get fill priority
 * var fillPriority = shape.fillPriority();
 *
 * // set fill priority
 * shape.fillPriority('linear-gradient');
 */

Factory.addComponentsGetterSetter(Shape, 'fillPatternOffset', ['x', 'y']);

/**
 * get/set fill pattern offset
 * @name Konva.Shape#fillPatternOffset
 * @method
 * @param {Object} offset
 * @param {Number} offset.x
 * @param {Number} offset.y
 * @returns {Object}
 * @example
 * // get fill pattern offset
 * var patternOffset = shape.fillPatternOffset();
 *
 * // set fill pattern offset
 * shape.fillPatternOffset({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addGetterSetter(Shape, 'fillPatternOffsetX', 0, getNumberValidator());

/**
 * get/set fill pattern offset x
 * @name Konva.Shape#fillPatternOffsetX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill pattern offset x
 * var patternOffsetX = shape.fillPatternOffsetX();
 *
 * // set fill pattern offset x
 * shape.fillPatternOffsetX(20);
 */

Factory.addGetterSetter(Shape, 'fillPatternOffsetY', 0, getNumberValidator());

/**
 * get/set fill pattern offset y
 * @name Konva.Shape#fillPatternOffsetY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill pattern offset y
 * var patternOffsetY = shape.fillPatternOffsetY();
 *
 * // set fill pattern offset y
 * shape.fillPatternOffsetY(10);
 */

Factory.addComponentsGetterSetter(Shape, 'fillPatternScale', ['x', 'y']);

/**
 * get/set fill pattern scale
 * @name Konva.Shape#fillPatternScale
 * @method
 * @param {Object} scale
 * @param {Number} scale.x
 * @param {Number} scale.y
 * @returns {Object}
 * @example
 * // get fill pattern scale
 * var patternScale = shape.fillPatternScale();
 *
 * // set fill pattern scale
 * shape.fillPatternScale({
 *   x: 2,
 *   y: 2
 * });
 */

Factory.addGetterSetter(Shape, 'fillPatternScaleX', 1, getNumberValidator());

/**
 * get/set fill pattern scale x
 * @name Konva.Shape#fillPatternScaleX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill pattern scale x
 * var patternScaleX = shape.fillPatternScaleX();
 *
 * // set fill pattern scale x
 * shape.fillPatternScaleX(2);
 */

Factory.addGetterSetter(Shape, 'fillPatternScaleY', 1, getNumberValidator());

/**
 * get/set fill pattern scale y
 * @name Konva.Shape#fillPatternScaleY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill pattern scale y
 * var patternScaleY = shape.fillPatternScaleY();
 *
 * // set fill pattern scale y
 * shape.fillPatternScaleY(2);
 */

Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientStartPoint', [
  'x',
  'y',
]);

/**
 * get/set fill linear gradient start point
 * @name Konva.Shape#fillLinearGradientStartPoint
 * @method
 * @param {Object} startPoint
 * @param {Number} startPoint.x
 * @param {Number} startPoint.y
 * @returns {Object}
 * @example
 * // get fill linear gradient start point
 * var startPoint = shape.fillLinearGradientStartPoint();
 *
 * // set fill linear gradient start point
 * shape.fillLinearGradientStartPoint({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientStartPoint', [
  'x',
  'y',
]);

/**
 * get/set stroke linear gradient start point
 * @name Konva.Shape#strokeLinearGradientStartPoint
 * @method
 * @param {Object} startPoint
 * @param {Number} startPoint.x
 * @param {Number} startPoint.y
 * @returns {Object}
 * @example
 * // get stroke linear gradient start point
 * var startPoint = shape.strokeLinearGradientStartPoint();
 *
 * // set stroke linear gradient start point
 * shape.strokeLinearGradientStartPoint({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointX', 0);

/**
 * get/set fill linear gradient start point x
 * @name Konva.Shape#fillLinearGradientStartPointX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill linear gradient start point x
 * var startPointX = shape.fillLinearGradientStartPointX();
 *
 * // set fill linear gradient start point x
 * shape.fillLinearGradientStartPointX(20);
 */

Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointX', 0);

/**
 * get/set stroke linear gradient start point x
 * @name Konva.Shape#linearLinearGradientStartPointX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get stroke linear gradient start point x
 * var startPointX = shape.strokeLinearGradientStartPointX();
 *
 * // set stroke linear gradient start point x
 * shape.strokeLinearGradientStartPointX(20);
 */

Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointY', 0);

/**
 * get/set fill linear gradient start point y
 * @name Konva.Shape#fillLinearGradientStartPointY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill linear gradient start point y
 * var startPointY = shape.fillLinearGradientStartPointY();
 *
 * // set fill linear gradient start point y
 * shape.fillLinearGradientStartPointY(20);
 */

Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointY', 0);
/**
 * get/set stroke linear gradient start point y
 * @name Konva.Shape#strokeLinearGradientStartPointY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get stroke linear gradient start point y
 * var startPointY = shape.strokeLinearGradientStartPointY();
 *
 * // set stroke linear gradient start point y
 * shape.strokeLinearGradientStartPointY(20);
 */

Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientEndPoint', [
  'x',
  'y',
]);

/**
 * get/set fill linear gradient end point
 * @name Konva.Shape#fillLinearGradientEndPoint
 * @method
 * @param {Object} endPoint
 * @param {Number} endPoint.x
 * @param {Number} endPoint.y
 * @returns {Object}
 * @example
 * // get fill linear gradient end point
 * var endPoint = shape.fillLinearGradientEndPoint();
 *
 * // set fill linear gradient end point
 * shape.fillLinearGradientEndPoint({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientEndPoint', [
  'x',
  'y',
]);

/**
 * get/set stroke linear gradient end point
 * @name Konva.Shape#strokeLinearGradientEndPoint
 * @method
 * @param {Object} endPoint
 * @param {Number} endPoint.x
 * @param {Number} endPoint.y
 * @returns {Object}
 * @example
 * // get stroke linear gradient end point
 * var endPoint = shape.strokeLinearGradientEndPoint();
 *
 * // set stroke linear gradient end point
 * shape.strokeLinearGradientEndPoint({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointX', 0);
/**
 * get/set fill linear gradient end point x
 * @name Konva.Shape#fillLinearGradientEndPointX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill linear gradient end point x
 * var endPointX = shape.fillLinearGradientEndPointX();
 *
 * // set fill linear gradient end point x
 * shape.fillLinearGradientEndPointX(20);
 */

Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointX', 0);
/**
 * get/set fill linear gradient end point x
 * @name Konva.Shape#strokeLinearGradientEndPointX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get stroke linear gradient end point x
 * var endPointX = shape.strokeLinearGradientEndPointX();
 *
 * // set stroke linear gradient end point x
 * shape.strokeLinearGradientEndPointX(20);
 */

Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointY', 0);
/**
 * get/set fill linear gradient end point y
 * @name Konva.Shape#fillLinearGradientEndPointY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill linear gradient end point y
 * var endPointY = shape.fillLinearGradientEndPointY();
 *
 * // set fill linear gradient end point y
 * shape.fillLinearGradientEndPointY(20);
 */

Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointY', 0);
/**
 * get/set stroke linear gradient end point y
 * @name Konva.Shape#strokeLinearGradientEndPointY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get stroke linear gradient end point y
 * var endPointY = shape.strokeLinearGradientEndPointY();
 *
 * // set stroke linear gradient end point y
 * shape.strokeLinearGradientEndPointY(20);
 */

Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientStartPoint', [
  'x',
  'y',
]);

/**
 * get/set fill radial gradient start point
 * @name Konva.Shape#fillRadialGradientStartPoint
 * @method
 * @param {Object} startPoint
 * @param {Number} startPoint.x
 * @param {Number} startPoint.y
 * @returns {Object}
 * @example
 * // get fill radial gradient start point
 * var startPoint = shape.fillRadialGradientStartPoint();
 *
 * // set fill radial gradient start point
 * shape.fillRadialGradientStartPoint({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointX', 0);
/**
 * get/set fill radial gradient start point x
 * @name Konva.Shape#fillRadialGradientStartPointX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill radial gradient start point x
 * var startPointX = shape.fillRadialGradientStartPointX();
 *
 * // set fill radial gradient start point x
 * shape.fillRadialGradientStartPointX(20);
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointY', 0);
/**
 * get/set fill radial gradient start point y
 * @name Konva.Shape#fillRadialGradientStartPointY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill radial gradient start point y
 * var startPointY = shape.fillRadialGradientStartPointY();
 *
 * // set fill radial gradient start point y
 * shape.fillRadialGradientStartPointY(20);
 */

Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientEndPoint', [
  'x',
  'y',
]);

/**
 * get/set fill radial gradient end point
 * @name Konva.Shape#fillRadialGradientEndPoint
 * @method
 * @param {Object} endPoint
 * @param {Number} endPoint.x
 * @param {Number} endPoint.y
 * @returns {Object}
 * @example
 * // get fill radial gradient end point
 * var endPoint = shape.fillRadialGradientEndPoint();
 *
 * // set fill radial gradient end point
 * shape.fillRadialGradientEndPoint({
 *   x: 20,
 *   y: 10
 * });
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointX', 0);
/**
 * get/set fill radial gradient end point x
 * @name Konva.Shape#fillRadialGradientEndPointX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get fill radial gradient end point x
 * var endPointX = shape.fillRadialGradientEndPointX();
 *
 * // set fill radial gradient end point x
 * shape.fillRadialGradientEndPointX(20);
 */

Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointY', 0);
/**
 * get/set fill radial gradient end point y
 * @name Konva.Shape#fillRadialGradientEndPointY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get fill radial gradient end point y
 * var endPointY = shape.fillRadialGradientEndPointY();
 *
 * // set fill radial gradient end point y
 * shape.fillRadialGradientEndPointY(20);
 */

Factory.addGetterSetter(Shape, 'fillPatternRotation', 0);

/**
 * get/set fill pattern rotation in degrees
 * @name Konva.Shape#fillPatternRotation
 * @method
 * @param {Number} rotation
 * @returns {Konva.Shape}
 * @example
 * // get fill pattern rotation
 * var patternRotation = shape.fillPatternRotation();
 *
 * // set fill pattern rotation
 * shape.fillPatternRotation(20);
 */

Factory.addGetterSetter(Shape, 'fillRule', undefined, getStringValidator());

/**
 * get/set fill rule
 * @name Konva.Shape#fillRule
 * @method
 * @param {CanvasFillRule} rotation
 * @returns {Konva.Shape}
 * @example
 * // get fill rule
 * var fillRule = shape.fillRule();
 *
 * // set fill rule
 * shape.fillRule('evenodd');
 */

Factory.backCompat(Shape, {
  dashArray: 'dash',
  getDashArray: 'getDash',
  setDashArray: 'getDash',

  drawFunc: 'sceneFunc',
  getDrawFunc: 'getSceneFunc',
  setDrawFunc: 'setSceneFunc',

  drawHitFunc: 'hitFunc',
  getDrawHitFunc: 'getHitFunc',
  setDrawHitFunc: 'setHitFunc',
});
