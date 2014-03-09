(function() {
    // constants
    var HASH = '#',
        BEFORE_DRAW ='beforeDraw',
        DRAW = 'draw';

    Kinetic.Util.addMethods(Kinetic.FastLayer, {
        ___init: function(config) {
            this.nodeType = 'Layer';
            this.canvas = new Kinetic.SceneCanvas();
            // call super constructor
            Kinetic.Container.call(this, config);
        },
        _validateAdd: function(child) {
            var type = child.getType();
            if (type !== 'Shape') {
                Kinetic.Util.error('You may only add shapes to a fast layer.');
            }
        },
        _setCanvasSize: function(width, height) {
            this.canvas.setSize(width, height);
        },
        hitGraphEnabled: function() {
            return false;
        },
        getIntersection: function() {
            return null;
        },
        createPNGStream : function() {
            return this.canvas._canvas.createPNGStream();
        },
        drawScene: function(can) {
            var layer = this.getLayer(),
                canvas = can || (layer && layer.getCanvas());

            this._fire(BEFORE_DRAW, {
                node: this
            });

            if(this.getClearBeforeDraw()) {
                canvas.getContext().clear();
            }
            
            Kinetic.Container.prototype.drawScene.call(this, canvas);

            this._fire(DRAW, {
                node: this
            });

            return this;
        },
        /**
         * get layer canvas
         * @method
         * @memberof Kinetic.FastLayer.prototype
         */
        getCanvas: function() {
            return this.canvas;
        },
        /**
         * get layer canvas context
         * @method
         * @memberof Kinetic.FastLayer.prototype
         */
        getContext: function() {
            return this.getCanvas().getContext();
        },
        /**
         * clear scene and hit canvas contexts tied to the layer
         * @method
         * @memberof Kinetic.FastLayer.prototype
         * @param {Object} [bounds]
         * @param {Number} [bounds.x]
         * @param {Number} [bounds.y]
         * @param {Number} [bounds.width]
         * @param {Number} [bounds.height]
         * @example
         * layer.clear();<br>
         * layer.clear(0, 0, 100, 100);
         */
        clear: function(bounds) {
            var context = this.getContext(),
                hitContext = this.getHitCanvas().getContext();

            context.clear(bounds);
            hitContext.clear(bounds);
            return this;
        },
        // extend Node.prototype.setVisible
        setVisible: function(visible) {
            Kinetic.Node.prototype.setVisible.call(this, visible);
            if(visible) {
                this.getCanvas()._canvas.style.display = 'block';
                this.hitCanvas._canvas.style.display = 'block';
            }
            else {
                this.getCanvas()._canvas.style.display = 'none';
                this.hitCanvas._canvas.style.display = 'none';
            }
            return this;
        },
        // extend Node.prototype.setZIndex
        setZIndex: function(index) {
            Kinetic.Node.prototype.setZIndex.call(this, index);
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
            Kinetic.Node.prototype.moveToTop.call(this);
            var stage = this.getStage();
            if(stage) {
                stage.content.removeChild(this.getCanvas()._canvas);
                stage.content.appendChild(this.getCanvas()._canvas);
            }
        },
        // extend Node.prototype.moveUp
        moveUp: function() {
            if(Kinetic.Node.prototype.moveUp.call(this)) {
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
            if(Kinetic.Node.prototype.moveDown.call(this)) {
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
            if(Kinetic.Node.prototype.moveToBottom.call(this)) {
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
            var stage = this.getStage(),
                canvas = this.getCanvas(),
                _canvas = canvas._canvas;

            Kinetic.Node.prototype.remove.call(this);

            if(stage && _canvas && Kinetic.Util._isInDocument(_canvas)) {
                stage.content.removeChild(_canvas);
            }
            return this;
        },
        getStage: function() {
            return this.parent;
        }
    });
    Kinetic.Util.extend(Kinetic.FastLayer, Kinetic.Container);

    // add getters and setters
    Kinetic.Factory.addGetterSetter(Kinetic.FastLayer, 'clearBeforeDraw', true);
    /**
     * get/set clearBeforeDraw flag which determines if the layer is cleared or not
     *  before drawing
     * @name clearBeforeDraw
     * @method
     * @memberof Kinetic.FastLayer.prototype
     * @param {Boolean} clearBeforeDraw
     * @returns {Boolean}
     * @example
     * // get clearBeforeDraw flag<br>
     * var clearBeforeDraw = layer.clearBeforeDraw();<br><br>
     *
     * // disable clear before draw<br>
     * layer.clearBeforeDraw(false);<br><br>
     *
     * // enable clear before draw<br>
     * layer.clearBeforeDraw(true);
     */

    Kinetic.Collection.mapMethods(Kinetic.FastLayer);
})();
