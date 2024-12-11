import { assert } from 'chai';

import { addStage, Konva, loadImage } from './test-utils';

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
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
          ],
          kicking: [
            0,
            109,
            45,
            98,
            45,
            109,
            45,
            98,
            95,
            109,
            63,
            98,
            156,
            109,
            70,
            98,
            229,
            109,
            60,
            98,
            287,
            109,
            41,
            98,
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

      sprite.start();

      // kick once
      setTimeout(function () {
        sprite.animation('kicking');
        sprite.on('indexChange', function (evt) {
          if (evt['newVal'] === 0 && this.animation() === 'kicking') {
            sprite.animation('standing');
          }
        });
      }, 2000);
      setTimeout(function () {
        sprite.stop();
      }, 3000);

      done();
    });
  });

  // ======================================================
  it('don`t update layer too many times', function (done) {
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
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
          ],
        },
        frameRate: 5,
        draggable: true,
        shadowColor: 'black',
        shadowBlur: 3,
        shadowOffset: { x: 3, y: 1 },
        shadowOpacity: 0.3,
      });

      layer.add(sprite);
      stage.add(layer);

      var oldDraw = layer.draw;
      var updateCount = 0;
      layer.draw = function () {
        updateCount++;
        oldDraw.call(layer);
        return layer;
      };

      sprite.start();
      setTimeout(function () {
        sprite.stop();
        assert.equal(updateCount < 7, true);
        done();
      }, 1000);
    });
  });

  // ======================================================
  it('don`t update layer too many times 2', function (done) {
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
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
          ],
        },
        frameRate: 5,
      });

      var sprite2 = new Konva.Sprite({
        x: 200,
        y: 50,
        image: imageObj,
        animation: 'standing',
        animations: {
          standing: [
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
          ],
        },
        frameRate: 20,
      });

      layer.add(sprite).add(sprite2);
      stage.add(layer);

      var oldDraw = layer.draw;
      var updateCount = 0;
      layer.draw = function () {
        updateCount++;
        oldDraw.call(layer);
        return layer;
      };

      sprite.start();
      sprite2.start();
      setTimeout(function () {
        sprite.stop();
        sprite2.stop();
        assert.equal(updateCount > 15, true);
        assert.equal(updateCount < 27, true);
        done();
      }, 1000);
    });
  });

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
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
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
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
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

  // need fix.
  it.skip('can change frame rate on fly', function (done) {
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
            0,
            0,
            49,
            109,
            52,
            0,
            49,
            109,
            105,
            0,
            49,
            109,
            158,
            0,
            49,
            109,
            210,
            0,
            49,
            109,
            262,
            0,
            49,
            109,
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
      assert.equal(sprite.frameRate(), 50);
      setTimeout(function () {
        sprite.frameRate(100);
        assert.equal(sprite.frameRate(), 100);
        assert.equal(sprite.anim.isRunning(), false, '1');
      }, 23);

      setTimeout(function () {
        sprite.start();
        sprite.frameRate(52);
        assert.equal(sprite.anim.isRunning(), true);
        // for this moment should tick more than 2 times
        // make sure that sprite is not restating after set frame rate
        assert.equal(sprite.frameIndex() > 2, true, '2');
        done();
      }, 68);
    });
  });
});
