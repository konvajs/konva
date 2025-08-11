import { Konva } from './_CoreInternals';
import { Canvas, DOMMatrix, Image } from 'skia-canvas';

global.DOMMatrix = DOMMatrix as any;

// @ts-ignore
Canvas.prototype.toDataURL = Canvas.prototype.toDataURLSync;

Konva.Util['createCanvasElement'] = () => {
  const node = new Canvas(300, 300) as any;
  if (!node['style']) {
    node['style'] = {};
  }
  node.toString = () => '[object HTMLCanvasElement]';
  const ctx = node.getContext('2d');
  // Override the getter to return the canvas node directly
  // because in skia-canvas canvas is using weak ref to the canvas node
  // and somehow on many tests it fails to get the canvas node
  Object.defineProperty(ctx, 'canvas', {
    get: () => node,
  });
  return node;
};

// create image in Node env
Konva.Util.createImageElement = () => {
  const node = new Image() as any;
  node.toString = () => '[object HTMLImageElement]';
  return node;
};

// this line is not part of the public API
// but will be used in tests
Konva.Util['isSkia'] = true;

export default Konva;
