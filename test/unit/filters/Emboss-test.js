suite('Emboss', function() {

    // ======================================================
    test('basic emboss', function(done) {
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
            darth.filters([Konva.Filters.Emboss]);
            darth.embossStrength(0.5);
            darth.embossWhiteLevel(0.8);
            darth.embossDirection('top-right');

            layer.draw();

            var tween = new Konva.Tween({
              node: darth, 
              duration: 0.6,
              embossStrength: 10,
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
        imageObj.src = 'assets/darth-vader.jpg';
        //imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('blended emboss', function(done) {
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
            darth.filters([Konva.Filters.Emboss]);
            darth.embossStrength(0.5);
            darth.embossWhiteLevel(0.2);
            darth.embossBlend(true);
            
            layer.draw();

            var tween = new Konva.Tween({
              node: darth, 
              duration: 0.6,
              embossStrength: 10,
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
        imageObj.src = 'assets/darth-vader.jpg';
        //imageObj.src = 'assets/lion.png';

    });
});