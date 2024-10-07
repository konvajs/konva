import type { Container } from './Container';

export interface GetSet<Type, This> {
  (): Type;
  (v: Type): This;
}

export interface Vector2d {
  x: number;
  y: number;
}

export interface PathSegment {
  command:
    | 'm'
    | 'M'
    | 'l'
    | 'L'
    | 'v'
    | 'V'
    | 'h'
    | 'H'
    | 'z'
    | 'Z'
    | 'c'
    | 'C'
    | 'q'
    | 'Q'
    | 't'
    | 'T'
    | 's'
    | 'S'
    | 'a'
    | 'A';
  start: Vector2d;
  points: number[];
  pathLength: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IFrame {
  time: number;
  timeDiff: number;
  lastTime: number;
  frameRate: number;
}

export type AnimationFn = (frame?: IFrame) => boolean | void;

export enum KonvaNodeEvent {
  mouseover = 'mouseover',
  mouseout = 'mouseout',
  mousemove = 'mousemove',
  mouseleave = 'mouseleave',
  mouseenter = 'mouseenter',
  mousedown = 'mousedown',
  mouseup = 'mouseup',
  wheel = 'wheel',
  contextmenu = 'contextmenu',
  click = 'click',
  dblclick = 'dblclick',
  touchstart = 'touchstart',
  touchmove = 'touchmove',
  touchend = 'touchend',
  tap = 'tap',
  dbltap = 'dbltap',
  dragstart = 'dragstart',
  dragmove = 'dragmove',
  dragend = 'dragend',
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ToCanvasConfig {
  /**
   * The x coordinate of the canvas section to be exported.
   * If omitted, the x coordinate of the node's rect will be used.
   */
  x?: number;
  /**
   * The y coordinate of the canvas section to be exported.
   * If omitted, the y coordinate of the node's rect will be used.
   */
  y?: number;
  /**
   * The width of the canvas section to be exported.
   * If omitted, the width of the node's rect will be used.
   */
  width?: number;
  /**
   * The height of the canvas section to be exported.
   * If omitted, the height of the node's rect will be used.
   */
  height?: number;
  /**
   * The pixel ratio of the of output image.
   *
   * Use this property to increase resolution of the output image. For example, you may wish to increase the pixel ratio
   * to support high resolution (retina) displays.
   *
   * `pixelRatio` will be used to multiply the size of exported image. For example, if you export a 500x500 section of the canvas
   * with `pixelRatio: 2, the exported image will be 1000x1000.
   * @default 1
   */
  pixelRatio?: number;
  /**
   * Whether to enable image smoothing.
   * @default true
   */
  imageSmoothingEnabled?: boolean;
}

export type MIMEType = 'image/jpeg' | 'image/png' | 'image/webp';

interface MIMETypeConfig {
  /**
   * The MIME type of the exported image. Default is `image/png`.
   *
   * Browsers may support different MIME types. For example, Firefox and Chromium-based browsers support `image/webp`
   * and `image/jpeg` in addition to `image/png`, while Safari supports only `image/png` and `image/jpeg`.
   *
   * See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#browser_compatibility.
   * @default 'image/png'
   */
  mimeType?: MIMEType;
}

interface QualityConfig {
  /**
   * The quality of the exported image. Values from 0 to 1 are supported, where 0 is poorest quality and 1 is best quality.
   *
   * This only applies to `image/jpeg` and `image/webp` MIME types, which are lossy formats and support quality settings.
   * @default 1
   */
  quality?: number;
}

export interface ToDataURLConfig
  extends ToCanvasConfig,
    MIMETypeConfig,
    QualityConfig {
  /**
   * A callback function that will be called with the data URL of the exported image.
   * @param dataURL The data URL of the exported image.
   * @returns void
   */
  callback?: (dataURL: string) => void;
}

export interface ToImageConfig
  extends ToCanvasConfig,
    MIMETypeConfig,
    QualityConfig {
  /**
   * A callback function that will be called with the exported image element.
   * @param image The exported image element.
   * @returns void
   */
  callback?: (image: HTMLImageElement) => void;
}

export interface ToBlobConfig
  extends ToCanvasConfig,
    MIMETypeConfig,
    QualityConfig {
  /**
   * A callback function that will be called with the exported blob.
   * @param blob The exported blob, or null if the browser was unable to create the blob for any reason.
   * @returns void
   */
  callback?: (blob: Blob | null) => void;
}

export interface CacheConfig extends ToCanvasConfig {
  /**
   * When set to `true`, a red border will be drawn around the cached region. Used for debugging.
   * @default false
   */
  drawBorder?: boolean;
  /**
   * Increases the size of the cached region by the specified amount of pixels in each direction.
   * @default 0
   */
  offset?: number;
  /**
   * The pixel ratio of the cached hit canvas. Lower pixel ratios can result in better performance, but less accurate hit detection.
   * @default 1
   */
  hitCanvasPixelRatio?: number;
}

export interface GetClientRectConfig {
  /**
   * Whether to apply the current node's transforms when calculating the client rect.
   * @default false
   */
  skipTransform?: boolean;
  /**
   * Whether to apply shadow to the node when calculating the client rect.
   * @default false
   */
  skipShadow?: boolean;
  /**
   * Whether to apply stroke to the node when calculating the client rect.
   * @default false
   */
  skipStroke?: boolean;
  /**
   * If provided, the client rect will be calculated relative to the specified container. Must be a parent of the node.
   */
  relativeTo?: Container;
}
