suite('Arrow', function() {
  // ======================================================
  test('add arrow', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [73, 160, 340, 23],
      stroke: 'blue',
      fill: 'blue',
      strokeWidth: 1,
      draggable: true,
      tension: 0
    });

    layer.add(arrow);
    stage.add(layer);

    arrow.setPoints([1, 2, 3, 4]);
    assert.equal(arrow.points()[0], 1);

    arrow.setPoints([5, 6, 7, 8]);
    assert.equal(arrow.getPoints()[0], 5);
    arrow.setPoints([73, 160, 340, 23, 50, 100, 80, 50]);
    arrow.tension(0);

    arrow.pointerLength(15);
    assert.equal(arrow.pointerLength(), 15);

    arrow.pointerWidth(15);
    assert.equal(arrow.pointerWidth(), 15);

    assert.equal(arrow.getClassName(), 'Arrow');

    layer.draw();
    showHit(layer);
  });

  test('do not draw dash for head', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [50, 50, 100, 100],
      stroke: 'red',
      fill: 'blue',
      strokeWidth: 5,
      pointerWidth: 20,
      pointerLength: 20,
      dash: [5, 5]
    });

    layer.add(arrow);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    // console.log(trace);

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,50);lineTo(100,100);setLineDash(5,5);lineDashOffset=0;lineWidth=5;strokeStyle=red;stroke();save();beginPath();translate(100,100);rotate(0.785);moveTo(0,0);lineTo(-20,10);lineTo(-20,-10);closePath();restore();setLineDash();fillStyle=blue;fill();lineWidth=5;strokeStyle=red;stroke();restore();'
    );
  });

  test('direction with tension', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [50, 50, 100, 50, 100, 100],
      stroke: 'red',
      fill: 'red',
      tension: 1,
      pointerAtBeginning: true
    });

    layer.add(arrow);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,50);quadraticCurveTo(75,25,100,50);quadraticCurveTo(125,75,100,100);lineWidth=2;strokeStyle=red;stroke();save();beginPath();translate(100,100);rotate(2.356);moveTo(0,0);lineTo(-10,5);lineTo(-10,-5);closePath();restore();save();translate(50,50);rotate(2.356);moveTo(0,0);lineTo(-10,5);lineTo(-10,-5);closePath();restore();setLineDash();fillStyle=red;fill();lineWidth=2;strokeStyle=red;stroke();restore();'
    );
  });
});
