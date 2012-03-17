Test.prototype.tests = {
    'TRANSITION - transition position and rotation': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        rect.transitionTo({
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            duration: 1
        });
    },
    'TRANSITION - transition position and rotation with two transitions': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        rect.transitionTo({
            x: 400,
            y: 30,
            duration: 1
        });

        rect.transitionTo({
            rotation: Math.PI * 2,
            duration: 2
        });
    },
    'ANIMATION - run animation': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
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
        var centerX = stage.width / 2 - 100 / 2;

        stage.onFrame(function(frame) {
            rect.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;
            layer.draw();
        });

        stage.start();
    },
    'EVENTS - mousedown mouseup mouseover mouseout click dblclick / touchstart touchend dbltap': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        circle.on('mousedown', function() {
            log('mousedown');
        });

        circle.on('mouseup', function() {
            log('mouseup');
        });

        circle.on('touchstart', function() {
            log('touchstart');
        });

        circle.on('touchend', function() {
            log('touchend');
        });

        circle.on('mouseover', function() {
            log('mouseover');
        });

        circle.on('mouseout', function() {
            log('mouseout');
        });

        circle.on('click', function() {
            log('click');
        });

        circle.on('dblclick', function() {
            log('dblclick');
        });

        circle.on('dbltap', function() {
            log('dbltap');
        });

        layer.add(circle);
        stage.add(layer);
    },
    'EVENTS - modify fill stroke and stroke width on hover with circle': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        circle.on('mouseover', function() {
            this.setFill('yellow');
            this.setStroke('purple');
            this.setStrokeWidth(20);
            layer.draw();
        });

        circle.on('mouseout', function() {
            this.setFill('red');
            this.setStroke('black');
            this.setStrokeWidth(4);
            layer.draw();
        });

        layer.add(circle);
        stage.add(layer);
    },
    'EVENTS - modify fill stroke and stroke width on hover with circle with star': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            points: 10,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        star.on('mouseover', function() {
            this.setFill('yellow');
            this.setStroke('purple');
            this.setStrokeWidth(20);
            layer.draw();
        });

        star.on('mouseout', function() {
            this.setFill('green');
            this.setStroke('blue');
            this.setStrokeWidth(5);
            layer.draw();
        });

        layer.add(star);
        stage.add(layer);
    },
    'EVENTS - modify fill stroke and stroke width on hover with circle with image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var darth = new Kinetic.Image({
                x: 60,
                y: 60,
                image: imageObj
            });

            darth.on('mouseover', function() {
                this.setFill('yellow');
                this.setStroke('purple');
                this.setStrokeWidth(20);
                layer.draw();
            });

            darth.on('mouseout', function() {
                this.setFill(undefined);
                this.setStroke(undefined);
                this.setStrokeWidth(0);
                layer.draw();
            });

            layer.add(darth);
            stage.add(layer);
        };
        imageObj.src = '../darth-vader.jpg';
    },
    'EVENTS - drag events click': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        circle.draggable(true);

        circle.on('dragstart', function() {
            log('dragstart');
        });

        circle.on('dragmove', function() {
            log('dragmove');
        });

        circle.on('dragend', function() {
            log('dragend');
        });

        circle.on('click', function() {
            log('click');
        });

        layer.add(circle);
        stage.add(layer);
    },
    'EVENTS - isDragging': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        //log('not dragging yet before draggable, isDragging: ' + circle.isDragging());
        test(circle.isDragging() === false, 'isDragging() should be false');

        circle.draggable(true);

        //log('not dragging yet after draggable, isDragging: ' + circle.isDragging());
        test(circle.isDragging() === false, 'isDragging() should be false');

        circle.on('dragstart', function() {
            log('dragstart, isDragging: ' + this.isDragging());
            test(circle.isDragging() === true, 'isDragging() should be true');
        });

        circle.on('dragmove', function() {
            log('dragmove, isDragging: ' + this.isDragging());
            test(circle.isDragging() === true, 'isDragging() should be true');
        });

        circle.on('dragend', function() {
            log('dragend, isDragging: ' + this.isDragging());
            test(circle.isDragging() === false, 'isDragging() should be false');
        });

        layer.add(circle);
        stage.add(layer);
    },
    'EVENTS - mousemove from shape to another shape in same layer': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 200,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mouseover', function() {
            log('mouseover red circle');
        });
        redCircle.on('mouseout', function() {
            log('mouseout red circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mouseover', function() {
            log('mouseover green circle');
        });
        greenCircle.on('mouseout', function() {
            log('mouseout green circle');
        });

        layer.add(redCircle);
        layer.add(greenCircle);

        stage.add(layer);
    },
    'EVENTS - mousemove from shape in one layer to shape in another layer': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var redLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 200,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mouseover', function() {
            log('mouseover red circle');
        });
        redCircle.on('mouseout', function() {
            log('mouseout red circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mouseover', function() {
            log('mouseover green circle');
        });
        greenCircle.on('mouseout', function() {
            log('mouseout green circle');
        });

        redLayer.add(redCircle);
        greenLayer.add(greenCircle);

        stage.add(redLayer);
        stage.add(greenLayer);
    },
    'EVENTS - event bubbling': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        layer.on('mouseover', function() {
            log('mouseover layer');
            //console.log(this);
        });
        layer.on('mouseout', function() {
            log('mouseout layer');
            //console.log(this);
        });

        group.on('mouseover', function() {
            log('mouseover group');
            //console.log(this);
        });
        group.on('mouseout', function() {
            log('mouseout group');
            //console.log(this);
        });
        var redCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mouseover', function() {
            log('mouseover red circle');
            //console.log(this);
        });
        redCircle.on('mouseout', function() {
            log('mouseout red circle');
            //console.log(this);
        });
        var greenCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mouseover', function() {
            log('mouseover green circle');
            //console.log(this);
        });
        greenCircle.on('mouseout', function() {
            log('mouseout green circle');
            //console.log(this);
        });

        group.add(redCircle);
        group.add(greenCircle);

        layer.add(group);
        stage.add(layer);
    },
    'EVENTS - cancel event bubbling (only the red circle should fire click event)': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        layer.on('click', function() {
            log('click layer');
            //console.log(this);
        });
        group.on('click', function() {
            log('click group');
            //console.log(this);
        });
        
        var redCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('click', function(evt) {
            log('click red circle');
            evt.cancelBubble = true;
        });

        group.add(redCircle);
        layer.add(group);
        stage.add(layer);
    },
    'DRAG AND DROP - draggable true': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.draggable(true);

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - draggable true false': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.draggable(true);

        layer.add(circle);
        stage.add(layer);

        circle.draggable(false);
    },
    'DRAG AND DROP - scale stage after add layer then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.draggable(true);

        layer.add(circle);
        stage.add(layer);

        stage.setScale(0.5);

        stage.draw();
    },
    'DRAG AND DROP - scale stage before add shape then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.draggable(true);

        stage.setScale(0.5);
        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - set stage scale to 1.5 after add layer then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.draggable(true);

        layer.add(circle);
        stage.add(layer);

        stage.setScale(1.5);

        stage.draw();
    },
    'DRAG AND DROP - set stage scale to 1.5 before add layer then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.draggable(true);

        stage.setScale(1.5);

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - check that green events are ignored when dragging red circle': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle1 = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        var circle2 = new Kinetic.Circle({
            x: stage.width / 2 + 50,
            y: stage.height / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        circle1.draggable(true);

        circle2.on('mouseover', function() {
            log('mouseover green circle');
        });

        layer.add(circle1);
        layer.add(circle2);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop constrianed horiztonally': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragConstraint: 'horizontal'
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop constrianed vertically': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragConstraint: 'vertical'
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with explicit no constraint': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragConstraint: 'none'
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with left bounds': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                left: 150
            }
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with right bounds': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                right: 400
            }
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with top bounds': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                top: 80
            }
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with bottom bounds': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                bottom: 120
            }
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with full rect bounds': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 200);
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                top: 80,
                bottom: 120,
                left: 150,
                right: 578 - 150
            }
        });

        layer.add(circle);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop shape inside scrollable div': function(containerId) {
        var stage = new Kinetic.Stage(containerId, 578, 400);

        // make container scrollable
        var container = stage.getContainer();
        container.style.overflow = 'auto';

        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: 100,
            radius: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        layer.add(circle);
        stage.add(layer);
    },
};
