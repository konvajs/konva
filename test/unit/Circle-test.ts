import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
  loadImage,
} from './test-utils';

describe('Circle', function () {
  // ======================================================

  it('add circle to stage', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    stage.add(layer);
    layer.add(group);
    group.add(circle);
    layer.draw();

    var attrs = circle.getAttrs();

    assert.equal(attrs.x, 100);
    assert.equal(attrs.y, 100);
    assert.equal(attrs.radius, 70);
    assert.equal(attrs.fill, 'green');
    assert.equal(attrs.stroke, 'black');
    assert.equal(attrs.strokeWidth, 4);
    assert.equal(attrs.name, 'myCircle');
    assert.equal(attrs.draggable, true);
    assert.equal(circle.getClassName(), 'Circle');

    var trace = layer.getContext().getTrace();
    // console.log(trace);
    // console.log(
    //   'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    // );
    assert.equal(
      trace,
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  it('clone', function () {
    var circle = new Konva.Circle();
    var clone = circle.clone();
    assert.equal(clone instanceof Konva.Circle, true);
    assert.equal(clone.className, 'Circle');
  });

  // ======================================================
  it('add circle with pattern fill', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();
      var group = new Konva.Group();
      var circle = new Konva.Circle({
        x: stage.width() / 2,
        y: stage.height() / 2,
        radius: 70,
        fillPatternImage: imageObj,
        fillPatternOffset: { x: -5, y: -5 },
        fillPatternScale: { x: 0.7, y: 0.7 },
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true,
      });

      group.add(circle);
      layer.add(group);
      stage.add(layer);

      assert.equal(circle.fillPatternOffset().x, -5);
      assert.equal(circle.fillPatternOffset().y, -5);

      circle.fillPatternOffset({ x: 1, y: 2 });
      assert.equal(circle.fillPatternOffset().x, 1);
      assert.equal(circle.fillPatternOffset().y, 2);

      circle.fillPatternOffset({
        x: 3,
        y: 4,
      });
      assert.equal(circle.fillPatternOffset().x, 3);
      assert.equal(circle.fillPatternOffset().y, 4);

      done();
    });
  });

  // ======================================================
  it('add circle with radial gradient fill', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fillRadialGradientStartPoint: { x: -20, y: -20 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: -60, y: -60 },
      fillRadialGradientEndRadius: 130,
      fillRadialGradientColorStops: [0, 'red', 0.2, 'yellow', 1, 'blue'],
      name: 'myCircle',
      draggable: true,
      scale: {
        x: 0.5,
        y: 0.5,
      },
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    assert.equal(circle.fillRadialGradientStartPoint().x, -20);
    assert.equal(circle.fillRadialGradientStartPoint().y, -20);
    assert.equal(circle.fillRadialGradientStartRadius(), 0);
    assert.equal(circle.fillRadialGradientEndPoint().x, -60);
    assert.equal(circle.fillRadialGradientEndPoint().y, -60);
    assert.equal(circle.fillRadialGradientEndRadius(), 130);
    assert.equal(circle.fillRadialGradientColorStops().length, 6);
  });

  // ======================================================
  it('add shape with linear gradient fill', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fillLinearGradientStartPoint: { x: -35, y: -35 },
      fillLinearGradientEndPoint: { x: 35, y: 35 },
      fillLinearGradientColorStops: [0, 'red', 1, 'blue'],
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
      draggable: true,
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');

    var start = { x: -35, y: -35 };
    var end = { x: 35, y: 35 };
    var colorStops = [0, 'red', 1, 'blue'];
    var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);

    // build color stops
    for (var n = 0; n < colorStops.length; n += 2) {
      grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
    }
    ctx.beginPath();
    ctx.translate(circle.x(), circle.y());
    ctx.arc(0, 0, 70, 0, Math.PI * 2, false);
    ctx.closePath();

    ctx.fillStyle = grd;
    ctx.lineWidth = 4;

    ctx.fill();
    ctx.stroke();

    compareLayerAndCanvas(layer, canvas, 200);
  });

  // ======================================================
  it('set opacity after instantiation', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    circle.opacity(0.5);
    layer.draw();

    circle.opacity(1);
    layer.draw();

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=red;fill();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);globalAlpha=0.5;beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=red;fill();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=red;fill();restore();'
    );
  });

  // ======================================================
  it('attrs sync', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    assert.equal(circle.getWidth(), 140);
    assert.equal(circle.getHeight(), 140);

    circle.setWidth(100);
    assert.equal(circle.radius(), 50);
    assert.equal(circle.getHeight(), 100);

    circle.setHeight(120);
    assert.equal(circle.radius(), 60);
    assert.equal(circle.getHeight(), 120);
  });

  // ======================================================
  it('set fill after instantiation', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(circle);

    circle.fill('blue');

    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=blue;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  it('getSelfRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    assert.deepEqual(circle.getSelfRect(), {
      x: -50,
      y: -50,
      width: 100,
      height: 100,
    });
  });

  it('cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.arc(100, 100, 50, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 4;
    context.stroke();
    compareLayerAndCanvas(layer, canvas, 100);
  });
});
