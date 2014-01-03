suite('Threshold', function () {
    // ======================================================
    test('image tween', function(done) {
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
            darth.filters([Kinetic.Filters.Threshold]);
            darth.threshold(1);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              threshold: 0,
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

});
