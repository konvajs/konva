suite('DragAndDropEvents', function() {
  // ======================================================
  test('test dragstart, dragmove, dragend', function(done) {
    var stage = addStage();

    var layer = new Konva.Layer();

    var greenCircle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      opacity: 0.5
    });

    var circle = new Konva.Circle({
      x: 380,
      y: stage.getHeight() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      opacity: 0.5
    });

    circle.setDraggable(true);

    layer.add(circle);
    layer.add(greenCircle);
    stage.add(layer);

    var dragStart = false;
    var dragMove = false;
    var dragEnd = false;
    var mouseup = false;
    var events = [];

    circle.on('dragstart', function() {
      dragStart = true;
    });

    circle.on('dragmove', function() {
      dragMove = true;
    });

    circle.on('dragend', function() {
      dragEnd = true;
      events.push('dragend');
    });

    circle.on('mouseup', function() {
      events.push('mouseup');
    });

    assert(!Konva.isDragging(), ' isDragging() should be false 1');
    assert(!Konva.isDragReady(), ' isDragReady()) should be false 2');

    /*
        * simulate drag and drop
        */
    stage.simulateMouseDown({
      x: 380,
      y: 98
    });
    assert(!dragStart, 'dragstart event should not have been triggered 3');
    //assert.equal(!dragMove, 'dragmove event should not have been triggered');
    assert(!dragEnd, 'dragend event should not have been triggered 4');

    assert(!Konva.isDragging(), ' isDragging() should be false 5');
    assert(Konva.isDragReady(), ' isDragReady()) should be true 6');

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 100,
          y: 98
        });

        assert(Konva.isDragging(), ' isDragging() should be true 7');
        assert(Konva.isDragReady(), ' isDragReady()) should be true 8');

        assert(dragStart, 'dragstart event was not triggered 9');
        //assert.equal(dragMove, 'dragmove event was not triggered');
        assert(!dragEnd, 'dragend event should not have been triggered 10');

        stage.simulateMouseUp({
          x: 100,
          y: 98
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

        assert.equal(greenCircle.getX(), 40, 'green circle x should be 40');
        assert.equal(greenCircle.getY(), 40, 'green circle y should be 40');
        assert.equal(circle.getX(), 100, 'circle x should be 100');
        assert.equal(circle.getY(), 100, 'circle y should be 100');

        showHit(layer);

        done();
      },
      20
    );
  });

  // ======================================================
  test('destroy shape while dragging', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var greenCircle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      opacity: 0.5
    });

    var circle = new Konva.Circle({
      x: 380,
      y: stage.getHeight() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      opacity: 0.5
    });

    circle.setDraggable(true);

    layer.add(circle);
    layer.add(greenCircle);
    stage.add(layer);

    var dragEnd = false;

    circle.on('dragend', function() {
      dragEnd = true;
    });

    circle.on('mouseup', function() {
      //console.log('mouseup');
      events.push('mouseup');
    });

    assert(!Konva.isDragging(), ' isDragging() should be false');
    assert(!Konva.isDragReady(), ' isDragReady()) should be false');

    stage.simulateMouseDown({
      x: 380,
      y: 98
    });

    assert(!circle.isDragging(), 'circle should not be dragging');

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 100,
          y: 98
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
      },
      20
    );
  });

  // ======================================================
  test('click should not occur after drag and drop', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      draggable: true
    });

    layer.add(circle);
    stage.add(layer);

    var clicked = false;

    circle.on('click', function() {
      //console.log('click');
      clicked = true;
    });

    circle.on('dblclick', function() {
      //console.log('dblclick');
    });

    stage.simulateMouseDown({
      x: 40,
      y: 40
    });

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 100,
          y: 100
        });

        stage.simulateMouseUp({
          x: 100,
          y: 100
        });

        assert(!clicked, 'click event should not have been fired');

        done();
      },
      20
    );
  });

  // ======================================================
  test('drag and drop distance', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      radius: 20,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      draggable: true
    });

    layer.add(circle);
    stage.add(layer);
    circle.dragDistance(4);
    var top = stage.content.getBoundingClientRect().top;

    stage.simulateMouseDown({
      x: 40,
      y: 40
    });

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 40,
          y: 42
        });
        assert(!circle.isDragging(), 'still not dragging');
        stage.simulateMouseMove({
          x: 40,
          y: 45
        });
        assert(circle.isDragging(), 'now circle is dragging');
        stage.simulateMouseUp({
          x: 41,
          y: 45
        });

        done();
      },
      20
    );
  });

  // ======================================================
  test('cancel drag and drop by setting draggable to false', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 380,
      y: 100,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      draggable: true
    });

    var dragStart = false;
    var dragMove = false;
    var dragEnd = false;

    circle.on('dragstart', function() {
      dragStart = true;
    });

    circle.on('dragmove', function() {
      dragMove = true;
    });

    circle.on('dragend', function() {
      dragEnd = true;
    });

    circle.on('mousedown', function() {
      circle.setDraggable(false);
    });

    layer.add(circle);
    stage.add(layer);

    var top = stage.content.getBoundingClientRect().top;

    /*
         * simulate drag and drop
         */
    stage.simulateMouseDown({
      x: 380,
      y: 100
    });

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 100,
          y: 100
        });

        stage.simulateMouseUp({
          x: 100,
          y: 100
        });

        assert.equal(circle.getPosition().x, 380, 'circle x should be 380');
        assert.equal(circle.getPosition().y, 100, 'circle y should be 100');
        done();
      },
      20
    );
  });

  // ======================================================
  test('drag and drop layer', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer({
      drawFunc: function() {
        var context = this.getContext();
        context.beginPath();
        context.moveTo(200, 50);
        context.lineTo(420, 80);
        context.quadraticCurveTo(300, 100, 260, 170);
        context.closePath();
        context.fillStyle = 'blue';
        context.fill(context);
      },
      draggable: true
    });

    var circle1 = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'red'
    });

    var circle2 = new Konva.Circle({
      x: 400,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'green'
    });

    layer.add(circle1);
    layer.add(circle2);

    stage.add(layer);

    var top = stage.content.getBoundingClientRect().top;

    /*
         * simulate drag and drop
         */
    stage.simulateMouseDown({
      x: 399,
      y: 96
    });

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 210,
          y: 109
        });

        stage.simulateMouseUp({
          x: 210,
          y: 109
        });

        //console.log(layer.getPosition())

        assert.equal(layer.getX(), -189, 'layer x should be -189');
        assert.equal(layer.getY(), 13, 'layer y should be 13');

        done();
      },
      20
    );
  });

  // ======================================================
  test('drag and drop stage', function(done) {
    var container = document.createElement('div'),
      stage = new Konva.Stage({
        container: container,
        width: 578,
        height: 200,
        draggable: true
      });

    konvaContainer.appendChild(container);

    //stage.setDraggable(true);

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'red'
    });

    layer.add(circle);
    stage.add(layer);

    var top = stage.content.getBoundingClientRect().top;

    assert.equal(stage.getX(), 0);
    assert.equal(stage.getY(), 0);

    /*
         * simulate drag and drop
         */
    stage.simulateMouseDown({
      x: 0,
      y: 100
    });

    setTimeout(
      function() {
        stage.simulateMouseMove({
          x: 300,
          y: 110
        });

        stage.simulateMouseUp({
          x: 300,
          y: 110
        });

        assert.equal(stage.getX(), 300);
        assert.equal(stage.getY(), 10);

        done();
      },
      20
    );
  });
});
