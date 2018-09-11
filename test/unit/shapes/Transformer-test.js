suite('Transformer', function() {
  // ======================================================
  test('init transformer on simple rectangle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
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

  test('try to fit simple rectangle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();

    tr._fitNodeInto({
      x: 120,
      y: 60,
      width: 50,
      height: 50,
      rotation: 45
    });

    assert.equal(tr.x(), rect.x());
    assert.equal(tr.y(), rect.y());
    assert.equal(tr.width(), 50);
    assert.equal(tr.height(), 50);
    assert.equal(tr.rotation(), rect.rotation());
  });

  test('listen shape changes', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    rect.setAttrs({
      x: 50,
      y: 50,
      width: 100,
      height: 100
    });
    layer.draw();
    assert.equal(tr.x(), rect.x());
    assert.equal(tr.y(), rect.y());
    assert.equal(tr.width(), rect.width());
    assert.equal(tr.height(), rect.height());
    assert.equal(tr.findOne('.back').width(), rect.width());
  });

  test('add transformer for transformed rect', function() {
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
      scaleY: 1.5
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), rect.x());
    assert.equal(tr.y(), rect.y());
    assert.equal(tr.width(), rect.width() * rect.scaleX());
    assert.equal(tr.height(), rect.height() * rect.scaleY());
    assert.equal(tr.rotation(), rect.rotation());
  });

  test('try to fit a transformed rect', function() {
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
      scaleY: 1.5
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();

    tr._fitNodeInto({
      x: 100,
      y: 70,
      width: 100,
      height: 100
    });

    assert.equal(rect.x(), 100);
    assert.equal(rect.y(), 70);
    assert.equal(rect.width() * rect.scaleX(), 100);
    assert.equal(rect.height() * rect.scaleY(), 100);
    assert.equal(rect.rotation(), rect.rotation());
  });

  test('add transformer for transformed rect with offset', function() {
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
      offsetY: 50
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), rect.width() * rect.scaleX());
    assert.equal(tr.height(), rect.height() * rect.scaleY());
    assert.equal(tr.rotation(), rect.rotation());
  });

  test('fit rect with offset', function() {
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
      offsetY: 50
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    tr._fitNodeInto({
      x: 0,
      y: 0,
      width: 200,
      height: 100
    });
    layer.draw();

    assert.equal(rect.x(), 100);
    assert.equal(rect.y(), 50);
    assert.equal(rect.width() * rect.scaleX(), 200);
    assert.equal(rect.height() * rect.scaleY(), 100);
    assert.equal(rect.rotation(), rect.rotation());

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), 200);
    assert.equal(tr.height(), 100);
    assert.equal(rect.rotation(), rect.rotation());
  });

  test('add transformer for circle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      draggable: true,
      radius: 40,
      fill: 'yellow'
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(circle);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), circle.width() * circle.scaleX());
    assert.equal(tr.height(), circle.height() * circle.scaleY());
    assert.equal(tr.rotation(), circle.rotation());
  });

  test('fit a circle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      draggable: true,
      radius: 40,
      fill: 'yellow'
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(circle);

    tr._fitNodeInto({
      x: 40,
      y: 40,
      width: 160,
      height: 80
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

  test('fit a rotated circle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 40,
      y: 40,
      draggable: true,
      radius: 40,
      fill: 'yellow'
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(circle);

    tr._fitNodeInto({
      x: 80,
      y: 0,
      width: 80,
      height: 80,
      rotation: 90
    });
    layer.draw();

    assert.equal(circle.x(), 40);
    assert.equal(circle.y(), 40);
    assert.equal(circle.width() * circle.scaleX(), 80);
    assert.equal(circle.height() * circle.scaleY(), 80);
    assert.equal(circle.rotation(), 90);

    assert.equal(tr.x(), 80);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), 80);
    assert.equal(tr.height(), 80);
  });

  test('add transformer for transformed circle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var circle = new Konva.Circle({
      x: 100,
      y: 100,
      draggable: true,
      radius: 40,
      fill: 'yellow',
      scaleX: 1.5
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(circle);

    layer.draw();
    assert.equal(tr.getClassName(), 'Transformer');

    assert.equal(tr.x(), 40);
    assert.equal(tr.y(), 60);
    assert.equal(tr.width(), 120);
    assert.equal(tr.height(), 80);
    assert.equal(tr.rotation(), 0);
  });

  test('add transformer for rotated circle', function() {
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
      rotation: 90
    });
    layer.add(circle);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(circle);

    layer.draw();

    assert.equal(tr.x(), 140);
    assert.equal(tr.y(), 40);
    assert.equal(tr.width(), 120);
    assert.equal(tr.height(), 80);
    assert.equal(tr.rotation(), circle.rotation());
  });

  test('add transformer to group', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 50,
      y: 50,
      draggable: true
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      radius: 100,
      fill: 'red',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      radius: 100,
      fill: 'yellow',
      x: 50,
      y: 50,
      width: 100,
      height: 100
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(group);

    layer.draw();

    assert.equal(tr.x(), group.x());
    assert.equal(tr.y(), group.y());
    assert.equal(tr.width(), 150);
    assert.equal(tr.height(), 150);
    assert.equal(tr.rotation(), 0);
  });

  test('rotated fit group', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      fill: 'red',
      x: -50,
      y: -50,
      width: 50,
      height: 50
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      fill: 'yellow',
      x: 0,
      y: 0,
      width: 50,
      height: 50
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(group);

    tr._fitNodeInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: 90
    });
    layer.draw();

    var rect = group.getClientRect();

    assert.equal(group.x(), 50);
    assert.equal(group.y(), 50);
    assert.equal(rect.width, 100);
    assert.equal(rect.height, 100);
    assert.equal(group.rotation(), 90);

    assert.equal(tr.x(), 100);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), 100);
    assert.equal(tr.height(), 100);
  });

  test('add transformer to another group', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      fill: 'red',
      x: -50,
      y: -50,
      width: 50,
      height: 50
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      fill: 'yellow',
      x: 0,
      y: 0,
      width: 50,
      height: 50
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(group);

    layer.draw();

    assert.equal(tr.x(), 50);
    assert.equal(tr.y(), 50);
    assert.equal(tr.width(), 100);
    assert.equal(tr.height(), 100);
    assert.equal(tr.rotation(), 0);
  });

  test('fit group', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true
    });
    layer.add(group);

    var shape1 = new Konva.Rect({
      fill: 'red',
      x: -50,
      y: -50,
      width: 50,
      height: 50
    });

    group.add(shape1);

    var shape2 = new Konva.Rect({
      fill: 'yellow',
      x: 0,
      y: 0,
      width: 50,
      height: 50
    });
    group.add(shape2);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(group);

    tr._fitNodeInto({
      x: 0,
      y: 0,
      width: 200,
      height: 100
    });
    layer.draw();

    var rect = group.getClientRect();

    assert.equal(group.x(), 100);
    assert.equal(group.y(), 50);
    assert.equal(rect.width, 200);
    assert.equal(rect.height, 100);

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), 200);
    assert.equal(tr.height(), 100);
  });

  test('toJSON should not save attached node and children', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();

    var json = tr.toJSON();
    var object = JSON.parse(json);

    assert.equal(object.attrs.node, undefined);
    assert.equal(object.children, undefined);
  });

  test('make sure we can work without inner node', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var tr = new Konva.Transformer();
    layer.add(tr);

    layer.draw();
  });

  test('reset attrs on node set', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);
    layer.draw();

    assert.equal(tr.getWidth(), 0);

    tr.attachTo(rect);
    assert.equal(tr.getWidth(), 100);
  });

  test('can destroy without attached node', function() {
    var tr = new Konva.Transformer();
    tr.destroy();
  });

  test('can destroy with attached node while resize', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);

    layer.draw();

    stage.simulateMouseDown({
      x: 100,
      y: 60
    });

    assert.equal(tr.isTransforming(), true);

    tr.destroy();

    assert.equal(tr.isTransforming(), false);

    assert.equal(tr.getNode(), undefined);
  });

  test('can add padding', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      padding: 10
    });
    layer.add(tr);

    tr._fitNodeInto({
      x: 0,
      y: 0,
      width: 120,
      height: 120
    });

    layer.draw();

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
  });

  test('can add padding with rotation', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      padding: 10
    });
    layer.add(tr);

    tr._fitNodeInto({
      x: 120,
      y: 0,
      width: 120,
      height: 120,
      rotation: 90
    });

    layer.draw();

    assert.equal(rect.x(), 110);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 90);
  });

  test('transformer should automatically track attr changes of a node', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
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

  test('on detach should remove all listeners', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 100,
      y: 60,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
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
    tr._clearCache = function() {
      called = true;
    };
    rect.width(50);
    assert.equal(called, false, 'don not call clear cache');
  });

  test('check transformer with drag&drop', function() {
    var stage = addStage();

    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: 'green',
      draggable: true
    });

    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);

    layer.draw();

    stage.simulateMouseDown({
      x: 20,
      y: 20
    });

    stage.simulateMouseMove({
      x: 30,
      y: 30
    });

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 10);

    assert.equal(tr.x(), 10);
    assert.equal(tr.y(), 10);

    stage.simulateMouseUp({
      x: 30,
      y: 30
    });
  });

  test('on negative scaleY should move rotater', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 160,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow',
      scaleY: -1
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    var rotater = tr.findOne('.rotater');
    var pos = rotater.getAbsolutePosition();

    assert.equal(pos.x, 100);

    assert.equal(pos.y, 210);
  });

  test('try rotated scaled rect', function() {
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
      scaleY: -1
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    var rotater = tr.findOne('.rotater');
    var pos = rotater.getAbsolutePosition();

    stage.simulateMouseDown({
      x: pos.x,
      y: pos.y
    });
    var top = stage.content.getBoundingClientRect().top;
    tr._handleMouseMove({
      target: rotater,
      clientX: pos.x + 100,
      clientY: pos.y - 100 + top
    });

    // here is duplicate, because transformer is listening window events
    tr._handleMouseUp({
      clientX: pos.x + 100,
      clientY: pos.y - 50 + top
    });
    stage.simulateMouseUp({
      x: 100,
      y: 100
    });

    assert.equal(rect.rotation(), -90);
  });

  test('check correct cursor on scaled shape', function() {
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
      scaleY: -1
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    stage.simulateMouseMove({
      x: 50,
      y: 1
    });
    assert.equal(stage.content.style.cursor, 'nwse-resize');
  });

  test('check correct cursor on scaled parent', function() {
    var stage = addStage();
    var layer = new Konva.Layer({
      y: 100,
      scaleY: -1
    });
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 0,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    stage.simulateMouseMove({
      x: 50,
      y: 1
    });
    assert.equal(stage.content.style.cursor, 'nwse-resize');
  });

  test('stopTransform method', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    stage.simulateMouseDown({
      x: 50,
      y: 50
    });

    var top = stage.content.getBoundingClientRect().top;
    tr._handleMouseMove({
      target: tr.findOne('.top-left'),
      clientX: 60,
      clientY: 60 + top
    });

    assert.equal(tr.isTransforming(), true);
    assert.equal(rect.x(), 60);

    var transformend = 0;
    rect.on('transformend', function() {
      transformend += 1;
    });

    tr.stopTransform();

    assert.equal(transformend, 1);

    assert.equal(tr.isTransforming(), false);
    assert.equal(rect.x(), 60);

    // here is duplicate, because transformer is listening window events
    stage.simulateMouseUp({
      x: 100,
      y: 100
    });
  });

  test('on force update should clear transform', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 50,
      y: 50
    });
    layer.add(group);

    var tr = new Konva.Transformer();
    layer.add(tr);
    tr.attachTo(group);

    layer.draw();

    assert.equal(tr._cache.transform.m[4], 50);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    group.add(rect);

    tr.forceUpdate();
    layer.draw();

    assert.equal(tr._cache.transform.m[4], 100);

    // tr._fitNodeInto({
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

  test('test cache reset on attach', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 20,
      y: 20,
      draggable: true,
      width: 150,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer();
    layer.add(tr);

    // make draw to set all caches
    layer.draw();
    // then attach
    tr.attachTo(rect);

    layer.draw();

    var shape = layer.getIntersection({
      x: 20,
      y: 20
    });
    assert.equal(shape.name(), 'top-left _anchor');
  });

  test('check rotator size on scaled transformer', function() {
    var stage = addStage();
    var layer = new Konva.Layer({
      scaleX: 10,
      scaleY: 10
    });
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 5,
      y: 16,
      draggable: true,
      width: 10,
      height: 10,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
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

  test('if alt is pressed should transform around center', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);

    var tests = [
      {
        name: 'top-left',
        startPos: {
          x: 0,
          y: 0
        },
        endPos: {
          x: 25,
          y: 25
        },
        expectedWidth: 50,
        expectedHeight: 50
      },
      {
        name: 'top-center',
        startPos: {
          x: 50,
          y: 0
        },
        endPos: {
          x: 50,
          y: 25
        },
        expectedWidth: 100,
        expectedHeight: 50
      },
      {
        name: 'top-right',
        startPos: {
          x: 100,
          y: 0
        },
        endPos: {
          x: 75,
          y: 25
        },
        expectedWidth: 50,
        expectedHeight: 50
      },
      {
        name: 'middle-left',
        startPos: {
          x: 0,
          y: 50
        },
        endPos: {
          x: 25,
          y: 50
        },
        expectedWidth: 50,
        expectedHeight: 100
      },
      {
        name: 'middle-right',
        startPos: {
          x: 100,
          y: 50
        },
        endPos: {
          x: 75,
          y: 50
        },
        expectedWidth: 50,
        expectedHeight: 100
      },
      {
        name: 'bottom-left',
        startPos: {
          x: 0,
          y: 100
        },
        endPos: {
          x: 25,
          y: 75
        },
        expectedWidth: 50,
        expectedHeight: 50
      },
      {
        name: 'bottom-center',
        startPos: {
          x: 50,
          y: 100
        },
        endPos: {
          x: 50,
          y: 75
        },
        expectedWidth: 100,
        expectedHeight: 50
      },
      {
        name: 'bottom-right',
        startPos: {
          x: 100,
          y: 100
        },
        endPos: {
          x: 75,
          y: 75
        },
        expectedWidth: 50,
        expectedHeight: 50
      }
    ];

    tests.forEach(test => {
      rect.setAttrs({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1
      });
      tr.update();

      layer.draw();

      stage.simulateMouseDown(test.startPos);

      var target = stage.getIntersection(test.startPos);
      var top = stage.content.getBoundingClientRect().top;
      tr._handleMouseMove({
        target: target,
        clientX: test.endPos.x,
        clientY: test.endPos.y + top,
        altKey: true
      });

      // here is duplicate, because transformer is listening window events
      tr._handleMouseUp({
        clientX: test.endPos.x,
        clientY: test.endPos.y + top
      });
      stage.simulateMouseUp({
        x: test.endPos.x,
        y: test.endPos.y
      });
      layer.draw();

      assert.equal(
        rect.width() * rect.scaleX(),
        test.expectedWidth,
        test.name + ' width check'
      );
      assert.equal(
        rect.height() * rect.scaleY(),
        test.expectedHeight,
        test.name + ' height check'
      );
    });
  });
});
