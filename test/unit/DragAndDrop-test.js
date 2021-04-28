suite('DragAndDrop', function () {
  // ======================================================
  test('test drag and drop properties and methods', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
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

      showHit(layer);

      // test new properties
      assert.equal(circle.getDraggable(), true);

      done();
    }, 50);
  });

  // ======================================================
  test('multiple drag and drop sets with setDraggable()', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 380,
      y: stage.getHeight() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
    });

    circle.setDraggable(true);
    assert.equal(circle.getDraggable(), true);
    circle.setDraggable(true);
    assert.equal(circle.getDraggable(), true);
    circle.setDraggable(false);
    assert.equal(!circle.getDraggable(), true);

    layer.add(circle);
    stage.add(layer);
  });

  // ======================================================
  test('right click is not for dragging', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    stage.simulateMouseDown({
      x: 291,
      y: 112,
    });

    stage.simulateMouseMove({
      x: 311,
      y: 112,
    });

    assert(circle.isDragging(), 'dragging is ok');

    stage.simulateMouseUp({
      x: 291,
      y: 112,
    });

    assert(!circle.isDragging(), 'drag stopped');

    stage.simulateMouseDown({
      x: 291,
      y: 112,
      button: 2,
    });

    stage.simulateMouseMove({
      x: 311,
      y: 112,
      button: 2,
    });

    assert(circle.isDragging() === false, 'no dragging with right click');

    Konva.dragButtons = [0, 2];
    stage.simulateMouseUp({
      x: 291,
      y: 112,
      button: 2,
    });

    // simulate buttons change
    stage.simulateMouseDown({
      x: 291,
      y: 112,
      button: 2,
    });

    stage.simulateMouseMove({
      x: 311,
      y: 112,
      button: 2,
    });

    assert(circle.isDragging() === true, 'now dragging with right click');

    stage.simulateMouseUp({
      x: 291,
      y: 112,
      button: 2,
    });
    Konva.dragButtons = [0];
  });

  // ======================================================
  test('changing draggable on mousedown should take effect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
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

    stage.simulateMouseDown({
      x: circle.x(),
      y: circle.y(),
    });

    stage.simulateMouseMove({
      x: circle.x() + 10,
      y: circle.y() + 10,
    });

    assert.equal(circle.isDragging(), true);

    stage.simulateMouseUp({
      x: circle.x() + 10,
      y: circle.y() + 10,
    });
  });

  // ======================================================
  test('while dragging do not draw hit', function () {
    var stage = addStage();

    var top = stage.content.getBoundingClientRect().top;

    var layer = new Konva.Layer();
    stage.add(layer);

    var dragLayer = new Konva.Layer();
    stage.add(dragLayer);

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
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

    stage.simulateMouseDown({
      x: stage.width() / 2,
      y: stage.height() / 2,
    });

    stage.simulateMouseMove({
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

    stage.simulateMouseUp({
      x: 291,
      y: 112 + top,
    });
  });

  // ======================================================
  test('it is possible to change layer while dragging', function () {
    var stage = addStage();

    var top = stage.content.getBoundingClientRect().top;

    var startDragLayer = new Konva.Layer();
    stage.add(startDragLayer);

    var endDragLayer = new Konva.Layer();
    stage.add(endDragLayer);

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
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

    stage.simulateMouseDown({
      x: stage.width() / 2,
      y: stage.height() / 2,
    });

    stage.simulateMouseMove({
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

    stage.simulateMouseUp({
      x: 291,
      y: 112 + top,
    });
  });

  // ======================================================
  test('removing parent of draggable node should not throw error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({
      x: 380,
      y: stage.getHeight() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      draggable: true,
    });

    layer.add(circle);
    stage.simulateMouseMove({
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

  test('update hit on stage drag end', function (done) {
    var stage = addStage();

    stage.draggable(true);

    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    layer.add(circle);
    layer.draw();

    stage.simulateMouseDown({
      x: stage.width() / 2,
      y: stage.height() / 2,
    });

    stage.simulateMouseMove({
      x: stage.width() / 2 - 50,
      y: stage.height() / 2,
    });

    setTimeout(function () {
      assert.equal(stage.isDragging(), true);
      stage.simulateMouseUp({
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

  test('removing shape while drag and drop should no throw error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    stage.simulateMouseDown({
      x: 291,
      y: 112,
    });

    circle.remove();

    stage.simulateMouseMove({
      x: 311,
      y: 112,
    });

    stage.simulateMouseUp({
      x: 291,
      y: 112,
      button: 2,
    });
  });

  test('destroying shape while drag and drop should no throw error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    stage.simulateMouseDown({
      x: 291,
      y: 112,
    });

    circle.destroy();

    stage.simulateMouseMove({
      x: 311,
      y: 112,
    });

    stage.simulateMouseUp({
      x: 291,
      y: 112,
    });
  });

  test('drag start should trigger before movement', function () {
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

    stage.simulateMouseDown({
      x: 70,
      y: 70,
    });

    stage.simulateMouseMove({
      x: 100,
      y: 100,
    });

    stage.simulateMouseUp({
      x: 100,
      y: 100,
    });
  });

  test('drag with touch', function () {
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

    stage.simulateTouchStart({
      x: 70,
      y: 70,
    });

    stage.simulateTouchMove({
      x: 100,
      y: 100,
    });

    stage.simulateTouchEnd({
      x: 100,
      y: 100,
    });
    assert.equal(circle.x(), 100);
    assert.equal(circle.y(), 100);
  });

  test('drag with multi-touch (second finger on empty space)', function () {
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

    stage.simulateTouchStart([
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

    stage.simulateTouchMove([
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

    stage.simulateTouchEnd([
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

  test('drag with multi-touch (two shapes)', function () {
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

    stage.simulateTouchStart([
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
    stage.simulateTouchMove(
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
    stage.simulateTouchMove([
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
    stage.simulateTouchEnd(
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
    stage.simulateTouchEnd(
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

  test('drag with multi-touch (same shape)', function () {
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

    stage.simulateTouchStart([
      {
        x: 70,
        y: 70,
        id: 0,
      },
    ]);
    // move one finger
    stage.simulateTouchMove([
      {
        x: 75,
        y: 75,
        id: 0,
      },
    ]);

    stage.simulateTouchStart(
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

    stage.simulateTouchMove(
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
    stage.simulateTouchEnd(
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
  // TODO: try to move two shapes on different stages

  test('can stop drag on dragstart without changing position later', function () {
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

    stage.simulateMouseDown({
      x: 70,
      y: 70,
    });

    stage.simulateMouseMove({
      x: 100,
      y: 100,
    });

    stage.simulateMouseUp({
      x: 100,
      y: 100,
    });

    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 70);
  });

  test('can force drag at any time (when pointer already registered)', function () {
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

    stage.simulateMouseMove({ x: 70, y: 70 });
    circle.startDrag();
    assert.equal(circle.isDragging(), true);
    stage.simulateMouseMove({ x: 80, y: 80 });
    stage.simulateMouseUp({ x: 80, y: 80 });
    assert.equal(circle.x(), 80);
    assert.equal(circle.y(), 80);
  });

  test('can force drag at any time (when pointer not registered)', function () {
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
    stage.simulateMouseMove({ x: 80, y: 80 });
    stage.simulateMouseUp({ x: 80, y: 80 });

    assert.equal(circle.x(), 80);
    assert.equal(circle.y(), 80);
  });

  test('calling startDrag show still fire event when required', function () {
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
    stage.simulateMouseMove({ x: 70, y: 80 });
    circle.startDrag();
    assert.equal(dragstart, 1);
    assert.equal(circle.isDragging(), true);
    // moving by one pixel should move circle too
    stage.simulateMouseMove({ x: 70, y: 81 });
    stage.simulateMouseUp({ x: 70, y: 81 });

    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 71);
  });

  test('make sure we have event object', function () {
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
    stage.simulateMouseDown({ x: 70, y: 80 });
    // moving by one pixel should move circle too
    stage.simulateMouseMove({ x: 80, y: 80 });
    stage.simulateMouseUp({ x: 70, y: 80 });
  });

  test('try nested dragging', function () {
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

    stage.simulateMouseDown({ x: 70, y: 70 });
    stage.simulateMouseMove({ x: 80, y: 80 });

    assert.equal(circle.x(), 80);
    assert.equal(circle.y(), 80);
    assert.equal(layer.x(), 0);
    assert.equal(layer.y(), 0);
    // layer is not dragging, because drag is registered on circle
    assert.equal(layer.isDragging(), false);
    stage.simulateMouseUp({ x: 80, y: 80 });
  });

  test('warn on bad dragBoundFunc', function () {
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
      dragBoundFunc: function () {},
    });

    layer.add(circle);
    stage.add(layer);

    var counter = 0;
    var oldWarn = Konva.Util.warn;
    Konva.Util.warn = function () {
      counter += 1;
    };
    stage.simulateMouseDown({ x: 70, y: 70 });
    stage.simulateMouseMove({ x: 80, y: 80 });
    stage.simulateMouseUp({ x: 80, y: 80 });
    assert.equal(counter > 0, true);
    Konva.Util.warn = oldWarn;
  });

  test('deletage drag', function () {
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

    stage.simulateMouseDown({ x: 5, y: 5 });
    stage.simulateMouseMove({ x: 10, y: 10 });

    assert.equal(circle.isDragging(), true);
    assert.equal(stage.isDragging(), false);

    stage.simulateMouseUp({ x: 10, y: 10 });

    assert.equal(circle.x(), 70);
    assert.equal(circle.y(), 70);
  });

  test('disable drag on click', function () {
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

    stage.simulateMouseDown({ x: 70, y: 75 });
    stage.simulateMouseUp({ x: 70, y: 70 });

    // drag events should not be called
    assert.equal(dragstart, 0);
    assert.equal(dragend, 0);
  });
});
