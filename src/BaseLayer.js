(function() {
    Konva.Util.addMethods(Konva.BaseLayer, {
        ___init: function(config) {
            this.nodeType = 'Layer';
            Konva.Container.call(this, config);
        },
        createPNGStream : function() {
            return this.canvas._canvas.createPNGStream();
        },
        /**
         * get layer canvas
         * @method
         * @memberof Konva.BaseLayer.prototype
         */
        getCanvas: function() {
            return this.canvas;
        },
        /**
         * get layer hit canvas
         * @method
         * @memberof Konva.BaseLayer.prototype
         */
        getHitCanvas: function() {
            return this.hitCanvas;
        },
        /**
         * get layer canvas context
         * @method
         * @memberof Konva.BaseLayer.prototype
         */
        getContext: function() {
            return this.getCanvas().getContext();
        },
        /**
         * clear scene and hit canvas contexts tied to the layer
         * @method
         * @memberof Konva.BaseLayer.prototype
         * @param {Object} [bounds]
         * @param {Number} [bounds.x]
         * @param {Number} [bounds.y]
         * @param {Number} [bounds.width]
         * @param {Number} [bounds.height]
         * @example
         * layer.clear();
         * layer.clear({
         *   x : 0,
         *   y : 0,
         *   width : 100,
         *   height : 100
         * });
         */
        clear: function(bounds) {
            this.getContext().clear(bounds);
            return this;
        },
        clearHitCache: function() {
            this._hitImageData = undefined;
        },
        // extend Node.prototype.setZIndex
        setZIndex: function(index) {
            Konva.Node.prototype.setZIndex.call(this, index);
            var stage = this.getStage();
            if(stage) {
                stage.content.removeChild(this.getCanvas()._canvas);

                if(index < stage.getChildren().length - 1) {
                    stage.content.insertBefore(this.getCanvas()._canvas, stage.getChildren()[index + 1].getCanvas()._canvas);
                }
                else {
                    stage.content.appendChild(this.getCanvas()._canvas);
                }
            }
            return this;
        },
        // extend Node.prototype.moveToTop
        moveToTop: function() {
            Konva.Node.prototype.moveToTop.call(this);
            var stage = this.getStage();
            if(stage) {
                stage.content.removeChild(this.getCanvas()._canvas);
                stage.content.appendChild(this.getCanvas()._canvas);
            }
        },
        // extend Node.prototype.moveUp
        moveUp: function() {
            if(Konva.Node.prototype.moveUp.call(this)) {
                var stage = this.getStage();
                if(stage) {
                    stage.content.removeChild(this.getCanvas()._canvas);

                    if(this.index < stage.getChildren().length - 1) {
                        stage.content.insertBefore(this.getCanvas()._canvas, stage.getChildren()[this.index + 1].getCanvas()._canvas);
                    }
                    else {
                        stage.content.appendChild(this.getCanvas()._canvas);
                    }
                }
            }
        },
        // extend Node.prototype.moveDown
        moveDown: function() {
            if(Konva.Node.prototype.moveDown.call(this)) {
                var stage = this.getStage();
                if(stage) {
                    var children = stage.getChildren();
                    stage.content.removeChild(this.getCanvas()._canvas);
                    stage.content.insertBefore(this.getCanvas()._canvas, children[this.index + 1].getCanvas()._canvas);
                }
            }
        },
        // extend Node.prototype.moveToBottom
        moveToBottom: function() {
            if(Konva.Node.prototype.moveToBottom.call(this)) {
                var stage = this.getStage();
                if(stage) {
                    var children = stage.getChildren();
                    stage.content.removeChild(this.getCanvas()._canvas);
                    stage.content.insertBefore(this.getCanvas()._canvas, children[1].getCanvas()._canvas);
                }
            }
        },
        getLayer: function() {
            return this;
        },
        remove: function() {
            var _canvas = this.getCanvas()._canvas;

            Konva.Node.prototype.remove.call(this);

            if(_canvas && _canvas.parentNode && Konva.Util._isInDocument(_canvas)) {
                _canvas.parentNode.removeChild(_canvas);
            }
            return this;
        },
        getStage: function() {
            return this.parent;
        },
        setSize : function(width, height) {
            this.canvas.setSize(width, height);
        },
        /**
         * get/set width of layer.getter return width of stage. setter doing nothing.
         * if you want change width use `stage.width(value);`
         * @name width
         * @method
         * @memberof Konva.BaseLayer.prototype
         * @returns {Number}
         * @example
         * var width = layer.width();
         */
        getWidth : function() {
            if (this.parent) {
                return this.parent.getWidth();
            }
        },
        setWidth : function() {
            Konva.Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
        },
        /**
         * get/set height of layer.getter return height of stage. setter doing nothing.
         * if you want change height use `stage.height(value);`
         * @name height
         * @method
         * @memberof Konva.BaseLayer.prototype
         * @returns {Number}
         * @example
         * var height = layer.height();
         */
        getHeight : function() {
            if (this.parent) {
                return this.parent.getHeight();
            }
        },
        setHeight : function() {
            Konva.Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
        }
    });
    Konva.Util.extend(Konva.BaseLayer, Konva.Container);

    // add getters and setters
    Konva.Factory.addGetterSetter(Konva.BaseLayer, 'clearBeforeDraw', true);
    /**
     * get/set clearBeforeDraw flag which determines if the layer is cleared or not
     *  before drawing
     * @name clearBeforeDraw
     * @method
     * @memberof Konva.BaseLayer.prototype
     * @param {Boolean} clearBeforeDraw
     * @returns {Boolean}
     * @example
     * // get clearBeforeDraw flag
     * var clearBeforeDraw = layer.clearBeforeDraw();
     *
     * // disable clear before draw
     * layer.clearBeforeDraw(false);
     *
     * // enable clear before draw
     * layer.clearBeforeDraw(true);
     */

    Konva.Collection.mapMethods(Konva.BaseLayer);
})();
