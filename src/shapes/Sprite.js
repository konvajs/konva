///////////////////////////////////////////////////////////////////////
//  Sprite
///////////////////////////////////////////////////////////////////////
/**
 * Sprite constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Sprite = function(config) {
    this.setDefaultAttrs({
        index: 0,
        frameRate: 17
    });

    config.drawFunc = function() {
        if(this.attrs.image !== undefined) {
            var context = this.getContext();
            var anim = this.attrs.animation;
            var index = this.attrs.index;
            var f = this.attrs.animations[anim][index];

            context.beginPath();
            context.rect(0, 0, f.width, f.height);
            context.closePath();
            
            this.drawImage(this.attrs.image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
        }
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Sprite methods
 */
Kinetic.Sprite.prototype = {
    /**
     * start sprite animation
     */
    start: function() {
        var that = this;
        var layer = this.getLayer();
        this.interval = setInterval(function() {
            that._updateIndex();
            layer.draw();
            if(that.afterFrameFunc && that.attrs.index === that.afterFrameIndex) {
                that.afterFrameFunc();
            }
        }, 1000 / this.attrs.frameRate)
    },
    /**
     * stop sprite animation
     */
    stop: function() {
        clearInterval(this.interval);
    },
    /**
     * set after frame event handler
     * @param {Integer} index frame index
     * @param {Function} func function to be executed after frame has been drawn
     */
    afterFrame: function(index, func) {
        this.afterFrameIndex = index;
        this.afterFrameFunc = func;
    },
    /**
     * set animation key
     * @param {String} anim animation key
     */
    setAnimation: function(anim) {
        this.attrs.animation = anim;
    },
    /**
     * set animations obect
     * @param {Object} animations
     */
    setAnimations: function(animations) {
        this.attrs.animations = animations;
    },
    /**
     * get animations object
     */
    getAnimations: function() {
        return this.attrs.animations;
    },
    /**
     * get animation key
     */
    getAnimation: function() {
        return this.attrs.animation;
    },
    /**
     * set animation frame index
     * @param {Integer} index frame index
     */
    setIndex: function(index) {
        this.attrs.index = index;
    },
    _updateIndex: function() {
        var i = this.attrs.index;
        var a = this.attrs.animation;
        if(i < this.attrs.animations[a].length - 1) {
            this.attrs.index++;
        }
        else {
            this.attrs.index = 0;
        }
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Sprite, Kinetic.Shape);
