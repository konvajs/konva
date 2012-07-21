Test.prototype.tests = {
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
                y: Math.random() * stage.getHeight()
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
            y: 70
        });

        layer.add(star);
        stage.add(layer);

        console.log('call toImage')
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
