///////////////////////////////////////////////////////////////////////
//  Node
///////////////////////////////////////////////////////////////////////
/**
 * Node constructor.  Node is a base class for the
 * Layer, Group, and Shape classes
 * @param {Object} name
 */
Kinetic.Node = function(config){
    this.visible = true;
    this.isListening = true;
    this.name = undefined;
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.scale = {
        x: 1,
        y: 1
    };
    this.rotation = 0;
    this.centerOffset = {
        x: 0,
        y: 0
    };
    this.eventListeners = {};
    this.drag = {
        x: false,
        y: false
    };
    
    // set properties from config
    if (config) {
        for (var key in config) {
            // handle special keys
            switch (key) {
                case "draggable":
                    this.draggable(config[key]);
                    break;
                case "draggableX":
                    this.draggableX(config[key]);
                    break;
                case "draggableY":
                    this.draggableY(config[key]);
                    break;
                case "listen":
                    this.listen(config[key]);
                    break;
                case "rotationDeg":
                    this.rotation = config[key] * Math.PI / 180;
                    break;
                default:
                    this[key] = config[key];
                    break;
            }
        }
    }
    
    // overrides
    if (this.centerOffset.x === undefined) {
        this.centerOffset.x = 0;
    }
    if (this.centerOffset.y === undefined) {
        this.centerOffset.y = 0;
    }
};

Kinetic.Node.prototype = {
    /**
     * bind event to node
     * @param {String} typesStr
     * @param {function} handler
     */
    on: function(typesStr, handler){
        var types = typesStr.split(" ");
        /*
         * loop through types and attach event listeners to
         * each one.  eg. "click mouseover.namespace mouseout"
         * will create three event bindings
         */
        for (var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split(".");
            var baseEvent = parts[0];
            var name = parts.length > 1 ? parts[1] : "";
            
            if (!this.eventListeners[baseEvent]) {
                this.eventListeners[baseEvent] = [];
            }
            
            this.eventListeners[baseEvent].push({
                name: name,
                handler: handler
            });
        }
    },
    /**
     * unbind event to node
     * @param {String} typesStr
     */
    off: function(typesStr){
        var types = typesStr.split(" ");
        
        for (var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split(".");
            var baseEvent = parts[0];
            
            if (this.eventListeners[baseEvent] && parts.length > 1) {
                var name = parts[1];
                
                for (var i = 0; i < this.eventListeners[baseEvent].length; i++) {
                    if (this.eventListeners[baseEvent][i].name === name) {
                        this.eventListeners[baseEvent].splice(i, 1);
                        if (this.eventListeners[baseEvent].length === 0) {
                            this.eventListeners[baseEvent] = undefined;
                        }
                        break;
                    }
                }
            }
            else {
                this.eventListeners[baseEvent] = undefined;
            }
        }
    },
    /**
     * show node
     */
    show: function(){
        this.visible = true;
    },
    /**
     * hide node
     */
    hide: function(){
        this.visible = false;
    },
    /**
     * get zIndex
     */
    getZIndex: function(){
        return this.index;
    },
    /**
     * set node scale
     * @param {number} scaleX
     * @param {number} scaleY
     */
    setScale: function(scaleX, scaleY){
        if (scaleY) {
            this.scale.x = scaleX;
            this.scale.y = scaleY;
        }
        else {
            this.scale.x = scaleX;
            this.scale.y = scaleX;
        }
    },
    /**
     * get scale
     */
    getScale: function(){
        return this.scale;
    },
    /**
     * set node position
     * @param {number} x
     * @param {number} y
     */
    setPosition: function(x, y){
        this.x = x;
        this.y = y;
    },
    /**
     * get node position relative to container
     */
    getPosition: function(){
        return {
            x: this.x,
            y: this.y
        };
    },
    /**
     * get absolute position relative to stage
     */
    getAbsolutePosition: function(){
        var x = this.x;
        var y = this.y;
        var parent = this.getParent();
        while (parent.className !== "Stage") {
            x += parent.x;
            y += parent.y;
            parent = parent.parent;
        }
        return {
            x: x,
            y: y
        };
    },
    /**
     * move node
     * @param {number} x
     * @param {number} y
     */
    move: function(x, y){
        this.x += x;
        this.y += y;
    },
    /**
     * set node rotation
     * @param {number} theta
     */
    setRotation: function(theta){
        this.rotation = theta;
    },
    /**
     * set rotation using degrees
     * @param {number} deg
     */
    setRotationDeg: function(deg){
        this.rotation = (deg * Math.PI / 180);
    },
    /**
     * get rotation
     */
    getRotation: function(){
        return this.rotation;
    },
    /**
     * get rotation in degrees
     */
    getRotationDeg: function(){
        return this.rotation * 180 / Math.PI;
    },
    /**
     * rotate node
     * @param {number} theta
     */
    rotate: function(theta){
        this.rotation += theta;
    },
    /**
     * rotate node using degrees
     * @param {number} deg
     */
    rotateDeg: function(deg){
        this.rotation += (deg * Math.PI / 180);
    },
    /**
     * listen or don't listen to events
     * @param {boolean} isListening
     */
    listen: function(isListening){
        this.isListening = isListening;
    },
    /**
     * move node to top
     */
    moveToTop: function(){
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent._setChildrenIndices();
    },
    /**
     * move node up
     */
    moveUp: function(){
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(index + 1, 0, this);
        this.parent._setChildrenIndices();
    },
    /**
     * move node down
     */
    moveDown: function(){
        var index = this.index;
        if (index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent._setChildrenIndices();
        }
    },
    /**
     * move node to bottom
     */
    moveToBottom: function(){
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.unshift(this);
        this.parent._setChildrenIndices();
    },
    /**
     * set zIndex
     * @param {int} index
     */
    setZIndex: function(zIndex){
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(zIndex, 0, this);
        this.parent._setChildrenIndices();
    },
    /**
     * set alpha
     * @param {Object} alpha
     */
    setAlpha: function(alpha){
        this.alpha = alpha;
    },
    /**
     * get alpha
     */
    getAlpha: function(){
        return this.alpha;
    },
    /**
     * get absolute alpha
     */
    getAbsoluteAlpha: function(){
        var absAlpha = 1;
        var node = this;
        // traverse upwards
        while (node.className !== "Stage") {
            absAlpha *= node.alpha;
            node = node.parent;
        }
        return absAlpha;
    },
    /**
     * initialize drag and drop
     */
    _initDrag: function(){
        var go = Kinetic.GlobalObject;
        var that = this;
        this.on("mousedown.initdrag touchstart.initdrag", function(evt){
            var stage = that.getStage();
            var pos = stage.getUserPosition();
            
            if (pos) {
                go.drag.node = that;
                go.drag.offset.x = pos.x - that.x;
                go.drag.offset.y = pos.y - that.y;
            }
        });
    },
    /**
     * remove drag and drop event listener
     */
    _dragCleanup: function(){
        if (!this.drag.x && !this.drag.y) {
            this.off("mousedown.initdrag");
            this.off("touchstart.initdrag");
        }
    },
    /**
     * enable/disable drag and drop for box x and y direction
     * @param {boolean} setDraggable
     */
    draggable: function(setDraggable){
        if (setDraggable) {
            var needInit = !this.drag.x && !this.drag.y;
            this.drag.x = true;
            this.drag.y = true;
            
            if (needInit) {
                this._initDrag();
            }
        }
        else {
            this.drag.x = false;
            this.drag.y = false;
            this._dragCleanup();
        }
    },
    /**
     * enable/disable drag and drop for x only
     * @param {boolean} setDraggable
     */
    draggableX: function(setDraggable){
        if (setDraggable) {
            var needInit = !this.drag.x && !this.drag.y;
            this.drag.x = true;
            if (needInit) {
                this._initDrag();
            }
        }
        else {
            this.drag.x = false;
            this._dragCleanup();
        }
    },
    /**
     * enable/disable drag and drop for y only
     * @param {boolean} setDraggable
     */
    draggableY: function(setDraggable){
        if (setDraggable) {
            var needInit = !this.drag.x && !this.drag.y;
            this.drag.y = true;
            if (needInit) {
                this._initDrag();
            }
        }
        else {
            this.drag.y = false;
            this._dragCleanup();
        }
    },
    /**
     * determine if node is currently in drag mode
     */
    isDragging: function(){
        var go = Kinetic.GlobalObject;
        return go.drag.node !== undefined && go.drag.node.id === this.id && go.drag.moving;
    },
    /**
     * handle node events
     * @param {string} eventType
     * @param {Event} evt
     */
    _handleEvents: function(eventType, evt){
        // generic events handler
        function handle(obj){
            var el = obj.eventListeners;
            if (el[eventType]) {
                var events = el[eventType];
                for (var i = 0; i < events.length; i++) {
                    events[i].handler.apply(obj, [evt]);
                }
            }
            
            if (obj.parent.className !== "Stage") {
                handle(obj.parent);
            }
        }
        /*
         * simulate bubbling by handling node events
         * first, followed by group events, followed
         * by layer events
         */
        handle(this);
    },
    /**
     * move node to another container
     * @param {Layer} newLayer
     */
    moveTo: function(newContainer){
        var parent = this.parent;
        // remove from parent's children
        parent.children.splice(this.index, 1);
        parent._setChildrenIndices();
        
        // add to new parent
        newContainer.children.push(this);
        this.index = newContainer.children.length - 1;
        this.parent = newContainer;
        newContainer._setChildrenIndices();
        
        // update children hashes
        if (this.name) {
            parent.childrenNames[this.name] = undefined;
            newContainer.childrenNames[this.name] = this;
        }
    },
    /**
     * get parent
     */
    getParent: function(){
        return this.parent;
    },
    /**
     * get node's layer
     */
    getLayer: function(){
        if (this.className === 'Layer') {
            return this;
        }
        else {
            return this.getParent().getLayer();
        }
    },
    /**
     * get stage
     */
    getStage: function(){
        return this.getParent().getStage();
    },
    /**
     * get name
     */
    getName: function(){
        return this.name;
    },
    /**
     * set center offset
     * @param {number} x
     * @param {number} y
     */
    setCenterOffset: function(x, y){
        this.centerOffset.x = x;
        this.centerOffset.y = y;
    },
    /**
     * get center offset
     */
    getCenterOffset: function(){
        return this.centerOffset;
    }
};
