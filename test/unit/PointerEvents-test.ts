import { assert } from 'chai';

import {
  addStage,
  isNode,
  Konva,
  simulatePointerDown,
  simulatePointerMove,
  simulatePointerUp,
  simulateTouchStart,
  simulateTouchMove,
  simulateTouchEnd,
  simulateMouseMove,
  simulateMouseUp,
  simulateMouseDown,
} from './test-utils.ts';

describe('PointerEvents', function () {
  it('dragging with two held mouse buttons cancels the original native pointer click', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({
      width: 100,
      height: 100,
      fill: 'red',
      draggable: true,
    });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const clicks: string[] = [];
    stage.on('click pointerclick', (e) => clicks.push(e.type));
    simulateMouseDown(stage, { x: 20, y: 20 });
    const secondButton = {
      clientX: 20,
      clientY: 20 + (isNode ? 0 : stage.content.getBoundingClientRect().top),
      button: 2,
      buttons: 3,
    };
    simulatePointerMove(stage, { x: 20, y: 20 });
    stage._pointerdown({ ...secondButton, type: 'mousedown' } as MouseEvent);
    simulateMouseMove(stage, { x: 30, y: 20 });
    const release = {
      ...secondButton,
      clientX: 30,
      type: 'mouseup',
      buttons: 1,
    };
    simulatePointerMove(stage, { x: 30, y: 20 });
    Konva.DD._endDragBefore(release);
    stage._pointerup(release);
    Konva.DD._endDragAfter(release);
    simulateMouseUp(stage, { x: 30, y: 20 });
    assert.deepEqual(clicks, []);
  });

  for (const { move, hover } of [
    { move: false, hover: false },
    { move: true, hover: false },
    { move: false, hover: true },
  ]) {
    it(`a programmatic drag cancels clicks ${move ? 'with' : 'without'} movement${hover ? ' after hovering' : ''}`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
      stage.add(layer);
      layer.add(rect);
      layer.draw();
      const clicks: string[] = [];
      stage.on('click pointerclick', (e) => clicks.push(e.type));
      if (hover) simulateMouseMove(stage, { x: 20, y: 20 });
      rect.startDrag();
      simulateMouseDown(stage, { x: 20, y: 20 });
      if (move) simulateMouseMove(stage, { x: 30, y: 20 });
      simulateMouseUp(stage, { x: move ? 30 : 20, y: 20 });
      assert.deepEqual(
        rect.position(),
        move ? { x: 30, y: 20 } : { x: 0, y: 0 }
      );
      assert.deepEqual(clicks, []);
    });
  }

  for (const hover of ['none', 'mouse', 'pointer']) {
    it(`a programmatic drag cancels a native click without compatibility mouse events after ${hover} hover`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
      stage.add(layer);
      layer.add(rect);
      layer.draw();
      const clicks: string[] = [];
      stage.on('pointerclick', (e) => clicks.push(e.type));
      if (hover === 'mouse') simulateMouseMove(stage, { x: 20, y: 20 });
      if (hover === 'pointer') simulatePointerMove(stage, { x: 20, y: 20 });
      rect.startDrag();
      simulatePointerDown(stage, { x: 20, y: 20 });
      simulatePointerUp(stage, { x: 20, y: 20 });
      assert.isTrue(rect.isDragging());
      rect.stopDrag();
      assert.deepEqual(clicks, []);
    });
  }

  for (const withEvent of [true, false]) {
    it(`a drag started in a pointerdown handler ${withEvent ? 'with' : 'without'} its event follows the mouse`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
      stage.add(layer);
      layer.add(rect);
      layer.draw();
      const events: string[] = [];
      rect.on('pointerdown', (e) => rect.startDrag(withEvent ? e : undefined));
      rect.on('dragstart dragmove dragend', (e) => events.push(e.type));
      simulateMouseDown(stage, { x: 20, y: 20 });
      simulateMouseMove(stage, { x: 30, y: 25 });
      simulateMouseUp(stage, { x: 30, y: 25 });
      assert.deepEqual(rect.position(), { x: 10, y: 5 });
      assert.deepEqual(events, ['dragstart', 'dragmove', 'dragend']);
      assert.isFalse(rect.isDragging());
      assert.equal(Konva.DD._dragElements.size, 0);
    });
  }

  it('a drag started in a pointerdown handler follows touch events', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const events: string[] = [];
    rect.on('pointerdown', (e) => rect.startDrag(e));
    rect.on('dragstart dragmove dragend', (e) => events.push(e.type));
    const touch = { x: 20, y: 20, id: 0, pointerId: 10, pointerType: 'touch' };
    const moved = { ...touch, x: 30, y: 25 };
    simulatePointerDown(stage, touch);
    simulateTouchStart(stage, [touch], [touch]);
    simulateTouchMove(stage, [moved], [moved]);
    simulateTouchEnd(stage, [], [moved]);
    assert.deepEqual(rect.position(), { x: 10, y: 5 });
    assert.deepEqual(events, ['dragstart', 'dragmove', 'dragend']);
    assert.isFalse(rect.isDragging());
    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('a drag started in a pointerdown handler ends without movement and cancels the click', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const clicks: string[] = [];
    stage.on('click pointerclick', (e) => clicks.push(e.type));
    rect.on('pointerdown', (e) => rect.startDrag(e));
    simulateMouseDown(stage, { x: 20, y: 20 });
    simulateMouseUp(stage, { x: 20, y: 20 });
    assert.deepEqual(rect.position(), { x: 0, y: 0 });
    assert.deepEqual(clicks, []);
    assert.isFalse(rect.isDragging());
    assert.equal(Konva.DD._dragElements.size, 0);
  });

  it('delivers deferred hover exits after a drag leaves and reenters the stage', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({
      width: 40,
      height: 40,
      fill: 'red',
      draggable: true,
    });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const calls: string[] = [];
    rect.on(
      'mouseenter mouseout mouseleave pointerenter pointerout pointerleave',
      (e) => calls.push(e.type)
    );
    simulateMouseMove(stage, { x: 20, y: 20 });
    simulateMouseDown(stage, { x: 20, y: 20 });
    simulateMouseMove(stage, { x: 30, y: 20 });
    simulateMouseMove(stage, { x: 600, y: 20 });
    const outside = {
      clientX: 600,
      clientY: 20 + (isNode ? 0 : stage.content.getBoundingClientRect().top),
    };
    stage._pointerleave({ ...outside, type: 'pointerleave', pointerId: 1 });
    stage._pointerleave({ ...outside, type: 'mouseleave' });
    assert.deepEqual(calls, ['pointerenter', 'mouseenter']);
    const release = { ...outside, type: 'mouseup' };
    Konva.DD._endDragBefore(release);
    Konva.DD._endDragAfter(release);
    simulateMouseMove(stage, { x: 200, y: 20 });
    assert.deepEqual(calls, [
      'pointerenter',
      'mouseenter',
      'pointerout',
      'pointerleave',
      'mouseout',
      'mouseleave',
    ]);
  });

  it('stopping a pending mouse drag cancels both click event families', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({
      width: 40,
      height: 40,
      fill: 'red',
      draggable: true,
    });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const clicks: string[] = [];
    stage.on('click pointerclick', (e) => clicks.push(e.type));
    simulateMouseDown(stage, { x: 20, y: 20 });
    rect.stopDrag();
    simulateMouseUp(stage, { x: 20, y: 20 });
    assert.deepEqual(clicks, []);
  });

  it('native pointer cancellation also cancels the associated touch tap', function () {
    const stage = addStage();
    const taps: number[] = [];
    stage.on('tap', (e) => taps.push(e.pointerId));
    const touch = { x: 20, y: 20, id: 0, pointerId: 10, pointerType: 'touch' };
    simulatePointerDown(stage, touch);
    simulateTouchStart(stage, [touch], [touch]);
    stage._pointercancel({
      type: 'pointercancel',
      pointerId: 10,
    } as PointerEvent);
    simulateTouchEnd(stage, [], [touch]);
    assert.deepEqual(taps, []);
  });

  it('a mouse drag suppresses its native click when compatibility coordinates are rounded', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(
      new Konva.Rect({ width: 40, height: 40, fill: 'red', draggable: true })
    );
    layer.draw();
    const clicks: string[] = [];
    stage.on('click pointerclick', (e) => clicks.push(e.type));
    simulatePointerDown(stage, { x: 20.5, y: 20.5 });
    stage._pointerdown({
      type: 'mousedown',
      clientX: 20,
      clientY: 20 + (isNode ? 0 : stage.content.getBoundingClientRect().top),
    } as MouseEvent);
    simulateMouseMove(stage, { x: 40, y: 20 });
    simulateMouseUp(stage, { x: 40, y: 20 });
    assert.deepEqual(clicks, []);
  });

  it('ending a drag preserves a new touch at the original press position', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(
      new Konva.Rect({ width: 40, height: 40, fill: 'red', draggable: true })
    );
    layer.draw();
    const clicks: number[] = [];
    stage.on('pointerclick', (e) => clicks.push(e.pointerId));
    const first = { x: 20, y: 20, id: 0, pointerId: 10, pointerType: 'touch' };
    const moved = { ...first, x: 80 };
    const second = { ...first, id: 1, pointerId: 11 };
    simulatePointerDown(stage, first);
    simulateTouchStart(stage, [first], [first]);
    simulatePointerMove(stage, moved);
    simulateTouchMove(stage, [moved], [moved]);
    simulatePointerDown(stage, second);
    simulateTouchStart(stage, [moved, second], [second]);
    simulatePointerUp(stage, moved);
    simulateTouchEnd(stage, [second], [moved]);
    simulatePointerUp(stage, second);
    simulateTouchEnd(stage, [], [second]);
    assert.deepEqual(clicks, [11]);
  });

  it('leaving and reentering a stage preserves an active press', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const calls: string[] = [];
    rect.on('pointerenter pointerleave pointerclick', (e) =>
      calls.push(e.type)
    );
    const pointer = { x: 20, y: 20, pointerId: 1 };
    simulatePointerMove(stage, pointer);
    simulatePointerDown(stage, pointer);
    stage._pointerleave({ type: 'pointerleave', pointerId: 1 });
    simulatePointerMove(stage, pointer);
    simulatePointerUp(stage, pointer);
    assert.deepEqual(calls, [
      'pointerenter',
      'pointerleave',
      'pointerenter',
      'pointerclick',
    ]);
  });

  for (const drag of [false, true]) {
    it(`a touch pointer leaves its hovered shape after ${drag ? 'dragging' : 'a tap'}`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      const rect = new Konva.Rect({
        width: 40,
        height: 40,
        fill: 'red',
        draggable: drag,
      });
      stage.add(layer);
      layer.add(rect);
      layer.draw();
      const calls: string[] = [];
      rect.on('pointerup pointerout pointerleave', (e) => calls.push(e.type));
      const pointer = {
        x: 20,
        y: 20,
        id: 0,
        pointerId: 1,
        pointerType: 'touch',
      };
      simulatePointerMove(stage, pointer);
      simulatePointerDown(stage, pointer);
      simulateTouchStart(stage, [pointer], [pointer]);
      if (drag) {
        pointer.x = 30;
        simulatePointerMove(stage, pointer);
        simulateTouchMove(stage, [pointer], [pointer]);
        assert.isTrue(rect.isDragging());
      }
      simulatePointerUp(stage, pointer);
      stage._pointerleave({
        type: 'pointerleave',
        pointerId: 1,
        pointerType: 'touch',
      });
      simulateTouchEnd(stage, [], [pointer]);
      assert.deepEqual(calls, ['pointerup', 'pointerout', 'pointerleave']);
    });
  }

  it('preserves pointer ID zero in events and capture', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const calls: number[] = [];
    rect.on('pointerdown', () => rect.setPointerCapture(0));
    rect.on('pointerdown pointermove pointerup', (e) =>
      calls.push(e.pointerId)
    );
    simulatePointerDown(stage, { x: 20, y: 20, pointerId: 0 });
    simulatePointerMove(stage, { x: 80, y: 80, pointerId: 0 });
    simulatePointerUp(stage, { x: 80, y: 80, pointerId: 0 });
    assert.deepEqual(calls, [0, 0, 0]);
    assert.isFalse(rect.hasPointerCapture(0));
  });

  it('a touch drag suppresses its native pointer click and preserves another touch click', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const dragged = new Konva.Rect({
      width: 40,
      height: 40,
      fill: 'red',
      draggable: true,
    });
    const tapped = new Konva.Rect({
      x: 100,
      width: 40,
      height: 40,
      fill: 'blue',
    });
    stage.add(layer);
    layer.add(dragged, tapped);
    layer.draw();
    const clicks: number[] = [];
    stage.on('pointerclick', (e) => clicks.push(e.pointerId));
    const first = { x: 20, y: 20, id: 0, pointerId: 10, pointerType: 'touch' };
    const second = {
      x: 120,
      y: 20,
      id: 1,
      pointerId: 11,
      pointerType: 'touch',
    };
    const moved = { ...first, x: 40 };
    simulatePointerDown(stage, first);
    simulateTouchStart(stage, [first], [first]);
    simulatePointerDown(stage, second);
    simulateTouchStart(stage, [first, second], [second]);
    simulatePointerMove(stage, moved);
    simulateTouchMove(stage, [moved, second], [moved]);
    simulatePointerUp(stage, moved);
    simulateTouchEnd(stage, [second], [moved]);
    simulatePointerUp(stage, second);
    simulateTouchEnd(stage, [], [second]);
    assert.deepEqual(clicks, [11]);
  });

  for (const touchId of [1, 999]) {
    it(`a touch drag with identifier ${touchId} preserves mouse movement and clicks`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      const dragged = new Konva.Rect({
        width: 40,
        height: 40,
        fill: 'red',
        draggable: true,
      });
      const clicked = new Konva.Rect({
        x: 100,
        width: 40,
        height: 40,
        fill: 'blue',
      });
      stage.add(layer);
      layer.add(dragged, clicked);
      layer.draw();
      const clicks: string[] = [];
      clicked.on('click pointerclick', (e) => clicks.push(e.type));
      const touch = {
        x: 20,
        y: 20,
        id: touchId,
        pointerId: 10,
        pointerType: 'touch',
      };
      const moved = { ...touch, x: 40 };
      simulatePointerDown(stage, touch);
      simulateTouchStart(stage, [touch], [touch]);
      simulatePointerMove(stage, moved);
      simulateTouchMove(stage, [moved], [moved]);
      simulateMouseMove(stage, { x: 120, y: 20 });
      simulateMouseDown(stage, { x: 120, y: 20 });
      simulateMouseUp(stage, { x: 120, y: 20 });
      assert.isTrue(dragged.isDragging());
      assert.deepEqual(dragged.position(), { x: 20, y: 0 });
      simulatePointerUp(stage, moved);
      simulateTouchEnd(stage, [], [moved]);
      assert.deepEqual(clicks, ['pointerclick', 'click']);
    });
  }

  it('cancelling one pointer clears its gesture and preserves another pointer', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({ width: 100, height: 100, fill: 'red' });
    stage.add(layer);
    layer.add(rect);
    layer.draw();
    const clicks: number[] = [];
    const enters: number[] = [];
    rect.on('pointerclick', (e) => clicks.push(e.pointerId));
    rect.on('pointerenter', (e) => enters.push(e.pointerId));
    const first = { x: 20, y: 20, pointerId: 1 };
    const second = { x: 40, y: 40, pointerId: 2 };
    simulatePointerMove(stage, first);
    simulatePointerDown(stage, first);
    rect.setPointerCapture(1);
    simulatePointerDown(stage, second);
    stage._pointercancel({
      type: 'pointercancel',
      pointerId: 1,
    } as PointerEvent);
    assert.isFalse(rect.hasPointerCapture(1));
    stage._pointerleave({ type: 'pointerleave', pointerId: 1 });
    simulatePointerMove(stage, first);
    simulatePointerUp(stage, first);
    simulatePointerUp(stage, second);
    assert.deepEqual(enters, [1, 1]);
    assert.deepEqual(clicks, [2]);
  });

  it('a late capture loss on one stage preserves capture on another stage', function () {
    const first = addStage();
    const second = addStage();
    first.setPointerCapture(1);
    second.setPointerCapture(1);
    first._lostpointercapture({ pointerId: 1 } as PointerEvent);
    assert.isTrue(second.hasPointerCapture(1));
    second._lostpointercapture({ pointerId: 1 } as PointerEvent);
    assert.isFalse(second.hasPointerCapture(1));
  });

  it('hover targets belong to each pointer', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const first = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    const second = new Konva.Rect({
      x: 60,
      width: 40,
      height: 40,
      fill: 'blue',
    });
    layer.add(first, second);
    layer.draw();
    const calls: string[] = [];
    first.on('pointerover pointerout pointermove', (e) =>
      calls.push(`first:${e.type}:${e.pointerId}`)
    );
    second.on('pointerover pointerout pointermove', (e) =>
      calls.push(`second:${e.type}:${e.pointerId}`)
    );
    simulatePointerMove(stage, { x: 20, y: 20, pointerId: 1 });
    simulatePointerMove(stage, { x: 80, y: 20, pointerId: 2 });
    simulatePointerMove(stage, { x: 21, y: 20, pointerId: 1 });
    assert.deepEqual(calls, [
      'first:pointerover:1',
      'first:pointermove:1',
      'second:pointerover:2',
      'second:pointermove:2',
      'first:pointermove:1',
    ]);
  });
  // ======================================================
  it('pointerdown pointerup pointermove', function (done) {
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

    // mobile events
    var pointerdown = false;
    var pointerup = false;
    var pointermove = false;

    /*
     * mobile
     */
    circle.on('pointerdown', function () {
      pointerdown = true;
    });

    circle.on('pointerup', function () {
      pointerup = true;
    });

    circle.on('pointermove', function () {
      pointermove = true;
    });

    layer.add(circle);
    stage.add(layer);

    // touchstart circle
    simulatePointerDown(stage, {
      x: 289,
      y: 100,
    });

    assert(pointerdown, '1) pointerdown should be true');
    assert(!pointermove, '1) pointermove should be false');
    assert(!pointerup, '1) pointerup should be false');

    // pointerup circle
    simulatePointerUp(stage, {
      x: 289,
      y: 100,
    });

    assert(pointerdown, '2) pointerdown should be true');
    assert(!pointermove, '2) pointermove should be false');
    assert(pointerup, '2) pointerup should be true');

    // pointerdown circle
    simulatePointerDown(stage, {
      x: 289,
      y: 100,
    });

    assert(pointerdown, '3) pointerdown should be true');
    assert(!pointermove, '3) pointermove should be false');
    assert(pointerup, '3) pointerup should be true');

    // pointerup circle to triger dbltap
    simulatePointerUp(stage, {
      x: 289,
      y: 100,
    });
    // end drag is tied to document mouseup and pointerup event
    // which can't be simulated.  call _endDrag manually
    //Konva.DD._endDrag();

    assert(pointerdown, '4) pointerdown should be true');
    assert(!pointermove, '4) pointermove should be false');
    assert(pointerup, '4) pointerup should be true');

    setTimeout(function () {
      // pointermove circle
      simulatePointerMove(stage, {
        x: 290,
        y: 100,
      });

      assert(pointerdown, '5) pointerdown should be true');
      assert(pointermove, '5) pointermove should be true');
      assert(pointerup, '5) pointerup should be true');

      done();
    }, 17);
  });

  // ======================================================
  it('capture routes only the captured pointer and ends on release', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const first = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    const second = new Konva.Rect({
      x: 60,
      width: 40,
      height: 40,
      fill: 'blue',
    });
    layer.add(first, second);
    layer.draw();
    const calls: string[] = [];
    first.on('pointerdown', (e) => first.setPointerCapture(e.pointerId));
    first.on('pointermove pointerup', (e) =>
      calls.push(`first:${e.type}:${e.pointerId}`)
    );
    second.on('pointerdown pointermove', (e) =>
      calls.push(`second:${e.type}:${e.pointerId}`)
    );
    simulatePointerDown(stage, { x: 20, y: 20, pointerId: 1 });
    simulatePointerDown(stage, { x: 80, y: 20, pointerId: 2 });
    simulatePointerMove(stage, { x: 80, y: 20, pointerId: 1 });
    simulatePointerUp(stage, { x: 80, y: 20, pointerId: 1 });
    assert.isFalse(first.hasPointerCapture(1));
    simulatePointerMove(stage, { x: 80, y: 20, pointerId: 1 });
    simulatePointerUp(stage, { x: 80, y: 20, pointerId: 2 });
    assert.deepEqual(calls, [
      'second:pointerdown:2',
      'first:pointermove:1',
      'first:pointerup:1',
      'second:pointermove:1',
    ]);
  });
});

// https://github.com/konvajs/konva/issues/1992
// setPointerCapture must also capture the pointer on the stage container, so
// the stage keeps receiving the pointer's events outside of its bounds — like
// pointer capture on plain HTML elements
describe('PointerEvents capture wiring', function () {
  it('a captured shape moved between stages stays the same hover target', function () {
    const first = addStage();
    const second = addStage();
    const firstLayer = new Konva.Layer();
    const secondLayer = new Konva.Layer();
    first.add(firstLayer);
    second.add(secondLayer);
    const rect = new Konva.Rect({ width: 100, height: 100, fill: 'red' });
    firstLayer.add(rect);
    const calls: string[] = [];
    rect.on('pointerenter pointermove', (e) => calls.push(e.type));
    rect.setPointerCapture(1);
    simulatePointerMove(first, { x: 20, y: 20 });
    rect.moveTo(secondLayer);
    simulatePointerMove(first, { x: 30, y: 20 });
    simulatePointerMove(first, { x: 35, y: 20 });
    assert.deepEqual(calls, [
      'pointerenter',
      'pointermove',
      'pointermove',
      'pointermove',
    ]);
    rect.releaseCapture(1);
  });

  it('destroying the native capture stage releases a shape moved elsewhere', function () {
    const first = addStage();
    const second = addStage();
    const firstLayer = new Konva.Layer();
    const secondLayer = new Konva.Layer();
    first.add(firstLayer);
    second.add(secondLayer);
    const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
    firstLayer.add(rect);
    rect.setPointerCapture(1);
    rect.moveTo(secondLayer);
    first.destroy();
    assert.isFalse(rect.hasPointerCapture(1));
    assert.equal(rect.getStage(), second);
  });

  for (const detach of [false, true]) {
    it(`capture loss uses the original stage after a shape is ${detach ? 'detached' : 'moved to another stage'}`, function () {
      const first = addStage();
      const second = addStage();
      const firstLayer = new Konva.Layer();
      const secondLayer = new Konva.Layer();
      first.add(firstLayer);
      second.add(secondLayer);
      const rect = new Konva.Rect({ width: 40, height: 40, fill: 'red' });
      firstLayer.add(rect);
      const released: string[] = [];
      if (!isNode) {
        first.content.releasePointerCapture = () => released.push('first');
        second.content.releasePointerCapture = () => released.push('second');
      }
      rect.setPointerCapture(1);
      if (detach) rect.remove();
      else rect.moveTo(secondLayer);
      second._lostpointercapture({ pointerId: 1 } as PointerEvent);
      assert.isTrue(rect.hasPointerCapture(1));
      first._lostpointercapture({ pointerId: 1 } as PointerEvent);
      assert.isFalse(rect.hasPointerCapture(1));
      if (!isNode) assert.deepEqual(released, ['first']);
      rect.destroy();
    });
  }

  it('setPointerCapture captures and releases on the stage container', function () {
    if (isNode) {
      // no DOM pointer capture in node environments
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'red',
    });
    layer.add(circle);
    stage.add(layer);

    var captured: number[] = [];
    var released: number[] = [];
    var gotCapture = 0;
    var lostCapture = 0;
    stage.content.setPointerCapture = function (id: number) {
      captured.push(id);
    };
    stage.content.releasePointerCapture = function (id: number) {
      released.push(id);
    };
    var capturePointerIds: number[] = [];
    circle.on('gotpointercapture', function (e) {
      gotCapture += 1;
      capturePointerIds.push(e.pointerId);
    });
    circle.on('lostpointercapture', function (e) {
      lostCapture += 1;
      capturePointerIds.push(e.pointerId);
    });

    circle.setPointerCapture(5);
    assert.deepEqual(captured, [5], 'should capture on the container');
    assert.equal(circle.hasPointerCapture(5), true);
    assert.equal(gotCapture, 1);

    circle.releaseCapture(5);
    assert.deepEqual(released, [5], 'should release on the container');
    assert.equal(circle.hasPointerCapture(5), false);
    assert.equal(lostCapture, 1);
    assert.deepEqual(capturePointerIds, [5, 5]);
  });

  it('capture still registers when the container throws for an inactive pointer', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      radius: 70,
      fill: 'red',
    });
    layer.add(circle);
    stage.add(layer);

    // the real DOM throws NotFoundError for a pointer id that is not active,
    // e.g. the fake id 999 of mouse events
    stage.content.setPointerCapture = function () {
      throw new Error('NotFoundError');
    };
    stage.content.releasePointerCapture = function () {
      throw new Error('NotFoundError');
    };

    circle.setPointerCapture(999);
    assert.equal(
      circle.hasPointerCapture(999),
      true,
      'internal capture must still work'
    );
    circle.releaseCapture(999);
    assert.equal(circle.hasPointerCapture(999), false);
  });

  it('destroying a captured shape or stage releases its capture', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle);

    circle.setPointerCapture(5);
    assert.equal(circle.hasPointerCapture(5), true);
    circle.destroy();
    assert.equal(circle.hasPointerCapture(5), false);

    var circle2 = new Konva.Circle({ x: 50, y: 50, radius: 20 });
    layer.add(circle2);
    circle2.setPointerCapture(6);
    stage.setPointerCapture(7);
    stage.destroy();
    assert.equal(circle2.hasPointerCapture(6), false);
    assert.equal(stage.hasPointerCapture(7), false);
  });
});
