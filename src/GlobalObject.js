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
    tempNodes: [],
    animations: [],
    animIdCounter: 0,
    animRunning: false,
    dragTimeInterval: 0,
    maxDragTimeInterval: 20,
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
        },
        lastDrawTime: 0
    },
    extend: function(obj1, obj2) {
        for(var key in obj2.prototype) {
            if(obj2.prototype.hasOwnProperty(key) && obj1.prototype[key] === undefined) {
                obj1.prototype[key] = obj2.prototype[key];
            }
        }
    },
    _pullNodes: function(stage) {
        var tempNodes = this.tempNodes;
        for(var n = 0; n < tempNodes.length; n++) {
            var node = tempNodes[n];
            if(node.getStage() !== undefined && node.getStage()._id === stage._id) {
                stage._addId(node);
                stage._addName(node);
                this.tempNodes.splice(n, 1);
                n -= 1;
            }
        }
    },
    /*
     * animation support
     */
    _addAnimation: function(anim) {
        anim.id = this.animIdCounter++;
        this.animations.push(anim);
    },
    _removeAnimation: function(anim) {
        var id = anim.id;
        var animations = this.animations;
        for(var n = 0; n < animations.length; n++) {
            if(animations[n].id === id) {
                this.animations.splice(n, 1);
                return false;
            }
        }
    },
    _runFrames: function() {
        var nodes = {};
        for(var n = 0; n < this.animations.length; n++) {
            var anim = this.animations[n];
            if(anim.node && anim.node._id !== undefined) {
                nodes[anim.node._id] = anim.node;
            }
            anim.func(this.frame);
        }

        for(var key in nodes) {
            nodes[key].draw();
        }
    },
    _updateFrameObject: function() {
        var date = new Date();
        var time = date.getTime();
        if(this.frame.lastTime === 0) {
            this.frame.lastTime = time;
        }
        else {
            this.frame.timeDiff = time - this.frame.lastTime;
            this.frame.lastTime = time;
            this.frame.time += this.frame.timeDiff;
        }
    },
    _animationLoop: function() {
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
    },
    _handleAnimation: function() {
        var that = this;
        if(!this.animRunning) {
            this.animRunning = true;
            that._animationLoop();
        }
        else {
            this.frame.lastTime = 0;
        }
    },
    /*
     * utilities
     */
    _isElement: function(obj) {
        return !!(obj && obj.nodeType == 1);
    },
    _isFunction: function(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isArray: function(obj) {
        return obj.length !== undefined;
        //return Object.prototype.toString.call(obj) == '[object Array]';
    },
    _isObject: function(obj) {
        return obj === Object(obj);
    },
    /*
     * The argument can be array of integers, an object, an array of one element
     * which is an array of integers, or an array of one element of an object
     */
    _getXY: function(arg) {
    	
        var go = Kinetic.GlobalObject;

        if(arg === undefined) {
            return {
                x: 0,
                y: 0
            };
        }
        if(go._isArray(arg)) {
            if(arg.length === 1) {
                var val = arg[0];

                if(go._isArray(val)) {
                    return {
                        x: val[0],
                        y: val[1]
                    };
                }
                else {
                    return val;
                }
            }
            else {
                return {
                    x: arg[0],
                    y: arg[1]
                };
            }
        }
        else {
            return arg;
        }
    },
    /*
     * The argument can be array of integers, an object, an array of one element
     * which is an array of two integers, an array of one element
     * which is an array of four integers, or an array of one element
     * of an object
     */
    _getSize: function(arg) {
        var go = Kinetic.GlobalObject;

        if(arg === undefined) {
            return {
                width: 0,
                height: 0
            };
        }

        if(go._isArray(arg)) {
            if(arg.length === 1) {
                var val = arg[0];

                if(go._isArray(val)) {
                    if(val.length === 2) {
                        return {
                            width: val[0],
                            height: val[1]
                        };
                    }
                    // should be an array of 4 elements
                    else {
                        return {
                            width: val[2],
                            height: val[3]
                        };
                    }
                }
                else {
                    return val;
                }
            }
            else if(arg.length === 2) {
                return {
                    width: arg[0],
                    height: arg[1]
                };
            }
            // array length should be 4
            else {
                return {
                    width: arg[2],
                    height: arg[3]
                };
            }
        }
        else {
            return arg;
        }
    },
    /*
     * arg will be an array of numbers or
     *  an array of point objects
     */
    _getPoints: function(arg) {
        if(arg === undefined) {
            return [];
        }

        // an array of objects
        if(this._isObject(arg[0])) {
            return arg;
        }
        // an array of integers
        else {
            /*
             * convert array of numbers into an array
             * of objects containing x, y
             */
            var arr = [];
            for(var n = 0; n < arg.length; n += 2) {
                arr.push({
                    x: arg[n],
                    y: arg[n + 1]
                });
            }

            return arr;
        }
    }
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
