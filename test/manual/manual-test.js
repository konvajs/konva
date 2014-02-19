suite('Manual', function() {

    // ======================================================
    test('oscillation animation', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

      var hexagon = new Kinetic.RegularPolygon({
        x: stage.width()/2,
        y: stage.height()/2,
        sides: 6,
        radius: 70,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4
      });


      // var hexagon = new Kinetic.Rect({
      //   x: stage.width()/2,
      //   y: stage.height()/2,
      //   width: 100,
      //   height: 50,
      //   fill: 'red',
      //   stroke: 'black',
      //   strokeWidth: 4
      // });

      layer.add(hexagon);
      stage.add(layer);

      var amplitude = 150;
      var period = 2000;
      // in ms
      var centerX = stage.width()/2;

      var anim = new Kinetic.Animation(function(frame) {
        hexagon.setX(amplitude * Math.sin(new Date().getTime() * 2 * Math.PI / period) + centerX);
      }, layer);

      anim.start();

    });

    // ======================================================
    test('rotation animation', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var rect;

        for (var n=0; n<100; n++) {
            rect = new Kinetic.Rect({
                x: Math.random() * 400,
                y: Math.random() * 400,
                width: 100,
                height: 50,
                fill: 'red',
                stroke: 'black',
                strokeWidth: 4
            });

            layer.add(rect);
        }



        stage.add(layer);

        var velocity = 360; // 1 rev per second

        var anim = new Kinetic.Animation(function(frame) {
            layer.find('Rect').rotate(velocity * frame.timeDiff / 1000);
        }, layer);

        anim.start();
    });

    // ======================================================
    test('tween node', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 2,
            opacity: 0.2
        });

        layer.add(rect);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: rect, 
            duration: 1,
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            opacity: 1,
            strokeWidth: 6,
            scaleX: 1.5
        });


        tween.play();
 

    });


    // ======================================================
    test('tween spline', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Line({
            points: [
                73, 160,
                340, 23,
                500, 109,
                300, 109
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(spline);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: spline,
            duration: 1,
           //x: 100,

            points: [
                200, 160,
                200, 23,
                500, 109,
                100, 10
            ],
            easing: Kinetic.Easings.BackEaseOut,
            yoyo: false
        });

        // stage.getContent().addEventListener('mouseover', function() {
        //   tween.play();
        // });

        // stage.getContent().addEventListener('mouseout', function() {
        //   tween.reverse();
        // });

        tween.play();
    });

    // ======================================================
    test('blur and tween spline', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Line({
            points: [
                73, 160,
                340, 23,
                500, 109,
                300, 109
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(spline);
        stage.add(layer);

        spline.cache({
            width: stage.width(),
            height: stage.height()
        });

        spline.filters([Kinetic.Filters.Blur]).blurRadius(40);
        layer.draw();

        layer.on('beforeDraw', function() {
            spline.cache({
                width: stage.width(),
                height: stage.height()
            });
        });

        var tween = new Kinetic.Tween({
            node: spline,
            duration: 2,
           //x: 100,

            points: [
                200, 160,
                200, 23,
                500, 109,
                100, 10
            ],
            blurRadius: 0,
            easing: Kinetic.Easings.BackEaseOut,
            yoyo: false
        });

        // stage.getContent().addEventListener('mouseover', function() {
        //   tween.play();
        // });

        // stage.getContent().addEventListener('mouseout', function() {
        //   tween.reverse();
        // });

        tween.play();
    });
});