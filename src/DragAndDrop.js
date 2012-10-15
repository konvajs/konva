Kinetic.Global.dragAnim = new Kinetic.Animation();

Kinetic.Global._endDrag = function(evt) {
    var go = Kinetic.Global;
    var node = go.drag.node;
    if(node) {
        if(node.nodeType === 'Stage') {
            node.draw();
        }
        else {
            node.getLayer().draw();
        }

        // handle dragend
        if(go.drag.moving) {
            go.drag.moving = false;
            node._handleEvent('dragend', evt);
        }
    }
    go.drag.node = null;
    go.dragAnim.stop();
};

Kinetic.Global._startDrag = function(evt) {
    var go = Kinetic.Global;
    var node = go.drag.node;

    if(node) {
        var pos = node.getStage().getUserPosition();
        var dbf = node.attrs.dragBoundFunc;

        var newNodePos = {
            x: pos.x - go.drag.offset.x,
            y: pos.y - go.drag.offset.y
        };

        if(dbf !== undefined) {
            newNodePos = dbf.call(node, newNodePos, evt);
        }

        node.setAbsolutePosition(newNodePos);

        if(!go.drag.moving) {
            go.drag.moving = true;
            // execute dragstart events if defined
            go.drag.node._handleEvent('dragstart', evt);
        }

        // execute user defined ondragmove if defined
        go.drag.node._handleEvent('dragmove', evt);
    }
};
/**
 * set draggable
 * @name setDraggable
 * @methodOf Kinetic.Node.prototype
 * @param {String} draggable
 */
Kinetic.Node.prototype.setDraggable = function(draggable) {
    this.setAttr('draggable', draggable);
    this._dragChange();
};
/**
 * get draggable
 * @name getDraggable
 * @methodOf Kinetic.Node.prototype
 */
Kinetic.Node.prototype.getDraggable = function() {
    return this.attrs.draggable;
};
/**
 * determine if node is currently in drag and drop mode
 * @name isDragging
 * @methodOf Kinetic.Node.prototype
 */
Kinetic.Node.prototype.isDragging = function() {
    var go = Kinetic.Global;
    return go.drag.node && go.drag.node._id === this._id && go.drag.moving;
};

Kinetic.Node.prototype._listenDrag = function() {
    this._dragCleanup();
    var go = Kinetic.Global;
    var that = this;
    this.on('mousedown.kinetic touchstart.kinetic', function(evt) {
        that._initDrag();
    });
};
Kinetic.Node.prototype._initDrag = function() {
    var go = Kinetic.Global;
    var stage = this.getStage();
    var pos = stage.getUserPosition();

    if(pos) {
        var m = this.getTransform().getTranslation();
        var am = this.getAbsoluteTransform().getTranslation();
        var ap = this.getAbsolutePosition();
        go.drag.node = this;
        go.drag.offset.x = pos.x - ap.x;
        go.drag.offset.y = pos.y - ap.y;

        /*
         * if dragging and dropping the stage,
         * draw all of the layers
         */
        if(this.nodeType === 'Stage') {
            go.dragAnim.node = this;
        }
        else {
            go.dragAnim.node = this.getLayer();
        }
        go.dragAnim.start();
    }
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
        var go = Kinetic.Global;
        if(stage && go.drag.node && go.drag.node._id === this._id) {
            stage._endDrag();
        }
    }
};
Kinetic.Node.prototype._dragCleanup = function() {
    this.off('mousedown.kinetic');
    this.off('touchstart.kinetic');
};
/**
 * get draggable.  Alias of getDraggable()
 * @name isDraggable
 * @methodOf Kinetic.Node.prototype
 */
Kinetic.Node.prototype.isDraggable = Kinetic.Node.prototype.getDraggable;

Kinetic.Node.addGettersSetters(Kinetic.Node, ['dragBoundFunc']);

/**
 * set drag bound function.  This is used to override the default
 *  drag and drop position
 * @name setDragBoundFunc
 * @methodOf Kinetic.Node.prototype
 * @param {Function} dragBoundFunc
 */

/**
 * get dragBoundFunc
 * @name getDragBoundFunc
 * @methodOf Kinetic.Node.prototype
 */