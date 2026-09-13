import { assert } from 'chai';

import { addStage, Konva, loadImage } from './test-utils.ts';

describe('Sprite', function () {
  // ======================================================
  it('add sprite', function (done) {
    loadImage('scorpion-sprite.png', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();

      var sprite = new Konva.Sprite({
        x: 200,
        y: 50,
        image: imageObj,
        animation: 'standing',
        animations: {
          standing: [
            0, 0, 49, 109, 52, 0, 49, 109, 105, 0, 49, 109, 158, 0, 49, 109,
            210, 0, 49, 109, 262, 0, 49, 109,
          ],
        },
        frameRate: 10,
        draggable: true,
        shadowColor: 'black',
        shadowBlur: 3,
        shadowOffset: { x: 3, y: 1 },
        shadowOpacity: 0.3,
      });

      layer.add(sprite);
      stage.add(layer);

      assert.equal(sprite.getClassName(), 'Sprite');
      assert.equal(sprite.frameIndex(), 0);

      var trace = layer.hitCanvas.getContext().getTrace();

      assert.equal(trace.indexOf(sprite.colorKey) >= 0, true);

      done();
    });
  });

  for (const count of [1, 2]) {
    it(`${count} running sprites redraw their layer only when frames change`, async function () {
      const image = await new Promise<HTMLImageElement>((resolve) =>
        loadImage('scorpion-sprite.png', resolve)
      );
      const stage = addStage();
      const layer = new Konva.Layer();
      stage.add(layer);
      const sprites = Array.from(
        { length: count },
        () =>
          new Konva.Sprite({
            image,
            animation: 'standing',
            animations: { standing: [0, 0, 49, 109, 52, 0, 49, 109] },
            // Advance frames explicitly during this test, before the next timed frame.
            frameRate: 1 / 60,
          })
      );
      const autoDraw = Konva.autoDrawEnabled;
      Konva.autoDrawEnabled = false;
      const advanceDrawing = async () => {
        for (let i = 0; i < 3; i++) {
          await new Promise<void>((resolve) =>
            Konva.Util.requestAnimFrame(resolve)
          );
        }
      };
      try {
        layer.add(...sprites);
        sprites.forEach((sprite) => sprite.start());
        await advanceDrawing();
        let draws = 0;
        layer.on('draw', () => draws++);
        await advanceDrawing();
        assert.equal(draws, 0, 'unchanged frames do not redraw');
        sprites.forEach((sprite) => sprite.frameIndex(1));
        await advanceDrawing();
        assert.equal(draws, 1, 'frame changes share one layer redraw');
        await advanceDrawing();
        assert.equal(draws, 1, 'redrawing stops after the changed frames');
      } finally {
        sprites.forEach((sprite) => sprite.stop());
        Konva.autoDrawEnabled = autoDraw;
      }
    });
  }

  it('check is sprite running', function (done) {
    loadImage('scorpion-sprite.png', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();

      var sprite = new Konva.Sprite({
        x: 200,
        y: 50,
        image: imageObj,
        animation: 'standing',
        animations: {
          standing: [
            0, 0, 49, 109, 52, 0, 49, 109, 105, 0, 49, 109, 158, 0, 49, 109,
            210, 0, 49, 109, 262, 0, 49, 109,
          ],
        },
        frameRate: 50,
        draggable: true,
        shadowColor: 'black',
        shadowBlur: 3,
        shadowOffset: { x: 3, y: 1 },
        shadowOpacity: 0.3,
      });

      layer.add(sprite);
      stage.add(layer);
      assert.equal(sprite.isRunning(), false);
      sprite.start();
      assert.equal(sprite.isRunning(), true);
      sprite.stop();
      done();
    });
  });

  it('start do nothing if animation is already running', function (done) {
    loadImage('scorpion-sprite.png', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();

      var sprite = new Konva.Sprite({
        x: 200,
        y: 50,
        image: imageObj,
        animation: 'standing',
        animations: {
          standing: [
            0, 0, 49, 109, 52, 0, 49, 109, 105, 0, 49, 109, 158, 0, 49, 109,
            210, 0, 49, 109, 262, 0, 49, 109,
          ],
        },
        frameRate: 50,
        draggable: true,
        shadowColor: 'black',
        shadowBlur: 3,
        shadowOffset: { x: 3, y: 1 },
        shadowOpacity: 0.3,
      });

      layer.add(sprite);
      stage.add(layer);

      var counter = 0;
      sprite.on('frameIndexChange.konva', function (event) {
        counter += 1;
      });

      sprite.start();
      sprite.start();
      sprite.stop();

      setTimeout(function () {
        assert.equal(counter, 0);
        done();
      }, 200);
    });
  });

  it('changing frame rate preserves playback and the current frame', async function () {
    const sprite = new Konva.Sprite({
      image: Konva.Util.createImageElement(),
      animation: 'play',
      animations: { play: [0, 0, 1, 1, 1, 0, 1, 1, 2, 0, 1, 1, 3, 0, 1, 1] },
      frameIndex: 1,
      frameRate: 100,
    });
    const nextFrame = () =>
      new Promise<void>((resolve) => {
        sprite.on('frameIndexChange.test', () => {
          sprite.off('frameIndexChange.test');
          resolve();
        });
      });
    try {
      sprite.frameRate(50);
      assert.isFalse(sprite.isRunning());
      const started = nextFrame();
      sprite.start();
      await started;
      assert.equal(sprite.frameIndex(), 2);
      sprite.frameRate(100);
      assert.isTrue(sprite.isRunning());
      assert.equal(sprite.frameIndex(), 2);
      await nextFrame();
      assert.equal(sprite.frameIndex(), 3);
      sprite.stop();
      sprite.frameRate(25);
      assert.isFalse(sprite.isRunning());
    } finally {
      sprite.destroy();
    }
  });

  it('destroy stops the frame interval', function (done) {
    loadImage('scorpion-sprite.png', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();
      var sprite = new Konva.Sprite({
        image: imageObj,
        animation: 'standing',
        animations: {
          standing: [0, 0, 49, 109, 52, 0, 49, 109, 105, 0, 49, 109],
        },
        frameRate: 100,
      });
      layer.add(sprite);
      stage.add(layer);
      sprite.start();

      sprite.destroy();
      assert.equal(sprite.isRunning(), false);
      const frameIndex = sprite.frameIndex();
      setTimeout(() => {
        assert.equal(
          sprite.frameIndex(),
          frameIndex,
          'frame index must not advance after destroy'
        );
        done();
      }, 60);
    });
  });

  it('getSelfRect() is the box of the current frame', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var sprite = new Konva.Sprite({
      x: 10,
      y: 10,
      animation: 'standing',
      animations: { standing: [0, 0, 49, 109, 52, 0, 40, 100] },
      frameOffsets: { standing: [0, 0, 5, 7] },
      fill: 'red',
    } as any);
    layer.add(sprite);

    assert.deepEqual(sprite.getSelfRect(), {
      x: 0,
      y: 0,
      width: 49,
      height: 109,
    });
    sprite.frameIndex(1);
    assert.deepEqual(sprite.getSelfRect(), {
      x: 5,
      y: 7,
      width: 40,
      height: 100,
    });
    assert.deepEqual(sprite.getClientRect(), {
      x: 15,
      y: 17,
      width: 40,
      height: 100,
    });
    sprite.cache();
    assert.equal(sprite.isCached(), true);
  });

  it('an unknown animation or a frame past the end draws nothing instead of throwing', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var sprite = new Konva.Sprite({
      animation: 'missing',
      animations: { standing: [0, 0, 49, 109, 52, 0, 40, 100] },
      // shorter than the frames: the missing offsets are 0
      frameOffsets: { standing: [3, 4] },
      fill: 'red',
    } as any);
    layer.add(sprite);

    var empty = { x: 0, y: 0, width: 0, height: 0 };
    assert.doesNotThrow(() => layer.draw());
    assert.deepEqual(sprite.getSelfRect(), empty);
    assert.doesNotThrow(() => sprite._updateIndex());

    sprite.animation('standing');
    sprite.frameIndex(5);
    assert.doesNotThrow(() => layer.draw());
    assert.deepEqual(sprite.getSelfRect(), empty);
    sprite._updateIndex();
    assert.equal(sprite.frameIndex(), 0);

    sprite.frameIndex(-1);
    assert.deepEqual(sprite.getSelfRect(), empty);
    sprite.frameIndex(0.5);
    assert.deepEqual(sprite.getSelfRect(), empty);
    sprite.frameIndex(1);
    assert.deepEqual(sprite.getSelfRect(), {
      x: 0,
      y: 0,
      width: 40,
      height: 100,
    });
    assert.doesNotThrow(() => layer.draw());
  });
});
