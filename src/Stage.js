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
    /*
     * if container is a string, assume it's an id for
     * a DOM element
     */
    if( typeof config.container === 'string') {
        config.container = document.getElementById(config.container);
    }

    this.className = 'Stage';
    this.container = config.container;
    this.content = document.createElement('div');

    this.width = config.width;
    this.height = config.height;
    this.scale = {
        x: 1,
        y: 1
    };
    this.dblClickWindow = 400;
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

    // set stage id
    this.id = Kinetic.GlobalObject.idCounter++;

    // animation support
    this.isAnimating = false;
    this.onFrameFunc = undefined;

    this._buildDOM();
    this._listen();
    this._prepareDrag();

    // add stage to global object
    Kinetic.GlobalObject.stages.push(this);

    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
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
                    callback(bufferLayer.getCanvas().toDataURL(mimeType, quality));
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
        this.content.removeChild(layer.canvas);
        this._remove(layer);
    },
    /**
     * bind event listener to container DOM element
     * @param {String} typesStr
     * @param {function} handler
     */
    onContainer: function(typesStr, handler) {
        var types = typesStr.split(' ');
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
     * get stage
     */
    getStage: function() {
        return this;
    },
    /**
     * detect event
     * @param {Shape} shape
     */
    _detectEvent: function(shape, evt) {
        var isDragging = Kinetic.GlobalObject.drag.moving;
        var backstageLayer = this.backstageLayer;
        var backstageLayerContext = backstageLayer.getContext();
        var go = Kinetic.GlobalObject;
        var pos = this.getUserPosition();
        var el = shape.eventListeners;

        shape._draw(backstageLayer);

        if(this.targetShape && shape.id === this.targetShape.id) {
            this.targetFound = true;
        }

        if(shape.visible && pos !== undefined && backstageLayerContext.isPointInPath(pos.x, pos.y)) {
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
        else if(!isDragging && this.targetShape && this.targetShape.id === shape.id) {
            this._setTarget(undefined);
            this.mouseoutShape = shape;
            //shape._handleEvents('onmouseout', evt);
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
        if(!this.targetShape || (!this.targetFound && shape.id !== this.targetShape.id)) {
            /*
             * check if old target has an onmouseout event listener
             */
            if(this.targetShape) {
                var oldEl = this.targetShape.eventListeners;
                if(oldEl) {
                    this.mouseoutShape = this.targetShape;
                    //this.targetShape._handleEvents('onmouseout', evt);
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
            if(child.isListening) {
                if(child.className === 'Shape') {
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

        var backstageLayer = this.backstageLayer;
        backstageLayer.clear();

        /*
         * loop through layers.  If at any point an event
         * is triggered, n is set to -1 which will break out of the
         * three nested loops
         */
        this.targetFound = false;
        var shapeDetected = false;
        for(var n = this.children.length - 1; n >= 0; n--) {
            var layer = this.children[n];
            if(layer.visible && n >= 0 && layer.isListening) {
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
        this.container.addEventListener('mousedown', function(evt) {
            that.mouseDown = true;
            that._handleStageEvent(evt);
        }, false);

        this.container.addEventListener('mousemove', function(evt) {
            that.mouseUp = false;
            that.mouseDown = false;
            that._handleStageEvent(evt);
        }, false);

        this.container.addEventListener('mouseup', function(evt) {
            that.mouseUp = true;
            that.mouseDown = false;
            that._handleStageEvent(evt);

            that.clickStart = false;
        }, false);

        this.container.addEventListener('mouseover', function(evt) {
            that._handleStageEvent(evt);
        }, false);

        this.container.addEventListener('mouseout', function(evt) {
            that.mousePos = undefined;
        }, false);
        // mobile events
        this.container.addEventListener('touchstart', function(evt) {
            evt.preventDefault();
            that.touchStart = true;
            that._handleStageEvent(evt);
        }, false);

        this.container.addEventListener('touchmove', function(evt) {
            evt.preventDefault();
            that._handleStageEvent(evt);
        }, false);

        this.container.addEventListener('touchend', function(evt) {
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
        var mouseX = evt.offsetX || (evt.clientX - this._getContainerPosition().left + window.pageXOffset);
        var mouseY = evt.offsetY || (evt.clientY - this._getContainerPosition().top + window.pageYOffset);
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

        this.onContainer('mousemove touchmove', function(evt) {
            var go = Kinetic.GlobalObject;
            var node = go.drag.node;
            if(node) {
                var pos = that.getUserPosition();
                var dc = node.dragConstraint;
                var db = node.dragBounds;

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

                // constraint overrides
                if(dc === 'horizontal') {
                    newNodePos.y = node.y;
                }
                else if(dc === 'vertical') {
                    newNodePos.x = node.x;
                }

                // save rotation and remove it from transform
                var rot = node.rotation;
                node.rotation = 0;

				// unravel transform
                var it = node.getAbsoluteTransform();
                it.invert();
                it.translate(newNodePos.x, newNodePos.y);

                node.x += it.getTranslation().x;
                node.y += it.getTranslation().y;

                // restore rotation
                node.rotate(rot);

                go.drag.node.getLayer().draw();

                if(!go.drag.moving) {
                    go.drag.moving = true;
                    // execute dragstart events if defined
                    go.drag.node._handleEvents('ondragstart', evt);
                }

                // execute user defined ondragmove if defined
                go.drag.node._handleEvents('ondragmove', evt);
            }
        }, false);

        this.onContainer('mouseup touchend mouseout', function(evt) {
            that._endDrag(evt);
        });
    },
    /**
     * build dom
     */
    _buildDOM: function() {
        // content
        this.content.style.width = this.width + 'px';
        this.content.style.height = this.height + 'px';
        this.content.style.position = 'relative';
        this.content.style.display = 'inline-block';
        this.content.className = 'kineticjs-content';
        this.container.appendChild(this.content);

        // default layers
        this.bufferLayer = new Kinetic.Layer();
        this.backstageLayer = new Kinetic.Layer();

        // set parents
        this.bufferLayer.parent = this;
        this.backstageLayer.parent = this;

        // customize back stage context
        this._stripLayer(this.backstageLayer);
        this.bufferLayer.getCanvas().style.display = 'none';
        this.backstageLayer.getCanvas().style.display = 'none';

        // add buffer layer
        this.bufferLayer.canvas.width = this.width;
        this.bufferLayer.canvas.height = this.height;
        this.content.appendChild(this.bufferLayer.canvas);

        // add backstage layer
        this.backstageLayer.canvas.width = this.width;
        this.backstageLayer.canvas.height = this.height;
        this.content.appendChild(this.backstageLayer.canvas);
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Node);
