///////////////////////////////////////////////////////////////////////
//  RegularPolygon
///////////////////////////////////////////////////////////////////////
/**
 * Polygon constructor
 * @param {Object} config
 */
Kinetic.RegularPolygon = function(config){
    config.drawFunc = function(){
        var context = this.getContext();
        context.beginPath();
        context.moveTo(0, 0 - this.radius);
        
        for (var n = 1; n < this.sides; n++) {
            var x = this.radius * Math.sin(n * 2 * Math.PI / this.sides);
            var y = -1 * this.radius * Math.cos(n * 2 * Math.PI / this.sides);
            context.lineTo(x, y);
        }
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * RegularPolygon methods
 */
Kinetic.RegularPolygon.prototype = {
    setPoints: function(points){
        this.points = points;
    },
    getPoints: function(){
        return this.points;
    },
    setRadius: function(radius){
        this.radius = radius;
    },
    getRadius: function(){
        return this.radius;
    },
    setSides: function(sides){
        this.sides = sides;
    },
    getSides: function(){
        return this.sides;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.RegularPolygon, Kinetic.Shape);
