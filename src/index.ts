import * as KonvaInternals from './internals';

const Konva: any = KonvaInternals;

Konva.enableTrace = false;
Konva.traceArrMax = 100;
Konva.listenClickTap = false;
Konva.inDblClickWindow = false;

/**
 * Global pixel ratio configuration. KonvaJS automatically detect pixel ratio of current device.
 * But you may override such property, if you want to use your value.
 * @property pixelRatio
 * @default undefined
 * @name pixelRatio
 * @memberof Konva
 * @example
 * Konva.pixelRatio = 1;
 */
Konva.pixelRatio = undefined;

/**
 * Drag distance property. If you start to drag a node you may want to wait until pointer is moved to some distance from start point,
 * only then start dragging. Default is 3px.
 * @property dragDistance
 * @default 0
 * @memberof Konva
 * @example
 * Konva.dragDistance = 10;
 */
Konva.dragDistance = 3;
/**
 * Use degree values for angle properties. You may set this property to false if you want to use radiant values.
 * @property angleDeg
 * @default true
 * @memberof Konva
 * @example
 * node.rotation(45); // 45 degrees
 * Konva.angleDeg = false;
 * node.rotation(Math.PI / 2); // PI/2 radian
 */
Konva.angleDeg = true;
/**
 * Show different warnings about errors or wrong API usage
 * @property showWarnings
 * @default true
 * @memberof Konva
 * @example
 * Konva.showWarnings = false;
 */
Konva.showWarnings = true;

Konva.glob.Konva = Konva;

export default KonvaInternals;
