///////////////////////////////////////////////////////////////////////
//  Ellipse
///////////////////////////////////////////////////////////////////////
/**
 * Ellipse constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Ellipse = Kinetic.Shape.extend({
    init: function(config) {
        this.setDefaultAttrs({
            radius: {
                x: 0,
                y: 0
            }
        });

        this.shapeType = "Ellipse";

        config.drawFunc = function(context) {
            var r = this.getRadius();
            context.beginPath();
            context.save();
            if(r.x !== r.y) {
                context.scale(1, r.y / r.x);
            }
            context.arc(0, 0, r.x, 0, Math.PI * 2, true);
            context.restore();
            context.closePath();
            this.fill(context);
            this.stroke(context);
        };
        // call super constructor
        this._super(config);

        this._convertRadius();

        var that = this;
        this.on('radiusChange.kinetic', function() {
            that._convertRadius();
        });
    },
    /**
     * converts numeric radius into an object
     */
    _convertRadius: function() {
        var type = Kinetic.Type;
        var radius = this.getRadius();
        // if radius is already an object then return
        if(type._isObject(radius)) {
            return false;
        }

        /*
         * directly set radius attr to avoid
         * duplicate attr change event
         */
        this.attrs.radius = type._getXY(radius);
    }
});

// Circle backwards compatibility
Kinetic.Circle = Kinetic.Ellipse;

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Ellipse, ['radius']);

/**
 * set radius
 * @name setRadius
 * @methodOf Kinetic.Ellipse.prototype
 * @param {Number|Object|Array} radius
 *  radius can be a number, in which the ellipse becomes a circle,
 *  it can be an object with an x and y component, or it
 *  can be an array in which the first element is the x component
 *  and the second element is the y component.  The x component
 *  defines the horizontal radius and the y component
 *  defines the vertical radius
 */

/**
 * get radius
 * @name getRadius
 * @methodOf Kinetic.Ellipse.prototype
 */