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
    /*
     * defaults
     */
    if(config.textStroke !== undefined || config.textStrokeWidth !== undefined) {
        if(config.textStroke === undefined) {
            config.textStroke = 'black';
        }
        else if(config.textStrokeWidth === undefined) {
            config.textStrokeWidth = 2;
        }
    }
    if(config.align === undefined) {
        config.align = 'left';
    }
    if(config.verticalAlign === undefined) {
        config.verticalAlign = 'top';
    }
    if(config.padding === undefined) {
        config.padding = 0;
    }
    if(config.fontStyle === undefined) {
        config.fontStyle = 'normal';
    }

    config.drawFunc = function() {
        var context = this.getContext();
        context.font = this.fontStyle + ' ' + this.fontSize + 'pt ' + this.fontFamily;
        context.textBaseline = 'middle';
        var metrics = context.measureText(this.text);
        var textHeight = textHeight = parseInt(this.fontSize, 10);
        var textWidth = metrics.width;
        var p = this.padding;
        var x = 0;
        var y = 0;

        switch (this.align) {
            case 'center':
                x = textWidth / -2 - p;
                break;
            case 'right':
                x = -1 * textWidth - p;
                break;
        }

        switch (this.verticalAlign) {
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
        this.fillStroke();
        context.restore();

        var tx = p + x;
        var ty = textHeight / 2 + p + y;

        // draw text
        if(this.textFill !== undefined) {
            context.fillStyle = this.textFill;
            context.fillText(this.text, tx, ty);
        }
        if(this.textStroke !== undefined || this.textStrokeWidth !== undefined) {
            // defaults
            if(this.textStroke === undefined) {
                this.textStroke = 'black';
            }
            else if(this.textStrokeWidth === undefined) {
                this.textStrokeWidth = 2;
            }
            context.lineWidth = this.textStrokeWidth;
            context.strokeStyle = this.textStroke;
            context.strokeText(this.text, tx, ty);
        }
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
        this.fontFamily = fontFamily;
    },
    /**
     * get font family
     */
    getFontFamily: function() {
        return this.fontFamily;
    },
    /**
     * set font size
     * @param {int} fontSize
     */
    setFontSize: function(fontSize) {
        this.fontSize = fontSize;
    },
    /**
     * get font size
     */
    getFontSize: function() {
        return this.fontSize;
    },
    /**
     * set font style.  Can be "normal", "italic", or "bold".  "normal" is the default.
     * @param {String} fontStyle
     */
    setFontStyle: function(fontStyle) {
        this.fontStyle = fontStyle;
    },
    /**
     * get font style
     */
    getFontStyle: function() {
        return this.fontStyle;
    },
    /**
     * set text fill color
     * @param {String} textFill
     */
    setTextFill: function(textFill) {
        this.textFill = textFill;
    },
    /**
     * get text fill color
     */
    getTextFill: function() {
        return this.textFill;
    },
    /**
     * set text stroke color
     * @param {String} textStroke
     */
    setTextStroke: function(textStroke) {
        this.textStroke = textStroke;
    },
    /**
     * get text stroke color
     */
    getTextStroke: function() {
        return this.textStroke;
    },
    /**
     * set text stroke width
     * @param {int} textStrokeWidth
     */
    setTextStrokeWidth: function(textStrokeWidth) {
        this.textStrokeWidth = textStrokeWidth;
    },
    /**
     * get text stroke width
     */
    getTextStrokeWidth: function() {
        return this.textStrokeWidth;
    },
    /**
     * set padding
     * @param {int} padding
     */
    setPadding: function(padding) {
        this.padding = padding;
    },
    /**
     * get padding
     */
    getPadding: function() {
        return this.padding;
    },
    /**
     * set horizontal align of text
     * @param {String} align align can be 'left', 'center', or 'right'
     */
    setAlign: function(align) {
        this.align = align;
    },
    /**
     * get horizontal align
     */
    getAlign: function() {
        return this.align;
    },
    /**
     * set vertical align of text
     * @param {String} verticalAlign verticalAlign can be "top", "middle", or "bottom"
     */
    setVerticalAlign: function(verticalAlign) {
        this.verticalAlign = verticalAlign;
    },
    /**
     * get vertical align
     */
    getVerticalAlign: function() {
        return this.verticalAlign;
    },
    /**
     * set text
     * @param {String} text
     */
    setText: function(text) {
        this.text = text;
    },
    /**
     * get text
     */
    getText: function() {
        return this.text;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Text, Kinetic.Shape);
