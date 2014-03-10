suite('Blur', function() {
    // ======================================================
    test('basic blur', function(done) {
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
            darth.filters([Kinetic.Filters.Blur]);
            darth.blurRadius(10);

            assert.equal(darth.blurRadius(), 10);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);
            
            darth.blurRadius(20);

            assert.equal(darth.blurRadius(), 20);
            assert.equal(darth._filterUpToDate, false);

            layer.draw();

            assert.equal(darth._filterUpToDate, true);

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';

    });

  test('blur group', function(){
    var stage = addStage();
    var layer = new Kinetic.Layer();
    var group = new Kinetic.Group({
        x: 100,
        y: 100,
        draggable: true
    });
    var top = new Kinetic.Circle({
        x: 0,
        y: -70,
        radius: 30,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 4
    });
    var right = new Kinetic.Circle({
        x: 70,
        y: 0,
        radius: 30,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 4
    });
    var bottom = new Kinetic.Circle({
        x: 0,
        y: 70,
        radius: 30,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 4
    });
    var left = new Kinetic.Circle({
        x: -70,
        y: 0,
        radius: 30,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 4
    });

    group.add(top).add(right).add(bottom).add(left);
    layer.add(group);
    stage.add(layer);

    group.cache({
        x: -150,
        y: -150,
        width: 300,
        height: 300
    });

    group.offset({
      x: 150, 
      y: 150
    });

    group.filters([Kinetic.Filters.Blur]);
    group.blurRadius(20);

    layer.draw();

    //document.body.appendChild(group._cache.canvas.hit._canvas);






    //showHit(layer);
  });

    // ======================================================
    test('tween blur', function(done) {
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
            darth.filters([Kinetic.Filters.Blur]);
            darth.blurRadius(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              blurRadius: 0,
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

    // ======================================================
    test('crop blur', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                crop: {x:128, y:48, width:256, height:128},
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.cache();
            darth.filters([Kinetic.Filters.Blur]);
            darth.blurRadius(10);
            layer.draw();

            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('crop tween blur', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                crop: {x:128, y:48, width:256, height:128},
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.cache();
            darth.filters([Kinetic.Filters.Blur]);
            darth.blurRadius(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              blurRadius: 0,
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

    // ======================================================
    test('transparency', function(done) {
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
            darth.filters([Kinetic.Filters.Blur]);
            darth.blurRadius(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 2.0,
              blurRadius: 0,
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
    test('blur hit region', function(done) {
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

            //console.log(darth.hasStroke())

            layer.add(darth);
            stage.add(layer);

            darth.cache();
            darth.filters([Kinetic.Filters.Blur]);
            darth.blurRadius(20);
            darth.drawHitFromCache(100);
            layer.draw();

            showCanvas(darth._cache.canvas.hit._canvas);

            //console.log(darth._cache.canvas.hit.getContext().getTrace());

            //assert.equal(darth._cache.canvas.hit.getContext().getTrace(true), 'save();translate();beginPath();rect();closePath();save();fillStyle;fill();restore();restore();clearRect();getImageData();putImageData();');



            done();

        };
        imageObj.src = 'assets/lion.png';
    });

});