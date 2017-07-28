(function(Konva) {
  'use strict';
  var now = (function() {
    if (Konva.global.performance && Konva.global.performance.now) {
      return function() {
        return Konva.global.performance.now();
      };
    }

    return function() {
      return new Date().getTime();
    };
  })();

  function FRAF(callback) {
    setTimeout(callback, 1000 / 60);
  }

  var RAF = (function() {
    return (
      Konva.global.requestAnimationFrame ||
      Konva.global.webkitRequestAnimationFrame ||
      Konva.global.mozRequestAnimationFrame ||
      Konva.global.oRequestAnimationFrame ||
      Konva.global.msRequestAnimationFrame ||
      FRAF
    );
  })();

  function requestAnimFrame() {
    return RAF.apply(Konva.global, arguments);
  }

  /**
     * Animation constructor.  A stage is used to contain multiple layers and handle
     * @constructor
     * @memberof Konva
     * @param {Function} func function executed on each animation frame.  The function is passed a frame object, which contains
     *  timeDiff, lastTime, time, and frameRate properties.  The timeDiff property is the number of milliseconds that have passed
     *  since the last animation frame.  The lastTime property is time in milliseconds that elapsed from the moment the animation started
     *  to the last animation frame.  The time property is the time in milliseconds that ellapsed from the moment the animation started
     *  to the current animation frame.  The frameRate property is the current frame rate in frames / second. Return false from function,
     *  if you don't need to redraw layer/layers on some frames.
     * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn on each animation frame. Can be a layer, an array of layers, or null.
     *  Not specifying a node will result in no redraw.
     * @example
     * // move a node to the right at 50 pixels / second
     * var velocity = 50;
     *
     * var anim = new Konva.Animation(function(frame) {
     *   var dist = velocity * (frame.timeDiff / 1000);
     *   node.move(dist, 0);
     * }, layer);
     *
     * anim.start();
     */
  Konva.Animation = function(func, layers) {
    var Anim = Konva.Animation;
    this.func = func;
    this.setLayers(layers);
    this.id = Anim.animIdCounter++;
    this.frame = {
      time: 0,
      timeDiff: 0,
      lastTime: now()
    };
  };
  /*
     * Animation methods
     */
  Konva.Animation.prototype = {
    /**
         * set layers to be redrawn on each animation frame
         * @method
         * @memberof Konva.Animation.prototype
         * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn.&nbsp; Can be a layer, an array of layers, or null.  Not specifying a node will result in no redraw.
         * @return {Konva.Animation} this
         */
    setLayers: function(layers) {
      var lays = [];
      // if passing in no layers
      if (!layers) {
        lays = [];
      } else if (layers.length > 0) {
        // if passing in an array of Layers
        // NOTE: layers could be an array or Konva.Collection.  for simplicity, I'm just inspecting
        // the length property to check for both cases
        lays = layers;
      } else {
        // if passing in a Layer
        lays = [layers];
      }

      this.layers = lays;
      return this;
    },
    /**
         * get layers
         * @method
         * @memberof Konva.Animation.prototype
         * @return {Array} Array of Konva.Layer
         */
    getLayers: function() {
      return this.layers;
    },
    /**
         * add layer.  Returns true if the layer was added, and false if it was not
         * @method
         * @memberof Konva.Animation.prototype
         * @param {Konva.Layer} layer to add
         * @return {Bool} true if layer is added to animation, otherwise false
         */
    addLayer: function(layer) {
      var layers = this.layers, len = layers.length, n;

      // don't add the layer if it already exists
      for (n = 0; n < len; n++) {
        if (layers[n]._id === layer._id) {
          return false;
        }
      }

      this.layers.push(layer);
      return true;
    },
    /**
         * determine if animation is running or not.  returns true or false
         * @method
         * @memberof Konva.Animation.prototype
         * @return {Bool} is animation running?
         */
    isRunning: function() {
      var a = Konva.Animation,
        animations = a.animations,
        len = animations.length,
        n;

      for (n = 0; n < len; n++) {
        if (animations[n].id === this.id) {
          return true;
        }
      }
      return false;
    },
    /**
         * start animation
         * @method
         * @memberof Konva.Animation.prototype
         * @return {Konva.Animation} this
         */
    start: function() {
      var Anim = Konva.Animation;
      this.stop();
      this.frame.timeDiff = 0;
      this.frame.lastTime = now();
      Anim._addAnimation(this);
      return this;
    },
    /**
         * stop animation
         * @method
         * @memberof Konva.Animation.prototype
         * @return {Konva.Animation} this
         */
    stop: function() {
      Konva.Animation._removeAnimation(this);
      return this;
    },
    _updateFrameObject: function(time) {
      this.frame.timeDiff = time - this.frame.lastTime;
      this.frame.lastTime = time;
      this.frame.time += this.frame.timeDiff;
      this.frame.frameRate = 1000 / this.frame.timeDiff;
    }
  };
  Konva.Animation.animations = [];
  Konva.Animation.animIdCounter = 0;
  Konva.Animation.animRunning = false;

  Konva.Animation._addAnimation = function(anim) {
    this.animations.push(anim);
    this._handleAnimation();
  };
  Konva.Animation._removeAnimation = function(anim) {
    var id = anim.id, animations = this.animations, len = animations.length, n;

    for (n = 0; n < len; n++) {
      if (animations[n].id === id) {
        this.animations.splice(n, 1);
        break;
      }
    }
  };

  Konva.Animation._runFrames = function() {
    var layerHash = {},
      animations = this.animations,
      anim,
      layers,
      func,
      n,
      i,
      layersLen,
      layer,
      key,
      needRedraw;
    /*
         * loop through all animations and execute animation
         *  function.  if the animation object has specified node,
         *  we can add the node to the nodes hash to eliminate
         *  drawing the same node multiple times.  The node property
         *  can be the stage itself or a layer
         */
    /*
         * WARNING: don't cache animations.length because it could change while
         * the for loop is running, causing a JS error
         */

    for (n = 0; n < animations.length; n++) {
      anim = animations[n];
      layers = anim.layers;
      func = anim.func;

      anim._updateFrameObject(now());
      layersLen = layers.length;

      // if animation object has a function, execute it
      if (func) {
        // allow anim bypassing drawing
        needRedraw = func.call(anim, anim.frame) !== false;
      } else {
        needRedraw = true;
      }
      if (!needRedraw) {
        continue;
      }
      for (i = 0; i < layersLen; i++) {
        layer = layers[i];

        if (layer._id !== undefined) {
          layerHash[layer._id] = layer;
        }
      }
    }

    for (key in layerHash) {
      if (!layerHash.hasOwnProperty(key)) {
        continue;
      }
      layerHash[key].draw();
    }
  };
  Konva.Animation._animationLoop = function() {
    var Anim = Konva.Animation;
    if (Anim.animations.length) {
      Anim._runFrames();
      requestAnimFrame(Anim._animationLoop);
    } else {
      Anim.animRunning = false;
    }
  };
  Konva.Animation._handleAnimation = function() {
    if (!this.animRunning) {
      this.animRunning = true;
      requestAnimFrame(this._animationLoop);
    }
  };

  /**
     * batch draw. this function will not do immediate draw
     * but it will schedule drawing to next tick (requestAnimFrame)
     * @method
     * @return {Konva.Layer} this
     * @memberof Konva.Base.prototype
     */
  Konva.BaseLayer.prototype.batchDraw = function() {
    var that = this, Anim = Konva.Animation;

    if (!this.batchAnim) {
      this.batchAnim = new Anim(function() {
        // stop animation after first tick
        that.batchAnim.stop();
      }, this);
    }

    if (!this.batchAnim.isRunning()) {
      this.batchAnim.start();
    }
    return this;
  };

  /**
     * batch draw
     * @method
     * @return {Konva.Stage} this
     * @memberof Konva.Stage.prototype
     */
  Konva.Stage.prototype.batchDraw = function() {
    this.getChildren().each(function(layer) {
      layer.batchDraw();
    });
    return this;
  };
})(Konva);
