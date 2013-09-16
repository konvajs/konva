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
  test('add rect with shadow, rotation, corner radius, and opacity', function(){
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
      shadowOffset: 5,
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
    //console.log(layer.getContext().traceArr);
    assert.equal(trace, 'clearRect(0,0,578,200);save();globalAlpha=0.4;transform(1,0,0,1,100,50);beginPath();moveTo(5,0);lineTo(95,0);arc(95,5,5,4.712,0,false);lineTo(100,45);arc(95,45,5,0,1.571,false);lineTo(5,50);arc(5,45,5,1.571,3.142,false);lineTo(0,5);arc(5,5,5,3.142,4.712,false);closePath();save();globalAlpha=0.2;shadowColor=red;shadowBlur=10;shadowOffsetX=5;shadowOffsetY=5;fillStyle=green;fill();restore();fillStyle=green;fill();lineWidth=2;strokeStyle=blue;stroke();restore();');

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
          offset: {
              x: 50
          },
          scale: [2, 2],
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