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
        throttle: 12
    });

    this.nodeType = 'Layer';
    this.lastDrawTime = 0;

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

        if(timeDiff >= throttle) {
            this._draw();
            this.lastDrawTime = time;
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
             * if timeout duration is too short, we will
             * get a lot of unecessary layer draws.  Make sure
             * that the timeout is slightly more than the throttle
             * amount
             */
            this.drawTimeout = setTimeout(function() {
                that.draw();
            }, throttle + 10);
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
     * add a node to the layer.  New nodes are always
     * placed at the top.
     * @param {Node} node
     */
    add: function(child) {
        this._add(child);
    },
    /**
     * remove a child from the layer
     * @param {Node} child
     */
    remove: function(child) {
        this._remove(child);
    },
    /**
     * private draw children
     */
    _draw: function() {
        this.clear();
        if(this.attrs.visible) {
            this._drawChildren();
        }
    }
};
// Extend Container and Node
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Container);
Kinetic.GlobalObject.extend(Kinetic.Layer, Kinetic.Node);
