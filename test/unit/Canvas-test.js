suite('Canvas', function() {
    // ======================================================
    test('pixel ratio', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: 100,
            y: 70,
            radius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 4,
            draggable : true
        });

        layer.add(circle);
        stage.add(layer);


        stage.setWidth(578/2);
        stage.setHeight(100);

        stage.draw();
        assert.equal(layer.getCanvas().getPixelRatio(), Konva.pixelRatio || window.devicePixelRatio || 1);

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
