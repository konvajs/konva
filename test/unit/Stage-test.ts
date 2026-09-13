import { assert } from 'chai';

import {
  addStage,
  simulateMouseDown,
  simulateMouseMove,
  simulateMouseUp,
  simulateTouchStart,
  simulateTouchMove,
  simulateTouchEnd,
  simulatePointerMove,
  compareCanvases,
  showHit,
  getContainer,
  isNode,
  isBrowser,
  Konva,
  createCanvasAndContext,
  collectCanvasAllocations,
  countCalls,
} from './test-utils.ts';

describe('Stage', function () {
  it('double-click history expires at the configured time window', function () {
    const stage = addStage();
    let doubles = 0;
    stage.on('dblclick', () => doubles++);
    const originalNow = Date.now;
    let now = originalNow();
    Date.now = () => now;
    const click = () => {
      simulateMouseDown(stage, { x: 10, y: 10 });
      simulateMouseUp(stage, { x: 10, y: 10 });
    };
    try {
      click();
      now += Konva.dblClickWindow;
      click();
      assert.equal(doubles, 0);
      now += Konva.dblClickWindow - 1;
      click();
      assert.equal(doubles, 1);
    } finally {
      Date.now = originalNow;
    }
  });

  for (const dragStage of [false, true]) {
    it(`dragging a ${dragStage ? 'stage' : 'shape'} preserves hit drawing and hover on another stage`, function () {
      const first = addStage();
      const second = addStage();
      const firstLayer = new Konva.Layer();
      const secondLayer = new Konva.Layer();
      first.add(firstLayer);
      second.add(secondLayer);
      const dragged = new Konva.Rect({
        width: 40,
        height: 40,
        fill: 'red',
        draggable: !dragStage,
      });
      const hovered = new Konva.Rect({ width: 40, height: 40, fill: 'blue' });
      firstLayer.add(dragged);
      secondLayer.add(hovered);
      first.draggable(dragStage);
      first.draw();
      second.draw();
      const calls: string[] = [];
      hovered.on('pointerenter pointermove', (e) => calls.push(e.type));
      simulateTouchStart(first, [{ x: 20, y: 20, id: 1 }]);
      simulateTouchMove(first, [{ x: 40, y: 20, id: 1 }]);
      assert.isTrue((dragStage ? first : dragged).isDragging());
      second.draw();
      simulatePointerMove(second, { x: 20, y: 20, pointerId: 2 });
      assert.deepEqual(calls, ['pointerenter', 'pointermove']);
      simulateTouchEnd(first, [], [{ x: 40, y: 20, id: 1 }]);
    });
  }

  it('click history belongs to each stage and survives another stage being destroyed', function () {
    const first = addStage();
    const second = addStage();
    const doubles = [0, 0];
    first.on('dblclick', () => doubles[0]++);
    second.on('dblclick', () => doubles[1]++);
    const click = (stage) => {
      simulateMouseDown(stage, { x: 10, y: 10 });
      simulateMouseUp(stage, { x: 10, y: 10 });
    };
    click(first);
    click(second);
    assert.deepEqual(doubles, [0, 0]);
    second.destroy();
    click(first);
    assert.deepEqual(doubles, [1, 0]);
  });
  // ======================================================
  it('instantiate stage with id', function () {
    if (isNode) {
      return;
    }
    var container = Konva.document.createElement('div');
    container.id = 'container';
    getContainer().appendChild(container);

    var stage = new Konva.Stage({
      container: 'container',
      width: 578,
      height: 200,
    });

    assert.equal(stage.getContent().className, 'konvajs-content');
    assert.equal(stage.getContent().getAttribute('role'), 'presentation');
  });

  // ======================================================
  it('test stage buffer canvas and hit buffer canvas', function () {
    if (isNode) {
      return;
    }
    var container = Konva.document.createElement('div');
    container.id = 'container';

    getContainer().appendChild(container);

    // simulate pixelRatio = 2
    Konva.pixelRatio = 2;

    var stage = new Konva.Stage({
      container: 'container',
      width: 578,
      height: 200,
    });

    assert.equal(stage.bufferCanvas.getPixelRatio(), 2);
    assert.equal(stage.bufferHitCanvas.getPixelRatio(), 1);

    // reset
    Konva.pixelRatio = 1;
  });

  // ======================================================
  it('instantiate stage with dom element', function () {
    if (isNode) {
      return;
    }
    var container = Konva.document.createElement('div');

    getContainer().appendChild(container);

    var stage = new Konva.Stage({
      container: container,
      width: 578,
      height: 200,
    });

    assert.equal(stage.container(), container);
  });

  // ======================================================
  it('stage instantiation should clear container', function () {
    if (isNode) {
      return;
    }
    var container = Konva.document.createElement('div');
    var dummy = Konva.document.createElement('p');

    container.appendChild(dummy);
    getContainer().appendChild(container);

    var stage = new Konva.Stage({
      container: container,
      width: 578,
      height: 200,
    });

    assert.equal(
      container.getElementsByTagName('p').length,
      0,
      'container should have no p tags'
    );
  });

  // ======================================================
  it('test stage cloning', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var stageClone = stage.clone();
    assert.notEqual(
      stage.container(),
      stageClone.container(),
      'clone should be in different container'
    );

    assert.equal(
      stage.container().childNodes[0].childNodes.length,
      1,
      'container should not have changes'
    );
  });

  // ======================================================
  it('set stage size', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    assert.equal(stage.getSize().width, 578);
    assert.equal(stage.getSize().height, 200);
    stage.setSize({ width: 1, height: 2 });
    assert.equal(stage.getSize().width, 1);
    assert.equal(stage.getSize().height, 2);
    stage.setSize({ width: 3, height: 3 });
    assert.equal(stage.getSize().width, 3);
    assert.equal(stage.getSize().height, 3);
    stage.setSize({
      width: 4,
      height: 5,
    });
    assert.equal(stage.getSize().width, 4);
    assert.equal(stage.getSize().height, 5);
    stage.width(6);
    assert.equal(stage.getSize().width, 6);
    assert.equal(stage.getSize().height, 5);
    stage.height(7);
    assert.equal(stage.getSize().width, 6);
    assert.equal(stage.getSize().height, 7);
    stage.setSize({ width: 8, height: 9 });
    assert.equal(stage.getSize().width, 8);
    assert.equal(stage.getSize().height, 9);
    stage.setSize({ width: 10, height: 11 });
    assert.equal(stage.getSize().width, 10);
    assert.equal(stage.getSize().height, 11);

    layer.add(circle);
    stage.add(layer);

    stage.setSize({ width: 333, height: 155 });

    assert.equal(stage.getSize().width, 333);
    assert.equal(stage.getSize().height, 155);
    if (isBrowser) {
      assert.equal(stage.getContent().style.width, '333px');
      assert.equal(stage.getContent().style.height, '155px');
    }

    assert.equal(
      layer.getCanvas()._canvas.width,
      333 * layer.getCanvas().getPixelRatio()
    );
    assert.equal(
      layer.getCanvas()._canvas.height,
      155 * layer.getCanvas().getPixelRatio()
    );
  });

  // ======================================================
  it('get stage DOM', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();

    assert.equal(stage.getContent().className, 'konvajs-content');
  });

  it('try to move stage ', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var container = document.createElement('div');
    var wrap = stage.container().parentNode!;
    wrap.appendChild(container);

    stage.container(container);

    assert.equal(stage.container(), container);

    assert.equal(stage.content, container.children[0]);
  });

  it('clone stage ', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
    });
    layer.add(shape);
    layer.draw();

    var container = document.createElement('div');
    var wrap = stage.container().parentNode!;
    wrap.appendChild(container);

    var clone = stage.clone();
    clone.container(container);

    assert.equal(clone.container(), container);

    assert.equal(clone.content, container.children[0]);
  });

  it('dangling stage ', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var container = stage.container();
    var parent = stage.content.parentElement!;

    parent.removeChild(stage.content);

    stage.setContainer(container);

    assert.equal(stage.container(), container);
  });

  // ======================================================
  it('stage getIntersection()', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var redCircle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
    });

    var greenCircle = new Konva.Circle({
      x: 300,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
    });

    layer.add(redCircle);
    layer.add(greenCircle);
    stage.add(layer);

    assert.equal(
      stage.getIntersection({ x: 300, y: 100 }),
      greenCircle,
      'shape should be greenCircle'
    );
    assert.equal(
      stage.getIntersection({ x: 380, y: 100 }),
      redCircle,
      'shape should be redCircle'
    );
    assert.equal(
      stage.getIntersection({ x: 100, y: 100 }),
      null,
      'shape should be null'
    );
  });

  // ======================================================
  it('stage getIntersection() edge detection', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var redCircle = new Konva.Circle({
      x: 380,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'red',
      stroke: 'black',
    });

    var greenCircle = new Konva.Circle({
      x: 300,
      y: stage.height() / 2,
      radius: 70,
      strokeWidth: 4,
      fill: 'green',
      stroke: 'black',
    });

    stage.on('contentMousemove', function () {
      var pos = stage.getPointerPosition()!;
      var shape = stage.getIntersection(pos);
      if (!shape) {
        //console.log(pos);
      }
    });

    layer.add(redCircle);
    layer.add(greenCircle);
    stage.add(layer);

    assert.equal(
      stage.getIntersection({ x: 370, y: 93 }),
      greenCircle,
      'shape should be greenCircle'
    );
    assert.equal(
      stage.getIntersection({ x: 371, y: 93 }),
      greenCircle,
      'shape should be greenCircle'
    );
    assert.equal(
      stage.getIntersection({ x: 372, y: 93 }),
      redCircle,
      'shape should be redCircle'
    );
  });

  // ======================================================
  it('test getAllIntersections', function () {
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

    // test individual shapes
    assert.equal(
      stage.getAllIntersections({ x: 266, y: 114 }).length,
      1,
      '17) getAllIntersections should return one shape'
    );
    assert.equal(
      stage.getAllIntersections({ x: 266, y: 114 })[0].id(),
      'greenCircle',
      '19) first intersection should be greenCircle'
    );

    assert.equal(
      stage.getAllIntersections({ x: 414, y: 115 }).length,
      1,
      '18) getAllIntersections should return one shape'
    );
    assert.equal(
      stage.getAllIntersections({ x: 414, y: 115 })[0].id(),
      'redCircle',
      '20) first intersection should be redCircle'
    );

    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 }).length,
      2,
      '1) getAllIntersections should return two shapes'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[0].id(),
      'redCircle',
      '2) first intersection should be redCircle'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[1].id(),
      'greenCircle',
      '3) second intersection should be greenCircle'
    );

    // hide green circle.  make sure only red circle is in result set
    greenCircle.hide();
    layer.draw();

    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 }).length,
      1,
      '4) getAllIntersections should return one shape'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[0].id(),
      'redCircle',
      '5) first intersection should be redCircle'
    );

    // show green circle again.  make sure both circles are in result set
    greenCircle.show();
    layer.draw();

    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 }).length,
      2,
      '6) getAllIntersections should return two shapes'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[0].id(),
      'redCircle',
      '7) first intersection should be redCircle'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[1].id(),
      'greenCircle',
      '8) second intersection should be greenCircle'
    );

    // hide red circle.  make sure only green circle is in result set
    redCircle.hide();
    layer.draw();

    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 }).length,
      1,
      '9) getAllIntersections should return one shape'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[0].id(),
      'greenCircle',
      '10) first intersection should be greenCircle'
    );

    // show red circle again.  make sure both circles are in result set
    redCircle.show();
    layer.draw();

    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 }).length,
      2,
      '11) getAllIntersections should return two shapes'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[0].id(),
      'redCircle',
      '12) first intersection should be redCircle'
    );
    assert.equal(
      stage.getAllIntersections({ x: 350, y: 118 })[1].id(),
      'greenCircle',
      '13) second intersection should be greenCircle'
    );

    // test from layer
    assert.equal(
      layer.getAllIntersections({ x: 350, y: 118 }).length,
      2,
      '14) getAllIntersections should return two shapes'
    );
    assert.equal(
      layer.getAllIntersections({ x: 350, y: 118 })[0].id(),
      'redCircle',
      '15) first intersection should be redCircle'
    );
    assert.equal(
      layer.getAllIntersections({ x: 350, y: 118 })[1].id(),
      'greenCircle',
      '16) second intersection should be greenCircle'
    );

    // now hide layer and but force visible for shape.

    layer.hide();
    redCircle.visible(true);
    assert.equal(stage.getAllIntersections(redCircle.position()).length, 0);
  });

  // ======================================================
  it('test getAllIntersections for text', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 0,
      y: 0,
      text: 'Hello world',
      fontSize: 50,
      name: 'intersectText',
    });

    layer.add(text);
    stage.add(layer);

    // test individual shapes
    assert.equal(
      stage.getAllIntersections({ x: 10, y: 10 }).length,
      1,
      '17) getAllIntersections should return one shape'
    );
  });

  // ======================================================
  it('Should not throw on clip for stage', function () {
    // no asserts, because we check throw
    const oldWarn = console.warn;
    let called = false;
    console.warn = function () {
      called = true;
    };
    var stage = addStage({
      clipFunc: function () {},
    });
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 0,
      y: 0,
      text: 'Hello world',
      fontSize: 50,
      name: 'intersectText',
    });

    layer.add(text);
    stage.add(layer);
    console.warn = oldWarn;
    assert.equal(called, true);
  });

  // ======================================================
  it('scale stage after add layer', function () {
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

    stage.scale({ x: 0.5, y: 0.5 });

    assert.equal(stage.scale().x, 0.5, 'stage scale x should be 0.5');
    assert.equal(stage.scale().y, 0.5, 'stage scale y should be 0.5');
    stage.draw();
  });

  // ======================================================
  it('scale stage before add shape', function () {
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

    stage.scale({ x: 0.5, y: 0.5 });

    assert.equal(stage.scale().x, 0.5, 'stage scale x should be 0.5');
    assert.equal(stage.scale().y, 0.5, 'stage scale y should be 0.5');

    layer.add(circle);
    stage.add(layer);
  });

  // ======================================================
  it('remove() of a stage is a no-op, a stage has no parent node', function () {
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

    stage.remove();

    if (Konva.isBrowser) {
      assert.equal(stage.content.parentNode, stage.container());
    }
    assert.equal(stage.getLayers().length, 1);
  });

  // ======================================================
  it('destroy stage', function () {
    var stage = addStage({
      width: 578,
      height: 200,
      id: 'stageFalconId',
      name: 'stageFalconName',
    });

    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      id: 'circleFalconId',
      name: 'circleFalconName',
    });

    layer.add(circle);
    stage.add(layer);

    stage.destroy();

    assert.equal(
      Konva.stages.indexOf(stage) === -1,
      true,
      'stage should not be in stages array'
    );
  });

  // ======================================================
  it('scale stage with no shapes', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    stage.add(layer);
    stage.scaleX(0.5);

    stage.draw();

    assert.equal(stage.scaleX(), 0.5);
  });

  // ======================================================
  it('test stage.getStage()', function () {
    var stage = addStage();

    assert.notEqual(stage.getStage(), undefined);

    //console.log(stage.getStage());
  });

  it('add multiple layers to stage', function () {
    var stage = addStage();
    var layer1 = new Konva.Layer();
    var layer2 = new Konva.Layer();
    var layer3 = new Konva.Layer();
    stage.add(layer1, layer2, layer3);
    assert.equal(stage.getLayers().length, 3, 'stage has exactly three layers');
  });
  // ======================================================
  it('test drag and click', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      fill: 'red',
      draggable: true,
    });

    layer.add(rect);
    stage.add(layer);

    rect.on('dblclick', function () {
      assert(false, 'double click fired');
    });

    var y = 60;

    // simulate dragging
    simulateMouseDown(stage, {
      x: 60,
      y: y,
    });

    simulateMouseMove(stage, {
      x: 61,
      y: y,
    });

    simulateMouseMove(stage, {
      x: 62,
      y: y,
    });

    simulateMouseMove(stage, {
      x: 63,
      y: y,
    });

    simulateMouseMove(stage, {
      x: 64,
      y: y,
    });

    simulateMouseUp(stage, {
      x: 65,
      y: y,
    });

    assert.equal(Konva.isDragging(), false);
    assert.equal(Konva.DD.node, undefined);
    // simulate click
    simulateMouseDown(stage, {
      x: 66,
      y: y,
    });

    simulateMouseUp(stage, {
      x: 66,
      y: y,
    });
    assert.equal(Konva.isDragging(), false);
    assert.equal(Konva.DD.node, undefined);
  });

  // ======================================================
  it('do not trigger stage click after dragend', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      fill: 'red',
      draggable: true,
    });

    layer.add(rect);
    stage.add(layer);

    var clicks = 0;

    stage.on('click', function () {
      clicks += 1;
    });

    // simulate dragging
    simulateMouseDown(stage, {
      x: 25,
      y: 25,
    });

    simulateMouseMove(stage, {
      x: 100,
      y: 100,
    });

    // move rect out of mouse
    rect.x(-30);
    rect.y(-30);

    simulateMouseUp(stage, {
      x: 100,
      y: 100,
    });

    assert.equal(clicks, 0);
  });

  it('can listen click on empty areas', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var dblicks = 0;
    var clicks = 0;
    var mousedowns = 0;
    var mouseups = 0;
    var mousemoves = 0;

    stage.on('mousedown', function (e) {
      mousedowns += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('mousemove', function (e) {
      mousemoves += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('mouseup', function (e) {
      mouseups += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('click', function (e) {
      clicks += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('dblclick', function (e) {
      dblicks += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    // simulate dragging
    simulateMouseDown(stage, {
      x: 60,
      y: 10,
    });

    simulateMouseMove(stage, {
      x: 60,
      y: 10,
    });

    simulateMouseUp(stage, {
      x: 65,
      y: 10,
    });

    assert.equal(mousedowns, 1, 'first mousedown registered');
    assert.equal(mouseups, 1, 'first mouseup registered');
    assert.equal(clicks, 1, 'first click registered');
    assert.equal(mousemoves, 1, 'first mousemove registered');
    assert.equal(dblicks, 0, 'no  dbclicks registered');

    simulateMouseDown(stage, {
      x: 60,
      y: 10,
    });

    simulateMouseUp(stage, {
      x: 65,
      y: 10,
    });

    assert.equal(mousedowns, 2, 'second mousedown registered');
    assert.equal(mouseups, 2, 'seconds mouseup registered');
    assert.equal(clicks, 2, 'seconds click registered');
    assert.equal(dblicks, 1, 'first dbclick registered');
  });

  it('stage mouseup should fire before click on empty area', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var order: string[] = [];

    stage.on('mousedown', function () {
      order.push('down');
    });
    stage.on('mouseup', function () {
      order.push('up');
    });
    stage.on('click', function () {
      order.push('click');
    });

    simulateMouseDown(stage, { x: 10, y: 10 });
    simulateMouseUp(stage, { x: 10, y: 10 });

    assert.deepEqual(order, ['down', 'up', 'click']);
  });

  it('can listen taps on empty areas', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var dbltaps = 0;
    var taps = 0;
    var touchstarts = 0;
    var touchends = 0;
    var touchmoves = 0;

    stage.on('touchstart', function (e) {
      touchstarts += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('touchend', function (e) {
      touchends += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('touchmove', function (e) {
      touchmoves += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('tap', function (e) {
      taps += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('dbltap', function (e) {
      dbltaps += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    // simulate dragging
    simulateTouchStart(stage, [{ x: 100, y: 100, id: 1 }]);

    simulateTouchMove(stage, [{ x: 100, y: 100, id: 1 }]);

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 1 }]);

    assert.equal(touchstarts, 1, 'first touchstart registered');
    assert.equal(touchends, 1, 'first touchends registered');
    assert.equal(taps, 1, 'first tap registered');
    assert.equal(touchmoves, 1, 'first touchmove registered');
    assert.equal(dbltaps, 0, 'no  dbltap registered');

    simulateTouchStart(stage, [{ x: 100, y: 100, id: 1 }]);

    simulateTouchEnd(stage, [], [{ x: 100, y: 100, id: 1 }]);

    assert.equal(touchstarts, 2, 'first touchstart registered');
    assert.equal(touchends, 2, 'first touchends registered');
    assert.equal(taps, 2, 'first tap registered');
    assert.equal(dbltaps, 1, 'dbltap registered');
  });

  it('pass context and wheel events to shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'red',
    });
    layer.add(rect);
    layer.draw();

    var contextmenus = 0;
    var wheels = 0;

    // test on empty
    stage.on('contextmenu', function (e) {
      contextmenus += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('wheel', function (e) {
      wheels += 1;
      assert.equal(e.target, stage);
      assert.equal(e.currentTarget, stage);
    });

    var top = stage.content ? stage.content.getBoundingClientRect().top : 0;
    stage._contextmenu({
      clientX: 0,
      clientY: top + 0,
    });
    stage._wheel({
      clientX: 0,
      clientY: top + 0,
    });

    assert.equal(contextmenus, 1, 'first contextment registered');
    assert.equal(wheels, 1, 'first wheel registered');

    stage.off('contextmenu');
    stage.off('wheel');

    // test on shape
    stage.on('contextmenu', function (e) {
      contextmenus += 1;
      assert.equal(e.target, rect);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('wheel', function (e) {
      wheels += 1;
      assert.equal(e.target, rect);
      assert.equal(e.currentTarget, stage);
    });
    stage._contextmenu({
      clientX: 60,
      clientY: top + 60,
    });
    stage._wheel({
      clientX: 60,
      clientY: top + 60,
    });

    assert.equal(contextmenus, 2, 'second contextment registered');
    assert.equal(wheels, 2, 'second wheel registered');
  });

  it('make sure it does not trigger too many events', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      width: stage.width(),
      height: stage.height(),
    });
    layer.add(rect);
    layer.draw();

    var dblicks = 0;
    var clicks = 0;
    var mousedowns = 0;
    var mouseups = 0;

    stage.on('mousedown', function (e) {
      mousedowns += 1;
      assert.equal(e.target, rect);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('mouseup', function (e) {
      mouseups += 1;
      assert.equal(e.target, rect);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('click', function (e) {
      clicks += 1;
      assert.equal(e.target, rect);
      assert.equal(e.currentTarget, stage);
    });

    stage.on('dblclick', function (e) {
      dblicks += 1;
      assert.equal(e.target, rect);
      assert.equal(e.currentTarget, stage);
    });

    // simulate dragging
    simulateMouseDown(stage, {
      x: 60,
      y: 10,
    });

    simulateMouseUp(stage, {
      x: 65,
      y: 10,
    });

    assert.equal(mousedowns, 1, 'first mousedown registered');
    assert.equal(mouseups, 1, 'first mouseup registered');
    assert.equal(clicks, 1, 'first click registered');
    assert.equal(dblicks, 0, 'no  dbclicks registered');

    simulateMouseDown(stage, {
      x: 60,
      y: 10,
    });

    simulateMouseUp(stage, {
      x: 65,
      y: 10,
    });

    assert.equal(mousedowns, 2, 'second mousedown registered');
    assert.equal(mouseups, 2, 'seconds mouseup registered');
    assert.equal(clicks, 2, 'seconds click registered');
    assert.equal(dblicks, 1, 'first dbclick registered');
  });

  it('test mouseover event on stage', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect2);
    layer.draw();

    var mouseover = 0;

    stage.on('mouseover', function (e) {
      mouseover += 1;

      if (mouseover === 1) {
        assert.equal(e.target, stage);
        assert.equal(e.currentTarget, stage);
      }
      if (mouseover === 2) {
        assert.equal(e.target, rect1);
      }
      if (mouseover === 3) {
        assert.equal(e.target, rect2);
      }
    });

    stage._pointerover({
      clientX: 0,
      clientY: 0,
      type: 'mouseover',
    });

    assert.equal(mouseover, 1, 'initial over');
    simulateMouseMove(stage, {
      x: 10,
      y: 10,
    });

    assert.equal(mouseover, 1, 'moved inside stage - no new over events');

    simulateMouseMove(stage, {
      x: 60,
      y: 60,
    });

    assert.equal(mouseover, 2, 'moved into inner shape, trigger new mouseover');

    simulateMouseMove(stage, {
      x: 110,
      y: 110,
    });

    assert.equal(
      mouseover,
      3,
      'moved into second shape, trigger new mouseover'
    );

    simulateMouseMove(stage, {
      x: 10,
      y: 10,
    });

    assert.equal(
      mouseover,
      4,
      'moved to empty space shape, trigger new mouseover'
    );
  });

  it('toCanvas in sync way', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'black',
      radius: 50,
    });
    layer.add(circle);
    stage.add(layer);

    compareCanvases(stage.toCanvas(), layer.toCanvas(), 200);
  });

  it('listen to mouseleave event on container', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'black',
      radius: 50,
    });
    layer.add(circle);
    stage.add(layer);

    var count = 0;
    stage.on('mouseleave', function () {
      count += 1;
    });
    stage.on('mouseout', function () {
      count += 1;
    });
    stage._pointerleave({ type: 'mouseleave' });
    assert.equal(count, 2);
  });

  it('stage pointerleave should fire when leaving stage', function () {
    var stage = addStage();

    var stageLeave = 0;
    stage.on('pointerleave', function () {
      stageLeave += 1;
    });

    stage.fire('pointerleave', undefined, false);

    assert.equal(stageLeave, 1, 'stage pointerleave should fire');
  });

  it('stage pointerleave should not fire when leaving a child', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      fill: 'red',
      radius: 30,
      x: 50,
      y: 50,
    });
    layer.add(circle);
    layer.draw();

    var stageLeave = 0;
    var circleLeave = 0;
    stage.on('pointerleave', function () {
      stageLeave += 1;
    });
    circle.on('pointerleave', function () {
      circleLeave += 1;
    });

    simulatePointerMove(stage, { x: 50, y: 50 });
    simulatePointerMove(stage, { x: 90, y: 50 });

    assert.equal(circleLeave, 1, 'circle pointerleave should fire');
    assert.equal(stageLeave, 0, 'stage pointerleave should not fire');
  });

  it('toDataURL with hidden layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'red',
      radius: 50,
    });
    layer.add(circle);
    stage.add(layer);

    var stageDataUrl = stage.toDataURL();
    layer.visible(false);
    assert.equal(stage.toDataURL() === stageDataUrl, false);
  });

  it('toDataURL matches native encoding, including JPEG quality zero', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'red',
      radius: 50,
    });
    layer.add(circle);
    stage.add(layer);

    assert.equal(stage.toDataURL(), stage.toCanvas().toDataURL());
    for (const quality of [0, 0.5, 1]) {
      assert.equal(
        stage.toDataURL({ mimeType: 'image/jpeg', quality }),
        stage.toCanvas().toDataURL('image/jpeg', quality)
      );
    }
  });

  it('toDataURL should no relate on stage size', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'red',
      radius: stage.height() * 0.6,
    });
    layer.add(circle);
    stage.add(layer);

    const canvas1 = stage.toCanvas(circle.getClientRect());
    const canvas2 = circle.toCanvas();

    compareCanvases(canvas1, canvas2, 100, 200);
  });

  it('toCanvas with large size', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var radius = stage.height() / 2 + 10;
    var circle = new Konva.Circle({
      x: stage.height() / 2,
      y: stage.height() / 2,
      fill: 'black',
      radius: radius,
    });
    layer.add(circle);
    stage.add(layer);

    var stageCanvas = stage.toCanvas({
      x: -10,
      y: -10,
      width: stage.height() + 20,
      height: stage.height() + 20,
    });

    const { canvas, context } = createCanvasAndContext();
    canvas.width = radius * 2;
    canvas.height = radius * 2;
    context.beginPath();
    context.arc(radius, radius, radius, 0, 2 * Math.PI);
    context.fillStyle = 'black';
    context.fill();
    compareCanvases(stageCanvas, canvas, 100, 20);
  });

  it('toImage with large size', async function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var radius = stage.height() / 2 + 10;
    var circle = new Konva.Circle({
      x: stage.height() / 2,
      y: stage.height() / 2,
      fill: 'black',
      radius: radius,
    });
    layer.add(circle);
    stage.add(layer);

    if (isBrowser) {
      try {
        const img = await stage.toImage({
          x: -10,
          y: -10,
          width: stage.height() + 20,
          height: stage.height() + 20,
          callback: (img) =>
            assert.isTrue(img instanceof Image, 'not an image'),
        });
        assert.isTrue(img instanceof Image, 'not an image');
      } catch (e) {
        console.error(e);
        assert.fail('error creating image');
      }
    }
  });

  it('toBlob with large size', async function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var radius = stage.height() / 2 + 10;
    var circle = new Konva.Circle({
      x: stage.height() / 2,
      y: stage.height() / 2,
      fill: 'black',
      radius: radius,
    });
    layer.add(circle);
    stage.add(layer);

    if (isBrowser) {
      try {
        const blob = await stage.toBlob({
          x: -10,
          y: -10,
          width: stage.height() + 20,
          height: stage.height() + 20,
          callback: (blob) =>
            assert.isTrue(
              blob instanceof Blob && blob.size > 0,
              'blob is empty'
            ),
        });
        assert.isTrue(blob instanceof Blob && blob.size > 0, 'blob is empty');
      } catch (e) {
        console.error(e);
        assert.fail('error creating blob');
      }
    }
  });

  it('toBlob with mimeType option using', async function () {
    const stage = addStage();
    const layer = new Konva.Layer();

    stage.add(layer);

    if (isBrowser) {
      try {
        const blob = await stage.toBlob({
          mimeType: 'image/jpeg',
          quality: 0.5,
        });
        assert.isTrue(
          blob instanceof Blob && blob.type === 'image/jpeg',
          "can't change type of blob"
        );
      } catch (e) {
        console.error(e);
        assert.fail('error creating blob');
      }
    }
  });
  it('toBlob rejects when the canvas can not be encoded', async function () {
    const stage = addStage();
    const original = stage.toCanvas;
    stage.toCanvas = function () {
      return { toBlob: (callback) => callback(null) } as any;
    };
    let error: Error | null = null;
    try {
      await stage.toBlob();
    } catch (e) {
      error = e as Error;
    } finally {
      stage.toCanvas = original;
    }
    assert.isNotNull(error, 'toBlob() resolved instead of rejecting');
    assert.match(error!.message, /toBlob\(\) failed/);
  });

  it('check hit graph with stage listening property', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    showHit(layer);
    var circle = new Konva.Circle({
      fill: 'green',
      radius: 50,
    });
    layer.add(circle);

    var pos = {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };
    circle.position(pos);
    stage.draw();

    // try to detect circle via hit graph
    assert.equal(stage.getIntersection(pos), circle, 'has circle');

    // disable hit graph
    stage.listening(false);
    stage.draw();
    assert.equal(!!stage.getIntersection(pos), false, 'no circle');

    // enable it again
    stage.listening(true);
    stage.draw();
    assert.equal(stage.getIntersection(pos), circle, 'circle again');
  });

  it('toDataURL should use pixelRatio 1 by default', function (done) {
    var stage = addStage();

    var url = stage.toDataURL();
    var image = Konva.Util.createImageElement();
    image.onload = function () {
      assert.equal(image.width, stage.width());
      assert.equal(image.height, stage.height());
      done();
    };
    image.src = url;
  });

  it('show a warning if the stage has too many layers', function () {
    var stage = addStage();
    var oldWarn = Konva.Util.warn;
    var called = false;
    Konva.Util.warn = function () {
      called = true;
    };

    // let say 5 is max number
    stage.add(new Konva.Layer());
    stage.add(new Konva.Layer());
    stage.add(new Konva.Layer());
    stage.add(new Konva.Layer());
    stage.add(new Konva.Layer());
    stage.add(new Konva.Layer());
    stage.add(new Konva.Layer());

    Konva.Util.warn = oldWarn;
    assert.equal(called, true);
  });

  // ======================================================
  it('buffer canvases are allocated lazily, on first use', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect);
    layer.draw();

    assert.equal(stage.bufferCanvas.width, 0, 'buffer canvas not allocated');
    assert.equal(
      stage.bufferHitCanvas.width,
      0,
      'buffer hit canvas not allocated'
    );

    // shape.intersects() is the feature that needs the buffer hit canvas
    assert.equal(rect.intersects({ x: 20, y: 20 }), true);
    assert.equal(
      stage.bufferHitCanvas.width,
      stage.width(),
      'buffer hit canvas allocated by intersects()'
    );

    // "perfect drawing" (fill + stroke + opacity) needs the buffer canvas
    rect.stroke('black');
    rect.opacity(0.5);
    layer.draw();
    assert.equal(
      stage.bufferCanvas.width,
      stage.width() * stage.bufferCanvas.pixelRatio,
      'buffer canvas allocated by perfect drawing'
    );

    // after a stage resize an allocated buffer re-syncs on next use
    stage.width(stage.width() + 50);
    assert.equal(rect.intersects({ x: 20, y: 20 }), true);
    assert.equal(
      stage.bufferHitCanvas.width,
      stage.width(),
      'buffer hit canvas follows the stage size'
    );
  });

  it('toCanvas() releases the intermediate layer canvases', function () {
    var stage = addStage();
    var layer1 = new Konva.Layer();
    var layer2 = new Konva.Layer();
    layer1.add(
      new Konva.Rect({ x: 20, y: 20, width: 100, height: 100, fill: 'red' })
    );
    layer2.add(new Konva.Circle({ x: 120, y: 120, radius: 50, fill: 'blue' }));
    stage.add(layer1, layer2);

    let exported;
    const allocations = collectCanvasAllocations(() => {
      exported = stage.toCanvas();
    });
    assert.equal(allocations.length, 3, 'export canvas and one per layer');
    allocations.forEach(({ canvas }) => {
      if (canvas._canvas !== exported) {
        assert.equal(canvas._canvas.width, 0, 'layer canvas is released');
      }
    });
  });

  it('toCanvas() keeps a globalCompositeOperation inside its layer, like on screen', function () {
    var stage = addStage();
    var background = new Konva.Layer();
    var drawing = new Konva.Layer();
    background.add(new Konva.Rect({ width: 200, height: 200, fill: 'red' }));
    drawing.add(new Konva.Rect({ width: 200, height: 200, fill: 'blue' }));
    // an eraser: must not punch through the background layer
    drawing.add(
      new Konva.Circle({
        x: 100,
        y: 100,
        radius: 50,
        fill: 'black',
        globalCompositeOperation: 'destination-out',
      })
    );
    stage.add(background, drawing);

    var pixel = stage
      .toCanvas()
      .getContext('2d')!
      .getImageData(100, 100, 1, 1).data;
    assert.deepEqual(Array.from(pixel), [255, 0, 0, 255]);
  });

  it('destroy() closes the double-click window it opened', function () {
    var stage = addStage();
    stage.add(new Konva.Layer());
    simulateMouseDown(stage, { x: 10, y: 10 });
    simulateMouseUp(stage, { x: 10, y: 10 });
    stage.destroy();

    var stage2 = addStage();
    stage2.add(new Konva.Layer());
    var dblclicks = 0;
    stage2.on('dblclick', () => dblclicks++);
    simulateMouseDown(stage2, { x: 10, y: 10 });
    simulateMouseUp(stage2, { x: 10, y: 10 });
    assert.equal(dblclicks, 0);
  });
});

describe('Stage lifecycle', function () {
  it('getPointerPosition returns null after leaving the stage', function () {
    const stage = addStage();
    stage._pointerleave({ type: 'mouseleave', clientX: 600, clientY: 20 });
    assert.isNull(stage.getPointerPosition());
  });

  it('destroy removes content from an already detached container', function () {
    if (isNode) return;
    const stage = addStage();
    const container = stage.container();
    container.remove();
    stage.destroy();
    assert.equal(container.children.length, 0);
  });
});
