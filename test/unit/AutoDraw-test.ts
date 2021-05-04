import { assert } from 'chai';
import { addStage, isNode, Konva } from './utis';

describe('AutoDraw', function () {
  // ======================================================
  it('schedule draw on shape add/change/remove', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    let callCount = 0;
    layer.batchDraw = function () {
      callCount += 1;
      Konva.Layer.prototype.batchDraw.call(this);
      return layer;
    };
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });
    layer.add(circle);
    assert.equal(callCount, 1);
    circle.radius(50);
    assert.equal(callCount, 2);
    circle.destroy();
    assert.equal(callCount, 3);
  });

  // ======================================================
  it('schedule draw on order change', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });
    layer.add(circle);

    var circle2 = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });
    layer.add(circle2);

    let callCount = 0;
    layer.batchDraw = function () {
      callCount += 1;
      Konva.Layer.prototype.batchDraw.call(this);
      return layer;
    };

    circle.moveToTop();
    assert.equal(callCount, 1);
  });

  // ======================================================
  it('schedule draw on cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });
    layer.add(circle);

    let callCount = 0;
    layer.batchDraw = function () {
      callCount += 1;
      Konva.Layer.prototype.batchDraw.call(this);
      return layer;
    };

    circle.cache();
    assert.equal(callCount, 1);

    circle.clearCache();
    assert.equal(callCount, 2);
  });

  // ======================================================
  it('redraw for images', function (done) {
    // don't test on node, because of specific url access
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    const { src } = document.getElementById(
      'darth-vader.jpg'
    ) as HTMLImageElement;

    const img = new Image();
    img.src = src;
    const image = new Konva.Image({
      image: img,
    });
    layer.add(image);

    let callCount = 0;
    layer.batchDraw = function () {
      callCount += 1;
      Konva.Layer.prototype.batchDraw.call(this);
      return layer;
    };

    img.onload = () => {
      assert.equal(callCount, 1);
      done();
    };
  });
});
