///////////////////////////////////////////////////////////////////////
//  Image
///////////////////////////////////////////////////////////////////////
/**
 * Image constructor
 * @param {Object} config
 */
Kinetic.Image = function(config){
    // defaults
    if (config.width === undefined) {
        config.width = config.image.width;
    }
    if (config.height === undefined) {
        config.height = config.image.height;
    }
    
    config.drawFunc = function(){
        var canvas = this.getCanvas();
        var context = this.getContext();
        context.beginPath();
        context.rect(0, 0, this.width, this.height);
        context.closePath();
        this.fillStroke();
        context.drawImage(this.image, 0, 0, this.width, this.height);
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};

Kinetic.Image.prototype = {
    setImage: function(image){
        this.image = image;
    },
    getImage: function(image){
        return this.image;
    },
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
Kinetic.GlobalObject.extend(Kinetic.Image, Kinetic.Shape);
