(function() {
    // constants
    var ATTR_CHANGE_LIST = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'lineHeight', 'text'],
        CHANGE_KINETIC = 'Change.kinetic',
        NONE = 'none',
        UP = 'up',
        RIGHT = 'right',
        DOWN = 'down',
        LEFT = 'left',
        
     // cached variables
     attrChangeListLen = ATTR_CHANGE_LIST.length;
        
    /**
     * Label constructor.&nbsp; Labels are groups that contain Text and LabelRect shape 
     * @constructor
     * @param {Object} config
     * @param {Object} config.text Text config
     * @param {String} [config.text.fontFamily] default is Calibri
     * @param {Number} [config.text.fontSize] in pixels.  Default is 12
     * @param {String} [config.text.fontStyle] can be normal, bold, or italic.  Default is normal
     * @param {String} config.text.text 
     * @param {String} [config.text.align] can be left, center, or right
     * @param {Number} [config.text.padding]
     * @param {Number} [config.text.lineHeight] default is 1
     * @param {Object} [config.rect] LabelRect config
     * @param {String} [config.rect.pointerDirection] can be up, right, down, left, or none; the default
     *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
     * @param {Number} [config.rect.pointerWidth]
     * @param {Number} [config.rect.pointerHeight]
     * @param {Number} [config.rect.cornerRadius] 
     * {{NodeParams}}
     */
    Kinetic.Label = function(config) {
        this._initLabel(config);
    };

    Kinetic.Label.prototype = {
        _initLabel: function(config) {
            var that = this,
                text = null;
            
            this.innerGroup = new Kinetic.Group();
            this.createAttrs();
            Kinetic.Group.call(this, config);
            text = new Kinetic.Text(config.text);
            this.setText(text);
            this.setRect(new Kinetic.LabelRect(config.rect));
            this.innerGroup.add(this.getRect());
            this.innerGroup.add(text); 
            this.add(this.innerGroup);   
            
            this._setGroupOffset();
            
            // update text data for certain attr changes
            for(var n = 0; n < attrChangeListLen; n++) {
                text.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, function() {
                    that._setGroupOffset();
                 });
             }     
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
                rect = this.getRect(),
                pointerDirection = rect.getPointerDirection(),
                pointerWidth = rect.getPointerWidth(),
                pointerHeight = rect.getPointerHeight(),
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
            
            this.setOffset({
                x: x,
                y: y
            }); 
        }
    };

    /**
     * get LabelRect shape for the label.  You need to access the LabelRect shape in order to update
     * the pointer properties and the corner radius
     * @name getRect
     * @methodOf Kinetic.Label.prototype
     */

    /**
     * get Text shape for the label.  You need to access the Text shape in order to update
     * the text properties
     * @name getText
     * @methodOf Kinetic.Label.prototype
     */
    
    Kinetic.Global.extend(Kinetic.Label, Kinetic.Group);
    Kinetic.Node.addGetterSetter(Kinetic.Label, 'text');
    Kinetic.Node.addGetterSetter(Kinetic.Label, 'rect');
       
    /**
     * LabelRect constructor.&nbsp; A LabelRect is similar to a Rect, except that it can be configured
     *  to have a pointer element that points up, right, down, or left 
     * @constructor
     * @param {Object} config
     * @param {String} [config.pointerDirection] can be up, right, down, left, or none; the default
     *  is none.  When a pointer is present, the positioning of the label is relative to the tip of the pointer.
     * @param {Number} [config.pointerWidth]
     * @param {Number} [config.pointerHeight]
     * @param {Number} [config.cornerRadius] 
     */ 
    Kinetic.LabelRect = function(config) {
        this._initLabelRect(config);
    };

    Kinetic.LabelRect.prototype = {
        _initLabelRect: function(config) {
            this.createAttrs();
            Kinetic.Shape.call(this, config);
            this.shapeType = 'LabelRect';
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
    
    Kinetic.Global.extend(Kinetic.LabelRect, Kinetic.Shape);
    Kinetic.Node.addGetterSetter(Kinetic.LabelRect, 'pointerDirection', NONE);

    /**
     * set pointer Direction
     * @name setPointerDirection
     * @methodOf Kinetic.LabelRect.prototype
     * @param {String} pointerDirection can be up, right, down, left, or none.  The
     *  default is none 
     */

     /**
     * get pointer Direction
     * @name getPointerDirection
     * @methodOf Kinetic.LabelRect.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.LabelRect, 'pointerWidth', 0);

    /**
     * set pointer width 
     * @name setPointerWidth
     * @methodOf Kinetic.LabelRect.prototype
     * @param {Number} pointerWidth 
     */

     /**
     * get pointer width 
     * @name getPointerWidth
     * @methodOf Kinetic.LabelRect.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.LabelRect, 'pointerHeight', 0);

    /**
     * set pointer height 
     * @name setPointerHeight
     * @methodOf Kinetic.LabelRect.prototype
     * @param {Number} pointerHeight
     */

     /**
     * get pointer height 
     * @name getPointerHeight
     * @methodOf Kinetic.LabelRect.prototype
     */

    Kinetic.Node.addGetterSetter(Kinetic.LabelRect, 'cornerRadius', 0);

    /**
     * set corner radius
     * @name setCornerRadius
     * @methodOf Kinetic.LabelRect.prototype
     * @param {Number} corner radius
     */

    /**
     * get corner radius
     * @name getCornerRadius
     * @methodOf Kinetic.LabelRect.prototype
     */
})();