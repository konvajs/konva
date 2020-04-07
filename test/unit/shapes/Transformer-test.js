suite('Transformer', function() {
  function isClose(a, b) {
    return Math.abs(a - b) < 0.000001;
  }

  Konva.Transformer.prototype.simulateMouseDown = function(pos) {
    this.getStage().simulateMouseDown(pos);
  };

  Konva.Transformer.prototype.simulateMouseMove = function(pos) {
    var top = this.getStage().content.getBoundingClientRect().top;
    this._handleMouseMove({
      clientX: pos.x,
      clientY: pos.y + top
    });
    this.getStage().simulateMouseMove(pos);
  };

  Konva.Transformer.prototype.simulateMouseUp = function(pos) {
    this._handleMouseUp(pos);
    this.getStage().simulateMouseUp(pos || { x: 1, y: 1 });
  };

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

  test('can attach transformer into several nodes', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 10,
      y: 10,
      draggable: true,
      width: 100,
      height: 50,
      fill: 'yellow'
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 110,
      y: 60,
      draggable: true,
      width: 100,
      height: 50,
      fill: 'red'
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2]
    });
    layer.add(tr);

    layer.draw();
    assert.equal(tr.x(), rect1.x());
    assert.equal(tr.y(), rect1.y());
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.height());
    assert.equal(tr.rotation(), 0);
  });

  test('try it on a parent of parent', function() {
    var callCount = 0;
    var oldWarn = Konva.Util.warn;
    Konva.Util.warn = function() {
      callCount += 1;
    };

    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      x: 50,
      y: 50
    });
    layer.add(group);

    var rect = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    group.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);

    rect.width(120);
    layer.draw();

    assert.equal(callCount, 1);
    Konva.Util.warn = oldWarn;

    // assert.equal(tr.x(), rect.x() + group.x());
    // assert.equal(tr.y(), rect.y() + group.y());
    // assert.equal(tr.width(), rect.width());
    // assert.equal(tr.height(), rect.height());

    // // manual check of correct position of node
    // var handler = tr.findOne('.bottom-right');
    // var pos = handler.getAbsolutePosition();
    // assert.equal(pos.x, rect.x() + rect.width());
    // assert.equal(pos.y, rect.y() + rect.height());
  });

  test('try set/get node', function() {
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

    var circle = new Konva.Circle({
      x: 10,
      y: 60,
      radius: 100,
      fill: 'red'
    });
    layer.add(circle);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);

    layer.draw();
    assert.equal(tr.node(), rect);

    tr.attachTo(circle);
    assert.equal(tr.node(), circle);
    layer.draw();
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

    tr._fitNodesInto({
      x: 120,
      y: 60,
      width: 50,
      height: 50,
      rotation: Konva.getAngle(45)
    });

    assert.equal(tr.x(), rect.x());
    assert.equal(Math.round(tr.y()), rect.y());
    assert.equal(tr.width(), 50);
    assert.equal(tr.height(), 50);
    assert.equal(tr.rotation(), rect.rotation());
  });

  test('try to fit simple rectangle into negative scale', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
      y: 0,
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

    var box = {
      x: 100,
      y: 0,
      width: -100,
      height: 100,
      rotation: 0
    };

    tr._fitNodesInto(box);

    assert.equal(rect.x(), 100);
    assert.equal(rect.y(), 0);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), -1);
    assert.equal(rect.height(), 100);
    assert.equal(rect.scaleY(), 1);
    assert.equal(rect.rotation(), 0);

    layer.draw();
  });
  test('try to fit rectangle with ignoreStroke = false', function() {
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
      strokeScaleEnabled: false
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      ignoreStroke: true
    });
    layer.add(tr);
    tr.attachTo(rect);

    layer.draw();

    tr._fitNodesInto({
      x: 20,
      y: 20,
      width: 200,
      height: 200,
      rotation: 0
    });

    assert.equal(rect.x(), 20);
    assert.equal(rect.y(), 20);
    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
    assert.equal(rect.scaleX(), 2);
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

    console.log(tr);
    layer.draw();

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

    tr._fitNodesInto({
      x: 100,
      y: 70,
      width: 100,
      height: 100,
      rotation: 0
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

    tr._fitNodesInto({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      rotation: 0
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

    tr._fitNodesInto({
      x: 40,
      y: 40,
      width: 160,
      height: 80,
      rotation: 0
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

    tr._fitNodesInto({
      x: 80,
      y: 0,
      width: 80,
      height: 80,
      rotation: Konva.getAngle(90)
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

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90)
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

    tr._fitNodesInto({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      rotation: 0
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

    stage.simulateMouseUp({
      x: 100,
      y: 60
    });
  });

  test('can add padding', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 30,
      y: 30,
      draggable: true,
      width: 100,
      height: 100,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      padding: 20
    });
    layer.add(tr);
    layer.draw();

    stage.simulateMouseDown({
      x: 10,
      y: 80
    });

    var top = stage.content.getBoundingClientRect().top;
    tr._handleMouseMove({
      clientX: 60,
      clientY: 80 + top
    });

    tr._handleMouseUp({
      clientX: 200,
      clientY: 150
    });
    stage.simulateMouseUp({
      x: 200,
      y: 150
    });

    assert.equal(rect.x(), 80);
    assert.equal(rect.y(), 30);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 0.5);
    assert.equal(rect.height(), 100);
    assert.equal(rect.scaleY(), 1);
  });

  test('keep ratio should allow negative scaling', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 150,
      y: 10,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    // rect.on('transform', () => {
    //   console.log(tr.getActiveAnchor(), tr._anchorDragOffset);
    // });
    // throw 1;

    var anchor = tr.findOne('.top-right');
    var pos = anchor.getAbsolutePosition();

    stage.simulateMouseDown({
      x: pos.x,
      y: pos.y
    });
    var box = stage.content.getBoundingClientRect();
    tr._handleMouseMove({
      clientX: box.left + pos.x - 100,
      clientY: box.top + pos.y + 100
    });

    // here is duplicate, because transformer is listening window events
    tr._handleMouseUp({
      clientX: box.left + pos.x - 100,
      clientY: box.top + pos.y + 100
    });
    stage.simulateMouseUp({
      x: pos.x - 100,
      y: pos.y + 100
    });

    assert.equal(rect.scaleX(), -1);
    assert.equal(rect.scaleY(), -1);
  });

  test.skip('visual test', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var src = 'assets/darth-vader.jpg';
    Konva.Image.fromURL(src, function(image) {
      image.setAttrs({
        draggable: true,
        scaleX: 0.5,
        scaleY: 0.5,
        shadowColor: 'black',
        // shadowBlur: 10,
        shadowOffset: { x: 10, y: 10 }
      });
      layer.add(image);
      var tr = new Konva.Transformer({
        node: image,
        keepRatio: false
      });
      layer.add(tr);
      layer.draw();
      throw 1;
      done();
    });
  });

  test('switch scaling with padding - x', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
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

    layer.draw();

    tr.simulateMouseDown({
      x: 0,
      y: 60
    });

    tr.simulateMouseMove({
      x: 125,
      y: 60
    });

    assert.equal(rect.x(), 115);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    tr.simulateMouseMove({
      x: 125,
      y: 60
    });

    assert.equal(rect.x(), 115);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.scaleY(), 1);

    // switch again
    tr.simulateMouseMove({
      x: 90,
      y: 60
    });

    assert.equal(rect.x(), 100);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleY(), -1);
    assert.equal(rect.scaleX() + 0.1 < 0.0001, true);
    assert.equal(rect.height(), 100);

    tr.simulateMouseUp();
  });

  test('switch scaling with padding - y', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
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

    layer.draw();

    tr.simulateMouseDown({
      x: 60,
      y: 0
    });

    tr.simulateMouseMove({
      x: 60,
      y: 125
    });

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 115);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleY(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    tr.simulateMouseMove({
      x: 60,
      y: 125
    });

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 115);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleY(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    // switch again
    tr.simulateMouseMove({
      x: 60,
      y: 90
    });

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 100);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 1);
    assert.equal(rect.scaleY(), 0.1);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    tr.simulateMouseUp();
  });

  test('switch horizontal scaling with (top-left anchor)', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
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

    tr.simulateMouseDown({
      x: 0,
      y: 0
    });

    tr.simulateMouseMove({
      x: 150,
      y: 50
    });
    layer.draw();

    assert.equal(rect.x(), 150);
    assert.equal(rect.y(), 50);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), -0.5);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    tr.simulateMouseMove({
      x: 98,
      y: 2.859375
    });
    tr.simulateMouseMove({
      x: 98,
      y: 2.859375
    });
    tr.simulateMouseMove({
      x: 98,
      y: 2.859375
    });
    tr.simulateMouseMove({
      x: 100,
      y: 2.859375
    });
    layer.draw();
    tr.simulateMouseMove({
      x: 101,
      y: 2.859375
    });
    layer.draw();
    tr.simulateMouseMove({
      x: 101,
      y: 2.859375
    });
    layer.draw();
    tr.simulateMouseMove({
      x: 101,
      y: 2.859375
    });
    layer.draw();
    tr.simulateMouseMove({
      x: 102,
      y: 2.859375
    });
    layer.draw();
    // switch again
    tr.simulateMouseMove({
      x: 0,
      y: 0
    });

    assert.equal(isClose(rect.x(), 0), true);
    assert.equal(Math.round(rect.y()), 0);
    assert.equal(rect.width(), 100);
    assert.equal(Math.round(rect.scaleY()), -1);
    assert.equal(Math.round(rect.scaleX()), -1);
    assert.equal(rect.height(), 100);

    tr.simulateMouseUp();
  });

  // TODO: doesn't work!!!
  test.skip('switch vertical scaling with (top-left anchor)', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
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

    tr.simulateMouseDown({
      x: 0,
      y: 0
    });

    tr.simulateMouseMove({
      x: 0,
      y: 200
    });
    layer.draw();

    assert.equal(rect.x(), 0);
    assert.equal(rect.y(), 200);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 1);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);

    tr.simulateMouseMove({
      x: 0,
      y: 0
    });
    layer.draw();
    tr.simulateMouseUp();

    assert.equal(rect.x(), 0);
    assert.equal(rect.y(), 100);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 1);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 0);
    assert.equal(rect.scaleY(), -1);
  });

  test('switch scaling with padding for rotated - x', function() {
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
      rotation: 90
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      padding: 10
    });
    layer.add(tr);

    layer.draw();

    tr.simulateMouseDown({
      x: 60,
      y: 0
    });

    tr.simulateMouseMove({
      x: 60,
      y: 125
    });

    assert.equal(rect.x(), 110);
    assert.equal(rect.y(), 115);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 90);

    tr.simulateMouseMove({
      x: 60,
      y: 125
    });

    assert.equal(rect.x(), 110);
    assert.equal(rect.y(), 115);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.scaleY(), 1);

    // switch again
    tr.simulateMouseMove({
      x: 60,
      y: 90
    });

    assert.equal(rect.x(), 110);
    assert.equal(rect.y() - 120 < 0.001, true);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX() + 0.1 < 0.0001, true);
    assert.equal(rect.scaleY(), -1);

    assert.equal(rect.height(), 100);

    tr.simulateMouseUp();
  });

  test('switch scaling with padding for rotated - y', function() {
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
      rotation: 90
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      padding: 10
    });
    layer.add(tr);

    layer.draw();

    tr.simulateMouseDown({
      x: 0,
      y: 60
    });

    tr.simulateMouseMove({
      x: 125,
      y: 60
    });

    assert.equal(rect.x(), 110);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 1);
    assert.equal(rect.scaleY(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 90);

    tr.simulateMouseMove({
      x: 125,
      y: 60
    });

    assert.equal(rect.x(), 110);
    assert.equal(rect.y(), 10);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 1);
    assert.equal(rect.scaleY(), -0.05);
    assert.equal(rect.height(), 100);
    assert.equal(rect.rotation(), 90);

    // switch again
    tr.simulateMouseMove({
      x: 90,
      y: 60
    });

    assert.equal(rect.x(), 110);
    assert.equal(rect.y() - 120 < 0.001, true);
    assert.equal(rect.width(), 100);
    assert.equal(rect.scaleX(), 1);
    assert.equal(rect.scaleY(), 0.1);
    assert.equal(rect.height(), 100);

    tr.simulateMouseUp();
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

  test('check transformer with drag&drop and scaled shape', function() {
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
      scaleX: 2
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

    layer.draw();

    assert.equal(rect.x(), 10);
    assert.equal(rect.y(), 10);

    assert.equal(tr.x(), 10);
    assert.equal(tr.y(), 10);

    assert.equal(tr.width(), 200);

    stage.simulateMouseUp({
      x: 30,
      y: 30
    });
  });

  test.skip('on negative scaleY should move rotater', function() {
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

  // TODO: why it doesn't work?
  test.skip('try rotated scaled rect', function() {
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
      clientX: pos.x + 100,
      clientY: pos.y - 100 + top
    });

    // here is duplicate, because transformer is listening window events
    tr._handleMouseUp({
      clientX: pos.x + 100,
      clientY: pos.y - 100 + top
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

  test('check correct cursor off on Transformer destroy', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      x: 0,
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
      x: 100,
      y: 100
    });
    stage.simulateMouseDown({
      x: 100,
      y: 100
    });

    assert.equal(stage.content.style.cursor, 'nwse-resize');

    var target = stage.getIntersection({
      x: 100,
      y: 100
    });
    var top = stage.content.getBoundingClientRect().top;
    tr._handleMouseMove({
      clientX: 120,
      clientY: 100 + top
    });

    // here is duplicate, because transformer is listening window events
    tr._handleMouseUp({
      clientX: 120,
      clientY: 100 + top
    });
    stage.simulateMouseUp({
      x: 120,
      y: 100
    });

    tr.destroy();
    stage.simulateMouseMove({
      x: 140,
      y: 100
    });
    assert.equal(stage.content.style.cursor, '');
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

  test.skip('check fit and correct cursor on rotated parent', function() {
    var stage = addStage();
    var layer = new Konva.Layer({
      x: 100,
      y: -50,
      rotation: 90
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

    var box = {
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90)
    };
    tr._fitNodesInto(box);

    assert.equal(Math.round(tr.x()), Math.round(box.x));
    assert.equal(Math.round(tr.y()), Math.round(box.y));
    assert.equal(Math.round(tr.width()), Math.round(box.width));
    assert.equal(Math.round(tr.height()), Math.round(box.height));

    stage.simulateMouseMove({
      x: 50,
      y: 1
    });
    assert.equal(stage.content.style.cursor, 'ew-resize');
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

  test('transform events check', function() {
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

    var callCount = 0;
    rect.on('transformstart', function(e) {
      callCount += 1;
      assert.equal(e.target, rect);
      assert.equal(tr.getActiveAnchor(), 'top-left');
    });

    rect.on('transform', function(e) {
      callCount += 1;
      assert.equal(e.target, rect);
      assert.equal(tr.getActiveAnchor(), 'top-left');
    });

    rect.on('transformend', function(e) {
      callCount += 1;
      assert.equal(e.target, rect);
      assert.equal(tr.getActiveAnchor(), 'top-left');
    });

    tr.on('transformstart', function(e) {
      callCount += 1;
      assert.equal(e.target, rect);
    });

    tr.on('transform', function(e) {
      callCount += 1;
      assert.equal(e.target, rect);
    });

    tr.on('transformend', function(e) {
      callCount += 1;
      assert.equal(e.target, rect);
    });

    stage.simulateMouseDown({
      x: 50,
      y: 50
    });

    var top = stage.content.getBoundingClientRect().top;
    tr._handleMouseMove({
      clientX: 60,
      clientY: 60 + top
    });

    tr._handleMouseUp({
      clientX: 60,
      clientY: 60 + top
    });
    stage.simulateMouseUp({
      x: 60,
      y: 60
    });
    assert.equal(callCount, 6);
    assert.equal(tr.getActiveAnchor(), null);
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

    assert.equal(tr._cache.get('transform').m[4], 50);

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

    tests.forEach(function(test) {
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

  test('centered scaling - no keep ratio', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      centeredScaling: true,
      keepRatio: false
    });
    layer.add(tr);

    tests.forEach(function(test) {
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
        clientY: test.endPos.y + top
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

  test('centered scaling', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      centeredScaling: true
    });
    layer.add(tr);

    tests.forEach(function(test) {
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
        clientY: test.endPos.y + top
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

  test.skip('centered scaling on flip + keep ratio', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect = new Konva.Rect({
      draggable: true,
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      centeredScaling: true,
      keepRatio: true
    });
    layer.add(tr);

    rect.setAttrs({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
      scaleX: 1,
      scaleY: 1
    });
    tr.update();

    layer.draw();

    tr.simulateMouseDown({
      x: 0,
      y: 0
    });
    tr.simulateMouseMove({
      x: 200,
      y: 0
    });
    assert.equal(isClose(rect.x(), 200), true);
    assert.equal(isClose(rect.y(), 0), true);
    assert.equal(rect.width(), 200);
    assert.equal(Math.round(rect.scaleY()), 1);
    assert.equal(Math.round(rect.scaleX()), -1);
    assert.equal(rect.height(), 100);

    tr.simulateMouseMove({
      x: 200,
      y: 0
    });
    tr.simulateMouseUp({
      x: 0,
      y: 0
    });
    layer.draw();
    assert.equal(isClose(rect.x(), 200), true);
    assert.equal(isClose(rect.y(), 0), true);
    assert.equal(rect.width(), 200);
    assert.equal(Math.round(rect.scaleY()), -1);
    assert.equal(Math.round(rect.scaleX()), 1);
    assert.equal(rect.height(), 100);
  });

  test('transform scaled (in one direction) node', function() {
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
      fillLinearGradientColorStops: [0, 'red', 0.8, 'yellow']
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);

    layer.draw();

    stage.simulateMouseDown({
      x: 150,
      y: 150
    });

    var target = stage.getIntersection({
      x: 150,
      y: 150
    });
    var top = Math.round(stage.content.getBoundingClientRect().top);
    tr._handleMouseMove({
      clientX: 100,
      clientY: 100 + top
    });

    // here is duplicate, because transformer is listening window events
    tr._handleMouseUp({
      clientX: 100,
      clientY: 100 + top
    });
    stage.simulateMouseUp({
      x: 100,
      y: 100
    });
    layer.draw();

    assert.equal(rect.width() * rect.scaleX() - 50 < 1, true, ' width check');
    assert.equal(rect.height() * rect.scaleY() + 50 < 1, true, ' height check');
  });

  test('transformer should ignore shadow', function() {
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
      shadowBlur: 10
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
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
      rotation: 0
    });

    assert.equal(rect.x(), 50);
    assert.equal(rect.y(), 50);

    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
  });

  test.skip('transformer should skip scale on stroke if strokeScaleEnabled = false', function() {
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
      strokeScaleEnabled: false
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
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
      rotation: 0
    });

    assert.equal(rect.x(), 50);
    assert.equal(rect.y(), 50);

    assert.equal(rect.width(), 100);
    assert.equal(rect.height(), 100);
  });

  test('check calculations when the size = 0', function() {
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
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0
    });
    layer.draw();
    assert.equal(rect.scaleX(), 1, '');
  });

  test('attrs change - arc', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Arc({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      innerRadius: 40,
      outerRadius: 70,
      angle: 60,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - line', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Arrow({
      x: stage.getWidth() / 4,
      y: stage.getHeight() / 4,
      points: [0, 0, stage.width() / 2, stage.height() / 2],
      pointerLength: 20,
      pointerWidth: 20,
      fill: 'black',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - circle', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 40,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
    });
    layer.add(tr);

    shape.radius(100);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  test('attrs change - ellipse', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Ellipse({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: {
        x: 100,
        y: 50
      },
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - rect', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Rect({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      width: 100,
      height: 100,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - path', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Path({
      x: 50,
      y: 40,
      data:
        'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
      fill: 'green'
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
    });
    layer.add(tr);

    shape.data('M200,100h100v50z');
    layer.draw();

    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  test('attrs change - regular polygon', function() {
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
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
    });
    layer.add(tr);

    shape.radius(100);
    layer.draw();

    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  test('attrs change - ring', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Ring({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      innerRadius: 40,
      outerRadius: 70,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - star', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Star({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      numPoints: 6,
      innerRadius: 40,
      outerRadius: 70,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - wedge', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Wedge({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      angle: 60,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
    });
    layer.add(tr);

    shape.radius(100);
    layer.draw();
    var rect = Konva.Util._assign({}, tr._getNodeRect());
    delete rect.rotation;
    assert.deepEqual(shape.getClientRect(), rect);
  });

  test('attrs change - text', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.Text({
      x: stage.getWidth() / 2,
      y: 15,
      text: 'Simple Text',
      fontSize: 60,
      fontFamily: 'Calibri',
      fill: 'green'
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('attrs change - text path', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var shape = new Konva.TextPath({
      x: 0,
      y: 50,
      fill: '#333',
      fontSize: 16,
      fontFamily: 'Arial',
      text:
        "All the world's a stage, and all the men and women merely players.",
      data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50'
    });
    layer.add(shape);

    var tr = new Konva.Transformer({
      node: shape
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

  test('make sure transformer events are not cloned', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: stage.width() / 5,
      y: stage.height() / 5,
      width: 50,
      height: 50,
      fill: 'green',
      draggable: true
    });

    layer.add(rect1);

    var tr1 = new Konva.Transformer({
      node: rect1
    });
    layer.add(tr1);

    const rect2 = rect1.clone({
      fill: 'red',
      x: stage.width() / 3,
      y: stage.height() / 3
    });
    layer.add(rect2);

    tr1.destroy();

    let tr2 = new Konva.Transformer({
      node: rect2
    });
    layer.add(tr2);

    // should not throw error
    rect2.width(100);

    stage.draw();
  });

  test('try to move anchor on scaled with css stage', function() {
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
      fill: 'yellow'
    });
    layer.add(rect);

    var tr = new Konva.Transformer({
      node: rect,
      keepRatio: false
    });
    layer.add(tr);
    layer.draw();

    stage.simulateMouseMove({
      x: 50,
      y: 50
    });
    stage.simulateMouseDown({
      x: 50,
      y: 50
    });

    var target = stage.getIntersection({
      x: 50,
      y: 50
    });
    var top = stage.content.getBoundingClientRect().top;
    tr._handleMouseMove({
      clientX: 100,
      clientY: 50 + top
    });

    // here is duplicate, because transformer is listening window events
    tr._handleMouseUp({
      clientX: 100,
      clientY: 50 + top
    });
    stage.simulateMouseUp({
      x: 100,
      y: 50
    });

    assert.equal(rect.width() * rect.scaleX(), 200);
  });

  test('rotate several nodes', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow'
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red'
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2]
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90)
    });

    assert.equal(tr.x(), rect1.x());
    assert.equal(tr.y(), rect1.y());
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.width());
    assert.equal(tr.rotation(), 90);
    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(180)
    });

    assert.equal(tr.x(), rect1.x());
    assert.equal(tr.y(), rect1.y());
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.width());
    assert.equal(tr.rotation(), 180);
  });

  test('reattach to several nodes', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow'
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 100,
      y: 100,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red'
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2]
    });
    layer.add(tr);
    layer.draw();

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 100,
      height: 100,
      rotation: Konva.getAngle(90)
    });

    assert.equal(tr.x(), rect1.x());
    assert.equal(tr.y(), rect1.y());
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.width());
    assert.equal(tr.rotation(), 90);
    layer.draw();

    tr.nodes([rect1, rect2]);

    assert.equal(tr.x(), 0);
    assert.equal(tr.y(), 0);
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.width());
    assert.equal(tr.rotation(), 0);
  });

  test('rotate several nodes inside different parents', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow'
    });
    layer.add(rect1);

    var group = new Konva.Group({
      x: 50,
      scaleX: 2
    });

    layer.add(group);

    var rect2 = new Konva.Rect({
      x: 0,
      y: 50,
      draggable: true,
      width: 25,
      height: 50,
      fill: 'red'
    });
    group.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2]
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
      rotation: 0
    };

    tr._fitNodesInto(box);

    assert.deepEqual(box, tr._getNodeRect());

    assert.equal(rect1.x(), 0);
    assert.equal(rect1.y(), 0);
    assert.equal(rect1.width(), 50);
    assert.equal(rect1.height(), 50);
    assert.equal(rect1.rotation(), 0);

    assert.equal(rect2.x(), 0);
    assert.equal(rect2.y(), 50);
    assert.equal(rect2.width(), 25);
    assert.equal(rect2.height(), 50);
    assert.equal(rect2.rotation(), 0);
  });

  test('can attach transformer into several nodes and fit into negative scale', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var rect1 = new Konva.Rect({
      x: 0,
      y: 0,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'yellow'
    });
    layer.add(rect1);

    var rect2 = new Konva.Rect({
      x: 50,
      y: 50,
      draggable: true,
      width: 50,
      height: 50,
      fill: 'red'
    });

    layer.add(rect2);

    var tr = new Konva.Transformer({
      nodes: [rect1, rect2]
    });
    layer.add(tr);

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: 0,
      height: 100,
      rotation: 0
    });

    tr._fitNodesInto({
      x: 100,
      y: 0,
      width: -100,
      height: 100,
      rotation: 0
    });

    layer.draw();
    assert.equal(Math.round(tr.x()), 0);
    assert.equal(Math.round(tr.y()), 0);
    assert.equal(tr.width(), rect1.width() + rect2.width());
    assert.equal(tr.height(), rect1.height() + rect2.height());
    assert.equal(tr.rotation(), 0);
  });
});
