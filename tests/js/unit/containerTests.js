Test.Modules.CONTAINER = {
    'use clipping function': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            draggable: true
        });
        var layer = new Kinetic.Layer({
            clipFunc: function(canvas) {
                var context = canvas.getContext();
                context.rect(0, 0, 400, 100);
            } 
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
    },
    'add layer then group then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    },
    'add shape then stage then layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        layer.draw();
    },
    'select shape by id and name': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        node = stage.get('#myCircle')[0];
        test(node.className === 'Circle', 'className should be Circle');
        node = layer.get('.myRect')[0];
        test(node.className === 'Rect', 'className should be rect');
        node = layer.get('#myLayer')[0];
        test(node === undefined, 'node should be undefined');
        node = stage.get('#myLayer')[0];
        test(node.nodeType === 'Layer', 'node type should be Layer');

    },
    'set x on an array of nodes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        var shapes = layer.get('.myShape');

        test(shapes.length === 2, 'shapes array should have 2 elements');

        shapes.each(function(node) {
            node.setX(200);
        });

        layer.draw();

        shapes.each(function(node) {
            test(node.getX() === 200, 'shape x should be 200');
        });
    },
    'set fill on array by Shape-selector': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        var shapes = layer.get('Shape');

        test(shapes.length === 2, 'shapes array should have 2 elements');

        shapes.each(function(node) {
            node.setFill('gray');
        });

        layer.draw();

        shapes.each(function(node) {
            test(node.getFill() === 'gray', 'shape x should be 200');
        });
    },
    'add listener to an array of nodes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        var shapes = layer.get('.myShape');

        test(shapes.length === 2, 'shapes array should have 2 elements');
        var a = 0;
        shapes.on('mouseover', function() {
            a++;
        });
        circle.fire('mouseover');
        test(a === 1, 'listener should have fired for circle');
        rect.fire('mouseover');
        test(a === 2, 'listener should have fired for rect');
    },
    'test ids and names hashes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        
        var go = Kinetic.Global;

        test(go.ids['myCircle3'].getId() === 'myCircle3', 'circle id not in ids hash');
        test(go.names['myRect3'][0].getName() === 'myRect3', 'rect name not in names hash');

        circle.setId('newCircleId');
        test(go.ids['newCircleId'] !== undefined, 'circle not in ids hash');
        test(go.ids['myCircle3'] === undefined, 'old circle id key is still in ids hash');

        rect.setName('newRectName');
        test(go.names['newRectName'][0] !== undefined, 'new rect name not in names hash');
        test(go.names['myRect3'] === undefined, 'old rect name is still in names hash');
    },
    'add layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
    },
    'remove all children from layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
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

        layer.add(circle1);
        layer.add(circle2);
        stage.add(layer);

        test(layer.children.length === 2, 'layer should have 2 children');

        layer.removeChildren();
        layer.draw();

        test(layer.children.length === 0, 'layer should have 0 children');
    },
    'add group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    },
    'create two groups, move first group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    },
    'node type selector': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(stage.get('Shape').length === 2, 'stage should have 2 shapes');
        test(layer.get('Shape').length === 2, 'layer should have 2 shapes');
        test(group.get('Shape').length === 1, 'layer should have 2 shapes');

        test(stage.get('Layer').length === 2, 'stage should have 2 layers');
        test(stage.get('Group').length === 1, 'stage should have 1 group');

        test(layer.get('Group').length === 1, 'layer should have 1 group');
        test(layer.get('Shape').length === 2, 'layer should have 2 shapes');
        test(layer.get('Layer').length === 0, 'layer should have 0 layers');

        test(fooLayer.get('Group').length === 0, 'layer should have 0 groups');
        test(fooLayer.get('Shape').length === 0, 'layer should have 0 shapes');

        test(group.get('Shape').length === 1, 'group should have 1 shape');
        test(group.get('Layer').length === 0, 'group should have 0 layers');
        test(group.get('Group').length === 0, 'group should have 0 groups');

    },
    'node and shape type selector': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(stage.get('Shape').length === 8, 'stage should have 5 shapes');
        test(stage.get('Layer').length === 3, 'stage should have 2 layers');
        test(stage.get('Group').length === 1, 'stage should have 1 group');
        test(stage.get('Rect').length === 3, 'stage should have 3 rects');
        test(stage.get('Circle').length === 2, 'stage should have 2 circles');
        test(stage.get('RegularPolygon').length === 1, 'stage should have 1 regular polygon');
        test(stage.get('TextPath').length === 1, 'stage should have 1 text path');
        test(stage.get('Path').length === 1, 'stage should have 1 path');

        test(layer.get('Shape').length === 5, 'layer should have 5 shapes');
        test(layer.get('Layer').length === 0, 'layer should have 0 layers');
        test(layer.get('Group').length === 1, 'layer should have 1 group');
        test(layer.get('Rect').length === 3, 'layer should have 3 rects');
        test(layer.get('Circle').length === 2, 'layer should have 2 circles');
        test(layer.get('RegularPolygon').length === 0, 'layer should have 0 regular polygon');
        test(layer.get('TextPath').length === 0, 'layer should have 0 text path');
        test(layer.get('Path').length === 0, 'layer should have 0 path');

        test(layer2.get('Shape').length === 3, 'layer2 should have 3 shapes');
        test(layer2.get('Layer').length === 0, 'layer2 should have 0 layers');
        test(layer2.get('Group').length === 0, 'layer2 should have 0 group');
        test(layer2.get('RegularPolygon').length === 1, 'layer2 should have 1 regular polygon');
        test(layer2.get('TextPath').length === 1, 'layer2 should have 1 text path');
        test(layer2.get('Path').length === 1, 'layer2 should have 1 path');

        test(fooLayer.get('Shape').length === 0, 'layer should have 0 shapes');
        test(fooLayer.get('Group').length === 0, 'layer should have 0 groups');
        test(fooLayer.get('Rect').length === 0, 'layer should have 0 rects');
        test(fooLayer.get('Circle').length === 0, 'layer should have 0 circles');

        test(group.get('Shape').length === 2, 'group should have 2 shape');
        test(group.get('Layer').length === 0, 'group should have 0 layers');
        test(group.get('Group').length === 0, 'group should have 0 groups');
        test(group.get('Rect').length === 1, 'group should have 1 rects');
        test(group.get('Circle').length === 1, 'gropu should have 1 circles');

		//console.log(dataUrls['node shape type selector']);

        stage.toDataURL({
            callback: function(dataUrl) {
            	//console.log(dataUrl)
                testDataUrl(dataUrl,'node shape type selector', 'problem with node and shape type selector render.');
            }
        });
    },
    'test get() selector by adding shape, then group, then layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
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

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');
    },
    'test get() selector by adding group, then shape, then layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
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

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');
    },
    'test get() selector by adding group, then layer, then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
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

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');
    },
    'test get() selector by adding layer, then group, then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
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

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');

        layer.draw();
    },
    'add layer then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    },
    'move blue layer on top of green layer with setZIndex': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(greenLayer.getZIndex() === 0, 'green layer should have z index of 0');
        test(blueLayer.getZIndex() === 1, 'blue layer should have z index of 1');

        stage.toDataURL({
            callback: function(dataUrl) {
                //console.log(dataUrl)
                testDataUrl(dataUrl, 'blue on top of green', 'layer setZIndex is not working');
            }
        });
    },
    'move blue layer on top of green layer with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        stage.toDataURL({
            callback: function(dataUrl) {
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveToTop is not working');
            }
        });
    },
    'move green layer below blue layer with moveToBottom': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        stage.toDataURL({
            callback: function(dataUrl) {
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveToBottom is not working');
            }
        });
    },
    'move green layer below blue layer with moveDown': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        stage.toDataURL({
            callback: function(dataUrl) {
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveDown is not working');
            }
        });
    },
    'move blue layer above green layer with moveUp': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        stage.toDataURL({
            callback: function(dataUrl) {
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveUp is not working');
            }
        });
    },
    'move blue circle on top of green circle with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(bluecircle.getZIndex() === 0, 'blue circle should have zindex 0 before relayering');
        test(greencircle.getZIndex() === 1, 'green circle should have zindex 1 before relayering');

        bluecircle.moveToTop();

        test(bluecircle.getZIndex() === 1, 'blue circle should have zindex 1 after relayering');
        test(greencircle.getZIndex() === 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    },
    'move green circle below blue circle with moveDown': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(bluecircle.getZIndex() === 0, 'blue circle should have zindex 0 before relayering');
        test(greencircle.getZIndex() === 1, 'green circle should have zindex 1 before relayering');

        greencircle.moveDown();

        test(bluecircle.getZIndex() === 1, 'blue circle should have zindex 1 after relayering');
        test(greencircle.getZIndex() === 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    },
    'layer layer when only one layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveDown();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveToBottom();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveUp();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveToTop();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

    },
    'move blue group on top of green group with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(blueGroup.getZIndex() === 0, 'blue group should have zindex 0 before relayering');
        test(greenGroup.getZIndex() === 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveToTop();

        test(blueGroup.getZIndex() === 1, 'blue group should have zindex 1 after relayering');
        test(greenGroup.getZIndex() === 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    },
    'move blue group on top of green group with moveUp': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(blueGroup.getZIndex() === 0, 'blue group should have zindex 0 before relayering');
        test(greenGroup.getZIndex() === 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveUp();

        test(blueGroup.getZIndex() === 1, 'blue group should have zindex 1 after relayering');
        test(greenGroup.getZIndex() === 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    }
};
