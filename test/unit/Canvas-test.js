suite('Canvas', function() {
    // ======================================================
    test('pixel ratio', function() {
        var stage = addStage();

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: 578/2,
            y: 100,
            radius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


        stage.setWidth(578/2);
        stage.setHeight(100);

        stage.draw();

        layer.getCanvas().setPixelRatio(1);
        assert.equal(layer.getCanvas().getPixelRatio(), 1);
        assert.equal(layer.getCanvas().width, 289);
        assert.equal(layer.getCanvas().height, 100);

        layer.getCanvas().setPixelRatio(2);
        assert.equal(layer.getCanvas().getPixelRatio(), 2);
        assert.equal(layer.getCanvas().width, 578);
        assert.equal(layer.getCanvas().height, 200);

        layer.draw();

    });
});