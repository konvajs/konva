import { Util, Collection, Transform, Point } from '../Util';
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
  rotationSnapTolerance?: number;
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

var NODES_RECT = 'nodesRect';

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

const TOUCH_DEVICE = 'ontouchstart' in Konva._global;

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

type SHAPE = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

function getCenter(shape: SHAPE) {
  return {
    x:
      shape.x +
      (shape.width / 2) * Math.cos(shape.rotation) +
      (shape.height / 2) * Math.sin(-shape.rotation),
    y:
      shape.y +
      (shape.height / 2) * Math.cos(shape.rotation) +
      (shape.width / 2) * Math.sin(shape.rotation)
  };
}

function rotateAroundPoint(shape: SHAPE, angleRad: number, point: Point) {
  const x =
    point.x +
    (shape.x - point.x) * Math.cos(angleRad) -
    (shape.y - point.y) * Math.sin(angleRad);
  const y =
    point.y +
    (shape.x - point.x) * Math.sin(angleRad) +
    (shape.y - point.y) * Math.cos(angleRad);
  return {
    ...shape,
    rotation: shape.rotation + angleRad,
    x,
    y
  };
}

function rotateAroundCenter(shape: SHAPE, deltaRad: number) {
  const center = getCenter(shape);
  return rotateAroundPoint(shape, deltaRad, center);
}

function getShapeRect(shape: SHAPE) {
  const angleRad = shape.rotation;
  const x1 = shape.x;
  const y1 = shape.y;
  const x2 = x1 + shape.width * Math.cos(angleRad);
  const y2 = y1 + shape.width * Math.sin(angleRad);
  const x3 =
    shape.x +
    shape.width * Math.cos(angleRad) +
    shape.height * Math.sin(-angleRad);
  const y3 =
    shape.y +
    shape.height * Math.cos(angleRad) +
    shape.width * Math.sin(angleRad);
  const x4 = shape.x + shape.height * Math.sin(-angleRad);
  const y4 = shape.y + shape.height * Math.cos(angleRad);

  const leftX = Math.min(x1, x2, x3, x4);
  const rightX = Math.max(x1, x2, x3, x4);
  const topY = Math.min(y1, y2, y3, y4);
  const bottomY = Math.max(y1, y2, y3, y4);
  return {
    x: leftX,
    y: topY,
    width: rightX - leftX,
    height: bottomY - topY
  };
}

function getShapesRect(shapes: Array<SHAPE>) {
  // if (shapes.length === 1) {
  //   const shape = shapes[0];

  //   return {
  //     x: shape.x,
  //     y: shape.y,
  //     width: shape.width,
  //     height: shape.height,
  //     rotation: shape.rotation
  //   };
  // }
  let x1 = 9999999999;
  let y1 = 9999999999;
  let x2 = -999999999;
  let y2 = -999999999;
  shapes.forEach(shape => {
    const rect = getShapeRect(shape);
    x1 = Math.min(x1, rect.x);
    y1 = Math.min(y1, rect.y);
    x2 = Math.max(x2, rect.x + rect.width);
    y2 = Math.max(y2, rect.y + rect.height);
  });

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
    rotation: 0
  };
}

function transformShape(
  shape: SHAPE,
  oldSelection: SHAPE,
  newSelection: SHAPE,
  keepOffset = 1
) {
  const offset = rotateAroundPoint(shape, -oldSelection.rotation, {
    x: oldSelection.x,
    y: oldSelection.y
  });
  const offsetX = offset.x - oldSelection.x;
  const offsetY = offset.y - oldSelection.y;

  const angle = oldSelection.rotation;

  const scaleX = shape.width ? newSelection.width / oldSelection.width : 1;
  const scaleY = shape.height ? newSelection.height / oldSelection.height : 1;

  return {
    x:
      keepOffset * newSelection.x +
      offsetX * scaleX * Math.cos(angle) +
      offsetY * scaleY * Math.sin(-angle),
    y:
      keepOffset * newSelection.y +
      offsetX * scaleX * Math.sin(angle) +
      offsetY * scaleY * Math.cos(angle),
    width: shape.width * scaleX,
    height: shape.height * scaleY,
    rotation: shape.rotation
  };
}

function transformAndRotateShape(
  shape: SHAPE,
  oldSelection: SHAPE,
  newSelection: SHAPE
) {
  const updated = transformShape(shape, oldSelection, newSelection);
  return rotateAroundPoint(
    updated,
    newSelection.rotation - oldSelection.rotation,
    newSelection
  );
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
 * @param {Number} [config.rotationSnapTolerance] Snapping tolerance. If closer than this it will snap. Default is 5
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
  _nodes: Array<Node>;
  _movingAnchorName: string;
  _transforming = false;
  _anchorDragOffset: Point;
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
    return this.setNodes([node]);
    // if (this._node) {
    //   this.detach();
    // }
    // this._node = node;
    // this._resetTransformCache();

    // const additionalEvents = node._attrsAffectingSize
    //   .map(prop => prop + 'Change.' + EVENTS_NAME)
    //   .join(' ');

    // const onChange = () => {
    //   this._resetTransformCache();
    //   if (!this._transforming) {
    //     this.update();
    //   }
    // };
    // node.on(additionalEvents, onChange);
    // node.on(TRANSFORM_CHANGE_STR, onChange);
    // node.on(`xChange.${EVENTS_NAME} yChange.${EVENTS_NAME}`, () =>
    //   this._resetTransformCache()
    // );
    // // we may need it if we set node in initial props
    // // so elements are not defined yet
    // var elementsCreated = !!this.findOne('.top-left');
    // if (elementsCreated) {
    //   this.update();
    // }
    // return this;
  }
  getNode() {
    return this._nodes && this._nodes[0];
  }

  drawScene(can?, top?, caching?) {
    if (!this._cache.get(NODES_RECT)) {
      this.update();
    }
    return super.drawScene(can, top, caching);
  }
  // _attachTo(node) => {

  // }
  setNodes(nodes: Array<Node> = []) {
    if (this._nodes && this._nodes.length) {
      this.detach();
    }
    this._nodes = nodes;
    if (nodes.length === 1) {
      this.rotation(nodes[0].rotation());
    } else {
      this.rotation(0);
    }
    this._nodes.forEach(node => {
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
      node.on(`xChange.${EVENTS_NAME} yChange.${EVENTS_NAME}`, () => {
        this._resetTransformCache();
      });
    });
    this._resetTransformCache();
    // we may need it if we set node in initial props
    // so elements are not defined yet
    var elementsCreated = !!this.findOne('.top-left');
    if (elementsCreated) {
      this.update();
    }
    return this;
  }

  getNodes() {
    return this._nodes;
  }
  /**
   * return the name of current active anchor
   * @method
   * @name Konva.Transformer#getActiveAnchor
   * @returns {String | Null}
   * @example
   * transformer.getActiveAnchor();
   */
  getActiveAnchor() {
    return this._movingAnchorName;
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
      this._nodes = [];
    }
    this._resetTransformCache();
  }
  _resetTransformCache() {
    this._clearCache(NODES_RECT);
    this._clearCache('transform');
    this._clearSelfAndDescendantCache('absoluteTransform');
  }
  _getNodeRect() {
    return this._getCache(NODES_RECT, this.__getNodeRect);
  }

  __getNodeShape(node, rot = this.rotation()) {
    var rect = node.getClientRect({
      skipTransform: true,
      skipShadow: true,
      skipStroke: this.ignoreStroke()
    });

    var absScale = node.getAbsoluteScale();
    var absPos = node.getAbsolutePosition();

    var dx = rect.x * absScale.x - node.offsetX() * absScale.x;
    var dy = rect.y * absScale.y - node.offsetY() * absScale.y;

    const rotation = Konva.getAngle(node.getAbsoluteRotation());

    const box = {
      x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
      y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
      width: rect.width * absScale.x,
      height: rect.height * absScale.y,
      rotation: rotation
    };
    return rotateAroundPoint(box, -Konva.getAngle(rot), {
      x: 0,
      y: 0
    });
  }
  // returns box + rotation of all shapes
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

    const shapes = this.nodes().map(node => {
      return this.__getNodeShape(node);
    });

    const box = getShapesRect(shapes);
    return rotateAroundPoint(box, Konva.getAngle(this.rotation()), {
      x: 0,
      y: 0
    });

    // return {
    //   x: node.x() + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
    //   y: node.y() + dy * Math.cos(rotation) + dx * Math.sin(rotation),
    //   width: rect.width * node.scaleX(),
    //   height: rect.height * node.scaleY(),
    //   rotation: node.rotation()
    // };
  }
  getX() {
    return this._getNodeRect().x;
  }
  getY() {
    return this._getNodeRect().y;
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
      draggable: false,
      hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto'
    });
    var self = this;
    anchor.on('mousedown touchstart', function(e) {
      self._handleMouseDown(e);
    });
    // anchor.on('dragstart', function(e) {
    //   e.cancelBubble = true;
    // });
    // anchor.on('dragmove', function(e) {
    //   e.cancelBubble = true;
    // });
    // anchor.on('dragend', function(e) {
    //   e.cancelBubble = true;
    // });

    // add hover styling
    anchor.on('mouseenter', () => {
      var rad = Konva.getAngle(this.rotation());

      // var scale = this.getNode().getAbsoluteScale();
      // If scale.y < 0 xor scale.x < 0 we need to flip (not rotate).
      // var isMirrored = false;
      var cursor = getCursor(name, rad, false);
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
            -tr.rotateAnchorOffset() * Util._sign(this.height()) - padding
          );
        }

        ctx.fillStrokeShape(this);
      },
      listening: false
      // hitFunc(ctx) {
      //   var tr = this.getParent();
      //   var padding = tr.padding();
      //   ctx.beginPath();
      //   ctx.rect(
      //     -padding,
      //     -padding,
      //     this.width() + padding * 2,
      //     this.height() + padding * 2
      //   );
      //   ctx.fillStrokeShape(this);
      // }
    });
    this.add(back);
  }
  _handleMouseDown(e) {
    this._movingAnchorName = e.target.name().split(' ')[0];

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
    var ap = e.target.getAbsolutePosition();
    var pos = e.target.getStage().getPointerPosition();
    this._anchorDragOffset = {
      x: pos.x - ap.x,
      y: pos.y - ap.y
    };
    this._fire('transformstart', { evt: e, target: this.getNode() });
    this.getNode()._fire('transformstart', { evt: e, target: this.getNode() });
  }
  _handleMouseMove(e) {
    var x, y, newHypotenuse;
    var anchorNode = this.findOne('.' + this._movingAnchorName);
    var stage = anchorNode.getStage();

    stage.setPointersPositions(e);

    const pp = stage.getPointerPosition();
    var newNodePos = {
      x: pp.x - this._anchorDragOffset.x,
      y: pp.y - this._anchorDragOffset.y
    };
    const oldAbs = anchorNode.getAbsolutePosition();
    anchorNode.setAbsolutePosition(newNodePos);
    const newAbs = anchorNode.getAbsolutePosition();

    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
      return;
    }

    var centeredScaling = this.centeredScaling() || e.altKey;
    // if (centeredScaling && this._movingAnchorName.indexOf('left') >= 0) {
    //   var topLeft = this.findOne('.top-left');
    //   var bottomRight = this.findOne('.bottom-right');
    //   var topOffsetX = topLeft.x() + padding;
    //   var topOffsetY = topLeft.y() + padding;

    //   var bottomOffsetX = this.getWidth() - bottomRight.x() + padding;
    //   var bottomOffsetY = this.getHeight() - bottomRight.y() + padding;

    //   bottomRight.move({
    //     x: -anchorNode.x(),
    //     y: -anchorNode.y()
    //   });

    //   topLeft.move({
    //     x: bottomOffsetX,
    //     y: bottomOffsetY
    //   });
    // }

    var keepProportion = this.keepRatio() || e.shiftKey;

    var padding = 0;

    if (this._movingAnchorName === 'top-left') {
      // if (centeredScaling) {
      //   this.findOne('.bottom-right').move({
      //     x: -anchorNode.x(),
      //     y: -anchorNode.y()
      //   });
      // }

      if (keepProportion) {
        newHypotenuse = Math.sqrt(
          Math.pow(
            this.findOne('.bottom-right').x() - anchorNode.x() - padding * 2,
            2
          ) +
            Math.pow(
              this.findOne('.bottom-right').y() - anchorNode.y() - padding * 2,
              2
            )
        );

        var reverseX =
          this.findOne('.top-left').x() > this.findOne('.bottom-right').x()
            ? -1
            : 1;

        var reverseY =
          this.findOne('.top-left').y() > this.findOne('.bottom-right').y()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.top-left').x(
          this.findOne('.bottom-right').x() - x - padding * 2
        );
        this.findOne('.top-left').y(
          this.findOne('.bottom-right').y() - y - padding * 2
        );
      }
    } else if (this._movingAnchorName === 'top-center') {
      // if (centeredScaling) {
      //   this.findOne('.bottom-right').move({
      //     x: 0,
      //     y: -anchorNode.y()
      //   });
      // }
      this.findOne('.top-left').y(anchorNode.y());
    } else if (this._movingAnchorName === 'top-right') {
      if (centeredScaling) {
        // this.findOne('.bottom-left').move({
        //   x: -(anchorNode.x() - this.width()),
        //   y: -anchorNode.y()
        // });
        // this.findOne('.top-left').move({
        //   x: -(anchorNode.x() - this.width()),
        //   y: anchorNode.y()
        // });
        // this.findOne('.bottom-right').move({
        //   x: -(anchorNode.x() - this.width()),
        //   y: anchorNode.y()
        // });
      }

      // var center = getCenter({
      //   x
      // })
      if (keepProportion) {
        newHypotenuse = Math.sqrt(
          Math.pow(
            anchorNode.x() - this.findOne('.bottom-left').x() - padding * 2,
            2
          ) +
            Math.pow(
              this.findOne('.bottom-left').y() - anchorNode.y() - padding * 2,
              2
            )
        );

        var reverseX =
          this.findOne('.top-right').x() < this.findOne('.top-left').x()
            ? -1
            : 1;

        var reverseY =
          this.findOne('.top-right').y() > this.findOne('.bottom-left').y()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.top-right').x(x + padding);
        this.findOne('.top-right').y(
          this.findOne('.bottom-left').y() - y - padding * 2
        );
      }
      var pos = anchorNode.position();
      this.findOne('.top-left').y(pos.y);
      this.findOne('.bottom-right').x(pos.x);
    } else if (this._movingAnchorName === 'middle-left') {
      // if (centeredScaling) {
      //   this.findOne('.bottom-right').move({
      //     x: -anchorNode.x(),
      //     y: 0
      //   });
      // }
      this.findOne('.top-left').x(anchorNode.x());
    } else if (this._movingAnchorName === 'middle-right') {
      // if (centeredScaling) {
      //   this.findOne('.top-left').move({
      //     x: -(anchorNode.x() - this.width()),
      //     y: 0
      //   });
      // }
      this.findOne('.bottom-right').x(anchorNode.x());
    } else if (this._movingAnchorName === 'bottom-left') {
      // if (centeredScaling) {
      //   this.findOne('.bottom-right').move({
      //     x: -anchorNode.x(),
      //     y: -(anchorNode.y() - this.height())
      //   });
      // }
      if (keepProportion) {
        newHypotenuse = Math.sqrt(
          Math.pow(
            this.findOne('.top-right').x() - anchorNode.x() - padding * 2,
            2
          ) +
            Math.pow(
              anchorNode.y() - this.findOne('.top-right').y() - padding * 2,
              2
            )
        );

        var reverseX =
          this.findOne('.top-right').x() < this.findOne('.bottom-left').x()
            ? -1
            : 1;

        var reverseY =
          this.findOne('.bottom-right').y() < this.findOne('.top-left').y()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.bottom-left').x(
          this.findOne('.top-right').x() - x - padding * 2
        );
        this.findOne('.bottom-left').y(y + padding);
      }

      pos = anchorNode.position();

      this.findOne('.top-left').x(pos.x);
      this.findOne('.bottom-right').y(pos.y);
    } else if (this._movingAnchorName === 'bottom-center') {
      // if (centeredScaling) {
      //   this.findOne('.top-left').move({
      //     x: 0,
      //     y: -(anchorNode.y() - this.height())
      //   });
      // }
      this.findOne('.bottom-right').y(anchorNode.y());
    } else if (this._movingAnchorName === 'bottom-right') {
      // if (centeredScaling) {
      //   this.findOne('.top-left').move({
      //     x: -(anchorNode.x() - this.width()),
      //     y: -(anchorNode.y() - this.height())
      //   });
      // }

      if (keepProportion) {
        newHypotenuse = Math.sqrt(
          Math.pow(this.findOne('.bottom-right').x() - padding, 2) +
            Math.pow(this.findOne('.bottom-right').y() - padding, 2)
        );

        var reverseX =
          this.findOne('.top-left').x() > this.findOne('.bottom-right').x()
            ? -1
            : 1;

        var reverseY =
          this.findOne('.top-left').y() > this.findOne('.bottom-right').y()
            ? -1
            : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.bottom-right').x(x + padding);
        this.findOne('.bottom-right').y(y + padding);
      }
    } else if (this._movingAnchorName === 'rotater') {
      var attrs = this._getNodeRect();
      x = anchorNode.x() - attrs.width / 2;
      y = -anchorNode.y() + attrs.height / 2;

      var dAlpha = Math.atan2(-y, x) + Math.PI / 2;

      if (attrs.height < 0) {
        dAlpha -= Math.PI;
      }

      var rot = Konva.getAngle(this.rotation());

      var newRotation = Util._radToDeg(rot) + Util._radToDeg(dAlpha);

      var alpha = Konva.getAngle(this.getNode().rotation());
      var newAlpha = Util._degToRad(newRotation);

      var snaps = this.rotationSnaps();
      var offset = Konva.getAngle(this.rotationSnapTolerance());
      for (var i = 0; i < snaps.length; i++) {
        var angle = Konva.getAngle(snaps[i]);

        var dif = Math.abs(angle - Util._degToRad(newRotation)) % (Math.PI * 2);

        if (dif < offset) {
          newRotation = Util._radToDeg(angle);
          newAlpha = angle;
        }
      }
      const delta = newAlpha - attrs.rotation;

      var dx = padding;
      var dy = padding;

      const shape = rotateAroundCenter(attrs, delta);

      this._fitNodesInto(shape, e);
    } else {
      console.error(
        new Error(
          'Wrong position argument of selection resizer: ' +
            this._movingAnchorName
        )
      );
    }

    if (this._movingAnchorName === 'rotater') {
      return;
    }

    var centeredScaling = this.centeredScaling() || e.altKey;
    if (centeredScaling) {
      var topLeft = this.findOne('.top-left');
      var bottomRight = this.findOne('.bottom-right');
      var topOffsetX = topLeft.x() + padding;
      var topOffsetY = topLeft.y() + padding;

      var bottomOffsetX = this.getWidth() - bottomRight.x() + padding;
      var bottomOffsetY = this.getHeight() - bottomRight.y() + padding;

      bottomRight.move({
        x: -topOffsetX,
        y: -topOffsetY
      });

      topLeft.move({
        x: bottomOffsetX,
        y: bottomOffsetY
      });
    }

    var absPos = this.findOne('.top-left').getAbsolutePosition();

    x = absPos.x;
    y = absPos.y;
    var width =
      this.findOne('.bottom-right').x() - this.findOne('.top-left').x();

    var height =
      this.findOne('.bottom-right').y() - this.findOne('.top-left').y();

    this._fitNodesInto(
      {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: Konva.getAngle(this.rotation())
      },
      e
    );
  }
  _handleMouseUp(e) {
    this._removeEvents(e);
  }
  getAbsoluteTransform() {
    return this.getTransform();
  }
  _removeEvents(e?) {
    if (this._transforming) {
      this._transforming = false;
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('touchmove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp, true);
      window.removeEventListener('touchend', this._handleMouseUp, true);
      var node = this.getNode();
      this._fire('transformend', { evt: e, target: node });

      if (node) {
        node.fire('transformend', { evt: e, target: node });
      }
      this._movingAnchorName = null;
    }
  }
  _fitNodesInto(newAttrs, evt) {
    var oldAttrs = this._getNodeRect();
    var boundBoxFunc = this.boundBoxFunc();
    if (boundBoxFunc) {
      newAttrs = boundBoxFunc.call(this, oldAttrs, newAttrs);
    }

    const minSize = 1;

    if (Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    if (
      Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)
    ) {
      this.update();
      return;
    }
    // if (newAttrs.width < 0) {
    //   debugger;
    // }
    const an = this._movingAnchorName;
    const allowNegativeScale = true;
    var t = new Transform();
    t.rotate(Konva.getAngle(this.rotation()));
    if (an && newAttrs.width < 0 && an.indexOf('left') >= 0) {
      const offset = t.point({
        x: -this.padding() * 2,
        y: 0
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += this.padding() * 2;
      this._movingAnchorName = an.replace('left', 'right');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    } else if (an && newAttrs.width < 0 && an.indexOf('right') >= 0) {
      const offset = t.point({
        x: this.padding() * 2,
        y: 0
      });
      this._movingAnchorName = an.replace('right', 'left');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.width += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    }
    if (an && newAttrs.height < 0 && an.indexOf('top') >= 0) {
      const offset = t.point({
        x: 0,
        y: -this.padding() * 2
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      this._movingAnchorName = an.replace('top', 'bottom');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    } else if (an && newAttrs.height < 0 && an.indexOf('bottom') >= 0) {
      const offset = t.point({
        x: 0,
        y: this.padding() * 2
      });
      this._movingAnchorName = an.replace('bottom', 'top');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
      if (!allowNegativeScale) {
        this.update();
        return;
      }
    }
    this._nodes.forEach(node => {
      var oldRect = this.__getNodeShape(node, 0);
      var newRect = transformAndRotateShape(oldRect, oldAttrs, newAttrs);
      this._fitNodeInto(node, newRect, evt);
    });
    this.rotation(Util._getRotation(newAttrs.rotation));
    this._resetTransformCache();
    this.update();
    this.getLayer().batchDraw();
  }
  _fitNodeInto(node: Node, newAttrs, evt) {
    const parentRot = Konva.getAngle(node.getParent().getAbsoluteRotation());
    node.rotation(Util._getRotation(newAttrs.rotation - parentRot));

    var pure = node.getClientRect({
      skipTransform: true,
      skipShadow: true,
      skipStroke: this.ignoreStroke()
    });

    var padding = 0;

    const parentTransform = node
      .getParent()
      .getAbsoluteTransform()
      .copy();
    parentTransform.invert();
    const invertedPoint = parentTransform.point({
      x: newAttrs.x,
      y: newAttrs.y
    });
    newAttrs.x = invertedPoint.x;
    newAttrs.y = invertedPoint.y;
    var absScale = node.getParent().getAbsoluteScale();

    pure.width *= absScale.x;
    pure.height *= absScale.y;
    // pure.x -= absPos.x;
    // pure.y -= absPos.y;

    // newAttrs.x = (newAttrs.x - absPos.x) / absScale.x;
    // newAttrs.y = (newAttrs.y - absPos.y) / absScale.y;

    var scaleX = pure.width ? (newAttrs.width - padding * 2) / pure.width : 1;
    var scaleY = pure.height
      ? (newAttrs.height - padding * 2) / pure.height
      : 1;

    var rotation = Konva.getAngle(node.rotation());
    var dx = pure.x * scaleX - padding - node.offsetX() * scaleX;
    var dy = pure.y * scaleY - padding - node.offsetY() * scaleY;

    node.setAttrs({
      scaleX: scaleX,
      scaleY: scaleY,
      x: newAttrs.x - (dx * Math.cos(rotation) + dy * Math.sin(-rotation)),
      y: newAttrs.y - (dy * Math.cos(rotation) + dx * Math.sin(rotation))
    });

    this._fire('transform', { evt: evt, target: node });
    node._fire('transform', { evt: evt, target: node });
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
    this.rotation(Util._getRotation(attrs.rotation));
    var node = this.getNode();
    var scale = { x: 1, y: 1 };
    // if (node && node.getParent()) {
    //   scale = node.getParent().getAbsoluteScale();
    // }
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
      x: 0,
      y: 0,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 + padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0
    });
    this.findOne('.top-center').setAttrs({
      x: width / 2,
      y: 0,
      offsetY: anchorSize / 2 + padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0
    });
    this.findOne('.top-right').setAttrs({
      x: width,
      y: 0,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 + padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0
    });
    this.findOne('.middle-left').setAttrs({
      x: 0,
      y: height / 2,
      offsetX: anchorSize / 2 + padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0
    });
    this.findOne('.middle-right').setAttrs({
      x: width,
      y: height / 2,
      offsetX: anchorSize / 2 - padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0
    });
    this.findOne('.bottom-left').setAttrs({
      x: 0,
      y: height,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 - padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0
    });
    this.findOne('.bottom-center').setAttrs({
      x: width / 2,
      y: height,
      offsetY: anchorSize / 2 - padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0
    });
    this.findOne('.bottom-right').setAttrs({
      x: width,
      y: height,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 - padding,
      scale: invertedScale,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0
    });

    var scaledRotateAnchorOffset =
      -this.rotateAnchorOffset() * Math.abs(invertedScale.y);
    this.findOne('.rotater').setAttrs({
      x: width / 2,
      y: scaledRotateAnchorOffset * Util._sign(height) - padding,
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
      var anchorNode = this.findOne('.' + this._movingAnchorName);
      if (anchorNode) {
        anchorNode.stopDrag();
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

  nodes: GetSet<Node[], this>;
  enabledAnchors: GetSet<string[], this>;
  rotationSnaps: GetSet<number[], this>;
  anchorSize: GetSet<number, this>;
  resizeEnabled: GetSet<boolean, this>;
  rotateEnabled: GetSet<boolean, this>;
  rotateAnchorOffset: GetSet<number, this>;
  rotationSnapTolerance: GetSet<number, this>;
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
 * get/set distance for rotation tolerance
 * @name Konva.Transformer#rotationSnapTolerance
 * @method
 * @param {Number} tolerance
 * @returns {Number}
 * @example
 * // get
 * var rotationSnapTolerance = transformer.rotationSnapTolerance();
 *
 * // set
 * transformer.rotationSnapTolerance(100);
 */
Factory.addGetterSetter(
  Transformer,
  'rotationSnapTolerance',
  5,
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
 * get/set attached nodes of the Transformer. Transformer will adapt to their size and listen to their events
 * @method
 * @name Konva.Transformer#Konva.Transformer#node
 * @returns {Konva.Node}
 * @example
 * // get
 * const nodes = transformer.nodes();
 *
 * // set
 * transformer.nodes([rect, circle]);
 */

Factory.addGetterSetter(Transformer, 'nodes');

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
