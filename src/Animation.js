///////////////////////////////////////////////////////////////////////
//  Animation
///////////////////////////////////////////////////////////////////////
Kinetic.Animation = function(config) {
    if(!config) {
        config = {};
    }
    for(var key in config) {
        this[key] = config[key];
    }
    this.id = Kinetic.Animation.animIdCounter++;
};
Kinetic.Animation.animations = [];
Kinetic.Animation.animIdCounter = 0;
Kinetic.Animation.animRunning = false;
Kinetic.Animation.frame = {
    time: 0,
    timeDiff: 0,
    lastTime: new Date().getTime()
};
Kinetic.Animation._addAnimation = function(anim) {
    this.animations.push(anim);
};
Kinetic.Animation._removeAnimation = function(anim) {
    var id = anim.id;
    var animations = this.animations;
    for(var n = 0; n < animations.length; n++) {
        if(animations[n].id === id) {
            this.animations.splice(n, 1);
            return false;
        }
    }
};
Kinetic.Animation._runFrames = function() {
    var nodes = {};
    /*
     * loop through all animations and execute animation
     *  function.  if the animation object has specified node,
     *  we can add the node to the nodes hash to eliminate
     *  drawing the same node multiple times.  The node property
     *  can be the stage itself or a layer
     */
    for(var n = 0; n < this.animations.length; n++) {
        var anim = this.animations[n];
        if(anim.node && anim.node._id !== undefined) {
            nodes[anim.node._id] = anim.node;
        }
        // if animation object has a function, execute it
        if(anim.func) {
            anim.func(this.frame);
        }
    }

    for(var key in nodes) {
        nodes[key].draw();
    }
};
Kinetic.Animation._updateFrameObject = function() {
    var time = new Date().getTime();
    this.frame.timeDiff = time - this.frame.lastTime;
    this.frame.lastTime = time;
    this.frame.time += this.frame.timeDiff;
};
Kinetic.Animation._animationLoop = function() {
    if(this.animations.length > 0) {
        this._updateFrameObject();
        this._runFrames();
        var that = this;
        requestAnimFrame(function() {
            that._animationLoop();
        });
    }
    else {
        this.animRunning = false;
        this.frame.lastTime = 0;
    }
};
Kinetic.Animation._handleAnimation = function() {
    var that = this;
    if(!this.animRunning) {
        this.animRunning = true;
        that._animationLoop();
    }
    else {
        this.frame.lastTime = 0;
    }
};
requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
