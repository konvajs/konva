import { Util } from './Util.ts';
import { Factory } from './Factory.ts';
import type { ContainerConfig } from './Container.ts';
import { Container } from './Container.ts';
import { Konva } from './Global.ts';
import { SceneCanvas, HitCanvas } from './Canvas.ts';
import type { GetSet, Vector2d } from './types.ts';
import type { Shape } from './Shape.ts';
import type { Layer } from './Layer.ts';
import { DD } from './DragAndDrop.ts';
import { _registerNode } from './Global.ts';
import * as PointerEvents from './PointerEvents.ts';

export interface StageConfig extends ContainerConfig {
  container?: HTMLDivElement | string;
  eventBatchFunc?: (callback: () => void) => void;
}

// CONSTANTS
const STAGE = 'Stage',
  STRING = 'string',
  PX = 'px',
  MOUSEOUT = 'mouseout',
  MOUSELEAVE = 'mouseleave',
  MOUSEOVER = 'mouseover',
  MOUSEENTER = 'mouseenter',
  MOUSEMOVE = 'mousemove',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'mouseup',
  POINTERMOVE = 'pointermove',
  POINTERDOWN = 'pointerdown',
  POINTERUP = 'pointerup',
  POINTERCANCEL = 'pointercancel',
  LOSTPOINTERCAPTURE = 'lostpointercapture',
  POINTEROUT = 'pointerout',
  POINTERLEAVE = 'pointerleave',
  POINTEROVER = 'pointerover',
  POINTERENTER = 'pointerenter',
  CONTEXTMENU = 'contextmenu',
  TOUCHSTART = 'touchstart',
  TOUCHEND = 'touchend',
  TOUCHMOVE = 'touchmove',
  TOUCHCANCEL = 'touchcancel',
  WHEEL = 'wheel',
  MAX_LAYERS_NUMBER = 5,
  EVENTS = [
    [MOUSEENTER, '_pointerenter'],
    [MOUSEDOWN, '_pointerdown'],
    [MOUSEMOVE, '_pointermove'],
    [MOUSEUP, '_pointerup'],
    [MOUSELEAVE, '_pointerleave'],
    [TOUCHSTART, '_pointerdown'],
    [TOUCHMOVE, '_pointermove'],
    [TOUCHEND, '_pointerup'],
    [TOUCHCANCEL, '_pointercancel'],
    [MOUSEOVER, '_pointerover'],
    [WHEEL, '_wheel'],
    [CONTEXTMENU, '_contextmenu'],
    [POINTERDOWN, '_pointerdown'],
    [POINTERMOVE, '_pointermove'],
    [POINTERUP, '_pointerup'],
    [POINTERCANCEL, '_pointercancel'],
    [POINTERLEAVE, '_pointerleave'],
    [LOSTPOINTERCAPTURE, '_lostpointercapture'],
  ];

const EVENTS_MAP = {
  mouse: {
    [POINTEROUT]: MOUSEOUT,
    [POINTERLEAVE]: MOUSELEAVE,
    [POINTEROVER]: MOUSEOVER,
    [POINTERENTER]: MOUSEENTER,
    [POINTERMOVE]: MOUSEMOVE,
    [POINTERDOWN]: MOUSEDOWN,
    [POINTERUP]: MOUSEUP,
    [POINTERCANCEL]: 'mousecancel',
    pointerclick: 'click',
    pointerdblclick: 'dblclick',
  },
  touch: {
    [POINTEROUT]: 'touchout',
    [POINTERLEAVE]: 'touchleave',
    [POINTEROVER]: 'touchover',
    [POINTERENTER]: 'touchenter',
    [POINTERMOVE]: TOUCHMOVE,
    [POINTERDOWN]: TOUCHSTART,
    [POINTERUP]: TOUCHEND,
    [POINTERCANCEL]: TOUCHCANCEL,
    pointerclick: 'tap',
    pointerdblclick: 'dbltap',
  },
  pointer: {
    [POINTEROUT]: POINTEROUT,
    [POINTERLEAVE]: POINTERLEAVE,
    [POINTEROVER]: POINTEROVER,
    [POINTERENTER]: POINTERENTER,
    [POINTERMOVE]: POINTERMOVE,
    [POINTERDOWN]: POINTERDOWN,
    [POINTERUP]: POINTERUP,
    [POINTERCANCEL]: POINTERCANCEL,
    pointerclick: 'pointerclick',
    pointerdblclick: 'pointerdblclick',
  },
};

const getEventType = (type) => {
  if (type.indexOf('pointer') >= 0) {
    return 'pointer';
  }
  if (type.indexOf('touch') >= 0) {
    return 'touch';
  }
  return 'mouse';
};

const getEventsMap = (eventType: string) => {
  const type = getEventType(eventType);
  if (type === 'pointer') {
    return Konva.pointerEventsEnabled && EVENTS_MAP.pointer;
  }
  if (type === 'touch') {
    return EVENTS_MAP.touch;
  }
  if (type === 'mouse') {
    return EVENTS_MAP.mouse;
  }
};

function checkNoClip(attrs: any = {}) {
  if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
    Util.warn(
      'Stage does not support clipping. Please use clip for Layers or Groups.'
    );
  }
  return attrs;
}

const NO_POINTERS_MESSAGE = `Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);`;

export const stages: Stage[] = [];

// A stage may be rendered in another window than the one Konva was imported
// into: an iframe, or a window opened with `window.open`. Such a window sends
// its own events and has its own visibility state, so Konva listens to every
// window it renders a stage in
const listeningWindows = new WeakSet<Window>();

const listenToWindow = (win: Window | null) => {
  if (!win || listeningWindows.has(win)) {
    return;
  }
  listeningWindows.add(win);
  DD._listenToWindow(win);
  // chrome is clearing canvas in inactive browser window, causing layer content to be erased
  // so let's redraw layers as soon as window becomes active
  win.document.addEventListener('visibilitychange', () => {
    stages.forEach((stage) => {
      stage.batchDraw();
    });
  });
};

/**
 * Stage constructor.  A stage is used to contain multiple layers
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @param {String|Element} config.container Container selector or DOM element
 * @@nodeParams
 * @example
 * var stage = new Konva.Stage({
 *   width: 500,
 *   height: 800,
 *   container: 'containerId' // or "#containerId" or ".containerClass"
 * });
 */

export class Stage extends Container<Layer, StageConfig> {
  content: HTMLDivElement;
  pointerPos: Vector2d | null;
  _pointerPositions: (Vector2d & { id?: number })[] = [];
  _changedPointerPositions: (Vector2d & { id: number })[] = [];

  bufferCanvas: SceneCanvas;
  bufferHitCanvas: HitCanvas;
  _mouseTargetShape: Shape;
  _touchTargetShape: Shape;
  _pointerTargetShape: Shape;
  _mouseClickStartShape: Shape;
  _touchClickStartShape: Shape;
  _pointerClickStartShape: Shape;
  _mouseClickEndShape: Shape;
  _touchClickEndShape: Shape;
  _pointerClickEndShape: Shape;

  _mouseDblTimeout: any;
  _touchDblTimeout: any;
  _pointerDblTimeout: any;

  constructor(config: StageConfig) {
    super(checkNoClip(config));
    this._buildDOM();
    this._bindContentEvents();
    stages.push(this);
    this.on('widthChange.konva heightChange.konva', this._resizeDOM);
    this.on('visibleChange.konva', this._checkVisibility);
    this.on(
      'clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva',
      () => {
        checkNoClip(this.attrs);
      }
    );
    this._checkVisibility();
  }

  _validateAdd(child) {
    const isLayer = child.getType() === 'Layer';
    const isFastLayer = child.getType() === 'FastLayer';
    const valid = isLayer || isFastLayer;
    if (!valid) {
      Util.throw('You may only add layers to the stage.');
    }
  }

  _checkVisibility() {
    if (!this.content) {
      return;
    }
    const style = this.visible() ? '' : 'none';
    this.content.style.display = style;
  }
  /**
   * The window the stage is rendered in. It is not always the window Konva was
   * imported into: the container may belong to an iframe, or to a window
   * opened with `window.open`.
   */
  _getOwnerWindow(): Window | null {
    const element = this.content || this.container();
    // a document with no browsing context, such as one of `DOMParser`, has no
    // window of its own. The window Konva was imported into is used then
    return (
      element?.ownerDocument?.defaultView || (Konva.isBrowser ? window : null)
    );
  }
  /**
   * set container dom element which contains the stage wrapper div element
   * @method
   * @name Konva.Stage#setContainer
   * @param {DomElement} container can pass in a dom element or id string
   */
  setContainer(container) {
    if (typeof container === STRING) {
      let id;
      if (container.charAt(0) === '.') {
        const className = container.slice(1);
        container = document.getElementsByClassName(className)[0];
      } else {
        if (container.charAt(0) !== '#') {
          id = container;
        } else {
          id = container.slice(1);
        }
        container = document.getElementById(id);
      }
      if (!container) {
        throw 'Can not find container in document with id ' + id;
      }
    }
    this._setAttr('container', container);
    if (this.content) {
      if (this.content.parentElement) {
        this.content.parentElement.removeChild(this.content);
      }
      container.appendChild(this.content);
      // the new container may be in another window, with its own events
      listenToWindow(this._getOwnerWindow());
    }
    return this;
  }
  shouldDrawHit() {
    return true;
  }

  /**
   * clear all layers
   * @method
   * @name Konva.Stage#clear
   */
  clear() {
    const layers = this.children,
      len = layers.length;

    for (let n = 0; n < len; n++) {
      layers[n].clear();
    }
    return this;
  }
  clone(obj?) {
    if (!obj) {
      obj = {};
    }
    obj.container =
      typeof document !== 'undefined' && document.createElement('div');
    return Container.prototype.clone.call(this, obj) as this;
  }

  destroy() {
    super.destroy();
    // a pending double-click timer is what closes the global double-click
    // window, so close the window when the timer goes
    ['mouse', 'touch', 'pointer'].forEach((type) => {
      clearTimeout(this['_' + type + 'DblTimeout']);
      Konva['_' + type + 'InDblClickWindow'] = false;
    });

    const content = this.content;
    content?.parentNode?.removeChild(content);
    const index = stages.indexOf(this);
    if (index > -1) {
      stages.splice(index, 1);
    }

    Util.releaseCanvas(this.bufferCanvas._canvas, this.bufferHitCanvas._canvas);

    return this;
  }
  /**
   * returns ABSOLUTE pointer position which can be a touch position or mouse position
   * pointer position doesn't include any transforms (such as scale) of the stage
   * it is just a plain position of pointer relative to top-left corner of the canvas
   * @method
   * @name Konva.Stage#getPointerPosition
   * @returns {Vector2d|null}
   */
  getPointerPosition(): Vector2d | null {
    const pos = this._pointerPositions[0] || this._changedPointerPositions[0];
    if (!pos) {
      Util.warn(NO_POINTERS_MESSAGE);
      return null;
    }
    return {
      x: pos.x,
      y: pos.y,
    };
  }
  _getPointerById(id?: number) {
    return this._pointerPositions.find((p) => p.id === id);
  }
  getPointersPositions() {
    return this._pointerPositions;
  }
  getStage() {
    return this;
  }
  getContent() {
    return this.content;
  }
  _toKonvaCanvas(config) {
    config = { ...config };

    config.x = config.x || 0;
    config.y = config.y || 0;
    config.width = config.width || this.width();
    config.height = config.height || this.height();

    const canvas = new SceneCanvas({
      width: config.width,
      height: config.height,
      pixelRatio: config.pixelRatio || 1,
    });
    const _context = canvas.getContext()._context;
    const layers = this.children;

    if (config.x || config.y) {
      _context.translate(-1 * config.x, -1 * config.y);
    }

    // every layer renders on its own canvas, like on screen, so a
    // globalCompositeOperation inside a layer does not reach the layers below
    layers.forEach(function (layer) {
      if (!layer.isVisible()) {
        return;
      }
      const layerCanvas = layer._toKonvaCanvas(config);
      _context.drawImage(
        layerCanvas._canvas,
        config.x,
        config.y,
        layerCanvas.getWidth() / layerCanvas.getPixelRatio(),
        layerCanvas.getHeight() / layerCanvas.getPixelRatio()
      );
      Util.releaseCanvas(layerCanvas._canvas);
    });
    return canvas;
  }

  /**
   * get visible intersection shape. This is the preferred
   *  method for determining if a point intersects a shape or not.
   *  It reads the hit canvas, so it finds what pointer events would: nodes with
   *  listening set to false or invisible nodes are not detected, a shape with opacity 0
   *  is, and `hitStrokeWidth` counts. The position is relative to the top left corner of the
   * stage container, like `stage.getPointerPosition()`, without the stage transform
   * @method
   * @name Konva.Stage#getIntersection
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @returns {Konva.Node}
   * @example
   * var shape = stage.getIntersection({x: 50, y: 50});
   */
  getIntersection(pos: Vector2d) {
    if (!pos) {
      return null;
    }
    const layers = this.children,
      len = layers.length,
      end = len - 1;

    for (let n = end; n >= 0; n--) {
      const shape = layers[n].getIntersection(pos);
      if (shape) {
        return shape;
      }
    }

    return null;
  }
  _resizeDOM() {
    const width = this.width();
    const height = this.height();
    if (this.content) {
      // set content dimensions
      this.content.style.width = width + PX;
      this.content.style.height = height + PX;
    }

    // set layer dimensions
    this.children.forEach((layer) => {
      layer._setSize({ width, height });
      layer.draw();
    });
  }
  // "perfect drawing" uses bufferCanvas, shape.intersects() uses
  // bufferHitCanvas; both are lazy - created at 0x0 and sized to the stage
  // on first use
  _syncBufferSize<T extends SceneCanvas | HitCanvas>(canvas: T): T {
    canvas.setSizeIfChanged(this.width(), this.height());
    return canvas;
  }
  add(layer: Layer, ...rest) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }
      return this;
    }
    super.add(layer);

    const length = this.children.length;
    if (length > MAX_LAYERS_NUMBER) {
      Util.warn(
        'The stage has ' +
          length +
          ' layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.'
      );
    }
    layer._setSize({ width: this.width(), height: this.height() });

    // draw layer and append canvas to container
    layer.draw();

    if (Konva.isBrowser) {
      this.content.appendChild(layer.canvas._canvas);
    }

    // chainable
    return this;
  }
  getParent() {
    return null;
  }
  getLayer() {
    return null;
  }

  hasPointerCapture(pointerId: number): boolean {
    return PointerEvents.hasPointerCapture(pointerId, this);
  }

  setPointerCapture(pointerId: number) {
    PointerEvents.setPointerCapture(pointerId, this);
  }

  releaseCapture(pointerId: number) {
    PointerEvents.releaseCapture(pointerId, this);
  }

  /**
   * returns an array of layers
   * @method
   * @name Konva.Stage#getLayers
   */
  getLayers() {
    return this.getChildren();
  }
  _bindContentEvents() {
    if (!Konva.isBrowser) {
      return;
    }
    EVENTS.forEach(([event, methodName]) => {
      this.content.addEventListener(
        event,
        (evt) => {
          this._batchEvents(() => this[methodName](evt));
        },
        { passive: false }
      );
    });
  }
  _batchEvents(callback: () => void) {
    Util._batchEvents(this.eventBatchFunc(), callback);
  }
  _pointerenter(evt: PointerEvent) {
    this.setPointersPositions(evt);
    const events = getEventsMap(evt.type);
    if (events) {
      this._fire(events.pointerenter, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
    }
  }
  _pointerover(evt) {
    this.setPointersPositions(evt);
    const events = getEventsMap(evt.type);
    if (events) {
      this._fire(events.pointerover, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
    }
  }
  _getTargetShape(evenType) {
    let shape: Shape | null = this[evenType + 'targetShape'];
    if (shape && !shape.getStage()) {
      shape = null;
    }
    return shape;
  }
  _pointerleave(evt) {
    const events = getEventsMap(evt.type);
    const eventType = getEventType(evt.type);

    if (!events) {
      return;
    }
    this.setPointersPositions(evt);

    const targetShape = this._getTargetShape(eventType);
    const eventsEnabled =
      !(Konva.isDragging() || Konva.isTransforming()) || Konva.hitOnDragEnabled;
    if (targetShape && eventsEnabled) {
      targetShape._fireAndBubble(events.pointerout, { evt: evt });
      targetShape._fireAndBubble(events.pointerleave, { evt: evt });
      this._fire(events.pointerleave, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
      this[eventType + 'targetShape'] = null;
    } else if (eventsEnabled) {
      this._fire(events.pointerleave, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
      this._fire(events.pointerout, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
    }
    this.pointerPos = null;
    this._pointerPositions = [];
    this._changedPointerPositions = [];
  }
  _pointerdown(evt: TouchEvent | MouseEvent | PointerEvent) {
    const events = getEventsMap(evt.type);
    const eventType = getEventType(evt.type);

    if (!events) {
      return;
    }
    this.setPointersPositions(evt);

    let triggeredOnShape = false;
    this._changedPointerPositions.forEach((pos) => {
      const shape = this.getIntersection(pos);
      DD.justDragged = false;
      // probably we are staring a click
      Konva['_' + eventType + 'ListenClick'] = true;

      // no shape detected? do nothing
      if (!shape || !shape.isListening()) {
        this[eventType + 'ClickStartShape'] = undefined;
        return;
      }

      if (Konva.capturePointerEventsEnabled) {
        shape.setPointerCapture(pos.id);
      }

      // save where we started the click
      this[eventType + 'ClickStartShape'] = shape;

      shape._fireAndBubble(events.pointerdown, {
        evt: evt,
        pointerId: pos.id,
      });
      triggeredOnShape = true;

      // only call preventDefault if the shape is listening for events
      const isTouch = evt.type.indexOf('touch') >= 0;
      if (shape.preventDefault() && evt.cancelable && isTouch) {
        evt.preventDefault();
      }
    });

    // trigger down on stage if not already
    if (!triggeredOnShape) {
      this._fire(events.pointerdown, {
        evt: evt,
        target: this,
        currentTarget: this,
        pointerId: this._pointerPositions[0].id,
      });
    }
  }
  _pointermove(evt: TouchEvent | MouseEvent | PointerEvent) {
    const events = getEventsMap(evt.type);
    const eventType = getEventType(evt.type);
    if (!events) {
      return;
    }
    // prevent default only for touch-based interactions to avoid blocking
    // native mouse wheel scrolling during drag on desktop
    const isTouchPointer =
      (evt as any).type.indexOf('touch') >= 0 ||
      (evt as any).pointerType === 'touch';
    if (
      Konva.isDragging() &&
      DD.node!.preventDefault() &&
      evt.cancelable &&
      isTouchPointer
    ) {
      evt.preventDefault();
    }
    this.setPointersPositions(evt);

    const eventsEnabled =
      !(Konva.isDragging() || Konva.isTransforming()) || Konva.hitOnDragEnabled;
    if (!eventsEnabled) {
      return;
    }

    const processedShapesIds = {};
    let triggeredOnShape = false;
    const targetShape = this._getTargetShape(eventType);
    this._changedPointerPositions.forEach((pos) => {
      const shape = (PointerEvents.getCapturedShape(pos.id) ||
        this.getIntersection(pos)) as Shape;
      const pointerId = pos.id;
      const event = { evt: evt, pointerId };

      const differentTarget = targetShape !== shape;

      if (differentTarget && targetShape) {
        targetShape._fireAndBubble(events.pointerout, { ...event }, shape);
        targetShape._fireAndBubble(events.pointerleave, { ...event }, shape);
      }

      if (shape) {
        if (processedShapesIds[shape._id]) {
          return;
        }
        processedShapesIds[shape._id] = true;
      }

      if (shape && shape.isListening()) {
        triggeredOnShape = true;
        if (differentTarget) {
          shape._fireAndBubble(events.pointerover, { ...event }, targetShape);
          shape._fireAndBubble(events.pointerenter, { ...event }, targetShape);
          this[eventType + 'targetShape'] = shape;
        }
        shape._fireAndBubble(events.pointermove, { ...event });
      } else {
        if (targetShape) {
          this._fire(events.pointerover, {
            evt: evt,
            target: this,
            currentTarget: this,
            pointerId,
          });
          this[eventType + 'targetShape'] = null;
        }
      }
    });

    if (!triggeredOnShape) {
      this._fire(events.pointermove, {
        evt: evt,
        target: this,
        currentTarget: this,
        pointerId: this._changedPointerPositions[0].id,
      });
    }
  }
  _pointerup(evt) {
    const events = getEventsMap(evt.type);
    const eventType = getEventType(evt.type);

    if (!events) {
      return;
    }
    this.setPointersPositions(evt);
    // the mouse/touch families get their "listen click" flags reset by
    // DD._endDragBefore, but native "pointerup" fires before the
    // "mouseup"/"touchend" that ends the drag, so for the pointer family the
    // flags are still set — check the live drag state as well, otherwise
    // "pointerclick" fires after a drag while "click" does not (issue #1756)
    const wasDragged =
      DD.justDragged || (eventType === 'pointer' && Konva.isDragging());
    const listenClick = Konva['_' + eventType + 'ListenClick'] && !wasDragged;
    const clickStartShape = this[eventType + 'ClickStartShape'];
    const clickEndShape = this[eventType + 'ClickEndShape'];
    const inDblClickWindow = Konva['_' + eventType + 'InDblClickWindow'];
    let clickWindowUpdated = false;
    const processedShapesIds = {};
    let skipPointerUpTrigger = false;
    this._changedPointerPositions.forEach((pos) => {
      const shape = (PointerEvents.getCapturedShape(pos.id) ||
        this.getIntersection(pos)) as Shape;

      if (shape) {
        shape.releaseCapture(pos.id);
        if (processedShapesIds[shape._id]) {
          return;
        }
        processedShapesIds[shape._id] = true;
      }

      const pointerId = pos.id;
      const event = { evt: evt, pointerId };
      const clickTarget = shape && shape.isListening() ? shape : null;
      const fireDblClick =
        listenClick &&
        inDblClickWindow &&
        (clickEndShape || null) === clickTarget;
      const canClick =
        listenClick && (!clickTarget || clickStartShape === clickTarget);
      // Several touches can share a release event. Update the window once,
      // and only consume it for a second click on the same target.
      if (canClick && !clickWindowUpdated) {
        clickWindowUpdated = true;
        clearTimeout(this['_' + eventType + 'DblTimeout']);
        Konva['_' + eventType + 'InDblClickWindow'] = !fireDblClick;
        if (!fireDblClick) {
          this['_' + eventType + 'DblTimeout'] = setTimeout(() => {
            Konva['_' + eventType + 'InDblClickWindow'] = false;
          }, Konva.dblClickWindow);
        }
      }

      if (shape && shape.isListening()) {
        skipPointerUpTrigger = true;
        this[eventType + 'ClickEndShape'] = shape;
        shape._fireAndBubble(events.pointerup, { ...event });

        // detect if click or double click occurred
        if (listenClick && clickStartShape === shape) {
          shape._fireAndBubble(events.pointerclick, { ...event });

          if (fireDblClick && clickEndShape && clickEndShape === shape) {
            shape._fireAndBubble(events.pointerdblclick, { ...event });
          }
        }
      } else {
        this[eventType + 'ClickEndShape'] = null;

        if (!skipPointerUpTrigger) {
          this._fire(events.pointerup, {
            evt: evt,
            target: this,
            currentTarget: this,
            pointerId: this._changedPointerPositions[0].id,
          });
          skipPointerUpTrigger = true;
        }

        if (listenClick) {
          this._fire(events.pointerclick, {
            evt: evt,
            target: this,
            currentTarget: this,
            pointerId,
          });
        }

        if (fireDblClick) {
          this._fire(events.pointerdblclick, {
            evt: evt,
            target: this,
            currentTarget: this,
            pointerId,
          });
        }
      }
    });

    if (!skipPointerUpTrigger) {
      this._fire(events.pointerup, {
        evt: evt,
        target: this,
        currentTarget: this,
        pointerId: this._changedPointerPositions[0].id,
      });
    }

    Konva['_' + eventType + 'ListenClick'] = false;

    // always call preventDefault for desktop events because some browsers
    // try to drag and drop the canvas element
    // do not call this function on mobile because it prevent "click" event on all parent containers
    // but apps may listen to it.
    if (evt.cancelable && eventType !== 'touch' && eventType !== 'pointer') {
      evt.preventDefault();
    }
  }
  _contextmenu(evt) {
    this.setPointersPositions(evt);
    const shape = this.getIntersection(this.getPointerPosition()!);

    if (shape && shape.isListening()) {
      shape._fireAndBubble(CONTEXTMENU, { evt: evt });
    } else {
      this._fire(CONTEXTMENU, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
    }
  }

  _wheel(evt) {
    this.setPointersPositions(evt);
    const shape = this.getIntersection(this.getPointerPosition()!);

    if (shape && shape.isListening()) {
      shape._fireAndBubble(WHEEL, { evt: evt });
    } else {
      this._fire(WHEEL, {
        evt: evt,
        target: this,
        currentTarget: this,
      });
    }
  }

  _pointercancel(evt: PointerEvent | TouchEvent) {
    this.setPointersPositions(evt);
    const events = getEventsMap(evt.type);
    this._changedPointerPositions.forEach((pos) => {
      const shape =
        PointerEvents.getCapturedShape(pos.id) || this.getIntersection(pos);
      const event = { evt, pointerId: pos.id };
      if (shape) {
        if (events) shape._fireAndBubble(events.pointercancel, { ...event });
        // Keep the historical pointerup notification for cancellation listeners.
        shape._fireAndBubble(POINTERUP, { ...event });
      } else if (events) {
        this._fire(events.pointercancel, {
          ...event,
          target: this,
          currentTarget: this,
        });
      }
      PointerEvents.releaseCapture(pos.id);
    });
  }

  _lostpointercapture(evt: PointerEvent) {
    PointerEvents.releaseCapture(evt.pointerId);
  }

  /**
   * manually register pointers positions (mouse/touch) in the stage.
   * So you can use stage.getPointerPosition(). Usually you don't need to use that method
   * because all internal events are automatically registered. It may be useful if event
   * is triggered outside of the stage, but you still want to use Konva methods to get pointers position.
   * @method
   * @name Konva.Stage#setPointersPositions
   * @param {Object} evt Event object
   * @example
   *
   * window.addEventListener('mousemove', (e) => {
   *   stage.setPointersPositions(e);
   * });
   */
  setPointersPositions(evt) {
    const contentPosition = this._getContentPosition();
    let x: number | null = null,
      y: number | null = null;
    evt = evt ? evt : window.event;

    // touch events
    if (evt.touches !== undefined) {
      // touchlist has not support for map method
      // so we have to iterate
      this._pointerPositions = [];
      this._changedPointerPositions = [];
      Array.prototype.forEach.call(evt.touches, (touch: any) => {
        this._pointerPositions.push({
          id: touch.identifier,
          x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
          y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
        });
      });

      Array.prototype.forEach.call(
        evt.changedTouches || evt.touches,
        (touch: any) => {
          this._changedPointerPositions.push({
            id: touch.identifier,
            x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
            y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
          });
        }
      );
    } else {
      // mouse events
      x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
      y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
      this.pointerPos = {
        x: x,
        y: y,
      };
      this._pointerPositions = [{ x, y, id: Util._getFirstPointerId(evt) }];
      this._changedPointerPositions = [
        { x, y, id: Util._getFirstPointerId(evt) },
      ];
    }
  }
  _setPointerPosition(evt) {
    Util.warn(
      'Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.'
    );
    this.setPointersPositions(evt);
  }
  _getContentPosition() {
    if (!this.content || !this.content.getBoundingClientRect) {
      return {
        top: 0,
        left: 0,
        scaleX: 1,
        scaleY: 1,
      };
    }

    const rect = this.content.getBoundingClientRect();

    return {
      top: rect.top,
      left: rect.left,
      // sometimes clientWidth can be equals to 0
      // i saw it in react-konva test, looks like it is because of hidden testing element
      scaleX: rect.width / this.content.clientWidth || 1,
      scaleY: rect.height / this.content.clientHeight || 1,
    };
  }
  _buildDOM() {
    // lazy buffer canvases, see _syncBufferSize
    // https://github.com/konvajs/konva/issues/2009
    this.bufferCanvas = new SceneCanvas({
      width: 0,
      height: 0,
    });
    this.bufferHitCanvas = new HitCanvas({
      pixelRatio: 1,
      width: 0,
      height: 0,
    });

    if (!Konva.isBrowser) {
      return;
    }
    const container = this.container();
    if (!container) {
      throw 'Stage has no container. A container is required.';
    }
    // clear content inside container
    container.innerHTML = '';

    // content
    // the container may belong to another document - an iframe, or a popout
    // window - so the content is created in the document of the container
    this.content = container.ownerDocument.createElement('div');
    this.content.style.position = 'relative';
    this.content.style.userSelect = 'none';
    this.content.className = 'konvajs-content';

    this.content.setAttribute('role', 'presentation');

    container.appendChild(this.content);

    listenToWindow(this._getOwnerWindow());

    this._resizeDOM();
  }
  // currently cache function is now working for stage, because stage has no its own canvas element
  cache() {
    Util.warn(
      'Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.'
    );
    return this;
  }
  clearCache() {
    return this;
  }
  /**
   * batch draw
   * @method
   * @name Konva.Stage#batchDraw
   * @return {Konva.Stage} this
   */
  batchDraw() {
    // the config applied by the Node constructor already requests a draw,
    // before the children array exists
    this.children?.forEach(function (layer) {
      layer.batchDraw();
    });
    return this;
  }

  // the setter takes an element or its id, the getter returns the element
  container: GetSet<HTMLDivElement, this, HTMLDivElement | string>;
  eventBatchFunc: GetSet<((callback: () => void) => void) | undefined, this>;
}

Stage.prototype.nodeType = STAGE;
_registerNode(Stage);

/**
 * get/set container DOM element. The container may belong to another window
 * than the one Konva was imported into: an iframe, or a window opened with
 * `window.open`. The stage then uses the events and the frames of that window.
 * @method
 * @name Konva.Stage#container
 * @returns {DomElement} container
 * @example
 * // get container
 * var container = stage.container();
 * // set container
 * var container = document.createElement('div');
 * body.appendChild(container);
 * stage.container(container);
 *
 * // a stage in a popout window
 * var popout = window.open('', '', 'width=600,height=400');
 * stage.container(popout.document.body);
 */
Factory.addGetterSetter(Stage, 'container');

/**
 * Get/set the callback used by framework integrations to batch native input.
 * The callback must invoke its argument exactly once, synchronously. Existing
 * node events keep their order and cancellation behavior. Direct node.fire()
 * and programmatic mutations do not create a batch.
 * Missing calls warn; duplicate or late calls warn and are ignored. Exceptions
 * propagate and skipped input is not replayed, so an invalid callback can
 * prevent input processing and drag cleanup.
 * Each native Konva listener creates its own scope; a DOM event may invoke
 * several listeners. Batching does not reorder or merge those listeners.
 * @method
 * @name Konva.Stage#eventBatchFunc
 * @example
 * stage.eventBatchFunc((run) => frameworkBatch(run));
 */
Factory.addGetterSetter(Stage, 'eventBatchFunc');
