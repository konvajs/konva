declare module Konva {

    var pixelRatio: number;
    var dragDistance: number;
    var isDragging: () => boolean;
    var isDragReady: () => boolean;
    var DD: any;

    export class Util {
        static getRandomColor(): string;
        static getRGB(color: string): string;
    }

    export class Easings {
        static BackEaseIn(): any;
        static BackEaseInOut(): any;
        static BackEaseOut(): any;
        static BounceEaseIn(): any;
        static BounceEaseInOut(): any;
        static BounceEaseOut(): any;
        static EaseIn(): any;
        static EaseInOut(): any;
        static EaseOut(): any;
        static ElasticEaseIn(): any;
        static ElasticEaseInOut(): any;
        static ElasticEaseOut(): any;
        static Linear(): any;
        static StrongEaseIn(): any;
        static StrongEaseInOut(): any;
        static StrongEaseOut(): any;
    }

    class Filter {
    }

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
        dragBoundFunc?: Function;
    }

    interface SizeConfig {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }

    interface ToDataURLConfig extends SizeConfig {
        callback: Function;
        mimeType?: string;
        quality?: number;
    }

    interface CacheConfig extends SizeConfig {
        drawBorder?: boolean;
    }

    interface ClearConfig extends SizeConfig {
    }

    class Node {
        constructor(config: NodeConfig);
        static create<T>(data: any, container?: HTMLElement): T;

        blue(): number;
        blue(blue: number): Node;
        brightness(): number;
        brightness(brightness: number): Node;
        blurRadius(): number;
        blurRadius(radius: number): Node;
        cache(config?: CacheConfig): Node;
        clearCache(): Node;
        clear(bounds?: ClearConfig): Node;
        clone(attrs?: NodeConfig): Node;
        destroy(): void;

        dragBoundFunc(): Function;
        dragBoundFunc(dragBoundFunc: Function): Node;
        draggable(): boolean;
        draggable(draggable: boolean): Node;
        draw(): Node;
        embossBlend(): boolean;
        embossBlend(embossBlend: boolean): Node;
        embossDirection(): string;
        embossDirection(embossDirection: string): Node;
        embossStrength(): number;
        embossStrength(level: number): Node;
        embossWhiteLevel(): number;
        embossWhiteLevel(embossWhiteLevel: number): Node;
        enhance(): number;
        enhance(enhance: number): Node;
        filters(): Filter[];
        filters(filters: Filter): Node;
        fire(eventType: string, evt?: any, bubble?: boolean): Node;
        getAbsoluteOpacity(): number;
        getAbsolutePosition(): Vector2d;
        getAbsoluteTransform(): Transform;
        getAbsoluteZIndex(): number;
        getAncestors(): Collection;
        getAttr(attr: string): any;
        getAttrs(): NodeConfig;
        // CHECK
        getCanvas(): Canvas;
        getClassName(): string;
        getClientRect(): SizeConfig;
        getContext(): Context;
        getDepth(): number;
        getHeight(): number;
        getHitCanvas(): Canvas;
        getLayer(): Layer;
        getParent(): Container;
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
        green(green: number): Node;
        height(): number;
        height(height: number): Node;
        hide(): void;
        hue(): number;
        hue(hue: number): Node;
        id(): string;
        id(id: string): Node;
        isDragging(): boolean;
        isListening(): boolean;
        isVisible(): boolean;
        kaleidoscopeAngle(): number;
        kaleidoscopeAngle(kaleidoscopeAngle: number): Node;
        kaleidoscopePower(): number;
        kaleidoscopePower(kaleidoscopePower: number): Node;
        levels(): number;
        levels(levels: number): Node;
        listening(): any;
        listening(listening: boolean): Node;
        listening(listening: string): Node;
        move(move: Vector2d): Node;
        moveDown(): boolean;
        moveTo(newContainer: Container): Node;
        moveToBottom(): boolean;
        moveToTop(): boolean;
        moveUp(): boolean;
        name(): string;
        name(name: string): Node;
        noise(): number;
        noise(noise: number): Node;
        off(evtStr: string): Node;
        offset(): Vector2d;
        offset(offset: Vector2d): Node;
        offsetX(): number;
        offsetX(offsetX: number): Node;
        offsetY(): number;
        offsetY(offsetY: number): Node;
        on(evtStr: string, handler: Function): Node;
        opacity(): number;
        opacity(opacity: number): Node;
        pixelSize(): number;
        pixelSize(pixelSize: number): Node;
        position(): Vector2d;
        position(position: Vector2d): Node;
        preventDefault(): boolean;
        preventDefault(preventDefault: boolean): Node;
        red(): number;
        red(red: number): Node;
        remove(): Node;
        rotate(theta: number): Node;
        rotation(): number;
        rotation(rotation: number): Node;
        saturation(): number;
        saturation(saturation: number): Node;
        scale(): Vector2d;
        scale(scale: Vector2d): Node;
        scaleX(): number;
        scaleX(scaleX: number): Node;
        scaleY(): number;
        scaleY(scaleY: number): Node;
        setAbsolutePosition(pos: Vector2d): Node;
        setAttr(attr: string, val: any): Node;
        setAttrs(attrs: NodeConfig): void;
        setId(id: string): Node;
        setSize(size: { width: number; height: number }): Node;
        setZIndex(zIndex: number): void;
        shouldDrawHit(): boolean;
        show(): Node;
        skew(): Vector2d;
        skew(skew: Vector2d): Node;
        skewX(): number;
        skewX(skewX: number): Node;
        skewY(): number;
        skewY(skewY: number): Node;
        startDrag(): void;
        stopDrag(): void;
        threshold(): number;
        threshold(threshold: number): Node;
        toDataURL(config: ToDataURLConfig): string;
        toImage(config: ToDataURLConfig): HTMLImageElement;
        toJSON(): string;
        toObject(): any;
        transformsEnabled(): string;
        transformsEnabled(transformsEnabled: string): Node;
        value(): number;
        value(value: number): Node;
        visible(): any;
        visible(visible: boolean): Node;
        visible(visible: string): Node;
        width(): number;
        width(width: number): Node;
        x(): number;
        x(x: number): Node;
        y(): number;
        y(y: number): Node;
    }

    interface ContainerConfig extends NodeConfig {
        clearBeforeDraw?: boolean;
        clipFunc?: (ctx: CanvasRenderingContext2D) => void;
    }

    class Container extends Node {
        constructor(params?: ContainerConfig);
        add(child: Node): Container;
        getChildren(filterfunc?: Function): Collection;
        clip(): SizeConfig;
        clip(clip: SizeConfig): Container;
        clipHeight(): number;
        clipHeight(clipHeight: number): Container;
        clipWidth(): number;
        clipWidth(clipWidth: number): Container;
        clipX(): number;
        clipX(clipX: number): Container;
        clipY(): number;
        clipY(clipY: number): Container;
        clipFunc(): (ctx: CanvasRenderingContext2D) => void;
        clipFunc(ctx: CanvasRenderingContext2D): void;
        destroyChildren(): void;
        find(selector?: string): Collection;
        getAllIntersections(pos: Vector2d): Node[];
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
        fillLinearRadialStartPoint?: Vector2d;
        fillLinearRadialStartPointX?: number;
        fillLinearRadialStartPointY?: number;
        fillLinearRadialEndPoint?: Vector2d;
        fillLinearRadialEndPointX?: number;
        fillLinearRadialEndPointY?: number;
        fillRadialGradientStartRadius?: number;
        fillRadialGradientEndRadius?: number;
        fillRadialGradientColorStops?: Array<number | string>;
        fillEnabled?: boolean;
        fillPriority?: string;
        stroke?: string;
        strokeWidth?: number;
        strokeScaleEnabled?: boolean;
        strokeEnabled?: boolean;
        lineJoin?: string;
        lineCap?: string;
        sceneFunc?: (con: Context) => void;
        hitFunc?: (con: Context) => void;
        drawFunc?: (con: Context) => void;
        shadowColor?: string;
        shadowBlur?: number;
        shadowOffset?: Vector2d;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        shadowOpacity?: number;
        shadowEnabled?: boolean;
        dash?: number[];
        dashEnabled?: boolean;
    }

    class Shape extends Node {
        constructor(ShapeConfig: ShapeConfig);
        dash(): number[];
        dash(dash: number[]): Shape;
        dashEnabled(): boolean;
        dashEnabled(dashEnabled: boolean): Shape;
        drawHitFromCache(alphaThreshold: number): Shape;
        fill(): string;
        fill(fill: string): Shape;
        fillEnabled(): boolean;
        fillEnabled(fillEnabled: boolean): Shape;
        fillLinearGradientColorStops(): Array<number | string>;
        fillLinearGradientColorStops(colors: Array<number | string>): Shape;
        fillLinearGradientStartPoint(): Vector2d;
        fillLinearGradientStartPoint(point: Vector2d): Vector2d;
        fillLinearGradientStartPointX(): number;
        fillLinearGradientStartPointX(x: number): Shape;
        fillLinearGradientStartPointY(): number;
        fillLinearGradientStartPointY(y: number): Shape;
        fillLinearGradientEndPoint(): Vector2d;
        fillLinearGradientEndPoint(point: Vector2d): Shape;
        fillLinearGradientEndPointX(): number;
        fillLinearGradientEndPointX(x: number): Shape;
        fillLinearGradientEndPointY(): number;
        fillLinearGradientEndPointY(y: number): Shape;
        fillLinearRadialStartPoint(): Vector2d;
        fillLinearRadialStartPoint(point: Vector2d): Shape;
        fillLinearRadialStartPointX(): number;
        fillLinearRadialStartPointX(x: number): Shape;
        fillLinearRadialStartPointY(): number;
        fillLinearRadialStartPointY(y: number): Shape;
        fillLinearRadialEndPoint(): Vector2d;
        fillLinearRadialEndPoint(point: Vector2d): Vector2d;
        fillLinearRadialEndPointX(): number;
        fillLinearRadialEndPointX(x: number): Shape;
        fillLinearRadialEndPointY(): number;
        fillLinearRadialEndPointY(y: number): Shape;
        fillPatternImage(): HTMLImageElement;
        fillPatternImage(image: HTMLImageElement): Shape;
        fillRadialGradientStartRadius(): number;
        fillRadialGradientStartRadius(radius: number): Shape;
        fillRadialGradientEndRadius(): number;
        fillRadialGradientEndRadius(radius: number): Shape;
        fillRadialGradientColorStops(): Array<number | string>;
        fillRadialGradientColorStops(color: Array<number | string>): Shape;
        fillPatternOffset(): Vector2d;
        fillPatternOffset(offset: Vector2d): Shape;
        fillPatternOffsetX(): number;
        fillPatternOffsetX(x: number): Shape;
        fillPatternOffsetY(): number;
        fillPatternOffsetY(y: number): Shape;
        fillPatternRepeat(): string;
        fillPatternRepeat(repeat: string): Shape;
        fillPatternRotation(): number;
        fillPatternRotation(rotation: number): Shape;
        fillPatternScale(): Vector2d;
        fillPatternScale(scale: Vector2d): Shape;
        fillPatternScaleX(): number;
        fillPatternScaleX(x: number): Shape;
        fillPatternScaleY(): number;
        fillPatternScaleY(y: number): Shape;
        fillPatternX(): number;
        fillPatternX(x: number): number;
        fillPatternY(): number;
        fillPatternY(y: number): Shape;
        fillPriority(): string;
        fillPriority(priority: string): Shape;
        hasFill(): boolean;
        hasShadow(): boolean;
        hasStroke(): boolean;
        hitFunc(): Function;
        hitFunc(func: Function): Shape;
        intersects(point: Vector2d): boolean;
        lineCap(): string;
        lineCap(lineCap: string): Shape;
        lineJoin(): string;
        lineJoin(lineJoin: string): Shape;
        sceneFunc(): Function;
        sceneFunc(func: (con: Context) => {}): Shape;
        shadowColor(): string;
        shadowColor(shadowColor: string): Shape;
        shadowEnabled(): boolean;
        shadowEnabled(shadowEnabled: boolean): Shape;
        shadowOffset(): Vector2d;
        shadowOffset(shadowOffset: Vector2d): Shape;
        shadowOffsetX(): number;
        shadowOffsetX(shadowOffsetX: number): Shape;
        shadowOffsetY(): number;
        shadowOffsetY(shadowOffsetY: number): Shape;
        shadowOpacity(): number;
        shadowOpacity(shadowOpacity: number): Shape;
        shadowBlur(): number;
        shadowBlur(blur: number): Shape;
        stroke(): string;
        stroke(stroke: string): Shape;
        strokeEnabled(): boolean;
        strokeEnabled(strokeEnabled: boolean): Shape;
        strokeScaleEnabled(): boolean;
        strokeScaleEnabled(strokeScaleEnabled: boolean): Shape;
        strokeHitEnabled(): boolean;
        strokeHitEnabled(strokeHitEnabled: boolean): Shape;
        strokeWidth(): number;
        strokeWidth(strokeWidth: number): Shape;
    }

    interface StageConfig extends ContainerConfig {
        container: any;
    }

    class Stage extends Container {
        constructor(StageConfig: StageConfig);
        add(layer: Layer): Stage;
        add(layer: FastLayer): Stage;
        batchDraw(): void;
        container(): HTMLElement;
        destroy(): void;
        drawHit(): void;
        getIntersection(pos: Vector2d): Shape;
        getLayers(): Layer[];
        getPointerPosition(): Vector2d;
        setContainer(con: HTMLElement): void;
        setHeight(height: number): void;
        setWidth(width: number): void;
    }

    interface LayerConfig extends ContainerConfig {
        clearBeforeDraw?: boolean;
    }

    class FastLayer extends Container {
        constructor (config?: ContainerConfig);
        drawScene(): void;
        hitGraphEnabled(val: boolean): FastLayer;
        batchDraw(): void;
    }

    class Layer extends Container {
        constructor(config?: LayerConfig);
        getIntersection(pos: Vector2d): Shape;
        enableHitGraph(): Layer;
        disableHitGraph(): Layer;
        clearBeforeDraw(): boolean;
        clearBeforeDraw(val: boolean): Layer;
        hitGraphEnabled(): boolean;
        hitGraphEnabled(val: boolean): Layer;
        batchDraw(): void;
        drawScene(): void;
    }

    class Group extends Container {

    }

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
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        beginPath(): void;
        setAttr(attr: string, value: any): void;
        closePath(): void;
        strokeShape(shape: Shape): void;
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
        innerRadius(innerRadius: number): Ring;
        outerRadius(): number;
        outerRadius(outerRadius: number): Ring;
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
        angle(angle: number): Ring;
        clockwise(): boolean;
        clockwise(clockwise: boolean): Arc;
        innerRadius(): number;
        innerRadius(innerRadius: number): Arc;
        outerRadius(): number;
        outerRadius(outerRadius: number): Arc;
    }

    interface CircleConfig extends ShapeConfig {
        radius: number;
    }

    class Circle extends Shape {
        constructor(CircleConfig: CircleConfig);
        radius(): number;
        radius(radius: number): Circle;
    }

    interface EllipseConfig extends ShapeConfig {
        radius: any;
    }

    class Ellipse extends Shape {
        constructor(EllipseConfig: EllipseConfig);
        radius(): any;
        radius(radius: any): Ellipse;
        radiusX(): number;
        radiusX(radiusX: number): Ellipse;
        radiusY(): number;
        radiusY(radiusY: number): Ellipse;
    }

    interface ImageConfig extends ShapeConfig {
        image: HTMLImageElement;
        crop?: SizeConfig;
    }

    class Image extends Shape {
        constructor(ImageConfig: ImageConfig);
        image(): HTMLImageElement;
        image(image: HTMLImageElement): Image;
        crop(): SizeConfig;
        crop(crop: SizeConfig): Image;
        cropX(): number;
        cropX(cropX: number): Image;
        cropY(): number;
        cropY(cropY: number): Image;
        cropWidth(): number;
        cropWidth(cropWidth: number): Image;
        cropHeight(): number;
        cropHeight(cropHeight: number): Image;
    }

    interface LineConfig extends ShapeConfig {
        points: number[];
        tension?: number;
        closed?: boolean;
    }

    class Line extends Shape {
        constructor(LineConfig: LineConfig);
        closed(): boolean;
        closed(closed: boolean): Line;
        tension(): number;
        tension(tension: number): Line;
        points(): number[];
        points(points: number[]): Line;
    }

    interface ArrowConfig extends ShapeConfig {
        points: number[];
        tension?: number;
        closed?: boolean;
        pointerLength?: number;
        pointerWidth?: number;
    }

    class Arrow extends Shape {
        constructor(ArrowConfig: ArrowConfig);
        closed(): boolean;
        closed(closed: boolean): Arrow;
        tension(): number;
        tension(tension: number): Arrow;
        points(): number[];
        points(points: number[]): Arrow;
        pointerLength(): Number;
        pointerLength(Length: Number): Number;
        pointerWidth(): Number;
        pointerWidth(Width: Number): Number;
    }

    interface RectConfig extends ShapeConfig {
        cornerRadius?: number;
    }

    class Rect extends Shape {
        constructor(RectConfig: RectConfig);
        cornerRadius(): number;
        cornerRadius(cornerRadius: number): Rect;
    }

    interface SpriteConfig extends ShapeConfig {
        animation: string;
        animations: any;
        frameIndex?: number;
        image: HTMLImageElement;
    }

    class Sprite extends Shape {
        constructor(SpriteConfig: SpriteConfig);
        start(): void;
        stop(): void;
        animation(): string;
        animation(val: string): Sprite;
        animations(): any;
        animations(val: any): Sprite;
        frameIndex(): number;
        frameIndex(val: number): Sprite;
        image(): HTMLImageElement;
        image(image: HTMLImageElement): Sprite;
        frameRate(): number;
        frameRate(frameRate: number): Sprite;
    }

    interface TextConfig extends ShapeConfig {
        text: string;
        fontFamily?: string;
        fontSize?: number;
        fontStyle?: string;
        align?: string;
        padding?: number;
        lineHeight?: number;
        wrap?: string;
    }

    class Text extends Shape {
        constructor(TextConfig: TextConfig);
        getTextWidth(): number;
        getTextHeight(): number;
        text(): string;
        text(text: string): Text;
        fontFamily(): string;
        fontFamily(fontFamily: string): Text;
        fontSize(): number;
        fontSize(fontSize: number): Text;
        fontStyle(): string;
        fontStyle(fontStyle: string): Text;
        fontVariant(): string;
        fontVariant(fontVariant: string): Text;
        align(): string;
        align(align: string): Text;
        padding(): number;
        padding(padding: number): Text;
        lineHeight(): number;
        lineHeight(lineHeight: number): Text;
        wrap(): string;
        wrap(wrap: string): Text;
    }

    interface WedgeConfig extends ShapeConfig {
        angle: number;
        radius: number;
        clockwise?: boolean;
    }

    class Wedge extends Shape {
        constructor(WedgeConfig: WedgeConfig);
        angle(): number;
        angle(angle: number): Wedge;
        radius(): number;
        radius(radius: number): Wedge;
        clockwise(): boolean;
        clockwise(clockwise: boolean): Wedge;
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
        pointerDirection(pointerDirection: string): Tag;
        pointerWidth(): number;
        pointerWidth(pointerWidth: number): Tag;
        pointerHeight(): number;
        pointerHeight(pointerHeight: number): Tag;
        cornerRadius(): number;
        cornerRadius(cornerRadius: number): Tag;
    }


    interface LabelInterface extends ContainerConfig {
    }

    class Label extends Group {
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
        data(data: string): Path;
    }

    interface RegularPolygonConfig extends ShapeConfig {
        sides: number;
        radius: number;
    }

    class RegularPolygon extends Shape {
        constructor(RegularPolygonConfig: RegularPolygonConfig);
        sides(): number;
        sides(sides: number): RegularPolygon;
        radius(): number;
        radius(radius: number): RegularPolygon;
    }

    interface StarConfig extends ShapeConfig {
        numPoints: number;
        innerRadius: number;
        outerRadius: number;
    }

    class Star extends Shape {
        constructor(StarConfig: StarConfig);
        numPoints(): number;
        numPoints(numPoints: number): Star;
        innerRadius(): number;
        innerRadius(innerRadius: number): Star;
        outerRadius(): number;
        outerRadius(outerRadius: number): Star;
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
        text(text: string): Path;
        fontFamily(): string;
        fontFamily(fontFamily: string): Path;
        fontSize(): number;
        fontSize(fontSize: number): Path;
        fontStyle(): string;
        fontStyle(fontStyle: string): Path;
    }


    class Collection {
        [i: number]: any;
        static toCollection(arr: any[]): Collection;
        each(f: (el: Node) => void): void;
        toArray(): any[];
        length: number;
    }

    class Transform {
        copy(): Transform;
        getMatrix(): any[];
        getTranslation(): Vector2d;
        invert(): void;
        multiply(matrix: any[]): void;
        point(point: Vector2d): Vector2d;
        rotate(deg: number): void;
        scale(x: number, y: Number): void;
        setAbsolutePosition(): void;
        skew(x: number, y: Number): void;
        translate(x: number, y: Number): void;
    }


    interface Vector2d {
        x: number;
        y: number;
    }
}

export = Konva;
