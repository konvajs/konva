(function() {
    /**
     * Transition constructor.  The transitionTo() Node method
     *  returns a reference to the transition object which you can use
     *  to stop, resume, or restart the transition
     * @constructor
     */
    Kinetic.Transition = function(node, config) {
        this.node = node;
        this.config = config;
        this.tweens = [];
        var that = this;

        // add tween for each property
        function addTween(c, attrs, obj, rootObj) {
            for(var key in c) {
                if(key !== 'duration' && key !== 'easing' && key !== 'callback') {
                    // if val is an object then traverse
                    if(Kinetic.Type._isObject(c[key])) {
                        obj[key] = {};
                        addTween(c[key], attrs[key], obj[key], rootObj);
                    }
                    else {
                        that._add(that._getTween(attrs, key, c[key], obj, rootObj));
                    }
                }
            }
        }
        var obj = {};
        addTween(config, node.attrs, obj, obj);

        var finishedTweens = 0;
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
         * start transition
         * @name start
         * @methodOf Kinetic.Transition.prototype
         */
        start: function() {
            for(var n = 0; n < this.tweens.length; n++) {
                this.tweens[n].start();
            }
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
        },
        _add: function(tween) {
            this.tweens.push(tween);
        },
        _getTween: function(attrs, prop, val, obj, rootObj) {
            var config = this.config;
            var node = this.node;
            var easing = config.easing;
            if(easing === undefined) {
                easing = 'linear';
            }

            var tween = new Kinetic.Tween(node, function(i) {
                obj[prop] = i;
                node.setAttrs(rootObj);
            }, Kinetic.Tweens[easing], attrs[prop], val, config.duration);

            return tween;
        }
    };

    /**
     * transition node to another state.  Any property that can accept a real
     *  number can be transitioned, including x, y, rotation, opacity, strokeWidth,
     *  radius, scale.x, scale.y, offset.x, offset.y, etc.
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
        if(!this.transAnim) {
            this.transAnim = new Kinetic.Animation();
        }
        /*
         * create new transition
         */
        var node = this.nodeType === 'Stage' ? this : this.getLayer();
        var that = this;
        var trans = new Kinetic.Transition(this, config);

        this.transAnim.func = function() {
            trans._onEnterFrame();
        };
        this.transAnim.node = node;

        // subscribe to onFinished for first tween
        trans.onFinished = function() {
            // remove animation
            that.transAnim.stop();

            // callback
            if(config.callback) {
                config.callback();
            }
        };
        // auto start
        trans.start();
        this.transAnim.start();
        return trans;
    };
})();
