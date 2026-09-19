import { Util, Transform } from '../Util.ts';
import { Factory } from '../Factory.ts';
import { Node } from '../Node.ts';
import { Shape } from '../Shape.ts';
import { Rect } from './Rect.ts';
import { Group } from '../Group.ts';
import type { ContainerConfig } from '../Container.ts';
import { Konva } from '../Global.ts';
import { getBooleanValidator, getNumberValidator } from '../Validators.ts';
import { _registerNode } from '../Global.ts';

import type { GetSet, IRect, Vector2d } from '../types.ts';

export interface Box extends IRect {
  rotation: number;
}

export interface TransformerConfig extends ContainerConfig {
  nodes?: Array<Node>;
  resizeEnabled?: boolean;
  rotateEnabled?: boolean;
  rotateLineVisible?: boolean;
  rotationSnaps?: Array<number>;
  rotationSnapTolerance?: number;
  rotateAnchorOffset?: number;
  rotateAnchorAngle?: number;
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
  'rotateAnchorAngleChange',
  'rotateEnabledChange',
  'enabledAnchorsChange',
  'anchorSizeChange',
  'borderEnabledChange',
  'shouldOverdrawWholeAreaChange',
  'borderStrokeChange',
  'borderStrokeWidthChange',
  'borderDashChange',
  'anchorStrokeChange',
  'anchorStrokeWidthChange',
  'anchorFillChange',
  'anchorCornerRadiusChange',
  'ignoreStrokeChange',
  'anchorStyleFuncChange',
  'paddingChange',
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
  'strokeChange',
  'strokeLinearGradientColorStopsChange',
  'strokeScaleEnabledChange',
  'strokeEnabledChange',
  'draggableChange',
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
  let nearest = tol;
  for (let i = 0; i < snaps.length; i++) {
    const angle = Konva.getAngle(snaps[i]);

    const absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
    const dif = Math.min(absDiff, Math.PI * 2 - absDiff);

    if (dif < nearest) {
      nearest = dif;
      snapped = angle;
    }
  }
  return snapped;
}

const activeTransformers = new Set<Transformer>();
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
 * @param {Number} [config.rotateAnchorAngle] Angle of the rotate anchor around the box, in degrees. Default is 0 (top)
 * @param {String} [config.rotateAnchorCursor] Default is crosshair
 * @param {Number} [config.padding] Default is 0
 * @param {Boolean} [config.borderEnabled] Should we draw border? Default is true
 * @param {String} [config.borderStroke] Border stroke color
 * @param {Number} [config.borderStrokeWidth] Border stroke size
 * @param {Array} [config.borderDash] Array for border dash.
 * @param {String} [config.anchorFill] Anchor fill color
 * @param {String} [config.anchorStroke] Anchor stroke color
 * @param {Number} [config.anchorCornerRadius] Anchor corner radius
 * @param {Number} [config.anchorStrokeWidth] Anchor stroke size
 * @param {Number} [config.anchorSize] Default is 10
 * @param {Boolean} [config.keepRatio] Should we keep ratio when we are moving edges? Default is true
 * @param {String} [config.shiftBehavior] How does transformer react on shift key press when we are moving edges? Default is 'default'
 * @param {Boolean} [config.centeredScaling] Should we resize relative to node's center? Default is false
 * @param {Array} [config.enabledAnchors] Array of names of enabled handles
 * @param {Boolean} [config.flipEnabled] Can we flip/mirror shape on transform?. True by default
 * @param {Function} [config.boundBoxFunc] Bounding box function, see {@link Konva.Transformer#boundBoxFunc}
 * @param {Function} [config.anchorDragBoundFunc] Function bounding the position of a dragged anchor, see {@link Konva.Transformer#anchorDragBoundFunc}
 * @param {Function} [config.anchorStyleFunc] Function styling every anchor, see {@link Konva.Transformer#anchorStyleFunc}
 * @param {Boolean} [config.ignoreStroke] Should we ignore stroke size? Default is false
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
  // Bounds projected into this Transformer's rotation. Unchanged nodes can be
  // reused during independent setters without delaying anchor updates.
  _nodeRectCache?: Map<
    Node,
    {
      rotation: number;
      ignoreStroke: boolean;
      version: number;
      width: number;
      height: number;
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }
  >;
  _movingAnchorName: string | null = null;
  // the pointer that grabbed the anchor, other pointers are ignored
  _pointerId?: number;
  _anchors: Record<string, Rect> = {};
  _back: Shape;
  _transforming = false;
  // true while _fitNodesInto writes the new attrs into the nodes
  _fitting = false;
  // the window the transform events are listened to. The stage may be
  // rendered in another window than the one Konva was imported into
  _transformWindow: Window | null = null;
  _anchorDragOffset: Vector2d;
  sin: number;
  cos: number;
  _cursorChange: boolean;
  _elementsCreated = false;
  _updateScheduled = false;
  _lastNodeRect?: Readonly<Box>;

  static isTransforming = () => {
    return activeTransformers.size > 0;
  };
  // the hit graph of a layer is not drawn while a transformer on it, or of
  // a node on it, is transforming (see Layer.shouldDrawHit)
  static _isLayerTransforming(layer: Node) {
    for (const tr of activeTransformers) {
      if (
        tr.getLayer() === layer ||
        tr._nodes.some((node) => node.getLayer() === layer)
      ) {
        return true;
      }
    }
    return false;
  }

  constructor(config?: TransformerConfig) {
    // call super constructor
    super(config);
    this._createElements();

    // bindings
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this.update = this.update.bind(this);

    // update transformer data for certain attr changes
    this.on(ATTR_CHANGE_LIST, (event) => {
      if (event.type === 'ignoreStrokeChange') this._resetTransformCache();
      this.update();
    });
    // the memoized rect bakes in our own rotation, so a manual rotation must drop it
    this.on(`rotationChange.${EVENTS_NAME}`, () => this._clearCache(NODES_RECT));

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

    const selected = new Set(nodes);
    for (const node of selected) {
      // check if ancestor of the transformer
      if (node.isAncestorOf(this)) {
        Util.error(
          'Konva.Transformer cannot be an a child of the node you are trying to attach'
        );
        selected.delete(node);
      }
    }
    const filteredNodes = Array.from(selected).filter((node) => {
      // Transform a selected subtree once, through its selected ancestor.
      for (let parent = node.getParent(); parent; parent = parent.getParent()) {
        if (selected.has(parent)) return false;
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
        // Perf: skip the changes _fitNodesInto makes itself — it does the
        // final _resetTransformCache + update, so per-attr fan-out here is
        // pure waste (was O(N*events) per resize step). A change made between
        // two pointer moves (e.g. a deferred state update) must get through.
        if (this._fitting) {
          this._nodeRectCache?.delete(node);
          return;
        }
        if (this.nodes().length === 1 && this.useSingleNodeRotation()) {
          this.rotation(this.nodes()[0].getAbsoluteRotation());
        }
        // Cache reset stays synchronous so sync reads of tr.x() etc. are fresh.
        this._resetTransformCache(node);
        if (!this.isDragging()) {
          // Perf: an ancestor cascade (e.g. stage drag) fires
          // absoluteTransformChange on every attached node — without batching,
          // a refresh runs once per node and each call walks all N nodes via
          // __getNodeRect, giving O(N^2) per drag frame.
          this._scheduleUpdate();
        }
      };
      if (node._attrsAffectingSize.length) {
        const additionalEvents = node._attrsAffectingSize
          .map((prop) => prop + 'Change.' + this._getEventNamespace())
          .join(' ');
        node.on(additionalEvents, onChange);
      }
      node.on(
        TRANSFORM_CHANGE_STR.map(
          (e) => e + `.${this._getEventNamespace()}`
        ).join(' '),
        onChange
      );
      node.on(`absoluteTransformChange.${this._getEventNamespace()}`, onChange);
      node.on(`destroy.${this._getEventNamespace()}`, () => {
        // a destroyed node has nothing left to transform
        this.setNodes(this._nodes.filter((n) => n !== node));
      });
      this._proxyDrag(node);
    });
    this._resetTransformCache();
    // we may need it if we set node in initial props
    // so elements are not defined yet
    if (this._elementsCreated) {
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
      if (!this.isDragging() && node !== this._back) {
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
    this.getLayer()?.batchDraw();
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
  _resetTransformCache(changedNode?: Node) {
    if (changedNode) this._nodeRectCache?.delete(changedNode);
    else this._nodeRectCache?.clear();
    this._clearCache(NODES_RECT);
    this._clearCache('transform');
    this._clearSelfAndDescendantCache('absoluteTransform');
  }
  _getNodeRect() {
    return this._getCache(NODES_RECT, this.__getNodeRect);
  }

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

    const rotation = Konva.getAngle(this.rotation());
    const ignoreStroke = this.ignoreStroke();
    const tr = new Transform();
    tr.rotate(-rotation);
    const cache = this._nodeRectCache || (this._nodeRectCache = new Map());
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const node of this.nodes()) {
      // Bounds may only be reused when they are a pure function of the node's
      // own size: then every change reaches us either through _setAttr or
      // through the size probe below. A shape with its own getSelfRect - Line
      // mutates its points array in place, and a user subclass can measure
      // anything at all - may change with no signal, so it is measured every
      // time. Groups depend on their descendants, and a cached ancestor
      // suppresses descendant transform-change notifications, so both are
      // measured too.
      const cacheable =
        node instanceof Shape &&
        node.getSelfRect === Shape.prototype.getSelfRect &&
        !node._hasCachedAncestor();
      // width() and height() are the only inputs of the default getSelfRect and
      // they can come from outside the attrs (an Image source that loads or
      // resizes, Text metrics), so the attr revision alone cannot key them.
      const width = cacheable ? node.width() : 0;
      const height = cacheable ? node.height() : 0;
      if (cacheable) node._attrsVersion ??= 0;
      let bounds = cacheable ? cache.get(node) : undefined;
      if (
        !bounds ||
        bounds.rotation !== rotation ||
        bounds.ignoreStroke !== ignoreStroke ||
        bounds.version !== node._attrsVersion ||
        bounds.width !== width ||
        bounds.height !== height
      ) {
        let trans = node.getAbsoluteTransform();
        const [a, b, c, d] = trans.getMatrix();
        const collapsed = a * d - b * c === 0;
        const box = node.getClientRect({
          skipTransform: !collapsed,
          skipShadow: true,
          skipStroke: ignoreStroke,
        });
        const points = [
          { x: box.x, y: box.y },
          { x: box.x + box.width, y: box.y },
          { x: box.x + box.width, y: box.y + box.height },
          { x: box.x, y: box.y + box.height },
        ];
        if (collapsed) trans = new Transform();
        bounds = {
          rotation,
          ignoreStroke,
          width,
          height,
          version: node._attrsVersion || 0,
          minX: Infinity,
          minY: Infinity,
          maxX: -Infinity,
          maxY: -Infinity,
        };
        for (const point of points) {
          const projected = tr.point(trans.point(point));
          bounds.minX = Math.min(bounds.minX, projected.x);
          bounds.minY = Math.min(bounds.minY, projected.y);
          bounds.maxX = Math.max(bounds.maxX, projected.x);
          bounds.maxY = Math.max(bounds.maxY, projected.y);
        }
        if (cacheable) cache.set(node, bounds);
      }
      minX = Math.min(minX, bounds.minX);
      minY = Math.min(minY, bounds.minY);
      maxX = Math.max(maxX, bounds.maxX);
      maxY = Math.max(maxY, bounds.maxY);
    }

    tr.invert();
    const p = tr.point({ x: minX, y: minY });
    return {
      x: p.x,
      y: p.y,
      width: maxX - minX,
      height: maxY - minY,
      rotation: Konva.getAngle(this.rotation()),
    };
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
    this._elementsCreated = true;
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
    this._anchors[name] = anchor;
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
      if (this.isTransforming()) return;
      const rad = Konva.getAngle(this.rotation());
      const rotateCursor = this.rotateAnchorCursor();
      const cursor = getCursor(name, rad, rotateCursor);
      anchor.getStage()!.content &&
        (anchor.getStage()!.content.style.cursor = cursor);
      this._cursorChange = true;
    });
    anchor.on('mouseout', () => {
      this._cursorChange = false;
      if (this.isTransforming()) return;
      anchor.getStage()!.content &&
        (anchor.getStage()!.content.style.cursor = '');
    });
    this.add(anchor);
  }
  _createBack() {
    const back = new Shape({
      name: 'back',
      width: 0,
      height: 0,
      sceneFunc(ctx, shape) {
        const tr = shape.getParent() as Transformer;
        if (!tr.borderEnabled()) return;
        const padding = tr.padding();
        const width = shape.width();
        const height = shape.height();

        ctx.beginPath();
        ctx.rect(-padding, -padding, width + padding * 2, height + padding * 2);

        if (tr.rotateEnabled() && tr.rotateLineVisible()) {
          // Calculate rotation line position based on rotateAnchorAngle
          const rotateAnchorAngle = tr.rotateAnchorAngle();
          const rotateAnchorOffset = tr.rotateAnchorOffset();
          const rad = Util.degToRad(rotateAnchorAngle);
          // Direction vector (0 degrees = up/top)
          const dirX = Math.sin(rad);
          const dirY = -Math.cos(rad);

          // Center of the box
          const cx = width / 2;
          const cy = height / 2;

          // Find intersection with box edge
          let t = Infinity;
          if (dirY < 0) {
            t = Math.min(t, -cy / dirY);
          } else if (dirY > 0) {
            t = Math.min(t, (height - cy) / dirY);
          }
          if (dirX < 0) {
            t = Math.min(t, -cx / dirX);
          } else if (dirX > 0) {
            t = Math.min(t, (width - cx) / dirX);
          }

          // Edge point (start of line)
          const edgeX = cx + dirX * t;
          const edgeY = cy + dirY * t;

          // End point with offset
          const endX = edgeX + dirX * (rotateAnchorOffset + padding);
          const endY = edgeY + dirY * (rotateAnchorOffset + padding);

          ctx.moveTo(edgeX, edgeY);
          ctx.lineTo(endX, endY);
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
    this._back = back;
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
    if (e.evt.button !== undefined && !Konva.dragButtons.includes(e.evt.button))
      return;
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

    // the window that owns the stage is the one that gets the pointer events
    const win = this.getStage()?._getOwnerWindow();
    this._transformWindow = win || null;
    if (win) {
      win.addEventListener('mousemove', this._handleMouseMove);
      win.addEventListener('touchmove', this._handleMouseMove);
      win.addEventListener('mouseup', this._handleMouseUp, true);
      win.addEventListener('touchend', this._handleMouseUp, true);
      win.addEventListener('touchcancel', this._handleMouseUp, true);
    }

    this._transforming = true;
    // the pointer that hit the anchor (a touchstart can land several fingers)
    this._pointerId = e.pointerId ?? Util._getFirstPointerId(e.evt);
    const ap = e.target.getAbsolutePosition();
    const pos = e.target.getStage()._getPointerById(this._pointerId)!;
    this._anchorDragOffset = {
      x: pos.x - ap.x,
      y: pos.y - ap.y,
    };
    activeTransformers.add(this);
    this._fire('transformstart', { evt: e.evt, target: this.getNode() });
    this._nodes.forEach((target) => {
      target._fire('transformstart', { evt: e.evt, target });
    });
  }
  _handleMouseMove(e) {
    this.getStage()?._batchEvents(() => this._moveTransform(e));
  }
  _moveTransform(e) {
    let x, y, newHypotenuse;
    const anchorNode = this._anchors[this._movingAnchorName!];
    const stage = anchorNode.getStage()!;

    stage.setPointersPositions(e);

    const pp = stage._getPointerById(this._pointerId);
    if (!pp) {
      return;
    }
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

      // Calculate angle from center to current anchor position
      // Offset by rotateAnchorAngle so we measure rotation from the anchor's starting position
      const rotateAnchorAngleRad = Konva.getAngle(this.rotateAnchorAngle());
      let delta = Math.atan2(-y, x) + Math.PI / 2 - rotateAnchorAngleRad;

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

    let centeredScaling = this.centeredScaling() || e.altKey;

    // with keepRatio, a corner anchor doesn't follow the pointer — the blocks
    // below project it onto the ratio diagonal. _doFitNodesInto must know
    // that to skip the padding flip compensation (issue #1878)
    let anchorProjected = false;

    if (this._movingAnchorName === 'top-left') {
      if (keepProportion) {
        anchorProjected = true;
        const comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this._anchors['bottom-right'].x(),
              y: this._anchors['bottom-right'].y(),
            };
        newHypotenuse = Math.sqrt(
          Math.pow(comparePoint.x - anchorNode.x(), 2) +
            Math.pow(comparePoint.y - anchorNode.y(), 2)
        );

        const reverseX =
          this._anchors['top-left'].x() > comparePoint.x ? -1 : 1;

        const reverseY =
          this._anchors['top-left'].y() > comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this._anchors['top-left'].x(comparePoint.x - x);
        this._anchors['top-left'].y(comparePoint.y - y);
      }
    } else if (this._movingAnchorName === 'top-center') {
      this._anchors['top-left'].y(anchorNode.y());
    } else if (this._movingAnchorName === 'top-right') {
      if (keepProportion) {
        anchorProjected = true;
        const comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this._anchors['bottom-left'].x(),
              y: this._anchors['bottom-left'].y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) +
            Math.pow(comparePoint.y - anchorNode.y(), 2)
        );

        const reverseX =
          this._anchors['top-right'].x() < comparePoint.x ? -1 : 1;

        const reverseY =
          this._anchors['top-right'].y() > comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this._anchors['top-right'].x(comparePoint.x + x);
        this._anchors['top-right'].y(comparePoint.y - y);
      }
      var pos = anchorNode.position();
      this._anchors['top-left'].y(pos.y);
      this._anchors['bottom-right'].x(pos.x);
    } else if (this._movingAnchorName === 'middle-left') {
      this._anchors['top-left'].x(anchorNode.x());
    } else if (this._movingAnchorName === 'middle-right') {
      this._anchors['bottom-right'].x(anchorNode.x());
    } else if (this._movingAnchorName === 'bottom-left') {
      if (keepProportion) {
        anchorProjected = true;
        const comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this._anchors['top-right'].x(),
              y: this._anchors['top-right'].y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(comparePoint.x - anchorNode.x(), 2) +
            Math.pow(anchorNode.y() - comparePoint.y, 2)
        );

        const reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;

        const reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        anchorNode.x(comparePoint.x - x);
        anchorNode.y(comparePoint.y + y);
      }

      pos = anchorNode.position();

      this._anchors['top-left'].x(pos.x);
      this._anchors['bottom-right'].y(pos.y);
    } else if (this._movingAnchorName === 'bottom-center') {
      this._anchors['bottom-right'].y(anchorNode.y());
    } else if (this._movingAnchorName === 'bottom-right') {
      if (keepProportion) {
        anchorProjected = true;
        const comparePoint = centeredScaling
          ? {
              x: this.width() / 2,
              y: this.height() / 2,
            }
          : {
              x: this._anchors['top-left'].x(),
              y: this._anchors['top-left'].y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) +
            Math.pow(anchorNode.y() - comparePoint.y, 2)
        );

        const reverseX =
          this._anchors['bottom-right'].x() < comparePoint.x ? -1 : 1;

        const reverseY =
          this._anchors['bottom-right'].y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;

        this._anchors['bottom-right'].x(comparePoint.x + x);
        this._anchors['bottom-right'].y(comparePoint.y + y);
      }
    } else {
      console.error(
        new Error(
          'Wrong position argument of selection resizer: ' +
            this._movingAnchorName
        )
      );
    }

    centeredScaling = this.centeredScaling() || e.altKey;
    if (centeredScaling) {
      const topLeft = this._anchors['top-left'];
      const bottomRight = this._anchors['bottom-right'];
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

    const absPos = this._anchors['top-left'].getAbsolutePosition();

    x = absPos.x;
    y = absPos.y;

    const width =
      this._anchors['bottom-right'].x() - this._anchors['top-left'].x();

    const height =
      this._anchors['bottom-right'].y() - this._anchors['top-left'].y();

    this._fitNodesInto(
      {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: Konva.getAngle(this.rotation()),
      },
      e,
      anchorProjected
    );
  }
  _handleMouseUp(e) {
    // only the pointer that grabbed the anchor ends the transform
    const stage = this.getStage();
    if (stage) {
      stage.setPointersPositions(e);
      if (
        !stage._changedPointerPositions.some((p) => p.id === this._pointerId)
      ) {
        return;
      }
    }
    if (stage) stage._batchEvents(() => this._removeEvents(e));
    else this._removeEvents(e);
  }
  // the transformer positions itself in absolute coordinates (see
  // _getNodeRect), whatever the transforms of its ancestors are
  getAbsoluteTransform(top?: Node | null) {
    const at = this.getTransform();
    return top ? top.getAbsoluteTransform().copy().invert().multiply(at) : at;
  }
  _removeEvents(e?) {
    if (this._transforming) {
      this._transforming = false;
      const content = this.getStage()?.content;
      if (content && !this._cursorChange) content.style.cursor = '';
      const win = this._transformWindow;
      this._transformWindow = null;
      if (win) {
        win.removeEventListener('mousemove', this._handleMouseMove);
        win.removeEventListener('touchmove', this._handleMouseMove);
        win.removeEventListener('mouseup', this._handleMouseUp, true);
        win.removeEventListener('touchend', this._handleMouseUp, true);
        win.removeEventListener('touchcancel', this._handleMouseUp, true);
      }
      const node = this.getNode();
      activeTransformers.delete(this);
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
  _fitNodesInto(newAttrs, evt?, anchorProjected = false) {
    // Defer our own bounds updates while preserving drawing in user callbacks.
    this._fitting = true;
    try {
      return this._doFitNodesInto(newAttrs, evt, anchorProjected);
    } finally {
      this._fitting = false;
    }
  }

  _doFitNodesInto(newAttrs, evt?, anchorProjected = false) {
    const oldAttrs = this._getNodeRect();

    const minSize = 1;

    // a zero-size box has a singular transform, there is nothing to scale from
    if (
      !oldAttrs.width ||
      !oldAttrs.height ||
      Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize) ||
      Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)
    ) {
      this.update();
      return;
    }

    const t = new Transform();
    t.rotate(Konva.getAngle(this.rotation()));
    // the ±2*padding shifts below assume the box size passed through zero
    // continuously (the anchor tied to the pointer). A projected anchor snaps
    // the box across zero instead; the shifts then leave the drag state
    // inconsistent with the real anchor position and the box flips back and
    // forth on every following move (issue #1878) — so flip only the anchor
    // name, exactly as when padding is 0.
    const flipPadding = anchorProjected ? 0 : this.padding() * 2;
    // a flip renames the active anchor and shifts the grab offset, but that
    // bookkeeping is staged and committed only after boundBoxFunc has
    // accepted the flip: a rejected flip must leave both untouched, or the
    // transformer keeps resizing from the opposite anchor after the veto
    // (issue #1967). The staged offset stays in the pre-bound rotation frame
    // (t), exactly as the immediate shift did before.
    type StagedFlip = {
      axis: 'width' | 'height';
      from: string;
      to: string;
      offset: Vector2d;
    };
    let widthFlip: StagedFlip | null = null;
    let heightFlip: StagedFlip | null = null;
    if (
      this._movingAnchorName &&
      newAttrs.width < 0 &&
      this._movingAnchorName.indexOf('left') >= 0
    ) {
      const offset = t.point({
        x: -flipPadding,
        y: 0,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += flipPadding;
      widthFlip = { axis: 'width', from: 'left', to: 'right', offset };
    } else if (
      this._movingAnchorName &&
      newAttrs.width < 0 &&
      this._movingAnchorName.indexOf('right') >= 0
    ) {
      const offset = t.point({
        x: flipPadding,
        y: 0,
      });
      newAttrs.width += flipPadding;
      widthFlip = { axis: 'width', from: 'right', to: 'left', offset };
    }
    if (
      this._movingAnchorName &&
      newAttrs.height < 0 &&
      this._movingAnchorName.indexOf('top') >= 0
    ) {
      const offset = t.point({
        x: 0,
        y: -flipPadding,
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.height += flipPadding;
      heightFlip = { axis: 'height', from: 'top', to: 'bottom', offset };
    } else if (
      this._movingAnchorName &&
      newAttrs.height < 0 &&
      this._movingAnchorName.indexOf('bottom') >= 0
    ) {
      const offset = t.point({
        x: 0,
        y: flipPadding,
      });
      newAttrs.height += flipPadding;
      heightFlip = { axis: 'height', from: 'bottom', to: 'top', offset };
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

    // a staged flip survived only if the bounded size is still negative on
    // its axis
    for (const flip of [widthFlip, heightFlip]) {
      if (flip && newAttrs[flip.axis] < 0 && this._movingAnchorName) {
        this._movingAnchorName = this._movingAnchorName.replace(
          flip.from,
          flip.to
        );
        this._anchorDragOffset.x -= flip.offset.x;
        this._anchorDragOffset.y -= flip.offset.y;
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

    // Perf: collect unique affected layers and batchDraw each once at the end
    // (was once per node — O(N)).
    const layersToDraw = new Set<any>();
    this._nodes.forEach((node) => {
      // check to close this issue: https://github.com/konvajs/konva/issues/1957
      // a node can be destroyed during the transformation
      // probably a developer must remove it from transformer
      if (!node.getStage()) {
        // do we need a helping message?
        // Util.error(
        //   'Node is not attached to the stage. This is not allowed. Please attach the node to the stage before transforming. If node was destroyed, make sure to remove it from transformer.'
        // );
        return;
      }
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
      const layer = node.getLayer();
      if (layer) {
        layersToDraw.add(layer);
      }
    });
    this.rotation(Util._getRotation(newAttrs.rotation));
    // trigger transform event AFTER we update rotation
    this._nodes.forEach((node) => {
      this._fire('transform', { evt: evt, target: node });
      node._fire('transform', { evt: evt, target: node });
    });
    this._resetTransformCache();
    this.update();
    layersToDraw.add(this.getLayer());
    layersToDraw.forEach((layer) => layer && layer.batchDraw());
  }
  // Inside an absoluteTransform cascade, queue a single update to run when
  // the cascade ends; outside a cascade, run synchronously so reads of
  // transformer state stay consistent.
  _scheduleUpdate() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    Node._runAfterAbsTransformCascade(() => {
      this._updateScheduled = false;
      if (!this._nodes?.length || this._fitting || this.isDragging()) {
        return;
      }
      this._update();
    });
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
    // Explicit updates and Transformer configuration changes also refresh
    // styles and layout when the selected nodes' bounds are unchanged.
    this._lastNodeRect = undefined;
    this._update();
  }

  _update() {
    const attrs = this._getNodeRect();
    this._updateElements(attrs);
    const draggable = this.nodes().some((node) => node.draggable());
    if (this._back.draggable() !== draggable) {
      this._back.draggable(draggable);
    }
    const styleFunc = this.anchorStyleFunc();
    if (styleFunc) {
      Object.values(this._anchors).forEach((node) => styleFunc(node));
    }
    this.getLayer()?.batchDraw();
  }

  _updateElements(attrs: Box) {
    const previous = this._lastNodeRect;
    // Only element layout is cached. Drag handling, user callbacks and drawing
    // remain in _update(). Custom styling needs fresh defaults on every update.
    if (
      previous &&
      !this.anchorStyleFunc() &&
      attrs.x === previous.x &&
      attrs.y === previous.y &&
      attrs.width === previous.width &&
      attrs.height === previous.height &&
      attrs.rotation === previous.rotation
    ) {
      return;
    }
    this._lastNodeRect = { ...attrs };
    const width = attrs.width;
    const height = attrs.height;

    const enabledAnchors = this.enabledAnchors();
    const resizeEnabled = this.resizeEnabled();
    const padding = this.padding();

    const anchorSize = this.anchorSize();
    const anchors = Object.values(this._anchors);
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

    this._anchors['top-left'].setAttrs({
      x: 0,
      y: 0,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-left') >= 0,
    });
    this._anchors['top-center'].setAttrs({
      x: width / 2,
      y: 0,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-center') >= 0,
    });
    this._anchors['top-right'].setAttrs({
      x: width,
      y: 0,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('top-right') >= 0,
    });
    this._anchors['middle-left'].setAttrs({
      x: 0,
      y: height / 2,
      offsetX: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-left') >= 0,
    });
    this._anchors['middle-right'].setAttrs({
      x: width,
      y: height / 2,
      offsetX: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('middle-right') >= 0,
    });
    this._anchors['bottom-left'].setAttrs({
      x: 0,
      y: height,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-left') >= 0,
    });
    this._anchors['bottom-center'].setAttrs({
      x: width / 2,
      y: height,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-center') >= 0,
    });
    this._anchors['bottom-right'].setAttrs({
      x: width,
      y: height,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf('bottom-right') >= 0,
    });

    // Calculate rotation anchor position based on rotateAnchorAngle
    const rotateAnchorAngle = this.rotateAnchorAngle();
    const rotateAnchorOffset = this.rotateAnchorOffset();
    const rad = Util.degToRad(rotateAnchorAngle);
    // Direction vector (0 degrees = up/top)
    const dirX = Math.sin(rad);
    const dirY = -Math.cos(rad);

    // Center of the box
    const cx = width / 2;
    const cy = height / 2;

    // Find intersection with box edge
    // Calculate time to hit each edge from center
    let t = Infinity;

    // Handle each direction
    if (dirY < 0) {
      // Moving up, check top edge (y = 0)
      t = Math.min(t, -cy / dirY);
    } else if (dirY > 0) {
      // Moving down, check bottom edge (y = height)
      t = Math.min(t, (height - cy) / dirY);
    }
    if (dirX < 0) {
      // Moving left, check left edge (x = 0)
      t = Math.min(t, -cx / dirX);
    } else if (dirX > 0) {
      // Moving right, check right edge (x = width)
      t = Math.min(t, (width - cx) / dirX);
    }

    // Edge point
    const edgeX = cx + dirX * t;
    const edgeY = cy + dirY * t;

    this._anchors['rotater'].setAttrs({
      x: edgeX + dirX * (rotateAnchorOffset + padding),
      y: edgeY + dirY * (rotateAnchorOffset + padding),
      visible: this.rotateEnabled(),
    });

    this._back.setAttrs({
      width: width,
      height: height,
      visible: this.borderEnabled() || this.shouldOverdrawWholeArea(),
      stroke: this.borderStroke(),
      strokeWidth: this.borderStrokeWidth(),
      dash: this.borderDash(),
      x: 0,
      y: 0,
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
  // Transformer manages its own internal children (anchors, back shape).
  // Adding external nodes as children can cause infinite recursion because
  // the Transformer's absoluteTransform depends on nodes' transforms.
  // Use tr.nodes([node]) to attach nodes instead.
  add(...children: any[]) {
    if (this._elementsCreated) {
      Util.error(
        'You cannot add external nodes to the Transformer. Use tr.nodes([node]) instead.'
      );
      return this;
    }
    return super.add(...children);
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
  getClientRect(config?: Parameters<Group['getClientRect']>[0]) {
    if (this.nodes().length > 0) {
      return super.getClientRect(config);
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
  rotateAnchorAngle: GetSet<number, this>;
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
    (oldPos: Vector2d, newPos: Vector2d, evt: any) => Vector2d,
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
 * get/set the angle (in degrees) of the rotation anchor position around the bounding box.
 * 0 = top-center (default), 90 = middle-right, 180 = bottom-center, -90 = middle-left
 * @name Konva.Transformer#rotateAnchorAngle
 * @method
 * @param {Number} angle
 * @returns {Number}
 * @example
 * // get
 * var rotateAnchorAngle = transformer.rotateAnchorAngle();
 *
 * // set rotation anchor to the right side
 * transformer.rotateAnchorAngle(90);
 *
 * // set rotation anchor to the bottom
 * transformer.rotateAnchorAngle(180);
 */
Factory.addGetterSetter(
  Transformer,
  'rotateAnchorAngle',
  0,
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
// @ts-ignore
// deprecated
Factory.addGetterSetter(Transformer, 'node');

/**
 * get/set bounding box function. **IMPORTANT!** boundBoxFunc operates in absolute coordinates.
 *  Both boxes are `{ x, y, width, height, rotation }`, with the rotation in radians.
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
 *  if (anchor.hasName('rotater')) {
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
