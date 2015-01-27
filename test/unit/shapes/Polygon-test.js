suite('Polygon', function() {
    test('add polygon', function() {
        var stage = addStage();

        var layer = new Konva.Layer();
        var points = [73,192,73,160,340,23,500,109,499,139,342,93];
        
        var poly = new Konva.Line({
            points: points,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            closed: true
        });

        layer.add(poly);
        stage.add(layer);
        
        assert.equal(poly.getClassName(), 'Line');
    });
});