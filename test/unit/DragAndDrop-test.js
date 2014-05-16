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
});