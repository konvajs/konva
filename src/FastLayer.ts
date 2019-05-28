import { Util, Collection } from './Util';
import { Container } from './Container';
import { BaseLayer } from './BaseLayer';
import { _registerNode } from './Global';

/**
 * FastLayer constructor. Layers are tied to their own canvas element and are used
 * to contain shapes only.  If you don't need node nesting, mouse and touch interactions,
 * or event pub/sub, you should use FastLayer instead of Layer to create your layers.
 * It renders about 2x faster than normal layers.
 * @constructor
 * @memberof Konva
 * @augments Konva.BaseLayer
 * @param {Object} config
 * @param {Boolean} [config.clearBeforeDraw] set this property to false if you don't want
 * to clear the canvas before each layer draw.  The default value is true.
 * @param {Boolean} [config.visible]
 * @param {String} [config.id] unique id
 * @param {String} [config.name] non-unique name
 * @param {Number} [config.opacity] determines node opacity.  Can be any number between 0 and 1
 * @@containerParams
 * @example
 * var layer = new Konva.FastLayer();
 */
export class FastLayer extends BaseLayer {
  _validateAdd(child) {
    var type = child.getType();
    if (type !== 'Shape') {
      Util.throw('You may only add shapes to a fast layer.');
    }
  }
  _setCanvasSize(width, height) {
    this.canvas.setSize(width, height);
    this._checkSmooth();
  }
  hitGraphEnabled() {
    return false;
  }

  drawScene(can?) {
    var layer = this.getLayer(),
      canvas = can || (layer && layer.getCanvas());

    if (this.clearBeforeDraw()) {
      canvas.getContext().clear();
    }

    Container.prototype.drawScene.call(this, canvas);

    return this;
  }
  draw() {
    this.drawScene();
    return this;
  }
}

FastLayer.prototype.nodeType = 'FastLayer';
_registerNode(FastLayer);

Collection.mapMethods(FastLayer);
