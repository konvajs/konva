(function() {
    Kinetic.DD = {
        // properties
        anim: new Kinetic.Animation(),
        isDragging: false,
        offset: {
            x: 0,
            y: 0
        },
        node: null,

        // methods
        _drag: function(evt) {
            var dd = Kinetic.DD,
                node = dd.node;

            if(node) {
               if(!dd.isDragging) {
                    var pos = node.getStage().getPointerPosition();
                    var dragDistance = node.dragDistance();
                    var distance = Math.max(
                        Math.abs(pos.x - dd.startPointerPos.x),
                        Math.abs(pos.y - dd.startPointerPos.y)
                    );

                    if (distance < dragDistance) {
                        return;
                    }
                }

                node._setDragPosition(evt);
                if(!dd.isDragging) {
                    dd.isDragging = true;
                    node.fire('dragstart', {
                        type : 'dragstart',
                        target : node,
                        evt : evt
                    }, true);
                }

                // execute ondragmove if defined
                node.fire('dragmove', {
                    type : 'dragmove',
                    target : node,
                    evt : evt
                }, true);
            }
        },
        _endDragBefore: function(evt) {
            var dd = Kinetic.DD,
                node = dd.node,
                nodeType, layer;

            if(node) {
                nodeType = node.nodeType;
                layer = node.getLayer();
                dd.anim.stop();

                // only fire dragend event if the drag and drop
                // operation actually started.
                if(dd.isDragging) {
                    dd.isDragging = false;
                    Kinetic.listenClickTap = false;

                    if (evt) {
                        evt.dragEndNode = node;
                    }
                }

                delete dd.node;

                (layer || node).draw();
            }
        },
        _endDragAfter: function(evt) {
            evt = evt || {};

            var dragEndNode = evt.dragEndNode;

            if (evt && dragEndNode) {
                dragEndNode.fire('dragend', {
                    type : 'dragend',
                    target : dragEndNode,
                    evt : evt
                }, true);
            }
        }
    };

    // Node extenders

    /**
     * initiate drag and drop
     * @method
     * @memberof Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.startDrag = function() {
        var dd = Kinetic.DD,
            stage = this.getStage(),
            layer = this.getLayer(),
            pos = stage.getPointerPosition(),
            ap = this.getAbsolutePosition();

        if(pos) {
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

    Kinetic.Node.prototype._setDragPosition = function(evt) {
        var dd = Kinetic.DD,
            pos = this.getStage().getPointerPosition(),
            dbf = this.getDragBoundFunc();
        if (!pos) {
            return;
        }
        var newNodePos = {
            x: pos.x - dd.offset.x,
            y: pos.y - dd.offset.y
        };

        if(dbf !== undefined) {
            newNodePos = dbf.call(this, newNodePos, evt);
        }

        this.setAbsolutePosition(newNodePos);
    };

    /**
     * stop drag and drop
     * @method
     * @memberof Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.stopDrag = function() {
        var dd = Kinetic.DD,
            evt = {};
        dd._endDragBefore(evt);
        dd._endDragAfter(evt);
    };

    Kinetic.Node.prototype.setDraggable = function(draggable) {
        this._setAttr('draggable', draggable);
        this._dragChange();
    };

    var origDestroy = Kinetic.Node.prototype.destroy;

    Kinetic.Node.prototype.destroy = function() {
        var dd = Kinetic.DD;

        // stop DD
        if(dd.node && dd.node._id === this._id) {

            this.stopDrag();
        }

        origDestroy.call(this);
    };

    /**
     * determine if node is currently in drag and drop mode
     * @method
     * @memberof Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.isDragging = function() {
        var dd = Kinetic.DD;
        return dd.node && dd.node._id === this._id && dd.isDragging;
    };

    Kinetic.Node.prototype._listenDrag = function() {
        var that = this;

        this._dragCleanup();

        if (this.getClassName() === 'Stage') {
            this.on('contentMousedown.kinetic contentTouchstart.kinetic', function(evt) {
                if(!Kinetic.DD.node) {
                    that.startDrag(evt);
                }
            });
        }
        else {
            this.on('mousedown.kinetic touchstart.kinetic', function(evt) {
                if(!Kinetic.DD.node) {
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

    Kinetic.Node.prototype._dragChange = function() {
        if(this.attrs.draggable) {
            this._listenDrag();
        }
        else {
            // remove event listeners
            this._dragCleanup();

            /*
             * force drag and drop to end
             * if this node is currently in
             * drag and drop mode
             */
            var stage = this.getStage();
            var dd = Kinetic.DD;
            if(stage && dd.node && dd.node._id === this._id) {
                dd.node.stopDrag();
            }
        }
    };

    Kinetic.Node.prototype._dragCleanup = function() {
        if (this.getClassName() === 'Stage') {
            this.off('contentMousedown.kinetic');
            this.off('contentTouchstart.kinetic');
        } else {
            this.off('mousedown.kinetic');
            this.off('touchstart.kinetic');
        }
    };

    Kinetic.Factory.addGetterSetter(Kinetic.Node, 'dragBoundFunc');

    /**
     * get/set drag bound function.  This is used to override the default
     *  drag and drop position
     * @name dragBoundFunc
     * @method
     * @memberof Kinetic.Node.prototype
     * @param {Function} dragBoundFunc
     * @returns {Function}
     * @example
     * // get drag bound function<br>
     * var dragBoundFunc = node.dragBoundFunc();<br><br>
     *
     * // create vertical drag and drop<br>
     * node.dragBoundFunc(function(){<br>
     *   return {<br>
     *     x: this.getAbsolutePosition().x,<br>
     *     y: pos.y<br>
     *   };<br>
     * });
     */

    Kinetic.Factory.addGetter(Kinetic.Node, 'draggable', false);
    Kinetic.Factory.addOverloadedGetterSetter(Kinetic.Node, 'draggable');

     /**
     * get/set draggable flag
     * @name draggable
     * @method
     * @memberof Kinetic.Node.prototype
     * @param {Boolean} draggable
     * @returns {Boolean}
     * @example
     * // get draggable flag<br>
     * var draggable = node.draggable();<br><br>
     *
     * // enable drag and drop<br>
     * node.draggable(true);<br><br>
     *
     * // disable drag and drop<br>
     * node.draggable(false);
     */

    var html = Kinetic.document.documentElement;
    html.addEventListener('mouseup', Kinetic.DD._endDragBefore, true);
    html.addEventListener('touchend', Kinetic.DD._endDragBefore, true);

    html.addEventListener('mouseup', Kinetic.DD._endDragAfter, false);
    html.addEventListener('touchend', Kinetic.DD._endDragAfter, false);

})();
