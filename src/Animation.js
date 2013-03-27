(function() {
    /**
     * Stage constructor.  A stage is used to contain multiple layers and handle
     * animations
     * @constructor
     * @param {Function} func function executed on each animation frame
     * @param {Kinetic.Node} [node] node to be redrawn.&nbsp; Can be a layer or the stage.  Not specifying a node will result in no redraw.
     */
    Kinetic.Animation = function(func, node) {
        this.func = func;
        this.node = node;
        this.id = Kinetic.Animation.animIdCounter++;
        this.frame = {
            time: 0,
            timeDiff: 0,
            lastTime: new Date().getTime()
        };
    };
    /*
     * Animation methods
     */
    Kinetic.Animation.prototype = {
        /**
         * determine if animation is running or not.  returns true or false
         * @name isRunning
         * @methodOf Kinetic.Animation.prototype
         */
        isRunning: function() {
            var a = Kinetic.Animation, animations = a.animations;
            for(var n = 0; n < animations.length; n++) {
                if(animations[n].id === this.id) {
                    return true;
                }
            }
            return false;
        },
        /**
         * start animation
         * @name start
         * @methodOf Kinetic.Animation.prototype
         */
        start: function() {
            this.stop();
            this.frame.timeDiff = 0;
            this.frame.lastTime = new Date().getTime();
            Kinetic.Animation._addAnimation(this);
        },
        /**
         * stop animation
         * @name stop
         * @methodOf Kinetic.Animation.prototype
         */
        stop: function() {
            Kinetic.Animation._removeAnimation(this);
        },
        _updateFrameObject: function(time) {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
            this.frame.frameRate = 1000 / this.frame.timeDiff;
        }
    };
    Kinetic.Animation.animations = [];
    Kinetic.Animation.animIdCounter = 0;
    Kinetic.Animation.animRunning = false;

    Kinetic.Animation.fixedRequestAnimFrame = function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

    Kinetic.Animation._addAnimation = function(anim) {
        this.animations.push(anim);
        this._handleAnimation();
    };
    Kinetic.Animation._removeAnimation = function(anim) {
        var id = anim.id, animations = this.animations, len = animations.length;
        for(var n = 0; n < len; n++) {
            if(animations[n].id === id) {
                this.animations.splice(n, 1);
                break;
            }
        }
    };

    Kinetic.Animation._runFrames = function() {
        var nodes = {}, animations = this.animations;
        /*
         * loop through all animations and execute animation
         *  function.  if the animation object has specified node,
         *  we can add the node to the nodes hash to eliminate
         *  drawing the same node multiple times.  The node property
         *  can be the stage itself or a layer
         */
        /*
         * WARNING: don't cache animations.length because it could change while
         * the for loop is running, causing a JS error
         */
        for(var n = 0; n < animations.length; n++) {
            var anim = animations[n], node = anim.node, func = anim.func;
            anim._updateFrameObject(new Date().getTime());
            if(node && node._id !== undefined) {
                nodes[node._id] = node;
            }
            // if animation object has a function, execute it
            if(func) {
                func(anim.frame);
            }
        }

        for(var key in nodes) {
            nodes[key].draw();
        }
    };
    Kinetic.Animation._animationLoop = function() {
        var that = this;
        if(this.animations.length > 0) {
            this._runFrames();
            Kinetic.Animation.requestAnimFrame(function() {
                that._animationLoop();
            });
        }
        else {
            this.animRunning = false;
        }
    };
    Kinetic.Animation._handleAnimation = function() {
        var that = this;
        if(!this.animRunning) {
            this.animRunning = true;
            that._animationLoop();
        }
    };
    RAF = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || Kinetic.Animation.fixedRequestAnimFrame;
    })();

    Kinetic.Animation.requestAnimFrame = function(callback) {
        var raf = Kinetic.DD && Kinetic.DD.isDragging ? this.fixedRequestAnimFrame : RAF;
        raf(callback);
    };
    
    var moveTo = Kinetic.Node.prototype.moveTo;
    Kinetic.Node.prototype.moveTo = function(container) {
    	moveTo.call(this, container);
    };

})();
