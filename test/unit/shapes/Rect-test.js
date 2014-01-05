suite('Rect', function(){

  // ======================================================
  test('add rect to stage', function(){
    var stage = addStage();

    var layer = new Kinetic.Layer();

    var rect = new Kinetic.Rect({
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

    var layer = new Kinetic.Layer();

    var rect = new Kinetic.Rect({
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

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(trace, 'clearRect(0,0,578,200);save();save();globalAlpha=0.2;shadowColor=red;shadowBlur=10;shadowOffsetX=5;shadowOffsetY=5;drawImage([object HTMLCanvasElement],0,0);restore();globalAlpha=0.4;drawImage([object HTMLCanvasElement],0,0);restore();');

  });



  // ======================================================
  test('draw rect', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var rect = new Kinetic.Rect({
          x: 200,
          y: 90,
          width: 100,
          height: 50,
          fill: 'green',
          stroke: 'black',
          strokeWidth: 4,
          center: {x: 50, y: 0},
          scale: {x: 2, y: 2},
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
      var layer = new Kinetic.Layer();
      var rect = new Kinetic.Rect({
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
  });

  // ======================================================
  test('add stroke rect', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var rect = new Kinetic.Rect({
          x: 200,
          y: 100,
          width: 100,
          height: 50,
          stroke: 'green',
          strokeWidth: 4
      });

      layer.add(rect);
      stage.add(layer);
  });

  // ======================================================
  test('use default stroke (stroke color should be black)', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var rect = new Kinetic.Rect({
          x: 200,
          y: 100,
          width: 100,
          height: 50,
          strokeWidth: 4
      });

      layer.add(rect);
      stage.add(layer);
  });

  // ======================================================
  test('use default stroke width (stroke width should be 2)', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var rect = new Kinetic.Rect({
          x: 200,
          y: 100,
          width: 100,
          height: 50,
          stroke: 'blue'
      });

      layer.add(rect);
      stage.add(layer);
  });

});