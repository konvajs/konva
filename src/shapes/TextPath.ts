import { Util } from '../Util';
import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { Path } from './Path';
import { PathUtil } from './PathUtil';
import { Text, stringToArray } from './Text';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

import { GetSet, Vector2d } from '../types';

export interface TextPathConfig extends ShapeConfig {
  text?: string;
  data?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: string;
  letterSpacing?: number;
  pathStartOffset?: number;
}

var EMPTY_STRING = '',
  NORMAL = 'normal';

function _fillFunc(context) {
  context.fillText(this.partialText, this.pl, 0);
}
function _strokeFunc(context) {
  context.strokeText(this.partialText, 0, 0);
}

/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} [config.fontFamily] default is Arial
 * @param {Number} [config.fontSize] default is 12
 * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
 * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
 * @param {String} [config.textBaseline] Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'. Default is middle
 * @param {String} config.text
 * @param {String} config.data SVG data string
 * @@shapeParams
 * @@nodeParams
 * @example
 * var textpath = new Konva.TextPath({
 *   x: 100,
 *   y: 50,
 *   fill: '#333',
 *   fontSize: '24',
 *   fontFamily: 'Arial',
 *   text: 'All the world\'s a stage, and all the men and women merely players.',
 *   data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50'
 * });
 */
export class TextPath extends Shape<TextPathConfig> {
  dummyCanvas = Util.createCanvasElement();
  /*   dataArray = [];
    glyphInfo: Array<{
      p0: Vector2d;
      p1: Vector2d;
    }>; */
  partialText: string;
  textWidth: number;
  textHeight: number;

  pl: number;
  path: any;
  segmentsInfo: any;
  charBounds: any;
  chars: Array<string>;

  constructor(config?: TextPathConfig) {
    // call super constructor
    super(config);

    //this.dataArray = Path.parsePathData(this.attrs.data);
    this.path = PathUtil.makePathSimpler(this.attrs.data);
    this.segmentsInfo = PathUtil.getPathSegmentsInfo(this.path);

    this.on('dataChange.konva', function () {
      //this.dataArray = Path.parsePathData(this.attrs.data);
      this.path = PathUtil.makePathSimpler(this.attrs.data);
      this.segmentsInfo = PathUtil.getPathSegmentsInfo(this.path);
      this._setTextData();
    });

    // update text data for certain attr changes
    this.on(
      'textChange.konva alignChange.konva letterSpacingChange.konva fontSizeChange.konva fontFamilyChange.konva',
      this._setTextData
    );

    this._setTextData();
  }

  _sceneFunc(context) {
    context.setAttr('font', this._getContextFont());
    context.setAttr('textBaseline', this.textBaseline());
    context.setAttr('textAlign', 'left');
    context.save();

    var textDecoration = this.textDecoration();
    var fill = this.fill();
    var fontSize = this.fontSize();

    if (textDecoration === 'underline') {
      context.beginPath();
    }


    for (var i = 0, len = this.chars.length - 1; i <= len; i++) {
      context.save();

      let charBox = this.charBounds[i];

      context.translate(charBox.renderLeft, charBox.renderTop);
      context.rotate(charBox.angle);
      this.pl = - charBox.width / 2;

      this.partialText = this.chars[i];

      context.fillStrokeShape(this);
      if (textDecoration === 'underline') {
        if (i === 0) {
          context.moveTo(-charBox.width / 2, fontSize / 2 + 1);
        }
        context.lineTo(charBox.width / 2, fontSize / 2 + 1);
      }

      context.restore();
    }

    if (textDecoration === 'underline') {
      context.strokeStyle = fill;
      context.lineWidth = fontSize / 20;
      context.stroke();
    }
    context.restore();

    /* //test
    var tbl = this.textBaseline(), oy = 0, h = this.fontSize() / 2;
    if (tbl === 'middle')
      oy = 0
    else if (tbl === 'top' || tbl === 'hanging')
      oy = h;
    else if (tbl === 'bottom' || tbl === 'alphabetic' || tbl === 'ideographic')
      oy = -h;

    context.save();
    context.translate(0, oy);

    var glyphInfo = this.charBounds;
    if (glyphInfo.length >= 1) {
      var p0 = glyphInfo[0];
      context.moveTo(p0.renderLeft, p0.renderTop);
    }
    for (var i = 0; i < glyphInfo.length - 1; i++) {
      var p1 = glyphInfo[i];
      //context.save();
      //context.translate(p1.renderLeft, p1.renderTop);
      //context.rotate(p1.angle);
      //context.translate(-p1.renderLeft, -p1.renderTop); 
      context.lineTo(p1.renderLeft, p1.renderTop);
      //context.restore();
    }
    context.restore();
    context.setAttr('lineCap', 'square');
    context.setAttr('lineWidth', this.fontSize());
    context.strokeStyle = '#ff000050';
    context.stroke(); */

  }
  _hitFunc(context) {

    context.beginPath();
    var tbl = this.textBaseline(), oy = 0, h = this.fontSize() / 2;

    if (tbl === 'middle')
      oy = 0
    else if (tbl === 'top' || tbl === 'hanging')
      oy = h;
    else if (tbl === 'bottom' || tbl === 'alphabetic' || tbl === 'ideographic')
      oy = -h;

    context.save();
    context.translate(0, oy);

    var glyphInfo = this.charBounds;
    if (glyphInfo.length >= 1) {
      var p0 = glyphInfo[0];
      context.moveTo(p0.renderLeft, p0.renderTop + oy);
    }
    for (var i = 0; i < glyphInfo.length - 1; i++) {
      var p1 = glyphInfo[i];
      context.lineTo(p1.renderLeft, p1.renderTop + oy);
    }

    //let lineCap = context._context["lineCap"];
    context.setAttr('lineCap', 'square');
    context.setAttr('lineWidth', this.fontSize());
    context.setAttr('strokeStyle', this.colorKey);
    context.stroke();
    context.restore();
  }
  /**
   * get text width in pixels
   * @method
   * @name Konva.TextPath#getTextWidth
   */
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    Util.warn(
      'text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.'
    );
    return this.textHeight;
  }
  setText(text) {
    return Text.prototype.setText.call(this, text);
  }

  _getContextFont() {
    return Text.prototype._getContextFont.call(this);
  }

  _getTextSize(text) {
    var dummyCanvas = this.dummyCanvas;
    var _context = dummyCanvas.getContext('2d');

    _context.save();
    _context.font = this._getContextFont();
    var metrics = _context.measureText(text);
    _context.restore();

    return {
      width: metrics.width,
      height: parseInt(this.attrs.fontSize, 10),
    };
  }
  _setTextData() {
    this.chars = this._graphemeSplit(this.text());
    this._measureLine();
  }
  getSelfRect() {
    var fontSize = this.fontSize();

    var xs = this.charBounds.map(x => x.renderLeft);
    var ys = this.charBounds.map(x => x.renderTop);
    xs.pop();
    ys.pop();

    return {
      x: Math.min(...xs) - fontSize / 2,
      y: Math.min(...ys) - fontSize / 2,
      width: Math.max(...xs) - Math.min(...xs) + fontSize,
      height: Math.max(...ys) - Math.min(...ys) + fontSize,
    };
  }


  /**
   * Divide a string in the user perceived single units
   * @memberOf fabric.util.string
   * @param {String} textstring String to escape
   * @return {Array} array containing the graphemes
   */
  _graphemeSplit(textstring: string) {
    var i = 0, chr, graphemes = [];
    for (i = 0, chr; i < textstring.length; i++) {
      if ((chr = this._getWholeChar(textstring, i)) === false) {
        continue;
      }
      graphemes.push(chr);
    }
    return graphemes;
  }

  // taken from mdn in the charAt doc page.
  _getWholeChar(str: string, i: number) {
    var code = str.charCodeAt(i);
    if (isNaN(code)) {
      return ''; // Position not found
    }
    if (code < 0xD800 || code > 0xDFFF) {
      return str.charAt(i);
    }

    // High surrogate (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xD800 <= code && code <= 0xDBFF) {
      if (str.length <= (i + 1)) {
        throw 'High surrogate without following low surrogate';
      }
      var next = str.charCodeAt(i + 1);
      if (0xDC00 > next || next > 0xDFFF) {
        throw 'High surrogate without following low surrogate';
      }
      return str.charAt(i) + str.charAt(i + 1);
    }
    // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
    if (i === 0) {
      throw 'Low surrogate without preceding high surrogate';
    }
    var prev = str.charCodeAt(i - 1);

    // (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xD800 > prev || prev > 0xDBFF) {
      throw 'Low surrogate without preceding high surrogate';
    }
    // We can pass over low surrogates now as the second component
    // in a pair which we have already processed
    return false;
  }

  _measureLine() {
    var width = 0, i = 0, grapheme,
      graphemeInfo, numOfSpaces = 0,
      positionInPath = 0, startingPoint, totalPathLength,
      reverse = false;// this.pathSide === 'right';

    this.charBounds = new Array(this.chars.length);
    for (i = 0; i < this.chars.length; i++) {
      grapheme = this.chars[i];
      graphemeInfo = this._getGraphemeBox(grapheme);
      this.charBounds[i] = graphemeInfo;
      width += graphemeInfo.kernedWidth;
    }
    // this latest bound box represent the last character of the line
    // to simplify cursor handling in interactive mode.
    this.charBounds[i] = {
      left: graphemeInfo ? graphemeInfo.left + graphemeInfo.width : 0,
      width: 0,
      kernedWidth: 0,
      height: this.fontSize()
    };

    totalPathLength = this.segmentsInfo[this.segmentsInfo.length - 1].length;
    startingPoint = PathUtil.getPointOnPath(this.path, 0, this.segmentsInfo);
    switch (this.align()) {
      case 'left':
        positionInPath = reverse ? (totalPathLength - width) : 0;
        break;
      case 'center':
        positionInPath = (totalPathLength - width) / 2;
        break;
      case 'right':
        positionInPath = reverse ? 0 : (totalPathLength - width);
        break;
      //todo - add support for justify
    }
    positionInPath += this.pathStartOffset() * (reverse ? -1 : 1);
    for (i = reverse ? this.chars.length - 1 : 0;
      reverse ? i >= 0 : i < this.chars.length;
      reverse ? i-- : i++) {
      graphemeInfo = this.charBounds[i];
      if (positionInPath > totalPathLength)
        positionInPath %= totalPathLength;
      else if (positionInPath < 0)
        positionInPath += totalPathLength;

      // it would probably much faster to send all the grapheme position for a line
      // and calculate path position/angle at once.
      this._setGraphemeOnPath(positionInPath, graphemeInfo, startingPoint);
      positionInPath += graphemeInfo.kernedWidth;
    }

    return { width: width, numOfSpaces: numOfSpaces };
  }
  /**
    * Measure and return the info of a single grapheme.
    * needs the the info of previous graphemes already filled
    * @private
    * @param {String} grapheme to be measured
    * @param {Number} lineIndex index of the line where the char is
    * @param {Number} charIndex position in the line
    * @param {String} [prevGrapheme] character preceding the one to be measured
    */
  _getGraphemeBox(grapheme: string) {
    var size = this._getTextSize(grapheme);
    var width = size.width, kernedWidth = size.width, charSpacing = 0;

    if (this.letterSpacing() !== 0) {
      charSpacing = this.letterSpacing();// this._getWidthOfCharSpacing();
      width += charSpacing;
      kernedWidth += charSpacing;
    }

    return {
      width: width,
      // left: 0,
      height: size.height,
      kernedWidth: kernedWidth,
      // deltaY: 0,
    };
  }



  _setGraphemeOnPath(positionInPath, graphemeInfo, startingPoint) {
    var centerPosition = positionInPath + graphemeInfo.kernedWidth / 2;

    // we are at currentPositionOnPath. we want to know what point on the path is.
    var info = PathUtil.getPointOnPath(this.path, centerPosition, this.segmentsInfo);
    graphemeInfo.renderLeft = info.x - startingPoint.x;
    graphemeInfo.renderTop = info.y - startingPoint.y;
    graphemeInfo.angle = info.angle + 0;//(this.pathSide ===  'right' ? Math.PI : 0);
  }



  fontFamily: GetSet<string, this>;
  fontSize: GetSet<number, this>;
  fontStyle: GetSet<string, this>;
  fontVariant: GetSet<string, this>;
  align: GetSet<string, this>;
  letterSpacing: GetSet<number, this>;
  text: GetSet<string, this>;
  data: GetSet<string, this>;

  textBaseline: GetSet<string, this>;
  textDecoration: GetSet<string, this>;
  pathStartOffset: GetSet<number, this>;
}

TextPath.prototype._fillFunc = _fillFunc;
TextPath.prototype._strokeFunc = _strokeFunc;
TextPath.prototype._fillFuncHit = _fillFunc;
TextPath.prototype._strokeFuncHit = _strokeFunc;
TextPath.prototype.className = 'TextPath';
TextPath.prototype._attrsAffectingSize = ['text', 'fontSize', 'data'];
_registerNode(TextPath);

/**
 * get/set SVG path data string.  This method
 *  also automatically parses the data string
 *  into a data array.  Currently supported SVG data:
 *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
 * @name Konva.TextPath#data
 * @method
 * @param {String} data svg path string
 * @returns {String}
 * @example
 * // get data
 * var data = shape.data();
 *
 * // set data
 * shape.data('M200,100h100v50z');
 */
Factory.addGetterSetter(TextPath, 'data');

/**
 * get/set font family
 * @name Konva.TextPath#fontFamily
 * @method
 * @param {String} fontFamily
 * @returns {String}
 * @example
 * // get font family
 * var fontFamily = shape.fontFamily();
 *
 * // set font family
 * shape.fontFamily('Arial');
 */
Factory.addGetterSetter(TextPath, 'fontFamily', 'Arial');

/**
 * get/set font size in pixels
 * @name Konva.TextPath#fontSize
 * @method
 * @param {Number} fontSize
 * @returns {Number}
 * @example
 * // get font size
 * var fontSize = shape.fontSize();
 *
 * // set font size to 22px
 * shape.fontSize(22);
 */

Factory.addGetterSetter(TextPath, 'fontSize', 12, getNumberValidator());

/**
 * get/set font style.  Can be 'normal', 'italic', or 'bold'.  'normal' is the default.
 * @name Konva.TextPath#fontStyle
 * @method
 * @param {String} fontStyle
 * @returns {String}
 * @example
 * // get font style
 * var fontStyle = shape.fontStyle();
 *
 * // set font style
 * shape.fontStyle('bold');
 */

Factory.addGetterSetter(TextPath, 'fontStyle', NORMAL);

/**
 * get/set horizontal align of text.  Can be 'left', 'center', 'right' or 'justify'
 * @name Konva.TextPath#align
 * @method
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
Factory.addGetterSetter(TextPath, 'align', 'left');

/**
 * get/set letter spacing.  The default is 0.
 * @name Konva.TextPath#letterSpacing
 * @method
 * @param {Number} letterSpacing
 * @returns {Number}
 * @example
 * // get letter spacing value
 * var letterSpacing = shape.letterSpacing();
 *
 * // set the letter spacing value
 * shape.letterSpacing(2);
 */

Factory.addGetterSetter(TextPath, 'letterSpacing', 0, getNumberValidator());

/**
 * get/set text baseline.  The default is 'middle'. Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'
 * @name Konva.TextPath#textBaseline
 * @method
 * @param {String} textBaseline
 * @returns {String}
 * @example
 * // get current text baseline
 * var textBaseline = shape.textBaseline();
 *
 * // set new text baseline
 * shape.textBaseline('top');
 */
Factory.addGetterSetter(TextPath, 'textBaseline', 'middle');

/**
 * get/set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
 * @name Konva.TextPath#fontVariant
 * @method
 * @param {String} fontVariant
 * @returns {String}
 * @example
 * // get font variant
 * var fontVariant = shape.fontVariant();
 *
 * // set font variant
 * shape.fontVariant('small-caps');
 */
Factory.addGetterSetter(TextPath, 'fontVariant', NORMAL);

/**
 * get/set text
 * @name Konva.TextPath#getText
 * @method
 * @param {String} text
 * @returns {String}
 * @example
 * // get text
 * var text = text.text();
 *
 * // set text
 * text.text('Hello world!');
 */
Factory.addGetterSetter(TextPath, 'text', EMPTY_STRING);

/**
 * get/set text decoration of a text.  Can be '' or 'underline'.
 * @name Konva.TextPath#textDecoration
 * @method
 * @param {String} textDecoration
 * @returns {String}
 * @example
 * // get text decoration
 * var textDecoration = shape.textDecoration();
 *
 * // underline text
 * shape.textDecoration('underline');
 */
Factory.addGetterSetter(TextPath, 'textDecoration', null);


Factory.addGetterSetter(TextPath, 'pathStartOffset', 0, getNumberValidator());

