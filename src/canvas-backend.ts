import { Konva } from './_CoreInternals.ts';
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

Konva.setCanvasBackend({
  name: 'node-canvas',
  createCanvas: () => canvas.createCanvas(300, 300),
  createImage: () => new canvas.Image(),
});

// the core Konva object, without shapes and filters. `import 'konva'` extends
// this same object with them
export default Konva;
