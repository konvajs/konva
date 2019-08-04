import { Animation } from './Animation';
import { Konva } from './Global';
import { Node } from './Node';
import { Vector2d } from './types';
import { Util } from './Util';

// TODO: make better module,
// make sure other modules import it without global
export const DD = {
  startPointerPos: {
    x: 0,
    y: 0
  },
  // properties
  anim: new Animation(function() {
    var b = this.dirty;
    this.dirty = false;
    return b;
  }),
  get isDragging() {
    var flag = false;
    DD._dragElements.forEach(elem => {
      if (elem.isDragging) {
        flag = true;
      }
    });
    return flag;
  },
  justDragged: false,
  offset: {
    x: 0,
    y: 0
  },
  get node() {
    // return first dragging node
    var node: Node | undefined;
    DD._dragElements.forEach(elem => {
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
      isDragging: boolean;
      pointerId?: number;
      dragStopped: boolean;
    }
  >(),

  // methods
  _drag(evt) {
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
        pos => pos.id === elem.pointerId
      );
      if (!pos) {
        console.error('Can not find pointer');
        return;
      }
      if (!elem.isDragging) {
        var dragDistance = node.dragDistance();
        var distance = Math.max(
          Math.abs(pos.x - elem.startPointerPos.x),
          Math.abs(pos.y - elem.startPointerPos.y)
        );
        if (distance < dragDistance) {
          return;
        }
        elem.isDragging = true;
        node.fire(
          'dragstart',
          {
            type: 'dragstart',
            target: node,
            evt: evt
          },
          true
        );
        // a user can stop dragging inside `dragstart`
        if (!node.isDragging()) {
          return;
        }
      }
      node._setDragPosition(evt, elem);

      // execute ondragmove if defined
      node.fire(
        'dragmove',
        {
          type: 'dragmove',
          target: node,
          evt: evt
        },
        true
      );
    });
  },
  _endDragBefore(evt) {
    DD._dragElements.forEach((elem, key) => {
      const { node } = elem;
      // we need to find pointer relative to that node
      const stage = node.getStage();
      stage.setPointersPositions(evt);

      const pos = stage._changedPointerPositions.find(
        pos => pos.id === elem.pointerId
      );

      // that pointer is not related
      if (!pos) {
        return;
      }

      if (elem.isDragging) {
        DD.justDragged = true;
        Konva.listenClickTap = false;
      }

      elem.dragStopped = true;
      elem.isDragging = false;

      const drawNode =
        elem.node.getLayer() ||
        (elem.node instanceof Konva['Stage'] && elem.node);
      if (drawNode) {
        drawNode.draw();
      }
    });
    // var node = DD.node;

    // if (node) {
    //   DD.anim.stop();

    //   // only fire dragend event if the drag and drop
    //   // operation actually started.
    //   if (DD.isDragging) {
    //     DD.isDragging = false;
    //     DD.justDragged = true;
    //     Konva.listenClickTap = false;

    //     if (evt) {
    //       evt.dragEndNode = node;
    //     }
    //   }

    //   DD.node = null;

    //   const drawNode =
    //     node.getLayer() || (node instanceof Konva['Stage'] && node);
    //   if (drawNode) {
    //     drawNode.draw();
    //   }
    // }
  },
  _endDragAfter(evt) {
    DD._dragElements.forEach((elem, key) => {
      if (elem.dragStopped) {
        elem.node.fire(
          'dragend',
          {
            type: 'dragend',
            target: elem.node,
            evt: evt
          },
          true
        );
        DD._dragElements.delete(key);
      }
    });
    // evt = evt || {};
    // var dragEndNode = evt.dragEndNode;
    // if (evt && dragEndNode) {
    //   dragEndNode.fire(
    //     'dragend',
    //     {
    //       type: 'dragend',
    //       target: dragEndNode,
    //       evt: evt
    //     },
    //     true
    //   );
    // }
  }
};

if (Konva.isBrowser) {
  window.addEventListener('mouseup', DD._endDragBefore, true);
  window.addEventListener('touchend', DD._endDragBefore, true);

  window.addEventListener('mousemove', DD._drag);
  window.addEventListener('touchmove', DD._drag);

  window.addEventListener('mouseup', DD._endDragAfter, false);
  window.addEventListener('touchend', DD._endDragAfter, false);
}
