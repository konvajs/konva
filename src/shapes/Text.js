///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/**
 * Text constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Text = function(config) {
    this.setDefaultAttrs({
        fontFamily: 'Calibri',
        text: '',
        fontSize: 12,
        align: 'left',
        verticalAlign: 'top',
        padding: 0,
        fontStyle: 'normal',
        width: 'auto',
        detectionType: 'pixel'
    });

    this.shapeType = "Text";

    config.drawFunc = function() {
        var context = this.getContext();
        context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
        context.textBaseline = 'middle';
        var textHeight = this.getTextHeight();
        var textWidth = this.attrs.width === 'auto' ? this.getTextWidth() : this.attrs.width;
        var p = this.attrs.padding;
        var x = 0;
        var y = 0;
        var that = this;

        switch (this.attrs.align) {
            case 'center':
                x = textWidth / -2 - p;
                break;
            case 'right':
                x = -1 * textWidth - p;
                break;
        }

        switch (this.attrs.verticalAlign) {
            case 'middle':
                y = textHeight / -2 - p;
                break;
            case 'bottom':
                y = -1 * textHeight - p;
                break;
        }

        // draw path
        context.save();
        context.beginPath();
        context.rect(x, y, textWidth + p * 2, textHeight + p * 2);
        context.closePath();

        this.fill();
        this.stroke();

        context.restore();

        var tx = p + x;
        var ty = textHeight / 2 + p + y;

        // clipping region for max width
        context.save();
        if(this.attrs.width !== 'auto') {
            context.beginPath();
            context.rect(x, y, textWidth + p, textHeight + p * 2);
            context.closePath();
            context.clip();
        }

        // draw text
        this.fillText(this.attrs.text, tx, ty);
        this.strokeText(this.attrs.text, tx, ty);

        context.restore();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Text methods
 */
Kinetic.Text.prototype = {
    /**
     * set font family
     * @param {String} fontFamily
     */
    setFontFamily: function(fontFamily) {
        this.attrs.fontFamily = fontFamily;
    },
    /**
     * get font family
     */
    getFontFamily: function() {
        return this.attrs.fontFamily;
    },
    /**
     * set font size
     * @param {int} fontSize
     */
    setFontSize: function(fontSize) {
        this.attrs.fontSize = fontSize;
    },
    /**
     * get font size
     */
    getFontSize: function() {
        return this.attrs.fontSize;
    },
    /**
     * set font style.  Can be "normal", "italic", or "bold".  "normal" is the default.
     * @param {String} fontStyle
     */
    setFontStyle: function(fontStyle) {
        this.attrs.fontStyle = fontStyle;
    },
    /**
     * get font style
     */
    getFontStyle: function() {
        return this.attrs.fontStyle;
    },
    /**
     * set text fill color
     * @param {String} textFill
     */
    setTextFill: function(textFill) {
        this.attrs.textFill = textFill;
    },
    /**
     * get text fill color
     */
    getTextFill: function() {
        return this.attrs.textFill;
    },
    /**
     * set text stroke color
     * @param {String} textStroke
     */
    setTextStroke: function(textStroke) {
        this.attrs.textStroke = textStroke;
    },
    /**
     * get text stroke color
     */
    getTextStroke: function() {
        return this.attrs.textStroke;
    },
    /**
     * set text stroke width
     * @param {int} textStrokeWidth
     */
    setTextStrokeWidth: function(textStrokeWidth) {
        this.attrs.textStrokeWidth = textStrokeWidth;
    },
    /**
     * get text stroke width
     */
    getTextStrokeWidth: function() {
        return this.attrs.textStrokeWidth;
    },
    /**
     * set padding
     * @param {int} padding
     */
    setPadding: function(padding) {
        this.attrs.padding = padding;
    },
    /**
     * get padding
     */
    getPadding: function() {
        return this.attrs.padding;
    },
    /**
     * set horizontal align of text
     * @param {String} align align can be 'left', 'center', or 'right'
     */
    setAlign: function(align) {
        this.attrs.align = align;
    },
    /**
     * get horizontal align
     */
    getAlign: function() {
        return this.attrs.align;
    },
    /**
     * set vertical align of text
     * @param {String} verticalAlign verticalAlign can be "top", "middle", or "bottom"
     */
    setVerticalAlign: function(verticalAlign) {
        this.attrs.verticalAlign = verticalAlign;
    },
    /**
     * get vertical align
     */
    getVerticalAlign: function() {
        return this.attrs.verticalAlign;
    },
    /**
     * set text
     * @param {String} text
     */
    setText: function(text) {
        this.attrs.text = text;
    },
    /**
     * get text
     */
    getText: function() {
        return this.attrs.text;
    },
    /**
     * get text width in pixels
     */
    getTextWidth: function() {
        return this.getTextSize().width;
    },
    /**
     * get text height in pixels
     */
    getTextHeight: function() {
        return this.getTextSize().height;
    },
    /**
     * get text size in pixels
     */
    getTextSize: function() {
        var context = this.getContext();

        /**
         * if the text hasn't been added a layer yet there
         * will be no associated context.  Will have to create
         * a dummy context
         */
        if(!context) {
            var dummyCanvas = document.createElement('canvas');
            context = dummyCanvas.getContext('2d');
        }

        context.save();
        context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
        var metrics = context.measureText(this.attrs.text);
        context.restore();
        return {
            width: metrics.width,
            height: parseInt(this.attrs.fontSize, 10)
        };
    },
    /**
     * get width in pixels
     */
    getWidth: function() {
        return this.attrs.width;
    },
    /**
     * set width
     * @param {Number} width
     */
    setWidth: function(width) {
        this.attrs.width = width;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Text, Kinetic.Shape);
