(function() {
    /**
     * Text constructor
     * @constructor
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {String} config.textFill
     * @param {String} config.textStroke
     * @param {Number} config.textStrokeWidth
     * @param {String} config.fontFamily default is Calibri
     * @param {Number} config.fontSize default is 12
     * @param {String} config.fontStyle can be normal, bold, or italic.  Default is normal
     * @param {String} config.text
     * @param {String} config.align can be left, center, or right
     * @param {String} config.verticalAlign can be top, middle, or bottom
     * @param {Number} config.padding
     * @param {Number} config.width default is auto
     * @param {Number} config.height default is auto
     * @param {Number} config.lineHeight default is 1.2
     */
    Kinetic.Text = function(config) {
        this._initText(config);
    };

    Kinetic.Text.prototype = {
        _initText: function(config) {
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
                lineHeight: 1.2
            });

            this.dummyCanvas = document.createElement('canvas');
            
            // call super constructor
            Kinetic.Shape.call(this, config);
            this.shapeType = 'Text';
            this._setDrawFuncs();

            // update text data for certain attr changes
            var attrs = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'align', 'lineHeight', 'text', 'width', 'height'];
            var that = this;
            for(var n = 0; n < attrs.length; n++) {
                var attr = attrs[n];
                this.on(attr + 'Change.kinetic', that._setTextData);
            }
            that._setTextData();
        },
        drawFunc: function(canvas) {
            var context = canvas.getContext(), p = this.attrs.padding, lineHeightPx = this.attrs.lineHeight * this.getTextHeight(), textArr = this.textArr;

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
                    context.translate(this.getWidth() - this._getTextSize(text).width - p * 2, 0);
                }
                else if(this.attrs.align === 'center') {
                    context.translate((this.getWidth() - this._getTextSize(text).width - p * 2) / 2, 0);
                }

                canvas.fillStrokeText(this, text);
                context.restore();
                context.translate(0, lineHeightPx);
            }
            context.restore();
        },
        drawHitFunc: function(canvas) {
        	var context = canvas.getContext(), width = this.getWidth(), height = this.getHeight();
        	
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
            this.setAttr('text', str);
        },
        /**
         * get width
         * @name getWidth
         * @methodOf Kinetic.Text.prototype
         */
        getWidth: function() {
            return this.attrs.width === 'auto' ? this.getTextWidth() + this.attrs.padding * 2 : this.attrs.width;
        },
        /**
         * get height
         * @name getHeight
         * @methodOf Kinetic.Text.prototype
         */
        getHeight: function() {
            return this.attrs.height === 'auto' ? (this.getTextHeight() * this.textArr.length * this.attrs.lineHeight) + this.attrs.padding * 2 : this.attrs.height;
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
            var row = 0;
            var addLine = true;
            this.textWidth = 0;
            this.textHeight = this._getTextSize(this.attrs.text).height;
            var lineHeightPx = this.attrs.lineHeight * this.textHeight;
            while(charArr.length > 0 && addLine && (this.attrs.height === 'auto' || lineHeightPx * (row + 1) < this.attrs.height - this.attrs.padding * 2)) {
                var index = 0;
                var line = undefined;
                addLine = false;

                while(index < charArr.length) {
                    if(charArr.indexOf('\n') === index) {
                        // remove newline char
                        charArr.splice(index, 1);
                        line = charArr.splice(0, index).join('');
                        break;
                    }

                    // if line exceeds inner box width
                    var lineArr = charArr.slice(0, index);
                    if(this.attrs.width !== 'auto' && this._getTextSize(lineArr.join('')).width > this.attrs.width - this.attrs.padding * 2) {
                        /*
                         * if a single character is too large to fit inside
                         * the text box width, then break out of the loop
                         * and stop processing
                         */
                        if(index == 0) {
                            break;
                        }
                        var lastSpace = lineArr.lastIndexOf(' ');
                        var lastDash = lineArr.lastIndexOf('-');
                        var wrapIndex = Math.max(lastSpace, lastDash);
                        if(wrapIndex >= 0) {
                            line = charArr.splice(0, 1 + wrapIndex).join('');
                            break;
                        }
                        /*
                         * if not able to word wrap based on space or dash,
                         * go ahead and wrap in the middle of a word if needed
                         */
                        line = charArr.splice(0, index).join('');
                        break;
                    }
                    index++;

                    // if the end is reached
                    if(index === charArr.length) {
                        line = charArr.splice(0, index).join('');
                    }
                }
                this.textWidth = Math.max(this.textWidth, this._getTextSize(line).width);
                if(line !== undefined) {
                    arr.push(line);
                    addLine = true;
                }
                row++;
            }
            this.textArr = arr;
        }
    };
    Kinetic.Global.extend(Kinetic.Text, Kinetic.Shape);

    /*
     * extend canvas renderers
     */
    var fillText = function(shape, text, skipShadow) {
        var textFill = shape.getFill(), context = this.context;
        if(textFill) {
            context.save();
            if(!skipShadow && shape.hasShadow()) {
                this._applyShadow(shape);
            }
            context.fillStyle = textFill;
            context.fillText(text, 0, 0);
            context.restore();

            if(!skipShadow && shape.hasShadow()) {
                this.fillText(shape, text, true);
            }
        }
    };
    var strokeText = function(shape, text, skipShadow) {
        var textStroke = shape.getStroke(), textStrokeWidth = shape.getStrokeWidth(), context = this.context;
        if(textStroke || textStrokeWidth) {
            context.save();
            if(!skipShadow && shape.hasShadow()) {
                this._applyShadow(shape);
            }

            context.lineWidth = textStrokeWidth || 2;
            context.strokeStyle = textStroke || 'black';
            context.strokeText(text, 0, 0);
            context.restore();

            if(!skipShadow && shape.hasShadow()) {
                this.strokeText(shape, text, true);
            }
        }
    };
    var fillStrokeText = function(shape, text) {
        this.fillText(shape, text);
        this.strokeText(shape, text, shape.hasShadow() && shape.getFill());
    };

    // scene canvases
    Kinetic.SceneCanvas.prototype.fillText = fillText;
    Kinetic.SceneCanvas.prototype.strokeText = strokeText;
    Kinetic.SceneCanvas.prototype.fillStrokeText = fillStrokeText;
    
    // hit canvases
    Kinetic.HitCanvas.prototype.fillText = fillText;
    Kinetic.HitCanvas.prototype.strokeText = strokeText;
    Kinetic.HitCanvas.prototype.fillStrokeText = fillStrokeText;

    // add getters setters
    Kinetic.Node.addGettersSetters(Kinetic.Text, ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'align', 'lineHeight']);
    Kinetic.Node.addGetters(Kinetic.Text, ['text']);
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
     * @param {Number} lineHeight default is 1.2
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
