Test.Modules.SHAPE = {
    'test intersects()': function(containerId) {
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
        }) === true, '(200,100) should intersect the shape');

        test(rect.intersects({
            x: 197,
            y: 97
        }) === false, '(197, 97) should not intersect the shape');

        test(rect.intersects({
            x: 250,
            y: 125
        }) === true, '(250, 125) should intersect the shape');

        test(rect.intersects({
            x: 300,
            y: 150
        }) === true, '(300, 150) should intersect the shape');

        test(rect.intersects({
            x: 303,
            y: 153
        }) === false, '(303, 153) should not intersect the shape');

    },
    'custom shape with two fills and two strokes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var drawTriangle = function(canvas) {
        	var context = canvas.getContext();
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            canvas.fillStroke(this);

            context.beginPath();
            context.moveTo(300, 150);
            context.lineTo(520, 180);
            context.quadraticCurveTo(400, 200, 360, 270);
            context.closePath();
            canvas.fillStroke(this);
        };
        var triangle = new Kinetic.Shape({
            drawFunc: drawTriangle,
            fill: "#00D2FF",
            stroke: "black",
            strokeWidth: 4,
            id: 'myTriangle',
            draggable: true,
            shadow: {
                color: 'black',
                opacity: 0.5,
                blur: 10,
                offset: 10
            }
        });

        stage.add(layer.add(triangle));

        var dataUrl = layer.toDataURL();
        //console.log(dataUrl);
        warn(dataUrl === dataUrls['custom shape with two fills and strokes'], 'problem with custom shape with two fills');

    },
    'custom shape with fill, stroke, and strokeWidth': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function(canvas) {
            	var context = canvas.getContext();
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                canvas.fill(this);
                canvas.stroke(this);
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
    'change custom shape draw func': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function(canvas) {
            	var context = canvas.getContext();
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                canvas.fill(this);
                canvas.stroke(this);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        shape.setDrawFunc(function(canvas) {
        	var context = canvas.getContext();
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        });
        var rect = new Kinetic.Rect({
            x: 10,
            y: 10,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        rect.setDrawFunc(function(canvas) {
        	var context = canvas.getContext();
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        });

        layer.add(shape);
        layer.add(rect);
        stage.add(layer);

        var dataUrl = layer.toDataURL();

        test(dataUrls['change custom shape draw func'] === dataUrl, 'problem with setDrawFunc');
    },
    'add star with translated, scaled, rotated fill': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
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
                fill: {
                    image: imageObj,
                    x: -20,
                    y: -30,
                    scale: {
                        x: 0.5,
                        y: 0.5
                    },
                    offset: {
                        x: 219,
                        y: 150
                    },
                    rotation: Math.PI * 0.5,
                    repeat: 'no-repeat'
                },
                stroke: 'blue',
                strokeWidth: 5,
                draggable: true
            });

            layer.add(star);
            stage.add(layer);

            /*
             var anim = new Kinetic.Animation(function() {
             star.attrs.fill.rotation += 0.02;
             }, layer);
             anim.start();
             */

            test(star.getFill().x === -20, 'star fill x should be -20');
            test(star.getFill().y === -30, 'star fill y should be -30');
            test(star.getFill().scale.x === 0.5, 'star fill scale x should be 0.5');
            test(star.getFill().scale.y === 0.5, 'star fill scale y should be 0.5');
            test(star.getFill().offset.x === 219, 'star fill offset x should be 219');
            test(star.getFill().offset.y === 150, 'star fill offset y should be 150');
            test(star.getFill().rotation === Math.PI * 0.5, 'star fill rotation should be Math.PI * 0.5');

            star.setFill({
				rotationDeg: 180
            });
            
            test(star.getFill().rotation === Math.PI, 'star fill rotation should be Math.PI');
            
            star.setFill({
            	scale: 1
            });
            
            test(star.getFill().scale.x === 1, 'star fill scale x should be 1');
            test(star.getFill().scale.y === 1, 'star fill scale y should be 1');
            
            star.setFill({
            	offset: [100, 120]
            });
            
            test(star.getFill().offset.x === 100, 'star fill offset x should be 100');
            test(star.getFill().offset.y === 120, 'star fill offset y should be 120');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'test size setters and getters': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 50,
            fill: 'red'
        });

        var ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: {
                x: 100,
                y: 50
            },
            fill: 'yellow'
        });

        layer.add(ellipse);
        layer.add(circle);
        stage.add(layer);

        // circle tests
        test(circle.attrs.width === undefined, 'circle.attrs.width should be undefined');
        test(circle.attrs.height === undefined, 'circle.attrs.height should be undefined');
        test(circle.getWidth() === 100, 'circle width should be 100');
        test(circle.getHeight() === 100, 'circle height should be 100');
        test(circle.getSize().width === 100, 'circle width should be 100');
        test(circle.getSize().height === 100, 'circle height should be 100');
        test(circle.getRadius() === 50, 'circle radius should be 50');

        circle.setWidth(200);

        test(circle.attrs.width === 200, 'circle.attrs.width should be 200');
        test(circle.attrs.height === undefined, 'circle.attrs.height should be undefined');
        test(circle.getWidth() === 200, 'circle width should be 200');
        test(circle.getHeight() === 200, 'circle height should be 200');
        test(circle.getSize().width === 200, 'circle width should be 200');
        test(circle.getSize().height === 200, 'circle height should be 200');
        test(circle.getRadius() === 100, 'circle radius should be 100');

        // ellipse tests
        test(ellipse.attrs.width === undefined, 'ellipse.attrs.width should be undefined');
        test(ellipse.attrs.height === undefined, 'ellipse.attrs.height should be undefined');
        test(ellipse.getWidth() === 200, 'ellipse width should be 200');
        test(ellipse.getHeight() === 100, 'ellipse height should be 100');
        test(ellipse.getSize().width === 200, 'ellipse width should be 200');
        test(ellipse.getSize().height === 100, 'ellipse height should be 100');
        test(ellipse.getRadius().x === 100, 'ellipse radius x should be 100');

        ellipse.setWidth(400);

        test(ellipse.attrs.width === 400, 'ellipse.attrs.width should be 400');
        test(ellipse.attrs.height === undefined, 'ellipse.attrs.height should be undefined');
        test(ellipse.getWidth() === 400, 'ellipse width should be 400');
        test(ellipse.getHeight() === 100, 'ellipse height should be 100');
        test(ellipse.getSize().width === 400, 'ellipse width should be 400');
        test(ellipse.getSize().height === 100, 'ellipse height should be 100');
        test(ellipse.getRadius().x === 200, 'ellipse radius x should be 200');

    }
};
