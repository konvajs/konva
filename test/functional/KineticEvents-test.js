suite('KineticEvents', function() {

    // ======================================================
    test('draw events', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });

        var events = [];

        layer.on('draw', function(evt) {
            events.push('layer-draw');
        });

        layer.on('beforeDraw', function(evt) {
            events.push('layer-beforeDraw');
        });

        layer.add(circle);
        stage.add(layer);

        //console.log(events.toString())

        assert.equal(events.toString(), 'layer-beforeDraw,layer-draw', 'draw event order is incorrect');


    });
});