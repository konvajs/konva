///////////////////////////////////////////////////////////////////////
//  Stage
///////////////////////////////////////////////////////////////////////
/**
 * Stage constructor.  A stage is used to contain multiple layers
 * @constructor
 * @augments Kinetic.Container
 * @param {Object} config
 * @param {String|DomElement} config.container Container id or DOM element
 * @param {Number} config.width
 * @param {Number} config.height
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
 * @param {String} [config.dragConstraint] can be vertical, horizontal, or none.  The default
 *  is none
 * @param {Object} [config.dragBounds]
 * @param {Number} [config.dragBounds.top]
 * @param {Number} [config.dragBounds.right]
 * @param {Number} [config.dragBounds.bottom]
 * @param {Number} [config.dragBounds.left]
 */
Kinetic.Stage = function(config) {
    this._initStage(config);
};

Kinetic.Stage.prototype = {
    _initStage: function(config) {
        this.setDefaultAttrs({
            width: 400,
            height: 200
        });

        // call super constructor
        Kinetic.Container.call(this, config);

        this._setStageDefaultProperties();
        this._id = Kinetic.Global.idCounter++;
        this._buildDOM();
        this._bindContentEvents();

        var go = Kinetic.Global;
        go.stages.push(this);
        this._addId(this);
        this._addName(this);

    },
    setContainer: function(container) {
        /*
         * if container is a string, assume it's an id for
         * a DOM element
         */
        if( typeof container === 'string') {
            container = document.getElementById(container);
        }
        this.setAttr('container', container);
    },
    /**
     * draw children
     * @name draw
     * @methodOf Kinetic.Stage.prototype
     */
    draw: function() {
        this._draw();
    },
    /**
     * set stage size
     * @name setSize
     * @methodOf Kinetic.Stage.prototype
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
     * set height
     * @name setHeight
     * @methodOf Kinetic.Stage.prototype
     * @param {Number} height
     */
    setHeight: function(height) {
        this.setAttr('height', height);
        this._resizeDOM();
    },
    /**
     * set width
     * @name setWidth
     * @methodOf Kinetic.Stage.prototype
     * @param {Number} width
     */
    setWidth: function(width) {
        this.setAttr('width', width);
        this._resizeDOM();
    },
    /**
     * get stage size
     * @name getSize
     * @methodOf Kinetic.Stage.prototype
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    },
    /**
     * clear all layers
     * @name clear
     * @methodOf Kinetic.Stage.prototype
     */
    clear: function() {
        var layers = this.children;
        for(var n = 0; n < layers.length; n++) {
            layers[n].clear();
        }
    },
    /**
     * serialize stage and children as a JSON object and return
     *  the result as a json string
     * @name toJSON
     * @methodOf Kinetic.Stage.prototype
     */
    toJSON: function() {
        var type = Kinetic.Type;

        function addNode(node) {
            var obj = {};

            obj.attrs = {};

            // serialize only attributes that are not function, image, DOM, or objects with methods
            for(var key in node.attrs) {
                var val = node.attrs[key];
                if(!type._isFunction(val) && !type._isElement(val) && !(type._isObject(val) && type._hasMethods(val))) {
                    obj.attrs[key] = val;
                }
            }

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
     * @name reset
     * @methodOf Kinetic.Stage.prototype
     */
    reset: function() {
        // remove children
        this.removeChildren();

        // defaults
        this._setStageDefaultProperties();
        this.setAttrs(this.defaultNodeAttrs);
    },
    /**
     * load stage with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     * 	serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage()
     * @name load
     * @methodOf Kinetic.Stage.prototype
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
     * get mouse position for desktop apps
     * @name getMousePosition
     * @methodOf Kinetic.Stage.prototype
     * @param {Event} evt
     */
    getMousePosition: function(evt) {
        return this.mousePos;
    },
    /**
     * get touch position for mobile apps
     * @name getTouchPosition
     * @methodOf Kinetic.Stage.prototype
     * @param {Event} evt
     */
    getTouchPosition: function(evt) {
        return this.touchPos;
    },
    /**
     * get user position (mouse position or touch position)
     * @name getUserPosition
     * @methodOf Kinetic.Stage.prototype
     * @param {Event} evt
     */
    getUserPosition: function(evt) {
        return this.getTouchPosition() || this.getMousePosition();
    },
    /**
     * get stage
     * @name getStage
     * @methodOf Kinetic.Stage.prototype
     */
    getStage: function() {
        return this;
    },
    /**
     * get stage DOM node, which is a div element
     *  with the class name "kineticjs-content"
     * @name getDOM
     * @methodOf Kinetic.Stage.prototype
     */
    getDOM: function() {
        return this.content;
    },
    /**
     * Creates a composite data URL and requires a callback because the stage
     *  toDataURL method is asynchronous. If MIME type is not
     *  specified, then "image/png" will result. For "image/jpeg", specify a quality
     *  level as quality (range 0.0 - 1.0).  Note that this method works
     *  differently from toDataURL() for other nodes because it generates an absolute dataURL
     *  based on what's draw onto the canvases for each layer, rather than drawing
     *  the current state of each node
     * @name toDataURL
     * @methodOf Kinetic.Stage.prototype
     * @param {Object} config
     * @param {Function} config.callback since the stage toDataURL() method is asynchronous,
     *  the data url string will be passed into the callback
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
        /*
         * need to create a canvas element rather than using the buffer canvas
         * because this method is asynchonous which means that other parts of the
         * code could modify the buffer canvas before it's finished
         */
        var width = config && config.width ? config.width : this.attrs.width;
        var height = config && config.height ? config.height : this.attrs.height;
        var canvas = new Kinetic.Canvas(width, height);
        var context = canvas.getContext();
        var layers = this.children;

        function drawLayer(n) {
            var layer = layers[n];
            var layerUrl = layer.getCanvas().toDataURL();
            var imageObj = new Image();
            imageObj.onload = function() {
                context.drawImage(imageObj, 0, 0);

                if(n < layers.length - 1) {
                    drawLayer(n + 1);
                }
                else {
                    config.callback(canvas.toDataURL(mimeType, quality));
                }
            };
            imageObj.src = layerUrl;
        }

        drawLayer(0);
    },
    /**
     * converts stage into an image.  Since the stage toImage() method
     *  is asynchronous, a callback function is required
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
        this.toDataURL({
            callback: function(dataUrl) {
                Kinetic.Type._getImage(dataUrl, function(img) {
                    config.callback(img);
                });
            }
        });
    },
    /**
     * get intersection object that contains shape and pixel data
     * @name getIntersection
     * @methodOf Kinetic.Stage.prototype
     * @param {Object} pos point object
     */
    getIntersection: function(pos) {
        var shape;
        var layers = this.getChildren();

        /*
         * traverse through layers from top to bottom and look
         * for hit detection
         */
        for(var n = layers.length - 1; n >= 0; n--) {
            var layer = layers[n];
            var p = layer.bufferCanvas.context.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
            // this indicates that a buffer pixel may have been found
            if(p[3] === 255) {
                var colorKey = Kinetic.Type._rgbToHex(p[0], p[1], p[2]);
                shape = Kinetic.Global.shapes[colorKey];
                return {
                    shape: shape,
                    pixel: p
                };
            }
            // if no shape mapped to that pixel, return pixel array
            else if(p[0] > 0 || p[1] > 0 || p[2] > 0 || p[3] > 0) {
                return {
                    pixel: p
                };
            }
        }

        return null;
    },
    _resizeDOM: function() {
        if(this.content) {
            var width = this.attrs.width;
            var height = this.attrs.height;

            // set content dimensions
            this.content.style.width = width + 'px';
            this.content.style.height = height + 'px';

            this.bufferCanvas.setSize(width, height);
            // set user defined layer dimensions
            var layers = this.children;
            for(var n = 0; n < layers.length; n++) {
                var layer = layers[n];
                layer.getCanvas().setSize(width, height);
                layer.bufferCanvas.setSize(width, height);
                layer.draw();
            }
        }
    },
    /**
     * add layer to stage
     * @param {Layer} layer
     */
    _add: function(layer) {
        layer.canvas.setSize(this.attrs.width, this.attrs.height);
        layer.bufferCanvas.setSize(this.attrs.width, this.attrs.height);

        // draw layer and append canvas to container
        layer.draw();
        this.content.appendChild(layer.canvas.element);
    },
    _setUserPosition: function(evt) {
        if(!evt) {
            evt = window.event;
        }
        this._setMousePosition(evt);
        this._setTouchPosition(evt);
    },
    /**
     * begin listening for events by adding event handlers
     * to the container
     */
    _bindContentEvents: function() {
        var go = Kinetic.Global;
        var that = this;
        var events = ['mousedown', 'mousemove', 'mouseup', 'mouseout', 'touchstart', 'touchmove', 'touchend'];

        for(var n = 0; n < events.length; n++) {
            var pubEvent = events[n];
            // induce scope
            ( function() {
                var event = pubEvent;
                that.content.addEventListener(event, function(evt) {
                    that['_' + event](evt);
                }, false);
            }());
        }
    },
    _mouseout: function(evt) {
        this._setUserPosition(evt);
        var go = Kinetic.Global;
        // if there's a current target shape, run mouseout handlers
        var targetShape = this.targetShape;
        if(targetShape && !go.drag.moving) {
            targetShape._handleEvent('mouseout', evt);
            this.targetShape = null;
        }
        this.mousePos = undefined;

        // end drag and drop
        this._endDrag(evt);
    },
    _mousemove: function(evt) {
        this._setUserPosition(evt);
        var go = Kinetic.Global;
        var obj = this.getIntersection(this.getUserPosition());

        if(obj) {
            var shape = obj.shape;
            if(shape) {
                if(!go.drag.moving && obj.pixel[3] === 255 && (!this.targetShape || this.targetShape._id !== shape._id)) {
                    if(this.targetShape) {
                        this.targetShape._handleEvent('mouseout', evt, shape);
                    }
                    shape._handleEvent('mouseover', evt, this.targetShape);
                    this.targetShape = shape;
                }
                else {
                    shape._handleEvent('mousemove', evt);
                }
            }
        }
        /*
         * if no shape was detected, clear target shape and try
         * to run mouseout from previous target shape
         */
        else if(this.targetShape && !go.drag.moving) {
            this.targetShape._handleEvent('mouseout', evt);
            this.targetShape = null;
        }

        // start drag and drop
        this._startDrag(evt);
    },
    _mousedown: function(evt) {
        this._setUserPosition(evt);
        var obj = this.getIntersection(this.getUserPosition());
        if(obj && obj.shape) {
            var shape = obj.shape;
            this.clickStart = true;
            shape._handleEvent('mousedown', evt);
        }

        //init stage drag and drop
        if(this.attrs.draggable) {
            this._initDrag();
        }
    },
    _mouseup: function(evt) {
        this._setUserPosition(evt);
        var go = Kinetic.Global;
        var obj = this.getIntersection(this.getUserPosition());
        var that = this;
        if(obj && obj.shape) {
            var shape = obj.shape;
            shape._handleEvent('mouseup', evt);

            // detect if click or double click occurred
            if(this.clickStart) {
                /*
                 * if dragging and dropping, don't fire click or dbl click
                 * event
                 */
                if((!go.drag.moving) || !go.drag.node) {
                    shape._handleEvent('click', evt);

                    if(this.inDoubleClickWindow) {
                        shape._handleEvent('dblclick', evt);
                    }
                    this.inDoubleClickWindow = true;
                    setTimeout(function() {
                        that.inDoubleClickWindow = false;
                    }, this.dblClickWindow);
                }
            }
        }
        this.clickStart = false;

        // end drag and drop
        this._endDrag(evt);
    },
    _touchstart: function(evt) {
        this._setUserPosition(evt);
        evt.preventDefault();
        var obj = this.getIntersection(this.getUserPosition());

        if(obj && obj.shape) {
            var shape = obj.shape;
            this.tapStart = true;
            shape._handleEvent('touchstart', evt);
        }

        /*
         * init stage drag and drop
         */
        if(this.attrs.draggable) {
            this._initDrag();
        }
    },
    _touchend: function(evt) {
        this._setUserPosition(evt);
        var go = Kinetic.Global;
        var obj = this.getIntersection(this.getUserPosition());
        var that = this;
        if(obj && obj.shape) {
            var shape = obj.shape;
            shape._handleEvent('touchend', evt);

            // detect if tap or double tap occurred
            if(this.tapStart) {
                /*
                 * if dragging and dropping, don't fire tap or dbltap
                 * event
                 */
                if((!go.drag.moving) || !go.drag.node) {
                    shape._handleEvent('tap', evt);

                    if(this.inDoubleClickWindow) {
                        shape._handleEvent('dbltap', evt);
                    }
                    this.inDoubleClickWindow = true;
                    setTimeout(function() {
                        that.inDoubleClickWindow = false;
                    }, this.dblClickWindow);
                }
            }
        }

        this.tapStart = false;

        // end drag and drop
        this._endDrag(evt);
    },
    _touchmove: function(evt) {
        this._setUserPosition(evt);
        evt.preventDefault();
        var obj = this.getIntersection(this.getUserPosition());
        if(obj && obj.shape) {
            var shape = obj.shape;
            shape._handleEvent('touchmove', evt);
        }

        // start drag and drop
        this._startDrag(evt);
    },
    /**
     * set mouse positon for desktop apps
     * @param {Event} evt
     */
    _setMousePosition: function(evt) {
        var mouseX = evt.clientX - this._getContentPosition().left;
        var mouseY = evt.clientY - this._getContentPosition().top;
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
        if(evt.touches !== undefined && evt.touches.length === 1) {
            // one finger
            var touch = evt.touches[0];
            // Get the information for finger #1
            var touchX = touch.clientX - this._getContentPosition().left;
            var touchY = touch.clientY - this._getContentPosition().top;

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
        var rect = this.content.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left
        };
    },
    /**
     * end drag and drop
     */
    _endDrag: function(evt) {
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
        this.dragAnim.stop();
    },
    /**
     * start drag and drop
     */
    _startDrag: function(evt) {
        var that = this;
        var go = Kinetic.Global;
        var node = go.drag.node;

        if(node) {
            var pos = that.getUserPosition();
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
    },
    /**
     * build dom
     */
    _buildDOM: function() {
        // content
        this.content = document.createElement('div');
        this.content.style.position = 'relative';
        this.content.style.display = 'inline-block';
        this.content.className = 'kineticjs-content';
        this.attrs.container.appendChild(this.content);

        this.bufferCanvas = new Kinetic.Canvas({
            width: this.attrs.width,
            height: this.attrs.height
        });

        this._resizeDOM();
    },
    _addId: function(node) {
        if(node.attrs.id !== undefined) {
            this.ids[node.attrs.id] = node;
        }
    },
    _removeId: function(id) {
        if(id !== undefined) {
            delete this.ids[id];
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
    _removeName: function(name, _id) {
        if(name !== undefined) {
            var nodes = this.names[name];
            if(nodes !== undefined) {
                for(var n = 0; n < nodes.length; n++) {
                    var no = nodes[n];
                    if(no._id === _id) {
                        nodes.splice(n, 1);
                    }
                }
                if(nodes.length === 0) {
                    delete this.names[name];
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
    _setStageDefaultProperties: function() {
        this.nodeType = 'Stage';
        this.dblClickWindow = 400;
        this.targetShape = null;
        this.mousePos = undefined;
        this.clickStart = false;
        this.touchPos = undefined;
        this.tapStart = false;

        /*
         * ids and names hash needs to be stored at the stage level to prevent
         * id and name collisions between multiple stages in the document
         */
        this.ids = {};
        this.names = {};
        this.dragAnim = new Kinetic.Animation();
    }
};
Kinetic.Global.extend(Kinetic.Stage, Kinetic.Container);

// add getters and setters
Kinetic.Node.addGetters(Kinetic.Stage, ['width', 'height', 'container']);

/**
 * get container DOM element
 * @name getContainer
 * @methodOf Kinetic.Stage.prototype
 */

/**
 * get width
 * @name getWidth
 * @methodOf Kinetic.Stage.prototype
 */

/**
 * get height
 * @name getHeight
 * @methodOf Kinetic.Stage.prototype
 */