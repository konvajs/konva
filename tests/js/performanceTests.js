Test.prototype.tests = {
    'DRAWING - draw rect': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        startTimer();
        console.profile();
        for(var n = 0; n < 1000; n++) {
            var rect = new Kinetic.Rect({
                x: 10,
                y: 10,
                width: 100,
                height: 100,
                fill: 'yellow',
                stroke: 'blue'
            });

            layer.add(rect);
        }
        stage.add(layer);
		
		console.profileEnd();
        endTimer('add and draw 1,000 Kinetic rectangles');

    },
    '*ANIMATION - test animation frame rate': function(containerId) {
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
            //console.log(frame.timeDiff)
        });

        stage.start();
        
        setTimeout(function() {
        	//stage.stop();
        }, 1000)
    },
    'DRAWING - draw rect vs image from image data': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);

        var canvas = layer.getCanvas();
        var context = layer.getContext();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.fillStyle = 'blue';
            context.lineWidth = 6;
            context.strokeStyle = 'red';
            context.fillRect(10, 10, 100, 100);
            context.strokeRect(10, 10, 100, 100);
        }
        endTimer('draw 10,000 rects with canvas API');

        startTimer();
        var imageData = context.getImageData(7, 7, 106, 106);
        endTimer('create image data');

        layer.canvas.clear();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.putImageData(imageData, 7, 7);
        }
        endTimer('draw 10,000 images with putImageData');

    },
    'DRAWING - draw rect vs image from data url': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);

        var canvas = layer.getCanvas();
        var context = layer.getContext();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.fillStyle = 'blue';
            context.lineWidth = 6;
            context.strokeStyle = 'red';
            context.fillRect(10, 10, 100, 100);
            context.strokeRect(10, 10, 100, 100);
        }
        endTimer('draw 10,000 rects with canvas API');

        startTimer();
        var url = layer.toDataURL();
        endTimer('create data url');

        var imageObj = new Image();
        imageObj.onload = function() {
            layer.canvas.clear();

            startTimer();
            for(var n = 0; n < 10000; n++) {
                context.drawImage(imageObj, 7, 7, 106, 106, 10, 10, 106, 106);
            }
            endTimer('draw 10,000 images with image object from data url');
        }
        imageObj.src = url;

    },
    'DRAWING - draw 1,000 stars': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        startTimer();
        for(var n = 0; n < 1000; n++) {
            var star = new Kinetic.Star({
                innerRadius: 20,
                outerRadius: 50,
                fill: 'yellow',
                stroke: 'black',
                strokeWidth: 5,
                numPoints: 5,
                x: Math.random() * stage.getWidth(),
                y: Math.random() * stage.getHeight(),
                shadow: {
                    offset: 5,
                    color: 'black',
                    blur: 5,
                    alpha: 0.5
                }
            });

            layer.add(star);
        }

        stage.add(layer);

        endTimer('draw 1,000 stars');
    },
    'DRAWING - draw 1,000 cached stars': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
            innerRadius: 20,
            outerRadius: 50,
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 5,
            numPoints: 5,
            x: 70,
            y: 70,
            shadow: {
                offset: 5,
                color: 'black',
                blur: 5,
                alpha: 0.5
            }
        });

        layer.add(star);
        stage.add(layer);

        star.toImage({
            callback: function(img) {
                startTimer();
                for(var n = 0; n < 1000; n++) {
                    var image = new Kinetic.Image({
                        image: img,
                        x: Math.random() * stage.getWidth(),
                        y: Math.random() * stage.getHeight(),
                        offset: 70
                    });

                    layer.add(image);
                }

                layer.draw();

                endTimer('draw 1,000 cached stars');
            }
        });
    }
};
