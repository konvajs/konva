import Konva from '../src/skia-backend.ts';
import { Canvas, Image, Path2D } from 'skia-canvas';

// trace assertions expect the names a browser prints for these objects
Canvas.prototype.toString = () => '[object HTMLCanvasElement]';
Image.prototype.toString = () => '[object HTMLImageElement]';
Path2D.prototype.toString = () => '[object Path2D]';

// pixel comparisons need one renderer on every machine, and CI has no GPU
const createCanvas = Konva.Util.createCanvasElement;
Konva.setCanvasBackend({
  name: 'skia-canvas',
  createCanvas: () => Object.assign(createCanvas(), { gpu: false }),
  createImage: Konva.Util.createImageElement,
  createPath2D: Konva.Util.createPath2D,
});
