suite('Manual', function() {
    // ======================================================
    test('tween node', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 2,
            opacity: 0.2
        });

        layer.add(rect);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: rect, 
            duration: 1,
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            opacity: 1,
            strokeWidth: 6,
            scaleX: 1.5
        });


        tween.play();
 

    });
});