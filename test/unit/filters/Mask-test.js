suite('Mask', function() {

    // ======================================================
    test('basic', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {

            var layer = new Kinetic.Layer({
                throttle: 999
            });
            var bamoon = new Kinetic.Image({
                x: 0,
                y: 0,
                image: imageObj,
                draggable: true
            }),
            filtered = new Kinetic.Image({
                x: 300,
                y: 0,
                image: imageObj,
                draggable: true
            });

            layer.add(bamoon);
            layer.add(filtered);
            stage.add(layer);

            filtered.cache();
            filtered.filters([Kinetic.Filters.Mask]);
            filtered.threshold(10);

            layer.draw();

            done();

        };
        imageObj.src = 'assets/bamoon.jpg';

    });

});