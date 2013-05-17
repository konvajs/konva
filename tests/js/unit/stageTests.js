Test.Modules.STAGE = {
    'instantiate stage with id': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
    },

    'instantiate stage with dom element': function(containerId) {
        var containerDom = document.getElementById(containerId);
        var stage = new Kinetic.Stage({
            container: containerDom,
            width: 578,
            height: 200
        });
    },
    'set stage size': function(containerId) {
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

        test(stage.getSize().width === 578 && stage.getSize().height === 200, 'stage size should be 578 x 200');
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

        layer.add(circle);
        stage.add(layer);

        stage.setSize(333, 155);

        test(stage.getSize().width === 333, 'stage width should be 333');
        test(stage.getSize().height === 155, 'stage height should be 155');
        test(stage.getContent().style.width === '333px', 'content width should be 333');
        test(stage.getContent().style.height === '155px', 'content height should be 155px');
        test(layer.getCanvas().element.width === 333, 'layer canvas element width should be 333');
        test(layer.getCanvas().element.height === 155, 'layer canvas element width should be 155');
    },
    'get stage DOM': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        test(stage.getContent().className === 'kineticjs-content', 'stage DOM class name is wrong');
    },
    'stage getAllIntersections()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            id: 'redCircle'
        });

        var greenCircle = new Kinetic.Circle({
            x: 300,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            id: 'greenCircle'
        });

        layer.add(redCircle);
        layer.add(greenCircle);
        stage.add(layer);

        test(stage.getIntersection(300, 100).shape.getId() === 'greenCircle', 'shape should be greenCircle');
        test(stage.getIntersection(380, 100).shape.getId() === 'redCircle', 'shape should be redCircle');
        test(stage.getIntersection(100, 100) === null, 'shape should be null');


    },
    'test getAllIntersections': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            id: 'redCircle'
        });

        var greenCircle = new Kinetic.Circle({
            x: 300,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            id: 'greenCircle'
        });

        layer.add(redCircle);
        layer.add(greenCircle);
        stage.add(layer);

        // test individual shapes
        test(stage.getAllIntersections(266, 114).length === 1, '17) getAllIntersections should return one shape');
        test(stage.getAllIntersections(266, 114)[0].getId() === 'greenCircle', '19) first intersection should be greenCircle');

        test(stage.getAllIntersections(414, 115).length === 1, '18) getAllIntersections should return one shape');
        test(stage.getAllIntersections(414, 115)[0].getId() === 'redCircle', '20) first intersection should be redCircle');

        test(stage.getAllIntersections(350, 118).length === 2, '1) getAllIntersections should return two shapes');
        test(stage.getAllIntersections(350, 118)[0].getId() === 'redCircle', '2) first intersection should be redCircle');
        test(stage.getAllIntersections(350, 118)[1].getId() === 'greenCircle', '3) second intersection should be greenCircle');

        // hide green circle.  make sure only red circle is in result set
        greenCircle.hide();
        layer.draw();

        test(stage.getAllIntersections(350, 118).length === 1, '4) getAllIntersections should return one shape');
        test(stage.getAllIntersections(350, 118)[0].getId() === 'redCircle', '5) first intersection should be redCircle');

        // show green circle again.  make sure both circles are in result set
        greenCircle.show();
        layer.draw();

        test(stage.getAllIntersections(350, 118).length === 2, '6) getAllIntersections should return two shapes');
        test(stage.getAllIntersections(350, 118)[0].getId() === 'redCircle', '7) first intersection should be redCircle');
        test(stage.getAllIntersections(350, 118)[1].getId() === 'greenCircle', '8) second intersection should be greenCircle');

        // hide red circle.  make sure only green circle is in result set
        redCircle.hide();
        layer.draw();

        test(stage.getAllIntersections(350, 118).length === 1, '9) getAllIntersections should return one shape');
        test(stage.getAllIntersections(350, 118)[0].getId() === 'greenCircle', '10) first intersection should be greenCircle');

        // show red circle again.  make sure both circles are in result set
        redCircle.show();
        layer.draw();

        test(stage.getAllIntersections(350, 118).length === 2, '11) getAllIntersections should return two shapes');
        test(stage.getAllIntersections(350, 118)[0].getId() === 'redCircle', '12) first intersection should be redCircle');
        test(stage.getAllIntersections(350, 118)[1].getId() === 'greenCircle', '13) second intersection should be greenCircle');

        // test from layer
        test(layer.getAllIntersections(350, 118).length === 2, '14) getAllIntersections should return two shapes');
        test(layer.getAllIntersections(350, 118)[0].getId() === 'redCircle', '15) first intersection should be redCircle');
        test(layer.getAllIntersections(350, 118)[1].getId() === 'greenCircle', '16) second intersection should be greenCircle');

    },
    'scale stage after add layer': function(containerId) {
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
    'scale stage before add shape': function(containerId) {
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
    'scale stage with no shapes': function(containerId) {
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
    'test stage.getStage()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        test(stage.getStage() !== undefined, 'stage is undefined');

        //console.log(stage.getStage());
    }
};