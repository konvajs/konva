suite('Brighten', function() {
    // ======================================================
    test('basic', function(done) {
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

            darth.cache();
            darth.filters([Kinetic.Filters.Brighten]);
            darth.brightness(0.3);
            layer.draw();

            assert.equal(darth.brightness(), 0.3);

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';

    });

    // ======================================================
    test('tween', function(done) {
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

            darth.cache();
            darth.filters([Kinetic.Filters.Brighten]);
            darth.brightness(0.3);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              brightness: 0,
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

            darth.cache();
            darth.filters([Kinetic.Filters.Brighten]);
            darth.brightness(-0.3);
            layer.draw();

            assert.equal(darth.brightness(), -0.3);

            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('tween transparency', function(done) {
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

            darth.cache();
            darth.filters([Kinetic.Filters.Brighten]);
            darth.brightness(0.3);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              brightness: -0.3,
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