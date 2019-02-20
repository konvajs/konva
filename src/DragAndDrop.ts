import { Animation } from './Animation';
import { isBrowser, getGlobalKonva } from './Global';

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
  isDragging: false,
  justDragged: false,
  offset: {
    x: 0,
    y: 0
  },
  node: null,

  // methods
  _drag(evt) {
    var node = DD.node;
    if (node) {
      if (!DD.isDragging) {
        var pos = node.getStage().getPointerPosition();
        // it is possible that pos is undefined
        // reattach it
        if (!pos) {
          node.getStage().setPointersPositions(evt);
          pos = node.getStage().getPointerPosition();
        }
        var dragDistance = node.dragDistance();
        var distance = Math.max(
          Math.abs(pos.x - DD.startPointerPos.x),
          Math.abs(pos.y - DD.startPointerPos.y)
        );
        if (distance < dragDistance) {
          return;
        }
      }

      node.getStage().setPointersPositions(evt);
      if (!DD.isDragging) {
        DD.isDragging = true;
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
      node._setDragPosition(evt);

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
    }
  },
  _endDragBefore(evt) {
    var node = DD.node,
      layer;

    if (node) {
      layer = node.getLayer();
      DD.anim.stop();

      // only fire dragend event if the drag and drop
      // operation actually started.
      if (DD.isDragging) {
        DD.isDragging = false;
        DD.justDragged = true;
        getGlobalKonva().listenClickTap = false;

        if (evt) {
          evt.dragEndNode = node;
        }
      }

      DD.node = null;

      if (layer || node instanceof getGlobalKonva().Stage) {
        (layer || node).draw();
      }
    }
  },
  _endDragAfter(evt) {
    evt = evt || {};
    var dragEndNode = evt.dragEndNode;

    if (evt && dragEndNode) {
      dragEndNode.fire(
        'dragend',
        {
          type: 'dragend',
          target: dragEndNode,
          evt: evt
        },
        true
      );
    }
  }
};

if (isBrowser) {
  window.addEventListener('mouseup', DD._endDragBefore, true);
  window.addEventListener('touchend', DD._endDragBefore, true);

  window.addEventListener('mousemove', DD._drag);
  window.addEventListener('touchmove', DD._drag);

  window.addEventListener('mouseup', DD._endDragAfter, false);
  window.addEventListener('touchend', DD._endDragAfter, false);
}
