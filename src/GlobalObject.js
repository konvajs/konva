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
        return Object.prototype.toString.call(obj) == '[object Array]';
    },
    _isObject: function(obj) {
        return obj === Object(obj);
    },
    /*
     * takes the arguments passed into a function and
     * creates a point object from it.  The arguments
     * can be a point object or an array of two elements
     */
    _getXY: function(arg) {
        if(arg.length === 1) {
            return arg[0];
        }
        else {
            return {
                x: arg[0],
                y: arg[1]
            }
        }
    },
    /*
     * val will be either a point object or an
     * array with two elements
     */
    _setXY: function(obj, key, val) {
        if(obj[key] === undefined) {
            obj[key] = {};
        }

        // val is an array
        if(Kinetic.GlobalObject._isArray(val)) {
            obj[key].x = val[0];
            obj[key].y = val[1];
        }
        // val is an object
        else if(obj[key] !== undefined) {

            if(val.x !== undefined) {
                obj[key].x = val.x;
            }
            if(val.y !== undefined) {
                obj[key].y = val.y;
            }
        }
    },
    /*
     * val will be either an object with height and
     *  width properties or an array with four elements
     *  in which the last two elements are width and height
     */
    _setSize: function(obj, key, val) {
        if(obj[key] === undefined) {
            obj[key] = {};
        }

        // val is an array
        if(Kinetic.GlobalObject._isArray(val)) {
            obj[key].width = val[2];
            obj[key].height = val[3];
        }
        // val is an object
        else if(obj[key] !== undefined) {

            if(val.width !== undefined) {
                obj[key].width = val.width;
            }
            if(val.y !== undefined) {
                obj[key].height = val.height;
            }
        }
    },
    /*
     * val will be either an array of numbers or
     *  an array of point objects
     */
    _setPoints: function(obj, key, val) {
        /*
         * if points contains an array of objects, just set
         * the attr normally
         */
        if(this._isObject(val[0])) {
            obj[key] = val;
        }
        else {
            /*
             * convert array of numbers into an array
             * of objects containing x, y
             */
            var arr = [];
            for(var n = 0; n < val.length; n += 2) {
                arr.push({
                    x: val[n],
                    y: val[n + 1]
                });
            }
            obj[key] = arr;
        }
    }
};

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
