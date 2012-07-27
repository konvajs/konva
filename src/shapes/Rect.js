///////////////////////////////////////////////////////////////////////
//  Rect
///////////////////////////////////////////////////////////////////////
/**
 * Rect constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.Rect = Kinetic.Shape.extend({
    init: function(config) {
        this.setDefaultAttrs({
            width: 0,
            height: 0,
            cornerRadius: 0
        });
        this.shapeType = "Rect";
        config.drawFunc = this.drawFunc;
        // call super constructor
        this._super(config);
    },
    drawFunc: function(context) {
        context.beginPath();
        if(this.attrs.cornerRadius === 0) {
            // simple rect - don't bother doing all that complicated maths stuff.
            context.rect(0, 0, this.attrs.width, this.attrs.height);
        }
        else {
            // arcTo would be nicer, but browser support is patchy (Opera)
            context.moveTo(this.attrs.cornerRadius, 0);
            context.lineTo(this.attrs.width - this.attrs.cornerRadius, 0);
            context.arc(this.attrs.width - this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI * 3 / 2, 0, false);
            context.lineTo(this.attrs.width, this.attrs.height - this.attrs.cornerRadius);
            context.arc(this.attrs.width - this.attrs.cornerRadius, this.attrs.height - this.attrs.cornerRadius, this.attrs.cornerRadius, 0, Math.PI / 2, false);
            context.lineTo(this.attrs.cornerRadius, this.attrs.height);
            context.arc(this.attrs.cornerRadius, this.attrs.height - this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI / 2, Math.PI, false);
            context.lineTo(0, this.attrs.cornerRadius);
            context.arc(this.attrs.cornerRadius, this.attrs.cornerRadius, this.attrs.cornerRadius, Math.PI, Math.PI * 3 / 2, false);
        }
        context.closePath();

        this.fill(context);
        this.stroke(context);
    },
    /**
     * set width and height
     * @name setSize
     * @methodOf Kinetic.Rect.prototype
     */
    setSize: function() {
        var size = Kinetic.Type._getSize(Array.prototype.slice.call(arguments));
        this.setAttrs(size);
    },
    /**
     * return rect size
     * @name getSize
     * @methodOf Kinetic.Rect.prototype
     */
    getSize: function() {
        return {
            width: this.attrs.width,
            height: this.attrs.height
        };
    }
});

// add getters setters
Kinetic.Node.addGettersSetters(Kinetic.Rect, ['width', 'height', 'cornerRadius']);

/**
 * set width
 * @name setWidth
 * @methodOf Kinetic.Rect.prototype
 * @param {Number} width
 */

/**
 * set height
 * @name setHeight
 * @methodOf Kinetic.Rect.prototype
 * @param {Number} height
 */

/**
 * set corner radius
 * @name setCornerRadius
 * @methodOf Kinetic.Rect.prototype
 * @param {Number} radius
 */

/**
 * get width
 * @name getWidth
 * @methodOf Kinetic.Rect.prototype
 */

/**
 * get height
 * @name getHeight
 * @methodOf Kinetic.Rect.prototype
 */

/**
 * get corner radius
 * @name getCornerRadius
 * @methodOf Kinetic.Rect.prototype
 */