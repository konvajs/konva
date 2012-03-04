/**
 * KineticJS JavaScript Library v3.8.2
 * http://www.kineticjs.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Mar 03 2012
 *
 * Copyright (C) 2011 - 2012 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
///////////////////////////////////////////////////////////////////////
//  Global Object
///////////////////////////////////////////////////////////////////////
var Kinetic = {};
Kinetic.GlobalObject = {
    stages: [],
    idCounter: 0,
    isAnimating: false,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: false,
        node: undefined,
        offset: {
            x: 0,
            y: 0
        }
    },
    extend: function(obj1, obj2){
        for (var key in obj2.prototype) {
            if (obj2.prototype.hasOwnProperty(key)) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    /*
     * animation methods
     */
    _isaCanvasAnimating: function(){
        for (var n = 0; n < this.stages.length; n++) {
            if (this.stages[n].isAnimating) {
                return true;
            }
        }
        return false;
    },
    _runFrames: function(){
        for (var n = 0; n < this.stages.length; n++) {
            if (this.stages[n].isAnimating) {
                this.stages[n].onFrameFunc(this.frame);
            }
        }
    },
    _updateFrameObject: function(){
        var date = new Date();
        var time = date.getTime();
        if (this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        }
        else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function(){
        if (this.isAnimating) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function(){
                that._animationLoop();
            });
        }
    },
    _handleAnimation: function(){
        var that = this;
        if (!this.isAnimating && this._isaCanvasAnimating()) {
            this.isAnimating = true;
            that._animationLoop();
        }
        else if (this.isAnimating && !this._isaCanvasAnimating()) {
            this.isAnimating = false;
        }
    }
};

/**
 * requestAnimFrame shim
 * @param {function} callback
 */
window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

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

///////////////////////////////////////////////////////////////////////
//  Container
///////////////////////////////////////////////////////////////////////

/**
 * Container constructor.  Container is the base class for
 * Stage, Layer, and Group
 */
Kinetic.Container = function(){
    this.children = [];
    this.childrenNames = {};
};

// methods
Kinetic.Container.prototype = {
    /**
     * set children indices
     */
    _setChildrenIndices: function(){
        /*
         * if reordering Layers, remove all canvas elements
         * from the container except the buffer and backstage canvases
         * and then readd all the layers
         */
        if (this.className === "Stage") {
            var canvases = this.container.childNodes;
            var bufferCanvas = canvases[0];
            var backstageCanvas = canvases[1];
            
            this.container.innerHTML = "";
            this.container.appendChild(bufferCanvas);
            this.container.appendChild(backstageCanvas);
        }
        
        for (var n = 0; n < this.children.length; n++) {
            this.children[n].index = n;
            
            if (this.className === "Stage") {
                this.container.appendChild(this.children[n].canvas);
            }
        }
    },
    /**
     * recursively traverse the container tree
     * and draw the children
     * @param {Object} obj
     */
    _drawChildren: function(){
        var children = this.children;
        for (var n = 0; n < children.length; n++) {
            var child = children[n];
            if (child.className === "Shape") {
                child._draw(child.getLayer());
            }
            else {
                child._draw();
            }
        }
    },
    /**
     * get children
     */
    getChildren: function(){
        return this.children;
    },
    /**
     * get node by name
     * @param {string} name
     */
    getChild: function(name){
        return this.childrenNames[name];
    },
    /**
     * add node to container
     * @param {Node} child
     */
    _add: function(child){
        if (child.name) {
            this.childrenNames[child.name] = child;
        }
        child.id = Kinetic.GlobalObject.idCounter++;
        child.index = this.children.length;
        child.parent = this;
        
        this.children.push(child);
    },
    /**
     * remove child from container
     * @param {Node} child
     */
    _remove: function(child){
        if (child.name !== undefined) {
            this.childrenNames[child.name] = undefined;
        }
        this.children.splice(child.index, 1);
        this._setChildrenIndices();
        child = undefined;
    },
    /**
     * remove all children
     */
    removeChildren: function(){
        while (this.children.length > 0) {
            this.remove(this.children[0]);
        }
    }
};

///////////////////////////////////////////////////////////////////////
//  Stage
///////////////////////////////////////////////////////////////////////
/**
 * Stage constructor.  Stage extends Container
 * @param {String} containerId
 * @param {int} width
 * @param {int} height
 */
Kinetic.Stage = function(cont, width, height){
    this.className = "Stage";
    this.container = typeof cont === "string" ? document.getElementById(cont) : cont;
    this.width = width;
    this.height = height;
    this.scale = {
        x: 1,
        y: 1
    };
    this.dblClickWindow = 400;
    this.targetShape = undefined;
    this.clickStart = false;
    
    // desktop flags
    this.mousePos = undefined;
    this.mouseDown = false;
    this.mouseUp = false;
    
    // mobile flags
    this.touchPos = undefined;
    this.touchStart = false;
    this.touchEnd = false;
    
    /*
     * Layer roles
     *
     * buffer - canvas compositing
     * backstage - path detection
     */
    this.bufferLayer = new Kinetic.Layer();
    this.backstageLayer = new Kinetic.Layer();
    
    // set parents
    this.bufferLayer.parent = this;
    this.backstageLayer.parent = this;
    
    // customize back stage context
    var backstageLayer = this.backstageLayer;
    this._stripLayer(backstageLayer);
    
    this.bufferLayer.getCanvas().style.display = 'none';
    this.backstageLayer.getCanvas().style.display = 'none';
    
    // add buffer layer
    this.bufferLayer.canvas.width = this.width;
    this.bufferLayer.canvas.height = this.height;
    this.container.appendChild(this.bufferLayer.canvas);
    
    // add backstage layer
    this.backstageLayer.canvas.width = this.width;
    this.backstageLayer.canvas.height = this.height;
    this.container.appendChild(this.backstageLayer.canvas);
    
    this._listen();
    this._prepareDrag();
    
    // add stage to global object
    var stages = Kinetic.GlobalObject.stages;
    stages.push(this);
    
    // set stage id
    this.id = Kinetic.GlobalObject.idCounter++;
    
    // animation support
    this.isAnimating = false;
    this.onFrameFunc = undefined;
    
    // call super constructor
    Kinetic.Container.apply(this, []);
};

/*
 * Stage methods
 */
Kinetic.Stage.prototype = {
    /**
     * sets onFrameFunc for animation
     */
    onFrame: function(func){
        this.onFrameFunc = func;
    },
    /**
     * start animation
     */
    start: function(){
        this.isAnimating = true;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * stop animation
     */
    stop: function(){
        this.isAnimating = false;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * draw children
     */
    draw: function(){
        this._drawChildren();
    },
    /**
     * disable layer rendering
     * @param {Layer} layer
     */
    _stripLayer: function(layer){
        layer.context.stroke = function(){
        };
        layer.context.fill = function(){
        };
        layer.context.fillRect = function(x, y, width, height){
            layer.context.rect(x, y, width, height);
        };
        layer.context.strokeRect = function(x, y, width, height){
            layer.context.rect(x, y, width, height);
        };
        layer.context.drawImage = function(){
        };
        layer.context.fillText = function(){
        };
        layer.context.strokeText = function(){
        };
    },
    /**
     * end drag and drop
     */
    _endDrag: function(evt){
        var go = Kinetic.GlobalObject;
        if (go.drag.node) {
            if (go.drag.moving) {
                go.drag.moving = false;
                go.drag.node._handleEvents("ondragend", evt);
            }
        }
        go.drag.node = undefined;
    },
    /**
     * prepare drag and drop
     */
    _prepareDrag: function(){
        var that = this;
        
        this.on("mousemove touchmove", function(evt){
            var go = Kinetic.GlobalObject;
            if (go.drag.node) {
                var pos = that.getUserPosition();
                if (go.drag.node.drag.x) {
                    go.drag.node.x = pos.x - go.drag.offset.x;
                }
                if (go.drag.node.drag.y) {
                    go.drag.node.y = pos.y - go.drag.offset.y;
                }
                go.drag.node.getLayer().draw();
                
                if (!go.drag.moving) {
                    go.drag.moving = true;
                    // execute dragstart events if defined
                    go.drag.node._handleEvents("ondragstart", evt);
                }
                // execute user defined ondragmove if defined
                go.drag.node._handleEvents("ondragmove", evt);
            }
        }, false);
        
        this.on("mouseup touchend mouseout", function(evt){
            that._endDrag(evt);
        });
    },
    /**
     * set stage size
     * @param {int} width
     * @param {int} height
     */
    setSize: function(width, height){
        var layers = this.children;
        for (var n = 0; n < layers.length; n++) {
            var layer = layers[n];
            layer.getCanvas().width = width;
            layer.getCanvas().height = height;
            layer.draw();
        }
        
        // set stage dimensions
        this.width = width;
        this.height = height;
        
        // set buffer layer and backstage layer sizes
        this.bufferLayer.getCanvas().width = width;
        this.bufferLayer.getCanvas().height = height;
        this.backstageLayer.getCanvas().width = width;
        this.backstageLayer.getCanvas().height = height;
    },
    /**
     * set stage scale
     * @param {int} scaleX
     * @param {int} scaleY
     */
    setScale: function(scaleX, scaleY){
        var oldScaleX = this.scale.x;
        var oldScaleY = this.scale.y;
        
        if (scaleY) {
            this.scale.x = scaleX;
            this.scale.y = scaleY;
        }
        else {
            this.scale.x = scaleX;
            this.scale.y = scaleX;
        }
        
        /*
         * scale all shape positions
         */
        var layers = this.children;
        var that = this;
        function scaleChildren(children){
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                child.x *= that.scale.x / oldScaleX;
                child.y *= that.scale.y / oldScaleY;
                if (child.children) {
                    scaleChildren(child.children);
                }
            }
        }
        
        scaleChildren(layers);
    },
    /**
     * get scale
     */
    getScale: function(){
        return this.scale;
    },
    /**
     * clear all layers
     */
    clear: function(){
        var layers = this.children;
        for (var n = 0; n < layers.length; n++) {
            layers[n].clear();
        }
    },
    /**
     * creates a composite data URL and passes it to a callback
     * @param {function} callback
     */
    toDataURL: function(callback){
        var bufferLayer = this.bufferLayer;
        var bufferContext = bufferLayer.getContext();
        var layers = this.children;
        
        function addLayer(n){
            var dataURL = layers[n].getCanvas().toDataURL();
            var imageObj = new Image();
            imageObj.onload = function(){
                bufferContext.drawImage(this, 0, 0);
                n++;
                if (n < layers.length) {
                    addLayer(n);
                }
                else {
                    callback(bufferLayer.getCanvas().toDataURL());
                }
            };
            imageObj.src = dataURL;
        }
        
        
        bufferLayer.clear();
        addLayer(0);
    },
    /**
     * remove layer from stage
     * @param {Layer} layer
     */
    remove: function(layer){
        // remove layer canvas from dom
        this.container.removeChild(layer.canvas);
        
        this._remove(layer);
    },
    /**
     * bind event listener to stage (which is essentially
     * the container DOM)
     * @param {string} type
     * @param {function} handler
     */
    on: function(typesStr, handler){
        var types = typesStr.split(" ");
        for (var n = 0; n < types.length; n++) {
            var baseEvent = types[n];
            this.container.addEventListener(baseEvent, handler, false);
        }
    },
    /** 
     * add layer to stage
     * @param {Layer} layer
     */
    add: function(layer){
        if (layer.name) {
            this.childrenNames[layer.name] = layer;
        }
        layer.canvas.width = this.width;
        layer.canvas.height = this.height;
        this._add(layer);
        
        // draw layer and append canvas to container
        layer.draw();
        this.container.appendChild(layer.canvas);
    },
    /**
     * handle incoming event
     * @param {Event} evt
     */
    _handleEvent: function(evt){
        if (!evt) {
            evt = window.event;
        }
        
        this._setMousePosition(evt);
        this._setTouchPosition(evt);
        
        var backstageLayer = this.backstageLayer;
        var backstageLayerContext = backstageLayer.getContext();
        var that = this;
        
        backstageLayer.clear();
        
        /*
         * loop through layers.  If at any point an event
         * is triggered, n is set to -1 which will break out of the
         * three nested loops
         */
        var targetFound = false;
        
        function detectEvent(shape){
            shape._draw(backstageLayer);
            var pos = that.getUserPosition();
            var el = shape.eventListeners;
            
            if (that.targetShape && shape.id === that.targetShape.id) {
                targetFound = true;
            }
            
            if (shape.visible && pos !== undefined && backstageLayerContext.isPointInPath(pos.x, pos.y)) {
                // handle onmousedown
                if (that.mouseDown) {
                    that.mouseDown = false;
                    that.clickStart = true;
                    shape._handleEvents("onmousedown", evt);
                    return true;
                }
                // handle onmouseup & onclick
                else if (that.mouseUp) {
                    that.mouseUp = false;
                    shape._handleEvents("onmouseup", evt);
                    
                    // detect if click or double click occurred
                    if (that.clickStart) {
                        /*
                         * if dragging and dropping, don't fire click or dbl click
                         * event
                         */
                        if ((!go.drag.moving) || !go.drag.node) {
                            shape._handleEvents("onclick", evt);
                            
                            if (shape.inDoubleClickWindow) {
                                shape._handleEvents("ondblclick", evt);
                            }
                            shape.inDoubleClickWindow = true;
                            setTimeout(function(){
                                shape.inDoubleClickWindow = false;
                            }, that.dblClickWindow);
                        }
                    }
                    return true;
                }
                
                // handle touchstart
                else if (that.touchStart) {
                    that.touchStart = false;
                    shape._handleEvents("touchstart", evt);
                    
                    if (el.ondbltap && shape.inDoubleClickWindow) {
                        var events = el.ondbltap;
                        for (var i = 0; i < events.length; i++) {
                            events[i].handler.apply(shape, [evt]);
                        }
                    }
                    
                    shape.inDoubleClickWindow = true;
                    
                    setTimeout(function(){
                        shape.inDoubleClickWindow = false;
                    }, that.dblClickWindow);
                    return true;
                }
                
                // handle touchend
                else if (that.touchEnd) {
                    that.touchEnd = false;
                    shape._handleEvents("touchend", evt);
                    return true;
                }
                
                // handle touchmove
                else if (el.touchmove) {
                    shape._handleEvents("touchmove", evt);
                    return true;
                }
                
                //this condition is used to identify a new target shape.
                else if (!that.targetShape || (!targetFound && shape.id !== that.targetShape.id)) {
                    /*
                     * check if old target has an onmouseout event listener
                     */
                    if (that.targetShape) {
                        var oldEl = that.targetShape.eventListeners;
                        if (oldEl) {
                            that.targetShape._handleEvents("onmouseout", evt);
                        }
                    }
                    
                    // set new target shape
                    that.targetShape = shape;
                    
                    // handle onmouseover
                    shape._handleEvents("onmouseover", evt);
                    return true;
                }
                
                // handle onmousemove
                else {
                    shape._handleEvents("onmousemove", evt);
                    return true;
                }
            }
            // handle mouseout condition
            else if (that.targetShape && that.targetShape.id === shape.id) {
                that.targetShape = undefined;
                shape._handleEvents("onmouseout", evt);
                return true;
            }
            
            return false;
        }
        
        function traverseChildren(obj){
            var children = obj.children;
            // propapgate backwards through children
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                if (child.className === "Shape") {
                    var exit = detectEvent(child);
                    if (exit) {
                        return true;
                    }
                }
                else {
                    traverseChildren(child);
                }
            }
            
            return false;
        }
        
        var go = Kinetic.GlobalObject;
        if (go.drag.node === undefined) {
            for (var n = this.children.length - 1; n >= 0; n--) {
                var layer = this.children[n];
                if (layer.visible && n >= 0 && layer.isListening) {
                    if (traverseChildren(layer)) {
                        n = -1;
                    }
                }
            }
        }
    },
    /**
     * begin listening for events by adding event handlers
     * to the container
     */
    _listen: function(){
        var that = this;
        
        // desktop events
        this.container.addEventListener("mousedown", function(evt){
            that.mouseDown = true;
            that._handleEvent(evt);
        }, false);
        
        this.container.addEventListener("mousemove", function(evt){
            that.mouseUp = false;
            that.mouseDown = false;
            that._handleEvent(evt);
        }, false);
        
        this.container.addEventListener("mouseup", function(evt){
            that.mouseUp = true;
            that.mouseDown = false;
            that._handleEvent(evt);
            
            that.clickStart = false;
        }, false);
        
        this.container.addEventListener("mouseover", function(evt){
            that._handleEvent(evt);
        }, false);
        
        this.container.addEventListener("mouseout", function(evt){
            that.mousePos = undefined;
        }, false);
        // mobile events
        this.container.addEventListener("touchstart", function(evt){
            evt.preventDefault();
            that.touchStart = true;
            that._handleEvent(evt);
        }, false);
        
        this.container.addEventListener("touchmove", function(evt){
            evt.preventDefault();
            that._handleEvent(evt);
        }, false);
        
        this.container.addEventListener("touchend", function(evt){
            evt.preventDefault();
            that.touchEnd = true;
            that._handleEvent(evt);
        }, false);
    },
    /**
     * get mouse position for desktop apps
     * @param {Event} evt
     */
    getMousePosition: function(evt){
        return this.mousePos;
    },
    /**
     * get touch position for mobile apps
     * @param {Event} evt
     */
    getTouchPosition: function(evt){
        return this.touchPos;
    },
    /**
     * get user position (mouse position or touch position)
     * @param {Event} evt
     */
    getUserPosition: function(evt){
        return this.getTouchPosition() || this.getMousePosition();
    },
    /**
     * set mouse positon for desktop apps
     * @param {Event} evt
     */
    _setMousePosition: function(evt){
        var mouseX = evt.clientX - this._getContainerPosition().left + window.pageXOffset;
        var mouseY = evt.clientY - this._getContainerPosition().top + window.pageYOffset;
        this.mousePos = {
            x: mouseX,
            y: mouseY
        };
    },
    /**
     * set touch position for mobile apps
     * @param {Event} evt
     */
    _setTouchPosition: function(evt){
        if (evt.touches !== undefined && evt.touches.length === 1) {// Only deal with
            // one finger
            var touch = evt.touches[0];
            // Get the information for finger #1
            var touchX = touch.clientX - this._getContainerPosition().left + window.pageXOffset;
            var touchY = touch.clientY - this._getContainerPosition().top + window.pageYOffset;
            
            this.touchPos = {
                x: touchX,
                y: touchY
            };
        }
    },
    /**
     * get container position
     */
    _getContainerPosition: function(){
        var obj = this.container;
        var top = 0;
        var left = 0;
        while (obj && obj.tagName !== "BODY") {
            top += obj.offsetTop;
            left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        return {
            top: top,
            left: left
        };
    },
    /**
     * get container DOM element
     */
    getContainer: function(){
        return this.container;
    },
    /**
     * get stage
     */
    getStage: function(){
        return this;
    },
    /**
     * get target shape
     */
    getTargetShape: function(){
        return this.targetShape;
    }
};
// extend Container
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container);

///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/** 
 * Layer constructor.  Layer extends Container and Node
 * @param {string} name
 */
Kinetic.Layer = function(config){
    this.className = "Layer";
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';
    
    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};
/*
 * Layer methods
 */
Kinetic.Layer.prototype = {
    /**
     * public draw children
     */
    draw: function(){
        this._draw();
    },
    /**
     * private draw children
     */
    _draw: function(){
        this.clear();
        if (this.visible) {
            this._drawChildren();
        }
    },
    /**
     * clear layer
     */
    clear: function(){
        var context = this.getContext();
        var canvas = this.getCanvas();
        context.clearRect(0, 0, canvas.width, canvas.height);
    },
    /**
     * get layer canvas
     */
    getCanvas: function(){
        return this.canvas;
    },
    /**
     * get layer context
     */
    getContext: function(){
        return this.context;
    },
    /**
     * add node to layer
     * @param {Node} node
     */
    add: function(child){
        this._add(child);
    },
    /**
     * remove a child from the layer
     * @param {Node} child
     */
    remove: function(child){
        this._remove(child);
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Group
///////////////////////////////////////////////////////////////////////

/**
 * Group constructor.  Group extends Container and Node
 * @param {String} name
 */
Kinetic.Group = function(config){
    this.className = "Group";
    
    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};

Kinetic.Group.prototype = {
    /**
     * draw children
     */
    _draw: function(){
        if (this.visible) {
            this._drawChildren();
        }
    },
    /**
     * add node to group
     * @param {Node} child
     */
    add: function(child){
        this._add(child);
    },
    /**
     * remove a child from the group
     * @param {Node} child
     */
    remove: function(child){
        this._remove(child);
    }
};

// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/**
 * Shape constructor
 * @param {Object} config
 */
Kinetic.Shape = function(config){
    this.className = "Shape";
    
    // defaults
    if (config.stroke !== undefined || config.strokeWidth !== undefined) {
        if (config.stroke === undefined) {
            config.stroke = "black";
        }
        else if (config.strokeWidth === undefined) {
            config.strokeWidth = 2;
        }
    }
    
    // required
    this.drawFunc = config.drawFunc;
    
    // call super constructor
    Kinetic.Node.apply(this, [config]);
};
/*
 * Shape methods
 */
Kinetic.Shape.prototype = {
    /**
     * get shape temp layer context
     */
    getContext: function(){
        return this.tempLayer.getContext();
    },
    /**
     * get shape temp layer canvas
     */
    getCanvas: function(){
        return this.tempLayer.getCanvas();
    },
    /**
     * draw shape
     * @param {Layer} layer
     */
    _draw: function(layer){
        if (this.visible) {
            var stage = layer.getStage();
            var context = layer.getContext();
            
            var family = [];
            
            family.unshift(this);
            var parent = this.parent;
            while (parent.className !== "Stage") {
                family.unshift(parent);
                parent = parent.parent;
            }
            
            // children transforms
            for (var n = 0; n < family.length; n++) {
                var obj = family[n];
                
                context.save();
                if (obj.x !== 0 || obj.y !== 0) {
                    context.translate(obj.x, obj.y);
                }
                if (obj.centerOffset.x !== 0 || obj.centerOffset.y !== 0) {
                    context.translate(obj.centerOffset.x, obj.centerOffset.y);
                }
                if (obj.rotation !== 0) {
                    context.rotate(obj.rotation);
                }
                if (obj.scale.x !== 1 || obj.scale.y !== 1) {
                    context.scale(obj.scale.x, obj.scale.y);
                }
                if (obj.centerOffset.x !== 0 || obj.centerOffset.y !== 0) {
                    context.translate(-1 * obj.centerOffset.x, -1 * obj.centerOffset.y);
                }
                if (obj.getAbsoluteAlpha() !== 1) {
                    context.globalAlpha = obj.getAbsoluteAlpha();
                }
            }
            
            // stage transform
            context.save();
            if (stage && (stage.scale.x !== 1 || stage.scale.y !== 1)) {
                context.scale(stage.scale.x, stage.scale.y);
            }
            
            this.tempLayer = layer;
            this.drawFunc.call(this);
            
            // children restore
            for (var i = 0; i < family.length; i++) {
                context.restore();
            }
            
            // stage restore
            context.restore();
        }
    },
    fillStroke: function(){
        var context = this.getContext();
        
        if (this.fill !== undefined) {
            context.fillStyle = this.fill;
            context.fill();
        }
        if (this.stroke !== undefined) {
            context.lineWidth = this.strokeWidth === undefined ? 1 : this.strokeWidth;
            context.strokeStyle = this.stroke;
            context.stroke();
        }
    },
    /*
     * set fill which can be a color, gradient object,
     * or pattern object
     */
    setFill: function(fill){
        this.fill = fill;
    },
    /*
     * get fill
     */
    getFill: function(){
        return this.fill;
    },
    /*
     * set stroke color
     */
    setStroke: function(stroke){
        this.stroke = stroke;
    },
    /*
     * get stroke
     */
    getStroke: function(){
        return this.stroke;
    },
    /*
     * set stroke width
     */
    setStrokeWidth: function(strokeWidth){
        this.strokeWidth = strokeWidth;
    },
    /*
     * get stroke width
     */
    getStrokeWidth: function(){
        return this.strokeWidth;
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Rect
///////////////////////////////////////////////////////////////////////
/**
 * Rect constructor
 * @param {Object} config
 */
Kinetic.Rect = function(config){
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.rect(0, 0, this.width, this.height);
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Rect methods
 */
Kinetic.Rect.prototype = {
    setWidth: function(width){
        this.width = width;
    },
    getWidth: function(){
        return this.width;
    },
    setHeight: function(height){
        this.height = height;
    },
    getHeight: function(){
        return this.height;
    },
    /**
     * set width and height
     * @param {number} width
     * @param {number} height
     */
    setSize: function(width, height){
        this.width = width;
        this.height = height;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Rect, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Circle
///////////////////////////////////////////////////////////////////////
/**
 * Circle constructor
 * @param {Object} config
 */
Kinetic.Circle = function(config){
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Circle methods
 */
Kinetic.Circle.prototype = {
    setRadius: function(radius){
        this.radius = radius;
    },
    getRadius: function(){
        return this.radius;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Circle, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
/**
 * Image constructor
 * @param {Object} config
 */
Kinetic.Image = function(config){
    // defaults
    if (config.width === undefined) {
        config.width = config.image.width;
    }
    if (config.height === undefined) {
        config.height = config.image.height;
    }
    
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.rect(0, 0, this.width, this.height);
        context.closePath();
        this.fillStroke();
        context.drawImage(this.image, 0, 0, this.width, this.height);
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

Kinetic.Image.prototype = {
    setImage: function(image){
        this.image = image;
    },
    getImage: function(image){
        return this.image;
    },
    setWidth: function(width){
        this.width = width;
    },
    getWidth: function(){
        return this.width;
    },
    setHeight: function(height){
        this.height = height;
    },
    getHeight: function(){
        return this.height;
    },
    /**
     * set width and height
     * @param {number} width
     * @param {number} height
     */
    setSize: function(width, height){
        this.width = width;
        this.height = height;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Polygon
///////////////////////////////////////////////////////////////////////
/**
 * Polygon constructor
 * @param {Object} config
 */
Kinetic.Polygon = function(config){
    config.drawFunc = function(){
        var context = this.getContext();
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (var n = 1; n < this.points.length; n++) {
            context.lineTo(this.points[n].x, this.points[n].y);
        }
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Polygon methods
 */
Kinetic.Polygon.prototype = {
    setPoints: function(points){
        this.points = points;
    },
    getPoints: function(){
        return this.points;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Polygon, Kinetic.Shape);


///////////////////////////////////////////////////////////////////////
//  RegularPolygon
///////////////////////////////////////////////////////////////////////
/**
 * Polygon constructor
 * @param {Object} config
 */
Kinetic.RegularPolygon = function(config){
    config.drawFunc = function(){
        var context = this.getContext();
        context.beginPath();
        context.moveTo(0, 0 - this.radius);
        
        for (var n = 1; n < this.sides; n++) {
            var x = this.radius * Math.sin(n * 2 * Math.PI / this.sides);
            var y = -1 * this.radius * Math.cos(n * 2 * Math.PI / this.sides);
            context.lineTo(x, y);
        }
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * RegularPolygon methods
 */
Kinetic.RegularPolygon.prototype = {
    setPoints: function(points){
        this.points = points;
    },
    getPoints: function(){
        return this.points;
    },
    setRadius: function(radius){
        this.radius = radius;
    },
    getRadius: function(){
        return this.radius;
    },
    setSides: function(sides){
        this.sides = sides;
    },
    getSides: function(){
        return this.sides;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.RegularPolygon, Kinetic.Shape);


///////////////////////////////////////////////////////////////////////
//  Star
///////////////////////////////////////////////////////////////////////
/**
 * Star constructor
 * @param {Object} config
 */
Kinetic.Star = function(config){
    config.drawFunc = function(){
        var context = this.getContext();
        context.beginPath();
        context.moveTo(0, 0 - this.outerRadius);
        
        for (var n = 1; n < this.points * 2; n++) {
            var radius = n % 2 === 0 ? this.outerRadius : this.innerRadius;
            var x = radius * Math.sin(n * Math.PI / this.points);
            var y = -1 * radius * Math.cos(n * Math.PI / this.points);
            context.lineTo(x, y);
        }
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Star methods
 */
Kinetic.Star.prototype = {
    setPoints: function(points){
        this.points = points;
    },
    getPoints: function(){
        return this.points;
    },
    setOuterRadius: function(radius){
        this.outerRadius = radius;
    },
    getOuterRadius: function(){
        return this.outerRadius;
    },
    setInnerRadius: function(radius){
        this.innerRadius = radius;
    },
    getInnerRadius: function(){
        return this.innerRadius;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Star, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/**
 * Text constructor
 * @param {Object} config
 */
Kinetic.Text = function(config){

    /*
     * defaults
     */
    if (config.textStroke !== undefined || config.textStrokeWidth !== undefined) {
        if (config.textStroke === undefined) {
            config.textStroke = "black";
        }
        else if (config.textStrokeWidth === undefined) {
            config.textStrokeWidth = 2;
        }
    }
    if (config.align === undefined) {
        config.align = "left";
    }
    if (config.verticalAlign === undefined) {
        config.verticalAlign = "top";
    }
    if (config.padding === undefined) {
        config.padding = 0;
    }
    
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.font = this.fontSize + "pt " + this.fontFamily;
        context.textBaseline = "middle";
        var metrics = context.measureText(this.text);
        var textHeight = this.fontSize;
        var textWidth = metrics.width;
        var p = this.padding;
        var x = 0;
        var y = 0;
        
        switch (this.align) {
            case "center":
                x = textWidth / -2 - p;
                break;
            case "right":
                x = -1 * textWidth - p;
                break;
        }
        
        switch (this.verticalAlign) {
            case "middle":
                y = textHeight / -2 - p;
                break;
            case "bottom":
                y = -1 * textHeight - p;
                break;
        }
        
        // draw path
        context.save();
        context.beginPath();
        context.rect(x, y, textWidth + p * 2, textHeight + p * 2);
        context.closePath();
        this.fillStroke();
        context.restore();
        
        var tx = p + x;
        var ty = textHeight / 2 + p + y;
        
        // draw text
        if (this.textFill !== undefined) {
            context.fillStyle = this.textFill;
            context.fillText(this.text, tx, ty);
        }
        if (this.textStroke !== undefined || this.textStrokeWidth !== undefined) {
            // defaults
            if (this.textStroke === undefined) {
                this.textStroke = "black";
            }
            else if (this.textStrokeWidth === undefined) {
                this.textStrokeWidth = 2;
            }
            context.lineWidth = this.textStrokeWidth;
            context.strokeStyle = this.textStroke;
            context.strokeText(this.text, tx, ty);
        }
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Text methods
 */
Kinetic.Text.prototype = {
    setFontFamily: function(fontFamily){
        this.fontFamily = fontFamily;
    },
    getFontFamily: function(){
        return this.fontFamily;
    },
    setFontSize: function(fontSize){
        this.fontSize = fontSize;
    },
    getFontSize: function(){
        return this.fontSize;
    },
    setTextFill: function(textFill){
        this.textFill = textFill;
    },
    getTextFill: function(){
        return this.textFill;
    },
    setTextStroke: function(textStroke){
        this.textStroke = textStroke;
    },
    getTextStroke: function(){
        return this.textStroke;
    },
    setTextStrokeWidth: function(textStrokeWidth){
        this.textStrokeWidth = textStrokeWidth;
    },
    getTextStrokeWidth: function(){
        return this.textStrokeWidth;
    },
    setPadding: function(padding){
        this.padding = padding;
    },
    getPadding: function(){
        return this.padding;
    },
    setAlign: function(align){
        this.align = align;
    },
    getAlign: function(){
        return this.align;
    },
    setVerticalAlign: function(verticalAlign){
        this.verticalAlign = verticalAlign;
    },
    getVerticalAlign: function(){
        return this.verticalAlign;
    },
    setText: function(text){
        this.text = text;
    },
    getText: function(){
        return this.text;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Text, Kinetic.Shape);
