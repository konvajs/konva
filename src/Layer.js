///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes
 * @constructor
 * @augments Kinetic.Container
 * @param {Object} config
 */
Kinetic.Layer = Kinetic.Container.extend({
    init: function(config) {
        this.setDefaultAttrs({
            throttle: 80,
            clearBeforeDraw: true
        });

        this.nodeType = 'Layer';
        this.lastDrawTime = 0;
        this.beforeDrawFunc = undefined;
        this.afterDrawFunc = undefined;

        this.canvas = new Kinetic.Canvas();
        this.canvas.getElement().style.position = 'absolute';

        // call super constructor
        this._super(config);
    },
    /**
     * draw children nodes.  this includes any groups
     *  or shapes
     * @name draw
     * @methodOf Kinetic.Layer.prototype
     */
    draw: function(canvas) {
        var throttle = this.attrs.throttle;
        var date = new Date();
        var time = date.getTime();
        var timeDiff = time - this.lastDrawTime;
        var tt = 1000 / throttle;

        if(timeDiff >= tt || throttle > 200) {
            this._draw(canvas);

            if(this.drawTimeout !== undefined) {
                clearTimeout(this.drawTimeout);
                this.drawTimeout = undefined;
            }
        }
        /*
         * if we cannot draw the layer due to throttling,
         * try to redraw the layer in the near future
         */
        else if(this.drawTimeout === undefined) {
            var that = this;
            /*
             * wait 17ms before trying again (60fps)
             */
            this.drawTimeout = setTimeout(function() {
                that.draw(canvas);
            }, 17);
        }
    },
    /**
     * set before draw function handler
     * @name beforeDraw
     * @methodOf Kinetic.Layer.prototype
     */
    beforeDraw: function(func) {
        this.beforeDrawFunc = func;
    },
    /**
     * set after draw function handler
     * @name afterDraw
     * @methodOf Kinetic.Layer.prototype
     */
    afterDraw: function(func) {
        this.afterDrawFunc = func;
    },
    /**
     * get layer canvas
     * @name getCanvas
     * @methodOf Kinetic.Layer.prototype
     */
    getCanvas: function() {
        return this.canvas;
    },
    /**
     * get layer canvas context
     * @name getContext
     * @methodOf Kinetic.Layer.prototype
     */
    getContext: function() {
        return this.canvas.context;
    },
    /**
     * Creates a composite data URL. If MIME type is not
     * specified, then "image/png" will result. For "image/jpeg", specify a quality
     * level as quality (range 0.0 - 1.0).  Note that this method works
     * differently from toDataURL() for other nodes because it generates an absolute dataURL
     * based on what's draw on the layer, rather than drawing
     * the current state of each child node
     * @name toDataURL
     * @methodOf Kinetic.Layer.prototype
     * @param {Object} config
     */
    toDataURL: function(config) {
        var canvas;
        var mimeType = config && config.mimeType ? config.mimeType : null;
        var quality = config && config.quality ? config.quality : null;

        if(config && config.width && config.height) {
            canvas = new Kinetic.Canvas(config.width, config.height);
        }
        else {
            canvas = this.getCanvas();
        }
        return canvas.toDataURL(mimeType, quality);
    },
    /**
     * private draw children
     */
    _draw: function(canvas) {
        /*
         * if canvas is not defined, then use the canvas
         * tied to the layer
         */
        if(!canvas) {
            canvas = this.getCanvas();
        }

        var date = new Date();
        var time = date.getTime();
        this.lastDrawTime = time;

        // before draw  handler
        if(this.beforeDrawFunc !== undefined) {
            this.beforeDrawFunc.call(this);
        }

        if(this.attrs.clearBeforeDraw) {
            canvas.clear();
        }

        if(this.isVisible()) {
            // draw custom func
            if(this.attrs.drawFunc !== undefined) {
                this.attrs.drawFunc.call(this);
            }

            // draw children
            this._drawChildren(canvas);
        }

        // after draw  handler
        if(this.afterDrawFunc !== undefined) {
            this.afterDrawFunc.call(this);
        }
    }
});

// add getters and setters
Kinetic.Node.addGettersSetters(Kinetic.Layer, ['clearBeforeDraw', 'throttle']);

/**
 * set flag which determines if the layer is cleared or not
 *  before drawing
 * @name setClearBeforeDraw
 * @methodOf Kinetic.Layer.prototype
 * @param {Boolean} clearBeforeDraw
 */

/**
 * set throttle
 * @name setThrottle
 * @methodOf Kinetic.Layer.prototype
 * @param {Number} throttle
 */

/**
 * get flag which determines if the layer is cleared or not
 *  before drawing
 * @name getClearBeforeDraw
 * @methodOf Kinetic.Layer.prototype
 */

/**
 * get throttle
 * @name getThrottle
 * @methodOf Kinetic.Layer.prototype
 */