import { assert } from 'chai';

import { addStage, Konva } from './test-utils';

describe('Tween', function () {
  // ======================================================
  it('tween node', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var finishCount = 0;
    var onFinish = function () {
      assert(++finishCount <= 1, 'finishCount should not exceed 1');
      done();
    };

    var tweens = 0;
    var attrs = 0;

    for (var key in Konva.Tween.tweens) {
      tweens++;
    }
    for (var key in Konva.Tween.attrs) {
      attrs++;
    }

    assert.equal(tweens, 0);
    assert.equal(attrs, 0);

    var tween = new Konva.Tween({
      node: circle,
      duration: 0.2,
      x: 200,
      y: 100,
      onFinish: onFinish,
    }).play();

    var tweens = 0;
    var attrs = 0;
    for (var key in Konva.Tween.tweens) {
      tweens++;
    }
    for (var key in Konva.Tween.attrs[circle._id][tween._id]) {
      attrs++;
    }

    assert.equal(tweens, 1);
    assert.equal(attrs, 2);

    assert.notEqual(Konva.Tween.attrs[circle._id][tween._id].x, undefined);
    assert.notEqual(Konva.Tween.attrs[circle._id][tween._id].y, undefined);
  });

  // ======================================================
  it('destroy tween while tweening', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: circle,
      duration: 0.2,
      x: 200,
      y: 100,
    }).play();

    // start/diff object = attrs.nodeId.tweenId.attr
    // tweenId = tweens.nodeId.attr

    assert.notEqual(tween._id, undefined);
    assert.equal(Konva.Tween.tweens[circle._id].x, tween._id);
    assert.notEqual(Konva.Tween.attrs[circle._id][tween._id], undefined);

    tween.destroy();

    assert.equal(Konva.Tween.tweens[circle._id].x, undefined);
    assert.equal(Konva.Tween.attrs[circle._id][tween._id], undefined);
  });

  // ======================================================
  it('zero duration', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: circle,
      duration: 0,
      x: 200,
      y: 100,
    });
    tween.play();

    setTimeout(function () {
      assert.equal(circle.x(), 200);
      assert.equal(circle.y(), 100);
      done();
    }, 60);
  });

  it('color tweening', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var duration = 0.1;
    var c = Konva.Util.colorToRGBA('rgba(0,255,0,0.5)');
    var endFill = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
    var midFill = 'rgba(128,128,0,0.75)';

    var tween = new Konva.Tween({
      node: circle,
      duration: duration,
      fill: endFill,
      onFinish: function () {
        assert.equal(endFill, circle.fill());
        done();
      },
    });

    tween.seek(duration * 0.5);
    assert.equal(midFill, circle.fill());

    tween.seek(0);
    tween.play();
  });

  it('gradient tweening', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fillLinearGradientStartPoint: { x: -50, y: -50 },
      fillLinearGradientEndPoint: { x: 50, y: 50 },
      fillLinearGradientColorStops: [0, 'red', 0.5, 'blue'],
    });

    layer.add(circle);
    stage.add(layer);

    var duration = 0.1;
    var endFill = [0.5, 'red', 1, 'black'];

    var tween = new Konva.Tween({
      node: circle,
      duration: duration,
      fillLinearGradientColorStops: endFill,
      onFinish: function () {
        assert.deepEqual(
          [0.5, 'rgba(255,0,0,1)', 1, 'rgba(0,0,0,1)'],
          circle.fillLinearGradientColorStops()
        );
        done();
      },
    });

    tween.seek(duration * 0.5);
    assert.deepEqual(
      [0.25, 'rgba(255,0,0,1)', 0.75, 'rgba(0,0,128,1)'],
      circle.fillLinearGradientColorStops()
    );

    tween.seek(0);
    tween.play();
  });

  it('to method', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      radius: 70,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    circle.to({
      x: stage.width() / 2,
      y: stage.height() / 2,
      duration: 0.1,
      onFinish: function () {
        assert.equal(circle.x(), stage.width() / 2);
        assert.equal(Object.keys(Konva.Tween.attrs[circle._id]).length, 0);
        done();
      },
    });
  });

  it('to method simple usage', function (done) {
    var stage = addStage();

    stage.to({
      x: 10,
      duration: 0.001,
      onFinish: () => {
        assert(stage.x() === 10);
        done();
      },
    });
  });

  it('tween to call update callback', function (done) {
    var stage = addStage();
    var updateCount = 0;

    stage.to({
      x: 10,
      duration: 0.1,
      onUpdate: function () {
        updateCount++;
      },
      onFinish: function () {
        assert(updateCount > 2);
        done();
      },
    });
  });

  it('prepare array closed', function () {
    var start = [0, 0, 10, 0, 10, 10];
    var end = [0, 0, 10, 0, 10, 10, 0, 10];
    var newStart = Konva.Util._prepareArrayForTween(start, end, true);
    assert.deepEqual(newStart, [0, 0, 10, 0, 10, 10, 5, 5]);
  });

  it('prepare array - opened', function () {
    var start = [0, 0, 10, 0, 10, 10, 0, 10];
    var end = [0, 0, 10, 0, 7, 9];
    end = Konva.Util._prepareArrayForTween(start, end, false);
    assert.deepEqual(end, [0, 0, 10, 0, 7, 9, 7, 9]);
  });

  it('tween array with bigger size', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var line = new Konva.Line({
      stroke: 'black',
      points: [100, 100, 200, 100, 200, 200],
      closed: true,
    });
    layer.add(line);

    line.to({
      points: [100, 100, 200, 100, 200, 200, 100, 200],
      duration: 0.1,
      onFinish: function () {
        assert.deepEqual(line.points(), [
          100,
          100,
          200,
          100,
          200,
          200,
          100,
          200,
        ]);
        done();
      },
    });
  });

  it('tween array to lower size', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var line = new Konva.Line({
      stroke: 'black',
      points: [100, 100, 200, 100, 200, 200, 100, 200],
      closed: true,
    });
    layer.add(line);

    line.to({
      points: [100, 100, 200, 100, 200, 200],
      duration: 0.1,
      onFinish: function () {
        assert.deepEqual(line.points(), [100, 100, 200, 100, 200, 200]);
        done();
      },
    });
  });

  it('tween array to lower size and go back', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var line = new Konva.Line({
      stroke: 'black',
      points: [100, 100, 200, 100, 200, 200, 100, 200],
      closed: true,
    });
    layer.add(line);

    var tween = new Konva.Tween({
      node: line,
      points: [100, 100, 200, 100, 200, 200],
      duration: 0.01,
      onFinish: function () {
        tween.reverse();
      },
      onReset: function () {
        assert.deepEqual(line.points(), [
          100,
          100,
          200,
          100,
          200,
          200,
          100,
          200,
        ]);
        done();
      },
    });
    tween.play();
  });

  it('tween array to bigger size and go back', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var line = new Konva.Line({
      stroke: 'black',
      points: [100, 100, 200, 100, 200, 200],
      closed: true,
    });
    layer.add(line);

    var tween = new Konva.Tween({
      node: line,
      points: [100, 100, 200, 100, 200, 200, 100, 200],
      duration: 0.01,
      onFinish: function () {
        tween.reverse();
      },
      onReset: function () {
        assert.deepEqual(line.points(), [100, 100, 200, 100, 200, 200]);
        done();
      },
    });
    tween.play();
  });
});
