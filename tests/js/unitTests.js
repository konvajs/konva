Test.prototype.tests = {
    ////////////////////////////////////////////////////////////////////////
    //  STAGE tests
    ////////////////////////////////////////////////////////////////////////

    'STAGE - instantiate stage with id': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
    },
    'STAGE - instantiate stage with dom element': function(containerId) {
        var containerDom = document.getElementById(containerId);
        var stage = new Kinetic.Stage({
            container: containerDom,
            width: 578,
            height: 200
        });
    },
    'STAGE - test setSize': function(containerId) {
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

        test(stage.getSize().width === 578 && stage.getSize().height === 200, 'stage size should be 1 x 2');
        stage.setSize(1, 2);
        test(stage.getSize().width === 1 && stage.getSize().height === 2, 'stage size should be 1 x 2');
        stage.setSize(3);
        test(stage.getSize().width === 3 && stage.getSize().height === 3, 'stage size should be 3 x 3');
        stage.setSize({
            width: 4,
            height: 5
        });
        test(stage.getSize().width === 4 && stage.getSize().height === 5, 'stage size should be 4 x 5');
        stage.setSize({
            width: 6
        });
        test(stage.getSize().width === 6 && stage.getSize().height === 5, 'stage size should be 6 x 5');
        stage.setSize({
            height: 7
        });
        test(stage.getSize().width === 6 && stage.getSize().height === 7, 'stage size should be 6 x 7');
        stage.setSize([8, 9]);
        test(stage.getSize().width === 8 && stage.getSize().height === 9, 'stage size should be 8 x 9');
        stage.setSize([1, 1, 10, 11]);
        test(stage.getSize().width === 10 && stage.getSize().height === 11, 'stage size should be 10 x 11');

        // test integer conversion
        stage.setSize(300.2, 200.2);
        test(stage.getSize().width === 300 && stage.getSize().height === 200, 'stage size should be 300 x 200');

        layer.add(circle);
        stage.add(layer);
    },
    'STAGE - add shape then stage then layer': function(containerId) {
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
    'STAGE - test layer throttle': function(containerId) {
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
        layer.add(group);
        stage.add(layer);

        test(layer.lastDrawTime === 0, 'layer last draw time should be 0');

        /*
         * if throttling isn't working correctly, then the circle will
         * flash green and then turn red
         */
        circle.setFill('red');
        layer.draw();

        test(layer.lastDrawTime > 0, 'layer last draw time should be greather than 0');

    },
    'STAGE - add shape with linear gradient fill': function(containerId) {
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
            fill: {
                start: {
                    x: -35,
                    y: -35
                },
                end: {
                    x: 35,
                    y: 35
                },
                colorStops: [0, 'red', 1, 'blue']
            },
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        test(circle.getName() === 'myCircle', 'circle name should be myCircle');
    },
    'STAGE - add shape with alpha': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            throttle: 9999
        });
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        circle.setAlpha(0.5);
        layer.draw();

        circle.setAlpha(0.5);
        layer.draw();
    },
    'STAGE - add layer then group then shape': function(containerId) {
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
    'STAGE - serialize stage': function(containerId) {
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
            name: 'myCircle',
            draggable: true
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();

        var expectedJson = '{"attrs":{"width":578,"height":200,"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Group","children":[{"attrs":{"radius":70,"fill":"green","stroke":"black","strokeWidth":4,"detectionType":"path","shadow":{"blur":10,"alpha":1,"offset":{"x":0,"y":0}},"visible":true,"listening":true,"name":"myCircle","alpha":1,"x":289,"y":100,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":true},"nodeType":"Shape","shapeType":"Circle"}]}]}]}';
        test(stage.toJSON() === expectedJson, 'problem with serialization');
    },
    'STAGE - reset stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            x: 100
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
            name: 'myCircle',
            draggable: true
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();

        test(stage.getChildren().length === 1, 'stage should have one child');
        test(stage.getX() === 100, 'stage x should be 100');
        stage.reset();
        test(stage.getChildren().length === 0, 'stage should have no children');
        test(stage.getX() === 0, 'stage x should be 0');
    },
    'STAGE - test getAttrs()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: 100,
            y: 100,
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

        var attrs = circle.getAttrs();

        test(attrs.x === 100, 'x attr should be 100');
        test(attrs.y === 100, 'y attr should be 100');
        test(attrs.radius === 70, 'radius attr should be radius');
        test(attrs.fill === 'green', 'fill attr should be fill');
        test(attrs.stroke === 'black', 'stroke attr should be stroke');
        test(attrs.strokeWidth === 4, 'strokeWidth attr should be strokeWidth');
        test(attrs.name === 'myCircle', 'name attr should be myCircle');
        test(attrs.draggable === true, 'draggable attr should be true');
    },
    'STAGE - get stage DOM': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        test(stage.getDOM().className === 'kineticjs-content', 'stage DOM class name is wrong');
    },
    'STAGE - load stage using json': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Group","children":[{"attrs":{"radius":70,"fill":"green","stroke":"black","strokeWidth":4,"detectionType":"path","shadow":{"blur":10,"alpha":1,"offset":{"x":0,"y":0}},"visible":true,"listening":true,"name":"myCircle","alpha":1,"x":289,"y":100,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":true},"nodeType":"Shape","shapeType":"Circle"}]}]}]}';
        stage.load(json);

        test(stage.toJSON() === json, "problem loading stage with json");
    },
    'STAGE - serialize stage with custom shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var drawTriangle = function() {
            var context = this.getContext();
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            this.fill();
            this.stroke();
        };
        var triangle = new Kinetic.Shape({
            drawFunc: drawTriangle,
            fill: "#00D2FF",
            stroke: "black",
            strokeWidth: 4,
            id: 'myTriangle'
        });

        stage.add(layer);
        layer.add(group);
        group.add(triangle);
        layer.draw();

        test(triangle.getId() === 'myTriangle', 'triangle id should be myTriangle');

        var expectedJson = '{"attrs":{"width":578,"height":200,"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Group","children":[{"attrs":{"fill":"#00D2FF","stroke":"black","strokeWidth":4,"detectionType":"path","shadow":{"blur":10,"alpha":1,"offset":{"x":0,"y":0}},"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';
        test(stage.toJSON() === expectedJson, "problem serializing stage with custom shape");
    },
    'STAGE - load stage with custom shape using json': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var drawTriangle = function() {
            var context = this.getContext();
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            this.fill();
            this.stroke();
        };
        var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Group","children":[{"attrs":{"fill":"#00D2FF","stroke":"black","strokeWidth":4,"detectionType":"path","shadow":{"blur":10,"alpha":1,"offset":{"x":0,"y":0}},"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';
        stage.load(json);

        var customShape = stage.get('#myTriangle')[0];

        customShape.setDrawFunc(drawTriangle);

        stage.draw();
        test(stage.toJSON() === json, "problem loading stage with custom shape json");
    },
    'STAGE - set stage size': function(containerId) {
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
            strokeWidth: 4
        });

        test(stage.getSize().width === 578, 'stage width should be 578');
        test(stage.getSize().height === 200, 'stage height should be 200');
        test(stage.getDOM().style.width === '578px', 'content width should be 578px');
        test(stage.getDOM().style.height === '200px', 'content height should be 200px');

        layer.add(circle);
        stage.add(layer);

        stage.setSize(333, 155);

        test(stage.getSize().width === 333, 'stage width should be 333');
        test(stage.getSize().height === 155, 'stage height should be 155');
        test(stage.getDOM().style.width === '333px', 'content width should be 333');
        test(stage.getDOM().style.height === '155px', 'content height should be 155px');
        test(layer.getCanvas().width === 333, 'layer canvas width should be 333');
        test(layer.getCanvas().height === 155, 'layer canvas width should be 155');
    },
    'STAGE - test getShapesInPoint': function(containerId) {
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
            fill: 'blue',
            name: 'blue'
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

        test(stage.getIntersections({
            x: 201,
            y: 101
        }).length === 1, 'should be 1 shape ');

        test(stage.getIntersections(201, 101).length === 1, 'should be 1 shape ');

        test(stage.getIntersections(201, 101)[0].getName() === 'blue', 'shape name should be blue');

        test(stage.getIntersections({
            x: 251,
            y: 101
        }).length === 2, 'should be 2 shapes ');

        test(stage.getIntersections({
            x: 350,
            y: 150
        }).length === 1, 'should be 1 shape ');

    },
    'STAGE - scale stage after add layer': function(containerId) {
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
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        stage.setScale(0.5);

        test(stage.getScale().x === 0.5, 'stage scale x should be 0.5');
        test(stage.getScale().y === 0.5, 'stage scale y should be 0.5');

        stage.draw();
    },
    'STAGE - scale stage before add shape': function(containerId) {
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
            strokeWidth: 4
        });

        stage.setScale(0.5);

        test(stage.getScale().x === 0.5, 'stage scale x should be 0.5');
        test(stage.getScale().y === 0.5, 'stage scale y should be 0.5');

        layer.add(circle);
        stage.add(layer);
    },
    'STAGE - scale stage with no shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        stage.add(layer);
        stage.setScale(0.5);

        stage.draw();
    },
    'STAGE - select shape by id and name': function(containerId) {
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
        test(node.shapeType === 'Circle', 'shape type should be circle');
        node = layer.get('.myRect')[0];
        test(node.shapeType === 'Rect', 'shape type should be rect');
        node = layer.get('#myLayer')[0];
        test(node === undefined, 'node should be undefined');
        node = stage.get('#myLayer')[0];
        test(node.nodeType === 'Layer', 'node type should be Layer');

    },
    'STAGE - remove shape by id or name': function(containerId) {
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

        var node = stage.get('#myCircle')[0];
        var nodes = stage.get('.myRect');

        test(stage.ids.myCircle._id === circle._id, 'circle not in ids hash');
        test(stage.names.myRect[0]._id === rect._id, 'rect not in names hash');

        var node = stage.get('#myCircle')[0];
        var parent = node.getParent();

        parent.remove(node);

        test(stage.ids.myCircle === undefined, 'circle still in hash');
        test(stage.names.myRect[0]._id === rect._id, 'rect not in names hash');

        var parent = nodes[0].getParent();
        parent.remove(nodes[0]);

        test(stage.ids.myCircle === undefined, 'circle still in hash');
        test(stage.names.myRect === undefined, 'rect still in hash');

    },
    'STAGE - set shape and layer alpha to 0.5': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setAlpha(0.5);
        layer.setAlpha(0.5);
        layer.add(circle);
        stage.add(layer);

        test(circle.getAbsoluteAlpha() === 0.25, 'abs alpha should be 0.25');
        test(layer.getAbsoluteAlpha() === 0.5, 'abs alpha should be 0.5');
    },
    'STAGE - remove shape without adding its parent to stage': function(containerId) {
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
            id: 'myCircle'
        });

        var go = Kinetic.GlobalObject;

        test(go.tempNodes.length === 0, 'shouldn\'t be nodes in the tempNdoes array');

        layer.add(circle);

        var node = stage.get('#myCircle')[0];

        test(node === undefined, 'node should be undefined');

        test(go.tempNodes.length === 1, 'tempNodes array should have one node');

        layer.remove(circle);

        test(go.tempNodes.length === 0, 'shouldn\'t be nodes in the tempNdoes array');

    },
    'STAGE - remove layer with shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            name: 'myLayer'
        });
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        test(stage.children.length === 1, 'stage should have 1 children');
        test(stage.get('.myLayer')[0] !== undefined, 'layer should exist');
        test(stage.get('.myCircle')[0] !== undefined, 'circle should exist');

        stage.remove(layer);

        test(stage.children.length === 0, 'stage should have 0 children');
        test(stage.get('.myLayer')[0] === undefined, 'layer should not exist');
        test(stage.get('.myCircle')[0] === undefined, 'circle should not exist');
    },
    'STAGE - remove layer with no shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
        stage.remove(layer);

        test(stage.children.length === 0, 'stage should have 0 children');
    },
    'STAGE - remove shape multiple times': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape1 = new Kinetic.Circle({
            x: 150,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        var shape2 = new Kinetic.Circle({
            x: 250,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        layer.add(shape1);
        layer.add(shape2);
        stage.add(layer);

        test(layer.getChildren().length === 2, 'layer should have two children');

        layer.remove(shape1);
        layer.remove(shape1);

        test(layer.getChildren().length === 1, 'layer should have two children');

        layer.draw();

    },
    'STAGE - remove layer multiple times': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer1 = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();

        var shape1 = new Kinetic.Circle({
            x: 150,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        var shape2 = new Kinetic.Circle({
            x: 250,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        layer1.add(shape1);
        layer2.add(shape2);
        stage.add(layer1);
        stage.add(layer2);

        test(stage.getChildren().length === 2, 'stage should have two children');

        stage.remove(layer1);
        stage.remove(layer1);

        test(stage.getChildren().length === 1, 'stage should have one child');

        stage.draw();

    },
    'STAGE - serialize stage with an image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 200,
                y: 60,
                image: imageObj,
                centerOffset: {
                    x: 50,
                    y: imageObj.height / 2
                },
                id: 'darth'
            });

            layer.add(darth);
            stage.add(layer);

            var json = stage.toJSON();

            test(json === '{"attrs":{"width":578,"height":200,"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"throttle":80,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"crop":{"x":0,"y":0},"detectionType":"path","shadow":{"blur":10,"alpha":1,"offset":{"x":0,"y":0}},"visible":true,"listening":true,"alpha":1,"x":200,"y":60,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":50,"y":150},"dragConstraint":"none","dragBounds":{},"draggable":false,"id":"darth"},"nodeType":"Shape","shapeType":"Image"}]}]}');
        };
        imageObj.src = '../darth-vader.jpg';
    },
    'STAGE - load stage with an image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });

            var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"visible":true,"listening":true,"alpha":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":0,"y":0},"dragConstraint":"none","dragBounds":{},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"crop":{"x":0,"y":0},"detectionType":"path","visible":true,"listening":true,"alpha":1,"x":200,"y":60,"scale":{"x":1,"y":1},"rotation":0,"centerOffset":{"x":50,"y":150},"dragConstraint":"none","dragBounds":{},"draggable":false,"id":"darth"},"nodeType":"Shape","shapeType":"Image"}]}]}';
            stage.load(json);
            var image = stage.get('#darth')[0];
            image.setImage(imageObj);
            stage.draw();
        };
        imageObj.src = '../darth-vader.jpg';
    },
    ////////////////////////////////////////////////////////////////////////
    //  LAYERS tests
    ////////////////////////////////////////////////////////////////////////

    'LAYER - add layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
    },
    'LAYER - hide layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer1 = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();

        var circle1 = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        var circle2 = new Kinetic.Circle({
            x: 150,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle1.on('mousemove', function() {
            console.log('mousemove circle1');
        });

        circle2.on('mousemove', function() {
            console.log('mousemove circle2');
        });

        layer1.add(circle1);
        layer2.add(circle2);
        stage.add(layer1).add(layer2);

        test(layer2.isVisible(), 'layer2 should be visible');

        layer2.hide();
        layer2.draw();

        test(!layer2.isVisible(), 'layer2 should be invisible');
    },
    'LAYER - beforeDraw and afterDraw': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        var counter = 0;

        layer.beforeDraw(function() {
            counter++;
            test(counter === 1, 'counter should be 1');
        });

        layer.afterDraw(function() {
            counter++;
            test(counter === 2, 'counter should be 2');
        });

        layer.draw();
    },
    'LAYER - throttling': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            throttle: 20
        });
        stage.add(layer);

        test(layer.getThrottle() === 20, 'throttle should be 20');
        layer.setThrottle(13);
        test(layer.getThrottle() === 13, 'throttle should be 13');
    },
    'LAYER - add layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
    },
    'LAYER - remove all children from layer': function(containerId) {
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
    ////////////////////////////////////////////////////////////////////////
    //  GROUPS tests
    ////////////////////////////////////////////////////////////////////////

    'GROUP - add group': function(containerId) {
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
    'GROUP - hide group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

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
            x: 150,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle1.on('mousemove', function() {
            console.log('mousemove circle1');
        });

        circle2.on('mousemove', function() {
            console.log('mousemove circle2');
        });

        group.add(circle2);
        layer.add(circle1).add(group);
        stage.add(layer);

        test(group.isVisible(), 'group should be visible');
        test(circle2.isVisible(), 'circle2 should be visible');

        group.hide();
        layer.draw();

        test(!group.isVisible(), 'group should be invisible');
        test(!circle2.isVisible(), 'circle2 should be invisible');
    },
    'GROUP - create two groups, move first group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var greenLayer = new Kinetic.Layer();
        var blueLayer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var greenCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2 - 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        var blueCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2 + 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        greenGroup.add(greenCircle);
        blueGroup.add(blueCircle);
        greenLayer.add(greenGroup);
        blueLayer.add(blueGroup);
        stage.add(greenLayer);
        stage.add(blueLayer);

        blueLayer.removeChildren();
        var blueGroup2 = new Kinetic.Group();
        var blueCircle2 = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });
        blueGroup2.add(blueCircle2);
        blueLayer.add(blueGroup2);
        blueLayer.draw();
        blueGroup2.setPosition(100, 0);
        blueLayer.draw();
    },
    ////////////////////////////////////////////////////////////////////////
    //  SHAPES tests
    ////////////////////////////////////////////////////////////////////////

    'SHAPE - add shape with pattern fill': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
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
                fill: {
                    image: imageObj,
                    repeat: 'no-repeat',
                    offset: [-200, -70]
                },
                stroke: 'black',
                strokeWidth: 4,
                name: 'myCircle',
                draggable: true
            });

            group.add(circle);
            layer.add(group);
            stage.add(layer);

            test(circle.getFill().repeat === 'no-repeat', 'repeat option should be no-repeat');
            test(circle.getFill().offset.x === -200, 'fill offset x should be -200');
            test(circle.getFill().offset.y === -70, 'fill offset y should be -70');

            /*
             * test offset setting
             */
            circle.setFill({
                offset: [1, 2]
            });
            test(circle.getFill().offset.x === 1, 'fill offset x should be 1');
            test(circle.getFill().offset.y === 2, 'fill offset y should be 2');

            circle.setFill({
                offset: {
                    x: 3,
                    y: 4
                }
            });
            test(circle.getFill().offset.x === 3, 'fill offset x should be 3');
            test(circle.getFill().offset.y === 4, 'fill offset y should be 4');

            circle.setFill({
                offset: {
                    x: 5
                }
            });
            test(circle.getFill().offset.x === 5, 'fill offset x should be 5');
            test(circle.getFill().offset.y === 4, 'fill offset y should be 4');

            circle.setFill({
                offset: {
                    y: 6
                }
            });
            test(circle.getFill().offset.x === 5, 'fill offset x should be 5');
            test(circle.getFill().offset.y === 6, 'fill offset y should be 6');

            circle.setFill({
                offset: [-200, -70]
            });
        };
        imageObj.src = '../darth-vader.jpg';

    },
    'SHAPE - add circle with radial gradient fill': function(containerId) {
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
            fill: {
                start: {
                    x: -20,
                    y: -20,
                    radius: 0
                },
                end: {
                    x: -60,
                    y: -60,
                    radius: 130
                },
                colorStops: [0, 'red', 0.2, 'yellow', 1, 'blue']
            },
            name: 'myCircle',
            draggable: true,
            scale: {
                x: 0.5,
                y: 0.5
            }
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        var fill = circle.getFill();

        test(fill.start.x === -20, 'fill start x should be 20');
        test(fill.start.y === -20, 'fill start y should be 20');
        test(fill.start.radius === 0, 'fill start radius should be 0');

        test(fill.end.x === -60, 'fill end x should be 60');
        test(fill.end.y === -60, 'fill end y should be 60');
        test(fill.end.radius === 130, 'fill end radius should be 130');

        test(fill.colorStops.length === 6, 'fill colorStops length should be 6');

    },
    'SHAPE - add rect with rounded corner and scale from array': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 90,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50
            },
            scale: [2, 2],
            cornerRadius: 15,
            draggable: true
        });

        layer.add(rect);
        stage.add(layer);

        stage.onFrame(function() {
            rect.rotate(Math.PI / 100);
            layer.draw();
        });
        //stage.start();
    },
    'SHAPE - add circle': function(containerId) {
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
            centerOffset: {
                x: 0,
                y: 0
            },
            scale: {
                x: 2,
                y: 2
            }
        });
        layer.add(circle);
        stage.add(layer);

        stage.onFrame(function() {
            circle.rotate(Math.PI / 100);
            layer.draw();
        });
        //stage.start();
    },
    'SHAPE - add simple path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'M200,100h100v50z',
            fill: '#ccc',
            stroke: '#333',
            strokeWidth: 2,
            shadow: {
                color: 'black',
                blur: 2,
                offset: [10, 10],
                alpha: 0.5
            },
            draggable: true
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);

        stage.add(layer);

        test(path.getData() === 'M200,100h100v50z', 'data are incorrect');
        test(path.getDataArray().length === 4, 'data array should have 4 elements');

        path.setData('M200');

        test(path.getData() === 'M200', 'data are incorrect');
        test(path.getDataArray().length === 1, 'data array should have 1 element');

        path.setData('M200,100h100v50z');

    },
    'SHAPE - moveTo with implied lineTos and trailing comma': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'm200,100,100,0,0,50,z',
            fill: '#fcc',
            stroke: '#333',
            strokeWidth: 2,
            shadow: {
                color: 'maroon',
                blur: 2,
                offset: [10, 10],
                alpha: 0.5
            },
            draggable: true
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);

        stage.add(layer);

        test(path.getData() === 'm200,100,100,0,0,50,z', 'data are incorrect');
        test(path.getDataArray().length === 4, 'data array should have 4 elements');

        test(path.getDataArray()[1].command === 'L', 'second command should be an implied lineTo');
    },
    'SHAPE - add map path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var mapLayer = new Kinetic.Layer();

        for(var key in worldMap.shapes) {
            var c = worldMap.shapes[key];

            var path = new Kinetic.Path({
                data: c,
                fill: '#ccc',
                stroke: '#999',
                strokeWidth: 1,
            });

            if(key === 'US')
                test(path.getDataArray()[0].command === 'M', 'first command should be a moveTo');

            path.on('mouseover', function() {
                this.setFill('red');
                mapLayer.draw();
            });

            path.on('mouseout', function() {
                this.setFill('#ccc');
                mapLayer.draw();
            });

            mapLayer.add(path);
        }

        stage.add(mapLayer);

    },
    'SHAPE - curved arrow path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z";

        var path = new Kinetic.Path({
            data: c,
            fill: '#ccc',
            stroke: '#999',
            strokeWidth: 1,
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);
        stage.add(layer);

    },
    'SHAPE - Quadradic Curve test from SVG w3c spec': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.25,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M200,300 Q400,50 600,300 T1000,300";

        var path = new Kinetic.Path({
            data: c,
            stroke: 'red',
            strokeWidth: 5,
        });

        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 200,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 600,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 1000,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 50,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 800,
            y: 550,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Path({
            data: "M200,300 L400,50L600,300L800,550L1000,300",
            stroke: "#888",
            strokeWidth: 2
        }));

        stage.add(layer);

    },
    'SHAPE - Cubic Bezier Curve test from SVG w3c spec': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M100,200 C100,100 250,100 250,200 S400,300 400,200";

        var path = new Kinetic.Path({
            data: c,
            stroke: 'red',
            strokeWidth: 5,
        });

        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 100,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 100,
            y: 100,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 100,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 300,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 300,
            radius: 10,
            stroke: 'blue'
        }));

        stage.add(layer);

    },
    'SHAPE - arc': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M100,350 l 50,-25 a25,25 -30 0,1 50,-25 l 50,-25 a25,50 -30 0,1 50,-25 l 50,-25 a25,75 -30 0,1 50,-25 l 50,-25 a25,100 -30 0,1 50,-25 l 50,-25";

        var path = new Kinetic.Path({
            data: c,
            fill: 'none',
            stroke: '#999',
            strokeWidth: 1,
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('none');
            layer.draw();
        });

        layer.add(path);
        stage.add(layer);

    },
    'SHAPE - Tiger (RAWR!)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.25,
            x: 50,
            y: 50
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        for(var i = 0; i < tiger.length; i++) {
            var path = new Kinetic.Path(tiger[i]);
            group.add(path);
        }

        group.draggable(true);
        layer.add(group);
        stage.add(layer);

    },
    'SHAPE - add shape with custom attr pointing to self': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 0,
                y: 0
            },
            scale: {
                x: 2,
                y: 2
            }
        });
        layer.add(circle);
        stage.add(layer);

        /*
         * add custom attr that points to self.  The setAttrs method should
         * not inifinitely recurse causing a stack overflow
         */
        circle.setAttrs({
            self: circle
        });

        /*
         * serialize the stage.  The json should succeed because objects that have
         * methods, such as self, are not serialized, and will therefore avoid
         * circular json errors.
         */
        var json = stage.toJSON();
    },
    'SHAPE - set fill after instantiation': function(containerId) {
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
            strokeWidth: 4
        });
        layer.add(circle);

        circle.setFill('blue');

        stage.add(layer);
    },
    'SHAPE - add image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 200,
                y: 60,
                image: imageObj,
                width: 100,
                height: 100,
                centerOffset: [50, 30],
                crop: [20, 20, 200, 250]
            });

            layer.add(darth);
            stage.add(layer);

            test(darth.getX() === 200, 'x should be 200');
            test(darth.getY() === 60, 'y should be 60');
            test(darth.getWidth() === 100, 'width should be 100');
            test(darth.getHeight() === 100, 'height should be 100');
            test(darth.getCenterOffset().x === 50, 'center offset x should be 50');
            test(darth.getCenterOffset().y === 30, 'center offset y should be 30');
            test(Kinetic.GlobalObject._isElement(darth.getImage()), 'darth image should be an element');

            var crop = null;
            crop = darth.getCrop();
            test(crop.x === 20, 'crop x should be 20');
            test(crop.y === 20, 'crop y should be 20');
            test(crop.width === 200, 'crop width should be 200');
            test(crop.height === 250, 'crop height should be 250');

            /*
             * test cropping setter
             */

            darth.setCrop(0, 1, 2, 3);
            crop = darth.getCrop();
            test(crop.x === 0, 'crop x should be 0');
            test(crop.y === 1, 'crop y should be 1');
            test(crop.width === 2, 'crop width should be2');
            test(crop.height === 3, 'crop height should be 3');

            darth.setCrop([4, 5, 6, 7]);
            crop = darth.getCrop();
            test(crop.x === 4, 'crop x should be 4');
            test(crop.y === 5, 'crop y should be 5');
            test(crop.width === 6, 'crop width should be 6');
            test(crop.height === 7, 'crop height should be 7');

            darth.setCrop({
                x: 8,
                y: 9,
                width: 10,
                height: 11
            });
            crop = darth.getCrop();
            test(crop.x === 8, 'crop x should be 8');
            test(crop.y === 9, 'crop y should be 9');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            /*
             * test partial setter
             */
            darth.setCrop({
                x: 12
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 9, 'crop y should be 9');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                y: 13
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                width: 14
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 14, 'crop width should be 14');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                height: 15
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 14, 'crop width should be 14');
            test(crop.height === 15, 'crop height should be 15');

        };
        imageObj.src = '../darth-vader.jpg';
    },
    'SHAPE - add sprite': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

            var anims = {
                standing: [{
                    x: 0,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 52,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 105,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 158,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 210,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 262,
                    y: 0,
                    width: 49,
                    height: 109
                }],

                kicking: [{
                    x: 0,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 45,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 95,
                    y: 109,
                    width: 63,
                    height: 98
                }, {
                    x: 156,
                    y: 109,
                    width: 70,
                    height: 98
                }, {
                    x: 229,
                    y: 109,
                    width: 60,
                    height: 98
                }, {
                    x: 287,
                    y: 109,
                    width: 41,
                    height: 98
                }]
            };

            //for(var n = 0; n < 50; n++) {
            sprite = new Kinetic.Sprite({
                //x: Math.random() * stage.getWidth() - 30,
                x: 200,
                //y: Math.random() * stage.getHeight() - 50,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: anims,
                index: 0,
                //frameRate: Math.random() * 6 + 6,
                frameRate: 10,
                draggable: true,
                shadow: {
                    color: 'black',
                    blur: 3,
                    offset: [10, 10],
                    alpha: 0.3
                }
            });

            layer.add(sprite);
            sprite.start();
            //}

            stage.add(layer);

            // kick once
            /*
             setTimeout(function() {
             sprite.setIndex(0);
             sprite.setAnimation('kicking');

             sprite.afterFrame(0, function() {
             sprite.setAnimation('standing');
             });
             }, 2000);
             setTimeout(function() {
             //sprite.start();
             }, 3000);
             */
        };
        imageObj.src = '../scorpion-sprite.png';
    },
    'SHAPE - add polygon': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var points = [{
            x: 73,
            y: 192
        }, {
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }, {
            x: 500,
            y: 109
        }, {
            x: 499,
            y: 139
        }, {
            x: 342,
            y: 93
        }];

        var poly = new Kinetic.Polygon({
            points: points,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        layer.add(poly);
        stage.add(layer);

        stage.onFrame(function() {
            poly.rotate(Math.PI / 100);
            layer.draw();
        });
        //stage.start();
    },
    'SHAPE - add line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var points = [{
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }
        /*, {
         x: 500,
         y: 109
         }*/];

        var line = new Kinetic.Line({
            points: points,
            stroke: 'blue',
            strokeWidth: 20,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true
        });

        // test that default detection type is pixel
        test(line.getDetectionType() === 'pixel', 'dection type should be pixel');

        layer.add(line);
        stage.add(layer);

        line.saveData();

        line.on('dragend', function() {
            line.saveData();
        });

        line.setPoints([1, 2, 3, 4]);
        test(line.getPoints()[0].x === 1, 'first point x should be 1');

        line.setPoints([{
            x: 5,
            y: 6
        }, {
            x: 7,
            y: 8
        }]);
        test(line.getPoints()[0].x === 5, 'first point x should be 5');

        line.setPoints([73, 160, 340, 23]);
        test(line.getPoints()[0].x === 73, 'first point x should be 73');
    },
    'SHAPE - add dashed line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        /*
         var points = [{
         x: 73,
         y: 160
         }, {
         x: 340,
         y: 23
         }, {
         x: 500,
         y: 109
         }, {
         x: 500,
         y: 180
         }];
         */

        var line = new Kinetic.Line({
            points: [73, 160, 340, 23, 500, 109, 500, 180],
            stroke: 'blue',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            dashArray: [30, 10, 0, 10, 10, 20],
            shadow: {
                color: '#aaa',
                blur: 10,
                offset: [20, 20]
            }
        });

        layer.add(line);
        stage.add(layer);

        test(line.getDashArray().length === 6, 'dashArray should have 6 elements');
        line.setDashArray([10, 10]);
        test(line.getDashArray().length === 2, 'dashArray should have 2 elements');

        test(line.getPoints().length === 4, 'line should have 4 points');

    },
    'SHAPE - add regular polygon triangle': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 3,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            centerOffset: {
                x: 0,
                y: -50
            }
        });

        layer.add(poly);
        stage.add(layer);

    },
    'SHAPE - add regular polygon square': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 4,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    },
    'SHAPE - add regular polygon pentagon': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    },
    'SHAPE - add regular polygon octogon': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.RegularPolygon({
            x: 200,
            y: 100,
            sides: 8,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    },
    'SHAPE - add five point star': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            centerOffset: {
                x: 0,
                y: -70
            },
            scale: {
                x: 0.5,
                y: 0.5
            }
        });

        layer.add(star);
        stage.add(layer);
    },
    'SHAPE - add five point star with line join and shadow': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
            x: 250,
            y: 75,
            width: 100,
            height: 100,
            fill: 'red'
        });

        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: "round",
            shadow: {
                color: 'black',
                blur: 10,
                offset: [20, 20],
                alpha: 0.5
            },
            draggable: true
        });

        layer.add(rect);
        layer.add(star);

        stage.add(layer);

        test(star.getLineJoin() === 'round', 'lineJoin property should be round');
        star.setLineJoin('bevel');
        test(star.getLineJoin() === 'bevel', 'lineJoin property should be bevel');

        star.setLineJoin('round');
        /*
         stage.onFrame(function(frame) {
         star.rotate(1 * frame.timeDiff / 1000);
         layer.draw();
         });

         stage.start();
         */
    },
    'SHAPE - add stroke rect': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            stroke: 'green',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);
    },
    'SHAPE - use default stroke (stroke color should be black)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);
    },
    'SHAPE - use default stroke width (stroke width should be 2)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            stroke: 'blue'
        });

        layer.add(rect);
        stage.add(layer);
    },
    'SHAPE - scale shape by half': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setScale(0.5, 1);
        layer.add(circle);
        stage.add(layer);
    },
    'SHAPE - scale shape by half then back to 1': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setScale(0.5, 1);
        circle.setScale(1, 1);
        layer.add(circle);
        stage.add(layer);
    },
    'SHAPE - set center offset after instantiation': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            stroke: 'blue',
            centerOffset: {
                x: 20,
                y: 20
            }
        });

        layer.add(rect);
        stage.add(layer);

        test(rect.getCenterOffset().x === 20, 'center offset x should be 20');
        test(rect.getCenterOffset().y === 20, 'center offset y should be 20');

        rect.setCenterOffset(40, 40);

        test(rect.getCenterOffset().x === 40, 'center offset x should be 40');
        test(rect.getCenterOffset().y === 40, 'center offset y should be 40');

    },
    'SHAPE - apply shadow to transparent image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            var darth = new Kinetic.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true,
                shadow: {
                    color: 'black',
                    blur: 10,
                    offset: [20, 20],
                    alpha: 0.2
                }
            });

            layer.add(darth);
            stage.add(layer);

        };
        imageObj.src = '../lion.png';
    },
    'SHAPE - custom shape with fill, stroke, and strokeWidth': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function() {
                var context = this.getContext();
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                this.fill();
                this.stroke();
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        layer.add(shape);
        stage.add(layer);
    },
    'SHAPE - change custom shape draw func': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function() {
                var context = this.getContext();
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                this.fill();
                this.stroke();
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        shape.setDrawFunc(function() {
            var context = this.getContext();
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            this.fill();
            this.stroke();
        });

        layer.add(shape);
        stage.add(layer);
    },
    'SHAPE - init with position, scale, rotation, then change scale': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            scale: {
                x: 0.5,
                y: 0.5
            },
            rotation: 20 * Math.PI / 180
        });

        test(rect.getPosition().x == 200, 'rect should be at x = 200');
        test(rect.getPosition().y == 100, 'rect should be at y = 100');
        test(rect.getScale().x == 0.5, 'rect x scale should be 0.5');
        test(rect.getScale().y == 0.5, 'rect y scale should be 0.5');
        test(rect.getRotation() == 20 * Math.PI / 180, 'rect should rotated by 20 degrees');

        rect.setScale(2, 0.3);
        test(rect.getScale().x == 2, 'rect x scale should be 2');
        test(rect.getScale().y == 0.3, 'rect y scale should be 0.3');

        layer.add(rect);
        stage.add(layer);
    },
    'SHAPE - rotation in degrees': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            rotationDeg: 10
        });

        test(rect.getRotationDeg() === 10, 'rotation should be 10 degrees');
        rect.setRotationDeg(20);
        test(rect.getRotationDeg() === 20, 'rotation should be 20 degrees');
        rect.rotateDeg(20);
        test(rect.getRotationDeg() === 40, 'rotation should be 40 degrees');

        layer.add(rect);
        stage.add(layer);
    },
    'SHAPE - test pixel detection setter and getter': function(containerId) {

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer({
            rotationDeg: 20
        });
        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            numPoints: 10,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 20,
            detectionType: 'pixel',
            draggable: true
        });

        star.on('mouseover', function() {
            log('mouseover');
        });

        star.on('mouseout', function() {
            log('mouseout');
        });

        star.on('dragend', function() {
            this.saveData();
        });

        layer.add(star);
        stage.add(layer);

        star.saveData();

        test(star.getDetectionType() === 'pixel', 'detection type should be pixel');
        star.setDetectionType('path');
        test(star.getDetectionType() === 'path', 'detection type should be path');
        star.setDetectionType('pixel');
        test(star.getDetectionType() === 'pixel', 'detection type should be pixel');
    },
    'SHAPE - test intersects()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        test(rect.intersects({
            x: 200,
            y: 100
        }) === true, 'problem with point in shape');

        test(rect.intersects({
            x: 199,
            y: 99
        }) === false, 'intersects with point in shape');

        test(rect.intersects({
            x: 250,
            y: 125
        }) === true, 'intersects with point in shape');

        test(rect.intersects({
            x: 300,
            y: 150
        }) === true, 'intersects with point in shape');

        test(rect.intersects({
            x: 301,
            y: 151
        }) === false, 'intersects with point in shape');
    },
    'CONTAINER - node type selector': function(containerId) {
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
    'SHAPE - add text': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            stroke: 'green',
            strokeWidth: 5,
            fill: '#ddd',
            text: 'Hello World!',
            fontSize: 60,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#888',
            textStroke: '#333',
            padding: 10,
            fontStyle: 'normal',
            align: 'center',
            verticalAlign: 'middle',
            width: 200,
            shadow: {
                color: 'black',
                blur: 1,
                offset: [10, 10],
                alpha: 0.2
            }
        });

        layer.add(text);

        /*
         * test getters and setters
         */
        text.setText('Bye World!');
        test(text.getText() === 'Bye World!', 'text should be Bye World!');
        test(text.getPadding() === 10, 'padding should be 10');
        test(text.getFontStyle() == 'normal', 'font style should be normal');
        text.setPadding(20);
        test(text.getPadding() === 20, 'padding should be 20');
        test(text.getWidth() === 200, 'width should be 200');

        stage.add(layer);

        text.setFontFamily('Arial');
        text.setFontSize(30);
        text.setFontStyle('italic');
        text.setAlign('right');
        text.setVerticalAlign('top');
        text.setTextFill('blue');
        text.setTextStroke('red');
        text.setTextStrokeWidth(10);

        test(text.getFontFamily() === 'Arial', 'font family should be Arial');
        test(text.getFontSize() === 30, 'text size should be 30');
        test(text.getFontStyle() == 'italic', 'font style should be italic');
        test(text.getAlign() === 'right', 'text align should be right');
        test(text.getVerticalAlign() === 'top', 'vertical align should be top');
        test(text.getTextFill() === 'blue', 'text fill should be blue');
        test(text.getTextStroke() === 'red', 'text stroke should be red');
        test(text.getTextStrokeWidth() === 10, 'test stroke width should be 10');

    },
    'SHAPE - get text metrics': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            text: 'Hello World!',
            fontSize: 60,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textStroke: 'green',
            fontStyle: 'italic',
            align: 'center',
            verticalAlign: 'middle',
            shadow: {
                color: 'black',
                blur: 2,
                offset: [5, 5],
                alpha: 1
            }
        });

        text.on('mouseover', function() {
            console.log('mouseover text');
        });
        // test text width before adding it to stage
        test(text.getTextWidth() > 0, 'text width should have a value');

        layer.add(text);
        stage.add(layer);

        text.saveData();

        test(text.getTextSize().width > 0, 'text width should have a value');
        test(text.getTextSize().height > 0, 'text height should have a value');
        test(text.getTextWidth() > 0, 'text width should have a value');
        test(text.getTextHeight() > 0, 'text height should have a value');

    },
    'SHAPE - get shape name': function(containerId) {
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

        layer.add(circle);
        stage.add(layer);

        test(circle.getName() == 'myCircle', 'name should be myCircle');
    },
    'SHAPE - remove shape': function(containerId) {
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

        layer.add(circle);
        stage.add(layer);

        test(layer.children.length === 1, 'layer should have 1 children');

        layer.remove(circle);

        test(layer.children.length === 0, 'layer should have 0 children');
        //test(layer.getChild('myCircle') === undefined, 'shape should be null');

        layer.draw();
    },
    'NODE - test on attr change': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue'
        });

        layer.add(rect);
        stage.add(layer);

        var widthChangeTriggered = false;

        rect.on('widthChange', function() {
            widthChangeTriggered = true;
        });

        rect.setSize(200);

        test(widthChangeTriggered, 'changing rect size should have triggered on attr change');
    },
    'NODE - test setting shadow offset': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red',
            shadow: {
                color: 'blue',
                blur: 12
            }
        });

        layer.add(rect);
        stage.add(layer);

        rect.setShadow({
            offset: [1, 2]
        });
        test(rect.getShadow().offset.x === 1, 'shadow offset x should be 1');
        test(rect.getShadow().offset.y === 2, 'shadow offset y should be 2');
        // make sure we still have the other properties
        test(rect.getShadow().color === 'blue', 'shadow color should still be blue');
        test(rect.getShadow().blur === 12, 'shadow blur should still be 12');

        rect.setShadow({
            offset: {
                x: 3,
                y: 4
            }
        });
        test(rect.getShadow().offset.x === 3, 'shadow offset x should be 3');
        test(rect.getShadow().offset.y === 4, 'shadow offset y should be 4');

        // test partial setting
        rect.setShadow({
            offset: {
                x: 5
            }
        });
        test(rect.getShadow().offset.x === 5, 'shadow offset x should be 5');
        test(rect.getShadow().offset.y === 4, 'shadow offset y should be 4');

        // test partial setting
        rect.setShadow({
            offset: {
                y: 6
            }
        });
        test(rect.getShadow().offset.x === 5, 'shadow offset x should be 5');
        test(rect.getShadow().offset.y === 6, 'shadow offset y should be 6');
    },
    'NODE - test setCenterOffset': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect);
        stage.add(layer);

        rect.setCenterOffset(1, 2);
        test(rect.getCenterOffset().x === 1, 'center offset x should be 1');
        test(rect.getCenterOffset().y === 2, 'center offset y should be 2');

        rect.setCenterOffset([3, 4]);
        test(rect.getCenterOffset().x === 3, 'center offset x should be 3');
        test(rect.getCenterOffset().y === 4, 'center offset y should be 4');

        rect.setCenterOffset({
            x: 5,
            y: 6
        });
        test(rect.getCenterOffset().x === 5, 'center offset x should be 5');
        test(rect.getCenterOffset().y === 6, 'center offset y should be 6');

        rect.setCenterOffset({
            x: 7
        });
        test(rect.getCenterOffset().x === 7, 'center offset x should be 7');
        test(rect.getCenterOffset().y === 6, 'center offset y should be 6');

        rect.setCenterOffset({
            y: 8
        });
        test(rect.getCenterOffset().x === 7, 'center offset x should be 7');
        test(rect.getCenterOffset().y === 8, 'center offset y should be 8');

    },
    'NODE - test setPosition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect);
        stage.add(layer);

        rect.setPosition(1, 2);
        test(rect.getPosition().x === 1, 'rect x should be 1');
        test(rect.getPosition().y === 2, 'rect y should be 2');

        rect.setPosition([3, 4]);
        test(rect.getPosition().x === 3, 'rect x should be 3');
        test(rect.getPosition().y === 4, 'rect y should be 4');

        rect.setPosition({
            x: 5,
            y: 6
        });
        test(rect.getPosition().x === 5, 'rect x should be 5');
        test(rect.getPosition().y === 6, 'rect y should be 6');

        rect.setPosition({
            x: 7
        });
        test(rect.getPosition().x === 7, 'rect x should be 7');
        test(rect.getPosition().y === 6, 'rect y should be 6');

        rect.setPosition({
            y: 8
        });
        test(rect.getPosition().x === 7, 'rect x should be 7');
        test(rect.getPosition().y === 8, 'rect y should be 8');
    },
    'NODE - test setScale': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        rect.setScale(2, 3);
        test(rect.getScale().x === 2, 'rect scale x should be 2');
        test(rect.getScale().y === 3, 'rect scale x should be 3');

        rect.setScale(4);
        test(rect.getScale().x === 4, 'rect scale x should be 4');
        test(rect.getScale().y === 4, 'rect scale x should be 4');

        rect.setScale([5, 6]);
        test(rect.getScale().x === 5, 'rect scale x should be 5');
        test(rect.getScale().y === 6, 'rect scale x should be 6');

        rect.setScale([7, 8, 999, 999]);
        test(rect.getScale().x === 7, 'rect scale x should be 7');
        test(rect.getScale().y === 8, 'rect scale x should be 8');

        rect.setScale({
            x: 9,
            y: 10
        });
        test(rect.getScale().x === 9, 'rect scale x should be 9');
        test(rect.getScale().y === 10, 'rect scale x should be 10');

        rect.setScale({
            x: 11
        });
        test(rect.getScale().x === 11, 'rect scale x should be 11');
        test(rect.getScale().y === 10, 'rect scale x should be 10');

        rect.setScale({
            y: 12
        });
        test(rect.getScale().x === 11, 'rect scale x should be 11');
        test(rect.getScale().y === 12, 'rect scale x should be 12');

    },
    'NODE - test config scale': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect1 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {
                x: 2,
                y: 3
            }
        });

        var rect2 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: 2
        });

        var rect3 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: [2, 3]
        });

        var rect4 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {
                x: 2
            }
        });

        var rect5 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {
                y: 2
            }
        });

        layer.add(rect1).add(rect2).add(rect3).add(rect4).add(rect5);
        stage.add(layer);

        test(rect1.getScale().x === 2, 'rect1 scale x should be 2');
        test(rect1.getScale().y === 3, 'rect1 scale y should be 3');

        test(rect2.getScale().x === 2, 'rect2 scale x should be 2');
        test(rect2.getScale().y === 2, 'rect2 scale y should be 2');

        test(rect3.getScale().x === 2, 'rect3 scale x should be 2');
        test(rect3.getScale().y === 3, 'rect3 scale y should be 3');

        test(rect4.getScale().x === 2, 'rect4 scale x should be 2');
        test(rect4.getScale().y === 1, 'rect4 scale y should be 1');

        test(rect5.getScale().x === 1, 'rect5 scale x should be 1');
        test(rect5.getScale().y === 2, 'rect5 scale y should be 2');
    },
    'NODE - test config position': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect1 = new Kinetic.Rect({
            x: 1,
            y: 2,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect2 = new Kinetic.Rect({
            x: 3,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect3 = new Kinetic.Rect({
            y: 4,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect4 = new Kinetic.Rect({
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect1).add(rect2).add(rect3).add(rect4);
        stage.add(layer);

        test(rect1.getPosition().x === 1, 'rect1 x should be 1');
        test(rect1.getPosition().y === 2, 'rect1 y should be 2');

        test(rect2.getPosition().x === 3, 'rect2 x should be 3');
        test(rect2.getPosition().y === 0, 'rect2 y should be 0');

        test(rect3.getPosition().x === 0, 'rect3 x should be 0');
        test(rect3.getPosition().y === 4, 'rect3 y should be 4');

        test(rect4.getPosition().x === 0, 'rect4 x should be 0');
        test(rect4.getPosition().y === 0, 'rect4 y should be 0');
    },
    'NODE - test getPosition and getAbsolutePosition for shape inside transformed stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
            //rotationDeg: 60
            //rotationDeg: Math.PI / 3
        });

        layer.add(rect);
        stage.add(layer);

        //stage.rotateDeg(20);

        //console.log(rect.getAbsoluteTransform().getTranslation())

        stage.rotate(Math.PI / 3);
        stage.setScale(0.5);

        stage.draw();

        test(rect.getPosition().x === 200, 'rect position x should be 200');
        test(rect.getPosition().y === 20, 'rect position y should be 20');

        test(Math.round(rect.getAbsolutePosition().x) === 41, 'rect absolute position x should be about 41');
        test(Math.round(rect.getAbsolutePosition().y) === 92, 'rect absolute position y should be about 92');
    },
    'NODE - test get() selector by adding shape, then group, then layer': function(containerId) {
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
    'NODE - test get() selector by adding group, then shape, then layer': function(containerId) {
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
    'NODE - test get() selector by adding group, then layer, then shape': function(containerId) {
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
    'NODE - test get() selector by adding layer, then group, then shape': function(containerId) {
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
    },
    'NODE - test drag and drop properties and methods': function(containerId) {
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

        // test defaults
        test(circle.attrs.draggable === false, 'draggable should be false');
        test(circle.attrs.dragConstraint === 'none', 'drag constraint should be none');
        test(circle.attrs.dragBounds.left === undefined, 'drag left should be undefined');
        test(circle.attrs.dragBounds.top === undefined, 'drag top should be undefined');
        test(circle.attrs.dragBounds.right === undefined, 'drag right should be undefined');
        test(circle.attrs.dragBounds.bottom === undefined, 'drag bottom should be undefined');
        test(circle.getDragConstraint() === 'none', 'drag constraint should be none');
        test(circle.getDragBounds().bottom === undefined, 'drag bottom should be undefined');

        //change properties
        circle.draggable(true);
        circle.setDragConstraint('vertical');
        circle.setDragBounds({
            left: 50,
            top: 100,
            right: 150,
            bottom: 200
        });

        // test new properties
        test(circle.attrs.draggable === true, 'draggable should be true');
        test(circle.attrs.dragConstraint === 'vertical', 'drag constraint should be vertical');
        test(circle.attrs.dragBounds.left === 50, 'drag left should be 50');
        test(circle.attrs.dragBounds.top === 100, 'drag top should be 100');
        test(circle.attrs.dragBounds.right === 150, 'drag right should be 150');
        test(circle.attrs.dragBounds.bottom === 200, 'drag bottom should be 200');
        test(circle.getDragConstraint() === 'vertical', 'drag constraint should be vertical');
        test(circle.getDragBounds().bottom === 200, 'drag bottom should be 200');
    },
    'NODE - translate, rotate, scale shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Rect({
            x: 100,
            y: 100,
            rotationDeg: 20,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            scale: {
                x: 2,
                y: 1
            },
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        layer.add(circle);
        stage.add(layer);

        stage.onFrame(function(frame) {
            circle.rotation += .1;
            layer.draw();
        });
        //stage.start();

    },
    'NODE - simulate event': function(containerId) {
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

        var foo = '';

        circle.on('click', function() {
            foo = 'bar';

            /*
             var evt = window.event;
             var rightClick = evt.which ? evt.which == 3 : evt.button == 2;
             console.log(rightClick);
             */
        });

        circle.simulate('click');

        test(foo === 'bar', 'foo should equal bar');
    },
    'NODE - simulate event bubble': function(containerId) {
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

        var clicks = [];

        circle.on('click', function() {
            clicks.push('circle');
        });

        layer.on('click', function() {
            clicks.push('layer');
        });

        circle.simulate('click');

        test(clicks[0] === 'circle', 'circle event should be fired first');
        test(clicks[1] === 'layer', 'layer event should be fired second');
    },
    'STAGE - add layer then shape': function(containerId) {
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
    'TRANSFORMS - move shape, group, and layer, and then get absolute position': function(containerId) {
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

        circle.setPosition(100, 0);
        group.setPosition(100, 0);
        layer.setPosition(100, 0);

        // test relative positions
        test(circle.getPosition().x == 100, 'circle should be at x = 100');
        test(group.getPosition().x == 100, 'group should be at x = 100');
        test(layer.getPosition().x == 100, 'layer should be at x = 100');

        // test absolute positions
        test(circle.getAbsolutePosition().x == 300, 'circle should be at x = 300');
        test(group.getAbsolutePosition().x == 200, 'group should be at x = 200');
        test(layer.getAbsolutePosition().x == 100, 'layer should be at x = 100');

        layer.draw();
    },
    'TRANSFORMS - scale layer, rotate group, position shape, and then get absolute position': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            scale: {
                x: 2,
                y: 2
            }
        });
        var group = new Kinetic.Group({
            x: 100,
            rotationDeg: 90
        });

        var rect = new Kinetic.Rect({
            x: 50,
            y: 10,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        // test absolute positions
        test(rect.getAbsolutePosition().x == 180, 'rect should be at x = 180');
        test(rect.getAbsolutePosition().y == 100, 'rect should be at y = 100');

        layer.draw();
    },
    'SHAPE - hide show circle': function(containerId) {
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
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        test(circle.isVisible() === true, 'circle should be visible');

        circle.hide();
        layer.draw();

        test(circle.isVisible() === false, 'circle should be hidden');

        circle.show();
        layer.draw();

        test(circle.isVisible() === true, 'circle should be visible');
    },
    'SHAPE - set shape alpha to 0.5': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setAlpha(0.5);
        layer.add(circle);
        stage.add(layer);
    },
    'SHAPE - set shape alpha to 0.5 then back to 1': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setAlpha(0.5);
        layer.add(circle);
        stage.add(layer);

        test(circle.getAbsoluteAlpha() === 0.5, 'abs alpha should be 0.5');

        circle.setAlpha(1);
        layer.draw();

        test(circle.getAbsoluteAlpha() === 1, 'abs alpha should be 1');
    },
    ////////////////////////////////////////////////////////////////////////
    //  LAYERING tests
    ////////////////////////////////////////////////////////////////////////

    'LAYERING - get absolute z index': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group1 = new Kinetic.Group();
        var group2 = new Kinetic.Group();
        var group3 = new Kinetic.Group();
        var group4 = new Kinetic.Group();

        var shape1 = new Kinetic.Circle({
            x: 150,
            y: stage.getHeight() / 2,
            radius: 40,
            fill: 'green'
        });

        var shape2 = new Kinetic.Circle({
            x: 250,
            y: stage.getHeight() / 2,
            radius: 40,
            fill: 'green'
        });

        /*
         *        Stage(0)
         *          |
         *        Layer(1)
         *          |
         *    +-----+-----+
         *    |           |
         *   G1(2)       G2(3)
         *    |           |
         *    +       +---+---+
         *    |       |       |
         *   S1(4)   G3(5)  G4(6)
         *            |
         *            +
         *            |
         *           S2(7)
         */

        group1.add(shape1);
        group2.add(group3);
        group2.add(group4);
        group3.add(shape2);
        layer.add(group1);
        layer.add(group2);
        stage.add(layer);

        test(stage.getAbsoluteZIndex() === 0, 'stage abs zindex should be 0');
        test(layer.getAbsoluteZIndex() === 1, 'layer abs zindex should be 1');
        test(group1.getAbsoluteZIndex() === 2, 'group1 abs zindex should be 2');
        test(group2.getAbsoluteZIndex() === 3, 'group2 abs zindex should be 3');
        test(shape1.getAbsoluteZIndex() === 4, 'shape1 abs zindex should be 4');
        test(group3.getAbsoluteZIndex() === 5, 'group3 abs zindex should be 5');
        test(group4.getAbsoluteZIndex() === 6, 'group4 abs zindex should be 6');
        test(shape2.getAbsoluteZIndex() === 7, 'shape2 abs zindex should be 7');
    },
    'LAYERING - move blue circle on top of green circle with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var blueCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(blueCircle);
        layer.add(greenCircle);
        stage.add(layer);

        test(blueCircle.getZIndex() === 0, 'blue circle should have zindex 0 before relayering');
        test(greenCircle.getZIndex() === 1, 'green circle should have zindex 1 before relayering');

        blueCircle.moveToTop();

        test(blueCircle.getZIndex() === 1, 'blue circle should have zindex 1 after relayering');
        test(greenCircle.getZIndex() === 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    },
    'LAYERING - move green circle below blue circle with moveDown': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var blueCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(blueCircle);
        layer.add(greenCircle);
        stage.add(layer);

        test(blueCircle.getZIndex() === 0, 'blue circle should have zindex 0 before relayering');
        test(greenCircle.getZIndex() === 1, 'green circle should have zindex 1 before relayering');

        greenCircle.moveDown();

        test(blueCircle.getZIndex() === 1, 'blue circle should have zindex 1 after relayering');
        test(greenCircle.getZIndex() === 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    },
    'LAYERING - move blue group on top of green group with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var blueCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueGroup.add(blueCircle);
        greenGroup.add(greenCircle);

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
    'LAYERING - move blue group on top of green group with moveUp': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var blueCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueGroup.add(blueCircle);
        greenGroup.add(greenCircle);

        layer.add(blueGroup);
        layer.add(greenGroup);
        stage.add(layer);

        test(blueGroup.getZIndex() === 0, 'blue group should have zindex 0 before relayering');
        test(greenGroup.getZIndex() === 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveUp();

        test(blueGroup.getZIndex() === 1, 'blue group should have zindex 1 after relayering');
        test(greenGroup.getZIndex() === 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    },
    'LAYERING - move blue layer on top of green layer with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var blueCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(blueCircle);
        greenLayer.add(greenCircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        blueLayer.moveToTop();
    },
    'LAYERING - move green layer below blue layer with moveToBottom': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var blueCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(blueCircle);
        greenLayer.add(greenCircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        greenLayer.moveToBottom();
    },
    ////////////////////////////////////////////////////////////////////////
    //  ANIMATION tests
    ////////////////////////////////////////////////////////////////////////

    'ANIMATION - test start and stop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        var amplitude = 150;
        var period = 1000;
        // in ms
        var centerX = stage.getWidth() / 2 - 100 / 2;

        stage.onFrame(function(frame) {
            rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
            layer.draw();
        });
        var go = Kinetic.GlobalObject;

        test(go.animations.length === 0, 'should be no animations running');
        test(stage.animRunning === false, 'animRunning should be false');

        stage.start();

        test(go.animations.length === 1, 'should be 1 animation running');
        test(stage.animRunning === true, 'animRunning should be true');

        stage.start();

        test(go.animations.length === 1, 'should be 1 animation running');
        test(stage.animRunning === true, 'animRunning should be true');

        stage.stop();

        test(go.animations.length === 0, 'should be no animations running');
        test(stage.animRunning === false, 'animRunning should be false');

        stage.stop();

        test(go.animations.length === 0, 'should be no animations running');
        test(stage.animRunning === false, 'animRunning should be false');
    },
    ////////////////////////////////////////////////////////////////////////
    //  TRANSITION tests
    ////////////////////////////////////////////////////////////////////////

    'TRANSITION - start animation when transition completes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        var amplitude = 150;
        var period = 1000;
        var centerX = 0;

        stage.onFrame(function(frame) {
            rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
            layer.draw();
        });

        stage.start();
        stage.stop();
        centerX = 300;

        var go = Kinetic.GlobalObject;
        test(go.animations.length === 0, 'should be no animations running');
        test(stage.animRunning === false, 'animRunning should be false');

        rect.transitionTo({
            x: 300,
            duration: 1,
            callback: function() {
                test(rect.getX() === 300, 'rect x is not 300');

                test(go.animations.length === 0, 'should be no animations running');
                test(stage.animRunning === false, 'animRunning should be false');

                stage.start();

                test(go.animations.length === 1, 'should be no animations running');
                test(stage.animRunning === true, 'animRunning should be false');
            }
        });
    }
};
