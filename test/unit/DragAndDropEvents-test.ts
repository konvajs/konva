import { assert } from 'chai';

import {
  addStage,
  Konva,
  simulateMouseDown,
  simulateMouseMove,
  simulateMouseUp,
  simulatePointerDown,
  simulatePointerMove,
  simulatePointerUp,
} from './test-utils';

describe('DragAndDropEvents', function () {
  // ======================================================
  it('test dragstart, dragmove, dragend', function (done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var greenCircle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      opacity: 0.5,
    });

    var circle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      opacity: 0.5,
    });

    circle.setDraggable(true);

    layer.add(circle);
    layer.add(greenCircle);
    stage.add(layer);

    var dragStart = false;
    var dragMove = false;
    var dragEnd = false;
    var events = [];

    circle.on('dragstart', function () {
      dragStart = true;
    });

    circle.on('dragmove', function () {
      dragMove = true;
    });

    circle.on('dragend', function () {
      dragEnd = true;
      events.push('dragend');
    });

    circle.on('mouseup', function () {
      events.push('mouseup');
    });

    assert(!Konva.isDragging(), ' isDragging() should be false 1');
    assert(!Konva.isDragReady(), ' isDragReady()) should be false 2');

    /*
     * simulate drag and drop
     */
    simulateMouseDown(stage, {
      x: 380,
      y: 98,
    });
    assert(!dragStart, 'dragstart event should not have been triggered 3');
    //assert.equal(!dragMove, 'dragmove event should not have been triggered');
    assert(!dragEnd, 'dragend event should not have been triggered 4');

    assert(!Konva.isDragging(), ' isDragging() should be false 5');
    assert(Konva.isDragReady(), ' isDragReady()) should be true 6');

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 385,
        y: 98,
      });

      assert(Konva.isDragging(), ' isDragging() should be true 7');
      assert(Konva.isDragReady(), ' isDragReady()) should be true 8');

      assert(dragStart, 'dragstart event was not triggered 9');
      //assert.equal(dragMove, 'dragmove event was not triggered');
      assert(!dragEnd, 'dragend event should not have been triggered 10');

      simulateMouseUp(stage, {
        x: 385,
        y: 98,
      });

      assert(dragStart, 'dragstart event was not triggered 11');
      assert(dragMove, 'dragmove event was not triggered 12');
      assert(dragEnd, 'dragend event was not triggered 13');

      assert.equal(
        events.toString(),
        'mouseup,dragend',
        'mouseup should occur before dragend 14'
      );

      assert(!Konva.isDragging(), ' isDragging() should be false 15');
      assert(!Konva.isDragReady(), ' isDragReady()) should be false 16');

      //console.log(greenCircle.getPosition());
      //console.log(circle.getPosition());

      assert.equal(greenCircle.x(), 40, 'green circle x should be 40');
      assert.equal(greenCircle.y(), 40, 'green circle y should be 40');
      assert.equal(circle.x(), 385, 'circle x should be 100');
      assert.equal(circle.y(), 100, 'circle y should be 100');

      done();
    }, 20);
  });

  // ======================================================
  it('destroy shape while dragging', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var greenCircle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      opacity: 0.5,
    });

    var circle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      opacity: 0.5,
    });

    circle.setDraggable(true);

    layer.add(circle);
    layer.add(greenCircle);
    stage.add(layer);

    var dragEnd = false;

    circle.on('dragend', function () {
      dragEnd = true;
    });

    assert(!Konva.isDragging(), ' isDragging() should be false');
    assert(!Konva.isDragReady(), ' isDragReady()) should be false');

    simulateMouseDown(stage, {
      x: 380,
      y: 98,
    });

    assert(!circle.isDragging(), 'circle should not be dragging');

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 100,
        y: 98,
      });

      assert(circle.isDragging(), 'circle should be dragging');
      assert(!dragEnd, 'dragEnd should not have fired yet');

      // at this point, we are in drag and drop mode

      // removing or destroying the circle should trigger dragend
      circle.destroy();
      layer.draw();

      assert(
        !circle.isDragging(),
        'destroying circle should stop drag and drop'
      );
      assert(dragEnd, 'dragEnd should have fired');
      done();
    }, 20);
  });

  // ======================================================
  it('click should not occur after drag and drop', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    var clicked = false;

    circle.on('click', function () {
      //console.log('click');
      clicked = true;
    });

    simulateMouseDown(stage, {
      x: 40,
      y: 40,
    });

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 100,
        y: 100,
      });

      simulateMouseUp(stage, {
        x: 100,
        y: 100,
      });

      assert(!clicked, 'click event should not have been fired');

      done();
    }, 20);
  });

  // TODO: how to solve it?
  // hint: every shape has pointerId that indicates which pointer is dragging it
  // but "pointer" event and mouse event has different pointerId
  // so we need to find a way to match them
  // should we save several pointers per shape?
  // doesn't sound good
  // switch to pointer only event handling?
  it.skip('click should not occur after drag and drop', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    var clicked = false;

    stage.on('pointerclick', function () {
      clicked = true;
    });

    simulatePointerDown(stage, {
      x: 40,
      y: 40,
    });

    setTimeout(function () {
      simulatePointerMove(stage, {
        x: 100,
        y: 100,
      });

      simulatePointerUp(stage, {
        x: 100,
        y: 100,
      });

      assert(!clicked, 'click event should not have been fired');

      done();
    }, 20);
  });

  // ======================================================
  it('drag and drop distance', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);
    circle.dragDistance(4);

    simulateMouseDown(stage, {
      x: 40,
      y: 40,
    });

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 40,
        y: 42,
      });
      assert(!circle.isDragging(), 'still not dragging');
      simulateMouseMove(stage, {
        x: 40,
        y: 45,
      });
      assert(circle.isDragging(), 'now circle is dragging');
      simulateMouseUp(stage, {
        x: 41,
        y: 45,
      });

      done();
    }, 20);
  });

  // ======================================================
  it('cancel drag and drop by setting draggable to false', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 380,
      y: 100,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      draggable: true,
    });

    var dragStart = false;
    var dragMove = false;
    var dragEnd = false;

    circle.on('dragstart', function () {
      dragStart = true;
    });

    circle.on('dragmove', function () {
      dragMove = true;
    });

    circle.on('dragend', function () {
      dragEnd = true;
    });

    circle.on('mousedown', function () {
      circle.setDraggable(false);
    });

    layer.add(circle);
    stage.add(layer);

    /*
     * simulate drag and drop
     */
    simulateMouseDown(stage, {
      x: 380,
      y: 100,
    });

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 100,
        y: 100,
      });

      simulateMouseUp(stage, {
        x: 100,
        y: 100,
      });

      assert.equal(circle.getPosition().x, 380, 'circle x should be 380');
      assert.equal(circle.getPosition().y, 100, 'circle y should be 100');
      done();
    }, 20);
  });

  // ======================================================
  it('drag and drop layer', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer({
      sceneFunc: function () {
        var context = this.getContext();
        context.beginPath();
        context.moveTo(200, 50);
        context.lineTo(420, 80);
        context.quadraticCurveTo(300, 100, 260, 170);
        context.closePath();
        context.fillStyle = 'blue';
        context.fill(context);
      },
      draggable: true,
    });

    var circle1 = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
    });

    var circle2 = new Konva.Circle({
      x: 400,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
    });

    layer.add(circle1);
    layer.add(circle2);

    stage.add(layer);

    /*
     * simulate drag and drop
     */
    simulateMouseDown(stage, {
      x: 399,
      y: 96,
    });

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 210,
        y: 109,
      });

      simulateMouseUp(stage, {
        x: 210,
        y: 109,
      });

      //console.log(layer.getPosition())

      assert.equal(layer.x(), -189, 'layer x should be -189');
      assert.equal(layer.y(), 13, 'layer y should be 13');

      done();
    }, 20);
  });

  // ======================================================
  it('drag and drop stage', function (done) {
    var stage = addStage({ draggable: true });

    //stage.setDraggable(true);

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'red',
    });

    layer.add(circle);
    stage.add(layer);

    assert.equal(stage.x(), 0);
    assert.equal(stage.y(), 0);

    /*
     * simulate drag and drop
     */
    simulateMouseDown(stage, {
      x: 0,
      y: 100,
    });

    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 300,
        y: 110,
      });

      simulateMouseUp(stage, {
        x: 300,
        y: 110,
      });

      assert.equal(stage.x(), 300);
      assert.equal(stage.y(), 10);

      done();
    }, 20);
  });

  it('click should not start drag&drop', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      draggable: true,
    });

    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    var dragstart = 0;
    circle.on('dragstart', function () {
      dragstart += 1;
    });

    var dragmove = 0;
    circle.on('dragmove', function () {
      dragmove += 1;
    });

    var dragend = 0;
    circle.on('dragend', function () {
      dragend += 1;
    });

    var click = 0;
    circle.on('click', function () {
      click += 1;
    });
    simulateMouseDown(stage, { x: 70, y: 70 });
    simulateMouseUp(stage, { x: 70, y: 70 });

    assert.equal(click, 1, 'click triggered');
    assert.equal(dragstart, 0, 'dragstart not triggered');
    assert.equal(dragmove, 0, 'dragmove not triggered');
    assert.equal(dragend, 0, 'dragend not triggered');
  });

  it('drag&drop should not fire click', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      draggable: true,
    });

    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    var dragstart = 0;
    circle.on('dragstart', function () {
      dragstart += 1;
    });

    var dragmove = 0;
    circle.on('dragmove', function () {
      dragmove += 1;
    });

    var dragend = 0;
    circle.on('dragend', function () {
      dragend += 1;
    });

    var click = 0;
    circle.on('click', function () {
      click += 1;
    });
    simulateMouseDown(stage, { x: 70, y: 70 });
    simulateMouseMove(stage, { x: 80, y: 80 });
    simulateMouseUp(stage, { x: 80, y: 80 });

    assert.equal(click, 0, 'click triggered');
    assert.equal(dragstart, 1, 'dragstart not triggered');
    assert.equal(dragmove, 1, 'dragmove not triggered');
    assert.equal(dragend, 1, 'dragend not triggered');
  });

  it('drag events should not trigger on a click even if we stop drag on dragstart', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      draggable: true,
    });

    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    var dragstart = 0;
    circle.on('dragstart', function () {
      circle.stopDrag();
      dragstart += 1;
    });

    var dragmove = 0;
    circle.on('dragmove', function () {
      dragmove += 1;
    });

    var dragend = 0;
    circle.on('dragend', function () {
      dragend += 1;
    });

    var click = 0;
    circle.on('click', function () {
      click += 1;
    });
    simulateMouseDown(stage, { x: 70, y: 70 });
    simulateMouseMove(stage, { x: 75, y: 75 });
    simulateMouseUp(stage, { x: 75, y: 75 });

    assert.equal(click, 0, 'click triggered');
    assert.equal(dragstart, 1, 'dragstart triggered');
    assert.equal(dragmove, 0, 'dragmove not triggered');
    assert.equal(dragend, 1, 'dragend triggered');
  });
});
