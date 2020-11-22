suite('RegularPolygon', function () {
  // ======================================================
  test('add regular polygon triangle', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 3,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
      center: {
        x: 0,
        y: -50,
      },
    });

    layer.add(poly);
    stage.add(layer);

    assert.equal(poly.getClassName(), 'RegularPolygon');
  });

  // ======================================================
  test('add regular polygon square', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 4,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
    });

    layer.add(poly);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,200,100);beginPath();moveTo(0,-50);lineTo(50,0);lineTo(0,50);lineTo(-50,0);closePath();fillStyle=green;fill();lineWidth=5;strokeStyle=blue;stroke();restore();'
    );
  });

  // ======================================================
  test('add regular polygon pentagon', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 5,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
    });

    layer.add(poly);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,200,100);beginPath();moveTo(0,-50);lineTo(47.553,-15.451);lineTo(29.389,40.451);lineTo(-29.389,40.451);lineTo(-47.553,-15.451);closePath();fillStyle=green;fill();lineWidth=5;strokeStyle=blue;stroke();restore();'
    );
  });

  // ======================================================
  test('add regular polygon octogon', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 8,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
    });

    layer.add(poly);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,200,100);beginPath();moveTo(0,-50);lineTo(35.355,-35.355);lineTo(50,0);lineTo(35.355,35.355);lineTo(0,50);lineTo(-35.355,35.355);lineTo(-50,0);lineTo(-35.355,-35.355);closePath();fillStyle=green;fill();lineWidth=5;strokeStyle=blue;stroke();restore();'
    );
  });

  // ======================================================
  test('attr sync', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 5,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
    });

    layer.add(poly);
    stage.add(layer);

    assert.equal(poly.getWidth(), 100);
    assert.equal(poly.getHeight(), 100);

    poly.setWidth(120);
    assert.equal(poly.radius(), 60);
    assert.equal(poly.getHeight(), 120);

    poly.setHeight(140);
    assert.equal(poly.radius(), 70);
    assert.equal(poly.getHeight(), 140);
  });

  test('polygon cache', function () {
    Konva.pixelRatio = 1;
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 5,
      radius: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 5,
      name: 'foobar',
    });
    poly.cache();
    layer.add(poly);
    stage.add(layer);

    assert.deepEqual(poly.getSelfRect(), {
      x: -47.55282581475768,
      y: -50,
      height: 90.45084971874738,
      width: 95.10565162951536,
    });

    cloneAndCompareLayer(layer, 254);
    Konva.pixelRatio = undefined;
  });

  test('triangle - bounding box', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var poly = new Konva.RegularPolygon({
      x: 200,
      y: 100,
      sides: 3,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
    });

    layer.add(poly);

    var tr = new Konva.Transformer({
      nodes: [poly],
    });
    layer.add(tr);

    layer.draw();

    var box = poly.getClientRect();

    assert.equal(box.width, 92.60254037844388);
    assert.equal(box.height, 81.00000000000003);
  });
});
