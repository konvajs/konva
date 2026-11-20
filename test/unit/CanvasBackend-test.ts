import { assert } from 'chai';

import {
  Konva,
  isNode,
  pixelAt,
  restoreCanvasBackend,
  stripesCanvas,
} from './test-utils.ts';

describe('Canvas backend', function () {
  const previous = restoreCanvasBackend();

  // a backend whose canvases differ from the current ones by `change`
  function changedBackend(name: string, change: (canvas: any) => void) {
    return {
      name,
      createCanvas: () => {
        const canvas = previous.createCanvas();
        change(canvas);
        return canvas;
      },
    };
  }

  it('reports the name given to setCanvasBackend()', function () {
    Konva.setCanvasBackend({
      name: 'test-backend',
      createCanvas: previous.createCanvas,
    });
    assert.equal(Konva.getCanvasBackend(), 'test-backend');
  });

  it('reports "custom" after Util.createCanvasElement is replaced directly', function () {
    Konva.Util.createCanvasElement = () => previous.createCanvas() as any;
    assert.equal(Konva.getCanvasBackend(), 'custom');
  });

  it('measures text with a backend set after Konva measured text', function () {
    const width = () => new Konva.Text({ text: 'Hello', fontSize: 20 }).width();
    const before = width();
    Konva.setCanvasBackend(
      changedBackend('double-width', (canvas) => {
        const ctx = canvas.getContext('2d');
        const measureText = ctx.measureText.bind(ctx);
        ctx.measureText = (text: string) => {
          const metrics = measureText(text);
          const copy: any = {};
          for (const key in metrics) copy[key] = metrics[key];
          copy.width = metrics.width * 2;
          return copy;
        };
      })
    );
    assert.closeTo(width(), before * 2, 0.001);
  });

  it('checks for canvas farbling again for a new backend', function () {
    assert.isFalse(Konva.Util.isCanvasFarblingActive());
    Konva.setCanvasBackend(
      changedBackend('noisy', (canvas) => {
        const ctx = canvas.getContext('2d');
        const getImageData = ctx.getImageData.bind(ctx);
        ctx.getImageData = (...args: number[]) => {
          const imageData = getImageData(...args);
          imageData.data[0] ^= 1;
          return imageData;
        };
      })
    );
    assert.isTrue(Konva.Util.isCanvasFarblingActive());
  });

  it('transforms patterns with the createDOMMatrix of the backend', function () {
    const stripes = stripesCanvas();
    Konva.setCanvasBackend({
      name: 'shifted-patterns',
      createCanvas: previous.createCanvas,
      createDOMMatrix: () => previous.createDOMMatrix!([1, 0, 0, 1, 5, 0]),
    });
    const rect = new Konva.Rect({
      width: 10,
      height: 10,
      fillPatternImage: stripes,
    });
    assert.deepEqual(pixelAt(rect, 1, 5), [0, 0, 255, 255]);
  });

  it('makes a Path2D with the createPath2D of the backend', function () {
    assert.instanceOf(Konva.Util.createPath2D('M0 0h10'), Path2D);
    Konva.setCanvasBackend({
      name: 'own-paths',
      createCanvas: previous.createCanvas,
      createPath2D: (path) => ({ path }),
    });
    assert.deepEqual(Konva.Util.createPath2D('M0 0h10'), { path: 'M0 0h10' });
  });

  it('a backend without createImage() can not load images', function () {
    Konva.setCanvasBackend({
      name: 'no-images',
      createCanvas: previous.createCanvas,
    });
    assert.throws(
      () => Konva.Image.fromURL('image.png', () => {}),
      'the "no-images" canvas backend has no createImage()'
    );
  });

  it('a Konva copy in Node.js leaves the global object alone', function () {
    if (!isNode) {
      return this.skip();
    }
    assert.isUndefined((globalThis as any).Konva);
  });

  it('a second Konva copy in a page keeps the first one as window.Konva', function () {
    if (isNode) {
      return this.skip();
    }
    assert.equal((window as any).Konva, Konva);
    const errors: string[] = [];
    const error = console.error;
    console.error = (message: string) => errors.push(message);
    try {
      Konva._injectGlobal({ version: 'another copy' });
    } finally {
      console.error = error;
    }
    assert.equal((window as any).Konva, Konva);
    assert.match(errors[0], /Several Konva instances detected/);
  });

  it('renders in a Web Worker with OffscreenCanvas', async function () {
    if (isNode) {
      return this.skip();
    }
    const worker = new Worker(
      new URL('../worker/render-in-worker.ts', import.meta.url),
      { type: 'module' }
    );
    const result = await new Promise<any>((resolve, reject) => {
      worker.onmessage = (event) => resolve(event.data);
      worker.onerror = (event) => reject(new Error(event.message));
    });
    worker.terminate();
    assert.deepEqual(result, {
      backend: 'offscreen-canvas',
      size: [20, 10],
      left: [255, 0, 0, 255],
      right: [0, 0, 0, 0],
      measuresText: true,
      toDataURLError:
        'Konva: this canvas can not make a data URL. In a Web Worker, use toBlob() instead.',
      imageError:
        'Konva: a Web Worker has no image element. Load the image with createImageBitmap() and pass the ImageBitmap to Konva.Image.',
      globalKonva: 'undefined',
    });
  });
});
