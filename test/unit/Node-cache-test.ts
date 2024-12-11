import { assert } from 'chai';
import {
  addStage,
  Konva,
  compareLayerAndCanvas,
  cloneAndCompareLayer,
  compareCanvases,
  createCanvas,
  loadImage,
  getPixelRatio,
} from './test-utils';

describe('Caching', function () {
  it('cache simple rectangle', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      draggable: true,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();

    compareLayerAndCanvas(layer, canvas, 10);
    cloneAndCompareLayer(layer);
  });

  it('cache simple rectangle with transform', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      rotation: 45,
      scaleY: 2,
      fill: 'green',
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.translate(100, 50);
    context.rotate(Math.PI / 4);
    context.beginPath();
    context.rect(0, 0, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();

    compareLayerAndCanvas(layer, canvas, 200, 100);
    cloneAndCompareLayer(layer, 150, 100);
  });

  it('cache rectangle with fill and stroke', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 20,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 20;
    context.stroke();
    compareLayerAndCanvas(layer, canvas, 50);
    cloneAndCompareLayer(layer, 50);
  });

  it('cache rectangle with fill and opacity', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      opacity: 0.5,
    });
    rect.cache();
    rect.opacity(0.3);

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.globalAlpha = 0.3;
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 5);
  });

  it('cache rectangle with fill, stroke opacity', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      opacity: 0.5,
      stroke: 'black',
      strokeWidth: 10,
    });
    rect.cache();
    rect.opacity(0.3);

    layer.add(rect);
    stage.add(layer);

    cloneAndCompareLayer(layer, 100);
  });

  // skip, because opacity rendering of cached shape is different
  // nothing we can do here
  it('cache rectangle with fill, shadow and opacity', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 100,
      height: 50,
      fill: 'green',
      opacity: 0.5,
      shadowBlur: 10,
      shadowColor: 'black',
      draggable: true,
    });
    // rect.cache();
    // rect.opacity(0.3);

    layer.add(rect.clone({ y: 50, x: 50, shadowEnabled: false }));
    layer.add(rect);
    stage.add(layer);

    cloneAndCompareLayer(layer, 10);
  });

  it('cache rectangle with fill and simple shadow', function () {
    Konva.pixelRatio = 1;
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      shadowColor: 'black',
      shadowBlur: 10,
      draggable: true,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.shadowColor = 'black';
    context.shadowBlur = 10;
    context.fill();

    compareLayerAndCanvas(layer, canvas, 100);
    Konva.pixelRatio = getPixelRatio();
  });

  it('cache rectangle with fill and shadow with offset', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 50,
      height: 25,
      fill: 'green',
      shadowOffsetX: 10,
      shadowOffsetY: 10,
      shadowColor: 'black',
      shadowBlur: 10,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    context.translate(100, 50);
    context.beginPath();
    context.rect(0, 0, 50, 25);
    context.closePath();
    context.fillStyle = 'green';
    context.shadowColor = 'black';
    context.shadowBlur = 10 * Konva.pixelRatio;
    context.shadowOffsetX = 10 * Konva.pixelRatio;
    context.shadowOffsetY = 10 * Konva.pixelRatio;
    context.fill();
    compareLayerAndCanvas(layer, canvas, 50);
  });

  it('cache rectangle with fill and shadow with negative offset', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 50,
      height: 25,
      fill: 'green',
      shadowOffsetX: -10,
      shadowOffsetY: -10,
      shadowColor: 'black',
      shadowBlur: 10,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    context.translate(100, 50);
    context.beginPath();
    context.rect(0, 0, 50, 25);
    context.closePath();
    context.fillStyle = 'green';
    context.shadowColor = 'black';
    context.shadowBlur = 10 * Konva.pixelRatio;
    context.shadowOffsetX = -10 * Konva.pixelRatio;
    context.shadowOffsetY = -10 * Konva.pixelRatio;
    context.fill();
    compareLayerAndCanvas(layer, canvas, 50);
  });

  it('cache rectangle with fill and shadow with negative offset and scale', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 50,
      height: 25,
      fill: 'green',
      shadowOffsetX: -10,
      shadowOffsetY: -10,
      shadowColor: 'black',
      shadowBlur: 10,
      scaleX: 2,
      scaleY: 2,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    cloneAndCompareLayer(layer, 200);
  });

  it('cache rectangle with fill and shadow and some transform', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 50,
      height: 25,
      fill: 'green',
      shadowOffsetX: -10,
      shadowOffsetY: -10,
      shadowColor: 'black',
      shadowBlur: 10,
      offsetX: 50,
      offsetY: 25,
    });
    rect.cache();

    layer.add(rect);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    context.translate(50, 25);
    context.beginPath();
    context.rect(0, 0, 50, 25);
    context.closePath();
    context.fillStyle = 'green';
    context.shadowColor = 'black';
    context.shadowBlur = 10 * Konva.pixelRatio;
    context.shadowOffsetX = -10 * Konva.pixelRatio;
    context.shadowOffsetY = -10 * Konva.pixelRatio;
    context.fill();
    compareLayerAndCanvas(layer, canvas, 50);
  });

  // CACHING CONTAINERS
  it('cache group with simple rectangle', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var group = new Konva.Group({
      x: 100,
      y: 50,
    });

    var rect = new Konva.Rect({
      width: 100,
      height: 50,
      fill: 'green',
    });
    group.add(rect);
    group.cache();

    layer.add(group);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 10);
    cloneAndCompareLayer(layer);
  });

  it('cache group with simple rectangle with transform', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var group = new Konva.Group({
      x: 50,
      y: 25,
    });

    var rect = new Konva.Rect({
      x: 50,
      y: 25,
      width: 100,
      height: 50,
      fill: 'green',
      rotation: 45,
    });
    group.add(rect);
    group.cache();

    layer.add(group);
    stage.add(layer);
    cloneAndCompareLayer(layer, 200);
  });

  it('cache group with several shape with transform', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var group = new Konva.Group({
      x: 50,
      y: 25,
    });

    var rect = new Konva.Rect({
      x: 50,
      y: 25,
      width: 100,
      height: 50,
      fill: 'green',
      shadowOffsetX: 10,
      shadowOffsetY: 10,
      shadowBlur: 10,
    });
    group.add(rect);

    var circle = new Konva.Circle({
      x: 250,
      y: 50,
      radius: 25,
      fill: 'red',
      // rotation on circle should not have any effects
      stroke: 'black',
      rotation: 45,
      scaleX: 2,
      scaleY: 2,
    });
    group.add(circle);

    group.cache();

    layer.add(group);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    // draw rect
    context.save();
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.shadowColor = 'black';
    context.shadowBlur = 10 * Konva.pixelRatio;
    context.shadowOffsetX = 10 * Konva.pixelRatio;
    context.shadowOffsetY = 10 * Konva.pixelRatio;
    context.fill();
    context.restore();

    // circle
    context.save();
    context.beginPath();
    context.arc(300, 75, 50, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = 'red';
    context.lineWidth = 4;
    context.fill();
    context.stroke();
    context.restore();

    compareLayerAndCanvas(layer, canvas, 210, 20);

    // recache
    group.cache();
    layer.draw();
    compareLayerAndCanvas(layer, canvas, 210, 20);
  });

  it('cache group with rectangle and text', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var button = new Konva.Group({
      width: 100,
      height: 50,
      draggable: true,
    });

    var face = new Konva.Rect({
      fill: 'red',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });

    var text = new Konva.Text({
      text: 'Wrong button',
      x: 15,
      y: 20,
    });

    button.add(face);
    button.add(text);

    button.cache();

    layer.add(button);
    stage.add(layer);

    cloneAndCompareLayer(layer, 100);
  });

  it('cache layer with several shape with transform', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      draggable: true,
    });

    var group = new Konva.Group({
      x: 50,
      y: 25,
    });

    var rect = new Konva.Rect({
      x: 50,
      y: 25,
      width: 100,
      height: 50,
      fill: 'green',
      shadowOffsetX: 10,
      shadowOffsetY: 10,
      shadowBlur: 10,
    });
    group.add(rect);

    var circle = new Konva.Circle({
      x: 250,
      y: 50,
      radius: 25,
      fill: 'red',
      // rotation on circle should not have any effects
      rotation: 45,
      stroke: 'black',
      scaleX: 2,
      scaleY: 2,
    });
    group.add(circle);

    group.cache();

    layer.add(group);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    // draw rect
    context.save();
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.shadowColor = 'black';
    context.shadowBlur = 10 * Konva.pixelRatio;
    context.shadowOffsetX = 10 * Konva.pixelRatio;
    context.shadowOffsetY = 10 * Konva.pixelRatio;
    context.fill();
    context.restore();

    // circle
    context.save();
    context.beginPath();
    context.arc(300, 75, 50, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = 'red';
    context.lineWidth = 4;
    context.fill();
    context.stroke();
    context.restore();

    compareLayerAndCanvas(layer, canvas, 150);

    // recache
    group.cache();
    layer.draw();
    compareLayerAndCanvas(layer, canvas, 150);
  });

  it('cache shape that is larger than stage', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: 74,
      y: 74,
      radius: 300,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      scaleX: 1 / 2,
      scaleY: 1 / 2,
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    assert.equal(circle._getCanvasCache(), undefined);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    // circle
    context.save();
    context.beginPath();
    context.arc(74, 74, 150, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = 'red';
    context.lineWidth = 2;
    context.fill();
    context.stroke();
    context.restore();

    compareLayerAndCanvas(layer, canvas, 150);
  });

  it('cache shape that is larger than stage but need buffer canvas', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 400,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 50,
      opacity: 0.5,
      scaleX: 1 / 5,
      scaleY: 1 / 5,
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);
    circle.cache();
    layer.draw();

    cloneAndCompareLayer(layer, 200);
  });

  it('cache nested groups', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var groupOuter = new Konva.Group({
      x: 50,
      y: 10,
    });

    var groupInner = new Konva.Group({
      x: 10,
      y: 10,
      draggable: true,
    });
    var rect = new Konva.Rect({
      width: 50,
      height: 50,
      stroke: 'grey',
      strokeWidth: 3,
      fill: 'yellow',
    });

    var text = new Konva.Text({
      x: 18,
      y: 15,
      text: 'A',
      fill: 'black',
      fontSize: 24,
    });

    groupInner.add(rect);
    groupInner.add(text);

    groupOuter.add(groupInner);

    layer.add(groupOuter);
    stage.add(layer);

    groupInner.cache();

    layer.draw();
    cloneAndCompareLayer(layer, 150);

    groupInner.clearCache();
    groupOuter.cache();
    layer.draw();
    cloneAndCompareLayer(layer, 150);

    groupOuter.clearCache();
    groupInner.clearCache();
    rect.cache();
    layer.draw();
    cloneAndCompareLayer(layer, 150);
  });

  it('test group with circle + buffer canvas usage', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    layer.add(group);

    var circle = new Konva.Circle({
      radius: 10,
      // fill: 'white',
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: 10,
      fillRadialGradientColorStops: [0, 'red', 0.5, 'yellow', 1, 'black'],
      opacity: 0.4,
      hitStrokeWidth: 0,
      stroke: 'rgba(0,0,0,0)',
    });
    group.add(circle);
    group.cache();
    stage.draw();

    cloneAndCompareLayer(layer, 200);
  });

  it('test group with opacity', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    layer.add(group);

    var circle = new Konva.Circle({
      radius: 10,
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: 10,
      fillRadialGradientColorStops: [0, 'red', 0.5, 'yellow', 1, 'black'],
      opacity: 0.4,
      hitStrokeWidth: 0,
      stroke: 'rgba(0,0,0,0)',
    });
    group.add(circle);
    group.cache();
    stage.draw();

    cloneAndCompareLayer(layer, 210);
  });

  it('test group with opacity', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    layer.add(group);

    var circle = new Konva.Circle({
      radius: 10,
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: 10,
      fillRadialGradientColorStops: [0, 'red', 0.5, 'yellow', 1, 'black'],
      opacity: 0.4,
      hitStrokeWidth: 0,
      stroke: 'rgba(0,0,0,0)',
    });
    group.add(circle);
    group.cache();
    stage.draw();

    cloneAndCompareLayer(layer, 100);
  });

  it('test rect with float dimensions', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 10,
      y: 10,
      draggable: true,
    });
    layer.add(group);

    var circle = new Konva.Circle({
      radius: 52.2,
      fill: 'red',
    });
    group.add(circle);
    group.cache();

    const canvas = group._cache.get('canvas').scene;
    console.log(canvas.width / 2);
    assert.equal(canvas.width, 106 * canvas.pixelRatio);
  });

  it('cache group with rectangle with fill and opacity', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var group = new Konva.Group({
      opacity: 0.5,
    });

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
    });

    group.add(rect);
    layer.add(group);
    stage.add(layer);

    group.cache();
    layer.draw();

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.globalAlpha = 0.5;
    context.beginPath();
    context.rect(100, 50, 100, 50);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 5);
  });

  it('even if parent is not visible cache should be created', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      visible: false,
    });

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });

    layer.add(rect);
    stage.add(layer);

    rect.cache();
    layer.visible(true);
    layer.draw();

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 5);
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });

  it('check cache for invisible shape', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      // visible: false,
    });

    var group = new Konva.Group();
    layer.add(group);

    group.add(
      new Konva.Rect({
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        fill: 'red',
      })
    );
    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      visible: false,
    });
    group.add(rect);

    stage.add(layer);

    group.cache();
    layer.draw();
    cloneAndCompareLayer(layer);
  });

  it('even if parent is not listening cache and hit should be created', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      listening: false,
    });

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });

    layer.add(rect);
    stage.add(layer);

    rect.cache();
    layer.listening(true);
    layer.draw();

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 5);
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });

  // hard to fix
  it.skip('even if parent is not visible cache should be created - test for group', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      visible: false,
    });

    var group = new Konva.Group({
      opacity: 0.5,
    });

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });

    group.add(rect);
    layer.add(group);
    stage.add(layer);

    group.cache();
    layer.visible(true);
    layer.draw();

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.globalAlpha = 0.5;
    context.beginPath();
    context.rect(100, 50, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 5);
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });

  it('listening false on a shape should not create hit area', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'green',
    });

    layer.add(bigCircle);

    var smallCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'red',
      listening: false,
    });

    layer.add(smallCircle);
    smallCircle.cache();
    layer.draw();

    var shape = stage.getIntersection({ x: 100, y: 100 });
    assert.equal(shape, bigCircle);
  });

  it('listening false on a shape inside group should not create hit area', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group();
    layer.add(group);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'green',
    });

    group.add(bigCircle);

    var smallCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'red',
      listening: false,
    });

    group.add(smallCircle);
    group.cache();

    layer.draw();
    var shape = stage.getIntersection({ x: 100, y: 100 });
    assert.equal(shape, bigCircle);
  });
  it('listening false on a group inside a group should not create hit area', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group();
    layer.add(group);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'green',
    });
    group.add(bigCircle);

    var innerGroup = new Konva.Group({
      listening: false,
    });
    group.add(innerGroup);

    var smallCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 50,
      fill: 'red',
    });

    innerGroup.add(smallCircle);
    group.cache();

    layer.draw();
    var shape = stage.getIntersection({ x: 100, y: 100 });
    assert.equal(shape, bigCircle);
  });

  // for performance reasons
  it('do no call client rect calculation, if we do not need it', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group();
    layer.add(group);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'green',
    });
    group.add(bigCircle);

    layer.draw();

    var called = false;
    group.getClientRect = function () {
      called = true;
    } as any;
    group.cache({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    assert.equal(called, false);
  });

  // for performance reasons
  it('caching should skip clearing internal caching for perf boos', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'green',
    });
    layer.add(bigCircle);

    layer.cache();

    var callCount = 0;
    bigCircle._clearSelfAndDescendantCache = function () {
      callCount += 1;
    };

    layer.x(10);
    assert.equal(callCount, 0);
    layer.clearCache();
    // make sure all cleared for children
    assert.equal(callCount, 1);
  });

  it('caching group with clip', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var width = 100;
    var height = 100;
    var verts = [
      { x: width * 0.2, y: 0 },
      { x: width, y: 0 },
      { x: width * 0.8, y: height },
      { x: 0, y: height },
    ];

    var clipFunc = (ctx) => {
      for (let i = 0; i < verts.length; i++) {
        const vertex = verts[i];
        if (i === 0) {
          ctx.moveTo(vertex.x, vertex.y);
        } else {
          ctx.lineTo(vertex.x, vertex.y);
        }
      }
      ctx.closePath();
    };

    var group1 = new Konva.Group({
      clipFunc: clipFunc,
      x: 50,
      y: 50,
      listening: false,
    });
    layer.add(group1);
    var rect1 = new Konva.Rect({
      fill: 'green',
      width: 100,
      height: 100,
    });
    group1.add(rect1);

    layer.draw();
    group1.cache();

    layer.draw();

    // var group2 = group1.clone({
    //   x: height - 20,
    //   y: 50,
    // });
    // group2.findOne('Rect').fill('red');
    // layer.add(group2);
    // group2.cache();

    // var group3 = group1.clone({
    //   x: width + 20,
    // });
    // layer.add(group3);
    // group3.findOne('Rect').x(150);
    // group2.cache();

    layer.draw();

    cloneAndCompareLayer(layer, 10);
  });

  it('check caching with global composite operation', function () {
    var stage = addStage();

    const layer = new Konva.Layer();
    stage.add(layer);

    function getColor(pos) {
      var ratio = layer.canvas.pixelRatio;
      var p = layer.canvas.context.getImageData(
        Math.round(pos.x * ratio),
        Math.round(pos.y * ratio),
        1,
        1
      ).data;
      return Konva.Util._rgbToHex(p[0], p[1], p[2]);
    }

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'lightgray',
    });
    layer.add(bg);

    const group = new Konva.Group();
    layer.add(group);

    const rect = new Konva.Rect({
      x: 10,
      y: 0,
      width: 200,
      height: 100,
      fill: 'blue',
      draggable: true,
    });
    group.add(rect);

    const maskgroup = new Konva.Group({});
    group.add(maskgroup);

    const mask = new Konva.Rect({
      x: 50,
      y: 0,
      width: 100,
      height: 100,
      fill: 'black',
    });
    maskgroup.add(mask);

    maskgroup.cache();
    var canvasBefore = maskgroup._cache.get('canvas').scene._canvas;

    maskgroup.globalCompositeOperation('destination-in');
    maskgroup.cache();
    var canvasAfter = maskgroup._cache.get('canvas').scene._canvas;

    compareCanvases(canvasBefore, canvasAfter);

    maskgroup.clearCache();

    layer.draw();
    // no caches - mask group clipped all drawing
    assert.equal(getColor({ x: 5, y: 20 }), '000000');
    assert.equal(getColor({ x: 55, y: 20 }), '0000ff');

    // cache inner mask group - same result
    maskgroup.cache();
    layer.draw();

    assert.equal(getColor({ x: 5, y: 20 }), '000000');
    assert.equal(getColor({ x: 55, y: 20 }), '0000ff');

    // cache group
    // background will be visible now, because globalCompositeOperation
    // will work inside cached parent only
    group.cache();
    layer.draw();

    assert.equal(getColor({ x: 5, y: 20 }), 'd3d3d3');
    assert.equal(getColor({ x: 55, y: 20 }), '0000ff');
  });

  it('recache should update internal caching', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'red',
      draggable: true,
    });
    layer.add(bigCircle);

    bigCircle.cache();

    layer.draw();

    var d = layer.getContext().getImageData(100, 100, 1, 1).data;
    assert.equal(d[0], 255, 'see red');

    bigCircle.fill('blue');
    bigCircle.cache();

    layer.draw();
    d = layer.getContext().getImageData(100, 100, 1, 1).data;
    assert.equal(d[0], 0, 'no red');
    assert.equal(d[2], 255, 'see blue');
  });

  it('recache with filters', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 100,
      fill: 'red',
      draggable: true,
    });
    layer.add(bigCircle);

    bigCircle.filters([Konva.Filters.Blur]);
    bigCircle.blurRadius(10);
    bigCircle.cache();

    layer.draw();
    bigCircle.cache();

    layer.draw();

    var d = layer.getContext().getImageData(100, 100, 1, 1).data;
    assert.equal(d[0], 255, 'see red');
  });

  it('check image smooth', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      imageSmoothingEnabled: false,
    });
    stage.add(layer);

    var bigCircle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 10,
      fill: 'red',
      draggable: true,
      scaleX: 10,
      scaleY: 10,
    });
    layer.add(bigCircle);

    bigCircle.cache({
      imageSmoothingEnabled: false,
    });

    layer.draw();
    assert.equal(
      bigCircle._cache.get('canvas').scene.getContext()._context
        .imageSmoothingEnabled,
      false
    );
  });

  it('getAbsolutePosition for cached container', function () {
    var stage = addStage();

    var layer = new Konva.Layer({});
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 10,
      fill: 'red',
      draggable: true,
      scaleX: 10,
      scaleY: 10,
    });
    layer.add(circle);
    // initial calculations
    circle.getAbsolutePosition();
    //

    layer.cache();
    layer.draw();
    layer.position({
      x: 10,
      y: 10,
    });
    assert.equal(circle.getAbsolutePosition().x, 110);
    assert.equal(circle.getAbsolutePosition().y, 110);
  });

  it('cached node should not have filter canvas until we have a filter', function () {
    var stage = addStage();

    var layer = new Konva.Layer({});
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 10,
      fill: 'red',
      draggable: true,
      scaleX: 10,
      scaleY: 10,
    });
    layer.add(circle);
    circle.cache();

    assert.equal(circle._cache.get('canvas').filter.width, 0);
    circle.filters([Konva.Filters.Blur]);
    layer.draw();
    assert.equal(
      circle._cache.get('canvas').filter.width,
      20 * circle._cache.get('canvas').filter.pixelRatio
    );
    circle.filters([]);
    // TODO: should we clear cache canvas?
    // assert.equal(circle._cache.get('canvas').filter.width, 0);
  });

  it('hit from cache + global composite', function (done) {
    // blend mode should NOT effect hit detection.
    var stage = addStage();

    var layer = new Konva.Layer({});
    stage.add(layer);

    loadImage('lion.png', (img) => {
      const lion = new Konva.Image({ image: img });
      lion.name('lion');
      lion.cache();
      lion.drawHitFromCache();
      layer.add(lion);

      const lion2 = new Konva.Image({ image: img });

      lion2.position({
        x: 50,
        y: 50,
      });
      lion2.name('lion2');
      lion2.globalCompositeOperation('overlay');
      lion2.cache();
      lion2.drawHitFromCache();
      layer.add(lion2);
      layer.draw();
      // layer.toggleHitCanvas();

      var shape = layer.getIntersection({ x: 106, y: 78 });
      assert.equal(shape, lion2);
      done();
    });
  });

  it('hit from cache with custom pixelRatio', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });

    layer.add(rect);
    stage.add(layer);

    rect.cache({
      hitCanvasPixelRatio: 0.2,
    });
    layer.draw();

    var hitCanvas = rect._cache.get('canvas').hit;
    assert.equal(hitCanvas._canvas.width, rect.width() * 0.2);
    assert.equal(hitCanvas._canvas.height, rect.height() * 0.2);
    assert.equal(hitCanvas.pixelRatio, 0.2);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.beginPath();
    context.rect(100, 50, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();

    compareLayerAndCanvas(layer, canvas, 5);

    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });
});
