suite('DragAndDrop', function() {

    // ======================================================
    test('test drag and drop properties and methods', function(done) {
            var stage = addStage();
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
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
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
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

        var top = stage.content.getBoundingClientRect().top;

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
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

        stage._mousedown({
            clientX: 291,
            clientY: 112 + top,
        });

        stage._mousemove({
            clientX: 311,
            clientY: 112 + top,
        });

        assert(circle.isDragging(), 'dragging is ok');

        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});


        
        stage._mousedown({
            clientX: 291,
            clientY: 112 + top,
            button: 2
        });

        stage._mousemove({
            clientX: 311,
            clientY: 112 + top,
            button: 2
        });

        assert(circle.isDragging() === false, 'no dragging with right click');

        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top,
            button: 2
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});
    });

    // ======================================================
    test('while dragging do not draw hit', function() {
        var stage = addStage();

        var top = stage.content.getBoundingClientRect().top;

        var layer = new Kinetic.Layer();
        stage.add(layer);

        var dragLayer = new Kinetic.Layer();
        stage.add(dragLayer);

        var circle = new Kinetic.Circle({
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

        var rect = new Kinetic.Rect({
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

        stage._mousedown({
            clientX: stage.width() / 2,
            clientY: stage.height() / 2 + top
        });


        stage._mousemove({
            clientX: stage.width() / 2 + 5,
            clientY: stage.height() / 2 + top
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


        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});

    });

    // ======================================================
    test('it is possible to change layer while dragging', function() {
        var stage = addStage();

        var top = stage.content.getBoundingClientRect().top;

        var startDragLayer = new Kinetic.Layer();
        stage.add(startDragLayer);

        var endDragLayer = new Kinetic.Layer();
        stage.add(endDragLayer);

        var circle = new Kinetic.Circle({
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

        var rect = new Kinetic.Rect({
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

        stage._mousedown({
            clientX: stage.width() / 2,
            clientY: stage.height() / 2 + top
        });


        stage._mousemove({
            clientX: stage.width() / 2 + 5,
            clientY: stage.height() / 2 + top
        });

        // change layer while dragging circle
        circle.moveTo(endDragLayer);
        // move rectange for test hit update
        rect.moveTo(startDragLayer);
        startDragLayer.draw();

        assert.equal(Kinetic.DD.anim.getLayers()[0], endDragLayer, 'drag layer should be switched');


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


        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});

    });
});