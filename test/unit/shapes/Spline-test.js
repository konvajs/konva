suite('Spline', function() {
    // ======================================================
    test('add splines', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var line1 = new Kinetic.Line({
            points: [73,160,340,23,500,109,300,109],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        var line2 = new Kinetic.Line({
            points: [73,160,340,23,500,109],
            stroke: 'red',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        var line3 = new Kinetic.Line({
            points: [73,160,340,23],
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

        assert.equal(line1.getClassName(), 'Line');

        var trace = layer.getContext().getTrace();

        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,0,0);beginPath();moveTo(73,160);quadraticCurveTo(74.006,54.77,340,23);bezierCurveTo(501.006,3.77,519.038,68.068,500,109);quadraticCurveTo(479.038,154.068,300,109);lineCap=round;lineWidth=10;strokeStyle=blue;stroke();restore();save();lineJoin=round;transform(1,0,0,1,0,0);beginPath();moveTo(73,160);quadraticCurveTo(74.006,54.77,340,23);quadraticCurveTo(501.006,3.77,500,109);lineCap=round;lineWidth=10;strokeStyle=red;stroke();restore();save();lineJoin=round;transform(1,0,0,1,0,0);beginPath();moveTo(73,160);lineTo(340,23);lineCap=round;lineWidth=10;strokeStyle=green;stroke();restore();');
    });

    // ======================================================
    test('update spline points', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Line({
            points: [73,160,340,23,500,109,300,109],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });


        layer.add(spline);
        stage.add(layer);

        assert.equal(spline.getTensionPoints().length, 12);

        spline.setPoints([73,160,340,23,500,109]);

        assert.equal(spline.getTensionPoints().length, 6);

        layer.draw();


    });

    // ======================================================
    test('add point to spline points', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Line({
            points: [73,160,340,23,500,109,300,109],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });


        layer.add(spline);
        stage.add(layer);

        assert.equal(spline.getPoints().length, 8);

        var points = spline.getPoints();
        points.push(300);
        points.push(200);
        spline.clearCache();

        assert.equal(spline.getPoints().length, 10);

        layer.draw();
    });
});