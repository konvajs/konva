(function() {
  'use strict';
  Konva.DD = {
    // properties
    anim: new Konva.Animation(function() {
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
    _drag: function(evt) {
      var dd = Konva.DD,
        node = dd.node;
      if (node) {
        if (!dd.isDragging) {
          var pos = node.getStage().getPointerPosition();
          // it is possible that pos is undefined
          // reattach it
          if (!pos) {
            node.getStage()._setPointerPosition(evt);
            pos = node.getStage().getPointerPosition();
          }
          var dragDistance = node.dragDistance();
          var distance = Math.max(
            Math.abs(pos.x - dd.startPointerPos.x),
            Math.abs(pos.y - dd.startPointerPos.y)
          );
          if (distance < dragDistance) {
            return;
          }
        }

        node.getStage()._setPointerPosition(evt);
        node._setDragPosition(evt);
        if (!dd.isDragging) {
          dd.isDragging = true;
          node.fire(
            'dragstart',
            {
              type: 'dragstart',
              target: node,
              evt: evt
            },
            true
          );
        }

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
    _endDragBefore: function(evt) {
      var dd = Konva.DD,
        node = dd.node,
        layer;

      if (node) {
        layer = node.getLayer();
        dd.anim.stop();

        // only fire dragend event if the drag and drop
        // operation actually started.
        if (dd.isDragging) {
          dd.isDragging = false;
          dd.justDragged = true;
          Konva.listenClickTap = false;

          if (evt) {
            evt.dragEndNode = node;
          }
        }

        delete dd.node;

        if (node.getLayer() || layer || node instanceof Konva.Stage) {
          (layer || node).draw();
        }
      }
    },
    _endDragAfter: function(evt) {
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

  // Node extenders

  /**
     * initiate drag and drop
     * @method
     * @memberof Konva.Node.prototype
     */
  Konva.Node.prototype.startDrag = function() {
    var dd = Konva.DD,
      stage = this.getStage(),
      layer = this.getLayer(),
      pos = stage.getPointerPosition(),
      ap = this.getAbsolutePosition();

    if (pos) {
      if (dd.node) {
        dd.node.stopDrag();
      }

      dd.node = this;
      dd.startPointerPos = pos;
      dd.offset.x = pos.x - ap.x;
      dd.offset.y = pos.y - ap.y;
      dd.anim.setLayers(layer || this.getLayers());
      dd.anim.start();

      this._setDragPosition();
    }
  };

  Konva.Node.prototype._setDragPosition = function(evt) {
    var dd = Konva.DD,
      pos = this.getStage().getPointerPosition(),
      dbf = this.getDragBoundFunc();
    if (!pos) {
      return;
    }
    var newNodePos = {
      x: pos.x - dd.offset.x,
      y: pos.y - dd.offset.y
    };

    if (dbf !== undefined) {
      newNodePos = dbf.call(this, newNodePos, evt);
    }
    this.setAbsolutePosition(newNodePos);

    if (
      !this._lastPos ||
      this._lastPos.x !== newNodePos.x ||
      this._lastPos.y !== newNodePos.y
    ) {
      dd.anim.dirty = true;
    }

    this._lastPos = newNodePos;
  };

  /**
     * stop drag and drop
     * @method
     * @memberof Konva.Node.prototype
     */
  Konva.Node.prototype.stopDrag = function() {
    var dd = Konva.DD,
      evt = {};
    dd._endDragBefore(evt);
    dd._endDragAfter(evt);
  };

  Konva.Node.prototype.setDraggable = function(draggable) {
    this._setAttr('draggable', draggable);
    this._dragChange();
  };

  var origRemove = Konva.Node.prototype.remove;

  Konva.Node.prototype.__originalRemove = origRemove;
  Konva.Node.prototype.remove = function() {
    var dd = Konva.DD;

    // stop DD
    if (dd.node && dd.node._id === this._id) {
      this.stopDrag();
    }

    origRemove.call(this);
  };

  /**
     * determine if node is currently in drag and drop mode
     * @method
     * @memberof Konva.Node.prototype
     */
  Konva.Node.prototype.isDragging = function() {
    var dd = Konva.DD;
    return !!(dd.node && dd.node._id === this._id && dd.isDragging);
  };

  Konva.Node.prototype._listenDrag = function() {
    var that = this;

    this._dragCleanup();

    if (this.getClassName() === 'Stage') {
      this.on('contentMousedown.konva contentTouchstart.konva', function(evt) {
        if (!Konva.DD.node) {
          that.startDrag(evt);
        }
      });
    } else {
      this.on('mousedown.konva touchstart.konva', function(evt) {
        // ignore right and middle buttons
        if (evt.evt.button === 1 || evt.evt.button === 2) {
          return;
        }
        if (!Konva.DD.node) {
          that.startDrag(evt);
        }
      });
    }

    // listening is required for drag and drop
    /*
        this._listeningEnabled = true;
        this._clearSelfAndAncestorCache('listeningEnabled');
        */
  };

  Konva.Node.prototype._dragChange = function() {
    if (this.attrs.draggable) {
      this._listenDrag();
    } else {
      // remove event listeners
      this._dragCleanup();

      /*
             * force drag and drop to end
             * if this node is currently in
             * drag and drop mode
             */
      var stage = this.getStage();
      var dd = Konva.DD;
      if (stage && dd.node && dd.node._id === this._id) {
        dd.node.stopDrag();
      }
    }
  };

  Konva.Node.prototype._dragCleanup = function() {
    if (this.getClassName() === 'Stage') {
      this.off('contentMousedown.konva');
      this.off('contentTouchstart.konva');
    } else {
      this.off('mousedown.konva');
      this.off('touchstart.konva');
    }
  };

  Konva.Factory.addGetterSetter(Konva.Node, 'dragBoundFunc');

  /**
     * get/set drag bound function.  This is used to override the default
     *  drag and drop position
     * @name dragBoundFunc
     * @method
     * @memberof Konva.Node.prototype
     * @param {Function} dragBoundFunc
     * @returns {Function}
     * @example
     * // get drag bound function
     * var dragBoundFunc = node.dragBoundFunc();
     *
     * // create vertical drag and drop
     * node.dragBoundFunc(function(pos){
     *   return {
     *     x: this.getAbsolutePosition().x,
     *     y: pos.y
     *   };
     * });
     */

  Konva.Factory.addGetter(Konva.Node, 'draggable', false);
  Konva.Factory.addOverloadedGetterSetter(Konva.Node, 'draggable');

  /**
     * get/set draggable flag
     * @name draggable
     * @method
     * @memberof Konva.Node.prototype
     * @param {Boolean} draggable
     * @returns {Boolean}
     * @example
     * // get draggable flag
     * var draggable = node.draggable();
     *
     * // enable drag and drop
     * node.draggable(true);
     *
     * // disable drag and drop
     * node.draggable(false);
     */

  if (Konva.isBrowser) {
    var html = Konva.document.documentElement;
    html.addEventListener('mouseup', Konva.DD._endDragBefore, true);
    html.addEventListener('touchend', Konva.DD._endDragBefore, true);

    html.addEventListener('mousemove', Konva.DD._drag);
    html.addEventListener('touchmove', Konva.DD._drag);

    html.addEventListener('mouseup', Konva.DD._endDragAfter, false);
    html.addEventListener('touchend', Konva.DD._endDragAfter, false);
  }
})();
