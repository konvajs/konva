suite('Kalidescope', function() {
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
            darth.filters([Kinetic.Filters.Kalidescope]);
            darth.kalidescopeSides(9);

            assert.equal(darth.kalidescopeSides(), 9);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);
            
            darth.kalidescopeSides(16);

            assert.equal(darth.kalidescopeSides(), 16);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('tween offset', function(done) {
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
            darth.filters([Kinetic.Filters.Kalidescope]);
            darth.kalidescopeSides(5);
            darth.kalidescopeOffset(0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 4.0,
              kalidescopeOffset: 64,
              //rippleSize: 64,
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

    // ======================================================
    test('tween sides', function(done) {
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
            darth.filters([Kinetic.Filters.Kalidescope]);
            darth.kalidescopeSides(1);
            darth.kalidescopeOffset(0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              kalidescopeSides: 32,
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
        imageObj.src = 'assets/cropped-darth.jpg';
    });

});