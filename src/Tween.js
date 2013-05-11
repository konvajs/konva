(function() {
    var blacklist = {
        node: 1,
        duration: 1,
        ease: 1,
        onFinished: 1,
        yoyo: 1
    },

    PAUSED = 1,
    PLAYING = 2,
    REVERSING = 3;

    function createTween(node, key, ease, end, duration, yoyo) {
        return new Tween(function(i) {
            node['set' + Kinetic.Util._capitalize(key)](i);  
        }, ease, node['get' + Kinetic.Util._capitalize(key)](), end, duration * 1000, yoyo);
    }

    Kinetic.Tween = function(config) {
        var that = this,
            node = config.node,
            duration = config.duration || 1,
            ease = config.ease || Kinetic.Ease.Linear,
            yoyo = !!config.yoyo,
            key, tween;

        this.tweens = [];

        for (key in config) {
            if (blacklist[key] === undefined) {
                this.tweens.push(createTween(node, key, ease, config[key], duration, yoyo));
            }
        }

        this.anim = new Kinetic.Animation(function() {
            that.onEnterFrame();
        }, node.getLayer());

        this._listenToLastTween();
        this.reset();
    };

    Kinetic.Tween.prototype = {
        _getLastTween: function() {
            var that = this,
                tweens = this.tweens,
                lastIndex = this.tweens.length - 1;
            return lastTween = tweens[lastIndex];
                
        },
        _listenToLastTween: function() {
            var that = this,
                tweens = this.tweens,
                lastIndex = this.tweens.length - 1,
                lastTween = tweens[lastIndex],
                anim = this.anim;

            this._getLastTween().onPause = function() {
                anim.stop(); 
            }
        },
        _run: function(method, param) {
            var tweens = this.tweens,
                len = tweens.length,
                n;

            for (n=0; n<len; n++) {
                tweens[n][method](param);
            }
        },
        play: function() {
            this.anim.start();
            this._run('play');
        },
        reverse: function() {
            this.anim.start();
            this._run('reverse');
        },
        reset: function() {
            this._run('reset');
        },
        goto: function(t) {
            this._run('goto', t * 1000);
        },
        pause: function() {
            console.log('pause stop')
            this._run('pause');
        },
        onEnterFrame: function() {
            this._run('onEnterFrame');
        }
    };

    var Tween = function(propFunc, func, begin, finish, duration, yoyo) {
        this._listeners = [];
        this.addListener(this);
        this.propFunc = propFunc;
        this.begin = begin;
        this._pos = begin;
        this.duration = duration;
        this.state = PAUSED;
        this._change = 0;
        this.prevPos = 0;
        this.yoyo = yoyo;
        this._time = 0;
        this._position = 0;
        this._startTime = 0;
        this._finish = 0;
        this.func = func;
        this._change = finish - this.begin;
    };
    /*
     * Tween methods
     */
    Tween.prototype = {
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
            this.broadcastMessage('onChange', {
                target: this,
                type: 'onChange'
            });
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
            this.broadcastMessage('onPlay', {
                target: this,
                type: 'onPlay'
            });
        },
        reverse: function() {
            this.state = REVERSING;
            this._time = this.duration - this._time;
            this._startTime = this.getTimer() - this._time;
            this.onEnterFrame();
            this.broadcastMessage('onReverse', {
                target: this,
                type: 'onReverse'
            });
        },
        goto: function(t) {
            this._time = t;
            this.update();
        },
        reset: function() {
            this.pause();
            this._time = 0;
            this.update();
        },
        finish: function() {
            this.pause();
            this._time = this.duration;
            this.update();
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
            this.broadcastMessage('onPause', {
                target: this,
                type: 'onPause'
            });
        },
        addListener: function(o) {
            this.removeListener(o);
            return this._listeners.push(o);
        },
        removeListener: function(o) {
            var a = this._listeners,
                i = a.length;
            while(i--) {
                if(a[i] === o) {
                    a.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
        broadcastMessage: function() {
            var arr = [],
                len = arguments.length,
                i, e, a, l;

            for(i = 0; i < len; i++) {
                arr.push(arguments[i]);
            }
            e = arr.shift();
            a = this._listeners;
            l = a.length;
            for(i = 0; i < l; i++) {
                if(a[i][e]) {
                    a[i][e].apply(a[i], arr);
                }
            }
        },
        getTimer: function() {
            return new Date().getTime();
        }
    };

    /*
    * These easings were ported from an Adobe Flash tweening library to JavaScript
    * by Xaric
    */
    Kinetic.Easings = {
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