(function() {
    function createTween(obj, key, easingFunc, start, end, duration) {
        var tween = new Kinetic.Tween(function(i) {
           obj[key] = i;
        }, easingFunc, start, end, duration);
        return tween;
    }
    /**
     * Transition constructor.  The transitionTo() Node method
     *  returns a reference to the transition object which you can use
     *  to stop, resume, or restart the transition
     * @constructor
     */
    Kinetic.Transition = function(node, config, anim) {
        var that = this,
            easing = config.easing || 'linear',
            easingFunc = Kinetic.Tweens[easing],
            duration = config.duration || 0,
            configVal = null,
            lastTween = null;

        this.tweens = [];
        this.attrs = {};
        this.node = node;

        for (var key in config) {
            if(key !== 'duration' && key !== 'easing' && key !== 'callback') {
                configVal = config[key];   
                that.tweens.push(createTween(this.attrs, key, easingFunc, node.getAttr(key), configVal, duration));
            }
        }

        lastTween = this.tweens[this.tweens.length - 1];

        // map first last event to transition event
        lastTween.onStarted = function() {

        };
        lastTween.onStopped = function() {
            anim.stop();
        };
        lastTween.onResumed = function() {
            anim.start();
        };
        lastTween.onLooped = function() {

        };
        lastTween.onChanged = function() {

        };
        lastTween.onFinished = function() {
            var newAttrs = {};
            // create new attr obj
            for(var key in config) {
                if(key !== 'duration' && key !== 'easing' && key !== 'callback') {
                    newAttrs[key] = config[key];
                }
            }
            anim.stop();
            node.setAttrs(newAttrs);
            if(config.callback) {
                config.callback.call(node);
            }
        };
    };
    /*
     * Transition methods
     */
    Kinetic.Transition.prototype = {
        _mapTweens: function(method) {
            var tweens = this.tweens,
                len = tweens.length,
                n;

            for(n = 0; n < len; n++) {
                tweens[n][method]();
            }
        },
        /**
         * start transition
         * @name start
         * @methodOf Kinetic.Transition.prototype
         */
        start: function() {
            this._mapTweens('start');
        },
        /**
         * stop transition
         * @name stop
         * @methodOf Kinetic.Transition.prototype
         */
        stop: function() {
            for(var n = 0; n < this.tweens.length; n++) {
                this.tweens[n].stop();
            }
        },
        /**
         * resume transition
         * @name resume
         * @methodOf Kinetic.Transition.prototype
         */
        resume: function() {
            for(var n = 0; n < this.tweens.length; n++) {
                this.tweens[n].resume();
            }
        },
        _onEnterFrame: function() {
            for(var n = 0; n < this.tweens.length; n++) {
                this.tweens[n].onEnterFrame();
            }
            // now that the temp attrs object has been updated,
            // set the node attrs
            this.node.setAttrs(this.attrs);
        },
        _add: function(tween) {
            this.tweens.push(tween);
        }
    };

    /**
     * transition node to another state.  Any property that can accept a real
     *  number or point object can be transitioned, including x, y, rotation, opacity, strokeWidth,
     *  radius, scale, offset, scaleX, and scaleY
     * @name transitionTo
     * @methodOf Kinetic.Node.prototype
     * @param {Object} config
     * @config {Number} duration duration that the transition runs in seconds
     * @config {String} [easing] easing function.  can be linear, ease-in, ease-out, ease-in-out,
     *  back-ease-in, back-ease-out, back-ease-in-out, elastic-ease-in, elastic-ease-out,
     *  elastic-ease-in-out, bounce-ease-out, bounce-ease-in, bounce-ease-in-out,
     *  strong-ease-in, strong-ease-out, or strong-ease-in-out
     *  linear is the default
     * @config {Function} [callback] callback function to be executed when
     *  transition completes
     */
    Kinetic.Node.prototype.transitionTo = function(config) {
        var that = this, 
            anim = new Kinetic.Animation(),
            trans = new Kinetic.Transition(this, config, anim);

        anim.func = function() {
            trans._onEnterFrame();
        };
        anim.node = this.nodeType === 'Stage' ? this : this.getLayer();

        // auto start
        trans.start();
        anim.start();
        return trans;
    };
})();
