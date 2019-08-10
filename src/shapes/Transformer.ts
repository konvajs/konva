import { Util, Collection } from '../Util';
import { Factory } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';
import { Rect } from './Rect';
import { Group } from '../Group';
import { ContainerConfig } from '../Container';
import { Konva } from '../Global';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

import { GetSet, IRect } from '../types';

interface Box extends IRect {
  rotation: number;
}

export interface TransformerConfig extends ContainerConfig {
  resizeEnabled?: boolean;
  rotateEnabled?: boolean;
  rotationSnaps?: Array<number>;
  rotateAnchorOffset?: number;
  borderEnabled?: boolean;
  borderStroke?: string;
  borderStrokeWidth?: number;
  borderDash?: Array<number>;
  anchorFill?: string;
  anchorStroke?: string;
  anchorStrokeWidth?: number;
  anchorSize?: number;
  keepRatio?: boolean;
  centeredScaling?: boolean;
  enabledAnchors?: Array<string>;
  node?: Rect;
  boundBoxFunc?: (oldBox: Box, newBox: Box) => Box;
}

var EVENTS_NAME = 'tr-konva';

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
]
  .map(e => e + `.${EVENTS_NAME}`)
  .join(' ');

var NODE_RECT = 'nodeRect';

var TRANSFORM_CHANGE_STR = [
  'widthChange',
  'heightChange',
  'scaleXChange',
  'scaleYChange',
  'skewXChange',
  'skewYChange',
  'rotationChange',
  'offsetXChange',
  'offsetYChange',
  'transformsEnabledChange',
  'strokeWidthChange'
]
  .map(e => e + `.${EVENTS_NAME}`)
  .join(' ');

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

  rad += Util._degToRad(ANGLES[anchorName] || 0);
  // If we are mirrored, we need to mirror the angle (this is not the same as
  // rotate).
  if (isMirrored) {
    rad *= -1;
  }
  var angle = ((Util._radToDeg(rad) % 360) + 360) % 360;

  if (Util._inRange(angle, 315 + 22.5, 360) || Util._inRange(angle, 0, 22.5)) {
    // TOP
    return 'ns-resize';
  } else if (Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
    // TOP - RIGHT
    return 'nesw-resize';
  } else if (Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
    // RIGHT
    return 'ew-resize';
  } else if (Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
    // BOTTOM - RIGHT
    return 'nwse-resize';
  } else if (Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
    // BOTTOM
    return 'ns-resize';
  } else if (Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
    // BOTTOM - LEFT
    return 'nesw-resize';
  } else if (Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
    // RIGHT
    return 'ew-resize';
  } else if (Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
    // BOTTOM - RIGHT
    return 'nwse-resize';
  } else {
    // how can we can there?
    Util.error('Transformer has unknown angle for cursor detection: ' + angle);
    return 'pointer';
  }
}

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

var MAX_SAFE_INTEGER = 100000000;

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
 * @param {Function} [config.ignoreStroke] Should we ignore stroke size? Default is false
 *
 * @example
 * var transformer = new Konva.Transformer({
 *   node: rectangle,
 *   rotateAnchorOffset: 60,
 *   enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
 * });
 * layer.add(transformer);
 */

export class Transformer extends Group {
  _node: Node;
  movingResizer: string;
  _transforming = false;
  sin: number;
  cos: number;
  _cursorChange: boolean;

  constructor(config?: TransformerConfig) {
    // call super constructor
    super(config);
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
  }
  /**
   * alias to `tr.node(shape)`
   * @method
   * @name Konva.Transformer#attachTo
   * @returns {Konva.Transformer}
   * @example
   * transformer.attachTo(shape);
   */
  attachTo(node) {
    this.setNode(node);
    return this;
  }
  setNode(node) {
    if (this._node) {
      this.detach();
    }
    this._node = node;
    this._resetTransformCache();

    const additionalEvents = node._attrsAffectingSize
      .map(prop => prop + 'Change.' + EVENTS_NAME)
      .join(' ');

    const onChange = () => {
      this._resetTransformCache();
      if (!this._transforming) {
        this.update();
      }
    };
    node.on(additionalEvents, onChange);
    node.on(TRANSFORM_CHANGE_STR, onChange);
    node.on(`xChange.${EVENTS_NAME} yChange.${EVENTS_NAME}`, () =>
      this._resetTransformCache()
    );
    // we may need it if we set node in initial props
    // so elements are not defined yet
    var elementsCreated = !!this.findOne('.top-left');
    if (elementsCreated) {
      this.update();
    }
    return this;
  }
  getNode() {
    return this._node;
  }
  /**
   * detach transformer from an attached node
   * @method
   * @name Konva.Transformer#detach
   * @returns {Konva.Transformer}
   * @example
   * transformer.detach();
   */
  detach() {
    if (this.getNode()) {
      this.getNode().off('.' + EVENTS_NAME);
      this._node = undefined;
    }
    this._resetTransformCache();
  }
  _resetTransformCache() {
    this._clearCache(NODE_RECT);
    this._clearCache('transform');
    this._clearSelfAndDescendantCache('absoluteTransform');
  }
  _getNodeRect() {
    return this._getCache(NODE_RECT, this.__getNodeRect);
  }
  __getNodeRect() {
    var node = this.getNode();
    if (!node) {
      return {
        x: -MAX_SAFE_INTEGER,
        y: -MAX_SAFE_INTEGER,
        width: 0,
        height: 0,
        rotation: 0
      };
    }

    if (node.parent && this.parent && node.parent !== this.parent) {
      Util.warn(
        'Transformer and attached node have different parents. Konva does not support such case right now. Please move Transformer to the parent of attaching node.'
      );
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
  }
  getX() {
    return this._getNodeRect().x;
  }
  getY() {
    return this._getNodeRect().y;
  }
  getRotation() {
    return this._getNodeRect().rotation;
  }
  getWidth() {
    return this._getNodeRect().width;
  }
  getHeight() {
    return this._getNodeRect().height;
  }
  _createElements() {
    this._createBack();

    ANCHORS_NAMES.forEach(
      function(name) {
        this._createAnchor(name);
      }.bind(this)
    );

    this._createAnchor('rotater');
  }
  _createAnchor(name) {
    var anchor = new Rect({
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
    anchor.on('mouseenter', () => {
      var rad = Konva.getAngle(this.rotation());

      var scale = this.getNode().getAbsoluteScale();
      // If scale.y < 0 xor scale.x < 0 we need to flip (not rotate).
      var isMirrored = scale.y * scale.x < 0;
      var cursor = getCursor(name, rad, isMirrored);
      anchor.getStage().content.style.cursor = cursor;
      this._cursorChange = true;
    });
    anchor.on('mouseout', () => {
      if (!anchor.getStage() || !anchor.getParent()) {
        return;
      }
      anchor.getStage().content.style.cursor = '';
      this._cursorChange = false;
    });
    this.add(anchor);
  }
  _createBack() {
    var back = new Shape({
      name: 'back',
      width: 0,
      height: 0,
      listening: false,
      sceneFunc(ctx) {
        var tr = this.getParent();
        var padding = tr.padding();
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
            -tr.rotateAnchorOffset() * Util._sign(this.height())
          );
        }

        ctx.fillStrokeShape(this);
      }
    });
    this.add(back);
  }
  _handleMouseDown(e) {
    this.movingResizer = e.target.name().split(' ')[0];

    // var node = this.getNode();
    var attrs = this._getNodeRect();
    var width = attrs.width;
    var height = attrs.height;
    var hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    this.sin = Math.abs(height / hypotenuse);
    this.cos = Math.abs(width / hypotenuse);

    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('touchmove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp, true);
    window.addEventListener('touchend', this._handleMouseUp, true);

    this._transforming = true;

    this._fire('transformstart', { evt: e });
    this.getNode()._fire('transformstart', { evt: e });
  }
  _handleMouseMove(e) {
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

        var reverse =
          this.findOne('.top-left').x() > this.findOne('.bottom-right').x()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverse;
        y = newHypotenuse * this.sin * reverse;

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

        var reverse =
          this.findOne('.top-right').x() < this.findOne('.top-left').x()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverse;
        y = newHypotenuse * this.sin * reverse;

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

        var reverse =
          this.findOne('.top-right').x() < this.findOne('.bottom-left').x()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverse;
        y = newHypotenuse * this.sin * reverse;

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

        var reverse =
          this.findOne('.top-left').x() > this.findOne('.bottom-right').x()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverse;
        y = newHypotenuse * this.sin * reverse;

        this.findOne('.bottom-right').x(x);
        this.findOne('.bottom-right').y(y);
      }
    } else if (this.movingResizer === 'rotater') {
      var padding = this.padding();
      var attrs = this._getNodeRect();
      x = resizerNode.x() - attrs.width / 2;
      y = -resizerNode.y() + attrs.height / 2;

      var dAlpha = Math.atan2(-y, x) + Math.PI / 2;

      if (attrs.height < 0) {
        dAlpha -= Math.PI;
      }

      var rot = Konva.getAngle(this.rotation());

      var newRotation = Util._radToDeg(rot) + Util._radToDeg(dAlpha);

      var alpha = Konva.getAngle(this.getNode().rotation());
      var newAlpha = Util._degToRad(newRotation);

      var snaps = this.rotationSnaps();
      var offset = 0.1;
      for (var i = 0; i < snaps.length; i++) {
        var angle = Konva.getAngle(snaps[i]);

        var dif = Math.abs(angle - Util._degToRad(newRotation)) % (Math.PI * 2);

        if (dif < offset) {
          newRotation = Util._radToDeg(angle);
          newAlpha = Util._degToRad(newRotation);
        }
      }

      var dx = padding;
      var dy = padding;

      this._fitNodeInto(
        {
          rotation: Konva.angleDeg ? newRotation : Util._degToRad(newRotation),
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
          'Wrong position argument of selection resizer: ' + this.movingResizer
        )
      );
    }

    if (this.movingResizer === 'rotater') {
      return;
    }

    var absPos = this.findOne('.top-left').getAbsolutePosition(
      this.getParent()
    );

    var centeredScaling = this.centeredScaling() || e.altKey;
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
  }
  _handleMouseUp(e) {
    this._removeEvents(e);
  }
  _removeEvents(e?) {
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
  }
  _fitNodeInto(newAttrs, evt) {
    // waring! in this attrs padding may be included
    var boundBoxFunc = this.boundBoxFunc();
    if (boundBoxFunc) {
      var oldAttrs = this._getNodeRect();
      newAttrs = boundBoxFunc.call(this, oldAttrs, newAttrs);
    }
    var node = this.getNode();
    if (newAttrs.rotation !== undefined) {
      this.getNode().rotation(newAttrs.rotation);
    }
    var pure = node.getClientRect({
      skipTransform: true,
      skipShadow: true,
      skipStroke: this.ignoreStroke()
    });

    var padding = this.padding();
    var scaleX = (newAttrs.width - padding * 2) / pure.width;
    var scaleY = (newAttrs.height - padding * 2) / pure.height;

    var rotation = Konva.getAngle(node.rotation());
    var dx = pure.x * scaleX - padding - node.offsetX() * scaleX;
    var dy = pure.y * scaleY - padding - node.offsetY() * scaleY;

    this.getNode().setAttrs({
      scaleX: scaleX,
      scaleY: scaleY,
      x: newAttrs.x - (dx * Math.cos(rotation) + dy * Math.sin(-rotation)),
      y: newAttrs.y - (dy * Math.cos(rotation) + dx * Math.sin(rotation))
    });

    this._fire('transform', { evt: evt });
    this.getNode()._fire('transform', { evt: evt });
    this.update();
    this.getLayer().batchDraw();
  }
  /**
   * force update of Konva.Transformer.
   * Use it when you updated attached Konva.Group and now you need to reset transformer size
   * @method
   * @name Konva.Transformer#forceUpdate
   */
  forceUpdate() {
    this._resetTransformCache();
    this.update();
  }
  update() {
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
    var padding = this.padding();

    var anchorSize = this.anchorSize();
    this.find('._anchor').each(node =>
      node.setAttrs({
        width: anchorSize,
        height: anchorSize,
        offsetX: anchorSize / 2,
        offsetY: anchorSize / 2,
        stroke: this.anchorStroke(),
        strokeWidth: this.anchorStrokeWidth(),
        fill: this.anchorFill(),
        cornerRadius: this.anchorCornerRadius()
      })
    );

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
      y: scaledRotateAnchorOffset * Util._sign(height),
      scale: invertedScale,
      visible: this.rotateEnabled()
    });

    this.findOne('.back').setAttrs({
      width: width * scale.x,
      height: height * scale.y,
      scale: invertedScale,
      visible: this.borderEnabled(),
      stroke: this.borderStroke(),
      strokeWidth: this.borderStrokeWidth(),
      dash: this.borderDash()
    });
  }
  /**
   * determine if transformer is in active transform
   * @method
   * @name Konva.Transformer#isTransforming
   * @returns {Boolean}
   */
  isTransforming() {
    return this._transforming;
  }
  /**
   * Stop active transform action
   * @method
   * @name Konva.Transformer#stopTransform
   * @returns {Boolean}
   */
  stopTransform() {
    if (this._transforming) {
      this._removeEvents();
      var resizerNode = this.findOne('.' + this.movingResizer);
      if (resizerNode) {
        resizerNode.stopDrag();
      }
    }
  }
  destroy() {
    if (this.getStage() && this._cursorChange) {
      this.getStage().content.style.cursor = '';
    }
    Group.prototype.destroy.call(this);
    this.detach();
    this._removeEvents();
    return this;
  }
  // do not work as a container
  // we will recreate inner nodes manually
  toObject() {
    return Node.prototype.toObject.call(this);
  }

  enabledAnchors: GetSet<string[], this>;
  rotationSnaps: GetSet<number[], this>;
  anchorSize: GetSet<number, this>;
  resizeEnabled: GetSet<boolean, this>;
  rotateEnabled: GetSet<boolean, this>;
  rotateAnchorOffset: GetSet<number, this>;
  padding: GetSet<number, this>;
  borderEnabled: GetSet<boolean, this>;
  borderStroke: GetSet<string, this>;
  borderStrokeWidth: GetSet<number, this>;
  borderDash: GetSet<number[], this>;
  anchorFill: GetSet<string, this>;
  anchorStroke: GetSet<string, this>;
  anchorCornerRadius: GetSet<number, this>;
  anchorStrokeWidth: GetSet<number, this>;
  keepRatio: GetSet<boolean, this>;
  centeredScaling: GetSet<boolean, this>;
  ignoreStroke: GetSet<boolean, this>;
  boundBoxFunc: GetSet<(oldBox: IRect, newBox: IRect) => IRect, this>;
}

function validateAnchors(val) {
  if (!(val instanceof Array)) {
    Util.warn('enabledAnchors value should be an array');
  }
  if (val instanceof Array) {
    val.forEach(function(name) {
      if (ANCHORS_NAMES.indexOf(name) === -1) {
        Util.warn(
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

Transformer.prototype.className = 'Transformer';
_registerNode(Transformer);

/**
 * get/set enabled handlers
 * @name Konva.Transformer#enabledAnchors
 * @method
 * @param {Array} array
 * @returns {Array}
 * @example
 * // get list of handlers
 * var enabledAnchors = transformer.enabledAnchors();
 *
 * // set handlers
 * transformer.enabledAnchors(['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']);
 */
Factory.addGetterSetter(
  Transformer,
  'enabledAnchors',
  ANCHORS_NAMES,
  validateAnchors
);

/**
 * get/set resize ability. If false it will automatically hide resizing handlers
 * @name Konva.Transformer#resizeEnabled
 * @method
 * @param {Array} array
 * @returns {Array}
 * @example
 * // get
 * var resizeEnabled = transformer.resizeEnabled();
 *
 * // set
 * transformer.resizeEnabled(false);
 */
Factory.addGetterSetter(Transformer, 'resizeEnabled', true);
/**
 * get/set anchor size. Default is 10
 * @name Konva.Transformer#validateAnchors
 * @method
 * @param {Number} 10
 * @returns {Number}
 * @example
 * // get
 * var anchorSize = transformer.anchorSize();
 *
 * // set
 * transformer.anchorSize(20)
 */
Factory.addGetterSetter(Transformer, 'anchorSize', 10, getNumberValidator());

/**
 * get/set ability to rotate.
 * @name Konva.Transformer#rotateEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var rotateEnabled = transformer.rotateEnabled();
 *
 * // set
 * transformer.rotateEnabled(false);
 */
Factory.addGetterSetter(Transformer, 'rotateEnabled', true);

/**
 * get/set rotation snaps angles.
 * @name Konva.Transformer#rotationSnaps
 * @method
 * @param {Array} array
 * @returns {Array}
 * @example
 * // get
 * var rotationSnaps = transformer.rotationSnaps();
 *
 * // set
 * transformer.rotationSnaps([0, 90, 180, 270]);
 */
Factory.addGetterSetter(Transformer, 'rotationSnaps', []);

/**
 * get/set distance for rotation handler
 * @name Konva.Transformer#rotateAnchorOffset
 * @method
 * @param {Number} offset
 * @returns {Number}
 * @example
 * // get
 * var rotateAnchorOffset = transformer.rotateAnchorOffset();
 *
 * // set
 * transformer.rotateAnchorOffset(100);
 */
Factory.addGetterSetter(
  Transformer,
  'rotateAnchorOffset',
  50,
  getNumberValidator()
);

/**
 * get/set visibility of border
 * @name Konva.Transformer#borderEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var borderEnabled = transformer.borderEnabled();
 *
 * // set
 * transformer.borderEnabled(false);
 */
Factory.addGetterSetter(Transformer, 'borderEnabled', true);

/**
 * get/set anchor stroke color
 * @name Konva.Transformer#anchorStroke
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var anchorStroke = transformer.anchorStroke();
 *
 * // set
 * transformer.anchorStroke('red');
 */
Factory.addGetterSetter(Transformer, 'anchorStroke', 'rgb(0, 161, 255)');

/**
 * get/set anchor stroke width
 * @name Konva.Transformer#anchorStrokeWidth
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var anchorStrokeWidth = transformer.anchorStrokeWidth();
 *
 * // set
 * transformer.anchorStrokeWidth(3);
 */
Factory.addGetterSetter(
  Transformer,
  'anchorStrokeWidth',
  1,
  getNumberValidator()
);

/**
 * get/set anchor fill color
 * @name Konva.Transformer#anchorFill
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var anchorFill = transformer.anchorFill();
 *
 * // set
 * transformer.anchorFill('red');
 */
Factory.addGetterSetter(Transformer, 'anchorFill', 'white');

/**
 * get/set anchor corner radius
 * @name Konva.Transformer#anchorCornerRadius
 * @method
 * @param {Number} enabled
 * @returns {Number}
 * @example
 * // get
 * var anchorCornerRadius = transformer.anchorCornerRadius();
 *
 * // set
 * transformer.anchorCornerRadius(3);
 */
Factory.addGetterSetter(
  Transformer,
  'anchorCornerRadius',
  0,
  getNumberValidator()
);

/**
 * get/set border stroke color
 * @name Konva.Transformer#borderStroke
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var borderStroke = transformer.borderStroke();
 *
 * // set
 * transformer.borderStroke('red');
 */
Factory.addGetterSetter(Transformer, 'borderStroke', 'rgb(0, 161, 255)');

/**
 * get/set border stroke width
 * @name Konva.Transformer#borderStrokeWidth
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var borderStrokeWidth = transformer.borderStrokeWidth();
 *
 * // set
 * transformer.borderStrokeWidth(3);
 */
Factory.addGetterSetter(
  Transformer,
  'borderStrokeWidth',
  1,
  getNumberValidator()
);

/**
 * get/set border dash array
 * @name Konva.Transformer#borderDash
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var borderDash = transformer.borderDash();
 *
 * // set
 * transformer.borderDash([2, 2]);
 */
Factory.addGetterSetter(Transformer, 'borderDash');

/**
 * get/set should we keep ratio while resize anchors at corners
 * @name Konva.Transformer#keepRatio
 * @method
 * @param {Boolean} keepRatio
 * @returns {Boolean}
 * @example
 * // get
 * var keepRatio = transformer.keepRatio();
 *
 * // set
 * transformer.keepRatio(false);
 */
Factory.addGetterSetter(Transformer, 'keepRatio', true);

/**
 * get/set should we resize relative to node's center?
 * @name Konva.Transformer#centeredScaling
 * @method
 * @param {Boolean} centeredScaling
 * @returns {Boolean}
 * @example
 * // get
 * var centeredScaling = transformer.centeredScaling();
 *
 * // set
 * transformer.centeredScaling(true);
 */
Factory.addGetterSetter(Transformer, 'centeredScaling', false);

/**
 * get/set should we think about stroke while resize? Good to use when a shape has strokeScaleEnabled = false
 * default is false
 * @name Konva.Transformer#ignoreStroke
 * @method
 * @param {Boolean} ignoreStroke
 * @returns {Boolean}
 * @example
 * // get
 * var ignoreStroke = transformer.ignoreStroke();
 *
 * // set
 * transformer.ignoreStroke(true);
 */
Factory.addGetterSetter(Transformer, 'ignoreStroke', false);

/**
 * get/set padding
 * @name Konva.Transformer#padding
 * @method
 * @param {Number} padding
 * @returns {Number}
 * @example
 * // get
 * var padding = transformer.padding();
 *
 * // set
 * transformer.padding(10);
 */
Factory.addGetterSetter(Transformer, 'padding', 0, getNumberValidator());

/**
 * get/set attached node of the Transformer. Transformer will adapt to its size and listen to its events
 * @method
 * @name Konva.Transformer#Konva.Transformer#node
 * @returns {Konva.Node}
 * @example
 * // get
 * const node = transformer.node();
 *
 * // set
 * transformer.node(shape);
 */

Factory.addGetterSetter(Transformer, 'node');

/**
 * get/set bounding box function
 * @name Konva.Transformer#boundBoxFunc
 * @method
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
Factory.addGetterSetter(Transformer, 'boundBoxFunc');

Factory.backCompat(Transformer, {
  lineEnabled: 'borderEnabled',
  rotateHandlerOffset: 'rotateAnchorOffset',
  enabledHandlers: 'enabledAnchors'
});

Collection.mapMethods(Transformer);
