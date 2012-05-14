/*
* The Tween class was ported from an Adobe Flash Tween library
* to JavaScript by Xaric.  In the context of KineticJS, a Tween is
* an animation of a single Node property.  A Transition is a set of
* multiple tweens
*/

/**
 * Transition constructor.  KineticJS transitions contain
 * multiple Tweens
 */
Kinetic.Transition = function(node, config) {
    this.node = node;
    this.config = config;
    this.tweens = [];

    // add tween for each property
    for(var key in config) {
        if(key !== 'duration' && key !== 'easing' && key !== 'callback') {
            if(config[key].x === undefined && config[key].y === undefined && config[key].width === undefined && config[key].height === undefined) {
                this.add(this._getTween(key, config));
            }

            if(config[key].x !== undefined) {
                this.add(this._getComponentTween(key, 'x', config));
            }
            if(config[key].y !== undefined) {
                this.add(this._getComponentTween(key, 'y', config));
            }
            if(config[key].width !== undefined) {
                this.add(this._getComponentTween(key, 'width', config));
            }
            if(config[key].height !== undefined) {
                this.add(this._getComponentTween(key, 'height', config));
            }
        }
    }

    var finishedTweens = 0;
    var that = this;
    for(var n = 0; n < this.tweens.length; n++) {
        var tween = this.tweens[n];
        tween.onFinished = function() {
            finishedTweens++;
            if(finishedTweens >= that.tweens.length) {
                that.onFinished();
            }
        };
    }
};
/*
 * Transition methods
 */
Kinetic.Transition.prototype = {
    /**
     * add tween to tweens array
     * @param {Kinetic.Tween} tween
     */
    add: function(tween) {
        this.tweens.push(tween);
    },
    /**
     * start transition
     */
    start: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].start();
        }
    },
    /**
     * onEnterFrame
     */
    onEnterFrame: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].onEnterFrame();
        }
    },
    /**
     * stop transition
     */
    stop: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].stop();
        }
    },
    /**
     * resume transition
     */
    resume: function() {
        for(var n = 0; n < this.tweens.length; n++) {
            this.tweens[n].resume();
        }
    },
    _getTween: function(key) {
        var config = this.config;
        var node = this.node;
        var easing = config.easing;
        if(easing === undefined) {
            easing = 'linear';
        }

        var tween = new Kinetic.Tween(node, function(i) {
            node.attrs[key] = i;
        }, Kinetic.Tweens[easing], node.attrs[key], config[key], config.duration);

        return tween;
    },
    _getComponentTween: function(key, prop) {
        var config = this.config;
        var node = this.node;
        var easing = config.easing;
        if(easing === undefined) {
            easing = 'linear';
        }

        var tween = new Kinetic.Tween(node, function(i) {
            node.attrs[key][prop] = i;
        }, Kinetic.Tweens[easing], node.attrs[key][prop], config[key][prop], config.duration);

        return tween;
    },
};

/**
 * Tween constructor
 */
Kinetic.Tween = function(obj, propFunc, func, begin, finish, duration) {
    this._listeners = [];
    this.addListener(this);
    this.obj = obj;
    this.propFunc = propFunc;
    this.begin = begin;
    this._pos = begin;
    this.setDuration(duration);
    this.isPlaying = false;
    this._change = 0;
    this.prevTime = 0;
    this.prevPos = 0;
    this.looping = false;
    this._time = 0;
    this._position = 0;
    this._startTime = 0;
    this._finish = 0;
    this.name = '';
    this.func = func;
    this.setFinish(finish);
};
/*
 * Tween methods
 */
Kinetic.Tween.prototype = {
    setTime: function(t) {
        this.prevTime = this._time;
        if(t > this.getDuration()) {
            if(this.looping) {
                this.rewind(t - this._duration);
                this.update();
                this.broadcastMessage('onLooped', {
                    target: this,
                    type: 'onLooped'
                });
            }
            else {
                this._time = this._duration;
                this.update();
                this.stop();
                this.broadcastMessage('onFinished', {
                    target: this,
                    type: 'onFinished'
                });
            }
        }
        else if(t < 0) {
            this.rewind();
            this.update();
        }
        else {
            this._time = t;
            this.update();
        }
    },
    getTime: function() {
        return this._time;
    },
    setDuration: function(d) {
        this._duration = (d === null || d <= 0) ? 100000 : d;
    },
    getDuration: function() {
        return this._duration;
    },
    setPosition: function(p) {
        this.prevPos = this._pos;
        //var a = this.suffixe != '' ? this.suffixe : '';
        this.propFunc(p);
        //+ a;
        //this.obj(Math.round(p));
        this._pos = p;
        this.broadcastMessage('onChanged', {
            target: this,
            type: 'onChanged'
        });
    },
    getPosition: function(t) {
        if(t === undefined) {
            t = this._time;
        }
        return this.func(t, this.begin, this._change, this._duration);
    },
    setFinish: function(f) {
        this._change = f - this.begin;
    },
    getFinish: function() {
        return this.begin + this._change;
    },
    start: function() {
        this.rewind();
        this.startEnterFrame();
        this.broadcastMessage('onStarted', {
            target: this,
            type: 'onStarted'
        });
    },
    rewind: function(t) {
        this.stop();
        this._time = (t === undefined) ? 0 : t;
        this.fixTime();
        this.update();
    },
    fforward: function() {
        this._time = this._duration;
        this.fixTime();
        this.update();
    },
    update: function() {
        this.setPosition(this.getPosition(this._time));
    },
    startEnterFrame: function() {
        this.stopEnterFrame();
        this.isPlaying = true;
        this.onEnterFrame();
    },
    onEnterFrame: function() {
        if(this.isPlaying) {
            this.nextFrame();
        }
    },
    nextFrame: function() {
        this.setTime((this.getTimer() - this._startTime) / 1000);
    },
    stop: function() {
        this.stopEnterFrame();
        this.broadcastMessage('onStopped', {
            target: this,
            type: 'onStopped'
        });
    },
    stopEnterFrame: function() {
        this.isPlaying = false;
    },
    continueTo: function(finish, duration) {
        this.begin = this._pos;
        this.setFinish(finish);
        if(this._duration != undefined)
            this.setDuration(duration);
        this.start();
    },
    resume: function() {
        this.fixTime();
        this.startEnterFrame();
        this.broadcastMessage('onResumed', {
            target: this,
            type: 'onResumed'
        });
    },
    yoyo: function() {
        this.continueTo(this.begin, this._time);
    },
    addListener: function(o) {
        this.removeListener(o);
        return this._listeners.push(o);
    },
    removeListener: function(o) {
        var a = this._listeners;
        var i = a.length;
        while(i--) {
            if(a[i] == o) {
                a.splice(i, 1);
                return true;
            }
        }
        return false;
    },
    broadcastMessage: function() {
        var arr = [];
        for(var i = 0; i < arguments.length; i++) {
            arr.push(arguments[i]);
        }
        var e = arr.shift();
        var a = this._listeners;
        var l = a.length;
        for(var i = 0; i < l; i++) {
            if(a[i][e]) {
                a[i][e].apply(a[i], arr);
            }
        }
    },
    fixTime: function() {
        this._startTime = this.getTimer() - this._time * 1000;
    },
    getTimer: function() {
        return new Date().getTime() - this._time;
    }
};

Kinetic.Tweens = {
    'back-ease-in': function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    'back-ease-out': function(t, b, c, d, a, p) {
        var s = 1.70158;
        return c * (( t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    'back-ease-in-out': function(t, b, c, d, a, p) {
        var s = 1.70158;
        if((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    'elastic-ease-in': function(t, b, c, d, a, p) {
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
    'elastic-ease-out': function(t, b, c, d, a, p) {
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
    'elastic-ease-in-out': function(t, b, c, d, a, p) {
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
    'bounce-ease-out': function(t, b, c, d) {
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
    'bounce-ease-in': function(t, b, c, d) {
        return c - Kinetic.Tweens['bounce-ease-out'](d - t, 0, c, d) + b;
    },
    'bounce-ease-in-out': function(t, b, c, d) {
        if(t < d / 2) {
            return Kinetic.Tweens['bounce-ease-in'](t * 2, 0, c, d) * 0.5 + b;
        }
        else {
            return Kinetic.Tweens['bounce-ease-out'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    // duplicate
    /*
     strongEaseInOut: function(t, b, c, d) {
     return c * (t /= d) * t * t * t * t + b;
     },
     */
    'ease-in': function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    'ease-out': function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    'ease-in-out': function(t, b, c, d) {
        if((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    'strong-ease-in': function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    'strong-ease-out': function(t, b, c, d) {
        return c * (( t = t / d - 1) * t * t * t * t + 1) + b;
    },
    'strong-ease-in-out': function(t, b, c, d) {
        if((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    'linear': function(t, b, c, d) {
        return c * t / d + b;
    },
};
