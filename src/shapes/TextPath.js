///////////////////////////////////////////////////////////////////////
//  Text Path
///////////////////////////////////////////////////////////////////////
/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.TextPath = function(config) {
    this._initTextPath(config);
};

Kinetic.TextPath.prototype = {
    _initTextPath: function(config) {
        this.setDefaultAttrs({
            fontFamily: 'Calibri',
            fontSize: 12,
            fontStyle: 'normal',
            detectionType: 'path',
            text: ''
        });

        this.dummyCanvas = document.createElement('canvas');
        this.shapeType = "TextPath";
        this.dataArray = [];
        var that = this;

        config.drawFunc = this.drawFunc;
        // call super constructor
        Kinetic.Shape.call(this, config);
        this.dataArray = Kinetic.Path.parsePathData(this.attrs.data);
        this.on('dataChange', function() {
            that.dataArray = Kinetic.Path.parsePathData(this.attrs.data);
        });
        // update text data for certain attr changes
        var attrs = ['text', 'textStroke', 'textStrokeWidth'];
        for(var n = 0; n < attrs.length; n++) {
            var attr = attrs[n];
            this.on(attr + 'Change', that._setTextData);
        }
        that._setTextData();
    },
    drawFunc: function(context) {
        var charArr = this.charArr;

        context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
        context.textBaseline = 'middle';
        context.textAlign = 'left';
        context.save();

        var glyphInfo = this.glyphInfo;

        var appliedShadow = this.appliedShadow;
        for(var i = 0; i < glyphInfo.length; i++) {
            /*
             * need to reset appliedShadow flag so that shadows
             * are appropriately applied to each line of text
             */
            this.appliedShadow = appliedShadow;
            
            context.save();

            var p0 = glyphInfo[i].p0;
            var p1 = glyphInfo[i].p1;
            var ht = parseFloat(this.attrs.fontSize);

            context.translate(p0.x, p0.y);

            context.rotate(glyphInfo[i].rotation);

            this.fillText(context, glyphInfo[i].text);
            this.strokeText(context, glyphInfo[i].text);

            context.restore();

            //// To assist with debugging visually, uncomment following
            // context.beginPath();
            // if (i % 2)
            // context.strokeStyle = 'cyan';
            // else
            // context.strokeStyle = 'green';

            // context.moveTo(p0.x, p0.y);
            // context.lineTo(p1.x, p1.y);
            // context.stroke();
        }

        context.restore();
    },
    /**
     * get text width in pixels
     * @name getTextWidth
     * @methodOf Kinetic.TextPath.prototype
     */
    getTextWidth: function() {
        return this.textWidth;
    },
    /**
     * get text height in pixels
     * @name getTextHeight
     * @methodOf Kinetic.TextPath.prototype
     */
    getTextHeight: function() {
        return this.textHeight;
    },
    /**
	 * set text
	 * @name setText
	 * @methodOf Kinetic.TextPath.prototype
	 * @param {String} text
	 */
	setText: function(text) {
		Kinetic.Text.prototype.setText.call(this, text);
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
     * set text data.
     */
    _setTextData: function() {

        var that = this;
        var size = this._getTextSize(this.attrs.text);
        this.textWidth = size.width;
        this.textHeight = size.height;

        this.glyphInfo = [];

        var charArr = this.attrs.text.split('');

        var p0, p1, pathCmd;

        var pIndex = -1;
        var currentT = 0;

        var getNextPathSegment = function() {
            currentT = 0;
            var pathData = that.dataArray;

            for(var i = pIndex + 1; i < pathData.length; i++) {
                if(pathData[i].pathLength > 0) {
                    pIndex = i;

                    return pathData[i];
                }
                else if(pathData[i].command == 'M') {
                    p0 = {
                        x: pathData[i].points[0],
                        y: pathData[i].points[1]
                    };
                }
            }

            return {};
        };
        var findSegmentToFitCharacter = function(c, before) {

            var glyphWidth = that._getTextSize(c).width;

            var currLen = 0;
            var attempts = 0;
            var needNextSegment = false;
            p1 = undefined;
            while(Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 && attempts < 25) {
                attempts++;
                var cumulativePathLength = currLen;
                while(pathCmd === undefined) {
                    pathCmd = getNextPathSegment();

                    if(pathCmd && cumulativePathLength + pathCmd.pathLength < glyphWidth) {
                        cumulativePathLength += pathCmd.pathLength;
                        pathCmd = undefined;
                    }
                }

                if(pathCmd === {} || p0 === undefined)
                    return undefined;

                var needNewSegment = false;

                switch (pathCmd.command) {
                    case 'L':
                        if(Kinetic.Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) {
                            p1 = Kinetic.Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                        }
                        else
                            pathCmd = undefined;
                        break;
                    case 'A':

                        var start = pathCmd.points[4];
                        // 4 = theta
                        var dTheta = pathCmd.points[5];
                        // 5 = dTheta
                        var end = pathCmd.points[4] + dTheta;

                        if(currentT === 0)
                            currentT = start + 0.00000001;
                        // Just in case start is 0
                        else if(glyphWidth > currLen)
                            currentT += (Math.PI / 180.0) * dTheta / Math.abs(dTheta);
                        else
                            currentT -= Math.PI / 360.0 * dTheta / Math.abs(dTheta);

                        if(Math.abs(currentT) > Math.abs(end)) {
                            currentT = end;
                            needNewSegment = true;
                        }
                        p1 = Kinetic.Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                        break;
                    case 'C':
                        if(currentT === 0) {
                            if(glyphWidth > pathCmd.pathLength)
                                currentT = 0.00000001;
                            else
                                currentT = glyphWidth / pathCmd.pathLength;
                        }
                        else if(glyphWidth > currLen)
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        else
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;

                        if(currentT > 1.0) {
                            currentT = 1.0;
                            needNewSegment = true;
                        }
                        p1 = Kinetic.Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                        break;
                    case 'Q':
                        if(currentT === 0)
                            currentT = glyphWidth / pathCmd.pathLength;
                        else if(glyphWidth > currLen)
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        else
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;

                        if(currentT > 1.0) {
                            currentT = 1.0;
                            needNewSegment = true;
                        }
                        p1 = Kinetic.Path.getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3]);
                        break;

                }

                if(p1 !== undefined) {
                    currLen = Kinetic.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);
                }

                if(needNewSegment) {
                    needNewSegment = false;
                    pathCmd = undefined;
                }
            }
        };
        for(var i = 0; i < charArr.length; i++) {

            // Find p1 such that line segment between p0 and p1 is approx. width of glyph
            findSegmentToFitCharacter(charArr[i]);

            if(p0 === undefined || p1 === undefined)
                break;

            var width = Kinetic.Path.getLineLength(p0.x, p0.y, p1.x, p1.y);

            // Note: Since glyphs are rendered one at a time, any kerning pair data built into the font will not be used.
            // Can foresee having a rough pair table built in that the developer can override as needed.

            var kern = 0;
            // placeholder for future implementation

            var midpoint = Kinetic.Path.getPointOnLine(kern + width / 2.0, p0.x, p0.y, p1.x, p1.y);

            var rotation = Math.atan2((p1.y - p0.y), (p1.x - p0.x));
            this.glyphInfo.push({
                transposeX: midpoint.x,
                transposeY: midpoint.y,
                text: charArr[i],
                rotation: rotation,
                p0: p0,
                p1: p1
            });
            p0 = p1;
        }
    }
};
Kinetic.Global.extend(Kinetic.TextPath, Kinetic.Shape);

// add setters and getters
Kinetic.Node.addGettersSetters(Kinetic.TextPath, ['fontFamily', 'fontSize', 'fontStyle', 'textFill', 'textStroke', 'textStrokeWidth']);
Kinetic.Node.addGetters(Kinetic.TextPath, ['text']);

/**
 * set font family
 * @name setFontFamily
 * @methodOf Kinetic.TextPath.prototype
 * @param {String} fontFamily
 */

/**
 * set font size
 * @name setFontSize
 * @methodOf Kinetic.TextPath.prototype
 * @param {int} fontSize
 */

/**
 * set font style.  Can be "normal", "italic", or "bold".  "normal" is the default.
 * @name setFontStyle
 * @methodOf Kinetic.TextPath.prototype
 * @param {String} fontStyle
 */

/**
 * set text fill color
 * @name setTextFill
 * @methodOf Kinetic.TextPath.prototype
 * @param {String} textFill
 */

/**
 * set text stroke color
 * @name setFontStroke
 * @methodOf Kinetic.TextPath.prototype
 * @param {String} textStroke
 */

/**
 * set text stroke width
 * @name setTextStrokeWidth
 * @methodOf Kinetic.TextPath.prototype
 * @param {int} textStrokeWidth
 */

/**
 * get font family
 * @name getFontFamily
 * @methodOf Kinetic.TextPath.prototype
 */

/**
 * get font size
 * @name getFontSize
 * @methodOf Kinetic.TextPath.prototype
 */

/**
 * get font style
 * @name getFontStyle
 * @methodOf Kinetic.TextPath.prototype
 */

/**
 * get text fill color
 * @name getTextFill
 * @methodOf Kinetic.TextPath.prototype
 */

/**
 * get text stroke color
 * @name getTextStroke
 * @methodOf Kinetic.TextPath.prototype
 */

/**
 * get text stroke width
 * @name getTextStrokeWidth
 * @methodOf Kinetic.TextPath.prototype
 */

/**
 * get text
 * @name getText
 * @methodOf Kinetic.TextPath.prototype
 */