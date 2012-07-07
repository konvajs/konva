///////////////////////////////////////////////////////////////////////
//  Text
///////////////////////////////////////////////////////////////////////
/**
 * Text constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Text = Kinetic.Shape.extend({
    init: function(config) {
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

        config.drawFunc = function() {
            var context = this.getContext();
            /*
             * draw rect
             */
            context.beginPath();
            var boxWidth = this.getBoxWidth();
            var boxHeight = this.getBoxHeight();

            if(this.attrs.cornerRadius === 0) {
                // simple rect - don't bother doing all that complicated maths stuff.
                context.rect(0, 0, boxWidth, boxHeight);
            }
            else {
                // arcTo would be nicer, but browser support is patchy (Opera)
                context.moveTo(this.attrs.cornerRadius, 0);
                context.lineTo(boxWidth - this.attrs.cornerRadius, 0);
                context.arc(boxWidth - this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI * 3 / 2, 0, false);
                context.lineTo(boxWidth, boxHeight - this.attrs.cornerRadius);
                context.arc(boxWidth - this.attrs.cornerRadius, boxHeight - this.attrs.cornerRadius, this.attrs.cornerRadius, 0, Math.PI / 2, false);
                context.lineTo(this.attrs.cornerRadius, boxHeight);
                context.arc(this.attrs.cornerRadius, boxHeight - this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI / 2, Math.PI, false);
                context.lineTo(0, this.attrs.cornerRadius);
                context.arc(this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI, Math.PI * 3 / 2, false);
            }
            context.closePath();

            this.fill();
            this.stroke();
            /*
             * draw text
             */
            var p = this.attrs.padding;
            var lineHeightPx = this.attrs.lineHeight * this.getTextHeight();
            var textArr = this.textArr;

            context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
            context.textBaseline = 'middle';
            context.textAlign = 'left';
            context.save();
            context.translate(p, 0);
            context.translate(0, p + this.getTextHeight() / 2);

            // draw text lines
            for(var n = 0; n < textArr.length; n++) {
                var text = textArr[n];

                // horizontal alignment
                context.save();
                if(this.attrs.align === 'right') {
                    context.translate(this.getBoxWidth() - this._getTextSize(text).width - p * 2, 0);
                }
                else if(this.attrs.align === 'center') {
                    context.translate((this.getBoxWidth() - this._getTextSize(text).width - p * 2) / 2, 0);
                }

                this.fillText(text);
                this.strokeText(text);
                context.restore();

                context.translate(0, lineHeightPx);
            }
            context.restore();
        };
        // call super constructor
        this._super(config);

        // update text data for certain attr changes
        var attrs = ['width', 'height', 'padding', 'text', 'textStroke', 'textStrokeWidth'];
        var that = this;
        for(var n = 0; n < attrs.length; n++) {
            var attr = attrs[n];
            this.on(attr + 'Change.kinetic', that._setTextData);
        }

        that._setTextData();
    },
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
        this.textHeight = this._getTextSize(this.attrs.text).height;
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
    }
});
// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Text, ['fontFamily', 'fontSize', 'fontStyle', 'textFill', 'textStroke', 'textStrokeWidth', 'padding', 'align', 'lineHeight', 'text', 'width', 'height', 'cornerRadius', 'fill', 'stroke', 'strokeWidth', 'shadow']);

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