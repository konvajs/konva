import { Util, Collection, Point } from './Util';
import { Container } from './Container';
import { Factory } from './Factory';
import { BaseLayer } from './BaseLayer';
import { HitCanvas } from './Canvas';
import { shapes } from './Shape';
import { getBooleanValidator } from './Validators';
import { _registerNode } from './Global';

import { GetSet } from './types';

// constants
var HASH = '#',
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
    { x: -1, y: 1 } // 8
  ],
  INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;

/**
 * Layer constructor.  Layers are tied to their own canvas element and are used
 * to contain groups or shapes.
 * @constructor
 * @memberof Konva
 * @augments Konva.BaseLayer
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
export class Layer extends BaseLayer {
  hitCanvas = new HitCanvas({
    pixelRatio: 1
  });

  _setCanvasSize(width, height) {
    this.canvas.setSize(width, height);
    this.hitCanvas.setSize(width, height);
    this._checkSmooth();
  }
  _validateAdd(child) {
    var type = child.getType();
    if (type !== 'Group' && type !== 'Shape') {
      Util.throw('You may only add groups and shapes to a layer.');
    }
  }
  /**
   * get visible intersection shape. This is the preferred
   * method for determining if a point intersects a shape or not
   * also you may pass optional selector parameter to return ancestor of intersected shape
   * @method
   * @name Konva.Layer#getIntersection
   * @param {Object} pos
   * @param {Number} pos.x
   * @param {Number} pos.y
   * @param {String} [selector]
   * @returns {Konva.Node}
   * @example
   * var shape = layer.getIntersection({x: 50, y: 50});
   * // or if you interested in shape parent:
   * var group = layer.getIntersection({x: 50, y: 50}, 'Group');
   */
  getIntersection(pos: Point, selector?: string) {
    var obj, i, intersectionOffset, shape;

    if (!this.hitGraphEnabled() || !this.isVisible()) {
      return null;
    }
    // in some cases antialiased area may be bigger than 1px
    // it is possible if we will cache node, then scale it a lot
    var spiralSearchDistance = 1;
    var continueSearch = false;
    while (true) {
      for (i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
        intersectionOffset = INTERSECTION_OFFSETS[i];
        obj = this._getIntersection({
          x: pos.x + intersectionOffset.x * spiralSearchDistance,
          y: pos.y + intersectionOffset.y * spiralSearchDistance
        });
        shape = obj.shape;
        if (shape && selector) {
          return shape.findAncestor(selector, true);
        } else if (shape) {
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
  _getIntersection(pos) {
    var ratio = this.hitCanvas.pixelRatio;
    var p = this.hitCanvas.context.getImageData(
        Math.round(pos.x * ratio),
        Math.round(pos.y * ratio),
        1,
        1
      ).data,
      p3 = p[3],
      colorKey,
      shape;
    // fully opaque pixel
    if (p3 === 255) {
      colorKey = Util._rgbToHex(p[0], p[1], p[2]);
      shape = shapes[HASH + colorKey];
      if (shape) {
        return {
          shape: shape
        };
      }
      return {
        antialiased: true
      };
    } else if (p3 > 0) {
      // antialiased pixel
      return {
        antialiased: true
      };
    }
    // empty pixel
    return {};
  }
  drawScene(can, top) {
    var layer = this.getLayer(),
      canvas = can || (layer && layer.getCanvas());

    this._fire(BEFORE_DRAW, {
      node: this
    });

    if (this.clearBeforeDraw()) {
      canvas.getContext().clear();
    }

    Container.prototype.drawScene.call(this, canvas, top);

    this._fire(DRAW, {
      node: this
    });

    return this;
  }
  drawHit(can, top) {
    var layer = this.getLayer(),
      canvas = can || (layer && layer.hitCanvas);

    if (layer && layer.clearBeforeDraw()) {
      layer
        .getHitCanvas()
        .getContext()
        .clear();
    }

    Container.prototype.drawHit.call(this, canvas, top);
    return this;
  }
  clear(bounds?) {
    BaseLayer.prototype.clear.call(this, bounds);
    this.getHitCanvas()
      .getContext()
      .clear(bounds);
    return this;
  }
  /**
   * enable hit graph
   * @name Konva.Layer#enableHitGraph
   * @method
   * @returns {Layer}
   */
  enableHitGraph() {
    this.hitGraphEnabled(true);
    return this;
  }
  /**
   * disable hit graph
   * @name Konva.Layer#disableHitGraph
   * @method
   * @returns {Layer}
   */
  disableHitGraph() {
    this.hitGraphEnabled(false);
    return this;
  }

  /**
   * Show or hide hit canvas over the stage. May be useful for debugging custom hitFunc
   * @name Konva.Layer#toggleHitCanvas
   * @method
   */
  toggleHitCanvas() {
    if (!this.parent) {
      return;
    }
    var parent = this.parent as any;
    var added = !!this.hitCanvas._canvas.parentNode;
    if (added) {
      parent.content.removeChild(this.hitCanvas._canvas);
    } else {
      parent.content.appendChild(this.hitCanvas._canvas);
    }
  }
  setSize({ width, height }) {
    super.setSize({ width, height });
    this.hitCanvas.setSize(width, height);
    return this;
  }

  hitGraphEnabled: GetSet<boolean, this>;
}

Layer.prototype.nodeType = 'Layer';
_registerNode(Layer);

Factory.addGetterSetter(Layer, 'hitGraphEnabled', true, getBooleanValidator());
/**
 * get/set hitGraphEnabled flag.  Disabling the hit graph will greatly increase
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
Collection.mapMethods(Layer);
