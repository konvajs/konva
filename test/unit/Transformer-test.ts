import { assert } from 'chai';
import { Transformer } from '../../src/shapes/Transformer';

import {
  addStage,
  isNode,
  Konva,
  simulateMouseDown as sd,
  simulateMouseMove as sm,
  simulateMouseUp as su,
  assertAlmostEqual,
} from './test-utils';

function simulateMouseDown(tr, pos) {
  sd(tr.getStage(), pos);
}

function simulateMouseMove(tr, pos) {
  const stage = tr.getStage();
  var top = (stage.content && stage.content.getBoundingClientRect().top) || 0;
  tr._handleMouseMove({
    ...pos,
    clientX: pos.x,
    clientY: pos.y + top,
  });
  sm(stage, pos);
}

function simulateMouseUp(tr: Transformer, pos = { x: 0, y: 0 }) {
  const stage = tr.getStage();
  var top = (stage.content && stage.content.getBoundingClientRect().top) || 0;
  tr._handleMouseUp({
    clientX: pos.x,
    clientY: pos.y + top,
  });
  su(tr.getStage(), pos || { x: 1, y: 1 });
}

describe('Transformer', function () {
  // ======================================================
  it('init transformer on simple rectangle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), rect.x());
    assert.equal(tr.y(), rect.y());
    assert.equal(tr.width(), rect.width());
    assert.equal(tr.height(), rect.height());

    // manual check of correct position of node
    var handler = tr.findOne('.bottom-right');
    var pos = handler.getAbsolutePosition();
    assert.equal(pos.x, rect.x() + rect.width());
    assert.equal(pos.y, rect.y() + rect.height());
  });

  it('can attach transformer into several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 10,
      y: 10,
      draggable: true,
      width: 100,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 110,
      y: 60,
      draggable: true,
      width: 100,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);

    layer.draw();
    assert.equal(tr.x(), rect1.x());
    assert.equal(tr.y(), rect1.y());
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.height());
    assert.equal(tr.rotation(), 0);
  });

  it('try set/get node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var circle = new Konva.Circle({
      x: 10,
      y: 60,
      radius: 100,
      fill: 'red',
    });
    layer.add(circle);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();
    assert.equal(tr.nodes()[0], rect);

    tr.nodes([circle]);
    assert.equal(tr.nodes()[0], circle);
    layer.draw();
  });

  it('try to fit simple rectangle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 120,
      y: 60,
      width: 50,
      height: 50,
      rotation: Konva.getAngle(45),
    });

    assert.equal(tr.x(), rect.x());
    assert.equal(Math.round(tr.y()), rect.y());
    assert.equal(tr.width(), 50);
    assert.equal(tr.height(), 50);
    assert.equal(tr.rotation(), rect.rotation());
  });

  it('try to fit simple rotated rectangle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 150,
      fill: 'yellow',
      rotation: 45,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 50,
      y: 50,
      width: 100,
      height: 150,
      rotation: Konva.getAngle(45),
    });

    assertAlmostEqual(rect.x(), 50);
    assertAlmostEqual(rect.y(), 50);
    assertAlmostEqual(tr.width(), 100);
    assertAlmostEqual(tr.height(), 150);
    assertAlmostEqual(tr.rotation(), rect.rotation());
  });

  it('transformer should follow rotation on single node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    rect.rotation(45);
    layer.draw();

    assert.equal(tr.rotation(), 45);
  });

  it('try to fit simple rotated rectangle in group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      rotation: 45,
      x: 50,
      y: 50,
    });
    layer.add(group);

    var rect = new Konva.Rect({
      draggable: true,
      width: 100,
      height: 150,
      fill: 'yellow',
    });
    group.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 50,
      y: 50,
      width: 100,
      height: 150,
      rotation: 0,
    });

    assertAlmostEqual(rect.x(), 0);
    assertAlmostEqual(rect.y(), 0);
    assertAlmostEqual(tr.width(), 100);
    assertAlmostEqual(tr.height(), 150);
    assertAlmostEqual(rect.rotation(), -45);
  });

  it('transformer should follow rotation on single node inside group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      rotation: 45,
    });
    layer.add(group);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    group.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    group.add(tr);

    layer.draw();

    rect.rotation(45);
    layer.draw();

    assertAlmostEqual(tr.rotation(), 90);
  });

  it('try to fit simple rotated rectangle - 2', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 200,
      fill: 'yellow',
      rotation: 45,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 40,
      y: 40,
      width: 100,
      height: 100,
      rotation: 0,
    });

    assertAlmostEqual(rect.x(), 40);
    assertAlmostEqual(rect.y(), 40);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.height(), 200);
    assertAlmostEqual(rect.scaleY(), 0.5);
    assertAlmostEqual(rect.rotation(), 0);
  });

  it('rotate around center', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 200,
      fill: 'yellow',
      rotation: 45,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 40,
      y: 40,
      width: 100,
      height: 100,
      rotation: 0,
    });

    assertAlmostEqual(rect.x(), 40);
    assertAlmostEqual(rect.y(), 40);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.height(), 200);
    assertAlmostEqual(rect.scaleY(), 0.5);
    assertAlmostEqual(rect.rotation(), 0);
  });

  it('change transform of parent', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    assert.equal(tr.x(), 50, 'first x');

    stage.scaleX(2);
    stage.scaleY(2);

    // check attrs
    assert.equal(tr.x(), 100, 'second x');
    assert.equal(tr.width(), 200);
    // check visual
    var pos = tr.findOne('.top-right').getAbsolutePosition();
    assert.equal(pos.x, 300);

    stage.draw();
  });

  it('rotated inside scaled (in one direction) parent', function () {
    var stage = addStage();
    stage.scaleX(2);
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();
    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 50,
      height: 50,
      rotation: Konva.getAngle(45),
    });

    assert.equal(rect.x(), 50);
    assert.equal(rect.skewX(), 0.75);
    assert.equal(rect.skewY(), 0);
  });

  it('try to fit rectangle with skew', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      skewX: 0.5,
      scaleX: 2,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 120,
      y: 60,
      width: 50,
      height: 50,
      rotation: Konva.getAngle(45),
    });

    assert.equal(tr.x(), rect.x());
    assert.equal(Math.round(tr.y()), rect.y());
    assert.equal(tr.width(), 50);
    assert.equal(tr.height(), 50);
    assert.equal(tr.rotation(), rect.rotation());
    assertAlmostEqual(rect.skewX(), 0.2);
  });

  it('try to resize in draggable stage', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    var dragstart = 0;
    var dragmove = 0;
    var dragend = 0;
    stage.on('dragstart', function () {
      dragstart += 1;
    });
    stage.on('dragmove', function () {
      dragmove += 1;
    });
    stage.on('dragend', function () {
      dragend += 1;
    });

    simulateMouseDown(tr, {
      x: 50,
      y: 50,
    });
    simulateMouseMove(tr, {
      x: 60,
      y: 60,
    });
    assert.equal(stage.isDragging(), false);
    assert.equal(dragstart, 0);
    simulateMouseUp(tr, { x: 60, y: 60 });
    assert.equal(dragmove, 0);
    assert.equal(dragend, 0);

    simulateMouseDown(tr, {
      x: 40,
      y: 40,
    });
    sm(stage, {
      x: 45,
      y: 45,
    });
    sm(stage, {
      x: 50,
      y: 50,
    });
    assert.equal(stage.isDragging(), true);
    assert.equal(stage.x(), 10);
    assert.equal(stage.y(), 10);
    su(stage, {
      x: 45,
      y: 45,
    });
  });

  it('try to fit simple rectangle into negative scale', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    var box = {
      x: 100,
      y: 0,
      width: -100,
      height: 100,
      rotation: 0,
    };

    tr._fitNodesInto(box);

    assertAlmostEqual(rect.x(), 100);
    assertAlmostEqual(rect.y(), 0);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.scaleY(), -1);
    assertAlmostEqual(rect.rotation(), -180);

    layer.draw();
  });
  it('try to fit rectangle with ignoreStroke = false', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 20,
      y: 20,
      width: 100,
      height: 100,
      fill: 'green',
      stroke: 'rgba(0,0,0,0.5)',
      strokeWidth: 40,
      name: 'myCircle',
      draggable: true,
      strokeScaleEnabled: false,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      ignoreStroke: true,
    });
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 20,
      y: 20,
      width: 200,
      height: 200,
      rotation: 0,
    });

    assertAlmostEqual(rect.x(), 20);
    assertAlmostEqual(rect.y(), 20);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.scaleX(), 2);
  });

  it('listen shape changes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    rect.setAttrs({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });
    layer.draw();
    assert.equal(tr.x(), rect.x());
    assert.equal(tr.y(), rect.y());
    assert.equal(tr.width(), rect.width());
    assert.equal(tr.height(), rect.height());
    assert.equal(tr.findOne('.back').width(), rect.width());
  });

  it('add transformer for transformed rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 150,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      rotation: 90,
      scaleY: 1.5,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    layer.draw();

    assert.equal(tr.x(), rect.x());
    assert.equal(tr.y(), rect.y());
    assert.equal(tr.width(), rect.width() * rect.scaleX());
    assert.equal(tr.height(), rect.height() * rect.scaleY());
    assert.equal(tr.rotation(), rect.rotation());
  });

  it('try to fit a transformed rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 150,
      y: 60,
      draggable: true,
      width: 150,
      height: 100,
      fill: 'yellow',
      rotation: 90,
      scaleY: 1.5,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 70,
      width: 100,
      height: 100,
      rotation: 0,
    });

    assertAlmostEqual(rect.x(), 100);
    assertAlmostEqual(rect.y(), 70);
    assertAlmostEqual(rect.width() * rect.scaleX(), 100);
    assertAlmostEqual(rect.height() * rect.scaleY(), 100);
    assertAlmostEqual(rect.rotation(), rect.rotation());
  });

  it('add transformer for transformed rect with offset', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 100,
      height: 100,
      scaleX: 2,
      scaleY: 2,
      fill: 'yellow',
      offsetX: 50,
      offsetY: 50,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), rect.width() * rect.scaleX());
    assert.equal(tr.height(), rect.height() * rect.scaleY());
    assert.equal(tr.rotation(), rect.rotation());
  });

  it('fit rect with offset', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      offsetX: 50,
      offsetY: 50,
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    tr._fitNodesInto({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      rotation: 0,
    });
    layer.draw();

    assertAlmostEqual(rect.x(), 100);
    assertAlmostEqual(rect.y(), 50);
    assertAlmostEqual(rect.width() * rect.scaleX(), 200);
    assertAlmostEqual(rect.height() * rect.scaleY(), 100);
    assertAlmostEqual(rect.rotation(), rect.rotation());

    assertAlmostEqual(tr.x(), 0);
    assertAlmostEqual(tr.y(), 0);
    assertAlmostEqual(tr.width(), 200);
    assertAlmostEqual(tr.height(), 100);
    assertAlmostEqual(rect.rotation(), rect.rotation());
  });

  it('add transformer for circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      draggable: true,
      radius: 40,
      fill: 'yellow',
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([circle]);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), circle.width() * circle.scaleX());
    assert.equal(tr.height(), circle.height() * circle.scaleY());
    assert.equal(tr.rotation(), circle.rotation());
  });

  it('fit a circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      draggable: true,
      radius: 40,
      fill: 'yellow',
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([circle]);

    tr._fitNodesInto({
      x: 40,
      y: 40,
      width: 160,
      height: 80,
      rotation: 0,
    });
    layer.draw();

    assert.equal(circle.x(), 120);
    assert.equal(circle.y(), 80);
    assert.equal(circle.width() * circle.scaleX(), 160);
    assert.equal(circle.height() * circle.scaleY(), 80);

    assert.equal(tr.x(), 40);
    assert.equal(tr.y(), 40);
    assert.equal(tr.width(), 160);
    assert.equal(tr.height(), 80);
  });

  it('fit a rotated circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      draggable: true,
      radius: 40,
      fill: 'yellow',
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([circle]);

    tr._fitNodesInto({
      x: 80,
      y: 0,
      width: 80,
      height: 80,
      rotation: Konva.getAngle(90),
    });
    layer.draw();

    assertAlmostEqual(circle.x(), 40);
    assertAlmostEqual(circle.y(), 40);
    assertAlmostEqual(circle.width() * circle.scaleX(), 80);
    assertAlmostEqual(circle.height() * circle.scaleY(), 80);
    assertAlmostEqual(circle.rotation(), 90);

    assertAlmostEqual(tr.x(), 80);
    assertAlmostEqual(tr.y(), 0);
    assertAlmostEqual(tr.width(), 80);
    assertAlmostEqual(tr.height(), 80);
  });

  it('add transformer for transformed circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      draggable: true,
      radius: 40,
      fill: 'yellow',
      scaleX: 1.5,
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([circle]);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), 40);
    assert.equal(tr.y(), 60);
    assert.equal(tr.width(), 120);
    assert.equal(tr.height(), 80);
    assert.equal(tr.rotation(), 0);
  });

  it('add transformer for rotated circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      draggable: true,
      radius: 40,
      fill: 'yellow',
      scaleX: 1.5,
      rotation: 90,
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([circle]);

    layer.draw();

    assert.equal(tr.x(), 140);
    assert.equal(tr.y(), 40);
    assert.equal(tr.width(), 120);
    assert.equal(tr.height(), 80);
    assert.equal(tr.rotation(), circle.rotation());
  });

  it('add transformer to group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 50,
      y: 50,
      draggable: true,
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      radius: 100,
      fill: 'red',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      radius: 100,
      fill: 'yellow',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([group]);

    layer.draw();

    assert.equal(tr.x(), group.x());
    assert.equal(tr.y(), group.y());
    assert.equal(tr.width(), 150);
    assert.equal(tr.height(), 150);
    assert.equal(tr.rotation(), 0);
  });

  it('rotated fit group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      fill: 'red',
      x: -50,
      y: -50,
      width: 50,
      height: 50,
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      fill: 'yellow',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([group]);

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90),
    });
    layer.draw();

    var rect = group.getClientRect();

    assertAlmostEqual(group.x(), 50);
    assertAlmostEqual(group.y(), 50);
    assertAlmostEqual(rect.width, 100);
    assertAlmostEqual(rect.height, 100);
    assertAlmostEqual(group.rotation(), 90);

    assertAlmostEqual(tr.x(), 100);
    assertAlmostEqual(tr.y(), 0);
    assertAlmostEqual(tr.width(), 100);
    assertAlmostEqual(tr.height(), 100);
  });

  it('add transformer to another group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      fill: 'red',
      x: -50,
      y: -50,
      width: 50,
      height: 50,
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      fill: 'yellow',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([group]);

    layer.draw();

    assert.equal(tr.x(), 50);
    assert.equal(tr.y(), 50);
    assert.equal(tr.width(), 100);
    assert.equal(tr.height(), 100);
    assert.equal(tr.rotation(), 0);
  });

  it('fit group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      fill: 'red',
      x: -50,
      y: -50,
      width: 50,
      height: 50,
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      fill: 'yellow',
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([group]);

    tr._fitNodesInto({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      rotation: 0,
    });
    layer.draw();

    var rect = group.getClientRect();

    assertAlmostEqual(group.x(), 100);
    assertAlmostEqual(group.y(), 50);
    assertAlmostEqual(rect.width, 200);
    assertAlmostEqual(rect.height, 100);

    assertAlmostEqual(tr.x(), 0);
    assertAlmostEqual(tr.y(), 0);
    assertAlmostEqual(tr.width(), 200);
    assertAlmostEqual(tr.height(), 100);
  });

  it('toJSON should not save attached node and children', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([rect]);

    layer.draw();

    var json = tr.toJSON();
    var object = JSON.parse(json);

    assert.equal(object.attrs.node, undefined);
    assert.equal(object.children, undefined);
  });

  it('make sure we can work without inner node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var tr = new Konva.Transformer();
    layer.add(tr);
    layer.draw();

    // just check not throw
    assert.equal(1, 1);
  });

  it('reset attrs on node set', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    layer.draw();

    assert.equal(tr.getWidth(), 0);

    tr.nodes([rect]);
    assert.equal(tr.getWidth(), 100);
  });

  it('can destroy without attached node', function () {
    var tr = new Konva.Transformer();
    tr.destroy();
    // just check not throw
    assert.equal(1, 1);
  });

  it('can destroy with attached node while resize', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 100,
      y: 60,
    });

    assert.equal(tr.isTransforming(), true);

    tr.destroy();

    assert.equal(tr.isTransforming(), false);

    assert.equal(tr.getNode(), undefined);

    su(stage, {
      x: 100,
      y: 60,
    });
  });

  it('can add padding', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 30,
      y: 30,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      padding: 20,
    });
    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 10,
      y: 80,
    });

    simulateMouseMove(tr, {
      x: 60,
      y: 80,
    });

    simulateMouseUp(tr, {
      x: 200,
      y: 150,
    });

    assertAlmostEqual(rect.x(), 80);
    assertAlmostEqual(rect.y(), 30);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.5);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.scaleY(), 1);
  });

  it('keep ratio should allow negative scaling', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 150,
      y: 10,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    var anchor = tr.findOne('.top-right');
    var pos = anchor.getAbsolutePosition();

    simulateMouseDown(tr, {
      x: pos.x,
      y: pos.y,
    });
    simulateMouseMove(tr, {
      x: pos.x - 100,
      y: pos.y + 100,
    });
    simulateMouseUp(tr, {
      x: pos.x - 100,
      y: pos.y + 100,
    });

    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.scaleY(), 1);
    assertAlmostEqual(rect.rotation(), -180);
  });

  it('slightly move for cache check (top-left anchor)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 20,
      y: 20,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    var anchor = tr.findOne('.top-left');
    assertAlmostEqual(anchor.getAbsolutePosition().x, 20);

    simulateMouseDown(tr, {
      x: 20,
      y: 20,
    });

    simulateMouseMove(tr, {
      x: 20,
      y: 20,
    });

    simulateMouseUp(tr);
    layer.draw();

    assertAlmostEqual(rect.x(), 20);
    assertAlmostEqual(rect.y(), 20);
  });

  it('rotation snaps', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      rotationSnaps: [0, 90, 180, 270],
      rotationSnapTolerance: 45,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 100,
      y: 0,
    });

    // move to almost 45 deg
    simulateMouseMove(tr, {
      x: 199,
      y: 0,
    });
    assert.equal(rect.rotation(), 0);

    // move to more than 45 deg
    simulateMouseMove(tr, {
      x: 200,
      y: 2,
    });
    assert.equal(rect.rotation(), 90);

    simulateMouseMove(tr, {
      x: 200,
      y: 199,
    });
    assert.equal(rect.rotation(), 90);

    simulateMouseMove(tr, {
      x: 199,
      y: 200,
    });
    assert.equal(rect.rotation(), 180);

    simulateMouseMove(tr, {
      x: 1,
      y: 200,
    });
    assert.equal(rect.rotation(), 180);

    simulateMouseMove(tr, {
      x: 0,
      y: 199,
    });
    assertAlmostEqual(rect.rotation(), -90);

    simulateMouseMove(tr, {
      x: 0,
      y: 50,
    });
    assertAlmostEqual(rect.rotation(), -90);
    simulateMouseMove(tr, {
      x: 0,
      y: 45,
    });
    assertAlmostEqual(rect.rotation(), -90);

    simulateMouseMove(tr, {
      x: 0,
      y: 1,
    });
    assertAlmostEqual(rect.rotation(), -90);

    simulateMouseMove(tr, {
      x: 1,
      y: 0,
    });
    assert.equal(rect.rotation(), 0);

    simulateMouseUp(tr);
  });

  it('switch scaling with padding - x', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      padding: 10,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 0,
      y: 60,
    });

    simulateMouseMove(tr, {
      x: 125,
      y: 60,
    });

    assertAlmostEqual(rect.x(), 115);
    assertAlmostEqual(rect.y(), 10);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.05);
    assertAlmostEqual(rect.scaleY(), -1);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), -180);

    simulateMouseMove(tr, {
      x: 125,
      y: 60,
    });

    assertAlmostEqual(rect.x(), 115);
    assertAlmostEqual(rect.y(), 10);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.05);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.scaleY(), -1);

    // switch again
    simulateMouseMove(tr, {
      x: 90,
      y: 60,
    });

    assertAlmostEqual(rect.x(), 100);
    assertAlmostEqual(rect.y(), 10);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleY(), 1);
    assertAlmostEqual(rect.scaleX(), 0.1);
    assertAlmostEqual(rect.height(), 100);

    simulateMouseUp(tr);
  });

  it('switch scaling with padding - y', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      padding: 10,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 60,
      y: 0,
    });

    simulateMouseMove(tr, {
      x: 60,
      y: 125,
    });

    assertAlmostEqual(rect.x(), 10);
    assertAlmostEqual(rect.y(), 115);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleY(), -0.05);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 0);

    simulateMouseMove(tr, {
      x: 60,
      y: 125,
    });

    assertAlmostEqual(rect.x(), 10);
    assertAlmostEqual(rect.y(), 115);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleY(), -0.05);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 0);

    // switch again
    simulateMouseMove(tr, {
      x: 60,
      y: 90,
    });

    assertAlmostEqual(rect.x(), 10);
    assertAlmostEqual(rect.y(), 100);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.scaleY(), 0.1);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 0);

    simulateMouseUp(tr);
  });

  it('switch horizontal scaling with (top-left anchor)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 0,
      y: 0,
    });

    simulateMouseMove(tr, {
      x: 150,
      y: 50,
    });
    layer.draw();

    assertAlmostEqual(rect.x(), 150);
    assertAlmostEqual(rect.y(), 50);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.5);
    assertAlmostEqual(rect.scaleY(), -0.5);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), -180);

    simulateMouseMove(tr, {
      x: 98,
      y: 2.859375,
    });
    simulateMouseMove(tr, {
      x: 98,
      y: 2.859375,
    });
    simulateMouseMove(tr, {
      x: 98,
      y: 2.859375,
    });
    simulateMouseMove(tr, {
      x: 100,
      y: 2.859375,
    });
    layer.draw();
    simulateMouseMove(tr, {
      x: 101,
      y: 2.859375,
    });
    layer.draw();
    simulateMouseMove(tr, {
      x: 101,
      y: 2.859375,
    });
    layer.draw();
    simulateMouseMove(tr, {
      x: 101,
      y: 2.859375,
    });
    layer.draw();
    simulateMouseMove(tr, {
      x: 102,
      y: 2.859375,
    });
    layer.draw();
    // switch again
    simulateMouseMove(tr, {
      x: 0,
      y: 0,
    });

    assertAlmostEqual(rect.x(), 0);
    assertAlmostEqual(rect.y(), 0);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleY(), 1);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.height(), 100);

    simulateMouseUp(tr);
  });

  it('switch vertical scaling with (top-left anchor)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 0,
      y: 0,
    });

    simulateMouseMove(tr, {
      x: 0,
      y: 200,
    });
    layer.draw();

    assertAlmostEqual(rect.x(), 0);
    assertAlmostEqual(rect.y(), 200);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 0);

    simulateMouseMove(tr, {
      x: 0,
      y: 0,
    });
    layer.draw();
    simulateMouseUp(tr);

    assertAlmostEqual(rect.x(), 0);
    assertAlmostEqual(rect.y(), 0);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 0);
    assertAlmostEqual(rect.scaleY(), 1);
  });

  it('switch scaling with padding for rotated - x', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 110,
      y: 10,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      rotation: 90,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      padding: 10,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 60,
      y: 0,
    });

    simulateMouseMove(tr, {
      x: 60,
      y: 125,
    });

    assertAlmostEqual(rect.x(), 110);
    assertAlmostEqual(rect.y(), 115);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.05);
    assertAlmostEqual(rect.scaleY(), -1);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), -90);

    simulateMouseMove(tr, {
      x: 60,
      y: 125,
    });

    assertAlmostEqual(rect.x(), 110);
    assertAlmostEqual(rect.y(), 115);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.05);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.scaleY(), -1);

    layer.draw();

    // switch again
    simulateMouseMove(tr, {
      x: 60,
      y: 90,
    });

    assertAlmostEqual(rect.x(), 110);
    assertAlmostEqual(rect.y(), 100);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 0.1);
    assertAlmostEqual(rect.scaleY(), 1);

    assertAlmostEqual(rect.height(), 100);

    simulateMouseUp(tr);
  });

  it('switch scaling with padding for rotated - y', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 110,
      y: 10,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      rotation: 90,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      padding: 10,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 0,
      y: 60,
    });

    simulateMouseMove(tr, {
      x: 125,
      y: 60,
    });

    assertAlmostEqual(rect.x(), 110);
    assertAlmostEqual(rect.y(), 10);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.scaleY(), -0.05);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 90);

    simulateMouseMove(tr, {
      x: 125,
      y: 60,
    });

    assertAlmostEqual(rect.x(), 110);
    assertAlmostEqual(rect.y(), 10);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.scaleY(), -0.05);
    assertAlmostEqual(rect.height(), 100);
    assertAlmostEqual(rect.rotation(), 90);

    // switch again
    simulateMouseMove(tr, {
      x: 90,
      y: 60,
    });

    assertAlmostEqual(rect.x(), 110);
    assertAlmostEqual(rect.y() - 120 < 0.001, true);
    assertAlmostEqual(rect.width(), 100);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.scaleY(), 0.1);
    assertAlmostEqual(rect.height(), 100);

    simulateMouseUp(tr);
  });

  it('transformer should automatically track attr changes of a node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    assert.equal(tr.x(), 100);
    assert.equal(tr.y(), 60);
    assert.equal(tr.width(), 100);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    rect.x(0);
    assert.equal(tr.x(), 0);

    rect.y(0);
    assert.equal(tr.y(), 0);

    rect.width(50);
    assert.equal(tr.width(), 50);

    rect.height(50);
    assert.equal(tr.height(), 50);

    rect.scaleX(2);
    assert.equal(tr.width(), 100);

    rect.scaleY(2);
    assert.equal(tr.height(), 100);

    // manual check position
    var back = tr.findOne('.back');
    assert.equal(back.getAbsolutePosition().x, 0);

    layer.batchDraw();
  });

  it('on detach should remove all listeners', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    tr.detach();

    rect.width(200);
    assert.equal(tr.width(), 0);
    layer.draw();

    var called = false;
    // clear cache is called on each update
    // make sure we don't call it
    tr._clearCache = function () {
      called = true;
    };
    rect.width(50);
    assert.equal(called, false, 'don not call clear cache');
  });

  it('check transformer with drag&drop', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      draggable: true,
    });

    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 20,
      y: 20,
    });

    sm(stage, {
      x: 30,
      y: 30,
    });

    su(stage, {
      x: 30,
      y: 30,
    });

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 10);

    assert.equal(tr.x(), 10);
    assert.equal(tr.y(), 10);
  });

  it('check transformer with drag&drop and scaled shape', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      draggable: true,
      scaleX: 2,
    });

    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 20,
      y: 20,
    });

    sm(stage, {
      x: 30,
      y: 30,
    });

    layer.draw();

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 10);

    assert.equal(tr.x(), 10);
    assert.equal(tr.y(), 10);

    assert.equal(tr.width(), 200);

    su(stage, {
      x: 30,
      y: 30,
    });
  });

  it('try rotate scaled rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 150,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      scaleY: -1,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    var rotater = tr.findOne('.rotater');
    var pos = rotater.getAbsolutePosition();

    simulateMouseDown(tr, {
      x: pos.x,
      y: pos.y,
    });
    simulateMouseMove(tr, {
      x: pos.x + 100,
      y: pos.y + 100,
    });
    simulateMouseUp(tr, {
      x: pos.x + 100,
      y: pos.y + 100,
    });

    assert.equal(rect.rotation(), 90);
  });

  it('check correct cursor on scaled shape', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 100,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      scaleY: -1,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    sm(stage, {
      x: 50,
      y: 1,
    });
    assert.equal(stage.content.style.cursor, 'nwse-resize');
  });

  it('check correct cursor off on Transformer destroy', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    sm(stage, {
      x: 100,
      y: 100,
    });
    simulateMouseDown(tr, {
      x: 100,
      y: 100,
    });

    assert.equal(stage.content.style.cursor, 'nwse-resize');

    var target = stage.getIntersection({
      x: 100,
      y: 100,
    });
    simulateMouseMove(tr, {
      x: 120,
      y: 100,
    });

    // here is duplicate, because transformer is listening window events
    simulateMouseUp(tr, {
      x: 120,
      y: 100,
    });
    su(stage, {
      x: 120,
      y: 100,
    });

    tr.destroy();
    sm(stage, {
      x: 140,
      y: 100,
    });
    assert.equal(stage.content.style.cursor, '');
  });

  it('check correct cursor on scaled parent', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer({
      y: 100,
      scaleY: -1,
    });
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    sm(stage, {
      x: 50,
      y: 1,
    });
    assert.equal(stage.content.style.cursor, 'nwse-resize');
  });

  it('check default cursor transformer', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    sm(stage, {
      x: 100,
      y: 0,
    });
    assert.equal(stage.content.style.cursor, 'crosshair');
  });

  it('using custom cursor on configured transformer should show custom cursor instead of crosshair', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      rotateAnchorCursor: 'grab',
    });
    layer.add(tr);
    layer.draw();

    sm(stage, {
      x: 100,
      y: 0,
    });
    assert.equal(stage.content.style.cursor, 'grab');
  });

  it('changing parent transform should recalculate transformer attrs', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    layer.scaleX(2);

    layer.draw();

    assert.equal(tr.width(), 200);
  });

  it('check fit and correct cursor on rotated parent', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer({
      x: 100,
      y: -50,
      rotation: 90,
    });
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    var box = {
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90),
    };
    tr._fitNodesInto(box);

    assert.equal(Math.round(tr.x()), Math.round(box.x));
    assert.equal(Math.round(tr.y()), Math.round(box.y));
    assert.equal(Math.round(tr.width()), Math.round(box.width));
    assert.equal(Math.round(tr.height()), Math.round(box.height));

    sm(stage, {
      x: 50,
      y: 1,
    });
    assert.equal(stage.content.style.cursor, 'ns-resize');
  });

  it('check drag with transformer', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 50,
      y: 50,
    });

    sm(stage, {
      x: 55,
      y: 50,
    });
    sm(stage, {
      x: 60,
      y: 50,
    });

    su(stage, {
      x: 60,
      y: 50,
    });

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 0);
  });

  it('stopTransform method', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 50,
      y: 50,
    });

    simulateMouseMove(tr, {
      x: 60,
      y: 60,
    });

    assert.equal(tr.isTransforming(), true);
    assert.equal(rect.x(), 60);

    var transformend = 0;
    rect.on('transformend', function () {
      transformend += 1;
    });

    tr.stopTransform();

    assert.equal(transformend, 1);

    assert.equal(tr.isTransforming(), false);
    assert.equal(rect.x(), 60);

    // here is duplicate, because transformer is listening window events
    su(stage, {
      x: 100,
      y: 100,
    });
  });

  it('transform events check', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    var callCount = 0;
    rect.on('transformstart', function (e) {
      callCount += 1;
      assert.equal(e.target, rect);
      assert.equal(tr.getActiveAnchor(), 'top-left');
      assert.equal(typeof e.evt.clientX === 'number', true);
    });

    rect.on('transform', function (e) {
      callCount += 1;
      assert.equal(e.target, rect);
      assert.equal(tr.getActiveAnchor(), 'top-left');
    });

    rect.on('transformend', function (e) {
      callCount += 1;
      assert.equal(e.target, rect);
      assert.equal(tr.getActiveAnchor(), 'top-left');
    });

    tr.on('transformstart', function (e) {
      callCount += 1;
      assert.equal(e.target, rect);
    });

    tr.on('transform', function (e) {
      callCount += 1;
      assert.equal(e.target, rect);
    });

    tr.on('transformend', function (e) {
      callCount += 1;
      assert.equal(e.target, rect);
    });

    simulateMouseDown(tr, {
      x: 50,
      y: 50,
    });

    simulateMouseMove(tr, {
      x: 60,
      y: 60,
    });

    simulateMouseUp(tr, {
      x: 60,
      y: 60,
    });

    assert.equal(callCount, 6);
    assert.equal(tr.getActiveAnchor(), null);
  });

  it('on force update should clear transform', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 50,
      y: 50,
    });
    layer.add(group);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.nodes([group]);

    layer.draw();

    assert.equal(tr._cache.get('transform').m[4], 50);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    group.add(rect);

    tr.forceUpdate();
    layer.draw();

    assert.equal(tr._cache.get('transform').m[4], 100);

    // tr._fitNodesInto({
    //   x: 100,
    //   y: 70,
    //   width: 100,
    //   height: 100
    // });

    // assert.equal(rect.x(), 100);
    // assert.equal(rect.y(), 70);
    // assert.equal(rect.width() * rect.scaleX(), 100);
    // assert.equal(rect.height() * rect.scaleY(), 100);
    // assert.equal(rect.rotation(), rect.rotation());
  });

  it('test cache reset on attach', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 20,
      y: 20,
      draggable: true,
      width: 150,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);

    // make draw to set all caches
    layer.draw();
    // then attach
    tr.nodes([rect]);

    layer.draw();

    var shape = layer.getIntersection({
      x: 20,
      y: 20,
    });
    assert.equal(shape.name(), 'top-left _anchor');
  });

  it('check rotator size on scaled transformer', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      scaleX: 10,
      scaleY: 10,
    });
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 5,
      y: 16,
      draggable: true,
      width: 10,
      height: 10,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    var rotater = tr.findOne('.rotater');
    var pos = rotater.getAbsolutePosition();

    // pos.x === (x * scaleX - (height))
    assert.equal(pos.x, 100);

    // pos.y === (y * scaleY - (height * scaleY / 2))
    assert.equal(pos.y, 110);
  });

  var tests = [
    {
      name: 'top-left',
      startPos: {
        x: 0,
        y: 0,
      },
      endPos: {
        x: 25,
        y: 25,
      },
      expectedWidth: 50,
      expectedHeight: 50,
    },
    {
      name: 'top-center',
      startPos: {
        x: 50,
        y: 0,
      },
      endPos: {
        x: 50,
        y: 25,
      },
      expectedWidth: 100,
      expectedHeight: 50,
    },
    {
      name: 'top-right',
      startPos: {
        x: 100,
        y: 0,
      },
      endPos: {
        x: 75,
        y: 25,
      },
      expectedWidth: 50,
      expectedHeight: 50,
    },
    {
      name: 'middle-left',
      startPos: {
        x: 0,
        y: 50,
      },
      endPos: {
        x: 25,
        y: 50,
      },
      expectedWidth: 50,
      expectedHeight: 100,
    },
    {
      name: 'middle-right',
      startPos: {
        x: 100,
        y: 50,
      },
      endPos: {
        x: 75,
        y: 50,
      },
      expectedWidth: 50,
      expectedHeight: 100,
    },
    {
      name: 'bottom-left',
      startPos: {
        x: 0,
        y: 100,
      },
      endPos: {
        x: 25,
        y: 75,
      },
      expectedWidth: 50,
      expectedHeight: 50,
    },
    {
      name: 'bottom-center',
      startPos: {
        x: 50,
        y: 100,
      },
      endPos: {
        x: 50,
        y: 75,
      },
      expectedWidth: 100,
      expectedHeight: 50,
    },
    {
      name: 'bottom-right',
      startPos: {
        x: 100,
        y: 100,
      },
      endPos: {
        x: 75,
        y: 75,
      },
      expectedWidth: 50,
      expectedHeight: 50,
    },
    // {
    //   name: 'top-left-reverse',
    //   startPos: {
    //     x: 0,
    //     y: 0
    //   },
    //   endPos: {
    //     x: 100,
    //     y: 100
    //   },
    //   expectedWidth: 100,
    //   expectedHeight: 100
    // }
  ];

  it('if alt is pressed should transform around center', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    tests.forEach(function (test) {
      rect.setAttrs({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
      });
      tr.update();

      layer.draw();

      simulateMouseDown(tr, test.startPos);

      var target = stage.getIntersection(test.startPos);
      simulateMouseMove(tr, {
        target: target,
        x: test.endPos.x,
        y: test.endPos.y,
        altKey: true,
      });

      // here is duplicate, because transformer is listening window events
      simulateMouseUp(tr, {
        x: test.endPos.x,
        y: test.endPos.y,
      });
      su(stage, {
        x: test.endPos.x,
        y: test.endPos.y,
      });
      layer.draw();

      assertAlmostEqual(rect.width() * rect.scaleX(), test.expectedWidth);
      assertAlmostEqual(rect.height() * rect.scaleY(), test.expectedHeight);
    });
  });

  it('centered scaling - no keep ratio', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      centeredScaling: true,
      keepRatio: false,
    });
    layer.add(tr);

    tests.forEach(function (test) {
      rect.setAttrs({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
      });
      tr.update();

      layer.draw();

      simulateMouseDown(tr, test.startPos);

      var target = stage.getIntersection(test.startPos);
      simulateMouseMove(tr, {
        target: target,
        x: test.endPos.x,
        y: test.endPos.y,
      });

      // here is duplicate, because transformer is listening window events
      simulateMouseUp(tr, {
        x: test.endPos.x,
        y: test.endPos.y,
      });
      su(stage, {
        x: test.endPos.x,
        y: test.endPos.y,
      });
      layer.draw();

      assertAlmostEqual(rect.width() * rect.scaleX(), test.expectedWidth);
      assertAlmostEqual(rect.height() * rect.scaleY(), test.expectedHeight);
    });
  });

  it('centered scaling', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      centeredScaling: true,
    });
    layer.add(tr);

    tests.forEach(function (test) {
      rect.setAttrs({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
      });
      tr.update();

      layer.draw();

      simulateMouseDown(tr, test.startPos);

      var target = stage.getIntersection(test.startPos);
      simulateMouseMove(tr, {
        target: target,
        x: test.endPos.x,
        y: test.endPos.y,
      });

      // here is duplicate, because transformer is listening window events
      simulateMouseUp(tr, {
        x: test.endPos.x,
        y: test.endPos.y,
      });
      su(stage, {
        x: test.endPos.x,
        y: test.endPos.y,
      });
      layer.draw();

      assertAlmostEqual(rect.width() * rect.scaleX(), test.expectedWidth);
      assertAlmostEqual(rect.height() * rect.scaleY(), test.expectedHeight);
    });
  });

  it('centered scaling on flip + keep ratio', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      centeredScaling: true,
      keepRatio: true,
    });
    layer.add(tr);

    // try to move mouse from edge corners into different directions
    var tl = { x: 0, y: 0 };
    var trr = { x: 200, y: 0 };
    var bl = { x: 0, y: 100 };
    var br = { x: 200, y: 100 };

    var tests = [
      [tl, trr],
      [tl, bl],
      [tl, br],
      [trr, tl],
      [trr, bl],
      [trr, br],

      [bl, tl],
      [bl, trr],
      [bl, br],

      [br, tl],
      [br, trr],
      [br, bl],
    ];
    tests.forEach((test) => {
      var start = test[0];
      var end = test[1];
      rect.setAttrs({
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      });
      layer.draw();

      // move from start to end
      simulateMouseDown(tr, start);
      simulateMouseMove(tr, end);
      var box = rect.getClientRect();
      assertAlmostEqual(box.x, 0);
      assertAlmostEqual(box.y, 0);
      assertAlmostEqual(box.width, 200);
      assertAlmostEqual(box.height, 100);

      // make extra move on end
      simulateMouseMove(tr, end);
      var box = rect.getClientRect();
      assertAlmostEqual(box.x, 0);
      assertAlmostEqual(box.y, 0);
      assertAlmostEqual(box.width, 200);
      assertAlmostEqual(box.height, 100);

      // move back
      simulateMouseMove(tr, start);
      simulateMouseUp(tr);
      assertAlmostEqual(box.x, 0);
      assertAlmostEqual(box.y, 0);
      assertAlmostEqual(box.width, 200);
      assertAlmostEqual(box.height, 100);
    });
  });

  it('transform scaled (in one direction) node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      x: 150,
      y: 50,
      width: 100,
      height: 100,
      scaleX: -1,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 100, y: 100 },
      fillLinearGradientColorStops: [0, 'red', 0.8, 'yellow'],
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 150,
      y: 150,
    });

    var target = stage.getIntersection({
      x: 150,
      y: 150,
    });
    simulateMouseMove(tr, {
      x: 100,
      y: 100,
    });

    // here is duplicate, because transformer is listening window events
    simulateMouseUp(tr, {
      x: 100,
      y: 100,
    });
    su(stage, {
      x: 100,
      y: 100,
    });
    layer.draw();

    assert.equal(rect.width() * rect.scaleX() - 50 < 1, true, ' width check');
    assert.equal(rect.height() * rect.scaleY() + 50 < 1, true, ' height check');
  });

  it('transformer should ignore shadow', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      shadowBlur: 10,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    assert.equal(tr.x(), 50);
    assert.equal(tr.y(), 50);

    assert.equal(tr.width(), 100);
    assert.equal(tr.height(), 100);

    tr._fitNodesInto({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
    });

    assert.equal(rect.x(), 50);
    assert.equal(rect.y(), 50);

    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
  });

  it.skip('transformer should skip scale on stroke if strokeScaleEnabled = false', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 10,
      height: 10,
      scaleX: 10,
      scaleY: 10,
      fill: 'yellow',
      strokeWidth: 10,
      stroke: 'red',
      strokeScaleEnabled: false,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      ignoreStroke: true,
    });
    layer.add(tr);
    layer.draw();

    assert.equal(tr.x(), 50);
    assert.equal(tr.y(), 50);

    assert.equal(tr.width(), 100);
    assert.equal(tr.height(), 100);

    tr._fitNodesInto({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
    });

    assert.equal(rect.x(), 50);
    assert.equal(rect.y(), 50);

    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
  });

  it.skip('check calculations when the size = 0', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      // can we fit from empty width?
      width: 0,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
    });
    layer.draw();
    assert.equal(rect.scaleX(), 1);
  });

  it('attrs change - arc', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Arc({
      x: stage.width() / 2,
      y: stage.height() / 2,
      innerRadius: 40,
      outerRadius: 70,
      angle: 60,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    layer.draw();

    shape.outerRadius(100);

    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
    layer.draw();
  });

  it('attrs change - line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Arrow({
      x: stage.width() / 4,
      y: stage.height() / 4,
      points: [0, 0, stage.width() / 2, stage.height() / 2],
      pointerLength: 20,
      pointerWidth: 20,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    layer.draw();

    shape.points([10, 10, 100, 10]);
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    layer.draw();
    assert.deepEqual(shape.getClientRect(), rect);

    shape.strokeWidth(10);
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    layer.draw();
    assert.deepEqual(shape.getClientRect(), rect);
  });

  it('attrs change - circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 40,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.radius(100);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  it('attrs change - ellipse', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Ellipse({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radiusX: 100,
      radiusY: 50,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.radiusX(120);

    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    shape.radiusY(100);
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    layer.draw();
  });

  it('attrs change - rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Rect({
      x: stage.width() / 2,
      y: stage.height() / 2,
      width: 100,
      height: 100,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.width(120);

    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    shape.height(110);
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    layer.draw();
  });

  it('attrs change - path', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Path({
      x: 50,
      y: 40,
      data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
      fill: 'green',
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.data('M200,100h100v50z');
    layer.draw();

    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  it('attrs change - regular polygon', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.RegularPolygon({
      x: 100,
      y: 150,
      sides: 6,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.radius(100);
    layer.draw();

    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  it('attrs change - ring', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Ring({
      x: stage.width() / 2,
      y: stage.height() / 2,
      innerRadius: 40,
      outerRadius: 70,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.outerRadius(100);

    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    shape.innerRadius(200);
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    layer.draw();
  });

  it('attrs change - star', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Star({
      x: stage.width() / 2,
      y: stage.height() / 2,
      numPoints: 6,
      innerRadius: 40,
      outerRadius: 70,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.outerRadius(100);

    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    shape.innerRadius(200);
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);

    layer.draw();
  });

  it('attrs change - wedge', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Wedge({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      angle: 60,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.radius(100);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  it('attrs change - text', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Text({
      x: stage.width() / 2,
      y: 15,
      text: 'Simple Text',
      fontSize: 60,
      fontFamily: 'Arial',
      fill: 'green',
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.text('Simple');
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change text');

    shape.fontSize(30);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change font size');

    shape.padding(10);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change padding');

    shape.lineHeight(2);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change line height');

    shape.width(30);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect), 'change width';

    shape.height(30);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change height');
  });

  it('attrs change - text path', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.TextPath({
      x: 0,
      y: 50,
      fill: '#333',
      fontSize: 16,
      fontFamily: 'Arial',
      text: "All the world's a stage, and all the men and women merely players.",
      data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50',
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
    });
    layer.add(tr);

    shape.text('Simple');
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change text');

    shape.fontSize(30);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect, 'change font size');

    shape.data('M10,10 C0,0 10,150 100,100 S300,150 400,50');
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect), 'change data';
  });

  it('make sure transformer events are not cloned', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: stage.width() / 5,
      y: stage.height() / 5,
      width: 50,
      height: 50,
      fill: 'green',
      draggable: true,
    });

    layer.add(rect1);

    var tr1 = new Konva.Transformer({
      nodes: [rect1],
    });
    layer.add(tr1);

    var rect2 = rect1.clone({
      fill: 'red',
      x: stage.width() / 3,
      y: stage.height() / 3,
    });
    layer.add(rect2);

    tr1.destroy();

    var tr2 = new Konva.Transformer({
      nodes: [rect2],
    });
    layer.add(tr2);

    // should not throw error
    rect2.width(100);

    assertAlmostEqual(tr2.width(), 100);

    stage.draw();
  });

  it('try to move anchor on scaled with css stage', function () {
    if (isNode) {
      return;
    }
    var stage = addStage();
    stage.container().style.transform = 'scale(0.5)';
    stage.container().style.transformOrigin = 'top left';

    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      keepRatio: false,
    });
    layer.add(tr);
    layer.draw();

    sm(stage, {
      x: 50,
      y: 50,
    });
    simulateMouseDown(tr, {
      x: 50,
      y: 50,
    });

    var target = stage.getIntersection({
      x: 50,
      y: 50,
    });
    simulateMouseMove(tr, {
      x: 100,
      y: 50,
    });

    // here is duplicate, because transformer is listening window events
    simulateMouseUp(tr, {
      x: 100,
      y: 50,
    });
    su(stage, {
      x: 100,
      y: 50,
    });

    assertAlmostEqual(rect.width() * rect.scaleX(), 200);
  });

  it('rotate several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90),
    });

    layer.draw();

    assertAlmostEqual(rect1.x(), 100);
    assertAlmostEqual(rect1.y(), 0);
    assertAlmostEqual(rect1.width() + rect2.width(), 100);
    assertAlmostEqual(rect1.height() + rect2.width(), 100);
    assertAlmostEqual(rect1.rotation(), 90);

    assertAlmostEqual(rect2.x(), 50);
    assertAlmostEqual(rect2.y(), 50);
    assertAlmostEqual(rect2.width() + rect2.width(), 100);
    assertAlmostEqual(rect2.height() + rect2.width(), 100);
    assertAlmostEqual(tr.rotation(), 90);

    tr._fitNodesInto({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(180),
    });

    assertAlmostEqual(tr.x(), rect1.x());
    assertAlmostEqual(tr.y(), rect1.y());
    assertAlmostEqual(tr.width(), rect1.width() + rect2.width());
    assertAlmostEqual(tr.height(), rect1.height() + rect2.width());
    assertAlmostEqual(tr.rotation(), 180);
  });

  it('events on several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect1);
    var rect2 = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect2);

    var transformstart = 0;
    var transform = 0;
    var transformend = 0;

    rect1.on('transformstart', function () {
      transformstart += 1;
    });
    rect1.on('transform', function () {
      transform += 1;
    });
    rect1.on('transformend', function () {
      transformend += 1;
    });

    rect2.on('transformstart', function () {
      transformstart += 1;
    });
    rect2.on('transform', function () {
      transform += 1;
    });
    rect2.on('transformend', function () {
      transformend += 1;
    });

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 100,
      y: 60,
    });

    simulateMouseMove(tr, {
      x: 105,
      y: 60,
    });

    simulateMouseUp(tr, {
      x: 105,
      y: 60,
    });

    assert.equal(transformstart, 2);
    assert.equal(transform, 2);
    assert.equal(transformend, 2);
  });

  it('transform several rotated nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'blue',
      rotation: 45,
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
      rotation: 120,
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90),
    });

    layer.draw();

    assertAlmostEqual(rect1.x(), 100);
    assertAlmostEqual(rect1.y(), 41.421356237309496);
    assertAlmostEqual(rect1.width() + rect2.width(), 100);
    assertAlmostEqual(rect1.height() + rect2.width(), 100);
    assertAlmostEqual(rect1.rotation(), 132.45339125826706);

    assertAlmostEqual(rect2.x(), 46.41016151377549);
    assertAlmostEqual(rect2.y(), 100);
    assertAlmostEqual(rect2.width() + rect2.width(), 100);
    assertAlmostEqual(rect2.height() + rect2.width(), 100);
    assertAlmostEqual(tr.rotation(), 90);

    tr._fitNodesInto({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(180),
    });

    assertAlmostEqual(tr.x(), 100);
    assertAlmostEqual(tr.y(), 100);
  });

  it('drag several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var dragstart = 0;
    var dragmove = 0;
    var dragend = 0;

    rect2.on('dragstart', () => {
      dragstart += 1;
    });
    rect2.on('dragmove', () => {
      dragmove += 1;
    });
    rect2.on('dragend', () => {
      dragend += 1;
    });

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });

    // make sure drag also triggers on the transformer.
    tr.on('dragstart', (e) => {
      assert.equal(!!e.evt, true);
      dragstart += 1;
    });
    tr.on('dragmove', () => {
      dragmove += 1;
    });
    tr.on('dragend', () => {
      dragend += 1;
    });

    // also drag should bubble to stage
    // two times for two rects
    stage.on('dragstart', (e) => {
      assert.equal(!!e.evt, true);
      dragstart += 1;
    });

    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 75,
      y: 75,
    });
    sm(stage, {
      x: 80,
      y: 80,
    });

    sm(stage, {
      x: 85,
      y: 85,
    });

    su(stage, {
      x: 80,
      y: 80,
    });

    // proxy drag to other nodes
    assert.equal(rect2.x(), 110);
    assert.equal(rect2.y(), 110);
    assert.equal(dragstart, 4, 'dragstart');
    assert.equal(dragmove, 3, 'dragmove');
    assert.equal(dragend, 2, 'dragend');
  });

  it('reattach from several and drag one', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);
    layer.draw();

    tr.nodes([rect1]);

    // now drag just the first
    simulateMouseDown(tr, {
      x: 125,
      y: 125,
    });
    sm(stage, {
      x: 130,
      y: 130,
    });

    su(stage, {
      x: 130,
      y: 130,
    });

    // no changes on the second
    assert.equal(rect1.x(), 50);
    assert.equal(rect1.y(), 50);
  });

  it('transformer should not hide shapes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var click = 0;

    rect1.on('click', () => {
      click += 1;
    });

    var tr = new Konva.Transformer({
      nodes: [rect1],
    });
    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 75,
      y: 75,
    });
    sm(stage, {
      x: 75,
      y: 75,
    });

    su(stage, {
      x: 75,
      y: 75,
    });

    // proxy drag to other nodes
    assert.equal(click, 1);
  });

  it('drag several nodes by transformer back', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var dragstart = 0;
    var dragmove = 0;
    var dragend = 0;

    rect1.on('dragstart', () => {
      dragstart += 1;
    });
    rect1.on('dragmove', () => {
      dragmove += 1;
    });
    rect1.on('dragend', () => {
      dragend += 1;
    });
    rect2.on('dragstart', () => {
      dragstart += 1;
    });
    rect2.on('dragmove', () => {
      dragmove += 1;
    });
    rect2.on('dragend', () => {
      dragend += 1;
    });

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
      shouldOverdrawWholeArea: true,
    });

    tr.on('dragstart', () => {
      dragstart += 1;
    });
    tr.on('dragmove', () => {
      dragmove += 1;
    });
    tr.on('dragend', () => {
      dragend += 1;
    });
    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 110,
      y: 90,
    });

    // move mouse twice
    // because first move will jus trigger start dragging
    sm(stage, {
      x: 120,
      y: 90,
    });
    sm(stage, {
      x: 120,
      y: 90,
    });

    su(stage, {
      x: 120,
      y: 90,
    });

    // proxy drag to other nodes
    assert.equal(rect1.x(), 60);
    assert.equal(rect1.y(), 50);
    assert.equal(rect2.x(), 110);
    assert.equal(rect2.y(), 100);
    assert.equal(dragstart, 3, 'dragstart');
    assert.equal(dragmove, 3, 'dragmove');
    assert.equal(dragend, 3, 'dragend');
  });

  it('reattach to several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90),
    });

    assertAlmostEqual(tr.x(), rect1.x());
    assertAlmostEqual(tr.y(), rect1.y());
    assertAlmostEqual(tr.width(), rect1.width() + rect2.width());
    assertAlmostEqual(tr.height(), rect1.height() + rect2.width());
    assertAlmostEqual(tr.rotation(), 90);
    layer.draw();

    tr.nodes([rect1, rect2]);

    assertAlmostEqual(tr.x(), 0);
    assertAlmostEqual(tr.y(), 0);
    assertAlmostEqual(tr.width(), rect1.width() + rect2.width());
    assertAlmostEqual(tr.height(), rect1.height() + rect2.width());
    assertAlmostEqual(tr.rotation(), 0);
  });

  it('rotate several nodes inside different parents', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var group = new Konva.Group({
      x: 50,
      scaleX: 2,
    });

    layer.add(group);

    var rect2 = new Konva.Rect({
      x: 0,
      y: 50,
      draggable: true,
      width: 25,
      height: 50,
      fill: 'red',
    });
    group.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);
    layer.draw();

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), 100);
    assert.equal(tr.height(), 100);
    assert.equal(tr.rotation(), 0);

    // fit into the same area
    const box = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
    };

    tr._fitNodesInto(box);

    var newBox = tr._getNodeRect();

    assertAlmostEqual(box.x, newBox.x);
    assertAlmostEqual(box.y, newBox.y);
    assertAlmostEqual(box.width, newBox.width);
    assertAlmostEqual(box.height, newBox.height);
    assertAlmostEqual(box.rotation, newBox.rotation);

    assertAlmostEqual(rect1.x(), 0);
    assertAlmostEqual(rect1.y(), 0);
    assertAlmostEqual(rect1.width(), 50);
    assertAlmostEqual(rect1.height(), 50);
    assertAlmostEqual(rect1.rotation(), 0);

    assertAlmostEqual(rect2.x(), 0);
    assertAlmostEqual(rect2.y(), 50);
    assertAlmostEqual(rect2.width(), 25);
    assertAlmostEqual(rect2.height(), 50);
    assertAlmostEqual(rect2.rotation(), 0);
  });

  it('can attach transformer into several nodes and fit into negative scale', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
    });
    layer.add(tr);

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 0,
      height: 100,
      rotation: 0,
    });

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: -100,
      height: 100,
      rotation: 0,
    });

    layer.draw();
    assertAlmostEqual(Math.round(tr.x()), 0);
    assertAlmostEqual(Math.round(tr.y()), 0);
    assertAlmostEqual(tr.width(), rect1.width() + rect2.width());
    assertAlmostEqual(tr.height(), rect1.height() + rect2.height());
    assertAlmostEqual(tr.rotation(), 0);
  });

  it('boundBoxFox should work in absolute coordinates', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      x: 10,
      y: 10,
      scaleX: 2,
      scaleY: 2,
    });
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red',
    });

    layer.add(rect2);

    var callCount = 0;
    var tr = new Konva.Transformer({
      nodes: [rect1, rect2],
      boundBoxFunc: function (oldBox, newBox) {
        callCount += 1;
        assert.deepEqual(oldBox, {
          x: 10,
          y: 10,
          width: 200,
          height: 200,
          rotation: 0,
        });
        assert.deepEqual(newBox, {
          x: 10,
          y: 10,
          width: 300,
          height: 200,
          rotation: 0,
        });
        return newBox;
      },
    });
    layer.add(tr);

    tr._fitNodesInto({
      x: 10,
      y: 10,
      width: 300,
      height: 200,
      rotation: 0,
    });
    assert.equal(callCount, 1);
  });

  // TODO: move to manual tests
  it.skip('performance check - drag several nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    for (var i = 0; i < 500; i++) {
      var shape = new Konva.Circle({
        x: 100,
        y: 100,
        radius: 50,
        fill: 'red',
        draggable: true,
      });
      layer.add(shape);
    }
    var shapes = layer.find('Circle');
    var tr = new Konva.Transformer({
      nodes: shapes,
    });
    layer.add(tr);
    layer.draw();

    throw 1;
  });

  // we don't support height = 0
  it.skip('try to transform zero size shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Line({
      x: stage.width() / 4,
      y: stage.height() / 4,
      points: [0, 0, 200, 0],
      fill: 'black',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true,
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      nodes: [shape],
      enabledAnchors: ['middle-left', 'middle-right'],
      ignoreStroke: true,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: stage.width() / 2,
      y: stage.height() / 2,
    });
    simulateMouseDown(tr, {
      x: stage.width() / 2 + 100,
      y: stage.height() / 2,
    });
    simulateMouseUp(tr);
    assert.equal(shape.scaleX(), 0.5);
  });

  it('check transform cache', function () {
    var stage = addStage({ scaleX: 0.5, scaleY: 0.5 });
    var layer = new Konva.Layer();
    stage.add(layer);

    var textNode = new Konva.Text({
      text: 'Some text here',
      x: 300,
      y: 100,
      fontSize: 20,
      draggable: true,
      width: 200,
    });

    var tr = new Konva.Transformer({
      nodes: [textNode],
      enabledAnchors: [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'middle-left',
        'middle-right',
      ],
      boundBoxFunc: function (oldBox, newBox) {
        if (newBox.width < 5 || newBox.height < 5 || newBox.width > 1000) {
          return oldBox;
        }
        return newBox;
      },
    });

    layer.add(tr);
    layer.add(textNode);

    assert.equal(textNode.getClientRect().width, 100);
  });

  // ======================================================
  it('init transformer on simple rectangle', function () {
    var stage = addStage();
    stage.rotation(45);

    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      rotation: 45,
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      useSingleNodeRotation: false,
      nodes: [rect],
    });
    layer.add(tr);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.rotation(), 0);
  });

  it('use several transformers on a single node', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr1 = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr1);

    var tr2 = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr2);

    // detach tr1
    tr1.nodes([]);

    // update rect
    rect.setAttrs({ x: 0, y: 0, width: 50, height: 50 });

    // it should update second transformer
    assert.equal(tr2.x(), rect.x());
    assert.equal(tr2.y(), rect.y());
    assert.equal(tr2.width(), rect.width());
    assert.equal(tr2.height(), rect.height());
  });
  it('detached transformer should not affect client rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [],
    });
    layer.add(tr);

    const layerClientRect = layer.getClientRect();
    const rectClientRect = rect.getClientRect();

    // the client rect should not be affected by the transformer
    assert.deepEqual(layerClientRect, rectClientRect);
  });
  it('attached transformer should affect client rect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    const layerClientRect = layer.getClientRect();
    const rectClientRect = rect.getClientRect();
    const trClientRect = tr.getClientRect();

    // the client rect should be affecte by the transformer
    assert.notDeepEqual(layerClientRect, rectClientRect);
    assert.deepEqual(layerClientRect, trClientRect);
  });

  it('cloning of transformer should double create child elements', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);

    const clone = tr.clone();
    assert.equal(clone.getChildren().length, tr.getChildren().length);
    assert.equal(clone.nodes().length, 0);
  });

  it('should filter parent of the transformer', function () {
    const stage = addStage();

    const layer = new Konva.Layer();
    stage.add(layer);

    const tr = new Konva.Transformer();
    layer.add(tr);

    tr.nodes([layer]);
    assert.equal(tr.nodes().length, 0);
  });

  it('anchorStyleFunc', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    // manual check of correct position of node
    var handler = tr.findOne<Konva.Rect>('.bottom-right');
    assert.equal(handler.fill(), 'white');

    tr.anchorStyleFunc((anchor) => {
      if (anchor.hasName('bottom-right')) {
        anchor.fill('red');
      }
    });
    assert.equal(handler.fill(), 'red');
    tr.anchorStyleFunc(null);
    assert.equal(handler.fill(), 'white');
  });

  it('flip rectangle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      x: 150,
      y: 50,
      width: 100,
      height: 100,
      fillLinearGradientStartPoint: { x: -50, y: -50 },
      fillLinearGradientEndPoint: { x: 50, y: 50 },
      fillLinearGradientColorStops: [0, 'red', 1, 'yellow'],
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
      flipEnabled: false,
    });
    layer.add(tr);

    layer.draw();

    simulateMouseDown(tr, {
      x: 150,
      y: 50,
    });
    simulateMouseMove(tr, {
      x: 250,
      y: 50,
    });
    simulateMouseMove(tr, {
      x: 350,
      y: 50,
    });

    simulateMouseUp(tr, {
      x: 350,
      y: 50,
    });

    layer.draw();

    assertAlmostEqual(rect.x(), 250);
    assertAlmostEqual(rect.y(), 50);
    assertAlmostEqual(rect.scaleX(), 1);
    assertAlmostEqual(rect.scaleY(), 1);
  });

  it('should be able to prevent rotation in transform event', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 55,
      y: 55,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    tr.on('transform', function (e) {
      tr.rotation(0);
    });

    simulateMouseDown(tr, {
      x: 100,
      y: 2,
    });
    simulateMouseMove(tr, {
      x: 110,
      y: 2,
    });
    assert.equal(tr.rotation(), 0);
    simulateMouseUp(tr, { x: 110, y: 2 });
  });

  it('skip render on hit graph while transforming', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 55,
      y: 55,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    simulateMouseDown(tr, {
      x: 100,
      y: 2,
    });
    simulateMouseMove(tr, {
      x: 110,
      y: 2,
    });
    let shape = layer.getIntersection({
      x: 100,
      y: 100,
    });
    assert.equal(shape, null);
    simulateMouseUp(tr, { x: 110, y: 2 });
    layer.draw();
    shape = layer.getIntersection({
      x: 100,
      y: 100,
    });
    assert.equal(shape, rect);
    // reset position
    rect.setAttrs({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
    });

    tr.nodes([rect]);
    layer.draw();
    // now check if graph is visible back when we moved a bit
    simulateMouseDown(tr, {
      x: 100,
      y: 2,
    });
    simulateMouseMove(tr, {
      x: 110,
      y: 2,
    });
    setTimeout(() => {
      shape = layer.getIntersection({
        x: 100,
        y: 100,
      });
      assert.equal(shape, null);
      simulateMouseUp(tr, { x: 110, y: 2 });
      setTimeout(() => {
        shape = layer.getIntersection({
          x: 100,
          y: 100,
        });
        assert.equal(shape, rect);
        done();
      }, 100);
    }, 100);
  });

  it('enable hit graph back on transformer destroy', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 55,
      y: 55,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      nodes: [rect],
    });
    layer.add(tr);
    layer.draw();

    // now check if graph is visible back when we moved a bit
    simulateMouseDown(tr, {
      x: 100,
      y: 2,
    });
    simulateMouseMove(tr, {
      x: 110,
      y: 2,
    });
    setTimeout(() => {
      tr.destroy();
      setTimeout(() => {
        var shape = layer.getIntersection({
          x: 100,
          y: 100,
        });
        assert.equal(shape, rect);
        done();
      }, 100);
    }, 100);
  });
});
