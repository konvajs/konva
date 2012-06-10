///////////////////////////////////////////////////////////////////////
//  Node
///////////////////////////////////////////////////////////////////////
/**
 * Node constructor.&nbsp; Nodes are entities that can be transformed, layered,
 * and have events bound to them.  They are the building blocks of a KineticJS
 * application
 * @constructor
 * @param {Object} config
 */
Kinetic.Node = function(config) {
    this.defaultNodeAttrs = {
        visible: true,
        listen: true,
        name: undefined,
        alpha: 1,
        x: 0,
        y: 0,
        scale: {
            x: 1,
            y: 1
        },
        rotation: 0,
        offset: {
            x: 0,
            y: 0
        },
        dragConstraint: 'none',
        dragBounds: {},
        draggable: false
    };

    this.setDefaultAttrs(this.defaultNodeAttrs);
    this.eventListeners = {};

    this.setAttrs(config);

    // bind events
    this.on('draggableChange.kinetic_reserved', function() {
        if(this.attrs.draggable) {
            this._listenDrag();
        }
        else {
            this._dragCleanup();
        }
    });
    /*
     * simulate draggable change event
     * to init drag and drop logic from the
     * above event binder
     */
    this.simulate('draggableChange');
};
/*
 * Node methods
 */
Kinetic.Node.prototype = {
    /**
     * bind events to the node.  KineticJS supports mouseover, mousemove,
     * mouseout, mousedown, mouseup, click, dblclick, touchstart, touchmove,
     * touchend, tap, dbltap, dragstart, dragmove, and dragend.  Pass in a string
     * of event types delimmited by a space to bind multiple events at once
     * such as 'mousedown mouseup mousemove'. include a namespace to bind an
     * event by name such as 'click.foobar'.
     * @param {String} typesStr
     * @param {Function} handler
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
            //var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var event = type;
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
            //var event = (type.indexOf('touch') === -1) ? 'on' + type : type;
            var event = type;
            var parts = event.split('.');
            var baseEvent = parts[0];

            if(this.eventListeners[baseEvent] && parts.length > 1) {
                var name = parts[1];

                for(var i = 0; i < this.eventListeners[baseEvent].length; i++) {
                    if(this.eventListeners[baseEvent][i].name === name) {
                        this.eventListeners[baseEvent].splice(i, 1);
                        if(this.eventListeners[baseEvent].length === 0) {
                            delete this.eventListeners[baseEvent];
                            break;
                        }
                        i--;
                    }
                }
            }
            else {
                delete this.eventListeners[baseEvent];
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
                /*
                 * only set the attr if it's undefined in case
                 * a developer writes a custom class that extends
                 * a Kinetic Class such that their default property
                 * isn't overwritten by the Kinetic Class default
                 * property
                 */
                if(this.attrs[key] === undefined) {
                    this.attrs[key] = config[key];
                }
            }
        }
    },
    /**
     * set attrs
     * @param {Object} config
     */
    setAttrs: function(config) {
        var go = Kinetic.GlobalObject;
        var that = this;

        // set properties from config
        if(config !== undefined) {

            function setAttrs(obj, c, level) {
                for(var key in c) {
                    var val = c[key];

                    // if obj doesn't have the val property, then create it
                    if(obj[key] === undefined) {
                        obj[key] = {};
                    }

                    /*
                     * if property is a pure object (no methods), then add an empty object
                     * to the node and then traverse
                     */
                    if(go._isObject(val) && !go._isArray(val) && !go._isElement(val) && !go._hasMethods(val)) {
                        if(obj[key] === undefined) {
                            obj[key] = {};
                        }
                        setAttrs(obj[key], val, level + 1);
                    }
                    /*
                     * add all other object types to attrs object
                     */
                    else {
                        // handle special keys
                        switch (key) {
                            case 'rotationDeg':
                                that._setAttr(obj, 'rotation', c[key] * Math.PI / 180);
                                // override key for change event
                                key = 'rotation';
                                break;
                            /*
                             * includes:
                             * - node offset
                             * - fill pattern offset
                             * - shadow offset
                             */
                            case 'offset':
                                var pos = go._getXY(val);
                                that._setAttr(obj[key], 'x', pos.x);
                                that._setAttr(obj[key], 'y', pos.y);
                                break;
                            case 'scale':
                                var pos = go._getXY(val);
                                that._setAttr(obj[key], 'x', pos.x);
                                that._setAttr(obj[key], 'y', pos.y);
                                break;
                            case 'points':
                                that._setAttr(obj, key, go._getPoints(val));
                                break;
                            case 'crop':
                                var pos = go._getXY(val);
                                var size = go._getSize(val);
                                that._setAttr(obj[key], 'x', pos.x);
                                that._setAttr(obj[key], 'y', pos.y);
                                that._setAttr(obj[key], 'width', size.width);
                                that._setAttr(obj[key], 'height', size.height);
                                break;
                            default:
                                that._setAttr(obj, key, c[key]);
                                break;
                        }

                        /*
                         * only fire change event for root
                         * level attrs
                         */
                        if(level === 0) {
                            that._fireChangeEvent(key);
                        }
                    }
                }
            }
            setAttrs(this.attrs, config, 0);
        }
    },
    /**
     * determine if shape is visible or not.  Shape is visible only
     * if it's visible and all of its ancestors are visible.  If one ancestor
     * is invisible, this means that the shape is also invisible
     */
    isVisible: function() {
        if(this.getParent() && !this.getParent().isVisible()) {
            return false;
        }
        return this.attrs.visible;
    },
    /**
     * show node
     */
    show: function() {
        this.setAttrs({
            visible: true
        });
    },
    /**
     * hide node
     */
    hide: function() {
        this.setAttrs({
            visible: false
        });
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
     * set node scale.
     * @param arg
     */
    setScale: function() {
        this.setAttrs({
            scale: arguments
        });
    },
    /**
     * set node position
     * @param {Object} point
     */
    setPosition: function() {
        var pos = Kinetic.GlobalObject._getXY(arguments);
        this.setAttrs(pos);
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
        var pos = Kinetic.GlobalObject._getXY(arguments);
        /*
         * save rotation and scale and
         * then remove them from the transform
         */
        var rot = this.attrs.rotation;
        var scale = {
            x: this.attrs.scale.x,
            y: this.attrs.scale.y
        };
        var offset = {
            x: this.attrs.offset.x,
            y: this.attrs.offset.y
        };

        this.attrs.rotation = 0;
        this.attrs.scale = {
            x: 1,
            y: 1
        };

        // unravel transform
        var it = this.getAbsoluteTransform();
        it.invert();
        it.translate(pos.x, pos.y);
        pos = {
            x: this.attrs.x + it.getTranslation().x,
            y: this.attrs.y + it.getTranslation().y
        };

        this.setPosition(pos.x, pos.y);

        // restore rotation and scale
        this.rotate(rot);
        this.attrs.scale = {
            x: scale.x,
            y: scale.y
        };
    },
    /**
     * move node by an amount
     */
    move: function() {
        var pos = Kinetic.GlobalObject._getXY(arguments);

        var x = this.getX();
        var y = this.getY();

        if(pos.x !== undefined) {
            x += pos.x;
        }

        if(pos.y !== undefined) {
            y += pos.y;
        }

        this.setAttrs({
            x: x,
            y: y
        });
    },
    /**
     * set node rotation in degrees
     * @param {Number} deg
     */
    setRotationDeg: function(deg) {
        this.setRotation(deg * Math.PI / 180);
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
        this.setAttrs({
            rotation: this.getRotation() + theta
        });
    },
    /**
     * rotate node by an amount in degrees
     * @param {Number} deg
     */
    rotateDeg: function(deg) {
        this.setAttrs({
            rotation: this.getRotation() + (deg * Math.PI / 180)
        });
    },
    /**
     * listen or don't listen to events
     * @param {Boolean} listen
     */
    listen: function(listen) {
        this.setAttrs({
            listen: listen
        });
    },
    /**
     * is listening or not
     */
    isListening: function() {
        return this.attrs.listen;
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
     * @param {Boolean} draggable
     */
    draggable: function(draggable) {
        this.setAttrs({
            draggable: draggable
        });
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
     * simulate event
     * @param {String} eventType
     */
    simulate: function(eventType) {
        this._handleEvent(eventType, {});
    },
    /**
     * set offset
     * @param {Number} x
     * @param {Number} y
     */
    setOffset: function() {
        this.setAttrs({
            offset: arguments
        });
    },
    /**
     * transition node to another state.  Any property that can accept a real
     *  number can be transitioned, including x, y, rotation, alpha, strokeWidth,
     *  radius, scale.x, scale.y, offset.x, offset.y, etc.
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
                trans._onEnterFrame();
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
    _fireChangeEvent: function(attr) {
        this._handleEvent(attr + 'Change', {});
    },
    _setAttr: function(obj, attr, val) {
        if(val !== undefined) {
            obj[attr] = val;
        }
    },
    _listenDrag: function() {
        this._dragCleanup();
        var go = Kinetic.GlobalObject;
        var that = this;
        this.on('mousedown.initdrag touchstart.initdrag', function(evt) {
            that._initDrag();
        });
    },
    _initDrag: function() {
        var go = Kinetic.GlobalObject;
        var stage = this.getStage();
        var pos = stage.getUserPosition();

        if(pos) {
            var m = this.getTransform().getTranslation();
            var am = this.getAbsoluteTransform().getTranslation();
            go.drag.node = this;
            go.drag.offset.x = pos.x - this.getAbsoluteTransform().getTranslation().x;
            go.drag.offset.y = pos.y - this.getAbsoluteTransform().getTranslation().y;
        }
    },
    /**
     * remove drag and drop event listener
     */
    _dragCleanup: function() {
        this.off('mousedown.initdrag');
        this.off('touchstart.initdrag');
    },
    /**
     * handle node event
     */
    _handleEvent: function(eventType, evt) {
        if(this.nodeType === 'Shape') {
            evt.shape = this;
        }

        var stage = this.getStage();
        var mouseoverNode = stage ? stage.mouseoverShape : null;
        var mouseoutNode = stage ? stage.mouseoutShape : null;
        var el = this.eventListeners;
        var okayToRun = true;

        /*
         * determine if event handler should be skipped by comparing
         * parent nodes
         */
        if(eventType === 'mouseover' && mouseoutNode && mouseoutNode._id === this._id) {
            okayToRun = false;
        }
        else if(eventType === 'mouseout' && mouseoverNode && mouseoverNode._id === this._id) {
            okayToRun = false;
        }

        if(el[eventType] && okayToRun) {
            var events = el[eventType];
            for(var i = 0; i < events.length; i++) {
                events[i].handler.apply(this, [evt]);
            }
        }

        var mouseoverParent = mouseoverNode ? mouseoverNode.parent : undefined;
        var mouseoutParent = mouseoutNode ? mouseoutNode.parent : undefined;

        // simulate event bubbling
        if(!evt.cancelBubble && this.parent && this.parent.nodeType !== 'Stage') {
            this._handleEvent.call(this.parent, eventType, evt);
        }
    }
};

// add setters and getters
Kinetic.GlobalObject.addSetters(Kinetic.Node, ['x', 'y', 'detectionType', 'rotation', 'alpha', 'name', 'id', 'dragConstraint', 'dragBounds']);
Kinetic.GlobalObject.addGetters(Kinetic.Node, ['scale', 'x', 'y', 'detectionType', 'rotation', 'alpha', 'name', 'id', 'offset', 'dragConstraint', 'dragBounds']);

/**
 * set node x position
 * @param {Number} x
 */

/**
 * set node y position
 * @param {Number} y
 */

/**
 * set detection type
 * @param {String} type can be "path" or "pixel"
 */

/**
 * set node rotation in radians
 * @param {Number} theta
 */

/**
 * set alpha.  Alpha values range from 0 to 1.
 * A node with an alpha of 0 is fully transparent, and a node
 * with an alpha of 1 is fully opaque
 * @param {Object} alpha
 */

/**
 * set drag constraint
 * @param {String} constraint
 */

/**
 * set drag bounds
 * @param {Object} bounds
 * @config {Number} [left] left bounds position
 * @config {Number} [top] top bounds position
 * @config {Number} [right] right bounds position
 * @config {Number} [bottom] bottom bounds position
 */

/**
 * get scale
 */

/**
 * get node x position
 */

/**
 * get node y position
 */

/**
 * get detection type
 */

/**
 * get rotation in radians
 */

/**
 * get alpha.  Alpha values range from 0 to 1.
 * A node with an alpha of 0 is fully transparent, and a node
 * with an alpha of 1 is fully opaque
 */

/**
 * get name
 */

/**
 * get id
 */

/**
 * get center offset
 */

/**
 * get drag constraint
 */

/**
 * get drag bounds
 */