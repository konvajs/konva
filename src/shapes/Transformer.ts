import { Util, Transform } from '../Util';
import { Factory } from '../Factory';
import { Node } from '../Node';
import { Shape } from '../Shape';
import { Rect } from './Rect';
import { Group } from '../Group';
import { ContainerConfig } from '../Container';
import { Konva } from '../Global';
import { getBooleanValidator, getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';

import { GetSet, IRect, Vector2d } from '../types';

export interface Box extends IRect {
  rotation: number;
}

export interface TransformerConfig extends ContainerConfig {
  resizeEnabled?: boolean;
  rotateEnabled?: boolean;
  rotateLineVisible?: boolean;
  rotationSnaps?: Array<number>;
  rotationSnapTolerance?: number;
  rotateAnchorOffset?: number;
  rotateAnchorCursor?: string;
  borderEnabled?: boolean;
  borderStroke?: string;
  borderStrokeWidth?: number;
  borderDash?: Array<number>;
  anchorFill?: string;
  anchorStroke?: string;
  anchorStrokeWidth?: number;
  anchorSize?: number;
  anchorCornerRadius?: number;
  keepRatio?: boolean;
  shiftBehavior?: string;
  centeredScaling?: boolean;
  enabledAnchors?: Array<string>;
  flipEnabled?: boolean;
  node?: Rect;
  ignoreStroke?: boolean;
  boundBoxFunc?: (oldBox: Box, newBox: Box) => Box;
  useSingleNodeRotation?: boolean;
  shouldOverdrawWholeArea?: boolean;
  anchorDragBoundFunc?: (
    oldPos: Vector2d,
    newPos: Vector2d,
    evt: any
  ) => Vector2d;
  anchorStyleFunc?: (anchor: Rect) => void;
}

const EVENTS_NAME = 'tr-konva';

const ATTR_CHANGE_LIST = [
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
  'ignoreStrokeChange',
  'anchorStyleFuncChange',
]
  .map((e) => e + `.${EVENTS_NAME}`)
  .join(' ');

const NODES_RECT = 'nodesRect';

const TRANSFORM_CHANGE_STR = [
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
  'strokeWidthChange',
];

const ANGLES = {
  'top-left': -45,
  'top-center': 0,
  'top-right': 45,
  'middle-right': -90,
  'middle-left': 90,
  'bottom-left': -135,
  'bottom-center': 180,
  'bottom-right': 135,
};

const TOUCH_DEVICE = 'ontouchstart' in Konva._global;

function getCursor(anchorName, rad, rotateCursor) {
  if (anchorName === 'rotater') {
    return rotateCursor;
  }

  rad += Util.degToRad(ANGLES[anchorName] || 0);
  const angle = ((Util.radToDeg(rad) % 360) + 360) % 360;

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

const ANCHORS_NAMES = [
  'top-left',
  'top-center',
  'top-right',
  'middle-right',
  'middle-left',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const MAX_SAFE_INTEGER = 100000000;

function getCenter(shape: Box) {
  return {
    x:
      shape.x +
      (shape.width / 2) * Math.cos(shape.rotation) +
      (shape.height / 2) * Math.sin(-shape.rotation),
    y:
      shape.y +
      (shape.height / 2) * Math.cos(shape.rotation) +
      (shape.width / 2) * Math.sin(shape.rotation),
  };
}

function rotateAroundPoint(shape: Box, angleRad: number, point: Vector2d) {
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
    y,
  };
}

function rotateAroundCenter(shape: Box, deltaRad: number) {
  const center = getCenter(shape);
  return rotateAroundPoint(shape, deltaRad, center);
}

function getSnap(snaps: Array<number>, newRotationRad: number, tol: number) {
  let snapped = newRotationRad;
  for (let i = 0; i < snaps.length; i++) {
    const angle = Konva.getAngle(snaps[i]);

    const absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
    const dif = Math.min(absDiff, Math.PI * 2 - absDiff);

    if (dif < tol) {
      snapped = angle;
    }
  }
  return snapped;
}

let activeTransformersCount = 0;
/**
 * Transformer constructor.  Transformer is a special type of group that allow you transform Konva
 * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
 * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @param {Boolean} [config.resizeEnabled] Default is true
 * @param {Boolean} [config.rotateEnabled] Default is true
 * @param {Boolean} [config.rotateLineVisible] Default is true
 * @param {Array} [config.rotationSnaps] Array of angles for rotation snaps. Default is []
 * @param {Number} [config.rotationSnapTolerance] Snapping tolerance. If closer than this it will snap. Default is 5
 * @param {Number} [config.rotateAnchorOffset] Default is 50
 * @param {String} [config.rotateAnchorCursor] Default is crosshair
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
 * @param {String} [config.shiftBehavior] How does transformer react on shift key press when we are moving edges? Default is 'default'
 * @param {Boolean} [config.centeredScaling] Should we resize relative to node's center? Default is false
 * @param {Array} [config.enabledAnchors] Array of names of enabled handles
 * @param {Boolean} [config.flipEnabled] Can we flip/mirror shape on transform?. True by default
 * @param {Function} [config.boundBoxFunc] Bounding box function
 * @param {Function} [config.ignoreStroke] Should we ignore stroke size? Default is false
 * @param {Boolean} [config.useSingleNodeRotation] When just one node attached, should we use its rotation for transformer?
 * @param {Boolean} [config.shouldOverdrawWholeArea] Should we fill whole transformer area with fake transparent shape to enable dragging from empty spaces?
 * @example
 * var transformer = new Konva.Transformer({
 *   nodes: [rectangle],
 *   rotateAnchorOffset: 60,
 *   enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
 * });
 * layer.add(transformer);
 */
export class Transformer extends Group {
  _nodes: Array<Node>;
  _movingAnchorName: string | null = null;
  _transforming = false;
  _anchorDragOffset: Vector2d;
  sin: number;
  cos: number;
  _cursorChange: boolean;

  static isTransforming = () => {
    return activeTransformersCount > 0;
  };

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
   * alias to `tr.nodes([shape])`/ This method is deprecated and will be removed soon.
   * @method
   * @name Konva.Transformer#attachTo
   * @returns {Konva.Transformer}
   * @example
   * transformer.attachTo(shape);
   */
  attachTo(node: Node) {
    this.setNode(node);
    return this;
  }
  setNode(node: Node) {
    Util.warn(
      'tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.'
    );
    return this.setNodes([node]);
  }
  getNode() {
    return this._nodes && this._nodes[0];
  }

  _getEventNamespace() {
    return EVENTS_NAME + this._id;
  }

  setNodes(nodes: Array<Node> = []) {
    if (this._nodes && this._nodes.length) {
      this.detach();
    }

    const filteredNodes = nodes.filter((node) => {
      // check if ancestor of the transformer
      if (node.isAncestorOf(this)) {
        Util.error(
          'Konva.Transformer cannot be an a child of the node you are trying to attach'
        );
        return false;
      }

      return true;
    });

    this._nodes = nodes = filteredNodes;
    if (nodes.length === 1 && this.useSingleNodeRotation()) {
      this.rotation(nodes[0].getAbsoluteRotation());
    } else {
      this.rotation(0);
    }
    this._nodes.forEach((node) => {
      const onChange = () => {
        if (this.nodes().length === 1 && this.useSingleNodeRotation()) {
          this.rotation(this.nodes()[0].getAbsoluteRotation());
        }

        this._resetTransformCache();
        if (!this._transforming && !this.isDragging()) {
          this.update();
        }
      };
      const additionalEvents = node._attrsAffectingSize
        .map((prop) => prop + 'Change.' + this._getEventNamespace())
        .join(' ');
      node.on(additionalEvents, onChange);
      node.on(
        TRANSFORM_CHANGE_STR.map(
          (e) => e + `.${this._getEventNamespace()}`
        ).join(' '),
        onChange
      );
      node.on(`absoluteTransformChange.${this._getEventNamespace()}`, onChange);
      this._proxyDrag(node);
    });
    this._resetTransformCache();
    // we may need it if we set node in initial props
    // so elements are not defined yet
    const elementsCreated = !!this.findOne('.top-left');
    if (elementsCreated) {
      this.update();
    }
    return this;
  }

  _proxyDrag(node: Node) {
    let lastPos;
    node.on(`dragstart.${this._getEventNamespace()}`, (e) => {
      lastPos = node.getAbsolutePosition();
      // actual dragging of Transformer doesn't make sense
      // but we need to make sure it also has all drag events
      if (!this.isDragging() && node !== this.findOne('.back')) {
        this.startDrag(e, false);
      }
    });
    node.on(`dragmove.${this._getEventNamespace()}`, (e) => {
      if (!lastPos) {
        return;
      }
      const abs = node.getAbsolutePosition();
      const dx = abs.x - lastPos.x;
      const dy = abs.y - lastPos.y;
      this.nodes().forEach((otherNode) => {
        if (otherNode === node) {
          return;
        }
        if (otherNode.isDragging()) {
          return;
        }
        const otherAbs = otherNode.getAbsolutePosition();
        otherNode.setAbsolutePosition({
          x: otherAbs.x + dx,
          y: otherAbs.y + dy,
        });
        otherNode.startDrag(e);
      });
      lastPos = null;
    });
  }

  getNodes() {
    return this._nodes || [];
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
    // remove events
    if (this._nodes) {
      this._nodes.forEach((node) => {
        node.off('.' + this._getEventNamespace());
      });
    }
    this._nodes = [];
    this._resetTransformCache();
  }
  /**
   * bind events to the Transformer. You can use events: `transform`, `transformstart`, `transformend`, `dragstart`, `dragmove`, `dragend`
   * @method
   * @name Konva.Transformer#on
   * @param {String} evtStr e.g. 'transform'
   * @param {Function} handler The handler function. The first argument of that function is event object. Event object has `target` as main target of the event, `currentTarget` as current node listener and `evt` as native browser event.
   * @returns {Konva.Transformer}
   * @example
   * // add click listener
   * tr.on('transformstart', function() {
   *   console.log('transform started');
   * });
   */
  _resetTransformCache() {
    this._clearCache(NODES_RECT);
    this._clearCache('transform');
    this._clearSelfAndDescendantCache('absoluteTransform');
  }
  _getNodeRect() {
    return this._getCache(NODES_RECT, this.__getNodeRect);
  }

  // return absolute rotated bounding rectangle
  __getNodeShape(node: Node, rot = this.rotation(), relative?: Node) {
    const rect = node.getClientRect({
      skipTransform: true,
      skipShadow: true,
      skipStroke: this.ignoreStroke(),
    });

    const absScale = node.getAbsoluteScale(relative);
    const absPos = node.getAbsolutePosition(relative);

    const dx = rect.x * absScale.x - node.offsetX() * absScale.x;
    const dy = rect.y * absScale.y - node.offsetY() * absScale.y;

    const rotation =
      (Konva.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) %
      (Math.PI * 2);

    const box = {
      x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
      y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
      width: rect.width * absScale.x,
      height: rect.height * absScale.y,
      rotation: rotation,
    };
    return rotateAroundPoint(box, -Konva.getAngle(rot), {
      x: 0,
      y: 0,
    });
  }
  // returns box + rotation of all shapes
  __getNodeRect() {
    const node = this.getNode();
    if (!node) {
      return {
        x: -MAX_SAFE_INTEGER,
        y: -MAX_SAFE_INTEGER,
        width: 0,
        height: 0,
        rotation: 0,
      };
    }

    const totalPoints: Vector2d[] = [];
    this.nodes().map((node) => {
      const box = node.getClientRect({
        skipTransform: true,
        skipShadow: true,
        skipStroke: this.ignoreStroke(),
      });
      const points = [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
        { x: box.x, y: box.y + box.height },
      ];
      const trans = node.getAbsoluteTransform();
      points.forEach(function (point) {
        const transformed = trans.point(point);
        totalPoints.push(transformed);
      });
    });

    const tr = new Transform();
    tr.rotate(-Konva.getAngle(this.rotation()));

    let minX: number = Infinity,
      minY: number = Infinity,
      maxX: number = -Infinity,
      maxY: number = -Infinity;
    totalPoints.forEach(function (point) {
      const transformed = tr.point(point);
      if (minX === undefined) {
        minX = maxX = transformed.x;
        minY = maxY = transformed.y;
      }
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    });

    tr.invert();
    const p = tr.point({ x: minX, y: minY });
    return {
      x: p.x,
      y: p.y,
      width: maxX - minX,
      height: maxY - minY,
      rotation: Konva.getAngle(this.rotation()),
    };
    // const shapes = this.nodes().map(node => {
    //   return this.__getNodeShape(node);
    // });

    // const box = getShapesRect(shapes);
    // return rotateAroundPoint(box, Konva.getAngle(this.rotation()), {
    //   x: 0,
    //   y: 0
    // });
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

    ANCHORS_NAMES.forEach((name) => {
      this._createAnchor(name);
    });

    this._createAnchor('rotater');
  }
  _createAnchor(name) {
    const anchor = new Rect({
      stroke: 'rgb(0, 161, 255)',
      fill: 'white',
      strokeWidth: 1,
      name: name + ' _anchor',
      dragDistance: 0,
      // make it draggable,
      // so activating the anchor will not start drag&drop of any parent
      draggable: true,
      hitStrokeWidth: TOUCH_DEVICE ? 10 : 'auto',
    });
    const self = this;
    anchor.on('mousedown touchstart', function (e) {
      self._handleMouseDown(e);
    });
    anchor.on('dragstart', (e) => {
      anchor.stopDrag();
      e.cancelBubble = true;
    });
    anchor.on('dragend', (e) => {
      e.cancelBubble = true;
    });

    // add hover styling
    anchor.on('mouseenter', () => {
      const rad = Konva.getAngle(this.rotation());
      const rotateCursor = this.rotateAnchorCursor();
      const cursor = getCursor(name, rad, rotateCursor);
      anchor.getStage()!.content &&
        (anchor.getStage()!.content.style.cursor = cursor);
      this._cursorChange = true;
    });
    anchor.on('mouseout', () => {
      anchor.getStage()!.content &&
        (anchor.getStage()!.content.style.cursor = '');
      this._cursorChange = false;
    });
    this.add(anchor);
  }
  _createBack() {
    const back = new Shape({
      name: 'back',
      width: 0,
      height: 0,
      draggable: true,
      sceneFunc(ctx, shape) {
        const tr = shape.getParent() as Transformer;
        const padding = tr.padding();
        ctx.beginPath();
        ctx.rect(
          -padding,
          -padding,
          shape.width() + padding * 2,
          shape.height() + padding * 2
        );
        ctx.moveTo(shape.width() / 2, -padding);
        if (tr.rotateEnabled() && tr.rotateLineVisible()) {
          ctx.lineTo(
            shape.width() / 2,
            -tr.rotateAnchorOffset() * Util._sign(shape.height()) - padding
          );
        }

        ctx.fillStrokeShape(shape);
      },
      hitFunc: (ctx, shape) => {
        if (!this.shouldOverdrawWholeArea()) {
          return;
        }
        const padding = this.padding();
        ctx.beginPath();
        ctx.rect(
          -padding,
          -padding,
          shape.width() + padding * 2,
          shape.height() + padding * 2
        );
        ctx.fillStrokeShape(shape);
      },
    });
    this.add(back);
    this._proxyDrag(back);
    // do not bubble drag from the back shape
    // because we already "drag" whole transformer
    // so we don't want to trigger drag twice on transformer
    back.on('dragstart', (e) => {
      e.cancelBubble = true;
    });
    back.on('dragmove', (e) => {
      e.cancelBubble = true;
    });
    back.on('dragend', (e) => {
      e.cancelBubble = true;
    });
    // force self update when we drag with shouldOverDrawWholeArea setting
    this.on('dragmove', (e) => {
      this.update();
    });
  }
  _handleMouseDown(e) {
    // do nothing if we already transforming
    // that is possible to trigger with multitouch
    if (this._transforming) {
      return;
    }
    this._movingAnchorName = e.target.name().split(' ')[0];

    const attrs = this._getNodeRect();
    const width = attrs.width;
    const height = attrs.height;

    const hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    this.sin = Math.abs(height / hypotenuse);
    this.cos = Math.abs(width / hypotenuse);

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('touchmove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUp, true);
      window.addEventListener('touchend', this._handleMouseUp, true);
    }

    this._transforming = true;
    const ap = e.target.getAbsolutePosition();
    const pos = e.target.getStage().getPointerPosition();
    this._anchorDragOffset = {
      x: pos.x - ap.x,
      y: pos.y - ap.y,
    };
    activeTransformersCount++;
    this._fire('transformstart', { evt: e.evt, target: this.getNode() });
    this._nodes.forEach((target) => {
      target._fire('transformstart', { evt: e.evt, target });
    });
  }
  _handleMouseMove(e) {
    let x, y, newHypotenuse;
    const anchorNode = this.findOne('.' + this._movingAnchorName)!;
    const stage = anchorNode.getStage()!;

    stage.setPointersPositions(e);

    const pp = stage.getPointerPosition()!;
    let newNodePos = {
      x: pp.x - this._anchorDragOffset.x,
      y: pp.y - this._anchorDragOffset.y,
    };
    const oldAbs = anchorNode.getAbsolutePosition();

    if (this.anchorDragBoundFunc()) {
      newNodePos = this.anchorDragBoundFunc()(oldAbs, newNodePos, e);
    }
    anchorNode.setAbsolutePosition(newNodePos);
    const newAbs = anchorNode.getAbsolutePosition();

    // console.log(oldAbs, newNodePos, newAbs);

    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
      return;
    }

    // rotater is working very differently, so do it first
    if (this._movingAnchorName === 'rotater') {
      const attrs = this._getNodeRect();
      x = anchorNode.x() - attrs.width / 2;
      y = -anchorNode.y() + attrs.height / 2;

      // hor angle is changed?
      let delta = Math.atan2(-y, x) + Math.PI / 2;

      if (attrs.height < 0) {
        delta -= Math.PI;
      }

      const oldRotation = Konva.getAngle(this.rotation());
      const newRotation = oldRotation + delta;

      const tol = Konva.getAngle(this.rotationSnapTolerance());
      const snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);

      const diff = snappedRot - attrs.rotation;

      const shape = rotateAroundCenter(attrs, diff);
      this._fitNodesInto(shape, e);
      return;
    }

    const shiftBehavior = this.shiftBehavior();

    let keepProportion: boolean;
    if (shiftBehavior === 'inverted') {
      keepProportion = this.keepRatio() && !e.shiftKey;
    } else if (shiftBehavior === 'none') {
      keepProportion = this.keepRatio();
    } else {
      keepProportion = this.keepRatio() || e.shiftKey;
    }

    var centeredScaling = this.centeredScaling() || e.altKey;

    if (this._movingAnchorName === 'top-left') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this.findOne('.bottom-right')!.x(),
              y: this.findOne('.bottom-right')!.y(),
            };
        newHypotenuse = Math.sqrt(
          Math.pow(comparePoint.x - anchorNode.x(), 2) +
            Math.pow(comparePoint.y - anchorNode.y(), 2)
        );

        var reverseX = this.findOne('.top-left')!.x() > comparePoint.x ? -1 : 1;

        var reverseY = this.findOne('.top-left')!.y() > comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.top-left')!.x(comparePoint.x - x);
        this.findOne('.top-left')!.y(comparePoint.y - y);
      }
    } else if (this._movingAnchorName === 'top-center') {
      this.findOne('.top-left')!.y(anchorNode.y());
    } else if (this._movingAnchorName === 'top-right') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this.findOne('.bottom-left')!.x(),
              y: this.findOne('.bottom-left')!.y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) +
            Math.pow(comparePoint.y - anchorNode.y(), 2)
        );

        var reverseX =
          this.findOne('.top-right')!.x() < comparePoint.x ? -1 : 1;

        var reverseY =
          this.findOne('.top-right')!.y() > comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.top-right')!.x(comparePoint.x + x);
        this.findOne('.top-right')!.y(comparePoint.y - y);
      }
      var pos = anchorNode.position();
      this.findOne('.top-left')!.y(pos.y);
      this.findOne('.bottom-right')!.x(pos.x);
    } else if (this._movingAnchorName === 'middle-left') {
      this.findOne('.top-left')!.x(anchorNode.x());
    } else if (this._movingAnchorName === 'middle-right') {
      this.findOne('.bottom-right')!.x(anchorNode.x());
    } else if (this._movingAnchorName === 'bottom-left') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this.findOne('.top-right')!.x(),
              y: this.findOne('.top-right')!.y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(comparePoint.x - anchorNode.x(), 2) +
            Math.pow(anchorNode.y() - comparePoint.y, 2)
        );

        var reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;

        var reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        anchorNode.x(comparePoint.x - x);
        anchorNode.y(comparePoint.y + y);
      }

      pos = anchorNode.position();

      this.findOne('.top-left')!.x(pos.x);
      this.findOne('.bottom-right')!.y(pos.y);
    } else if (this._movingAnchorName === 'bottom-center') {
      this.findOne('.bottom-right')!.y(anchorNode.y());
    } else if (this._movingAnchorName === 'bottom-right') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this.findOne('.top-left')!.x(),
              y: this.findOne('.top-left')!.y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) +
            Math.pow(anchorNode.y() - comparePoint.y, 2)
        );

        var reverseX =
          this.findOne('.bottom-right')!.x() < comparePoint.x ? -1 : 1;

        var reverseY =
          this.findOne('.bottom-right')!.y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this.findOne('.bottom-right')!.x(comparePoint.x + x);
        this.findOne('.bottom-right')!.y(comparePoint.y + y);
      }
    } else {
      console.error(
        new Error(
          'Wrong position argument of selection resizer: ' +
            this._movingAnchorName
        )
      );
    }

    var centeredScaling = this.centeredScaling() || e.altKey;
    if (centeredScaling) {
      const topLeft = this.findOne('.top-left')!;
      const bottomRight = this.findOne('.bottom-right')!;
      const topOffsetX = topLeft.x();
      const topOffsetY = topLeft.y();

      const bottomOffsetX = this.getWidth() - bottomRight.x();
      const bottomOffsetY = this.getHeight() - bottomRight.y();

      bottomRight.move({
        x: -topOffsetX,
        y: -topOffsetY,
      });

      topLeft.move({
        x: bottomOffsetX,
        y: bottomOffsetY,
      });
    }

    const absPos = this.findOne('.top-left')!.getAbsolutePosition();

    x = absPos.x;
    y = absPos.y;

    const width =
      this.findOne('.bottom-right')!.x() - this.findOne('.top-left')!.x();

    const height =
      this.findOne('.bottom-right')!.y() - this.findOne('.top-left')!.y();

    this._fitNodesInto(
      {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: Konva.getAngle(this.rotation()),
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('touchmove', this._handleMouseMove);
        window.removeEventListener('mouseup', this._handleMouseUp, true);
        window.removeEventListener('touchend', this._handleMouseUp, true);
      }
      const node = this.getNode();
      activeTransformersCount--;
      this._fire('transformend', { evt: e, target: node });
      // redraw layer to restore hit graph
      this.getLayer()?.batchDraw();

      if (node) {
        this._nodes.forEach((target) => {
          target._fire('transformend', { evt: e, target });
          // redraw layer to restore hit graph
          target.getLayer()?.batchDraw();
        });
      }
      this._movingAnchorName = null;
    }
  }
  _fitNodesInto(newAttrs, evt?) {
    const oldAttrs = this._getNodeRect();

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

    const t = new Transform();
    t.rotate(Konva.getAngle(this.rotation()));
    if (
      this._movingAnchorName &&
      newAttrs.width < 0 &&
      this._movingAnchorName.indexOf('left') >= 0
    ) {
      const offset = t.point({
        x: -this.padding() * 2,
        y: 0,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += this.padding() * 2;
      this._movingAnchorName = this._movingAnchorName.replace('left', 'right');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
    } else if (
      this._movingAnchorName &&
      newAttrs.width < 0 &&
      this._movingAnchorName.indexOf('right') >= 0
    ) {
      const offset = t.point({
        x: this.padding() * 2,
        y: 0,
      });
      this._movingAnchorName = this._movingAnchorName.replace('right', 'left');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.width += this.padding() * 2;
    }
    if (
      this._movingAnchorName &&
      newAttrs.height < 0 &&
      this._movingAnchorName.indexOf('top') >= 0
    ) {
      const offset = t.point({
        x: 0,
        y: -this.padding() * 2,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      this._movingAnchorName = this._movingAnchorName.replace('top', 'bottom');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
    } else if (
      this._movingAnchorName &&
      newAttrs.height < 0 &&
      this._movingAnchorName.indexOf('bottom') >= 0
    ) {
      const offset = t.point({
        x: 0,
        y: this.padding() * 2,
      });
      this._movingAnchorName = this._movingAnchorName.replace('bottom', 'top');
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
    }

    if (this.boundBoxFunc()) {
      const bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
      if (bounded) {
        newAttrs = bounded;
      } else {
        Util.warn(
          'boundBoxFunc returned falsy. You should return new bound rect from it!'
        );
      }
    }

    // base size value doesn't really matter
    // we just need to think about bounding boxes as transforms
    // but how?
    // the idea is that we have a transformed rectangle with the size of "baseSize"
    const baseSize = 10000000;
    const oldTr = new Transform();
    oldTr.translate(oldAttrs.x, oldAttrs.y);
    oldTr.rotate(oldAttrs.rotation);
    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);

    const newTr = new Transform();
    const newScaleX = newAttrs.width / baseSize;
    const newScaleY = newAttrs.height / baseSize;

    if (this.flipEnabled() === false) {
      newTr.translate(newAttrs.x, newAttrs.y);
      newTr.rotate(newAttrs.rotation);
      newTr.translate(
        newAttrs.width < 0 ? newAttrs.width : 0,
        newAttrs.height < 0 ? newAttrs.height : 0
      );
      newTr.scale(Math.abs(newScaleX), Math.abs(newScaleY));
    } else {
      newTr.translate(newAttrs.x, newAttrs.y);
      newTr.rotate(newAttrs.rotation);
      newTr.scale(newScaleX, newScaleY);
    }

    // now lets think we had [old transform] and n ow we have [new transform]
    // Now, the questions is: how can we transform "parent" to go from [old transform] into [new transform]
    // in equation it will be:
    // [delta transform] * [old transform] = [new transform]
    // that means that
    // [delta transform] = [new transform] * [old transform inverted]
    const delta = newTr.multiply(oldTr.invert());

    this._nodes.forEach((node) => {
      // for each node we have the same [delta transform]
      // the equations is
      // [delta transform] * [parent transform] * [old local transform] = [parent transform] * [new local transform]
      // and we need to find [new local transform]
      // [new local] = [parent inverted] * [delta] * [parent] * [old local]
      const parentTransform = node.getParent()!.getAbsoluteTransform();
      const localTransform = node.getTransform().copy();
      // skip offset:
      localTransform.translate(node.offsetX(), node.offsetY());

      const newLocalTransform = new Transform();
      newLocalTransform
        .multiply(parentTransform.copy().invert())
        .multiply(delta)
        .multiply(parentTransform)
        .multiply(localTransform);

      const attrs = newLocalTransform.decompose();
      node.setAttrs(attrs);
      node.getLayer()?.batchDraw();
    });
    this.rotation(Util._getRotation(newAttrs.rotation));
    // trigger transform event AFTER we update rotation
    this._nodes.forEach((node) => {
      this._fire('transform', { evt: evt, target: node });
      node._fire('transform', { evt: evt, target: node });
    });
    this._resetTransformCache();
    this.update();
    this.getLayer()!.batchDraw();
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

  _batchChangeChild(selector: string, attrs: any) {
    const anchor = this.findOne(selector)!;
    anchor.setAttrs(attrs);
  }

  update() {
    const attrs = this._getNodeRect();
    this.rotation(Util._getRotation(attrs.rotation));
    const width = attrs.width;
    const height = attrs.height;

    const enabledAnchors = this.enabledAnchors();
    const resizeEnabled = this.resizeEnabled();
    const padding = this.padding();

    const anchorSize = this.anchorSize();
    const anchors = this.find<Rect>('._anchor');
    anchors.forEach((node) => {
      node.setAttrs({
        width: anchorSize,
        height: anchorSize,
        offsetX: anchorSize / 2,
        offsetY: anchorSize / 2,
        stroke: this.anchorStroke(),
        strokeWidth: this.anchorStrokeWidth(),
        fill: this.anchorFill(),
        cornerRadius: this.anchorCornerRadius(),
      });
    });

    this._batchChangeChild('.top-left', {
      x: 0,
      y: 0,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0,
    });
    this._batchChangeChild('.top-center', {
      x: width / 2,
      y: 0,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0,
    });
    this._batchChangeChild('.top-right', {
      x: width,
      y: 0,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0,
    });
    this._batchChangeChild('.middle-left', {
      x: 0,
      y: height / 2,
      offsetX: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0,
    });
    this._batchChangeChild('.middle-right', {
      x: width,
      y: height / 2,
      offsetX: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0,
    });
    this._batchChangeChild('.bottom-left', {
      x: 0,
      y: height,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0,
    });
    this._batchChangeChild('.bottom-center', {
      x: width / 2,
      y: height,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0,
    });
    this._batchChangeChild('.bottom-right', {
      x: width,
      y: height,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0,
    });

    this._batchChangeChild('.rotater', {
      x: width / 2,
      y: -this.rotateAnchorOffset() * Util._sign(height) - padding,
      visible: this.rotateEnabled(),
    });

    this._batchChangeChild('.back', {
      width: width,
      height: height,
      visible: this.borderEnabled(),
      stroke: this.borderStroke(),
      strokeWidth: this.borderStrokeWidth(),
      dash: this.borderDash(),
      x: 0,
      y: 0,
    });

    const styleFunc = this.anchorStyleFunc();
    if (styleFunc) {
      anchors.forEach((node) => {
        styleFunc(node);
      });
    }
    this.getLayer()?.batchDraw();
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
      const anchorNode = this.findOne('.' + this._movingAnchorName);
      if (anchorNode) {
        anchorNode.stopDrag();
      }
    }
  }
  destroy() {
    if (this.getStage() && this._cursorChange) {
      this.getStage()!.content && (this.getStage()!.content.style.cursor = '');
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

  // overwrite clone to NOT use method from Container
  clone(obj?: any) {
    const node = Node.prototype.clone.call(this, obj);
    return node as this;
  }
  getClientRect() {
    if (this.nodes().length > 0) {
      return super.getClientRect();
    } else {
      // if we are detached return zero size
      // so it will be skipped in calculations
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  nodes: GetSet<Node[], this>;
  enabledAnchors: GetSet<string[], this>;
  rotationSnaps: GetSet<number[], this>;
  anchorSize: GetSet<number, this>;
  resizeEnabled: GetSet<boolean, this>;
  rotateEnabled: GetSet<boolean, this>;
  rotateLineVisible: GetSet<boolean, this>;
  rotateAnchorOffset: GetSet<number, this>;
  rotationSnapTolerance: GetSet<number, this>;
  rotateAnchorCursor: GetSet<string, this>;
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
  shiftBehavior: GetSet<string, this>;
  centeredScaling: GetSet<boolean, this>;
  flipEnabled: GetSet<boolean, this>;
  ignoreStroke: GetSet<boolean, this>;
  boundBoxFunc: GetSet<(oldBox: Box, newBox: Box) => Box, this>;
  anchorDragBoundFunc: GetSet<
    (oldPos: Vector2d, newPos: Vector2d, e: MouseEvent) => Vector2d,
    this
  >;
  anchorStyleFunc: GetSet<null | ((Node: Rect) => void), this>;
  shouldOverdrawWholeArea: GetSet<boolean, this>;
  useSingleNodeRotation: GetSet<boolean, this>;
}

function validateAnchors(val) {
  if (!(val instanceof Array)) {
    Util.warn('enabledAnchors value should be an array');
  }
  if (val instanceof Array) {
    val.forEach(function (name) {
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
 * get/set flip enabled
 * @name Konva.Transformer#flipEnabled
 * @method
 * @param {Boolean} flag
 * @returns {Boolean}
 * @example
 * // get flip enabled property
 * var flipEnabled = transformer.flipEnabled();
 *
 * // set flip enabled property
 * transformer.flipEnabled(false);
 */
Factory.addGetterSetter(
  Transformer,
  'flipEnabled',
  true,
  getBooleanValidator()
);

/**
 * get/set resize ability. If false it will automatically hide resizing handlers
 * @name Konva.Transformer#resizeEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
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
 * @name Konva.Transformer#anchorSize
 * @method
 * @param {Number} size
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
 * get/set visibility of a little line that connects transformer and rotate anchor.
 * @name Konva.Transformer#rotateLineVisible
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get
 * var rotateLineVisible = transformer.rotateLineVisible();
 *
 * // set
 * transformer.rotateLineVisible(false);
 */
Factory.addGetterSetter(Transformer, 'rotateLineVisible', true);

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
 * get/set rotation anchor cursor
 * @name Konva.Transformer#rotateAnchorCursor
 * @method
 * @param {String} cursorName
 * @returns {String}
 * @example
 * // get
 * var currentRotationAnchorCursor = transformer.rotateAnchorCursor();
 *
 * // set
 * transformer.rotateAnchorCursor('grab');
 */
Factory.addGetterSetter(Transformer, 'rotateAnchorCursor', 'crosshair');

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
 * @param {String} strokeColor
 * @returns {String}
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
 * @param {Number} anchorStrokeWidth
 * @returns {Number}
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
 * @param {String} anchorFill
 * @returns {String}
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
 * @param {Number} radius
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
 * @param {Number} strokeWidth
 * @returns {Number}
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
 * @param {Array} dash array
 * @returns {Array}
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
 * get/set how to react on skift key while resizing anchors at corners
 * @name Konva.Transformer#shiftBehavior
 * @method
 * @param {String} shiftBehavior
 * @returns {String}
 * @example
 * // get
 * var shiftBehavior = transformer.shiftBehavior();
 *
 * // set
 * transformer.shiftBehavior('none');
 */
Factory.addGetterSetter(Transformer, 'shiftBehavior', 'default');

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

Factory.addGetterSetter(Transformer, 'node');

/**
 * get/set attached nodes of the Transformer. Transformer will adapt to their size and listen to their events
 * @method
 * @name Konva.Transformer#nodes
 * @returns {Konva.Node}
 * @example
 * // get
 * const nodes = transformer.nodes();
 *
 * // set
 * transformer.nodes([rect, circle]);
 *
 * // push new item:
 * const oldNodes = transformer.nodes();
 * const newNodes = oldNodes.concat([newShape]);
 * // it is important to set new array instance (and concat method above will create it)
 * transformer.nodes(newNodes);
 */

Factory.addGetterSetter(Transformer, 'nodes');

/**
 * get/set bounding box function. **IMPORTANT!** boundBondFunc operates in absolute coordinates.
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
 *   // width and height of the boxes are corresponding to total absolute width and height of all nodes combined
 *   // so it includes scale of the node.
 *   if (newBox.width > 200) {
 *     return oldBox;
 *   }
 *   return newBox;
 * });
 */
Factory.addGetterSetter(Transformer, 'boundBoxFunc');

/**
 * get/set dragging func for transformer anchors
 * @name Konva.Transformer#anchorDragBoundFunc
 * @method
 * @param {Function} func
 * @returns {Function}
 * @example
 * // get
 * var anchorDragBoundFunc = transformer.anchorDragBoundFunc();
 *
 * // set
 * transformer.anchorDragBoundFunc(function(oldAbsPos, newAbsPos, event) {
 *  return {
 *   x: 0,
 *   y: newAbsolutePosition.y
 *  }
 * });
 */
Factory.addGetterSetter(Transformer, 'anchorDragBoundFunc');

/**
 * get/set styling function for transformer anchors to overwrite default styles
 * @name Konva.Transformer#anchorStyleFunc
 * @method
 * @param {Function} func
 * @returns {Function}
 * @example
 * // get
 * var anchorStyleFunc = transformer.anchorStyleFunc();
 *
 * // set
 * transformer.anchorStyleFunc(function(anchor) {
 *  // anchor is a simple Konva.Rect instance
 *  // it will be executed AFTER all attributes are set, like 'anchorStrokeWidth' or 'anchorFill'
 *  if (anchor.hasName('.rotater')) {
 *    // make rotater anchor filled black and looks like a circle
 *    anchor.fill('black');
 *    anchor.cornerRadius(anchor.width() / 2);
 *  }
 * });
 */
Factory.addGetterSetter(Transformer, 'anchorStyleFunc');

/**
 * using this setting you can drag transformer group by dragging empty space between attached nodes
 * shouldOverdrawWholeArea = true may temporary disable all events on attached nodes
 * @name Konva.Transformer#shouldOverdrawWholeArea
 * @method
 * @param {Boolean} shouldOverdrawWholeArea
 * @returns {Boolean}
 * @example
 * // get
 * var shouldOverdrawWholeArea = transformer.shouldOverdrawWholeArea();
 *
 * // set
 * transformer.shouldOverdrawWholeArea(true);
 */
Factory.addGetterSetter(Transformer, 'shouldOverdrawWholeArea', false);

/**
 * If you have just one attached node to Transformer it will set its initial rotation to the rotation of that node.
 * In some cases you may need to set a different rotation.
 * @name Konva.Transformer#useSingleNodeRotation
 * @method
 * @param {Boolean} useSingleNodeRotation
 * @returns {Boolean}
 * @example
 * // set flag to false
 * transformer.useSingleNodeRotation(false);
 * // attach a shape
 * transformer.nodes([shape]);
 * transformer.rotation(45);
 * transformer.update();
 */
Factory.addGetterSetter(Transformer, 'useSingleNodeRotation', true);

Factory.backCompat(Transformer, {
  lineEnabled: 'borderEnabled',
  rotateHandlerOffset: 'rotateAnchorOffset',
  enabledHandlers: 'enabledAnchors',
});
