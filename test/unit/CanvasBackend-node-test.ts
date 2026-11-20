// Switches between real canvas libraries, so it runs only in Node.js: the
// browser suite (unit-tests.html) does not list this file
import { assert } from 'chai';
import { createCanvas } from 'canvas';
import { Canvas as SkiaCanvas, DOMMatrix as SkiaDOMMatrix } from 'skia-canvas';

import {
  Konva,
  pixelAt,
  restoreCanvasBackend,
  stripesCanvas,
} from './test-utils.ts';

const nodeCanvas = {
  name: 'node-canvas',
  createCanvas: () => createCanvas(300, 150),
};
const skiaCanvas = {
  name: 'skia-canvas',
  createCanvas: () => new SkiaCanvas(300, 150),
};

describe('Canvas backend switch', function () {
  restoreCanvasBackend();

  it('makes gradients with a backend set after Konva made one', function () {
    const gradientRect = () =>
      new Konva.Rect({
        width: 10,
        height: 10,
        fillLinearGradientEndPoint: { x: 10, y: 0 },
        fillLinearGradientColorStops: [0, 'red', 1, 'red'],
      });
    Konva.setCanvasBackend(nodeCanvas);
    assert.deepEqual(pixelAt(gradientRect(), 5, 5), [255, 0, 0, 255]);
    // a canvas library ignores a gradient made by another one
    Konva.setCanvasBackend(skiaCanvas);
    assert.deepEqual(pixelAt(gradientRect(), 5, 5), [255, 0, 0, 255]);
  });

  it('checks CSS filter support again for a new backend', function () {
    const grayRect = () => {
      const rect = new Konva.Rect({
        width: 10,
        height: 10,
        fill: 'red',
        filters: ['grayscale(1)'],
      });
      rect.cache({ pixelRatio: 1 });
      return rect;
    };
    const assertGray = ([r, g, b]: number[]) => {
      assert.equal(r, g);
      assert.equal(g, b);
    };
    Konva.setCanvasBackend(skiaCanvas);
    assertGray(pixelAt(grayRect(), 5, 5));
    // node-canvas has no ctx.filter, so the filter takes the fallback
    Konva.setCanvasBackend(nodeCanvas);
    assertGray(pixelAt(grayRect(), 5, 5));
  });

  it('transforms node-canvas patterns while another library owns the global DOMMatrix', function () {
    const globalDOMMatrix = globalThis.DOMMatrix;
    globalThis.DOMMatrix = SkiaDOMMatrix as any;
    try {
      Konva.setCanvasBackend(nodeCanvas);
      const rect = new Konva.Rect({
        width: 10,
        height: 10,
        fillPatternImage: stripesCanvas(),
        fillPatternX: 5,
      });
      // node-canvas rejects a DOMMatrix of another library
      assert.deepEqual(pixelAt(rect, 1, 5), [0, 0, 255, 255]);
    } finally {
      globalThis.DOMMatrix = globalDOMMatrix;
    }
  });
});
