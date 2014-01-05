suite('RegularPolygon', function() {
    // ======================================================
    test('add regular polygon triangle', function() {
        var stage = addStage();
        
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 3,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            center: {
                x: 0,
                y: -50
            }
        });

        layer.add(poly);
        stage.add(layer);
        
        assert.equal(poly.getClassName(), 'RegularPolygon');

    });

    // ======================================================
    test('add regular polygon square', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 4,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    });
    
    // ======================================================
    test('add regular polygon pentagon', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    });
    
    // ======================================================
    test('add regular polygon octogon', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 8,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    });
    
});