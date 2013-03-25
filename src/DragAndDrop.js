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
                var pos = node.getStage().getPointerPosition();
                var dbf = node.getDragBoundFunc();
    
                var newNodePos = {
                    x: pos.x - dd.offset.x,
                    y: pos.y - dd.offset.y
                };
    
                if(dbf !== undefined) {
                    newNodePos = dbf.call(node, newNodePos, evt);
                }
    
                node.setAbsolutePosition(newNodePos);
    
                if(!dd.isDragging) {
                    dd.isDragging = true;
                    node._handleEvent('dragstart', evt);
                }
                
                // execute ondragmove if defined
                node._handleEvent('dragmove', evt);
            }
        },
        _endDragBefore: function(evt) {
            var dd = Kinetic.DD, 
                evt = evt || {},
                node = dd.node,
                nodeType, layer;
    
            if(node) {
                nodeType = node.nodeType,
                layer = node.getLayer();
                dd.anim.stop();
    
                // only fire dragend event if the drag and drop
                // operation actually started. 
                if(dd.isDragging) {
                    dd.isDragging = false;
                    evt.dragEndNode = node;
                }
                
                delete dd.node;
                
                if (layer) {
                    layer.draw(); 
                }
                else {
                    node.draw();
                }
            }
        },
        _endDragAfter: function(evt) {
            var evt = evt || {},
                dragEndNode = evt.dragEndNode;
                  
            if (evt && dragEndNode) {
              dragEndNode._handleEvent('dragend', evt); 
            }
        }
    };

    // Node extenders
    
    /**
     * initiate drag and drop
     * @name startDrag
     * @methodOf Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.startDrag = function() {
        var dd = Kinetic.DD, 
            that = this, 
            stage = this.getStage(),
            layer = this.getLayer(), 
            pos = stage.getPointerPosition(),
            m = this.getTransform().getTranslation(), 
            ap = this.getAbsolutePosition(), 
            animNode = layer || this;
                
        if(pos && !dd.node) {
            dd.node = this;
            dd.offset.x = pos.x - ap.x;
            dd.offset.y = pos.y - ap.y;
            dd.anim.node = animNode;
            dd.anim.start();
        }
    };
    
    /**
     * stop drag and drop
     * @name stopDrag
     * @methodOf Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.stopDrag = function() {
        var dd = Kinetic.DD;
        dd._endDragBefore();
        dd._endDragAfter();
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
        return dd.node && dd.node._id === this._id && dd.isDragging;
    };

    Kinetic.Node.prototype._listenDrag = function() {
        this._dragCleanup();
        var that = this;
        this.on('mousedown.kinetic touchstart.kinetic', function(evt) {
            if(!Kinetic.DD.node) {
                that.startDrag(evt);
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
                dd.node.stopDrag();
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

    // listen for capturing phase so that the _endDrag* methods are
    // called before the stage mouseup event is triggered in order
    // to render the hit graph just in time to pick up the event
    var html = document.getElementsByTagName('html')[0];
    html.addEventListener('mouseup', Kinetic.DD._endDragBefore, true);
    html.addEventListener('touchend', Kinetic.DD._endDragBefore, true);
    
    html.addEventListener('mouseup', Kinetic.DD._endDragAfter, false);
    html.addEventListener('touchend', Kinetic.DD._endDragAfter, false);
    
})();
