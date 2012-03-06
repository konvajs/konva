///////////////////////////////////////////////////////////////////////
//  Rect
///////////////////////////////////////////////////////////////////////
/**
 * Rect constructor
 * @param {Object} config
 */
Kinetic.Rect = function(config){
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.rect(0, 0, this.width, this.height);
        context.closePath();
        this.fillStroke();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

/*
 * Rect methods
 */
Kinetic.Rect.prototype = {
    setWidth: function(width){
        this.width = width;
    },
    getWidth: function(){
        return this.width;
    },
    setHeight: function(height){
        this.height = height;
    },
    getHeight: function(){
        return this.height;
    },
    /**
     * set width and height
     * @param {number} width
     * @param {number} height
     */
    setSize: function(width, height){
        this.width = width;
        this.height = height;
    }
};

// extend Shape
Kinetic.GlobalObject.extend(Kinetic.Rect, Kinetic.Shape);
