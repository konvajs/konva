export * from './Global';

export { Collection, Util } from './Util';
export { Node, ids, names } from './Node';
export { Container } from './Container';

export { Stage, stages } from './Stage';

export { Layer } from './Layer';
export { FastLayer } from './FastLayer';

export { Group } from './Group';

import { DD as dd } from './DragAndDrop';

export const DD = dd;
export { Shape, shapes } from './Shape';

export { Animation } from './Animation';
export { Tween, Easings } from './Tween';

export const enableTrace = false;

// TODO: move that to stage?
export const listenClickTap = false;
export const inDblClickWindow = false;

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
export const pixelRatio = undefined;

/**
 * Drag distance property. If you start to drag a node you may want to wait until pointer is moved to some distance from start point,
 * only then start dragging. Default is 3px.
 * @property dragDistance
 * @default 0
 * @memberof Konva
 * @example
 * Konva.dragDistance = 10;
 */
export const dragDistance = 3;
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
export const angleDeg = true;
/**
 * Show different warnings about errors or wrong API usage
 * @property showWarnings
 * @default true
 * @memberof Konva
 * @example
 * Konva.showWarnings = false;
 */
export const showWarnings = true;

/**
 * Configure what mouse buttons can be used for drag and drop.
 * Default value is [0] - only left mouse button.
 * @property dragButtons
 * @default true
 * @memberof Konva
 * @example
 * // enable left and right mouse buttons
 * Konva.dragButtons = [0, 2];
 */
export const dragButtons = [0, 1];

/**
 * returns whether or not drag and drop is currently active
 * @method
 * @memberof Konva
 */
export const isDragging = function() {
  return dd.isDragging;
};
/**
 * returns whether or not a drag and drop operation is ready, but may
 *  not necessarily have started
 * @method
 * @memberof Konva
 */
export const isDragReady = function() {
  return !!dd.node;
};
