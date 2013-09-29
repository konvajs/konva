suite('Convolve Pack', function() {

    // ======================================================
    test('emboss', function(done) {
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
            darth.setFilter(Kinetic.Filters.Emboss);
            darth.setFilterAmount(50);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
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
        //imageObj.src = 'assets/darth-vader.jpg';
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('edge detect', function(done) {
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
            darth.setFilter(Kinetic.Filters.Edge);
            darth.setFilterAmount(50);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
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
        //imageObj.src = 'assets/darth-vader.jpg';
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('unsharp mask', function(done) {
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
            darth.setFilter(Kinetic.Filters.UnsharpMask);
            darth.setFilterAmount(50);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
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
        //imageObj.src = 'assets/darth-vader.jpg';
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('soft blur', function(done) {
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
            darth.setFilter(Kinetic.Filters.SoftBlur);
            darth.setFilterAmount(50);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
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
        //imageObj.src = 'assets/darth-vader.jpg';
        imageObj.src = 'assets/lion.png';

    });

});