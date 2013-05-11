(function() {
    var blacklist = {
        node: 1,
        duration: 1,
        ease: 1,
        onFinish: 1,
        yoyo: 1
    },

    PAUSED = 1,
    PLAYING = 2,
    REVERSING = 3;

    function createTween(node, key, ease, end, duration, yoyo) {
        var method = 'set' + Kinetic.Util._capitalize(key);
        return new Tween(key, function(i) {
            node[method](i);  
        }, ease, node['get' + Kinetic.Util._capitalize(key)](), end, duration * 1000, yoyo);
    }

    Kinetic.Tween = function(config) {
        var that = this,
            node = config.node,
            nodeId = node._id,
            duration = config.duration || 1,
            ease = config.ease || Kinetic.Ease.Linear,
            yoyo = !!config.yoyo,
            key, tween;

        this.tweens = [];
        this.node = node;
        // event handlers
        this.onFinish = config.onFinish;

        this.anim = new Kinetic.Animation(function() {
            that.onEnterFrame();
        }, node.getLayer());

        for (key in config) {
            if (blacklist[key] === undefined) {
                tween = createTween(node, key, ease, config[key], duration, yoyo); 
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
        _addListeners: function(tween) {
            var that = this;

            // start listeners
            tween.onPlay = function() {
                that.anim.start();
            };
            tween.onReverse = function() {
                that.anim.start();
            };

            // stop listeners
            tween.onPause = function() {
                that.anim.stop();
            };
            tween.onFinish = function() {
                if (that.onFinish) {
                    that.onFinish();
                }
            };
        },
        play: function() {
            this._iterate(function(tween) {
                tween.play();
            });
        },
        reverse: function() {
            this._iterate(function(tween) {
                tween.reverse();
            });
        },
        reset: function() {
            this._iterate(function(tween) {
                tween.reset();
            });
        },
        seek: function(t) {
            this._iterate(function(tween) {
                tween.seek(t * 1000);
            });
        },
        pause: function() {
            this._iterate(function(tween) {
                tween.pause();
            });
        },
        finish: function() {
            this._iterate(function(tween) {
                tween.finish();
            });
        },
        onEnterFrame: function() {
            this._iterate(function(tween) {
                tween.onEnterFrame();
            });
        },
        destroy: function() {

        },
        _removeTween: function(prop) {
            console.log('remove ' + prop)
            var that = this;
            this._iterate(function(tween, n) {
                if (tween.prop === prop) {
                    console.log('removed')
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
    Kinetic.Eases = {
        'BackEaseIn': function(t, b, c, d, a, p) {
            var s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        'BackEaseOut': function(t, b, c, d, a, p) {
            var s = 1.70158;
            return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        'BackEaseInOut': function(t, b, c, d, a, p) {
            var s = 1.70158;
            if((t /= d / 2) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
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
        'BounceEaseIn': function(t, b, c, d) {
            return c - Kinetic.Ease['bounce-ease-out'](d - t, 0, c, d) + b;
        },
        'BounceEaseInOut': function(t, b, c, d) {
            if(t < d / 2) {
                return Kinetic.Ease['bounce-ease-in'](t * 2, 0, c, d) * 0.5 + b;
            }
            else {
                return Kinetic.Ease['bounce-ease-out'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        },
        'EaseIn': function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        'EaseOut': function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        'EaseInOut': function(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        'StrongEaseIn': function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        'StrongEaseOut': function(t, b, c, d) {
            return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
        },
        'StrongEaseIn': function(t, b, c, d) {
            if((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t * t + b;
            }
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        'Linear': function(t, b, c, d) {
            return c * t / d + b;
        }
    };
})();