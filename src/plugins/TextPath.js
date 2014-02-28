(function() {
    var EMPTY_STRING = '',
        //CALIBRI = 'Calibri',
        NORMAL = 'normal';

    /**
     * Path constructor.
     * @author Jason Follas
     * @constructor
     * @memberof Kinetic
     * @augments Kinetic.Shape
     * @param {Object} config
     * @param {String} [config.fontFamily] default is Calibri
     * @param {Number} [config.fontSize] default is 12
     * @param {String} [config.fontStyle] can be normal, bold, or italic.  Default is normal
     * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
     * @param {String} config.text
     * @param {String} config.data SVG data string
     * @@shapeParams
     * @@nodeParams
     * @example
     * var textpath = new Kinetic.TextPath({<br>
     *   x: 100,<br>
     *   y: 50,<br>
     *   fill: '#333',<br>
     *   fontSize: '24',<br>
     *   fontFamily: 'Arial',<br>
     *   text: 'All the world\'s a stage, and all the men and women merely players.',<br>
     *   data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50'<br>
     * });
     */
    Kinetic.TextPath = function(config) {
        this.___init(config);
    };

    function _fillFunc(context) {
        context.fillText(this.partialText, 0, 0);
    }
    function _strokeFunc(context) {
        context.strokeText(this.partialText, 0, 0);
    }

    Kinetic.TextPath.prototype = {
        ___init: function(config) {
            var that = this;
            this.dummyCanvas = Kinetic.Util.createCanvasElement();
            this.dataArray = [];

            // call super constructor
            Kinetic.Shape.call(this, config);

            // overrides
            // TODO: shouldn't this be on the prototype?
            this._fillFunc = _fillFunc;
            this._strokeFunc = _strokeFunc;
            this._fillFuncHit = _fillFunc;
            this._strokeFuncHit = _strokeFunc;
            
            this.className = 'TextPath';

            this.dataArray = Kinetic.Path.parsePathData(this.attrs.data);
            this.on('dataChange.kinetic', function() {
                that.dataArray = Kinetic.Path.parsePathData(this.attrs.data);
            });

            // update text data for certain attr changes
            this.on('textChange.kinetic textStroke.kinetic textStrokeWidth.kinetic', that._setTextData);
            that._setTextData();
            this.sceneFunc(this._sceneFunc);
        },
        _sceneFunc: function(context) {
            context.setAttr('font', this._getContextFont());
            context.setAttr('textBaseline', 'middle');
            context.setAttr('textAlign', 'left');
            context.save();

            var glyphInfo = this.glyphInfo;
            for(var i = 0; i < glyphInfo.length; i++) {
                context.save();

                var p0 = glyphInfo[i].p0;

                context.translate(p0.x, p0.y);
                context.rotate(glyphInfo[i].rotation);
                this.partialText = glyphInfo[i].text;

                context.fillStrokeShape(this);
                context.restore();

                //// To assist with debugging visually, uncomment following
                // context.beginPath();
                // if (i % 2)
                // context.strokeStyle = 'cyan';
                // else
                // context.strokeStyle = 'green';
                // var p1 = glyphInfo[i].p1;
                // context.moveTo(p0.x, p0.y);
                // context.lineTo(p1.x, p1.y);
                // context.stroke();
            }
            context.restore();
        },
        /**
         * get text width in pixels
         * @method
         * @memberof Kinetic.TextPath.prototype
         */
        getTextWidth: function() {
            return this.textWidth;
        },
        /**
         * get text height in pixels
         * @method
         * @memberof Kinetic.TextPath.prototype
         */
        getTextHeight: function() {
            return this.textHeight;
        },
        /**
         * set text
         * @method
         * @memberof Kinetic.TextPath.prototype
         * @param {String} text
         */
        setText: function(text) {
            Kinetic.Text.prototype.setText.call(this, text);
        },
        _getTextSize: function(text) {
            var dummyCanvas = this.dummyCanvas;
            var _context = dummyCanvas.getContext('2d');

            _context.save();

            _context.font = this._getContextFont();
            var metrics = _context.measureText(text);

            _context.restore();

            return {
                width: metrics.width,
                height: parseInt(this.attrs.fontSize, 10)
            };
        },
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
            var findSegmentToFitCharacter = function(c) {

                var glyphWidth = that._getTextSize(c).width;

                var currLen = 0;
                var attempts = 0;

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

                    if(pathCmd === {} || p0 === undefined) {
                        return undefined;
                    }

                    var needNewSegment = false;

                    switch (pathCmd.command) {
                        case 'L':
                            if(Kinetic.Path.getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth) {
                                p1 = Kinetic.Path.getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                            }
                            else {
                                pathCmd = undefined;
                            }
                            break;
                        case 'A':

                            var start = pathCmd.points[4];
                            // 4 = theta
                            var dTheta = pathCmd.points[5];
                            // 5 = dTheta
                            var end = pathCmd.points[4] + dTheta;

                            if(currentT === 0){
                                currentT = start + 0.00000001;
                            }
                            // Just in case start is 0
                            else if(glyphWidth > currLen) {
                                currentT += (Math.PI / 180.0) * dTheta / Math.abs(dTheta);
                            }
                            else {
                                currentT -= Math.PI / 360.0 * dTheta / Math.abs(dTheta);
                            }

                            // Credit for bug fix: @therth https://github.com/ericdrowell/KineticJS/issues/249
                            // Old code failed to render text along arc of this path: "M 50 50 a 150 50 0 0 1 250 50 l 50 0"
                            if(dTheta < 0 && currentT < end || dTheta >= 0 && currentT > end) {
                                currentT = end;
                                needNewSegment = true;
                            }
                            p1 = Kinetic.Path.getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                            break;
                        case 'C':
                            if(currentT === 0) {
                                if(glyphWidth > pathCmd.pathLength) {
                                    currentT = 0.00000001;
                                }
                                else {
                                    currentT = glyphWidth / pathCmd.pathLength;
                                }
                            }
                            else if(glyphWidth > currLen) {
                                currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                            }
                            else {
                                currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                            }

                            if(currentT > 1.0) {
                                currentT = 1.0;
                                needNewSegment = true;
                            }
                            p1 = Kinetic.Path.getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5]);
                            break;
                        case 'Q':
                            if(currentT === 0) {
                                currentT = glyphWidth / pathCmd.pathLength;
                            }
                            else if(glyphWidth > currLen) {
                                currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                            }
                            else {
                                currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                            }

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

                if(p0 === undefined || p1 === undefined) {
                    break;
                }

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

    // map TextPath methods to Text
    Kinetic.TextPath.prototype._getContextFont = Kinetic.Text.prototype._getContextFont;

    Kinetic.Util.extend(Kinetic.TextPath, Kinetic.Shape);

    // add setters and getters
    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, 'fontFamily', 'Arial');

    /**
     * set font family
     * @name setFontFamily
     * @method
     * @memberof Kinetic.TextPath.prototype
     * @param {String} fontFamily
     */

     /**
     * get font family
     * @name getFontFamily
     * @method
     * @memberof Kinetic.TextPath.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, 'fontSize', 12);

    /**
     * set font size
     * @name setFontSize
     * @method
     * @memberof Kinetic.TextPath.prototype
     * @param {int} fontSize
     */

     /**
     * get font size
     * @name getFontSize
     * @method
     * @memberof Kinetic.TextPath.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, 'fontStyle', NORMAL);

    /**
     * set font style.  Can be 'normal', 'italic', or 'bold'.  'normal' is the default.
     * @name setFontStyle
     * @method
     * @memberof Kinetic.TextPath.prototype
     * @param {String} fontStyle
     */

     /**
     * get font style
     * @name getFontStyle
     * @method
     * @memberof Kinetic.TextPath.prototype
     */

    Kinetic.Factory.addGetterSetter(Kinetic.TextPath, 'fontVariant', NORMAL);

    /**
     * set font variant.  Can be 'normal' or 'small-caps'.  'normal' is the default.
     * @name setFontVariant
     * @method
     * @memberof Kinetic.TextPath.prototype
     * @param {String} fontVariant
     */

    /**
     * @get font variant
     * @name getFontVariant
     * @method
     * @memberof Kinetic.TextPath.prototype
     */

    Kinetic.Factory.addGetter(Kinetic.TextPath, 'text', EMPTY_STRING);

    /**
     * get text
     * @name getText
     * @method
     * @memberof Kinetic.TextPath.prototype
     */

    Kinetic.Collection.mapMethods(Kinetic.TextPath);
})();
