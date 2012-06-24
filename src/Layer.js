///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes
 * @constructor
 * @augments Kinetic.Container
 * @augments Kinetic.Node
 * @param {Object} config
 */
Kinetic.Layer = function(config) {
    this.setDefaultAttrs({
        throttle: 80,
        clearBeforeDraw: true
    });

    this.nodeType = 'Layer';
    this.lastDrawTime = 0;
    this.beforeDrawFunc = undefined;
    this.afterDrawFunc = undefined;

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';

    // call super constructors
    Kinetic.Container.apply(this, []);
    Kinetic.Node.apply(this, [config]);
};
/*
 * Layer methods
 */
Kinetic.Layer.prototype = {
    /**
     * draw children nodes.  this includes any groups
     *  or shapes
     */
    draw: function() {
        var throttle = this.attrs.throttle;
        var date = new Date();
        var time = date.getTime();
        var timeDiff = time - this.lastDrawTime;
        var tt = 1000 / throttle;

        if(timeDiff >= tt || throttle > 200) {
            this._draw();

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
                that.draw();
            }, 17);
        }
    },
    /**
     * set throttle
     * @param {Number} throttle in ms
     */
    setThrottle: function(throttle) {
        this.attrs.throttle = throttle;
    },
    /**
     * get throttle
     */
    getThrottle: function() {
        return this.attrs.throttle;
    },
    /**
     * set before draw function handler
     */
    beforeDraw: function(func) {
        this.beforeDrawFunc = func;
    },
    /**
     * set after draw function handler
     */
    afterDraw: function(func) {
        this.afterDrawFunc = func;
    },
    /**
     * clears the canvas context tied to the layer.  Clearing
     *  a layer does not remove its children.  The nodes within
     *  the layer will be redrawn whenever the .draw() method
     *  is used again.
     */
    clear: function() {
        var context = this.getContext();
        var canvas = this.getCanvas();
        context.clearRect(0, 0, canvas.width, canvas.height);
    },
    /**
     * get layer canvas
     */
    getCanvas: function() {
        return this.canvas;
    },
    /**
     * get layer context
     */
    getContext: function() {
        return this.context;
    },
    /**
     * private draw children
     */
    _draw: function() {
        var date = new Date();
        var time = date.getTime();
        this.lastDrawTime = time;

        // before draw  handler
        if(this.beforeDrawFunc !== undefined) {
            this.beforeDrawFunc.call(this);
        }

        if(this.attrs.clearBeforeDraw) {
            this.clear();
        }

        if(this.isVisible()) {
            // draw custom func
            if(this.attrs.drawFunc !== undefined) {
                this.attrs.drawFunc.call(this);
            }

            // draw children
            this._drawChildren();
        }

        // after draw  handler
        if(this.afterDrawFunc !== undefined) {
            this.afterDrawFunc.call(this);
        }
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Node);

// add setters and getters
Kinetic.GlobalObject.addSettersGetters(Kinetic.Layer, ['clearBeforeDraw']);

/**
 * set flag which determines if the layer is cleared or not
 *  before drawing
 * @name setClearBeforeDraw
 * @methodOf Kinetic.Layer.prototype
 * @param {Boolean} clearBeforeDraw
 */

/**
 * get flag which determines if the layer is cleared or not
 *  before drawing
 * @name getClearBeforeDraw
 * @methodOf Kinetic.Layer.prototype
 */
