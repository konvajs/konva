///////////////////////////////////////////////////////////////////////
//  Text Path
///////////////////////////////////////////////////////////////////////
/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @augments Kinetic.Path
 * @param {Object} config
 */
Kinetic.TextPath = Kinetic.Path.extend({
    init: function(config) {
        this.setDefaultAttrs({
            fontFamily: 'Calibri',
            fontSize: 12,
            fontStyle: 'normal',
            detectionType: 'path',
            text: ''
        });
        
        this.dummyCanvas = document.createElement('canvas');
        this.shapeType = "TextPath";
        var that = this;        

        config.drawFunc = function() {
            var context = this.getContext();

            var charArr = this.charArr;

            context.font = this.attrs.fontStyle + ' ' + this.attrs.fontSize + 'pt ' + this.attrs.fontFamily;
            context.textBaseline = 'middle';
            context.textAlign = 'left';
            context.save();

            var glyphInfo = this.glyphInfo;

            for (var i=0; i < glyphInfo.length; i++)
            {
                context.save();
                
                var p0 = glyphInfo[i].p0;
                var p1 = glyphInfo[i].p1;
                var ht = parseFloat(this.attrs.fontSize);
                
                context.translate(p0.x, p0.y);
                
                context.rotate(glyphInfo[i].rotation);
                
                this.fillText(glyphInfo[i].text);
                this.strokeText(glyphInfo[i].text);

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
        };
    
        // call super constructor
        this._super(config);
    
        // update text data for certain attr changes
        var attrs = ['padding', 'text', 'textStroke', 'textStrokeWidth'];
        for(var n = 0; n < attrs.length; n++) {
            var attr = attrs[n];
            this.on(attr + 'Change', that._setTextData);
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
        
        var p0 = undefined;
        var p1 = undefined;
        var pathCmd = undefined;
        var pIndex = -1;
        var currentT = 0;
        
        var getNextPathSegment = function() {
            currentT = 0;
            var pathData = that.dataArray;
            
            for (var i = pIndex + 1; i < pathData.length; i++) {
                if (pathData[i].pathLength > 0) {
                    pIndex = i;
                    
                    return pathData[i];
                }
                else if (pathData[i].command == 'M') {
                    p0 = {x: pathData[i].points[0], y: pathData[i].points[1]};
                }
            }
            
            return {};
        }        
        
        var findSegmentToFitCharacter = function(c, before) {
            
            var glyphWidth = that._getTextSize(c).width;            
            
            var currLen = 0;
            var attempts = 0;
            var needNextSegment = false;
            
            p1 = undefined;
            
            while (Math.abs(glyphWidth - currLen) / glyphWidth > 0.01 && attempts < 25) {
                attempts++;
                var cumulativePathLength = currLen;
                
                while (pathCmd === undefined) {
                    pathCmd = getNextPathSegment();
            
                    if (pathCmd && cumulativePathLength + pathCmd.pathLength < glyphWidth)
                    {
                        cumulativePathLength += pathCmd.pathLength;                        
                        pathCmd = undefined;
                    }
                }
        
                if (pathCmd === {} || p0 === undefined)
                    return undefined;
            
                var needNewSegment = false;
                
                switch(pathCmd.command) {
                    case 'L':
                        if (that._getLineLength(p0.x, p0.y, pathCmd.points[0], pathCmd.points[1]) > glyphWidth)
                        {
                            p1 = that._getPointOnLine(glyphWidth, p0.x, p0.y, pathCmd.points[0], pathCmd.points[1], p0.x, p0.y);
                        }
                        else
                            pathCmd = undefined;
                        break;
                    case 'A':
        
                        var start = pathCmd.points[4]; // 4 = theta
                        var dTheta = pathCmd.points[5];// 5 = dTheta
                        var end = pathCmd.points[4] + dTheta; 
                        
                        if (currentT == 0)
                            currentT = start + 0.00000001;  // Just in case start is 0
                        else if (glyphWidth > currLen)
                            currentT += (Math.PI / 180.0) * dTheta / Math.abs(dTheta);
                        else
                            currentT -= Math.PI / 360.0  * dTheta / Math.abs(dTheta);
                        
                        if (Math.abs(currentT) > Math.abs(end)) {

                            currentT = end;
                            needNewSegment = true;
                        }
                            
                        p1 = that._getPointOnEllipticalArc(pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], currentT, pathCmd.points[6]);
                        break;
                    case 'C':
                        if (currentT == 0) {
                            if (glyphWidth > pathCmd.pathLength)
                                currentT = 0.00000001;
                            else
                                currentT = glyphWidth / pathCmd.pathLength;
                        }
                        else if (glyphWidth > currLen)
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        else
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                            
                        if (currentT > 1.0) {
                            currentT = 1.0;
                            needNewSegment = true;
                        }
                            
                        p1 = that._getPointOnCubicBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3], pathCmd.points[4], pathCmd.points[5])
                        break;
                    case 'Q':
                        if (currentT == 0)
                            currentT = glyphWidth / pathCmd.pathLength;
                        else if (glyphWidth > currLen)
                            currentT += (glyphWidth - currLen) / pathCmd.pathLength;
                        else
                            currentT -= (currLen - glyphWidth) / pathCmd.pathLength;
                            
                        if (currentT > 1.0) {
                            currentT = 1.0;
                            needNewSegment = true;
                        }
                            
                        p1 = that._getPointOnQuadraticBezier(currentT, pathCmd.start.x, pathCmd.start.y, pathCmd.points[0], pathCmd.points[1], pathCmd.points[2], pathCmd.points[3])
                        break;                        
                
                }
                
                if (p1 !== undefined)
                {
                    currLen = that._getLineLength(p0.x, p0.y, p1.x, p1.y);
                }
                
                if (needNewSegment) {
                    needNewSegment = false;
                    pathCmd = undefined;
                }
            }
        }

        for (var i=0; i < charArr.length; i++) {
            
            // Find p1 such that line segment between p0 and p1 is approx. width of glyph
            findSegmentToFitCharacter(charArr[i]);

            if (p0 === undefined || p1 === undefined)
                break;
            
            var width = this._getLineLength(p0.x, p0.y, p1.x, p1.y);
            
            // Note: Since glyphs are rendered one at a time, any kerning pair data built into the font will not be used. 
            // Can foresee having a rough pair table built in that the developer can override as needed.
            
            var kern = 0; // placeholder for future implementation
                
            var midpoint = this._getPointOnLine(kern + width / 2.0, p0.x, p0.y, p1.x, p1.y);

            var rotation = Math.atan2((p1.y - p0.y),(p1.x - p0.x));
            this.glyphInfo.push({ transposeX: midpoint.x, transposeY: midpoint.y, text: charArr[i], rotation: rotation, p0:p0, p1:p1});
        
            p0 = p1;
        }
    }    
});

// add setters and getters
Kinetic.Node.addSettersGetters(Kinetic.TextPath, ['fontFamily', 'fontSize', 'fontStyle', 'textFill', 'textStroke', 'textStrokeWidth', 'text']);

 