/*eslint-disable max-depth */
(function() {
  'use strict';
  // var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  // constants
  var AUTO = 'auto',
    //CANVAS = 'canvas',
    CENTER = 'center',
    JUSTIFY = 'justify',
    CHANGE_KONVA = 'Change.konva',
    CONTEXT_2D = '2d',
    DASH = '-',
    EMPTY_STRING = '',
    LEFT = 'left',
    TEXT = 'text',
    TEXT_UPPER = 'Text',
    TOP = 'top',
    BOTTOM = 'bottom',
    MIDDLE = 'middle',
    NORMAL = 'normal',
    PX_SPACE = 'px ',
    SPACE = ' ',
    RIGHT = 'right',
    WORD = 'word',
    CHAR = 'char',
    NONE = 'none',
    ELLIPSIS = '…',
    ATTR_CHANGE_LIST = [
      'fontFamily',
      'fontSize',
      'fontStyle',
      'fontVariant',
      'padding',
      'align',
      'verticalAlign',
      'lineHeight',
      'text',
      'width',
      'height',
      'wrap',
      'ellipsis',
      'letterSpacing'
    ],
    // cached variables
    attrChangeListLen = ATTR_CHANGE_LIST.length;
  var dummyContext;
  function getDummyContext() {
    if (dummyContext) {
      return dummyContext;
    }
    dummyContext = Konva.Util.createCanvasElement().getContext(CONTEXT_2D);
    return dummyContext;
  }

  /**
   * Text constructor
   * @constructor
   * @memberof Konva
   * @augments Konva.Shape
   * @param {Object} config
   * @param {String} [config.fontFamily] default is Arial
   * @param {Number} [config.fontSize] in pixels.  Default is 12
   * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
   * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
   * @param {String} config.text
   * @param {String} [config.align] can be left, center, or right
   * @param {String} [config.verticalAlign] can be top, middle or bottom
   * @param {Number} [config.padding]
   * @param {Number} [config.lineHeight] default is 1
   * @param {String} [config.wrap] can be word, char, or none. Default is word
   * @param {Boolean} [config.ellipsis] can be true or false. Default is false. if Konva.Text config is set to wrap="none" and ellipsis=true, then it will add "..." to the end
   * @@shapeParams
   * @@nodeParams
   * @example
   * var text = new Konva.Text({
   *   x: 10,
   *   y: 15,
   *   text: 'Simple Text',
   *   fontSize: 30,
   *   fontFamily: 'Calibri',
   *   fill: 'green'
   * });
   */
  Konva.Text = function(config) {
    this.___init(config);
  };
  function _fillFunc(context) {
    context.fillText(this.partialText, 0, 0);
  }
  function _strokeFunc(context) {
    context.strokeText(this.partialText, 0, 0);
  }

  Konva.Text.prototype = {
    ___init: function(config) {
      config = config || {};

      // set default color to black
      if (
        !config.fillLinearGradientColorStops &&
        !config.fillRadialGradientColorStops
      ) {
        config.fill = config.fill || 'black';
      }
      //
      // if (config.width === undefined) {
      //     config.width = AUTO;
      // }
      // if (config.height === undefined) {
      //     config.height = AUTO;
      // }

      // call super constructor
      Konva.Shape.call(this, config);

      this._fillFunc = _fillFunc;
      this._strokeFunc = _strokeFunc;
      this.className = TEXT_UPPER;

      // update text data for certain attr changes
      for (var n = 0; n < attrChangeListLen; n++) {
        this.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, this._setTextData);
      }

      this._setTextData();
      this.sceneFunc(this._sceneFunc);
      this.hitFunc(this._hitFunc);
    },
    _sceneFunc: function(context) {
      var padding = this.getPadding(),
        textHeight = this.getTextHeight(),
        lineHeightPx = this.getLineHeight() * textHeight,
        textArr = this.textArr,
        textArrLen = textArr.length,
        verticalAlign = this.getVerticalAlign(),
        alignY = 0,
        align = this.getAlign(),
        totalWidth = this.getWidth(),
        letterSpacing = this.getLetterSpacing(),
        textDecoration = this.textDecoration(),
        fill = this.fill(),
        fontSize = this.fontSize(),
        n;

      context.setAttr('font', this._getContextFont());

      context.setAttr('textBaseline', MIDDLE);
      context.setAttr('textAlign', LEFT);

      // handle vertical alignment
      if (verticalAlign === MIDDLE) {
        alignY =
          (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
      } else if (verticalAlign === BOTTOM) {
        alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
      }

      if (padding) {
        context.translate(padding, 0);
        context.translate(0, alignY + padding + lineHeightPx / 2);
      } else {
        context.translate(0, alignY + lineHeightPx / 2);
      }

      // draw text lines
      for (n = 0; n < textArrLen; n++) {
        var obj = textArr[n],
          text = obj.text,
          width = obj.width,
          lastLine = n !== textArrLen - 1,
          spacesNumber,
          oneWord,
          lineWidth;

        // horizontal alignment
        context.save();
        if (align === RIGHT) {
          context.translate(totalWidth - width - padding * 2, 0);
        } else if (align === CENTER) {
          context.translate((totalWidth - width - padding * 2) / 2, 0);
        }

        if (textDecoration.indexOf('underline') !== -1) {
          context.save();
          context.beginPath();

          context.moveTo(0, Math.round(lineHeightPx / 2));
          spacesNumber = text.split(' ').length - 1;
          oneWord = spacesNumber === 0;
          lineWidth =
            align === JUSTIFY && lastLine && !oneWord
              ? totalWidth - padding * 2
              : width;
          context.lineTo(Math.round(lineWidth), Math.round(lineHeightPx / 2));
          // TODO: I have no idea what is real ratio
          // just /15 looks good enough
          context.lineWidth = fontSize / 15;
          context.strokeStyle = fill;
          context.stroke();
          context.restore();
        }
        if (textDecoration.indexOf('line-through') !== -1) {
          context.save();
          context.beginPath();
          context.moveTo(0, 0);
          spacesNumber = text.split(' ').length - 1;
          oneWord = spacesNumber === 0;
          lineWidth =
            align === JUSTIFY && lastLine && !oneWord
              ? totalWidth - padding * 2
              : width;
          context.lineTo(Math.round(lineWidth), 0);
          context.lineWidth = fontSize / 15;
          context.strokeStyle = fill;
          context.stroke();
          context.restore();
        }
        if (letterSpacing !== 0 || align === JUSTIFY) {
          //   var words = text.split(' ');
          spacesNumber = text.split(' ').length - 1;
          for (var li = 0; li < text.length; li++) {
            var letter = text[li];
            // skip justify for the last line
            if (letter === ' ' && n !== textArrLen - 1 && align === JUSTIFY) {
              context.translate(
                Math.floor((totalWidth - padding * 2 - width) / spacesNumber),
                0
              );
            }
            this.partialText = letter;
            context.fillStrokeShape(this);
            context.translate(
              Math.round(this._getTextSize(letter).width) + letterSpacing,
              0
            );
          }
        } else {
          this.partialText = text;

          context.fillStrokeShape(this);
        }
        context.restore();
        if (textArrLen > 1) {
          context.translate(0, lineHeightPx);
        }
      }
    },
    _hitFunc: function(context) {
      var width = this.getWidth(),
        height = this.getHeight();

      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(this);
    },
    setText: function(text) {
      var str = Konva.Util._isString(text) ? text : (text || '').toString();
      this._setAttr(TEXT, str);
      return this;
    },
    /**
     * get width of text area, which includes padding
     * @method
     * @memberof Konva.Text.prototype
     * @returns {Number}
     */
    getWidth: function() {
      var isAuto = this.attrs.width === AUTO || this.attrs.width === undefined;
      return isAuto
        ? this.getTextWidth() + this.getPadding() * 2
        : this.attrs.width;
    },
    /**
     * get the height of the text area, which takes into account multi-line text, line heights, and padding
     * @method
     * @memberof Konva.Text.prototype
     * @returns {Number}
     */
    getHeight: function() {
      var isAuto =
        this.attrs.height === AUTO || this.attrs.height === undefined;
      return isAuto
        ? this.getTextHeight() * this.textArr.length * this.getLineHeight() +
            this.getPadding() * 2
        : this.attrs.height;
    },
    /**
     * get text width
     * @method
     * @memberof Konva.Text.prototype
     * @returns {Number}
     */
    getTextWidth: function() {
      return this.textWidth;
    },
    /**
     * get height of one line text
     * @method
     * @memberof Konva.Text.prototype
     * @returns {Number}
     */
    getTextHeight: function() {
      return this.textHeight;
    },
    _getTextSize: function(text) {
      var _context = getDummyContext(),
        fontSize = this.getFontSize(),
        metrics;

      _context.save();
      _context.font = this._getContextFont();

      metrics = _context.measureText(text);
      _context.restore();
      return {
        width: metrics.width,
        height: parseInt(fontSize, 10)
      };
    },
    _getContextFont: function() {
      // IE don't want to work with usual font style
      // bold was not working
      // removing font variant will solve
      // fix for: https://github.com/konvajs/konva/issues/94
      if (Konva.UA.isIE) {
        return (
          this.getFontStyle() +
          SPACE +
          this.getFontSize() +
          PX_SPACE +
          this.getFontFamily()
        );
      }
      return (
        this.getFontStyle() +
        SPACE +
        this.getFontVariant() +
        SPACE +
        this.getFontSize() +
        PX_SPACE +
        this.getFontFamily()
      );
    },
    _addTextLine: function(line) {
      if (this.align() === JUSTIFY) {
        line = line.trim();
      }
      var width = this._getTextWidth(line);
      return this.textArr.push({ text: line, width: width });
    },
    _getTextWidth: function(text) {
      var latterSpacing = this.getLetterSpacing();
      var length = text.length;
      return (
        getDummyContext().measureText(text).width +
        (length ? latterSpacing * (length - 1) : 0)
      );
    },
    _setTextData: function() {
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
        // align = this.getAlign(),
        shouldWrap = wrap !== NONE,
        wrapAtWord = wrap !== CHAR && shouldWrap,
        shouldAddEllipsis = this.getEllipsis() && !shouldWrap;

      this.textArr = [];
      getDummyContext().font = this._getContextFont();
      for (var i = 0, max = lines.length; i < max; ++i) {
        var line = lines[i];
        var additionalWidth = shouldAddEllipsis
          ? this._getTextWidth(ELLIPSIS)
          : 0;

        var lineWidth = this._getTextWidth(line);
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
            var low = 0,
              high = line.length,
              match = '',
              matchWidth = 0;
            while (low < high) {
              var mid = (low + high) >>> 1,
                substr = line.slice(0, mid + 1),
                substrWidth = this._getTextWidth(substr) + additionalWidth;
              if (substrWidth <= maxWidth) {
                low = mid + 1;
                match = substr + (shouldAddEllipsis ? ELLIPSIS : '');
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
                var wrapIndex;
                var nextChar = line[match.length];
                var nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
                if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                  wrapIndex = match.length;
                } else {
                  wrapIndex =
                    Math.max(
                      match.lastIndexOf(SPACE),
                      match.lastIndexOf(DASH)
                    ) + 1;
                }
                if (wrapIndex > 0) {
                  // re-cut the substring found at the space/dash position
                  low = wrapIndex;
                  match = match.slice(0, low);
                  matchWidth = this._getTextWidth(match);
                }
              }
              // if (align === 'right') {
              match = Konva.Util.trimRight(match);
              // }
              this._addTextLine(match);
              textWidth = Math.max(textWidth, matchWidth);
              currentHeightPx += lineHeightPx;
              if (
                !shouldWrap ||
                (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx)
              ) {
                /*
                * stop wrapping if wrapping is disabled or if adding
                * one more line would overflow the fixed height
                */
                break;
              }
              line = line.slice(low);
              line = Konva.Util.trimLeft(line);
              if (line.length > 0) {
                // Check if the remaining text would fit on one line
                lineWidth = this._getTextWidth(line);
                if (lineWidth <= maxWidth) {
                  // if it does, add the line and break out of the loop
                  this._addTextLine(line);
                  currentHeightPx += lineHeightPx;
                  textWidth = Math.max(textWidth, lineWidth);
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
          this._addTextLine(line);
          currentHeightPx += lineHeightPx;
          textWidth = Math.max(textWidth, lineWidth);
        }
        // if element height is fixed, abort if adding one more line would overflow
        if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
          break;
        }
      }
      this.textHeight = fontSize;
      // var maxTextWidth = 0;
      // for(var j = 0; j < this.textArr.length; j++) {
      //     maxTextWidth = Math.max(maxTextWidth, this.textArr[j].width);
      // }
      this.textWidth = textWidth;
    }
  };
  Konva.Util.extend(Konva.Text, Konva.Shape);

  Konva.Factory.addSetter(
    Konva.Node,
    'width',
    Konva.Validators.getNumberOrAutoValidator()
  );

  Konva.Factory.addSetter(
    Konva.Node,
    'height',
    Konva.Validators.getNumberOrAutoValidator()
  );

  // add getters setters
  Konva.Factory.addGetterSetter(Konva.Text, 'fontFamily', 'Arial');

  /**
   * get/set font family
   * @name fontFamily
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} fontFamily
   * @returns {String}
   * @example
   * // get font family
   * var fontFamily = text.fontFamily();
   *
   * // set font family
   * text.fontFamily('Arial');
   */

  Konva.Factory.addGetterSetter(
    Konva.Text,
    'fontSize',
    12,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set font size in pixels
   * @name fontSize
   * @method
   * @memberof Konva.Text.prototype
   * @param {Number} fontSize
   * @returns {Number}
   * @example
   * // get font size
   * var fontSize = text.fontSize();
   *
   * // set font size to 22px
   * text.fontSize(22);
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'fontStyle', NORMAL);

  /**
   * set font style.  Can be 'normal', 'italic', or 'bold'.  'normal' is the default.
   * @name fontStyle
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} fontStyle
   * @returns {String}
   * @example
   * // get font style
   * var fontStyle = text.fontStyle();
   *
   * // set font style
   * text.fontStyle('bold');
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'fontVariant', NORMAL);

  /**
   * set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
   * @name fontVariant
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} fontVariant
   * @returns {String}
   * @example
   * // get font variant
   * var fontVariant = text.fontVariant();
   *
   * // set font variant
   * text.fontVariant('small-caps');
   */

  Konva.Factory.addGetterSetter(
    Konva.Text,
    'padding',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * set padding
   * @name padding
   * @method
   * @memberof Konva.Text.prototype
   * @param {Number} padding
   * @returns {Number}
   * @example
   * // get padding
   * var padding = text.padding();
   *
   * // set padding to 10 pixels
   * text.padding(10);
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'align', LEFT);

  /**
   * get/set horizontal align of text.  Can be 'left', 'center', 'right' or 'justify'
   * @name align
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} align
   * @returns {String}
   * @example
   * // get text align
   * var align = text.align();
   *
   * // center text
   * text.align('center');
   *
   * // align text to right
   * text.align('right');
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'verticalAlign', TOP);

  /**
   * get/set vertical align of text.  Can be 'top', 'middle', 'bottom'.
   * @name verticalAlign
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} verticalAlign
   * @returns {String}
   * @example
   * // get text vertical align
   * var verticalAlign = text.verticalAlign();
   *
   * // center text
   * text.verticalAlign('middle');
   */

  Konva.Factory.addGetterSetter(
    Konva.Text,
    'lineHeight',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set line height.  The default is 1.
   * @name lineHeight
   * @method
   * @memberof Konva.Text.prototype
   * @param {Number} lineHeight
   * @returns {Number}
   * @example
   * // get line height
   * var lineHeight = text.lineHeight();
   *
   * // set the line height
   * text.lineHeight(2);
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'wrap', WORD);

  /**
   * get/set wrap.  Can be word, char, or none. Default is word.
   * @name wrap
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} wrap
   * @returns {String}
   * @example
   * // get wrap
   * var wrap = text.wrap();
   *
   * // set wrap
   * text.wrap('word');
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'ellipsis', false);

  /**
   * get/set ellipsis.  Can be true or false. Default is false.
   * if Konva.Text config is set to wrap="none" and ellipsis=true, then it will add "..." to the end
   * @name ellipsis
   * @method
   * @memberof Konva.Text.prototype
   * @param {Boolean} ellipsis
   * @returns {Boolean}
   * @example
   * // get ellipsis
   * var ellipsis = text.ellipsis();
   *
   * // set ellipsis
   * text.ellipsis(true);
   */

  Konva.Factory.addGetterSetter(
    Konva.Text,
    'letterSpacing',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * set letter spacing property. Default value is 0.
   * @name letterSpacing
   * @method
   * @memberof Konva.TextPath.prototype
   * @param {Number} letterSpacing
   */

  Konva.Factory.addGetter(Konva.Text, 'text', EMPTY_STRING);
  Konva.Factory.addOverloadedGetterSetter(Konva.Text, 'text');

  /**
   * get/set text
   * @name getText
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} text
   * @returns {String}
   * @example
   * // get text
   * var text = text.text();
   *
   * // set text
   * text.text('Hello world!');
   */

  Konva.Factory.addGetterSetter(Konva.Text, 'textDecoration', EMPTY_STRING);

  /**
   * get/set text decoration of a text.  Possible values are 'underline', 'line-through' or combination of these values separated by space
   * @name textDecoration
   * @method
   * @memberof Konva.Text.prototype
   * @param {String} textDecoration
   * @returns {String}
   * @example
   * // get text decoration
   * var textDecoration = text.textDecoration();
   *
   * // underline text
   * text.textDecoration('underline');
   *
   * // strike text
   * text.textDecoration('line-through');
   *
   * // underline and strike text
   * text.textDecoration('underline line-through');
   */

  Konva.Collection.mapMethods(Konva.Text);
})();
