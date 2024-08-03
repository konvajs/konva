import { assert } from 'chai';

import {
  addStage,
  Konva,
  simulateTouchStart,
  simulateTouchEnd,
  simulateTouchMove,
} from './test-utils';

describe('TouchEvents', function () {
  // ======================================================
  it('touchstart touchend touchmove tap dbltap', function (done) {
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
    var touchstart = false;
    var touchend = false;
    var tap = false;
    var touchmove = false;
    var dbltap = false;

    /*
     * mobile
     */
    circle.on('touchstart', function () {
      touchstart = true;
      //log('touchstart');
      //alert('touchstart')
    });

    circle.on('touchend', function () {
      touchend = true;
      //alert('touchend')
      //log('touchend');
    });

    circle.on('touchmove', function () {
      touchmove = true;
      //log('touchmove');
    });

    circle.on('tap', function (evt) {
      tap = true;
      //log('tap');
    });

    circle.on('dbltap', function () {
      dbltap = true;
      //log('dbltap');
    });

    layer.add(circle);
    stage.add(layer);

    // reset inDoubleClickWindow
    Konva._touchInDblClickWindow = false;

    // touchstart circle
    simulateTouchStart(stage, [{ x: 289, y: 100, id: 0 }]);

    assert(touchstart, '8) touchstart should be true');
    assert(!touchmove, '8) touchmove should be false');
    assert(!touchend, '8) touchend should be false');
    assert(!tap, '8) tap should be false');
    assert(!dbltap, '8) dbltap should be false');

    // touchend circle
    simulateTouchEnd(stage, [], [{ x: 289, y: 100, id: 0 }]);
    // end drag is tied to document mouseup and touchend event
    // which can't be simulated.  call _endDrag manually
    //Konva.DD._endDrag();

    assert(touchstart, '9) touchstart should be true');
    assert(!touchmove, '9) touchmove should be false');
    assert(touchend, '9) touchend should be true');
    assert(tap, '9) tap should be true');
    assert(!dbltap, '9) dbltap should be false');

    // touchstart circle
    simulateTouchStart(stage, [{ x: 289, y: 100, id: 0 }]);

    assert(touchstart, '10) touchstart should be true');
    assert(!touchmove, '10) touchmove should be false');
    assert(touchend, '10) touchend should be true');
    assert(tap, '10) tap should be true');
    assert(!dbltap, '10) dbltap should be false');

    // touchend circle to triger dbltap
    simulateTouchEnd(stage, [], [{ x: 289, y: 100, id: 0 }]);
    // end drag is tied to document mouseup and touchend event
    // which can't be simulated.  call _endDrag manually
    //Konva.DD._endDrag();

    assert(touchstart, '11) touchstart should be true');
    assert(!touchmove, '11) touchmove should be false');
    assert(touchend, '11) touchend should be true');
    assert(tap, '11) tap should be true');
    assert(dbltap, '11) dbltap should be true');

    setTimeout(function () {
      // touchmove circle
      simulateTouchMove(stage, [], [{ x: 289, y: 100, id: 0 }]);

      assert(touchstart, '12) touchstart should be true');
      assert(touchmove, '12) touchmove should be true');
      assert(touchend, '12) touchend should be true');
      assert(tap, '12) tap should be true');
      assert(dbltap, '12) dbltap should be true');

      done();
    }, 17);
  });

  it('tap on stage and second tap on shape should not trigger double tap (check after dbltap)', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var bigRect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      fill: 'yellow',
    });
    layer.add(bigRect);

    layer.draw();

    var bigClicks = 0;
    var bigDblClicks = 0;

    // make dblclick
    simulateTouchStart(stage, {
      x: 100,
      y: 100,
    });
    simulateTouchEnd(stage, {
      x: 100,
      y: 100,
    });
    simulateTouchStart(stage, {
      x: 100,
      y: 100,
    });
    simulateTouchEnd(stage, {
      x: 100,
      y: 100,
    });

    bigRect.on('tap', function () {
      bigClicks += 1;
    });

    bigRect.on('dbltap', function () {
      bigDblClicks += 1;
    });

    simulateTouchStart(stage, {
      x: 10,
      y: 10,
    });
    simulateTouchEnd(stage, {
      x: 10,
      y: 10,
    });

    assert.equal(bigClicks, 0);
    assert.equal(bigDblClicks, 0);

    simulateTouchStart(stage, {
      x: 100,
      y: 100,
    });
    simulateTouchEnd(stage, {
      x: 100,
      y: 100,
    });

    assert.equal(bigClicks, 1);
    assert.equal(bigDblClicks, 0);

    done();
  });

  // test for https://github.com/konvajs/konva/issues/156
  it('touchstart out of shape, then touch end inside shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    layer.add(circle);
    stage.add(layer);

    var circleTouchend = 0;

    circle.on('touchend', function () {
      circleTouchend++;
    });

    simulateTouchStart(stage, [{ x: 1, y: 1, id: 0 }]);
    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 0 }]);

    assert.equal(circleTouchend, 1);
  });

  it('tap on one shape, then fast tap on another shape should no trigger double tap', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    layer.add(circle1);

    var circle2 = new Konva.Circle({
      x: 200,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    layer.add(circle2);

    layer.draw();

    var circle1Tap = 0;
    var circle2Tap = 0;
    var circle2DoubleTap = 0;

    circle1.on('tap', function () {
      circle1Tap++;
    });
    circle2.on('tap', function () {
      circle2Tap++;
    });
    circle2.on('dbltap', function () {
      circle2DoubleTap++;
    });

    simulateTouchStart(stage, { x: 100, y: 100 });
    simulateTouchEnd(stage, { x: 100, y: 100 });

    assert.equal(circle1Tap, 1, 'should trigger tap on first circle');
    assert.equal(circle2Tap, 0, 'should NOT trigger tap on second circle');
    assert.equal(
      circle2DoubleTap,
      0,
      'should NOT trigger dbltap on second circle'
    );

    simulateTouchStart(stage, { x: 200, y: 100 });
    simulateTouchEnd(stage, { x: 200, y: 100 });

    assert.equal(circle1Tap, 1, 'should trigger tap on first circle');
    assert.equal(circle2Tap, 1, 'should trigger tap on second circle');
    assert.equal(
      circle2DoubleTap,
      0,
      'should NOT trigger dbltap on second circle'
    );
  });

  it('multitouch - register all touches', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle1',
      draggable: true,
    });
    layer.add(circle1);

    var circle2 = new Konva.Circle({
      x: 100,
      y: 200,
      radius: 80,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle2',
      draggable: true,
    });

    layer.add(circle2);
    layer.draw();

    var touchStart = 0;
    var touchMove = 0;
    var touchEnd = 0;
    var touchEnd2 = 0;

    circle1.on('touchstart', function () {
      touchStart++;
    });
    circle1.on('touchmove', function () {
      touchMove++;
    });
    circle1.on('touchend', function () {
      touchEnd++;
    });

    circle2.on('touchend', function () {
      touchEnd2++;
    });

    var stageTouchStart = 0;
    var stageTouchMove = 0;
    var stageTouchEnd = 0;
    var stageTap = 0;
    var stageEventStack: string[] = [];
    stage.on('touchstart', function () {
      stageTouchStart++;
      stageEventStack.push('touchstart');
    });
    stage.on('touchmove', function () {
      stageTouchMove++;
    });
    stage.on('touchend', function () {
      stageTouchEnd++;
      stageEventStack.push('touchend');
    });
    stage.on('tap', function () {
      stageTap++;
      stageEventStack.push('tap');
    });

    // start with one touch
    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    assert.equal(stageTouchStart, 1, 'trigger first touch start on stage');
    assert.equal(touchStart, 1, 'trigger first touch start on circle');

    // make second touch
    simulateTouchStart(
      stage,
      [
        { x: 100, y: 100, id: 0 },
        { x: 210, y: 100, id: 1 },
      ],
      [{ x: 210, y: 100, id: 1 }]
    );

    assert.equal(
      stageTouchStart,
      2,
      'should trigger the second touch on stage'
    );
    assert.equal(
      touchStart,
      1,
      'should not trigger the second touch start (it is outside)'
    );

    // now try to make two touches at the same time
    simulateTouchStart(
      stage,
      [
        { x: 100, y: 100, id: 0 },
        { x: 210, y: 100, id: 1 },
      ],
      [
        { x: 100, y: 100, id: 0 },
        { x: 210, y: 100, id: 1 },
      ]
    );

    assert.equal(stageTouchStart, 3, 'should trigger one more touch');
    assert.equal(
      touchStart,
      2,
      'should trigger the second touch start on the circle'
    );

    // check variables
    assert.deepEqual(stage.getPointerPosition(), { x: 100, y: 100 });
    assert.deepEqual(stage.getPointersPositions(), [
      { x: 100, y: 100, id: 0 },
      { x: 210, y: 100, id: 1 },
    ]);

    // move one finger
    simulateTouchMove(
      stage,
      [
        { x: 100, y: 100, id: 0 },
        { x: 220, y: 100, id: 1 },
      ],
      [{ x: 220, y: 100, id: 1 }]
    );
    assert.equal(touchMove, 0, 'should not trigger touch move on circle');
    assert.equal(stageTouchMove, 1, 'should trigger touch move on stage');

    // move two fingers
    simulateTouchMove(
      stage,
      [
        { x: 100, y: 100, id: 0 },
        { x: 220, y: 100, id: 1 },
      ],
      [
        { x: 100, y: 100, id: 0 },
        { x: 220, y: 100, id: 1 },
      ]
    );
    assert.equal(touchMove, 1, 'should trigger touch move on circle');
    assert.equal(
      stageTouchMove,
      2,
      'should trigger two more touchmoves on stage'
    );

    simulateTouchEnd(
      stage,
      [],
      [
        { x: 100, y: 100, id: 0 },
        { x: 220, y: 100, id: 1 },
      ]
    );
    assert.equal(touchEnd, 1);
    assert.equal(stageTouchEnd, 1);
    assert.equal(stageTap, 1, 'one tap should be fired');

    assert.equal(
      stageEventStack.join(' '),
      'touchstart touchstart touchstart touchend tap',
      'should fire tap after touchend'
    );

    // try two touch ends on both shapes
    simulateTouchEnd(
      stage,
      [],
      [
        { x: 100, y: 100, id: 0 },
        { x: 100, y: 170, id: 1 },
      ]
    );

    assert.equal(touchEnd, 2);
    assert.equal(touchEnd2, 1);
    assert.equal(stageTouchEnd, 3);
    assert.equal(stageTap, 1, 'still one tap should be fired');
    // Don't need to check event stack here, the pointers moved so no tap is fired
  });

  it.skip('letting go of two fingers quickly should not fire dbltap', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var touchend = 0;
    var dbltap = 0;

    stage.on('dbltap', function (e) {
      dbltap += 1;
    });

    stage.on('touchend', function (e) {
      touchend += 1;
    });

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    simulateTouchStart(
      stage,
      [{ x: 110, y: 110, id: 1 }],
      [{ x: 110, y: 110, id: 1 }]
    );

    assert.equal(
      touchend,
      0,
      '1) no touchend triggered after holding down two fingers'
    );
    assert.equal(
      dbltap,
      0,
      '1) no dbltap triggered after holding down two fingers'
    );

    simulateTouchEnd(
      stage,
      [{ x: 110, y: 110, id: 1 }],
      [{ x: 100, y: 100, id: 0 }]
    );
    simulateTouchEnd(stage, [], [{ x: 110, y: 110, id: 1 }]);

    assert.equal(
      touchend,
      2,
      '2) touchend triggered twice after letting go two fingers'
    );
    assert.equal(
      dbltap,
      0,
      '2) no dbltap triggered after letting go two fingers'
    );
  });

  it('can capture touch events', function () {
    Konva.capturePointerEventsEnabled = true;
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle1',
    });
    layer.add(circle1);

    layer.draw();

    var touchStart = 0;
    var touchMove = 0;
    var touchEnd = 0;

    circle1.on('touchstart', function (e) {
      touchStart++;
    });
    circle1.on('touchmove', function () {
      touchMove++;
    });
    circle1.on('touchend', function () {
      touchEnd++;
    });

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    // go out of circle
    simulateTouchMove(
      stage,
      [{ x: 180, y: 100, id: 0 }],
      [{ x: 180, y: 100, id: 0 }]
    );
    assert.equal(touchMove, 1, 'first touchmove');

    // add another finger
    simulateTouchStart(
      stage,
      [
        { x: 180, y: 100, id: 0 },
        { x: 100, y: 100, id: 1 },
      ],
      [{ x: 100, y: 100, id: 1 }]
    );

    // move all out
    simulateTouchMove(
      stage,
      [
        { x: 185, y: 100, id: 0 },
        { x: 190, y: 100, id: 1 },
      ],
      [
        { x: 185, y: 100, id: 0 },
        { x: 190, y: 100, id: 1 },
      ]
    );
    // should trigger just one more touchmove
    assert.equal(touchMove, 2, 'second touchmove');

    // remove fingers
    simulateTouchEnd(
      stage,
      [],
      [
        { x: 185, y: 100, id: 0 },
        { x: 190, y: 100, id: 1 },
      ]
    );

    assert.equal(touchEnd, 1, 'first touchend');

    // should release captures on touchend
    assert.equal(circle1.hasPointerCapture(0), false);
    assert.equal(circle1.hasPointerCapture(1), false);

    Konva.capturePointerEventsEnabled = false;
  });

  it('tap and double tap should trigger just once on stage', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle1',
    });
    layer.add(circle1);
    layer.draw();

    var tap = 0;
    var dbltap = 0;

    stage.on('tap', function (e) {
      assert.equal(e.target, circle1);
      tap += 1;
    });

    stage.on('dbltap', function (e) {
      assert.equal(e.target, circle1);
      dbltap += 1;
    });

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 0 }]);

    assert.equal(tap, 1, 'tap triggered');
    assert.equal(dbltap, 0, 'no dbltap triggered');

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 0 }]);
    assert.equal(tap, 2, 'tap triggered');
    assert.equal(dbltap, 1, 'no dbltap triggered');
  });

  it('tapping with different fingers on the different time should trigger double tap', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle1',
    });
    layer.add(circle1);
    layer.draw();

    var tap = 0;
    var dbltap = 0;

    stage.on('tap', function (e) {
      assert.equal(e.target, circle1);
      tap += 1;
    });

    stage.on('dbltap', function (e) {
      assert.equal(e.target, circle1);
      dbltap += 1;
    });

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 0 }]);

    assert.equal(tap, 1, 'tap triggered');
    assert.equal(dbltap, 0, 'no dbltap triggered');

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 1 }],
      [{ x: 100, y: 100, id: 1 }]
    );

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 1 }]);
    assert.equal(tap, 2, 'tap triggered');
    assert.equal(dbltap, 1, 'dbltap triggered');
  });

  it('drag and second tap should not trigger dbltap', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle1',
      draggable: true,
    });
    layer.add(circle1);
    layer.draw();

    var tap = 0;
    var dbltap = 0;
    var dragmove = 0;

    stage.on('tap', function (e) {
      assert.equal(e.target, circle1);
      tap += 1;
    });

    stage.on('dbltap', function (e) {
      dbltap += 1;
    });

    stage.on('dragmove', function (e) {
      dragmove += 1;
    });

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    simulateTouchMove(
      stage,
      [{ x: 150, y: 150, id: 0 }],
      [{ x: 150, y: 150, id: 0 }]
    );

    simulateTouchEnd(stage, [], [{ x: 150, y: 150, id: 0 }]);

    assert.equal(tap, 0, 'no tap triggered');
    assert.equal(dbltap, 0, 'no dbltap triggered');
    assert.equal(dragmove, 1, 'dragmove triggered');

    simulateTouchStart(
      stage,
      [{ x: 150, y: 150, id: 0 }],
      [{ x: 150, y: 150, id: 0 }]
    );

    simulateTouchEnd(stage, [], [{ x: 150, y: 150, id: 0 }]);

    assert.equal(tap, 1, 'tap triggered');
    assert.equal(dbltap, 0, 'no dbltap triggered');
  });

  it('tap should give pointer position', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle1',
      draggable: true,
    });
    layer.add(circle1);
    layer.draw();

    var tap = 0;
    var click = 0;

    stage.on('tap', function (e) {
      assert.equal(e.target, circle1);
      assert.equal(stage.getPointerPosition().x, 100);
      assert.equal(stage.getPointerPosition().y, 100);
      tap += 1;
    });

    stage.on('click', function (e) {
      click += 1;
    });

    simulateTouchStart(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 0 }]);

    assert.equal(tap, 1, 'tap triggered');
    assert.equal(click, 0, 'no click triggered');
  });
});
