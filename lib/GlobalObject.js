///////////////////////////////////////////////////////////////////////
//  Global Object
///////////////////////////////////////////////////////////////////////
var Kinetic = {};
Kinetic.GlobalObject = {
    stages: [],
    idCounter: 0,
    isAnimating: false,
    frame: {
        time: 0,
        timeDiff: 0,
        lastTime: 0
    },
    drag: {
        moving: false,
        node: undefined,
        offset: {
            x: 0,
            y: 0
        }
    },
    extend: function(obj1, obj2){
        for (var key in obj2.prototype) {
            if (obj2.prototype.hasOwnProperty(key)) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    /*
     * animation methods
     */
    _isaCanvasAnimating: function(){
        for (var n = 0; n < this.stages.length; n++) {
            if (this.stages[n].isAnimating) {
                return true;
            }
        }
        return false;
    },
    _runFrames: function(){
        for (var n = 0; n < this.stages.length; n++) {
            if (this.stages[n].isAnimating) {
                this.stages[n].onFrameFunc(this.frame);
            }
        }
    },
    _updateFrameObject: function(){
        var date = new Date();
        var time = date.getTime();
        if (this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        }
        else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function(){
        if (this.isAnimating) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function(){
                that._animationLoop();
            });
        }
    },
    _handleAnimation: function(){
        var that = this;
        if (!this.isAnimating && this._isaCanvasAnimating()) {
            this.isAnimating = true;
            that._animationLoop();
        }
        else if (this.isAnimating && !this._isaCanvasAnimating()) {
            this.isAnimating = false;
        }
    }
};

/**
 * requestAnimFrame shim
 * @param {function} callback
 */
window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
})();

