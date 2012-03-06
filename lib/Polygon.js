///////////////////////////////////////////////////////////////////////
//  Polygon
///////////////////////////////////////////////////////////////////////
/**
 * Polygon constructor
 * @param {Object} config
 */
Kinetic.Polygon = function(config){
    config.drawFunc = function(){
        var context = this.getContext();
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (var n = 1; n < this.points.length; n++) {
            context.lineTo(this.points[n].x, this.points[n].y);
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
    setPoints: function(points){
        this.points = points;
    },
    getPoints: function(){
        return this.points;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Polygon, Kinetic.Shape);
