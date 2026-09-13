import type { Container } from './Container.ts';
import { Konva } from './Global.ts';
import type { Node } from './Node.ts';
import type { Stage } from './Stage.ts';
import type { Vector2d } from './types.ts';
import { Util } from './Util.ts';

type DragElement = {
  node: Node;
  startPointerPos: Vector2d;
  offset: Vector2d;
  pointerId?: number;
  pointerEventType?: Stage['_pointerEventType'];
  // the last bounded position, to skip a move to the same place
  lastPos?: Vector2d;
  startEvent?: any;
  // when we just put pointer down on a node
  // it will create drag element
  dragStatus: 'ready' | 'dragging' | 'stopped';
};

export const DD = {
  get isDragging() {
    let flag = false;
    DD._dragElements.forEach((elem) => {
      if (elem.dragStatus === 'dragging') {
        flag = true;
      }
    });
    return flag;
  },
  get node() {
    let node: Node | undefined;
    for (const elem of DD._dragElements.values()) {
      if (elem.dragStatus === 'dragging') return elem.node;
      node = elem.node;
    }
    // isDragReady() also uses this getter before movement starts.
    return node;
  },
  _dragElements: new Map<number, DragElement>(),

  // Konva is imported into one window, but a stage may be rendered in another
  // one: an iframe, or a window opened with `window.open`. Such a window sends
  // its pointer events to itself, so `Konva.Stage` asks for every window it is
  // rendered in. The handlers get the window they listen to, as only that
  // window has pointer positions the stages of that window can use
  _listenToWindow(win: Window) {
    const endDragBefore = (evt) => DD._endDragBefore(evt, win);
    const drag = (evt) => DD._batchEvents(() => DD._drag(evt, win), win);
    const endDragAfter = (evt) => DD._batchEvents(() => DD._endDragAfter(evt));

    win.addEventListener('mouseup', endDragBefore, true);
    win.addEventListener('touchend', endDragBefore, true);
    // add touchcancel to fix this: https://github.com/konvajs/konva/issues/1843
    win.addEventListener('touchcancel', endDragBefore, true);

    win.addEventListener('mousemove', drag);
    win.addEventListener('touchmove', drag);

    win.addEventListener('mouseup', endDragAfter, false);
    win.addEventListener('touchend', endDragAfter, false);
    win.addEventListener('touchcancel', endDragAfter, false);
  },

  _batchEvents(callback: () => void, win?: Window) {
    if (!DD._dragElements.size) return;
    // One scope per integration, even when several stages use the same callback.
    // Keep all positions and handlers in the original order across those stages.
    const batches = new Set<(callback: () => void) => void>();
    for (const { node } of DD._dragElements.values()) {
      const stage = node.getStage();
      if (!stage || (win && stage._getOwnerWindow() !== win)) continue;
      const batch = stage.eventBatchFunc();
      if (batch) batches.add(batch);
    }
    let run = callback;
    for (const batch of batches) {
      const next = run;
      run = () => Util._batchEvents(batch, next);
    }
    run();
  },

  // methods
  _drag(evt, win?: Window) {
    const nodesToFireEvents: Array<Node> = [];
    // reading the positions forces a layout, so do it once per stage
    const positioned = new Set<Stage>();
    DD._dragElements.forEach((elem, key) => {
      const { node } = elem;
      // we need to find pointer relative to that node
      const stage = node.getStage()!;
      // a pointer position of another window is relative to another viewport,
      // it would drag the node to a random place
      if (win && stage._getOwnerWindow() !== win) {
        return;
      }
      if (!positioned.has(stage)) {
        stage.setPointersPositions(evt);
        positioned.add(stage);
      }
      if (
        elem.pointerEventType &&
        elem.pointerEventType !== stage._pointerEventType
      ) {
        return;
      }

      // it is possible that user call startDrag without any event
      // it that case we need to detect first movable pointer and attach it into the node
      if (elem.pointerId === undefined) {
        elem.pointerId = Util._getFirstPointerId(evt);
        elem.pointerEventType = stage._pointerEventType;
        if (elem.dragStatus === 'dragging') {
          stage._cancelClick(elem.pointerId, elem.pointerEventType);
        }
      }
      const pos = stage._changedPointerPositions.find(
        (pos) => pos.id === elem.pointerId
      );

      // not related pointer
      if (!pos) {
        return;
      }
      if (elem.dragStatus !== 'dragging') {
        const dragDistance = node.dragDistance();
        const distance = Math.max(
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
      // node may have been destroyed during a previous dragmove handler
      if (!node.getStage()) {
        return;
      }
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
  _endDragBefore(evt?, win?: Window) {
    const drawNodes: Array<Container> = [];
    const positioned = new Set<Stage>();
    DD._dragElements.forEach((elem, key) => {
      const { node } = elem;
      // we need to find pointer relative to that node
      const stage = node.getStage()!;
      // a pointer released in another window ends the drag too - the pointer
      // is up everywhere - but its position is not used for this stage
      if (
        evt &&
        !positioned.has(stage) &&
        (!win || stage._getOwnerWindow() === win)
      ) {
        stage.setPointersPositions(evt);
        positioned.add(stage);
      }
      if (
        evt &&
        elem.pointerEventType &&
        elem.pointerEventType !== Util._getEventType(evt.type)
      ) {
        return;
      }

      // a drag started without an event (node.startDrag()) that has not
      // moved yet has no pointer: any release ends it
      const released =
        elem.pointerId === undefined ||
        stage._changedPointerPositions.some((pos) => pos.id === elem.pointerId);

      // that pointer is not related: a "ready" element of another pointer
      // waits for its own release
      if (!released) {
        return;
      }

      if (elem.dragStatus === 'ready') {
        DD._dragElements.delete(key);
      } else {
        // if a node is stopped manually we still need to reset events:
        stage._cancelClick(elem.pointerId, elem.pointerEventType);
        elem.dragStatus = 'stopped';

        // a node that has not moved needs no redraw
        const drawNode =
          elem.node.getLayer() ||
          ((elem.node instanceof Konva['Stage'] && elem.node) as any);
        if (drawNode && drawNodes.indexOf(drawNode) === -1) {
          drawNodes.push(drawNode);
        }
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
      if (elem.dragStatus !== 'stopped') {
        return;
      }
      elem.node.fire(
        'dragend',
        {
          type: 'dragend',
          target: elem.node,
          evt: evt,
        },
        true
      );
      // a dragend handler may have started a new drag of the node
      if ((elem.dragStatus as string) !== 'dragging') {
        DD._dragElements.delete(key);
      }
    });
  },
};
