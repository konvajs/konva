///////////////////////////////////////////////////////////////////////
//  Line
///////////////////////////////////////////////////////////////////////
/**
 * Line constructor.&nbsp; Lines are defined by an array of points
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Line = function(config) {
    this.setDefaultAttrs({
        points: [],
        lineCap: 'butt',
        dashArray: [],
        detectionType: 'pixel'
    });

    this.shapeType = "Line";
    config.drawFunc = function() {
        var context = this.getContext();
        var lastPos = {};
        context.beginPath();

        context.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);

        for(var n = 1; n < this.attrs.points.length; n++) {
            var x = this.attrs.points[n].x;
            var y = this.attrs.points[n].y;
            if(this.attrs.dashArray.length > 0) {
                // draw dashed line
                var lastX = this.attrs.points[n - 1].x;
                var lastY = this.attrs.points[n - 1].y;
                this._dashedLine(lastX, lastY, x, y, this.attrs.dashArray);
            }
            else {
                // draw normal line
                context.lineTo(x, y);
            }
        }

        if(!!this.attrs.lineCap) {
            context.lineCap = this.attrs.lineCap;
        }
        this.applyStyles();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Line methods
 */
Kinetic.Line.prototype = {
    /**
     * set points array
     * @param {Array} can be an array of point objects or an array
     *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] == [1,2,3,4]
     */
    setPoints: function(points) {
        Kinetic.GlobalObject._setPoints(this.attrs, 'points', points);
    },
    /**
     * get points array
     */
    getPoints: function() {
        return this.attrs.points;
    },
    /**
     * set line cap.  Can be butt, round, or square
     * @param {String} lineCap
     */
    setLineCap: function(lineCap) {
        this.attrs.lineCap = lineCap;
    },
    /**
     * get line cap
     */
    getLineCap: function() {
        return this.attrs.lineCap;
    },
    /**
     * set dash array.
     * @param {Array} dashArray
     *  examples:<br>
     *  [10, 5] dashes are 10px long and 5 pixels apart
     *  [10, 20, 0, 20] if using a round lineCap, the line will
     *  be made up of alternating dashed lines that are 10px long
     *  and 20px apart, and dots that have a radius of 5 and are 20px
     *  apart
     */
    setDashArray: function(dashArray) {
        this.attrs.dashArray = dashArray;
    },
    /**
     * get dash array
     */
    getDashArray: function() {
        return this.attrs.dashArray;
    },
    /**
     * draw dashed line.  Written by Phrogz
     */
    _dashedLine: function(x, y, x2, y2, dashArray) {
        var context = this.getContext();
        var dashCount = dashArray.length;

        var dx = (x2 - x), dy = (y2 - y);
        var xSlope = (Math.abs(dx) > Math.abs(dy));
        var slope = (xSlope) ? dy / dx : dx / dy;
        var distRemaining = Math.sqrt(dx * dx + dy * dy);
        var dashIndex = 0, draw = true;
        while(distRemaining >= 0.1 && dashIndex < 10000) {
            var dashLength = dashArray[dashIndex++ % dashCount];
            if(dashLength === 0) {
                dashLength = 0.001;
            }
            if(dashLength > distRemaining) {
                dashLength = distRemaining;
            }
            var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope));
            if(xSlope) {
                x += step;
                y += slope * step;
            }
            else {
                x += slope * step;
                y += step;
            }
            context[draw ? 'lineTo' : 'moveTo'](x, y);
            distRemaining -= dashLength;
            draw = !draw;
        }
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Line, Kinetic.Shape);
