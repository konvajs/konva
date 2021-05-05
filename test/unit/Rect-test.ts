import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
} from './test-utils';

describe('Rect', function () {
  // ======================================================
  it('add rect to stage', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'blue',
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.x(), 100);
    assert.equal(rect.y(), 50);

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();lineWidth=2;strokeStyle=blue;stroke();restore();'
    );

    var relaxedTrace = layer.getContext().getTrace(true);
    //console.log(relaxedTrace);
    assert.equal(
      relaxedTrace,
      'clearRect();save();transform();beginPath();rect();closePath();fillStyle;fill();lineWidth;strokeStyle;stroke();restore();'
    );
  });

  // ======================================================
  it('add rect with shadow, corner radius, and opacity', function () {
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
      shadowOffset: { x: 5, y: 5 },
      shadowOpacity: 0.5,
      opacity: 0.4,
      cornerRadius: 5,
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.shadowColor(), 'red');
    assert.equal(rect.shadowBlur(), 10);
    assert.equal(rect.shadowOffsetX(), 5);
    assert.equal(rect.shadowOffsetY(), 5);
    assert.equal(rect.shadowOpacity(), 0.5);
    assert.equal(rect.opacity(), 0.4);
    assert.equal(rect.cornerRadius(), 5);
  });

  // ======================================================
  it('draw rect', function () {
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
        y: 2,
      },
      cornerRadius: 15,
      draggable: true,
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.getClassName(), 'Rect');
  });

  // ======================================================
  it('add fill stroke rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      fill: 'blue',
      stroke: 'green',
      strokeWidth: 4,
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
  it('add stroke rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      stroke: 'green',
      strokeWidth: 4,
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
  it('use default stroke width (stroke width should be 2)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      stroke: 'blue',
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
  it('limit corner radius', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'black',
      cornerRadius: 100,
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

  // ======================================================
  it('array for corner radius', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'black',
      cornerRadius: [0, 10, 20, 30],
    });

    layer.add(rect);
    stage.add(layer);
    layer.draw();

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,50,50);beginPath();moveTo(0,0);lineTo(90,0);arc(90,10,10,4.712,0,false);lineTo(100,80);arc(80,80,20,0,1.571,false);lineTo(30,100);arc(30,70,30,1.571,3.142,false);lineTo(0,0);arc(0,0,0,3.142,4.712,false);closePath();fillStyle=black;fill();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,50,50);beginPath();moveTo(0,0);lineTo(90,0);arc(90,10,10,4.712,0,false);lineTo(100,80);arc(80,80,20,0,1.571,false);lineTo(30,100);arc(30,70,30,1.571,3.142,false);lineTo(0,0);arc(0,0,0,3.142,4.712,false);closePath();fillStyle=black;fill();restore();'
    );
  });
});
