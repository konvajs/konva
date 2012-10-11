///////////////////////////////////////////////////////////////////////
//  Node
///////////////////////////////////////////////////////////////////////
/**
 * Node constructor.&nbsp; Nodes are entities that can be transformed, layered,
 * and have events bound to them.  They are the building blocks of a KineticJS
 * application
 * @constructor
 * @param {Object} config
 * @param {Number} [config.x]
 * @param {Number} [config.y]
 * @param {Boolean} [config.visible]
 * @param {Boolean} [config.listening] whether or not the node is listening for events
 * @param {String} [config.id] unique id
 * @param {String} [config.name] non-unique name
 * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
 * @param {Object} [config.scale]
 * @param {Number} [config.scale.x]
 * @param {Number} [config.scale.y]
 * @param {Number} [config.rotation] rotation in radians
 * @param {Number} [config.rotationDeg] rotation in degrees
 * @param {Object} [config.offset] offsets default position point and rotation point
 * @param {Number} [config.offset.x]
 * @param {Number} [config.offset.y]
 * @param {Boolean} [config.draggable]
 * @param {Function} [config.dragBoundFunc] dragBoundFunc(pos, evt) should return new position
 */
Kinetic.Node = function(config) {
    this._nodeInit(config);
};

Kinetic.Node.prototype = {
    _nodeInit: function(config) {
        this.defaultNodeAttrs = {
            visible: true,
            listening: true,
            name: undefined,
            opacity: 1,
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
            draggable: false
        };

        this.setDefaultAttrs(this.defaultNodeAttrs);
        this.eventListeners = {};
        this.transAnim = new Kinetic.Animation();
        this.setAttrs(config);

        // bind events
        this.on('draggableChange.kinetic', function() {
            this._onDraggableChange();
        });
        var that = this;
        this.on('idChange.kinetic', function(evt) {
            var stage = that.getStage();
            if(stage) {
                stage._removeId(evt.oldVal);
                stage._addId(that);
            }
        });
        this.on('nameChange.kinetic', function(evt) {
            var stage = that.getStage();
            if(stage) {
                stage._removeName(evt.oldVal, that._id);
                stage._addName(that);
            }
        });

        this._onDraggableChange();
    },
    /**
     * bind events to the node.  KineticJS supports mouseover, mousemove,
     *  mouseout, mousedown, mouseup, click, dblclick, touchstart, touchmove,
     *  touchend, tap, dbltap, dragstart, dragmove, and dragend.  Pass in a string
     *  of event types delimmited by a space to bind multiple events at once
     *  such as 'mousedown mouseup mousemove'. include a namespace to bind an
     *  event by name such as 'click.foobar'.
     * @name on
     * @methodOf Kinetic.Node.prototype
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
     *  event types delimmited by a space to remove multiple event
     *  bindings at once such as 'mousedown mouseup mousemove'.
     *  include a namespace to remove an event binding by name
     *  such as 'click.foobar'. If you only give a name like '.foobar',
     *  all events in that namespace will be removed.
     * @name off
     * @methodOf Kinetic.Node.prototype
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

            if(parts.length > 1) {
                if(baseEvent) {
                    if(this.eventListeners[baseEvent]) {
                        this._off(baseEvent, parts[1]);
                    }
                }
                else {
                    for(var type in this.eventListeners) {
                        this._off(type, parts[1]);
                    }
                }
            }
            else {
                delete this.eventListeners[baseEvent];
            }
        }
    },
    /**
     * remove child from container
     * @name remove
     * @methodOf Kinetic.Container.prototype
     * @param {Node} child
     */
    remove: function() {
        var parent = this.getParent();
        if(parent && this.index !== undefined && parent.children[this.index]._id == this._id) {
            var stage = parent.getStage();
            /*
             * remove event listeners and references to the node
             * from the ids and names hashes
             */
            if(stage) {
                stage._removeId(this.getId());
                stage._removeName(this.getName(), this._id);
            }

            Kinetic.Global._removeTempNode(this);
            parent.children.splice(this.index, 1);
            parent._setChildrenIndices();

            // remove children
            while(this.children && this.children.length > 0) {
                this.children[0].remove();
            }
        }
    },
    /**
     * get attrs
     * @name getAttrs
     * @methodOf Kinetic.Node.prototype
     */
    getAttrs: function() {
        return this.attrs;
    },
    /**
     * set default attrs.  This method should only be used if
     *  you're creating a custom node
     * @name setDefaultAttrs
     * @methodOf Kinetic.Node.prototype
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
     * @name setAttrs
     * @methodOf Kinetic.Node.prototype
     * @param {Object} config
     */
    setAttrs: function(config) {
        if(config) {
            for(var key in config) {
                var method = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
                // use setter if available
                if(Kinetic.Type._isFunction(this[method])) {
                    this[method](config[key]);
                }
                // otherwise set directly
                else {
                    this.setAttr(key, config[key]);
                }
            }
        }
    },
    /**
     * determine if shape is visible or not.  Shape is visible only
     *  if it's visible and all of its ancestors are visible.  If an ancestor
     *  is invisible, this means that the shape is also invisible
     * @name isVisible
     * @methodOf Kinetic.Node.prototype
     */
    isVisible: function() {
        if(this.attrs.visible && this.getParent() && !this.getParent().isVisible()) {
            return false;
        }
        return this.attrs.visible;
    },
    /**
     * show node
     * @name show
     * @methodOf Kinetic.Node.prototype
     */
    show: function() {
        this.setVisible(true);
    },
    /**
     * hide node.  Hidden nodes are no longer detectable
     * @name hide
     * @methodOf Kinetic.Node.prototype
     */
    hide: function() {
        this.setVisible(false);
    },
    /**
     * get zIndex
     * @name getZIndex
     * @methodOf Kinetic.Node.prototype
     */
    getZIndex: function() {
        return this.index;
    },
    /**
     * get absolute z-index which takes into account sibling
     *  and parent indices
     * @name getAbsoluteZIndex
     * @methodOf Kinetic.Node.prototype
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
     * @name getLevel
     * @methodOf Kinetic.Node.prototype
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
     * set node position
     * @name setPosition
     * @methodOf Kinetic.Node.prototype
     * @param {Number} x
     * @param {Number} y
     */
    setPosition: function() {
        var pos = Kinetic.Type._getXY([].slice.call(arguments));
        this.setAttr('x', pos.x);
        this.setAttr('y', pos.y);
    },
    /**
     * get node position relative to container
     * @name getPosition
     * @methodOf Kinetic.Node.prototype
     */
    getPosition: function() {
        return {
            x: this.attrs.x,
            y: this.attrs.y
        };
    },
    /**
     * get absolute position
     * @name getAbsolutePosition
     * @methodOf Kinetic.Node.prototype
     */
    getAbsolutePosition: function() {
        var trans = this.getAbsoluteTransform();
        var o = this.getOffset();
        trans.translate(o.x, o.y);
        return trans.getTranslation();
    },
    /**
     * set absolute position
     * @name setAbsolutePosition
     * @methodOf Kinetic.Node.prototype
     * @param {Object} pos object containing an x and
     *  y property
     */
    setAbsolutePosition: function() {
        var pos = Kinetic.Type._getXY([].slice.call(arguments));
        var trans = this._clearTransform();
        // don't clear translation
        this.attrs.x = trans.x;
        this.attrs.y = trans.y;
        delete trans.x;
        delete trans.y;

        // unravel transform
        var it = this.getAbsoluteTransform();

        it.invert();
        it.translate(pos.x, pos.y);
        pos = {
            x: this.attrs.x + it.getTranslation().x,
            y: this.attrs.y + it.getTranslation().y
        };

        this.setPosition(pos.x, pos.y);
        this._setTransform(trans);
    },
    /**
     * move node by an amount
     * @name move
     * @methodOf Kinetic.Node.prototype
     * @param {Number} x
     * @param {Number} y
     */
    move: function() {
        var pos = Kinetic.Type._getXY([].slice.call(arguments));

        var x = this.getX();
        var y = this.getY();

        if(pos.x !== undefined) {
            x += pos.x;
        }

        if(pos.y !== undefined) {
            y += pos.y;
        }

        this.setPosition(x, y);
    },
    /**
     * get rotation in degrees
     * @name getRotationDeg
     * @methodOf Kinetic.Node.prototype
     */
    getRotationDeg: function() {
        return this.getRotation() * 180 / Math.PI;
    },
    /**
     * set rotation in degrees
     * @name setRotationDeg
     * @methodOf Kinetic.Node.prototype
     * @param {Number} rotDeg
     */
    setRotationDeg: function(rotDeg) {
        this.setRotation(rotDeg * Math.PI / 180);
    },
    /**
     * rotate node by an amount in radians
     * @name rotate
     * @methodOf Kinetic.Node.prototype
     * @param {Number} theta
     */
    rotate: function(theta) {
        this.setRotation(this.getRotation() + theta);
    },
    /**
     * rotate node by an amount in degrees
     * @name rotateDeg
     * @methodOf Kinetic.Node.prototype
     * @param {Number} deg
     */
    rotateDeg: function(deg) {
        this.setRotation(this.getRotation() + (deg * Math.PI / 180));
    },
    /**
     * move node to the top of its siblings
     * @name moveToTop
     * @methodOf Kinetic.Node.prototype
     */
    moveToTop: function() {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.push(this);
        this.parent._setChildrenIndices();
        return true;
    },
    /**
     * move node up
     * @name moveUp
     * @methodOf Kinetic.Node.prototype
     */
    moveUp: function() {
        var index = this.index;
        if(index < this.parent.getChildren().length - 1) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index + 1, 0, this);
            this.parent._setChildrenIndices();
            return true;
        }
    },
    /**
     * move node down
     * @name moveDown
     * @methodOf Kinetic.Node.prototype
     */
    moveDown: function() {
        var index = this.index;
        if(index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.splice(index - 1, 0, this);
            this.parent._setChildrenIndices();
            return true;
        }
    },
    /**
     * move node to the bottom of its siblings
     * @name moveToBottom
     * @methodOf Kinetic.Node.prototype
     */
    moveToBottom: function() {
        var index = this.index;
        if(index > 0) {
            this.parent.children.splice(index, 1);
            this.parent.children.unshift(this);
            this.parent._setChildrenIndices();
            return true;
        }
    },
    /**
     * set zIndex
     * @name setZIndex
     * @methodOf Kinetic.Node.prototype
     * @param {Integer} zIndex
     */
    setZIndex: function(zIndex) {
        var index = this.index;
        this.parent.children.splice(index, 1);
        this.parent.children.splice(zIndex, 0, this);
        this.parent._setChildrenIndices();
    },
    /**
     * get absolute opacity
     * @name getAbsoluteOpacity
     * @methodOf Kinetic.Node.prototype
     */
    getAbsoluteOpacity: function() {
        var absOpacity = this.getOpacity();
        if(this.getParent()) {
            absOpacity *= this.getParent().getAbsoluteOpacity();
        }
        return absOpacity;
    },
    /**
     * determine if node is currently in drag and drop mode
     * @name isDragging
     * @methodOf Kinetic.Node.prototype
     */
    isDragging: function() {
        var go = Kinetic.Global;
        return go.drag.node && go.drag.node._id === this._id && go.drag.moving;
    },
    /**
     * move node to another container
     * @name moveTo
     * @methodOf Kinetic.Node.prototype
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
     * convert Node into an object for serialization
     * @name toObject
     * @methodOf Kinetic.Node.prototype
     */
    toObject: function() {
        var obj = {};
        var type = Kinetic.Type;

        obj.attrs = {};

        // serialize only attributes that are not function, image, DOM, or objects with methods
        for(var key in this.attrs) {
            var val = this.attrs[key];
            if(!type._isFunction(val) && !type._isElement(val) && !(type._isObject(val) && type._hasMethods(val))) {
                obj.attrs[key] = val;
            }
        }

        obj.nodeType = this.nodeType;
        obj.shapeType = this.shapeType;

        return obj;
    },
    toJSON: function() {
        return JSON.stringify(this.toObject());
    },
    /**
     * get parent container
     * @name getParent
     * @methodOf Kinetic.Node.prototype
     */
    getParent: function() {
        return this.parent;
    },
    /**
     * get layer that contains the node
     * @name getLayer
     * @methodOf Kinetic.Node.prototype
     */
    getLayer: function() {
        return this.getParent().getLayer();
    },
    /**
     * get stage that contains the node
     * @name getStage
     * @methodOf Kinetic.Node.prototype
     */
    getStage: function() {
        if(this.getParent()) {
            return this.getParent().getStage();
        }
        else {
            return undefined;
        }
    },
    /**
     * simulate event
     * @name simulate
     * @methodOf Kinetic.Node.prototype
     * @param {String} eventType
     */
    simulate: function(eventType) {
        this._handleEvent(eventType, {});
    },
    /**
     * transition node to another state.  Any property that can accept a real
     *  number can be transitioned, including x, y, rotation, opacity, strokeWidth,
     *  radius, scale.x, scale.y, offset.x, offset.y, etc.
     * @name transitionTo
     * @methodOf Kinetic.Node.prototype
     * @param {Object} config
     * @config {Number} duration duration that the transition runs in seconds
     * @config {String} [easing] easing function.  can be linear, ease-in, ease-out, ease-in-out,
     *  back-ease-in, back-ease-out, back-ease-in-out, elastic-ease-in, elastic-ease-out,
     *  elastic-ease-in-out, bounce-ease-out, bounce-ease-in, bounce-ease-in-out,
     *  strong-ease-in, strong-ease-out, or strong-ease-in-out
     *  linear is the default
     * @config {Function} [callback] callback function to be executed when
     *  transition completes
     */
    transitionTo: function(config) {
        /*
         * create new transition
         */
        var node = this.nodeType === 'Stage' ? this : this.getLayer();
        var that = this;
        var trans = new Kinetic.Transition(this, config);

        this.transAnim.func = function() {
            trans._onEnterFrame();
        };
        this.transAnim.node = node;

        // subscribe to onFinished for first tween
        trans.onFinished = function() {
            // remove animation
            that.transAnim.stop();
            that.transAnim.node.draw();

            // callback
            if(config.callback) {
                config.callback();
            }
        };
        // auto start
        trans.start();
        this.transAnim.start();
        return trans;
    },
    /**
     * get absolute transform of the node which takes into
     *  account its parent transforms
     * @name getAbsoluteTransform
     * @methodOf Kinetic.Node.prototype
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
     * get transform of the node
     * @name getTransform
     * @methodOf Kinetic.Node.prototype
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
        if(this.attrs.offset && (this.attrs.offset.x !== 0 || this.attrs.offset.y !== 0)) {
            m.translate(-1 * this.attrs.offset.x, -1 * this.attrs.offset.y);
        }

        return m;
    },
    /**
     * clone node
     * @name clone
     * @methodOf Kinetic.Node.prototype
     * @param {Object} attrs override attrs
     */
    clone: function(obj) {
        // instantiate new node
        var classType = this.shapeType || this.nodeType;
        var node = new Kinetic[classType](this.attrs);

        /*
         * copy over user listeners
         */
        for(var key in this.eventListeners) {
            var allListeners = this.eventListeners[key];
            for(var n = 0; n < allListeners.length; n++) {
                var listener = allListeners[n];
                /*
                 * don't include kinetic namespaced listeners because
                 *  these are generated by the constructors
                 */
                if(listener.name.indexOf('kinetic') < 0) {
                    // if listeners array doesn't exist, then create it
                    if(!node.eventListeners[key]) {
                        node.eventListeners[key] = [];
                    }
                    node.eventListeners[key].push(listener);
                }
            }
        }

        // apply attr overrides
        node.setAttrs(obj);
        return node;
    },
    /**
     * Creates a composite data URL. If MIME type is not
     * specified, then "image/png" will result. For "image/jpeg", specify a quality
     * level as quality (range 0.0 - 1.0)
     * @name toDataURL
     * @methodOf Kinetic.Node.prototype
     * @param {Object} config
     * @param {String} [config.mimeType] mime type.  can be "image/png" or "image/jpeg".
     *  "image/png" is the default
     * @param {Number} [config.width] data url image width
     * @param {Number} [config.height] data url image height
     * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
     *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
     *  is very high quality
     */
    toDataURL: function(config) {
        var mimeType = config && config.mimeType ? config.mimeType : null;
        var quality = config && config.quality ? config.quality : null;
        var canvas;

        //if width and height are defined, create new canvas to draw on, else reuse stage buffer canvas
        if(config && config.width && config.height) {
            canvas = new Kinetic.Canvas(config.width, config.height);
        }
        else {
            canvas = this.getStage().bufferCanvas;
            canvas.clear();
        }

        this.draw(canvas);
        return canvas.toDataURL(mimeType, quality);
    },
    /**
     * converts node into an image.  Since the toImage
     *  method is asynchronous, a callback is required
     * @name toImage
     * @methodOf Kinetic.Stage.prototype
     * @param {Object} config
     * @param {Function} callback since the toImage() method is asynchonrous, the
     *  resulting image object is passed into the callback function
     * @param {String} [config.mimeType] mime type.  can be "image/png" or "image/jpeg".
     *  "image/png" is the default
     * @param {Number} [config.width] data url image width
     * @param {Number} [config.height] data url image height
     * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
     *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
     *  is very high quality
     */
    toImage: function(config) {
        Kinetic.Type._getImage(this.toDataURL(config), function(img) {
            config.callback(img);
        });
    },
    /**
     * set offset.  A node's offset defines the position and rotation point
     * @name setOffset
     * @methodOf Kinetic.Node.prototype
     * @param {Number} x
     * @param {Number} y
     */
    setOffset: function() {
        var pos = Kinetic.Type._getXY([].slice.call(arguments));
        if(pos.x === undefined) {
            pos.x = this.getOffset().x;
        }
        if(pos.y === undefined) {
            pos.y = this.getOffset().y;
        }
        this.setAttr('offset', pos);
    },
    /**
     * set scale.
     * @name setScale
     * @param {Number} x
     * @param {Number} y
     * @methodOf Kinetic.Node.prototype
     */
    setScale: function() {
        var pos = Kinetic.Type._getXY([].slice.call(arguments));

        if(pos.x === undefined) {
            pos.x = this.getScale().x;
        }
        if(pos.y === undefined) {
            pos.y = this.getScale().y;
        }
        this.setAttr('scale', pos);

    },
    /**
     * set size
     * @name setSize
     * @methodOf Kinetic.Node.prototype
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function() {
        // set stage dimensions
        var size = Kinetic.Type._getSize(Array.prototype.slice.call(arguments));
        this.setWidth(size.width);
        this.setHeight(size.height);
    },
    /**
     * get size
     * @name getSize
     * @methodOf Kinetic.Node.prototype
     */
    getSize: function() {
        return {
            width: this.getWidth(),
            height: this.getHeight()
        };
    },
    /**
     * get width
     * @name getWidth
     * @methodOf Kinetic.Node.prototype
     */
    getWidth: function() {
        return this.attrs.width || 0;
    },
    /**
     * get height
     * @name getHeight
     * @methodOf Kinetic.Node.prototype
     */
    getHeight: function() {
        return this.attrs.height || 0;
    },
    _get: function(selector) {
        return this.nodeType === selector ? [this] : [];
    },
    _off: function(type, name) {
        for(var i = 0; i < this.eventListeners[type].length; i++) {
            if(this.eventListeners[type][i].name === name) {
                this.eventListeners[type].splice(i, 1);
                if(this.eventListeners[type].length === 0) {
                    delete this.eventListeners[type];
                    break;
                }
                i--;
            }
        }
    },
    _clearTransform: function() {
        var trans = {
            x: this.attrs.x,
            y: this.attrs.y,
            rotation: this.attrs.rotation,
            scale: {
                x: this.attrs.scale.x,
                y: this.attrs.scale.y
            },
            offset: {
                x: this.attrs.offset.x,
                y: this.attrs.offset.y
            }
        };

        this.attrs.x = 0;
        this.attrs.y = 0;
        this.attrs.rotation = 0;
        this.attrs.scale = {
            x: 1,
            y: 1
        };
        this.attrs.offset = {
            x: 0,
            y: 0
        };

        return trans;
    },
    _setTransform: function(trans) {
        for(var key in trans) {
            this.attrs[key] = trans[key];
        }
    },
    _fireBeforeChangeEvent: function(attr, oldVal, newVal) {
        this._handleEvent('before' + attr.toUpperCase() + 'Change', {
            oldVal: oldVal,
            newVal: newVal
        });
    },
    _fireChangeEvent: function(attr, oldVal, newVal) {
        this._handleEvent(attr + 'Change', {
            oldVal: oldVal,
            newVal: newVal
        });
    },
    setAttr: function(key, val) {
        if(val !== undefined) {
            var oldVal = this.attrs[key];
            this._fireBeforeChangeEvent(key, oldVal, val);
            this.attrs[key] = val;
            this._fireChangeEvent(key, oldVal, val);
        }
    },
    _listenDrag: function() {
        this._dragCleanup();
        var go = Kinetic.Global;
        var that = this;
        this.on('mousedown.kinetic touchstart.kinetic', function(evt) {
            that._initDrag();
        });
    },
    _initDrag: function() {
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
                stage.dragAnim.node = this;
            }
            else {
                stage.dragAnim.node = this.getLayer();
            }
            stage.dragAnim.start();
        }
    },
    _onDraggableChange: function() {
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
    },
    /**
     * remove drag and drop event listener
     */
    _dragCleanup: function() {
        this.off('mousedown.kinetic');
        this.off('touchstart.kinetic');
    },
    /**
     * handle node event
     */
    _handleEvent: function(eventType, evt, compareShape) {
        if(this.nodeType === 'Shape') {
            evt.shape = this;
        }
        var stage = this.getStage();
        var el = this.eventListeners;
        var okayToRun = true;

        if(eventType === 'mouseenter' && compareShape && this._id === compareShape._id) {
            okayToRun = false;
        }
        else if(eventType === 'mouseleave' && compareShape && this._id === compareShape._id) {
            okayToRun = false;
        }

        if(okayToRun) {
            if(el[eventType]) {
                var events = el[eventType];
                for(var i = 0; i < events.length; i++) {
                    events[i].handler.apply(this, [evt]);
                }
            }

            // simulate event bubbling
            if(Kinetic.Global.BUBBLE_WHITELIST.indexOf(eventType) >= 0 && !evt.cancelBubble && this.parent) {
                if(compareShape && compareShape.parent) {
                    this._handleEvent.call(this.parent, eventType, evt, compareShape.parent);
                }
                else {
                    this._handleEvent.call(this.parent, eventType, evt);
                }
            }
        }
    },
    _shouldDraw: function(canvas) {
        return (this.isVisible() && (!canvas || canvas.name !== 'buffer' || this.getListening()));
    }
};

// add getter and setter methods
Kinetic.Node.addSetters = function(constructor, arr) {
    for(var n = 0; n < arr.length; n++) {
        var attr = arr[n];
        this._addSetter(constructor, attr);
    }
};
Kinetic.Node.addGetters = function(constructor, arr) {
    for(var n = 0; n < arr.length; n++) {
        var attr = arr[n];
        this._addGetter(constructor, attr);
    }
};
Kinetic.Node.addGettersSetters = function(constructor, arr) {
    this.addSetters(constructor, arr);
    this.addGetters(constructor, arr);
};
Kinetic.Node._addSetter = function(constructor, attr) {
    var that = this;
    var method = 'set' + attr.charAt(0).toUpperCase() + attr.slice(1);
    constructor.prototype[method] = function(val) {
        this.setAttr(attr, val);
    };
};
Kinetic.Node._addGetter = function(constructor, attr) {
    var that = this;
    var method = 'get' + attr.charAt(0).toUpperCase() + attr.slice(1);
    constructor.prototype[method] = function(arg) {
        return this.attrs[attr];
    };
};
/**
 * create node with JSON string.  De-serializtion does not generate custom
 *  shape drawing functions, images, or event handlers (this would make the
 * 	serialized object huge).  If your app uses custom shapes, images, and
 *  event handlers (it probably does), then you need to select the appropriate
 *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
 *  and setImage()
 * @name create
 * @methodOf Kinetic.Node
 * @param {String} JSON string
 */
Kinetic.Node.create = function(json, container) {
    return this._createNode(JSON.parse(json), container);
};
Kinetic.Node._createNode = function(obj, container) {
    var type;

    // determine type
    if(obj.nodeType === 'Shape') {
        // add custom shape
        if(obj.shapeType === undefined) {
            type = 'Shape';
        }
        // add standard shape
        else {
            type = obj.shapeType;
        }
    }
    else {
        type = obj.nodeType;
    }

    // if container was passed in, add it to attrs
    if(container) {
        obj.attrs.container = container;
    }

    var no = new Kinetic[type](obj.attrs);
    if(obj.children) {
        for(var n = 0; n < obj.children.length; n++) {
            no.add(this._createNode(obj.children[n]));
        }
    }

    return no;
};
// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Node, ['x', 'y', 'rotation', 'opacity', 'name', 'id', 'draggable', 'listening', 'visible', 'dragBoundFunc']);
Kinetic.Node.addGetters(Kinetic.Node, ['scale', 'offset']);
Kinetic.Node.addSetters(Kinetic.Node, ['width', 'height']);

// mappings
/**
 * determine if listening to events or not.  Alias of getListening()
 * @name isListening
 * @methodOf Kinetic.Node.prototype
 */
Kinetic.Node.prototype.isListening = Kinetic.Node.prototype.getListening;
/**
 * get draggable.  Alias of getDraggable()
 * @name isDraggable
 * @methodOf Kinetic.Node.prototype
 */
Kinetic.Node.prototype.isDraggable = Kinetic.Node.prototype.getDraggable;

// collection mappings
(function() {
    var collectionMappings = ['on', 'off'];
    for(var n = 0; n < collectionMappings.length; n++) {
        // induce scope
        (function(i) {
            var method = collectionMappings[i];
            Kinetic.Collection.prototype[method] = function() {
                var args = [].slice.call(arguments);
                args.unshift(method);
                this.apply.apply(this, args);
            };
        })(n);
    }
})();

/**
 * set node x position
 * @name setX
 * @methodOf Kinetic.Node.prototype
 * @param {Number} x
 */

/**
 * set node y position
 * @name setY
 * @methodOf Kinetic.Node.prototype
 * @param {Number} y
 */

/**
 * set node rotation in radians
 * @name setRotation
 * @methodOf Kinetic.Node.prototype
 * @param {Number} theta
 */

/**
 * set opacity.  Opacity values range from 0 to 1.
 *  A node with an opacity of 0 is fully transparent, and a node
 *  with an opacity of 1 is fully opaque
 * @name setOpacity
 * @methodOf Kinetic.Node.prototype
 * @param {Object} opacity
 */

/**
 * set name
 * @name setName
 * @methodOf Kinetic.Node.prototype
 * @param {String} name
 */

/**
 * set id
 * @name setId
 * @methodOf Kinetic.Node.prototype
 * @param {String} id
 */

/**
 * set draggable
 * @name setDraggable
 * @methodOf Kinetic.Node.prototype
 * @param {String} draggable
 */

/**
 * listen or don't listen to events
 * @name setListening
 * @methodOf Kinetic.Node.prototype
 * @param {Boolean} listening
 */

/**
 * set visible
 * @name setVisible
 * @methodOf Kinetic.Node.prototype
 * @param {Boolean} visible
 */

/**
 * set drag bound function.  This is used to override the default
 *  drag and drop position
 * @name setDragBoundFunc
 * @methodOf Kinetic.Node.prototype
 * @param {Function} dragBoundFunc
 */


/**
 * get node x position
 * @name getX
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get node y position
 * @name getY
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get rotation in radians
 * @name getRotation
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get opacity.
 * @name getOpacity
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get name
 * @name getName
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get id
 * @name getId
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get scale
 * @name getScale
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get offset
 * @name getOffset
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get draggable
 * @name getDraggable
 * @methodOf Kinetic.Node.prototype
 */

/**
 * determine if listening to events or not
 * @name getListening
 * @methodOf Kinetic.Node.prototype
 */

/**
 * determine if visible or not
 * @name getVisible
 * @methodOf Kinetic.Node.prototype
 */

/**
 * get dragBoundFunc
 * @name getDragBoundFunc
 * @methodOf Kinetic.Node.prototype
 */