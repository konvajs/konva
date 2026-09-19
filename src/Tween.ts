import { Util } from './Util.ts';
import { Animation } from './Animation.ts';
import type { NodeConfig } from './Node.ts';
import { Node } from './Node.ts';
import { Konva } from './Global.ts';
import type { Line } from './shapes/Line.ts';

// every config key that is not an attribute to tween
const blacklist: Record<keyof TweenOwnConfig, 1> = {
    node: 1,
    duration: 1,
    easing: 1,
    onFinish: 1,
    onUpdate: 1,
    onReset: 1,
    yoyo: 1,
  },
  PAUSED = 1,
  PLAYING = 2,
  REVERSING = 3,
  colorAttrs = ['fill', 'stroke', 'shadowColor'];
let idCounter = 0;

// the diff below reads r/g/b/a directly, so a color we can not parse must fail
// with its own message instead of "Cannot read properties of undefined"
function colorToRGBA(color: string) {
  return (
    Util.colorToRGBA(color) ||
    Util.throw(
      'can not tween the color "' +
        color +
        '", because it is not a valid color.'
    )
  );
}

function colorDiff(start, end) {
  return {
    r: end.r - start.r,
    g: end.g - start.g,
    b: end.b - start.b,
    a: end.a - start.a,
  };
}

function tweenColor(start, diff, i) {
  return (
    'rgba(' +
    Math.round(start.r + diff.r * i) +
    ',' +
    Math.round(start.g + diff.g * i) +
    ',' +
    Math.round(start.b + diff.b * i) +
    ',' +
    (start.a + diff.a * i) +
    ')'
  );
}

class TweenEngine {
  prop: string;
  propFunc: Function;
  begin: number;
  _pos: number;
  duration: number;
  prevPos: number;
  yoyo: boolean;
  _time: number;
  _position: number;
  _startTime: number;
  _finish: number;
  func: Function;
  _change: number;
  state: number;

  onPlay: Function;
  onReverse: Function;
  onPause: Function;
  onReset: Function;
  onFinish: Function;
  onUpdate: Function;

  constructor(prop, propFunc, func, begin, finish, duration, yoyo) {
    this.prop = prop;
    this.propFunc = propFunc;
    this.begin = begin;
    this._pos = begin;
    this.duration = duration;
    this._change = 0;
    this.prevPos = 0;
    this.yoyo = yoyo;
    this._time = 0;
    this._position = 0;
    this._startTime = 0;
    this._finish = 0;
    this.func = func;
    this._change = finish - this.begin;
    this.pause();
  }
  fire(str) {
    const handler = this[str];
    if (handler) {
      handler();
    }
  }
  setTime(t) {
    if (t > this.duration) {
      if (this.yoyo) {
        this._time = this.duration;
        this.reverse();
      } else {
        this.finish();
      }
    } else if (t < 0) {
      if (this.yoyo) {
        this._time = 0;
        this.play();
      } else {
        this.reset();
      }
    } else {
      this._time = t;
      this.update();
    }
  }
  getTime() {
    return this._time;
  }
  setPosition(p) {
    this.prevPos = this._pos;
    this.propFunc(p);
    this._pos = p;
  }
  getPosition(t) {
    if (t === undefined) {
      t = this._time;
    }
    return this.func(t, this.begin, this._change, this.duration);
  }
  play() {
    this.state = PLAYING;
    this._startTime = this.getTimer() - this._time;
    this.fire('onPlay');
    this.onEnterFrame();
  }
  reverse() {
    this.state = REVERSING;
    this._time = this.duration - this._time;
    this._startTime = this.getTimer() - this._time;
    this.fire('onReverse');
    this.onEnterFrame();
  }
  seek(t) {
    this.pause();
    this._time = t;
    this.update();
    this.fire('onSeek');
  }
  reset() {
    this.pause();
    this._time = 0;
    this.update();
    this.fire('onReset');
  }
  finish() {
    this.pause();
    this._time = this.duration;
    this.update();
    this.fire('onFinish');
  }
  update() {
    this.setPosition(this.getPosition(this._time));
    this.fire('onUpdate');
  }
  onEnterFrame() {
    const t = this.getTimer() - this._startTime;
    if (this.state === PLAYING) {
      this.setTime(t);
    } else if (this.state === REVERSING) {
      this.setTime(this.duration - t);
    }
  }
  pause() {
    this.state = PAUSED;
    this.fire('onPause');
  }
  getTimer() {
    return Date.now();
  }
}

// options of the tween itself, every other TweenConfig key is a node attribute
export interface TweenOwnConfig {
  node: Node;
  duration?: number;
  easing?: (typeof Easings)[keyof typeof Easings];
  yoyo?: boolean;
  onFinish?: Function;
  onUpdate?: Function;
  onReset?: Function;
}

export interface TweenConfig extends NodeConfig, TweenOwnConfig {}

/**
 * Tween constructor.  Tweens enable you to animate a node between the current state and a new state.
 *  You can play, pause, reverse, seek, reset, and finish tweens.  By default, tweens are animated using
 *  a linear easing.  For more tweening options, check out {@link Konva.Easings}
 * @constructor
 * @memberof Konva
 * @example
 * // instantiate new tween which fully rotates a node in 1 second
 * var tween = new Konva.Tween({
 *   // list of tween specific properties
 *   node: node,
 *   duration: 1,
 *   easing: Konva.Easings.EaseInOut,
 *   yoyo: false, // play back and forth
 *   onUpdate: () => console.log('node attrs updated'),
 *   onFinish: () => console.log('finished'),
 *   // set new values for any attributes of a passed node
 *   rotation: 360,
 *   fill: 'red'
 * });
 *
 * // play tween
 * tween.play();
 *
 * // pause tween
 * tween.pause();
 */
export class Tween {
  static attrs = {};
  static tweens = {};

  node: Node;
  anim: Animation;
  tween: TweenEngine;
  _id: number;
  onFinish: Function | undefined;
  onReset: Function | undefined;
  onUpdate: Function | undefined;

  constructor(config: TweenConfig) {
    const that = this,
      node = config.node as any,
      nodeId = node._id,
      easing = config.easing || Easings.Linear,
      yoyo = !!config.yoyo;
    let duration, key;

    if (typeof config.duration === 'undefined') {
      duration = 0.3;
    } else if (config.duration === 0) {
      // zero is bad value for duration
      duration = 0.001;
    } else {
      duration = config.duration;
    }
    this.node = node;
    this._id = idCounter++;

    const layers =
      node.getLayer() ||
      (node instanceof Konva['Stage'] ? node.getLayers() : null);
    if (!layers) {
      Util.error(
        'Tween constructor have `node` that is not in a layer. Please add node into layer first.'
      );
    }
    this.anim = new Animation(function () {
      that.tween.onEnterFrame();
    }, layers);

    this.tween = new TweenEngine(
      key,
      function (i) {
        that._tweenFunc(i);
      },
      easing,
      0,
      1,
      duration * 1000,
      yoyo
    );

    this._addListeners();

    // init attrs map
    if (!Tween.attrs[nodeId]) {
      Tween.attrs[nodeId] = {};
    }
    if (!Tween.attrs[nodeId][this._id]) {
      Tween.attrs[nodeId][this._id] = {};
    }
    // init tweens map
    if (!Tween.tweens[nodeId]) {
      Tween.tweens[nodeId] = {};
    }

    for (key in config) {
      if (blacklist[key] === undefined) {
        this._addAttr(key, config[key]);
      }
    }

    this.reset();

    // callbacks
    this.onFinish = config.onFinish;
    this.onReset = config.onReset;
    this.onUpdate = config.onUpdate;
  }
  _addAttr(key, end) {
    // a component attribute ({x, y} of scale, offset, a gradient point...)
    // is tweened through its components: scale -> scaleX, scaleY
    if (Util._isPlainObject(end)) {
      for (const component in end) {
        this._addAttr(key + Util._capitalize(component), end[component]);
      }
      return;
    }
    const node = this.node,
      nodeId = node._id;
    let diff, len, trueEnd, trueStart;

    // remove conflict from tween map if it exists
    const tweenId = Tween.tweens[nodeId][key];

    if (tweenId !== undefined) {
      delete Tween.attrs[nodeId][tweenId][key];
    }

    // add to tween map
    let start = node.getAttr(key);

    if (Util._isArray(end) || Util._isArray(start)) {
      diff = [];
      // only normalized arrays are interpolated, so the values the user asked
      // for are restored when the tween ends
      trueStart = start;
      trueEnd = end;
      // an attribute the node does not have yet starts from zeros, a scalar
      // side tweens every entry. A copy of start, as the colour stops are
      // replaced by RGBA objects below
      start = Util._isArray(start)
        ? start.slice()
        : new Array(end.length).fill(start || 0);
      if (!Util._isArray(end)) {
        end = new Array(start.length).fill(end);
      }
      len = Math.max(end.length, start.length);

      if (key === 'points' && end.length !== start.length) {
        // before tweening points we need to make sure that start.length === end.length
        // Util._prepareArrayForTween thinking that end.length > start.length
        if (end.length > start.length) {
          // so in this case we will increase number of starting points
          start = Util._prepareArrayForTween(
            start,
            end,
            (node as Line).closed()
          );
        } else {
          // in this case we will increase number of eding points
          end = Util._prepareArrayForTween(end, start, (node as Line).closed());
        }
      }

      if (key.endsWith('ColorStops')) {
        for (let n = 0; n < len; n++) {
          if (n % 2 === 0) {
            diff.push((end[n] || 0) - (start[n] || 0));
          } else {
            const startRGBA = colorToRGBA(start[n]);
            start[n] = startRGBA;
            diff.push(colorDiff(startRGBA, colorToRGBA(end[n])));
          }
        }
      } else {
        for (let n = 0; n < len; n++) {
          diff.push((end[n] || 0) - (start[n] || 0));
        }
      }
    } else if (colorAttrs.indexOf(key) !== -1) {
      start = colorToRGBA(start);
      diff = colorDiff(start, colorToRGBA(end));
    } else {
      diff = end - start;
    }

    Tween.attrs[nodeId][this._id][key] = {
      start: start,
      diff: diff,
      end: end,
      trueEnd: trueEnd,
      trueStart: trueStart,
    };
    Tween.tweens[nodeId][key] = this._id;
  }
  _tweenFunc(i) {
    const node = this.node,
      attrs = Tween.attrs[node._id]?.[this._id];
    let key, attr, start, diff, newVal, n, len, end;

    for (key in attrs) {
      attr = attrs[key];
      start = attr.start;
      diff = attr.diff;
      end = attr.end;

      if (Util._isArray(start)) {
        newVal = [];
        len = Math.max(start.length, end.length);
        if (key.endsWith('ColorStops')) {
          for (n = 0; n < len; n++) {
            if (n % 2 === 0) {
              newVal.push((start[n] || 0) + diff[n] * i);
            } else {
              newVal.push(tweenColor(start[n], diff[n], i));
            }
          }
        } else {
          for (n = 0; n < len; n++) {
            newVal.push((start[n] || 0) + diff[n] * i);
          }
        }
      } else if (colorAttrs.indexOf(key) !== -1) {
        newVal = tweenColor(start, diff, i);
      } else {
        newVal = start + diff * i;
      }

      node.setAttr(key, newVal);
    }
  }
  _addListeners() {
    // a running tween is destroyed with its node (the animation loop would
    // keep both alive); a stopped one is not held by the node at all.
    // The namespace contains "konva" so clone() does not copy the listener
    const destroyEvent = `destroy.konva-tween${this._id}`;
    const onDestroy = () => this.destroy();
    const start = () => {
      this.node.off(destroyEvent).on(destroyEvent, onDestroy);
      this.anim.start();
    };
    this.tween.onPlay = start;
    this.tween.onReverse = start;

    // stop listeners
    this.tween.onPause = () => {
      this.node.off(destroyEvent);
      this.anim.stop();
    };
    const end = (edge: 'trueEnd' | 'trueStart', callback?: Function) => {
      // no attributes means the tween was destroyed inside the last onUpdate
      const attrs = Tween.attrs[this.node._id]?.[this._id];
      if (!attrs) {
        return;
      }
      for (const key in attrs) {
        if (attrs[key][edge] !== undefined) {
          this.node.setAttr(key as any, attrs[key][edge]);
        }
      }
      callback?.call(this);
    };
    this.tween.onFinish = () => end('trueEnd', this.onFinish);
    this.tween.onReset = () => end('trueStart', this.onReset);
    this.tween.onUpdate = () => {
      if (this.onUpdate) {
        this.onUpdate.call(this);
      }
    };
  }
  /**
   * play
   * @method
   * @name Konva.Tween#play
   * @returns {Tween}
   */
  play() {
    this.tween.play();
    return this;
  }
  /**
   * reverse
   * @method
   * @name Konva.Tween#reverse
   * @returns {Tween}
   */
  reverse() {
    this.tween.reverse();
    return this;
  }
  /**
   * reset
   * @method
   * @name Konva.Tween#reset
   * @returns {Tween}
   */
  reset() {
    this.tween.reset();
    return this;
  }
  /**
   * seek
   * @method
   * @name Konva.Tween#seek
   * @param {Number} t time in seconds between 0 and the duration
   * @returns {Tween}
   */
  seek(t) {
    this.tween.seek(t * 1000);
    return this;
  }
  /**
   * pause
   * @method
   * @name Konva.Tween#pause
   * @returns {Tween}
   */
  pause() {
    this.tween.pause();
    return this;
  }
  /**
   * finish
   * @method
   * @name Konva.Tween#finish
   * @returns {Tween}
   */
  finish() {
    this.tween.finish();
    return this;
  }
  /**
   * destroy
   * @method
   * @name Konva.Tween#destroy
   */
  destroy() {
    const nodeId = this.node._id,
      thisId = this._id,
      owned = Tween.attrs[nodeId]?.[thisId],
      owners = Tween.tweens[nodeId];

    this.pause();

    if (this.anim) {
      this.anim.stop();
    }

    // release only the attributes this tween still owns, other tweens on
    // the node keep theirs (nothing left to do when destroyed twice)
    if (owned) {
      if (owners) {
        for (const key in owned) {
          delete owners[key];
        }
        if (Object.keys(owners).length === 0) {
          delete Tween.tweens[nodeId];
        }
      }
      delete Tween.attrs[nodeId][thisId];
      if (Object.keys(Tween.attrs[nodeId]).length === 0) {
        delete Tween.attrs[nodeId];
      }
    }
  }
}

/**
 * Tween node properties. Shorter usage of {@link Konva.Tween} object.
 *
 * @method Konva.Node#to
 * @param {Object} [params] tween params
 * @returns {Konva.Tween}
 * @example
 *
 * circle.to({
 *   x : 50,
 *   duration : 0.5,
 *   onUpdate: () => console.log('props updated'),
 *   onFinish: () => console.log('finished'),
 * });
 */
Node.prototype.to = function (params) {
  const onFinish = params.onFinish;
  // params stay untouched, so the same object can animate several nodes
  const tween = new Tween({
    ...params,
    node: this,
    onFinish() {
      tween.destroy();
      if (onFinish) {
        onFinish();
      }
    },
  } as any);
  tween.play();
  return tween;
};

/*
 * These eases were ported from an Adobe Flash tweening library to JavaScript
 * by Xaric
 */

/**
 * @namespace Easings
 * @memberof Konva
 */
export const Easings = {
  /**
   * back ease in
   * @function
   * @memberof Konva.Easings
   */
  BackEaseIn(t, b, c, d) {
    const s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  /**
   * back ease out
   * @function
   * @memberof Konva.Easings
   */
  BackEaseOut(t, b, c, d) {
    const s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  /**
   * back ease in out
   * @function
   * @memberof Konva.Easings
   */
  BackEaseInOut(t, b, c, d) {
    let s = 1.70158;
    if ((t /= d / 2) < 1) {
      return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    }
    return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
  },
  /**
   * elastic ease in
   * @function
   * @memberof Konva.Easings
   */
  ElasticEaseIn(t, b, c, d, a, p) {
    // added s = 0
    let s = 0;
    if (t === 0) {
      return b;
    }
    if ((t /= d) === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    return (
      -(
        a *
        Math.pow(2, 10 * (t -= 1)) *
        Math.sin(((t * d - s) * (2 * Math.PI)) / p)
      ) + b
    );
  },
  /**
   * elastic ease out
   * @function
   * @memberof Konva.Easings
   */
  ElasticEaseOut(t, b, c, d, a, p) {
    // added s = 0
    let s = 0;
    if (t === 0) {
      return b;
    }
    if ((t /= d) === 1) {
      return b + c;
    }
    if (!p) {
      p = d * 0.3;
    }
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    return (
      a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
      c +
      b
    );
  },
  /**
   * elastic ease in out
   * @function
   * @memberof Konva.Easings
   */
  ElasticEaseInOut(t, b, c, d, a, p) {
    // added s = 0
    let s = 0;
    if (t === 0) {
      return b;
    }
    if ((t /= d / 2) === 2) {
      return b + c;
    }
    if (!p) {
      p = d * (0.3 * 1.5);
    }
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    if (t < 1) {
      return (
        -0.5 *
          (a *
            Math.pow(2, 10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
        b
      );
    }
    return (
      a *
        Math.pow(2, -10 * (t -= 1)) *
        Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
        0.5 +
      c +
      b
    );
  },
  /**
   * bounce ease out
   * @function
   * @memberof Konva.Easings
   */
  BounceEaseOut(t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  },
  /**
   * bounce ease in
   * @function
   * @memberof Konva.Easings
   */
  BounceEaseIn(t, b, c, d) {
    return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
  },
  /**
   * bounce ease in out
   * @function
   * @memberof Konva.Easings
   */
  BounceEaseInOut(t, b, c, d) {
    if (t < d / 2) {
      return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
    } else {
      return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
  },
  /**
   * ease in
   * @function
   * @memberof Konva.Easings
   */
  EaseIn(t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  /**
   * ease out
   * @function
   * @memberof Konva.Easings
   */
  EaseOut(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  /**
   * ease in out
   * @function
   * @memberof Konva.Easings
   */
  EaseInOut(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return (c / 2) * t * t + b;
    }
    return (-c / 2) * (--t * (t - 2) - 1) + b;
  },
  /**
   * strong ease in
   * @function
   * @memberof Konva.Easings
   */
  StrongEaseIn(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  /**
   * strong ease out
   * @function
   * @memberof Konva.Easings
   */
  StrongEaseOut(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  /**
   * strong ease in out
   * @function
   * @memberof Konva.Easings
   */
  StrongEaseInOut(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return (c / 2) * t * t * t * t * t + b;
    }
    return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
  },
  /**
   * linear
   * @function
   * @memberof Konva.Easings
   */
  Linear(t, b, c, d) {
    return (c * t) / d + b;
  },
};
