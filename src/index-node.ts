// main entry for umd build for rollup
import { Konva } from './_FullInternals';
import * as Canvas from 'canvas';

const canvas = Canvas['default'] || Canvas;

global.DOMMatrix = canvas.DOMMatrix;

const isNode = typeof global.document === 'undefined';

if (isNode) {
  Konva.Util['createCanvasElement'] = () => {
    const node = canvas.createCanvas(300, 300) as any;
    if (!node['style']) {
      node['style'] = {};
    }
    return node;
  };

  // create image in Node env
  Konva.Util.createImageElement = () => {
    const node = new canvas.Image() as any;
    return node;
  };
}

export default Konva;
