import { Konva } from './Global';
import { Node } from './Node';
import { Vector2d } from './types';
import { Util } from './Util';

export const DD = {
  get isDragging() {
    var flag = false;
    DD._dragElements.forEach((elem) => {
      if (elem.dragStatus === 'dragging') {
        flag = true;
      }
    });
    return flag;
  },
  justDragged: false,
  get node() {
    // return first dragging node
    var node: Node | undefined;
    DD._dragElements.forEach((elem) => {
      node = elem.node;
    });
    return node;
  },
  _dragElements: new Map<
    number,
    {
      node: Node;
      startPointerPos: Vector2d;
      offset: Vector2d;
      pointerId?: number;
      // when we just put pointer down on a node
      // it will create drag element
      dragStatus: 'ready' | 'dragging' | 'stopped';
      // dragStarted: boolean;
      // isDragging: boolean;
      // dragStopped: boolean;
    }
  >(),

  // methods
  _drag(evt) {
    const nodesToFireEvents: Array<Node> = [];
    DD._dragElements.forEach((elem, key) => {
      const { node } = elem;
      // we need to find pointer relative to that node
      const stage = node.getStage();
      stage.setPointersPositions(evt);

      // it is possible that user call startDrag without any event
      // it that case we need to detect first movable pointer and attach it into the node
      if (elem.pointerId === undefined) {
        elem.pointerId = Util._getFirstPointerId(evt);
      }
      const pos = stage._changedPointerPositions.find(
        (pos) => pos.id === elem.pointerId
      );

      // not related pointer
      if (!pos) {
        return;
      }
      if (elem.dragStatus !== 'dragging') {
        var dragDistance = node.dragDistance();
        var distance = Math.max(
          Math.abs(pos.x - elem.startPointerPos.x),
          Math.abs(pos.y - elem.startPointerPos.y)
        );
        if (distance < dragDistance) {
          return;
        }
        node.startDrag({ evt });
        // a user can stop dragging inside `dragstart`
        if (!node.isDragging()) {
          return;
        }
      }
      node._setDragPosition(evt, elem);
      nodesToFireEvents.push(node);
    });
    // call dragmove only after ALL positions are changed
    nodesToFireEvents.forEach((node) => {
      node.fire(
        'dragmove',
        {
          type: 'dragmove',
          target: node,
          evt: evt,
        },
        true
      );
    });
  },

  // dragBefore and dragAfter allows us to set correct order of events
  // setup all in dragbefore, and stop dragging only after pointerup triggered.
  _endDragBefore(evt?) {
    const drawNodes = [];
    DD._dragElements.forEach((elem) => {
      const { node } = elem;
      // we need to find pointer relative to that node
      const stage = node.getStage();
      if (evt) {
        stage.setPointersPositions(evt);
      }

      const pos = stage._changedPointerPositions.find(
        (pos) => pos.id === elem.pointerId
      );

      // that pointer is not related
      if (!pos) {
        return;
      }

      if (elem.dragStatus === 'dragging' || elem.dragStatus === 'stopped') {
        // if a node is stopped manually we still need to reset events:
        DD.justDragged = true;
        Konva._mouseListenClick = false;
        Konva._touchListenClick = false;
        Konva._pointerListenClick = false;
        elem.dragStatus = 'stopped';
      }

      const drawNode =
        elem.node.getLayer() ||
        ((elem.node instanceof Konva['Stage'] && elem.node) as any);

      if (drawNode && drawNodes.indexOf(drawNode) === -1) {
        drawNodes.push(drawNode);
      }
    });
    // draw in a sync way
    // because mousemove event may trigger BEFORE batch draw is called
    // but as we have not hit canvas updated yet, it will trigger incorrect mouseover/mouseout events
    drawNodes.forEach((drawNode) => {
      drawNode.draw();
    });
  },
  _endDragAfter(evt) {
    DD._dragElements.forEach((elem, key) => {
      if (elem.dragStatus === 'stopped') {
        elem.node.fire(
          'dragend',
          {
            type: 'dragend',
            target: elem.node,
            evt: evt,
          },
          true
        );
      }
      if (elem.dragStatus !== 'dragging') {
        DD._dragElements.delete(key);
      }
    });
  },
};

export const registerDragAndDropListenersForWindowGlobal = (windowGlobal: Window) => {
  if (Konva.isBrowser) {
    (windowGlobal as any).console.log('registering events');
    // Remove them all first in case this is a duplicate call with the same
    // windowGlobal. If this is the first call, this will be a noop. This is to
    // avoid a situation where we're storing multiple Window handles and
    // possibly introducing a memory leak.
    windowGlobal.removeEventListener('mouseup', DD._endDragBefore, true);
    windowGlobal.removeEventListener('touchend', DD._endDragBefore, true);
    windowGlobal.removeEventListener('mousemove', DD._drag);
    windowGlobal.removeEventListener('touchmove', DD._drag);
    windowGlobal.removeEventListener('mouseup', DD._endDragAfter, false);
    windowGlobal.removeEventListener('touchend', DD._endDragAfter, false);

    // Go ahead and actually set up the listeners.
    windowGlobal.addEventListener('mouseup', DD._endDragBefore, true);
    windowGlobal.addEventListener('touchend', DD._endDragBefore, true);
    windowGlobal.addEventListener('mousemove', DD._drag);
    windowGlobal.addEventListener('touchmove', DD._drag);
    windowGlobal.addEventListener('mouseup', DD._endDragAfter, false);
    windowGlobal.addEventListener('touchend', DD._endDragAfter, false);
  }
}
