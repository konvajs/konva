import { Util, Collection } from './Util';
import { Factory } from './Factory';
import { Container } from './Container';
import { document, isBrowser, getGlobalKonva, UA } from './Global';
import { SceneCanvas, HitCanvas } from './Canvas';
import { GetSet, Vector2d } from './types';
import { Shape } from './Shape';
import { BaseLayer } from './BaseLayer';

// TODO: add a warning if stage has too many layers
// TODO: remove "content" events from docs

// CONSTANTS
var STAGE = 'Stage',
  STRING = 'string',
  PX = 'px',
  MOUSEOUT = 'mouseout',
  MOUSELEAVE = 'mouseleave',
  MOUSEOVER = 'mouseover',
  MOUSEENTER = 'mouseenter',
  MOUSEMOVE = 'mousemove',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'mouseup',
  CONTEXTMENU = 'contextmenu',
  CLICK = 'click',
  DBL_CLICK = 'dblclick',
  TOUCHSTART = 'touchstart',
  TOUCHEND = 'touchend',
  TAP = 'tap',
  DBL_TAP = 'dbltap',
  TOUCHMOVE = 'touchmove',
  WHEEL = 'wheel',
  CONTENT_MOUSEOUT = 'contentMouseout',
  CONTENT_MOUSEOVER = 'contentMouseover',
  CONTENT_MOUSEMOVE = 'contentMousemove',
  CONTENT_MOUSEDOWN = 'contentMousedown',
  CONTENT_MOUSEUP = 'contentMouseup',
  CONTENT_CONTEXTMENU = 'contentContextmenu',
  CONTENT_CLICK = 'contentClick',
  CONTENT_DBL_CLICK = 'contentDblclick',
  CONTENT_TOUCHSTART = 'contentTouchstart',
  CONTENT_TOUCHEND = 'contentTouchend',
  CONTENT_DBL_TAP = 'contentDbltap',
  CONTENT_TAP = 'contentTap',
  CONTENT_TOUCHMOVE = 'contentTouchmove',
  CONTENT_WHEEL = 'contentWheel',
  DIV = 'div',
  RELATIVE = 'relative',
  KONVA_CONTENT = 'konvajs-content',
  SPACE = ' ',
  UNDERSCORE = '_',
  CONTAINER = 'container',
  EMPTY_STRING = '',
  EVENTS = [
    MOUSEDOWN,
    MOUSEMOVE,
    MOUSEUP,
    MOUSEOUT,
    TOUCHSTART,
    TOUCHMOVE,
    TOUCHEND,
    MOUSEOVER,
    WHEEL,
    CONTEXTMENU
  ],
  // cached variables
  eventsLength = EVENTS.length;

function addEvent(ctx, eventName) {
  ctx.content.addEventListener(
    eventName,
    function(evt) {
      ctx[UNDERSCORE + eventName](evt);
    },
    false
  );
}
export const stages: Stage[] = [];

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

export class Stage extends Container {
  content: HTMLDivElement;
  pointerPos: Vector2d | null;
  bufferCanvas: SceneCanvas;
  bufferHitCanvas: HitCanvas;
  targetShape: Shape;
  clickStartShape: Shape;
  clickEndShape: Shape;
  dblTimeout: any;
  tapStartShape: Shape;

  children: Collection<BaseLayer>;

  constructor(config) {
    super(config);
    this.nodeType = STAGE;
    this._buildDOM();
    this._bindContentEvents();
    stages.push(this);
    this.on('widthChange heightChange', this._buildDOM);
  }

  _validateAdd(child) {
    if (child.getType() !== 'Layer') {
      Util.throw('You may only add layers to the stage.');
    }
  }
  /**
   * set container dom element which contains the stage wrapper div element
   * @method
   * @name Konva.Stage#setContainer
   * @param {DomElement} container can pass in a dom element or id string
   */
  setContainer(container) {
    if (typeof container === STRING) {
      // TODO: use simple query selector
      if (container.charAt(0) === '.') {
        var className = container.slice(1);
        container = document.getElementsByClassName(className)[0];
      } else {
        var id;
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
    this._setAttr(CONTAINER, container);
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
    var layers = this.children,
      len = layers.length,
      n;

    for (n = 0; n < len; n++) {
      layers[n].clear();
    }
    return this;
  }
  clone(obj) {
    if (!obj) {
      obj = {};
    }
    obj.container = document.createElement(DIV);
    return Container.prototype.clone.call(this, obj);
  }

  destroy() {
    super.destroy();

    var content = this.content;
    if (content && Util._isInDocument(content)) {
      this.container().removeChild(content);
    }
    var index = stages.indexOf(this);
    if (index > -1) {
      stages.splice(index, 1);
    }
    return this;
  }
  /**
   * get pointer position which can be a touch position or mouse position
   * @method
   * @name Konva.Stage#getPointerPosition
   * @returns {Object}
   */
  getPointerPosition() {
    // TODO: warn if it is undefined
    return this.pointerPos;
  }
  getStage() {
    return this;
  }
  getContent() {
    return this.content;
  }
  _toKonvaCanvas(config) {
    config = config || {};

    var x = config.x || 0,
      y = config.y || 0,
      canvas = new SceneCanvas({
        width: config.width || this.width(),
        height: config.height || this.height(),
        pixelRatio: config.pixelRatio || 1
      }),
      _context = canvas.getContext()._context,
      layers = this.children;

    if (x || y) {
      _context.translate(-1 * x, -1 * y);
    }

    layers.each(function(layer) {
      if (!layer.isVisible()) {
        return;
      }
      var layerCanvas = layer._toKonvaCanvas(config);
      _context.drawImage(
        layerCanvas._canvas,
        x,
        y,
        layerCanvas.getWidth() / layerCanvas.getPixelRatio(),
        layerCanvas.getHeight() / layerCanvas.getPixelRatio()
      );
    });
    return canvas;
  }

  /**
   * get visible intersection shape. This is the preferred
   *  method for determining if a point intersects a shape or not
   * @method
   * @name Konva.Stage#getIntersection
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @param {String} [selector]
   * @returns {Konva.Node}
   * @example
   * var shape = stage.getIntersection({x: 50, y: 50});
   * // or if you interested in shape parent:
   * var group = stage.getIntersection({x: 50, y: 50}, 'Group');
   */
  getIntersection(pos: Vector2d, selector?: string) {
    var layers = this.children,
      len = layers.length,
      end = len - 1,
      n,
      shape;

    for (n = end; n >= 0; n--) {
      shape = layers[n].getIntersection(pos, selector);
      if (shape) {
        return shape;
      }
    }

    return null;
  }
  _resizeDOM() {
    if (this.content) {
      var width = this.width(),
        height = this.height(),
        layers = this.getChildren(),
        len = layers.length,
        n,
        layer;

      // set content dimensions
      this.content.style.width = width + PX;
      this.content.style.height = height + PX;

      this.bufferCanvas.setSize(width, height);
      this.bufferHitCanvas.setSize(width, height);

      // set layer dimensions
      for (n = 0; n < len; n++) {
        layer = layers[n];
        layer.setSize({ width, height });
        layer.draw();
      }
    }
  }
  add(layer) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }
      return this;
    }
    super.add(layer);
    layer._setCanvasSize(this.width(), this.height());

    // draw layer and append canvas to container
    layer.draw();

    if (isBrowser) {
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
  /**
   * returns a {@link Konva.Collection} of layers
   * @method
   * @name Konva.Stage#getLayers
   */
  getLayers() {
    return this.getChildren();
  }
  _bindContentEvents() {
    if (!isBrowser) {
      return;
    }
    for (var n = 0; n < eventsLength; n++) {
      addEvent(this, EVENTS[n]);
    }
  }
  _mouseover(evt) {
    this._setPointerPosition(evt);
    this._fire(CONTENT_MOUSEOVER, { evt: evt });
  }
  _mouseout(evt) {
    this._setPointerPosition(evt);
    var targetShape = this.targetShape;

    if (targetShape && !getGlobalKonva().isDragging()) {
      targetShape._fireAndBubble(MOUSEOUT, { evt: evt });
      targetShape._fireAndBubble(MOUSELEAVE, { evt: evt });
      this.targetShape = null;
    }
    this.pointerPos = undefined;

    this._fire(CONTENT_MOUSEOUT, { evt: evt });
  }
  _mousemove(evt) {
    // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
    if (UA.ieMobile) {
      return this._touchmove(evt);
    }
    this._setPointerPosition(evt);
    var shape;

    if (!getGlobalKonva().isDragging()) {
      shape = this.getIntersection(this.getPointerPosition());
      if (shape && shape.isListening()) {
        if (
          !getGlobalKonva().isDragging() &&
          (!this.targetShape || this.targetShape._id !== shape._id)
        ) {
          if (this.targetShape) {
            this.targetShape._fireAndBubble(MOUSEOUT, { evt: evt }, shape);
            this.targetShape._fireAndBubble(MOUSELEAVE, { evt: evt }, shape);
          }
          shape._fireAndBubble(MOUSEOVER, { evt: evt }, this.targetShape);
          shape._fireAndBubble(MOUSEENTER, { evt: evt }, this.targetShape);
          this.targetShape = shape;
        } else {
          shape._fireAndBubble(MOUSEMOVE, { evt: evt });
        }
      } else {
        /*
         * if no shape was detected, clear target shape and try
         * to run mouseout from previous target shape
         */
        if (this.targetShape && !getGlobalKonva().isDragging()) {
          this.targetShape._fireAndBubble(MOUSEOUT, { evt: evt });
          this.targetShape._fireAndBubble(MOUSELEAVE, { evt: evt });
          this.targetShape = null;
        }
        this._fire(MOUSEMOVE, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }

      // content event
      this._fire(CONTENT_MOUSEMOVE, { evt: evt });
    }

    // always call preventDefault for desktop events because some browsers
    // try to drag and drop the canvas element
    if (evt.cancelable) {
      evt.preventDefault();
    }
  }
  _mousedown(evt) {
    // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
    if (UA.ieMobile) {
      return this._touchstart(evt);
    }
    this._setPointerPosition(evt);
    var shape = this.getIntersection(this.getPointerPosition());

    getGlobalKonva().listenClickTap = true;

    if (shape && shape.isListening()) {
      this.clickStartShape = shape;
      shape._fireAndBubble(MOUSEDOWN, { evt: evt });
    } else {
      this._fire(MOUSEDOWN, {
        evt: evt,
        target: this,
        currentTarget: this
      });
    }

    // content event
    this._fire(CONTENT_MOUSEDOWN, { evt: evt });

    // always call preventDefault for desktop events because some browsers
    // try to drag and drop the canvas element
    // TODO: if we preventDefault() it will cancel event detection outside of window inside iframe
    // but we need it for better drag&drop
    // can we disable native drag&drop somehow differently?
    // if (evt.cancelable) {
    // evt.preventDefault();
    // }
  }
  _mouseup(evt) {
    // workaround for mobile IE to force touch event when unhandled pointer event elevates into a mouse event
    if (UA.ieMobile) {
      return this._touchend(evt);
    }
    this._setPointerPosition(evt);
    var shape = this.getIntersection(this.getPointerPosition()),
      clickStartShape = this.clickStartShape,
      clickEndShape = this.clickEndShape,
      fireDblClick = false,
      dd = getGlobalKonva().DD;

    if (getGlobalKonva().inDblClickWindow) {
      fireDblClick = true;
      clearTimeout(this.dblTimeout);
      // Konva.inDblClickWindow = false;
    } else if (!dd || !dd.justDragged) {
      // don't set inDblClickWindow after dragging
      getGlobalKonva().inDblClickWindow = true;
      clearTimeout(this.dblTimeout);
    } else if (dd) {
      dd.justDragged = false;
    }

    this.dblTimeout = setTimeout(function() {
      getGlobalKonva().inDblClickWindow = false;
    }, getGlobalKonva().dblClickWindow);

    if (shape && shape.isListening()) {
      this.clickEndShape = shape;
      shape._fireAndBubble(MOUSEUP, { evt: evt });

      // detect if click or double click occurred
      if (
        getGlobalKonva().listenClickTap &&
        clickStartShape &&
        clickStartShape._id === shape._id
      ) {
        shape._fireAndBubble(CLICK, { evt: evt });

        if (fireDblClick && clickEndShape && clickEndShape._id === shape._id) {
          shape._fireAndBubble(DBL_CLICK, { evt: evt });
        }
      }
    } else {
      this._fire(MOUSEUP, { evt: evt, target: this, currentTarget: this });
      if (getGlobalKonva().listenClickTap) {
        this._fire(CLICK, { evt: evt, target: this, currentTarget: this });
      }

      if (fireDblClick) {
        this._fire(DBL_CLICK, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }
    }
    // content events
    this._fire(CONTENT_MOUSEUP, { evt: evt });
    if (getGlobalKonva().listenClickTap) {
      this._fire(CONTENT_CLICK, { evt: evt });
      if (fireDblClick) {
        this._fire(CONTENT_DBL_CLICK, { evt: evt });
      }
    }

    getGlobalKonva().listenClickTap = false;

    // always call preventDefault for desktop events because some browsers
    // try to drag and drop the canvas element
    if (evt.cancelable) {
      evt.preventDefault();
    }
  }
  _contextmenu(evt) {
    this._setPointerPosition(evt);
    var shape = this.getIntersection(this.getPointerPosition());

    if (shape && shape.isListening()) {
      shape._fireAndBubble(CONTEXTMENU, { evt: evt });
    } else {
      this._fire(CONTEXTMENU, {
        evt: evt,
        target: this,
        currentTarget: this
      });
    }
    this._fire(CONTENT_CONTEXTMENU, { evt: evt });
  }
  _touchstart(evt) {
    this._setPointerPosition(evt);
    var shape = this.getIntersection(this.getPointerPosition());

    getGlobalKonva().listenClickTap = true;

    if (shape && shape.isListening()) {
      this.tapStartShape = shape;
      shape._fireAndBubble(TOUCHSTART, { evt: evt });

      // only call preventDefault if the shape is listening for events
      if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
        evt.preventDefault();
      }
    } else {
      this._fire(TOUCHSTART, {
        evt: evt,
        target: this,
        currentTarget: this
      });
    }
    // content event
    this._fire(CONTENT_TOUCHSTART, { evt: evt });
  }
  _touchend(evt) {
    this._setPointerPosition(evt);
    var shape = this.getIntersection(this.getPointerPosition()),
      fireDblClick = false;

    if (getGlobalKonva().inDblClickWindow) {
      fireDblClick = true;
      clearTimeout(this.dblTimeout);
      // getGlobalKonva().inDblClickWindow = false;
    } else {
      getGlobalKonva().inDblClickWindow = true;
      clearTimeout(this.dblTimeout);
    }

    this.dblTimeout = setTimeout(function() {
      getGlobalKonva().inDblClickWindow = false;
    }, getGlobalKonva().dblClickWindow);

    if (shape && shape.isListening()) {
      shape._fireAndBubble(TOUCHEND, { evt: evt });

      // detect if tap or double tap occurred
      if (
        getGlobalKonva().listenClickTap &&
        this.tapStartShape &&
        shape._id === this.tapStartShape._id
      ) {
        shape._fireAndBubble(TAP, { evt: evt });

        if (fireDblClick) {
          shape._fireAndBubble(DBL_TAP, { evt: evt });
        }
      }
      // only call preventDefault if the shape is listening for events
      if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
        evt.preventDefault();
      }
    } else {
      this._fire(TOUCHEND, { evt: evt, target: this, currentTarget: this });
      if (getGlobalKonva().listenClickTap) {
        this._fire(TAP, { evt: evt, target: this, currentTarget: this });
      }
      if (fireDblClick) {
        this._fire(DBL_TAP, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }
    }
    // content events
    this._fire(CONTENT_TOUCHEND, { evt: evt });
    if (getGlobalKonva().listenClickTap) {
      this._fire(CONTENT_TAP, { evt: evt });
      if (fireDblClick) {
        this._fire(CONTENT_DBL_TAP, { evt: evt });
      }
    }

    getGlobalKonva().listenClickTap = false;
  }
  _touchmove(evt) {
    this._setPointerPosition(evt);
    var dd = getGlobalKonva().DD,
      shape;
    if (!getGlobalKonva().isDragging()) {
      shape = this.getIntersection(this.getPointerPosition());
      if (shape && shape.isListening()) {
        shape._fireAndBubble(TOUCHMOVE, { evt: evt });
        // only call preventDefault if the shape is listening for events
        if (shape.isListening() && shape.preventDefault() && evt.cancelable) {
          evt.preventDefault();
        }
      } else {
        this._fire(TOUCHMOVE, {
          evt: evt,
          target: this,
          currentTarget: this
        });
      }
      this._fire(CONTENT_TOUCHMOVE, { evt: evt });
    }
    if (dd) {
      if (
        getGlobalKonva().isDragging() &&
        getGlobalKonva().DD.node.preventDefault() &&
        evt.cancelable
      ) {
        evt.preventDefault();
      }
    }
  }
  _wheel(evt) {
    this._setPointerPosition(evt);
    var shape = this.getIntersection(this.getPointerPosition());

    if (shape && shape.isListening()) {
      shape._fireAndBubble(WHEEL, { evt: evt });
    } else {
      this._fire(WHEEL, {
        evt: evt,
        target: this,
        currentTarget: this
      });
    }
    this._fire(CONTENT_WHEEL, { evt: evt });
  }
  _setPointerPosition(evt) {
    var contentPosition = this._getContentPosition(),
      x = null,
      y = null;
    evt = evt ? evt : window.event;

    // touch events
    if (evt.touches !== undefined) {
      // currently, only handle one finger
      if (evt.touches.length > 0) {
        var touch = evt.touches[0];
        // get the information for finger #1
        x = touch.clientX - contentPosition.left;
        y = touch.clientY - contentPosition.top;
      }
    } else {
      // mouse events
      x = evt.clientX - contentPosition.left;
      y = evt.clientY - contentPosition.top;
    }
    if (x !== null && y !== null) {
      this.pointerPos = {
        x: x,
        y: y
      };
    }
  }
  _getContentPosition() {
    var rect = this.content.getBoundingClientRect
      ? this.content.getBoundingClientRect()
      : { top: 0, left: 0 };
    return {
      top: rect.top,
      left: rect.left
    };
  }
  _buildDOM() {
    // the buffer canvas pixel ratio must be 1 because it is used as an
    // intermediate canvas before copying the result onto a scene canvas.
    // not setting it to 1 will result in an over compensation
    this.bufferCanvas = new SceneCanvas();
    this.bufferHitCanvas = new HitCanvas({ pixelRatio: 1 });

    if (!isBrowser) {
      return;
    }
    var container = this.container();
    if (!container) {
      throw 'Stage has no container. A container is required.';
    }
    // clear content inside container
    container.innerHTML = EMPTY_STRING;

    // content
    this.content = document.createElement(DIV);
    this.content.style.position = RELATIVE;
    this.content.style.userSelect = 'none';
    this.content.className = KONVA_CONTENT;

    this.content.setAttribute('role', 'presentation');

    container.appendChild(this.content);

    this._resizeDOM();
  }
  _onContent(typesStr, handler) {
    var types = typesStr.split(SPACE),
      len = types.length,
      n,
      baseEvent;

    for (n = 0; n < len; n++) {
      baseEvent = types[n];
      this.content.addEventListener(baseEvent, handler, false);
    }
  }
  // currently cache function is now working for stage, because stage has no its own canvas element
  // TODO: may be it is better to cache all children layers?
  cache() {
    Util.warn(
      'Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.'
    );
    return this;
  }
  clearCache() {
    return this;
  }

  container: GetSet<HTMLDivElement, this>;
  batchDraw: () => void;
}

// TODO: test for replacing container
Factory.addGetterSetter(Stage, 'container');

/**
 * get/set container DOM element
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
 */
