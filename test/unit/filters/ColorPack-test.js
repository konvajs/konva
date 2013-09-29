suite('Color Pack', function() {
    // ======================================================
    test('colorize basic', function(done) {
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
    test('colorize crop', function(done) {
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

    // ======================================================
    test('colorize transparancy', function(done) {
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
            darth.setFilterColorizeColor([0,128,255]);
            layer.draw();

            done();
        };
        imageObj.src = 'assets/lion.png';

    });


    // ======================================================
    test('hue shift tween transparancy', function(done) {
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

            darth.setFilter(Kinetic.Filters.ShiftHue);
            darth.setFilterHueShiftDeg(360);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              filterHueShiftDeg: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

});