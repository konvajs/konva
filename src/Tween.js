(function() {
  'use strict';
  var blacklist = {
      node: 1,
      duration: 1,
      easing: 1,
      onFinish: 1,
      yoyo: 1
    },
    PAUSED = 1,
    PLAYING = 2,
    REVERSING = 3,
    idCounter = 0,
    colorAttrs = ['fill', 'stroke', 'shadowColor'];

  var Tween = function(prop, propFunc, func, begin, finish, duration, yoyo) {
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
  };
  /*
     * Tween methods
     */
  Tween.prototype = {
    fire: function(str) {
      var handler = this[str];
      if (handler) {
        handler();
      }
    },
    setTime: function(t) {
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
    },
    getTime: function() {
      return this._time;
    },
    setPosition: function(p) {
      this.prevPos = this._pos;
      this.propFunc(p);
      this._pos = p;
    },
    getPosition: function(t) {
      if (t === undefined) {
        t = this._time;
      }
      return this.func(t, this.begin, this._change, this.duration);
    },
    play: function() {
      this.state = PLAYING;
      this._startTime = this.getTimer() - this._time;
      this.onEnterFrame();
      this.fire('onPlay');
    },
    reverse: function() {
      this.state = REVERSING;
      this._time = this.duration - this._time;
      this._startTime = this.getTimer() - this._time;
      this.onEnterFrame();
      this.fire('onReverse');
    },
    seek: function(t) {
      this.pause();
      this._time = t;
      this.update();
      this.fire('onSeek');
    },
    reset: function() {
      this.pause();
      this._time = 0;
      this.update();
      this.fire('onReset');
    },
    finish: function() {
      this.pause();
      this._time = this.duration;
      this.update();
      this.fire('onFinish');
    },
    update: function() {
      this.setPosition(this.getPosition(this._time));
    },
    onEnterFrame: function() {
      var t = this.getTimer() - this._startTime;
      if (this.state === PLAYING) {
        this.setTime(t);
      } else if (this.state === REVERSING) {
        this.setTime(this.duration - t);
      }
    },
    pause: function() {
      this.state = PAUSED;
      this.fire('onPause');
    },
    getTimer: function() {
      return new Date().getTime();
    }
  };

  /**
   * Tween constructor.  Tweens enable you to animate a node between the current state and a new state.
   *  You can play, pause, reverse, seek, reset, and finish tweens.  By default, tweens are animated using
   *  a linear easing.  For more tweening options, check out {@link Konva.Easings}
   * @constructor
   * @memberof Konva
   * @example
   * // instantiate new tween which fully rotates a node in 1 second
   * var tween = new Konva.Tween({
   *   node: node,
   *   rotationDeg: 360,
   *   duration: 1,
   *   easing: Konva.Easings.EaseInOut
   * });
   *
   * // play tween
   * tween.play();
   *
   * // pause tween
   * tween.pause();
   */
  Konva.Tween = function(config) {
    var that = this,
      node = config.node,
      nodeId = node._id,
      duration,
      easing = config.easing || Konva.Easings.Linear,
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

    var layers =
      node.getLayer() ||
      (node instanceof Konva.Stage ? node.getLayers() : null);
    if (!layers) {
      Konva.Util.error(
        'Tween constructor have `node` that is not in a layer. Please add node into layer first.'
      );
    }
    this.anim = new Konva.Animation(function() {
      that.tween.onEnterFrame();
    }, layers);

    this.tween = new Tween(
      key,
      function(i) {
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
    if (!Konva.Tween.attrs[nodeId]) {
      Konva.Tween.attrs[nodeId] = {};
    }
    if (!Konva.Tween.attrs[nodeId][this._id]) {
      Konva.Tween.attrs[nodeId][this._id] = {};
    }
    // init tweens map
    if (!Konva.Tween.tweens[nodeId]) {
      Konva.Tween.tweens[nodeId] = {};
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
  };

  // start/diff object = attrs.nodeId.tweenId.attr
  Konva.Tween.attrs = {};
  // tweenId = tweens.nodeId.attr
  Konva.Tween.tweens = {};

  Konva.Tween.prototype = {
    _addAttr: function(key, end) {
      var node = this.node,
        nodeId = node._id,
        start,
        diff,
        tweenId,
        n,
        len,
        trueEnd,
        trueStart;

      // remove conflict from tween map if it exists
      tweenId = Konva.Tween.tweens[nodeId][key];

      if (tweenId) {
        delete Konva.Tween.attrs[nodeId][tweenId][key];
      }

      // add to tween map
      start = node.getAttr(key);

      if (Konva.Util._isArray(end)) {
        diff = [];
        len = Math.max(end.length, start.length);

        if (key === 'points' && end.length !== start.length) {
          // before tweening points we need to make sure that start.length === end.length
          // Konva.Util._prepareArrayForTween thinking that end.length > start.length

          if (end.length > start.length) {
            // so in this case we will increase number of starting points
            trueStart = start;
            start = Konva.Util._prepareArrayForTween(start, end, node.closed());
          } else {
            // in this case we will increase number of eding points
            trueEnd = end;
            end = Konva.Util._prepareArrayForTween(end, start, node.closed());
          }
        }

        for (n = 0; n < len; n++) {
          diff.push(end[n] - start[n]);
        }
      } else if (colorAttrs.indexOf(key) !== -1) {
        start = Konva.Util.colorToRGBA(start);
        var endRGBA = Konva.Util.colorToRGBA(end);
        diff = {
          r: endRGBA.r - start.r,
          g: endRGBA.g - start.g,
          b: endRGBA.b - start.b,
          a: endRGBA.a - start.a
        };
      } else {
        diff = end - start;
      }

      Konva.Tween.attrs[nodeId][this._id][key] = {
        start: start,
        diff: diff,
        end: end,
        trueEnd: trueEnd,
        trueStart: trueStart
      };
      Konva.Tween.tweens[nodeId][key] = this._id;
    },
    _tweenFunc: function(i) {
      var node = this.node,
        attrs = Konva.Tween.attrs[node._id][this._id],
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

        if (Konva.Util._isArray(start)) {
          newVal = [];
          len = Math.max(start.length, end.length);
          for (n = 0; n < len; n++) {
            newVal.push((start[n] || 0) + diff[n] * i);
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
    },
    _addListeners: function() {
      var that = this;

      // start listeners
      this.tween.onPlay = function() {
        that.anim.start();
      };
      this.tween.onReverse = function() {
        that.anim.start();
      };

      // stop listeners
      this.tween.onPause = function() {
        that.anim.stop();
      };
      this.tween.onFinish = function() {
        var node = that.node;

        // after tweening  points of line we need to set original end
        var attrs = Konva.Tween.attrs[node._id][that._id];
        if (attrs.points && attrs.points.trueEnd) {
          node.points(attrs.points.trueEnd);
        }

        if (that.onFinish) {
          that.onFinish.call(that);
        }
      };
      this.tween.onReset = function() {
        var node = that.node;
        // after tweening  points of line we need to set original start
        var attrs = Konva.Tween.attrs[node._id][that._id];
        if (attrs.points && attrs.points.trueStart) {
          node.points(attrs.points.trueStart);
        }

        if (that.onReset) {
          that.onReset();
        }
      };
    },
    /**
     * play
     * @method
     * @memberof Konva.Tween.prototype
     * @returns {Tween}
     */
    play: function() {
      this.tween.play();
      return this;
    },
    /**
     * reverse
     * @method
     * @memberof Konva.Tween.prototype
     * @returns {Tween}
     */
    reverse: function() {
      this.tween.reverse();
      return this;
    },
    /**
     * reset
     * @method
     * @memberof Konva.Tween.prototype
     * @returns {Tween}
     */
    reset: function() {
      this.tween.reset();
      return this;
    },
    /**
     * seek
     * @method
     * @memberof Konva.Tween.prototype
     * @param {Integer} t time in seconds between 0 and the duration
     * @returns {Tween}
     */
    seek: function(t) {
      this.tween.seek(t * 1000);
      return this;
    },
    /**
     * pause
     * @method
     * @memberof Konva.Tween.prototype
     * @returns {Tween}
     */
    pause: function() {
      this.tween.pause();
      return this;
    },
    /**
     * finish
     * @method
     * @memberof Konva.Tween.prototype
     * @returns {Tween}
     */
    finish: function() {
      this.tween.finish();
      return this;
    },
    /**
     * destroy
     * @method
     * @memberof Konva.Tween.prototype
     */
    destroy: function() {
      var nodeId = this.node._id,
        thisId = this._id,
        attrs = Konva.Tween.tweens[nodeId],
        key;

      this.pause();

      for (key in attrs) {
        delete Konva.Tween.tweens[nodeId][key];
      }

      delete Konva.Tween.attrs[nodeId][thisId];
    }
  };

  /**
   * Tween node properties. Shorter usage of {@link Konva.Tween} object.
   *
   * @method Konva.Node#to
   * @memberof Konva.Node
   * @param {Object} [params] tween params
   * @example
   *
   * circle.to({
   *  x : 50,
   *  duration : 0.5
   * });
   */
  Konva.Node.prototype.to = function(params) {
    var onFinish = params.onFinish;
    params.node = this;
    params.onFinish = function() {
      this.destroy();
      if (onFinish) {
        onFinish();
      }
    };
    var tween = new Konva.Tween(params);
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
  Konva.Easings = {
    /**
     * back ease in
     * @function
     * @memberof Konva.Easings
     */
    BackEaseIn: function(t, b, c, d) {
      var s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    /**
     * back ease out
     * @function
     * @memberof Konva.Easings
     */
    BackEaseOut: function(t, b, c, d) {
      var s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    /**
     * back ease in out
     * @function
     * @memberof Konva.Easings
     */
    BackEaseInOut: function(t, b, c, d) {
      var s = 1.70158;
      if ((t /= d / 2) < 1) {
        return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
      }
      return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    /**
     * elastic ease in
     * @function
     * @memberof Konva.Easings
     */
    ElasticEaseIn: function(t, b, c, d, a, p) {
      // added s = 0
      var s = 0;
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
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return (
        -(
          a *
          Math.pow(2, 10 * (t -= 1)) *
          Math.sin((t * d - s) * (2 * Math.PI) / p)
        ) + b
      );
    },
    /**
     * elastic ease out
     * @function
     * @memberof Konva.Easings
     */
    ElasticEaseOut: function(t, b, c, d, a, p) {
      // added s = 0
      var s = 0;
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
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      return (
        a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) +
        c +
        b
      );
    },
    /**
     * elastic ease in out
     * @function
     * @memberof Konva.Easings
     */
    ElasticEaseInOut: function(t, b, c, d, a, p) {
      // added s = 0
      var s = 0;
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
        s = p / (2 * Math.PI) * Math.asin(c / a);
      }
      if (t < 1) {
        return (
          -0.5 *
            (a *
              Math.pow(2, 10 * (t -= 1)) *
              Math.sin((t * d - s) * (2 * Math.PI) / p)) +
          b
        );
      }
      return (
        a *
          Math.pow(2, -10 * (t -= 1)) *
          Math.sin((t * d - s) * (2 * Math.PI) / p) *
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
    BounceEaseOut: function(t, b, c, d) {
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
    BounceEaseIn: function(t, b, c, d) {
      return c - Konva.Easings.BounceEaseOut(d - t, 0, c, d) + b;
    },
    /**
     * bounce ease in out
     * @function
     * @memberof Konva.Easings
     */
    BounceEaseInOut: function(t, b, c, d) {
      if (t < d / 2) {
        return Konva.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
      } else {
        return (
          Konva.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
        );
      }
    },
    /**
     * ease in
     * @function
     * @memberof Konva.Easings
     */
    EaseIn: function(t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    /**
     * ease out
     * @function
     * @memberof Konva.Easings
     */
    EaseOut: function(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    /**
     * ease in out
     * @function
     * @memberof Konva.Easings
     */
    EaseInOut: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t + b;
      }
      return -c / 2 * (--t * (t - 2) - 1) + b;
    },
    /**
     * strong ease in
     * @function
     * @memberof Konva.Easings
     */
    StrongEaseIn: function(t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    /**
     * strong ease out
     * @function
     * @memberof Konva.Easings
     */
    StrongEaseOut: function(t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    /**
     * strong ease in out
     * @function
     * @memberof Konva.Easings
     */
    StrongEaseInOut: function(t, b, c, d) {
      if ((t /= d / 2) < 1) {
        return c / 2 * t * t * t * t * t + b;
      }
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    /**
     * linear
     * @function
     * @memberof Konva.Easings
     */
    Linear: function(t, b, c, d) {
      return c * t / d + b;
    }
  };
})();
