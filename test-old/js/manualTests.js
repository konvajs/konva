Test.Modules.Tween = {
    'tween spline': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var spline = new Kinetic.Spline({
            points: [
                73, 160,
                340, 23,
                500, 109,
                300, 109
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(spline);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: spline,
            duration: 1,
           //x: 100,

            points: [
                200, 160,
                200, 23,
                500, 109,
                100, 10
            ],
            easing: Kinetic.Easings.BackEaseOut
        });

        stage.getContent().addEventListener('mouseover', function() {
          tween.play();
        });

        stage.getContent().addEventListener('mouseout', function() {
          tween.reverse();
        });

    },
    'tween clipping region': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            clipX: 0,
            clipY: 0,
            clipWidth: 150,
            clipHeight: 100
        });

        var spline = new Kinetic.Spline({
            points: [
                73, 160,
                340, 23,
                500, 109,
                300, 109
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(spline);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: layer,
            duration: 1,
            clipWidth: 500,
            clipHeight: 200,
            easing: Kinetic.Easings.BackEaseOut
        });

        stage.getContent().addEventListener('mouseover', function() {
          tween.play();
        });

        stage.getContent().addEventListener('mouseout', function() {
          tween.reverse();
        });

    },
    'ease-in, ease-out, ease-in-out hovers': function(containerId) {
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



        layer.add(greenBox);
        layer.add(blueBox);
        layer.add(redBox);
        stage.add(layer);

        greenBox.tween = new Kinetic.Tween({
            node: greenBox,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1,
            easing: Kinetic.Easings.EaseIn
        });

        blueBox.tween = new Kinetic.Tween({
            node: blueBox,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1,
            easing: Kinetic.Easings.EaseOut
        });

        redBox.tween = new Kinetic.Tween({
            node: redBox,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1,
            easing: Kinetic.Easings.EaseInOut
        });

        layer.on("mouseover", function(evt) {
            evt.targetNode.tween.play();
        });
        layer.on("mouseout", function(evt) {
            evt.targetNode.tween.reverse();
        });
    },
    'simple tween': function(containerId) {
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

        layer.add(greenBox);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: greenBox,
            duration: 2,
            x: 200,
            scaleX: 2,
            scaleY: 2,
            easing: Kinetic.Easings.BounceEaseOut,
            yoyo: false,
            onFinish: function() {
                console.log('finished!');
            },
            onReset: function() {
                console.log('reset!');
            }
        });

        var tween2 = new Kinetic.Tween({
            node: greenBox,
            duration: 4,
            x: 400,
            easing: Kinetic.Easings.BounceEaseOut
        });

        tween.play();
        //tween2.play();

        document.getElementById(containerId).addEventListener('click', function() {
            tween.seek(1.5);
            tween.reverse();
        });
    },
    'tween stage': function(containerId) {
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

        layer.add(greenBox);
        stage.add(layer);

        var tween = new Kinetic.Tween({
            node: stage,
            duration: 2,
            x: 400,
            scaleX: 2,
            scaleY: 2,
            easing: Kinetic.Easings.BounceEaseOut,
            yoyo: false,
            onFinish: function() {
                console.log('finished!');
            }
        });

        tween.play();

    }
};


Test.Modules.ANIMATION = {
    'start and stop animation': function(containerId) {
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

        var anim = new Kinetic.Animation(function(frame) {
            rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
        }, layer);

        anim.start();

        setTimeout(function() {
            anim.stop();
        }, 3000);
    },
    'animation with two layers': function(containerId) {
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

        var layer2 = new Kinetic.Layer();
        var rect2 = new Kinetic.Rect({
            x: 250,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        layer2.add(rect2);
        stage.add(layer);
        stage.add(layer2);

        var anim = new Kinetic.Animation(function(frame) {
            rect.rotateDeg(1);
            rect2.rotateDeg(1);
        }, [layer, layer2]);

        anim.start();

    },
    'test multiple animations': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var greenRect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        var blueRect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(greenRect);
        layer.add(blueRect);
        stage.add(layer);

        var amplitude = 150;
        var period = 1000;
        // in ms
        var centerX = stage.getWidth() / 2 - 100 / 2;

        var greenAnim = new Kinetic.Animation(function(frame) {
            greenRect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
        }, layer);
        var blueAnim = new Kinetic.Animation(function(frame) {
            blueRect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
        }, layer);

        greenAnim.start();

        setTimeout(function() {
            blueAnim.start();
        }, 1000);
        setTimeout(function() {
            greenAnim.stop();
        }, 2000);
        setTimeout(function() {
            blueAnim.stop();
        }, 3000);
        setTimeout(function() {
            greenAnim.start();
        }, 4000);
        setTimeout(function() {
            greenAnim.stop();
        }, 5000);
    }
};


Test.Modules.EVENTS = {
    'mousedown mouseup mouseover mouseout mousemove click dblclick / touchstart touchend touchmove tap dbltap': function(containerId) {
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
    '_setMousePosition on a 3D-transformed container - drag red circle': function(containerId) {
    
        var container = document.getElementById(containerId);
        container.style.transform = 'perspective(500px) rotateX(45deg)';
        container.style.webkitTransform = 'perspective(500px) rotateX(45deg) translate3D(80px,80px,100px)';   

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        
        layer.add(new Kinetic.Rect({
            x: 0,
            y: 0,
            width: stage.getWidth(),
            height: stage.getHeight(),
            fill: '#ccf'
        }));
        
        layer.add(new Kinetic.Line({
            points: [289, 0, 289, 200],
            stroke: 'black',
            strokeWidth: 2
        }));
          
        layer.add(new Kinetic.Line({
            points: [0, 100, 578, 100],
            stroke: 'black',
            strokeWidth: 2
        }));
        
        var clickShape = new Kinetic.Circle({
            x:289,
            y:100,
            radius:10,
            fill:'red', 
            draggable:true
        });

        clickShape.on("click tap", function(evt) {
            layer.add(new Kinetic.Circle({x:evt.offsetX,y:evt.offsetY,radius:5,fill:'blue'}));
            layer.draw();
            evt.cancelBubble = true;
        });

        layer.add(clickShape);
        stage.add(layer);
    },  
    'modify fill stroke and stroke width on hover with star': function(containerId) {
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
    'modify fill stroke and stroke width on hover with image': function(containerId) {
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
                this.setStroke(null);
                this.setStrokeWidth(0);
                layer.draw();
            });

            layer.add(darth);
            stage.add(layer);

            //document.body.appendChild(layer.bufferCanvas.element)
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'star pixel detection': function(containerId) {
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
            draggable: true
        });

        star.on('mouseover', function() {
            log('mouseover');
        });

        star.on('mouseout', function() {
            log('mouseout');
        });

        layer.add(star);
        stage.add(layer);

        showHit(layer);
    },
    'drag events click': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        Circle.setDraggable(true);

        Circle.on('dragstart', function() {
            log('dragstart');
        });

        Circle.on('dragmove', function() {
            log('dragmove');
        });

        Circle.on('dragend', function() {
            log('dragend');
        });

        Circle.on('click', function() {
            log('click');
        });

        layer.add(Circle);
        stage.add(layer);
    },
    'move mouse from shape to another shape in same layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mouseover', function() {
            log('mouseover red Circle');
        });
        redCircle.on('mouseout', function() {
            log('mouseout red Circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mouseover', function() {
            log('mouseover green Circle');
        });
        greenCircle.on('mouseout', function() {
            log('mouseout green Circle');
        });

        layer.add(redCircle);
        layer.add(greenCircle);

        stage.add(layer);

        //greenCircle.hide();
        layer.draw();

        //document.body.appendChild(layer.bufferCanvas.element);
    },
    'move mouse from shape in one group to shape in another group': function(containerId) {
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
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mouseover', function() {
            log('mouseover red Circle');
        });
        redCircle.on('mouseout', function() {
            log('mouseout red Circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mouseover', function() {
            log('mouseover green Circle');
        });
        greenCircle.on('mouseout', function() {
            log('mouseout green Circle');
        });

        redGroup.add(redCircle);
        greenGroup.add(greenCircle);

        layer.add(redGroup);
        layer.add(greenGroup);

        stage.add(layer);
    },
    'move mouse from shape in one layer to shape in another layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var redLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mouseover', function() {
            log('mouseover red Circle');
        });
        redCircle.on('mouseout', function() {
            log('mouseout red Circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mouseover', function() {
            log('mouseover green Circle');
        });
        greenCircle.on('mouseout', function() {
            log('mouseout green Circle');
        });

        redLayer.add(redCircle);
        greenLayer.add(greenCircle);

        stage.add(redLayer);
        stage.add(greenLayer);
    },
    'mousemove from shape in one group to shape in another group': function(containerId) {
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
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('mousemove', function() {
            log('mousemove red Circle');
        });
        var greenCircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black'
        });

        greenCircle.on('mousemove', function() {
            log('mousemove green Circle');
        });

        redGroup.add(redCircle);
        greenGroup.add(greenCircle);

        layer.add(redGroup);
        layer.add(greenGroup);

        stage.add(layer);
    },
    'group mousemove events': function(containerId) {
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
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        var greenCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
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
    'cancel event bubbling (only the red Circle should fire click event)': function(containerId) {
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
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        redCircle.on('click', function(evt) {
            log('click red Circle');
            evt.cancelBubble = true;
        });

        group.add(redCircle);
        layer.add(group);
        stage.add(layer);
    },
    'get currentTarget': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        layer.on('click', function(evt) {
            log(evt.targetNode.getName());

        });
        var redCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'Circle'
        });

        group.add(redCircle);
        layer.add(group);
        stage.add(layer);
    },
    'shape mouseout handlers when mouse leaves stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 550,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'Circle'
        });

        redCircle.on('mouseout', function() {
            log('mouseout');
        });

        layer.add(redCircle);
        stage.add(layer);
    }
};

Test.Modules.DRAG_AND_DROP = {
    'drag and drop layer with offset': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            offset: [50, 50],
            draggable: true
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
            lineJoin: "round"
        });

        layer.add(star);
        stage.add(layer);
        layer.draw();
    },
    'drag and drop star with shadow': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
            x: 260,
            y: 160,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: "round",
            shadowColor: '#aaa',
            shadowBlur: 10,
            shadowOffset: {
                x: 5,
                y: 5
            },
            offset: 60,
            draggable: true,
            name: 'star'
        });

        layer.add(star);
        stage.add(layer);
        star.setLineJoin('bevel');
        layer.draw();


        showHit(layer);
    },
    'two draggable shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            listening: false
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle.setDraggable(true);

        var Circle2 = new Kinetic.Circle({
            x: 350,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        /*
         Circle.on('dragend', function() {
         Circle.savePixels();
         });
         */

        layer.add(Circle).add(Circle2);
        stage.add(layer);

        //Circle.savePixels();
    },
    'drag and drop stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            draggable: true
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(Circle);
        stage.add(layer);

        showHit(layer);
    },
    'draggable true': function(containerId) {
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
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.setDraggable(true);

        layer.add(circle);
        stage.add(layer);

        circle.on('dragmove', function() {
            console.log(this.getLayer().getId());
        });

    },
    'scale and rotate stage after add layer then drag and drop shape': function(containerId) {
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
    'scale stage before add shape then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle.setDraggable(true);

        stage.setScale(0.5);
        layer.add(Circle);
        stage.add(layer);
    },
    'set stage scale to 1.5 after add layer then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle.setDraggable(true);

        layer.add(Circle);
        stage.add(layer);

        stage.setScale(1.5);

        stage.draw();
    },
    'drag bound function': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rectHeight = 50;
        var rectWidth = 100;
        var rectY = (stage.getHeight() - rectHeight) / 2;

        var hbox = new Kinetic.Text({
            x: 380,
            y: 70,
            fontSize: 18,
            fontFamily: "Calibri",
            text: "shiftKey",
            fill: "black",
            padding: 15,
            draggable: true,
            dragBoundFunc: function(pos, evt) {
                var newPos = pos;
                if(evt.shiftKey) {
                    newPos.x = Math.round(pos.x / 20) * 20;
                    newPos.y = Math.round(pos.y / 20) * 20;
                }
                return pos;
            }
        });

        var vbox = new Kinetic.Text({
            x: 70,
            y: 70,
            draggable: true,
            fontSize: 18,
            fontFamily: "Calibri",
            text: "diagonal",
            fill: "black",
            padding: 15,
            dragBoundFunc: function(pos) {
                p = (pos.y + pos.x) / 2;
                return {
                    y: p,
                    x: p
                };
            }
        });

        var circle = new Kinetic.Circle({
            x: 280,
            y: 45,
            radius: 50,
            fill: "red",
            strokeWidth: 4,
            draggable: true,
            fontSize: 18,
            dragBoundFunc: function(pos) {
                var circle = {
                    x: 280,
                    y: 95,
                    r: 50
                };
                var scale = circle.r / Math.sqrt(Math.pow(pos.x - circle.x, 2) + Math.pow(pos.y - circle.y, 2));
                if(scale < 1)
                    return {
                        y: Math.round((pos.y - circle.y) * scale + circle.y),
                        x: Math.round((pos.x - circle.x) * scale + circle.x)
                    };
                else
                    return pos;
            }
        });

        layer.add(hbox);
        layer.add(vbox);
        layer.add(circle);
        stage.add(layer);
    },
    'set stage scale to 1.5 before add layer then drag and drop shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle.setDraggable(true);

        stage.setScale(1.5);

        layer.add(Circle);
        stage.add(layer);
    },
    'check that green events are ignored when dragging red Circle': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Circle1 = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        var Circle2 = new Kinetic.Circle({
            x: stage.getWidth() / 2 + 50,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle1.setDraggable(true);

        Circle2.on('mouseover', function() {
            log('mouseover green Circle');
        });

        layer.add(Circle1);
        layer.add(Circle2);
        stage.add(layer);
    },
    'drag and drop constrianed horizontally inside positioned group': function(containerId) {
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
        var Circle = new Kinetic.Circle({
            x: 200,
            y: 100,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBoundFunc: function(pos) {
                return {
                    x: pos.x,
                    y: this.getAbsolutePosition().y
                };
            }
        });

        group.add(Circle);
        layer.add(group);
        stage.add(layer);
    },
    'drag and drop with left bounds': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            dragBoundFunc: function(pos) {
                var newX = pos.x > 50 ? pos.x : 50;
                return {
                    x: newX,
                    y: this.getY()
                };
            }
        });

        layer.add(Circle);
        stage.add(layer);
    },
    'drag and drop shape inside scrollable div': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 400
        });

        // make container scrollable
        var container = stage.getContainer();
        container.style.overflow = 'auto';

        var layer = new Kinetic.Layer();
        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: 100,
            radius: 50,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        layer.add(Circle);
        stage.add(layer);
    },
    'drag and drop shape inside scaled group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group({
            scale: 2
        });

        var Circle = new Kinetic.Circle({
            x: 40,
            y: 40,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        group.add(Circle);
        layer.add(group);
        stage.add(layer);
    },
    'translate, rotate, and scale shape, and then drag and drop': function(containerId) {
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
    'translate, rotate, center offset, and scale shape, and then drag and drop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var bgLayer = new Kinetic.Layer();
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
            rotationDeg: 60,
            scale: {
                x: 2,
                y: 1
            },
            offset: {
                x: 50,
                y: 25
            },
            draggable: true
        });

        group.add(rect);
        layer.add(rect);

        stage.add(bgLayer);
        stage.add(layer);

        var anim = new Kinetic.Animation(function() {
            rect.rotate(0.01);
        }, layer);
        anim.start();

        showHit(layer);

        var _context = bgLayer.getCanvas().getContext()._context;
        _context.beginPath();
        _context.moveTo(0, 0);
        _context.lineTo(100, 20);
        _context.strokeStyle = 'red';
        _context.stroke();
    },
    'stage and shape draggable': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            draggable: true,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            draggable: true
        });

        var rect = new Kinetic.Rect({
            x: 150,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        var rect2 = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        layer.add(rect).add(rect2);
        stage.add(layer);


    }
};
