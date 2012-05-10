/**
 * KineticJS JavaScript Library core
 * http://www.kineticjs.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: May 09 2012
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
/**
 * Kinetic Namespace
 * @namespace
 */
var Kinetic = {};
/**
 * Kinetic Global Object
 * @property {Object} GlobalObjet
 */
Kinetic.GlobalObject = {
    stages: [],
    idCounter: 0,
    tempNodes: [],
    animations: [],
    animIdCounter: 0,
    animRunning: false,
    dragTimeInterval: 0,
    maxDragTimeInterval: 20,
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
        },
        lastDrawTime: 0
    },
    extend: function(obj1, obj2) {
        for(var key in obj2.prototype) {
            if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    _pullNodes: function(stage) {
        var tempNodes = this.tempNodes;
        for(var n = 0; n < tempNodes.length; n++) {
            var node = tempNodes[n];
            if(node.getStage() !== undefined && node.getStage()._id === stage._id) {
                stage._addId(node);
                stage._addName(node);
                this.tempNodes.splice(n, 1);
                n -= 1;
            }
        }
    },
    /*
     * animation support
     */
    _addAnimation: function(anim) {
        anim.id = this.animIdCounter++;
        this.animations.push(anim);
    },
    _removeAnimation: function(anim) {
        var id = anim.id;
        var animations = this.animations;
        for(var n = 0; n < animations.length; n++) {
            if(animations[n].id === id) {
                this.animations.splice(n, 1);
                return false;
            }
        }
    },
    _runFrames: function() {
        var nodes = {};
        for(var n = 0; n < this.animations.length; n++) {
            var anim = this.animations[n];
            if(anim.node && anim.node._id !== undefined) {
                nodes[anim.node._id] = anim.node;
            }
            anim.func(this.frame);
        }

        for(var key in nodes) {
            nodes[key].draw();
        }
    },
    _updateFrameObject: function() {
        var date = new Date();
        var time = date.getTime();
        if(this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        }
        else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function() {
        if(this.animations.length > 0) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function() {
                that._animationLoop();
            });
        }
        else {
            this.animRunning = false;
            this.frame.lastTime = 0;
        }
    },
    _handleAnimation: function() {
        var that = this;
        if(!this.animRunning) {
            this.animRunning = true;
            that._animationLoop();
        }
        else {
            this.frame.lastTime = 0;
        }
    },
    /*
     * utilities
     */
    _isElement: function(obj) {
        return !!(obj && obj.nodeType == 1);
    },
    _isFunction: function(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isArray: function(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    },
    _isObject: function(obj) {
        return obj === Object(obj);
    },
    _getPoint: function(arg) {
        if(arg.length === 1) {
            return arg[0];
        }
        else {
            return {
                x: arg[0],
                y: arg[1]
            }
        }
    }
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

///////////////////////////////////////////////////////////////////////
//  Node
///////////////////////////////////////////////////////////////////////
/**
 * Node constructor.&nbsp; Nodes are entities that can move around
 * and have events bound to them.  They are the building blocks of a KineticJS
 * application
 * @constructor
 * @param {Object} config
 */
Kinetic.Node = function(config) {
    this.setDefaultAttrs({
        visible: true,
        listening: true,
        name: undefined,
        alpha: 1,
        x: 0,
        y: 0,
        scale: {
            x: 1,
            y: 1
        },
        rotation: 0,
        centerOffset: {
            x: 0,
            y: 0
        },
        dragConstraint: 'none',
        dragBounds: {},
        draggable: false
    });

    this.eventListeners = {};
    this.setAttrs(config);
};
/*
 * Node methods
 */
Kinetic.Node.prototype = {
    /**
     * bind events to the node.  KineticJS supports mouseover, mousemove,
     * mouseout, mousedown, mouseup, click, dblclick, touchstart, touchmove,
     * touchend, dbltap, dragstart, dragmove, and dragend.  Pass in a string
     * of event types delimmited by a space to bind multiple events at once
     * such as 'mousedown mouseup mousemove'. include a namespace to bind an
     * event by name such as 'click.foobar'.
     * @param {String} typesStr
     * @param {function} handler
     */
    on: function(typesStr, handler) {
        var types = typesStr.split(' ');
        /*
         * loop through types and attach event listeners to
         * each one.  eg. 'click mouseover.namespace mouseout'
         * will create three event bindings
         */
        for(var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split('.');
            var baseEvent = parts[0];
            var name = parts.length > 1 ? parts[1] : '';

            if(!this.eventListeners[baseEvent]) {
                this.eventListeners[baseEvent] = [];
            }

            this.eventListeners[baseEvent].push({
                name: name,
                handler: handler
            });
        }
    },
    /**
     * remove event bindings from the node.  Pass in a string of
     * event types delimmited by a space to remove multiple event
     * bindings at once such as 'mousedown mouseup mousemove'.
     * include a namespace to remove an event binding by name
     * such as 'click.foobar'.
     * @param {String} typesStr
     */
    off: function(typesStr) {
        var types = typesStr.split(' ');

        for(var n = 0; n < types.length; n++) {
            var type = types[n];
            var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var parts = event.split('.');
            var baseEvent = parts[0];

            if(this.eventListeners[baseEvent] && parts.length > 1) {
                var name = parts[1];

                for(var i = 0; i < this.eventListeners[baseEvent].length; i++) {
                    if(this.eventListeners[baseEvent][i].name === name) {
                        this.eventListeners[baseEvent].splice(i, 1);
                        if(this.eventListeners[baseEvent].length === 0) {
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
     * get attrs
     */
    getAttrs: function() {
        return this.attrs;
    },
    /**
     * set default attrs
     * @param {Object} confic
     */
    setDefaultAttrs: function(config) {
        // create attrs object if undefined
        if(this.attrs === undefined) {
            this.attrs = {};
        }

        if(config) {
            for(var key in config) {
                var val = config[key];
                this.attrs[key] = config[key];
            }
        }
    },
    /**
     * set attrs
     * @param {Object} config
     */
    setAttrs: function(config) {
        var go = Kinetic.GlobalObject;
        // set properties from config
        if(config) {
            for(var key in config) {
                var val = config[key];

                /*
                 * add functions, DOM elements, and images
                 * directly to the node
                 */
                if(go._isFunction(val) || go._isElement(val)) {
                    this[key] = val;
                }
                /*
                 * add all other object types to attrs object
                 */
                else {
                    // handle special keys
                    switch (key) {
                        /*
                         * config properties that require a method to
                         * be set
                         */
                        case 'draggable':
                            this.draggable(config[key]);
                            break;
                        case 'listening':
                            this.listen(config[key]);
                            break;
                        case 'rotationDeg':
                            this.attrs.rotation = config[key] * Math.PI / 180;
                            break;
                        /*
                         * config objects
                         */
                        case 'centerOffset':
                            this._setPointAttr(key, val);
                            break;
                        case 'scale':
                            this._setPointAttr(key, val);
                            break;
                        case 'points':
                            /*
                             * if points contains an array of object, just set
                             * the attr normally
                             */
                            if(Kinetic.GlobalObject._isObject(val[0])) {
                                this.attrs[key] = config[key];
                            }
                            else {
                                /*
                                 * convert array of numbers into an array
                                 * of objects containing x, y
                                 */
                                var arr = [];
                                for(var n = 0; n < val.length; n += 2) {
                                    arr.push({
                                        x: val[n],
                                        y: val[n + 1]
                                    });
                                }
                                this.attrs[key] = arr;
                            }
                            break;
                        case 'crop':
                            this._setPointAttr(key, val);
                            if(val.width !== undefined) {
                                this.attrs[key].width = val.width;
                            }
                            if(val.height !== undefined) {
                                this.attrs[key].height = val.height;
                            }
                            break;
                        default:
                            this.attrs[key] = config[key];
                            break;
                    }
                }
            }
        }
    },
    /**
     * determine if shape is visible or not
     */
    isVisible: function() {
        return this.attrs.visible;
    },
    /**
     * show node
     */
    show: function() {
        this.attrs.visible = true;
    },
    /**
     * hide node
     */
    hide: function() {
        this.attrs.visible = false;
    },
    /**
     * get zIndex
     */
    getZIndex: function() {
        return this.index;
    },
    /**
     * get absolute z-index by taking into account
     * all parent and sibling indices
     */
    getAbsoluteZIndex: function() {
        var level = this.getLevel();
        var stage = this.getStage();
        var that = this;
        var index = 0;
        function addChildren(children) {
            var nodes = [];
            for(var n = 0; n < children.length; n++) {
                var child = children[n];
                index++;

                if(child.nodeType !== 'Shape') {
                    nodes = nodes.concat(child.getChildren());
                }

                if(child._id === that._id) {
                    n = children.length;
                }
            }

            if(nodes.length > 0 && nodes[0].getLevel() <= level) {
                addChildren(nodes);
            }
        }
        if(that.nodeType !== 'Stage') {
            addChildren(that.getStage().getChildren());
        }

        return index;
    },
    /**
     * get node level in node tree
     */
    getLevel: function() {
        var level = 0;
        var parent = this.parent;
        while(parent) {
            level++;
            parent = parent.parent;
        }
        return level;
    },
    /**
     * set node scale.  If only one parameter is passed in,
     * then both scaleX and scaleY are set with that parameter
     * @param {Number} scaleX
     * @param {Number} scaleY
     */
    setScale: function(scaleX, scaleY) {
        if(scaleY) {
            this.attrs.scale.x = scaleX;
            this.attrs.scale.y = scaleY;
        }
        else {
            this.attrs.scale.x = scaleX;
            this.attrs.scale.y = scaleX;
        }
    },
    /**
     * get scale
     */
    getScale: function() {
        return this.attrs.scale;
    },
    /**
     * set node position
     * @param {Object} point
     */
    setPosition: function() {
        var pos = Kinetic.GlobalObject._getPoint(arguments);
        this.attrs.x = pos.x;
        this.attrs.y = pos.y;
    },
    /**
     * set node x position
     * @param {Number} x
     */
    setX: function(x) {
        this.attrs.x = x;
    },
    /**
     * set node y position
     * @param {Number} y
     */
    setY: function(y) {
        this.attrs.y = y;
    },
    /**
     * get node x position
     */
    getX: function() {
        return this.attrs.x;
    },
    /**
     * get node y position
     */
    getY: function() {
        return this.attrs.y;
    },
    /**
     * set detection type
     * @param {String} type can be "path" or "pixel"
     */
    setDetectionType: function(type) {
        this.attrs.detectionType = type;
    },
    /**
     * get detection type
     */
    getDetectionType: function() {
        return this.attrs.detectionType;
    },
    /**
     * get node position relative to container
     */
    getPosition: function() {
        return {
            x: this.attrs.x,
            y: this.attrs.y
        };
    },
    /**
     * get absolute position relative to stage
     */
    getAbsolutePosition: function() {
        return this.getAbsoluteTransform().getTranslation();
    },
    /**
     * set absolute position relative to stage
     * @param {Object} pos object containing an x and
     *  y property
     */
    setAbsolutePosition: function() {
        var pos = Kinetic.GlobalObject._getPoint(arguments);
        /*
         * save rotation and scale and
         * then remove them from the transform
         */
        var rot = this.attrs.rotation;
        var scale = {
            x: this.attrs.scale.x,
            y: this.attrs.scale.y
        };
        var centerOffset = {
            x: this.attrs.centerOffset.x,
            y: this.attrs.centerOffset.y
        };

        this.attrs.rotation = 0;
        this.attrs.scale = {
            x: 1,
            y: 1
        };

        /*
        this.attrs.centerOffset = {
        x: 0,
        y: 0
        };
        */

        //this.move(-1 * this.attrs.centerOffset.x, -1 * this.attrs.centerOffset.y);

        // unravel transform
        var it = this.getAbsoluteTransform();
        it.invert();
        it.translate(pos.x, pos.y);
        pos = {
            x: this.attrs.x + it.getTranslation().x,
            y: this.attrs.y + it.getTranslation().y
        };

        this.setPosition(pos.x, pos.y);

        //this.move(-1* this.attrs.centerOffset.x, -1* this.attrs.centerOffset.y);

        // restore rotation and scale
        this.rotate(rot);
        this.attrs.scale = {
            x: scale.x,
            y: scale.y
        };

    },
    /**
     * move node by an amount
     * @param {Number} x
     * @param {Number} y
     */
    move: function(x, y) {
        this.attrs.x += x;
        this.attrs.y += y;
    },
    /**
     * set node rotation in radians
     * @param {Number} theta
     */
    setRotation: function(theta) {
        this.attrs.rotation = theta;
    },
    /**
     * set node rotation in degrees
     * @param {Number} deg
     */
    setRotationDeg: function(deg) {
        this.attrs.rotation = (deg * Math.PI / 180);
    },
    /**
     * get rotation in radians
     */
    getRotation: function() {
        return this.attrs.rotation;
    },
    /**
     * get rotation in degrees
     */
    getRotationDeg: function() {
        return this.attrs.rotation * 180 / Math.PI;
    },
    /**
     * rotate node by an amount in radians
     * @param {Number} theta
     */
    rotate: function(theta) {
        this.attrs.rotation += theta;
    },
    /**
     * rotate node by an amount in degrees
     * @param {Number} deg
     */
    rotateDeg: function(deg) {
        this.attrs.rotation += (deg * Math.PI / 180);
    },
    /**
     * listen or don't listen to events
     * @param {Boolean} listening
     */
    listen: function(listening) {
        this.attrs.listening = listening;
    },
    /**
     * move node to top
     */
    moveToTop: function() {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent._setChildrenIndices();
    },
    /**
     * move node up
     */
    moveUp: function() {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(index + 1, 0, this);
        this.parent._setChildrenIndices();
    },
    /**
     * move node down
     */
    moveDown: function() {
        var index = this.index;
        if(index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent._setChildrenIndices();
        }
    },
    /**
     * move node to bottom
     */
    moveToBottom: function() {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.unshift(this);
        this.parent._setChildrenIndices();
    },
    /**
     * set zIndex
     * @param {int} zIndex
     */
    setZIndex: function(zIndex) {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(zIndex, 0, this);
        this.parent._setChildrenIndices();
    },
    /**
     * set alpha.  Alpha values range from 0 to 1.
     * A node with an alpha of 0 is fully transparent, and a node
     * with an alpha of 1 is fully opaque
     * @param {Object} alpha
     */
    setAlpha: function(alpha) {
        this.attrs.alpha = alpha;
    },
    /**
     * get alpha.  Alpha values range from 0 to 1.
     * A node with an alpha of 0 is fully transparent, and a node
     * with an alpha of 1 is fully opaque
     */
    getAlpha: function() {
        return this.attrs.alpha;
    },
    /**
     * get absolute alpha
     */
    getAbsoluteAlpha: function() {
        var absAlpha = 1;
        var node = this;
        // traverse upwards
        while(node.nodeType !== 'Stage') {
            absAlpha *= node.attrs.alpha;
            node = node.parent;
        }
        return absAlpha;
    },
    /**
     * enable or disable drag and drop
     * @param {Boolean} isDraggable
     */
    draggable: function(isDraggable) {
        if(this.attrs.draggable !== isDraggable) {
            if(isDraggable) {
                this._initDrag();
            }
            else {
                this._dragCleanup();
            }
            this.attrs.draggable = isDraggable;
        }
    },
    /**
     * determine if node is currently in drag and drop mode
     */
    isDragging: function() {
        var go = Kinetic.GlobalObject;
        return go.drag.node !== undefined && go.drag.node._id === this._id && go.drag.moving;
    },
    /**
     * move node to another container
     * @param {Container} newContainer
     */
    moveTo: function(newContainer) {
        var parent = this.parent;
        // remove from parent's children
        parent.children.splice(this.index, 1);
        parent._setChildrenIndices();

        // add to new parent
        newContainer.children.push(this);
        this.index = newContainer.children.length - 1;
        this.parent = newContainer;
        newContainer._setChildrenIndices();
    },
    /**
     * get parent container
     */
    getParent: function() {
        return this.parent;
    },
    /**
     * get layer associated to node
     */
    getLayer: function() {
        if(this.nodeType === 'Layer') {
            return this;
        }
        else {
            return this.getParent().getLayer();
        }
    },
    /**
     * get stage associated to node
     */
    getStage: function() {
        if(this.nodeType === 'Stage') {
            return this;
        }
        else {
            if(this.getParent() === undefined) {
                return undefined;
            }
            else {
                return this.getParent().getStage();
            }
        }
    },
    /**
     * get name
     */
    getName: function() {
        return this.attrs.name;
    },
    /**
     * set center offset
     * @param {Number} x
     * @param {Number} y
     */
    setCenterOffset: function() {
    	var pos = Kinetic.GlobalObject._getPoint(arguments);
        this.attrs.centerOffset.x = pos.x;
        this.attrs.centerOffset.y = pos.y;
    },
    /**
     * get center offset
     */
    getCenterOffset: function() {
        return this.attrs.centerOffset;
    },
    /**
     * transition node to another state.  Any property that can accept a real
     *  number can be transitioned, including x, y, rotation, alpha, strokeWidth,
     *  radius, scale.x, scale.y, centerOffset.x, centerOffset.y, etc.
     * @param {Object} config
     * @config {Number} [duration] duration that the transition runs in seconds
     * @config {String} [easing] easing function.  can be linear, ease-in, ease-out, ease-in-out,
     *  back-ease-in, back-ease-out, back-ease-in-out, elastic-ease-in, elastic-ease-out,
     *  elastic-ease-in-out, bounce-ease-out, bounce-ease-in, bounce-ease-in-out,
     *  strong-ease-in, strong-ease-out, or strong-ease-in-out
     *  linear is the default
     * @config {Function} [callback] callback function to be executed when
     *  transition completes
     */
    transitionTo: function(config) {
        var go = Kinetic.GlobalObject;

        /*
         * clear transition if one is currently running for this
         * node
         */
        if(this.transAnim !== undefined) {
            go._removeAnimation(this.transAnim);
            this.transAnim = undefined;
        }

        /*
         * create new transition
         */
        var node = this.nodeType === 'Stage' ? this : this.getLayer();
        var that = this;
        var trans = new Kinetic.Transition(this, config);
        var anim = {
            func: function() {
                trans.onEnterFrame();
            },
            node: node
        };

        // store reference to transition animation
        this.transAnim = anim;

        /*
         * adding the animation with the addAnimation
         * method auto generates an id
         */
        go._addAnimation(anim);

        // subscribe to onFinished for first tween
        trans.onFinished = function() {
            // remove animation
            go._removeAnimation(anim);
            that.transAnim = undefined;

            // callback
            if(config.callback !== undefined) {
                config.callback();
            }

            anim.node.draw();
        };
        // auto start
        trans.start();

        go._handleAnimation();

        return trans;
    },
    /**
     * set drag constraint
     * @param {String} constraint
     */
    setDragConstraint: function(constraint) {
        this.attrs.dragConstraint = constraint;
    },
    /**
     * get drag constraint
     */
    getDragConstraint: function() {
        return this.attrs.dragConstraint;
    },
    /**
     * set drag bounds
     * @param {Object} bounds
     * @config {Number} [left] left bounds position
     * @config {Number} [top] top bounds position
     * @config {Number} [right] right bounds position
     * @config {Number} [bottom] bottom bounds position
     */
    setDragBounds: function(bounds) {
        this.attrs.dragBounds = bounds;
    },
    /**
     * get drag bounds
     */
    getDragBounds: function() {
        return this.attrs.dragBounds;
    },
    /**
     * get transform of the node while taking into
     * account the transforms of its parents
     */
    getAbsoluteTransform: function() {
        // absolute transform
        var am = new Kinetic.Transform();

        var family = [];
        var parent = this.parent;

        family.unshift(this);
        while(parent) {
            family.unshift(parent);
            parent = parent.parent;
        }

        for(var n = 0; n < family.length; n++) {
            var node = family[n];
            var m = node.getTransform();

            am.multiply(m);
        }

        return am;
    },
    /**
     * get transform of the node while not taking
     * into account the transforms of its parents
     */
    getTransform: function() {
        var m = new Kinetic.Transform();

        if(this.attrs.x !== 0 || this.attrs.y !== 0) {
            m.translate(this.attrs.x, this.attrs.y);
        }
        if(this.attrs.rotation !== 0) {
            m.rotate(this.attrs.rotation);
        }
        if(this.attrs.scale.x !== 1 || this.attrs.scale.y !== 1) {
            m.scale(this.attrs.scale.x, this.attrs.scale.y);
        }

        return m;
    },
    /**
     * initialize drag and drop
     */
    _initDrag: function() {
        this._dragCleanup();
        var go = Kinetic.GlobalObject;
        var that = this;
        this.on('mousedown.initdrag touchstart.initdrag', function(evt) {
            var stage = that.getStage();
            var pos = stage.getUserPosition();

            if(pos) {
                var m = that.getTransform().getTranslation();
                var am = that.getAbsoluteTransform().getTranslation();
                go.drag.node = that;
                go.drag.offset.x = pos.x - that.getAbsoluteTransform().getTranslation().x;
                go.drag.offset.y = pos.y - that.getAbsoluteTransform().getTranslation().y;
            }
        });
    },
    /**
     * remove drag and drop event listener
     */
    _dragCleanup: function() {
        this.off('mousedown.initdrag');
        this.off('touchstart.initdrag');
    },
    /**
     * handle node events
     * @param {String} eventType
     * @param {Event} evt
     */
    _handleEvents: function(eventType, evt) {
        if(this.nodeType === 'Shape') {
            evt.shape = this;
        }
        var stage = this.getStage();
        this._handleEvent(this, stage.mouseoverShape, stage.mouseoutShape, eventType, evt);
    },
    /**
     * handle node event
     */
    _handleEvent: function(node, mouseoverNode, mouseoutNode, eventType, evt) {
        var el = node.eventListeners;
        var okayToRun = true;

        /*
         * determine if event handler should be skipped by comparing
         * parent nodes
         */
        if(eventType === 'onmouseover' && mouseoutNode && mouseoutNode._id === node._id) {
            okayToRun = false;
        }
        else if(eventType === 'onmouseout' && mouseoverNode && mouseoverNode._id === node._id) {
            okayToRun = false;
        }

        if(el[eventType] && okayToRun) {
            var events = el[eventType];
            for(var i = 0; i < events.length; i++) {
                events[i].handler.apply(node, [evt]);
            }
        }

        var mouseoverParent = mouseoverNode ? mouseoverNode.parent : undefined;
        var mouseoutParent = mouseoutNode ? mouseoutNode.parent : undefined;

        // simulate event bubbling
        if(!evt.cancelBubble && node.parent.nodeType !== 'Stage') {
            this._handleEvent(node.parent, mouseoverParent, mouseoutParent, eventType, evt);
        }
    },
    /**
     * set point attr
     */
    _setPointAttr: function(key, val) {
        if(Kinetic.GlobalObject._isArray(val)) {
            // val is an array
            this.attrs[key].x = val[0];
            this.attrs[key].y = val[1];
        }
        else {
            // val is an object
            if(val.x !== undefined) {
                this.attrs[key].x = val.x;
            }
            if(val.y !== undefined) {
                this.attrs[key].y = val.y;
            }
        }
    }
};

///////////////////////////////////////////////////////////////////////
//  Container
///////////////////////////////////////////////////////////////////////

/**
 * Container constructor.&nbsp; Containers are used to contain nodes or other containers
 * @constructor
 */
Kinetic.Container = function() {
    this.children = [];
};
/*
 * Container methods
 */
Kinetic.Container.prototype = {
    /**
     * get children
     */
    getChildren: function() {
        return this.children;
    },
    /**
     * remove all children
     */
    removeChildren: function() {
        while(this.children.length > 0) {
            this.remove(this.children[0]);
        }
    },
    /**
     * remove child from container
     * @param {Node} child
     */ 
    _remove: function(child) {
        if(child.index !== undefined && this.children[child.index]._id == child._id) {
            var stage = this.getStage();
            if(stage !== undefined) {
                stage._removeId(child);
                stage._removeName(child);
            }

            var go = Kinetic.GlobalObject;
            for(var n = 0; n < go.tempNodes.length; n++) {
                var node = go.tempNodes[n];
                if(node._id === child._id) {
                    go.tempNodes.splice(n, 1);
                    n = go.tempNodes.length;
                }
            }

            this.children.splice(child.index, 1);
            this._setChildrenIndices();
            child = undefined;
        }
    },
    /**
     * return an array of nodes that match the selector.  Use '#' for id selections
     * and '.' for name selections
     * ex:
     * var node = stage.get('#foo'); // selects node with id foo
     * var nodes = layer.get('.bar'); // selects nodes with name bar inside layer
     * @param {String} selector
     */
    get: function(selector) {
        var stage = this.getStage();
        var arr;
        var key = selector.slice(1);
        if(selector.charAt(0) === '#') {
            arr = stage.ids[key] !== undefined ? [stage.ids[key]] : [];
        }
        else if(selector.charAt(0) === '.') {
            arr = stage.names[key] !== undefined ? stage.names[key] : [];
        }
        else if(selector === 'Shape' || selector === 'Group' || selector === 'Layer') {
            return this._getNodes(selector);
        }
        else {
            return false;
        }

        var retArr = [];
        for(var n = 0; n < arr.length; n++) {
            var node = arr[n];
            if(this.isAncestorOf(node)) {
                retArr.push(node);
            }
        }

        return retArr;
    },
    /**
     * determine if node is an ancestor
     * of descendant
     * @param {Kinetic.Node} node
     */
    isAncestorOf: function(node) {
        if(this.nodeType === 'Stage') {
            return true;
        }

        var parent = node.getParent();
        while(parent) {
            if(parent._id === this._id) {
                return true;
            }
            parent = parent.getParent();
        }

        return false;
    },
    /**
     * get all shapes inside container
     */
    _getNodes: function(sel) {
        var arr = [];
        function traverse(cont) {
            var children = cont.getChildren();
            for(var n = 0; n < children.length; n++) {
                var child = children[n];
                if(child.nodeType === sel) {
                    arr.push(child);
                }
                else if(child.nodeType !== 'Shape') {
                    traverse(child);
                }
            }
        }
        traverse(this);

        return arr;
    },
    /**
     * draw children
     */
    _drawChildren: function() {
        var stage = this.getStage();
        var children = this.children;
        for(var n = 0; n < children.length; n++) {
            var child = children[n];
            if(child.nodeType === 'Shape' && child.isVisible() && stage.isVisible()) {
                child._draw(child.getLayer());
            }
            else {
                child._draw();
            }
        }
    },
    /**
     * add node to container
     * @param {Node} child
     */
    _add: function(child) {
        child._id = Kinetic.GlobalObject.idCounter++;
        child.index = this.children.length;
        child.parent = this;

        this.children.push(child);

        var stage = child.getStage();
        if(stage === undefined) {
            var go = Kinetic.GlobalObject;
            go.tempNodes.push(child);
        }
        else {
            stage._addId(child);
            stage._addName(child);

            /*
             * pull in other nodes that are now linked
             * to a stage
             */
            var go = Kinetic.GlobalObject;
            go._pullNodes(stage);
        }
    },
    /**
     * set children indices
     */
    _setChildrenIndices: function() {
        /*
         * if reordering Layers, remove all canvas elements
         * from the container except the buffer and backstage canvases
         * and then readd all the layers
         */
        if(this.nodeType === 'Stage') {
            var canvases = this.content.children;
            var bufferCanvas = canvases[0];
            var backstageCanvas = canvases[1];

            this.content.innerHTML = '';
            this.content.appendChild(bufferCanvas);
            this.content.appendChild(backstageCanvas);
        }

        for(var n = 0; n < this.children.length; n++) {
            this.children[n].index = n;

            if(this.nodeType === 'Stage') {
                this.content.appendChild(this.children[n].canvas);
            }
        }
    }
};

///////////////////////////////////////////////////////////////////////
//  Stage
///////////////////////////////////////////////////////////////////////
/**
 * Stage constructor.  A stage is used to contain multiple layers and handle
 * animations
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {String|DomElement} cont Container id or DOM element
 * @param {int} width
 * @param {int} height
 */
Kinetic.Stage = function(config) {
    this.setDefaultAttrs({
        width: 400,
        height: 200
    });

    this.nodeType = 'Stage';

    /*
     * if container is a string, assume it's an id for
     * a DOM element
     */
    if( typeof config.container === 'string') {
        config.container = document.getElementById(config.container);
    }

    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);

    this.container = config.container;
    this.content = document.createElement('div');
    this.dblClickWindow = 400;

    this._setDefaults();

    // set stage id
    this._id = Kinetic.GlobalObject.idCounter++;

    this._buildDOM();
    this._listen();
    this._prepareDrag();

    var go = Kinetic.GlobalObject;
    go.stages.push(this);
    this._addId(this);
    this._addName(this);
};
/*
 * Stage methods
 */
Kinetic.Stage.prototype = {
    /**
     * sets onFrameFunc for animation
     * @param {function} func
     */
    onFrame: function(func) {
        var go = Kinetic.GlobalObject;
        this.anim = {
            func: func
        };
    },
    /**
     * start animation
     */
    start: function() {
        if(!this.animRunning) {
            var go = Kinetic.GlobalObject;
            go._addAnimation(this.anim);
            go._handleAnimation();
            this.animRunning = true;
        }
    },
    /**
     * stop animation
     */
    stop: function() {
        var go = Kinetic.GlobalObject;
        go._removeAnimation(this.anim);
        this.animRunning = false;
    },
    /**
     * draw children
     */
    draw: function() {
        this._drawChildren();
    },
    /**
     * set stage size
     * @param {int} width
     * @param {int} height
     */
    setSize: function(width, height) {
        // set stage dimensions
        this.attrs.width = width;
        this.attrs.height = height;

        // set content dimensions
        this.content.style.width = this.attrs.width + 'px';
        this.content.style.height = this.attrs.height + 'px';

        // set buffer layer and path layer sizes
        this.bufferLayer.getCanvas().width = width;
        this.bufferLayer.getCanvas().height = height;
        this.pathLayer.getCanvas().width = width;
        this.pathLayer.getCanvas().height = height;

        // set user defined layer dimensions
        var layers = this.children;
        for(var n = 0; n < layers.length; n++) {
            var layer = layers[n];
            layer.getCanvas().width = width;
            layer.getCanvas().height = height;
            layer.draw();
        }
    },
    /**
     * return stage size
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    },
    /**
     * clear all layers
     */
    clear: function() {
        var layers = this.children;
        for(var n = 0; n < layers.length; n++) {
            layers[n].clear();
        }
    },
    /**
     * Creates a composite data URL and passes it to a callback. If MIME type is not
     * specified, then "image/png" will result. For "image/jpeg", specify a quality
     * level as quality (range 0.0 - 1.0)
     * @param {function} callback
     * @param {String} mimeType (optional)
     * @param {Number} quality (optional)
     */
    toDataURL: function(callback, mimeType, quality) {
        var bufferLayer = this.bufferLayer;
        var bufferContext = bufferLayer.getContext();
        var layers = this.children;
        var that = this;

        function addLayer(n) {
            var dataURL = layers[n].getCanvas().toDataURL();
            var imageObj = new Image();
            imageObj.onload = function() {
                bufferContext.drawImage(this, 0, 0);
                n++;
                if(n < layers.length) {
                    addLayer(n);
                }
                else {
                    try {
                        // If this call fails (due to browser bug, like in Firefox 3.6),
                        // then revert to previous no-parameter image/png behavior
                        callback(bufferLayer.getCanvas().toDataURL(mimeType, quality));
                    }
                    catch(exception) {
                        callback(bufferLayer.getCanvas().toDataURL());
                    }
                }
            };
            imageObj.src = dataURL;
        }

        bufferLayer.clear();
        addLayer(0);
    },
    /**
     * serialize stage and children as a JSON object
     */
    toJSON: function() {
        var go = Kinetic.GlobalObject;

        function addNode(node) {
            var obj = {};
            obj.attrs = node.attrs;

            obj.nodeType = node.nodeType;
            obj.shapeType = node.shapeType;

            if(node.nodeType !== 'Shape') {
                obj.children = [];

                var children = node.getChildren();
                for(var n = 0; n < children.length; n++) {
                    var child = children[n];
                    obj.children.push(addNode(child));
                }
            }

            return obj;
        }
        return JSON.stringify(addNode(this));
    },
    /**
     * reset stage to default state
     */
    reset: function() {
        // remove children
        this.removeChildren();

        // reset stage defaults
        this._setDefaults();

        // reset node attrs
        this.setDefaultAttrs({
            visible: true,
            listening: true,
            name: undefined,
            alpha: 1,
            x: 0,
            y: 0,
            scale: {
                x: 1,
                y: 1
            },
            rotation: 0,
            centerOffset: {
                x: 0,
                y: 0
            },
            dragConstraint: 'none',
            dragBounds: {},
            draggable: false
        });
    },
    /**
     * load stage with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     * 	serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage()
     * @param {String} JSON string
     */
    load: function(json) {
        this.reset();

        function loadNode(node, obj) {
            var children = obj.children;
            if(children !== undefined) {
                for(var n = 0; n < children.length; n++) {
                    var child = children[n];
                    var type;

                    // determine type
                    if(child.nodeType === 'Shape') {
                        // add custom shape
                        if(child.shapeType === undefined) {
                            type = 'Shape';
                        }
                        // add standard shape
                        else {
                            type = child.shapeType;
                        }
                    }
                    else {
                        type = child.nodeType;
                    }

                    var no = new Kinetic[type](child.attrs);
                    node.add(no);
                    loadNode(no, child);
                }
            }
        }
        var obj = JSON.parse(json);

        // copy over stage properties
        this.attrs = obj.attrs;

        loadNode(this, obj);
        this.draw();
    },
    /**
     * remove layer from stage
     * @param {Layer} layer
     */
    remove: function(layer) {
        /*
         * remove canvas DOM from the document if
         * it exists
         */
        try {
            this.content.removeChild(layer.canvas);
        }
        catch(e) {
        }
        this._remove(layer);
    },
    /**
     * add layer to stage
     * @param {Layer} layer
     */
    add: function(layer) {
        layer.canvas.width = this.attrs.width;
        layer.canvas.height = this.attrs.height;
        this._add(layer);

        // draw layer and append canvas to container
        layer.draw();
        this.content.appendChild(layer.canvas);
    },
    /**
     * get mouse position for desktop apps
     * @param {Event} evt
     */
    getMousePosition: function(evt) {
        return this.mousePos;
    },
    /**
     * get touch position for mobile apps
     * @param {Event} evt
     */
    getTouchPosition: function(evt) {
        return this.touchPos;
    },
    /**
     * get user position (mouse position or touch position)
     * @param {Event} evt
     */
    getUserPosition: function(evt) {
        return this.getTouchPosition() || this.getMousePosition();
    },
    /**
     * get container DOM element
     */
    getContainer: function() {
        return this.container;
    },
    /**
     * get content DOM element
     */
    getContent: function() {
        return this.content;
    },
    /**
     * get stage
     */
    getStage: function() {
        return this;
    },
    /**
     * get width
     */
    getWidth: function() {
        return this.attrs.width;
    },
    /**
     * get height
     */
    getHeight: function() {
        return this.attrs.height;
    },
    /**
     * get shapes that intersect a point
     * @param {Object} point
     */
    getIntersections: function() {
        var pos = Kinetic.GlobalObject._getPoint(arguments);
        var arr = [];
        var shapes = this.get('Shape');

        for(var n = 0; n < shapes.length; n++) {
            var shape = shapes[n];
            if(shape.intersects(pos)) {
                arr.push(shape);
            }
        }

        return arr;
    },
    /**
     * get stage DOM node, which is a div element
     * with the class name "kineticjs-content"
     */
    getDOM: function() {
        return this.content;
    },
    /**
     * detect event
     * @param {Shape} shape
     */
    _detectEvent: function(shape, evt) {
        var isDragging = Kinetic.GlobalObject.drag.moving;
        var go = Kinetic.GlobalObject;
        var pos = this.getUserPosition();
        var el = shape.eventListeners;

        if(this.targetShape && shape._id === this.targetShape._id) {
            this.targetFound = true;
        }

        if(shape.attrs.visible && pos !== undefined && shape.intersects(pos)) {
            // handle onmousedown
            if(!isDragging && this.mouseDown) {
                this.mouseDown = false;
                this.clickStart = true;
                shape._handleEvents('onmousedown', evt);
                return true;
            }
            // handle onmouseup & onclick
            else if(this.mouseUp) {
                this.mouseUp = false;
                shape._handleEvents('onmouseup', evt);

                // detect if click or double click occurred
                if(this.clickStart) {
                    /*
                     * if dragging and dropping, don't fire click or dbl click
                     * event
                     */
                    if((!go.drag.moving) || !go.drag.node) {
                        shape._handleEvents('onclick', evt);

                        if(shape.inDoubleClickWindow) {
                            shape._handleEvents('ondblclick', evt);
                        }
                        shape.inDoubleClickWindow = true;
                        setTimeout(function() {
                            shape.inDoubleClickWindow = false;
                        }, this.dblClickWindow);
                    }
                }
                return true;
            }

            // handle touchstart
            else if(this.touchStart) {
                this.touchStart = false;
                shape._handleEvents('touchstart', evt);

                if(el.ondbltap && shape.inDoubleClickWindow) {
                    var events = el.ondbltap;
                    for(var i = 0; i < events.length; i++) {
                        events[i].handler.apply(shape, [evt]);
                    }
                }

                shape.inDoubleClickWindow = true;

                setTimeout(function() {
                    shape.inDoubleClickWindow = false;
                }, this.dblClickWindow);
                return true;
            }

            // handle touchend
            else if(this.touchEnd) {
                this.touchEnd = false;
                shape._handleEvents('touchend', evt);
                return true;
            }

            /*
            * NOTE: these event handlers require target shape
            * handling
            */

            // handle onmouseover
            else if(!isDragging && this._isNewTarget(shape, evt)) {
                /*
                 * check to see if there are stored mouseout events first.
                 * if there are, run those before running the onmouseover
                 * events
                 */
                if(this.mouseoutShape) {
                    this.mouseoverShape = shape;
                    this.mouseoutShape._handleEvents('onmouseout', evt);
                    this.mouseoverShape = undefined;
                }

                shape._handleEvents('onmouseover', evt);
                this._setTarget(shape);
                return true;
            }

            // handle mousemove and touchmove
            else if(!isDragging) {
                shape._handleEvents('onmousemove', evt);
                shape._handleEvents('touchmove', evt);
                return true;
            }
        }
        // handle mouseout condition
        else if(!isDragging && this.targetShape && this.targetShape._id === shape._id) {
            this._setTarget(undefined);
            this.mouseoutShape = shape;
            return true;
        }

        return false;
    },
    /**
     * set new target
     */
    _setTarget: function(shape) {
        this.targetShape = shape;
        this.targetFound = true;
    },
    /**
     * check if shape should be a new target
     */
    _isNewTarget: function(shape, evt) {
        if(!this.targetShape || (!this.targetFound && shape._id !== this.targetShape._id)) {
            /*
             * check if old target has an onmouseout event listener
             */
            if(this.targetShape) {
                var oldEl = this.targetShape.eventListeners;
                if(oldEl) {
                    this.mouseoutShape = this.targetShape;
                }
            }
            return true;
        }
        else {
            return false;
        }
    },
    /**
     * traverse container children
     * @param {Container} obj
     */
    _traverseChildren: function(obj, evt) {
        var children = obj.children;
        // propapgate backwards through children
        for(var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            if(child.attrs.listening) {
                if(child.nodeType === 'Shape') {
                    var exit = this._detectEvent(child, evt);
                    if(exit) {
                        return true;
                    }
                }
                else {
                    var exit = this._traverseChildren(child, evt);
                    if(exit) {
                        return true;
                    }
                }
            }
        }

        return false;
    },
    /**
     * handle incoming event
     * @param {Event} evt
     */
    _handleStageEvent: function(evt) {
        var go = Kinetic.GlobalObject;
        if(!evt) {
            evt = window.event;
        }

        this._setMousePosition(evt);
        this._setTouchPosition(evt);
        this.pathLayer.clear();

        /*
         * loop through layers.  If at any point an event
         * is triggered, n is set to -1 which will break out of the
         * three nested loops
         */
        this.targetFound = false;
        var shapeDetected = false;
        for(var n = this.children.length - 1; n >= 0; n--) {
            var layer = this.children[n];
            if(layer.attrs.visible && n >= 0 && layer.attrs.listening) {
                if(this._traverseChildren(layer, evt)) {
                    n = -1;
                    shapeDetected = true;
                }
            }
        }

        /*
         * if no shape was detected and a mouseout shape has been stored,
         * then run the onmouseout event handlers
         */
        if(!shapeDetected && this.mouseoutShape) {
            this.mouseoutShape._handleEvents('onmouseout', evt);
            this.mouseoutShape = undefined;
        }
    },
    /**
     * begin listening for events by adding event handlers
     * to the container
     */
    _listen: function() {
        var that = this;

        // desktop events
        this.content.addEventListener('mousedown', function(evt) {
            that.mouseDown = true;
            that._handleStageEvent(evt);
        }, false);

        this.content.addEventListener('mousemove', function(evt) {
            that.mouseUp = false;
            that.mouseDown = false;
            that._handleStageEvent(evt);
        }, false);

        this.content.addEventListener('mouseup', function(evt) {
            that.mouseUp = true;
            that.mouseDown = false;
            that._handleStageEvent(evt);

            that.clickStart = false;
        }, false);

        this.content.addEventListener('mouseover', function(evt) {
            that._handleStageEvent(evt);
        }, false);

        this.content.addEventListener('mouseout', function(evt) {
            // if there's a current target shape, run mouseout handlers
            var targetShape = that.targetShape;
            if(targetShape) {
                targetShape._handleEvents('onmouseout', evt);
                that.targetShape = undefined;
            }
            that.mousePos = undefined;
        }, false);
        // mobile events
        this.content.addEventListener('touchstart', function(evt) {
            evt.preventDefault();
            that.touchStart = true;
            that._handleStageEvent(evt);
        }, false);

        this.content.addEventListener('touchmove', function(evt) {
            evt.preventDefault();
            that._handleStageEvent(evt);
        }, false);

        this.content.addEventListener('touchend', function(evt) {
            evt.preventDefault();
            that.touchEnd = true;
            that._handleStageEvent(evt);
        }, false);
    },
    /**
     * set mouse positon for desktop apps
     * @param {Event} evt
     */
    _setMousePosition: function(evt) {
        var mouseX = evt.offsetX || (evt.clientX - this._getContentPosition().left + window.pageXOffset);
        var mouseY = evt.offsetY || (evt.clientY - this._getContentPosition().top + window.pageYOffset);
        this.mousePos = {
            x: mouseX,
            y: mouseY
        };
    },
    /**
     * set touch position for mobile apps
     * @param {Event} evt
     */
    _setTouchPosition: function(evt) {
        if(evt.touches !== undefined && evt.touches.length === 1) {// Only deal with
            // one finger
            var touch = evt.touches[0];
            // Get the information for finger #1
            var touchX = touch.clientX - this._getContentPosition().left + window.pageXOffset;
            var touchY = touch.clientY - this._getContentPosition().top + window.pageYOffset;

            this.touchPos = {
                x: touchX,
                y: touchY
            };
        }
    },
    /**
     * get container position
     */
    _getContentPosition: function() {
        var obj = this.content;
        var top = 0;
        var left = 0;
        while(obj && obj.tagName !== 'BODY') {
            top += obj.offsetTop - obj.scrollTop;
            left += obj.offsetLeft - obj.scrollLeft;
            obj = obj.offsetParent;
        }
        return {
            top: top,
            left: left
        };
    },
    /**
     * modify path context
     * @param {CanvasContext} context
     */
    _modifyPathContext: function(context) {
        context.stroke = function() {
        };
        context.fill = function() {
        };
        context.fillRect = function(x, y, width, height) {
            context.rect(x, y, width, height);
        };
        context.strokeRect = function(x, y, width, height) {
            context.rect(x, y, width, height);
        };
        context.drawImage = function() {
        };
        context.fillText = function() {
        };
        context.strokeText = function() {
        };
    },
    /**
     * end drag and drop
     */
    _endDrag: function(evt) {
        var go = Kinetic.GlobalObject;
        if(go.drag.node) {
            if(go.drag.moving) {
                go.drag.moving = false;
                go.drag.node._handleEvents('ondragend', evt);
            }
        }
        go.drag.node = undefined;
    },
    /**
     * prepare drag and drop
     */
    _prepareDrag: function() {
        var that = this;

        this._onContent('mousemove touchmove', function(evt) {
            var go = Kinetic.GlobalObject;
            var node = go.drag.node;
            if(node) {
                var date = new Date();
                var time = date.getTime();

                if(time - go.drag.lastDrawTime > go.dragTimeInterval) {
                    go.drag.lastDrawTime = time;

                    var pos = that.getUserPosition();
                    var dc = node.attrs.dragConstraint;
                    var db = node.attrs.dragBounds;
                    var lastNodePos = {
                        x: node.attrs.x,
                        y: node.attrs.y
                    };

                    // default
                    var newNodePos = {
                        x: pos.x - go.drag.offset.x,
                        y: pos.y - go.drag.offset.y
                    };

                    // bounds overrides
                    if(db.left !== undefined && newNodePos.x < db.left) {
                        newNodePos.x = db.left;
                    }
                    if(db.right !== undefined && newNodePos.x > db.right) {
                        newNodePos.x = db.right;
                    }
                    if(db.top !== undefined && newNodePos.y < db.top) {
                        newNodePos.y = db.top;
                    }
                    if(db.bottom !== undefined && newNodePos.y > db.bottom) {
                        newNodePos.y = db.bottom;
                    }

                    node.setAbsolutePosition(newNodePos);

                    // constraint overrides
                    if(dc === 'horizontal') {
                        node.attrs.y = lastNodePos.y;
                    }
                    else if(dc === 'vertical') {
                        node.attrs.x = lastNodePos.x;
                    }

                    go.drag.node.getLayer().draw();

                    if(!go.drag.moving) {
                        go.drag.moving = true;
                        // execute dragstart events if defined
                        go.drag.node._handleEvents('ondragstart', evt);
                    }

                    // execute user defined ondragmove if defined
                    go.drag.node._handleEvents('ondragmove', evt);
                }
            }
        }, false);

        this._onContent('mouseup touchend mouseout', function(evt) {
            that._endDrag(evt);
        });
    },
    /**
     * build dom
     */
    _buildDOM: function() {
        // content
        this.content.style.position = 'relative';
        this.content.style.display = 'inline-block';
        this.content.className = 'kineticjs-content';
        this.container.appendChild(this.content);

        // default layers
        this.bufferLayer = new Kinetic.Layer({
            name: 'bufferLayer'
        });
        this.pathLayer = new Kinetic.Layer({
            name: 'pathLayer'
        });

        // set parents
        this.bufferLayer.parent = this;
        this.pathLayer.parent = this;

        // customize back stage context
        this._modifyPathContext(this.pathLayer.context);

        // hide canvases
        this.bufferLayer.getCanvas().style.display = 'none';
        this.pathLayer.getCanvas().style.display = 'none';

        // add buffer layer
        this.bufferLayer.canvas.className = 'kineticjs-buffer-layer';
        this.content.appendChild(this.bufferLayer.canvas);

        // add path layer
        this.pathLayer.canvas.className = 'kineticjs-path-layer';
        this.content.appendChild(this.pathLayer.canvas);

        this.setSize(this.attrs.width, this.attrs.height);
    },
    _addId: function(node) {
        if(node.attrs.id !== undefined) {
            this.ids[node.attrs.id] = node;
        }
    },
    _removeId: function(node) {
        if(node.attrs.id !== undefined) {
            this.ids[node.attrs.id] = undefined;
        }
    },
    _addName: function(node) {
        var name = node.attrs.name;
        if(name !== undefined) {
            if(this.names[name] === undefined) {
                this.names[name] = [];
            }
            this.names[name].push(node);
        }
    },
    _removeName: function(node) {
        if(node.attrs.name !== undefined) {
            var nodes = this.names[node.attrs.name];
            if(nodes !== undefined) {
                for(var n = 0; n < nodes.length; n++) {
                    var no = nodes[n];
                    if(no._id === node._id) {
                        nodes.splice(n, 1);
                    }
                }
            }
        }
    },
    /**
     * bind event listener to container DOM element
     * @param {String} typesStr
     * @param {function} handler
     */
    _onContent: function(typesStr, handler) {
        var types = typesStr.split(' ');
        for(var n = 0; n < types.length; n++) {
            var baseEvent = types[n];
            this.content.addEventListener(baseEvent, handler, false);
        }
    },
    /**
     * set defaults
     */
    _setDefaults: function() {
        this.clickStart = false;
        this.targetShape = undefined;
        this.targetFound = false;
        this.mouseoverShape = undefined;
        this.mouseoutShape = undefined;

        // desktop flags
        this.mousePos = undefined;
        this.mouseDown = false;
        this.mouseUp = false;

        // mobile flags
        this.touchPos = undefined;
        this.touchStart = false;
        this.touchEnd = false;

        this.ids = {};
        this.names = {};
        this.anim = undefined;
        this.animRunning = false;
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Layer = function(config) {
    this.setDefaultAttrs({
        throttle: 80
    });

    this.nodeType = 'Layer';
    this.lastDrawTime = 0;
    this.beforeDrawFunc = undefined;
    this.afterDrawFunc = undefined;
    this.drawFunc = undefined;

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
     * draw children nodes.  this includes any groups
     *  or shapes
     */
    draw: function() {
        var throttle = this.attrs.throttle;
        var date = new Date();
        var time = date.getTime();
        var timeDiff = time - this.lastDrawTime;
		var tt = 1000 / throttle;

        if(timeDiff >= tt) {
            this._draw();
            
            if(this.drawTimeout !== undefined) {
                clearTimeout(this.drawTimeout);
                this.drawTimeout = undefined;
            }
        }
        /*
         * if we cannot draw the layer due to throttling,
         * try to redraw the layer in the near future
         */
        else if(this.drawTimeout === undefined) {
            var that = this;
			/*
			 * wait 17ms before trying again (60fps)
			 */
            this.drawTimeout = setTimeout(function() {
                that.draw();
            }, 17);  
        }
    },
    /**
     * set throttle
     * @param {Number} throttle in ms
     */
    setThrottle: function(throttle) {
        this.attrs.throttle = throttle;
    },
    /**
     * get throttle
     */
    getThrottle: function() {
        return this.attrs.throttle;
    },
    /**
     * set before draw function handler
     */
    beforeDraw: function(func) {
        this.beforeDrawFunc = func;
    },
    /**
     * set after draw function handler
     */
    afterDraw: function(func) {
        this.afterDrawFunc = func;
    },
    /**
     * clears the canvas context tied to the layer.  Clearing
     *  a layer does not remove its children.  The nodes within
     *  the layer will be redrawn whenever the .draw() method
     *  is used again.
     */
    clear: function() {
        var context = this.getContext();
        var canvas = this.getCanvas();
        context.clearRect(0, 0, canvas.width, canvas.height);
    },
    /**
     * get layer canvas
     */
    getCanvas: function() {
        return this.canvas;
    },
    /**
     * get layer context
     */
    getContext: function() {
        return this.context;
    },
    /**
     * add a node to the layer.  New nodes are always
     * placed at the top.
     * @param {Node} node
     */
    add: function(child) {
        this._add(child);
    },
    /**
     * remove a child from the layer
     * @param {Node} child
     */
    remove: function(child) {
        this._remove(child);
    },
    /**
     * private draw children
     */
    _draw: function() {
    	var date = new Date();
        var time = date.getTime();
    	this.lastDrawTime = time;
    	
        // before draw  handler
        if(this.beforeDrawFunc !== undefined) {
            this.beforeDrawFunc();
        }

        this.clear();
        if(this.attrs.visible) {
        	// draw custom func
        	if (this.drawFunc !== undefined) {
        		this.drawFunc();	
        	}
        	
        	// draw children
            this._drawChildren();
        }

        // after draw  handler
        if(this.afterDrawFunc !== undefined) {
            this.afterDrawFunc();
        }
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Group
///////////////////////////////////////////////////////////////////////

/**
 * Group constructor.  Groups are used to contain shapes or other groups.
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Group = function(config) {
    this.nodeType = 'Group';;
    
    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};
/*
 * Group methods
 */
Kinetic.Group.prototype = {
    /**
     * add node to group
     * @param {Node} child
     */
    add: function(child) {
        this._add(child);
    },
    /**
     * remove a child node from the group
     * @param {Node} child
     */
    remove: function(child) {
        this._remove(child);
    },
    /**
     * draw children
     */
    _draw: function() {
        if(this.attrs.visible) {
            this._drawChildren();
        }
    }
};

// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Group, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Shape
///////////////////////////////////////////////////////////////////////
/**
 * Shape constructor.  Shapes are used to objectify drawing bits of a KineticJS
 * application
 * @constructor
 * @augments Kinetic.Node
 * @param {Object} config
 * @config {String|CanvasGradient|CanvasPattern} [fill] fill
 * @config {String} [stroke] stroke color
 * @config {Number} [strokeWidth] stroke width
 * @config {String} [lineJoin] line join.  Can be "miter", "round", or "bevel".  The default
 *  is "miter"
 * @config {String} [detectionType] shape detection type.  Can be "path" or "pixel".
 *  The default is "path" because it performs better
 */
Kinetic.Shape = function(config) {
    this.setDefaultAttrs({
        fill: undefined,
        stroke: undefined,
        strokeWidth: undefined,
        lineJoin: undefined,
        detectionType: 'path',
        shadowColor: undefined,
        shadowBlur: 5,
        shadowOffset: {
            x: 0,
            y: 0
        }
    });

    this.data = [];
    this.nodeType = 'Shape';

    // call super constructor
    Kinetic.Node.apply(this, [config]);
};
/*
 * Shape methods
 */
Kinetic.Shape.prototype = {
    /**
     * get layer context where the shape is being drawn.  When
     * the shape is being rendered, .getContext() returns the context of the
     * user created layer that contains the shape.  When the event detection
     * engine is determining whether or not an event has occured on that shape,
     * .getContext() returns the context of the invisible path layer.
     */
    getContext: function() {
        return this.tempLayer.getContext();
    },
    /**
     * get shape temp layer canvas
     */
    getCanvas: function() {
        return this.tempLayer.getCanvas();
    },
    /**
     * helper method to stroke shape
     */
    stroke: function() {
        var context = this.getContext();

        if(!!this.attrs.stroke || !!this.attrs.strokeWidth) {
            var stroke = !!this.attrs.stroke ? this.attrs.stroke : 'black';
            var strokeWidth = !!this.attrs.strokeWidth ? this.attrs.strokeWidth : 2;

            context.lineWidth = strokeWidth;
            context.strokeStyle = stroke;
            context.stroke();
        }
    },
    /**
     * convenience method that both fills and strokes
     * the shape
     */
    shadowFillStroke: function() {
        var context = this.getContext();
        context.save();
        this.applyShadow();
        this.fill();
        context.restore();
        this.stroke();
    },
    /**
     * helper method to fill and stroke a shape
     *  based on its fill, stroke, and strokeWidth, properties
     */
    fill: function() {
        var context = this.getContext();
        var fill = this.attrs.fill;
        /*
         * expect that fill, stroke, and strokeWidth could be
         * undfined, '', null, or 0.  Use !!
         */
        if(!!fill) {
            // color fill
            if( typeof fill == 'string') {
                f = this.attrs.fill;
            }
            else {
                var s = fill.start;
                var e = fill.end;

                // linear gradient
                if(s.x !== undefined && s.y !== undefined && e.x !== undefined && e.y !== undefined) {
                    var context = this.getContext();
                    var grd = context.createLinearGradient(s.x, s.y, e.x, e.y);
                    grd.addColorStop(0, s.color);
                    grd.addColorStop(1, e.color);
                    f = grd;
                }
                // radial gradient
                else if(s.radius !== undefined && e.radius !== undefined) {
                    var context = this.getContext();
                    var grd = context.createRadialGradient(s.x, s.y, s.radius, s.x, s.y, e.radius);
                    grd.addColorStop(0, s.color);
                    grd.addColorStop(1, e.color);
                    f = grd;
                }
                else {
                    f = 'black';
                }
            }

            context.fillStyle = f;
            context.fill();
        }
    },
    /**
     * helper method to set the line join of a shape
     * based on the lineJoin property
     */
    applyLineJoin: function() {
        var context = this.getContext();
        if(this.attrs.lineJoin !== undefined) {
            context.lineJoin = this.attrs.lineJoin;
        }
    },
    /**
     * apply shadow based on shadowColor, shadowBlur,
     * and shadowOffset properties
     */
    applyShadow: function() {
        var context = this.getContext();
        if(this.attrs.shadowColor !== undefined) {
            context.shadowColor = this.attrs.shadowColor;
            context.shadowBlur = this.attrs.shadowBlur;
            context.shadowOffsetX = this.attrs.shadowOffset.x;
            context.shadowOffsetY = this.attrs.shadowOffset.y;
        }
    },
    /**
     * set fill which can be a color, gradient object,
     *  or pattern object
     * @param {String|CanvasGradient|CanvasPattern} fill
     */
    setFill: function(fill) {
        this.attrs.fill = fill;
    },
    /**
     * get fill
     */
    getFill: function() {
        return this.attrs.fill;
    },
    /**
     * set stroke color
     * @param {String} stroke
     */
    setStroke: function(stroke) {
        this.attrs.stroke = stroke;
    },
    /**
     * get stroke color
     */
    getStroke: function() {
        return this.attrs.stroke;
    },
    /**
     * set line join
     * @param {String} lineJoin.  Can be "miter", "round", or "bevel".  The
     *  default is "miter"
     */
    setLineJoin: function(lineJoin) {
        this.attrs.lineJoin = lineJoin;
    },
    /**
     * get line join
     */
    getLineJoin: function() {
        return this.attrs.lineJoin;
    },
    /**
     * set stroke width
     * @param {Number} strokeWidth
     */
    setStrokeWidth: function(strokeWidth) {
        this.attrs.strokeWidth = strokeWidth;
    },
    /**
     * get stroke width
     */
    getStrokeWidth: function() {
        return this.attrs.strokeWidth;
    },
    /**
     * set shadow color
     * @param {String} color
     */
    setShadowColor: function(color) {
        this.attrs.shadowColor = color;
    },
    /**
     * get shadow color
     */
    getShadowColor: function() {
        return this.attrs.shadowColor;
    },
    /**
     * set shadow blur
     * @param {Integer}
     */
    setShadowBlur: function(blur) {
        this.attrs.shadowBlur = blur;
    },
    /**
     * get shadow blur
     */
    getShadowblur: function() {
        return this.attrs.shadowBlur;
    },
    /**
     * set shadow offset
     * @param {Object} offset
     */
    setShadowOffset: function(offset) {
        this.attrs.shadowOffset = offset;
    },
    /**
     * get shadow offset
     */
    getShadowOffset: function() {
        return this.attrs.shadowOffset;
    },
    /**
     * set draw function
     * @param {Function} func drawing function
     */
    setDrawFunc: function(func) {
        this.drawFunc = func;
    },
    /**
     * save shape data when using pixel detection.
     */
    saveData: function() {
        var stage = this.getStage();
        var w = stage.attrs.width;
        var h = stage.attrs.height;

        var bufferLayer = stage.bufferLayer;
        var bufferLayerContext = bufferLayer.getContext();

        bufferLayer.clear();
        this._draw(bufferLayer);

        var imageData = bufferLayerContext.getImageData(0, 0, w, h);
        this.data = imageData.data;
    },
    /**
     * clear shape data
     */
    clearData: function() {
        this.data = [];
    },
    /**
     * determines if point is in the shape
     */
    intersects: function() {
        var pos = Kinetic.GlobalObject._getPoint(arguments);
        var stage = this.getStage();

        if(this.attrs.detectionType === 'path') {
            var pathLayer = stage.pathLayer;
            var pathLayerContext = pathLayer.getContext();

            this._draw(pathLayer);

            return pathLayerContext.isPointInPath(pos.x, pos.y);
        }
        else {
            var w = stage.attrs.width;
            var alpha = this.data[((w * pos.y) + pos.x) * 4 + 3];
            return (alpha !== undefined && alpha !== 0);
        }
    },
    /**
     * draw shape
     * @param {Layer} layer Layer that the shape will be drawn on
     */
    _draw: function(layer) {
        if(layer !== undefined && this.drawFunc !== undefined) {
            var stage = layer.getStage();
            var context = layer.getContext();
            var family = [];
            var parent = this.parent;

            family.unshift(this);
            while(parent) {
                family.unshift(parent);
                parent = parent.parent;
            }

            context.save();
            for(var n = 0; n < family.length; n++) {
                var node = family[n];
                var t = node.getTransform();

                // center offset
                if(node.attrs.centerOffset.x !== 0 || node.attrs.centerOffset.y !== 0) {
                    t.translate(-1 * node.attrs.centerOffset.x, -1 * node.attrs.centerOffset.y);
                }

                var m = t.getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }

            if(this.getAbsoluteAlpha() !== 1) {
                context.globalAlpha = this.getAbsoluteAlpha();
            }

            this.tempLayer = layer;
            this.drawFunc.call(this);
            context.restore();
        }
    }
};
// extend Node
Kinetic.GlobalObject.extend(Kinetic.Shape, Kinetic.Node);

///////////////////////////////////////////////////////////////////////
//  Rect
///////////////////////////////////////////////////////////////////////
/**
 * Rect constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Rect = function(config) {
    this.setDefaultAttrs({
        width: 0,
        height: 0,
        cornerRadius: 0
    });

    this.shapeType = "Rect";

    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        if(this.attrs.cornerRadius === 0) {
            // simple rect - don't bother doing all that complicated maths stuff.
            context.rect(0, 0, this.attrs.width, this.attrs.height);
        }
        else {
            // arcTo would be nicer, but browser support is patchy (Opera)
            context.moveTo(this.attrs.cornerRadius, 0);
            context.lineTo(this.attrs.width - this.attrs.cornerRadius, 0);
            context.arc(this.attrs.width - this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI * 3 / 2, 0, false);
            context.lineTo(this.attrs.width, this.attrs.height - this.attrs.cornerRadius);
            context.arc(this.attrs.width - this.attrs.cornerRadius, this.attrs.height - this.attrs.cornerRadius, this.attrs.cornerRadius, 0, Math.PI / 2, false);
            context.lineTo(this.attrs.cornerRadius, this.attrs.height);
            context.arc(this.attrs.cornerRadius, this.attrs.height - this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI / 2, Math.PI, false);
            context.lineTo(0, this.attrs.cornerRadius);
            context.arc(this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI, Math.PI * 3 / 2, false);
        }
        context.closePath();
        this.shadowFillStroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Rect methods
 */
Kinetic.Rect.prototype = {
    /**
     * set width
     * @param {Number} width
     */
    setWidth: function(width) {
        this.attrs.width = width;
    },
    /**
     * get width
     */
    getWidth: function() {
        return this.attrs.width;
    },
    /**
     * set height
     * @param {Number} height
     */
    setHeight: function(height) {
        this.attrs.height = height;
    },
    /**
     * get height
     */
    getHeight: function() {
        return this.attrs.height;
    },
    /**
     * set width and height
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function(width, height) {
        this.attrs.width = width;
        this.attrs.height = height;
    },
    /**
     * return rect size
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    },
    /**
     * set corner radius
     * @param {Number} radius
     */
    setCornerRadius: function(radius) {
        this.attrs.cornerRadius = radius;
    },
    /**
     * get corner radius
     */
    getCornerRadius: function() {
        return this.attrs.cornerRadius;
    },
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Rect, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Circle
///////////////////////////////////////////////////////////////////////
/**
 * Circle constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Circle = function(config) {
    this.setDefaultAttrs({
        radius: 0
    });

    this.shapeType = "Circle";

    config.drawFunc = function() {
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        context.arc(0, 0, this.attrs.radius, 0, Math.PI * 2, true);
        context.closePath();
        this.shadowFillStroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Circle methods
 */
Kinetic.Circle.prototype = {
    /**
     * set radius
     * @param {Number} radius
     */
    setRadius: function(radius) {
        this.attrs.radius = radius;
    },
    /**
     * get radius
     */
    getRadius: function() {
        return this.attrs.radius;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Circle, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
/**
 * Image constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Image = function(config) {
    this.setDefaultAttrs({
        crop: {
            x: 0,
            y: 0,
            width: undefined,
            height: undefined
        }
    });

    this.shapeType = "Image";
    config.drawFunc = function() {
        if(this.image !== undefined) {
            var width = this.attrs.width !== undefined ? this.attrs.width : this.image.width;
            var height = this.attrs.height !== undefined ? this.attrs.height : this.image.height;
            var cropX = this.attrs.crop.x;
            var cropY = this.attrs.crop.y;
            var cropWidth = this.attrs.crop.width;
            var cropHeight = this.attrs.crop.height;
            var canvas = this.getCanvas();
            var context = this.getContext();

            context.beginPath();
            this.applyLineJoin();
            context.rect(0, 0, width, height);
            context.closePath();
            this.shadowFillStroke();

            // if cropping
            if(cropWidth !== undefined && cropHeight !== undefined) {
                context.drawImage(this.image, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height);
            }
            // no cropping
            else {
                context.drawImage(this.image, 0, 0, width, height);
            }
        }
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Image methods
 */
Kinetic.Image.prototype = {
    /**
     * set image
     * @param {ImageObject} image
     */
    setImage: function(image) {
        this.image = image;
    },
    /**
     * get image
     */
    getImage: function() {
        return this.image;
    },
    /**
     * set width
     * @param {Number} width
     */
    setWidth: function(width) {
        this.attrs.width = width;
    },
    /**
     * get width
     */
    getWidth: function() {
        return this.attrs.width;
    },
    /**
     * set height
     * @param {Number} height
     */
    setHeight: function(height) {
        this.attrs.height = height;
    },
    /**
     * get height
     */
    getHeight: function() {
        return this.attrs.height;
    },
    /**
     * set width and height
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function(width, height) {
        this.attrs.width = width;
        this.attrs.height = height;
    },
    /**
     * return image size
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    },
    /**
     * return cropping
     */
    getCrop: function() {
        return this.attrs.crop;
    },
    /**
     * set cropping
     * @param {Object} crop
     * @config {Number} [x] crop x
     * @config {Number} [y] crop y
     * @config {Number} [width] crop width
     * @config {Number} [height] crop height
     */
    setCrop: function(config) {
        var c = {};
        c.crop = config;
        this.setAttrs(c);
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Sprite
///////////////////////////////////////////////////////////////////////
/**
 * Sprite constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Sprite = function(config) {
    this.setDefaultAttrs({
		index: 0,
		frameRate: 17
    });

    config.drawFunc = function() {
        if(this.image !== undefined) {
            var context = this.getContext();
            var anim = this.attrs.animation;
            var index = this.attrs.index;
            var f = this.attrs.animations[anim][index];

            context.beginPath();
            context.rect(0, 0, f.width, f.height);
            context.closePath();
            context.drawImage(this.image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
        }
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Sprite methods
 */
Kinetic.Sprite.prototype = {
    /**
     * start sprite animation
     */
    start: function() {
        var that = this;
        var layer = this.getLayer();
        this.interval = setInterval(function() {
            that._updateIndex();
            layer.draw();
            if(that.afterFrameFunc && that.attrs.index === that.afterFrameIndex) {
                that.afterFrameFunc();
            }
        }, 1000 / this.attrs.frameRate)
    },
    /**
     * stop sprite animation
     */
    stop: function() {
        clearInterval(this.interval);
    },
    /**
     * set after frame event handler
     * @param {Integer} index frame index
     * @param {Function} func function to be executed after frame has been drawn
     */
    afterFrame: function(index, func) {
        this.afterFrameIndex = index;
        this.afterFrameFunc = func;
    },
    /**
     * set animation key
     * @param {String} anim animation key
     */
    setAnimation: function(anim) {
        this.attrs.animation = anim;
    },
    /**
     * set animation frame index
     * @param {Integer} index frame index
     */
    setIndex: function(index) {
        this.attrs.index = index;
    },
    _updateIndex: function() {
        var i = this.attrs.index;
        var a = this.attrs.animation;
        if(i < this.attrs.animations[a].length - 1) {
            this.attrs.index++;
        }
        else {
            this.attrs.index = 0;
        }
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Sprite, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Polygon
///////////////////////////////////////////////////////////////////////
/**
 * Polygon constructor.&nbsp; Polygons are defined by an array of points
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Polygon = function(config) {
    this.setDefaultAttrs({
        points: []
    });

    this.shapeType = "Polygon";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        context.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);
        for(var n = 1; n < this.attrs.points.length; n++) {
            context.lineTo(this.attrs.points[n].x, this.attrs.points[n].y);
        }
        context.closePath();
        this.shadowFillStroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Polygon methods
 */
Kinetic.Polygon.prototype = {
    /**
     * set points array
     * @param {Array} points
     */
    setPoints: function(points) {
        this.attrs.points = points;
    },
    /**
     * get points array
     */
    getPoints: function() {
        return this.attrs.points;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Polygon, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  RegularPolygon
///////////////////////////////////////////////////////////////////////
/**
 * RegularPolygon constructor.&nbsp; Examples include triangles, squares, pentagons, hexagons, etc.
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.RegularPolygon = function(config) {
    this.setDefaultAttrs({
        radius: 0,
        sides: 0
    });

    this.shapeType = "RegularPolygon";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        context.moveTo(0, 0 - this.attrs.radius);

        for(var n = 1; n < this.attrs.sides; n++) {
            var x = this.attrs.radius * Math.sin(n * 2 * Math.PI / this.attrs.sides);
            var y = -1 * this.attrs.radius * Math.cos(n * 2 * Math.PI / this.attrs.sides);
            context.lineTo(x, y);
        }
        context.closePath();
        this.shadowFillStroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * RegularPolygon methods
 */
Kinetic.RegularPolygon.prototype = {
    /**
     * set radius
     * @param {Number} radius
     */
    setRadius: function(radius) {
        this.attrs.radius = radius;
    },
    /**
     * get radius
     */
    getRadius: function() {
        return this.attrs.radius;
    },
    /**
     * set number of sides
     * @param {int} sides
     */
    setSides: function(sides) {
        this.attrs.sides = sides;
    },
    /**
     * get number of sides
     */
    getSides: function() {
        return this.attrs.sides;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.RegularPolygon, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Star
///////////////////////////////////////////////////////////////////////
/**
 * Star constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Star = function(config) {
    this.setDefaultAttrs({
        numPoints: 0,
        innerRadius: 0,
        outerRadius: 0
    });

    this.shapeType = "Star";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        
        context.moveTo(0, 0 - this.attrs.outerRadius);

        for(var n = 1; n < this.attrs.numPoints * 2; n++) {
            var radius = n % 2 === 0 ? this.attrs.outerRadius : this.attrs.innerRadius;
            var x = radius * Math.sin(n * Math.PI / this.attrs.numPoints);
            var y = -1 * radius * Math.cos(n * Math.PI / this.attrs.numPoints);
            context.lineTo(x, y);
        }
        context.closePath();
        this.shadowFillStroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Star methods
 */
Kinetic.Star.prototype = {
    /**
     * set number of points
     * @param {Integer} points
     */
    setNumPoints: function(numPoints) {
        this.attrs.numPoints = numPoints;
    },
    /**
     * get number of points
     */
    getNumPoints: function() {
        return this.attrs.numPoints;
    },
    /**
     * set outer radius
     * @param {Number} radius
     */
    setOuterRadius: function(radius) {
        this.attrs.outerRadius = radius;
    },
    /**
     * get outer radius
     */
    getOuterRadius: function() {
        return this.attrs.outerRadius;
    },
    /**
     * set inner radius
     * @param {Number} radius
     */
    setInnerRadius: function(radius) {
        this.attrs.innerRadius = radius;
    },
    /**
     * get inner radius
     */
    getInnerRadius: function() {
        return this.attrs.innerRadius;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Star, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/**
 * Text constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Text = function(config) {
    this.setDefaultAttrs({
        fontFamily: 'Calibri',
        text: '',
        fontSize: 12,
        fill: undefined,
        textStroke: undefined,
        textStrokeWidth: undefined,
        align: 'left',
        verticalAlign: 'top',
        padding: 0,
        fontStyle: 'normal'
    });

    this.shapeType = "Text";

    config.drawFunc = function() {
        var context = this.getContext();
        context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
        context.textBaseline = 'middle';
        var textHeight = this.getTextHeight();
        var textWidth = this.getTextWidth();
        var p = this.attrs.padding;
        var x = 0;
        var y = 0;

        switch (this.attrs.align) {
            case 'center':
                x = textWidth / -2 - p;
                break;
            case 'right':
                x = -1 * textWidth - p;
                break;
        }

        switch (this.attrs.verticalAlign) {
            case 'middle':
                y = textHeight / -2 - p;
                break;
            case 'bottom':
                y = -1 * textHeight - p;
                break;
        }

        // draw path
        context.save();
        context.beginPath();
        this.applyLineJoin();
        context.rect(x, y, textWidth + p * 2, textHeight + p * 2);
        context.closePath();
        this.shadowFillStroke();
        context.restore();

        var tx = p + x;
        var ty = textHeight / 2 + p + y;

        // draw text
        if(this.attrs.textFill !== undefined) {
            context.fillStyle = this.attrs.textFill;
            context.fillText(this.attrs.text, tx, ty);
        }
        if(this.attrs.textStroke !== undefined || this.attrs.textStrokeWidth !== undefined) {
            // defaults
            if(this.attrs.textStroke === undefined) {
                this.attrs.textStroke = 'black';
            }
            else if(this.attrs.textStrokeWidth === undefined) {
                this.attrs.textStrokeWidth = 2;
            }
            context.lineWidth = this.attrs.textStrokeWidth;
            context.strokeStyle = this.attrs.textStroke;
            context.strokeText(this.attrs.text, tx, ty);
        }
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Text methods
 */
Kinetic.Text.prototype = {
    /**
     * set font family
     * @param {String} fontFamily
     */
    setFontFamily: function(fontFamily) {
        this.attrs.fontFamily = fontFamily;
    },
    /**
     * get font family
     */
    getFontFamily: function() {
        return this.attrs.fontFamily;
    },
    /**
     * set font size
     * @param {int} fontSize
     */
    setFontSize: function(fontSize) {
        this.attrs.fontSize = fontSize;
    },
    /**
     * get font size
     */
    getFontSize: function() {
        return this.attrs.fontSize;
    },
    /**
     * set font style.  Can be "normal", "italic", or "bold".  "normal" is the default.
     * @param {String} fontStyle
     */
    setFontStyle: function(fontStyle) {
        this.attrs.fontStyle = fontStyle;
    },
    /**
     * get font style
     */
    getFontStyle: function() {
        return this.attrs.fontStyle;
    },
    /**
     * set text fill color
     * @param {String} textFill
     */
    setTextFill: function(textFill) {
        this.attrs.textFill = textFill;
    },
    /**
     * get text fill color
     */
    getTextFill: function() {
        return this.attrs.textFill;
    },
    /**
     * set text stroke color
     * @param {String} textStroke
     */
    setTextStroke: function(textStroke) {
        this.attrs.textStroke = textStroke;
    },
    /**
     * get text stroke color
     */
    getTextStroke: function() {
        return this.attrs.textStroke;
    },
    /**
     * set text stroke width
     * @param {int} textStrokeWidth
     */
    setTextStrokeWidth: function(textStrokeWidth) {
        this.attrs.textStrokeWidth = textStrokeWidth;
    },
    /**
     * get text stroke width
     */
    getTextStrokeWidth: function() {
        return this.attrs.textStrokeWidth;
    },
    /**
     * set padding
     * @param {int} padding
     */
    setPadding: function(padding) {
        this.attrs.padding = padding;
    },
    /**
     * get padding
     */
    getPadding: function() {
        return this.attrs.padding;
    },
    /**
     * set horizontal align of text
     * @param {String} align align can be 'left', 'center', or 'right'
     */
    setAlign: function(align) {
        this.attrs.align = align;
    },
    /**
     * get horizontal align
     */
    getAlign: function() {
        return this.attrs.align;
    },
    /**
     * set vertical align of text
     * @param {String} verticalAlign verticalAlign can be "top", "middle", or "bottom"
     */
    setVerticalAlign: function(verticalAlign) {
        this.attrs.verticalAlign = verticalAlign;
    },
    /**
     * get vertical align
     */
    getVerticalAlign: function() {
        return this.attrs.verticalAlign;
    },
    /**
     * set text
     * @param {String} text
     */
    setText: function(text) {
        this.attrs.text = text;
    },
    /**
     * get text
     */
    getText: function() {
        return this.attrs.text;
    },
    /**
     * get text width in pixels
     */
    getTextWidth: function() {
        return this.getTextSize().width;
    },
    /**
     * get text height in pixels
     */
    getTextHeight: function() {
        return this.getTextSize().height;
    },
    /**
     * get text size in pixels
     */
    getTextSize: function() {
        var context = this.getContext();
        context.save();
        context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
        var metrics = context.measureText(this.attrs.text);
        context.restore();
        return {
            width: metrics.width,
            height: parseInt(this.attrs.fontSize, 10)
        };
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Text, Kinetic.Shape);

///////////////////////////////////////////////////////////////////////
//  Line
///////////////////////////////////////////////////////////////////////
/**
 * Line constructor.&nbsp; Lines are defined by an array of points
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Line = function(config) {
    this.setDefaultAttrs({
        points: [],
        lineCap: 'butt',
        dashArray: []
    });

    this.shapeType = "Line";
    config.drawFunc = function() {
        var context = this.getContext();
        var lastPos = {};
        context.beginPath();
        this.applyLineJoin();

        context.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);

        for(var n = 1; n < this.attrs.points.length; n++) {
            var x = this.attrs.points[n].x;
            var y = this.attrs.points[n].y;
            if(this.attrs.dashArray.length > 0) {
                // draw dashed line
                var lastX = this.attrs.points[n - 1].x;
                var lastY = this.attrs.points[n - 1].y;
                this._dashedLine(lastX, lastY, x, y, this.attrs.dashArray);
            }
            else {
                // draw normal line
                context.lineTo(x, y);
            }
        }

        if(!!this.attrs.lineCap) {
            context.lineCap = this.attrs.lineCap;
        }
        this.applyShadow();
        this.stroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Line methods
 */
Kinetic.Line.prototype = {
    /**
     * set points array
     * @param {Array} points
     */
    setPoints: function(points) {
        this.attrs.points = points;
    },
    /**
     * get points array
     */
    getPoints: function() {
        return this.attrs.points;
    },
    /**
     * set line cap.  Can be butt, round, or square
     * @param {String} lineCap
     */
    setLineCap: function(lineCap) {
        this.attrs.lineCap = lineCap;
    },
    /**
     * get line cap
     */
    getLineCap: function() {
        return this.attrs.lineCap;
    },
    /**
     * set dash array.
     * @param {Array} dashArray
     *  examples:<br>
     *  [10, 5] dashes are 10px long and 5 pixels apart
     *  [10, 20, 0, 20] if using a round lineCap, the line will
     *  be made up of alternating dashed lines that are 10px long
     *  and 20px apart, and dots that have a radius of 5 and are 20px
     *  apart
     */
    setDashArray: function(dashArray) {
        this.attrs.dashArray = dashArray;
    },
    /**
     * get dash array
     */
    getDashArray: function() {
        return this.attrs.dashArray;
    },
    /**
     * draw dashed line.  Written by Phrogz
     */
    _dashedLine: function(x, y, x2, y2, dashArray) {
        var context = this.getContext();
        var dashCount = dashArray.length;

        var dx = (x2 - x), dy = (y2 - y);
        var xSlope = (Math.abs(dx) > Math.abs(dy));
        var slope = (xSlope) ? dy / dx : dx / dy;
        var distRemaining = Math.sqrt(dx * dx + dy * dy);
        var dashIndex = 0, draw = true;
        while(distRemaining >= 0.1 && dashIndex < 10000) {
            var dashLength = dashArray[dashIndex++ % dashCount];
            if(dashLength === 0) {
                dashLength = 0.001;
            }
            if(dashLength > distRemaining) {
                dashLength = distRemaining;
            }
            var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
            if(xSlope) {
                x += step;
                y += slope * step;
            }
            else {
                x += slope * step;
                y += step;
            }
            context[draw ? 'lineTo' : 'moveTo'](x, y);
            distRemaining -= dashLength;
            draw = !draw;
        }
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Line, Kinetic.Shape);

/*
* Last updated November 2011
* By Simon Sarris
* www.simonsarris.com
* sarris@acm.org
*
* Free to use and distribute at will
* So long as you are nice to people, etc
*/

/*
* The usage of this class was inspired by some of the work done by a forked
* project, KineticJS-Ext by Wappworks, which is based on Simon's Transform
* class.
*/

/**
 * Matrix object
 */
Kinetic.Transform = function() {
    this.m = [1, 0, 0, 1, 0, 0];
}

Kinetic.Transform.prototype = {
    /**
     * Apply translation
     * @param {Number} x
     * @param {Number} y
     */
    translate: function(x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
    },
    /**
     * Apply scale
     * @param {Number} sx
     * @param {Number} sy
     */
    scale: function(sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
    },
    /**
     * Apply rotation
     * @param {Number} rad  Angle in radians
     */
    rotate: function(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.m[0] * c + this.m[2] * s;
        var m12 = this.m[1] * c + this.m[3] * s;
        var m21 = this.m[0] * -s + this.m[2] * c;
        var m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
    },
    /**
     * Returns the translation
     * @returns {Object} 2D point(x, y)
     */
    getTranslation: function() {
        return {
            x: this.m[4],
            y: this.m[5]
        };
    },
    /**
     * Transform multiplication
     * @param {Kinetic.Transform} matrix
     */
    multiply: function(matrix) {
        var m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        var m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];

        var m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        var m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];

        var dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        var dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];

        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
    },
    /**
     * Invert the matrix
     */
    invert: function() {
        var d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        var m0 = this.m[3] * d;
        var m1 = -this.m[1] * d;
        var m2 = -this.m[2] * d;
        var m3 = this.m[0] * d;
        var m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        var m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
    },
    /**
     * return matrix
     */
    getMatrix: function() {
        return this.m;
    }
};

/*
* The Tween class was ported from an Adobe Flash Tween library
* to JavaScript by Xaric.  In the context of KineticJS, a Tween is
* an animation of a single Node property.  A Transition is a set of
* multiple tweens
*/

/**
 * Transition constructor.  KineticJS transitions contain
 * multiple Tweens
 */
Kinetic.Transition = function(node, config) {
    this.node = node;
    this.config = config;
    this.tweens = [];

    // add tween for each property
    for(var key in config) {
        if(key !== 'duration' && key !== 'easing' && key !== 'callback') {
            if(config[key].x === undefined && config[key].y === undefined) {
                this.add(this._getTween(key, config));
            }
            if(config[key].x !== undefined) {
                this.add(this._getComponentTween(key, 'x', config));
            }
            if(config[key].y !== undefined) {
                this.add(this._getComponentTween(key, 'y', config));
            }
        }
    }

    var finishedTweens = 0;
    var that = this;
    for(var n = 0; n < this.tweens.length; n++) {
        var tween = this.tweens[n];
        tween.onFinished = function() {
            finishedTweens++;
            if(finishedTweens >= that.tweens.length) {
                that.onFinished();
            }
        };
    }
};
/*
 * Transition methods
 */
Kinetic.Transition.prototype = {
    /**
     * add tween to tweens array
     * @param {Kinetic.Tween} tween
     */
    add: function(tween) {
        this.tweens.push(tween);
    },
    /**
     * start transition
     */
    start: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].start();
        }
    },
    /**
     * onEnterFrame
     */
    onEnterFrame: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].onEnterFrame();
        }
    },
    /**
     * stop transition
     */
    stop: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].stop();
        }
    },
    /**
     * resume transition
     */
    resume: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].resume();
        }
    },
    _getTween: function(key) {
        var config = this.config;
        var node = this.node;
        var easing = config.easing;
        if(easing === undefined) {
            easing = 'linear';
        }

        var tween = new Kinetic.Tween(node, function(i) {
            node.attrs[key] = i;
        }, Kinetic.Tweens[easing], node.attrs[key], config[key], config.duration);

        return tween;
    },
    _getComponentTween: function(key, prop) {
        var config = this.config;
        var node = this.node;
        var easing = config.easing;
        if(easing === undefined) {
            easing = 'linear';
        }

        var tween = new Kinetic.Tween(node, function(i) {
            node.attrs[key][prop] = i;
        }, Kinetic.Tweens[easing], node.attrs[key][prop], config[key][prop], config.duration);

        return tween;
    },
};

/**
 * Tween constructor
 */
Kinetic.Tween = function(obj, propFunc, func, begin, finish, duration) {
    this._listeners = [];
    this.addListener(this);
    this.obj = obj;
    this.propFunc = propFunc;
    this.begin = begin;
    this._pos = begin;
    this.setDuration(duration);
    this.isPlaying = false;
    this._change = 0;
    this.prevTime = 0;
    this.prevPos = 0;
    this.looping = false;
    this._time = 0;
    this._position = 0;
    this._startTime = 0;
    this._finish = 0;
    this.name = '';
    this.func = func;
    this.setFinish(finish);
};
/*
 * Tween methods
 */
Kinetic.Tween.prototype = {
    setTime: function(t) {
        this.prevTime = this._time;
        if(t > this.getDuration()) {
            if(this.looping) {
                this.rewind(t - this._duration);
                this.update();
                this.broadcastMessage('onLooped', {
                    target: this,
                    type: 'onLooped'
                });
            }
            else {
                this._time = this._duration;
                this.update();
                this.stop();
                this.broadcastMessage('onFinished', {
                    target: this,
                    type: 'onFinished'
                });
            }
        }
        else if(t < 0) {
            this.rewind();
            this.update();
        }
        else {
            this._time = t;
            this.update();
        }
    },
    getTime: function() {
        return this._time;
    },
    setDuration: function(d) {
        this._duration = (d === null || d <= 0) ? 100000 : d;
    },
    getDuration: function() {
        return this._duration;
    },
    setPosition: function(p) {
        this.prevPos = this._pos;
        //var a = this.suffixe != '' ? this.suffixe : '';
        this.propFunc(p);
        //+ a;
        //this.obj(Math.round(p));
        this._pos = p;
        this.broadcastMessage('onChanged', {
            target: this,
            type: 'onChanged'
        });
    },
    getPosition: function(t) {
        if(t === undefined) {
            t = this._time;
        }
        return this.func(t, this.begin, this._change, this._duration);
    },
    setFinish: function(f) {
        this._change = f - this.begin;
    },
    getFinish: function() {
        return this.begin + this._change;
    },
    start: function() {
        this.rewind();
        this.startEnterFrame();
        this.broadcastMessage('onStarted', {
            target: this,
            type: 'onStarted'
        });
    },
    rewind: function(t) {
        this.stop();
        this._time = (t === undefined) ? 0 : t;
        this.fixTime();
        this.update();
    },
    fforward: function() {
        this._time = this._duration;
        this.fixTime();
        this.update();
    },
    update: function() {
        this.setPosition(this.getPosition(this._time));
    },
    startEnterFrame: function() {
        this.stopEnterFrame();
        this.isPlaying = true;
        this.onEnterFrame();
    },
    onEnterFrame: function() {
        if(this.isPlaying) {
            this.nextFrame();
        }
    },
    nextFrame: function() {
        this.setTime((this.getTimer() - this._startTime) / 1000);
    },
    stop: function() {
        this.stopEnterFrame();
        this.broadcastMessage('onStopped', {
            target: this,
            type: 'onStopped'
        });
    },
    stopEnterFrame: function() {
        this.isPlaying = false;
    },
    continueTo: function(finish, duration) {
        this.begin = this._pos;
        this.setFinish(finish);
        if(this._duration != undefined)
            this.setDuration(duration);
        this.start();
    },
    resume: function() {
        this.fixTime();
        this.startEnterFrame();
        this.broadcastMessage('onResumed', {
            target: this,
            type: 'onResumed'
        });
    },
    yoyo: function() {
        this.continueTo(this.begin, this._time);
    },
    addListener: function(o) {
        this.removeListener(o);
        return this._listeners.push(o);
    },
    removeListener: function(o) {
        var a = this._listeners;
        var i = a.length;
        while(i--) {
            if(a[i] == o) {
                a.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    broadcastMessage: function() {
        var arr = [];
        for(var i = 0; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }
        var e = arr.shift();
        var a = this._listeners;
        var l = a.length;
        for(var i = 0; i < l; i++) {
            if(a[i][e]) {
                a[i][e].apply(a[i], arr);
            }
        }
    },
    fixTime: function() {
        this._startTime = this.getTimer() - this._time * 1000;
    },
    getTimer: function() {
        return new Date().getTime() - this._time;
    }
};

Kinetic.Tweens = {
    'back-ease-in': function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    'back-ease-out': function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    'back-ease-in-out': function(t, b, c, d, a, p) {
        var s = 1.70158;
        if((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    'elastic-ease-in': function(t, b, c, d, a, p) {
        // added s = 0
        var s = 0;
        if(t === 0) {
            return b;
        }
        if((t /= d) == 1) {
            return b + c;
        }
        if(!p) {
            p = d * 0.3;
        }
        if(!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    'elastic-ease-out': function(t, b, c, d, a, p) {
        // added s = 0
        var s = 0;
        if(t === 0) {
            return b;
        }
        if((t /= d) == 1) {
            return b + c;
        }
        if(!p) {
            p = d * 0.3;
        }
        if(!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    'elastic-ease-in-out': function(t, b, c, d, a, p) {
        // added s = 0
        var s = 0;
        if(t === 0) {
            return b;
        }
        if((t /= d / 2) == 2) {
            return b + c;
        }
        if(!p) {
            p = d * (0.3 * 1.5);
        }
        if(!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if(t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    'bounce-ease-out': function(t, b, c, d) {
        if((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        }
        else if(t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        }
        else if(t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        }
        else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    'bounce-ease-in': function(t, b, c, d) {
        return c - Kinetic.Tweens['bounce-ease-out'](d - t, 0, c, d) + b;
    },
    'bounce-ease-in-out': function(t, b, c, d) {
        if(t < d / 2) {
            return Kinetic.Tweens['bounce-ease-in'](t * 2, 0, c, d) * 0.5 + b;
        }
        else {
            return Kinetic.Tweens['bounce-ease-out'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    // duplicate
    /*
     strongEaseInOut: function(t, b, c, d) {
     return c * (t /= d) * t * t * t * t + b;
     },
     */
    'ease-in': function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    'ease-out': function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    'ease-in-out': function(t, b, c, d) {
        if((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    'strong-ease-in': function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    'strong-ease-out': function(t, b, c, d) {
        return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
    },
    'strong-ease-in-out': function(t, b, c, d) {
        if((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    'linear': function(t, b, c, d) {
        return c * t / d + b;
    },
};

