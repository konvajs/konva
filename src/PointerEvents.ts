import type { KonvaEventObject, Node } from './Node.ts';
import { Konva } from './Global.ts';

import type { Shape } from './Shape.ts';
import type { Stage } from './Stage.ts';

const Captures = new Map<number, { shape: Shape | Stage; stage: Stage }>();

// we may use this module for capturing touch events too
// so make sure we don't do something super specific to pointer
const SUPPORT_POINTER_EVENTS = Konva._global['PointerEvent'] !== undefined;

export interface KonvaPointerEvent extends KonvaEventObject<PointerEvent> {
  pointerId: number;
}

export function getCapturedShape(pointerId: number, stage?: Stage) {
  const capture = Captures.get(pointerId);
  return capture && (!stage || capture.stage === stage)
    ? capture.shape
    : undefined;
}

export function createEvent(evt: PointerEvent): KonvaPointerEvent {
  return {
    evt,
    pointerId: evt.pointerId,
  } as any;
}

export function hasPointerCapture(pointerId: number, shape: Shape | Stage) {
  return Captures.get(pointerId)?.shape === shape;
}

export function setPointerCapture(pointerId: number, shape: Shape | Stage) {
  releaseCapture(pointerId);

  const stage = shape.getStage();
  if (!stage) return;

  // Native capture belongs to this stage even if the shape is reparented.
  Captures.set(pointerId, { shape, stage });

  if (SUPPORT_POINTER_EVENTS) {
    // capture on the DOM level too, so the stage keeps receiving the events
    // of that pointer even when it moves outside of the stage container
    // https://github.com/konvajs/konva/issues/1992
    try {
      stage.content?.setPointerCapture(pointerId);
    } catch (e) {
      // capture is possible only for an active pointer;
      // ids of mouse and touch events (999 and touch identifiers) and
      // programmatic calls outside of a pointer event land here
    }
    shape._fire(
      'gotpointercapture',
      createEvent(new PointerEvent('gotpointercapture'))
    );
  }
}

// Destroying either the captured node or its native stage ends capture.
export function releaseCapturesOf(node: Node) {
  Captures.forEach(({ shape, stage }, pointerId) => {
    if (shape === node || stage === node) {
      releaseCapture(pointerId);
    }
  });
}

export function releaseCapture(pointerId: number, target?: Shape | Stage) {
  const capture = Captures.get(pointerId);

  // a node can only release its own capture
  if (!capture || (target && capture.shape !== target)) return;

  const { shape, stage } = capture;

  Captures.delete(pointerId);

  if (SUPPORT_POINTER_EVENTS) {
    try {
      stage?.content?.releasePointerCapture(pointerId);
    } catch (e) {
      // same as in setPointerCapture: the pointer may not be active
    }
    shape._fire(
      'lostpointercapture',
      createEvent(new PointerEvent('lostpointercapture'))
    );
  }
}
