import { KonvaEventObject } from './Node';
import { Konva } from './Global';

import { Shape } from './Shape';
import { Stage } from './Stage';

const Captures = new Map<number, Shape | Stage>();

// we may use this module for capturing touch events too
// so make sure we don't do something super specific to pointer
const SUPPORT_POINTER_EVENTS = Konva._global['PointerEvent'] !== undefined;

export interface KonvaPointerEvent extends KonvaEventObject<PointerEvent> {
  pointerId: number;
}

export function getCapturedShape(pointerId: number) {
  return Captures.get(pointerId);
}

export function createEvent(evt: PointerEvent): KonvaPointerEvent {
  return {
    evt,
    pointerId: evt.pointerId,
  } as any;
}

export function hasPointerCapture(pointerId: number, shape: Shape | Stage) {
  return Captures.get(pointerId) === shape;
}

export function setPointerCapture(pointerId: number, shape: Shape | Stage) {
  releaseCapture(pointerId);

  const stage = shape.getStage();
  if (!stage) return;

  Captures.set(pointerId, shape);

  if (SUPPORT_POINTER_EVENTS) {
    shape._fire(
      'gotpointercapture',
      createEvent(new PointerEvent('gotpointercapture'))
    );
  }
}

export function releaseCapture(pointerId: number, target?: Shape | Stage) {
  const shape = Captures.get(pointerId);

  if (!shape) return;

  const stage = shape.getStage();

  if (stage && stage.content) {
    // stage.content.releasePointerCapture(pointerId);
  }

  Captures.delete(pointerId);

  if (SUPPORT_POINTER_EVENTS) {
    shape._fire(
      'lostpointercapture',
      createEvent(new PointerEvent('lostpointercapture'))
    );
  }
}
