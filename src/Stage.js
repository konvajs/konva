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
    // default attrs
    if(this.attrs === undefined) {
        this.attrs = {};
    }
    this.attrs.width = 400;
    this.attrs.height = 200;
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

    this._buildDOM();
    this._listen();
    this._prepareDrag();

    this.anim = undefined;

    // add stage to global object
    Kinetic.GlobalObject.stages.push(this);
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
        var go = Kinetic.GlobalObject;
        go.addAnimation(this.anim);
        go._handleAnimation();
    },
    /**
     * stop animation
     */
    stop: function() {
        var go = Kinetic.GlobalObject;
        go.removeAnimation(this.anim.id);
        go._handleAnimation();
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
        this.attrs.width = width;
        this.attrs.height = height;

        // set buffer layer and path layer sizes
        this.bufferLayer.getCanvas().width = width;
        this.bufferLayer.getCanvas().height = height;
        this.pathLayer.getCanvas().width = width;
        this.pathLayer.getCanvas().height = height;
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
            console.log(dataURL);
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
     * load stage with JSON string.  De-serializtion does not generate custom
     *  shape drawing functions, images, or event handlers (this would make the
     * 	serialized object huge).  If your app uses custom shapes, images, and
     *  event handlers (it probably does), then you need to select the appropriate
     *  shapes after loading the stage and set these properties via on(), setDrawFunc(),
     *  and setImage()
     * @param {String} JSON string
     */
    load: function(json) {
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
     * bind event listener to container DOM element
     * @param {String} typesStr
     * @param {function} handler
     */
    onContent: function(typesStr, handler) {
        var types = typesStr.split(' ');
        for(var n = 0; n < types.length; n++) {
            var baseEvent = types[n];
            this.content.addEventListener(baseEvent, handler, false);
        }
    },
    /**
     * add layer to stage
     * @param {Layer} layer
     */
    add: function(layer) {
        if(layer.attrs.name) {
            this.childrenNames[layer.attrs.name] = layer;
        }
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
     * detect event
     * @param {Shape} shape
     */
    _detectEvent: function(shape, evt) {
        var isDragging = Kinetic.GlobalObject.drag.moving;
        var go = Kinetic.GlobalObject;
        var pos = this.getUserPosition();
        var el = shape.eventListeners;

        if(this.targetShape && shape.id === this.targetShape.id) {
            this.targetFound = true;
        }

        if(shape.attrs.visible && pos !== undefined && shape._isPointInShape(pos)) {
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

        this.onContent('mousemove touchmove', function(evt) {
            var go = Kinetic.GlobalObject;
            var node = go.drag.node;
            if(node) {
                var pos = that.getUserPosition();
                var dc = node.attrs.dragConstraint;
                var db = node.attrs.dragBounds;

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

                /*
                 * save rotation and scale and then
                 * remove them from the transform
                 */
                var rot = node.attrs.rotation;
                var scale = {
                    x: node.attrs.scale.x,
                    y: node.attrs.scale.y
                };
                node.attrs.rotation = 0;
                node.attrs.scale = {
                    x: 1,
                    y: 1
                };

                // unravel transform
                var it = node.getAbsoluteTransform();
                it.invert();
                it.translate(newNodePos.x, newNodePos.y);
                newNodePos = {
                    x: node.attrs.x + it.getTranslation().x,
                    y: node.attrs.y + it.getTranslation().y
                };

                // constraint overrides
                if(dc === 'horizontal') {
                    newNodePos.y = node.attrs.y;
                }
                else if(dc === 'vertical') {
                    newNodePos.x = node.attrs.x;
                }

                node.setPosition(newNodePos.x, newNodePos.y);

                // restore rotation and scale
                node.rotate(rot);
                node.attrs.scale = {
                    x: scale.x,
                    y: scale.y
                };

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

        this.onContent('mouseup touchend mouseout', function(evt) {
            that._endDrag(evt);
        });
    },
    /**
     * build dom
     */
    _buildDOM: function() {
        // content
        this.content.style.width = this.attrs.width + 'px';
        this.content.style.height = this.attrs.height + 'px';
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
        this.bufferLayer.canvas.width = this.attrs.width;
        this.bufferLayer.canvas.height = this.attrs.height;
        this.bufferLayer.canvas.className = 'kineticjs-buffer-layer';
        this.content.appendChild(this.bufferLayer.canvas);

        // add path layer
        this.pathLayer.canvas.width = this.attrs.width;
        this.pathLayer.canvas.height = this.attrs.height;
        this.pathLayer.canvas.className = 'kineticjs-path-layer';
        this.content.appendChild(this.pathLayer.canvas);
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Stage, Kinetic.Node);
