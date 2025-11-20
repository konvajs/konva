import { Konva } from './_CoreInternals.ts';
// @ts-ignore
import { Canvas, DOMMatrix, Image, Path2D } from 'skia-canvas';

// @ts-ignore
global.DOMMatrix = DOMMatrix as any;

// @ts-ignore
global.Path2D = Path2D as any;
Path2D.prototype.toString = () => '[object Path2D]';

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

Konva.Util['createOffscreenCanvas'] = (width, height) => {
  const node = new Canvas(width, height) as any;
  if (!node['style']) {
    node['style'] = {};
  }
  node.toString = () => '[object OffscreenCanvas]';
  const ctx = node.getContext('2d');
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

Konva._renderBackend = 'skia-canvas';

export default Konva;
