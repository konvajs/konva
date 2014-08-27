suite('Arrow', function() {
    // ======================================================
    test('add arrow', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var arrow = new Kinetic.Arrow({
            points: [73,160, 340, 23],
            stroke: 'blue',
            fill : 'blue',
            strokeWidth: 1,
            draggable: true,
            tension: 0
        });

        layer.add(arrow);
        stage.add(layer);

        arrow.setPoints([1, 2, 3, 4]);
        assert.equal(arrow.points()[0], 1);

        arrow.setPoints([5,6,7,8]);
        assert.equal(arrow.getPoints()[0], 5);
        arrow.setPoints([73, 160, 340, 23, 50,100, 80, 50]);
        arrow.tension(0);

        arrow.pointerLength(15);
        assert.equal(arrow.pointerLength(), 15);

        arrow.pointerWidth(15);
        assert.equal(arrow.pointerWidth(), 15);

        assert.equal(arrow.getClassName(), 'Arrow');

        layer.draw();
        showHit(layer);
    });
});