/**
 * Canvas wrapper constructor
 * @constructor
 * @param {Number} width
 * @param {Number} height
 */
Kinetic.Canvas = function(width, height) {
    this.element = document.createElement('canvas');
    this.context = this.element.getContext('2d');

    // set dimensions
    this.element.width = width;
    this.element.height = height;
};

Kinetic.Canvas.prototype = {
    /**
     * clear canvas
     * @name clear
     * @methodOf Kinetic.Canvas.prototype
     */
    clear: function() {
        var context = this.getContext();
        var el = this.getElement();
        context.clearRect(0, 0, el.width, el.height);
    },
    /**
     * get element
     * @name getElement
     * @methodOf Kinetic.Canvas.prototype
     */
    getElement: function() {
        return this.element;
    },
    /**
     * get context
     * @name getContext
     * @methodOf Kinetic.Canvas.prototype
     */
    getContext: function() {
        return this.context;
    },
    /**
     * set width
     * @name setWidth
     * @methodOf Kinetic.Canvas.prototype
     */
    setWidth: function(width) {
        this.element.width = width;
    },
    /**
     * set height
     * @name setHeight
     * @methodOf Kinetic.Canvas.prototype
     */
    setHeight: function(height) {
        this.element.height = height;
    },
    /**
     * get width
     * @name getWidth
     * @methodOf Kinetic.Canvas.prototype
     */
    getWidth: function() {
        return this.element.width;
    },
    /**
     * get height
     * @name getHeight
     * @methodOf Kinetic.Canvas.prototype
     */
    getHeight: function() {
        return this.element.height;
    },
    /**
     * set size
     * @name setSize
     * @methodOf Kinetic.Canvas.prototype
     */
    setSize: function(width, height) {
        this.setWidth(width);
        this.setHeight(height);
    },
    /**
     * toDataURL
     */
    toDataURL: function(mimeType, quality) {
        try {
            // If this call fails (due to browser bug, like in Firefox 3.6),
            // then revert to previous no-parameter image/png behavior
            return this.element.toDataURL(mimeType, quality);
        }
        catch(e) {
            return this.element.toDataURL();
        }
    }
};
