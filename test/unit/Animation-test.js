suite('Animation', function() {
    // ======================================================
    test('test start and stop', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        var amplitude = 150;
        var period = 1000;
        // in ms
        var centerX = stage.getWidth() / 2 - 100 / 2;

        var anim = new Kinetic.Animation(function(frame) {
            rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
        }, layer);
        var a = Kinetic.Animation.animations;
        var startLen = a.length;

        assert.equal(a.length, startLen, '1should be no animations running');

        anim.start();
        assert.equal(a.length, startLen + 1, '2should be 1 animation running');

        anim.stop();
        assert.equal(a.length, startLen, '3should be no animations running');

        anim.start();
        assert.equal(a.length, startLen + 1, '4should be 1 animation running');

        anim.start();
        assert.equal(a.length, startLen + 1, '5should be 1 animation runningg');

        anim.stop();
        assert.equal(a.length, startLen, '6should be no animations running');

        anim.stop();
        assert.equal(a.length, startLen, '7should be no animations running');
    });

    // ======================================================
    test('layer batch draw', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        draws = 0;

        layer.on('draw', function() {
            //console.log('draw')
            draws++;
        });

        layer.draw();
        layer.draw();
        layer.draw();

        assert.equal(draws, 3, 'draw count should be 3');

        layer.batchDraw();
        layer.batchDraw();
        layer.batchDraw();

        assert.notEqual(draws, 6, 'should not be 6 draws');
    });

    // ======================================================
    test('stage batch draw', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        draws = 0;

        layer.on('draw', function() {
            //console.log('draw')
            draws++;
        });

        stage.draw();
        stage.draw();
        stage.draw();

        assert.equal(draws, 3, 'draw count should be 3');

        stage.batchDraw();
        stage.batchDraw();
        stage.batchDraw();

        assert.notEqual(draws, 6, 'should not be 6 draws');

    });
});