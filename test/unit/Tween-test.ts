import { assert } from 'chai';

import { addStage, Konva } from './test-utils.ts';

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

    assert.equal(Konva.Tween.tweens[circle._id], undefined);
    assert.equal(Konva.Tween.attrs[circle._id], undefined);
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

  it('tween to a color it can not parse tells which color it is', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
    });
    layer.add(circle);
    stage.add(layer);

    assert.throws(function () {
      new Konva.Tween({
        node: circle,
        duration: 0.1,
        fill: 'rgb(a, b, c)',
      });
    }, /can not tween the color "rgb\(a, b, c\)"/);
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
    var c = Konva.Util.colorToRGBA('rgba(0,255,0,0.5)')!;
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
        // a finished tween holds the requested values, not the interpolated ones
        assert.deepEqual(endFill, circle.fillLinearGradientColorStops());
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
        assert.equal(Konva.Tween.attrs[circle._id], undefined);
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

  it('to method double simple usage', function (done) {
    var stage = addStage();

    let finishCount = 0;
    const onFinish = () => {
      if (finishCount === 2) {
        done();
      }
    };
    stage.to({
      x: 10,
      duration: 0.001,
      onFinish: () => {
        assert(stage.x() === 10);
        finishCount += 1;
        onFinish();
      },
    });
    stage.to({
      y: 10,
      duration: 0.001,
      onFinish: () => {
        finishCount += 1;
        onFinish();
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
      // add another attribute for better test of cleanup
      x: 10,
      duration: 0.1,
      onFinish: function () {
        assert.deepEqual(
          line.points(),
          [100, 100, 200, 100, 200, 200, 100, 200]
        );
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
        assert.deepEqual(
          line.points(),
          [100, 100, 200, 100, 200, 200, 100, 200]
        );
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

  it('onUpdate and onReset are callbacks, not tweened attributes', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20, fill: 'green' });
    layer.add(circle);
    stage.add(layer);

    var updates = 0;
    circle.to({
      x: 100,
      duration: 0.05,
      onUpdate: function () {
        updates++;
      },
      onReset: function () {},
      onFinish: function () {
        assert.isAbove(updates, 0);
        assert.equal(circle.getAttr('onUpdate'), undefined);
        assert.equal(circle.getAttr('onReset'), undefined);
        done();
      },
    });
  });

  it('destroying a tween keeps the ownership of the other tweens on the node', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({ x: 0, y: 0, radius: 20, fill: 'green' });
    layer.add(circle);
    stage.add(layer);

    var tweenX = new Konva.Tween({ node: circle, x: 200, duration: 1 });
    var tweenY = new Konva.Tween({ node: circle, y: 200, duration: 1 });
    tweenX.play();
    tweenY.play();
    tweenX.destroy();

    // a new tween on y must take y over from the still running tweenY
    var tweenY2 = new Konva.Tween({ node: circle, y: 50, duration: 0.05 });
    tweenY2.play();

    setTimeout(function () {
      assert.equal(circle.y(), 50);
      // destroying the taking-over tween first must still release everything
      tweenY2.destroy();
      tweenY.destroy();
      assert.equal(Konva.Tween.tweens[circle._id], undefined);
      assert.equal(Konva.Tween.attrs[circle._id], undefined);
      done();
    }, 300);
  });

  it('destroying a node destroys its tweens', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle);

    var tween = new Konva.Tween({
      node: circle,
      duration: 1,
      x: 100,
      yoyo: true,
    });
    tween.play();
    assert.equal(tween.anim.isRunning(), true);

    circle.destroy();
    assert.equal(tween.anim.isRunning(), false);
    assert.equal(Konva.Tween.tweens[circle._id], undefined);
    assert.equal(Konva.Tween.attrs[circle._id], undefined);
  });

  it('a tween is held by its node only while it runs', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle);

    var tween = new Konva.Tween({ node: circle, duration: 1, x: 100 });
    assert.isUndefined(circle.eventListeners.destroy);
    tween.play();
    assert.equal(circle.eventListeners.destroy.length, 1);
    tween.play();
    assert.equal(circle.eventListeners.destroy.length, 1);
    tween.finish();
    assert.isUndefined(circle.eventListeners.destroy);
  });

  it('destroying a clone of the node does not touch the tween of the original', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle);

    var tween = new Konva.Tween({ node: circle, duration: 1, x: 100 });
    tween.play();
    var clone = circle.clone();
    layer.add(clone);
    clone.destroy();
    assert.equal(tween.anim.isRunning(), true);
    tween.seek(0.5);
    tween.destroy();
  });

  it('tweening a component attribute animates its components', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle);

    var tween = new Konva.Tween({
      node: circle,
      duration: 1,
      scale: { x: 3, y: 5 },
      offset: { x: 10, y: 20 },
    });
    tween.seek(0.5);
    assert.equal(circle.scaleX(), 2);
    assert.equal(circle.scaleY(), 3);
    assert.equal(circle.offsetX(), 5);
    assert.equal(circle.offsetY(), 10);
    tween.finish();
    assert.deepEqual(circle.scale(), { x: 3, y: 5 });
    assert.deepEqual(
      Object.keys(circle.attrs).filter((key) => /^(scale|offset)\d/.test(key)),
      []
    );
    tween.destroy();
  });

  it('tweening an array attribute the node does not have yet starts from zeros', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle);

    var tween = new Konva.Tween({
      node: circle,
      duration: 1,
      weights: [10, 20],
    } as any);
    tween.seek(0.5);
    assert.deepEqual(circle.getAttr('weights'), [5, 10]);
    tween.destroy();
  });

  it('to() does not mutate its params, so they can be reused', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle1 = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    var circle2 = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle1, circle2);

    var finished = 0;
    var params = {
      x: 100,
      duration: 0.01,
      onFinish: function () {
        finished += 1;
        if (finished === 2) {
          assert.equal(circle1.x(), 100);
          assert.equal(circle2.x(), 100);
          done();
        }
      },
    };
    circle1.to(params);
    assert.equal((params as any).node, undefined);
    circle2.to(params);
  });

  it('onReset is called with the tween as this, like onFinish and onUpdate', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 10, fill: 'red' });
    layer.add(circle);
    stage.add(layer);

    var receivers: any[] = [];
    var tween = new Konva.Tween({
      node: circle,
      duration: 1,
      x: 100,
      onReset: function () {
        receivers.push(this);
      },
    });
    tween.seek(0.5);
    tween.reset();
    assert.equal(receivers.length, 1);
    assert.equal(receivers[0], tween);
    tween.destroy();
  });

  it('tweening a gradient does not modify the color stops of the node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var stops = [0, 'red', 1, 'blue'];
    var rect = new Konva.Rect({
      width: 50,
      height: 50,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 50, y: 0 },
      fillLinearGradientColorStops: stops,
    });
    layer.add(rect);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: rect,
      duration: 1,
      fillLinearGradientColorStops: [0, 'green', 1, 'yellow'],
    });
    tween.seek(0.5);
    assert.deepEqual(stops, [0, 'red', 1, 'blue']);
    tween.destroy();
  });

  it('pause() inside onUpdate stops the animation', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 10, fill: 'red' });
    layer.add(circle);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: circle,
      duration: 1,
      x: 100,
      onUpdate: function () {
        tween.pause();
      },
    });
    tween.play();
    assert.equal(tween.anim.isRunning(), false);
    assert.equal(circle.eventListeners['destroy'], undefined);
    tween.destroy();
  });

  it('destroy() inside onUpdate is not undone, and finish() stays safe', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 10, fill: 'red' });
    layer.add(circle);
    stage.add(layer);

    var finished = 0;
    var tween = new Konva.Tween({
      node: circle,
      duration: 1,
      x: 100,
      onUpdate: function () {
        tween.destroy();
      },
      onFinish: function () {
        finished += 1;
      },
    });
    tween.play();
    assert.equal(tween.anim.isRunning(), false);
    assert.equal(circle.eventListeners['destroy'], undefined);

    tween.finish();
    tween.reset();
    assert.equal(finished, 0);
  });

  it('tweening a stroke gradient interpolates its color stops', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      width: 50,
      height: 50,
      strokeLinearGradientStartPoint: { x: 0, y: 0 },
      strokeLinearGradientEndPoint: { x: 50, y: 0 },
      strokeLinearGradientColorStops: [0, 'red', 1, 'blue'],
    });
    layer.add(rect);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: rect,
      duration: 1,
      strokeLinearGradientColorStops: [0, 'green', 1, 'yellow'],
    });
    tween.seek(0.5);
    assert.deepEqual(rect.strokeLinearGradientColorStops(), [
      0,
      'rgba(128,64,0,1)',
      1,
      'rgba(128,128,128,1)',
    ]);
    layer.draw();
    tween.destroy();
  });

  it('tween an array attribute to a shorter one', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      width: 50,
      height: 50,
      stroke: 'black',
      dash: [10, 5, 2, 2],
    });
    layer.add(rect);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: rect,
      duration: 1,
      dash: [10, 5],
    });
    tween.seek(0.5);
    assert.deepEqual(rect.dash(), [10, 5, 1, 1]);
    tween.finish();
    assert.deepEqual(rect.dash(), [10, 5]);
    tween.reset();
    assert.deepEqual(rect.dash(), [10, 5, 2, 2]);
    tween.destroy();
  });

  it('tween between a scalar attribute and an array one', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({ width: 50, height: 50, cornerRadius: 5 });
    layer.add(rect);
    stage.add(layer);

    var tween = new Konva.Tween({
      node: rect,
      duration: 1,
      cornerRadius: [10, 10, 10, 10],
    });
    tween.seek(0.5);
    assert.deepEqual(rect.cornerRadius(), [7.5, 7.5, 7.5, 7.5]);
    tween.finish();
    assert.deepEqual(rect.cornerRadius(), [10, 10, 10, 10]);
    tween.reset();
    assert.equal(rect.cornerRadius(), 5);
    tween.destroy();

    rect.cornerRadius([10, 20, 30, 40]);
    var tweenBack = new Konva.Tween({
      node: rect,
      duration: 1,
      cornerRadius: 10,
    });
    tweenBack.seek(0.5);
    assert.deepEqual(rect.cornerRadius(), [10, 15, 20, 25]);
    tweenBack.finish();
    assert.equal(rect.cornerRadius(), 10);
    tweenBack.reset();
    assert.deepEqual(rect.cornerRadius(), [10, 20, 30, 40]);
    tweenBack.destroy();
  });

  it('node.to() returns the tween', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 10, fill: 'red' });
    layer.add(circle);
    stage.add(layer);

    var tween = circle.to({
      x: 100,
      duration: 1,
      easing: Konva.Easings.EaseIn,
      yoyo: false,
    });
    assert.instanceOf(tween, Konva.Tween);
    tween.finish();
    assert.equal(circle.x(), 100);
  });
});
