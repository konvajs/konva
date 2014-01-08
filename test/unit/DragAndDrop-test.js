suite('DragAndDrop', function() {

    // ======================================================
    test('test drag and drop properties and methods', function() {
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
});