import { Util } from './Util.ts';
import type { ContainerConfig } from './Container.ts';
import { Container } from './Container.ts';
import { Node } from './Node.ts';
import { Factory } from './Factory.ts';
import { SceneCanvas, HitCanvas } from './Canvas.ts';
import type { Stage } from './Stage.ts';

import type { GetSet, IRect, Vector2d } from './types.ts';
import type { Group } from './Group.ts';
import type { Shape } from './Shape.ts';
import { shapes } from './Shape.ts';
import { _registerNode, Konva } from './Global.ts';
import { DD } from './DragAndDrop.ts';

export interface LayerConfig extends ContainerConfig {
  clearBeforeDraw?: boolean;
  hitGraphEnabled?: boolean;
  imageSmoothingEnabled?: boolean;
}

// constants
const BEFORE_DRAW = 'beforeDraw',
  DRAW = 'draw',
  // getIntersection() reads the hit canvas around an edge pixel in blocks
  // of this radius, doubling it as long as the search goes on
  HIT_SEARCH_RADIUS = 10,
  HIT_SEARCH_MAX_DISTANCE = 256;

// the shape drawn at a pixel of the hit graph: an opaque pixel, or an edge
// pixel that the shape covers by at least half, so that its colour read back
// premultiplied still rounds to the key of the shape (see getHitColorKey)
function getHitShape(data: Uint8ClampedArray, i: number) {
  return data[i + 3] >= 128
    ? shapes[Util.getHitColorKey(data[i], data[i + 1], data[i + 2])]
    : undefined;
}

/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes.
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
 * to clear the canvas before each layer draw.  The default value is true.
 * @@nodeParams
 * @@containerParams
 * @example
 * var layer = new Konva.Layer();
 * stage.add(layer);
 * // now you can add shapes, groups into the layer
 */

export class Layer extends Container<Group | Shape> {
  canvas = new SceneCanvas();
  hitCanvas = new HitCanvas({
    pixelRatio: 1,
  });

  _waitingForDraw = false;

  constructor(config?: LayerConfig) {
    super(config);
    this.on('visibleChange.konva', this._checkVisibility);
    this._checkVisibility();

    this.on('imageSmoothingEnabledChange.konva', this._setSmoothEnabled);
    this._setSmoothEnabled();
  }
  // for nodejs?
  createPNGStream() {
    const c = this.canvas._canvas as any;
    return c.createPNGStream();
  }
  /**
   * get layer canvas wrapper
   * @method
   * @name Konva.Layer#getCanvas
   */
  getCanvas() {
    return this.canvas;
  }
  /**
   * get native canvas element
   * @method
   * @name Konva.Layer#getNativeCanvasElement
   */
  getNativeCanvasElement() {
    return this.canvas._canvas;
  }
  /**
   * get layer hit canvas
   * @method
   * @name Konva.Layer#getHitCanvas
   */
  getHitCanvas() {
    return this.hitCanvas;
  }
  /**
   * get layer canvas context
   * @method
   * @name Konva.Layer#getContext
   */
  getContext() {
    return this.getCanvas().getContext();
  }
  /**
   * clear the scene and hit canvas of the layer. The nodes stay and are
   * drawn again by the next `draw()`
   * @method
   * @name Konva.Layer#clear
   * @param {Object} [bounds] clear only this rectangle: `{ x, y, width, height }`
   * @returns {Konva.Layer}
   * @example
   * layer.clear();
   * layer.clear({ x: 0, y: 0, width: 100, height: 100 });
   */
  clear(bounds?: IRect) {
    this.getContext().clear(bounds);
    this.getHitCanvas().getContext().clear(bounds);
    return this;
  }
  // extend Node.prototype.setZIndex
  setZIndex(index: number) {
    super.setZIndex(index);
    const stage = this.getStage();
    if (stage && stage.content) {
      stage.content.removeChild(this.getNativeCanvasElement());

      if (index < stage.children.length - 1) {
        stage.content.insertBefore(
          this.getNativeCanvasElement(),
          stage.children[index + 1].getCanvas()._canvas
        );
      } else {
        stage.content.appendChild(this.getNativeCanvasElement());
      }
    }
    return this;
  }
  moveToTop() {
    Node.prototype.moveToTop.call(this);
    const stage = this.getStage();
    if (stage && stage.content) {
      stage.content.removeChild(this.getNativeCanvasElement());
      stage.content.appendChild(this.getNativeCanvasElement());
    }
    return true;
  }
  moveUp() {
    const moved = Node.prototype.moveUp.call(this);
    if (!moved) {
      return false;
    }
    const stage = this.getStage();
    if (!stage || !stage.content) {
      return false;
    }
    stage.content.removeChild(this.getNativeCanvasElement());

    if (this.index < stage.children.length - 1) {
      stage.content.insertBefore(
        this.getNativeCanvasElement(),
        stage.children[this.index + 1].getCanvas()._canvas
      );
    } else {
      stage.content.appendChild(this.getNativeCanvasElement());
    }
    return true;
  }
  // extend Node.prototype.moveDown
  moveDown() {
    if (Node.prototype.moveDown.call(this)) {
      const stage = this.getStage();
      if (stage) {
        const children = stage.children;
        if (stage.content) {
          stage.content.removeChild(this.getNativeCanvasElement());
          stage.content.insertBefore(
            this.getNativeCanvasElement(),
            children[this.index + 1].getCanvas()._canvas
          );
        }
      }
      return true;
    }
    return false;
  }
  // extend Node.prototype.moveToBottom
  moveToBottom() {
    if (Node.prototype.moveToBottom.call(this)) {
      const stage = this.getStage();
      if (stage) {
        const children = stage.children;
        if (stage.content) {
          stage.content.removeChild(this.getNativeCanvasElement());
          stage.content.insertBefore(
            this.getNativeCanvasElement(),
            children[1].getCanvas()._canvas
          );
        }
      }
      return true;
    }
    return false;
  }
  getLayer() {
    return this;
  }
  remove() {
    const _canvas = this.getNativeCanvasElement();

    Node.prototype.remove.call(this);

    if (_canvas && _canvas.parentNode && Util._isInDocument(_canvas)) {
      _canvas.parentNode.removeChild(_canvas);
    }
    return this;
  }
  getStage() {
    return this.parent as Stage;
  }
  // the canvases follow the stage size. The public size() of a layer, like
  // width() and height(), warns and does nothing
  _setSize({ width, height }) {
    this.canvas.setSize(width, height);
    this._syncHitCanvasSize();
    this._setSmoothEnabled();
    return this;
  }
  // the hit canvas is only allocated while the layer is listening;
  // for a non-listening layer it is kept released (0x0), so a purely
  // presentational layer does not pay for a stage-sized hit bitmap
  // https://github.com/konvajs/konva/issues/2009
  _syncHitCanvasSize() {
    const listening = this.isListening();
    this.hitCanvas.setSizeIfChanged(
      (listening ? this.getWidth() : 0) || 0,
      (listening ? this.getHeight() : 0) || 0
    );
  }
  _validateAdd(child) {
    const type = child.getType();
    if (type !== 'Group' && type !== 'Shape') {
      Util.throw('You may only add groups and shapes to a layer.');
    }
  }
  _toKonvaCanvas(config) {
    config = { ...config };
    config.width = config.width || this.getWidth();
    config.height = config.height || this.getHeight();
    config.x = config.x !== undefined ? config.x : this.x();
    config.y = config.y !== undefined ? config.y : this.y();

    return Node.prototype._toKonvaCanvas.call(this, config);
  }

  _checkVisibility() {
    const visible = this.visible();
    if (visible) {
      this.canvas._canvas.style.display = 'block';
    } else {
      this.canvas._canvas.style.display = 'none';
    }
  }

  _setSmoothEnabled() {
    this.getContext()._context.imageSmoothingEnabled =
      this.imageSmoothingEnabled();
  }
  /**
   * get/set width of layer. getter return width of stage. setter doing nothing.
   * if you want change width use `stage.width(value);`
   * @name Konva.Layer#width
   * @method
   * @returns {Number}
   * @example
   * var width = layer.width();
   */
  getWidth() {
    if (this.parent) {
      return this.parent.width();
    }
  }
  setWidth() {
    Util.warn(
      'Can not change width of layer. Use "stage.width(value)" function instead.'
    );
  }
  /**
   * get/set height of layer.getter return height of stage. setter doing nothing.
   * if you want change height use `stage.height(value);`
   * @name Konva.Layer#height
   * @method
   * @returns {Number}
   * @example
   * var height = layer.height();
   */
  getHeight() {
    if (this.parent) {
      return this.parent.height();
    }
  }
  setHeight() {
    Util.warn(
      'Can not change height of layer. Use "stage.height(value)" function instead.'
    );
  }

  /**
   * batch draw. this function will not do immediate draw
   * but it will schedule drawing to next tick (requestAnimFrame)
   * @method
   * @name Konva.Layer#batchDraw
   * @return {Konva.Layer} this
   */
  batchDraw() {
    if (!this._waitingForDraw) {
      this._waitingForDraw = true;
      // ask the window the stage is rendered in for the frame: a stage in a
      // popout window keeps drawing while the opener window is not visible
      Util.requestAnimFrame(() => {
        // reset before drawing, so a throwing draw does not freeze the layer
        // and a draw handler can request the next frame
        this._waitingForDraw = false;
        this.draw();
      }, this.getStage()?._getOwnerWindow());
    }
    return this;
  }

  /**
   * get visible intersection shape. This is the preferred
   * method for determining if a point intersects a shape or not.
   * It reads the hit canvas, so it finds what pointer events would: nodes with
   * listening set to false or invisible nodes are not detected, a shape with opacity 0
   * is, and `hitStrokeWidth` counts. The position is relative to the top left corner of the
   * stage container, like `stage.getPointerPosition()`, without the stage transform
   * @method
   * @name Konva.Layer#getIntersection
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @returns {Konva.Node}
   * @example
   * var shape = layer.getIntersection({x: 50, y: 50});
   */
  getIntersection(pos: Vector2d) {
    if (!this.isListening() || !this.isVisible()) {
      return null;
    }
    const hit = this._getIntersection(pos);
    if (hit.shape) {
      return hit.shape;
    }
    if (!hit.antialiased) {
      return null;
    }
    // the pointer is on the outer part of an edge, or on an opaque pixel with
    // the colours of two shapes mixed. Walk outward ring by ring to the
    // nearest pixel that resolves to a shape. The smoothed edge of a cached
    // node that is scaled up can be many pixels wide, so keep going while the
    // alpha still rises (the ramp leads into the shape) or the ring holds
    // mixed pixels. A thin line has a flat alpha, so the search stops at once
    // instead of walking along it to an unrelated shape nearby
    const ratio = this.hitCanvas.pixelRatio,
      cx = Math.floor(pos.x * ratio),
      cy = Math.floor(pos.y * ratio);
    const read = (r: number) =>
      this.hitCanvas.context.getImageData(cx - r, cy - r, r * 2 + 1, r * 2 + 1)
        .data;
    let r = HIT_SEARCH_RADIUS,
      size = r * 2 + 1,
      data = read(r),
      previousMax = data[(r * size + r) * 4 + 3];
    for (let d = 1; d <= HIT_SEARCH_MAX_DISTANCE; d++) {
      if (d > r) {
        r = Math.min(HIT_SEARCH_MAX_DISTANCE, r * 2);
        size = r * 2 + 1;
        data = read(r);
      }
      let max = 0;
      for (let y = -d; y <= d; y++) {
        // whole top and bottom rows, only the two side pixels of the others
        const step = Math.abs(y) === d ? 1 : d * 2;
        for (let x = -d; x <= d; x += step) {
          const i = ((y + r) * size + x + r) * 4;
          const shape = getHitShape(data, i);
          if (shape) {
            return shape;
          }
          max = Math.max(max, data[i + 3]);
        }
      }
      // 255 here is a mixed pixel, as an opaque one resolved above
      if (max <= previousMax && max !== 255) {
        return null;
      }
      previousMax = max;
    }
    return null;
  }
  _getIntersection(pos: Vector2d): { shape?: Shape; antialiased?: boolean } {
    // a non-listening layer keeps its hit canvas released (0x0),
    // and a just-enabled layer may not have drawn its hit graph yet
    if (!this.hitCanvas.width || !this.hitCanvas.height) {
      return {};
    }
    const ratio = this.hitCanvas.pixelRatio;
    const p = this.hitCanvas.context.getImageData(
      Math.floor(pos.x * ratio),
      Math.floor(pos.y * ratio),
      1,
      1
    ).data;
    const shape = getHitShape(p, 0);
    if (shape) {
      return { shape };
    }
    if (p[3] > 0) {
      // an edge pixel, or an opaque one with the colours of two shapes mixed
      return { antialiased: true };
    }
    return {};
  }
  drawScene(can?: SceneCanvas, top?: Node, bufferCanvas?: SceneCanvas) {
    const layer = this.getLayer(),
      canvas = can || (layer && layer.getCanvas());

    this._fire(BEFORE_DRAW, {
      node: this,
    });

    if (this.clearBeforeDraw()) {
      canvas.getContext().clear();
    }

    Container.prototype.drawScene.call(this, canvas, top, bufferCanvas);

    this._fire(DRAW, {
      node: this,
    });

    return this;
  }
  // the hit graph is skipped while a node of the layer (or the stage) is
  // dragged or a transformer on the layer, or of a node on it, is
  // transforming, as the layer is redrawn every frame; the draw that follows
  // restores it
  shouldDrawHit(top?: Node) {
    if (!super.shouldDrawHit(top)) {
      return false;
    }
    if (top || Konva.hitOnDragEnabled) {
      return true;
    }
    let underDrag = false;
    DD._dragElements.forEach((elem) => {
      if (
        elem.dragStatus === 'dragging' &&
        (elem.node === this.getStage() || elem.node.getLayer() === this)
      ) {
        underDrag = true;
      }
    });
    return !underDrag && !Konva['Transformer']?._isLayerTransforming(this);
  }
  drawHit(can?: HitCanvas, top?: Node) {
    const layer = this.getLayer(),
      canvas = can || (layer && layer.hitCanvas);

    if (!can && layer) {
      // allocate or release the hit canvas to match the current listening
      // state - this also picks up a listening change made after the last draw
      layer._syncHitCanvasSize();
      if (layer.clearBeforeDraw()) {
        layer.getHitCanvas().getContext().clear();
      }
    }

    Container.prototype.drawHit.call(this, canvas, top);
    return this;
  }
  /**
   * enable hit graph. **DEPRECATED!** Use `layer.listening(true)` instead.
   * @name Konva.Layer#enableHitGraph
   * @method
   * @returns {Layer}
   */
  enableHitGraph() {
    this.hitGraphEnabled(true);
    return this;
  }
  /**
   * disable hit graph. **DEPRECATED!** Use `layer.listening(false)` instead.
   * @name Konva.Layer#disableHitGraph
   * @method
   * @returns {Layer}
   */
  disableHitGraph() {
    this.hitGraphEnabled(false);
    return this;
  }

  setHitGraphEnabled(val) {
    Util.warn(
      'hitGraphEnabled method is deprecated. Please use layer.listening() instead.'
    );
    this.listening(val);
  }

  getHitGraphEnabled(val) {
    Util.warn(
      'hitGraphEnabled method is deprecated. Please use layer.listening() instead.'
    );
    return this.listening();
  }

  /**
   * Show or hide hit canvas over the stage. May be useful for debugging custom hitFunc
   * @name Konva.Layer#toggleHitCanvas
   * @method
   */
  toggleHitCanvas() {
    if (!this.parent || !this.parent['content']) {
      return;
    }
    const parent = this.parent as any;
    const added = !!this.hitCanvas._canvas.parentNode;
    if (added) {
      parent.content.removeChild(this.hitCanvas._canvas);
    } else {
      parent.content.appendChild(this.hitCanvas._canvas);
    }
  }

  destroy(): this {
    Util.releaseCanvas(
      this.getNativeCanvasElement(),
      this.getHitCanvas()._canvas
    );
    return super.destroy();
  }

  hitGraphEnabled: GetSet<boolean, this>;

  clearBeforeDraw: GetSet<boolean, this>;
  imageSmoothingEnabled: GetSet<boolean, this>;
}

Layer.prototype.nodeType = 'Layer';
_registerNode(Layer);

/**
 * get/set imageSmoothingEnabled flag
 * For more info see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
 * @name Konva.Layer#imageSmoothingEnabled
 * @method
 * @param {Boolean} imageSmoothingEnabled
 * @returns {Boolean}
 * @example
 * // get imageSmoothingEnabled flag
 * var imageSmoothingEnabled = layer.imageSmoothingEnabled();
 *
 * layer.imageSmoothingEnabled(false);
 *
 * layer.imageSmoothingEnabled(true);
 */
Factory.addGetterSetter(Layer, 'imageSmoothingEnabled', true);

/**
 * get/set clearBeforeDraw flag which determines if the layer is cleared or not
 *  before drawing
 * @name Konva.Layer#clearBeforeDraw
 * @method
 * @param {Boolean} clearBeforeDraw
 * @returns {Boolean}
 * @example
 * // get clearBeforeDraw flag
 * var clearBeforeDraw = layer.clearBeforeDraw();
 *
 * // disable clear before draw
 * layer.clearBeforeDraw(false);
 *
 * // enable clear before draw
 * layer.clearBeforeDraw(true);
 */
Factory.addGetterSetter(Layer, 'clearBeforeDraw', true);

// the getter and setter are the deprecated ones above
Factory.addOverloadedGetterSetter(Layer, 'hitGraphEnabled');
/**
 * get/set hitGraphEnabled flag.  **DEPRECATED!** Use `layer.listening(false)` instead.
 *  Disabling the hit graph will greatly increase
 *  draw performance because the hit graph will not be redrawn each time the layer is
 *  drawn.  This, however, also disables mouse/touch event detection
 * @name Konva.Layer#hitGraphEnabled
 * @method
 * @param {Boolean} enabled
 * @returns {Boolean}
 * @example
 * // get hitGraphEnabled flag
 * var hitGraphEnabled = layer.hitGraphEnabled();
 *
 * // disable hit graph
 * layer.hitGraphEnabled(false);
 *
 * // enable hit graph
 * layer.hitGraphEnabled(true);
 */
