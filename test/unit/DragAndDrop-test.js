suite('DragAndDrop', function() {

    // ======================================================
    test('test drag and drop properties and methods', function(done) {
            var stage = addStage();
            var layer = new Konva.Layer();
            var circle = new Konva.Circle({
                x: stage.getWidth() / 2,
                y: stage.getHeight() / 2,
                radius: 70,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 4,
                name: 'myCircle'
            });

        stage.add(layer);
        layer.add(circle);

        setTimeout(function() {

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
    test('multiple drag and drop sets with setDraggable()', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
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
    test('right click is not for dragging', function() {
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
            draggable: true
        });

        layer.add(circle);
        stage.add(layer);

        stage.simulateMouseDown({
            x: 291,
            y: 112
        });

        stage.simulateMouseMove({
            x: 311,
            y: 112
        });

        assert(circle.isDragging(), 'dragging is ok');

        stage.simulateMouseUp({
            x: 291,
            y: 112
        });

        stage.simulateMouseDown({
            x: 291,
            y: 112,
            button: 2
        });

        stage.simulateMouseMove({
            x: 311,
            y: 112,
            button: 2
        });

        assert(circle.isDragging() === false, 'no dragging with right click');

        stage.simulateMouseUp({
            x: 291,
            y: 112,
            button: 2
        });
    });

    // ======================================================
    test('while dragging do not draw hit', function() {
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
            draggable: true
        });

        dragLayer.add(circle);
        dragLayer.draw();

        var rect = new Konva.Rect({
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            width : 50,
            height : 50,
            draggable: true
        });
        layer.add(rect);
        layer.draw();

        var shape = layer.getIntersection({
            x : 2,
            y : 2
        });

        assert.equal(shape, rect, 'rect is detected');

        stage.simulateMouseDown({
            x: stage.width() / 2,
            y: stage.height() / 2
        });


        stage.simulateMouseMove({
            x: stage.width() / 2 + 5,
            y: stage.height() / 2
        });

        // redraw layer. hit must be not touched for not dragging layer
        layer.draw();
        shape = layer.getIntersection({
            x : 2,
            y : 2
        });
        assert.equal(shape, rect, 'rect is still detected');

        assert(circle.isDragging(), 'dragging is ok');

        dragLayer.draw();
        shape = dragLayer.getIntersection({
            x : stage.width() / 2,
            y : stage.height() / 2
        });
        // as dragLayer under dragging we should not able to detect intersect
        assert.equal(!!shape, false, 'circle is not detected');


        stage.simulateMouseUp({
            x: 291,
            y: 112 + top
        });

    });

    // ======================================================
    test('it is possible to change layer while dragging', function() {
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
            draggable: true
        });

        startDragLayer.add(circle);
        startDragLayer.draw();

        var rect = new Konva.Rect({
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            width : 50,
            height : 50,
            draggable: true
        });
        endDragLayer.add(rect);
        endDragLayer.draw();

        stage.simulateMouseDown({
            x: stage.width() / 2,
            y: stage.height() / 2
        });


        stage.simulateMouseMove({
            x: stage.width() / 2 + 5,
            y: stage.height() / 2
        });

        // change layer while dragging circle
        circle.moveTo(endDragLayer);
        // move rectange for test hit update
        rect.moveTo(startDragLayer);
        startDragLayer.draw();

        assert.equal(Konva.DD.anim.getLayers()[0], endDragLayer, 'drag layer should be switched');


        var shape = startDragLayer.getIntersection({
            x : 2,
            y : 2
        });
        assert.equal(shape, rect, 'rect is detected');

        assert(circle.isDragging(), 'dragging is ok');

        endDragLayer.draw();
        shape = endDragLayer.getIntersection({
            x : stage.width() / 2,
            y : stage.height() / 2
        });
        // as endDragLayer under dragging we should not able to detect intersect
        assert.equal(!!shape, false, 'circle is not detected');


        stage.simulateMouseUp({
            x: 291,
            y: 112 + top
        });

    });

    // ======================================================
    test('removing parent of draggable node should not throw error', function() {
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
            draggable: true
        });

        layer.add(circle);
        stage.simulateMouseMove({
            x: stage.width() / 2 + 5,
            y: stage.height() / 2
        });

        circle.startDrag();
        try {
          layer.destroy();
          assert.equal(true, true, 'no error, that is very good');
        } catch (e) {
          assert.equal(true, false, 'error happened');
        }
    });
});
