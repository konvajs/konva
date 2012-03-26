Test.prototype.tests = {
    'TRANSITION - transition position and rotation': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var centerX = stage.width / 2 - 100 / 2;

        stage.onFrame(function(frame) {
            rect.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;
            layer.draw();
        });

        stage.start();

        setTimeout(function() {
            stage.stop();
        }, 3000);
    },
    'TRANSITION - hover linear transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: stage.width / 2 - 50,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        rect.on("mouseover", function() {
            this.transitionTo({
                scale: {
                    x: 1.5,
                    y: 1.5
                },
                duration: 1
            });
        });

        rect.on("mouseout", function() {
            this.transitionTo({
                scale: {
                    x: 1,
                    y: 1
                },
                duration: 1
            });
        });

        layer.add(rect);
        stage.add(layer);

    },
    'TRANSITION - hover ease-in transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: stage.width / 2 - 50,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        rect.on("mouseover", function() {
            this.transitionTo({
                scale: {
                    x: 1.5,
                    y: 1.5
                },
                duration: 1,
                easing: "ease-in"
            });
        });

        rect.on("mouseout", function() {
            this.transitionTo({
                scale: {
                    x: 1,
                    y: 1
                },
                duration: 1,
                easing: "ease-in"
            });
        });

        layer.add(rect);
        stage.add(layer);

    },
    'TRANSITION - hover ease-out transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: stage.width / 2 - 50,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        rect.on("mouseover", function() {
            this.transitionTo({
                scale: {
                    x: 1.5,
                    y: 1.5
                },
                duration: 1,
                easing: "ease-out"
            });
        });

        rect.on("mouseout", function() {
            this.transitionTo({
                scale: {
                    x: 1,
                    y: 1
                },
                duration: 1,
                easing: "ease-out"
            });
        });

        layer.add(rect);
        stage.add(layer);

    },
    'TRANSITION - hover ease-in-out transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: stage.width / 2 - 50,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        rect.on("mouseover", function() {
            this.transitionTo({
                scale: {
                    x: 1.5,
                    y: 1.5
                },
                duration: 1,
                easing: "ease-in-out"
            });
        });

        rect.on("mouseout", function() {
            this.transitionTo({
                scale: {
                    x: 1,
                    y: 1
                },
                duration: 1,
                easing: "ease-in-out"
            });
        });

        layer.add(rect);
        stage.add(layer);

    },
    'TRANSITION - ease-in, ease-out, ease-in-out hovers': function(containerId) {
        function addHovers(shape, easing) {
            shape.on("mouseover", function() {
                this.transitionTo({
                    scale: {
                        x: 1.5,
                        y: 1.5
                    },
                    duration: 1,
                    easing: easing
                });
            });
            shape.on("mouseout", function() {
                this.transitionTo({
                    scale: {
                        x: 1,
                        y: 1
                    },
                    duration: 1,
                    easing: easing
                });
            });
        }
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var greenBox = new Kinetic.Rect({
            x: 50,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        var blueBox = new Kinetic.Rect({
            x: stage.width / 2 - 50,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        var redBox = new Kinetic.Rect({
            x: 428,
            y: stage.height / 2 - 25,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            centerOffset: {
                x: 50,
                y: 25
            }
        });

        addHovers(greenBox, "ease-in");
        addHovers(blueBox, "ease-out");
        addHovers(redBox, "ease-in-out");

        layer.add(greenBox);
        layer.add(blueBox);
        layer.add(redBox);
        stage.add(layer);
    },
    'EVENTS - mousedown mouseup mouseover mouseout click dblclick / touchstart touchend dbltap': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    'EVENTS - move mouse from shape to another shape in same layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    'EVENTS - move mouse from shape in one group to shape in another group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var redGroup = new Kinetic.Group();
        var greenGroup = new Kinetic.Group();

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

        redGroup.add(redCircle);
        greenGroup.add(greenCircle);

        layer.add(redGroup);
        layer.add(greenGroup);

        stage.add(layer);
    },
    'EVENTS - move mouse from shape in one layer to shape in another layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    'EVENTS - mousemove from shape in one group to shape in another group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var redGroup = new Kinetic.Group();
        var greenGroup = new Kinetic.Group();

        var redCircle = new Kinetic.Circle({
            x: 200,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mousemove', function() {
            log('mousemove red circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.height / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mousemove', function() {
            log('mousemove green circle');
        });

        redGroup.add(redCircle);
        greenGroup.add(greenCircle);

        layer.add(redGroup);
        layer.add(greenGroup);

        stage.add(layer);
    },
    'EVENTS - group click events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

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
            stroke: 'black',
            name: 'red'
        });

        var greenCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            name: 'green'
        });

        group.add(redCircle);
        group.add(greenCircle);

        layer.add(group);
        stage.add(layer);
    },
    'EVENTS - group mousemove events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        group.on('mousemove', function() {
            log('mousemove group');
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

        var greenCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        group.add(redCircle);
        group.add(greenCircle);

        layer.add(group);
        stage.add(layer);
    },
    'EVENTS - group mouseover events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group({
            name: 'group'
        });

        group.on('mouseover', function() {
            log('mouseover group');
        });

        group.on('mouseout', function() {
            log('mouseout group');
        });
        var redCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'red'
        });

        var greenCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            name: 'green'
        });

        group.add(redCircle);
        group.add(greenCircle);

        layer.add(group);
        stage.add(layer);
    },
    'EVENTS - cancel event bubbling (only the red circle should fire click event)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    'EVENTS - get currentTarget': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        layer.on('click', function(evt) {
            log(evt.shape.getName());

        });
        var redCircle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'circle'
        });

        group.add(redCircle);
        layer.add(group);
        stage.add(layer);
    },
    'DRAG AND DROP - draggable true': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
    'DRAG AND DROP - scale and rotate stage after add layer then drag and drop shape': function(containerId) {
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
    },
    'DRAG AND DROP - scale stage before add shape then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 400
        });

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
    'DRAG AND DROP - drag and drop shape inside scaled group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group({
            scale: {
                x: 2,
                y: 2
            }
        });

        var circle = new Kinetic.Circle({
            x: 40,
            y: 40,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);
    },
    'DRAG AND DROP - translate, rotate, and scale shape, and then drag and drop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            rotationDeg: 60,
            scale: {
                x: 2,
                y: 1
            }
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);
    },
    'STAGE - save image as png (click on circle to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            stage.toDataURL(function(dataUrl) {
                /*
                 * here you can do anything you like with the data url.
                 * In this tutorial we'll just open the url with the browser
                 * so that you can see the result as an image
                 */
                window.open(dataUrl);
            });
        });

        layer.add(circle);
        stage.add(layer);
    },
    'STAGE - save image as low quality jpg (click on circle to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            stage.toDataURL(function(dataUrl) {
                /*
                 * here you can do anything you like with the data url.
                 * In this tutorial we'll just open the url with the browser
                 * so that you can see the result as an image
                 */
                window.open(dataUrl);
            }, 'image/jpeg', 0);
        });

        layer.add(circle);
        stage.add(layer);
    },
    'STAGE - save image as high quality jpg (click on circle to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.width / 2,
            y: stage.height / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            stage.toDataURL(function(dataUrl) {
                /*
                 * here you can do anything you like with the data url.
                 * In this tutorial we'll just open the url with the browser
                 * so that you can see the result as an image
                 */
                window.open(dataUrl);
            }, 'image/jpeg', 1);
        });

        layer.add(circle);
        stage.add(layer);
    }
};
