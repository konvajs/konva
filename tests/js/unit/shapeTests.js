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

        var drawTriangle = function(context) {
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            this.fillStroke(context);

            context.beginPath();
            context.moveTo(300, 150);
            context.lineTo(520, 180);
            context.quadraticCurveTo(400, 200, 360, 270);
            context.closePath();
            this.fillStroke(context);
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
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                this.fill(context);
                this.stroke(context);
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
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                this.fill(context);
                this.stroke(context);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        shape.setDrawFunc(function(context) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            this.fill(context);
            this.stroke(context);
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

        rect.setDrawFunc(function(context) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            this.fill(context);
            this.stroke(context);
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
		            y: -20,
		            //scale: {x: 0.5, y: 0.5},
		            offset: {x: 219, y: 150},
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
        };
        imageObj.src = '../assets/darth-vader.jpg';
    }
};
