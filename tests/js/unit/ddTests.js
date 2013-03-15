Test.Modules.DD = {
    'test drag and drop properties and methods': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        test(circle.isDraggable() === false, 'draggable should be false');

        //change properties
        circle.setDraggable(true);

        // test new properties
        test(circle.getDraggable() === true, 'draggable should be true');
    },
    'DRAG AND DROP - multiple drag and drop sets with setDraggable()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        test(circle.getDraggable(), 'draggable should be true');
        circle.setDraggable(true);
        test(circle.getDraggable(), 'draggable should be true');
        circle.setDraggable(false);
        test(!circle.getDraggable(), 'draggable should be false');

        layer.add(circle);
        stage.add(layer);

    }
};
