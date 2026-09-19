import { assert } from 'chai';
import {
  addStage,
  Konva,
  compareLayerAndCanvas,
  cloneAndCompareLayer,
  compareLayers,
  compareCanvases,
  createCanvasAndContext,
  loadImage,
  getPixelRatio,
  countCalls,
  collectCanvasAllocations,
} from './test-utils.ts';

describe('Caching', function () {
  it('cache() with non-finite bounds is skipped, with an error, and stays chainable', function () {
    // a NaN position would draw nothing into the cache canvas
    var rect = new Konva.Rect({ x: 10, y: 10, width: 100, height: 50 });
    var errors = countCalls(Konva.Util, 'error', () => {
      assert.equal(rect.cache({ x: NaN, width: 10, height: 10 }), rect);
    });
    assert.equal(errors, 1);
    assert.equal(rect.isCached(), false);
  });

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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();
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
    stage.add(layer);

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

    layer.add(rect);
    rect.cache();
    layer.draw();

    // important to NOT use tollerance, because opacity is sensative
    cloneAndCompareLayer(layer, 1);
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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();

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

    const { canvas, context } = createCanvasAndContext();

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

    const { canvas, context } = createCanvasAndContext();

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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();

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

    const { canvas, context } = createCanvasAndContext();

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

    const { canvas, context } = createCanvasAndContext();
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

    const canvas = group._getCanvasCache().scene;
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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();
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

    const { canvas, context } = createCanvasAndContext();
    context.beginPath();
    context.rect(100, 50, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    compareLayerAndCanvas(layer, canvas, 5);
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });

  it('even if parent is not visible cache should be created - test for group', function () {
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

    const { canvas, context } = createCanvasAndContext();
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
    // re-caching releases the previous canvas, so keep a copy of it
    var canvasBefore = maskgroup._getCanvasCache().scene._canvas;
    const copyBefore = Konva.Util.createCanvasElement();
    copyBefore.width = canvasBefore.width;
    copyBefore.height = canvasBefore.height;
    copyBefore.getContext('2d')!.drawImage(canvasBefore, 0, 0);

    maskgroup.globalCompositeOperation('destination-in');
    maskgroup.cache();
    var canvasAfter = maskgroup._getCanvasCache().scene._canvas;

    compareCanvases(copyBefore, canvasAfter);

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
      bigCircle._getCanvasCache().scene.getContext()._context
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

    assert.equal(circle._getCanvasCache().filter.width, 0);
    circle.filters([Konva.Filters.Blur]);
    layer.draw();
    assert.equal(
      circle._getCanvasCache().filter.width,
      20 * circle._getCanvasCache().filter.pixelRatio
    );
    circle.filters([]);
    layer.draw();
    // the filter canvas is kept, so toggling the filters back on does not
    // reallocate it. clearCache() releases it with the rest of the cache
    assert.equal(
      circle._getCanvasCache().filter.width,
      20 * circle._getCanvasCache().filter.pixelRatio
    );
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

    var hitCanvas = rect._getCanvasCache().hit;
    assert.equal(hitCanvas._canvas.width, rect.width() * 0.2);
    assert.equal(hitCanvas._canvas.height, rect.height() * 0.2);
    assert.equal(hitCanvas.pixelRatio, 0.2);

    const { canvas, context } = createCanvasAndContext();
    context.beginPath();
    context.rect(100, 50, 100, 100);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();

    compareLayerAndCanvas(layer, canvas, 5);

    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });

  it('cache group with shape with shadow', function () {
    // Replicate the exact structure from sandbox.html
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    // Group (name: 'node')
    var outerGroup = new Konva.Group({
      name: 'node',
    });
    layer.add(outerGroup);

    // Group (name: 'node-group', id: 'root_node', x: 25, y: 25)
    var nodeGroup = new Konva.Group({
      name: 'node-group',
      id: 'root_node',
      x: 25,
      y: 25,
    });
    outerGroup.add(nodeGroup);

    // Group (empty)
    var innerGroup = new Konva.Group();
    nodeGroup.add(innerGroup);

    // Group (name: 'ports-group')
    var portsGroup = new Konva.Group({
      name: 'ports-group',
    });
    innerGroup.add(portsGroup);

    // Group (id: 'root_node_port_date', name: 'port-group', y: 80, draggable: true)
    var portGroup = new Konva.Group({
      id: 'root_node_port_date',
      name: 'port-group',
      y: 80,
      draggable: true,
    });
    portsGroup.add(portGroup);

    // Rect (name: 'label-bg', y: -11, width: 60.9375, height: 22.4, stroke: 'red', fill: 'white', x: -12, cornerRadius: 14.4, opacity: 0.2)
    var labelBg = new Konva.Rect({
      name: 'label-bg',
      y: -11,
      width: 60.9375,
      height: 22.4,
      stroke: 'green',
      fill: 'white',
      x: -12,
      cornerRadius: 14.4,
      opacity: 0.2,
    });
    portGroup.add(labelBg);

    // Circle (name: 'circle', radius: 5, fill: 'white', stroke: 'red', shadowColor: 'red', shadowEnabled: true, shadowBlur: 10, shadowOpacity: 0.75)
    var circle = new Konva.Circle({
      name: 'circle',
      radius: 5,
      fill: 'white',
      stroke: 'red',
      shadowColor: 'red',
    });
    portGroup.add(circle);

    layer.draw();

    // Clone before caching
    var layerNonCached = layer.clone();
    stage.add(layerNonCached);
    layerNonCached.draw();

    // Cache the nodeGroup
    nodeGroup.cache();
    layer.draw();

    // Compare
    compareLayers(layer, layerNonCached, 50);
  });

  // ======================================================
  it('cache of a non-listening node has no hit canvas', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
      listening: false,
    });
    layer.add(rect);
    rect.cache();
    layer.draw();

    assert.equal(rect._getCanvasCache().hit, null, 'no hit canvas built');
    assert.equal(
      rect._getCanvasCache().scene.width > 0,
      true,
      'scene canvas cached as usual'
    );
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), null);
  });

  // ======================================================
  it('cached node builds its hit canvas when it starts listening', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
      listening: false,
    });
    layer.add(rect);
    rect.cache();
    layer.draw();
    assert.equal(rect._getCanvasCache().hit, null);

    rect.listening(true);
    layer.draw();

    assert(rect._getCanvasCache().hit, 'hit canvas built');
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
  });

  // ======================================================
  it('shape.intersects() works on a cached shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });
    layer.add(rect);
    layer.draw();
    rect.cache();

    // intersects() needs the cached hit graph before any layer draw,
    // triggering the lazy build from inside another hit draw
    assert.equal(rect.intersects({ x: 150, y: 100 }), true);
    assert.equal(rect.intersects({ x: 50, y: 180 }), false);
  });

  // ======================================================
  it('cached group with a cached child hit-tests correctly', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var group = new Konva.Group();
    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });
    group.add(rect);
    layer.add(group);
    rect.cache();
    group.cache({ x: 0, y: 0, width: 300, height: 200 });
    layer.draw();

    // the group hit build runs the child's own lazy hit build nested in it
    assert.equal(stage.getIntersection({ x: 150, y: 100 }), rect);
    assert.equal(stage.getIntersection({ x: 20, y: 20 }), null);
  });

  it('cache() allocates only the cache canvas when no shape needs the buffer', function () {
    // geometry far from the node's own origin used to inflate the buffer
    // canvas by the offset (5100x5100 for a 102x102 cache)
    var line = new Konva.Line({
      points: [5000, 5000, 5100, 5100],
      stroke: 'black',
      strokeWidth: 2,
    });

    const allocations = collectCanvasAllocations(() => line.cache());

    assert.deepEqual(
      allocations.map(({ canvas }) => canvas),
      [line._getCanvasCache().scene]
    );
  });

  it('cache() buffer canvas is never larger than the cache and is released', function () {
    // An image with rounded corners and a shadow needs the buffer during caching.
    var rect = new Konva.Image({
      image: undefined,
      x: 5000,
      y: 4000,
      width: 100,
      height: 100,
      fill: 'red',
      cornerRadius: 10,
      shadowColor: 'black',
      shadowBlur: 2,
    });

    const allocations = collectCanvasAllocations(() => rect.cache());
    const scene = rect._getCanvasCache().scene;

    assert.equal(allocations.length, 2, 'cache canvas and buffer canvas');
    allocations.forEach(({ canvas, width, height }) => {
      assert.isAtMost(width, scene.width);
      assert.isAtMost(height, scene.height);
      if (canvas !== scene) {
        assert.equal(canvas._canvas.width, 0, 'buffer canvas is released');
      }
    });
  });

  it('toCanvas() buffer canvas is never larger than the export, is released, and renders the same anywhere', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 5000,
      y: 4000,
      width: 100,
      height: 100,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      opacity: 0.5,
    });
    layer.add(rect);

    let exported;
    const allocations = collectCanvasAllocations(() => {
      exported = rect.toCanvas();
    });

    assert.equal(allocations.length, 2, 'export canvas and buffer canvas');
    allocations.forEach(({ canvas, width, height }) => {
      assert.isAtMost(width, exported.width);
      assert.isAtMost(height, exported.height);
      if (canvas._canvas !== exported) {
        assert.equal(canvas._canvas.width, 0, 'buffer canvas is released');
      }
    });

    rect.position({ x: 0, y: 0 });
    compareCanvases(exported, rect.toCanvas(), 10);
  });

  it('clearCache() on a parent keeps the caches of its children', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var rect = new Konva.Rect({
      width: 50,
      height: 50,
      fill: 'red',
      filters: [Konva.Filters.Invert],
    });
    group.add(rect);
    layer.add(group);
    stage.add(layer);
    rect.cache();

    group.clearCache();

    assert.equal(rect.isCached(), true);
  });

  it('cache() releases the canvases of the previous cache', function () {
    var rect = new Konva.Rect({ width: 50, height: 50, fill: 'red' });
    rect.cache();
    const previous = rect._getCanvasCache().scene;

    rect.cache();

    assert.equal(previous._canvas.width, 0, 'previous scene canvas released');
  });

  it('cache() restores the opacity handling when drawing throws', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group({ opacity: 0.5 });
    var rect = new Konva.Rect({ width: 50, height: 50, fill: 'red' });
    // throws once: the later opacity() change schedules a redraw
    var armed = false;
    var broken = new Konva.Shape({
      width: 50,
      height: 50,
      sceneFunc: function () {
        if (armed) {
          armed = false;
          throw new Error('sceneFunc failed');
        }
      },
    });
    group.add(rect, broken);
    layer.add(group);
    stage.add(layer);

    armed = true;
    assert.throws(() => group.cache(), 'sceneFunc failed');

    assert.equal(group._isUnderCache, false);
    assert.equal(rect.getAbsoluteOpacity(), 0.5);
    group.opacity(0.25);
    assert.equal(rect.getAbsoluteOpacity(), 0.25);
    assert.equal(group.isCached(), false);
  });

  it('drawHitFromCache() honours hitCanvasPixelRatio', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'green',
    });
    layer.add(rect);

    rect.cache({ hitCanvasPixelRatio: 0.5 });
    rect.drawHitFromCache();
    layer.draw();
    assert.equal(layer.getIntersection({ x: 140, y: 140 }), rect);
    assert.equal(layer.getIntersection({ x: 160, y: 160 }), null);

    rect.cache({ hitCanvasPixelRatio: 2 });
    rect.drawHitFromCache();
    layer.draw();
    assert.equal(layer.getIntersection({ x: 140, y: 140 }), rect);
    assert.equal(layer.getIntersection({ x: 160, y: 160 }), null);
  });

  it('a buffered shape keeps its last pixel column in a cache at a fractional pixel ratio', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      width: 35,
      height: 35,
      fill: 'red',
      stroke: 'red',
      strokeWidth: 2,
      opacity: 0.5,
    });
    layer.add(rect);
    rect.cache({ pixelRatio: 1.75, x: 0, y: 0, width: 35, height: 35 });

    var scene = rect._getCanvasCache().scene;
    assert.equal(scene.width, 61);
    var ctx = scene.getContext()._context;
    // the opacity is applied when the cache is drawn, not inside it
    assert.equal(ctx.getImageData(scene.width - 1, 10, 1, 1).data[3], 255);
    assert.equal(ctx.getImageData(10, scene.height - 1, 1, 1).data[3], 255);
  });

  it('a cache keeps the far edge of a child at a fractional position', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var group = new Konva.Group();
    layer.add(group);
    var rect = new Konva.Rect({
      x: 0.25,
      y: 0.25,
      width: 10,
      height: 10,
      fill: 'black',
    });
    group.add(rect);
    group.cache({ pixelRatio: 1 });

    var scene = group._getCanvasCache().scene;
    assert.equal(scene.width, 11);
    assert.equal(scene.height, 11);
    var ctx = scene.getContext()._context;
    assert.isAbove(ctx.getImageData(10, 5, 1, 1).data[3], 0);
    assert.isAbove(ctx.getImageData(5, 10, 1, 1).data[3], 0);
  });

  it('the filter canvas of a cache has the size of the scene canvas at a fractional pixel ratio', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({ width: 35, height: 35, fill: 'red' });
    layer.add(rect);
    rect.cache({ pixelRatio: 1.75, x: 0, y: 0, width: 35, height: 35 });
    rect.filters([Konva.Filters.Invert]);
    layer.draw();

    var cache = rect._getCanvasCache();
    assert.equal(cache.filter.width, cache.scene.width);
    assert.equal(cache.filter.height, cache.scene.height);
    // the last column is drawn (inverted red); the backends antialias the
    // edge of the 1.75x cache differently, so only require it to be visible
    var data = layer.getContext().getImageData(34, 10, 1, 1).data;
    assert.deepEqual(Array.from(data.slice(0, 3)), [0, 255, 255]);
    assert.isAbove(data[3], 100);
  });
});

describe('Cache', function () {
  it('a cache below a hidden ancestor still excludes hidden descendants', function () {
    const stage = addStage(),
      layer = new Konva.Layer({ visible: false });
    stage.add(layer);
    const group = new Konva.Group();
    layer.add(group);
    group.add(new Konva.Rect({ width: 30, height: 30, fill: 'red' }));
    const hidden = new Konva.Group({ visible: false });
    hidden.add(new Konva.Rect({ width: 30, height: 30, fill: 'blue' }));
    group.add(hidden);
    group.cache();
    layer.visible(true);
    layer.draw();
    assert.deepEqual(
      Array.from(layer.getContext().getImageData(10, 10, 1, 1).data),
      [255, 0, 0, 255]
    );
  });

  it('listening changes rebuild cached hit graphs through nested groups', function () {
    const stage = addStage(),
      layer = new Konva.Layer();
    stage.add(layer);
    const outer = new Konva.Group(),
      inner = new Konva.Group();
    layer.add(outer);
    outer.add(inner);
    const bottom = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    const top = bottom.clone({ fill: 'blue' });
    inner.add(bottom, top);
    inner.cache();
    outer.cache();
    layer.draw();
    assert.isTrue(stage.getIntersection({ x: 10, y: 10 }) === top);
    top.listening(false);
    layer.draw();
    assert.isTrue(stage.getIntersection({ x: 10, y: 10 }) === bottom);
    top.listening(true);
    layer.draw();
    assert.isTrue(stage.getIntersection({ x: 10, y: 10 }) === top);
  });
  it('non-scaling strokes are not clipped when caching a scaled shape or group', function () {
    for (const cacheGroup of [false, true]) {
      const group = new Konva.Group({ scaleX: 2, scaleY: 2 });
      const rect = new Konva.Rect({
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        scaleX: 2,
        scaleY: 2,
        stroke: 'red',
        strokeWidth: 10,
        strokeScaleEnabled: false,
      });
      group.add(rect);
      try {
        const node = cacheGroup ? group : rect;
        node.cache();
        node.scale({ x: 1, y: 1 });
        const canvas = node.toCanvas({
          x: -10,
          y: -10,
          width: 100,
          height: 100,
        });
        const x = cacheGroup ? 6 : 12;
        const y = cacheGroup ? 30 : 40;
        assert.deepEqual(
          Array.from(
            canvas.getContext('2d')!.getImageData(x + 10, y + 10, 1, 1).data
          ),
          [255, 0, 0, 255]
        );
      } finally {
        group.destroy();
      }
    }
  });
});
