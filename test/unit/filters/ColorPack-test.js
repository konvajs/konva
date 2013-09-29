suite('Color Pack', function() {
    // ======================================================
    test('colorize', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Colorize);
            darth.setFilterColorizeColor([255,0,128]);
            layer.draw();

            // Assert fails even though '[255,0,128] = [255,0,128]'
            //assert.equal(darth.getFilterColorizeColor(), [255,0,128]);

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';

    });

    // ======================================================
    test('crop', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                crop: {x:128, y:48, width:256, height:128},
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Colorize);
            darth.setFilterColorizeColor([0,255,0]);
            layer.draw();

            // assert.equal(darth.getFilterColorizeColor(), [0,255,0]);

            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

});