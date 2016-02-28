suite('RegularPolygon', function() {
    // ======================================================
    test('add regular polygon triangle', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var poly = new Konva.RegularPolygon({
            x: 200,
            y: 100,
            sides: 3,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            center: {
                x: 0,
                y: -50
            }
        });

        layer.add(poly);
        stage.add(layer);

        assert.equal(poly.getClassName(), 'RegularPolygon');

    });

    // ======================================================
    test('add regular polygon square', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var poly = new Konva.RegularPolygon({
            x: 200,
            y: 100,
            sides: 4,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    });

    // ======================================================
    test('add regular polygon pentagon', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var poly = new Konva.RegularPolygon({
            x: 200,
            y: 100,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    });

    // ======================================================
    test('add regular polygon octogon', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var poly = new Konva.RegularPolygon({
            x: 200,
            y: 100,
            sides: 8,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    });

    // ======================================================
    test('attr sync', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var poly = new Konva.RegularPolygon({
            x: 200,
            y: 100,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);

        assert.equal(poly.getWidth(), 100);
        assert.equal(poly.getHeight(), 100);

        poly.setWidth(120);
        assert.equal(poly.radius(), 60);
        assert.equal(poly.getHeight(), 120);

        poly.setHeight(140);
        assert.equal(poly.radius(), 70);
        assert.equal(poly.getHeight(), 140);
    });

    test('polygon cache', function() {
        Konva.pixelRatio = 1;
        var stage = addStage();
        var layer = new Konva.Layer();

        var poly = new Konva.RegularPolygon({
            x: 200,
            y: 100,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 5,
            name: 'foobar'
        });
        poly.cache();
        layer.add(poly);
        stage.add(layer);

        assert.deepEqual(poly.getSelfRect(), {
            x : -50,
            y : -50,
            height : 100,
            width : 100
        });
        if (!window.isPhantomJS) {
            cloneAndCompareLayer(layer, 254);
        }
        Konva.pixelRatio = undefined;

    });

});
