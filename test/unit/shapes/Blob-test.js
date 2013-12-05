suite('Blob', function(){
    // ======================================================
    test('add blob', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var blob = new Kinetic.Line({
            points: [73,140,340,23,500,109,300,170],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf',
            tension: 0.8,
            closed: true
        });

        layer.add(blob);
        stage.add(layer);

        assert.equal(blob.getTension(), 0.8);

        assert.equal(blob.getClassName(), 'Line');

        //console.log(blob1.getPoints())

        // test setter
        blob.setTension(1.5);
        assert.equal(blob.getTension(), 1.5);

        var trace = layer.getContext().getTrace();
        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(73,140);bezierCurveTo(90.922,74.135,129.542,38.279,340,23);bezierCurveTo(471.142,13.479,514.876,54.33,500,109);bezierCurveTo(482.876,171.93,463.05,158.163,300,170);bezierCurveTo(121.45,182.963,58.922,191.735,73,140);closePath();fillStyle=#aaf;fill();lineWidth=10;strokeStyle=blue;stroke();restore();');
    });

    // ======================================================
    test('define tension first', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();


        var blob = new Kinetic.Line({
            tension: 0.8,
            points: [73,140,340,23,500,109,300,170],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf',
            closed: true

        });

        layer.add(blob);
        stage.add(layer);

        assert.equal(stage.find('Line')[0].getPoints().length, 8);

    });

    // ======================================================
    test('check for kinetic event handlers', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var blob = new Kinetic.Line({
            points: [73,140,340,23,500,109,300,170],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf',
            tension: 0.8,
            closed: true
        });

        layer.add(blob);

        stage.add(layer);

        assert.equal(blob.eventListeners.pointsChange[0].name, 'kinetic');
        assert.equal(blob.eventListeners.tensionChange[0].name, 'kinetic');

        // removing handlers should not remove kinetic specific handlers
        blob.off('pointsChange');
        blob.off('tensionChange');

        assert.equal(blob.eventListeners.pointsChange[0].name, 'kinetic');
        assert.equal(blob.eventListeners.tensionChange[0].name, 'kinetic');

        // you can force remove an event by adding the name
        blob.off('pointsChange.kinetic');
        blob.off('tensionChange.kinetic');

        assert.equal(blob.eventListeners.pointsChange, undefined);
        assert.equal(blob.eventListeners.tensionChange, undefined);
    });
});