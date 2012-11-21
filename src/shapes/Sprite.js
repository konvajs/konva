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
    this._initSprite(config);
};

Kinetic.Sprite.prototype = {
    _initSprite: function(config) {
        this.setDefaultAttrs({
            index: 0,
            frameRate: 17
        });
		this.shapeType = "Sprite";
        
        // call super constructor
        Kinetic.Shape.call(this, config);
        this._setDrawFuncs();
        
        this.anim = new Kinetic.Animation();
        var that = this;
        this.on('animationChange', function() {
            // reset index when animation changes
            that.setIndex(0);
        });
    },
    drawFunc: function(context) {
        var anim = this.attrs.animation;
        var index = this.attrs.index;
        var f = this.attrs.animations[anim][index];

        context.beginPath();
        context.rect(0, 0, f.width, f.height);
        context.closePath();
        this.render(context);

        if(this.attrs.image) {

            context.beginPath();
            context.rect(0, 0, f.width, f.height);
            context.closePath();

            this.drawImage(context, this.attrs.image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
        }
    },
    drawHitFunc: function(context) {
        var anim = this.attrs.animation;
        var index = this.attrs.index;
        var f = this.attrs.animations[anim][index];

        context.beginPath();
        context.rect(0, 0, f.width, f.height);
        context.closePath();
        this.fill(context, this.getFill(), null);
        this.stroke(context, this.getStroke(), this.getStrokeWidth(), null);
    },
    /**
     * start sprite animation
     * @name start
     * @methodOf Kinetic.Sprite.prototype
     */
    start: function() {
        var that = this;
        var layer = this.getLayer();

        /*
         * animation object has no executable function because
         *  the updates are done with a fixed FPS with the setInterval
         *  below.  The anim object only needs the layer reference for
         *  redraw
         */
        this.anim.node = layer;

        this.interval = setInterval(function() {
            var index = that.attrs.index;
            that._updateIndex();
            if(that.afterFrameFunc && index === that.afterFrameIndex) {
                that.afterFrameFunc();
                delete that.afterFrameFunc;
                delete that.afterFrameIndex;
            }
        }, 1000 / this.attrs.frameRate);

        this.anim.start();
    },
    /**
     * stop sprite animation
     * @name stop
     * @methodOf Kinetic.Sprite.prototype
     */
    stop: function() {
        this.anim.stop();
        clearInterval(this.interval);
    },
    /**
     * set after frame event handler
     * @name afterFrame
     * @methodOf Kinetic.Sprite.prototype
     * @param {Integer} index frame index
     * @param {Function} func function to be executed after frame has been drawn
     */
    afterFrame: function(index, func) {
        this.afterFrameIndex = index;
        this.afterFrameFunc = func;
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
Kinetic.Global.extend(Kinetic.Sprite, Kinetic.Shape);

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Sprite, ['animation', 'animations', 'index']);

/**
 * set animation key
 * @name setAnimation
 * @methodOf Kinetic.Sprite.prototype
 * @param {String} anim animation key
 */

/**
 * set animations object
 * @name setAnimations
 * @methodOf Kinetic.Sprite.prototype
 * @param {Object} animations
 */

/**
 * set animation frame index
 * @name setIndex
 * @methodOf Kinetic.Sprite.prototype
 * @param {Integer} index frame index
 */

/**
 * get animation key
 * @name getAnimation
 * @methodOf Kinetic.Sprite.prototype
 */

/**
 * get animations object
 * @name getAnimations
 * @methodOf Kinetic.Sprite.prototype
 */

/**
 * get animation frame index
 * @name getIndex
 * @methodOf Kinetic.Sprite.prototype
 */