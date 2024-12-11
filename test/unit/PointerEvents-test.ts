import { assert } from 'chai';

import {
  addStage,
  Konva,
  simulatePointerDown,
  simulatePointerMove,
  simulatePointerUp,
} from './test-utils';

describe.skip('PointerEvents', function () {
  // ======================================================
  it('pointerdown pointerup pointermove', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // mobile events
    var pointerdown = false;
    var pointerup = false;
    var pointermove = false;

    /*
     * mobile
     */
    circle.on('pointerdown', function () {
      pointerdown = true;
    });

    circle.on('pointerup', function () {
      pointerup = true;
    });

    circle.on('pointermove', function () {
      pointermove = true;
    });

    layer.add(circle);
    stage.add(layer);

    // touchstart circle
    simulatePointerDown(stage, {
      x: 289,
      y: 100,
    });

    assert(pointerdown, '1) pointerdown should be true');
    assert(!pointermove, '1) pointermove should be false');
    assert(!pointerup, '1) pointerup should be false');

    // pointerup circle
    simulatePointerUp(stage, {
      x: 289,
      y: 100,
    });

    assert(pointerdown, '2) pointerdown should be true');
    assert(!pointermove, '2) pointermove should be false');
    assert(pointerup, '2) pointerup should be true');

    // pointerdown circle
    simulatePointerDown(stage, {
      x: 289,
      y: 100,
    });

    assert(pointerdown, '3) pointerdown should be true');
    assert(!pointermove, '3) pointermove should be false');
    assert(pointerup, '3) pointerup should be true');

    // pointerup circle to triger dbltap
    simulatePointerUp(stage, {
      x: 289,
      y: 100,
    });
    // end drag is tied to document mouseup and pointerup event
    // which can't be simulated.  call _endDrag manually
    //Konva.DD._endDrag();

    assert(pointerdown, '4) pointerdown should be true');
    assert(!pointermove, '4) pointermove should be false');
    assert(pointerup, '4) pointerup should be true');

    setTimeout(function () {
      // pointermove circle
      simulatePointerMove(stage, {
        x: 290,
        y: 100,
      });

      assert(pointerdown, '5) pointerdown should be true');
      assert(pointermove, '5) pointermove should be true');
      assert(pointerup, '5) pointerup should be true');

      done();
    }, 17);
  });

  // ======================================================
  it.skip('pointer capture', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    var circle2 = new Konva.Circle({
      x: stage.width() / 2,
      y: 20,
      radius: 20,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // mobile events
    var downCount = 0;
    var otherDownCount = 0;

    var pointerup = false;
    var pointermove = false;

    circle2.on('pointerdown', function () {
      otherDownCount++;
    });

    circle.on('pointerdown', function (event) {
      downCount++;
      this.setPointerCapture(event['pointerId']);
    });

    circle.on('pointerup', function (evt) {
      assert(
        this.hasPointerCapture(evt['pointerId']),
        'circle released capture'
      );
      pointerup = true;
    });

    circle.on('pointermove', function (evt) {
      assert(this.hasPointerCapture(evt['pointerId']), 'circle has capture');
      pointermove = true;
    });

    layer.add(circle);
    layer.add(circle2);
    stage.add(layer);

    // on circle 2 to confirm it works
    simulatePointerDown(stage, {
      x: 289,
      y: 10,
      pointerId: 0,
      preventDefault: function () {},
    });

    assert.equal(otherDownCount, 1, '6) otherDownCount should be 1');
    assert(downCount === 0, '6) downCount should be 0');
    assert(!pointermove, '6) pointermove should be false');
    assert(!pointerup, '6) pointerup should be false');

    // on circle with capture
    simulatePointerDown(stage, {
      x: 289,
      y: 100,
      pointerId: 1,
      preventDefault: function () {},
    });

    assert.equal(otherDownCount, 1, '7) otherDownCount should be 1');
    assert(downCount === 1, '7) downCount should be 1');
    assert(!pointermove, '7) pointermove should be false');
    assert(!pointerup, '7) pointerup should be true');

    // second pointerdown
    simulatePointerDown(stage, {
      x: 289,
      y: 10,
      pointerId: 2,
      preventDefault: function () {},
    });

    assert.equal(otherDownCount, 1, '8) otherDownCount should be 1');
    assert(downCount === 2, '8) pointerdown should be 2');
    assert(!pointermove, '8) pointermove should be false');
    assert(!pointerup, '8) pointerup should be true');

    setTimeout(function () {
      // pointermove over circle 2
      simulatePointerMove(stage, {
        x: 290,
        y: 10,
        pointerId: 1,
      });

      assert(otherDownCount === 1, '9) otherDownCount should be 1');
      assert(pointermove, '9) pointermove should be true');

      simulatePointerUp(stage, {
        pointerId: 1,
        preventDefault: function () {},
      });

      simulatePointerDown(stage, {
        x: 289,
        y: 10,
        pointerId: 1,
        preventDefault: function () {},
      });

      assert(otherDownCount === 2, '10) otherDownCount should be 1');
      assert(pointerup, '10) pointerup should be true');

      done();
    }, 17);
  });
});
