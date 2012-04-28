///////////////////////////////////////////////////////////////////////
//  Polygon
///////////////////////////////////////////////////////////////////////
/**
 * Polygon constructor.&nbsp; Polygons are defined by an array of points
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Polygon = function(config) {
    this.setDefaultAttrs({
        points: {}
    });

    this.shapeType = "Polygon";
    config.drawFunc = function() {
        var context = this.getContext();
        context.beginPath();
        this.applyLineJoin();
        context.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);
        for(var n = 1; n < this.attrs.points.length; n++) {
            context.lineTo(this.attrs.points[n].x, this.attrs.points[n].y);
        }
        context.closePath();
        this.fillStroke();
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * Polygon methods
 */
Kinetic.Polygon.prototype = {
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
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Polygon, Kinetic.Shape);
