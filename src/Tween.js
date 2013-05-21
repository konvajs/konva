(function() {
    var blacklist = {
        node: 1,
        duration: 1,
        easing: 1,
        onFinish: 1,
        yoyo: 1
    },

    PAUSED = 1,
    PLAYING = 2,
    REVERSING = 3;

    function createTween(node, key, easing, end, duration, yoyo) {
        var method = 'set' + Kinetic.Util._capitalize(key);
        return new Tween(key, function(i) {
            node[method](i);  
        }, easing, node['get' + Kinetic.Util._capitalize(key)](), end, duration * 1000, yoyo);
    }

    /**
     * Tween constructor.  Tweens enable you to animate a node between the current state and a new state.
     *  You can play, pause, reverse, seek, reset, and finish tweens.  By default, tweens are animated using
     *  a linear easing.  For more tweening options, check out {@link Kinetic.Easings}
     * @constructor
     * @memberof Kinetic
     * @example
     * // instantiate new tween which fully rotates a node in 1 second
     * var tween = new Kinetic.Tween({<br>
     *   node: node,<br>
     *   rotationDeg: 360,<br>
     *   duration: 1,<br>
     *   easing: Kinetic.Easings.EaseInOut<br>   
     * });<br><br>
     * 
     * // play tween<br>
     * tween.play();<br><br>
     *
     * // pause tween<br>
     * tween.pause();
     */
    Kinetic.Tween = function(config) {
        var that = this,
            node = config.node,
            nodeId = node._id,
            duration = config.duration || 1,
            easing = config.easing || Kinetic.Easings.Linear,
            yoyo = !!config.yoyo,
            key, tween;

        this.tweens = [];
        this.node = node;
        // event handlers
        this.onFinish = config.onFinish;

        this.anim = new Kinetic.Animation(function() {
            that._onEnterFrame();
        }, node.getLayer() || node.getLayers());

        for (key in config) {
            if (blacklist[key] === undefined) {
                tween = createTween(node, key, easing, config[key], duration, yoyo); 
                this.tweens.push(tween);
                this._addListeners(tween);
                Kinetic.Tween.add(nodeId, key, this);
            }
        }

        this.reset();
    };

    Kinetic.Tween.tweens = {};

    Kinetic.Tween.add = function(nodeId, prop, ktween) {
        var key = nodeId + '-' + prop,
            tween = Kinetic.Tween.tweens[key];

        if (tween) {
            tween._removeTween(prop);
        }
        
        Kinetic.Tween.tweens[key] = ktween;   
    };


    Kinetic.Tween.prototype = {
        _iterate: function(func) {
            var tweens = this.tweens,
                n = 0,
                tween = tweens[n];

            while(tween) {
                func(tween, n++);
                tween = tweens[n];
            }  
        },
        _isLastTween: function(tween) {
            var tweens = this.tweens,
                len = tweens.length,
                n;

            return tweens[len - 1].prop === tween.prop;
        },
        _addListeners: function(tween) {
            var that = this;

            // start listeners
            tween.onPlay = function() {
                if (that._isLastTween(tween)) {
                    that.anim.start();
                }
            };
            tween.onReverse = function() {
                if (that._isLastTween(tween)) {
                    that.anim.start();
                }
            };

            // stop listeners
            tween.onPause = function() {
                if (that._isLastTween(tween)) {
                    that.anim.stop();
                }
            };
            tween.onFinish = function() {
                if (that._isLastTween(tween) && that.onFinish) {
                    that.onFinish();
                }
            };
        },
        /**
         * play
         * @method
         * @memberof Kinetic.Tween.prototype
         */
        play: function() {
            this._iterate(function(tween) {
                tween.play();
            });
        },
        /**
         * reverse
         * @method
         * @memberof Kinetic.Tween.prototype
         */
        reverse: function() {
            this._iterate(function(tween) {
                tween.reverse();
            });
        },
        /**
         * reset
         * @method
         * @memberof Kinetic.Tween.prototype
         */
        reset: function() {
            var node = this.node;
            this._iterate(function(tween) {
                tween.reset();
            });
            (node.getLayer() || node.getLayers()).draw();
        },
        /**
         * seek
         * @method
         * @memberof Kinetic.Tween.prototype
         * @param {Integer} t time in seconds between 0 and the duration
         */
        seek: function(t) {
            var node = this.node;
            this._iterate(function(tween) {
                tween.seek(t * 1000);
            });
            (node.getLayer() || node.getLayers()).draw();
        },
        /**
         * pause
         * @method
         * @memberof Kinetic.Tween.prototype
         */
        pause: function() {
            this._iterate(function(tween) {
                tween.pause();
            });
        },
        /**
         * finish
         * @method
         * @memberof Kinetic.Tween.prototype
         */
        finish: function() {
            var node = this.node;
            this._iterate(function(tween) {
                tween.finish();
            });
            (node.getLayer() || node.getLayers()).draw();
        },
        _onEnterFrame: function() {
            this._iterate(function(tween) {
                tween.onEnterFrame();
            });
        },
        /**
         * destroy
         * @method
         * @memberof Kinetic.Tween.prototype
         */
        destroy: function() {

        },
        _removeTween: function(prop) {
            var that = this;
            this._iterate(function(tween, n) {
                if (tween.prop === prop) {
                    that.tweens.splice(n, 1);
                }
            });
        }
    };

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
            if(t > this.duration) {
                if(this.yoyo) {
                    this._time = this.duration;
                    this.reverse();
                }
                else {
                    this.finish();
                }
            }
            else if(t < 0) {
                if(this.yoyo) {
                    this._time = 0;
                    this.play();
                }
                else {
                    this.reset();
                }
            }
            else {
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
            if(t === undefined) {
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
            if(this.state === PLAYING) {
                this.setTime(t);
            }
            else if (this.state === REVERSING) {
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

    /*
    * These eases were ported from an Adobe Flash tweening library to JavaScript
    * by Xaric
    */

    /** 
     * @namespace Easings
     * @memberof Kinetic
     */
    Kinetic.Easings = {
        /**
        * back ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'BackEaseIn': function(t, b, c, d, a, p) {
            var s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        /**
        * back ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'BackEaseOut': function(t, b, c, d, a, p) {
            var s = 1.70158;
            return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        /**
        * back ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'BackEaseInOut': function(t, b, c, d, a, p) {
            var s = 1.70158;
            if((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        /**
        * elastic ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'ElasticEaseIn': function(t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if(t === 0) {
                return b;
            }
            if((t /= d) == 1) {
                return b + c;
            }
            if(!p) {
                p = d * 0.3;
            }
            if(!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        /**
        * elastic ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'ElasticEaseOut': function(t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if(t === 0) {
                return b;
            }
            if((t /= d) == 1) {
                return b + c;
            }
            if(!p) {
                p = d * 0.3;
            }
            if(!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        /**
        * elastic ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'ElasticEaseInOut': function(t, b, c, d, a, p) {
            // added s = 0
            var s = 0;
            if(t === 0) {
                return b;
            }
            if((t /= d / 2) == 2) {
                return b + c;
            }
            if(!p) {
                p = d * (0.3 * 1.5);
            }
            if(!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            }
            else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if(t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        },
        /**
        * bounce ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'BounceEaseOut': function(t, b, c, d) {
            if((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            }
            else if(t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            }
            else if(t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            }
            else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
            }
        },
        /**
        * bounce ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'BounceEaseIn': function(t, b, c, d) {
            return c - Kinetic.Easings.BounceEaseOut(d - t, 0, c, d) + b;
        },
        /**
        * bounce ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'BounceEaseInOut': function(t, b, c, d) {
            if(t < d / 2) {
                return Kinetic.Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
            }
            else {
                return Kinetic.Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        },
        /**
        * ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'EaseIn': function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        /**
        * ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'EaseOut': function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        /**
        * ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'EaseInOut': function(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        /**
        * strong ease in
        * @function
        * @memberof Kinetic.Easings
        */
        'StrongEaseIn': function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        /**
        * strong ease out
        * @function
        * @memberof Kinetic.Easings
        */
        'StrongEaseOut': function(t, b, c, d) {
            return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
        },
        /**
        * strong ease in out
        * @function
        * @memberof Kinetic.Easings
        */
        'StrongEaseInOut': function(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        /**
        * linear
        * @function
        * @memberof Kinetic.Easings
        */
        'Linear': function(t, b, c, d) {
            return c * t / d + b;
        }
    };
})();