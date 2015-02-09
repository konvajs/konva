suite('Rect', function(){

  // ======================================================
  test('add rect to stage', function(){
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'blue'
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.getX(), 100);
    assert.equal(rect.getY(), 50);

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();lineWidth=2;strokeStyle=blue;stroke();restore();');

    var relaxedTrace = layer.getContext().getTrace(true);
    //console.log(relaxedTrace);
    assert.equal(relaxedTrace, 'clearRect();save();transform();beginPath();rect();closePath();fillStyle;fill();lineWidth;strokeStyle;stroke();restore();');
  });

  // ======================================================
  test('add rect with shadow, corner radius, and opacity', function(){
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'blue',
      shadowColor: 'red',
      shadowBlur: 10,
      shadowOffset: {x: 5, y: 5},
      shadowOpacity: 0.5,
      opacity: 0.4,
      cornerRadius: 5
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.getShadowColor(), 'red');
    assert.equal(rect.getShadowBlur(), 10);
    assert.equal(rect.getShadowOffsetX(), 5);
    assert.equal(rect.getShadowOffsetY(), 5);
    assert.equal(rect.getShadowOpacity(), 0.5);
    assert.equal(rect.getOpacity(), 0.4);
    assert.equal(rect.getCornerRadius(), 5);
  });



  // ======================================================
  test('draw rect', function() {
      var stage = addStage();
      var layer = new Konva.Layer();
      var rect = new Konva.Rect({
          x: 200,
          y: 90,
          width: 100,
          height: 50,
          fill: 'green',
          stroke: 'black',
          strokeWidth: 4,
          scale: {
              x: 2,
              y: 2
          },
          cornerRadius: 15,
          draggable: true
      });

      layer.add(rect);
      stage.add(layer);
      
      assert.equal(rect.getClassName(), 'Rect');
  });

  // ======================================================
  test('add fill stroke rect', function() {
      var stage = addStage();
      var layer = new Konva.Layer();
      var rect = new Konva.Rect({
          x: 200,
          y: 100,
          width: 100,
          height: 50,
          fill: 'blue',
          stroke: 'green',
          strokeWidth: 4
      });

      layer.add(rect);
      stage.add(layer);

      var canvas = createCanvas();
      var context = canvas.getContext('2d');
      context.beginPath();
      context.rect(200, 100, 100, 50);
      context.fillStyle = 'blue';
      context.fill();
      context.lineWidth = 4;
      context.strokeStyle = 'green';
      context.stroke();

      compareLayerAndCanvas(layer, canvas);
  });

  // ======================================================
  test('add stroke rect', function() {
      var stage = addStage();
      var layer = new Konva.Layer();
      var rect = new Konva.Rect({
          x: 200,
          y: 100,
          width: 100,
          height: 50,
          stroke: 'green',
          strokeWidth: 4
      });

      layer.add(rect);
      stage.add(layer);

      var canvas = createCanvas();
      var context = canvas.getContext('2d');
      context.beginPath();
      context.rect(200, 100, 100, 50);
      context.lineWidth = 4;
      context.strokeStyle = 'green';
      context.stroke();

      compareLayerAndCanvas(layer, canvas);
  });

  // ======================================================
  test('use default stroke width (stroke width should be 2)', function() {
      var stage = addStage();
      var layer = new Konva.Layer();
      var rect = new Konva.Rect({
          x: 200,
          y: 100,
          width: 100,
          height: 50,
          stroke: 'blue'
      });

      layer.add(rect);
      stage.add(layer);

      var canvas = createCanvas();
      var context = canvas.getContext('2d');
      context.beginPath();
      context.rect(200, 100, 100, 50);
      context.lineWidth = 2;
      context.strokeStyle = 'blue';
      context.stroke();
      compareLayerAndCanvas(layer, canvas);
  });

    // ======================================================
    test('limit corner radius', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            fill: 'black',
            cornerRadius : 100
        });

        layer.add(rect);
        stage.add(layer);

        // as corner radius is much bigger we should have circe in the result
        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.arc(100, 100, 50, 0, Math.PI * 2);
        context.fillStyle = 'black';
        context.fill();
        compareLayerAndCanvas(layer, canvas, 100);
    });

});