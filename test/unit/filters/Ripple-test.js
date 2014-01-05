suite('Ripple', function() {
    // ======================================================
    test('basic ripple', function(done) {
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
            darth.filters([Kinetic.Filters.Ripple]);
            darth.rippleSize(10);

            assert.equal(darth.rippleSize(), 10);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);
            
            darth.rippleSize(20);

            assert.equal(darth.rippleSize(), 20);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('tween ripple offset', function(done) {
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
            darth.filters([Kinetic.Filters.Ripple]);
            darth.rippleSize(16);
            darth.rippleOffset(0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              rippleOffset: 32,
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
    test('tween ripple size', function(done) {
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
            darth.filters([Kinetic.Filters.Ripple]);
            darth.rippleSize(16);
            darth.rippleOffset(0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              rippleSize: 64,
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