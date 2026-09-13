import { assert } from 'chai';
import { addStage, Konva, countCalls } from './test-utils.ts';
import { SceneCanvas } from '../../src/Canvas.ts';

describe('Canvas', function () {
  // ======================================================
  it('pixel ratio', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 4,
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    stage.width(578 / 2);
    stage.height(100);

    stage.draw();
    assert.equal(layer.getCanvas().getPixelRatio(), Konva.pixelRatio);

    layer.getCanvas().setPixelRatio(1);
    assert.equal(layer.getCanvas().getPixelRatio(), 1);
    assert.equal(layer.getCanvas().width, 289);
    assert.equal(layer.getCanvas().height, 100);

    layer.getCanvas().setPixelRatio(2);
    assert.equal(layer.getCanvas().getPixelRatio(), 2);
    assert.equal(layer.getCanvas().width, 578);
    assert.equal(layer.getCanvas().height, 200);

    layer.draw();
  });

  it('setSize() sizes the bitmap and scales the context once', function () {
    var canvas = new SceneCanvas({ width: 10, height: 10, pixelRatio: 2 });
    const scales = countCalls(canvas.getContext()._context, 'scale', () => {
      canvas.setSize(100, 50);
    });

    assert.equal(canvas.width, 200);
    assert.equal(canvas.height, 100);
    assert.equal(canvas._canvas.width, 200);
    assert.equal(canvas._canvas.height, 100);
    assert.equal(canvas._canvas.style.width, '100px');
    assert.equal(canvas._canvas.style.height, '50px');
    assert.equal(scales, 1);
  });

  it('the size follows the bitmap, which truncates at a fractional pixel ratio', function () {
    var canvas = new SceneCanvas({ width: 101, height: 51, pixelRatio: 1.5 });
    assert.equal(canvas.width, 151);
    assert.equal(canvas.height, 76);
    assert.equal(canvas.width, canvas._canvas.width);
    assert.equal(canvas.height, canvas._canvas.height);
  });

  it('setSizeIfChanged() leaves the bitmap alone for the same size, including a NaN one', function () {
    var canvas = new SceneCanvas({ width: 10, height: 10, pixelRatio: 2 });
    var sets = countCalls(canvas, 'setSize', () => {
      canvas.setSizeIfChanged(100, 50);
      canvas.setSizeIfChanged(100, 50);
      canvas.setSizeIfChanged(NaN, NaN);
      canvas.setSizeIfChanged(NaN, NaN);
    });
    assert.equal(sets, 2);
  });

  it('setSize() reports a non-finite size and falls back to an empty canvas', function () {
    var canvas = new SceneCanvas({ width: 10, height: 10, pixelRatio: 2 });
    var errors = countCalls(Konva.Util, 'error', () => {
      canvas.setSize(NaN, 50);
    });
    assert.equal(errors, 1);
    assert.equal(canvas.width, 0);
    assert.equal(canvas.height, 0);
    assert.equal(canvas._canvas.style.width, '0px');

    errors = countCalls(Konva.Util, 'error', () => {
      canvas.setSize(100, Infinity);
    });
    assert.equal(errors, 1);
    assert.equal(canvas._canvas.width, 0);

    // undefined and null still mean 0, silently
    errors = countCalls(Konva.Util, 'error', () => {
      canvas.setSize(undefined, null);
    });
    assert.equal(errors, 0);
    assert.equal(canvas.width, 0);
  });

  it('setPixelRatio(), setWidth() and setHeight() keep the logical size at a fractional pixel ratio', function () {
    var canvas = new SceneCanvas({ width: 101, height: 51, pixelRatio: 1.5 });
    canvas.setPixelRatio(2);
    assert.equal(canvas.width, 202);
    assert.equal(canvas.height, 102);
    assert.equal(canvas._canvas.style.width, '101px');
    assert.equal(canvas._canvas.style.height, '51px');

    canvas.setPixelRatio(1.5);
    canvas.setWidth(200);
    assert.equal(canvas.width, 300);
    assert.equal(canvas.height, 76);
    assert.equal(canvas._canvas.style.height, '51px');
    canvas.setHeight(100);
    assert.equal(canvas.height, 150);
    assert.equal(canvas._canvas.style.width, '200px');
  });

  it('a Konva.pixelRatio reset to undefined or 0 falls back to the device pixel ratio', function () {
    var ratio = Konva.pixelRatio;
    try {
      [undefined, 0, null].forEach((bad: any) => {
        Konva.pixelRatio = bad;
        var canvas = new SceneCanvas({ width: 10, height: 10 });
        assert.isAbove(canvas.getPixelRatio(), 0, String(bad));
        assert.equal(canvas.width, 10 * canvas.getPixelRatio());
      });
    } finally {
      Konva.pixelRatio = ratio;
    }
  });
});

describe('Canvas export errors', function () {
  it('toDataURL throws when both encoding attempts fail', function () {
    const canvas = new SceneCanvas({ width: 1, height: 1 });
    const error = new Error('tainted canvas');
    canvas._canvas.toDataURL = () => {
      throw error;
    };
    try {
      assert.throws(() => canvas.toDataURL('image/png', 1), 'tainted canvas');
    } finally {
      Konva.Util.releaseCanvas(canvas._canvas);
    }
  });
});

describe('Canvas smoothing', function () {
  it('resizing and changing pixel ratio preserve layer smoothing', function () {
    const stage = addStage(),
      layer = new Konva.Layer({ imageSmoothingEnabled: false });
    stage.add(layer);
    layer.getCanvas().setPixelRatio(2);
    assert.isFalse(layer.getContext().imageSmoothingEnabled);
    layer.getCanvas().setSize(100, 100);
    assert.isFalse(layer.getContext().imageSmoothingEnabled);
    assert.isFalse(layer.hitCanvas.getContext().imageSmoothingEnabled);
  });
});
