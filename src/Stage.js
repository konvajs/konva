(function() {
    /**
     * Stage constructor.  A stage is used to contain multiple layers
     * @constructor
     * @augments Kinetic.Container
     * @param {Object} config
     * @param {String|DomElement} config.container Container id or DOM element
     * {{NodeParams}}
     */
    Kinetic.Stage = function(config) {
        this._initStage(config);
    };

    Kinetic.Stage.prototype = {
        _initStage: function(config) {
        	var dd = Kinetic.DD;
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
            Kinetic.Global.stages.push(this);

            if(dd) {
                dd._initDragLayer(this);
            }
        },
        /**
         * set container dom element which contains the stage wrapper div element
         * @name setContainer
         * @methodOf Kinetic.Stage.prototype
         * @param {DomElement} container can pass in a dom element or id string
         */
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
         * draw layer scene graphs
         * @name draw
         * @methodOf Kinetic.Stage.prototype
         */

        /**
         * draw layer hit graphs
         * @name drawHit
         * @methodOf Kinetic.Stage.prototype
         */

        /**
         * set height
         * @name setHeight
         * @methodOf Kinetic.Stage.prototype
         * @param {Number} height
         */
        setHeight: function(height) {
            Kinetic.Node.prototype.setHeight.call(this, height);
            this._resizeDOM();
        },
        /**
         * set width
         * @name setWidth
         * @methodOf Kinetic.Stage.prototype
         * @param {Number} width
         */
        setWidth: function(width) {
            Kinetic.Node.prototype.setWidth.call(this, width);
            this._resizeDOM();
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
         * remove stage
         */
        remove: function() {
            var content = this.content;
            Kinetic.Node.prototype.remove.call(this);

            if(content && Kinetic.Type._isInDocument(content)) {
                this.attrs.container.removeChild(content);
            }
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
         * get mouse position for desktop apps
         * @name getMousePosition
         * @methodOf Kinetic.Stage.prototype
         */
        getMousePosition: function() {
            return this.mousePos;
        },
        /**
         * get touch position for mobile apps
         * @name getTouchPosition
         * @methodOf Kinetic.Stage.prototype
         */
        getTouchPosition: function() {
            return this.touchPos;
        },
        /**
         * get user position which can be a touc position or mouse position
         * @name getUserPosition
         * @methodOf Kinetic.Stage.prototype
         */
        getUserPosition: function() {
            return this.getTouchPosition() || this.getMousePosition();
        },
        getStage: function() {
            return this;
        },
        /**
         * get stage content div element which has the
         *  the class name "kineticjs-content"
         * @name getContent
         * @methodOf Kinetic.Stage.prototype
         */
        getContent: function() {
            return this.content;
        },
        /**
         * Creates a composite data URL and requires a callback because the composite is generated asynchronously.
         * @name toDataURL
         * @methodOf Kinetic.Stage.prototype
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
            config = config || {};
            var mimeType = config.mimeType || null, quality = config.quality || null, x = config.x || 0, y = config.y || 0, canvas = new Kinetic.SceneCanvas(config.width || this.getWidth(), config.height || this.getHeight()), context = canvas.getContext(), layers = this.children;

            if(x || y) {
                context.translate(-1 * x, -1 * y);
            }

            function drawLayer(n) {
                var layer = layers[n];
                var layerUrl = layer.toDataURL();
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
         * converts stage into an image.
         * @name toImage
         * @methodOf Kinetic.Stage.prototype
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
            var cb = config.callback;

            config.callback = function(dataUrl) {
                Kinetic.Type._getImage(dataUrl, function(img) {
                    cb(img);
                });
            };
            this.toDataURL(config);
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
                if(layer.isVisible() && layer.isListening()) {
                    var p = layer.hitCanvas.context.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
                    // this indicates that a hit pixel may have been found
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

                this.bufferCanvas.setSize(width, height, 1);
                this.hitCanvas.setSize(width, height);
                // set user defined layer dimensions
                var layers = this.children;
                for(var n = 0; n < layers.length; n++) {
                    var layer = layers[n];
                    layer.getCanvas().setSize(width, height);
                    layer.hitCanvas.setSize(width, height);
                    layer.draw();
                }
            }
        },
        /**
         * add layer to stage
         * @param {Kinetic.Layer} layer
         */
        add: function(layer) {
            Kinetic.Container.prototype.add.call(this, layer);
            layer.canvas.setSize(this.attrs.width, this.attrs.height);
            layer.hitCanvas.setSize(this.attrs.width, this.attrs.height);

            // draw layer and append canvas to container
            layer.draw();
            this.content.appendChild(layer.canvas.element);
            
            // chainable
            return this;
        },
        /**
         * get drag and drop layer
         */
        getDragLayer: function() {
            return this.dragLayer;
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
            var dd = Kinetic.DD;
            // if there's a current target shape, run mouseout handlers
            var targetShape = this.targetShape;
            if(targetShape && (!dd || !dd.moving)) {
                targetShape._handleEvent('mouseout', evt);
                targetShape._handleEvent('mouseleave', evt);
                this.targetShape = null;
            }
            this.mousePos = undefined;
        },
        _mousemove: function(evt) {
            this._setUserPosition(evt);
            var dd = Kinetic.DD;
            var obj = this.getIntersection(this.getUserPosition());

            if(obj) {
                var shape = obj.shape;
                if(shape) {
                    if((!dd || !dd.moving) && obj.pixel[3] === 255 && (!this.targetShape || this.targetShape._id !== shape._id)) {
                        if(this.targetShape) {
                            this.targetShape._handleEvent('mouseout', evt, shape);
                            this.targetShape._handleEvent('mouseleave', evt, shape);
                        }
                        shape._handleEvent('mouseover', evt, this.targetShape);
                        shape._handleEvent('mouseenter', evt, this.targetShape);
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
            else if(this.targetShape && (!dd || !dd.moving)) {
                this.targetShape._handleEvent('mouseout', evt);
                this.targetShape._handleEvent('mouseleave', evt);
                this.targetShape = null;
            }

            // start drag and drop
            if(dd) {
                dd._drag(evt);
            }
        },
        _mousedown: function(evt) {
        	var obj, dd = Kinetic.DD;
            this._setUserPosition(evt);
            obj = this.getIntersection(this.getUserPosition());
            if(obj && obj.shape) {
                var shape = obj.shape;
                this.clickStart = true;
                shape._handleEvent('mousedown', evt);
            }

            //init stage drag and drop
            if(dd && this.attrs.draggable && !dd.node) {
                this._startDrag(evt);
            }
        },
        _mouseup: function(evt) {
            this._setUserPosition(evt);
            var that = this, dd = Kinetic.DD, obj = this.getIntersection(this.getUserPosition());

            if(obj && obj.shape) {
                var shape = obj.shape;
                shape._handleEvent('mouseup', evt);

                // detect if click or double click occurred
                if(this.clickStart) {
                    /*
                     * if dragging and dropping, don't fire click or dbl click
                     * event
                     */
                    if(!dd || !dd.moving || !dd.node) {
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
        },
        _touchstart: function(evt) {
        	var obj, dd = Kinetic.DD;
        	
            this._setUserPosition(evt);
            evt.preventDefault();
            obj = this.getIntersection(this.getUserPosition());

            if(obj && obj.shape) {
                var shape = obj.shape;
                this.tapStart = true;
                shape._handleEvent('touchstart', evt);
            }

            // init stage drag and drop
            if(dd && this.attrs.draggable && !dd.node) {
                this._startDrag(evt);
            }
        },
        _touchend: function(evt) {
            this._setUserPosition(evt);
            var that = this, dd = Kinetic.DD, obj = this.getIntersection(this.getUserPosition());

            if(obj && obj.shape) {
                var shape = obj.shape;
                shape._handleEvent('touchend', evt);

                // detect if tap or double tap occurred
                if(this.tapStart) {
                    /*
                     * if dragging and dropping, don't fire tap or dbltap
                     * event
                     */
                    if(!dd || !dd.moving || !dd.node) {
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
        },
        _touchmove: function(evt) {
            this._setUserPosition(evt);
            var dd = Kinetic.DD;
            evt.preventDefault();
            var obj = this.getIntersection(this.getUserPosition());
            if(obj && obj.shape) {
                var shape = obj.shape;
                shape._handleEvent('touchmove', evt);
            }

            // start drag and drop
            if(dd) {
                dd._drag(evt);
            }
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
         * build dom
         */
        _buildDOM: function() {
            // content
            this.content = document.createElement('div');
            this.content.style.position = 'relative';
            this.content.style.display = 'inline-block';
            this.content.className = 'kineticjs-content';
            this.attrs.container.appendChild(this.content);

            this.bufferCanvas = new Kinetic.SceneCanvas();
            this.hitCanvas = new Kinetic.HitCanvas();

            this._resizeDOM();
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
        }
    };
    Kinetic.Global.extend(Kinetic.Stage, Kinetic.Container);

    // add getters and setters
    Kinetic.Node.addGetters(Kinetic.Stage, ['container']);

    /**
     * get container DOM element
     * @name getContainer
     * @methodOf Kinetic.Stage.prototype
     */
})();
