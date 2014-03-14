suite('Container', function() {

    // ======================================================
    test('clip', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            clip: {x:0, y:0, width:stage.getWidth() / 2, height:100}
        });
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();
    });

    // ======================================================
    test('adder validation', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
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
            stage.add(stage);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding stage to stage');
        stage.remove();

        // ===================================
        var errorThrown = false;
        try {
            stage.add(group);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding group to stage');
        group.remove();

        // ===================================
        var errorThrown = false;
        try {
            stage.add(circle);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding shape to stage');
        circle.remove();

        // ===================================
        var errorThrown = false;
        try {
            layer.add(stage);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding stage to layer');
        stage.remove();

        // ===================================
        var errorThrown = false;
        try {
            layer.add(layer);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding layer to layer');
        layer.remove();

        // ===================================
        var errorThrown = false;
        try {
            group.add(stage);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding stage to group');
        stage.remove();

        // ===================================
        var errorThrown = false;
        try {
            group.add(layer);
        } catch(err) {
            errorThrown = true;
        }
        assert.equal(errorThrown, true, 'error should have been thrown when adding layer to group');
        layer.remove();

    });

    // ======================================================
    test('add layer then group then shape', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        // these should all pass because they are valid
        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();
    });

    // ======================================================
    test('add shape then stage then layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        group.add(circle);
        stage.add(layer);
        layer.add(group);
    });

    // ======================================================
    test('select shape by id and name', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            id: 'myLayer'
        });
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            id: 'myCircle'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myRect'
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
    test('select shapes with multiple selectors', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            id: 'myLayer'
        });
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            id: 'myCircle'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myRect'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        assert.equal(layer.find('#myCircle, .myRect').length, 2, 'should be 2 items in the array');
        assert.equal(layer.find('#myCircle, .myRect')[0]._id, circle._id, 'circle id is wrong');
        assert.equal(layer.find('#myCircle, .myRect')[1]._id, rect._id, 'rect id is wrong');

        assert.equal(layer.find('#myCircle, Circle, .myRect, Rect').length, 4, 'should be 4 items in the array');
        assert.equal(layer.find('#myCircle, Circle, .myRect, Rect')[0]._id, circle._id, 'circle id is wrong');
        assert.equal(layer.find('#myCircle, Circle, .myRect, Rect')[1]._id, circle._id, 'circle id is wrong');
        assert.equal(layer.find('#myCircle, Circle, .myRect, Rect')[2]._id, rect._id, 'rect id is wrong');
        assert.equal(layer.find('#myCircle, Circle, .myRect, Rect')[3]._id, rect._id, 'rect id is wrong');

    });

    // ======================================================
    test('set x on an array of nodes', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var shapes = layer.find('.myShape');

        assert.equal(shapes.length, 2, 'shapes array should have 2 elements');

        shapes.each(function(node) {
            node.setX(200);
        });

        layer.draw();

        shapes.each(function(node) {
            assert.equal(node.getX(), 200, 'shape x should be 200');
        });
    });

    // ======================================================
    test('set fill on array by Shape-selector', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var shapes = layer.find('Shape');

        assert.equal(shapes.length, 2, 'shapes array should have 2 elements');

        shapes.each(function(node) {
            node.setFill('gray');
        });

        layer.draw();

        shapes.each(function(node) {
            assert.equal(node.getFill(), 'gray', 'shape x should be 200');
        });
    });

    // ======================================================
    test('add listener to an array of nodes', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var shapes = layer.find('.myShape');

        assert.equal(shapes.length, 2, 'shapes array should have 2 elements');
        var a = 0;
        shapes.on('mouseover', function() {
            a++;
        });
        circle.fire('mouseover');
        assert.equal(a, 1, 'listener should have fired for circle');
        rect.fire('mouseover');
        assert.equal(a, 2, 'listener should have fired for rect');
    });

    // ======================================================
    test('test ids and names hashes', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            id: 'myCircle3'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myRect3'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);


        assert.equal(Kinetic.ids['myCircle3'].getId(), 'myCircle3', 'circle id not in ids hash');
        assert.equal(Kinetic.names['myRect3'][0].getName(), 'myRect3', 'rect name not in names hash');

        circle.setId('newCircleId');
        assert.notEqual(Kinetic.ids['newCircleId'], undefined, 'circle not in ids hash');
        assert.equal(Kinetic.ids['myCircle3'], undefined, 'old circle id key is still in ids hash');

        rect.setName('newRectName');
        assert.notEqual(Kinetic.names['newRectName'][0], undefined, 'new rect name not in names hash');
        assert.equal(Kinetic.names['myRect3'], undefined, 'old rect name is still in names hash');
    });

    // ======================================================
    test('add layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        stage.add(layer);
    });

    // ======================================================
    test('remove all children from layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle1 = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        var circle2 = new Kinetic.Circle({
            x: 300,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
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
        assert.equal(group.children.length, 0, 'group should have 0 children');
    });

    // ======================================================
    test('destroy all children from layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group();
        var circle1 = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'circleName',
            id: 'circleId'
        });

        var circle2 = new Kinetic.Circle({
            x: 300,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        group.add(circle1);
        group.add(circle2);
        layer.add(group);
        stage.add(layer);

        assert.equal(layer.children.length, 1, 'layer should have 1 children');
        assert.equal(group.children.length, 2, 'group should have 2 children');
        assert(Kinetic.names.circleName.length > 0, 'circleName should be in names hash');
        assert.equal(Kinetic.ids.circleId.getId(), 'circleId', 'layerId should be in ids hash');

        layer.destroyChildren();
        layer.draw();

        assert.equal(layer.children.length, 0, 'layer should have 0 children');
        assert.equal(group.children.length, 0, 'group should have 0 children');
        assert.equal(Kinetic.names.circleName, undefined, 'circleName should not be in names hash');
        assert.equal(Kinetic.ids.circleId, undefined, 'layerId should not be in ids hash');
    });

    // ======================================================
    test('add group', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);
    });

    // ======================================================
    test('create two groups, move first group', function() {
        var stage = addStage();
        var greenLayer = new Kinetic.Layer();
        var blueLayer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var greencircle = new Kinetic.Circle({
            x: stage.getWidth() / 2 - 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        var bluecircle = new Kinetic.Circle({
            x: stage.getWidth() / 2 + 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        greenGroup.add(greencircle);
        blueGroup.add(bluecircle);
        greenLayer.add(greenGroup);
        blueLayer.add(blueGroup);
        stage.add(greenLayer);
        stage.add(blueLayer);

        blueLayer.removeChildren();
        var blueGroup2 = new Kinetic.Group();
        var bluecircle2 = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });
        blueGroup2.add(bluecircle2);
        blueLayer.add(blueGroup2);
        blueLayer.draw();
        blueGroup2.setPosition(100, 0);
        blueLayer.draw();
    });

    // ======================================================
    test('node type selector', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var fooLayer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var blue = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'blue'
        });

        var red = new Kinetic.Rect({
            x: 250,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red'
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

        assert.equal(fooLayer.find('Group').length, 0, 'layer should have 0 groups');
        assert.equal(fooLayer.find('Shape').length, 0, 'layer should have 0 shapes');

        assert.equal(group.find('Shape').length, 1, 'group should have 1 shape');
        assert.equal(group.find('Layer').length, 0, 'group should have 0 layers');
        assert.equal(group.find('Group').length, 0, 'group should have 0 groups');

    });

    // ======================================================
    test('node and shape type selector', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();
        var fooLayer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var blue = new Kinetic.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'blue'
        });

        var red = new Kinetic.Rect({
            x: 150,
            y: 75,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var green = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green'
        });

        var blueCircle = new Kinetic.Circle({
            x: 350,
            y: 75,
            radius: 40,
            fill: 'blue'
        });

        var redCircle = new Kinetic.Circle({
            x: 400,
            y: 125,
            radius: 40,
            fill: 'red'
        });

        var textpath = new Kinetic.TextPath({
            y: 35,
            stroke: 'black',
            strokeWidth: 1,
            fill: 'orange',
            fontSize: '18',
            fontFamily: 'Arial',
            text: 'The quick brown fox jumped over the lazy dog\'s back',
            data: "M 10,10 300,150 550,150"
        });

        var path = new Kinetic.Path({
            x: 200,
            y: -75,
            data: 'M200,100h100v50z',
            fill: '#ccc',
            stroke: '#333',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 2,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5
        });

        var poly = new Kinetic.RegularPolygon({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
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
        assert.equal(stage.find('RegularPolygon').length, 1, 'stage should have 1 regular polygon');
        assert.equal(stage.find('TextPath').length, 1, 'stage should have 1 text path');
        assert.equal(stage.find('Path').length, 1, 'stage should have 1 path');

        assert.equal(layer.find('Shape').length, 5, 'layer should have 5 shapes');
        assert.equal(layer.find('Layer').length, 0, 'layer should have 0 layers');
        assert.equal(layer.find('Group').length, 1, 'layer should have 1 group');
        assert.equal(layer.find('Rect').length, 3, 'layer should have 3 rects');
        assert.equal(layer.find('Circle').length, 2, 'layer should have 2 circles');
        assert.equal(layer.find('RegularPolygon').length, 0, 'layer should have 0 regular polygon');
        assert.equal(layer.find('TextPath').length, 0, 'layer should have 0 text path');
        assert.equal(layer.find('Path').length, 0, 'layer should have 0 path');

        assert.equal(layer2.find('Shape').length, 3, 'layer2 should have 3 shapes');
        assert.equal(layer2.find('Layer').length, 0, 'layer2 should have 0 layers');
        assert.equal(layer2.find('Group').length, 0, 'layer2 should have 0 group');
        assert.equal(layer2.find('RegularPolygon').length, 1, 'layer2 should have 1 regular polygon');
        assert.equal(layer2.find('TextPath').length, 1, 'layer2 should have 1 text path');
        assert.equal(layer2.find('Path').length, 1, 'layer2 should have 1 path');

        assert.equal(fooLayer.find('Shape').length, 0, 'layer should have 0 shapes');
        assert.equal(fooLayer.find('Group').length, 0, 'layer should have 0 groups');
        assert.equal(fooLayer.find('Rect').length, 0, 'layer should have 0 rects');
        assert.equal(fooLayer.find('Circle').length, 0, 'layer should have 0 circles');

        assert.equal(group.find('Shape').length, 2, 'group should have 2 shape');
        assert.equal(group.find('Layer').length, 0, 'group should have 0 layers');
        assert.equal(group.find('Group').length, 0, 'group should have 0 groups');
        assert.equal(group.find('Rect').length, 1, 'group should have 1 rects');
        assert.equal(group.find('Circle').length, 1, 'gropu should have 1 circles');
    });

    // ======================================================
    test('test find() selector by adding shape, then group, then layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        assert.equal(stage.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(stage.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(layer.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(layer.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(group.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(group.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');

        assert.equal(stage.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(stage.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');
        assert.equal(layer.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(layer.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');

        assert.equal(stage.find('.layerName')[0].attrs.id, 'layerId', 'problem with layer name selector');
        assert.equal(stage.find('#layerId')[0].attrs.id, 'layerId', 'problem with layer id selector');
    });

    // ======================================================
    test('test find() selector by adding group, then shape, then layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        layer.add(group);
        group.add(rect);
        stage.add(layer);

        assert.equal(stage.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(stage.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(layer.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(layer.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(group.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(group.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');

        assert.equal(stage.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(stage.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');
        assert.equal(layer.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(layer.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');

        assert.equal(stage.find('.layerName')[0].attrs.id, 'layerId', 'problem with layer name selector');
        assert.equal(stage.find('#layerId')[0].attrs.id, 'layerId', 'problem with layer id selector');
    });

    // ======================================================
    test('test deprecated get() method', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        layer.add(group);
        group.add(rect);
        stage.add(layer);

        assert.equal(stage.get('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
    });

    // ======================================================
    test('test find() selector by adding group, then layer, then shape', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        layer.add(group);
        stage.add(layer);
        group.add(rect);

        assert.equal(stage.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(stage.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(layer.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(layer.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(group.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(group.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');

        assert.equal(stage.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(stage.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');
        assert.equal(layer.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(layer.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');

        assert.equal(stage.find('.layerName')[0].attrs.id, 'layerId', 'problem with layer name selector');
        assert.equal(stage.find('#layerId')[0].attrs.id, 'layerId', 'problem with layer id selector');
    });

    // ======================================================
    test('test find() selector by adding layer, then group, then shape', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        stage.add(layer);
        layer.add(group);
        group.add(rect);

        assert.equal(stage.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(stage.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(layer.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(layer.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');
        assert.equal(group.find('.rectName')[0].attrs.id, 'rectId', 'problem with shape name selector');
        assert.equal(group.find('#rectId')[0].attrs.id, 'rectId', 'problem with shape id selector');

        assert.equal(stage.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(stage.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');
        assert.equal(layer.find('.groupName')[0].attrs.id, 'groupId', 'problem with group name selector');
        assert.equal(layer.find('#groupId')[0].attrs.id, 'groupId', 'problem with group id selector');

        assert.equal(stage.find('.layerName')[0].attrs.id, 'layerId', 'problem with layer name selector');
        assert.equal(stage.find('#layerId')[0].attrs.id, 'layerId', 'problem with layer id selector');

        layer.draw();
    });

    // ======================================================
    test('add layer then shape', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();
    });

    // ======================================================
    test('move blue layer on top of green layer with setZIndex', function() {
        var stage = addStage();
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        blueLayer.setZIndex(1);

        //console.log(greenLayer.getZIndex());

        assert.equal(greenLayer.getZIndex(), 0, 'green layer should have z index of 0');
        assert.equal(blueLayer.getZIndex(), 1, 'blue layer should have z index of 1');
    });

    // ======================================================
    test('move blue layer on top of green layer with moveToTop', function() {
        var stage = addStage();
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        blueLayer.moveToTop();

    });

    // ======================================================
    test('move green layer below blue layer with moveToBottom', function() {
        var stage = addStage();
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        greenLayer.moveToBottom();

    });

    // ======================================================
    test('move green layer below blue layer with moveDown', function() {
        var stage = addStage();
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);
        greenLayer.moveDown();

    });

    // ======================================================
    test('move blue layer above green layer with moveUp', function() {
        var stage = addStage();
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);
        blueLayer.moveUp();

    });

    // ======================================================
    test('move blue circle on top of green circle with moveToTop', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(bluecircle);
        layer.add(greencircle);
        stage.add(layer);

        assert.equal(bluecircle.getZIndex(), 0, 'blue circle should have zindex 0 before relayering');
        assert.equal(greencircle.getZIndex(), 1, 'green circle should have zindex 1 before relayering');

        bluecircle.moveToTop();

        assert.equal(bluecircle.getZIndex(), 1, 'blue circle should have zindex 1 after relayering');
        assert.equal(greencircle.getZIndex(), 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    });

    // ======================================================
    test('move green circle below blue circle with moveDown', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(bluecircle);
        layer.add(greencircle);
        stage.add(layer);

        assert.equal(bluecircle.getZIndex(), 0, 'blue circle should have zindex 0 before relayering');
        assert.equal(greencircle.getZIndex(), 1, 'green circle should have zindex 1 before relayering');

        greencircle.moveDown();

        assert.equal(bluecircle.getZIndex(), 1, 'blue circle should have zindex 1 after relayering');
        assert.equal(greencircle.getZIndex(), 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    });

    // ======================================================
    test('layer layer when only one layer', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
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
    test('move blue group on top of green group with moveToTop', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueGroup.add(bluecircle);
        greenGroup.add(greencircle);

        layer.add(blueGroup);
        layer.add(greenGroup);
        stage.add(layer);

        assert.equal(blueGroup.getZIndex(), 0, 'blue group should have zindex 0 before relayering');
        assert.equal(greenGroup.getZIndex(), 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveToTop();

        assert.equal(blueGroup.getZIndex(), 1, 'blue group should have zindex 1 after relayering');
        assert.equal(greenGroup.getZIndex(), 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    });

    // ======================================================
    test('move blue group on top of green group with moveUp', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueGroup.add(bluecircle);
        greenGroup.add(greencircle);

        layer.add(blueGroup);
        layer.add(greenGroup);
        stage.add(layer);

        assert.equal(blueGroup.getZIndex(), 0, 'blue group should have zindex 0 before relayering');
        assert.equal(greenGroup.getZIndex(), 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveUp();

        assert.equal(blueGroup.getZIndex(), 1, 'blue group should have zindex 1 after relayering');
        assert.equal(greenGroup.getZIndex(), 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    });

    // ======================================================
    test('add and moveTo should work same way (depend on parent)', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        bluecircle.moveTo(blueGroup);

        layer.add(blueGroup);
        layer.add(greenGroup);
        stage.add(layer);

        assert.equal(blueGroup.getChildren().length, 1, 'blue group should have only one children');
        blueGroup.add(bluecircle);
        assert.equal(blueGroup.getChildren().length, 1, 'blue group should have only one children after adding node twice');

        greenGroup.add(bluecircle);
        assert.equal(blueGroup.getChildren().length, 0, 'blue group should not have children');
        assert.equal(greenGroup.getChildren().length, 1, 'green group should have only one children');



        layer.draw();
    });

    // ======================================================
    test('getChildren may use filter function', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var circle1 = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });
        var circle2 = circle1.clone();
        group.add(circle1).add(circle2);

        var rect = new Kinetic.Rect({
            name : 'test'
        });
        group.add(rect);

        var circles = group.getChildren(function(node){
            return node.getClassName() === 'Circle';
        });
        assert.equal(circles.length, 2, 'group has two circle children');
        assert.equal(circles.indexOf(circle1) > -1, true);
        assert.equal(circles.indexOf(circle2) > -1, true);

        var testName = group.getChildren(function(node){
            return node.name() === 'test';
        });

        assert.equal(testName.length, 1, 'group has one children with test name');

        layer.add(group);

        layer.draw();
    });

    test('add multiple nodes to container', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle1 = new Kinetic.Circle({
            x: 0,
            y: 0,
            radius: 10,
            fill: 'red'
        });
        var circle2 = new Kinetic.Circle({
            x: 0,
            y: 0,
            radius: 10,
            fill: 'white'
        });
        var circle3 = new Kinetic.Circle({
            x: 0,
            y: 0,
            radius: 10,
            fill: 'blue'
        });
        layer.add(circle1, circle2, circle3);
        assert.equal(layer.getChildren().length, 3, 'layer has exactly three children');
    });

});