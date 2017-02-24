(function() {
  'use strict';
  /**
     * FastLayer constructor. Layers are tied to their own canvas element and are used
     * to contain shapes only.  If you don't need node nesting, mouse and touch interactions,
     * or event pub/sub, you should use FastLayer instead of Layer to create your layers.
     * It renders about 2x faster than normal layers.
     * @constructor
     * @memberof Konva
     * @augments Konva.BaseLayer
     * @param {Object} config
     * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
     * to clear the canvas before each layer draw.  The default value is true.
     * @param {Boolean} [config.visible]
     * @param {String} [config.id] unique id
     * @param {String} [config.name] non-unique name
     * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
     * @@containerParams
     * @example
     * var layer = new Konva.FastLayer();
     */
  Konva.FastLayer = function(config) {
    this.____init(config);
  };

  Konva.Util.addMethods(Konva.FastLayer, {
    ____init: function(config) {
      this.nodeType = 'Layer';
      this.canvas = new Konva.SceneCanvas();
      // call super constructor
      Konva.BaseLayer.call(this, config);
    },
    _validateAdd: function(child) {
      var type = child.getType();
      if (type !== 'Shape') {
        Konva.Util.throw('You may only add shapes to a fast layer.');
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
      var layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());

      if (this.getClearBeforeDraw()) {
        canvas.getContext().clear();
      }

      Konva.Container.prototype.drawScene.call(this, canvas);

      return this;
    },
    draw: function() {
      this.drawScene();
      return this;
    },
    // extend Node.prototype.setVisible
    setVisible: function(visible) {
      Konva.Node.prototype.setVisible.call(this, visible);
      if (visible) {
        this.getCanvas()._canvas.style.display = 'block';
      } else {
        this.getCanvas()._canvas.style.display = 'none';
      }
      return this;
    }
  });
  Konva.Util.extend(Konva.FastLayer, Konva.BaseLayer);

  Konva.Collection.mapMethods(Konva.FastLayer);
})();
