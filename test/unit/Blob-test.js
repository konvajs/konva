suite('Blob', function(){
    // ======================================================
    test('add blobs', function() {
        var stage = new Kinetic.Stage({
            container: 'container',
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var blob1 = new Kinetic.Blob({
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 170
            }],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf',
            tension: 0.8
        });

        var blob2 = new Kinetic.Blob({
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }],
            stroke: 'red',
            strokeWidth: 10,
            draggable: true,
            fill: '#faa',
            tension: 1.2,
            scale: 0.5,
            x: 100,
            y: 50
        });


        layer.add(blob1);
        layer.add(blob2);
        stage.add(layer);

        assert.equal(blob1.getTension(), 0.8);
        assert.equal(blob2.getTension(), 1.2);

        assert.equal(blob1.getClassName(), 'Blob');

        //console.log(blob1.getPoints())

        // test setter
        blob1.setTension(1.5);
        assert.equal(blob1.getTension(), 1.5);
    });

    // ======================================================
    test('add blob and define tension first', function() {
        var stage = new Kinetic.Stage({
            container: 'container',
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

     
        var blob = new Kinetic.Blob({
            tension: 0.8,
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 170
            }],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf'

        });

        layer.add(blob);
        stage.add(layer);

        assert.equal(stage.get('Blob')[0].getPoints().length, 4);

    });

    // ======================================================
    test('check for kinetic event handlers', function() {
        var stage = new Kinetic.Stage({
            container: 'container',
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var blob = new Kinetic.Blob({
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 170
            }],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf',
            tension: 0.8
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