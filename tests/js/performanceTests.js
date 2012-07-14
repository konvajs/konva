Test.prototype.tests = {
    'PERFORMANCE - draw rect vs image from image data': function(containerId) {
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

        layer.clear();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.putImageData(imageData, 7, 7);
        }
        endTimer('draw 10,000 images with image object from image data');

    },
    'PERFORMANCE - draw rect vs image from data url': function(containerId) {
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
        var url = canvas.toDataURL();
        endTimer('create data url');

        var imageObj = new Image();
        imageObj.src = url;

        layer.clear();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.drawImage(imageObj, 7, 7, 106, 106, 10, 10, 106, 106);
        }
        endTimer('draw 10,000 images with image object from data url');
    }
};
