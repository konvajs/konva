suite('HSV', function() {


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

            darth.cache();
            darth.filters([Kinetic.Filters.HSV]);
            darth.hue(360);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 1.0,
              hue: 0,
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
    test('saturation tween transparancy', function(done) {
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
            darth.filters([Kinetic.Filters.HSV]);
            darth.saturation(2.0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 1.0,
              saturation: 0.001,
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
    test('value tween transparancy', function(done) {
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
            darth.filters([Kinetic.Filters.HSV]);
            darth.value(2.0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 1.0,
              value: 0.001,
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
