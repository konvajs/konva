suite('Enhance', function () {
    // ======================================================
    test('on image', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            var filt = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });
            var orig = new Kinetic.Image({
                x: 200,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(filt);
            layer.add(orig);
            stage.add(layer);

            filt.cache();
            filt.filters([Kinetic.Filters.Enhance]);
            layer.draw();

            done();
        };
        imageObj.src = 'assets/bamoon.jpg';

    });
});
