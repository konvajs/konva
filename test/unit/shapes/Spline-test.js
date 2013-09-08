suite('Spline', function() {
    // ======================================================
    test('add splines', function() {
        var stage = buildStage();
        var layer = new Kinetic.Layer();

        var line1 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        var line2 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }],
            stroke: 'red',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        var line3 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }],
            stroke: 'green',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line1);
        layer.add(line2);
        layer.add(line3);
        stage.add(layer);

        assert.equal(line1.getClassName(), 'Spline');


    });

    // ======================================================
    test('update spline points', function() {
        var stage = buildStage();
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });


        layer.add(spline);
        stage.add(layer);

        assert.equal(spline.allPoints.length, 6);

        spline.setPoints([{
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }, {
            x: 500,
            y: 109
        }]);

        assert.equal(spline.allPoints.length, 3);

        layer.draw();


    });

    // ======================================================
    test('add point to spline points', function() {
        var stage = buildStage();
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });


        layer.add(spline);
        stage.add(layer);

        assert.equal(spline.getPoints().length, 4);

        spline.addPoint({
            x: 300,
            y: 200
        });

        assert.equal(spline.getPoints().length, 5);

        layer.draw();
    });

    // ======================================================
    test('create from points represented as a flat array', function() {
        var stage = buildStage();
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Spline({
            points: [
                73, 160,
                340, 23,
                500, 109,
                300, 109
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line);
        stage.add(layer);

        assert.equal(line.getPoints().length, 4);
    });

    // ======================================================
    test('create from points represented as an array of objects', function() {
        var stage = buildStage();
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line);
        stage.add(layer);

        assert.equal(line.getPoints().length, 4);
    });

    // ======================================================
    test('create from points represented as an array of arrays', function() {
        var stage = buildStage();
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Spline({
            points: [
                [73, 160],
                [340, 23],
                [500, 109],
                [300, 109]
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line);
        stage.add(layer);

        assert.equal(line.getPoints().length, 4);
    });
});