import { Konva } from './_CoreInternals.ts';
import { Canvas, DOMMatrix, Image, Path2D } from '@napi-rs/canvas';

// @ts-ignore
global.DOMMatrix = DOMMatrix;

// @ts-ignore
global.Path2D = Path2D;

Konva.setCanvasBackend({
  name: 'napi-rs-canvas',
  createCanvas: () => new Canvas(300, 300),
  createImage: () => new Image(),
  createPath2D: (path) => new Path2D(path),
});

// the core Konva object, without shapes and filters. `import 'konva'` extends
// this same object with them
export default Konva;
