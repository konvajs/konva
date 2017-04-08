suite('Star', function() {
    // ======================================================
    test('add five point star', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var star = new Konva.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            center: {
                x: 0,
                y: -70
            },
            scale: {
                x: 0.5,
                y: 0.5
            }
        });

        layer.add(star);
        stage.add(layer);
        
        assert.equal(star.getClassName(), 'Star');
    });

    // ======================================================
    test('add star with line join and shadow', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 250,
            y: 75,
            width: 100,
            height: 100,
            fill: 'red'
        });

        var star = new Konva.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: [20, 20],
            shadowOpacity: 0.5,
            draggable: true
        });

        layer.add(rect);
        layer.add(star);

        stage.add(layer);

        assert.equal(star.getLineJoin(), 'round');
        star.setLineJoin('bevel');
        assert.equal(star.getLineJoin(), 'bevel');

        star.setLineJoin('round');
    });

    // ======================================================
    test('attr sync', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var star = new Konva.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: [20, 20],
            shadowOpacity: 0.5,
            draggable: true
        });

        layer.add(star);

        stage.add(layer);

        assert.equal(star.getWidth(), 100);
        assert.equal(star.getHeight(), 100);

        star.setWidth(120);
        assert.equal(star.outerRadius(), 60);
        assert.equal(star.getHeight(), 120);

        star.setHeight(140);
        assert.equal(star.outerRadius(), 70);
        assert.equal(star.getHeight(), 140);
    });

    // ======================================================
    test('star cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var star = new Konva.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: [20, 20],
            shadowOpacity: 0.5,
            draggable: true
        });

        layer.add(star);
        star.cache();
        stage.add(layer);

        assert.deepEqual(star.getSelfRect(), {
            x : -50,
            y : -50,
            height : 100,
            width : 100
        });
        cloneAndCompareLayer(layer, 50);
    });
});