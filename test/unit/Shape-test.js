suite('Shape', function() {
    // ======================================================
    test('test intersects()', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        assert.equal(rect.intersects({
            x: 201,
            y: 101
        }), true, '(201,101) should intersect the shape');

        assert.equal(rect.intersects({
            x: 197,
            y: 97
        }), false, '(197, 97) should not intersect the shape');

        assert.equal(rect.intersects({
            x: 250,
            y: 125
        }), true, '(250, 125) should intersect the shape');

        assert.equal(rect.intersects({
            x: 300,
            y: 150
        }), true, '(300, 150) should intersect the shape');

        assert.equal(rect.intersects({
            x: 303,
            y: 153
        }), false, '(303, 153) should not intersect the shape');

    });

    // ======================================================
    test('test hasShadow() method', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var shape = new Konva.Shape({
            sceneFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                context.fillStrokeShape(this);
            },
            x: 10,
            y: 10,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            shadowColor: 'black',
            shadowOffset: 10,
            shadowOpacity: 0
        });

        layer.add(shape);
        stage.add(layer);

        assert.equal(shape.hasShadow(), false, 'shape should not have a shadow because opacity is 0');

        shape.setShadowOpacity(0.5);

        assert.equal(shape.hasShadow(), true, 'shape should have a shadow because opacity is nonzero');

        shape.setShadowEnabled(false);

        assert.equal(shape.hasShadow(), false, 'shape should not have a shadow because it is not enabled');
    });

    // ======================================================
    test('custom shape with fill, stroke, and strokeWidth', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var shape = new Konva.Shape({
            sceneFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                context.fillStrokeShape(this);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        layer.add(shape);
        stage.add(layer);
    });

    // ======================================================
    test('add star with translated, scaled, rotated fill', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Konva.Layer();

            var star = new Konva.Star({
                x: 200,
                y: 100,
                numPoints: 5,
                innerRadius: 40,
                outerRadius: 70,

                fillPatternImage: imageObj,
                fillPatternX: -20,
                fillPatternY: -30,
                fillPatternScale: {x: 0.5, y:0.5},
                fillPatternOffset: {x: 219, y: 150},
                fillPatternRotation: 90,
                fillPatternRepeat: 'no-repeat',

                stroke: 'blue',
                strokeWidth: 5,
                draggable: true
            });

            layer.add(star);
            stage.add(layer);

            /*
             var anim = new Konva.Animation(function() {
             star.attrs.fill.rotation += 0.02;
             }, layer);
             anim.start();
             */

            assert.equal(star.getFillPatternX(), -20, 'star fill x should be -20');
            assert.equal(star.getFillPatternY(), -30, 'star fill y should be -30');
            assert.equal(star.getFillPatternScale().x, 0.5, 'star fill scale x should be 0.5');
            assert.equal(star.getFillPatternScale().y, 0.5, 'star fill scale y should be 0.5');
            assert.equal(star.getFillPatternOffset().x, 219, 'star fill offset x should be 219');
            assert.equal(star.getFillPatternOffset().y, 150, 'star fill offset y should be 150');
            assert.equal(star.getFillPatternRotation(), 90, 'star fill rotation should be 90');

            star.setFillPatternRotation(180);

            assert.equal(star.getFillPatternRotation(), 180, 'star fill rotation should be 180');

            star.setFillPatternScale({x:1, y:1});

            assert.equal(star.getFillPatternScale().x, 1, 'star fill scale x should be 1');
            assert.equal(star.getFillPatternScale().y, 1, 'star fill scale y should be 1');

            star.setFillPatternOffset({x:100, y:120});

            assert.equal(star.getFillPatternOffset().x, 100, 'star fill offset x should be 100');
            assert.equal(star.getFillPatternOffset().y, 120, 'star fill offset y should be 120');

            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('test size setters and getters', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 50,
            fill: 'red'
        });

        var ellipse = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 50,
            fill: 'yellow'
        });

        layer.add(ellipse);
        layer.add(circle);
        stage.add(layer);

        // circle tests
        assert.equal(circle.getWidth(), 100, 'circle width should be 100');
        assert.equal(circle.getHeight(), 100, 'circle height should be 100');
        assert.equal(circle.getSize().width, 100, 'circle width should be 100');
        assert.equal(circle.getSize().height, 100, 'circle height should be 100');
        assert.equal(circle.getRadius(), 50, 'circle radius should be 50');

        circle.setWidth(200);

        assert.equal(circle.getWidth(), 200, 'circle width should be 200');
        assert.equal(circle.getHeight(), 200, 'circle height should be 200');
        assert.equal(circle.getSize().width, 200, 'circle width should be 200');
        assert.equal(circle.getSize().height, 200, 'circle height should be 200');
        assert.equal(circle.getRadius(), 100, 'circle radius should be 100');


    });

    // ======================================================
    test('set image fill to color then image then linear gradient then back to image', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Konva.Layer();
            var circle = new Konva.Circle({
                x: 200,
                y: 60,
                radius: 50,
                fill: 'blue'
            });

            layer.add(circle);
            stage.add(layer);

            assert.equal(circle.getFill(), 'blue', 'circle fill should be blue');

            circle.setFill(null);
            circle.setFillPatternImage(imageObj);
            circle.setFillPatternRepeat('no-repeat');
            circle.setFillPatternOffset({x:-200, y:-70});

            assert.notEqual(circle.getFillPatternImage(), undefined, 'circle fill image should be defined');
            assert.equal(circle.getFillPatternRepeat(), 'no-repeat', 'circle fill repeat should be no-repeat');
            assert.equal(circle.getFillPatternOffset().x, -200, 'circle fill offset x should be -200');
            assert.equal(circle.getFillPatternOffset().y, -70, 'circle fill offset y should be -70');

            circle.setFillPatternImage(null);
            circle.setFillLinearGradientStartPoint({x:-35,y:-35});
            circle.setFillLinearGradientEndPoint({x:35,y:35});
            circle.setFillLinearGradientColorStops([0, 'red', 1, 'blue']);

            circle.setFillLinearGradientStartPoint(null);
            circle.setFillPatternImage(imageObj);
            circle.setFillPatternRepeat('repeat');
            circle.setFillPatternOffset({x:0,y:0});

            layer.draw();

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('test enablers and disablers', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: {x:10, y:10},
            dash: [10, 10],
            scaleX: 3
        });
        layer.add(circle);
        stage.add(layer);

        assert.equal(circle.getStrokeScaleEnabled(), true);
        assert.equal(circle.getFillEnabled(), true, 'fillEnabled should be true');
        assert.equal(circle.getStrokeEnabled(), true, 'strokeEnabled should be true');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.dashEnabled(), true, 'dashEnabled should be true');

        circle.strokeScaleEnabled(false);
        assert.equal(circle.getStrokeScaleEnabled(), false);

        layer.draw();
//        var trace = layer.getContext().getTrace();

        circle.fillEnabled(false);
        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');


        circle.strokeEnabled(false);
        assert.equal(circle.getStrokeEnabled(), false, 'strokeEnabled should be false');

        circle.shadowEnabled(false);
        assert.equal(circle.getShadowEnabled(), false, 'shadowEnabled should be false');

        circle.dashEnabled(false);
        assert.equal(circle.dashEnabled(), false, 'dashEnabled should be false');

        // re-enable

        circle.dashEnabled(true);
        assert.equal(circle.getDashEnabled(), true, 'dashEnabled should be true');

        circle.shadowEnabled(true);
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');

        circle.strokeEnabled(true);
        assert.equal(circle.getStrokeEnabled(), true, 'strokeEnabled should be true');

        circle.fillEnabled(true);
        assert.equal(circle.getFillEnabled(), true, 'fillEnabled should be true');

    });

  // ======================================================
  test('fill with shadow and opacity', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
          x: 100,
          y: 50,
          width: 100,
          height: 50,
          fill: 'green',
          opacity: 0.5,
          shadowColor: 'black',
          shadowBlur: 10,
          shadowOffset: {x:10, y:10},
          shadowOpacity: 0.5
        });

        layer.add(rect);
        stage.add(layer);

        assert.equal(rect.getX(), 100);
        assert.equal(rect.getY(), 50);

      var canvas = createCanvas();
      var context = canvas.getContext('2d');
      context.globalAlpha = 0.5;
      // rect
      context.beginPath();
      context.rect(100, 50, 100, 50);
      context.closePath();

      context.fillStyle = 'green';
      context.shadowColor = 'rgba(0,0,0,0.5)';
      context.shadowBlur = 10;
      context.shadowOffsetX = 10;
      context.shadowOffsetY = 10;
      context.fill();

      compareLayerAndCanvas(layer, canvas, 10);

    var trace = layer.getContext().getTrace();

    assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);save();globalAlpha=0.5;shadowColor=rgba(0,0,0,0.5);shadowBlur=10;shadowOffsetX=10;shadowOffsetY=10;beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();restore();restore();');

  });

  // ======================================================
  test('stroke with shadow and opacity', function(){
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      stroke: 'red',
      strokeWidth: 20,
      opacity: 0.5,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: {x:10, y:10},
      shadowOpacity: 0.5
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.getX(), 100);
    assert.equal(rect.getY(), 50);

      var canvas = createCanvas();
      var context = canvas.getContext('2d');
      context.globalAlpha = 0.5;
      // rect
      context.beginPath();
      context.rect(100, 50, 100, 50);
      context.closePath();

      context.strokeStyle = 'red';
      context.lineWidth = 20;


      context.shadowColor = 'rgba(0,0,0,0.5)';
      context.shadowBlur = 10;
      context.shadowOffsetX = 10;
      context.shadowOffsetY = 10;
      context.stroke();

      compareLayerAndCanvas(layer, canvas, 10);

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);save();globalAlpha=0.5;shadowColor=rgba(0,0,0,0.5);shadowBlur=10;shadowOffsetX=10;shadowOffsetY=10;beginPath();rect(0,0,100,50);closePath();lineWidth=20;strokeStyle=red;stroke();restore();restore();');
  });


    // ======================================================
    test('fill and stroke with opacity', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 10,
            opacity : 0.5
        });

        layer.add(rect);

        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.globalAlpha = 0.5;
        // stroke
        context.beginPath();
        context.moveTo(100,50);
        context.lineTo(200,50);
        context.lineTo(200,100);
        context.lineTo(100,100);
        context.closePath();
        context.lineWidth = 10;
        context.strokeStyle = 'black';
        context.stroke();

        // rect
        context.fillStyle = 'green';
        context.fillRect(105, 55, 90, 40);

        compareLayerAndCanvas(layer, canvas, 10);
    });

    // ======================================================
    test('fill and stroke with shadow', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 10,
            shadowColor: 'grey',
            shadowBlur: 10,
            shadowOffset: {
                x: 20,
                y: 20
            }
        });

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'grey';
        context.shadowBlur = 10;
        context.shadowOffsetX = 20;
        context.shadowOffsetY = 20;
        context.lineWidth  = 10;
        context.stroke();
        context.fill();



        // clear the shadow
        context.shadowColor = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        // restroke without the shaodw
        context.stroke();

        compareLayerAndCanvas(layer, canvas, 10);


        var trace = layer.getContext().getTrace();
        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);save();shadowColor=rgba(128,128,128,1);shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();lineWidth=10;strokeStyle=black;stroke();restore();beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();lineWidth=10;strokeStyle=black;stroke();restore();');
    });

    // ======================================================
    test('fill and stroke with shadow and opacity', function(){
        var stage = addStage();
        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 10,
            shadowColor: 'grey',
            opacity : 0.5,
            shadowBlur : 1,
            shadowOffset: {
                x: 20,
                y: 20
            }
        });


        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.globalAlpha = 0.1;

        // draw shadow
        context.save();
        context.beginPath();
        context.rect(95, 45, 110, 60);
        context.closePath();
        context.shadowColor = 'grey';
        context.shadowBlur = 1;
        context.shadowOffsetX = 20;
        context.shadowOffsetY = 20;
        context.fillStyle = 'black';
        context.fill();
        context.restore();

        // draw "stroke"
        context.save();
        context.beginPath();
        context.moveTo(100,50);
        context.lineTo(200,50);
        context.lineTo(200,100);
        context.lineTo(100,100);
        context.closePath();
        context.lineWidth = 10;
        context.strokeStyle = 'black';
        context.stroke();
        context.restore();

        context.save();
        context.beginPath();
        context.fillStyle = 'green';
        context.rect(105, 55, 90, 40);
        context.closePath();
        context.fill();
        context.restore();


        // don't test in PhantomJS as it use old chrome engine
        // it it has opacity + shadow bug
        if (!window.mochaPhantomJS) {
            compareLayerAndCanvas(layer, canvas, 200);
        }

        var trace = layer.getContext().getTrace();
        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();save();shadowColor=rgba(128,128,128,1);shadowBlur=1;shadowOffsetX=20;shadowOffsetY=20;globalAlpha=0.5;drawImage([object HTMLCanvasElement],0,0,578,200);restore();restore();');

    });

    // ======================================================
    test('text with fill and stroke with shadow', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var text = new Konva.Text({
            x: 50,
            y: 50,
            text : 'Test TEXT',
            fontSize :  50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 2,
            shadowColor: 'grey',
            shadowBlur: 2,
            shadowOffset: {
                x: 20,
                y: 20
            }
        });

        layer.add(text);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        context.save();
        context.shadowColor = 'grey';
        context.shadowBlur = 2;
        context.shadowOffsetX = 20;
        context.shadowOffsetY = 20;
        context.font = 'normal 50px Arial';
        context.textBaseline = 'middle';

        context.fillStyle = 'green';
        context.fillText('Test TEXT', 50, 75);

        context.lineWidth  = 2;
        context.strokeStyle = 'black';
        context.strokeText('Test TEXT', 50, 75);

        context.stroke();
        context.fill();
        context.restore();

        // draw text again to remove shadow under stroke
        context.font = 'normal 50px Arial';
        context.textBaseline = 'middle';
        context.fillText('Test TEXT', 50, 75);
        context.fillStyle = 'green';
        context.fillText('Test TEXT', 50, 75);

        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.strokeText('Test TEXT', 50, 75);

        if (!window.isPhantomJS) {
            compareLayerAndCanvas(layer, canvas, 254);
        }
    });



    // ======================================================
    test('shape intersect with shadow', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            fill: '#ff0000',
            x: 50,
            y: 50,
            width: 200,
            height: 200,
            draggable: true,
            shadowColor: '#000' // if all shadow properties removed, works fine
        });
        layer.add(rect);
        stage.add(layer);

        //error here
        assert.equal(rect.intersects({x:52,y:52}), true);
        assert.equal(rect.intersects({x:45,y:45}), false);
    });

  // ======================================================
  test('overloaded getters and setters', function(){
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'red',
      strokeWidth: 20,
      draggable: true
    });

    layer.add(rect);
    stage.add(layer);

    rect.stroke('blue');
    assert.equal(rect.stroke(), 'blue');


    rect.lineJoin('bevel');
    assert.equal(rect.lineJoin(), 'bevel');

    rect.lineCap('square');
    assert.equal(rect.lineCap(), 'square');

    rect.strokeWidth(8);
    assert.equal(rect.strokeWidth(), 8);

    rect.sceneFunc('function');
    assert.equal(rect.sceneFunc(), 'function');

    rect.hitFunc('function');
    assert.equal(rect.hitFunc(), 'function');

    rect.dash([1]);
    assert.equal(rect.dash()[0], 1);

    // NOTE: skipping the rest because it would take hours to test all possible methods.
    // This should hopefully be enough to test Factor overloaded methods


  });

  // ======================================================
  test('create image hit region', function(done) {
      var imageObj = new Image();

      var stage = addStage();
      var layer = new Konva.Layer();

      imageObj.onload = function() {

          var lion = new Konva.Image({
              x: 200,
              y: 40,
              image: imageObj,
              draggable: true,
              shadowColor: 'black',
              shadowBlur: 10,
              shadowOffset: 20,
              shadowOpacity: 0.2
          });

          // override color key with black
          lion.colorKey = '#000000';
          Konva.shapes['#000000'] = lion;

          layer.add(lion);

          stage.add(layer);

          lion.cache();


          //document.body.appendChild(lion._cache.canvas.hit._canvas);


          lion.drawHitFromCache();


          layer.draw();


          done();


      };
      imageObj.src = 'assets/lion.png';

      showHit(layer);

      layer.hitCanvas._canvas.style.border='2px solid black';
  });

  test('test defaults', function() {
    var shape = new Konva.Shape();

    assert.equal(shape.strokeWidth(), 2);
    assert.equal(shape.shadowOffsetX(), 0);
    assert.equal(shape.shadowOffsetY(), 0);
    assert.equal(shape.fillPatternX(), 0);
    assert.equal(shape.fillPatternY(), 0);
    assert.equal(shape.fillRadialGradientStartRadius(), 0);
    assert.equal(shape.fillRadialGradientEndRadius(), 0);
    assert.equal(shape.fillPatternRepeat(), 'repeat');
    assert.equal(shape.fillEnabled(), true);
    assert.equal(shape.strokeEnabled(), true);
    assert.equal(shape.shadowEnabled(), true);
    assert.equal(shape.dashEnabled(), true);
    assert.equal(shape.strokeScaleEnabled(), true);
    assert.equal(shape.fillPriority(), 'color');
    assert.equal(shape.fillPatternOffsetX(), 0);
    assert.equal(shape.fillPatternOffsetY(), 0);
    assert.equal(shape.fillPatternScaleX(), 1);
    assert.equal(shape.fillPatternScaleY(), 1);
    assert.equal(shape.fillLinearGradientStartPointX(), 0);
    assert.equal(shape.fillLinearGradientStartPointY(), 0);
    assert.equal(shape.fillLinearGradientEndPointX(), 0);
    assert.equal(shape.fillLinearGradientEndPointY(), 0);
    assert.equal(shape.fillRadialGradientStartPointX(), 0);
    assert.equal(shape.fillRadialGradientStartPointY(), 0);
    assert.equal(shape.fillRadialGradientEndPointX(), 0);
    assert.equal(shape.fillRadialGradientEndPointY(), 0);
    assert.equal(shape.fillPatternRotation(), 0);
  });

    // ======================================================
    test.skip('hit graph when shape cached before adding to Layer', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 290,
            y: 111,
            width : 50,
            height : 50,
            fill : 'black'
        });
        rect.cache();

        var click = false;

        rect.on('click', function() {
            click = true;
        });

        layer.add(rect);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        showHit(layer);

        stage._mousedown({
            clientX: 300,
            clientY: 120 + top
        });

        Konva.DD._endDragBefore();
        stage._mouseup({
            clientX: 300,
            clientY: 120 + top
        });
        Konva.DD._endDragAfter({dragEndNode:rect});

        //TODO: can't get this to pass
        assert.equal(click, true, 'click event should have been fired when mousing down and then up on rect');
    });

    test('class inherince', function() {
        var rect = new Konva.Rect();
        assert.equal(rect instanceof Konva.Rect, true);
        assert.equal(rect instanceof Konva.Shape, true);
        assert.equal(rect instanceof Konva.Node, true);
    });

    test('disable stroke for hit', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            stroke: 'red',
            strokeWidth: 20
        });
        // default value
        assert.equal(rect.strokeHitEnabled(), true);

        rect.strokeHitEnabled(false);
        assert.equal(rect.strokeHitEnabled(), false);
        layer.add(rect);
        stage.add(layer);


        assert.equal(rect.getY(), 50);

        var trace = layer.getHitCanvas().getContext().getTrace(true);
        assert.equal(trace, 'clearRect();save();transform();beginPath();rect();closePath();save();fillStyle;fill();restore();restore();');
    });

    test('cache shadow color rgba', function() {
        var circle = new Konva.Circle({
            fill : 'green',
            radius : 50
        });
        // no shadow on start
        assert.equal(circle.hasShadow(), false);
        assert.equal(circle.getShadowRGBA(), undefined);

        // set shadow
        circle.shadowColor('black');
        assert.equal(circle.hasShadow(), true);
        assert.equal(circle.getShadowRGBA(), 'rgba(0,0,0,1)');

        // set another shadow property
        circle.shadowOpacity(0.2);
        assert.equal(circle.getShadowRGBA(), 'rgba(0,0,0,0.2)');

        circle.shadowColor('rgba(10,10,10,0.5)');
        assert.equal(circle.getShadowRGBA(), 'rgba(10,10,10,0.1)');


        // reset shadow
        circle.shadowColor(null);
        assert.equal(circle.getShadowRGBA(), undefined);
    });

    test('scale should also effect shadow offset', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            scaleX : 0.5,
            scaleY : 0.5,
            fill: 'green',
            shadowColor: 'black',
            shadowBlur: 0,
            shadowOffset: {x:10, y:10}
        });

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        // rect
        context.beginPath();
        context.rect(100, 100, 50, 50);
        context.closePath();

        context.fillStyle = 'green';
        context.shadowColor = 'rgba(0,0,0,1)';
        context.shadowBlur = 0;
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.fill();


        compareLayerAndCanvas(layer, canvas, 10);

        var trace = layer.getContext().getTrace();

        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(0.5,0,0,0.5,100,100);save();shadowColor=rgba(0,0,0,1);shadowBlur=0;shadowOffsetX=5;shadowOffsetY=5;beginPath();rect(0,0,100,100);closePath();fillStyle=green;fill();restore();restore();');
    });

    test('scale of parent container should also effect shadow offset', function() {
        var stage = addStage();

        var layer = new Konva.Layer();
        var group = new Konva.Group({
            x : 100,
            y : 100,
            scaleX : 0.5,
            scaleY : 0.5
        });
        var rect = new Konva.Rect({
            width: 200,
            height: 200,
            scaleX : 0.5,
            scaleY : 0.5,
            fill: 'green',
            shadowColor: 'black',
            shadowBlur: 0,
            shadowOffset: {x:20, y:20}
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        // rect
        context.beginPath();
        context.rect(100, 100, 50, 50);
        context.closePath();

        context.fillStyle = 'green';
        context.shadowColor = 'rgba(0,0,0,1)';
        context.shadowBlur = 0;
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.fill();

        compareLayerAndCanvas(layer, canvas, 10);

        var trace = layer.getContext().getTrace();

        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(0.25,0,0,0.25,100,100);save();shadowColor=rgba(0,0,0,1);shadowBlur=0;shadowOffsetX=5;shadowOffsetY=5;beginPath();rect(0,0,200,200);closePath();fillStyle=green;fill();restore();restore();');
    });


    test('optional disable buffer canvas', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 10,
            opacity : 0.5,
            perfectDrawEnabled : false
        });

        layer.add(rect);

        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.globalAlpha = 0.5;
        // stroke
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.lineWidth = 10;
        context.strokeStyle = 'black';
        context.fillStyle = 'green';
        context.fill();
        context.stroke();


        compareLayerAndCanvas(layer, canvas, 10);

        var trace = layer.getContext().getTrace();

        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);globalAlpha=0.5;beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();lineWidth=10;strokeStyle=black;stroke();restore();');
    });

    // ======================================================
    test('optional disable shadow for stroke', function(){
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 10,
            shadowColor: 'grey',
            shadowBlur: 10,
            shadowOffset: {
                x: 20,
                y: 20
            },
            shadowForStrokeEnabled : false
        });

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'grey';
        context.shadowBlur = 10;
        context.shadowOffsetX = 20;
        context.shadowOffsetY = 20;
        context.lineWidth  = 10;
        context.fill();

        context.shadowColor = 'rgba(0,0,0, 0)';
        context.stroke();

        compareLayerAndCanvas(layer, canvas, 10);


        var trace = layer.getContext().getTrace();
        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);save();shadowColor=rgba(128,128,128,1);shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();lineWidth=10;strokeStyle=black;shadowColor=rgba(0,0,0,0);stroke();restore();restore();');
    });


    test('clone custom shape', function() {
        var className = 'myCustomName'
        var CustomShape = function() {
            CustomShape.super.apply(this, arguments);
            this.className = className;
        }

        CustomShape.prototype.foo = function() {};

        Konva.Util.extend(CustomShape, Konva.Shape);

        var myShape = new CustomShape({
            fill : 'grey'
        });

        var clone = myShape.clone();
        assert.equal(clone instanceof CustomShape, true);
        assert.equal(clone instanceof Konva.Shape, true);
        assert.equal(clone.className, className);
        assert.equal(clone.fill(), 'grey');
        assert.equal(clone.foo, CustomShape.prototype.foo);
    });


});
