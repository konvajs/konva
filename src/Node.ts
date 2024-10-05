import { Util, Transform } from './Util';
import { Factory } from './Factory';
import { SceneCanvas, HitCanvas, Canvas } from './Canvas';
import { Konva } from './Global';
import { Container } from './Container';
import { GetSet, Vector2d, IRect } from './types';
import { DD } from './DragAndDrop';
import {
  getNumberValidator,
  getStringValidator,
  getBooleanValidator,
} from './Validators';
import { Stage } from './Stage';
import { Context } from './Context';
import { Shape } from './Shape';
import { Layer } from './Layer';

export type Filter = (this: Node, imageData: ImageData) => void;

type globalCompositeOperationType =
  | ''
  | 'source-over'
  | 'source-in'
  | 'source-out'
  | 'source-atop'
  | 'destination-over'
  | 'destination-in'
  | 'destination-out'
  | 'destination-atop'
  | 'lighter'
  | 'copy'
  | 'xor'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface NodeConfig {
  // allow any custom attribute
  [index: string]: any;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  listening?: boolean;
  id?: string;
  name?: string;
  opacity?: number;
  scale?: Vector2d;
  scaleX?: number;
  skewX?: number;
  skewY?: number;
  scaleY?: number;
  rotation?: number;
  rotationDeg?: number;
  offset?: Vector2d;
  offsetX?: number;
  offsetY?: number;
  draggable?: boolean;
  dragDistance?: number;
  dragBoundFunc?: (this: Node, pos: Vector2d) => Vector2d;
  preventDefault?: boolean;
  globalCompositeOperation?: globalCompositeOperationType;
  filters?: Array<Filter>;
}

// CONSTANTS
const ABSOLUTE_OPACITY = 'absoluteOpacity',
  ALL_LISTENERS = 'allEventListeners',
  ABSOLUTE_TRANSFORM = 'absoluteTransform',
  ABSOLUTE_SCALE = 'absoluteScale',
  CANVAS = 'canvas',
  CHANGE = 'Change',
  CHILDREN = 'children',
  KONVA = 'konva',
  LISTENING = 'listening',
  MOUSEENTER = 'mouseenter',
  MOUSELEAVE = 'mouseleave',
  NAME = 'name',
  SET = 'set',
  SHAPE = 'Shape',
  SPACE = ' ',
  STAGE = 'stage',
  TRANSFORM = 'transform',
  UPPER_STAGE = 'Stage',
  VISIBLE = 'visible',
  TRANSFORM_CHANGE_STR = [
    'xChange.konva',
    'yChange.konva',
    'scaleXChange.konva',
    'scaleYChange.konva',
    'skewXChange.konva',
    'skewYChange.konva',
    'rotationChange.konva',
    'offsetXChange.konva',
    'offsetYChange.konva',
    'transformsEnabledChange.konva',
  ].join(SPACE);

let idCounter = 1;

// create all the events here
type NodeEventMap = GlobalEventHandlersEventMap & {
  [index: string]: any;
};

export interface KonvaEventObject<EventType, This = Node> {
  type: string;
  target: Shape | Stage;
  evt: EventType;
  pointerId: number;
  currentTarget: This;
  cancelBubble: boolean;
  child?: Node;
}

export type KonvaEventListener<This, EventType> = (
  this: This,
  ev: KonvaEventObject<EventType, This>
) => void;

/**
 * Node constructor. Nodes are entities that can be transformed, layered,
 * and have bound events. The stage, layers, groups, and shapes all extend Node.
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @@nodeParams
 */
export abstract class Node<Config extends NodeConfig = NodeConfig> {
  _id = idCounter++;
  eventListeners: {
    [index: string]: Array<{ name: string; handler: Function }>;
  } = {};
  attrs: any = {};
  index = 0;
  _allEventListeners: null | Array<Function> = null;
  parent: Container | null = null;
  _cache: Map<string, any> = new Map<string, any>();
  _attachedDepsListeners: Map<string, boolean> = new Map<string, boolean>();
  _lastPos: Vector2d | null = null;
  _attrsAffectingSize!: string[];
  _batchingTransformChange = false;
  _needClearTransformCache = false;

  _filterUpToDate = false;
  _isUnderCache = false;
  nodeType!: string;
  className!: string;

  _dragEventId: number | null = null;
  _shouldFireChangeEvents = false;

  constructor(config?: Config) {
    // on initial set attrs wi don't need to fire change events
    // because nobody is listening to them yet
    this.setAttrs(config);
    this._shouldFireChangeEvents = true;

    // all change event listeners are attached to the prototype
  }

  hasChildren() {
    return false;
  }

  _clearCache(attr?: string) {
    // if we want to clear transform cache
    // we don't really need to remove it from the cache
    // but instead mark as "dirty"
    // so we don't need to create a new instance next time
    if (
      (attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM) &&
      this._cache.get(attr)
    ) {
      (this._cache.get(attr) as Transform).dirty = true;
    } else if (attr) {
      this._cache.delete(attr);
    } else {
      this._cache.clear();
    }
  }
  _getCache(attr: string, privateGetter: Function) {
    let cache = this._cache.get(attr);

    // for transform the cache can be NOT empty
    // but we still need to recalculate it if it is dirty
    const isTransform = attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM;
    const invalid = cache === undefined || (isTransform && cache.dirty === true);

    // if not cached, we need to set it using the private getter method.
    if (invalid) {
      cache = privateGetter.call(this);
      this._cache.set(attr, cache);
    }

    return cache;
  }

  _calculate(name: string, deps: Array<string>, getter: Function) {
    // if we are trying to calculate function for the first time
    // we need to attach listeners for change events
    if (!this._attachedDepsListeners.get(name)) {
      const depsString = deps.map((dep) => dep + 'Change.konva').join(SPACE);
      this.on(depsString, () => {
        this._clearCache(name);
      });
      this._attachedDepsListeners.set(name, true);
    }
    // just use cache function
    return this._getCache(name, getter);
  }

  _getCanvasCache() {
    return this._cache.get(CANVAS);
  }
  /*
   * when the logic for a cached result depends on ancestor propagation, use this
   * method to clear self and children cache
   */
  _clearSelfAndDescendantCache(attr?: string) {
    this._clearCache(attr);
    // trigger clear cache, so transformer can use it
    if (attr === ABSOLUTE_TRANSFORM) {
      this.fire('absoluteTransformChange');
    }
  }
  /**
   * clear cached canvas
   * @method
   * @name Konva.Node#clearCache
   * @returns {Konva.Node}
   * @example
   * node.clearCache();
   */
  clearCache() {
    if (this._cache.has(CANVAS)) {
      const { scene, filter, hit } = this._cache.get(CANVAS);
      Util.releaseCanvas(scene, filter, hit);
      this._cache.delete(CANVAS);
    }

    this._clearSelfAndDescendantCache();
    this._requestDraw();
    return this;
  }
  /**
   *  cache node to improve drawing performance, apply filters, or create more accurate
   *  hit regions. For all basic shapes size of cache canvas will be automatically detected.
   *  If you need to cache your custom `Konva.Shape` instance you have to pass shape's bounding box
   *  properties. Look at [https://konvajs.org/docs/performance/Shape_Caching.html](https://konvajs.org/docs/performance/Shape_Caching.html) for more information.
   * @method
   * @name Konva.Node#cache
   * @param {Object} [config]
   * @param {Number} [config.x]
   * @param {Number} [config.y]
   * @param {Number} [config.width]
   * @param {Number} [config.height]
   * @param {Number} [config.offset]  increase canvas size by `offset` pixel in all directions.
   * @param {Boolean} [config.drawBorder] when set to true, a red border will be drawn around the cached
   *  region for debugging purposes
   * @param {Number} [config.pixelRatio] change quality (or pixel ratio) of cached image. pixelRatio = 2 will produce 2x sized cache.
   * @param {Boolean} [config.imageSmoothingEnabled] control imageSmoothingEnabled property of created canvas for cache
   * @param {Number} [config.hitCanvasPixelRatio] change quality (or pixel ratio) of cached hit canvas.
   * @returns {Konva.Node}
   * @example
   * // cache a shape with the x,y position of the bounding box at the center and
   * // the width and height of the bounding box equal to the width and height of
   * // the shape obtained from shape.width() and shape.height()
   * image.cache();
   *
   * // cache a node and define the bounding box position and size
   * node.cache({
   *   x: -30,
   *   y: -30,
   *   width: 100,
   *   height: 200
   * });
   *
   * // cache a node and draw a red border around the bounding box
   * // for debugging purposes
   * node.cache({
   *   x: -30,
   *   y: -30,
   *   width: 100,
   *   height: 200,
   *   offset : 10,
   *   drawBorder: true
   * });
   */
  cache(config?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    drawBorder?: boolean;
    offset?: number;
    pixelRatio?: number;
    imageSmoothingEnabled?: boolean;
    hitCanvasPixelRatio?: number;
  }) {
    const conf = config || {};
    let rect = {} as IRect;

    // don't call getClientRect if we have all attributes
    // it means call it only if have one undefined
    if (
      conf.x === undefined ||
      conf.y === undefined ||
      conf.width === undefined ||
      conf.height === undefined
    ) {
      rect = this.getClientRect({
        skipTransform: true,
        relativeTo: this.getParent() || undefined,
      });
    }
    let width = Math.ceil(conf.width || rect.width),
      height = Math.ceil(conf.height || rect.height),
      pixelRatio = conf.pixelRatio,
      x = conf.x === undefined ? Math.floor(rect.x) : conf.x,
      y = conf.y === undefined ? Math.floor(rect.y) : conf.y,
      offset = conf.offset || 0,
      drawBorder = conf.drawBorder || false,
      hitCanvasPixelRatio = conf.hitCanvasPixelRatio || 1;

    if (!width || !height) {
      Util.error(
        'Can not cache the node. Width or height of the node equals 0. Caching is skipped.'
      );
      return;
    }

    // because using Math.floor on x, y position may shift drawing
    // to avoid shift we need to increase size
    // but we better to avoid it, for better filters flows
    const extraPaddingX = Math.abs(Math.round(rect.x) - x) > 0.5 ? 1 : 0;
    const extraPaddingY = Math.abs(Math.round(rect.y) - y) > 0.5 ? 1 : 0;
    width += offset * 2 + extraPaddingX;
    height += offset * 2 + extraPaddingY;

    x -= offset;
    y -= offset;

    // if (Math.floor(x) < x) {
    //   x = Math.floor(x);
    //   // width += 1;
    // }
    // if (Math.floor(y) < y) {
    //   y = Math.floor(y);
    //   // height += 1;
    // }

    // console.log({ x, y, width, height }, rect);

    const cachedSceneCanvas = new SceneCanvas({
        pixelRatio: pixelRatio,
        width: width,
        height: height,
      }),
      cachedFilterCanvas = new SceneCanvas({
        pixelRatio: pixelRatio,
        width: 0,
        height: 0,
        willReadFrequently: true,
      }),
      cachedHitCanvas = new HitCanvas({
        pixelRatio: hitCanvasPixelRatio,
        width: width,
        height: height,
      }),
      sceneContext = cachedSceneCanvas.getContext(),
      hitContext = cachedHitCanvas.getContext();

    cachedHitCanvas.isCache = true;
    cachedSceneCanvas.isCache = true;

    this._cache.delete(CANVAS);
    this._filterUpToDate = false;

    if (conf.imageSmoothingEnabled === false) {
      cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
      cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
    }

    sceneContext.save();
    hitContext.save();

    sceneContext.translate(-x, -y);
    hitContext.translate(-x, -y);

    // extra flag to skip on getAbsolute opacity calc
    this._isUnderCache = true;
    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);

    this.drawScene(cachedSceneCanvas, this);
    this.drawHit(cachedHitCanvas, this);
    this._isUnderCache = false;

    sceneContext.restore();
    hitContext.restore();

    // this will draw a red border around the cached box for
    // debugging purposes
    if (drawBorder) {
      sceneContext.save();
      sceneContext.beginPath();
      sceneContext.rect(0, 0, width, height);
      sceneContext.closePath();
      sceneContext.setAttr('strokeStyle', 'red');
      sceneContext.setAttr('lineWidth', 5);
      sceneContext.stroke();
      sceneContext.restore();
    }

    this._cache.set(CANVAS, {
      scene: cachedSceneCanvas,
      filter: cachedFilterCanvas,
      hit: cachedHitCanvas,
      x: x,
      y: y,
    });

    this._requestDraw();

    return this;
  }

  /**
   * determine if node is currently cached
   * @method
   * @name Konva.Node#isCached
   * @returns {Boolean}
   */
  isCached() {
    return this._cache.has(CANVAS);
  }

  abstract drawScene(canvas?: Canvas, top?: Node, bufferCanvas?: Canvas): void;
  abstract drawHit(canvas?: Canvas, top?: Node): void;
  /**
   * Return client rectangle {x, y, width, height} of node. This rectangle also include all styling (strokes, shadows, etc).
   * The purpose of the method is similar to getBoundingClientRect API of the DOM.
   * @method
   * @name Konva.Node#getClientRect
   * @param {Object} config
   * @param {Boolean} [config.skipTransform] should we apply transform to node for calculating rect?
   * @param {Boolean} [config.skipShadow] should we apply shadow to the node for calculating bound box?
   * @param {Boolean} [config.skipStroke] should we apply stroke to the node for calculating bound box?
   * @param {Object} [config.relativeTo] calculate client rect relative to one of the parents
   * @returns {Object} rect with {x, y, width, height} properties
   * @example
   * var rect = new Konva.Rect({
   *      width : 100,
   *      height : 100,
   *      x : 50,
   *      y : 50,
   *      strokeWidth : 4,
   *      stroke : 'black',
   *      offsetX : 50,
   *      scaleY : 2
   * });
   *
   * // get client rect without think off transformations (position, rotation, scale, offset, etc)
   * rect.getClientRect({ skipTransform: true});
   * // returns {
   * //     x : -2,   // two pixels for stroke / 2
   * //     y : -2,
   * //     width : 104, // increased by 4 for stroke
   * //     height : 104
   * //}
   *
   * // get client rect with transformation applied
   * rect.getClientRect();
   * // returns Object {x: -2, y: 46, width: 104, height: 208}
   */
  getClientRect(config?: {
    skipTransform?: boolean;
    skipShadow?: boolean;
    skipStroke?: boolean;
    relativeTo?: Container;
  }): { x: number; y: number; width: number; height: number } {
    // abstract method
    // redefine in Container and Shape
    throw new Error('abstract "getClientRect" method call');
  }
  _transformedRect(rect: IRect, top?: Node | null) {
    const points = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ];
    let minX: number = Infinity,
      minY: number = Infinity,
      maxX: number = -Infinity,
      maxY: number = -Infinity;
    const trans = this.getAbsoluteTransform(top);
    points.forEach(function (point) {
      const transformed = trans.point(point);
      if (minX === undefined) {
        minX = maxX = transformed.x;
        minY = maxY = transformed.y;
      }
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  _drawCachedSceneCanvas(context: Context) {
    context.save();
    context._applyOpacity(this);
    context._applyGlobalCompositeOperation(this);

    const canvasCache = this._getCanvasCache();
    context.translate(canvasCache.x, canvasCache.y);

    const cacheCanvas = this._getCachedSceneCanvas();
    const ratio = cacheCanvas.pixelRatio;

    context.drawImage(
      cacheCanvas._canvas,
      0,
      0,
      cacheCanvas.width / ratio,
      cacheCanvas.height / ratio
    );
    context.restore();
  }
  _drawCachedHitCanvas(context: Context) {
    const canvasCache = this._getCanvasCache(),
      hitCanvas = canvasCache.hit;
    context.save();
    context.translate(canvasCache.x, canvasCache.y);
    context.drawImage(
      hitCanvas._canvas,
      0,
      0,
      hitCanvas.width / hitCanvas.pixelRatio,
      hitCanvas.height / hitCanvas.pixelRatio
    );
    context.restore();
  }
  _getCachedSceneCanvas() {
    let filters = this.filters(),
      cachedCanvas = this._getCanvasCache(),
      sceneCanvas = cachedCanvas.scene,
      filterCanvas = cachedCanvas.filter,
      filterContext = filterCanvas.getContext(),
      len,
      imageData,
      n,
      filter;

    if (filters) {
      if (!this._filterUpToDate) {
        const ratio = sceneCanvas.pixelRatio;
        filterCanvas.setSize(
          sceneCanvas.width / sceneCanvas.pixelRatio,
          sceneCanvas.height / sceneCanvas.pixelRatio
        );
        try {
          len = filters.length;
          filterContext.clear();

          // copy cached canvas onto filter context
          filterContext.drawImage(
            sceneCanvas._canvas,
            0,
            0,
            sceneCanvas.getWidth() / ratio,
            sceneCanvas.getHeight() / ratio
          );
          imageData = filterContext.getImageData(
            0,
            0,
            filterCanvas.getWidth(),
            filterCanvas.getHeight()
          );

          // apply filters to filter context
          for (n = 0; n < len; n++) {
            filter = filters[n];
            if (typeof filter !== 'function') {
              Util.error(
                'Filter should be type of function, but got ' +
                  typeof filter +
                  ' instead. Please check correct filters'
              );
              continue;
            }
            filter.call(this, imageData);
            filterContext.putImageData(imageData, 0, 0);
          }
        } catch (e: any) {
          Util.error(
            'Unable to apply filter. ' +
              e.message +
              ' This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.'
          );
        }

        this._filterUpToDate = true;
      }

      return filterCanvas;
    }
    return sceneCanvas;
  }
  /**
   * bind events to the node. KonvaJS supports mouseover, mousemove,
   *  mouseout, mouseenter, mouseleave, mousedown, mouseup, wheel, contextmenu, click, dblclick, touchstart, touchmove,
   *  touchend, tap, dbltap, dragstart, dragmove, and dragend events.
   *  Pass in a string of events delimited by a space to bind multiple events at once
   *  such as 'mousedown mouseup mousemove'. Include a namespace to bind an
   *  event by name such as 'click.foobar'.
   * @method
   * @name Konva.Node#on
   * @param {String} evtStr e.g. 'click', 'mousedown touchstart', 'mousedown.foo touchstart.foo'
   * @param {Function} handler The handler function. The first argument of that function is event object. Event object has `target` as main target of the event, `currentTarget` as current node listener and `evt` as native browser event.
   * @returns {Konva.Node}
   * @example
   * // add click listener
   * node.on('click', function() {
   *   console.log('you clicked me!');
   * });
   *
   * // get the target node
   * node.on('click', function(evt) {
   *   console.log(evt.target);
   * });
   *
   * // stop event propagation
   * node.on('click', function(evt) {
   *   evt.cancelBubble = true;
   * });
   *
   * // bind multiple listeners
   * node.on('click touchstart', function() {
   *   console.log('you clicked/touched me!');
   * });
   *
   * // namespace listener
   * node.on('click.foo', function() {
   *   console.log('you clicked/touched me!');
   * });
   *
   * // get the event type
   * node.on('click tap', function(evt) {
   *   var eventType = evt.type;
   * });
   *
   * // get native event object
   * node.on('click tap', function(evt) {
   *   var nativeEvent = evt.evt;
   * });
   *
   * // for change events, get the old and new val
   * node.on('xChange', function(evt) {
   *   var oldVal = evt.oldVal;
   *   var newVal = evt.newVal;
   * });
   *
   * // get event targets
   * // with event delegations
   * layer.on('click', 'Group', function(evt) {
   *   var shape = evt.target;
   *   var group = evt.currentTarget;
   * });
   */
  on<K extends keyof NodeEventMap>(
    evtStr: K,
    handler: KonvaEventListener<this, NodeEventMap[K]>
  ) {
    this._cache && this._cache.delete(ALL_LISTENERS);

    if (arguments.length === 3) {
      return this._delegate.apply(this, arguments as any);
    }
    let events = (evtStr as string).split(SPACE),
      len = events.length,
      n,
      event,
      parts,
      baseEvent,
      name;

    /*
     * loop through types and attach event listeners to
     * each one.  eg. 'click mouseover.namespace mouseout'
     * will create three event bindings
     */
    for (n = 0; n < len; n++) {
      event = events[n];
      parts = event.split('.');
      baseEvent = parts[0];
      name = parts[1] || '';

      // create events array if it doesn't exist
      if (!this.eventListeners[baseEvent]) {
        this.eventListeners[baseEvent] = [];
      }

      this.eventListeners[baseEvent].push({
        name: name,
        handler: handler,
      });
    }

    return this;
  }
  /**
   * remove event bindings from the node. Pass in a string of
   *  event types delimmited by a space to remove multiple event
   *  bindings at once such as 'mousedown mouseup mousemove'.
   *  include a namespace to remove an event binding by name
   *  such as 'click.foobar'. If you only give a name like '.foobar',
   *  all events in that namespace will be removed.
   * @method
   * @name Konva.Node#off
   * @param {String} evtStr e.g. 'click', 'mousedown touchstart', '.foobar'
   * @returns {Konva.Node}
   * @example
   * // remove listener
   * node.off('click');
   *
   * // remove multiple listeners
   * node.off('click touchstart');
   *
   * // remove listener by name
   * node.off('click.foo');
   */
  off(evtStr?: string, callback?: Function) {
    let events = (evtStr || '').split(SPACE),
      len = events.length,
      n,
      t,
      event,
      parts,
      baseEvent,
      name;

    this._cache && this._cache.delete(ALL_LISTENERS);

    if (!evtStr) {
      // remove all events
      for (t in this.eventListeners) {
        this._off(t);
      }
    }
    for (n = 0; n < len; n++) {
      event = events[n];
      parts = event.split('.');
      baseEvent = parts[0];
      name = parts[1];

      if (baseEvent) {
        if (this.eventListeners[baseEvent]) {
          this._off(baseEvent, name, callback);
        }
      } else {
        for (t in this.eventListeners) {
          this._off(t, name, callback);
        }
      }
    }
    return this;
  }
  // some event aliases for third party integration like HammerJS
  dispatchEvent(evt: any) {
    const e = {
      target: this,
      type: evt.type,
      evt: evt,
    };
    this.fire(evt.type, e);
    return this;
  }
  addEventListener(type: string, handler: (e: Event) => void) {
    // we have to pass native event to handler
    this.on(type, function (evt) {
      handler.call(this, evt.evt);
    });
    return this;
  }
  removeEventListener(type: string) {
    this.off(type);
    return this;
  }
  // like node.on
  _delegate(event: string, selector: string, handler: (e: Event) => void) {
    const stopNode = this;
    this.on(event, function (evt) {
      const targets = evt.target.findAncestors(selector, true, stopNode);
      for (let i = 0; i < targets.length; i++) {
        evt = Util.cloneObject(evt);
        evt.currentTarget = targets[i] as any;
        handler.call(targets[i], evt as any);
      }
    });
  }
  /**
   * remove a node from parent, but don't destroy. You can reuse the node later.
   * @method
   * @name Konva.Node#remove
   * @returns {Konva.Node}
   * @example
   * node.remove();
   */
  remove() {
    if (this.isDragging()) {
      this.stopDrag();
    }
    // we can have drag element but that is not dragged yet
    // so just clear it
    DD._dragElements.delete(this._id);
    this._remove();
    return this;
  }
  _clearCaches() {
    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
    this._clearSelfAndDescendantCache(STAGE);
    this._clearSelfAndDescendantCache(VISIBLE);
    this._clearSelfAndDescendantCache(LISTENING);
  }
  _remove() {
    // every cached attr that is calculated via node tree
    // traversal must be cleared when removing a node
    this._clearCaches();

    const parent = this.getParent();

    if (parent && parent.children) {
      parent.children.splice(this.index, 1);
      parent._setChildrenIndices();
      this.parent = null;
    }
  }
  /**
   * remove and destroy a node. Kill it and delete forever! You should not reuse node after destroy().
   * If the node is a container (Group, Stage or Layer) it will destroy all children too.
   * @method
   * @name Konva.Node#destroy
   * @example
   * node.destroy();
   */
  destroy() {
    this.remove();
    this.clearCache();
    return this;
  }
  /**
   * get attr
   * @method
   * @name Konva.Node#getAttr
   * @param {String} attr
   * @returns {Integer|String|Object|Array}
   * @example
   * var x = node.getAttr('x');
   */
  getAttr(attr: string) {
    const method = 'get' + Util._capitalize(attr);
    if (Util._isFunction((this as any)[method])) {
      return (this as any)[method]();
    }
    // otherwise get directly
    return this.attrs[attr];
  }
  /**
   * get ancestors
   * @method
   * @name Konva.Node#getAncestors
   * @returns {Array}
   * @example
   * shape.getAncestors().forEach(function(node) {
   *   console.log(node.getId());
   * })
   */
  getAncestors() {
    let parent = this.getParent(),
      ancestors: Array<Node> = [];

    while (parent) {
      ancestors.push(parent);
      parent = parent.getParent();
    }

    return ancestors;
  }
  /**
   * get attrs object literal
   * @method
   * @name Konva.Node#getAttrs
   * @returns {Object}
   */
  getAttrs() {
    return (this.attrs || {}) as Config & Record<string, any>;
  }
  /**
   * set multiple attrs at once using an object literal
   * @method
   * @name Konva.Node#setAttrs
   * @param {Object} config object containing key value pairs
   * @returns {Konva.Node}
   * @example
   * node.setAttrs({
   *   x: 5,
   *   fill: 'red'
   * });
   */
  setAttrs(config: any) {
    this._batchTransformChanges(() => {
      let key, method;
      if (!config) {
        return this;
      }
      for (key in config) {
        if (key === CHILDREN) {
          continue;
        }
        method = SET + Util._capitalize(key);
        // use setter if available
        if (Util._isFunction(this[method])) {
          this[method](config[key]);
        } else {
          // otherwise set directly
          this._setAttr(key, config[key]);
        }
      }
    });

    return this;
  }
  /**
   * determine if node is listening for events by taking into account ancestors.
   *
   * Parent    | Self      | isListening
   * listening | listening |
   * ----------+-----------+------------
   * T         | T         | T
   * T         | F         | F
   * F         | T         | F
   * F         | F         | F
   *
   * @method
   * @name Konva.Node#isListening
   * @returns {Boolean}
   */
  isListening() {
    return this._getCache(LISTENING, this._isListening);
  }
  _isListening(relativeTo?: Node): boolean {
    const listening = this.listening();
    if (!listening) {
      return false;
    }
    const parent = this.getParent();
    if (parent && parent !== relativeTo && this !== relativeTo) {
      return parent._isListening(relativeTo);
    } else {
      return true;
    }
  }
  /**
   * determine if node is visible by taking into account ancestors.
   *
   * Parent    | Self      | isVisible
   * visible   | visible   |
   * ----------+-----------+------------
   * T         | T         | T
   * T         | F         | F
   * F         | T         | F
   * F         | F         | F
   * @method
   * @name Konva.Node#isVisible
   * @returns {Boolean}
   */
  isVisible() {
    return this._getCache(VISIBLE, this._isVisible);
  }
  _isVisible(relativeTo?: Node): boolean {
    const visible = this.visible();
    if (!visible) {
      return false;
    }
    const parent = this.getParent();
    if (parent && parent !== relativeTo && this !== relativeTo) {
      return parent._isVisible(relativeTo);
    } else {
      return true;
    }
  }
  shouldDrawHit(top?: Node, skipDragCheck = false) {
    if (top) {
      return this._isVisible(top) && this._isListening(top);
    }
    const layer = this.getLayer();

    let layerUnderDrag = false;
    DD._dragElements.forEach((elem) => {
      if (elem.dragStatus !== 'dragging') {
        return;
      } else if (elem.node.nodeType === 'Stage') {
        layerUnderDrag = true;
      } else if (elem.node.getLayer() === layer) {
        layerUnderDrag = true;
      }
    });

    const dragSkip =
      !skipDragCheck &&
      !Konva.hitOnDragEnabled &&
      (layerUnderDrag || Konva.isTransforming());
    return this.isListening() && this.isVisible() && !dragSkip;
  }

  /**
   * show node. set visible = true
   * @method
   * @name Konva.Node#show
   * @returns {Konva.Node}
   */
  show() {
    this.visible(true);
    return this;
  }
  /**
   * hide node.  Hidden nodes are no longer detectable
   * @method
   * @name Konva.Node#hide
   * @returns {Konva.Node}
   */
  hide() {
    this.visible(false);
    return this;
  }
  getZIndex() {
    return this.index || 0;
  }
  /**
   * get absolute z-index which takes into account sibling
   *  and ancestor indices
   * @method
   * @name Konva.Node#getAbsoluteZIndex
   * @returns {Integer}
   */
  getAbsoluteZIndex() {
    let depth = this.getDepth(),
      that = this,
      index = 0,
      nodes,
      len,
      n,
      child;

    function addChildren(children) {
      nodes = [];
      len = children.length;
      for (n = 0; n < len; n++) {
        child = children[n];
        index++;

        if (child.nodeType !== SHAPE) {
          nodes = nodes.concat(child.getChildren().slice());
        }

        if (child._id === that._id) {
          n = len;
        }
      }

      if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
        addChildren(nodes);
      }
    }
    const stage = this.getStage();
    if (that.nodeType !== UPPER_STAGE && stage) {
      addChildren(stage.getChildren());
    }

    return index;
  }
  /**
   * get node depth in node tree.  Returns an integer.
   *  e.g. Stage depth will always be 0.  Layers will always be 1.  Groups and Shapes will always
   *  be >= 2
   * @method
   * @name Konva.Node#getDepth
   * @returns {Integer}
   */
  getDepth() {
    let depth = 0,
      parent = this.parent;

    while (parent) {
      depth++;
      parent = parent.parent;
    }
    return depth;
  }

  // sometimes we do several attributes changes
  // like node.position(pos)
  // for performance reasons, lets batch transform reset
  // so it work faster
  _batchTransformChanges(func) {
    this._batchingTransformChange = true;
    func();
    this._batchingTransformChange = false;
    if (this._needClearTransformCache) {
      this._clearCache(TRANSFORM);
      this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    }
    this._needClearTransformCache = false;
  }

  setPosition(pos: Vector2d) {
    this._batchTransformChanges(() => {
      this.x(pos.x);
      this.y(pos.y);
    });
    return this;
  }
  getPosition() {
    return {
      x: this.x(),
      y: this.y(),
    };
  }
  /**
   * get position of first pointer (like mouse or first touch) relative to local coordinates of current node
   * @method
   * @name Konva.Node#getRelativePointerPosition
   * @returns {Konva.Node}
   * @example
   *
   * // let's think we have a rectangle at position x = 10, y = 10
   * // now we clicked at x = 15, y = 15 of the stage
   * // if you want to know position of the click, related to the rectangle you can use
   * rect.getRelativePointerPosition();
   */
  getRelativePointerPosition() {
    const stage = this.getStage();
    if (!stage) {
      return null;
    }
    // get pointer (say mouse or touch) position
    const pos = stage.getPointerPosition();
    if (!pos) {
      return null;
    }
    const transform = this.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();
    // now we can find relative point
    return transform.point(pos);
  }
  /**
   * get absolute position of a node. That function can be used to calculate absolute position, but relative to any ancestor
   * @method
   * @name Konva.Node#getAbsolutePosition
   * @param {Object} Ancestor optional ancestor node
   * @returns {Konva.Node}
   * @example
   *
   * // returns absolute position relative to top-left corner of canvas
   * node.getAbsolutePosition();
   *
   * // calculate absolute position of node, inside stage
   * // so stage transforms are ignored
   * node.getAbsolutePosition(stage)
   */
  getAbsolutePosition(top?: Node) {
    let haveCachedParent = false;
    let parent = this.parent;
    while (parent) {
      if (parent.isCached()) {
        haveCachedParent = true;
        break;
      }
      parent = parent.parent;
    }
    if (haveCachedParent && !top) {
      // make fake top element
      // "true" is not a node, but it will just allow skip all caching
      top = true as any;
    }
    const absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(),
      absoluteTransform = new Transform(),
      offset = this.offset();

    // clone the matrix array
    absoluteTransform.m = absoluteMatrix.slice();
    absoluteTransform.translate(offset.x, offset.y);

    return absoluteTransform.getTranslation();
  }
  setAbsolutePosition(pos: Vector2d) {
    const { x, y, ...origTrans } = this._clearTransform();

    // don't clear translation
    this.attrs.x = x;
    this.attrs.y = y;

    // important, use non cached value
    this._clearCache(TRANSFORM);
    const it = this._getAbsoluteTransform().copy();

    it.invert();
    it.translate(pos.x, pos.y);
    pos = {
      x: this.attrs.x + it.getTranslation().x,
      y: this.attrs.y + it.getTranslation().y,
    };
    this._setTransform(origTrans);
    this.setPosition({ x: pos.x, y: pos.y });
    this._clearCache(TRANSFORM);
    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);

    return this;
  }
  _setTransform(trans) {
    let key;

    for (key in trans) {
      this.attrs[key] = trans[key];
    }
    // this._clearCache(TRANSFORM);
    // this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
  }
  _clearTransform() {
    const trans = {
      x: this.x(),
      y: this.y(),
      rotation: this.rotation(),
      scaleX: this.scaleX(),
      scaleY: this.scaleY(),
      offsetX: this.offsetX(),
      offsetY: this.offsetY(),
      skewX: this.skewX(),
      skewY: this.skewY(),
    };

    this.attrs.x = 0;
    this.attrs.y = 0;
    this.attrs.rotation = 0;
    this.attrs.scaleX = 1;
    this.attrs.scaleY = 1;
    this.attrs.offsetX = 0;
    this.attrs.offsetY = 0;
    this.attrs.skewX = 0;
    this.attrs.skewY = 0;

    // return original transform
    return trans;
  }
  /**
   * move node by an amount relative to its current position
   * @method
   * @name Konva.Node#move
   * @param {Object} change
   * @param {Number} change.x
   * @param {Number} change.y
   * @returns {Konva.Node}
   * @example
   * // move node in x direction by 1px and y direction by 2px
   * node.move({
   *   x: 1,
   *   y: 2
   * });
   */
  move(change: Vector2d) {
    let changeX = change.x,
      changeY = change.y,
      x = this.x(),
      y = this.y();

    if (changeX !== undefined) {
      x += changeX;
    }

    if (changeY !== undefined) {
      y += changeY;
    }

    this.setPosition({ x: x, y: y });
    return this;
  }
  _eachAncestorReverse(func, top) {
    let family: Array<Node> = [],
      parent = this.getParent(),
      len,
      n;

    // if top node is defined, and this node is top node,
    // there's no need to build a family tree.  just execute
    // func with this because it will be the only node
    if (top && top._id === this._id) {
      // func(this);
      return;
    }

    family.unshift(this);

    while (parent && (!top || parent._id !== top._id)) {
      family.unshift(parent);
      parent = parent.parent;
    }

    len = family.length;
    for (n = 0; n < len; n++) {
      func(family[n]);
    }
  }
  /**
   * rotate node by an amount in degrees relative to its current rotation
   * @method
   * @name Konva.Node#rotate
   * @param {Number} theta
   * @returns {Konva.Node}
   */
  rotate(theta: number) {
    this.rotation(this.rotation() + theta);
    return this;
  }
  /**
   * move node to the top of its siblings
   * @method
   * @name Konva.Node#moveToTop
   * @returns {Boolean}
   */
  moveToTop() {
    if (!this.parent) {
      Util.warn('Node has no parent. moveToTop function is ignored.');
      return false;
    }
    const index = this.index,
      len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.push(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  /**
   * move node up
   * @method
   * @name Konva.Node#moveUp
   * @returns {Boolean} flag is moved or not
   */
  moveUp() {
    if (!this.parent) {
      Util.warn('Node has no parent. moveUp function is ignored.');
      return false;
    }
    const index = this.index,
      len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.splice(index + 1, 0, this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  /**
   * move node down
   * @method
   * @name Konva.Node#moveDown
   * @returns {Boolean}
   */
  moveDown() {
    if (!this.parent) {
      Util.warn('Node has no parent. moveDown function is ignored.');
      return false;
    }
    const index = this.index;
    if (index > 0) {
      this.parent.children.splice(index, 1);
      this.parent.children.splice(index - 1, 0, this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  /**
   * move node to the bottom of its siblings
   * @method
   * @name Konva.Node#moveToBottom
   * @returns {Boolean}
   */
  moveToBottom() {
    if (!this.parent) {
      Util.warn('Node has no parent. moveToBottom function is ignored.');
      return false;
    }
    const index = this.index;
    if (index > 0) {
      this.parent.children.splice(index, 1);
      this.parent.children.unshift(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  setZIndex(zIndex) {
    if (!this.parent) {
      Util.warn('Node has no parent. zIndex parameter is ignored.');
      return this;
    }
    if (zIndex < 0 || zIndex >= this.parent.children.length) {
      Util.warn(
        'Unexpected value ' +
          zIndex +
          ' for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to ' +
          (this.parent.children.length - 1) +
          '.'
      );
    }
    const index = this.index;
    this.parent.children.splice(index, 1);
    this.parent.children.splice(zIndex, 0, this);
    this.parent._setChildrenIndices();
    return this;
  }
  /**
   * get absolute opacity
   * @method
   * @name Konva.Node#getAbsoluteOpacity
   * @returns {Number}
   */
  getAbsoluteOpacity() {
    return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
  }
  _getAbsoluteOpacity() {
    let absOpacity = this.opacity();
    const parent = this.getParent();
    if (parent && !parent._isUnderCache) {
      absOpacity *= parent.getAbsoluteOpacity();
    }
    return absOpacity;
  }
  /**
   * move node to another container
   * @method
   * @name Konva.Node#moveTo
   * @param {Container} newContainer
   * @returns {Konva.Node}
   * @example
   * // move node from current layer into layer2
   * node.moveTo(layer2);
   */
  moveTo(newContainer: any) {
    // do nothing if new container is already parent
    if (this.getParent() !== newContainer) {
      this._remove();
      newContainer.add(this);
    }
    return this;
  }
  /**
   * convert Node into an object for serialization.  Returns an object.
   * @method
   * @name Konva.Node#toObject
   * @returns {Object}
   */
  toObject() {
    let attrs = this.getAttrs() as any,
      key,
      val,
      getter,
      defaultValue,
      nonPlainObject;

    const obj: {
      attrs: Config & Record<string, any>;
      className: string;
      children?: Array<any>;
    } = {
      attrs: {} as Config & Record<string, any>,
      className: this.getClassName(),
    };

    for (key in attrs) {
      val = attrs[key];
      // if value is object and object is not plain
      // like class instance, we should skip it and to not include
      nonPlainObject =
        Util.isObject(val) && !Util._isPlainObject(val) && !Util._isArray(val);
      if (nonPlainObject) {
        continue;
      }
      getter = typeof this[key] === 'function' && this[key];
      // remove attr value so that we can extract the default value from the getter
      delete attrs[key];
      defaultValue = getter ? getter.call(this) : null;
      // restore attr value
      attrs[key] = val;
      if (defaultValue !== val) {
        (obj.attrs as any)[key] = val;
      }
    }

    return Util._prepareToStringify(obj) as typeof obj;
  }
  /**
   * convert Node into a JSON string.  Returns a JSON string.
   * @method
   * @name Konva.Node#toJSON
   * @returns {String}
   */
  toJSON() {
    return JSON.stringify(this.toObject());
  }
  /**
   * get parent container
   * @method
   * @name Konva.Node#getParent
   * @returns {Konva.Node}
   */
  getParent() {
    return this.parent;
  }
  /**
   * get all ancestors (parent then parent of the parent, etc) of the node
   * @method
   * @name Konva.Node#findAncestors
   * @param {String} selector selector for search
   * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
   * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
   * @returns {Array} [ancestors]
   * @example
   * // get one of the parent group
   * var parentGroups = node.findAncestors('Group');
   */
  findAncestors(
    selector: string | Function,
    includeSelf?: boolean,
    stopNode?: Node
  ) {
    const res: Array<Node> = [];

    if (includeSelf && this._isMatch(selector)) {
      res.push(this);
    }
    let ancestor = this.parent;
    while (ancestor) {
      if (ancestor === stopNode) {
        return res;
      }
      if (ancestor._isMatch(selector)) {
        res.push(ancestor);
      }
      ancestor = ancestor.parent;
    }
    return res;
  }
  isAncestorOf(node: Node) {
    return false;
  }
  /**
   * get ancestor (parent or parent of the parent, etc) of the node that match passed selector
   * @method
   * @name Konva.Node#findAncestor
   * @param {String} selector selector for search
   * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
   * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
   * @returns {Konva.Node} ancestor
   * @example
   * // get one of the parent group
   * var group = node.findAncestors('.mygroup');
   */
  findAncestor(
    selector: string | Function,
    includeSelf?: boolean,
    stopNode?: Container
  ) {
    return this.findAncestors(selector, includeSelf, stopNode)[0];
  }
  // is current node match passed selector?
  _isMatch(selector: string | Function) {
    if (!selector) {
      return false;
    }
    if (typeof selector === 'function') {
      return selector(this);
    }
    let selectorArr = selector.replace(/ /g, '').split(','),
      len = selectorArr.length,
      n,
      sel;

    for (n = 0; n < len; n++) {
      sel = selectorArr[n];
      if (!Util.isValidSelector(sel)) {
        Util.warn(
          'Selector "' +
            sel +
            '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".'
        );
        Util.warn(
          'If you have a custom shape with such className, please change it to start with upper letter like "Triangle".'
        );
        Util.warn('Konva is awesome, right?');
      }
      // id selector
      if (sel.charAt(0) === '#') {
        if (this.id() === sel.slice(1)) {
          return true;
        }
      } else if (sel.charAt(0) === '.') {
        // name selector
        if (this.hasName(sel.slice(1))) {
          return true;
        }
      } else if (this.className === sel || this.nodeType === sel) {
        return true;
      }
    }
    return false;
  }
  /**
   * get layer ancestor
   * @method
   * @name Konva.Node#getLayer
   * @returns {Konva.Layer}
   */
  getLayer(): Layer | null {
    const parent = this.getParent();
    return parent ? parent.getLayer() : null;
  }
  /**
   * get stage ancestor
   * @method
   * @name Konva.Node#getStage
   * @returns {Konva.Stage}
   */
  getStage(): Stage | null {
    return this._getCache(STAGE, this._getStage);
  }

  _getStage() {
    const parent = this.getParent();
    if (parent) {
      return parent.getStage();
    } else {
      return null;
    }
  }
  /**
   * fire event
   * @method
   * @name Konva.Node#fire
   * @param {String} eventType event type.  can be a regular event, like click, mouseover, or mouseout, or it can be a custom event, like myCustomEvent
   * @param {Event} [evt] event object
   * @param {Boolean} [bubble] setting the value to false, or leaving it undefined, will result in the event
   *  not bubbling.  Setting the value to true will result in the event bubbling.
   * @returns {Konva.Node}
   * @example
   * // manually fire click event
   * node.fire('click');
   *
   * // fire custom event
   * node.fire('foo');
   *
   * // fire custom event with custom event object
   * node.fire('foo', {
   *   bar: 10
   * });
   *
   * // fire click event that bubbles
   * node.fire('click', null, true);
   */
  fire(eventType: string, evt: any = {}, bubble?: boolean) {
    evt.target = evt.target || this;
    // bubble
    if (bubble) {
      this._fireAndBubble(eventType, evt);
    } else {
      // no bubble
      this._fire(eventType, evt);
    }
    return this;
  }
  /**
   * get absolute transform of the node which takes into
   *  account its ancestor transforms
   * @method
   * @name Konva.Node#getAbsoluteTransform
   * @returns {Konva.Transform}
   */
  getAbsoluteTransform(top?: Node | null) {
    // if using an argument, we can't cache the result.
    if (top) {
      return this._getAbsoluteTransform(top);
    } else {
      // if no argument, we can cache the result
      return this._getCache(
        ABSOLUTE_TRANSFORM,
        this._getAbsoluteTransform
      ) as Transform;
    }
  }
  _getAbsoluteTransform(top?: Node) {
    let at: Transform;
    // we we need position relative to an ancestor, we will iterate for all
    if (top) {
      at = new Transform();
      // start with stage and traverse downwards to self
      this._eachAncestorReverse(function (node: Node) {
        const transformsEnabled = node.transformsEnabled();

        if (transformsEnabled === 'all') {
          at.multiply(node.getTransform());
        } else if (transformsEnabled === 'position') {
          at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
        }
      }, top);
      return at;
    } else {
      // try to use a cached value
      at = this._cache.get(ABSOLUTE_TRANSFORM) || new Transform();
      if (this.parent) {
        // transform will be cached
        this.parent.getAbsoluteTransform().copyInto(at);
      } else {
        at.reset();
      }
      const transformsEnabled = this.transformsEnabled();
      if (transformsEnabled === 'all') {
        at.multiply(this.getTransform());
      } else if (transformsEnabled === 'position') {
        // use "attrs" directly, because it is a bit faster
        const x = this.attrs.x || 0;
        const y = this.attrs.y || 0;
        const offsetX = this.attrs.offsetX || 0;
        const offsetY = this.attrs.offsetY || 0;

        at.translate(x - offsetX, y - offsetY);
      }
      at.dirty = false;
      return at;
    }
  }
  /**
   * get absolute scale of the node which takes into
   *  account its ancestor scales
   * @method
   * @name Konva.Node#getAbsoluteScale
   * @returns {Object}
   * @example
   * // get absolute scale x
   * var scaleX = node.getAbsoluteScale().x;
   */
  getAbsoluteScale(top?: Node) {
    // do not cache this calculations,
    // because it use cache transform
    // this is special logic for caching with some shapes with shadow
    let parent: Node | null = this;
    while (parent) {
      if (parent._isUnderCache) {
        top = parent;
      }
      parent = parent.getParent();
    }

    const transform = this.getAbsoluteTransform(top);
    const attrs = transform.decompose();

    return {
      x: attrs.scaleX,
      y: attrs.scaleY,
    };
  }
  /**
   * get absolute rotation of the node which takes into
   *  account its ancestor rotations
   * @method
   * @name Konva.Node#getAbsoluteRotation
   * @returns {Number}
   * @example
   * // get absolute rotation
   * var rotation = node.getAbsoluteRotation();
   */
  getAbsoluteRotation() {
    // var parent: Node = this;
    // var rotation = 0;

    // while (parent) {
    //   rotation += parent.rotation();
    //   parent = parent.getParent();
    // }
    // return rotation;
    return this.getAbsoluteTransform().decompose().rotation;
  }
  /**
   * get transform of the node
   * @method
   * @name Konva.Node#getTransform
   * @returns {Konva.Transform}
   */
  getTransform() {
    return this._getCache(TRANSFORM, this._getTransform) as Transform;
  }
  _getTransform(): Transform {
    const m: Transform = this._cache.get(TRANSFORM) || new Transform();
    m.reset();

    // I was trying to use attributes directly here
    // but it doesn't work for Transformer well
    // because it overwrite x,y getters
    const x = this.x(),
      y = this.y(),
      rotation = Konva.getAngle(this.rotation()),
      scaleX = this.attrs.scaleX ?? 1,
      scaleY = this.attrs.scaleY ?? 1,
      skewX = this.attrs.skewX || 0,
      skewY = this.attrs.skewY || 0,
      offsetX = this.attrs.offsetX || 0,
      offsetY = this.attrs.offsetY || 0;

    if (x !== 0 || y !== 0) {
      m.translate(x, y);
    }
    if (rotation !== 0) {
      m.rotate(rotation);
    }
    if (skewX !== 0 || skewY !== 0) {
      m.skew(skewX, skewY);
    }
    if (scaleX !== 1 || scaleY !== 1) {
      m.scale(scaleX, scaleY);
    }
    if (offsetX !== 0 || offsetY !== 0) {
      m.translate(-1 * offsetX, -1 * offsetY);
    }

    m.dirty = false;

    return m;
  }
  /**
   * clone node.  Returns a new Node instance with identical attributes.  You can also override
   *  the node properties with an object literal, enabling you to use an existing node as a template
   *  for another node
   * @method
   * @name Konva.Node#clone
   * @param {Object} obj override attrs
   * @returns {Konva.Node}
   * @example
   * // simple clone
   * var clone = node.clone();
   *
   * // clone a node and override the x position
   * var clone = rect.clone({
   *   x: 5
   * });
   */
  clone(obj?: any) {
    // instantiate new node
    let attrs = Util.cloneObject(this.attrs),
      key,
      allListeners,
      len,
      n,
      listener;
    // apply attr overrides
    for (key in obj) {
      attrs[key] = obj[key];
    }

    const node = new (<any>this.constructor)(attrs);
    // copy over listeners
    for (key in this.eventListeners) {
      allListeners = this.eventListeners[key];
      len = allListeners.length;
      for (n = 0; n < len; n++) {
        listener = allListeners[n];
        /*
         * don't include konva namespaced listeners because
         *  these are generated by the constructors
         */
        if (listener.name.indexOf(KONVA) < 0) {
          // if listeners array doesn't exist, then create it
          if (!node.eventListeners[key]) {
            node.eventListeners[key] = [];
          }
          node.eventListeners[key].push(listener);
        }
      }
    }
    return node;
  }
  _toKonvaCanvas(config) {
    config = config || {};

    const box = this.getClientRect();

    const stage = this.getStage(),
      x = config.x !== undefined ? config.x : Math.floor(box.x),
      y = config.y !== undefined ? config.y : Math.floor(box.y),
      pixelRatio = config.pixelRatio || 1,
      canvas = new SceneCanvas({
        width:
          config.width || Math.ceil(box.width) || (stage ? stage.width() : 0),
        height:
          config.height ||
          Math.ceil(box.height) ||
          (stage ? stage.height() : 0),
        pixelRatio: pixelRatio,
      }),
      context = canvas.getContext();

    const bufferCanvas = new SceneCanvas({
      // width and height already multiplied by pixelRatio
      // so we need to revert that
      // also increase size by x nd y offset to make sure content fits canvas
      width: canvas.width / canvas.pixelRatio + Math.abs(x),
      height: canvas.height / canvas.pixelRatio + Math.abs(y),
      pixelRatio: canvas.pixelRatio,
    });

    if (config.imageSmoothingEnabled === false) {
      context._context.imageSmoothingEnabled = false;
    }
    context.save();

    if (x || y) {
      context.translate(-1 * x, -1 * y);
    }

    this.drawScene(canvas, undefined, bufferCanvas);
    context.restore();

    return canvas;
  }
  /**
   * converts node into an canvas element.
   * @method
   * @name Konva.Node#toCanvas
   * @param {Object} config
   * @param {Function} config.callback function executed when the composite has completed
   * @param {Number} [config.x] x position of canvas section
   * @param {Number} [config.y] y position of canvas section
   * @param {Number} [config.width] width of canvas section
   * @param {Number} [config.height] height of canvas section
   * @param {Number} [config.pixelRatio] pixelRatio of output canvas. Default is 1.
   * You can use that property to increase quality of the image, for example for super hight quality exports
   * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
   * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
   * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
   * @example
   * var canvas = node.toCanvas();
   */
  toCanvas(config?) {
    return this._toKonvaCanvas(config)._canvas;
  }
  /**
   * Creates a composite data URL (base64 string). If MIME type is not
   * specified, then "image/png" will result. For "image/jpeg", specify a quality
   * level as quality (range 0.0 - 1.0)
   * @method
   * @name Konva.Node#toDataURL
   * @param {Object} config
   * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
   *  "image/png" is the default
   * @param {Number} [config.x] x position of canvas section
   * @param {Number} [config.y] y position of canvas section
   * @param {Number} [config.width] width of canvas section
   * @param {Number} [config.height] height of canvas section
   * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
   *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
   *  is very high quality
   * @param {Number} [config.pixelRatio] pixelRatio of output image url. Default is 1.
   * You can use that property to increase quality of the image, for example for super hight quality exports
   * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
   * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
   * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
   * @returns {String}
   */
  toDataURL(config?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pixelRatio?: number;
    mimeType?: string;
    quality?: number;
    callback?: (str: string) => void;
  }) {
    config = config || {};
    const mimeType = config.mimeType || null,
      quality = config.quality || null;
    const url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
    if (config.callback) {
      config.callback(url);
    }
    return url;
  }
  /**
   * converts node into an image.  Since the toImage
   *  method is asynchronous, the resulting image can only be retrieved from the config callback
   *  or the returned Promise.  toImage is most commonly used
   *  to cache complex drawings as an image so that they don't have to constantly be redrawn
   * @method
   * @name Konva.Node#toImage
   * @param {Object} config
   * @param {Function} [config.callback] function executed when the composite has completed
   * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
   *  "image/png" is the default
   * @param {Number} [config.x] x position of canvas section
   * @param {Number} [config.y] y position of canvas section
   * @param {Number} [config.width] width of canvas section
   * @param {Number} [config.height] height of canvas section
   * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
   *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
   *  is very high quality
   * @param {Number} [config.pixelRatio] pixelRatio of output image. Default is 1.
   * You can use that property to increase quality of the image, for example for super hight quality exports
   * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
   * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
   * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
   * @return {Promise<Image>}
   * @example
   * var image = node.toImage({
   *   callback(img) {
   *     // do stuff with img
   *   }
   * });
   */
  toImage(config?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pixelRatio?: number;
    mimeType?: string;
    quality?: number;
    callback?: (img: HTMLImageElement) => void;
  }) {
    return new Promise((resolve, reject) => {
      try {
        const callback = config?.callback;
        if (callback) delete config.callback;
        Util._urlToImage(this.toDataURL(config as any), function (img) {
          resolve(img);
          callback?.(img);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
   * Converts node into a blob.  Since the toBlob method is asynchronous,
   *  the resulting blob can only be retrieved from the config callback
   *  or the returned Promise.
   * @method
   * @name Konva.Node#toBlob
   * @param {Object} config
   * @param {Function} [config.callback] function executed when the composite has completed
   * @param {Number} [config.x] x position of canvas section
   * @param {Number} [config.y] y position of canvas section
   * @param {Number} [config.width] width of canvas section
   * @param {Number} [config.height] height of canvas section
   * @param {Number} [config.pixelRatio] pixelRatio of output canvas. Default is 1.
   * You can use that property to increase quality of the image, for example for super hight quality exports
   * or usage on retina (or similar) displays. pixelRatio will be used to multiply the size of exported image.
   * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
   * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
   * @example
   * var blob = await node.toBlob({});
   * @returns {Promise<Blob>}
   */
  toBlob(config?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pixelRatio?: number;
    mimeType?: string;
    quality?: number;
    callback?: (blob: Blob | null) => void;
  }) {
    return new Promise((resolve, reject) => {
      try {
        const callback = config?.callback;
        if (callback) delete config.callback;
        this.toCanvas(config).toBlob(
          (blob) => {
            resolve(blob);
            callback?.(blob);
          },
          config?.mimeType,
          config?.quality
        );
      } catch (err) {
        reject(err);
      }
    });
  }
  setSize(size) {
    this.width(size.width);
    this.height(size.height);
    return this;
  }
  getSize() {
    return {
      width: this.width(),
      height: this.height(),
    };
  }
  /**
   * get class name, which may return Stage, Layer, Group, or shape class names like Rect, Circle, Text, etc.
   * @method
   * @name Konva.Node#getClassName
   * @returns {String}
   */
  getClassName() {
    return this.className || this.nodeType;
  }
  /**
   * get the node type, which may return Stage, Layer, Group, or Shape
   * @method
   * @name Konva.Node#getType
   * @returns {String}
   */
  getType() {
    return this.nodeType;
  }
  getDragDistance(): number {
    // compare with undefined because we need to track 0 value
    if (this.attrs.dragDistance !== undefined) {
      return this.attrs.dragDistance;
    } else if (this.parent) {
      return this.parent.getDragDistance();
    } else {
      return Konva.dragDistance;
    }
  }
  _off(type, name?, callback?) {
    let evtListeners = this.eventListeners[type],
      i,
      evtName,
      handler;

    for (i = 0; i < evtListeners.length; i++) {
      evtName = evtListeners[i].name;
      handler = evtListeners[i].handler;

      // the following two conditions must be true in order to remove a handler:
      // 1) the current event name cannot be konva unless the event name is konva
      //    this enables developers to force remove a konva specific listener for whatever reason
      // 2) an event name is not specified, or if one is specified, it matches the current event name
      if (
        (evtName !== 'konva' || name === 'konva') &&
        (!name || evtName === name) &&
        (!callback || callback === handler)
      ) {
        evtListeners.splice(i, 1);
        if (evtListeners.length === 0) {
          delete this.eventListeners[type];
          break;
        }
        i--;
      }
    }
  }
  _fireChangeEvent(attr, oldVal, newVal) {
    this._fire(attr + CHANGE, {
      oldVal: oldVal,
      newVal: newVal,
    });
  }
  /**
   * add name to node
   * @method
   * @name Konva.Node#addName
   * @param {String} name
   * @returns {Konva.Node}
   * @example
   * node.name('red');
   * node.addName('selected');
   * node.name(); // return 'red selected'
   */
  addName(name) {
    if (!this.hasName(name)) {
      const oldName = this.name();
      const newName = oldName ? oldName + ' ' + name : name;
      this.name(newName);
    }
    return this;
  }
  /**
   * check is node has name
   * @method
   * @name Konva.Node#hasName
   * @param {String} name
   * @returns {Boolean}
   * @example
   * node.name('red');
   * node.hasName('red');   // return true
   * node.hasName('selected'); // return false
   * node.hasName(''); // return false
   */
  hasName(name) {
    if (!name) {
      return false;
    }
    const fullName = this.name();
    if (!fullName) {
      return false;
    }
    // if name is '' the "names" will be [''], so I added extra check above
    const names = (fullName || '').split(/\s/g);
    return names.indexOf(name) !== -1;
  }
  /**
   * remove name from node
   * @method
   * @name Konva.Node#removeName
   * @param {String} name
   * @returns {Konva.Node}
   * @example
   * node.name('red selected');
   * node.removeName('selected');
   * node.hasName('selected'); // return false
   * node.name(); // return 'red'
   */
  removeName(name) {
    const names = (this.name() || '').split(/\s/g);
    const index = names.indexOf(name);
    if (index !== -1) {
      names.splice(index, 1);
      this.name(names.join(' '));
    }
    return this;
  }
  /**
   * set attr
   * @method
   * @name Konva.Node#setAttr
   * @param {String} attr
   * @param {*} val
   * @returns {Konva.Node}
   * @example
   * node.setAttr('x', 5);
   */
  setAttr(attr, val) {
    const func = this[SET + Util._capitalize(attr)];

    if (Util._isFunction(func)) {
      func.call(this, val);
    } else {
      // otherwise set directly
      this._setAttr(attr, val);
    }
    return this;
  }
  _requestDraw() {
    if (Konva.autoDrawEnabled) {
      const drawNode = this.getLayer() || this.getStage();
      drawNode?.batchDraw();
    }
  }
  _setAttr(key, val) {
    const oldVal = this.attrs[key];
    if (oldVal === val && !Util.isObject(val)) {
      return;
    }
    if (val === undefined || val === null) {
      delete this.attrs[key];
    } else {
      this.attrs[key] = val;
    }
    if (this._shouldFireChangeEvents) {
      this._fireChangeEvent(key, oldVal, val);
    }
    this._requestDraw();
  }
  _setComponentAttr(key, component, val) {
    let oldVal;
    if (val !== undefined) {
      oldVal = this.attrs[key];

      if (!oldVal) {
        // set value to default value using getAttr
        this.attrs[key] = this.getAttr(key);
      }

      this.attrs[key][component] = val;
      this._fireChangeEvent(key, oldVal, val);
    }
  }
  _fireAndBubble(eventType, evt, compareShape?) {
    if (evt && this.nodeType === SHAPE) {
      evt.target = this;
    }

    const shouldStop =
      (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
      ((compareShape &&
        (this === compareShape ||
          (this.isAncestorOf && this.isAncestorOf(compareShape)))) ||
        (this.nodeType === 'Stage' && !compareShape));

    if (!shouldStop) {
      this._fire(eventType, evt);

      // simulate event bubbling
      const stopBubble =
        (eventType === MOUSEENTER || eventType === MOUSELEAVE) &&
        compareShape &&
        compareShape.isAncestorOf &&
        compareShape.isAncestorOf(this) &&
        !compareShape.isAncestorOf(this.parent);
      if (
        ((evt && !evt.cancelBubble) || !evt) &&
        this.parent &&
        this.parent.isListening() &&
        !stopBubble
      ) {
        if (compareShape && compareShape.parent) {
          this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
        } else {
          this._fireAndBubble.call(this.parent, eventType, evt);
        }
      }
    }
  }

  _getProtoListeners(eventType) {
    const allListeners = this._cache.get(ALL_LISTENERS) ?? {};
    let events = allListeners?.[eventType];
    if (events === undefined) {
      //recalculate cache
      events = [];
      let obj = Object.getPrototypeOf(this);
      while (obj) {
        const hierarchyEvents = obj.eventListeners?.[eventType] ?? [];
        events.push(...hierarchyEvents);
        obj = Object.getPrototypeOf(obj);
      }
      // update cache
      allListeners[eventType] = events;
      this._cache.set(ALL_LISTENERS, allListeners);
    }

    return events;
  }
  _fire(eventType, evt) {
    evt = evt || {};
    evt.currentTarget = this;
    evt.type = eventType;

    const topListeners = this._getProtoListeners(eventType);
    if (topListeners) {
      for (var i = 0; i < topListeners.length; i++) {
        topListeners[i].handler.call(this, evt);
      }
    }

    // it is important to iterate over self listeners without cache
    // because events can be added/removed while firing
    const selfListeners = this.eventListeners[eventType];
    if (selfListeners) {
      for (var i = 0; i < selfListeners.length; i++) {
        selfListeners[i].handler.call(this, evt);
      }
    }
  }
  /**
   * draw both scene and hit graphs.  If the node being drawn is the stage, all of the layers will be cleared and redrawn
   * @method
   * @name Konva.Node#draw
   * @returns {Konva.Node}
   */
  draw() {
    this.drawScene();
    this.drawHit();
    return this;
  }

  // drag & drop
  _createDragElement(evt) {
    const pointerId = evt ? evt.pointerId : undefined;
    const stage = this.getStage();
    const ap = this.getAbsolutePosition();
    if (!stage) {
      return;
    }
    const pos =
      stage._getPointerById(pointerId) ||
      stage._changedPointerPositions[0] ||
      ap;
    DD._dragElements.set(this._id, {
      node: this,
      startPointerPos: pos,
      offset: {
        x: pos.x - ap.x,
        y: pos.y - ap.y,
      },
      dragStatus: 'ready',
      pointerId,
    });
  }

  /**
   * initiate drag and drop.
   * @method
   * @name Konva.Node#startDrag
   */
  startDrag(evt?: any, bubbleEvent = true) {
    if (!DD._dragElements.has(this._id)) {
      this._createDragElement(evt);
    }

    const elem = DD._dragElements.get(this._id)!;
    elem.dragStatus = 'dragging';
    this.fire(
      'dragstart',
      {
        type: 'dragstart',
        target: this,
        evt: evt && evt.evt,
      },
      bubbleEvent
    );
  }

  _setDragPosition(evt, elem) {
    // const pointers = this.getStage().getPointersPositions();
    // const pos = pointers.find(p => p.id === this._dragEventId);
    const pos = this.getStage()!._getPointerById(elem.pointerId);

    if (!pos) {
      return;
    }
    let newNodePos = {
      x: pos.x - elem.offset.x,
      y: pos.y - elem.offset.y,
    };

    const dbf = this.dragBoundFunc();
    if (dbf !== undefined) {
      const bounded = dbf.call(this, newNodePos, evt);
      if (!bounded) {
        Util.warn(
          'dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.'
        );
      } else {
        newNodePos = bounded;
      }
    }

    if (
      !this._lastPos ||
      this._lastPos.x !== newNodePos.x ||
      this._lastPos.y !== newNodePos.y
    ) {
      this.setAbsolutePosition(newNodePos);
      this._requestDraw();
    }

    this._lastPos = newNodePos;
  }

  /**
   * stop drag and drop
   * @method
   * @name Konva.Node#stopDrag
   */
  stopDrag(evt?) {
    const elem = DD._dragElements.get(this._id);
    if (elem) {
      elem.dragStatus = 'stopped';
    }
    DD._endDragBefore(evt);
    DD._endDragAfter(evt);
  }

  setDraggable(draggable) {
    this._setAttr('draggable', draggable);
    this._dragChange();
  }

  /**
   * determine if node is currently in drag and drop mode
   * @method
   * @name Konva.Node#isDragging
   */
  isDragging() {
    const elem = DD._dragElements.get(this._id);
    return elem ? elem.dragStatus === 'dragging' : false;
  }

  _listenDrag() {
    this._dragCleanup();

    this.on('mousedown.konva touchstart.konva', function (evt) {
      const shouldCheckButton = evt.evt['button'] !== undefined;
      const canDrag =
        !shouldCheckButton || Konva.dragButtons.indexOf(evt.evt['button']) >= 0;
      if (!canDrag) {
        return;
      }
      if (this.isDragging()) {
        return;
      }

      let hasDraggingChild = false;
      DD._dragElements.forEach((elem) => {
        if (this.isAncestorOf(elem.node)) {
          hasDraggingChild = true;
        }
      });
      // nested drag can be started
      // in that case we don't need to start new drag
      if (!hasDraggingChild) {
        this._createDragElement(evt);
      }
    });
  }

  _dragChange() {
    if (this.attrs.draggable) {
      this._listenDrag();
    } else {
      // remove event listeners
      this._dragCleanup();

      /*
       * force drag and drop to end
       * if this node is currently in
       * drag and drop mode
       */
      const stage = this.getStage();
      if (!stage) {
        return;
      }
      const dragElement = DD._dragElements.get(this._id);
      const isDragging = dragElement && dragElement.dragStatus === 'dragging';
      const isReady = dragElement && dragElement.dragStatus === 'ready';

      if (isDragging) {
        this.stopDrag();
      } else if (isReady) {
        DD._dragElements.delete(this._id);
      }
    }
  }

  _dragCleanup() {
    this.off('mousedown.konva');
    this.off('touchstart.konva');
  }

  /**
   * determine if node (at least partially) is currently in user-visible area
   * @method
   * @param {(Number | Object)} margin optional margin in pixels
   * @param {Number} margin.x
   * @param {Number} margin.y
   * @returns {Boolean}
   * @name Konva.Node#isClientRectOnScreen
   * @example
   * // get index
   * // default calculations
   * var isOnScreen = node.isClientRectOnScreen()
   * // increase object size (or screen size) for cases when objects close to the screen still need to be marked as "visible"
   * var isOnScreen = node.isClientRectOnScreen({ x: stage.width(), y: stage.height() })
   */
  isClientRectOnScreen(
    margin: { x: number; y: number } = { x: 0, y: 0 }
  ): boolean {
    const stage = this.getStage();
    if (!stage) {
      return false;
    }
    const screenRect = {
      x: -margin.x,
      y: -margin.y,
      width: stage.width() + 2 * margin.x,
      height: stage.height() + 2 * margin.y,
    };
    return Util.haveIntersection(screenRect, this.getClientRect());
  }

  // @ts-ignore:
  preventDefault: GetSet<boolean, this>;

  // from filters
  blue: GetSet<number, this>;
  brightness: GetSet<number, this>;
  contrast: GetSet<number, this>;
  blurRadius: GetSet<number, this>;
  luminance: GetSet<number, this>;
  green: GetSet<number, this>;
  alpha: GetSet<number, this>;
  hue: GetSet<number, this>;
  kaleidoscopeAngle: GetSet<number, this>;
  kaleidoscopePower: GetSet<number, this>;
  levels: GetSet<number, this>;
  noise: GetSet<number, this>;
  pixelSize: GetSet<number, this>;
  red: GetSet<number, this>;
  saturation: GetSet<number, this>;
  threshold: GetSet<number, this>;
  value: GetSet<number, this>;

  dragBoundFunc: GetSet<
    (this: Node, pos: Vector2d, event: any) => Vector2d,
    this
  >;
  draggable: GetSet<boolean, this>;
  dragDistance: GetSet<number, this>;
  embossBlend: GetSet<boolean, this>;
  embossDirection: GetSet<string, this>;
  embossStrength: GetSet<number, this>;
  embossWhiteLevel: GetSet<number, this>;
  enhance: GetSet<number, this>;
  filters: GetSet<Filter[], this>;
  position: GetSet<Vector2d, this>;
  absolutePosition: GetSet<Vector2d, this>;
  size: GetSet<{ width: number; height: number }, this>;

  id: GetSet<string, this>;

  listening: GetSet<boolean, this>;
  name: GetSet<string, this>;
  offset: GetSet<Vector2d, this>;
  offsetX: GetSet<number, this>;
  offsetY: GetSet<number, this>;
  opacity: GetSet<number, this>;

  rotation: GetSet<number, this>;
  zIndex: GetSet<number, this>;

  scale: GetSet<Vector2d | undefined, this>;
  scaleX: GetSet<number, this>;
  scaleY: GetSet<number, this>;
  skew: GetSet<Vector2d, this>;
  skewX: GetSet<number, this>;
  skewY: GetSet<number, this>;

  to: (params: AnimTo) => void;

  transformsEnabled: GetSet<string, this>;

  visible: GetSet<boolean, this>;
  width: GetSet<number, this>;
  height: GetSet<number, this>;

  x: GetSet<number, this>;
  y: GetSet<number, this>;
  globalCompositeOperation: GetSet<globalCompositeOperationType, this>;

  /**
   * create node with JSON string or an Object.  De-serializtion does not generate custom
   *  shape drawing functions, images, or event handlers (this would make the
   *  serialized object huge).  If your app uses custom shapes, images, and
   *  event handlers (it probably does), then you need to select the appropriate
   *  shapes after loading the stage and set these properties via on(), setSceneFunc(),
   *  and setImage() methods
   * @method
   * @memberof Konva.Node
   * @param {String|Object} json string or object
   * @param {Element} [container] optional container dom element used only if you're
   *  creating a stage node
   */
  static create(data, container?) {
    if (Util._isString(data)) {
      data = JSON.parse(data);
    }
    return this._createNode(data, container);
  }

  static _createNode(obj, container?) {
    let className = Node.prototype.getClassName.call(obj),
      children = obj.children,
      no,
      len,
      n;

    // if container was passed in, add it to attrs
    if (container) {
      obj.attrs.container = container;
    }

    if (!Konva[className]) {
      Util.warn(
        'Can not find a node with class name "' +
          className +
          '". Fallback to "Shape".'
      );
      className = 'Shape';
    }

    const Class = Konva[className];

    no = new Class(obj.attrs);
    if (children) {
      len = children.length;
      for (n = 0; n < len; n++) {
        no.add(Node._createNode(children[n]));
      }
    }

    return no;
  }
}

interface AnimTo extends NodeConfig {
  onFinish?: Function;
  onUpdate?: Function;
  duration?: number;
}

Node.prototype.nodeType = 'Node';
Node.prototype._attrsAffectingSize = [];

// attache events listeners once into prototype
// that way we don't spend too much time on making an new instance
Node.prototype.eventListeners = {};
Node.prototype.on.call(Node.prototype, TRANSFORM_CHANGE_STR, function () {
  if (this._batchingTransformChange) {
    this._needClearTransformCache = true;
    return;
  }
  this._clearCache(TRANSFORM);
  this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
});

Node.prototype.on.call(Node.prototype, 'visibleChange.konva', function () {
  this._clearSelfAndDescendantCache(VISIBLE);
});
Node.prototype.on.call(Node.prototype, 'listeningChange.konva', function () {
  this._clearSelfAndDescendantCache(LISTENING);
});
Node.prototype.on.call(Node.prototype, 'opacityChange.konva', function () {
  this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
});

const addGetterSetter = Factory.addGetterSetter;

/**
 * get/set zIndex relative to the node's siblings who share the same parent.
 * Please remember that zIndex is not absolute (like in CSS). It is relative to parent element only.
 * @name Konva.Node#zIndex
 * @method
 * @param {Number} index
 * @returns {Number}
 * @example
 * // get index
 * var index = node.zIndex();
 *
 * // set index
 * node.zIndex(2);
 */
addGetterSetter(Node, 'zIndex');

/**
 * get/set node absolute position
 * @name Konva.Node#absolutePosition
 * @method
 * @param {Object} pos
 * @param {Number} pos.x
 * @param {Number} pos.y
 * @returns {Object}
 * @example
 * // get position
 * var position = node.absolutePosition();
 *
 * // set position
 * node.absolutePosition({
 *   x: 5,
 *   y: 10
 * });
 */
addGetterSetter(Node, 'absolutePosition');

addGetterSetter(Node, 'position');
/**
 * get/set node position relative to parent
 * @name Konva.Node#position
 * @method
 * @param {Object} pos
 * @param {Number} pos.x
 * @param {Number} pos.y
 * @returns {Object}
 * @example
 * // get position
 * var position = node.position();
 *
 * // set position
 * node.position({
 *   x: 5,
 *   y: 10
 * });
 */

addGetterSetter(Node, 'x', 0, getNumberValidator());

/**
 * get/set x position
 * @name Konva.Node#x
 * @method
 * @param {Number} x
 * @returns {Object}
 * @example
 * // get x
 * var x = node.x();
 *
 * // set x
 * node.x(5);
 */

addGetterSetter(Node, 'y', 0, getNumberValidator());

/**
 * get/set y position
 * @name Konva.Node#y
 * @method
 * @param {Number} y
 * @returns {Integer}
 * @example
 * // get y
 * var y = node.y();
 *
 * // set y
 * node.y(5);
 */

addGetterSetter(
  Node,
  'globalCompositeOperation',
  'source-over',
  getStringValidator()
);

/**
 * get/set globalCompositeOperation of a node. globalCompositeOperation DOESN'T affect hit graph of nodes. So they are still trigger to events as they have default "source-over" globalCompositeOperation.
 * @name Konva.Node#globalCompositeOperation
 * @method
 * @param {String} type
 * @returns {String}
 * @example
 * // get globalCompositeOperation
 * var globalCompositeOperation = shape.globalCompositeOperation();
 *
 * // set globalCompositeOperation
 * shape.globalCompositeOperation('source-in');
 */
addGetterSetter(Node, 'opacity', 1, getNumberValidator());

/**
 * get/set opacity.  Opacity values range from 0 to 1.
 *  A node with an opacity of 0 is fully transparent, and a node
 *  with an opacity of 1 is fully opaque
 * @name Konva.Node#opacity
 * @method
 * @param {Object} opacity
 * @returns {Number}
 * @example
 * // get opacity
 * var opacity = node.opacity();
 *
 * // set opacity
 * node.opacity(0.5);
 */

addGetterSetter(Node, 'name', '', getStringValidator());

/**
 * get/set name.
 * @name Konva.Node#name
 * @method
 * @param {String} name
 * @returns {String}
 * @example
 * // get name
 * var name = node.name();
 *
 * // set name
 * node.name('foo');
 *
 * // also node may have multiple names (as css classes)
 * node.name('foo bar');
 */

addGetterSetter(Node, 'id', '', getStringValidator());

/**
 * get/set id. Id is global for whole page.
 * @name Konva.Node#id
 * @method
 * @param {String} id
 * @returns {String}
 * @example
 * // get id
 * var name = node.id();
 *
 * // set id
 * node.id('foo');
 */

addGetterSetter(Node, 'rotation', 0, getNumberValidator());

/**
 * get/set rotation in degrees
 * @name Konva.Node#rotation
 * @method
 * @param {Number} rotation
 * @returns {Number}
 * @example
 * // get rotation in degrees
 * var rotation = node.rotation();
 *
 * // set rotation in degrees
 * node.rotation(45);
 */

Factory.addComponentsGetterSetter(Node, 'scale', ['x', 'y']);

/**
 * get/set scale
 * @name Konva.Node#scale
 * @param {Object} scale
 * @param {Number} scale.x
 * @param {Number} scale.y
 * @method
 * @returns {Object}
 * @example
 * // get scale
 * var scale = node.scale();
 *
 * // set scale
 * shape.scale({
 *   x: 2,
 *   y: 3
 * });
 */

addGetterSetter(Node, 'scaleX', 1, getNumberValidator());

/**
 * get/set scale x
 * @name Konva.Node#scaleX
 * @param {Number} x
 * @method
 * @returns {Number}
 * @example
 * // get scale x
 * var scaleX = node.scaleX();
 *
 * // set scale x
 * node.scaleX(2);
 */

addGetterSetter(Node, 'scaleY', 1, getNumberValidator());

/**
 * get/set scale y
 * @name Konva.Node#scaleY
 * @param {Number} y
 * @method
 * @returns {Number}
 * @example
 * // get scale y
 * var scaleY = node.scaleY();
 *
 * // set scale y
 * node.scaleY(2);
 */

Factory.addComponentsGetterSetter(Node, 'skew', ['x', 'y']);

/**
 * get/set skew
 * @name Konva.Node#skew
 * @param {Object} skew
 * @param {Number} skew.x
 * @param {Number} skew.y
 * @method
 * @returns {Object}
 * @example
 * // get skew
 * var skew = node.skew();
 *
 * // set skew
 * node.skew({
 *   x: 20,
 *   y: 10
 * });
 */

addGetterSetter(Node, 'skewX', 0, getNumberValidator());

/**
 * get/set skew x
 * @name Konva.Node#skewX
 * @param {Number} x
 * @method
 * @returns {Number}
 * @example
 * // get skew x
 * var skewX = node.skewX();
 *
 * // set skew x
 * node.skewX(3);
 */

addGetterSetter(Node, 'skewY', 0, getNumberValidator());

/**
 * get/set skew y
 * @name Konva.Node#skewY
 * @param {Number} y
 * @method
 * @returns {Number}
 * @example
 * // get skew y
 * var skewY = node.skewY();
 *
 * // set skew y
 * node.skewY(3);
 */

Factory.addComponentsGetterSetter(Node, 'offset', ['x', 'y']);

/**
 * get/set offset.  Offsets the default position and rotation point
 * @method
 * @param {Object} offset
 * @param {Number} offset.x
 * @param {Number} offset.y
 * @returns {Object}
 * @example
 * // get offset
 * var offset = node.offset();
 *
 * // set offset
 * node.offset({
 *   x: 20,
 *   y: 10
 * });
 */

addGetterSetter(Node, 'offsetX', 0, getNumberValidator());

/**
 * get/set offset x
 * @name Konva.Node#offsetX
 * @method
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get offset x
 * var offsetX = node.offsetX();
 *
 * // set offset x
 * node.offsetX(3);
 */

addGetterSetter(Node, 'offsetY', 0, getNumberValidator());

/**
 * get/set offset y
 * @name Konva.Node#offsetY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get offset y
 * var offsetY = node.offsetY();
 *
 * // set offset y
 * node.offsetY(3);
 */

addGetterSetter(Node, 'dragDistance', null, getNumberValidator());

/**
 * get/set drag distance
 * @name Konva.Node#dragDistance
 * @method
 * @param {Number} distance
 * @returns {Number}
 * @example
 * // get drag distance
 * var dragDistance = node.dragDistance();
 *
 * // set distance
 * // node starts dragging only if pointer moved more then 3 pixels
 * node.dragDistance(3);
 * // or set globally
 * Konva.dragDistance = 3;
 */

addGetterSetter(Node, 'width', 0, getNumberValidator());
/**
 * get/set width
 * @name Konva.Node#width
 * @method
 * @param {Number} width
 * @returns {Number}
 * @example
 * // get width
 * var width = node.width();
 *
 * // set width
 * node.width(100);
 */

addGetterSetter(Node, 'height', 0, getNumberValidator());
/**
 * get/set height
 * @name Konva.Node#height
 * @method
 * @param {Number} height
 * @returns {Number}
 * @example
 * // get height
 * var height = node.height();
 *
 * // set height
 * node.height(100);
 */

addGetterSetter(Node, 'listening', true, getBooleanValidator());
/**
 * get/set listening attr.  If you need to determine if a node is listening or not
 *   by taking into account its parents, use the isListening() method
 *   nodes with listening set to false will not be detected in hit graph
 *   so they will be ignored in container.getIntersection() method
 * @name Konva.Node#listening
 * @method
 * @param {Boolean} listening Can be true, or false.  The default is true.
 * @returns {Boolean}
 * @example
 * // get listening attr
 * var listening = node.listening();
 *
 * // stop listening for events, remove node and all its children from hit graph
 * node.listening(false);
 *
 * // listen to events according to the parent
 * node.listening(true);
 */

/**
 * get/set preventDefault
 * By default all shapes will prevent default behavior
 * of a browser on a pointer move or tap.
 * that will prevent native scrolling when you are trying to drag&drop a node
 * but sometimes you may need to enable default actions
 * in that case you can set the property to false
 * @name Konva.Node#preventDefault
 * @method
 * @param {Boolean} preventDefault
 * @returns {Boolean}
 * @example
 * // get preventDefault
 * var shouldPrevent = shape.preventDefault();
 *
 * // set preventDefault
 * shape.preventDefault(false);
 */

addGetterSetter(Node, 'preventDefault', true, getBooleanValidator());

addGetterSetter(Node, 'filters', null, function (this: Node, val) {
  this._filterUpToDate = false;
  return val;
});
/**
 * get/set filters.  Filters are applied to cached canvases
 * @name Konva.Node#filters
 * @method
 * @param {Array} filters array of filters
 * @returns {Array}
 * @example
 * // get filters
 * var filters = node.filters();
 *
 * // set a single filter
 * node.cache();
 * node.filters([Konva.Filters.Blur]);
 *
 * // set multiple filters
 * node.cache();
 * node.filters([
 *   Konva.Filters.Blur,
 *   Konva.Filters.Sepia,
 *   Konva.Filters.Invert
 * ]);
 */

addGetterSetter(Node, 'visible', true, getBooleanValidator());
/**
 * get/set visible attr.  Can be true, or false.  The default is true.
 *   If you need to determine if a node is visible or not
 *   by taking into account its parents, use the isVisible() method
 * @name Konva.Node#visible
 * @method
 * @param {Boolean} visible
 * @returns {Boolean}
 * @example
 * // get visible attr
 * var visible = node.visible();
 *
 * // make invisible
 * node.visible(false);
 *
 * // make visible (according to the parent)
 * node.visible(true);
 *
 */

addGetterSetter(Node, 'transformsEnabled', 'all', getStringValidator());

/**
 * get/set transforms that are enabled.  Can be "all", "none", or "position".  The default
 *  is "all"
 * @name Konva.Node#transformsEnabled
 * @method
 * @param {String} enabled
 * @returns {String}
 * @example
 * // enable position transform only to improve draw performance
 * node.transformsEnabled('position');
 *
 * // enable all transforms
 * node.transformsEnabled('all');
 */

/**
 * get/set node size
 * @name Konva.Node#size
 * @method
 * @param {Object} size
 * @param {Number} size.width
 * @param {Number} size.height
 * @returns {Object}
 * @example
 * // get node size
 * var size = node.size();
 * var width = size.width;
 * var height = size.height;
 *
 * // set size
 * node.size({
 *   width: 100,
 *   height: 200
 * });
 */
addGetterSetter(Node, 'size');

/**
 * get/set drag bound function.  This is used to override the default
 *  drag and drop position.
 * @name Konva.Node#dragBoundFunc
 * @method
 * @param {Function} dragBoundFunc
 * @returns {Function}
 * @example
 * // get drag bound function
 * var dragBoundFunc = node.dragBoundFunc();
 *
 * // create vertical drag and drop
 * node.dragBoundFunc(function(pos){
 *   // important pos - is absolute position of the node
 *   // you should return absolute position too
 *   return {
 *     x: this.absolutePosition().x,
 *     y: pos.y
 *   };
 * });
 */
addGetterSetter(Node, 'dragBoundFunc');

/**
 * get/set draggable flag
 * @name Konva.Node#draggable
 * @method
 * @param {Boolean} draggable
 * @returns {Boolean}
 * @example
 * // get draggable flag
 * var draggable = node.draggable();
 *
 * // enable drag and drop
 * node.draggable(true);
 *
 * // disable drag and drop
 * node.draggable(false);
 */
addGetterSetter(Node, 'draggable', false, getBooleanValidator());

Factory.backCompat(Node, {
  rotateDeg: 'rotate',
  setRotationDeg: 'setRotation',
  getRotationDeg: 'getRotation',
});
