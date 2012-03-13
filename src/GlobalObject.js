///////////////////////////////////////////////////////////////////////
//  Global Object
///////////////////////////////////////////////////////////////////////
/**
 * Kinetic Namespace
 * @namespace
 */
var Kinetic = {};
/**
 * Kinetic Global Object
 * @property {Object} GlobalObjet
 */
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
    extend: function(obj1, obj2) {
        for(var key in obj2.prototype) {
            if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    _isaCanvasAnimating: function() {
        for(var n = 0; n < this.stages.length; n++) {
            if(this.stages[n].isAnimating) {
                return true;
            }
        }
        return false;
    },
    _endTransition: function() {
        var config = this.config;
        for(var key in config) {
            if(config.hasOwnProperty(key)) {
                this.node[key] = config[key];
                this.node.getLayer().draw();
            }
        }
    },
    _linearTransition: function(frame) {
        var config = this.config;
        for(var key in config) {
            if(config.hasOwnProperty(key)) {
                this.node[key] += this.changes[key] * frame.timeDiff;
                this.node.getLayer().draw();
            }
        }
    },
    _removeTransition: function(transition) {
        var layer = transition.node.getLayer();
        var id = transition.id;

        for(var n = 0; n < layer.transitions.length; n++) {
            if(layer.transitions[n].id === id) {
                layer.transitions.splice(0, 1);
                return false;
            }
        }
    },
    _runFrames: function() {
        for(var n = 0; n < this.stages.length; n++) {
            var stage = this.stages[n];
            // run animation if available
            if(stage.isAnimating && stage.onFrameFunc !== undefined) {
                stage.onFrameFunc(this.frame);
            }

            /*
            * run transitions
            */
            // loop through layers
            var layers = stage.getChildren();
            for(var k = 0; k < layers.length; k++) {
                var layer = layers[k];
                var didTransition = false;
                // loop through transitions
                for(var i = 0; i < layer.transitions.length; i++) {
                    var transition = layer.transitions[i];
                    transition.time += this.frame.timeDiff;
                    if(transition.time >= transition.config.duration * 1000) {
                        this._endTransition.apply(transition);
                        this._removeTransition(transition);
                    } else {
                        didTransition = true;
                        this._linearTransition.apply(transition, [this.frame]);
                    }
                }

                if(didTransition) {
                    layer.draw();
                }
            }
        }
    },
    _updateFrameObject: function() {
        var date = new Date();
        var time = date.getTime();
        if(this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        } else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function() {
        if(this.isAnimating) {
            this._updateFrameObject();
            this._runFrames();
            var that = this;
            requestAnimFrame(function() {
                that._animationLoop();
            });
        }
    },
    _handleAnimation: function() {
        var that = this;
        if(!this.isAnimating && this._isaCanvasAnimating()) {
            this.isAnimating = true;
            that._animationLoop();
        } else if(this.isAnimating && !this._isaCanvasAnimating()) {
            this.isAnimating = false;
            this.frame.lastTime = 0;
        }
    }
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

})();
