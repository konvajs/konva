suite('Polygon', function() {
    test('add polygon', function() {
        var stage = addStage();

        var layer = new Kinetic.Layer();

        var points = [{
            x: 73,
            y: 192
        }, {
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }, {
            x: 500,
            y: 109
        }, {
            x: 499,
            y: 139
        }, {
            x: 342,
            y: 93
        }];

        var poly = new Kinetic.Line({
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