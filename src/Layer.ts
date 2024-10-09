import { Util } from './Util';
import { Container, ContainerConfig } from './Container';
import { Node } from './Node';
import { Factory } from './Factory';
import { SceneCanvas, HitCanvas } from './Canvas';
import { Stage } from './Stage';
import { getBooleanValidator } from './Validators';

import { GetSet, Vector2d } from './types';
import { Group } from './Group';
import { Shape, shapes } from './Shape';
import { _registerNode } from './Global';

export interface LayerConfig extends ContainerConfig {
  clearBeforeDraw?: boolean;
  hitGraphEnabled?: boolean;
  imageSmoothingEnabled?: boolean;
}

// constants
const HASH = '#',
  BEFORE_DRAW = 'beforeDraw',
  DRAW = 'draw',
  /*
   * 2 - 3 - 4
   * |       |
   * 1 - 0   5
   *         |
   * 8 - 7 - 6
   */
  INTERSECTION_OFFSETS = [
    { x: 0, y: 0 }, // 0
    { x: -1, y: -1 }, // 2
    { x: 1, y: -1 }, // 4
    { x: 1, y: 1 }, // 6
    { x: -1, y: 1 }, // 8
  ],
  INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;

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
  // TODO: deprecate this method
  clear(bounds?) {
    this.getContext().clear(bounds);
    this.getHitCanvas().getContext().clear(bounds);
    return this;
  }
  // extend Node.prototype.setZIndex
  setZIndex(index) {
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
  setSize({ width, height }) {
    this.canvas.setSize(width, height);
    this.hitCanvas.setSize(width, height);
    this._setSmoothEnabled();
    return this;
  }
  _validateAdd(child) {
    const type = child.getType();
    if (type !== 'Group' && type !== 'Shape') {
      Util.throw('You may only add groups and shapes to a layer.');
    }
  }
  _toKonvaCanvas(config) {
    config = config || {};
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
      Util.requestAnimFrame(() => {
        this.draw();
        this._waitingForDraw = false;
      });
    }
    return this;
  }

  /**
   * get visible intersection shape. This is the preferred
   * method for determining if a point intersects a shape or not
   * also you may pass optional selector parameter to return ancestor of intersected shape
   * nodes with listening set to false will not be detected
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
    // in some cases antialiased area may be bigger than 1px
    // it is possible if we will cache node, then scale it a lot
    let spiralSearchDistance = 1;
    let continueSearch = false;
    while (true) {
      for (let i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
        const intersectionOffset = INTERSECTION_OFFSETS[i];
        const obj = this._getIntersection({
          x: pos.x + intersectionOffset.x * spiralSearchDistance,
          y: pos.y + intersectionOffset.y * spiralSearchDistance,
        });
        const shape = obj.shape;
        if (shape) {
          return shape;
        }
        // we should continue search if we found antialiased pixel
        // that means our node somewhere very close
        continueSearch = !!obj.antialiased;
        // stop search if found empty pixel
        if (!obj.antialiased) {
          break;
        }
      }
      // if no shape, and no antialiased pixel, we should end searching
      if (continueSearch) {
        spiralSearchDistance += 1;
      } else {
        return null;
      }
    }
  }
  _getIntersection(pos: Vector2d): { shape?: Shape; antialiased?: boolean } {
    const ratio = this.hitCanvas.pixelRatio;
    const p = this.hitCanvas.context.getImageData(
      Math.round(pos.x * ratio),
      Math.round(pos.y * ratio),
      1,
      1
    ).data;
    const p3 = p[3];

    // fully opaque pixel
    if (p3 === 255) {
      const colorKey = Util._rgbToHex(p[0], p[1], p[2]);
      const shape = shapes[HASH + colorKey];
      if (shape) {
        return {
          shape: shape,
        };
      }
      return {
        antialiased: true,
      };
    } else if (p3 > 0) {
      // antialiased pixel
      return {
        antialiased: true,
      };
    }
    // empty pixel
    return {};
  }
  drawScene(can?: SceneCanvas, top?: Node) {
    const layer = this.getLayer(),
      canvas = can || (layer && layer.getCanvas());

    this._fire(BEFORE_DRAW, {
      node: this,
    });

    if (this.clearBeforeDraw()) {
      canvas.getContext().clear();
    }

    Container.prototype.drawScene.call(this, canvas, top);

    this._fire(DRAW, {
      node: this,
    });

    return this;
  }
  drawHit(can?: HitCanvas, top?: Node) {
    const layer = this.getLayer(),
      canvas = can || (layer && layer.hitCanvas);

    if (layer && layer.clearBeforeDraw()) {
      layer.getHitCanvas().getContext().clear();
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

Factory.addGetterSetter(Layer, 'hitGraphEnabled', true, getBooleanValidator());
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
