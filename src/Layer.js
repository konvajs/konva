(function() {
    /**
     * Layer constructor.  Layers are tied to their own canvas element and are used
     * to contain groups or shapes
     * @constructor
     * @augments Kinetic.Container
     * @param {Object} config
     * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
     * to clear the canvas before each layer draw.  The default value is true.
     * {{NodeParams}}
     * {{ContainerParams}}
     */
    Kinetic.Layer = function(config) {
        this._initLayer(config);
    };

    Kinetic.Layer.prototype = {
        _initLayer: function(config) {
            this.nodeType = 'Layer';
            this.beforeDrawFunc = undefined;
            this.afterDrawFunc = undefined;
            this.canvas = new Kinetic.SceneCanvas();
            this.canvas.getElement().style.position = 'absolute';
            this.hitCanvas = new Kinetic.HitCanvas();

            this.createAttrs();
            // call super constructor
            Kinetic.Container.call(this, config);
        },
        /**
         * draw children nodes.  this includes any groups
         *  or shapes
         * @name draw
         * @methodOf Kinetic.Layer.prototype
         */
        draw: function() {
            // before draw  handler
            if(this.beforeDrawFunc !== undefined) {
                this.beforeDrawFunc.call(this);
            }
            
            Kinetic.Container.prototype.draw.call(this);

            // after draw  handler
            if(this.afterDrawFunc !== undefined) {
                this.afterDrawFunc.call(this);
            }
        },
        toDataURL: function(config) {
            config = config || {};
            var mimeType = config.mimeType || null, 
                quality = config.quality || null, 
                canvas, context, 
                x = config.x || 0, 
                y = config.y || 0;

            // if dimension or position is defined, use Node toDataURL
            if(config.width || config.height || config.x || config.y) {
                return Kinetic.Node.prototype.toDataURL.call(this, config);
            }
            // otherwise get data url of the currently drawn layer
            else {
                return this.getCanvas().toDataURL(mimeType, quality);
            }
  
        },
        /**
         * set before draw handler
         * @name beforeDraw
         * @methodOf Kinetic.Layer.prototype
         * @param {Function} handler
         */
        beforeDraw: function(func) {
            this.beforeDrawFunc = func;
            return this;
        },
        /**
         * set after draw handler
         * @name afterDraw
         * @methodOf Kinetic.Layer.prototype
         * @param {Function} handler
         */
        afterDraw: function(func) {
            this.afterDrawFunc = func;
            return this;
        },
        /**
         * get layer canvas
         * @name getCanvas
         * @methodOf Kinetic.Layer.prototype
         */
        getCanvas: function() {
            return this.canvas;     
        },
        /**
         * get layer hit canvas
         * @name getHitCanvas
         * @methodOf Kinetic.Layer.prototype
         */
        getHitCanvas: function() {
            return this.hitCanvas;
        },
        /**
         * get layer canvas context
         * @name getContext
         * @methodOf Kinetic.Layer.prototype
         */
        getContext: function() {
            return this.getCanvas().getContext(); 
        },
        /**
         * clear canvas tied to the layer
         * @name clear
         * @methodOf Kinetic.Layer.prototype
         */
        clear: function() {
            this.getCanvas().clear();
        },
        // extenders
        setVisible: function(visible) {
            Kinetic.Node.prototype.setVisible.call(this, visible);
            if(visible) {
                this.getCanvas().element.style.display = 'block';
                this.hitCanvas.element.style.display = 'block';
            }
            else {
                this.getCanvas().element.style.display = 'none';
                this.hitCanvas.element.style.display = 'none';
            }
        },
        setZIndex: function(index) {
            Kinetic.Node.prototype.setZIndex.call(this, index);
            var stage = this.getStage();
            if(stage) {
                stage.content.removeChild(this.getCanvas().element);

                if(index < stage.getChildren().length - 1) {
                    stage.content.insertBefore(this.getCanvas().element, stage.getChildren()[index + 1].getCanvas().element);
                }
                else {
                    stage.content.appendChild(this.getCanvas().element);
                }
            }
        },
        moveToTop: function() {
            Kinetic.Node.prototype.moveToTop.call(this);
            var stage = this.getStage();
            if(stage) {
                stage.content.removeChild(this.getCanvas().element);
                stage.content.appendChild(this.getCanvas().element);
            }
        },
        moveUp: function() {
            if(Kinetic.Node.prototype.moveUp.call(this)) {
                var stage = this.getStage();
                if(stage) {
                    stage.content.removeChild(this.getCanvas().element);

                    if(this.index < stage.getChildren().length - 1) {
                        stage.content.insertBefore(this.getCanvas().element, stage.getChildren()[this.index + 1].getCanvas().element);
                    }
                    else {
                        stage.content.appendChild(this.getCanvas().element);
                    }
                }
            }
        },
        moveDown: function() {
            if(Kinetic.Node.prototype.moveDown.call(this)) {
                var stage = this.getStage();
                if(stage) {
                    var children = stage.getChildren();
                    stage.content.removeChild(this.getCanvas().element);
                    stage.content.insertBefore(this.getCanvas().element, children[this.index + 1].getCanvas().element);
                }
            }
        },
        moveToBottom: function() {
            if(Kinetic.Node.prototype.moveToBottom.call(this)) {
                var stage = this.getStage();
                if(stage) {
                    var children = stage.getChildren();
                    stage.content.removeChild(this.getCanvas().element);
                    stage.content.insertBefore(this.getCanvas().element, children[1].getCanvas().element);
                }
            }
        },
        getLayer: function() {
            return this;
        },
        /**
         * remove layer from stage
         */
        remove: function() {
            var stage = this.getStage(), canvas = this.getCanvas(), element = canvas.element;
            Kinetic.Node.prototype.remove.call(this);

            if(stage && canvas && Kinetic.Type._isInDocument(element)) {
                stage.content.removeChild(element);
            }
        }
    };
    Kinetic.Global.extend(Kinetic.Layer, Kinetic.Container);

    // add getters and setters
    Kinetic.Node.addGetterSetter(Kinetic.Layer, 'clearBeforeDraw', true);

    /**
     * set flag which determines if the layer is cleared or not
     *  before drawing
     * @name setClearBeforeDraw
     * @methodOf Kinetic.Layer.prototype
     * @param {Boolean} clearBeforeDraw
     */

    /**
     * get flag which determines if the layer is cleared or not
     *  before drawing
     * @name getClearBeforeDraw
     * @methodOf Kinetic.Layer.prototype
     */
})();
