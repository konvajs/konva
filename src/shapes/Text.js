(function() {
    // constants
    var AUTO = 'auto', 
        CALIBRI = 'Calibri',
        CANVAS = 'canvas', 
        CENTER = 'center',
        CHANGE_KINETIC = 'Change.kinetic',
        CONTEXT_2D = '2d',
        DASH = '-',
        EMPTY_STRING = '', 
        LEFT = 'left',
        NEW_LINE = '\n',
        TEXT = 'text',
        TEXT_UPPER = 'Text', 
        TOP = 'top', 
        MIDDLE = 'middle',
        NORMAL = 'normal',
        PX_SPACE = 'px ',
        SPACE = ' ',
        RIGHT = 'right',
        WORD = 'word',
        CHAR = 'char',
        NONE = 'none',
        ATTR_CHANGE_LIST = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'align', 'lineHeight', 'text', 'width', 'height', 'wrap'],
        
        // cached variables
        attrChangeListLen = ATTR_CHANGE_LIST.length,
        dummyContext = document.createElement(CANVAS).getContext(CONTEXT_2D);

    /**
     * Text constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {String} [config.fontFamily] default is Calibri
     * @param {Number} [config.fontSize] in pixels.  Default is 12
     * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
     * @param {String} config.text
     * @param {String} [config.align] can be left, center, or right
     * @param {Number} [config.padding]
     * @param {Number} [config.width] default is auto
     * @param {Number} [config.height] default is auto
     * @param {Number} [config.lineHeight] default is 1
     * @param {String} [config.wrap] can be word, char, or none. Default is word
     * {{ShapeParams}}
     * {{NodeParams}}
     */
    Kinetic.Text = function(config) {
        this._initText(config);
    };
    function _fillFunc(context) {
        context.fillText(this.partialText, 0, 0);
    }
    function _strokeFunc(context) {
        context.strokeText(this.partialText, 0, 0);
    }

    Kinetic.Text.prototype = {
        _initText: function(config) {
            var that = this;
            this.createAttrs();
            
            // since width and height work a bit different for Text,
            // we need to default the values here
            this.attrs.width = AUTO;
            this.attrs.height = AUTO;
            
            // call super constructor
            Kinetic.Shape.call(this, config);

            this.shapeType = TEXT;
            this._fillFunc = _fillFunc;
            this._strokeFunc = _strokeFunc;
            this.shapeType = TEXT_UPPER;
            this._setDrawFuncs();

            // update text data for certain attr changes
            for(var n = 0; n < attrChangeListLen; n++) {
                this.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, that._setTextData);
            }

            this._setTextData();
        },
        drawFunc: function(canvas) {
            var context = canvas.getContext(), 
                p = this.getPadding(), 
                fontStyle = this.getFontStyle(),
                fontSize = this.getFontSize(),
                fontFamily = this.getFontFamily(),
                textHeight = this.getTextHeight(),
                lineHeightPx = this.getLineHeight() * textHeight, 
                textArr = this.textArr,
                textArrLen = textArr.length,
                totalWidth = this.getWidth();

            context.font = this._getContextFont();
            context.textBaseline = MIDDLE;
            context.textAlign = LEFT;
            context.save();
            context.translate(p, 0);
            context.translate(0, p + textHeight / 2);

            // draw text lines
            for(var n = 0; n < textArrLen; n++) {
                var obj = textArr[n],
                    text = obj.text,
                    width = obj.width;

                // horizontal alignment
                context.save();
                if(this.getAlign() === RIGHT) {
                    context.translate(totalWidth - width - p * 2, 0);
                }
                else if(this.getAlign() === CENTER) {
                    context.translate((totalWidth - width - p * 2) / 2, 0);
                }

                this.partialText = text;
                canvas.fillStroke(this);
                context.restore();
                context.translate(0, lineHeightPx);
            }
            context.restore();
        },
        drawHitFunc: function(canvas) {
            var context = canvas.getContext(), 
                width = this.getWidth(), 
                height = this.getHeight();

            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            canvas.fillStroke(this);
        },
        /**
         * set text
         * @name setText
         * @methodOf Kinetic.Text.prototype
         * @param {String} text
         */
        setText: function(text) {
            var str = Kinetic.Type._isString(text) ? text : text.toString();
            this.setAttr(TEXT, str);
        },
        /**
         * get width
         * @name getWidth
         * @methodOf Kinetic.Text.prototype
         */
        getWidth: function() {
            return this.attrs.width === AUTO ? this.getTextWidth() + this.getPadding() * 2 : this.attrs.width;
        },
        /**
         * get height
         * @name getHeight
         * @methodOf Kinetic.Text.prototype
         */
        getHeight: function() {
            return this.attrs.height === AUTO ? (this.getTextHeight() * this.textArr.length * this.getLineHeight()) + this.getPadding() * 2 : this.attrs.height;
        },
        /**
         * get text width
         * @name getTextWidth
         * @methodOf Kinetic.Text.prototype
         */
        getTextWidth: function() {
            return this.textWidth;
        },
        /**
         * get text height
         * @name getTextHeight
         * @methodOf Kinetic.Text.prototype
         */
        getTextHeight: function() {
            return this.textHeight;
        },
        _getTextSize: function(text) {
            var context = dummyContext,
                fontSize = this.getFontSize(),
                metrics;

            context.save();
            context.font = this._getContextFont();
            
            metrics = context.measureText(text);
            context.restore();
            return {
                width: metrics.width,
                height: parseInt(fontSize, 10)
            };
        },
        _getContextFont: function() {
            return this.getFontStyle() + SPACE + this.getFontSize() + PX_SPACE + this.getFontFamily();
        },
        _addTextLine: function (line, width, height) {
            return this.textArr.push({text: line, width: width});
        },
        _getTextWidth: function (text) {
            return dummyContext.measureText(text).width;
        },
        /**
         * set text data.  wrap logic and width and height setting occurs
         * here
         */
         _setTextData: function () {
             var lines = this.getText().split('\n'),
                 fontSize = +this.getFontSize(),
                 textWidth = 0,
                 lineHeightPx = this.getLineHeight() * fontSize,
                 width = this.attrs.width,
                 height = this.attrs.height,
                 fixedWidth = width !== AUTO,
                 fixedHeight = height !== AUTO,
                 padding = this.getPadding(),
                 maxWidth = width - padding * 2,
                 maxHeightPx = height - padding * 2,
                 currentHeightPx = 0,
                 wrap = this.getWrap(),
                 shouldWrap = wrap !== NONE,
                 wrapAtWord = wrap !==  CHAR && shouldWrap;

             this.textArr = [];
             dummyContext.save();
             dummyContext.font = this.getFontStyle() + SPACE + fontSize + PX_SPACE + this.getFontFamily();
             for (var i = 0, max = lines.length; i < max; ++i) {
                 var line = lines[i],
                     lineWidth = this._getTextWidth(line);
                 if (fixedWidth && lineWidth > maxWidth) {
                     /* 
                      * if width is fixed and line does not fit entirely
                      * break the line into multiple fitting lines
                      */
                     while (line.length > 0) {
                        /*
                         * use binary search to find the longest substring that
                         * that would fit in the specified width
                         */
                         var low = 0, high = line.length,
                             match = '', matchWidth = 0;
                         while (low < high) {
                             var mid = (low + high) >>> 1,
                                 substr = line.slice(0, mid + 1),
                                 substrWidth = this._getTextWidth(substr);
                             if (substrWidth <= maxWidth) {
                                 low = mid + 1;
                                 match = substr;
                                 matchWidth = substrWidth;
                             } else {
                                 high = mid;
                             }
                         }
                         /*
                          * 'low' is now the index of the substring end
                          * 'match' is the substring
                          * 'matchWidth' is the substring width in px
                          */
                         if (match) {
                             // a fitting substring was found
                             if (wrapAtWord) {
                                 // try to find a space or dash where wrapping could be done
                                 var wrapIndex = Math.max(match.lastIndexOf(SPACE),
                                                          match.lastIndexOf(DASH)) + 1;
                                 if (wrapIndex > 0) {
                                     // re-cut the substring found at the space/dash position
                                     low = wrapIndex;
                                     match = match.slice(0, low);
                                     matchWidth = this._getTextWidth(match);
                                 }
                             }
                             this._addTextLine(match, matchWidth);
                             currentHeightPx += lineHeightPx;
                             if (!shouldWrap ||
                                 (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)) {
                                 /*
                                  * stop wrapping if wrapping is disabled or if adding
                                  * one more line would overflow the fixed height
                                  */
                                 break;
                             }
                             line = line.slice(low);
                             if (line.length > 0) {
                                 // Check if the remaining text would fit on one line
                                 lineWidth = this._getTextWidth(line);
                                 if (lineWidth <= maxWidth) {
                                     // if it does, add the line and break out of the loop
                                     this._addTextLine(line, lineWidth);
                                     currentHeightPx += lineHeightPx;
                                     break;
                                 }
                             }
                         } else {
                             // not even one character could fit in the element, abort
                             break;
                         }
                     }
                 } else {
                     // element width is automatically adjusted to max line width
                     this._addTextLine(line, lineWidth);
                     currentHeightPx += lineHeightPx;
                     textWidth = Math.max(textWidth, lineWidth);
                 }
                 // if element height is fixed, abort if adding one more line would overflow
                 if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
                     break;
                 }
             }
             dummyContext.restore();
             this.textHeight = fontSize;
             this.textWidth = textWidth;
         }
    };
    Kinetic.Global.extend(Kinetic.Text, Kinetic.Shape);
 
    // add getters setters
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'fontFamily', CALIBRI);
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'fontSize', 12);
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'fontStyle', NORMAL);
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'padding', 0);
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'align', LEFT);
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'lineHeight', 1);
    Kinetic.Node.addGetterSetter(Kinetic.Text, 'wrap', WORD);

    Kinetic.Node.addGetter(Kinetic.Text, TEXT, EMPTY_STRING);
    
    Kinetic.Node.addSetter(Kinetic.Text, 'width');
    Kinetic.Node.addSetter(Kinetic.Text, 'height');

    /**
     * set font family
     * @name setFontFamily
     * @methodOf Kinetic.Text.prototype
     * @param {String} fontFamily
     */

    /**
     * set font size in pixels
     * @name setFontSize
     * @methodOf Kinetic.Text.prototype
     * @param {int} fontSize
     */

    /**
     * set font style.  Can be 'normal', 'italic', or 'bold'.  'normal' is the default.
     * @name setFontStyle
     * @methodOf Kinetic.Text.prototype
     * @param {String} fontStyle
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
     * @param {Number} lineHeight default is 1
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
})();
