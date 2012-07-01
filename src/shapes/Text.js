///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/**
 * Text constructor
 * @constructor
 * @augments Kinetic.Group
 * @param {Object} config
 */
Kinetic.Text = function(config) {
    this.setDefaultAttrs({
        fontFamily: 'Calibri',
        text: '',
        fontSize: 12,
        align: 'left',
        verticalAlign: 'top',
        fontStyle: 'normal',
        padding: 0,
        width: 'auto',
        height: 'auto',
        detectionType: 'path',
        cornerRadius: 0,
        lineHeight: 1.2
    });

    this.dummyCanvas = document.createElement('canvas');
    this.shapeType = "Text";
    this.boxShape = new Kinetic.Rect({});

    var that = this;

    this.textShape = new Kinetic.Shape({
        drawFunc: function() {
            var context = this.getContext();

            // sync appliedShadow flag with boxShape
            this.appliedShadow = that.boxShape.appliedShadow;

            context.font = that.attrs.fontStyle + ' ' + that.attrs.fontSize + 'pt ' + that.attrs.fontFamily;
            context.textBaseline = 'middle';
            context.textAlign = 'left';
            context.save();

            var p = that.attrs.padding;

            var lineHeightPx = that.attrs.lineHeight * that.getTextHeight();

            // horizontal align
            context.translate(p, 0);

            // vertical align
            context.translate(0, p + that.getTextHeight() / 2);

            // draw text lines
            var textArr = that.textArr;
            for(var n = 0; n < textArr.length; n++) {
                var text = textArr[n];
                this.fillText(text);
                this.strokeText(text);

                context.translate(0, lineHeightPx);
            }

            context.restore();
        }
    });

    // call super constructor
    Kinetic.Group.apply(this, [config]);

    // add shapes to group
    this.add(this.boxShape);
    this.add(this.textShape);

    // sync attrs
    var attrs = ['width', 'height', 'cornerRadius', 'stroke', 'strokeWidth', 'fill', 'shadow', 'detectionType', 'textFill', 'textStroke', 'textStrokeWidth'];
    var that = this;
    for(var n = 0; n < attrs.length; n++) {
        var attr = attrs[n];
        this.on(attr + 'Change', function(evt) {
            if(!evt.shape) {
                that._setTextData();
                that._syncAttrs();
            }
        });
    }

    that._setTextData();
    this._syncAttrs();
};
/*
 * Text methods
 */
Kinetic.Text.prototype = {
    /**
     * get text width in pixels
     */
    getTextWidth: function() {
        return this.textWidth;
    },
    /**
     * get text height in pixels
     */
    getTextHeight: function() {
        return this.textHeight;
    },
    /**
     * get box width
     */
    getBoxWidth: function() {
        return this.attrs.width === 'auto' ? this.getTextWidth() + this.attrs.padding * 2 : this.attrs.width;
    },
    /**
     * get box height
     */
    getBoxHeight: function() {
        return this.attrs.height === 'auto' ? (this.getTextHeight() * this.textArr.length * this.attrs.lineHeight) + this.attrs.padding * 2 : this.attrs.height;
    },
    _getTextSize: function(text) {
        var dummyCanvas = this.dummyCanvas;
        var context = dummyCanvas.getContext('2d');

        context.save();
        context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
        var metrics = context.measureText(text);
        context.restore();
        return {
            width: metrics.width,
            height: parseInt(this.attrs.fontSize, 10)
        };
    },
    /**
     * set text data.  wrap logic and width and height setting occurs
     * here
     */
    _setTextData: function() {
        var charArr = this.attrs.text.split('');
        var arr = [];
        var lastWord = '';
        var row = 0;
        this.textArr = [];
        this.textWidth = 0;
        this.textHeight = this._getTextSize(arr[0]).height;
        var lineHeightPx = this.attrs.lineHeight * this.textHeight;
        var addedToLine = true;
        while(charArr.length > 0 && addedToLine && (this.attrs.height === 'auto' || lineHeightPx * (row + 1) < this.attrs.height - this.attrs.padding * 2)) {
            addedToLine = false;
            var line = lastWord;
            lastWord = '';
            while(charArr[0] !== undefined && (this.attrs.width === 'auto' || this._getTextSize(line + charArr[0]).width < this.attrs.width - this.attrs.padding * 2)) {
                lastWord = charArr[0] === ' ' || charArr[0] === '-' ? '' : lastWord + charArr[0];
                line += charArr.splice(0, 1);
                addedToLine = true;
            }

            // remove last word from line
            if(charArr.length > 0) {
                line = line.substring(0, line.lastIndexOf(lastWord));
            }

            this.textWidth = Math.max(this.textWidth, this._getTextSize(line).width);

            if(line.length > 0) {
                arr.push(line);
            }
            row++;
        }

        this.textArr = arr;
    },
    /**
     * sync attrs.  whenever special attrs of the text shape are updated,
     * this method is called to sync the Rect and Shape attrs
     */
    _syncAttrs: function() {
        this.boxShape.setAttrs({
            width: this.getBoxWidth(),
            height: this.getBoxHeight(),
            cornerRadius: this.attrs.cornerRadius,
            stroke: this.attrs.stroke,
            strokeWidth: this.attrs.strokeWidth,
            fill: this.attrs.fill,
            shadow: this.attrs.shadow,
            detectionType: this.attrs.detectionType
        }, true);
        /*
         * sync attrs accessed by fillText and strokeText
         * in Shape class, and also the detectionType
         */
        this.textShape.setAttrs({
            textFill: this.attrs.textFill,
            textStroke: this.attrs.textStroke,
            textStrokeWidth: this.attrs.textStrokeWidth,
            shadow: this.attrs.shadow,
            detectionType: this.attrs.detectionType
        }, true);
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Text, Kinetic.Group);

// add setters and getters
Kinetic.GlobalObject.addSettersGetters(Kinetic.Text, ['fontFamily', 'fontSize', 'fontStyle', 'textFill', 'textStroke', 'textStrokeWidth', 'padding', 'align', 'lineHeight', 'text', 'width', 'height', 'cornerRadius', 'fill', 'stroke', 'strokeWidth', 'shadow']);

/**
 * set font family
 * @name setFontFamily
 * @methodOf Kinetic.Text.prototype
 * @param {String} fontFamily
 */

/**
 * set font size
 * @name setFontSize
 * @methodOf Kinetic.Text.prototype
 * @param {int} fontSize
 */

/**
 * set font style.  Can be "normal", "italic", or "bold".  "normal" is the default.
 * @name setFontStyle
 * @methodOf Kinetic.Text.prototype
 * @param {String} fontStyle
 */

/**
 * set text fill color
 * @name setTextFill
 * @methodOf Kinetic.Text.prototype
 * @param {String} textFill
 */

/**
 * set text stroke color
 * @name setFontStroke
 * @methodOf Kinetic.Text.prototype
 * @param {String} textStroke
 */

/**
 * set text stroke width
 * @name setTextStrokeWidth
 * @methodOf Kinetic.Text.prototype
 * @param {int} textStrokeWidth
 */

/**
 * set padding
 * @name setPadding
 * @methodOf Kinetic.Text.prototype
 * @param {int} padding
 */

/**
 * set horizontal align of text
 * @name setAlign
 * @methodOf Kinetic.Text.prototype
 * @param {String} align align can be 'left', 'center', or 'right'
 */

/**
 * set line height
 * @name setLineHeight
 * @methodOf Kinetic.Text.prototype
 * @param {Number} lineHeight default is 1.2
 */

/**
 * set text
 * @name setText
 * @methodOf Kinetic.Text.prototype
 * @param {String} text
 */

/**
 * set width of text box
 * @name setWidth
 * @methodOf Kinetic.Text.prototype
 * @param {Number} width
 */

/**
 * set height of text box
 * @name setHeight
 * @methodOf Kinetic.Text.prototype
 * @param {Number} height
 */

/**
 * set shadow of text or textbox
 * @name setShadow
 * @methodOf Kinetic.Text.prototype
 * @param {Object} config
 */

/**
 * get font family
 * @name getFontFamily
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get font size
 * @name getFontSize
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get font style
 * @name getFontStyle
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get text fill color
 * @name getTextFill
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get text stroke color
 * @name getTextStroke
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get text stroke width
 * @name getTextStrokeWidth
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get padding
 * @name getPadding
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get horizontal align
 * @name getAlign
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get line height
 * @name getLineHeight
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get text
 * @name getText
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get width of text box
 * @name getWidth
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get height of text box
 * @name getHeight
 * @methodOf Kinetic.Text.prototype
 */

/**
 * get shadow of text or textbox
 * @name getShadow
 * @methodOf Kinetic.Text.prototype
 */