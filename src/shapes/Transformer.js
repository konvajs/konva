(function(Konva) {
  'use strict';

  var ATTR_CHANGE_LIST = [
    'resizeEnabledChange',
    'rotateAnchorOffsetChange',
    'rotateEnabledChange',
    'enabledAnchorsChange',
    'anchorSizeChange',
    'borderEnabledChange',
    'borderStrokeChange',
    'borderStrokeWidthChange',
    'borderDashChange',
    'anchorStrokeChange',
    'anchorStrokeWidthChange',
    'anchorFillChange',
    'anchorCornerRadiusChange',
    'ignoreStrokeChange'
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

  var REDRAW_CHANGE_STR = [
    'widthChange.resizer',
    'heightChange.resizer',
    'scaleXChange.resizer',
    'scaleYChange.resizer',
    'skewXChange.resizer',
    'skewYChange.resizer',
    'rotationChange.resizer',
    'offsetXChange.resizer',
    'offsetYChange.resizer'
  ].join(' ');

  var ANGLES = {
    'top-left': -45,
    'top-center': 0,
    'top-right': 45,
    'middle-right': -90,
    'middle-left': 90,
    'bottom-left': -135,
    'bottom-center': 180,
    'bottom-right': 135
  };

  function getCursor(anchorName, rad, isMirrored) {
    if (anchorName === 'rotater') {
      return 'crosshair';
    }

    rad += Konva.Util._degToRad(ANGLES[anchorName] || 0);
    // If we are mirrored, we need to mirror the angle (this is not the same as
    // rotate).
    if (isMirrored) {
      rad *= -1;
    }
    var angle = ((Konva.Util._radToDeg(rad) % 360) + 360) % 360;

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
      Konva.Util.error(
        'Transformer has unknown angle for cursor detection: ' + angle
      );
      return 'pointer';
    }
  }

  /**
   * Transformer constructor.  Transformer is a special type of group that allow you transform Konva
   * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
   * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
   * @constructor
   * @memberof Konva
   * @param {Object} config
   * @param {Boolean} [config.resizeEnabled] Default is true
   * @param {Boolean} [config.rotateEnabled] Default is true
   * @param {Array} [config.rotationSnaps] Array of angles for rotation snaps. Default is []
   * @param {Number} [config.rotateAnchorOffset] Default is 50
   * @param {Number} [config.padding] Default is 0
   * @param {Boolean} [config.borderEnabled] Should we draw border? Default is true
   * @param {String} [config.borderStroke] Border stroke color
   * @param {Number} [config.borderStrokeWidth] Border stroke size
   * @param {Array} [config.borderDash] Array for border dash.
   * @param {String} [config.anchorFill] Anchor fill color
   * @param {String} [config.anchorStroke] Anchor stroke color
   * @param {String} [config.anchorCornerRadius] Anchor corner radius
   * @param {Number} [config.anchorStrokeWidth] Anchor stroke size
   * @param {Number} [config.anchorSize] Default is 10
   * @param {Boolean} [config.keepRatio] Should we keep ratio when we are moving edges? Default is true
   * @param {Boolean} [config.centeredScaling] Should we resize relative to node's center? Default is false
   * @param {Array} [config.enabledAnchors] Array of names of enabled handles
   * @param {Function} [config.boundBoxFunc] Bounding box function
   * @example
   * var transformer = new Konva.Transformer({
   *   node: rectangle,
   *   rotateAnchorOffset: 60,
   *   enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
   * });
   * layer.add(transformer);
   */

  Konva.Transformer = function(config) {
    this.____init(config);
  };

  var ANCHORS_NAMES = [
    'top-left',
    'top-center',
    'top-right',
    'middle-right',
    'middle-left',
    'bottom-left',
    'bottom-center',
    'bottom-right'
  ];

  Konva.Transformer.prototype = {
    _centroid: false,
    ____init: function(config) {
      // call super constructor
      Konva.Group.call(this, config);
      this.className = 'Transformer';
      this._createElements();

      // bindings
      this._handleMouseMove = this._handleMouseMove.bind(this);
      this._handleMouseUp = this._handleMouseUp.bind(this);
      this.update = this.update.bind(this);

      // update transformer data for certain attr changes
      this.on(ATTR_CHANGE_LIST, this.update);

      if (this.getNode()) {
        this.update();
      }
    },

    /**
     * alias to `setNode`
     * @method
     * @memberof Konva.Transformer.prototype
     * @returns {Konva.Transformer}
     * @example
     * transformer.attachTo(shape);
     */
    attachTo: function(node) {
      this.setNode(node);
    },

    /**
     * attach transformer to a Konva.Node. Transformer will adapt to its size and listen its events
     * @method
     * @memberof Konva.Transformer.prototype
     * @returns {Konva.Transformer}
     * @example
     * transformer.setNode(shape);
     */
    setNode: function(node) {
      if (this._node) {
        this.detach();
      }
      this._node = node;
      this._resetTransformCache();

      node.on(TRANSFORM_CHANGE_STR, this._resetTransformCache.bind(this));
      node.on(
        REDRAW_CHANGE_STR,
        function() {
          if (!this._transforming) {
            this.update();
          }
        }.bind(this)
      );

      // TODO: why do we need this?
      var elementsCreated = !!this.findOne('.top-left');
      if (elementsCreated) {
        this.update();
      }
      return this;
    },

    getNode: function() {
      return this._node;
    },

    /**
     * detach transformer from a attached node
     * @method
     * @memberof Konva.Transformer.prototype
     * @returns {Konva.Transformer}
     * @example
     * transformer.detach();
     */
    detach: function() {
      if (this.getNode()) {
        this.getNode().off('.resizer');
        this._node = undefined;
      }
      this._resetTransformCache();
    },

    _resetTransformCache: function() {
      this._clearCache(NODE_RECT);
      this._clearCache('transform');
      this._clearSelfAndDescendantCache('absoluteTransform');
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
      var rect = node.getClientRect({
        skipTransform: true,
        skipShadow: true,
        skipStroke: this.ignoreStroke()
      });
      var rotation = Konva.getAngle(node.rotation());

      var dx = rect.x * node.scaleX() - node.offsetX() * node.scaleX();
      var dy = rect.y * node.scaleY() - node.offsetY() * node.scaleY();

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

      ANCHORS_NAMES.forEach(
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
        name: name + ' _anchor',
        dragDistance: 0,
        draggable: true
      });
      var self = this;
      anchor.on('mousedown touchstart', function(e) {
        self._handleMouseDown(e);
      });
      anchor.on('dragstart', function(e) {
        e.cancelBubble = true;
      });
      anchor.on('dragmove', function(e) {
        e.cancelBubble = true;
      });
      anchor.on('dragend', function(e) {
        e.cancelBubble = true;
      });

      // add hover styling
      anchor.on('mouseenter', function() {
        var tr = this.getParent();

        var rad = Konva.getAngle(tr.rotation());

        var scale = tr.getNode().getAbsoluteScale();
        // If scale.y < 0 xor scale.x < 0 we need to flip (not rotate).
        var isMirrored = scale.y * scale.x < 0;
        var cursor = getCursor(name, rad, isMirrored);
        anchor.getStage().content.style.cursor = cursor;
        tr._cursorChange = true;
      });
      anchor.on('mouseout', function() {
        if (!anchor.getStage() || !this.getParent()) {
          return;
        }
        anchor.getStage().content.style.cursor = '';
        this.getParent()._cursorChange = false;
      });
      this.add(anchor);
    },

    _createBack: function() {
      var back = new Konva.Shape({
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
            ctx.lineTo(
              this.width() / 2,
              -tr.rotateAnchorOffset() * Konva.Util._sign(this.height())
            );
          }

          ctx.fillStrokeShape(this);
        }
      });
      this.add(back);
    },

    _handleMouseDown: function(e) {
      this.movingResizer = e.target.name().split(' ')[0];

      // var node = this.getNode();
      var attrs = this._getNodeRect();
      var width = attrs.width;
      var height = attrs.height;
      var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
      this.sin = height / hypotenuse;
      this.cos = width / hypotenuse;

      window.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('touchmove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUp, true);
      window.addEventListener('touchend', this._handleMouseUp, true);

      this._transforming = true;

      this._fire('transformstart', { evt: e });
      this.getNode()._fire('transformstart', { evt: e });
    },

    _handleMouseMove: function(e) {
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

      // console.log(keepProportion);

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

        if (attrs.height < 0) {
          dAlpha -= Math.PI;
        }

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
          {
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
          },
          e
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

      var centeredScaling = this.getCenteredScaling() || e.altKey;
      if (centeredScaling) {
        var topLeft = this.findOne('.top-left');
        var bottomRight = this.findOne('.bottom-right');
        var topOffsetX = topLeft.x();
        var topOffsetY = topLeft.y();

        var bottomOffsetX = this.getWidth() - bottomRight.x();
        var bottomOffsetY = this.getHeight() - bottomRight.y();

        // console.log(topOffsetX, topOffsetY, bottomOffsetX, bottomOffsetY);

        bottomRight.move({
          x: -topOffsetX,
          y: -topOffsetY
        });

        topLeft.move({
          x: bottomOffsetX,
          y: bottomOffsetY
        });

        absPos = topLeft.getAbsolutePosition(this.getParent());
      }

      x = absPos.x;
      y = absPos.y;
      var width =
        this.findOne('.bottom-right').x() - this.findOne('.top-left').x();

      var height =
        this.findOne('.bottom-right').y() - this.findOne('.top-left').y();

      // console.log(x, y, width, height);

      this._fitNodeInto(
        {
          x: x + this.offsetX(),
          y: y + this.offsetY(),
          width: width,
          height: height
        },
        e
      );
    },

    _handleMouseUp: function(e) {
      this._removeEvents(e);
    },

    _removeEvents: function(e) {
      if (this._transforming) {
        this._transforming = false;
        window.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('touchmove', this._handleMouseMove);
        window.removeEventListener('mouseup', this._handleMouseUp, true);
        window.removeEventListener('touchend', this._handleMouseUp, true);
        this._fire('transformend', { evt: e });
        var node = this.getNode();
        if (node) {
          node.fire('transformend', { evt: e });
        }
      }
    },

    _fitNodeInto: function(newAttrs, evt) {
      // waring! in this attrs padding may be included
      var boundBoxFunc = this.getBoundBoxFunc();
      if (boundBoxFunc) {
        var oldAttrs = this._getNodeRect();
        newAttrs = boundBoxFunc.call(this, oldAttrs, newAttrs);
      }
      this._settings = true;
      var node = this.getNode();
      if (newAttrs.rotation !== undefined) {
        this.getNode().rotation(newAttrs.rotation);
      }
      var pure = node.getClientRect({
        skipTransform: true,
        skipShadow: true,
        skipStroke: this.ignoreStroke()
      });

      var padding = this.getPadding();
      var scaleX = (newAttrs.width - padding * 2) / pure.width;
      var scaleY = (newAttrs.height - padding * 2) / pure.height;

      var rotation = Konva.getAngle(node.getRotation());
      var dx = pure.x * scaleX - padding - node.offsetX() * scaleX;
      var dy = pure.y * scaleY - padding - node.offsetY() * scaleY;

      this.getNode().setAttrs({
        scaleX: scaleX,
        scaleY: scaleY,
        x: newAttrs.x - (dx * Math.cos(rotation) + dy * Math.sin(-rotation)),
        y: newAttrs.y - (dy * Math.cos(rotation) + dx * Math.sin(rotation))
      });
      this._settings = false;

      this._fire('transform', { evt: evt });
      this.getNode()._fire('transform', { evt: evt });
      this.update();
      this.getLayer().batchDraw();
    },
    /**
     * force update of Konva.Transformer.
     * Use it when you updated attached Konva.Group and now you need to reset transformer size
     * @method
     * @memberof Konva.Transformer.prototype
     */
    forceUpdate: function() {
      this._resetTransformCache();
      this.update();
    },
    update: function() {
      var attrs = this._getNodeRect();
      var node = this.getNode();
      var scale = { x: 1, y: 1 };
      if (node && node.getParent()) {
        scale = node.getParent().getAbsoluteScale();
      }
      var invertedScale = {
        x: 1 / scale.x,
        y: 1 / scale.y
      };
      var width = attrs.width;
      var height = attrs.height;

      var enabledAnchors = this.enabledAnchors();
      var resizeEnabled = this.resizeEnabled();
      var padding = this.getPadding();

      var anchorSize = this.getAnchorSize();
      this.find('._anchor').setAttrs({
        width: anchorSize,
        height: anchorSize,
        offsetX: anchorSize / 2,
        offsetY: anchorSize / 2,
        stroke: this.getAnchorStroke(),
        strokeWidth: this.getAnchorStrokeWidth(),
        fill: this.getAnchorFill(),
        cornerRadius: this.getAnchorCornerRadius()
      });

      this.findOne('.top-left').setAttrs({
        x: -padding,
        y: -padding,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0
      });
      this.findOne('.top-center').setAttrs({
        x: width / 2,
        y: -padding,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0
      });
      this.findOne('.top-right').setAttrs({
        x: width + padding,
        y: -padding,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0
      });
      this.findOne('.middle-left').setAttrs({
        x: -padding,
        y: height / 2,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0
      });
      this.findOne('.middle-right').setAttrs({
        x: width + padding,
        y: height / 2,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0
      });
      this.findOne('.bottom-left').setAttrs({
        x: -padding,
        y: height + padding,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0
      });
      this.findOne('.bottom-center').setAttrs({
        x: width / 2,
        y: height + padding,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0
      });
      this.findOne('.bottom-right').setAttrs({
        x: width + padding,
        y: height + padding,
        scale: invertedScale,
        visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0
      });

      var scaledRotateAnchorOffset =
        -this.rotateAnchorOffset() * Math.abs(invertedScale.y);
      this.findOne('.rotater').setAttrs({
        x: width / 2,
        y: scaledRotateAnchorOffset * Konva.Util._sign(height),
        scale: invertedScale,
        visible: this.rotateEnabled()
      });

      this.findOne('.back').setAttrs({
        width: width * scale.x,
        height: height * scale.y,
        scale: invertedScale,
        visible: this.borderEnabled(),
        stroke: this.getBorderStroke(),
        strokeWidth: this.getBorderStrokeWidth(),
        dash: this.getBorderDash()
      });
    },
    /**
     * determine if transformer is in active transform
     * @method
     * @memberof Konva.Transformer.prototype
     * @returns {Boolean}
     */
    isTransforming: function() {
      return this._transforming;
    },
    /**
     * Stop active transform action
     * @method
     * @memberof Konva.Transformer.prototype
     * @returns {Boolean}
     */
    stopTransform: function() {
      if (this._transforming) {
        this._removeEvents();
        var resizerNode = this.findOne('.' + this.movingResizer);
        if (resizerNode) {
          resizerNode.stopDrag();
        }
      }
    },
    destroy: function() {
      // console.log(this.isTransforming() && this.getStage());
      if (this.getStage() && this._cursorChange) {
        this.getStage().content.style.cursor = '';
      }
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
      Konva.Util.warn('enabledAnchors value should be an array');
    }
    if (val instanceof Array) {
      val.forEach(function(name) {
        if (ANCHORS_NAMES.indexOf(name) === -1) {
          Konva.Util.warn(
            'Unknown anchor name: ' +
              name +
              '. Available names are: ' +
              ANCHORS_NAMES.join(', ')
          );
        }
      });
    }
    return val || [];
  }

  /**
   * get/set enabled handlers
   * @name enabledAnchors
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Array} array
   * @returns {Array}
   * @example
   * // get list of handlers
   * var enabledAnchors = transformer.enabledAnchors();
   *
   * // set handlers
   * transformer.enabledAnchors(['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'enabledAnchors',
    ANCHORS_NAMES,
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
   * var resizeEnabled = transformer.resizeEnabled();
   *
   * // set
   * transformer.resizeEnabled(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'resizeEnabled', true);
  /**
   * get/set anchor size. Default is 10
   * @name validateAnchors
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Number} 10
   * @returns {Number}
   * @example
   * // get
   * var anchorSize = transformer.anchorSize();
   *
   * // set
   * transformer.anchorSize(20)
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'anchorSize',
    10,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set ability to rotate.
   * @name rotateEnabled
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var rotateEnabled = transformer.rotateEnabled();
   *
   * // set
   * transformer.rotateEnabled(false);
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
   * var rotationSnaps = transformer.rotationSnaps();
   *
   * // set
   * transformer.rotationSnaps([0, 90, 180, 270]);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'rotationSnaps', []);

  /**
   * get/set distance for rotation handler
   * @name rotateAnchorOffset
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Number} offset
   * @returns {Number}
   * @example
   * // get
   * var rotateAnchorOffset = transformer.rotateAnchorOffset();
   *
   * // set
   * transformer.rotateAnchorOffset(100);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'rotateAnchorOffset',
    50,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set visibility of border
   * @name borderEnabled
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderEnabled = transformer.borderEnabled();
   *
   * // set
   * transformer.borderEnabled(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'borderEnabled', true);

  /**
   * get/set anchor stroke color
   * @name anchorStroke
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var anchorStroke = transformer.anchorStroke();
   *
   * // set
   * transformer.anchorStroke('red');
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'anchorStroke',
    'rgb(0, 161, 255)'
  );

  /**
   * get/set anchor stroke width
   * @name anchorStrokeWidth
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var anchorStrokeWidth = transformer.anchorStrokeWidth();
   *
   * // set
   * transformer.anchorStrokeWidth(3);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'anchorStrokeWidth',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set anchor fill color
   * @name anchorFill
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var anchorFill = transformer.anchorFill();
   *
   * // set
   * transformer.anchorFill('red');
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'anchorFill', 'white');

  /**
   * get/set anchor corner radius
   * @name anchorCornerRadius
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Number} enabled
   * @returns {Number}
   * @example
   * // get
   * var anchorCornerRadius = transformer.anchorCornerRadius();
   *
   * // set
   * transformer.anchorCornerRadius(3);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'anchorCornerRadius',
    0,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set border stroke color
   * @name borderStroke
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderStroke = transformer.borderStroke();
   *
   * // set
   * transformer.borderStroke('red');
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'borderStroke',
    'rgb(0, 161, 255)'
  );

  /**
   * get/set border stroke width
   * @name borderStrokeWidth
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderStrokeWidth = transformer.borderStrokeWidth();
   *
   * // set
   * transformer.borderStrokeWidth(3);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'borderStrokeWidth',
    1,
    Konva.Validators.getNumberValidator()
  );

  /**
   * get/set border dash array
   * @name borderDash
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} enabled
   * @returns {Boolean}
   * @example
   * // get
   * var borderDash = transformer.borderDash();
   *
   * // set
   * transformer.borderDash([2, 2]);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'borderDash');

  /**
   * get/set should we keep ratio while resize anchors at corners
   * @name keepRatio
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} keepRatio
   * @returns {Boolean}
   * @example
   * // get
   * var keepRatio = transformer.keepRatio();
   *
   * // set
   * transformer.keepRatio(false);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'keepRatio', true);

  /**
   * get/set should we resize relative to node's center?
   * @name centeredScaling
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} centeredScaling
   * @returns {Boolean}
   * @example
   * // get
   * var centeredScaling = transformer.centeredScaling();
   *
   * // set
   * transformer.centeredScaling(true);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'centeredScaling', false);

  /**
   * get/set should we think about stroke while resize? Good to use when a shape has strokeScaleEnabled = false
   * default is false
   * @name ignoreStroke
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Boolean} ignoreStroke
   * @returns {Boolean}
   * @example
   * // get
   * var ignoreStroke = transformer.ignoreStroke();
   *
   * // set
   * transformer.ignoreStroke(true);
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'ignoreStroke', false);

  /**
   * get/set padding
   * @name padding
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Number} padding
   * @returns {Number}
   * @example
   * // get
   * var padding = transformer.padding();
   *
   * // set
   * transformer.padding(10);
   */
  Konva.Factory.addGetterSetter(
    Konva.Transformer,
    'padding',
    0,
    Konva.Validators.getNumberValidator()
  );

  Konva.Factory.addOverloadedGetterSetter(Konva.Transformer, 'node');

  /**
   * get/set bounding box function
   * @name boundBoxFunc
   * @method
   * @memberof Konva.Transformer.prototype
   * @param {Function} func
   * @returns {Function}
   * @example
   * // get
   * var boundBoxFunc = transformer.boundBoxFunc();
   *
   * // set
   * transformer.boundBoxFunc(function(oldBox, newBox) {
   *   if (newBox.width > 200) {
   *     return oldBox;
   *   }
   *   return newBox;
   * });
   */
  Konva.Factory.addGetterSetter(Konva.Transformer, 'boundBoxFunc');

  Konva.Factory.backCompat(Konva.Transformer, {
    lineEnabled: 'borderEnabled',
    rotateHandlerOffset: 'rotateAnchorOffset',
    enabledHandlers: 'enabledAnchors'
  });

  Konva.Collection.mapMethods(Konva.Transformer);
})(Konva);
