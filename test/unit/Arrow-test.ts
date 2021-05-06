import { assert } from 'chai';

import { addStage, Konva, cloneAndCompareLayer } from './test-utils';

describe('Arrow', function () {
  // ======================================================
  it('add arrow', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [73, 160, 340, 23],
      stroke: 'blue',
      fill: 'blue',
      strokeWidth: 1,
      draggable: true,
      tension: 0,
    });

    layer.add(arrow);
    stage.add(layer);

    arrow.points([1, 2, 3, 4]);
    assert.equal(arrow.points()[0], 1);

    arrow.points([5, 6, 7, 8]);
    assert.equal(arrow.points()[0], 5);
    arrow.points([73, 160, 340, 23, 50, 100, 80, 50]);
    arrow.tension(0);

    arrow.pointerLength(15);
    assert.equal(arrow.pointerLength(), 15);

    arrow.pointerWidth(15);
    assert.equal(arrow.pointerWidth(), 15);

    assert.equal(arrow.getClassName(), 'Arrow');

    layer.draw();
  });

  it('do not draw dash for head', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [50, 50, 100, 100],
      stroke: 'red',
      fill: 'blue',
      strokeWidth: 5,
      pointerWidth: 20,
      pointerLength: 20,
      dash: [5, 5],
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

  it('direction with tension', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [50, 50, 100, 50, 100, 100],
      stroke: 'red',
      fill: 'red',
      tension: 1,
      pointerAtBeginning: true,
    });

    layer.add(arrow);
    stage.add(layer);

    var trace = layer.getContext().getTrace(false, true);

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,50);quadraticCurveTo(75,25,100,50);quadraticCurveTo(125,75,100,100);lineWidth=2;strokeStyle=red;stroke();save();beginPath();translate(100,100);rotate(2);moveTo(0,0);lineTo(-10,5);lineTo(-10,-5);closePath();restore();save();translate(50,50);rotate(2);moveTo(0,0);lineTo(-10,5);lineTo(-10,-5);closePath();restore();setLineDash();fillStyle=red;fill();lineWidth=2;strokeStyle=red;stroke();restore();'
    );
  });

  it('direction with tension 2', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [
        79.57486136783733,
        63.27171903881701,
        87.33826247689463,
        80.73937153419593,
        124.99075785582254,
        82.29205175600738,
        141.68207024029573,
        107.52310536044362,
        165.74861367837337,
        104.80591497227356,
      ],
      stroke: 'red',
      fill: 'red',
      tension: 1,
      pointerWidth: 10,
      pointerAtBeginning: true,
    });

    layer.add(arrow);
    stage.add(layer);

    var trace = layer.getContext().getTrace(false, true);

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(79,63);quadraticCurveTo(72,74,87,80);bezierCurveTo(117,93,94,67,124,82);bezierCurveTo(149,94,119,95,141,107);quadraticCurveTo(159,117,165,104);lineWidth=2;strokeStyle=red;stroke();save();beginPath();translate(165,104);rotate(5);moveTo(0,0);lineTo(-10,5);lineTo(-10,-5);closePath();restore();save();translate(79,63);rotate(4);moveTo(0,0);lineTo(-10,5);lineTo(-10,-5);closePath();restore();setLineDash();fillStyle=red;fill();lineWidth=2;strokeStyle=red;stroke();restore();'
    );
  });

  it('test cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var arrow = new Konva.Arrow({
      points: [50, 50, 150, 50],
      stroke: 'blue',
      fill: 'blue',
      // large stroke width will not work :(
      strokeWidth: 1,
      draggable: true,
      tension: 0,
    });
    layer.add(arrow);

    stage.add(layer);
    arrow.cache();
    layer.draw();

    cloneAndCompareLayer(layer, 200);
  });
});
