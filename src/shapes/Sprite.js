(function() {
    /**
     * Sprite constructor
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {String} config.animation animation key
     * @param {Object} config.animations animation map
     * @param {Integer} [config.index] animation index
     * @param {Image} config.image image object
     * @@shapeParams
     * @@nodeParams
     * @example
     * var animations = {<br>
     *   idle: [{<br>
     *     x: 2,<br>
     *     y: 2,<br>
     *     width: 70,<br>
     *     height: 119<br>
     *   }, {<br>
     *     x: 71,<br>
     *     y: 2,<br>
     *     width: 74,<br>
     *     height: 119<br>
     *   }, {<br>
     *     x: 146,<br>
     *     y: 2,<br>
     *     width: 81,<br>
     *     height: 119<br>
     *   }, {<br>
     *     x: 226,<br>
     *     y: 2,<br>
     *     width: 76,<br>
     *     height: 119<br>
     *   }],<br>
     *   punch: [{<br>
     *     x: 2,<br>
     *     y: 138,<br>
     *     width: 74,<br>
     *     height: 122<br>
     *   }, {<br>
     *     x: 76,<br>
     *     y: 138,<br>
     *     width: 84,<br>
     *     height: 122<br>
     *   }, {<br>
     *     x: 346,<br>
     *     y: 138,<br>
     *     width: 120,<br>
     *     height: 122<br>
     *   }]<br>
     * };<br><br>
     *
     * var imageObj = new Image();<br>
     * imageObj.onload = function() {<br>
     *   var sprite = new Kinetic.Sprite({<br>
     *     x: 200,<br>
     *     y: 100,<br>
     *     image: imageObj,<br>
     *     animation: 'idle',<br>
     *     animations: animations,<br>
     *     frameRate: 7,<br>
     *     index: 0<br>
     *   });<br>
     * };<br>
     * imageObj.src = '/path/to/image.jpg'
     */
    Kinetic.Sprite = function(config) {
        this.___init(config);
    };

    Kinetic.Sprite.prototype = {
        ___init: function(config) {
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.className = 'Sprite';

            this.anim = new Kinetic.Animation();
            var that = this;
            this.on('animationChange.kinetic', function() {
                // reset index when animation changes
                that.setIndex(0);
            });
        },
        drawFunc: function(context) {
            var anim = this.getAnimation(),
                index = this.getIndex(),
                f = this.getAnimations()[anim][index],
                image = this.getImage();

            if(image) {
                context.drawImage(image, f.x, f.y, f.width, f.height, 0, 0, f.width, f.height);
            }
        },
        drawHitFunc: function(context) {
            var anim = this.getAnimation(),
                index = this.getIndex(),
                f = this.getAnimations()[anim][index];

            context.beginPath();
            context.rect(0, 0, f.width, f.height);
            context.closePath();
            context.fillShape(this);
        },
        _useBufferCanvas: function() {
            return (this.hasShadow() || this.getAbsoluteOpacity() !== 1) && this.hasStroke();
        },
        /**
         * start sprite animation
         * @method
         * @memberof Kinetic.Sprite.prototype
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
            this.anim.setLayers(layer);

            this.interval = setInterval(function() {
                var index = that.getIndex();
                that._updateIndex();
                if(that.afterFrameFunc && index === that.afterFrameIndex) {
                    that.afterFrameFunc();
                    delete that.afterFrameFunc;
                    delete that.afterFrameIndex;
                }
            }, 1000 / this.getFrameRate());

            this.anim.start();
        },
        /**
         * stop sprite animation
         * @method
         * @memberof Kinetic.Sprite.prototype
         */
        stop: function() {
            this.anim.stop();
            clearInterval(this.interval);
        },
        /**
         * set after frame event handler
         * @method
         * @memberof Kinetic.Sprite.prototype
         * @param {Integer} index frame index
         * @param {Function} func function to be executed after frame has been drawn
         */
        afterFrame: function(index, func) {
            this.afterFrameIndex = index;
            this.afterFrameFunc = func;
        },
        _updateIndex: function() {
            var index = this.getIndex(),
                animation = this.getAnimation(),
                animations = this.getAnimations(),
                anim = animations[animation],
                len = anim.length;

            if(index < len - 1) {
                this.setIndex(index + 1);
            }
            else {
                this.setIndex(0);
            }
        }
    };
    Kinetic.Util.extend(Kinetic.Sprite, Kinetic.Shape);

    // add getters setters
    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, 'animation');

    /**
     * set animation key
     * @name setAnimation
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @param {String} anim animation key
     */

     /**
     * get animation key
     * @name getAnimation
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @returns {String}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, 'animations');

    /**
     * set animations map
     * @name setAnimations
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @param {Object} animations
     */

     /**
     * get animations map
     * @name getAnimations
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @returns {Object}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, 'image');

    /**
     * set image
     * @name setImage
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @param {Image} image
     */

     /**
     * get image
     * @name getImage
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @returns {ImageObject}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, 'index', 0);

    /**
     * set animation frame index
     * @name setIndex
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @param {Integer} index frame index
     */

     /**
     * get animation frame index
     * @name getIndex
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @returns {Integer}
     */

    Kinetic.Factory.addGetterSetter(Kinetic.Sprite, 'frameRate', 17);

    /**
     * set frame rate in frames / second.  Default is 17 frames per second.  Increase this number to make the sprite
     *  animation run faster, and decrease the number to make the sprite animation run slower
     * @name setFrameRate
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @param {Integer} frameRate
     */

     /**
     * get frame rate
     * @name getFrameRate
     * @method
     * @memberof Kinetic.Sprite.prototype
     * @returns {Number}
     */

})();
