///////////////////////////////////////////////////////////////////////
//  Star
///////////////////////////////////////////////////////////////////////
/**
 * Star constructor
 * @param {Object} config
 */
Kinetic.Star = function(config){
    config.drawFunc = function(){
        var context = this.getContext();
        context.beginPath();
        context.moveTo(0, 0 - this.outerRadius);
        
        for (var n = 1; n < this.points * 2; n++) {
            var radius = n % 2 === 0 ? this.outerRadius : this.innerRadius;
            var x = radius * Math.sin(n * Math.PI / this.points);
            var y = -1 * radius * Math.cos(n * Math.PI / this.points);
            context.lineTo(x, y);
        }
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Star methods
 */
Kinetic.Star.prototype = {
    setPoints: function(points){
        this.points = points;
    },
    getPoints: function(){
        return this.points;
    },
    setOuterRadius: function(radius){
        this.outerRadius = radius;
    },
    getOuterRadius: function(){
        return this.outerRadius;
    },
    setInnerRadius: function(radius){
        this.innerRadius = radius;
    },
    getInnerRadius: function(){
        return this.innerRadius;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Star, Kinetic.Shape);
