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
    this._initPolygon(config);
};

Kinetic.Polygon.prototype = {
    _initPolygon: function(config) {
        this.setDefaultAttrs({
            points: []
        });

        this.shapeType = "Polygon";
        config.drawFunc = this.drawFunc;
        // call super constructor
        Kinetic.Shape.call(this, config);
    },
    drawFunc: function(context) {
        context.beginPath();
        context.moveTo(this.attrs.points[0].x, this.attrs.points[0].y);
        for(var n = 1; n < this.attrs.points.length; n++) {
            context.lineTo(this.attrs.points[n].x, this.attrs.points[n].y);
        }
        context.closePath();
        this.fill(context);
        this.stroke(context);
    },
    /**
	 * set points array
	 * @name setPoints
	 * @methodOf Kinetic.Line.prototype
	 * @param {Array} can be an array of point objects or an array
	 *  of Numbers.  e.g. [{x:1,y:2},{x:3,y:4}] or [1,2,3,4]
	 */
    setPoints: function(val) {
    	this.setAttr('points', Kinetic.Type._getPoints(val));
    }
};
Kinetic.Global.extend(Kinetic.Polygon, Kinetic.Shape);

// add getters setters
Kinetic.Node.addGetters(Kinetic.Polygon, ['points']);

/**
 * get points array
 * @name getPoints
 * @methodOf Kinetic.Polygon.prototype
 */