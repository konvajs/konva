///////////////////////////////////////////////////////////////////////
//  Layer
///////////////////////////////////////////////////////////////////////
/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes
 * @constructor
 * @augments Kinetic.Container
 * @param {Object} config
 * @param {Boolean} [config.clearBeforeDraw] set this property to true if you'd like to disable
 *  canvas clearing before each new layer draw
 * @param {Number} [config.x]
 * @param {Number} [config.y]
 * @param {Boolean} [config.visible]
 * @param {Boolean} [config.listening] whether or not the node is listening for events
 * @param {String} [config.id] unique id
 * @param {String} [config.name] non-unique name
 * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
 * @param {Object} [config.scale]
 * @param {Number} [config.scale.x]
 * @param {Number} [config.scale.y]
 * @param {Number} [config.rotation] rotation in radians
 * @param {Number} [config.rotationDeg] rotation in degrees
 * @param {Object} [config.offset] offsets default position point and rotation point
 * @param {Number} [config.offset.x]
 * @param {Number} [config.offset.y]
 * @param {Boolean} [config.draggable]
 * @param {Function} [config.dragBoundFunc] dragBoundFunc(pos, evt) should return new position
 */
Kinetic.Layer = function(config) {
    this._initLayer(config);
};

Kinetic.Layer.prototype = {
    _initLayer: function(config) {
        this.setDefaultAttrs({
            clearBeforeDraw: true
        });

        this.nodeType = 'Layer';
        this.beforeDrawFunc = undefined;
        this.afterDrawFunc = undefined;
        this.canvas = new Kinetic.Canvas();
        this.canvas.getElement().style.position = 'absolute';
        this.bufferCanvas = new Kinetic.Canvas();
        this.bufferCanvas.name = 'buffer';

        // call super constructor
        Kinetic.Container.call(this, config);
    },
    /**
     * draw children nodes.  this includes any groups
     *  or shapes
     * @name draw
     * @methodOf Kinetic.Layer.prototype
     */
    draw: function(canvas) {
        // before draw  handler
        if(this.beforeDrawFunc !== undefined) {
            this.beforeDrawFunc.call(this);
        }

        if(canvas) {
            this._draw(canvas);
        }
        else {
            this._draw(this.getCanvas());
            this._draw(this.bufferCanvas);
        }

        // after draw  handler
        if(this.afterDrawFunc !== undefined) {
            this.afterDrawFunc.call(this);
        }
    },
    /**
     * draw children nodes on buffer.  this includes any groups
     *  or shapes
     * @name drawBuffer
     * @methodOf Kinetic.Layer.prototype
     */
    drawBuffer: function() {
        this.draw(this.bufferCanvas);
    },
    /**
     * draw children nodes on scene.  this includes any groups
     *  or shapes
     * @name drawScene
     * @methodOf Kinetic.Layer.prototype
     */
    drawScene: function() {
        this.draw(this.getCanvas());
    },
    /**
     * set before draw handler
     * @name beforeDraw
     * @methodOf Kinetic.Layer.prototype
     * @param {Function} handler
     */
    beforeDraw: function(func) {
        this.beforeDrawFunc = func;
    },
    /**
     * set after draw handler
     * @name afterDraw
     * @methodOf Kinetic.Layer.prototype
     * @param {Function} handler
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
     * clear canvas tied to the layer
     * @name clear
     * @methodOf Kinetic.Layer.prototype
     */
    clear: function() {
        this.getCanvas().clear();
    },
    // extenders
    setVisible: function(visible) {
        Kinetic.Node.prototype.setVisible.call(this, visible);
        if(visible) {
            this.canvas.element.style.display = 'block';
            this.bufferCanvas.element.style.display = 'block';
        }
        else {
            this.canvas.element.style.display = 'none';
            this.bufferCanvas.element.style.display = 'none';
        }
    },
    setZIndex: function(index) {
        Kinetic.Node.prototype.setZIndex.call(this, index);
        var stage = this.getStage();
        if(stage) {
            stage.content.removeChild(this.canvas.element);

            if(index < stage.getChildren().length - 1) {
                stage.content.insertBefore(this.canvas.element, stage.getChildren()[index + 1].canvas.element);
            }
            else {
                stage.content.appendChild(this.canvas.element);
            }
        }
    },
    moveToTop: function() {
        Kinetic.Node.prototype.moveToTop.call(this);
        var stage = this.getStage();
        if(stage) {
            stage.content.removeChild(this.canvas.element);
            stage.content.appendChild(this.canvas.element);
        }
    },
    moveUp: function() {
        if(Kinetic.Node.prototype.moveUp.call(this)) {
            var stage = this.getStage();
            if(stage) {
                stage.content.removeChild(this.canvas.element);

                if(this.index < stage.getChildren().length - 1) {
                    stage.content.insertBefore(this.canvas.element, stage.getChildren()[this.index + 1].canvas.element);
                }
                else {
                    stage.content.appendChild(this.canvas.element);
                }
            }
        }
    },
    moveDown: function() {
        if(Kinetic.Node.prototype.moveDown.call(this)) {
            var stage = this.getStage();
            if(stage) {
                var children = stage.getChildren();
                stage.content.removeChild(this.canvas.element);
                stage.content.insertBefore(this.canvas.element, children[this.index + 1].canvas.element);
            }
        }
    },
    moveToBottom: function() {
        if(Kinetic.Node.prototype.moveToBottom.call(this)) {
            var stage = this.getStage();
            if(stage) {
                var children = stage.getChildren();
                stage.content.removeChild(this.canvas.element);
                stage.content.insertBefore(this.canvas.element, children[1].canvas.element);
            }
        }
    },
    getLayer: function() {
        return this;
    },
    /**
     * Creates a composite data URL. If MIME type is not
     *  specified, then "image/png" will result. For "image/jpeg", specify a quality
     *  level as quality (range 0.0 - 1.0).  Note that this method works
     *  differently from toDataURL() for other nodes because it generates an absolute dataURL
     *  based on what's draw on the layer, rather than drawing
     *  the current state of each child node
     * @name toDataURL
     * @methodOf Kinetic.Layer.prototype
     * @param {Object} config
     * @param {String} [config.mimeType] mime type.  can be "image/png" or "image/jpeg".
     *  "image/png" is the default
     * @param {Number} [config.width] data url image width
     * @param {Number} [config.height] data url image height
     * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
     *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
     *  is very high quality
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
     * remove layer from stage
     */
    remove: function() {
        Kinetic.Node.prototype.remove.call(this);
        /*
         * remove canvas DOM from the document if
         * it exists
         */
        try {
            this.getStage().content.removeChild(this.canvas.element);
        } catch(e) {
            Kinetic.Global.warn('unable to remove layer scene canvas element from the document');
        }
    },
    __draw: function(canvas) {
        if(this.attrs.clearBeforeDraw) {
            canvas.clear();
        }
    }
};
Kinetic.Global.extend(Kinetic.Layer, Kinetic.Container);

// add getters and setters
Kinetic.Node.addGettersSetters(Kinetic.Layer, ['clearBeforeDraw']);

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