suite('Blur', function() {
    // ======================================================
    test('basic blur', function() {
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

            darth.setFilter(Kinetic.Filters.Blur);
            darth.setFilterRadius(10);
            layer.draw();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('tween blur', function() {
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

            darth.setFilter(Kinetic.Filters.Blur);
            darth.setFilterRadius(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              filterRadius: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('crop blur', function() {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                crop: {x:48, y:48, width:256, height:256},
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Blur);
            darth.setFilterRadius(10);
            layer.draw();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

});