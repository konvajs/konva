suite('Line', function () {
  // ======================================================
  test('add line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      stroke: 'blue',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      tension: 0,
    });

    layer.add(line);
    stage.add(layer);

    line.setPoints([1, 2, 3, 4]);
    assert.equal(line.getPoints()[0], 1);

    line.setPoints([5, 6, 7, 8]);
    assert.equal(line.getPoints()[0], 5);

    line.setPoints([73, 160, 340, 23, 340, 80]);
    assert.equal(line.getPoints()[0], 73);

    assert.equal(line.getClassName(), 'Line');

    layer.draw();
    showHit(layer);
  });

  // ======================================================
  test('test default ponts array for two lines', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      stroke: 'blue',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    var redLine = new Konva.Line({
      x: 50,
      stroke: 'red',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    line.setPoints([0, 1, 2, 3]);
    redLine.setPoints([4, 5, 6, 7]);

    layer.add(line).add(redLine);
    stage.add(layer);

    assert.equal(line.getPoints()[0], 0);
    assert.equal(redLine.getPoints()[0], 4);
  });

  // ======================================================
  test('add dashed line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    /*
         var points = [{
         x: 73,
         y: 160
         }, {
         x: 340,
         y: 23
         }, {
         x: 500,
         y: 109
         }, {
         x: 500,
         y: 180
         }];
         */

    var line = new Konva.Line({
      points: [73, 160, 340, 23, 500, 109, 500, 180],
      stroke: 'blue',

      strokeWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      dash: [30, 10, 0, 10, 10, 20],
      shadowColor: '#aaa',
      shadowBlur: 10,
      shadowOffset: {
        x: 20,
        y: 20,
      },
      //opacity: 0.2
    });

    layer.add(line);
    stage.add(layer);

    assert.equal(line.dash().length, 6);
    line.dash([10, 10]);
    assert.equal(line.dash().length, 2);

    assert.equal(line.getPoints().length, 8);
  });

  // ======================================================
  test('add line with shadow', function () {
    Konva.pixelRatio = 1;
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      points: [73, 160, 340, 23],
      stroke: 'blue',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      shadowColor: 'black',
      shadowBlur: 20,
      shadowOffset: {
        x: 10,
        y: 10,
      },
      shadowOpacity: 0.5,
      draggable: true,
    });

    layer.add(line);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    context.save();
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = 20;
    context.strokeStyle = 'blue';

    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = 20;
    context.shadowOffsetX = 10;
    context.shadowOffsetY = 10;
    context.moveTo(73, 160);
    context.lineTo(340, 23);

    context.stroke();
    // context.fill();
    context.restore();

    Konva.pixelRatio = undefined;

    compareLayerAndCanvas(layer, canvas, 50);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,0,0);shadowColor=rgba(0,0,0,0.5);shadowBlur=20;shadowOffsetX=10;shadowOffsetY=10;beginPath();moveTo(73,160);lineTo(340,23);lineCap=round;lineWidth=20;strokeStyle=blue;stroke();restore();'
    );
  });

  test('line hit test with strokeScaleEnabled = false', function () {
    var stage = addStage();
    var scale = 0.1;
    var layer = new Konva.Layer();

    var group = new Konva.Group({
      scale: {
        x: scale,
        y: scale,
      },
    });

    var line1 = new Konva.Line({
      points: [0, 0, 300, 0],
      stroke: 'red',
      strokeScaleEnabled: false,
      strokeWidth: 10,
      y: 0,
    });
    group.add(line1);

    var line2 = new Konva.Line({
      points: [0, 0, 300, 0],
      stroke: 'green',
      strokeWidth: 40 / scale,
      y: 60 / scale,
    });
    group.add(line2);

    layer.add(group);
    stage.add(layer);
    showHit(layer);

    var shape = layer.getIntersection({
      x: 10,
      y: 60,
    });
    assert.equal(shape, line2, 'second line detected');

    shape = layer.getIntersection({
      x: 10,
      y: 4,
    });
    assert.equal(shape, line1, 'first line detected');
  });

  test('line get size', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      points: [73, 160, 340, 23, 500, 109, 500, 180],
      stroke: 'blue',

      strokeWidth: 10,
    });

    layer.add(line);
    stage.add(layer);

    assert.deepEqual(line.size(), {
      width: 500 - 73,
      height: 180 - 23,
    });
  });

  test('getSelfRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: [-25, 50, 250, -30, 150, 50, 250, 110],
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      fill: '#aaf',
      closed: true,
    });

    layer.add(blob);
    stage.add(layer);

    assert.deepEqual(blob.getSelfRect(), {
      x: -25,
      y: -30,
      width: 275,
      height: 140,
    });
  });

  test('getClientRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.Line({
      x: 0,
      y: 0,
      points: [-100, 0, +100, 0, +100, 100, -100, 100],
      closed: true,
      fill: '#0f0',
    });

    stage.position({
      x: 150,
      y: 50,
    });

    layer.add(poly);
    stage.add(layer);

    var rect = layer.getClientRect({ relativeTo: stage });
    assert.deepEqual(rect, {
      x: -100,
      y: 0,
      width: 200,
      height: 100,
    });
  });

  test('getClientRect with tension', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      x: 0,
      y: 0,
      points: [75, 75, 100, 200, 300, 140],
      tension: 0.5,
      stroke: '#0f0',
    });
    layer.add(line);

    var client = line.getClientRect();
    var rect = new Konva.Rect(Konva.Util._assign({ stroke: 'red' }, client));
    layer.add(rect);

    stage.add(layer);

    assert.equal(Math.round(client.x), 56, 'check x');
    assert.equal(Math.round(client.y), 74, 'check y');
    assert.equal(Math.round(client.width), 245, 'check width');
    assert.equal(Math.round(client.height), 147, 'check height');
  });

  test('getClientRect with low number of points', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var line = new Konva.Line({
      x: 0,
      y: 0,
      points: [],
      tension: 0.5,
      stroke: '#0f0',
    });
    layer.add(line);
    layer.draw();

    var client = line.getClientRect();

    assert.equal(client.x, -1, 'check x');
    assert.equal(client.y, -1, 'check y');
    assert.equal(client.width, 2, 'check width');
    assert.equal(client.height, 2, 'check height');

    line.points([10, 10]);
    client = line.getClientRect();

    assert.equal(client.x, 9, 'check x');
    assert.equal(client.y, 9, 'check y');
    assert.equal(client.width, 2, 'check width');
    assert.equal(client.height, 2, 'check height');
  });

  test('line caching', function () {
    // Konva.pixelRatio = 1;
    var stage = addStage();
    var layer = new Konva.Layer();
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: [-25, 50, 250, -30, 150, 50, 250, 110],
      stroke: 'black',
      strokeWidth: 10,
      draggable: true,
      closed: true,
    });

    layer.add(blob);
    var layer2 = layer.clone();
    blob.cache({
      offset: 30,
    });
    stage.add(layer);
    stage.add(layer2);
    layer2.hide();
    compareLayers(layer, layer2, 150);
    // Konva.pixelRatio = undefined;
  });

  test('updating points with old mutable array should trigger recalculations', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var points = [-25, 50, 250, -30, 150, 50];
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: points,
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      closed: true,
      tension: 1,
    });

    var tensionPoints = blob.getTensionPoints();
    points.push(250, 100);
    blob.setPoints(points);

    layer.add(blob);
    stage.add(layer);

    assert.equal(
      tensionPoints === blob.getTensionPoints(),
      false,
      'calculated points should change'
    );
  });

  test('hit test for scaled line', function () {
    var stage = addStage();
    var scale = 42;
    stage.scaleX(scale);
    stage.scaleY(scale);
    var layer = new Konva.Layer();
    stage.add(layer);

    var points = [1, 1, 7, 2, 8, 7, 2, 6];
    var line = new Konva.Line({
      points: points.map(function (v) {
        return (v * 20) / scale;
      }),
      closed: true,
      fill: 'green',
      draggable: true,
    });
    layer.add(line);
    layer.draw();

    assert.equal(line.hasHitStroke(), false);
    assert.equal(layer.getIntersection({ x: 1, y: 1 }), null);

    layer.toggleHitCanvas();
  });

  test('getClientRect with scaling', function () {
    var stage = addStage();
    var scale = 42;
    stage.scaleX(scale);
    stage.scaleY(scale);
    var layer = new Konva.Layer();
    stage.add(layer);

    var points = [1, 1, 7, 2, 8, 7, 2, 6];
    var line = new Konva.Line({
      points: points.map(function (v) {
        return (v * 20) / scale;
      }),
      closed: true,
      fill: 'green',
      draggable: true,
    });
    layer.add(line);
    layer.draw();

    var client = line.getClientRect();

    assert.equal(client.x, 20, 'check x');
    assert.equal(client.y, 20, 'check y');
    assert.equal(client.width, 140, 'check width');
    assert.equal(client.height, 120, 'check height');
  });
});
