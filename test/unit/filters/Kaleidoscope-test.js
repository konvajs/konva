suite('Kaleidoscope', function() {
    // ======================================================
    test('basic', function(done) {
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
            darth.filters([Konva.Filters.Kaleidoscope]);
            darth.kaleidoscopePower(2);

            assert.equal(darth.kaleidoscopePower(), 2);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);
            
            darth.kaleidoscopePower(3);

            assert.equal(darth.kaleidoscopePower(), 3);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('tween angle', function(done) {
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
            darth.filters([Konva.Filters.Kaleidoscope]);
            darth.kaleidoscopePower(3);
            darth.kaleidoscopeAngle(0);
            layer.draw();

            var tween = new Konva.Tween({
              node: darth, 
              duration: 10.0,
              kaleidoscopeAngle: 720,
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
        imageObj.src = 'assets/lion.png';
    });

    // ======================================================
    test('tween power', function(done) {
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
            darth.filters([Konva.Filters.Kaleidoscope]);
            darth.kaleidoscopePower(0);
            darth.kaleidoscopeAngle(0);
            layer.draw();

            var tween = new Konva.Tween({
              node: darth, 
              duration: 2.0,
              kaleidoscopePower: 8,
              easing: Konva.EasingsEaseInOut
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