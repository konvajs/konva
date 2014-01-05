suite('Star', function() {
    // ======================================================
    test('add five point star', function() {
        var stage = addStage();

        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
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
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
            x: 250,
            y: 75,
            width: 100,
            height: 100,
            fill: 'red'
        });

        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: "round",
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
});