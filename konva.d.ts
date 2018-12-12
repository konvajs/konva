declare namespace Konva {
  var pixelRatio: number;
  var dragDistance: number;
  var isDragging: () => boolean;
  var isDragReady: () => boolean;
  var DD: any;

  export interface KonvaEventObject<E> {
    target: Konva.Shape;
    evt: E;
    currentTarget: Konva.Node;
    cancelBubble: boolean;
  }
  
  type HandlerFunc<E = Event> = (e: KonvaEventObject<E>) => void;

  enum KonvaNodeEvent {
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
    dragend = 'dragend'
  }

  enum KonvaStageEvent {
    contentMouseover = 'contentMouseover',
    contentMousemove = 'contentMousemove',
    contentMouseout = 'contentMouseout',
    contentMousedown = 'contentMousedown',
    contentMouseup = 'contentMouseup',
    contentWheel = 'contentWheel',
    contentContextmenu = 'contentContextmenu',
    contentClick = 'contentClick',
    contentDblclick = 'contentDblclick',
    contentTouchstart = 'contentTouchstart',
    contentTouchmove = 'contentTouchmove',
    contentTouchend = 'contentTouchend',
    contentTap = 'contentTap',
    contentDblTap = 'contentDblTap'
  }

  type KonvaEvent = KonvaNodeEvent & KonvaStageEvent;

  type KonvaEventString = KonvaEvent | string;

  type globalCompositeOperationType =
    | ''
    | 'source-over'
    | 'source-in'
    | 'source-out'
    | 'source-atop'
    | 'destination-over'
    | 'destination-in'
    | 'destination-out'
    | 'destination-atop'
    | 'lighter'
    | 'copy'
    | 'xor'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity';
                   
  export interface RGB {
    r: number;
    g: number;
    b: number;
  }

  export class Util {
    static getRandomColor(): string;
    static getRGB(color: string): RGB;
  }

  type EasingFn = (
    elapsed: number,
    startValue: number,
    diff: number,
    duration: number
  ) => number;
  type ElasticEasingFn = (
    elapsed: number,
    startValue: number,
    diff: number,
    duration: number,
    a?: number,
    p?: number
  ) => number;

  export class Easings {
    static BackEaseIn: EasingFn;
    static BackEaseInOut: EasingFn;
    static BackEaseOut: EasingFn;
    static BounceEaseIn: EasingFn;
    static BounceEaseInOut: EasingFn;
    static BounceEaseOut: EasingFn;
    static EaseIn: EasingFn;
    static EaseInOut: EasingFn;
    static EaseOut: EasingFn;
    static ElasticEaseIn: ElasticEasingFn;
    static ElasticEaseInOut: ElasticEasingFn;
    static ElasticEaseOut: ElasticEasingFn;
    static Linear: EasingFn;
    static StrongEaseIn: EasingFn;
    static StrongEaseInOut: EasingFn;
    static StrongEaseOut: EasingFn;
  }

  class Filter {}

  export class Filters {
    static Blur(imageData: any): Filter;
    static Brighten(imageData: any): Filter;
    static Emboss(imageData: any): Filter;
    static Enhance(imageData: any): Filter;
    static Grayscale(imageData: any): Filter;
    static HSV(imageData: any): Filter;
    static Invert(imageData: any): Filter;
    static Mask(imageData: any): Filter;
    static Noise(imageData: any): Filter;
    static Pixelate(imageData: any): Filter;
    static Posterize(imageData: any): Filter;
    static RGB(imageData: any): Filter;
    static RGA(imageData: any): Filter;
    static Sepia(imageData: any): Filter;
    static Solarize(imageData: any): Filter;
    static Threshold(imageData: any): Filter;
    static Contrast(imageData: any): Filter;
  }

  export class Animation {
    constructor(func: Function, layers?: Layer[]);
    constructor(func: Function, layer?: Layer);

    addLayer(layer: Layer): boolean;
    getLayers(): Layer[];
    isRunning(): boolean;
    setLayers(layers: Layer[]): Animation;
    setLayers(layer: Layer): Animation;
    start(): Animation;
    stop(): Animation;
  }

  interface KonvaNodeEventMap extends KonvaStageEventMap {
    mouseover: MouseEvent;
    mouseout: MouseEvent;
    mousemove: MouseEvent;
    mouseleave: MouseEvent;
    mouseenter: MouseEvent;
    mousedown: MouseEvent;
    mouseup: MouseEvent;
    wheel: WheelEvent;
    contextmenu: PointerEvent;
    click: MouseEvent;
    dblclick: MouseEvent;
    touchstart: TouchEvent;
    touchmove: TouchEvent;
    touchend: TouchEvent;
    tap: Event;
    dbltap: Event;
    dragstart: DragEvent;
    dragmove: DragEvent;
    dragend: DragEvent;
    dragover: DragEvent;
    drop: DragEvent;
  }

  interface KonvaStageEventMap {
    contentMouseover: MouseEvent;
    contentMousemove: MouseEvent;
    contentMouseout: MouseEvent;
    contentMousedown: MouseEvent;
    contentMouseup: MouseEvent;
    contentWheel: WheelEvent;
    contentContextmenu: PointerEvent;
    contentClick: MouseEvent;
    contentDblclick: MouseEvent;
    contentTouchstart: TouchEvent;
    contentTouchmove: TouchEvent;
    contentTouchend: TouchEvent;
    contentTap: Event;
    contentDblTap: Event;
  }

  interface NodeConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
    listening?: boolean;
    id?: string;
    name?: string;
    opacity?: Number;
    scale?: Vector2d;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    rotationDeg?: number;
    offset?: Vector2d;
    offsetX?: number;
    offsetY?: number;
    draggable?: boolean;
    dragDistance?: number;
    dragBoundFunc?: (pos: Vector2d) => Vector2d;
    preventDefault?: boolean;
    globalCompositeOperation?: globalCompositeOperationType;
  }

  interface SizeConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }

  interface ToCanvasConfig extends SizeConfig {
    callback: Function;
  }

  interface ToDataURLConfig extends SizeConfig {
    mimeType?: string;
    quality?: number;
    pixelRatio?: number;
  }

  interface ToImageConfig extends SizeConfig {
    callback: Function;
    mimeType?: string;
    quality?: number;
  }

  interface CacheConfig extends SizeConfig {
    drawBorder?: boolean;
    pixelRatio?: number;
  }

  interface ClearConfig extends SizeConfig {}

  class Node {
    constructor(config: NodeConfig);
    static create<T>(data: any, container?: HTMLElement): T;
    preventDefault(): boolean;
    preventDefault(preventDefault: boolean): this;

    addName(name: string): Node;
    blue(): number;
    blue(blue: number): this;
    brightness(): number;
    brightness(brightness: number): this;
    contrast(): number;
    contrast(contrast: number): this;
    blurRadius(): number;
    blurRadius(radius: number): this;
    cache(config?: CacheConfig): this;
    clearCache(): this;
    clear(bounds?: ClearConfig): this;
    clone(attrs?: NodeConfig): this;
    destroy(): void;

    dragBoundFunc(): (pos: Vector2d) => Vector2d;
    dragBoundFunc(dragBoundFunc: (pos: Vector2d) => Vector2d): this;
    draggable(): boolean;
    draggable(draggable: boolean): this;
    draw(): this;
    embossBlend(): boolean;
    embossBlend(embossBlend: boolean): this;
    embossDirection(): string;
    embossDirection(embossDirection: string): this;
    embossStrength(): number;
    embossStrength(level: number): this;
    embossWhiteLevel(): number;
    embossWhiteLevel(embossWhiteLevel: number): this;
    enhance(): number;
    enhance(enhance: number): this;
    filters(): Filter[];
    filters(filters: Filter): this;
    findAncestor(
      selector?: string,
      includeSelf?: boolean,
      stopNode?: Node
    ): this;
    findAncestors(
      selector?: string,
      includeSelf?: boolean,
      stopNode?: Node
    ): Node[];
    fire(eventType: string, evt?: any, bubble?: boolean): this;
    getAbsoluteOpacity(): number;
    getAbsolutePosition(top?: Container): Vector2d;
    getAbsoluteTransform(top?: Container): Transform;
    getAbsoluteZIndex(): number;
    getAbsoluteScale(): Vector2d;
    getAncestors(): Collection;
    getAttr(attr: string): any;
    getAttrs(): NodeConfig;
    // CHECK
    getCanvas(): Canvas;
    getClassName(): string;
    getClientRect(attrs?: {
      skipTransform?: boolean;
      relativeTo?: object;
    }): SizeConfig;
    getContent(): HTMLDivElement;
    getDepth(): number;
    getHeight(): number;
    getHitCanvas(): Canvas;
    getLayer(): Layer;
    getParent(): Container;
    getPosition(): Vector2d;
    // CHECK
    getSize(): {
      width: number;
      height: number;
    };
    getStage(): Stage;
    getTransform(): Transform;
    getType(): String;
    getWidth(): number;
    getZIndex(): number;
    green(): number;
    green(green: number): this;
    hasName(name: string): boolean;
    height(): number;
    height(height: number): this;
    hide(): void;
    hue(): number;
    hue(hue: number): this;
    id(): string;
    id(id: string): this;
    isDragging(): boolean;
    isListening(): boolean;
    isVisible(): boolean;
    kaleidoscopeAngle(): number;
    kaleidoscopeAngle(kaleidoscopeAngle: number): this;
    kaleidoscopePower(): number;
    kaleidoscopePower(kaleidoscopePower: number): this;
    levels(): number;
    levels(levels: number): this;
    listening(): any;
    listening(listening: boolean): this;
    listening(listening: string): this;
    move(move: Vector2d): this;
    moveDown(): boolean;
    moveTo(newContainer: Container): this;
    moveToBottom(): boolean;
    moveToTop(): boolean;
    moveUp(): boolean;
    name(): string;
    name(name: string): this;
    noise(): number;
    noise(noise: number): this;
    off(evtStr: KonvaEventString): this;
    offset(): Vector2d;
    offset(offset: Vector2d): this;
    offsetX(): number;
    offsetX(offsetX: number): this;
    offsetY(): number;
    offsetY(offsetY: number): this;
    on<K extends keyof KonvaNodeEventMap>(
      evtStr: K,
      handler: (e: KonvaEventObject<KonvaNodeEventMap[K]>) => void
    ): this;
    on(evtStr: KonvaEventString, handler: HandlerFunc): this;
    opacity(): number;
    opacity(opacity: number): this;
    pixelSize(): number;
    pixelSize(pixelSize: number): this;
    position(): Vector2d;
    position(position: Vector2d): this;
    red(): number;
    red(red: number): this;
    remove(): this;
    removeName(name: string): this;
    rotate(theta: number): this;
    rotation(): number;
    rotation(rotation: number): this;
    saturation(): number;
    saturation(saturation: number): this;
    scale(): Vector2d;
    scale(scale: Vector2d): this;
    scaleX(): number;
    scaleX(scaleX: number): this;
    scaleY(): number;
    scaleY(scaleY: number): this;
    setAbsolutePosition(pos: Vector2d): this;
    setAttr(attr: string, val: any): this;
    setAttrs(attrs: NodeConfig): void;
    setId(id: string): this;
    setSize(size: { width: number; height: number }): this;
    setZIndex(zIndex: number): void;
    shouldDrawHit(): boolean;
    show(): this;
    skew(): Vector2d;
    skew(skew: Vector2d): this;
    skewX(): number;
    skewX(skewX: number): this;
    skewY(): number;
    skewY(skewY: number): this;
    startDrag(): void;
    stopDrag(): void;
    threshold(): number;
    threshold(threshold: number): this;
    to(params: any): void;
    toCanvas(config: ToCanvasConfig): HTMLCanvasElement;
    toDataURL(config: ToDataURLConfig): string;
    toImage(config: ToImageConfig): HTMLImageElement;
    toJSON(): string;
    toObject(): any;
    transformsEnabled(): string;
    transformsEnabled(transformsEnabled: string): this;
    value(): number;
    value(value: number): this;
    visible(): any;
    visible(visible: boolean): this;
    visible(visible: string): this;
    width(): number;
    width(width: number): this;
    x(): number;
    x(x: number): this;
    y(): number;
    y(y: number): this;
    globalCompositeOperation(): globalCompositeOperationType;
    globalCompositeOperation(type: globalCompositeOperationType): this;
  }

  interface ContainerConfig extends NodeConfig {
    clearBeforeDraw?: boolean;
    clipFunc?: (ctx: CanvasRenderingContext2D) => void;
    clipX?: number;
    clipY?: number;
    clipWidth?: number;
    clipHeight?: number;
  }

  class Container<T extends Node = Node> extends Node {
    constructor(params?: ContainerConfig);
    add(...children: Node[]): this;
    getChildren(filterfunc?: Function): Collection<T>;
    clip(): SizeConfig;
    clip(clip: SizeConfig | undefined | null): this;
    clipHeight(): number;
    clipHeight(clipHeight: number | undefined | null): this;
    clipWidth(): number;
    clipWidth(clipWidth: number | undefined | null): this;
    clipX(): number;
    clipX(clipX: number | undefined | null): this;
    clipY(): number;
    clipY(clipY: number | undefined | null): this;
    clipFunc(): (ctx: CanvasRenderingContext2D) => void;
    clipFunc(clipFunc: (ctx: CanvasRenderingContext2D) => void): void;
    destroyChildren(): void;
    find<T extends Node = Node>(
      selector?: string | ((node: Node) => boolean)
    ): Collection<T>;
    findOne<T extends Node>(selector: string | ((node: Node) => boolean)): T;
    getAllIntersections(pos: Vector2d): Shape[];
    hasChildren(): boolean;
    removeChildren(): void;
  }

  interface ShapeConfig extends NodeConfig {
    fill?: string;
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
    stroke?: string;
    strokeWidth?: number;
    strokeScaleEnabled?: boolean;
    strokeHitEnabled?: boolean;
    strokeEnabled?: boolean;
    lineJoin?: string;
    lineCap?: string;
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
    dashEnabled?: boolean;
    perfectDrawEnabled?: boolean;
  }

  class Shape extends Node {
    constructor(ShapeConfig: ShapeConfig);
    dash(): number[];
    dash(dash: number[]): this;
    dashEnabled(): boolean;
    dashEnabled(dashEnabled: boolean): this;
    drawHit(canvas?: Canvas, top?: Container, caching?: boolean): this;
    drawHitFromCache(alphaThreshold: number): this;
    fill(): string;
    fill(fill: string): this;
    fillEnabled(): boolean;
    fillEnabled(fillEnabled: boolean): this;
    fillLinearGradientColorStops(): Array<number | string>;
    fillLinearGradientColorStops(colors: Array<number | string>): this;
    fillLinearGradientStartPoint(): Vector2d;
    fillLinearGradientStartPoint(point: Vector2d): this;
    fillLinearGradientStartPointX(): number;
    fillLinearGradientStartPointX(x: number): this;
    fillLinearGradientStartPointY(): number;
    fillLinearGradientStartPointY(y: number): this;
    fillLinearGradientEndPoint(): Vector2d;
    fillLinearGradientEndPoint(point: Vector2d): this;
    fillLinearGradientEndPointX(): number;
    fillLinearGradientEndPointX(x: number): this;
    fillLinearGradientEndPointY(): number;
    fillLinearGradientEndPointY(y: number): this;
    fillLinearRadialStartPoint(): Vector2d;
    fillLinearRadialStartPoint(point: Vector2d): this;
    fillLinearRadialStartPointX(): number;
    fillLinearRadialStartPointX(x: number): this;
    fillLinearRadialStartPointY(): number;
    fillLinearRadialStartPointY(y: number): this;
    fillLinearRadialEndPoint(): Vector2d;
    fillLinearRadialEndPoint(point: Vector2d): Vector2d;
    fillLinearRadialEndPointX(): number;
    fillLinearRadialEndPointX(x: number): this;
    fillLinearRadialEndPointY(): number;
    fillLinearRadialEndPointY(y: number): this;
    fillPatternImage(): HTMLImageElement;
    fillPatternImage(image: HTMLImageElement): this;
    fillRadialGradientStartRadius(): number;
    fillRadialGradientStartRadius(radius: number): this;
    fillRadialGradientEndRadius(): number;
    fillRadialGradientEndRadius(radius: number): this;
    fillRadialGradientColorStops(): Array<number | string>;
    fillRadialGradientColorStops(color: Array<number | string>): this;
    fillPatternOffset(): Vector2d;
    fillPatternOffset(offset: Vector2d): this;
    fillPatternOffsetX(): number;
    fillPatternOffsetX(x: number): this;
    fillPatternOffsetY(): number;
    fillPatternOffsetY(y: number): this;
    fillPatternRepeat(): string;
    fillPatternRepeat(repeat: string): this;
    fillPatternRotation(): number;
    fillPatternRotation(rotation: number): this;
    fillPatternScale(): Vector2d;
    fillPatternScale(scale: Vector2d): this;
    fillPatternScaleX(): number;
    fillPatternScaleX(x: number): this;
    fillPatternScaleY(): number;
    fillPatternScaleY(y: number): this;
    fillPatternX(): number;
    fillPatternX(x: number): number;
    fillPatternY(): number;
    fillPatternY(y: number): this;
    fillPriority(): string;
    fillPriority(priority: string): this;
    getSelfRect(): SizeConfig;
    hasFill(): boolean;
    hasShadow(): boolean;
    hasStroke(): boolean;
    hitFunc(): Function;
    hitFunc(func: (con: Context, shape: Shape) => {}): this;
    intersects(point: Vector2d): boolean;
    lineCap(): string;
    lineCap(lineCap: string): this;
    lineJoin(): string;
    lineJoin(lineJoin: string): this;
    perfectDrawEnabled(): boolean;
    perfectDrawEnabled(perfectDrawEnabled: boolean): this;
    sceneFunc(): Function;
    sceneFunc(func: (con: Context, shape: Shape) => {}): this;
    shadowColor(): string;
    shadowColor(shadowColor: string): this;
    shadowEnabled(): boolean;
    shadowEnabled(shadowEnabled: boolean): this;
    shadowForStrokeEnabled(): boolean;
    shadowForStrokeEnabled(shadowForStrokeEnabled: boolean): this;
    shadowOffset(): Vector2d;
    shadowOffset(shadowOffset: Vector2d): this;
    shadowOffsetX(): number;
    shadowOffsetX(shadowOffsetX: number): this;
    shadowOffsetY(): number;
    shadowOffsetY(shadowOffsetY: number): this;
    shadowOpacity(): number;
    shadowOpacity(shadowOpacity: number): this;
    shadowBlur(): number;
    shadowBlur(blur: number): this;
    stroke(): string;
    stroke(stroke: string): this;
    strokeEnabled(): boolean;
    strokeEnabled(strokeEnabled: boolean): this;
    strokeScaleEnabled(): boolean;
    strokeScaleEnabled(strokeScaleEnabled: boolean): this;
    strokeHitEnabled(): boolean;
    strokeHitEnabled(strokeHitEnabled: boolean): this;
    strokeWidth(): number;
    strokeWidth(strokeWidth: number): this;
  }

  interface StageConfig extends ContainerConfig {
    container: any;
  }

  class Stage extends Container {
    constructor(StageConfig: StageConfig);
    add(...layers: Layer[]): this;
    add(...layers: FastLayer[]): this;
    batchDraw(): void;
    container(): HTMLElement;
    destroy(): void;
    drawHit(): void;
    getIntersection(pos: Vector2d, selector?: string): Shape;
    getLayers(): Layer[];
    getPointerPosition(): Vector2d;
    setContainer(con: HTMLElement): void;
    setHeight(height: number): void;
    setWidth(width: number): void;
  }

  interface LayerConfig extends ContainerConfig {
    clearBeforeDraw?: boolean;
    hitGraphEnabled?: boolean;
  }

  class FastLayer<T extends Node = Node> extends Container<T> {
    constructor(config?: LayerConfig);
    drawScene(): void;
    hitGraphEnabled(val: boolean): this;
    batchDraw(): void;
  }

  class Layer<T extends Node = Node> extends Container<T> {
    constructor(config?: LayerConfig);
    getIntersection(pos: Vector2d, selector?: string): Shape;
    enableHitGraph(): this;
    disableHitGraph(): this;
    clearBeforeDraw(): boolean;
    clearBeforeDraw(val: boolean): this;
    hitGraphEnabled(): boolean;
    hitGraphEnabled(val: boolean): this;
    batchDraw(): void;
    drawScene(): void;
  }

  class Group<T extends Node = Node> extends Container<T> {}

  interface CanvasConfig {
    width: number;
    height: number;
    pixelRatio: number;
  }

  class Canvas {
    constructor(CanvasConfig: CanvasConfig);
    getContext(): CanvasRenderingContext2D;
    getHeight(): number;
    getWidth(): number;
    getPixelRatio(): number;
    setHeight(val: number): void;
    setWidth(val: number): void;
    setPixelRatio(val: number): void;
    setSize(size: { width: number; height: number }): void;
    toDataURL(mimeType: string, quality: number): string;
    public _canvas: HTMLElement;
  }

  class Context {
    clear(bounds?: ClearConfig): Context;
    clearTrace(): void;
    fillShape(shape: Shape): void;
    fillStrokeShape(shape: Shape): void;
    getCanvas(): Canvas;
    getTrace(relaxed: boolean): string;
    reset(): void;
    setAttr(attr: string, value: any): void;
    strokeShape(shape: Shape): void;

    // context pass through methods
    // originally from lib.es6.d.ts
    arc(
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      endAngle: number,
      anticlockwise?: boolean
    ): void;
    beginPath(): void;
    bezierCurveTo(
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number
    ): void;
    clearRect(x: number, y: number, width: number, height: number): void;
    clip(): void;
    closePath(): void;
    createImageData(imageDataOrSw: number | ImageData, sh?: number): ImageData;
    createLinearGradient(
      x0: number,
      y0: number,
      x1: number,
      y1: number
    ): CanvasGradient;
    createPattern(
      image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
      repetition: string
    ): CanvasPattern;
    createRadialGradient(
      x0: number,
      y0: number,
      r0: number,
      x1: number,
      y1: number,
      r1: number
    ): CanvasGradient;
    drawImage(
      image:
        | HTMLImageElement
        | HTMLCanvasElement
        | HTMLVideoElement
        | ImageBitmap,
      dstX: number,
      dstY: number
    ): void;
    drawImage(
      image:
        | HTMLImageElement
        | HTMLCanvasElement
        | HTMLVideoElement
        | ImageBitmap,
      dstX: number,
      dstY: number,
      dstW: number,
      dstH: number
    ): void;
    drawImage(
      image:
        | HTMLImageElement
        | HTMLCanvasElement
        | HTMLVideoElement
        | ImageBitmap,
      srcX: number,
      srcY: number,
      srcW: number,
      srcH: number,
      dstX: number,
      dstY: number,
      dstW: number,
      dstH: number
    ): void;
    isPointInPath(x: number, y: number): boolean;
    fill(): void;
    fillRect(x: number, y: number, width: number, height: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    fillText(text: string, x: number, y: number): void;
    measureText(text: string): TextMetrics;
    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
    lineTo(x: number, y: number): void;
    moveTo(x: number, y: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    putImageData(imagedata: ImageData, dx: number, dy: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    restore(): void;
    rotate(angle: number): void;
    save(): void;
    scale(x: number, y: number): void;
    setLineDash(segments: number[]): void;
    getLineDash(): number[];
    setTransform(
      m11: number,
      m12: number,
      m21: number,
      m22: number,
      dx: number,
      dy: number
    ): void;
    stroke(path?: Path2D): void;
    strokeText(text: string, x: number, y: number): void;
    transform(
      m11: number,
      m12: number,
      m21: number,
      m22: number,
      dx: number,
      dy: number
    ): void;
    translate(x: number, y: number): void;
  }

  class Tween {
    constructor(params: any);
    destroy(): void;
    finish(): Tween;
    pause(): Tween;
    play(): Tween;
    reset(): Tween;
    reverse(): Tween;
    seek(t: number): Tween;
  }

  // Shapes

  interface RingConfig extends ShapeConfig {
    innerRadius: number;
    outerRadius: number;
    clockwise?: boolean;
  }

  class Ring extends Shape {
    constructor(RingConfig: RingConfig);
    innerRadius(): number;
    innerRadius(innerRadius: number): this;
    outerRadius(): number;
    outerRadius(outerRadius: number): this;
  }

  interface ArcConfig extends ShapeConfig {
    angle: number;
    innerRadius: number;
    outerRadius: number;
    clockwise?: boolean;
  }

  class Arc extends Shape {
    constructor(ArcConfig: ArcConfig);
    angle(): number;
    angle(angle: number): this;
    clockwise(): boolean;
    clockwise(clockwise: boolean): this;
    innerRadius(): number;
    innerRadius(innerRadius: number): this;
    outerRadius(): number;
    outerRadius(outerRadius: number): this;
  }

  interface CircleConfig extends ShapeConfig {
    radius: number;
  }

  class Circle extends Shape {
    constructor(CircleConfig: CircleConfig);
    radius(): number;
    radius(radius: number): this;
  }

  interface EllipseConfig extends ShapeConfig {
    radius: any;
  }

  class Ellipse extends Shape {
    constructor(EllipseConfig: EllipseConfig);
    radius(): any;
    radius(radius: any): this;
    radiusX(): number;
    radiusX(radiusX: number): this;
    radiusY(): number;
    radiusY(radiusY: number): this;
  }

  interface ImageConfig extends ShapeConfig {
    image: HTMLImageElement;
    crop?: SizeConfig;
  }

  class Image extends Shape {
    constructor(ImageConfig: ImageConfig);
    image(): HTMLImageElement;
    image(image: HTMLImageElement): this;
    crop(): SizeConfig;
    crop(crop: SizeConfig): this;
    cropX(): number;
    cropX(cropX: number): this;
    cropY(): number;
    cropY(cropY: number): this;
    cropWidth(): number;
    cropWidth(cropWidth: number): this;
    cropHeight(): number;
    cropHeight(cropHeight: number): this;
    static fromURL(url: string, callback: (image: Konva.Image) => void): void;
  }

  interface LineConfig extends ShapeConfig {
    points: number[];
    tension?: number;
    closed?: boolean;
    bezier?: boolean;
  }

  class Line extends Shape {
    constructor(LineConfig: LineConfig);
    closed(): boolean;
    closed(closed: boolean): this;
    tension(): number;
    tension(tension: number): this;
    points(): number[];
    points(points: number[]): this;
  }

  interface ArrowConfig extends ShapeConfig {
    points: number[];
    tension?: number;
    closed?: boolean;
    pointerLength?: number;
    pointerWidth?: number;
    pointerAtBeginning?: boolean;
  }

  class Arrow extends Shape {
    constructor(ArrowConfig: ArrowConfig);
    closed(): boolean;
    closed(closed: boolean): this;
    tension(): number;
    tension(tension: number): this;
    points(): number[];
    points(points: number[]): this;
    pointerLength(): Number;
    pointerLength(Length: Number): this;
    pointerWidth(): Number;
    pointerWidth(Width: Number): this;
    pointerAtBeginning(): boolean;
    pointerAtBeginning(Should: boolean): this;
  }

  interface RectConfig extends ShapeConfig {
    cornerRadius?: number;
  }

  class Rect extends Shape {
    constructor(RectConfig: RectConfig);
    cornerRadius(): number;
    cornerRadius(cornerRadius: number): this;
  }

  interface SpriteConfig extends ShapeConfig {
    animation: string;
    animations: any;
    frameIndex?: number;
    image: HTMLImageElement;
    frameRate?: number;
  }

  class Sprite extends Shape {
    constructor(SpriteConfig: SpriteConfig);
    start(): void;
    stop(): void;
    animation(): string;
    animation(val: string): this;
    animations(): any;
    animations(val: any): this;
    frameIndex(): number;
    frameIndex(val: number): this;
    image(): HTMLImageElement;
    image(image: HTMLImageElement): this;
    frameRate(): number;
    frameRate(frameRate: number): this;
  }

  interface TextConfig extends ShapeConfig {
    text: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    align?: string;
    verticalAlign?: string;
    padding?: number;
    lineHeight?: number;
    wrap?: string;
    ellipsis?: boolean;
  }

  class Text extends Shape {
    constructor(TextConfig: TextConfig);
    getTextWidth(): number;
    getTextHeight(): number;
    text(): string;
    text(text: string): this;
    fontFamily(): string;
    fontFamily(fontFamily: string): this;
    fontSize(): number;
    fontSize(fontSize: number): this;
    fontStyle(): string;
    fontStyle(fontStyle: string): this;
    fontVariant(): string;
    fontVariant(fontVariant: string): this;
    align(): string;
    align(align: string): this;
    verticalAlign(): string;
    verticalAlign(verticalAlign: string): this;
    padding(): number;
    padding(padding: number): this;
    lineHeight(): number;
    lineHeight(lineHeight: number): this;
    wrap(): string;
    wrap(wrap: string): this;
    textDecoration(): string;
    textDecoration(textDecoration: string): this;
  }

  interface WedgeConfig extends ShapeConfig {
    angle: number;
    radius: number;
    clockwise?: boolean;
  }

  class Wedge extends Shape {
    constructor(WedgeConfig: WedgeConfig);
    angle(): number;
    angle(angle: number): this;
    radius(): number;
    radius(radius: number): this;
    clockwise(): boolean;
    clockwise(clockwise: boolean): this;
  }

  // Plugins
  interface TagConfig extends ShapeConfig {
    pointerDirection?: string;
    pointerWidth?: number;
    pointerHeight?: number;
    cornerRadius?: number;
  }

  class Tag extends Shape {
    constructor(config: TagConfig);
    pointerDirection(): string;
    pointerDirection(pointerDirection: string): this;
    pointerWidth(): number;
    pointerWidth(pointerWidth: number): this;
    pointerHeight(): number;
    pointerHeight(pointerHeight: number): this;
    cornerRadius(): number;
    cornerRadius(cornerRadius: number): this;
  }

  interface LabelInterface extends ContainerConfig {}

  class Label extends Group<Shape> {
    constructor(LabelInterface: LabelInterface);
    getText(): Text;
    getTag(): Rect;
  }

  interface PathConfig extends ShapeConfig {
    data: string;
  }

  class Path extends Shape {
    constructor(PathConfig: PathConfig);
    data(): string;
    data(data: string): this;
  }

  interface RegularPolygonConfig extends ShapeConfig {
    sides: number;
    radius: number;
  }

  class RegularPolygon extends Shape {
    constructor(RegularPolygonConfig: RegularPolygonConfig);
    sides(): number;
    sides(sides: number): this;
    radius(): number;
    radius(radius: number): this;
  }

  interface StarConfig extends ShapeConfig {
    numPoints: number;
    innerRadius: number;
    outerRadius: number;
  }

  class Star extends Shape {
    constructor(StarConfig: StarConfig);
    numPoints(): number;
    numPoints(numPoints: number): this;
    innerRadius(): number;
    innerRadius(innerRadius: number): this;
    outerRadius(): number;
    outerRadius(outerRadius: number): this;
  }

  interface TextPathConfig extends ShapeConfig {
    text: string;
    data: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
  }

  class TextPath extends Shape {
    constructor(TextPathConfig: TextPathConfig);
    getTextWidth(): number;
    getTextHeight(): number;
    setText(text: string): void;
    text(): string;
    text(text: string): this;
    fontFamily(): string;
    fontFamily(fontFamily: string): this;
    fontSize(): number;
    fontSize(fontSize: number): this;
    fontStyle(): string;
    fontStyle(fontStyle: string): this;
  }

  class Collection<T extends Node = Node> {
    [i: number]: T;
    each(f: (el: T) => void): void;
    toArray(): T[];
    length: number;

    static toCollection<T extends Node = Node>(arr: T[]): Collection<T>;
  }

  class Transform {
    copy(): Transform;
    getMatrix(): number[];
    getTranslation(): Vector2d;
    invert(): Transform;
    multiply(matrix: number[]): Transform;
    point(point: Vector2d): Vector2d;
    rotate(deg: number): Transform;
    scale(x: number, y: Number): Transform;
    setAbsolutePosition(): Transform;
    skew(x: number, y: Number): Transform;
    translate(x: number, y: Number): Transform;
  }

  interface TransformerConfig extends ContainerConfig {
    resizeEnabled?: boolean;
    rotateEnabled?: boolean;
    rotationSnaps?: Array<number>;
    rotateAnchorOffset?: number;
    borderEnabled?: boolean;
    borderStroke?: string;
    borderStrokeWidth?: number;
    borderDash?: Array<number>;
    anchorFill?: string;
    anchorStroke?: string;
    anchorStrokeWidth?: number;
    anchorSize?: number;
    keepRatio?: boolean;
    centeredScaling?: boolean;
    enabledAnchors?: Array<string>;
    node?: Rect;
    boundBoxFunc?: (oldBox: SizeConfig, newBox: SizeConfig) => SizeConfig;
  }

  class Transformer extends Container {
    constructor(config?: TransformerConfig);
    attachTo(node: Node): void;
    setNode(node: Node): void;
    getNode(): Node;
    detach(): void;
    forceUpdate(): void;

    keepRatio(): boolean;
    keepRatio(enabled: boolean): this;
    keepRatio(): boolean;
    keepRatio(enabled: boolean): this;
    centeredScaling(): boolean;
    centeredScaling(enabled: boolean): this;
    rotateEnabled(): boolean;
    rotateEnabled(enabled: boolean): this;
    rotationSnaps(): Array<number>;
    rotationSnaps(snaps: Array<number>): this;
    rotateAnchorOffset(): number;
    rotateAnchorOffset(offset: number): this;
    borderEnabled(): boolean;
    borderEnabled(enabled: boolean): this;
    borderStroke(): string;
    borderStroke(color: string): this;
    borderStrokeWidth(): number;
    borderStrokeWidth(width: number): this;
    borderDash(): Array<number>;
    borderDash(snaps: Array<number>): this;
    anchorFill(): string;
    anchorFill(color: string): this;
    anchorStroke(): string;
    anchorStroke(color: string): this;
    anchorStrokeWidth(): number;
    anchorStrokeWidth(width: number): this;
    anchorSize(): number;
    anchorSize(width: number): this;
    enabledAnchors(): Array<string>;
    enabledAnchors(names: Array<string>): this;
  }

  interface Vector2d {
    x: number;
    y: number;
  }
}

export = Konva;
