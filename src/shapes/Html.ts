import { Factory } from '../Factory.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { _registerNode } from '../Global.ts';
import { Util } from '../Util.ts';
import { getBooleanValidator } from '../Validators.ts';

import type { GetSet } from '../types.ts';
import type { Context } from '../Context.ts';
import type { Stage } from '../Stage.ts';

export interface HtmlConfig extends ShapeConfig {
  element?: HTMLElement;
  interactive?: boolean;
}

// the element is rendered at the resolution it has on screen, up to this size
const MAX_BITMAP_SIZE = 4096;

// The HTML-in-Canvas API draws an element only on the canvas that holds it.
// Konva draws a node on many canvases: layer, cache, buffer, export. So every
// stage has one invisible canvas that holds the elements. A node renders its
// element there and draws the result as an image, which works everywhere.
class HtmlHost {
  // typed as any: the API is not in the DOM typings yet
  canvas: any;
  context: any;
  stage: Stage;
  nodes = new Set<Html>();

  constructor(stage: Stage, canvas: HTMLCanvasElement) {
    this.stage = stage;
    this.canvas = canvas;
    canvas.setAttribute('content', 'drawable');
    canvas.width = canvas.height = 1;
    const style = canvas.style;
    style.position = 'absolute';
    style.top = style.left = '0';
    style.width = style.height = '100%';
    style.opacity = '0';
    style.pointerEvents = 'none';
    // layers are appended after the host, it has to stay above them
    style.zIndex = '1';
    stage.content.appendChild(canvas);
    this.context = canvas.getContext('2d');
    canvas.addEventListener('paint', this._onPaint);
    stage.on('pointermove.konvaHtml touchstart.konvaHtml', this._updateInput);
  }
  // the browser repainted some elements: draw them again
  _onPaint = (evt: any) => {
    this.nodes.forEach((node) => {
      if (evt.changedElements.includes(node.element())) {
        node._measure();
        node._requestDraw();
      }
    });
  };
  // The browser knows nothing about the shapes of Konva, so it can not order
  // elements among them. The hit graph of Konva decides: an element takes
  // input only while its node is interactive and the top node at the pointer.
  _updateInput = (evt?: any) => {
    // do not take the element away in the middle of a text selection
    if (evt?.evt?.buttons) {
      return;
    }
    const nodes = Array.from(this.nodes);
    // not getPointerPosition(): it warns when the pointer is off the stage
    const pos = this.stage._pointerPositions[0];
    // without interactive nodes there is nothing to look for
    const top =
      pos &&
      nodes.some((node) => node.interactive()) &&
      this.stage.getIntersection(pos);
    nodes.forEach((node) => {
      const active = node === top && node.interactive();
      if (active) {
        // a cached ancestor may have moved the node without drawing it
        node._updateGeometry();
      }
      node.element()!.style.pointerEvents = active ? 'auto' : 'none';
    });
  };
  add(node: Html) {
    const element = node.element()!;
    this.nodes.add(node);
    element.setAttribute('drawable', '');
    element.style.pointerEvents = 'none';
    this.canvas.appendChild(element);
  }
  remove(node: Html, element: HTMLElement) {
    this.nodes.delete(node);
    if (element.parentNode === this.canvas) {
      element.remove();
      element.removeAttribute('drawable');
      element.style.pointerEvents = '';
    }
    if (!this.nodes.size) {
      this.canvas.remove();
      this.stage.off('.konvaHtml');
      hosts.delete(this.stage);
    }
  }
}

const hosts = new WeakMap<Stage, HtmlHost | null>();

function getHost(stage: Stage) {
  let host = hosts.get(stage);
  if (host === undefined) {
    const canvas = stage.content?.ownerDocument.createElement('canvas');
    if (canvas && 'updateElementGeometry' in canvas) {
      host = new HtmlHost(stage, canvas);
    } else {
      host = null;
      Util.warn(
        'Konva.Html needs the HTML-in-Canvas API (Chrome 157+). It is not available here, so Konva.Html nodes draw nothing.'
      );
    }
    hosts.set(stage, host);
  }
  return host;
}

/**
 * Html constructor. Draws a live DOM element as a shape, with the
 * [HTML-in-Canvas API](https://developer.chrome.com/docs/web-platform/html-in-canvas).
 * The element is drawn into the canvas, so it follows the order, transforms,
 * clipping, opacity, caching, filters and export of the other nodes. It is
 * drawn again when the browser repaints it.
 *
 * The node moves the element into the stage and removes it on `destroy()`.
 * `width` and `height` set the CSS size of the element; without them the node
 * has the size the element is laid out with. Scale scales the picture.
 *
 * By default the element is a picture: all input goes to Konva. With
 * `interactive: true` the element takes clicks, focus and typing where the
 * node is the top node under the pointer.
 *
 * Experimental. Where the API is missing (other browsers, Node.js) the node
 * draws nothing. A cached ancestor does not follow the changes of the element.
 * The browser paints an element only when the stage is in the document and
 * not far outside the viewport; until then the node draws nothing.
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {HTMLElement} config.element
 * @param {Boolean} [config.interactive] default is false
 * @@shapeParams
 * @@nodeParams
 * @example
 * var element = document.createElement('div');
 * element.innerHTML = 'Hello <b>world</b>';
 *
 * var html = new Konva.Html({
 *   x: 20,
 *   y: 20,
 *   width: 200,
 *   element: element
 * });
 */
export class Html extends Shape<HtmlConfig> {
  _host: HtmlHost | null = null;
  // the size of the element when the browser last painted it. It is zero
  // until the first paint: before it there is no picture to draw
  _elementWidth = 0;
  _elementHeight = 0;

  constructor(config?: HtmlConfig) {
    super(config);
    this.on('elementChange.konva', (evt: any) => {
      this._detach(evt.oldVal);
      this._applySize();
    });
    this.on('widthChange.konva heightChange.konva', this._applySize);
    // the pointer may rest on the node, with no move to come before a click
    this.on('interactiveChange.konva', () => this._host?._updateInput());
    this._applySize();
  }
  _applySize(evt?: any) {
    const style = this.element()?.style;
    if (style) {
      const { width, height } = this.attrs;
      // the drawn box is the border box
      style.boxSizing = 'border-box';
      // the attr is removed: the element takes the size of its own layout
      if (evt && evt.newVal == null) {
        style[evt.type.replace('Change', '')] = '';
      }
      // without the attr the element keeps the size its own CSS gives it
      if (width != null) {
        style.width = width + 'px';
      }
      if (height != null) {
        style.height = height + 'px';
      }
    }
  }
  // the element lives in the host of the stage that draws the node
  _attach() {
    const stage = this.getStage();
    const host = stage && this.element() ? getHost(stage) : null;
    if (host !== this._host) {
      this._detach();
      this._host = host;
      host?.add(this);
    }
    return host;
  }
  _detach(element = this.element()) {
    this._host?.remove(this, element!);
    this._host = null;
    this._elementWidth = this._elementHeight = 0;
  }
  _measure() {
    const element = this.element()!;
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const oldWidth = this._elementWidth;
    const oldHeight = this._elementHeight;
    this._elementWidth = width;
    this._elementHeight = height;
    // width() and height() of an auto-sized node changed: tell the listeners
    if (width !== oldWidth && this.attrs.width == null) {
      this._fireChangeEvent('width', oldWidth, width);
    }
    if (height !== oldHeight && this.attrs.height == null) {
      this._fireChangeEvent('height', oldHeight, height);
    }
  }
  // tells the browser where the element is, for input and accessibility
  _updateGeometry() {
    const m = this.getAbsoluteTransform().getMatrix();
    this._host?.canvas.updateElementGeometry(this.element(), {
      canvasTransform: new DOMMatrix(m),
    });
  }
  _sceneFunc(context: Context) {
    const host = this._attach();
    const width = this.width();
    const height = this.height();
    // also a hidden element (display: none): no size and no picture
    if (!host || !this._elementWidth || !this._elementHeight) {
      return;
    }
    // render at the resolution of the target, so the picture stays sharp
    const t = context._context.getTransform();
    const bitmapWidth = Math.min(
      Math.ceil(width * Math.hypot(t.a, t.b)) || 1,
      MAX_BITMAP_SIZE
    );
    const bitmapHeight = Math.min(
      Math.ceil(height * Math.hypot(t.c, t.d)) || 1,
      MAX_BITMAP_SIZE
    );
    const canvas = host.canvas;
    // setting a size clears the bitmap, so it only grows
    if (canvas.width < bitmapWidth) {
      canvas.width = bitmapWidth;
    }
    if (canvas.height < bitmapHeight) {
      canvas.height = bitmapHeight;
    }
    host.context.reset();
    host.context.drawElementImage(
      this.element(),
      0,
      0,
      bitmapWidth,
      bitmapHeight,
      { preserveElementGeometry: true }
    );
    context.drawImage(
      canvas,
      0,
      0,
      bitmapWidth,
      bitmapHeight,
      0,
      0,
      width,
      height
    );
    this._updateGeometry();
  }
  _hitFunc(context: Context) {
    context.beginPath();
    context.rect(0, 0, this.width(), this.height());
    context.closePath();
    context.fillStrokeShape(this);
  }
  getWidth() {
    return this.attrs.width ?? this._elementWidth;
  }
  getHeight() {
    return this.attrs.height ?? this._elementHeight;
  }
  // Konva cancels touchstart on a shape, and then a tap can not focus an
  // input. So an interactive node does not cancel it by default.
  getPreventDefault() {
    return this.attrs.preventDefault ?? !this.interactive();
  }
  // two nodes can not draw one element, so the clone gets a copy of it
  clone(obj?: any) {
    return super.clone({ element: this.element()?.cloneNode(true), ...obj });
  }
  destroy() {
    this._detach();
    return super.destroy();
  }

  element: GetSet<HTMLElement | undefined, this>;
  interactive: GetSet<boolean, this>;
}

Html.prototype.className = 'Html';
_registerNode(Html, true);

/**
 * get/set the DOM element to draw. The node moves it into the stage.
 * @method
 * @name Konva.Html#element
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 * @example
 * // get value
 * var element = html.element();
 *
 * // set value
 * html.element(document.createElement('div'));
 */
Factory.addGetterSetter(Html, 'element');

/**
 * get/set interactive. An interactive element takes clicks, focus and typing
 * where its node is the top node under the pointer. Konva events still fire
 * on the node. Turn off `draggable` while the element is interactive, or a
 * drag inside the element also moves the node. The default is false.
 * @method
 * @name Konva.Html#interactive
 * @param {Boolean} interactive
 * @returns {Boolean}
 * @example
 * // let the user type into the inputs of the element
 * html.interactive(true);
 */
Factory.addGetterSetter(Html, 'interactive', false, getBooleanValidator());
