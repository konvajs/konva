import { Util } from '../Util';
import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { Path } from './Path';
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
}

var EMPTY_STRING = '',
  NORMAL = 'normal';

function _fillFunc(context) {
  context.fillText(this.partialText, 0, 0);
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
 * @param {Function} config.kerningFunc a getter for kerning values for the specified characters
 * @@shapeParams
 * @@nodeParams
 * @example
 * var kerningPairs = {
 *   'A': {
 *     ' ': -0.05517578125,
 *     'T': -0.07421875,
 *     'V': -0.07421875
 *   }
 *   'V': {
 *     ',': -0.091796875,
 *     ":": -0.037109375,
 *     ";": -0.037109375,
 *     "A": -0.07421875
 *   }
 * }
 * var textpath = new Konva.TextPath({
 *   x: 100,
 *   y: 50,
 *   fill: '#333',
 *   fontSize: '24',
 *   fontFamily: 'Arial',
 *   text: 'All the world\'s a stage, and all the men and women merely players.',
 *   data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50',
 *   kerningFunc(leftChar, rightChar) {
 *     return kerningPairs.hasOwnProperty(leftChar) ? pairs[leftChar][rightChar] || 0 : 0
 *   }
 * });
 */
export class TextPath extends Shape<TextPathConfig> {
  dummyCanvas = Util.createCanvasElement();
  dataArray = [];
  glyphInfo: Array<{
    transposeX: number;
    transposeY: number;
    text: string;
    rotation: number;
    p0: Vector2d;
    p1: Vector2d;
  }>;
  partialText: string;
  textWidth: number;
  textHeight: number;

  constructor(config?: TextPathConfig) {
    // call super constructor
    super(config);

    this.dataArray = Path.parsePathData(this.attrs.data);
    this.on('dataChange.konva', function () {
      this.dataArray = Path.parsePathData(this.attrs.data);
      this._setTextData();
    });

    // update text data for certain attr changes
    this.on(
      'textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva fontSizeChange.konva',
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

    var glyphInfo = this.glyphInfo;
    if (textDecoration === 'underline') {
      context.beginPath();
    }
    for (var i = 0; i < glyphInfo.length; i++) {
      context.save();

      var p0 = glyphInfo[i].p0;

      context.translate(p0.x, p0.y);
      context.rotate(glyphInfo[i].rotation);
      this.partialText = glyphInfo[i].text;

      context.fillStrokeShape(this);
      if (textDecoration === 'underline') {
        if (i === 0) {
          context.moveTo(0, fontSize / 2 + 1);
        }

        context.lineTo(fontSize, fontSize / 2 + 1);
      }
      context.restore();

      //// To assist with debugging visually, uncomment following
      //
      // if (i % 2) context.strokeStyle = 'cyan';
      // else context.strokeStyle = 'green';
      // var p1 = glyphInfo[i].p1;
      // context.moveTo(p0.x, p0.y);
      // context.lineTo(p1.x, p1.y);
      // context.stroke();
    }
    if (textDecoration === 'underline') {
      context.strokeStyle = fill;
      context.lineWidth = fontSize / 20;
      context.stroke();
    }

    context.restore();
  }
  _hitFunc(context) {
    context.beginPath();

    var glyphInfo = this.glyphInfo;
    if (glyphInfo.length >= 1) {
      var p0 = glyphInfo[0].p0;
      context.moveTo(p0.x, p0.y);
    }
    for (var i = 0; i < glyphInfo.length; i++) {
      var p1 = glyphInfo[i].p1;
      context.lineTo(p1.x, p1.y);
    }
    context.setAttr('lineWidth', this.fontSize());
    context.setAttr('strokeStyle', this.colorKey);
    context.stroke();
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
    var that = this;
    var size = this._getTextSize(this.attrs.text);
    var letterSpacing = this.letterSpacing();
    var align = this.align();
    var kerningFunc = this.kerningFunc();

    this.textWidth = size.width;
    this.textHeight = size.height;

    var textFullWidth = Math.max(
      this.textWidth + ((this.attrs.text || '').length - 1) * letterSpacing,
      0
    );

    this.glyphInfo = [];

    var fullPathWidth = 0;
    for (var l = 0; l < that.dataArray.length; l++) {
      if (that.dataArray[l].pathLength > 0) {
        fullPathWidth += that.dataArray[l].pathLength;
      }
    }

    var offset = 0;
    if (align === 'center') {
      offset = Math.max(0, fullPathWidth / 2 - textFullWidth / 2);
    }
    if (align === 'right') {
      offset = Math.max(0, fullPathWidth - textFullWidth);
    }

    var charArr = stringToArray(this.text());
    var spacesNumber = this.text().split(' ').length - 1;

    var p0, p1, pathCmd;

    var pIndex = -1;
    var currentT = 0;
    // var sumLength = 0;
    // for(var j = 0; j < that.dataArray.length; j++) {
    //   if(that.dataArray[j].pathLength > 0) {
    //
    //     if (sumLength + that.dataArray[j].pathLength > offset) {}
    //       fullPathWidth += that.dataArray[j].pathLength;
    //   }
    // }

    var getNextPathSegment = function () {
      currentT = 0;
      var pathData = that.dataArray;

      for (var j = pIndex + 1; j < pathData.length; j++) {
        if (pathData[j].pathLength > 0) {
          pIndex = j;

          return pathData[j];
        } else if (pathData[j].command === 'M') {
          p0 = {
            x: pathData[j].points[0],
            y: pathData[j].points[1],
          };
        }
      }

      return {};
    };

    var findSegmentToFitCharacter = function (c) {
      var glyphWidth = that._getTextSize(c).width + letterSpacing;

      if (c === ' ' && align === 'justify') {
        glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
      }

      var currLen = 0;
      var attempts = 0;

      p1 = undefined;
      while (
        Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 &&
        attempts < 20
      ) {
        attempts++;
        var cumulativePathLength = currLen;
        while (pathCmd === undefined) {
          pathCmd = getNextPathSegment();

          if (
            pathCmd &&
            cumulativePathLength + pathCmd.pathLength < glyphWidth
          ) {
            cumulativePathLength += pathCmd.pathLength;
            pathCmd = undefined;
          }
        }

        if (pathCmd === {} || p0 === undefined) {
          return undefined;
        }

        var needNewSegment = false;

        switch (pathCmd.command) {
          case 'L':
            if (
              Path.getLineLength(
                p0.x,
                p0.y,
                pathCmd.points[0],
                pathCmd.points[1]
              ) > glyphWidth
            ) {
              p1 = Path.getPointOnLine(
                glyphWidth,
                p0.x,
                p0.y,
                pathCmd.points[0],
                pathCmd.points[1],
                p0.x,
                p0.y
              );
            } else {
              pathCmd = undefined;
            }
            break;
          case 'A':
            var start = pathCmd.points[4];
            // 4 = theta
            var dTheta = pathCmd.points[5];
            // 5 = dTheta
            var end = pathCmd.points[4] + dTheta;

            if (currentT === 0) {
              currentT = start + 0.00000001;
            } else if (glyphWidth > currLen) {
              // Just in case start is 0
              currentT += ((Math.PI / 180.0) * dTheta) / Math.abs(dTheta);
            } else {
              currentT -= ((Math.PI / 360.0) * dTheta) / Math.abs(dTheta);
            }

            // Credit for bug fix: @therth https://github.com/ericdrowell/KonvaJS/issues/249
            // Old code failed to render text along arc of this path: "M 50 50 a 150 50 0 0 1 250 50 l 50 0"
            if (
              (dTheta < 0 && currentT < end) ||
              (dTheta >= 0 && currentT > end)
            ) {
              currentT = end;
              needNewSegment = true;
            }
            p1 = Path.getPointOnEllipticalArc(
              pathCmd.points[0],
              pathCmd.points[1],
              pathCmd.points[2],
              pathCmd.points[3],
              currentT,
              pathCmd.points[6]
            );
            break;
          case 'C':
            if (currentT === 0) {
              if (glyphWidth > pathCmd.pathLength) {
                currentT = 0.00000001;
              } else {
                currentT = glyphWidth / pathCmd.pathLength;
              }
            } else if (glyphWidth > currLen) {
              currentT += (glyphWidth - currLen) / pathCmd.pathLength / 2;
            } else {
              currentT = Math.max(
                currentT - (currLen - glyphWidth) / pathCmd.pathLength / 2,
                0
              );
            }

            if (currentT > 1.0) {
              currentT = 1.0;
              needNewSegment = true;
            }
            p1 = Path.getPointOnCubicBezier(
              currentT,
              pathCmd.start.x,
              pathCmd.start.y,
              pathCmd.points[0],
              pathCmd.points[1],
              pathCmd.points[2],
              pathCmd.points[3],
              pathCmd.points[4],
              pathCmd.points[5]
            );
            break;
          case 'Q':
            if (currentT === 0) {
              currentT = glyphWidth / pathCmd.pathLength;
            } else if (glyphWidth > currLen) {
              currentT += (glyphWidth - currLen) / pathCmd.pathLength;
            } else {
              currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
            }

            if (currentT > 1.0) {
              currentT = 1.0;
              needNewSegment = true;
            }
            p1 = Path.getPointOnQuadraticBezier(
              currentT,
              pathCmd.start.x,
              pathCmd.start.y,
              pathCmd.points[0],
              pathCmd.points[1],
              pathCmd.points[2],
              pathCmd.points[3]
            );
            break;
        }

        if (p1 !== undefined) {
          currLen = Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
        }

        if (needNewSegment) {
          needNewSegment = false;
          pathCmd = undefined;
        }
      }
    };

    // fake search for offset, this is the best approach
    var testChar = 'C';
    var glyphWidth = that._getTextSize(testChar).width + letterSpacing;
    var lettersInOffset = offset / glyphWidth - 1;
    // the idea is simple
    // try to draw testChar until we fill offset
    for (var k = 0; k < lettersInOffset; k++) {
      findSegmentToFitCharacter(testChar);
      if (p0 === undefined || p1 === undefined) {
        break;
      }
      p0 = p1;
    }

    for (var i = 0; i < charArr.length; i++) {
      // Find p1 such that line segment between p0 and p1 is approx. width of glyph
      findSegmentToFitCharacter(charArr[i]);

      if (p0 === undefined || p1 === undefined) {
        break;
      }

      var width = Path.getLineLength(p0.x, p0.y, p1.x, p1.y);

      var kern = 0;
      if (kerningFunc) {
        try {
          // getKerning is a user provided getter. Make sure it never breaks our logic
          kern = kerningFunc(charArr[i - 1], charArr[i]) * this.fontSize();
        } catch (e) {
          kern = 0;
        }
      }

      p0.x += kern;
      p1.x += kern;
      this.textWidth += kern;

      var midpoint = Path.getPointOnLine(
        kern + width / 2.0,
        p0.x,
        p0.y,
        p1.x,
        p1.y
      );

      var rotation = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      this.glyphInfo.push({
        transposeX: midpoint.x,
        transposeY: midpoint.y,
        text: charArr[i],
        rotation: rotation,
        p0: p0,
        p1: p1,
      });
      p0 = p1;
    }
  }
  getSelfRect() {
    if (!this.glyphInfo.length) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }
    var points = [];

    this.glyphInfo.forEach(function (info) {
      points.push(info.p0.x);
      points.push(info.p0.y);
      points.push(info.p1.x);
      points.push(info.p1.y);
    });
    var minX = points[0] || 0;
    var maxX = points[0] || 0;
    var minY = points[1] || 0;
    var maxY = points[1] || 0;
    var x, y;
    for (var i = 0; i < points.length / 2; i++) {
      x = points[i * 2];
      y = points[i * 2 + 1];
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    var fontSize = this.fontSize();
    return {
      x: minX - fontSize / 2,
      y: minY - fontSize / 2,
      width: maxX - minX + fontSize,
      height: maxY - minY + fontSize,
    };
  }

  fontFamily: GetSet<string, this>;
  fontSize: GetSet<number, this>;
  fontStyle: GetSet<string, this>;
  fontVariant: GetSet<string, this>;
  align: GetSet<string, this>;
  letterSpacing: GetSet<number, this>;
  text: GetSet<string, this>;
  data: GetSet<string, this>;

  kerningFunc: GetSet<(leftChar: string, rightChar: string) => number, this>;
  textBaseline: GetSet<string, this>;
  textDecoration: GetSet<string, this>;
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
 * // get line height
 * var letterSpacing = shape.letterSpacing();
 *
 * // set the line height
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
 * // get line height
 * var textBaseline = shape.textBaseline();
 *
 * // set the line height
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

/**
 * get/set kerning function.
 * @name Konva.TextPath#kerningFunc
 * @method
 * @param {String} kerningFunc
 * @returns {String}
 * @example
 * // get text decoration
 * var kerningFunc = text.kerningFunc();
 *
 * // center text
 * text.kerningFunc(function(leftChar, rightChar) {
 *   return 1;
 * });
 */
Factory.addGetterSetter(TextPath, 'kerningFunc', null);
