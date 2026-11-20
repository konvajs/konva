import { Konva } from './_CoreInternals.ts';
import { Canvas, DOMMatrix, Image, Path2D } from 'skia-canvas';

// @ts-ignore
global.DOMMatrix = DOMMatrix as any;

// @ts-ignore
global.Path2D = Path2D as any;

Konva.setCanvasBackend({
  name: 'skia-canvas',
  createCanvas: () => {
    const node = new Canvas(300, 300);
    const ctx = node.getContext('2d');
    // Override the getter to return the canvas node directly
    // because in skia-canvas canvas is using weak ref to the canvas node
    // and somehow on many tests it fails to get the canvas node
    Object.defineProperty(ctx, 'canvas', {
      get: () => node,
    });
    return node;
  },
  createImage: () => new Image(),
  createPath2D: (path) => new Path2D(path),
});

// the core Konva object, without shapes and filters. `import 'konva'` extends
// this same object with them
export default Konva;
