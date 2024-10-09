import { Util } from './Util';
import { Animation } from './Animation';
import { Node, NodeConfig } from './Node';
import { Konva } from './Global';
import { Line } from './shapes/Line';

let blacklist = {
    node: 1,
    duration: 1,
    easing: 1,
    onFinish: 1,
    yoyo: 1,
  },
  PAUSED = 1,
  PLAYING = 2,
  REVERSING = 3,
  idCounter = 0,
  colorAttrs = ['fill', 'stroke', 'shadowColor'];

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
    this.onEnterFrame();
    this.fire('onPlay');
  }
  reverse() {
    this.state = REVERSING;
    this._time = this.duration - this._time;
    this._startTime = this.getTimer() - this._time;
    this.onEnterFrame();
    this.fire('onReverse');
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
    return new Date().getTime();
  }
}

export interface TweenConfig extends NodeConfig {
  onFinish?: Function;
  onUpdate?: Function;
  duration?: number;
  node: Node;
}

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
 *   onUpdate: () => console.log('node attrs updated')
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
    let that = this,
      node = config.node as any,
      nodeId = node._id,
      duration,
      easing = config.easing || Easings.Linear,
      yoyo = !!config.yoyo,
      key;

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
    let node = this.node,
      nodeId = node._id,
      start,
      diff,
      tweenId,
      n,
      len,
      trueEnd,
      trueStart,
      endRGBA;

    // remove conflict from tween map if it exists
    tweenId = Tween.tweens[nodeId][key];

    if (tweenId) {
      delete Tween.attrs[nodeId][tweenId][key];
    }

    // add to tween map
    start = node.getAttr(key);

    if (Util._isArray(end)) {
      diff = [];
      len = Math.max(end.length, start.length);

      if (key === 'points' && end.length !== start.length) {
        // before tweening points we need to make sure that start.length === end.length
        // Util._prepareArrayForTween thinking that end.length > start.length
        if (end.length > start.length) {
          // so in this case we will increase number of starting points
          trueStart = start;
          start = Util._prepareArrayForTween(
            start,
            end,
            (node as Line).closed()
          );
        } else {
          // in this case we will increase number of eding points
          trueEnd = end;
          end = Util._prepareArrayForTween(end, start, (node as Line).closed());
        }
      }

      if (key.indexOf('fill') === 0) {
        for (n = 0; n < len; n++) {
          if (n % 2 === 0) {
            diff.push(end[n] - start[n]);
          } else {
            const startRGBA = Util.colorToRGBA(start[n])!;
            endRGBA = Util.colorToRGBA(end[n]);
            start[n] = startRGBA;
            diff.push({
              r: endRGBA.r - startRGBA.r,
              g: endRGBA.g - startRGBA.g,
              b: endRGBA.b - startRGBA.b,
              a: endRGBA.a - startRGBA.a,
            });
          }
        }
      } else {
        for (n = 0; n < len; n++) {
          diff.push(end[n] - start[n]);
        }
      }
    } else if (colorAttrs.indexOf(key) !== -1) {
      start = Util.colorToRGBA(start);
      endRGBA = Util.colorToRGBA(end);
      diff = {
        r: endRGBA.r - start.r,
        g: endRGBA.g - start.g,
        b: endRGBA.b - start.b,
        a: endRGBA.a - start.a,
      };
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
    let node = this.node,
      attrs = Tween.attrs[node._id][this._id],
      key,
      attr,
      start,
      diff,
      newVal,
      n,
      len,
      end;

    for (key in attrs) {
      attr = attrs[key];
      start = attr.start;
      diff = attr.diff;
      end = attr.end;

      if (Util._isArray(start)) {
        newVal = [];
        len = Math.max(start.length, end.length);
        if (key.indexOf('fill') === 0) {
          for (n = 0; n < len; n++) {
            if (n % 2 === 0) {
              newVal.push((start[n] || 0) + diff[n] * i);
            } else {
              newVal.push(
                'rgba(' +
                  Math.round(start[n].r + diff[n].r * i) +
                  ',' +
                  Math.round(start[n].g + diff[n].g * i) +
                  ',' +
                  Math.round(start[n].b + diff[n].b * i) +
                  ',' +
                  (start[n].a + diff[n].a * i) +
                  ')'
              );
            }
          }
        } else {
          for (n = 0; n < len; n++) {
            newVal.push((start[n] || 0) + diff[n] * i);
          }
        }
      } else if (colorAttrs.indexOf(key) !== -1) {
        newVal =
          'rgba(' +
          Math.round(start.r + diff.r * i) +
          ',' +
          Math.round(start.g + diff.g * i) +
          ',' +
          Math.round(start.b + diff.b * i) +
          ',' +
          (start.a + diff.a * i) +
          ')';
      } else {
        newVal = start + diff * i;
      }

      node.setAttr(key, newVal);
    }
  }
  _addListeners() {
    // start listeners
    this.tween.onPlay = () => {
      this.anim.start();
    };
    this.tween.onReverse = () => {
      this.anim.start();
    };

    // stop listeners
    this.tween.onPause = () => {
      this.anim.stop();
    };
    this.tween.onFinish = () => {
      const node = this.node as Node;

      // after tweening  points of line we need to set original end
      const attrs = Tween.attrs[node._id][this._id];
      if (attrs.points && attrs.points.trueEnd) {
        node.setAttr('points', attrs.points.trueEnd);
      }

      if (this.onFinish) {
        this.onFinish.call(this);
      }
    };
    this.tween.onReset = () => {
      const node = this.node as any;
      // after tweening  points of line we need to set original start
      const attrs = Tween.attrs[node._id][this._id];
      if (attrs.points && attrs.points.trueStart) {
        node.points(attrs.points.trueStart);
      }

      if (this.onReset) {
        this.onReset();
      }
    };
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
   * @name Konva.Tween#seek(
   * @param {Integer} t time in seconds between 0 and the duration
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
    let nodeId = this.node._id,
      thisId = this._id,
      attrs = Tween.tweens[nodeId],
      key;

    this.pause();

    for (key in attrs) {
      delete Tween.tweens[nodeId][key];
    }

    delete Tween.attrs[nodeId][thisId];
  }
}

/**
 * Tween node properties. Shorter usage of {@link Konva.Tween} object.
 *
 * @method Konva.Node#to
 * @param {Object} [params] tween params
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
  params.node = this;
  params.onFinish = function () {
    this.destroy();
    if (onFinish) {
      onFinish();
    }
  };
  const tween = new Tween(params as any);
  tween.play();
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
