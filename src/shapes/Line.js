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
        points: {},
        lineCap: 'butt'
    });

    this.shapeType = "Line";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        context.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);
        for(var n = 1; n < this.attrs.points.length; n++) {
            context.lineTo(this.attrs.points[n].x, this.attrs.points[n].y);
        }

        if(!!this.attrs.lineCap) {
            context.lineCap = this.attrs.lineCap;
        }
        this.stroke();
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
     * @param {Array} points
     */
    setPoints: function(points) {
        this.attrs.points = points;
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
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Line, Kinetic.Shape);
