suite('Solarize', function() {

    // ======================================================
    test('solarize', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            var layer = new Konva.Layer();
            darth = new Konva.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);
            darth.cache();
            darth.filters([Konva.Filters.Solarize]);


            layer.draw();


            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
        //imageObj.src = 'assets/lion.png';

    });

});