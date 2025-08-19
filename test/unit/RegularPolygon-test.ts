import { assert } from 'chai';

import {
  addStage,
  Konva,
  cloneAndCompareLayer,
  assertAlmostEqual,
  createCanvas,
  compareLayerAndCanvas,
} from './test-utils';

describe('RegularPolygon', function () {
  // ======================================================
  it('add regular polygon triangle', function () {
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
  it('add regular polygon square', function () {
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
  it('add regular polygon pentagon', function () {
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
  it('add regular polygon octogon', function () {
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
  it('attr sync', function () {
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

  it('polygon cache', function () {
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
  });

  it('triangle - bounding box', function () {
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

    assertAlmostEqual(box.width, 91.60254037844388);
    assertAlmostEqual(box.height, 80.00000000000003);
  });

  // ======================================================
  it('limit corner radius', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var sides = 5;
    var radius = 50;

    var poly = new Konva.RegularPolygon({
      x: 100,
      y: 100,
      sides: sides,
      radius: radius,
      fill: 'black',
      cornerRadius: 25,
    });
    var resultCircleRadius = radius * Math.cos(Math.PI / sides);

    layer.add(poly);
    stage.add(layer);

    // corner radius creates perfect circle at 1/2 radius
    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.arc(100, 100, resultCircleRadius, 0, Math.PI * 2);
    context.fillStyle = 'black';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 200);
  });

  // ======================================================
  it('negative polygon radius with cornerRadius', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.RegularPolygon({
      x: 100,
      y: 100,
      sides: 5,
      radius: -100,
      fill: 'black',
      cornerRadius: 20,
    });

    layer.add(poly);
    stage.add(layer);
    layer.draw();

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();moveTo(26.18,80.979);arcTo(0,100,-26.18,80.979,32.361);lineTo(-68.925,49.923);arcTo(-95.106,30.902,-85.106,0.125,32.361);lineTo(-68.779,-50.125);arcTo(-58.779,-80.902,-26.418,-80.902,32.361);lineTo(26.418,-80.902);arcTo(58.779,-80.902,68.779,-50.125,32.361);lineTo(85.106,0.125);arcTo(95.106,30.902,68.925,49.923,32.361);closePath();fillStyle=black;fill();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();moveTo(26.18,80.979);arcTo(0,100,-26.18,80.979,32.361);lineTo(-68.925,49.923);arcTo(-95.106,30.902,-85.106,0.125,32.361);lineTo(-68.779,-50.125);arcTo(-58.779,-80.902,-26.418,-80.902,32.361);lineTo(26.418,-80.902);arcTo(58.779,-80.902,68.779,-50.125,32.361);lineTo(85.106,0.125);arcTo(95.106,30.902,68.925,49.923,32.361);closePath();fillStyle=black;fill();restore();'
    );
  });
});
