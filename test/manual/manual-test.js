suite('Manual', function() {

    // ======================================================
    test('oscillation animation', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

      var hexagon = new Konva.RegularPolygon({
        x: stage.width()/2,
        y: stage.height()/2,
        sides: 6,
        radius: 70,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4
      });


      // var hexagon = new Konva.Rect({
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

      var anim = new Konva.Animation(function(frame) {
        hexagon.setX(amplitude * Math.sin(new Date().getTime() * 2 * Math.PI / period) + centerX);
      }, layer);

      anim.start();

    });

    // ======================================================
    test('rotation animation', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect;

        for (var n=0; n<100; n++) {
            rect = new Konva.Rect({
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

        var anim = new Konva.Animation(function(frame) {
            layer.find('Rect').rotate(velocity * frame.timeDiff / 1000);
        }, layer);

        anim.start();
    });

    // ======================================================
    test('tween node', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
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

        var tween = new Konva.Tween({
            node: rect, 
            duration: 1,
            x: 400,
            y: 30,
            rotation: 90,
            opacity: 1,
            strokeWidth: 6,
            scaleX: 1.5
        });


        tween.play();
 

    });


    // ======================================================
    test('tween spline', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var spline = new Konva.Line({
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

        var tween = new Konva.Tween({
            node: spline,
            duration: 1,
           //x: 100,

            points: [
                200, 160,
                200, 23,
                500, 109,
                100, 10
            ],
            easing: Konva.Easings.BackEaseOut,
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
        var layer = new Konva.Layer();

        var spline = new Konva.Line({
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

        spline.filters([Konva.Filters.Blur]).blurRadius(40);
        layer.draw();

        layer.on('beforeDraw', function() {
            spline.cache({
                width: stage.width(),
                height: stage.height()
            });
        });

        var tween = new Konva.Tween({
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
            easing: Konva.Easings.BackEaseOut,
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

    test('Make sure that all texts are inside rectangles.', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            fontSize: 50,
            y : 5,
            x : 25,
            fill: 'black',
            text: 'text'
        });
        var params = text.getSelfRect();
        var rect = new Konva.Rect({
            x : text.x() + params.x,
            y : text.y() + params.y,
            width : params.width,
            height : params.height,
            stroke : 'black'
        });
        layer.add(rect, text);

        text = new Konva.Text({
            fontSize: 40,
            y : 40,
            x : 150,
            fill: 'black',
            text: 'Hello\nWorld! How Are you?',
            align : 'center'
        });
        params = text.getSelfRect();
        rect = new Konva.Rect({
            x : text.x() + params.x,
            y : text.y() + params.y,
            width : params.width,
            height : params.height,
            stroke : 'black'
        });
        layer.add(rect, text);

        stage.add(layer);
    });

    test('change hit graph ratio', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x : stage.width() / 2,
            y : stage.height() / 2,
            radius : 50,
            stroke : 'black',
            fill : 'red',
            strokeWidth : 5,
            draggable : true
        });

        var text = new Konva.Text({
            text : "click on circle to decrease hit grpah retion"
        });

        layer.add(circle, text);
        stage.add(layer);
        showHit(layer);

        circle.on('mouseenter', function() {
            document.body.style.cursor = 'pointer';
        });

        circle.on('mouseleave', function() {
            document.body.style.cursor = 'default';
        });

        circle.on('click', function() {
            var ratio = layer.getHitCanvas().getPixelRatio() * 0.8;
            console.log('new ratio', ratio);
            layer.getHitCanvas().setPixelRatio(ratio);
            layer.draw();
        });
    });

    test('tween color', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 4,
            shadowOffsetX : 10,
            shadowOffsetY : 10,
            shadowColor : 'black'
        });

        var text = new Konva.Text({
            text : 'click on circle to start tween'
        });

        layer.add(circle, text);
        stage.add(layer);


        circle.on('click', function() {
            var tween = new Konva.Tween({
                node: circle,
                duration: 1,
                fill : Konva.Util.getRandomColor(),
                stroke : Konva.Util.getRandomColor(),
                shadowColor : Konva.Util.getRandomColor()
            });
            tween.play();
        });
    });


    // ======================================================
    test('create image hit region with pixelRatio, look at hit, test hit with mouseover', function(done) {
        var imageObj = new Image();

        Konva.pixelRatio = 2;
        var stage = addStage();
        var layer = new Konva.Layer();

        imageObj.onload = function() {

            var lion = new Konva.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true
            });

            layer.add(lion);

            stage.add(layer);

            lion.cache();
            lion.drawHitFromCache();
            layer.draw();

            lion.on('mouseenter', function() {
                document.body.style.cursor = 'pointer';
            });

            lion.on('mouseleave', function() {
                document.body.style.cursor = 'default';
            });

            Konva.pixelRatio = undefined;
            done();


        };
        imageObj.src = 'assets/lion.png';

        showHit(layer);
    });

    // ======================================================
    test('image hit region with alpha threshold, mouseover circle', function(done) {
        var stage = addStage();
        var layer = new Konva.Layer();
        stage.add(layer);

        var group = new Konva.Group();

        var circle = new Konva.Circle({
            x : 50,
            y : 50,
            fill: 'red',
            radius : 40
        });
        var rect = new Konva.Rect({
            width : 100,
            height : 100,
            fill : 'green',
            opacity : 0.5
        });
        group.add(rect, circle);

        group.toImage({
            width : 100,
            height : 100,
            callback :function(img) {
                var image = new Konva.Image({
                    image: img
                });
                image.cache();
                image.drawHitFromCache(200);
                layer.add(image);
                layer.draw();
                var shape = layer.getIntersection({
                    x : 5,
                    y : 5
                });

                assert.equal(!!shape, false, 'shape should not be detected');


                image.on('mouseenter', function () {
                    document.body.style.cursor = 'pointer';
                });

                image.on('mouseleave', function () {
                    document.body.style.cursor = 'default';
                });
                done();
            }
        });

        showHit(layer);
    });
});
