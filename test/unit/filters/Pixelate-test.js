suite('Pixelate', function () {

    // ======================================================
    test('tween pixelate', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Konva.Layer();
            lion = new Konva.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(lion);
            stage.add(layer);

            lion.cache();
            lion.filters([Konva.Filters.Pixelate]);
            lion.pixelSize(16);
            layer.draw();

            var tween = new Konva.Tween({
              node: lion, 
              duration: 3.0,
              pixelSize: 1,
              easing: Konva.Easings.EaseInOut
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
