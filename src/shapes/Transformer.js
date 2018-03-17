(function(Konva) {
  'use strict';

  var ATTR_CHANGE_LIST = [
    'resizeEnabledChange',
    'rotateHandlerOffsetChange'
  ].join(' ');

  var NODE_RECT = 'nodeRect';

  var TRANSFORM_CHANGE_STR = [
    'xChange.resizer',
    'yChange.resizer',
    'widthChange.resizer',
    'heightChange.resizer',
    'scaleXChange.resizer',
    'scaleYChange.resizer',
    'skewXChange.resizer',
    'skewYChange.resizer',
    'rotationChange.resizer',
    'offsetXChange.resizer',
    'offsetYChange.resizer',
    'transformsEnabledChange.resizer'
  ].join(' ');

  function getCursor(anchorName, rad) {
    if (anchorName === 'rotater') {
      return 'crosshair';
    }

    var angle;
    if (anchorName === 'top-left' || anchorName === 'bottom-right') {
      angle = -45;
    } else if (anchorName === 'top-right' || anchorName === 'bottom-left') {
      angle = 45;
    } else if (anchorName === 'top-center' || anchorName === 'bottom-center') {
      angle = 0;
    } else if (anchorName === 'middle-left' || anchorName === 'middle-right') {
      angle = 90;
    } else {
      angle = 0;
    }

    angle = (angle + Konva.Util._radToDeg(rad) + 360) % 360;

    if (
      Konva.Util._inRange(angle, 315 + 22.5, 360) ||
      Konva.Util._inRange(angle, 0, 22.5)
    ) {
      // TOP
      return 'ns-resize';
    } else if (Konva.Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
      // TOP - RIGHT
      return 'nesw-resize';
    } else if (Konva.Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
      // RIGHT
      return 'ew-resize';
    } else if (Konva.Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
      // BOTTOM - RIGHT
      return 'nwse-resize';
    } else if (Konva.Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
      // BOTTOM
      return 'ns-resize';
    } else if (Konva.Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
      // BOTTOM - LEFT
      return 'nesw-resize';
    } else if (Konva.Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
      // RIGHT
      return 'ew-resize';
    } else if (Konva.Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
      // BOTTOM - RIGHT
      return 'nwse-resize';
    } else {
      // how can we can there?
      // TODO: throw error
      return 'pointer';
    }
  }

  /**
   * Transformer constructor.  Transformer is a special type of group that allow you transform Konva
   * primitives and shapes.
   * @constructor
   * @memberof Konva
   * @augments Konva.Container
   * @param {Object} config
   * @param {Boolean} [config.resizeEnabled] Default is true
   * @param {Boolean} [config.rotateEnabled] Default is true
   * @param {Array} [config.rotationSnaps] Array of angles for rotation snaps. Default is []
   * @param {Number} [config.rotateHandlerOffset] Default is 50
   * @param {Number} [config.padding] Default is 0
   * @param {Number} [config.lineEnabled] Should we draw border? Default is true
   * @param {Boolean} [config.keepRatio] Should we keep ratio when we are moving edges? Default is true
   * @param {Array} [config.enabledHandlers] Array of names of enabled handles
   * @@nodeParams
   * @@containerParams
   * @example
   * var transformer = new Konva.Transformer({
   *   node: rectangle,
   *   rotateHandlerOffset: 60,
   *   enabledHandlers: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
   * });
   * layer.add(transformer);
   */

  Konva.Transformer = function(config) {
    this.____init(config);
  };

  var RESIZERS_NAMES = [
    'top-left',
    'top-center',
    'top-right',
    'middle-right',
    'middle-left',
    'bottom-left',
    'bottom-center',
    'bottom-right'
  ];

  var warningShowed = false;

  Konva.Transformer.prototype = {
    _centroid: false,
    ____init: function(config) {
      // call super constructor
      Konva.Group.call(this, config);
      this.className = 'Transformer';
      this._createElements();

      // bindings
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.update = this.update.bind(this);

      // update transformer data for certain attr changes
      this.on(ATTR_CHANGE_LIST, this.update);

      if (!warningShowed) {
        Konva.Util.warn(
          'Konva.Transformer is currently experimental and may have bugs. Please report any issues to GitHub repo.'
        );
        warningShowed = true;
      }

      if (this.getNode()) {
        this.update();
      }
    },

    attachTo: function(node) {
      this.setNode(node);
    },

    setNode: function(node) {
      if (this._node) {
        this.detach();
      }
      this._node = node;
      this._clearCache(NODE_RECT);

      node.on(
        TRANSFORM_CHANGE_STR,
        function() {
          this._clearCache(NODE_RECT);
        }.bind(this)
      );
      node.on(TRANSFORM_CHANGE_STR, this.requestUpdate.bind(this));
      node.on('dragmove.resizer', this.requestUpdate.bind(this));

      var elementsCreated = !!this.findOne('.top-left');
      if (elementsCreated) {
        this.update();
      }
    },

    getNode: function() {
      return this._node;
    },

    detach: function() {
      if (this.getNode()) {
        this.getNode().off('.resizer');
      }
    },

    _getNodeRect: function() {
      return this._getCache(NODE_RECT, this.__getNodeRect);
    },

    __getNodeRect: function() {
      var node = this.getNode();
      if (!node) {
        return {
          x: -Number.MAX_SAFE_INTEGER,
          y: -Number.MAX_SAFE_INTEGER,
          width: 0,
          height: 0,
          rotation: 0
        };
      }
      var rect = node.getClientRect({ skipTransform: true });
      var rotation = Konva.getAngle(node.rotation());

      var dx = rect.x * node.scaleX() - node.offsetX();
      var dy = rect.y * node.scaleY() - node.offsetY();

      return {
        x: node.x() + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
        y: node.y() + dy * Math.cos(rotation) + dx * Math.sin(rotation),
        width: rect.width * node.scaleX(),
        height: rect.height * node.scaleY(),
        rotation: node.rotation()
      };
    },

    getX: function() {
      return this._getNodeRect().x;
    },

    getY: function() {
      return this._getNodeRect().y;
    },

    getRotation: function() {
      return this._getNodeRect().rotation;
    },

    getWidth: function() {
      return this._getNodeRect().width;
    },

    getHeight: function() {
      return this._getNodeRect().height;
    },

    _createElements: function() {
      this._createBack();

      RESIZERS_NAMES.forEach(
        function(name) {
          this._createAnchor(name);
        }.bind(this)
      );

      this._createAnchor('rotater');
    },

    _createAnchor: function(name) {
      var anchor = new Konva.Rect({
        stroke: 'rgb(0, 161, 255)',
        fill: 'white',
        strokeWidth: 1,
        name: name,
        width: 10,
        height: 10,
        offsetX: 5,
        offsetY: 5,
        draggable: true,
        dragDistance: 0
      });
      var self = this;
      anchor.on('mousedown touchstart', function(e) {
        self.handleResizerMouseDown(e);
      });

      // add hover styling
      anchor.on('mouseenter', function() {
        var layer = this.getLayer();
        var rad = Konva.getAngle(this.getParent().rotation());
        var cursor = getCursor(name, rad);
        anchor.getStage().getContainer().style.cursor = cursor;
        this.fill('lightgrey');
        layer.batchDraw();
      });
      anchor.on('mouseout', function() {
        var layer = this.getLayer();
        if (!layer) {
          return;
        }
        anchor.getStage().getContainer().style.cursor = '';
        this.fill('white');
        layer.batchDraw();
      });
      this.add(anchor);
    },

    _createBack: function() {
      var back = new Konva.Shape({
        stroke: 'rgb(0, 161, 255)',
        name: 'back',
        width: 0,
        height: 0,
        listening: false,
        sceneFunc: function(ctx) {
          var tr = this.getParent();
          var padding = tr.getPadding();
          ctx.beginPath();
          ctx.rect(
            -padding,
            -padding,
            this.width() + padding * 2,
            this.height() + padding * 2
          );
          ctx.moveTo(this.width() / 2, -padding);
          if (tr.rotateEnabled()) {
            ctx.lineTo(this.width() / 2, -tr.rotateHandlerOffset());
          }

          ctx.fillStrokeShape(this);
        }
      });
      this.add(back);
    },

    handleResizerMouseDown: function(e) {
      this.movingResizer = e.target.name();

      // var node = this.getNode();
      var attrs = this._getNodeRect();
      var width = attrs.width;
      var height = attrs.height;
      var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      this.sin = height / hypotenuse;
      this.cos = width / hypotenuse;

      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('touchmove', this.handleMouseMove);
      window.addEventListener('mouseup', this.handleMouseUp);
      window.addEventListener('touchend', this.handleMouseUp);

      this._transforming = true;

      this.fire('transformstart');
      this.getNode().fire('transformstart');
    },

    handleMouseMove: function(e) {
      var x, y, newHypotenuse;
      var resizerNode = this.findOne('.' + this.movingResizer);
      var stage = resizerNode.getStage();

      var box = stage.getContent().getBoundingClientRect();
      var zeroPoint = {
        x: box.left,
        y: box.top
      };
      var pointerPos = {
        left: e.clientX !== undefined ? e.clientX : e.touches[0].clientX,
        top: e.clientX !== undefined ? e.clientY : e.touches[0].clientY
      };
      var newAbsPos = {
        x: pointerPos.left - zeroPoint.x,
        y: pointerPos.top - zeroPoint.y
      };

      resizerNode.setAbsolutePosition(newAbsPos);

      var keepProportion = this.keepRatio() || e.shiftKey;

      if (this.movingResizer === 'top-left') {
        if (keepProportion) {
          newHypotenuse = Math.sqrt(
            Math.pow(this.findOne('.bottom-right').x() - resizerNode.x(), 2) +
              Math.pow(this.findOne('.bottom-right').y() - resizerNode.y(), 2)
          );

          x = newHypotenuse * this.cos;
          y = newHypotenuse * this.sin;

          this.findOne('.top-left').x(this.findOne('.bottom-right').x() - x);
          this.findOne('.top-left').y(this.findOne('.bottom-right').y() - y);
        }
      } else if (this.movingResizer === 'top-center') {
        this.findOne('.top-left').y(resizerNode.y());
      } else if (this.movingResizer === 'top-right') {
        if (keepProportion) {
          newHypotenuse = Math.sqrt(
            Math.pow(this.findOne('.bottom-left').x() - resizerNode.x(), 2) +
              Math.pow(this.findOne('.bottom-left').y() - resizerNode.y(), 2)
          );

          x = newHypotenuse * this.cos;
          y = newHypotenuse * this.sin;

          this.findOne('.top-right').x(x);
          this.findOne('.top-right').y(this.findOne('.bottom-left').y() - y);
        }
        var pos = resizerNode.position();

        this.findOne('.top-left').y(pos.y);
        this.findOne('.bottom-right').x(pos.x);
      } else if (this.movingResizer === 'middle-left') {
        this.findOne('.top-left').x(resizerNode.x());
      } else if (this.movingResizer === 'middle-right') {
        this.findOne('.bottom-right').x(resizerNode.x());
      } else if (this.movingResizer === 'bottom-left') {
        if (keepProportion) {
          newHypotenuse = Math.sqrt(
            Math.pow(this.findOne('.top-right').x() - resizerNode.x(), 2) +
              Math.pow(this.findOne('.top-right').y() - resizerNode.y(), 2)
          );

          x = newHypotenuse * this.cos;
          y = newHypotenuse * this.sin;

          this.findOne('.bottom-left').x(this.findOne('.top-right').x() - x);
          this.findOne('.bottom-left').y(y);
        }

        pos = resizerNode.position();

        this.findOne('.top-left').x(pos.x);
        this.findOne('.bottom-right').y(pos.y);
      } else if (this.movingResizer === 'bottom-center') {
        this.findOne('.bottom-right').y(resizerNode.y());
      } else if (this.movingResizer === 'bottom-right') {
        if (keepProportion) {
          newHypotenuse = Math.sqrt(
            Math.pow(this.findOne('.bottom-right').x(), 2) +
              Math.pow(this.findOne('.bottom-right').y(), 2)
          );

          x = newHypotenuse * this.cos;
          y = newHypotenuse * this.sin;

          this.findOne('.bottom-right').x(x);
          this.findOne('.bottom-right').y(y);
        }
      } else if (this.movingResizer === 'rotater') {
        var padding = this.getPadding();
        var attrs = this._getNodeRect();
        x = resizerNode.x() - attrs.width / 2;
        y = -resizerNode.y() + attrs.height / 2;

        var dAlpha = Math.atan2(-y, x) + Math.PI / 2;
        // var attrs = this._getAttrs();

        var rot = Konva.getAngle(this.rotation());

        var newRotation =
          Konva.Util._radToDeg(rot) + Konva.Util._radToDeg(dAlpha);

        var alpha = Konva.getAngle(this.getNode().rotation());
        var newAlpha = Konva.Util._degToRad(newRotation);

        var snaps = this.rotationSnaps();
        var offset = 0.1;
        for (var i = 0; i < snaps.length; i++) {
          var angle = Konva.getAngle(snaps[i]);

          var dif =
            Math.abs(angle - Konva.Util._degToRad(newRotation)) % (Math.PI * 2);

          if (dif < offset) {
            newRotation = Konva.Util._radToDeg(angle);
            newAlpha = Konva.Util._degToRad(newRotation);
          }
        }

        var dx = padding;
        var dy = padding;

        this._fitNodeInto(
          Object.assign(attrs, {
            rotation: Konva.angleDeg
              ? newRotation
              : Konva.Util._degToRad(newRotation),
            x:
              attrs.x +
              (attrs.width / 2 + padding) *
                (Math.cos(alpha) - Math.cos(newAlpha)) +
              (attrs.height / 2 + padding) *
                (Math.sin(-alpha) - Math.sin(-newAlpha)) -
              (dx * Math.cos(rot) + dy * Math.sin(-rot)),
            y:
              attrs.y +
              (attrs.height / 2 + padding) *
                (Math.cos(alpha) - Math.cos(newAlpha)) +
              (attrs.width / 2 + padding) *
                (Math.sin(alpha) - Math.sin(newAlpha)) -
              (dy * Math.cos(rot) + dx * Math.sin(rot)),
            width: attrs.width + padding * 2,
            height: attrs.height + padding * 2
          })
        );
      } else {
        console.error(
          new Error(
            'Wrong position argument of selection resizer: ',
            this.movingResizer
          )
        );
      }

      if (this.movingResizer === 'rotater') {
        return;
      }

      var absPos = this.findOne('.top-left').getAbsolutePosition(
        this.getParent()
      );

      x = absPos.x;
      y = absPos.y;
      var width =
        this.findOne('.bottom-right').x() - this.findOne('.top-left').x();

      var height =
        this.findOne('.bottom-right').y() - this.findOne('.top-left').y();

      this._fitNodeInto({
        x: x + this.offsetX(),
        y: y + this.offsetY(),
        width: width,
        height: height
      });
    },

    handleMouseUp: function() {
      this._removeEvents();
    },

    _removeEvents: function() {
      if (this._transforming) {
        this._transforming = false;
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('touchmove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('touchend', this.handleMouseUp);
        this.fire('transformend');
        this.getNode().fire('transformend');
      }
    },

    _fitNodeInto: function(attrs) {
      // waring! in this attrs padding may be included
      this._settings = true;
      var node = this.getNode();
      if (attrs.rotation !== undefined) {
        this.getNode().rotation(attrs.rotation);
      }
      var pure = node.getClientRect({ skipTransform: true });
      var padding = this.getPadding();
      var scaleX = (attrs.width - padding * 2) / pure.width;
      var scaleY = (attrs.height - padding * 2) / pure.height;

      var rotation = Konva.getAngle(node.getRotation());
      // debugger;
      var dx = pure.x * scaleX - padding;
      var dy = pure.y * scaleY - padding;

      // var dxo = node.offsetX() * scaleX;
      // var dyo = node.offsetY() * scaleY;

      this.getNode().setAttrs({
        scaleX: scaleX,
        scaleY: scaleY,
        x: attrs.x - (dx * Math.cos(rotation) + dy * Math.sin(-rotation)),
        y: attrs.y - (dy * Math.cos(rotation) + dx * Math.sin(rotation))
      });
      this._settings = false;

      this.fire('transform');
      this.getNode().fire('transform');
      this.update();
      this.getLayer().batchDraw();
    },

    requestUpdate: function() {
      if (this.timeout) {
        return;
      }
      this.timeout = setTimeout(
        function() {
          this.timeout = null;
          this.update();
        }.bind(this)
      );
    },

    /**
     * force update of Transformer
     * @method
     * @memberof Konva.Transformer.prototype
     */
    forceUpdate: function() {
      this._clearCache(NODE_RECT);
      this.update();
    },
    update: function() {
      var attrs = this._getNodeRect();
      var x = attrs.x;
      var y = attrs.y;
      var width = attrs.width;
      var height = attrs.height;
      this.x(x);
      this.y(y);
      this.rotation(attrs.rotation);

      var enabledHandlers = this.enabledHandlers();
      var resizeEnabled = this.resizeEnabled();
      var padding = this.getPadding();

      this.findOne('.top-left').setAttrs({
        x: -padding,
        y: -padding,
        visible: resizeEnabled && enabledHandlers.indexOf('top-left') >= 0
      });
      this.findOne('.top-center').setAttrs({
        x: width / 2,
        y: -padding,
        visible: resizeEnabled && enabledHandlers.indexOf('top-center') >= 0
      });
      this.findOne('.top-right').setAttrs({
        x: width + padding,
        y: -padding,
        visible: resizeEnabled && enabledHandlers.indexOf('top-right') >= 0
      });
      this.findOne('.middle-left').setAttrs({
        x: -padding,
        y: height / 2,
        visible: resizeEnabled && enabledHandlers.indexOf('middle-left') >= 0
      });
      this.findOne('.middle-right').setAttrs({
        x: width + padding,
        y: height / 2,
        visible: resizeEnabled && enabledHandlers.indexOf('middle-right') >= 0
      });
      this.findOne('.bottom-left').setAttrs({
        x: -padding,
        y: height + padding,
        visible: resizeEnabled && enabledHandlers.indexOf('bottom-left') >= 0
      });
      this.findOne('.bottom-center').setAttrs({
        x: width / 2,
        y: height + padding,
        visible: resizeEnabled && enabledHandlers.indexOf('bottom-center') >= 0
      });
      this.findOne('.bottom-right').setAttrs({
        x: width + padding,
        y: height + padding,
        visible: resizeEnabled && enabledHandlers.indexOf('bottom-right') >= 0
      });

      this.findOne('.rotater').setAttrs({
        x: width / 2,
        y: -this.rotateHandlerOffset(),
        visible: this.rotateEnabled()
      });

      this.findOne('.back').setAttrs({
        width: width,
        height: height,
        visible: this.lineEnabled()
      });
    },
    destroy: function() {
      Konva.Group.prototype.destroy.call(this);
      this.detach();
      this._removeEvents();
    },
    // do not work as a container
    // we will recreate inner nodes manually
    toObject: function() {
      return Konva.Node.prototype.toObject.call(this);
    }
  };
  Konva.Util.extend(Konva.Transformer, Konva.Group);

  function validateResizers(val) {
    if (!(val instanceof Array)) {
      Konva.Util.warn('enabledHandlers value should be an array');
    }
    if (val instanceof Array) {
      val.forEach(function(name) {
        if (RESIZERS_NAMES.indexOf(name) === -1) {
          Konva.Util.warn(
            'Unknown resizer name: ' +
              name +
              '. Available names are: ' +
              RESIZERS_NAMES.join(', ')
          );
        }
      });
    }
    return val || [];
  }

  /**
   * get/set enabled handlers
   * @name enabledHandlers
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get list of handlers
   * var enabledHandlers = shape.enabledHandlers();
   *
   * // set handlers
   * shape.enabledHandlers(['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'enabledHandlers',
    RESIZERS_NAMES,
    validateResizers
  );

  /**
   * get/set resize ability. If false it will automatically hide resizing handlers
   * @name resizeEnabled
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var resizeEnabled = shape.resizeEnabled();
   *
   * // set
   * shape.resizeEnabled(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'resizeEnabled', true);

  /**
   * get/set ability to rotate.
   * @name rotateEnabled
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var rotateEnabled = shape.rotateEnabled();
   *
   * // set
   * shape.rotateEnabled(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'rotateEnabled', true);

  /**
   * get/set rotation snaps angles.
   * @name rotationSnaps
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var rotationSnaps = shape.rotationSnaps();
   *
   * // set
   * shape.rotationSnaps([0, 90, 180, 270]);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'rotationSnaps', []);

  /**
   * get/set distance for rotation handler
   * @name rotateHandlerOffset
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var rotateHandlerOffset = shape.rotateHandlerOffset();
   *
   * // set
   * shape.rotateHandlerOffset(100);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'rotateHandlerOffset', 50);

  /**
   * get/set visibility of border
   * @name lineEnabled
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var lineEnabled = shape.lineEnabled();
   *
   * // set
   * shape.lineEnabled(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'lineEnabled', true);

  /**
   * get/set should we keep ration of resize?
   * @name keepRatio
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var keepRatio = shape.keepRatio();
   *
   * // set
   * shape.keepRatio(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'keepRatio', true);

  /**
   * get/set padding
   * @name padding
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get
   * var padding = shape.padding();
   *
   * // set
   * shape.padding(10);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'padding', 0);

  Konva.Factory.addOverloadedGetterSetter(Konva.Transformer, 'node');

  Konva.Collection.mapMethods(Konva.Transformer);
})(Konva);
