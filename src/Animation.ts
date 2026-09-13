import { glob } from './Global.ts';
import type { Layer } from './Layer.ts';
import type { IFrame, AnimationFn } from './types.ts';
import { Util } from './Util.ts';

const now: () => number = glob.performance?.now
  ? () => glob.performance.now()
  : Date.now;

/**
 * Animation constructor.
 * @constructor
 * @memberof Konva
 * @param {AnimationFn} func function executed on each animation frame.  The function is passed a frame object, which contains
 *  timeDiff, lastTime, time, and frameRate properties.  The timeDiff property is the number of milliseconds that have passed
 *  since the last animation frame. The time property accumulates elapsed animation time in milliseconds across stop/start calls, excluding paused time.
 *  The lastTime property is the current frame's clock timestamp in milliseconds. The frameRate property is the current frame rate in frames / second.
 *  Return false from function, if you don't need to redraw layer/layers on some frames.
 * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn on each animation frame. Can be a layer, an array of layers, or null.
 *  Not specifying a node will result in no redraw.
 * @example
 * // move a node to the right at 50 pixels / second
 * var velocity = 50;
 *
 * var anim = new Konva.Animation(function(frame) {
 *   var dist = velocity * (frame.timeDiff / 1000);
 *   node.move({x: dist, y: 0});
 * }, layer);
 *
 * anim.start();
 */
export class Animation {
  func: AnimationFn;
  id = Animation.animIdCounter++;

  layers: Layer[];

  frame: IFrame = {
    time: 0,
    timeDiff: 0,
    lastTime: now(),
    frameRate: 0,
  };

  constructor(func: AnimationFn, layers?) {
    this.func = func;
    this.setLayers(layers);
  }
  /**
   * set layers to be redrawn on each animation frame
   * @method
   * @name Konva.Animation#setLayers
   * @param {Konva.Layer|Array} [layers] layer(s) to be redrawn. Can be a layer, an array of layers, or null.  Not specifying a node will result in no redraw.
   * @return {Konva.Animation} this
   */
  setLayers(layers: null | Layer | Layer[]) {
    // a copy, so that addLayer() never pushes into the caller's array
    this.layers = layers ? ([] as Layer[]).concat(layers) : [];
    return this;
  }
  /**
   * get layers
   * @method
   * @name Konva.Animation#getLayers
   * @return {Array} Array of Konva.Layer
   */
  getLayers() {
    return this.layers;
  }
  /**
   * add layer.  Returns true if the layer was added, and false if it was not
   * @method
   * @name Konva.Animation#addLayer
   * @param {Konva.Layer} layer to add
   * @return {Bool} true if layer is added to animation, otherwise false
   */
  addLayer(layer: Layer) {
    const layers = this.layers;
    const len = layers.length;

    // don't add the layer if it already exists
    for (let n = 0; n < len; n++) {
      if (layers[n]._id === layer._id) {
        return false;
      }
    }

    this.layers.push(layer);
    return true;
  }
  /**
   * determine if animation is running or not.  returns true or false
   * @method
   * @name Konva.Animation#isRunning
   * @return {Bool} is animation running?
   */
  isRunning() {
    return Animation.animations.has(this);
  }
  /**
   * start animation
   * @method
   * @name Konva.Animation#start
   * @return {Konva.Animation} this
   */
  start() {
    this.stop();
    this.frame.timeDiff = 0;
    this.frame.lastTime = now();
    Animation._addAnimation(this);
    return this;
  }
  /**
   * stop animation
   * @method
   * @name Konva.Animation#stop
   * @return {Konva.Animation} this
   */
  stop() {
    Animation._removeAnimation(this);
    return this;
  }
  _updateFrameObject(time: number) {
    this.frame.timeDiff = time - this.frame.lastTime;
    this.frame.lastTime = time;
    this.frame.time += this.frame.timeDiff;
    this.frame.frameRate = 1000 / this.frame.timeDiff;
  }

  static animations = new Set<Animation>();
  static animIdCounter = 0;
  static animRunning = false;

  static _addAnimation(anim: Animation) {
    this.animations.add(anim);
    this._handleAnimation();
  }
  static _removeAnimation(anim: Animation) {
    this.animations.delete(anim);
  }

  static _runFrames() {
    // every layer is drawn once, however many animations touch it
    const layersToDraw = new Set<Layer>();
    // an animation may stop or restart itself, or another one, inside its
    // function: each one runs at most once per frame, a stopped one not at all
    Array.from(this.animations).forEach((anim) => {
      if (!this.animations.has(anim)) {
        return;
      }
      anim._updateFrameObject(now());
      // the function returns false to skip the redraw
      if (anim.func && anim.func.call(anim, anim.frame) === false) {
        return;
      }
      anim.layers.forEach((layer) => layer && layersToDraw.add(layer));
    });
    layersToDraw.forEach((layer) => layer.batchDraw());
  }
  static _animationLoop() {
    const Anim = Animation;
    if (Anim.animations.size) {
      Anim._runFrames();
      Util.requestAnimFrame(Anim._animationLoop);
    } else {
      Anim.animRunning = false;
    }
  }
  static _handleAnimation() {
    if (!this.animRunning) {
      this.animRunning = true;
      Util.requestAnimFrame(this._animationLoop);
    }
  }
}
