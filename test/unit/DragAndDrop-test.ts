import { assert } from 'chai';
import {
  addStage,
  Konva,
  isNode,
  simulateMouseDown,
  simulateMouseMove,
  simulateMouseUp,
  simulateTouchStart,
  simulateTouchEnd,
  simulateTouchMove,
  countCalls,
} from './test-utils.ts';

describe('DragAndDrop', function () {
  // ======================================================
  it('test drag and drop properties and methods', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    stage.add(layer);
    layer.add(circle);

    setTimeout(function () {
      layer.draw();

      // test defaults
      assert.equal(circle.draggable(), false);

      //change properties
      circle.setDraggable(true);

      //circle.on('click', function(){});

      layer.draw();

      // test new properties
      assert.equal(circle.draggable(), true);

      done();
    }, 50);
  });

  // ======================================================
  it('multiple drag and drop sets with setDraggable()', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
    });

    circle.setDraggable(true);
    assert.equal(circle.draggable(), true);
    circle.setDraggable(true);
    assert.equal(circle.draggable(), true);
    circle.setDraggable(false);
    assert.equal(!circle.draggable(), true);

    layer.add(circle);
    stage.add(layer);
  });

  // ======================================================
  it('right click is not for dragging', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    simulateMouseDown(stage, {
      x: 291,
      y: 112,
    });

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
    });

    assert(circle.isDragging(), 'dragging is ok');

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
    });

    assert(!circle.isDragging(), 'drag stopped');

    simulateMouseDown(stage, {
      x: 291,
      y: 112,
      button: 2,
    });

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
      button: 2,
    });

    assert(circle.isDragging() === false, 'no dragging with right click');

    Konva.dragButtons = [0, 2];
    simulateMouseUp(stage, {
      x: 291,
      y: 112,
      button: 2,
    });

    // simulate buttons change
    simulateMouseDown(stage, {
      x: 291,
      y: 112,
      button: 2,
    });

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
      button: 2,
    });

    assert(circle.isDragging() === true, 'now dragging with right click');

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
      button: 2,
    });
    Konva.dragButtons = [0];
  });

  // ======================================================
  it('dragstart event should have correct button value for right-click drag', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    // Enable right-click dragging
    Konva.dragButtons = [0, 2];

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    var dragStartButton = null;

    circle.on('dragstart', function (e) {
      dragStartButton = e.evt.button;
    });

    layer.add(circle);
    stage.add(layer);

    // Test with right-click (button 2)
    simulateMouseDown(stage, {
      x: 291,
      y: 112,
      button: 2,
    });

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
    });

    assert.equal(dragStartButton, 2, 'dragstart event should have button=2 for right-click');
    assert(circle.isDragging(), 'circle should be dragging');

    simulateMouseUp(stage, {
      x: 311,
      y: 112,
      button: 2,
    });

    // Test with left-click (button 0)
    dragStartButton = null;

    simulateMouseDown(stage, {
      x: 291,
      y: 112,
      button: 0,
    });

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
    });

    assert.equal(dragStartButton, 0, 'dragstart event should have button=0 for left-click');

    simulateMouseUp(stage, {
      x: 311,
      y: 112,
      button: 0,
    });

    // Reset to default
    Konva.dragButtons = [0];
  });

  // ======================================================
  it('changing draggable on mousedown should take effect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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
    stage.add(layer);

    circle.on('mousedown', () => {
      circle.draggable(true);
    });

    simulateMouseDown(stage, {
      x: circle.x(),
      y: circle.y(),
    });

    simulateMouseMove(stage, {
      x: circle.x() + 10,
      y: circle.y() + 10,
    });

    assert.equal(circle.isDragging(), true);

    simulateMouseUp(stage, {
      x: circle.x() + 10,
      y: circle.y() + 10,
    });
  });

  // ======================================================
  it('while dragging do not draw hit', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var dragLayer = new Konva.Layer();
    stage.add(dragLayer);

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    dragLayer.add(circle);
    dragLayer.draw();

    var rect = new Konva.Rect({
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      width: 50,
      height: 50,
      draggable: true,
    });
    layer.add(rect);
    layer.draw();

    var shape = layer.getIntersection({
      x: 2,
      y: 2,
    });

    assert.equal(shape, rect, 'rect is detected');

    simulateMouseDown(stage, {
      x: stage.width() / 2,
      y: stage.height() / 2,
    });

    simulateMouseMove(stage, {
      x: stage.width() / 2 + 5,
      y: stage.height() / 2,
    });

    // redraw layer. hit must be not touched for not dragging layer
    layer.draw();
    shape = layer.getIntersection({
      x: 2,
      y: 2,
    });
    assert.equal(shape, rect, 'rect is still detected');

    assert(circle.isDragging(), 'dragging is ok');

    dragLayer.draw();
    shape = dragLayer.getIntersection({
      x: stage.width() / 2,
      y: stage.height() / 2,
    });
    // as dragLayer under dragging we should not able to detect intersect
    assert.equal(!!shape, false, 'circle is not detected');

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
    });
  });

  // ======================================================
  it('it is possible to change layer while dragging', function () {
    var stage = addStage();

    var startDragLayer = new Konva.Layer();
    stage.add(startDragLayer);

    var endDragLayer = new Konva.Layer();
    stage.add(endDragLayer);

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    startDragLayer.add(circle);
    startDragLayer.draw();

    var rect = new Konva.Rect({
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      width: 50,
      height: 50,
      draggable: true,
    });
    endDragLayer.add(rect);
    endDragLayer.draw();

    simulateMouseDown(stage, {
      x: stage.width() / 2,
      y: stage.height() / 2,
    });

    simulateMouseMove(stage, {
      x: stage.width() / 2 + 5,
      y: stage.height() / 2,
    });

    // change layer while dragging circle
    circle.moveTo(endDragLayer);
    // move rectange for test hit update
    rect.moveTo(startDragLayer);
    startDragLayer.draw();

    var shape = startDragLayer.getIntersection({
      x: 2,
      y: 2,
    });
    assert.equal(shape, rect, 'rect is detected');

    assert(circle.isDragging(), 'dragging is ok');

    endDragLayer.draw();
    shape = endDragLayer.getIntersection({
      x: stage.width() / 2,
      y: stage.height() / 2,
    });
    // as endDragLayer under dragging we should not able to detect intersect
    assert.equal(!!shape, false, 'circle is not detected');

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
    });
  });

  // ======================================================
  it('removing parent of draggable node should not throw error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      draggable: true,
    });

    layer.add(circle);
    simulateMouseMove(stage, {
      x: stage.width() / 2 + 5,
      y: stage.height() / 2,
    });

    circle.startDrag();
    try {
      layer.destroy();
      assert.equal(true, true, 'no error, that is very good');
    } catch (e) {
      assert.equal(true, false, 'error happened');
    }
  });

  it('update hit on stage drag end', function (done) {
    var stage = addStage();

    stage.draggable(true);

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
    layer.draw();

    simulateMouseDown(stage, {
      x: stage.width() / 2,
      y: stage.height() / 2,
    });

    simulateMouseMove(stage, {
      x: stage.width() / 2 - 50,
      y: stage.height() / 2,
    });

    setTimeout(function () {
      assert.equal(stage.isDragging(), true);
      simulateMouseUp(stage, {
        x: stage.width() / 2 - 50,
        y: stage.height() / 2,
      });
      setTimeout(function () {
        var shape = layer.getIntersection({
          x: stage.width() / 2 + 5,
          y: stage.height() / 2,
        });

        assert.equal(shape, circle);
        done();
      }, 100);
    }, 50);
  });

  it('removing shape while drag and drop should no throw error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    simulateMouseDown(stage, {
      x: 291,
      y: 112,
    });

    circle.remove();

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
    });

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
      button: 2,
    });

    assert(Konva.isDragging() === false);
  });

  it('destroying shape while drag and drop should no throw error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    simulateMouseDown(stage, {
      x: 291,
      y: 112,
    });

    circle.destroy();

    simulateMouseMove(stage, {
      x: 311,
      y: 112,
    });

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
    });

    assert(Konva.isDragging() === false);
  });

  it('removing parent container while dragging nested node should not throw', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      draggable: true,
    });
    group.add(circle);
    layer.add(group);
    stage.add(layer);

    // Start dragging
    simulateMouseDown(stage, { x: 291, y: 112 });
    simulateMouseMove(stage, { x: 311, y: 112 });

    assert.equal(circle.isDragging(), true, 'circle should be dragging');

    // layer.remove() only checks if the layer itself is dragging,
    // not its descendants — the circle stays in DD._dragElements
    // with a broken parent chain (no stage reference)
    layer.remove();

    // the circle is still registered as dragging but has no stage
    assert.equal(circle.getStage(), null, 'circle should have no stage after parent removal');

    // this triggers DD._endDragBefore which crashes accessing null stage
    simulateMouseUp(stage, { x: 311, y: 112 });

    assert(Konva.isDragging() === false);
  });

  it('destroying group with transformer during drag should not throw', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
      dragDistance: 0,
    });
    var tr = new Konva.Transformer({ nodes: [rect] });
    group.add(rect);
    group.add(tr);
    layer.add(group);
    stage.add(layer);

    rect.on('dragmove', () => {
      group.destroy();
    });

    simulateMouseDown(stage, { x: 80, y: 80 });
    simulateMouseMove(stage, { x: 90, y: 90 });
    simulateMouseMove(stage, { x: 100, y: 100 });
    simulateMouseUp(stage, { x: 100, y: 100 });

    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('drag start should trigger before movement', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    circle.on('dragstart', function () {
      assert.equal(circle.x(), 70);
      assert.equal(circle.y(), 70);
    });

    simulateMouseDown(stage, {
      x: 70,
      y: 70,
    });

    simulateMouseMove(stage, {
      x: 100,
      y: 100,
    });

    simulateMouseUp(stage, {
      x: 100,
      y: 100,
    });
  });

  it('drag with touch', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    circle.on('dragstart', function () {
      assert.equal(circle.x(), 70);
      assert.equal(circle.y(), 70);
    });

    simulateTouchStart(stage, {
      x: 70,
      y: 70,
    });

    simulateTouchMove(stage, {
      x: 100,
      y: 100,
    });

    simulateTouchEnd(stage, {
      x: 100,
      y: 100,
    });
    assert.equal(circle.x(), 100);
    assert.equal(circle.y(), 100);
  });

  it('drag with multi-touch (second finger on empty space)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    circle.on('dragstart', function () {
      assert.equal(circle.x(), 70);
      assert.equal(circle.y(), 70);
    });

    simulateTouchStart(stage, [
      {
        x: 70,
        y: 70,
        id: 0,
      },
      {
        x: 270,
        y: 270,
        id: 1,
      },
    ]);

    simulateTouchMove(stage, [
      {
        x: 100,
        y: 100,
        id: 0,
      },
      {
        x: 270,
        y: 270,
        id: 1,
      },
    ]);

    simulateTouchEnd(stage, [
      {
        x: 100,
        y: 100,
        id: 0,
      },
      {
        x: 270,
        y: 270,
        id: 1,
      },
    ]);
    assert.equal(circle.x(), 100);
    assert.equal(circle.y(), 100);
  });

  it('drag with multi-touch (two shapes)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });
    layer.add(circle1);

    var circle2 = new Konva.Circle({
      x: 270,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });
    layer.add(circle2);
    layer.draw();

    var dragstart1 = 0;
    var dragmove1 = 0;
    circle1.on('dragstart', function () {
      dragstart1 += 1;
    });
    circle1.on('dragmove', function () {
      dragmove1 += 1;
    });

    var dragstart2 = 0;
    var dragmove2 = 0;
    circle2.on('dragstart', function () {
      dragstart2 += 1;
    });

    circle2.on('dragmove', function () {
      dragmove2 += 1;
    });

    simulateTouchStart(stage, [
      {
        x: 70,
        y: 70,
        id: 0,
      },
      {
        x: 270,
        y: 70,
        id: 1,
      },
    ]);

    // move one finger
    simulateTouchMove(
      stage,
      [
        {
          x: 100,
          y: 100,
          id: 0,
        },
        {
          x: 270,
          y: 70,
          id: 1,
        },
      ],
      [
        {
          x: 100,
          y: 100,
          id: 0,
        },
      ]
    );

    assert.equal(dragstart1, 1);
    assert.equal(circle1.isDragging(), true);
    assert.equal(dragmove1, 1);
    assert.equal(dragmove2, 0);
    assert.equal(circle1.x(), 100);
    assert.equal(circle1.y(), 100);

    // move second finger
    simulateTouchMove(stage, [
      {
        x: 100,
        y: 100,
        id: 0,
      },
      {
        x: 290,
        y: 70,
        id: 1,
      },
    ]);

    assert.equal(dragstart2, 1);
    assert.equal(circle2.isDragging(), true);
    assert.equal(dragmove2, 1);
    assert.equal(circle2.x(), 290);
    assert.equal(circle2.y(), 70);

    // remove first finger
    simulateTouchEnd(
      stage,
      [
        {
          x: 290,
          y: 70,
          id: 1,
        },
      ],
      [
        {
          x: 100,
          y: 100,
          id: 0,
        },
      ]
    );
    assert.equal(circle1.isDragging(), false);
    assert.equal(circle2.isDragging(), true);
    assert.equal(Konva.DD.isDragging, true);
    // remove first finger
    simulateTouchEnd(
      stage,
      [],
      [
        {
          x: 290,
          y: 70,
          id: 1,
        },
      ]
    );
    assert.equal(circle2.isDragging(), false);
    assert.equal(Konva.DD.isDragging, false);
  });

  it('stopDrag stops only the drag of that node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      draggable: true,
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 200,
      y: 0,
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
    });
    layer.add(rect2);
    layer.draw();

    var dragend: Array<string> = [];
    rect1.on('dragend', function () {
      dragend.push('rect1');
    });
    rect2.on('dragend', function () {
      dragend.push('rect2');
    });

    simulateTouchStart(stage, [
      { x: 50, y: 50, id: 0 },
      { x: 250, y: 50, id: 1 },
    ]);
    simulateTouchMove(stage, [
      { x: 60, y: 60, id: 0 },
      { x: 260, y: 60, id: 1 },
    ]);
    assert.equal(rect1.isDragging(), true);
    assert.equal(rect2.isDragging(), true);

    rect1.stopDrag();
    assert.equal(rect1.isDragging(), false);
    assert.equal(rect2.isDragging(), true);
    assert.deepEqual(dragend, ['rect1']);

    // the second finger keeps dragging its own shape
    simulateTouchMove(
      stage,
      [
        { x: 60, y: 60, id: 0 },
        { x: 270, y: 70, id: 1 },
      ],
      [{ x: 270, y: 70, id: 1 }]
    );
    assert.equal(rect2.x(), 220);
    assert.equal(rect2.y(), 20);

    simulateTouchEnd(stage, [], [{ x: 270, y: 70, id: 1 }]);
    assert.equal(rect2.isDragging(), false);
    assert.deepEqual(dragend, ['rect1', 'rect2']);
  });

  it('stopDrag stops the whole gesture of a transformer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      draggable: true,
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
    });
    layer.add(rect2);

    var tr = new Konva.Transformer({ nodes: [rect1, rect2] });
    layer.add(tr);
    layer.draw();

    var dragstart = 0;
    rect1.on('dragstart', function () {
      dragstart += 1;
    });

    simulateMouseDown(stage, { x: 20, y: 20 });
    simulateMouseMove(stage, { x: 40, y: 30 });
    assert.deepEqual(rect1.position(), { x: 20, y: 10 });
    assert.deepEqual(rect2.position(), { x: 120, y: 10 });

    // the transformer drags itself and the other node with the same pointer,
    // all of them must stop
    rect1.stopDrag();
    assert.equal(Konva.isDragging(), false);

    simulateMouseMove(stage, { x: 80, y: 60 });
    assert.deepEqual(rect1.position(), { x: 20, y: 10 });
    assert.deepEqual(rect2.position(), { x: 120, y: 10 });
    assert.equal(dragstart, 1);

    simulateMouseUp(stage, { x: 80, y: 60 });
    assert.equal(Konva.isDragging(), false);
  });

  it('stopDrag of an idle node does not stop another drag', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      draggable: true,
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 200,
      y: 0,
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
    });
    layer.add(rect2);
    layer.draw();

    simulateMouseDown(stage, { x: 50, y: 50 });
    simulateMouseMove(stage, { x: 60, y: 60 });
    assert.equal(rect1.isDragging(), true);

    rect2.stopDrag();
    assert.equal(rect1.isDragging(), true);

    simulateMouseUp(stage, { x: 60, y: 60 });
    assert.equal(rect1.isDragging(), false);
  });

  it('drag with multi-touch (same shape)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle1 = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });
    layer.add(circle1);
    layer.draw();

    var dragstart1 = 0;
    var dragmove1 = 0;
    circle1.on('dragstart', function () {
      dragstart1 += 1;
    });
    circle1.on('dragmove', function () {
      dragmove1 += 1;
    });

    simulateTouchStart(stage, [
      {
        x: 70,
        y: 70,
        id: 0,
      },
    ]);
    // move one finger
    simulateTouchMove(stage, [
      {
        x: 75,
        y: 75,
        id: 0,
      },
    ]);

    simulateTouchStart(
      stage,
      [
        {
          x: 75,
          y: 75,
          id: 0,
        },
        {
          x: 80,
          y: 80,
          id: 1,
        },
      ],
      [
        {
          x: 80,
          y: 80,
          id: 1,
        },
      ]
    );

    simulateTouchMove(
      stage,
      [
        {
          x: 75,
          y: 75,
          id: 0,
        },
        {
          x: 85,
          y: 85,
          id: 1,
        },
      ],
      [
        {
          x: 85,
          y: 85,
          id: 1,
        },
      ]
    );

    assert.equal(dragstart1, 1);
    assert.equal(circle1.isDragging(), true);
    assert.equal(dragmove1, 1);
    assert.equal(circle1.x(), 75);
    assert.equal(circle1.y(), 75);

    // remove first finger
    simulateTouchEnd(
      stage,
      [],
      [
        {
          x: 75,
          y: 75,
          id: 0,
        },
        {
          x: 85,
          y: 85,
          id: 1,
        },
      ]
    );
  });

  it('can stop drag on dragstart without changing position later', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    circle.on('dragstart', function () {
      circle.stopDrag();
    });
    circle.on('dragmove', function () {
      assert.equal(false, true, 'dragmove called!');
    });

    simulateMouseDown(stage, {
      x: 70,
      y: 70,
    });

    simulateMouseMove(stage, {
      x: 100,
      y: 100,
    });

    simulateMouseUp(stage, {
      x: 100,
      y: 100,
    });

    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 70);
  });

  it('can force drag at any time (when pointer already registered)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    simulateMouseMove(stage, { x: 70, y: 70 });
    circle.startDrag();
    assert.equal(circle.isDragging(), true);
    simulateMouseMove(stage, { x: 80, y: 80 });
    simulateMouseUp(stage, { x: 80, y: 80 });
    assert.equal(circle.x(), 80);
    assert.equal(circle.y(), 80);
  });

  it('can force drag at any time (when pointer not registered)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    circle.startDrag();
    assert.equal(circle.isDragging(), true);
    // let us think that offset will be equal 0 if not registered pointers
    simulateMouseMove(stage, { x: 80, y: 80 });
    simulateMouseUp(stage, { x: 80, y: 80 });

    assert.equal(circle.x(), 80);
    assert.equal(circle.y(), 80);
  });

  it('calling startDrag show still fire event when required', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    var dragstart = 0;
    circle.on('dragstart', function () {
      dragstart += 1;
    });
    layer.add(circle);
    stage.add(layer);

    // register pointer
    simulateMouseMove(stage, { x: 70, y: 80 });
    circle.startDrag();
    assert.equal(dragstart, 1);
    assert.equal(circle.isDragging(), true);
    // moving by one pixel should move circle too
    simulateMouseMove(stage, { x: 70, y: 81 });
    simulateMouseUp(stage, { x: 70, y: 81 });

    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 71);
  });

  it('make sure we have event object', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    circle.on('dragstart', function (e) {
      assert.equal(e.evt === undefined, false);
    });
    circle.on('dragmove', function (e) {
      assert.equal(e.evt === undefined, false);
    });
    circle.on('dragend', function (e) {
      assert.equal(e.evt === undefined, false);
    });
    layer.add(circle);
    stage.add(layer);

    // register pointer
    simulateMouseDown(stage, { x: 70, y: 80 });
    // moving by one pixel should move circle too
    simulateMouseMove(stage, { x: 80, y: 80 });
    simulateMouseUp(stage, { x: 70, y: 80 });
  });

  it('try nested dragging', function () {
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

    layer.add(circle.clone({ x: 30, fill: 'red', draggable: false }));

    simulateMouseDown(stage, { x: 70, y: 70 });
    simulateMouseMove(stage, { x: 80, y: 80 });

    assert.equal(circle.x(), 80);
    assert.equal(circle.y(), 80);
    assert.equal(layer.x(), 0);
    assert.equal(layer.y(), 0);
    // layer is not dragging, because drag is registered on circle
    assert.equal(layer.isDragging(), false);
    simulateMouseUp(stage, { x: 80, y: 80 });
  });

  it('warn on bad dragBoundFunc', function () {
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
      dragBoundFunc: function () {} as any,
    });

    layer.add(circle);
    stage.add(layer);

    var counter = 0;
    var oldWarn = Konva.Util.warn;
    Konva.Util.warn = function () {
      counter += 1;
    };
    simulateMouseDown(stage, { x: 70, y: 70 });
    simulateMouseMove(stage, { x: 80, y: 80 });
    simulateMouseUp(stage, { x: 80, y: 80 });
    assert.equal(counter > 0, true);
    Konva.Util.warn = oldWarn;
  });

  it('deletage drag', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    layer.add(circle);
    stage.add(layer);

    stage.on('dragstart', function (e) {
      if (e.target === stage) {
        stage.stopDrag();
        circle.startDrag();
      }
    });

    simulateMouseDown(stage, { x: 5, y: 5 });
    simulateMouseMove(stage, { x: 10, y: 10 });

    assert.equal(circle.isDragging(), true);
    assert.equal(stage.isDragging(), false);

    simulateMouseUp(stage, { x: 10, y: 10 });

    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 70);
  });

  it('disable drag on click', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();
    stage.add(layer);

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
    layer.draw();

    circle.on('click', function () {
      circle.draggable(false);
      circle.draggable(true);
    });

    var dragstart = 0;
    var dragend = 0;

    stage.on('dragstart', function (e) {
      dragstart += 1;
    });
    stage.on('dragend', function (e) {
      dragend += 1;
    });

    simulateMouseDown(stage, { x: 70, y: 75 });
    simulateMouseUp(stage, { x: 70, y: 70 });

    // drag events should not be called
    assert.equal(dragstart, 0);
    assert.equal(dragend, 0);
  });

  it('mouseleave should not occur after drag and drop', function (done) {
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
    var mouseleave = false;
    var dragend = false;
    var mouseenter = true;
    circle.on('mouseenter', function () {
      mouseenter = true;
    });
    circle.on('mouseleave', function () {
      mouseleave = true;
    });
    circle.on('dragend', function () {
      dragend = true;
    });
    simulateMouseMove(stage, {
      x: 40,
      y: 40,
    });
    assert(mouseenter, 'mouseenter event should have been fired');
    simulateMouseDown(stage, {
      x: 40,
      y: 40,
    });
    setTimeout(function () {
      simulateMouseMove(stage, {
        x: 100,
        y: 100,
      });
      setTimeout(() => {
        simulateMouseUp(stage, {
          x: 100,
          y: 100,
        });
        simulateMouseMove(stage, {
          x: 102,
          y: 102,
        });
        assert(!mouseleave, 'mouseleave event should not have been fired');
        assert(dragend, 'dragend event should have been fired');
        done();
      }, 70);
    }, 70);
  });

  it('a click on a draggable node does not redraw the layer synchronously', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
    });
    layer.add(rect);
    layer.draw();

    var draws = countCalls(layer, 'draw', () => {
      simulateMouseDown(stage, { x: 100, y: 100 });
      simulateMouseUp(stage, { x: 100, y: 100 });
    });
    assert.equal(draws, 0);
    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('pointer positions are read once per stage per move while dragging several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect1 = new Konva.Rect({ x: 0, y: 0, width: 50, height: 50 });
    var rect2 = new Konva.Rect({ x: 100, y: 0, width: 50, height: 50 });
    layer.add(rect1, rect2);

    rect1.startDrag();
    rect2.startDrag();

    var calls = countCalls(stage, 'setPointersPositions', () => {
      simulateMouseMove(stage, { x: 30, y: 30 });
    });
    // one read for DD._drag, one for each stage pointermove (pointer + mouse)
    assert.equal(calls, 3);
    assert.equal(rect1.isDragging(), true);
    assert.equal(rect2.isDragging(), true);

    calls = countCalls(stage, 'setPointersPositions', () => {
      simulateMouseUp(stage, { x: 30, y: 30 });
    });
    assert.equal(calls, 3);
    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('a dragBoundFunc returning a non-finite position keeps the node where it was', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 70,
      fill: 'green',
      draggable: true,
      dragBoundFunc: (pos) => ({ x: NaN, y: pos.y }),
    });
    layer.add(circle);
    stage.add(layer);

    var warns = countCalls(Konva.Util, 'warn', () => {
      simulateMouseDown(stage, { x: 70, y: 70 });
      simulateMouseMove(stage, { x: 80, y: 90 });
    });
    assert.equal(warns, 1);
    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 70);

    // a fixed function takes over from the next move
    circle.dragBoundFunc((pos) => pos);
    simulateMouseMove(stage, { x: 90, y: 100 });
    simulateMouseUp(stage, { x: 90, y: 100 });
    assert.equal(circle.x(), 90);
    assert.equal(circle.y(), 100);
  });

  it('a clamping dragBoundFunc does not freeze the node after a programmatic move', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      fill: 'red',
      draggable: true,
      dragBoundFunc: (pos) => ({ x: Math.min(pos.x, 100), y: pos.y }),
    });
    layer.add(rect);
    layer.draw();

    simulateMouseDown(stage, { x: 60, y: 60 });
    simulateMouseMove(stage, { x: 200, y: 60 });
    simulateMouseUp(stage, { x: 200, y: 60 });
    assert.equal(rect.x(), 100);

    rect.x(0);
    layer.draw();

    simulateMouseDown(stage, { x: 10, y: 60 });
    simulateMouseMove(stage, { x: 200, y: 60 });
    simulateMouseUp(stage, { x: 200, y: 60 });
    assert.equal(rect.x(), 100);
  });

  it('lifting one finger keeps the pending drag of the other finger', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle1 = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 50,
      fill: 'green',
      draggable: true,
    });
    var circle2 = new Konva.Circle({
      x: 270,
      y: 70,
      radius: 50,
      fill: 'green',
      draggable: true,
    });
    layer.add(circle1, circle2);
    layer.draw();

    simulateTouchStart(stage, [
      { x: 70, y: 70, id: 0 },
      { x: 270, y: 70, id: 1 },
    ]);
    // the second finger goes up, the first one stays down without moving
    simulateTouchEnd(
      stage,
      [{ x: 70, y: 70, id: 0 }],
      [{ x: 270, y: 70, id: 1 }]
    );
    simulateTouchMove(
      stage,
      [{ x: 100, y: 100, id: 0 }],
      [{ x: 100, y: 100, id: 0 }]
    );
    assert.equal(circle1.isDragging(), true);
    assert.equal(circle1.x(), 100);
    assert.equal(circle1.y(), 100);

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 0 }]);
    assert.equal(circle1.isDragging(), false);
    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('a programmatic startDrag() without a pointer ends on the next release', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 50,
      fill: 'green',
      draggable: true,
    });
    layer.add(circle);
    layer.draw();

    circle.startDrag();
    assert.equal(circle.isDragging(), true);
    simulateMouseUp(stage, { x: 70, y: 70 });
    assert.equal(circle.isDragging(), false);
    assert.equal(Konva.isDragging(), false);
    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('startDrag() inside a dragend handler keeps the node dragging', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({
      x: 70,
      y: 70,
      radius: 50,
      fill: 'green',
      draggable: true,
    });
    layer.add(circle);
    layer.draw();

    var dragstarts = 0;
    circle.on('dragstart', function () {
      dragstarts += 1;
    });
    circle.on('dragend', function () {
      circle.startDrag();
    });

    simulateMouseDown(stage, { x: 70, y: 70 });
    simulateMouseMove(stage, { x: 100, y: 100 });
    simulateMouseUp(stage, { x: 100, y: 100 });
    assert.equal(dragstarts, 2);
    assert.equal(circle.isDragging(), true);
    simulateMouseMove(stage, { x: 150, y: 150 });
    assert.equal(circle.x(), 150);

    circle.off('dragend');
    simulateMouseUp(stage, { x: 150, y: 150 });
    assert.equal(circle.isDragging(), false);
  });
});

describe('Drag ownership', function () {
  it('the active drag controls whether native touch movement is prevented', function () {
    for (const preventDefault of [true, false]) {
      const stage = addStage(),
        layer = new Konva.Layer();
      stage.add(layer);
      const active = new Konva.Rect({
        width: 40,
        height: 40,
        fill: 'red',
        draggable: true,
        preventDefault,
      });
      const ready = active.clone({ x: 100, preventDefault: !preventDefault });
      layer.add(active, ready);
      layer.draw();
      const first = { id: 1, x: 10, y: 10 },
        second = { id: 2, x: 110, y: 10 };
      simulateTouchStart(stage, [first], [first]);
      active.startDrag();
      simulateTouchStart(stage, [first, second], [second]);
      const top = isNode ? 0 : stage.content.getBoundingClientRect().top;
      const event = Object.assign(
        new Event('touchmove', { cancelable: true }),
        {
          touches: [
            { identifier: 1, clientX: 20, clientY: 10 + top },
            { identifier: 2, clientX: 110, clientY: 10 + top },
          ],
          changedTouches: [{ identifier: 1, clientX: 20, clientY: 10 + top }],
        }
      );
      if (isNode) stage._pointermove(event);
      else stage.content.dispatchEvent(event);
      assert.equal(event.defaultPrevented, preventDefault);
      simulateTouchEnd(stage, [], [first, second]);
      stage.destroy();
    }
  });

  it('a second touch does not replace a ready drag pointer', function () {
    const stage = addStage(),
      layer = new Konva.Layer();
    stage.add(layer);
    const rect = new Konva.Rect({
      width: 50,
      height: 50,
      fill: 'red',
      draggable: true,
    });
    layer.add(rect);
    layer.draw();
    const first = { id: 1, x: 10, y: 10 },
      second = { id: 2, x: 30, y: 30 };
    simulateTouchStart(stage, [first], [first]);
    simulateTouchStart(stage, [first, second], [second]);
    simulateTouchMove(
      stage,
      [{ ...first, x: 20 }, second],
      [{ ...first, x: 20 }]
    );
    assert.equal(rect.x(), 10);
    simulateTouchEnd(stage, [], [{ ...first, x: 20 }, second]);
  });

  it('startDrag without an event keeps the pointer used for its offset', function () {
    const stage = addStage(),
      layer = new Konva.Layer();
    stage.add(layer);
    const rect = new Konva.Rect({ width: 50, height: 50, fill: 'red' });
    layer.add(rect);
    layer.draw();
    const first = { id: 1, x: 10, y: 10 },
      second = { id: 2, x: 100, y: 100 };
    simulateTouchStart(stage, [first, second], [first, second]);
    rect.startDrag();
    simulateTouchMove(
      stage,
      [first, { ...second, x: 110 }],
      [{ ...second, x: 110 }]
    );
    assert.equal(rect.x(), 0);
    simulateTouchMove(
      stage,
      [{ ...first, x: 20 }, second],
      [{ ...first, x: 20 }]
    );
    assert.equal(rect.x(), 10);
    simulateTouchEnd(stage, [], [{ ...first, x: 20 }, second]);
  });
});
