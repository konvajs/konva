(function() {
    // CONSTANTS
    var SPACE = ' ',
        EMPTY_STRING = '',
        DOT = '.',
        GET = 'get',
        SET = 'set',
        SHAPE = 'Shape',
        STAGE = 'Stage',
        X = 'x',
        Y = 'y',
        UPPER_X = 'X',
        UPPER_Y = 'Y',
        KINETIC = 'kinetic',
        BEFORE = 'before',
        CHANGE = 'Change',
        ID = 'id',
        NAME = 'name',
        MOUSEENTER = 'mouseenter',
        MOUSELEAVE = 'mouseleave',
        DEG = 'Deg',
        ON = 'on',
        OFF = 'off',
        BEFORE_DRAW = 'beforeDraw',
        DRAW = 'draw',
        BLACK = 'black',
        RGB = 'RGB',
        R = 'r',
        G = 'g',
        B = 'b',
        UPPER_R = 'R',
        UPPER_G = 'G',
        UPPER_B = 'B',
        HASH = '#';
        
    /**
     * Node constructor. Nodes are entities that can be transformed, layered,
     * and have bound events. The stage, layers, groups, and shapes all extend Node.
     * @constructor
     * @param {Object} config
     * {{NodeParams}}
     */
    Kinetic.Node = function(config) {
        this._nodeInit(config);
    };

    Kinetic.Node.prototype = {
        _nodeInit: function(config) {
            this._id = Kinetic.Global.idCounter++;
            this.eventListeners = {};
            this.setAttrs(config);
        },
        /**
         * bind events to the node. KineticJS supports mouseover, mousemove,
         *  mouseout, mouseenter, mouseleave, mousedown, mouseup, click, dblclick, touchstart, touchmove,
         *  touchend, tap, dbltap, dragstart, dragmove, and dragend events. Pass in a string
         *  of events delimmited by a space to bind multiple events at once
         *  such as 'mousedown mouseup mousemove'. Include a namespace to bind an
         *  event by name such as 'click.foobar'.
         * @name on
         * @methodOf Kinetic.Node.prototype
         * @param {String} typesStr e.g. 'click', 'mousedown touchstart', 'mousedown.foo touchstart.foo'
         * @param {Function} handler The handler function is passed an event object
         */
        on: function(typesStr, handler) {
            var types = typesStr.split(SPACE),
                len = types.length,
                n, type, event, parts, baseEvent, name;
            
             /*
             * loop through types and attach event listeners to
             * each one.  eg. 'click mouseover.namespace mouseout'
             * will create three event bindings
             */
            for(n = 0; n < len; n++) {
                type = types[n];
                event = type;
                parts = event.split(DOT);
                baseEvent = parts[0];
                name = parts.length > 1 ? parts[1] : EMPTY_STRING;

                if(!this.eventListeners[baseEvent]) {
                    this.eventListeners[baseEvent] = [];
                }

                this.eventListeners[baseEvent].push({
                    name: name,
                    handler: handler
                });
            }
            return this;
        },
        /**
         * remove event bindings from the node. Pass in a string of
         *  event types delimmited by a space to remove multiple event
         *  bindings at once such as 'mousedown mouseup mousemove'.
         *  include a namespace to remove an event binding by name
         *  such as 'click.foobar'. If you only give a name like '.foobar',
         *  all events in that namespace will be removed.
         * @name off
         * @methodOf Kinetic.Node.prototype
         * @param {String} typesStr e.g. 'click', 'mousedown touchstart', '.foobar'
         */
        off: function(typesStr) {
            var types = typesStr.split(SPACE),
                len = types.length,
                n, type, event, parts, baseEvent;
                
            for(n = 0; n < len; n++) {
                type = types[n];
                event = type;
                parts = event.split(DOT);
                baseEvent = parts[0];

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
            return this;
        },
        /**
         * remove child from container, but don't destroy it
         * @name remove
         * @methodOf Kinetic.Node.prototype
         */
        remove: function() {
            var parent = this.getParent();
            
            if(parent && parent.children) {
                parent.children.splice(this.index, 1);
                parent._setChildrenIndices();
            }
            delete this.parent;
        },
        /**
         * remove and destroy node
         * @name destroy
         * @methodOf Kinetic.Node.prototype
         */
        destroy: function() {
            var parent = this.getParent(), 
                stage = this.getStage(), 
                dd = Kinetic.DD, 
                go = Kinetic.Global;

            // destroy children
            while(this.children && this.children.length > 0) {
                this.children[0].destroy();
            }

            // remove from ids and names hashes
            go._removeId(this.getId());
            go._removeName(this.getName(), this._id);

            // TODO: stop transitions
 
            this.remove();
        },
        /**
         * get attr
         * @name getAttr
         * @methodOf Kinetic.Node.prototype
         * @param {String} attr  
         */
        getAttr: function(attr) {
            var method = GET + Kinetic.Type._capitalize(attr);
            if(Kinetic.Type._isFunction(this[method])) {
                return this[method]();
            }
            // otherwise get directly
            else {
                return this.attrs[attr];
            }
        },
        /**
         * get attrs
         * @name getAttrs
         * @methodOf Kinetic.Node.prototype
         */
        getAttrs: function() {
            return this.attrs || {};
        },
        /**
         * @name createAttrs
         * @methodOf Kinetic.Node.prototype
         */
        createAttrs: function() {
            if(this.attrs === undefined) {
                this.attrs = {};
            }
        },
        
        /**
         * set attrs
         * @name setAttrs
         * @methodOf Kinetic.Node.prototype
         * @param {Object} config object containing key value pairs
         */
        setAttrs: function(config) {
            var key, method;
            
            if(config) {
                for(key in config) {
                    method = SET + Kinetic.Type._capitalize(key);
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
         * determine if node is visible or not.  Node is visible only
         *  if it's visible and all of its ancestors are visible.  If an ancestor
         *  is invisible, this means that the node is also invisible
         * @name getVisible
         * @methodOf Kinetic.Node.prototype
         */
        getVisible: function() {
            var visible = this.attrs.visible, 
                parent = this.getParent();
              
            // default  
            if (visible === undefined) {
                visible = true;  
            }
            
            if(visible && parent && !parent.getVisible()) {
                return false;
            }
            return visible;
        },
        /**
         * determine if node is listening or not.  Node is listening only
         *  if it's listening and all of its ancestors are listening.  If an ancestor
         *  is not listening, this means that the node is also not listening
         * @name getListening
         * @methodOf Kinetic.Node.prototype
         */
        getListening: function() {
            var listening = this.attrs.listening, 
                parent = this.getParent();
                
            // default  
            if (listening === undefined) {
                listening = true;  
            }
            
            if(listening && parent && !parent.getListening()) {
                return false;
            }
            return listening;
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
         * get zIndex relative to the node's siblings who share the same parent
         * @name getZIndex
         * @methodOf Kinetic.Node.prototype
         */
        getZIndex: function() {
            return this.index || 0;
        },
        /**
         * get absolute z-index which takes into account sibling
         *  and ancestor indices
         * @name getAbsoluteZIndex
         * @methodOf Kinetic.Node.prototype
         */
        getAbsoluteZIndex: function() {
            var level = this.getLevel(),
                stage = this.getStage(),
                that = this,
                index = 0,
                nodes, len, n, child;
                
            function addChildren(children) {
                nodes = [];
                len = children.length;
                for(n = 0; n < len; n++) {
                    child = children[n];
                    index++;

                    if(child.nodeType !== SHAPE) {
                        nodes = nodes.concat(child.getChildren());
                    }

                    if(child._id === that._id) {
                        n = len;
                    }
                }

                if(nodes.length > 0 && nodes[0].getLevel() <= level) {
                    addChildren(nodes);
                }
            }
            if(that.nodeType !== STAGE) {
                addChildren(that.getStage().getChildren());
            }

            return index;
        },
        /**
         * get node level in node tree.  Returns an integer.<br><br>
         *  e.g. Stage level will always be 0.  Layers will always be 1.  Groups and Shapes will always
         *  be >= 2
         * @name getLevel
         * @methodOf Kinetic.Node.prototype
         */
        getLevel: function() {
            var level = 0,
                parent = this.parent;
                
            while(parent) {
                level++;
                parent = parent.parent;
            }
            return level;
        },
        /**
         * set node position relative to parent
         * @name setPosition
         * @methodOf Kinetic.Node.prototype
         * @param {Number} x
         * @param {Number} y
         */
        setPosition: function() {
            var pos = Kinetic.Type._getXY([].slice.call(arguments));
            this.setAttr(X, pos.x);
            this.setAttr(Y, pos.y);
        },
        /**
         * get node position relative to parent
         * @name getPosition
         * @methodOf Kinetic.Node.prototype
         */
        getPosition: function() {
            return {
                x: this.getX(),
                y: this.getY()
            };
        },
        /**
         * get absolute position relative to the top left corner of the stage container div
         * @name getAbsolutePosition
         * @methodOf Kinetic.Node.prototype
         */
        getAbsolutePosition: function() {
            var trans = this.getAbsoluteTransform(),
                o = this.getOffset();
                
            trans.translate(o.x, o.y);
            return trans.getTranslation();
        },
        /**
         * set absolute position
         * @name setAbsolutePosition
         * @methodOf Kinetic.Node.prototype
         * @param {Number} x
         * @param {Number} y
         */
        setAbsolutePosition: function() {
            var pos = Kinetic.Type._getXY([].slice.call(arguments)),
                trans = this._clearTransform(),
                it;
                
            // don't clear translation
            this.attrs.x = trans.x;
            this.attrs.y = trans.y;
            delete trans.x;
            delete trans.y;

            // unravel transform
            it = this.getAbsoluteTransform();

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
         * move node by an amount relative to its current position
         * @name move
         * @methodOf Kinetic.Node.prototype
         * @param {Number} x
         * @param {Number} y
         */
        move: function() {
            var pos = Kinetic.Type._getXY([].slice.call(arguments)),
                x = this.getX(),
                y = this.getY();

            if(pos.x !== undefined) {
                x += pos.x;
            }

            if(pos.y !== undefined) {
                y += pos.y;
            }

            this.setPosition(x, y);
        },
        _eachAncestorReverse: function(func, includeSelf) {
            var family = [], 
                parent = this.getParent(),
                len, n;

            // build family by traversing ancestors
            if(includeSelf) {
                family.unshift(this);
            }
            while(parent) {
                family.unshift(parent);
                parent = parent.parent;
            }

            len = family.length;
            for(n = 0; n < len; n++) {
                func(family[n]);
            }
        },
        /**
         * rotate node by an amount in radians relative to its current rotation
         * @name rotate
         * @methodOf Kinetic.Node.prototype
         * @param {Number} theta
         */
        rotate: function(theta) {
            this.setRotation(this.getRotation() + theta);
        },
        /**
         * rotate node by an amount in degrees relative to its current rotation
         * @name rotateDeg
         * @methodOf Kinetic.Node.prototype
         * @param {Number} deg
         */
        rotateDeg: function(deg) {
            this.setRotation(this.getRotation() + Kinetic.Type._degToRad(deg));
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
            var index = this.index,
                len = this.parent.getChildren().length;
            if(index < len - 1) {
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
         * set zIndex relative to siblings
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
         * move node to another container
         * @name moveTo
         * @methodOf Kinetic.Node.prototype
         * @param {Container} newContainer
         */
        moveTo: function(newContainer) {
            Kinetic.Node.prototype.remove.call(this);
            newContainer.add(this);
        },
        /**
         * convert Node into an object for serialization.  Returns an object.
         * @name toObject
         * @methodOf Kinetic.Node.prototype
         */
        toObject: function() {
            var type = Kinetic.Type, 
                obj = {}, 
                attrs = this.getAttrs(),
                key, val;

            obj.attrs = {};

            // serialize only attributes that are not function, image, DOM, or objects with methods
            for(key in attrs) {
                val = attrs[key];
                if(!type._isFunction(val) && !type._isElement(val) && !(type._isObject(val) && type._hasMethods(val))) {
                    obj.attrs[key] = val;
                }
            }

            obj.nodeType = this.nodeType;
            obj.shapeType = this.shapeType;

            return obj;
        },
        /**
         * convert Node into a JSON string.  Returns a JSON string.
         * @name toJSON
         * @methodOf Kinetic.Node.prototype
         */
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
         * get layer ancestor
         * @name getLayer
         * @methodOf Kinetic.Node.prototype
         */
        getLayer: function() {
            return this.getParent().getLayer();
        },
        /**
         * get stage ancestor
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
         * fire event
         * @name fire
         * @methodOf Kinetic.Node.prototype
         * @param {String} eventType event type.  can be a regular event, like click, mouseover, or mouseout, or it can be a custom event, like myCustomEvent
         * @param {EventObject} evt event object
         * @param {Boolean} preventBubble setting the value to false, or leaving it undefined, will result in the event bubbling.  Setting the value to true will result in the event not bubbling.
         */
        fire: function(eventType, evt, preventBubble) {
            // no bubble
            if (preventBubble) {
                this._executeHandlers(eventType, evt || {});
            }
            // bubble
            else {
                this._handleEvent(eventType, evt || {});
            }
        },
        /**
         * get absolute transform of the node which takes into
         *  account its ancestor transforms
         * @name getAbsoluteTransform
         * @methodOf Kinetic.Node.prototype
         */
        getAbsoluteTransform: function() {
            // absolute transform
            var am = new Kinetic.Transform(),
                m;

            this._eachAncestorReverse(function(node) {
                m = node.getTransform();
                am.multiply(m);
            }, true);
            return am;
        },
        _getAndCacheTransform: function() {
            var m = new Kinetic.Transform(), 
                x = this.getX(), 
                y = this.getY(), 
                rotation = this.getRotation(),
                scaleX = this.getScaleX(), 
                scaleY = this.getScaleY(), 
                skewX = this.getSkewX(), 
                skewY = this.getSkewY(), 
                offsetX = this.getOffsetX(), 
                offsetY = this.getOffsetY();
                
            if(x !== 0 || y !== 0) {
                m.translate(x, y);
            }
            if(rotation !== 0) {
                m.rotate(rotation);
            }
            if(skewX !== 0 || skewY !== 0) {
                m.skew(skewX, skewY);
            }
            if(scaleX !== 1 || scaleY !== 1) {
                m.scale(scaleX, scaleY);
            }
            if(offsetX !== 0 || offsetY !== 0) {
                m.translate(-1 * offsetX, -1 * offsetY);
            }
             
            // cache result
            this.cachedTransform = m;
            return m;
        },
        /**
         * get transform of the node
         * @name getTransform
         * @methodOf Kinetic.Node.prototype
         */
        getTransform: function(useCache) {
            var cachedTransform = this.cachedTransform;
            if (useCache && cachedTransform) {
                return cachedTransform;
            }
            else {
                return this._getAndCacheTransform();
            }
        },
        /**
         * clone node.  Returns a new Node instance with identical attributes
         * @name clone
         * @methodOf Kinetic.Node.prototype
         * @param {Object} attrs override attrs
         */
        clone: function(obj) {
            // instantiate new node
            var classType = this.shapeType || this.nodeType,
                node = new Kinetic[classType](this.attrs),
                key, allListeners, len, n, listener;

            // copy over listeners
            for(key in this.eventListeners) {
                allListeners = this.eventListeners[key];
                len = allListeners.length;
                for(n = 0; n < len; n++) {
                    listener = allListeners[n];
                    /*
                     * don't include kinetic namespaced listeners because
                     *  these are generated by the constructors
                     */
                    if(listener.name.indexOf(KINETIC) < 0) {
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
         * @param {Function} config.callback function executed when the composite has completed
         * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
         *  "image/png" is the default
         * @param {Number} [config.x] x position of canvas section
         * @param {Number} [config.y] y position of canvas section
         * @param {Number} [config.width] width of canvas section
         * @param {Number} [config.height] height of canvas section
         * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
         *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
         *  is very high quality
         */
        toDataURL: function(config) {
            var config = config || {},
                mimeType = config.mimeType || null, 
                quality = config.quality || null,
                stage = this.getStage(),
                x = config.x || 0, 
                y = config.y || 0,
                canvas = new Kinetic.SceneCanvas({
                    width: config.width || stage.getWidth(), 
                    height: config.height || stage.getHeight(),
                    pixelRatio: 1
                }),
                context = canvas.getContext();
            
            context.save();

            if(x || y) {
                context.translate(-1 * x, -1 * y);
            }

            this.drawScene(canvas);
            context.restore();

            return canvas.toDataURL(mimeType, quality);
        },
        /**
         * converts node into an image.  Since the toImage
         *  method is asynchronous, a callback is required.  toImage is most commonly used
         *  to cache complex drawings as an image so that they don't have to constantly be redrawn
         * @name toImage
         * @methodOf Kinetic.Node.prototype
         * @param {Object} config
         * @param {Function} config.callback function executed when the composite has completed
         * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
         *  "image/png" is the default
         * @param {Number} [config.x] x position of canvas section
         * @param {Number} [config.y] y position of canvas section
         * @param {Number} [config.width] width of canvas section
         * @param {Number} [config.height] height of canvas section
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
            var evtListeners = this.eventListeners[type],
                i;
                
            for(i = 0; i < evtListeners.length; i++) {
                if(evtListeners[i].name === name) {
                    evtListeners.splice(i, 1);
                    if(evtListeners.length === 0) {
                        delete this.eventListeners[type];
                        break;
                    }
                    i--;
                }
            }
        },
        _clearTransform: function() {

            var trans = {
                x: this.getX(),
                y: this.getY(),
                rotation: this.getRotation(),
                scaleX: this.getScaleX(),
                scaleY: this.getScaleY(),
                offsetX: this.getOffsetX(),
                offsetY: this.getOffsetY(),
                skewX: this.getSkewX(),
                skewY: this.getSkewY()
            };

            this.attrs.x = 0;
            this.attrs.y = 0;
            this.attrs.rotation = 0;
            this.attrs.scaleX = 1;
            this.attrs.scaleY = 1;
            this.attrs.offsetX = 0;
            this.attrs.offsetY = 0;
            this.attrs.skewX = 0;
            this.attrs.skewY = 0;

            return trans;
        },
        _setTransform: function(trans) {
            var key;
            
            for(key in trans) {
                this.attrs[key] = trans[key];
            }

            this.cachedTransform = null;
        },
        _fireBeforeChangeEvent: function(attr, oldVal, newVal) {
            this._handleEvent(BEFORE + Kinetic.Type._capitalize(attr) + CHANGE, {
                oldVal: oldVal,
                newVal: newVal
            });
        },
        _fireChangeEvent: function(attr, oldVal, newVal) {
            this._handleEvent(attr + CHANGE, {
                oldVal: oldVal,
                newVal: newVal
            });
        },
        /**
         * set id
         * @name setId
         * @methodOf Kinetic.Node.prototype
         * @param {String} id
         */
        setId: function(id) {
            var oldId = this.getId(), 
                stage = this.getStage(), 
                go = Kinetic.Global;
                
            go._removeId(oldId);
            go._addId(this, id);
            this.setAttr(ID, id);
        },
        /**
         * set name
         * @name setName
         * @methodOf Kinetic.Node.prototype
         * @param {String} name
         */
        setName: function(name) {
            var oldName = this.getName(), 
                stage = this.getStage(), 
                go = Kinetic.Global;
                
            go._removeName(oldName, this._id);
            go._addName(this, name);
            this.setAttr(NAME, name);
        },
        /**
         * get node type.  Returns 'Stage', 'Layer', 'Group', or 'Shape'
         * @name getNodeType
         * @methodOf Kinetic.Node.prototype
         */
        getNodeType: function() {
            return this.nodeType;
        },
        setAttr: function(key, val) {
            var oldVal;
            if(val !== undefined) {
                oldVal = this.attrs[key];
                this._fireBeforeChangeEvent(key, oldVal, val);
                this.attrs[key] = val;
                this._fireChangeEvent(key, oldVal, val);
            }
        },
        _handleEvent: function(eventType, evt, compareShape) {
            if(evt && this.nodeType === SHAPE) {
                evt.targetNode = this;
            }
            var stage = this.getStage();
            var el = this.eventListeners;
            var okayToRun = true;

            if(eventType === MOUSEENTER && compareShape && this._id === compareShape._id) {
                okayToRun = false;
            }
            else if(eventType === MOUSELEAVE && compareShape && this._id === compareShape._id) {
                okayToRun = false;
            }

            if(okayToRun) {                
                this._executeHandlers(eventType, evt);

                // simulate event bubbling
                if(evt && !evt.cancelBubble && this.parent) {
                    if(compareShape && compareShape.parent) {
                        this._handleEvent.call(this.parent, eventType, evt, compareShape.parent);
                    }
                    else {
                        this._handleEvent.call(this.parent, eventType, evt);
                    }
                }
            }
        },
        _executeHandlers: function(eventType, evt) {
            var events = this.eventListeners[eventType],
                len, i;
                
            if (events) {
                len = events.length;
                for(i = 0; i < len; i++) {
                    events[i].handler.apply(this, [evt]);
                }
            }
        },
        /*
         * draw both scene and hit graphs.  If the node being drawn is the stage, all of the layers will be cleared and redra
         * @name draw
         * @methodOf Kinetic.Node.prototype
         *  the scene renderer
         */
        draw: function() {
            var evt = {
                    node: this
                };
            
            this.fire(BEFORE_DRAW, evt);
            this.drawScene();
            this.drawHit();
            this.fire(DRAW, evt);
        },
        shouldDrawHit: function() { 
            return this.isVisible() && this.isListening() && !Kinetic.Global.isDragging(); 
        }
    };

    // add getter and setter methods
    Kinetic.Node.addGetterSetter = function(constructor, attr, def, isTransform) {
        this.addGetter(constructor, attr, def);
        this.addSetter(constructor, attr, isTransform);
    };
    Kinetic.Node.addPointGetterSetter = function(constructor, attr, def, isTransform) {
        this.addPointGetter(constructor, attr);
        this.addPointSetter(constructor, attr);  

        // add invdividual component getters and setters
        this.addGetter(constructor, attr + UPPER_X, def);
        this.addGetter(constructor, attr + UPPER_Y, def);
        this.addSetter(constructor, attr + UPPER_X, isTransform);
        this.addSetter(constructor, attr + UPPER_Y, isTransform);
    };
    Kinetic.Node.addRotationGetterSetter = function(constructor, attr, def, isTransform) {
        this.addRotationGetter(constructor, attr, def);
        this.addRotationSetter(constructor, attr, isTransform);    
    };
    Kinetic.Node.addColorGetterSetter = function(constructor, attr) {
        this.addGetter(constructor, attr);
        this.addSetter(constructor, attr); 
  
        // component getters 
        this.addColorRGBGetter(constructor, attr);
        this.addColorComponentGetter(constructor, attr, R);
        this.addColorComponentGetter(constructor, attr, G);
        this.addColorComponentGetter(constructor, attr, B);

        // component setters
        this.addColorRGBSetter(constructor, attr);
        this.addColorComponentSetter(constructor, attr, R);
        this.addColorComponentSetter(constructor, attr, G);
        this.addColorComponentSetter(constructor, attr, B);
    };
    Kinetic.Node.addColorRGBGetter = function(constructor, attr) {
        var method = GET + Kinetic.Type._capitalize(attr) + RGB;
        constructor.prototype[method] = function() {
            return Kinetic.Type.getRGB(this.attrs[attr]);
        };
    };
    Kinetic.Node.addColorRGBSetter = function(constructor, attr) {
        var method = SET + Kinetic.Type._capitalize(attr) + RGB;

        constructor.prototype[method] = function(obj) {
            var r = obj && obj.r !== undefined ? obj.r | 0 : this.getAttr(attr + UPPER_R),
                g = obj && obj.g !== undefined ? obj.g | 0 : this.getAttr(attr + UPPER_G),
                b = obj && obj.b !== undefined ? obj.b | 0 : this.getAttr(attr + UPPER_B);

            this.setAttr(attr, HASH + Kinetic.Type._rgbToHex(r, g, b));
        };
    };
    Kinetic.Node.addColorComponentGetter = function(constructor, attr, c) {
        var prefix = GET + Kinetic.Type._capitalize(attr),
            method = prefix + Kinetic.Type._capitalize(c);
        constructor.prototype[method] = function() {
            return this[prefix + RGB]()[c];
        };
    };
    Kinetic.Node.addColorComponentSetter = function(constructor, attr, c) {
        var prefix = SET + Kinetic.Type._capitalize(attr),
            method = prefix + Kinetic.Type._capitalize(c);
        constructor.prototype[method] = function(val) {
            var obj = {};
            obj[c] = val;
            this[prefix + RGB](obj);
        };
    };
    Kinetic.Node.addSetter = function(constructor, attr, isTransform) {
        var that = this,
            method = SET + Kinetic.Type._capitalize(attr);
            
        constructor.prototype[method] = function(val) {
            this.setAttr(attr, val);
            if (isTransform) {
                this.cachedTransform = null;
            }
        };
    };
    Kinetic.Node.addPointSetter = function(constructor, attr) {
        var that = this,
            baseMethod = SET + Kinetic.Type._capitalize(attr);
            
        constructor.prototype[baseMethod] = function() {
            var pos = Kinetic.Type._getXY([].slice.call(arguments)),
                oldVal = this.attrs[attr]; 
                x = 0,
                y = 0;

            if (pos) {
              x = pos.x;
              y = pos.y;

              this._fireBeforeChangeEvent(attr, oldVal, pos);
              if (x !== undefined) {
                this[baseMethod + UPPER_X](x);
              }
              if (y !== undefined) {
                this[baseMethod + UPPER_Y](y);
              }
              this._fireChangeEvent(attr, oldVal, pos);
            }    
        };
    };
    Kinetic.Node.addRotationSetter = function(constructor, attr, isTransform) {
        var that = this,
            method = SET + Kinetic.Type._capitalize(attr);
            
        // radians
        constructor.prototype[method] = function(val) {
            this.setAttr(attr, val);
            if (isTransform) {
                this.cachedTransform = null;
            }
        };
        // degrees
        constructor.prototype[method + DEG] = function(deg) {
            this.setAttr(attr, Kinetic.Type._degToRad(deg));
            if (isTransform) {
                this.cachedTransform = null;
            }
        };
    };
    Kinetic.Node.addGetter = function(constructor, attr, def) {
        var that = this,
            method = GET + Kinetic.Type._capitalize(attr);
           
        constructor.prototype[method] = function(arg) {
            var val = this.attrs[attr];
            if (val === undefined) {
                val = def; 
            }

            return val;    
        };
    };
    Kinetic.Node.addPointGetter = function(constructor, attr) {
        var that = this,
            baseMethod = GET + Kinetic.Type._capitalize(attr);
            
        constructor.prototype[baseMethod] = function(arg) {
            var that = this;
            return {
                x: that[baseMethod + UPPER_X](),
                y: that[baseMethod + UPPER_Y]()
            };  
        };
    };
    Kinetic.Node.addRotationGetter = function(constructor, attr, def) {
        var that = this,
            method = GET + Kinetic.Type._capitalize(attr);
            
        // radians
        constructor.prototype[method] = function() {
            var val = this.attrs[attr];
            if (val === undefined) {
                val = def; 
            }
            return val;
        };
        // degrees
        constructor.prototype[method + DEG] = function() {
            var val = this.attrs[attr];
            if (val === undefined) {
                val = def; 
            }
            return Kinetic.Type._radToDeg(val);
        };
    };
    /**
     * create node with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     * 	serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage() methods
     * @name create
     * @methodOf Kinetic.Node
     * @param {String} JSON string
     * @param {DomElement} [container] optional container dom element used only if you're
     *  creating a stage node
     */
    Kinetic.Node.create = function(json, container) {
        return this._createNode(JSON.parse(json), container);
    };
    Kinetic.Node._createNode = function(obj, container) {
        var type, no, len, n;

        // determine type
        if(obj.nodeType === SHAPE) {
            // add custom shape
            if(obj.shapeType === undefined) {
                type = SHAPE;
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

        no = new Kinetic[type](obj.attrs);
        if(obj.children) {
            len = obj.children.length;
            for(n = 0; n < len; n++) {
                no.add(this._createNode(obj.children[n]));
            }
        }

        return no;
    };
    // add getters setters
    Kinetic.Node.addGetterSetter(Kinetic.Node, 'x', 0, true);

    /**
     * set x position
     * @name setX
     * @methodOf Kinetic.Node.prototype
     * @param {Number} x
     */

    /**
     * get x position
     * @name getX
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Node, 'y', 0, true);

    /**
     * set y position
     * @name setY
     * @methodOf Kinetic.Node.prototype
     * @param {Number} y
     */

    /**
     * get y position
     * @name getY
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Node, 'opacity', 1);

    /**
     * set opacity.  Opacity values range from 0 to 1.
     *  A node with an opacity of 0 is fully transparent, and a node
     *  with an opacity of 1 is fully opaque
     * @name setOpacity
     * @methodOf Kinetic.Node.prototype
     * @param {Object} opacity
     */

    /**
     * get opacity.
     * @name getOpacity
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addGetter(Kinetic.Node, 'name');

     /**
     * get name
     * @name getName
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addGetter(Kinetic.Node, 'id');

    /**
     * get id
     * @name getId
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addRotationGetterSetter(Kinetic.Node, 'rotation', 0, true);

    /**
     * set rotation in radians
     * @name setRotation
     * @methodOf Kinetic.Node.prototype
     * @param {Number} theta
     */

    /**
     * set rotation in degrees
     * @name setRotationDeg
     * @methodOf Kinetic.Node.prototype
     * @param {Number} deg
     */

    /**
     * get rotation in degrees
     * @name getRotationDeg
     * @methodOf Kinetic.Node.prototype
     */

    /**
     * get rotation in radians
     * @name getRotation
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Node, 'scale', 1, true);

    /**
     * set scale
     * @name setScale
     * @param {Number} x
     * @param {Number} y
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * set scale x
     * @name setScaleX
     * @param {Number} x
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * set scale y
     * @name setScaleY
     * @param {Number} y
     * @methodOf Kinetic.Node.prototype
     */

    /**
     * get scale
     * @name getScale
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * get scale x
     * @name getScaleX
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * get scale y
     * @name getScaleY
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Node, 'skew', 0, true);

    /**
     * set skew
     * @name setSkew
     * @param {Number} x
     * @param {Number} y
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * set skew x
     * @name setSkewX
     * @param {Number} x
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * set skew y
     * @name setSkewY
     * @param {Number} y
     * @methodOf Kinetic.Node.prototype
     */

    /**
     * get skew 
     * @name getSkew
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * get skew x
     * @name getSkewX
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * get skew y
     * @name getSkewY
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addPointGetterSetter(Kinetic.Node, 'offset', 0, true);

    /**
     * set offset.  A node's offset defines the position and rotation point
     * @name setOffset
     * @methodOf Kinetic.Node.prototype
     * @param {Number} x
     * @param {Number} y
     */

     /**
     * set offset x
     * @name setOffsetX
     * @methodOf Kinetic.Node.prototype
     * @param {Number} x
     */

     /**
     * set offset y
     * @name setOffsetY
     * @methodOf Kinetic.Node.prototype
     * @param {Number} y
     */

    /**
     * get offset
     * @name getOffset
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * get offset x
     * @name getOffsetX
     * @methodOf Kinetic.Node.prototype
     */

     /**
     * get offset y
     * @name getOffsetY
     * @methodOf Kinetic.Node.prototype
     */

    Kinetic.Node.addSetter(Kinetic.Node, 'width');

    /**
     * set width
     * @name setWidth
     * @methodOf Kinetic.Node.prototype
     * @param {Number} width
     */

    Kinetic.Node.addSetter(Kinetic.Node, 'height');

    /**
     * set height
     * @name setHeight
     * @methodOf Kinetic.Node.prototype
     * @param {Number} height
     */

    Kinetic.Node.addSetter(Kinetic.Node, 'listening');

    /**
     * listen or don't listen to events
     * @name setListening
     * @methodOf Kinetic.Node.prototype
     * @param {Boolean} listening
     */

    Kinetic.Node.addSetter(Kinetic.Node, 'visible');

    /**
     * set visible
     * @name setVisible
     * @methodOf Kinetic.Node.prototype
     * @param {Boolean} visible
     */

    // aliases
    /**
     * Alias of getListening()
     * @name isListening
     * @methodOf Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.isListening = Kinetic.Node.prototype.getListening;
    /**
     * Alias of getVisible()
     * @name isVisible
     * @methodOf Kinetic.Node.prototype
     */
    Kinetic.Node.prototype.isVisible = Kinetic.Node.prototype.getVisible;
    
    Kinetic.Collection.mapMethods(['on', 'off']);
})();
