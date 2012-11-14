Test.Modules.CIRCLE = {
    'test attrs': function(containerId) {
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
        test(attrs.radius === 70, 'radius attr should be 70');
        test(attrs.fill === 'green', 'fill attr should be fill');
        test(attrs.stroke === 'black', 'stroke attr should be stroke');
        test(attrs.strokeWidth === 4, 'strokeWidth attr should be strokeWidth');
        test(attrs.name === 'myCircle', 'name attr should be myCircle');
        test(attrs.draggable === true, 'draggable attr should be true');
    },
    'add circle with pattern fill': function(containerId) {
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
                    offset: [-200, -70],
                    scale: 0.7
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

            //document.body.appendChild(layer.bufferCanvas.element)
        };
        imageObj.src = '../assets/darth-vader.jpg';

    },
    'add circle with radial gradient fill': function(containerId) {
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

        //document.body.appendChild(layer.bufferCanvas.element)

    },
    'add circle': function(containerId) {
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
    },
    'add shape with linear gradient fill': function(containerId) {
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

        document.body.appendChild(layer.bufferCanvas.element)
    },
    'add circle with opacity': function(containerId) {
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
            fill: 'red'
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        circle.setOpacity(0.5);
        layer.draw();

        circle.setOpacity(0.5);
        layer.draw();
    },
    'set fill after instantiation': function(containerId) {
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
    }
};
