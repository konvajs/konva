suite('Kaleidoscope', function() {
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
            darth.filters([Kinetic.Filters.Kaleidoscope]);
            darth.kaleidoscopeSides(9);

            assert.equal(darth.kaleidoscopeSides(), 9);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);
            
            darth.kaleidoscopeSides(16);

            assert.equal(darth.kaleidoscopeSides(), 16);
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
            darth.filters([Kinetic.Filters.Kaleidoscope]);
            darth.kaleidoscopeSides(5);
            darth.kaleidoscopeOffset(0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 4.0,
              kaleidoscopeOffset: 64,
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
            darth.filters([Kinetic.Filters.Kaleidoscope]);
            darth.kaleidoscopeSides(1);
            darth.kaleidoscopeOffset(0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              kaleidoscopeSides: 32,
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