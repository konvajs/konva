suite('Posterize', function () {

    // ======================================================
    test('on image tween', function(done) {
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
            darth.filters([Konva.Filters.Posterize]);
            darth.levels(0.2);
            layer.draw();

            var tween = new Konva.Tween({
              node: darth, 
              duration: 1.0,
              levels: 0,
              easing: Konva.Easings.Linear
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
