import { assert } from 'chai';
import { Shape } from '../../src/Shape.js';
import { addStage, Konva, compareLayers, isNode } from './test-utils';

describe('Container', function () {
  // ======================================================
  it('clip', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      clip: { x: 0, y: 0, width: stage.width() / 2, height: 100 },
    });
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
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

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();rect(0,0,289,100);clip();transform(1,0,0,1,0,0);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();rect(0,0,289,100);clip();transform(1,0,0,1,0,0);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();restore();'
    );
  });

  // ======================================================
  it('clip function', function () {
    var stage = addStage();

    // cliped by circle is the same as draw circle
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({
      fill: 'black',
      x: 50,
      y: 50,
      radius: 40,
    });
    layer.add(circle);

    layer.draw();

    var clipedLayer = new Konva.Layer({
      clipFunc: function (ctx) {
        ctx.arc(50, 50, 40, 0, Math.PI * 2, false);
      },
    });
    stage.add(clipedLayer);
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      fill: 'black',
      width: 200,
      height: 200,
    });
    clipedLayer.add(rect);
    stage.draw();

    compareLayers(layer, clipedLayer, 150);
  });

  // ======================================================
  it('clip function', function () {
    if (isNode) {
      // how to use Path2D in nodejs env?
      return;
    }
    var stage = addStage();

    // cliped by circle is the same as draw circle
    var layer = new Konva.Layer();
    stage.add(layer);
    var circle = new Konva.Circle({
      fill: 'black',
      x: 50,
      y: 50,
      radius: 40,
    });
    layer.add(circle);

    layer.draw();

    var clipedLayer = new Konva.Layer({
      clipFunc: function (ctx) {
        const path2D = new Path2D();
        path2D.arc(50, 50, 40, 0, Math.PI * 2, false);
        ctx.fill(path2D);
      },
    });
    stage.add(clipedLayer);
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      fill: 'black',
      width: 200,
      height: 200,
    });
    clipedLayer.add(rect);
    stage.draw();

    compareLayers(layer, clipedLayer, 150);
  });

  // ======================================================
  it('adder validation', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    stage.add(layer);
    layer.add(group);
    group.add(circle);
    layer.draw();

    // disassemble the tree
    circle.remove();
    group.remove();
    layer.remove();

    // ===================================
    var errorThrown = false;
    try {
      stage.add(stage as any);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding stage to stage'
    );
    stage.remove();

    // ===================================
    var errorThrown = false;
    try {
      stage.add(group as any);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding group to stage'
    );
    group.remove();

    // ===================================
    var errorThrown = false;
    try {
      stage.add(circle as any);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding shape to stage'
    );
    circle.remove();

    // ===================================
    var errorThrown = false;
    try {
      layer.add(stage as any);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding stage to layer'
    );
    stage.remove();

    // ===================================
    var errorThrown = false;
    try {
      layer.add(layer);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding layer to layer'
    );
    layer.remove();

    // ===================================
    var errorThrown = false;
    try {
      group.add(stage as any);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding stage to group'
    );
    stage.remove();

    // ===================================
    var errorThrown = false;
    try {
      group.add(layer);
    } catch (err) {
      errorThrown = true;
    }
    assert.equal(
      errorThrown,
      true,
      'error should have been thrown when adding layer to group'
    );
    layer.remove();
  });

  // ======================================================
  it('add layer then group then shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    // these should all pass because they are valid
    stage.add(layer);
    layer.add(group);
    group.add(circle);
    layer.draw();

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('add shape then stage then layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myCircle',
    });

    group.add(circle);
    stage.add(layer);
    layer.add(group);

    layer.draw();

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('select shape by id and name', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      id: 'myLayer',
    });
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      id: 'myCircle',
    });

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myRect',
    });

    layer.add(circle);
    layer.add(rect);
    stage.add(layer);

    var node;
    node = stage.find('#myCircle')[0];
    assert.equal(node.className, 'Circle', 'className should be Circle');
    node = layer.find('.myRect')[0];
    assert.equal(node.className, 'Rect', 'className should be rect');
    node = layer.find('#myLayer')[0];
    assert.equal(node, undefined, 'node should be undefined');
    node = stage.find('#myLayer')[0];
    assert.equal(node.nodeType, 'Layer', 'node type should be Layer');
  });

  // ======================================================
  it('select shape by name with "-" char', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'bounding-box',
    });

    layer.add(rect);
    stage.add(layer);

    var node = stage.find('.bounding-box')[0];
    assert.equal(node, rect);
  });

  // ======================================================
  it('select should return elements in their order', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    // create circle before any nodes
    var circle = new Konva.Circle({
      radius: 50,
      fill: 'red',
      name: 'node',
    });

    var group = new Konva.Group({
      name: 'node',
    });
    layer.add(group);

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'node',
    });
    group.add(rect);
    group.add(circle);

    // move circle
    circle.moveToBottom();

    assert.equal(layer.findOne('.node'), group, 'group here');

    var nodes = layer.find('.node');
    assert.equal(nodes[0], group, 'group first');
    assert.equal(nodes[1], circle, 'then circle');
    assert.equal(nodes[2], rect, 'then rect');

    assert.equal(layer.findOne('Shape'), circle, 'circle is first');
  });

  // ======================================================
  it('select shape with findOne', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      id: 'myLayer',
    });
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      id: 'myCircle',
    });

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myRect',
    });

    layer.add(circle);
    layer.add(rect);
    stage.add(layer);

    var node;
    node = stage.findOne('#myCircle');
    assert.equal(node, circle);
    node = layer.findOne('.myRect');
    assert.equal(node, rect);
    node = layer.findOne('#myLayer');
    assert.equal(node, undefined, 'node should be undefined');
    node = stage.findOne('#myLayer');
    assert.equal(node, layer, 'node type should be Layer');
    node = stage.findOne(function (node) {
      return node.getType() === 'Shape';
    });
    assert.equal(node, circle, 'findOne should work with functions');
  });

  // ======================================================
  it('select shapes with multiple selectors', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      id: 'myLayer',
    });
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      id: 'myCircle',
    });

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myRect',
    });

    layer.add(circle);
    layer.add(rect);
    stage.add(layer);

    assert.equal(
      layer.find('#myCircle, .myRect').length,
      2,
      'should be 2 items in the array'
    );
    assert.equal(
      layer.find('#myCircle, .myRect')[0]._id,
      circle._id,
      'circle id is wrong'
    );
    assert.equal(
      layer.find('#myCircle, .myRect')[1]._id,
      rect._id,
      'rect id is wrong'
    );

    assert.equal(
      layer.find('#myCircle, Circle, .myRect, Rect').length,
      2,
      'should be 2 items in the array'
    );
    assert.equal(
      layer.find('#myCircle, Circle, .myRect, Rect')[0]._id,
      circle._id,
      'circle id is wrong'
    );
    assert.equal(
      layer.find('#myCircle, Circle, .myRect, Rect')[1]._id,
      rect._id,
      'rect id is wrong'
    );
  });

  // ======================================================
  it('select shape by function', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myRect',
    });

    layer.add(rect);
    stage.add(layer);

    var fn = function (node) {
      return node.nodeType === 'Shape';
    };

    var noOp = function (node) {
      return false;
    };

    assert.equal(stage.find(fn)[0], rect);
    assert.equal(stage.find(noOp).length, 0);
  });

  // ======================================================
  it('select shape with duplicate id', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      id: 'myRect',
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      id: 'myRect',
    });
    layer.add(rect2);
    stage.draw();

    assert.equal(stage.find('#myRect').length, 2);
    assert.equal(stage.find('#myRect')[0], rect1);
    assert.equal(stage.find('#myRect')[1], rect2);
  });

  // ======================================================
  it('set x on an array of nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myShape',
    });

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myShape',
    });

    layer.add(circle);
    layer.add(rect);
    stage.add(layer);

    var shapes = layer.find('.myShape');

    assert.equal(shapes.length, 2, 'shapes array should have 2 elements');

    shapes.forEach(function (node) {
      node.x(200);
    });

    layer.draw();

    shapes.forEach(function (node) {
      assert.equal(node.x(), 200, 'shape x should be 200');
    });
  });

  // ======================================================
  it('set fill on array by Shape-selector', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myShape',
    });

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myShape',
    });

    layer.add(circle);
    layer.add(rect);
    stage.add(layer);

    var shapes = layer.find<Shape>('Shape');

    assert.equal(shapes.length, 2, 'shapes array should have 2 elements');

    shapes.forEach(function (node) {
      node.fill('gray');
    });

    layer.draw();

    shapes.forEach(function (node) {
      assert.equal(node.fill(), 'gray', 'shape x should be 200');
    });
  });

  // ======================================================
  it('add listener to an array of nodes', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myShape',
    });

    var rect = new Konva.Rect({
      x: 300,
      y: 100,
      width: 100,
      height: 50,
      fill: 'purple',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myShape',
    });

    layer.add(circle);
    layer.add(rect);
    stage.add(layer);

    var shapes = layer.find('.myShape');

    assert.equal(shapes.length, 2, 'shapes array should have 2 elements');
    var a = 0;
    shapes.forEach((shape) =>
      shape.on('mouseover', function () {
        a++;
      })
    );
    circle.fire('mouseover');
    assert.equal(a, 1, 'listener should have fired for circle');
    rect.fire('mouseover');
    assert.equal(a, 2, 'listener should have fired for rect');
  });

  // ======================================================
  it('remove all children from layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle1 = new Konva.Circle({
      x: 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    var circle2 = new Konva.Circle({
      x: 300,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    group.add(circle1);
    group.add(circle2);
    layer.add(group);
    stage.add(layer);

    assert.equal(layer.children.length, 1, 'layer should have 1 children');
    assert.equal(group.children.length, 2, 'group should have 2 children');

    layer.removeChildren();
    layer.draw();

    assert.equal(layer.children.length, 0, 'layer should have 0 children');
    assert.equal(
      group.children.length,
      2,
      'group still should have 2 children'
    );
  });

  // ======================================================
  it('add group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('create two groups, move first group', function () {
    var stage = addStage();
    var greenLayer = new Konva.Layer();
    var blueLayer = new Konva.Layer();
    var greenGroup = new Konva.Group();
    var blueGroup = new Konva.Group();

    var greencircle = new Konva.Circle({
      x: stage.width() / 2 - 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true,
    });

    var bluecircle = new Konva.Circle({
      x: stage.width() / 2 + 100,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    greenGroup.add(greencircle);
    blueGroup.add(bluecircle);
    greenLayer.add(greenGroup);
    blueLayer.add(blueGroup);
    stage.add(greenLayer);
    stage.add(blueLayer);

    blueLayer.removeChildren();
    var blueGroup2 = new Konva.Group();
    var bluecircle2 = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });
    blueGroup2.add(bluecircle2);
    blueLayer.add(blueGroup2);
    blueLayer.draw();
    blueGroup2.position({ x: 100, y: 0 });
    blueLayer.draw();

    var trace = blueLayer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,389,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=blue;fill();lineWidth=4;strokeStyle=black;stroke();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=blue;fill();lineWidth=4;strokeStyle=black;stroke();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,389,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=blue;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('node type selector', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var fooLayer = new Konva.Layer();
    var group = new Konva.Group();

    var blue = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      fill: 'blue',
    });

    var red = new Konva.Rect({
      x: 250,
      y: 100,
      width: 100,
      height: 50,
      fill: 'red',
    });

    group.add(red);
    layer.add(blue);
    layer.add(group);
    stage.add(layer);
    stage.add(fooLayer);

    assert.equal(stage.find('Shape').length, 2, 'stage should have 2 shapes');
    assert.equal(layer.find('Shape').length, 2, 'layer should have 2 shapes');
    assert.equal(group.find('Shape').length, 1, 'layer should have 2 shapes');

    assert.equal(stage.find('Layer').length, 2, 'stage should have 2 layers');
    assert.equal(stage.find('Group').length, 1, 'stage should have 1 group');

    assert.equal(layer.find('Group').length, 1, 'layer should have 1 group');
    assert.equal(layer.find('Shape').length, 2, 'layer should have 2 shapes');
    assert.equal(layer.find('Layer').length, 0, 'layer should have 0 layers');

    assert.equal(
      layer.find('Group, Rect').length,
      3,
      'layer should have 3 [group or rects]'
    );

    assert.equal(
      fooLayer.find('Group').length,
      0,
      'layer should have 0 groups'
    );
    assert.equal(
      fooLayer.find('Shape').length,
      0,
      'layer should have 0 shapes'
    );

    assert.equal(group.find('Shape').length, 1, 'group should have 1 shape');
    assert.equal(group.find('Layer').length, 0, 'group should have 0 layers');
    assert.equal(group.find('Group').length, 0, 'group should have 0 groups');
  });

  // ======================================================
  it('node and shape type selector', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var layer2 = new Konva.Layer();
    var fooLayer = new Konva.Layer();
    var group = new Konva.Group();

    var blue = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'blue',
    });

    var red = new Konva.Rect({
      x: 150,
      y: 75,
      width: 100,
      height: 50,
      fill: 'red',
    });

    var green = new Konva.Rect({
      x: 200,
      y: 100,
      width: 100,
      height: 50,
      fill: 'green',
    });

    var blueCircle = new Konva.Circle({
      x: 350,
      y: 75,
      radius: 40,
      fill: 'blue',
    });

    var redCircle = new Konva.Circle({
      x: 400,
      y: 125,
      radius: 40,
      fill: 'red',
    });

    var textpath = new Konva.TextPath({
      y: 35,
      stroke: 'black',
      strokeWidth: 1,
      fill: 'orange',
      fontSize: 18,
      fontFamily: 'Arial',
      text: "The quick brown fox jumped over the lazy dog's back",
      data: 'M 10,10 300,150 550,150',
    });

    var path = new Konva.Path({
      x: 200,
      y: -75,
      data: 'M200,100h100v50z',
      fill: '#ccc',
      stroke: '#333',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 2,
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.5,
    });

    var poly = new Konva.RegularPolygon({
      x: stage.width() / 2,
      y: stage.height() / 2,
      sides: 5,
      radius: 50,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 5,
      name: 'foobar',
    });

    group.add(red);
    group.add(redCircle);
    layer.add(blue);
    layer.add(green);
    layer.add(blueCircle);
    layer.add(group);
    layer2.add(textpath);
    layer2.add(path);
    layer2.add(poly);
    stage.add(layer);
    stage.add(layer2);
    stage.add(fooLayer);

    assert.equal(stage.find('Shape').length, 8, 'stage should have 5 shapes');
    assert.equal(stage.find('Layer').length, 3, 'stage should have 2 layers');
    assert.equal(stage.find('Group').length, 1, 'stage should have 1 group');
    assert.equal(stage.find('Rect').length, 3, 'stage should have 3 rects');
    assert.equal(stage.find('Circle').length, 2, 'stage should have 2 circles');
    assert.equal(
      stage.find('RegularPolygon').length,
      1,
      'stage should have 1 regular polygon'
    );
    assert.equal(
      stage.find('TextPath').length,
      1,
      'stage should have 1 text path'
    );
    assert.equal(stage.find('Path').length, 1, 'stage should have 1 path');

    assert.equal(layer.find('Shape').length, 5, 'layer should have 5 shapes');
    assert.equal(layer.find('Layer').length, 0, 'layer should have 0 layers');
    assert.equal(layer.find('Group').length, 1, 'layer should have 1 group');
    assert.equal(layer.find('Rect').length, 3, 'layer should have 3 rects');
    assert.equal(layer.find('Circle').length, 2, 'layer should have 2 circles');
    assert.equal(
      layer.find('RegularPolygon').length,
      0,
      'layer should have 0 regular polygon'
    );
    assert.equal(
      layer.find('TextPath').length,
      0,
      'layer should have 0 text path'
    );
    assert.equal(layer.find('Path').length, 0, 'layer should have 0 path');

    assert.equal(layer2.find('Shape').length, 3, 'layer2 should have 3 shapes');
    assert.equal(layer2.find('Layer').length, 0, 'layer2 should have 0 layers');
    assert.equal(layer2.find('Group').length, 0, 'layer2 should have 0 group');
    assert.equal(
      layer2.find('RegularPolygon').length,
      1,
      'layer2 should have 1 regular polygon'
    );
    assert.equal(
      layer2.find('TextPath').length,
      1,
      'layer2 should have 1 text path'
    );
    assert.equal(layer2.find('Path').length, 1, 'layer2 should have 1 path');

    assert.equal(
      fooLayer.find('Shape').length,
      0,
      'layer should have 0 shapes'
    );
    assert.equal(
      fooLayer.find('Group').length,
      0,
      'layer should have 0 groups'
    );
    assert.equal(fooLayer.find('Rect').length, 0, 'layer should have 0 rects');
    assert.equal(
      fooLayer.find('Circle').length,
      0,
      'layer should have 0 circles'
    );

    assert.equal(group.find('Shape').length, 2, 'group should have 2 shape');
    assert.equal(group.find('Layer').length, 0, 'group should have 0 layers');
    assert.equal(group.find('Group').length, 0, 'group should have 0 groups');
    assert.equal(group.find('Rect').length, 1, 'group should have 1 rects');
    assert.equal(group.find('Circle').length, 1, 'gropu should have 1 circles');
  });

  // ======================================================
  it('test find() selector by adding shapes with multiple names', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      name: 'layerName',
      id: 'layerId',
    });
    var group = new Konva.Group({
      name: 'groupName',
      id: 'groupId',
    });
    var rect = new Konva.Rect({
      x: 200,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      name: 'red rectangle',
      id: 'rectId',
    });
    var circle = new Konva.Circle({
      x: 50,
      y: 50,
      radius: 20,
      fill: 'red',
      name: 'red circle',
      id: 'circleId',
    });

    group.add(rect);
    group.add(circle);
    layer.add(group);
    stage.add(layer);

    assert.equal(
      stage.find('.rectangle')[0],
      rect,
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('.rectangle')[0],
      rect,
      'problem with shape name selector'
    );
    assert.equal(
      group.find('.rectangle')[0],
      rect,
      'problem with shape name selector'
    );

    assert.equal(
      stage.find('.circle')[0],
      circle,
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('.circle')[0],
      circle,
      'problem with shape name selector'
    );
    assert.equal(
      group.find('.circle')[0],
      circle,
      'problem with shape name selector'
    );

    assert.equal(
      stage.find('.red')[0],
      rect,
      'problem with shape name selector'
    );
    assert.equal(
      stage.find('.red')[1],
      circle,
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('.red')[0],
      rect,
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('.red')[1],
      circle,
      'problem with shape name selector'
    );
    assert.equal(
      group.find('.red')[0],
      rect,
      'problem with shape name selector'
    );
    assert.equal(
      group.find('.red')[1],
      circle,
      'problem with shape name selector'
    );

    assert.equal(
      stage.find('.groupName')[0],
      group,
      'problem with group name selector'
    );
    assert.equal(
      layer.find('.groupName')[0],
      group,
      'problem with group name selector'
    );

    assert.equal(
      stage.find('.layerName')[0],
      layer,
      'problem with layer name selector'
    );
  });

  // ======================================================
  it('test find() selector by adding shape, then group, then layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      name: 'layerName',
      id: 'layerId',
    });
    var group = new Konva.Group({
      name: 'groupName',
      id: 'groupId',
    });
    var rect = new Konva.Rect({
      x: 200,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      name: 'rectName',
      id: 'rectId',
    });

    group.add(rect);
    layer.add(group);
    stage.add(layer);

    assert.equal(
      stage.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      stage.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      layer.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      group.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      group.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );

    assert.equal(
      stage.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      stage.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );
    assert.equal(
      layer.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      layer.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );

    assert.equal(
      stage.find('.layerName')[0].attrs.id,
      'layerId',
      'problem with layer name selector'
    );
    assert.equal(
      stage.find('#layerId')[0].attrs.id,
      'layerId',
      'problem with layer id selector'
    );
  });

  // ======================================================
  it('test find() selector by adding group, then shape, then layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      name: 'layerName',
      id: 'layerId',
    });
    var group = new Konva.Group({
      name: 'groupName',
      id: 'groupId',
    });
    var rect = new Konva.Rect({
      x: 200,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      name: 'rectName',
      id: 'rectId',
    });

    layer.add(group);
    group.add(rect);
    stage.add(layer);

    assert.equal(
      stage.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      stage.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      layer.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      group.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      group.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );

    assert.equal(
      stage.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      stage.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );
    assert.equal(
      layer.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      layer.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );

    assert.equal(
      stage.find('.layerName')[0].attrs.id,
      'layerId',
      'problem with layer name selector'
    );
    assert.equal(
      stage.find('#layerId')[0].attrs.id,
      'layerId',
      'problem with layer id selector'
    );
  });

  // ======================================================
  it('test find() selector by adding group, then layer, then shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      name: 'layerName',
      id: 'layerId',
    });
    var group = new Konva.Group({
      name: 'groupName',
      id: 'groupId',
    });
    var rect = new Konva.Rect({
      x: 200,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      name: 'rectName',
      id: 'rectId',
    });

    layer.add(group);
    stage.add(layer);
    group.add(rect);

    assert.equal(
      stage.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      stage.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      layer.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      group.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      group.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );

    assert.equal(
      stage.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      stage.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );
    assert.equal(
      layer.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      layer.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );

    assert.equal(
      stage.find('.layerName')[0].attrs.id,
      'layerId',
      'problem with layer name selector'
    );
    assert.equal(
      stage.find('#layerId')[0].attrs.id,
      'layerId',
      'problem with layer id selector'
    );
  });

  // ======================================================
  it('test find() selector by adding layer, then group, then shape', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      name: 'layerName',
      id: 'layerId',
    });
    var group = new Konva.Group({
      name: 'groupName',
      id: 'groupId',
    });
    var rect = new Konva.Rect({
      x: 200,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      name: 'rectName',
      id: 'rectId',
    });

    stage.add(layer);
    layer.add(group);
    group.add(rect);

    assert.equal(
      stage.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      stage.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      layer.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      layer.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );
    assert.equal(
      group.find('.rectName')[0].attrs.id,
      'rectId',
      'problem with shape name selector'
    );
    assert.equal(
      group.find('#rectId')[0].attrs.id,
      'rectId',
      'problem with shape id selector'
    );

    assert.equal(
      stage.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      stage.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );
    assert.equal(
      layer.find('.groupName')[0].attrs.id,
      'groupId',
      'problem with group name selector'
    );
    assert.equal(
      layer.find('#groupId')[0].attrs.id,
      'groupId',
      'problem with group id selector'
    );

    assert.equal(
      stage.find('.layerName')[0].attrs.id,
      'layerId',
      'problem with layer name selector'
    );
    assert.equal(
      stage.find('#layerId')[0].attrs.id,
      'layerId',
      'problem with layer id selector'
    );

    layer.draw();
  });

  it('warn on invalid selector', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      name: 'layerName',
      id: 'layerId',
    });
    var group = new Konva.Group({
      name: 'groupName',
      id: 'groupId',
    });
    var rect = new Konva.Rect({
      x: 200,
      y: 20,
      width: 100,
      height: 50,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      name: 'rectName',
      id: 'rectId',
    });

    stage.add(layer);
    layer.add(group);
    group.add(rect);
    layer.draw();

    var counter = 0;
    var oldWarn = Konva.Util.warn;
    Konva.Util.warn = function () {
      counter += 1;
    };

    // forgot dot
    group.find('rectName');
    assert.equal(counter > 0, true);
    Konva.Util.warn = oldWarn;
  });

  // ======================================================
  it('add layer then shape', function () {
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

    stage.add(layer);
    layer.add(circle);
    layer.draw();

    assert(layer.getChildren().length === 1);
  });

  // ======================================================
  it('move blue layer on top of green layer with setZIndex', function () {
    var stage = addStage();
    var blueLayer = new Konva.Layer();
    var greenLayer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueLayer.add(bluecircle);
    greenLayer.add(greencircle);

    stage.add(blueLayer);
    stage.add(greenLayer);

    blueLayer.setZIndex(1);

    //console.log(greenLayer.getZIndex());

    assert.equal(
      greenLayer.getZIndex(),
      0,
      'green layer should have z index of 0'
    );
    assert.equal(
      blueLayer.getZIndex(),
      1,
      'blue layer should have z index of 1'
    );
  });

  // ======================================================
  it('move blue layer on top of green layer with moveToTop', function () {
    var stage = addStage();
    var blueLayer = new Konva.Layer();
    var greenLayer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueLayer.add(bluecircle);
    greenLayer.add(greencircle);

    stage.add(blueLayer);
    stage.add(greenLayer);

    blueLayer.moveToTop();

    assert(blueLayer.zIndex() === 1);
    assert(greenLayer.zIndex() === 0);
  });

  // ======================================================
  it('move green layer below blue layer with moveToBottom', function () {
    var stage = addStage();
    var blueLayer = new Konva.Layer();
    var greenLayer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueLayer.add(bluecircle);
    greenLayer.add(greencircle);

    stage.add(blueLayer);
    stage.add(greenLayer);

    greenLayer.moveToBottom();

    assert(blueLayer.zIndex() === 1);
    assert(greenLayer.zIndex() === 0);
  });

  // ======================================================
  it('move green layer below blue layer with moveDown', function () {
    var stage = addStage();
    var blueLayer = new Konva.Layer();
    var greenLayer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueLayer.add(bluecircle);
    greenLayer.add(greencircle);

    stage.add(blueLayer);
    stage.add(greenLayer);
    greenLayer.moveDown();

    assert(blueLayer.zIndex() === 1);
    assert(greenLayer.zIndex() === 0);
  });

  // ======================================================
  it('move blue layer above green layer with moveUp', function () {
    var stage = addStage();
    var blueLayer = new Konva.Layer();
    var greenLayer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueLayer.add(bluecircle);
    greenLayer.add(greencircle);

    stage.add(blueLayer);
    stage.add(greenLayer);
    blueLayer.moveUp();

    assert(blueLayer.zIndex() === 1);
    assert(greenLayer.zIndex() === 0);
  });

  // ======================================================
  it('move blue circle on top of green circle with moveToTop', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(bluecircle);
    layer.add(greencircle);
    stage.add(layer);

    assert.equal(
      bluecircle.getZIndex(),
      0,
      'blue circle should have zindex 0 before relayering'
    );
    assert.equal(
      greencircle.getZIndex(),
      1,
      'green circle should have zindex 1 before relayering'
    );

    bluecircle.moveToTop();

    assert.equal(
      bluecircle.getZIndex(),
      1,
      'blue circle should have zindex 1 after relayering'
    );
    assert.equal(
      greencircle.getZIndex(),
      0,
      'green circle should have zindex 0 after relayering'
    );

    layer.draw();
  });

  // ======================================================
  it('move green circle below blue circle with moveDown', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(bluecircle);
    layer.add(greencircle);
    stage.add(layer);

    assert.equal(
      bluecircle.getZIndex(),
      0,
      'blue circle should have zindex 0 before relayering'
    );
    assert.equal(
      greencircle.getZIndex(),
      1,
      'green circle should have zindex 1 before relayering'
    );

    greencircle.moveDown();

    assert.equal(
      bluecircle.getZIndex(),
      1,
      'blue circle should have zindex 1 after relayering'
    );
    assert.equal(
      greencircle.getZIndex(),
      0,
      'green circle should have zindex 0 after relayering'
    );

    layer.draw();
  });

  // ======================================================
  it('layer layer when only one layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(bluecircle);
    stage.add(layer);

    assert.equal(layer.getZIndex(), 0, 'layer should have zindex of 0');

    layer.moveDown();
    assert.equal(layer.getZIndex(), 0, 'layer should have zindex of 0');

    layer.moveToBottom();
    assert.equal(layer.getZIndex(), 0, 'layer should have zindex of 0');

    layer.moveUp();
    assert.equal(layer.getZIndex(), 0, 'layer should have zindex of 0');

    layer.moveToTop();
    assert.equal(layer.getZIndex(), 0, 'layer should have zindex of 0');
  });

  // ======================================================
  it('move blue group on top of green group with moveToTop', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var greenGroup = new Konva.Group();
    var blueGroup = new Konva.Group();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueGroup.add(bluecircle);
    greenGroup.add(greencircle);

    layer.add(blueGroup);
    layer.add(greenGroup);
    stage.add(layer);

    assert.equal(
      blueGroup.getZIndex(),
      0,
      'blue group should have zindex 0 before relayering'
    );
    assert.equal(
      greenGroup.getZIndex(),
      1,
      'green group should have zindex 1 before relayering'
    );

    blueGroup.moveToTop();

    assert.equal(
      blueGroup.getZIndex(),
      1,
      'blue group should have zindex 1 after relayering'
    );
    assert.equal(
      greenGroup.getZIndex(),
      0,
      'green group should have zindex 0 after relayering'
    );

    layer.draw();
  });

  // ======================================================
  it('move blue group on top of green group with moveUp', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var greenGroup = new Konva.Group();
    var blueGroup = new Konva.Group();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    var greencircle = new Konva.Circle({
      x: 280,
      y: stage.height() / 2,
      radius: 70,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    blueGroup.add(bluecircle);
    greenGroup.add(greencircle);

    layer.add(blueGroup);
    layer.add(greenGroup);
    stage.add(layer);

    assert.equal(
      blueGroup.getZIndex(),
      0,
      'blue group should have zindex 0 before relayering'
    );
    assert.equal(
      greenGroup.getZIndex(),
      1,
      'green group should have zindex 1 before relayering'
    );

    blueGroup.moveUp();

    assert.equal(
      blueGroup.getZIndex(),
      1,
      'blue group should have zindex 1 after relayering'
    );
    assert.equal(
      greenGroup.getZIndex(),
      0,
      'green group should have zindex 0 after relayering'
    );

    layer.draw();
  });

  // ======================================================
  it('add and moveTo should work same way (depend on parent)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var greenGroup = new Konva.Group();
    var blueGroup = new Konva.Group();

    var bluecircle = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    bluecircle.moveTo(blueGroup);

    layer.add(blueGroup);
    layer.add(greenGroup);
    stage.add(layer);

    assert.equal(
      blueGroup.getChildren().length,
      1,
      'blue group should have only one children'
    );
    blueGroup.add(bluecircle);
    assert.equal(
      blueGroup.getChildren().length,
      1,
      'blue group should have only one children after adding node twice'
    );

    greenGroup.add(bluecircle);
    assert.equal(
      blueGroup.getChildren().length,
      0,
      'blue group should not have children'
    );
    assert.equal(
      greenGroup.getChildren().length,
      1,
      'green group should have only one children'
    );

    layer.draw();
  });

  // ======================================================
  it('getChildren may use filter function', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();

    var circle1 = new Konva.Circle({
      x: 200,
      y: stage.height() / 2,
      radius: 70,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });
    var circle2 = circle1.clone();
    group.add(circle1).add(circle2);

    var rect = new Konva.Rect({
      name: 'test',
    });
    group.add(rect);

    var circles = group.getChildren(function (node) {
      return node.getClassName() === 'Circle';
    });
    assert.equal(circles.length, 2, 'group has two circle children');
    assert.equal(circles.indexOf(circle1) > -1, true);
    assert.equal(circles.indexOf(circle2) > -1, true);

    var testName = group.getChildren(function (node) {
      return node.name() === 'test';
    });

    assert.equal(testName.length, 1, 'group has one children with test name');

    layer.add(group);

    layer.draw();
  });

  it('add multiple nodes to container', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle1 = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: 'red',
    });
    var circle2 = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: 'white',
    });
    var circle3 = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: 'blue',
    });
    layer.add(circle1, circle2, circle3);
    assert.equal(
      layer.getChildren().length,
      3,
      'layer has exactly three children'
    );
  });
  it('getClientRect - adding a zero bounds shape should result in zero bounds', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var grp = new Konva.Group();
    var zeroRect = new Konva.Rect({ x: 0, y: 0, width: 0, height: 0 });
    grp.add(zeroRect);
    var bounds = grp.getClientRect();
    assert.deepEqual(bounds, {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });
  it('getClientRect - test empty case', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var group = new Konva.Group({
      x: 10,
      y: 10,
    });
    group.add(new Konva.Group());
    assert.deepEqual(group.getClientRect(), {
      x: 10,
      y: 10,
      width: 0,
      height: 0,
    });
  });

  it('get client rect with deep nested hidden shape', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    var group = new Konva.Group({
      draggable: true,
      x: 100,
      y: 40,
    });

    var rect = new Konva.Rect({
      height: 100,
      width: 100,
      fill: 'red',
    });
    group.add(rect);
    layer.add(group);

    var subGroup = new Konva.Group();
    group.add(subGroup);

    subGroup.add(
      new Konva.Rect({
        visible: false,
      })
    );

    stage.add(layer);
    stage.draw();

    var clientRect = group.getClientRect();

    assert.deepEqual(clientRect, {
      x: 100,
      y: 40,
      width: 100,
      height: 100,
    });
  });

  it('getClientRect - test group with invisible child', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var group = new Konva.Group({
      x: 10,
      y: 10,
    });
    layer.add(group);
    layer.draw();
    group.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      })
    );
    group.add(
      new Konva.Rect({
        x: 400,
        y: 400,
        width: 50,
        height: 50,
        visible: false,
      })
    );
    assert.deepEqual(group.getClientRect(), {
      x: 10,
      y: 10,
      width: 50,
      height: 50,
    });
  });

  it('getClientRect - test group with invisible child inside invisible parent', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      visible: false,
    });
    stage.add(layer);
    var group = new Konva.Group({
      x: 10,
      y: 10,
    });
    layer.add(group);
    layer.draw();
    group.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      })
    );
    group.add(
      new Konva.Rect({
        x: 400,
        y: 400,
        width: 50,
        height: 50,
        visible: false,
      })
    );
    assert.deepEqual(group.getClientRect(), {
      x: 10,
      y: 10,
      width: 50,
      height: 50,
    });
  });

  it('getClientRect - test group with visible child inside invisible parent', function () {
    var stage = addStage();
    var layer = new Konva.Layer({
      visible: false,
    });
    stage.add(layer);
    var group = new Konva.Group({
      x: 10,
      y: 10,
    });
    layer.add(group);

    var subGroup = new Konva.Group({
      visible: false,
    });
    group.add(subGroup);
    subGroup.add(
      new Konva.Rect({
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        visible: true,
      })
    );
    subGroup.add(
      new Konva.Rect({
        x: 400,
        y: 400,
        width: 50,
        height: 50,
        visible: true,
      })
    );
    layer.draw();
    assert.deepEqual(group.getClientRect(), {
      x: 10,
      y: 10,
      width: 0,
      height: 0,
    });
  });

  it('get client rect with deep nested hidden shape 2', function () {
    var layer = new Konva.Layer();
    var group = new Konva.Group({
      visible: false,
      x: 100,
      y: 40,
    });

    var rect = new Konva.Rect({
      height: 100,
      width: 100,
      fill: 'red',
    });
    group.add(rect);
    layer.add(group);

    var clientRect = layer.getClientRect();

    assert.deepEqual(clientRect, {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });

  it('getClientRect - test layer', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();

    var rect = new Konva.Rect({
      x: 50,
      y: 100,
      width: 200,
      height: 75,
      fill: 'red',
    });

    group.add(rect);
    layer.add(group);
    stage.add(layer);

    assert.deepEqual(layer.getClientRect(), {
      x: 50,
      y: 100,
      width: 200,
      height: 75,
    });
  });

  it('getClientRect - nested group with a hidden shapes', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var group1 = new Konva.Group();
    layer.add(group1);

    var rect = new Konva.Rect({
      x: 50,
      y: 100,
      width: 200,
      height: 75,
      fill: 'red',
    });
    group1.add(rect);

    var group2 = new Konva.Group();
    layer.add(group2);

    var rect2 = new Konva.Rect({
      x: 0,
      y: 0,
      width: 200,
      height: 75,
      fill: 'red',
      visible: false,
    });
    group1.add(rect2);

    assert.deepEqual(layer.getClientRect(), {
      x: 50,
      y: 100,
      width: 200,
      height: 75,
    });
  });

  it('clip-cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: 50,
      y: 50,
      radius: 30,
      fill: 'red',
    });

    group.add(circle);
    layer.add(group.clip({ x: 25, y: 25, width: 50, height: 50 }));
    stage.add(layer);

    layer.cache();
    stage.draw();

    var data = layer.getContext().getImageData(24, 50, 1, 1).data;
    var isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (24,50)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(50, 24, 1, 1).data;
    isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (50,24)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getHitCanvas().getContext().getImageData(76, 50, 1, 1).data;
    isTransparent = data[3] == 0;

    assert.equal(
      isTransparent,
      true,
      'tested pixel (76,50)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getHitCanvas().getContext().getImageData(50, 76, 1, 1).data;
    isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (50,76)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    var ratio = layer.getCanvas().getPixelRatio();
    data = layer.getContext().getImageData(26 * ratio, 50 * ratio, 1, 1).data;
    var isRed =
      data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (26,50)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(50 * ratio, 26 * ratio, 1, 1).data;
    isRed = data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (50,26)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(74 * ratio, 50 * ratio, 1, 1).data;
    isRed = data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (74,50)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(50 * ratio, 74 * ratio, 1, 1).data;
    isRed = data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (50,74)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );
  });

  it('clip-cache-scale', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
      x: 50,
      y: 50,
      radius: 30,
      fill: 'red',
    });

    group.add(circle);
    layer.add(group.clip({ x: 25, y: 25, width: 50, height: 50 }));
    stage.add(layer);

    layer.cache();
    stage.scale({ x: 2, y: 2 });
    stage.draw();

    var data = layer.getHitCanvas().getContext().getImageData(48, 100, 1, 1)
      .data;
    var isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (48,100)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getHitCanvas().getContext().getImageData(100, 48, 1, 1).data;
    isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (100,48)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getHitCanvas().getContext().getImageData(152, 100, 1, 1).data;
    isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (152,100)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getHitCanvas().getContext().getImageData(100, 152, 1, 1).data;
    isTransparent = data[3] == 0;
    assert.equal(
      isTransparent,
      true,
      'tested pixel (100,152)  should be transparent: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    var ratio = layer.getCanvas().getPixelRatio();
    data = layer.getContext().getImageData(52 * ratio, 100 * ratio, 1, 1).data;
    var isRed =
      data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (52,100)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(100 * ratio, 52 * ratio, 1, 1).data;
    isRed = data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (100,52)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(148 * ratio, 100 * ratio, 1, 1).data;
    isRed = data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (148,100)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );

    data = layer.getContext().getImageData(100 * ratio, 148 * ratio, 1, 1).data;
    isRed = data[0] == 255 && data[1] == 0 && data[2] == 0 && data[3] == 255;
    assert.equal(
      isRed,
      true,
      'tested pixel (100,148)  should be red: ' +
        data[0] +
        '_' +
        data[1] +
        '_' +
        data[2] +
        '_' +
        data[3]
    );
  });
});
