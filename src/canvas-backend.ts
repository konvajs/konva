import { Konva } from './_CoreInternals.ts';
// @ts-ignore
import * as Canvas from 'canvas';

const canvas = Canvas['default'] || Canvas;

// @ts-ignore
global.DOMMatrix = canvas.DOMMatrix;

// @ts-ignore
(global as any).Path2D ??= class Path2D {
  constructor(path: any) {
    (this as any).path = path;
  }

  get [Symbol.toStringTag]() {
    return `Path2D`;
  }
};

Konva.Util['createCanvasElement'] = () => {
  const node = canvas.createCanvas(300, 300) as any;
  if (!node['style']) {
    node['style'] = {};
  }
  return node;
};

Konva.Util['createOffscreenCanvas'] = (width, height) => {
  const node = canvas.createCanvas(width, height) as any;
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

Konva._renderBackend = 'node-canvas';

export default Konva;
