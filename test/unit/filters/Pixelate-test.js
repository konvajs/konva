suite('Pixelate', function () {

    // ======================================================
    test('tween pixelate', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            lion = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(lion);
            stage.add(layer);

            lion.cache();
            lion.filters([Kinetic.Filters.Pixelate]);
            lion.pixelSize(16);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: lion, 
              duration: 3.0,
              pixelSize: 1,
              easing: Kinetic.Easings.EaseInOut
            });
        
            lion.on('mouseover', function() {
              tween.play();
            });
      
            lion.on('mouseout', function() {
              tween.reverse();
            });

            done();

        };
        imageObj.src = 'assets/lion.png';
    });
});
