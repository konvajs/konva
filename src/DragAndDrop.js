(function() {
    Kinetic.DD = {
        anim: new Kinetic.Animation(),
        started: false,
        offset: {
            x: 0,
            y: 0
        }
    };

    Kinetic.getNodeDragging = function() {
        return Kinetic.DD.node;
    };
    Kinetic.DD._initDragLayer = function(stage) {
        stage.dragLayer = new Kinetic.Layer();
        stage.dragLayer.getCanvas().getElement().className = 'kinetic-drag-and-drop-layer';
    };
    Kinetic.DD._drag = function(evt) {
        var dd = Kinetic.DD, node = dd.node;

        if(node) {
            var pos = node.getStage().getUserPosition();
            var dbf = node.attrs.dragBoundFunc;

            var newNodePos = {
                x: pos.x - dd.offset.x,
                y: pos.y - dd.offset.y
            };

            if(dbf !== undefined) {
                newNodePos = dbf.call(node, newNodePos, evt);
            }

            node.setAbsolutePosition(newNodePos);

            if(!dd.moving) {
                dd.moving = true;
                node._handleEvent('dragstart', evt);
            }
            
            // execute ondragmove if defined
            node._handleEvent('dragmove', evt);
        }
    };
    Kinetic.DD._endDragBefore = function(evt) {
        var dd = Kinetic.DD, 
            evt = evt || {},
            node = dd.node,
            nodeType, layer;

        if(node) {
            nodeType = node.nodeType,
            layer = node.getLayer();
           
            if((nodeType === 'Group' || nodeType === 'Shape') && node.getDragOnTop()) {
                node.getStage().dragLayer.remove();
            }

            dd.anim.stop();

            // only fire dragend event if the drag and drop
            // operation actually started. 
            if(dd.moving) {
                dd.moving = false;
                evt.dragEndNode = node;
            }
            
            delete dd.node;
            
            node.moveToTop();
            
            if (layer) {
                layer.draw(); 
            }
            else {
                node.draw();
            }
        }
    };
    Kinetic.DD._endDragAfter = function(evt) {
        var evt = evt || {},
            dragEndNode = evt.dragEndNode;
            
        if (evt && dragEndNode) {
            dragEndNode._handleEvent('dragend', evt); 
        }
    };
    Kinetic.DD._endDrag = function() {
        this._endDragBefore();
        this._endDragAfter();
    };
    Kinetic.Node.prototype._startDrag = function(evt) {
        var dd = Kinetic.DD, 
            that = this, 
            stage = this.getStage(),
            layer = this.getLayer(), 
            pos = stage.getUserPosition();

        if(pos) {
            var m = this.getTransform().getTranslation(), ap = this.getAbsolutePosition(), nodeType = this.nodeType, container;

            dd.node = this;
            dd.offset.x = pos.x - ap.x;
            dd.offset.y = pos.y - ap.y;
            dd.anim.node = this;

            // Stage and Layer node types
            if(nodeType === 'Stage' || nodeType === 'Layer') {
                dd.anim.start();
            }

            // Group or Shape node types
            else {
                if(this.getDragOnTop()) {
                    // clear shape from layer canvas
                    that.setVisible(false);
                    layer.draw();
                    that.setVisible(true);
                    stage.add(stage.dragLayer);
                    dd.anim.start();
                }
                else {
                    dd.anim.start();
                }
            }
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
     * determine if node is currently in drag and drop mode
     * @name isDragging
     * @methodOf Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.isDragging = function() {
        var dd = Kinetic.DD;
        return dd.node && dd.node._id === this._id && dd.moving;
    };

    Kinetic.Node.prototype._listenDrag = function() {
        this._dragCleanup();
        var that = this;
        this.on('mousedown.kinetic touchstart.kinetic', function(evt) {
            if(!Kinetic.getNodeDragging()) {
                that._startDrag(evt);
            }
        });
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
                dd._endDrag();
            }
        }
    };
    
    Kinetic.Node.prototype._dragCleanup = function() {
        this.off('mousedown.kinetic');
        this.off('touchstart.kinetic');
    };

    Kinetic.Node.addGetterSetter(Kinetic.Node, 'dragBoundFunc');
    Kinetic.Node.addGetterSetter(Kinetic.Node, 'dragOnTop', true);
    
    Kinetic.Node.addGetter(Kinetic.Node, 'draggable', false);

    /**
     * set drag bound function.  This is used to override the default
     *  drag and drop position
     * @name setDragBoundFunc
     * @methodOf Kinetic.Node.prototype
     * @param {Function} dragBoundFunc
     */

    /**
     * set flag which enables or disables automatically moving the draggable node to a
     *  temporary top layer to improve performance.  The default is true
     * @name setDragOnTop
     * @methodOf Kinetic.Node.prototype
     * @param {Boolean} dragOnTop
     */

    /**
     * get dragBoundFunc
     * @name getDragBoundFunc
     * @methodOf Kinetic.Node.prototype
     */

    /**
     * get flag which enables or disables automatically moving the draggable node to a
     *  temporary top layer to improve performance.
     * @name getDragOnTop
     * @methodOf Kinetic.Node.prototype
     */
    
     /**
     * get draggable
     * @name getDraggable
     * @methodOf Kinetic.Node.prototype
     */

    /**
     * get draggable.  Alias of getDraggable()
     * @name isDraggable
     * @methodOf Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.isDraggable = Kinetic.Node.prototype.getDraggable;

    // listen for capturing phase so that the _endDrag method is
    // called before the stage mouseup event is triggered in order
    // to render the hit graph just in time to pick up the event
    var html = document.getElementsByTagName('html')[0];
    html.addEventListener('mouseup', Kinetic.DD._endDragBefore, true);
    html.addEventListener('touchend', Kinetic.DD._endDragBefore, true);
    
    html.addEventListener('mouseup', Kinetic.DD._endDragAfter, false);
    html.addEventListener('touchend', Kinetic.DD._endDragAfter, false);
    
})();
