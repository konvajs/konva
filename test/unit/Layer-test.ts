import { assert } from 'chai';

import {
  addStage,
  simulateMouseDown,
  simulateMouseMove,
  simulateMouseUp,
  showHit,
  Konva,
  loadImage,
  isNode,
  countCalls,
} from './test-utils.ts';

describe('Layer', function () {
  // ======================================================
  it('width and height', function () {
    Konva.showWarnings = false;
    var stage = addStage();

    var layer = new Konva.Layer();
    assert.equal(
      layer.width(),
      undefined,
      'while layer is not on stage width is undefined'
    );
    assert.equal(
      layer.height(),
      undefined,
      'while layer is not on stage height is undefined'
    );

    layer.width(10);
    assert.equal(
      layer.width(),
      undefined,
      'while layer is not on stage changing width doing nothing'
    );
    layer.height(10);
    assert.equal(
      layer.height(),
      undefined,
      'while layer is not on stage changing height doing nothing'
    );
    stage.add(layer);

    assert.equal(
      layer.width(),
      stage.width(),
      'while layer is on stage width is stage`s width'
    );
    assert.equal(
      layer.height(),
      stage.height(),
      'while layer is on stage height is stage`s height'
    );

    layer.width(10);
    assert.equal(
      layer.width(),
      stage.width(),
      'while layer is on stage changing width doing nothing'
    );
    layer.height(10);
    assert.equal(
      layer.height(),
      stage.height(),
      'while layer is on stage changing height doing nothing'
    );
    Konva.showWarnings = true;
  });

  // ======================================================
  it('test canvas inline styles', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var style = layer.getCanvas()._canvas.style;

    assert.equal(
      style.position,
      'absolute',
      'canvas position style should be absolute'
    );
    assert.equal(
      style.border.indexOf('0px'),
      0,
      'canvas border style should be 0px'
    );
    assert.equal(style.margin, '0px', 'canvas margin style should be 0px');
    assert.equal(style.padding, '0px', 'canvas padding style should be 0px');
    assert.equal(
      style.backgroundColor,
      'transparent',
      'canvas backgroundColor style should be transparent'
    );
    assert.equal(style.top, '0px', 'canvas top should be 0px');
    assert.equal(style.left, '0px', 'canvas left should be 0px');
  });

  it('test clear()', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
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

    circle.colorKey = '#000000';

    circle.on('mouseover', function () {
      console.log('mouseover');
    });

    layer.add(circle);
    stage.add(layer);

    layer.clear();

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();clearRect(0,0,578,200);'
    );

    var hitTrace = layer.getHitCanvas().getContext().getTrace();
    //console.log(hitTrace);
    assert.equal(
      hitTrace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();save();fillStyle=#000000;fill();restore();lineWidth=4;strokeStyle=#000000;stroke();restore();clearRect(0,0,578,200);'
    );

    showHit(layer);
  });

  it('test clear() with bounds', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
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

    circle.colorKey = '#000000';

    circle.on('mouseover', function () {});

    layer.add(circle);
    stage.add(layer);

    layer.clear({ x: 100, y: 100, width: 100, height: 100 });

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();clearRect(100,100,100,100);'
    );

    var hitTrace = layer.getHitCanvas().getContext().getTrace();
    //console.log(hitTrace);
    assert.equal(
      hitTrace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();save();fillStyle=#000000;fill();restore();lineWidth=4;strokeStyle=#000000;stroke();restore();clearRect(100,100,100,100);'
    );

    showHit(layer);
  });

  // ======================================================
  it('layer getIntersection()', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var redCircle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
      id: 'redCircle',
    });

    var greenCircle = new Konva.Circle({
      x: 300,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
      id: 'greenCircle',
    });

    layer.add(redCircle);
    layer.add(greenCircle);
    stage.add(layer);

    assert.equal(
      layer.getIntersection({ x: 300, y: 100 })?.id(),
      'greenCircle',
      'shape should be greenCircle'
    );
    assert.equal(
      layer.getIntersection({ x: 380, y: 100 })?.id(),
      'redCircle',
      'shape should be redCircle'
    );
    assert.equal(
      layer.getIntersection({ x: 100, y: 100 }),
      null,
      'shape should be null'
    );
  });

  // ======================================================
  it('set layer visibility', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      visible: false,
    });

    stage.add(layer);

    assert(layer.getNativeCanvasElement().style.display === 'none');
  });

  // ======================================================
  it('set clearBeforeDraw to false, and test toDataURL for stage, layer, group, and shape', function () {
    var stage = addStage();

    var layer = new Konva.Layer({
      clearBeforeDraw: false,
      throttle: 999,
    });

    var group = new Konva.Group();

    var circle = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    for (var n = 0; n < 20; n++) {
      circle.move({ x: 10, y: 0 });
      layer.draw();
    }

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(
      trace,
      'save();transform(1,0,0,1,220,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,230,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,240,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,250,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,260,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,270,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,280,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,290,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,300,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('save layer as png', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var Circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'violet',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(Circle);
    stage.add(layer);

    var dataUrl = layer.toDataURL();
    assert(dataUrl.length > 30);
  });

  // ======================================================
  it('save layer as low quality jpg', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'violet',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    var dataUrl = layer.toDataURL({
      mimeType: 'image/jpeg',
      quality: 0.2,
    });

    if (Konva._renderBackend === 'skia-canvas') {
      return;
    }

    assert(
      dataUrl.length <
        layer.toDataURL({
          mimeType: 'image/jpeg',
        }).length
    );
  });

  // ======================================================
  it('hit graph enable disable', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    assert.equal(layer.listening(), true);
    assert.equal(layer.shouldDrawHit(), true);

    layer.listening(false);

    assert.equal(layer.listening(), false);
    assert.equal(layer.shouldDrawHit(), false);

    layer.listening(true);

    assert.equal(layer.listening(), true);
    assert.equal(layer.shouldDrawHit(), true);
  });

  // ======================================================
  it('should not draw hit on stage drag', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(circle);
    stage.add(layer);

    simulateMouseDown(stage, {
      x: circle.x(),
      y: circle.y(),
    });

    simulateMouseMove(stage, {
      x: circle.x() + 10,
      y: circle.y() + 10,
    });
    assert.equal(stage.isDragging(), true, 'dragging of stage is ok');
    assert.equal(layer.shouldDrawHit(), false);

    simulateMouseUp(stage, {
      x: 291,
      y: 112,
    });
  });

  it('get/set layer size', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    assert.deepEqual(layer.size(), stage.size());
    assert.equal(layer.width(), stage.width());
    assert.equal(layer.height(), stage.height());
  });

  it('get/set imageSmoothingEnabled', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();

      var layer = new Konva.Layer({
        imageSmoothingEnabled: false,
      });
      var darth = new Konva.Image({
        image: imageObj,
        scaleX: 5,
        scaleY: 5,
      });

      layer.add(darth);
      stage.add(layer);

      assert.equal(layer.getContext()['imageSmoothingEnabled'], false);

      layer.imageSmoothingEnabled(true);

      assert.equal(layer.getContext()['imageSmoothingEnabled'], true);

      layer.imageSmoothingEnabled(false);
      // change size
      stage.width(stage.width() + 1);
      assert.equal(layer.getContext()['imageSmoothingEnabled'], false);

      done();
    });
  });

  // ======================================================
  it('hit canvas of a non-listening layer is not allocated', function () {
    var stage = addStage();
    var layer = new Konva.Layer({ listening: false });
    layer.add(
      new Konva.Rect({ x: 10, y: 10, width: 50, height: 50, fill: 'red' })
    );
    stage.add(layer);
    layer.draw();

    assert.equal(layer.hitCanvas.width, 0, 'hit canvas stays released');
    assert.equal(layer.hitCanvas.height, 0, 'hit canvas stays released');
    assert.equal(
      layer.canvas.width,
      stage.width() * layer.canvas.pixelRatio,
      'scene canvas is sized as usual'
    );
    assert.equal(layer.getIntersection({ x: 20, y: 20 }), null);
  });

  // ======================================================
  it('hit canvas is allocated when a layer starts listening and released when it stops', function () {
    var stage = addStage();
    var layer = new Konva.Layer({ listening: false });
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect);
    stage.add(layer);
    layer.draw();
    assert.equal(layer.hitCanvas.width, 0);

    layer.listening(true);
    layer.draw();
    assert.equal(layer.hitCanvas.width, stage.width(), 'hit canvas allocated');
    assert.equal(layer.hitCanvas.height, stage.height());
    assert.equal(layer.getIntersection({ x: 20, y: 20 }), rect);

    layer.listening(false);
    layer.draw();
    assert.equal(layer.hitCanvas.width, 0, 'hit canvas released again');
    assert.equal(layer.getIntersection({ x: 20, y: 20 }), null);
  });

  // ======================================================
  it('stage.listening(false) releases the hit canvases of its layers', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect);
    stage.add(layer);
    assert.equal(layer.hitCanvas.width, stage.width());

    stage.listening(false);
    layer.draw();
    assert.equal(layer.hitCanvas.width, 0, 'inherited listening releases hit');

    stage.listening(true);
    layer.draw();
    assert.equal(layer.hitCanvas.width, stage.width());
    assert.equal(layer.getIntersection({ x: 20, y: 20 }), rect);
  });

  it('batchDraw() requested from a draw handler schedules another draw', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    let draws = 0;
    layer.on('draw', function () {
      draws++;
      if (draws === 1) {
        layer.batchDraw();
      } else {
        // the stage teardown of the next test draws this layer again
        layer.off('draw');
        done();
      }
    });
    layer.batchDraw();
  });

  it('getIntersection() tests the pixel under the pointer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 10,
      height: 10,
      fill: 'red',
    });
    layer.add(rect);
    stage.add(layer);

    // the rect covers pixels 10..19
    assert.equal(layer.getIntersection({ x: 9.6, y: 15 }), null);
    assert.equal(layer.getIntersection({ x: 19.9, y: 15 }), rect);
  });

  it('getIntersection() finds an upscaled cached node under its smoothed edge', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      width: 20,
      height: 20,
      fill: 'red',
      scaleX: 10,
      scaleY: 10,
    });
    layer.add(rect);
    stage.add(layer);
    rect.cache();
    layer.draw();

    // the cached hit graph is upscaled with smoothing, so the last pixels
    // before the visible edge at x = 200 are semi-transparent
    assert.equal(layer.getIntersection({ x: 199, y: 100 }), rect);
    assert.equal(layer.getIntersection({ x: 100, y: 199 }), rect);
    assert.equal(layer.getIntersection({ x: 199, y: 199 }), rect);
    assert.equal(layer.getIntersection({ x: 205, y: 100 }), null);
  });

  it('getIntersection() reads a bounded number of pixels on an antialiased area', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    // an unregistered, semi-transparent hit graph over the whole layer
    const ctx = layer.hitCanvas.context._context;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, stage.width(), stage.height());

    let hit;
    const reads = countCalls(layer.hitCanvas.context, 'getImageData', () => {
      hit = layer.getIntersection({
        x: stage.width() / 2,
        y: stage.height() / 2,
      });
    });
    assert.equal(hit, null);
    assert.isAtMost(reads, 2);
  });

  it('getIntersection() does not attribute a thin line to a shape next to it', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    // a 1px line at an integer x has no opaque pixel in the hit graph
    var line = new Konva.Line({
      points: [40, 20, 40, 180],
      stroke: 'black',
      strokeWidth: 1,
    });
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'red',
    });
    layer.add(line, rect);
    stage.add(layer);

    assert.notEqual(layer.getIntersection({ x: 40, y: 100 }), rect);
    assert.equal(layer.getIntersection({ x: 100, y: 100 }), rect);
  });

  it('getIntersection() follows the wide smoothed edge of a cached node scaled far up', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 0,
      y: 100,
      radius: 5,
      fill: 'red',
      scaleX: 30,
      scaleY: 30,
    });
    layer.add(circle);
    stage.add(layer);
    circle.cache();
    layer.draw();

    // the visible edge is at x = 150; the smoothed hit edge is ~30px wide
    assert.equal(layer.getIntersection({ x: 147, y: 100 }), circle);
    assert.equal(layer.getIntersection({ x: 135, y: 100 }), circle);
    assert.equal(layer.getIntersection({ x: 110, y: 100 }), circle);
    assert.equal(layer.getIntersection({ x: 170, y: 100 }), null);
  });

  it('remove() detaches both layer canvases, also from a detached container', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    stage.container().remove();
    var layer = new Konva.Layer();
    stage.add(layer);
    stage.add(new Konva.Layer());
    layer.toggleHitCanvas();

    layer.remove();

    assert.equal(stage.content.children.length, 1);
    assert.equal(layer.getHitCanvas()._canvas.parentNode, null);
  });

  it('size() of a layer warns and does not resize its canvas, like width() and height()', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var canvasWidth = layer.getCanvas().width;
    var warns = countCalls(Konva.Util, 'warn', () => {
      layer.size({ width: 10, height: 10 });
    });
    assert.equal(warns, 2);
    assert.equal(layer.getCanvas().width, canvasWidth);
    assert.equal(layer.width(), stage.width());
  });
});
