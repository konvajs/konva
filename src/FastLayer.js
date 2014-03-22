(function() {
    // constants
    var HASH = '#',
        BEFORE_DRAW ='beforeDraw',
        DRAW = 'draw';

    Kinetic.Util.addMethods(Kinetic.FastLayer, {
        ____init: function(config) {
            this.nodeType = 'Layer';
            this.canvas = new Kinetic.SceneCanvas();
            // call super constructor
            Kinetic.BaseLayer.call(this, config);
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
        drawScene: function(can) {
            var layer = this.getLayer(),
                canvas = can || (layer && layer.getCanvas());

            if(this.getClearBeforeDraw()) {
                canvas.getContext().clear();
            }
            
            Kinetic.Container.prototype.drawScene.call(this, canvas);

            return this;
        },
        // the apply transform method is handled by the Layer and FastLayer class
        // because it is up to the layer to decide if an absolute or relative transform
        // should be used
        _applyTransform: function(shape, context, top) {
            if (!top || top._id !== this._id) {
                var m = shape.getTransform().getMatrix();
                context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            }
        },
        draw: function() {
            this.drawScene();
            return this;
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
            this.getContext().clear(bounds);
            return this;
        },
        // extend Node.prototype.setVisible
        setVisible: function(visible) {
            Kinetic.Node.prototype.setVisible.call(this, visible);
            if(visible) {
                this.getCanvas()._canvas.style.display = 'block';
            }
            else {
                this.getCanvas()._canvas.style.display = 'none';
            }
            return this;
        }
    });
    Kinetic.Util.extend(Kinetic.FastLayer, Kinetic.BaseLayer);

    Kinetic.Collection.mapMethods(Kinetic.FastLayer);
})();
