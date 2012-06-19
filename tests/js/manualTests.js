Test.prototype.tests = {
    'EVENTS - mousedown mouseup mouseover mouseout mousemove click dblclick / touchstart touchend touchmove tap dbltap': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('mousedown', function() {
            log('mousedown');
        });

        circle.on('mouseup', function() {
            log('mouseup');
        });

        circle.on('mouseover', function() {
            log('mouseover');
        });

        circle.on('mouseout', function() {
            log('mouseout');
        });

        circle.on('mousemove', function() {
            log('mousemove');
        });

        circle.on('click', function() {
            log('click');
        });

        circle.on('dblclick', function() {
            log('dblclick');
        });
        /*
         * mobile
         */
        circle.on('touchstart', function() {
            log('touchstart');
        });

        circle.on('touchend', function() {
            log('touchend');
        });

        circle.on('touchmove', function() {
            log('touchmove');
        });

        circle.on('tap', function(evt) {
            log('tap');
        });

        circle.on('dbltap', function() {
            log('dbltap');
        });

        layer.add(circle);
        stage.add(layer);
    },
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
            duration: 2,
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            easing: 'bounce-ease-out'
        });
    },
    'TRANSITION - all transition types': function(containerId) {
        document.getElementById(containerId).style.height = '300px';

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 300
        });
        var layer = new Kinetic.Layer();

        var easings = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'back-ease-in', 'back-ease-out', 'back-ease-in-out', 'elastic-ease-in', 'elastic-ease-out', 'elastic-ease-in-out', 'bounce-ease-out', 'bounce-ease-in', 'bounce-ease-in-out', 'strong-ease-in', 'strong-ease-out', 'strong-ease-in-out'];
        for(var n = 0; n < easings.length; n++) {
            var rect = new Kinetic.Rect({
                x: 10,
                y: 10 + (n * 200 / easings.length),
                width: 100,
                height: 10,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 2
            });

            layer.add(rect);

            rect.transitionTo({
                duration: 2,
                width: 500,
                easing: easings[n]
            });
        }

        stage.add(layer);
    },
    'ANIMATION - start and stop animation': function(containerId) {
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
            rect.attrs.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;
            layer.draw();
        });

        stage.start();

        setTimeout(function() {
            stage.stop();
        }, 3000);
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
            y: stage.getHeight() / 2 - 25,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            offset: {
                x: 50,
                y: 25
            }
        });

        var blueBox = new Kinetic.Rect({
            x: stage.getWidth() / 2 - 50,
            y: stage.getHeight() / 2 - 25,
            width: 100,
            height: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4,
            offset: {
                x: 50,
                y: 25
            }
        });

        var redBox = new Kinetic.Rect({
            x: 428,
            y: stage.getHeight() / 2 - 25,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            offset: {
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
    'EVENTS - modify fill stroke and stroke width on hover with star': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            numPoints: 10,
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
    'EVENTS - modify fill stroke and stroke width on hover with image': function(containerId) {
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
                this.setStroke('purple');
                this.setStrokeWidth(20);
                layer.draw();
            });

            darth.on('mouseout', function() {
                this.setStroke(undefined);
                this.setStrokeWidth(0);
                layer.draw();
            });

            layer.add(darth);
            stage.add(layer);
        };
        imageObj.src = '../darth-vader.jpg';
    },
    'EVENTS - star pixel detection': function(containerId) {
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
    },
    'EVENTS - drag events click': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        Ellipse.setDraggable(true);

        Ellipse.on('dragstart', function() {
            log('dragstart');
        });

        Ellipse.on('dragmove', function() {
            log('dragmove');
        });

        Ellipse.on('dragend', function() {
            log('dragend');
        });

        Ellipse.on('click', function() {
            log('click');
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'EVENTS - move mouse from shape to another shape in same layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var redEllipse = new Kinetic.Ellipse({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redEllipse.on('mouseover', function() {
            log('mouseover red Ellipse');
        });
        redEllipse.on('mouseout', function() {
            log('mouseout red Ellipse');
        });
        var greenEllipse = new Kinetic.Ellipse({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenEllipse.on('mouseover', function() {
            log('mouseover green Ellipse');
        });
        greenEllipse.on('mouseout', function() {
            log('mouseout green Ellipse');
        });

        layer.add(redEllipse);
        layer.add(greenEllipse);

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

        var redEllipse = new Kinetic.Ellipse({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redEllipse.on('mouseover', function() {
            log('mouseover red Ellipse');
        });
        redEllipse.on('mouseout', function() {
            log('mouseout red Ellipse');
        });
        var greenEllipse = new Kinetic.Ellipse({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenEllipse.on('mouseover', function() {
            log('mouseover green Ellipse');
        });
        greenEllipse.on('mouseout', function() {
            log('mouseout green Ellipse');
        });

        redGroup.add(redEllipse);
        greenGroup.add(greenEllipse);

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

        var redEllipse = new Kinetic.Ellipse({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redEllipse.on('mouseover', function() {
            log('mouseover red Ellipse');
        });
        redEllipse.on('mouseout', function() {
            log('mouseout red Ellipse');
        });
        var greenEllipse = new Kinetic.Ellipse({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenEllipse.on('mouseover', function() {
            log('mouseover green Ellipse');
        });
        greenEllipse.on('mouseout', function() {
            log('mouseout green Ellipse');
        });

        redLayer.add(redEllipse);
        greenLayer.add(greenEllipse);

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

        var redEllipse = new Kinetic.Ellipse({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redEllipse.on('mousemove', function() {
            log('mousemove red Ellipse');
        });
        var greenEllipse = new Kinetic.Ellipse({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenEllipse.on('mousemove', function() {
            log('mousemove green Ellipse');
        });

        redGroup.add(redEllipse);
        greenGroup.add(greenEllipse);

        layer.add(redGroup);
        layer.add(greenGroup);

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
        var redEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        var greenEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        group.add(redEllipse);
        group.add(greenEllipse);

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
        var redEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'red'
        });

        var greenEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            name: 'green'
        });

        group.add(redEllipse);
        group.add(greenEllipse);

        layer.add(group);
        stage.add(layer);
    },
    'EVENTS - cancel event bubbling (only the red Ellipse should fire click event)': function(containerId) {
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
        var redEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redEllipse.on('click', function(evt) {
            log('click red Ellipse');
            evt.cancelBubble = true;
        });

        group.add(redEllipse);
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
        var redEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'Ellipse'
        });

        group.add(redEllipse);
        layer.add(group);
        stage.add(layer);
    },
    'EVENTS - shape mouseout handlers when mouse leaves stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var redEllipse = new Kinetic.Ellipse({
            x: 550,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'Ellipse'
        });

        redEllipse.on('mouseout', function() {
            log('mouseout');
        });

        layer.add(redEllipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop elastic star with shadow': function(containerId) {
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
            lineJoin: "round",
            shadow: {
                color: '#aaa',
                blur: 10,
                offset: {
                    x: 5,
                    y: 5
                }
            },
            draggable: true
        });

        layer.add(star);
        stage.add(layer);
        star.setLineJoin('bevel');
        layer.draw();

        var trans = null;

        star.on('dragstart', function() {
            if(trans) {
                trans.stop();
            }

            star.setAttrs({
                shadow: {
                    offset: {
                        x: 15,
                        y: 15
                    }
                },
                offset: {
                    x: 10,
                    y: 10
                }
            });
        });

        star.on('dragend', function() {
            trans = star.transitionTo({
                duration: 0.5,
                easing: 'elastic-ease-out',
                shadow: {
                    offset: {
                        x: 5,
                        y: 5
                    }
                },
                offset: {
                    x: 0,
                    y: 0
                }
            })
        });
        /*
         stage.onFrame(function(frame) {
         star.rotate(1 * frame.timeDiff / 1000);
         layer.draw();
         });

         stage.start();
         */
    },
    'DRAG AND DROP - two draggable shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            //detectionType: 'pixel'
        });

        Ellipse.setDraggable(true);

        var Ellipse2 = new Kinetic.Ellipse({
            x: 350,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
            //detectionType: 'pixel'
        });

        /*
         Ellipse.on('dragend', function() {
         Ellipse.saveData();
         });
         */

        layer.add(Ellipse).add(Ellipse2);
        stage.add(layer);

        //Ellipse.saveData();
    },
    'DRAG AND DROP - drag and drop stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            draggable: true,
            //dragConstraint: 'horizontal',
            /*
             dragBounds: {
             left: 100
             }
             */
        });
        var layer = new Kinetic.Layer({
            /*
             draggable: true,
             dragBounds: {
             left: 100
             }
             */
        });
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            //draggable: true,
            /*
             dragBounds: {
             left: 100
             }
             */
        });

        //stage.setDraggable(false);
        //layer.setDraggable(false);

        /*
         stage.on('dragstart', function() {
         console.log('dragstart');
         });
         stage.on('dragmove', function() {
         //console.log('dragmove');
         });
         stage.on('dragend', function() {
         console.log('dragend');
         });
         */

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - draggable true false': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.setDraggable(true);

        layer.add(Ellipse);
        stage.add(layer);

        Ellipse.setDraggable(false);
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
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.setDraggable(true);

        stage.setScale(0.5);
        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - set stage scale to 1.5 after add layer then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.setDraggable(true);

        layer.add(Ellipse);
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
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.setDraggable(true);

        stage.setScale(1.5);

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - check that green events are ignored when dragging red Ellipse': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse1 = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        var Ellipse2 = new Kinetic.Ellipse({
            x: stage.getWidth() / 2 + 50,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse1.setDraggable(true);

        Ellipse2.on('mouseover', function() {
            log('mouseover green Ellipse');
        });

        layer.add(Ellipse1);
        layer.add(Ellipse2);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop constrianed horiztontally inside positioned group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group({
            x: 0,
            y: 10
        });
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragConstraint: 'horizontal'
        });

        group.add(Ellipse);
        layer.add(group);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop constrianed vertically': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragConstraint: 'vertical'
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with explicit no constraint': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragConstraint: 'none'
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with left bounds': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                left: 150
            }
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with right bounds': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                right: 400
            }
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with top bounds': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                top: 80
            }
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with bottom bounds': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBounds: {
                bottom: 120
            }
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'DRAG AND DROP - drag and drop with full rect bounds': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
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

        layer.add(Ellipse);
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
        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: 100,
            radius: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        layer.add(Ellipse);
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

        var Ellipse = new Kinetic.Ellipse({
            x: 40,
            y: 40,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        group.add(Ellipse);
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
    'DRAG AND DROP - translate, rotate, center offset, and scale shape, and then drag and drop': function(containerId) {
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
            },
            offset: {
                x: 50,
                y: 25
            }
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        stage.onFrame(function() {
            rect.rotate(0.01);
            layer.draw();
        });
        //stage.start();

    },
    'STAGE - hide stage': function(containerId) {
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

        stage.hide();
        stage.draw();
    },
    'STAGE - hide layer': function(containerId) {
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

        layer.hide();

        stage.draw();
    },
    'STAGE - hide group': function(containerId) {
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

        group.hide();

        stage.draw();
    },
    'STAGE - save image as png (click on Ellipse to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.on('click', function() {
            stage.toDataURL(function(dataUrl) {
                /*
                 * here you can do anything you like with the data url.
                 * In this tutorial we'll just open the url with the browser
                 * so that you can see the result as an image
                 */
                window.open(dataUrl);
            });
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'STAGE - save image as low quality jpg (click on Ellipse to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.on('click', function() {
            stage.toDataURL(function(dataUrl) {
                /*
                 * here you can do anything you like with the data url.
                 * In this tutorial we'll just open the url with the browser
                 * so that you can see the result as an image
                 */
                window.open(dataUrl);
            }, 'image/jpeg', 0);
        });

        layer.add(Ellipse);
        stage.add(layer);
    },
    'STAGE - save image as high quality jpg (click on Ellipse to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var Ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        Ellipse.on('click', function() {
            stage.toDataURL(function(dataUrl) {
                /*
                 * here you can do anything you like with the data url.
                 * In this tutorial we'll just open the url with the browser
                 * so that you can see the result as an image
                 */
                window.open(dataUrl);
            }, 'image/jpeg', 1);
        });

        layer.add(Ellipse);
        stage.add(layer);
    }
};
