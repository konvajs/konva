///////////////////////////////////////////////////////////////////////
//  Circle
///////////////////////////////////////////////////////////////////////
/**
 * Circle constructor
 * @param {Object} config
 */
Kinetic.Circle = function(config){
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Circle methods
 */
Kinetic.Circle.prototype = {
    setRadius: function(radius){
        this.radius = radius;
    },
    getRadius: function(){
        return this.radius;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Circle, Kinetic.Shape);
