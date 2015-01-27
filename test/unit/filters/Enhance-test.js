suite('Enhance', function () {
    // ======================================================
    test('on image', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Konva.Layer();
            var filt = new Konva.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });
            var orig = new Konva.Image({
                x: 200,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(filt);
            layer.add(orig);
            stage.add(layer);

            filt.cache();
            filt.enhance(1.0);
            filt.filters([Konva.Filters.Enhance]);
            layer.draw();

            done();
        };
        imageObj.src = 'assets/scorpion-sprite.png';

    });

    // ======================================================
    test('tween enhance', function(done) {
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
            darth.filters([Konva.Filters.Enhance]);
            darth.enhance(-1);
            layer.draw();

            var tween = new Konva.Tween({
              node: darth, 
              duration: 2.0,
              enhance: 1.0,
              easing: Konva.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            done();

        };
        imageObj.src = 'assets/scorpion-sprite.png';
    });
});
