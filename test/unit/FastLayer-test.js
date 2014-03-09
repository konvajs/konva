suite('FastLayer', function() {

    // ======================================================
    test('basic render', function() {
        var stage = addStage();

        var layer = new Kinetic.FastLayer();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


    });

});