(function() {
    // constants
    var ATTR_CHANGE_LIST = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'lineHeight', 'text'],
        CHANGE_KINETIC = 'Change.kinetic',
        NONE = 'none',
        UP = 'up',
        RIGHT = 'right',
        DOWN = 'down',
        LEFT = 'left',
        LABEL = 'Label',
        
     // cached variables
     attrChangeListLen = ATTR_CHANGE_LIST.length;
        
    /**
     * Label constructor.&nbsp; Labels are groups that contain a Text and Tag shape 
     * @constructor
     * @memberof Kinetic
     * @param {Object} config
     * @param {Object} config.text Text config
     * @param {String} [config.text.fontFamily] default is Calibri
     * @param {Number} [config.text.fontSize] in pixels.  Default is 12
     * @param {String} [config.text.fontStyle] can be normal, bold, or italic.  Default is normal
     * @param {String} config.text.text 
     * @param {String} [config.text.align] can be left, center, or right
     * @param {Number} [config.text.padding]
     * @param {Number} [config.text.lineHeight] default is 1
     * @param {Object} [config.tag] Tag config
     * @param {String} [config.tag.pointerDirection] can be up, right, down, left, or none; the default
     *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
     * @param {Number} [config.tag.pointerWidth]
     * @param {Number} [config.tag.pointerHeight]
     * @param {Number} [config.tag.cornerRadius] 
     * {{NodeParams}}
     * @example
     * var label = new Kinetic.Label({<br>
     *   x: 350,<br>
     *   y: 50,<br>
     *   opacity: 0.75,<br>
     *   text: {<br>
     *     text: 'Simple label',<br>
     *     fontFamily: 'Calibri',<br>
     *     fontSize: 18,<br>
     *     padding: 5,<br>
     *     fill: 'black'<br>
     *   },<br>
     *   tag: {<br>
     *     fill: 'yellow',<br>
     *   }<br>
     * });<br><br>
     *
     * var tooltip = new Kinetic.Label({<br>
     *   x: 170,<br>
     *   y: 75,<br>
     *   opacity: 0.75,<br>
     *   text: {<br>
     *     text: 'Tooltip pointing down',<br>
     *     fontFamily: 'Calibri',<br>
     *     fontSize: 18,<br>
     *     padding: 5,<br>
     *     fill: 'white'<br>
     *   },<br>
     *   tag: {<br>
     *     fill: 'black',<br>
     *     pointerDirection: 'down',<br>
     *     pointerWidth: 10,<br>
     *     pointerHeight: 10,<br>
     *     lineJoin: 'round',<br>
     *     shadowColor: 'black',<br>
     *     shadowBlur: 10,<br>
     *     shadowOffset: 10,<br>
     *     shadowOpacity: 0.5<br>
     *   }<br>
     * });
     */
    Kinetic.Label = function(config) {
        this._initLabel(config);
    };

    Kinetic.Label.prototype = {
        _initLabel: function(config) {
            var that = this,
                textConfig = config.text,
                tagConfig = config.tag,
                n;

            // clear text and tag configs because they aren't actually attrs
            // TODO: is there a better way to config children attrs from a super config?
            delete config.text;
            delete config.tag;

            // need the inner group in case the dev wants to set the label offset
            this.innerGroup = new Kinetic.Group();
            this.createAttrs();
            this.className = LABEL;
            Kinetic.Group.call(this, config);
            this.text = new Kinetic.Text(textConfig);
            this.tag = new Kinetic.Tag(tagConfig);
            this.innerGroup.add(this.getTag());
            this.innerGroup.add(this.getText()); 
            this.add(this.innerGroup);   
            this._setGroupOffset();

            // update text data for certain attr changes
            for(n = 0; n < attrChangeListLen; n++) {
                that.text.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, function() {
                    that._setGroupOffset();
                });
            }     
        },
        toObject: function() {
            var obj = Kinetic.Node.prototype.toObject.call(this);
            obj.attrs.text = Kinetic.Node.prototype.toObject.call(this.text).attrs;
            obj.attrs.tag = Kinetic.Node.prototype.toObject.call(this.tag).attrs;

            return obj;
        },
        /**
         * get Text shape for the label.  You need to access the Text shape in order to update
         * the text properties
         * @name getText
         * @method
         * @memberof Kinetic.Label.prototype
         */
         getText: function() {
            return this.text;
         },    
        /**
         * get Tag shape for the label.  You need to access the Tag shape in order to update
         * the pointer properties and the corner radius
         * @name getTag
         * @method
         * @memberof Kinetic.Label.prototype
         */
        getTag: function() {
            return this.tag;
        },
        getWidth: function() {
            return this.getText().getWidth();
        },
        getHeight: function() {
            return this.getText().getHeight();
        },
        _setGroupOffset: function() {
            var text = this.getText(),
                width = text.getWidth(),
                height = text.getHeight(),
                tag = this.getTag(),
                pointerDirection = tag.getPointerDirection(),
                pointerWidth = tag.getPointerWidth(),
                pointerHeight = tag.getPointerHeight(),
                x = 0, 
                y = 0;
            
            switch(pointerDirection) {
                case UP:
                    x = width / 2;
                    y = -1 * pointerHeight;
                    break;
                case RIGHT:
                    x = width + pointerWidth;
                    y = height / 2;
                    break;
                case DOWN:
                    x = width / 2;
                    y = height + pointerHeight;
                    break;
                case LEFT:
                    x = -1 * pointerWidth;
                    y = height / 2;
                    break;
            }
            
            this.innerGroup.setOffset({
                x: x,
                y: y
            }); 
        }
    };
    
    Kinetic.Util.extend(Kinetic.Label, Kinetic.Group);

    /**
     * Tag constructor.&nbsp; A Tag can be configured
     *  to have a pointer element that points up, right, down, or left 
     * @constructor
     * @memberof Kinetic
     * @param {Object} config
     * @param {String} [config.pointerDirection] can be up, right, down, left, or none; the default
     *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
     * @param {Number} [config.pointerWidth]
     * @param {Number} [config.pointerHeight]
     * @param {Number} [config.cornerRadius] 
     */ 
    Kinetic.Tag = function(config) {
        this._initTag(config);
    };

    Kinetic.Tag.prototype = {
        _initTag: function(config) {
            this.createAttrs();
            Kinetic.Shape.call(this, config);
            this.className = 'Tag';
            this._setDrawFuncs();
        },
        drawFunc: function(canvas) {
            var label = this.getParent().getParent(),
                context = canvas.getContext(),
                width = label.getWidth(),
                height = label.getHeight(),
                pointerDirection = this.getPointerDirection(),
                pointerWidth = this.getPointerWidth(),
                pointerHeight = this.getPointerHeight(),
                cornerRadius = this.getCornerRadius();
                
            context.beginPath();
            context.moveTo(0,0);
            
            if (pointerDirection === UP) {
                context.lineTo((width - pointerWidth)/2, 0);
                context.lineTo(width/2, -1 * pointerHeight);
                context.lineTo((width + pointerWidth)/2, 0);
            }
            
            context.lineTo(width, 0);
           
            if (pointerDirection === RIGHT) {
                context.lineTo(width, (height - pointerHeight)/2);
                context.lineTo(width + pointerWidth, height/2);
                context.lineTo(width, (height + pointerHeight)/2);
            }
            
            context.lineTo(width, height);
    
            if (pointerDirection === DOWN) {
                context.lineTo((width + pointerWidth)/2, height);
                context.lineTo(width/2, height + pointerHeight);
                context.lineTo((width - pointerWidth)/2, height); 
            }
            
            context.lineTo(0, height);
            
            if (pointerDirection === LEFT) {
                context.lineTo(0, (height + pointerHeight)/2);
                context.lineTo(-1 * pointerWidth, height/2);
                context.lineTo(0, (height - pointerHeight)/2);
            } 
            
            context.closePath();
            canvas.fillStroke(this);
        }
    };
    
    Kinetic.Util.extend(Kinetic.Tag, Kinetic.Shape);
    Kinetic.Node.addGetterSetter(Kinetic.Tag, 'pointerDirection', NONE);

    /**
     * set pointer Direction
     * @name setPointerDirection
     * @method
     * @memberof Kinetic.Tag.prototype
     * @param {String} pointerDirection can be up, right, down, left, or none.  The
     *  default is none 
     */

     /**
     * get pointer Direction
     * @name getPointerDirection
     * @method
     * @memberof Kinetic.Tag.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Tag, 'pointerWidth', 0);

    /**
     * set pointer width 
     * @name setPointerWidth
     * @method
     * @memberof Kinetic.Tag.prototype
     * @param {Number} pointerWidth 
     */

     /**
     * get pointer width 
     * @name getPointerWidth
     * @method
     * @memberof Kinetic.Tag.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Tag, 'pointerHeight', 0);

    /**
     * set pointer height 
     * @name setPointerHeight
     * @method
     * @memberof Kinetic.Tag.prototype
     * @param {Number} pointerHeight
     */

     /**
     * get pointer height 
     * @name getPointerHeight
     * @method
     * @memberof Kinetic.Tag.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.Tag, 'cornerRadius', 0);

    /**
     * set corner radius
     * @name setCornerRadius
     * @method
     * @memberof Kinetic.Tag.prototype
     * @param {Number} corner radius
     */

    /**
     * get corner radius
     * @name getCornerRadius
     * @method
     * @memberof Kinetic.Tag.prototype
     */
})();