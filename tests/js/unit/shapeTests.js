Test.Modules.SHAPE = {
    'SHAPE - test intersects()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        test(rect.intersects({
            x: 200,
            y: 100
        }) === true, '(200,100) should intersect the shape');

        test(rect.intersects({
            x: 197,
            y: 97
        }) === false, '(197, 97) should not intersect the shape');

        test(rect.intersects({
            x: 250,
            y: 125
        }) === true, '(250, 125) should intersect the shape');

        test(rect.intersects({
            x: 300,
            y: 150
        }) === true, '(300, 150) should intersect the shape');

        test(rect.intersects({
            x: 303,
            y: 153
        }) === false, '(303, 153) should not intersect the shape');

    }
};
