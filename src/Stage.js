///////////////////////////////////////////////////////////////////////
//  Stage
///////////////////////////////////////////////////////////////////////
/**
 * Stage constructor.  A stage is used to contain multiple layers and handle
 * animations
 * @constructor
 * @param {String|DomElement} cont Container id or DOM element
 * @param {int} width
 * @param {int} height
 */
Kinetic.Stage = function(cont, width, height) {
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
     * @param {function} func
     */
    onFrame: function(func) {
        this.onFrameFunc = func;
    },
    /**
     * start animation
     */
    start: function() {
        this.isAnimating = true;
        Kinetic.GlobalObject._handleAnimation();
    },
    /**
     * stop animation
     */
    stop: function() {
        this.isAnimating = false;
        Kinetic.GlobalObject._handleAnimation();
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
        var layers = this.children;
        for(var n = 0; n < layers.length; n++) {
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
     * set stage scale.  If only one parameter is passed in, then
     * both scaleX and scaleY are set to the parameter
     * @param {int} scaleX
     * @param {int} scaleY
     */
    setScale: function(scaleX, scaleY) {
        var oldScaleX = this.scale.x;
        var oldScaleY = this.scale.y;

        if(scaleY) {
            this.scale.x = scaleX;
            this.scale.y = scaleY;
        } else {
            this.scale.x = scaleX;
            this.scale.y = scaleX;
        }

        /*
         * scale all shape positions
         */
        var layers = this.children;
        var that = this;
        function scaleChildren(children) {
            for(var i = 0; i < children.length; i++) {
                var child = children[i];
                child.x *= that.scale.x / oldScaleX;
                child.y *= that.scale.y / oldScaleY;
                if(child.children) {
                    scaleChildren(child.children);
                }
            }
        }

        scaleChildren(layers);
    },
    /**
     * get scale
     */
    getScale: function() {
        return this.scale;
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
     * creates a composite data URL and passes it to a callback
     * @param {function} callback
     */
    toDataURL: function(callback) {
        var bufferLayer = this.bufferLayer;
        var bufferContext = bufferLayer.getContext();
        var layers = this.children;

        function addLayer(n) {
            var dataURL = layers[n].getCanvas().toDataURL();
            var imageObj = new Image();
            imageObj.onload = function() {
                bufferContext.drawImage(this, 0, 0);
                n++;
                if(n < layers.length) {
                    addLayer(n);
                } else {
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
    remove: function(layer) {
        // remove layer canvas from dom
        this.container.removeChild(layer.canvas);

        this._remove(layer);
    },
    /**
     * bind event listener to stage (which is essentially
     * the container DOM)
     * @param {String} typesStr
     * @param {function} handler
     */
    on: function(typesStr, handler) {
        var types = typesStr.split(" ");
        for(var n = 0; n < types.length; n++) {
            var baseEvent = types[n];
            this.container.addEventListener(baseEvent, handler, false);
        }
    },
    /**
     * add layer to stage
     * @param {Layer} layer
     */
    add: function(layer) {
        if(layer.name) {
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
     * get stage
     */
    getStage: function() {
        return this;
    },
    /**
     * handle incoming event
     * @param {Event} evt
     */
    _handleEvent: function(evt) {
        var go = Kinetic.GlobalObject;
        if(!evt) {
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

        function detectEvent(shape) {
            shape._draw(backstageLayer);
            var pos = that.getUserPosition();
            var el = shape.eventListeners;

            if(that.targetShape && shape.id === that.targetShape.id) {
                targetFound = true;
            }

            if(shape.visible && pos !== undefined && backstageLayerContext.isPointInPath(pos.x, pos.y)) {
                // handle onmousedown
                if(that.mouseDown) {
                    that.mouseDown = false;
                    that.clickStart = true;
                    shape._handleEvents("onmousedown", evt);
                    return true;
                }
                // handle onmouseup & onclick
                else if(that.mouseUp) {
                    that.mouseUp = false;
                    shape._handleEvents("onmouseup", evt);

                    // detect if click or double click occurred
                    if(that.clickStart) {
                        /*
                         * if dragging and dropping, don't fire click or dbl click
                         * event
                         */
                        if((!go.drag.moving) || !go.drag.node) {
                            shape._handleEvents("onclick", evt);

                            if(shape.inDoubleClickWindow) {
                                shape._handleEvents("ondblclick", evt);
                            }
                            shape.inDoubleClickWindow = true;
                            setTimeout(function() {
                                shape.inDoubleClickWindow = false;
                            }, that.dblClickWindow);
                        }
                    }
                    return true;
                }

                // handle touchstart
                else if(that.touchStart) {
                    that.touchStart = false;
                    shape._handleEvents("touchstart", evt);

                    if(el.ondbltap && shape.inDoubleClickWindow) {
                        var events = el.ondbltap;
                        for(var i = 0; i < events.length; i++) {
                            events[i].handler.apply(shape, [evt]);
                        }
                    }

                    shape.inDoubleClickWindow = true;

                    setTimeout(function() {
                        shape.inDoubleClickWindow = false;
                    }, that.dblClickWindow);
                    return true;
                }

                // handle touchend
                else if(that.touchEnd) {
                    that.touchEnd = false;
                    shape._handleEvents("touchend", evt);
                    return true;
                }

                // handle touchmove
                else if(el.touchmove) {
                    shape._handleEvents("touchmove", evt);
                    return true;
                }

                //this condition is used to identify a new target shape.
                else if(!that.targetShape || (!targetFound && shape.id !== that.targetShape.id)) {
                    /*
                     * check if old target has an onmouseout event listener
                     */
                    if(that.targetShape) {
                        var oldEl = that.targetShape.eventListeners;
                        if(oldEl) {
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
            else if(that.targetShape && that.targetShape.id === shape.id) {
                that.targetShape = undefined;
                shape._handleEvents("onmouseout", evt);
                return true;
            }

            return false;
        }

        function traverseChildren(obj) {
            var children = obj.children;
            // propapgate backwards through children
            for(var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                if(child.className === "Shape") {
                    var exit = detectEvent(child);
                    if(exit) {
                        return true;
                    }
                } else {
                    traverseChildren(child);
                }
            }

            return false;
        }

        if(go.drag.node === undefined) {
            for(var n = this.children.length - 1; n >= 0; n--) {
                var layer = this.children[n];
                if(layer.visible && n >= 0 && layer.isListening) {
                    if(traverseChildren(layer)) {
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
    _listen: function() {
        var that = this;

        // desktop events
        this.container.addEventListener("mousedown", function(evt) {
            that.mouseDown = true;
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener("mousemove", function(evt) {
            that.mouseUp = false;
            that.mouseDown = false;
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener("mouseup", function(evt) {
            that.mouseUp = true;
            that.mouseDown = false;
            that._handleEvent(evt);

            that.clickStart = false;
        }, false);

        this.container.addEventListener("mouseover", function(evt) {
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener("mouseout", function(evt) {
            that.mousePos = undefined;
        }, false);
        // mobile events
        this.container.addEventListener("touchstart", function(evt) {
            evt.preventDefault();
            that.touchStart = true;
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener("touchmove", function(evt) {
            evt.preventDefault();
            that._handleEvent(evt);
        }, false);

        this.container.addEventListener("touchend", function(evt) {
            evt.preventDefault();
            that.touchEnd = true;
            that._handleEvent(evt);
        }, false);
    },
    /**
     * set mouse positon for desktop apps
     * @param {Event} evt
     */
    _setMousePosition: function(evt) {
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
    _setTouchPosition: function(evt) {
        if(evt.touches !== undefined && evt.touches.length === 1) {// Only deal with
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
    _getContainerPosition: function() {
        var obj = this.container;
        var top = 0;
        var left = 0;
        while(obj && obj.tagName !== "BODY") {
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
     * disable layer rendering
     * @param {Layer} layer
     */
    _stripLayer: function(layer) {
        layer.context.stroke = function() {
        };
        layer.context.fill = function() {
        };
        layer.context.fillRect = function(x, y, width, height) {
            layer.context.rect(x, y, width, height);
        };
        layer.context.strokeRect = function(x, y, width, height) {
            layer.context.rect(x, y, width, height);
        };
        layer.context.drawImage = function() {
        };
        layer.context.fillText = function() {
        };
        layer.context.strokeText = function() {
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
                go.drag.node._handleEvents("ondragend", evt);
            }
        }
        go.drag.node = undefined;
    },
    /**
     * prepare drag and drop
     */
    _prepareDrag: function() {
        var that = this;

        this.on("mousemove touchmove", function(evt) {
            var go = Kinetic.GlobalObject;
            if(go.drag.node) {
                var pos = that.getUserPosition();
                if(go.drag.node.drag.x) {
                    go.drag.node.x = pos.x - go.drag.offset.x;
                }
                if(go.drag.node.drag.y) {
                    go.drag.node.y = pos.y - go.drag.offset.y;
                }
                go.drag.node.getLayer().draw();

                if(!go.drag.moving) {
                    go.drag.moving = true;
                    // execute dragstart events if defined
                    go.drag.node._handleEvents("ondragstart", evt);
                }
                // execute user defined ondragmove if defined
                go.drag.node._handleEvents("ondragmove", evt);
            }
        }, false);

        this.on("mouseup touchend mouseout", function(evt) {
            that._endDrag(evt);
        });
    }
};
// extend Container
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container);