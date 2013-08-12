

Test.Modules.IMAGE = {
    'crop add and scale image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 200,
                y: 75,
                image: imageObj,
                width: 107,
                height: 75,
                crop: [186, 211, 292 - 186, 285 - 211],
                draggable: true,
                scale: [0.5, 0.5]
            });

            layer.add(darth);
            stage.add(layer);
            
            //console.log(layer.toDataURL());
            
            testDataUrl(layer.toDataURL(), 'crop and scale image', 'problem rendering cropped and scaled image');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'create image hit region': function(containerId) {
        var imageObj = new Image();

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        imageObj.onload = function() {

            var lion = new Kinetic.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true,
                shadowColor: 'black',
            	shadowBlur: 10,
            	shadowOffset: [20, 20],
            	shadowOpacity: 0.2
            });

            // override color key with black
            lion.colorKey = '000000';

            layer.add(lion);

            lion.createImageHitRegion(function() {
                stage.add(layer);
                layer.drawHit();

                var hitDataUrl = layer.hitCanvas.toDataURL();

                //console.log(hitDataUrl);
                testDataUrl(hitDataUrl,'transparent image hit render', 'problem rendering image on hit graph');

            });
        };
        imageObj.src = '../assets/lion.png';

        showHit(layer);
    },
    'grayscale image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Grayscale);

            layer.draw();

            testDataUrl(layer.toDataURL(), 'grayscale image', 'problem with Grayscale filter.');
       
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'invert image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Invert);

            layer.draw();
            var dataUrl = layer.toDataURL();

            testDataUrl(layer.toDataURL(), 'invert image', 'problem with Invert filter.');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'adjust image brightness': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Brighten);
            darth.setFilterBrightness(100);

            layer.draw();

            testDataUrl(layer.toDataURL(), 'adjust image brightness', 'problem with Brighten filter.');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'gaussian blur filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Blur);
            darth.setFilterRadius(10);
            layer.draw();
            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'blur filter', 'problem with Blur filter.');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'colorizing filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Colorize);
            darth.setFilterColorizeColor([255,0,128]);
            layer.draw();
            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'colorizing filter', 'problem with colorizing filter.');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'shift hue filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.ShiftHue);
            darth.setFilterHueShiftDeg(360);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              filterHueShiftDeg: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'shift hue filter', 'problem with hue shifting filter.');
        };
        imageObj.src = '../assets/lion.png';
    },
    'unsharp mask filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);
            darth.setFilter(Kinetic.Filters.UnsharpMask);
            darth.setFilterAmount(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'unsharp mask filter', 'problem with unsharp mask filter.');
        };
        //imageObj.src = '../assets/darth-vader.jpg';
        imageObj.src = '../assets/lion.png';
    },
    'soft blur filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);
            darth.setFilter(Kinetic.Filters.SoftBlur);
            darth.setFilterAmount(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'soft blur filter', 'problem with soft blur filter.');
        };
        //imageObj.src = '../assets/darth-vader.jpg';
        imageObj.src = '../assets/lion.png';
    },
    'edge detection filter 1': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);
            darth.setFilter(Kinetic.Filters.Edge);
            darth.setFilterAmount(100);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'sharpen filter', 'problem with sharpen filter.');
        };
        //imageObj.src = '../assets/darth-vader.jpg';
        imageObj.src = '../assets/lion.png';
    },
    'emboss filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);
            darth.setFilter(Kinetic.Filters.Emboss);
            darth.setFilterAmount(50);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 0.6,
              filterAmount: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'emboss filter', 'problem with emboss filter.');
        };
        //imageObj.src = '../assets/darth-vader.jpg';
        imageObj.src = '../assets/lion.png';
    },
    'filter transformed image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 50,
                y: 50,
                //width: 438,
                //height: 300,
                image: imageObj,
                draggable: true,
                rotationDeg: 10,
                scale: 0.3
            });

            darth.setOffset(darth.getWidth() / 2, darth.getHeight() / 2);

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Grayscale);

            layer.draw();
            //console.log(layer.toDataURL());
            testDataUrl(layer.toDataURL(), 'filter transformed image', 'problem filtering transformed image');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'apply shadow to transparent image': function(containerId) {
        var imageObj = new Image();

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        imageObj.onload = function() {

            var lion = new Kinetic.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true,
                shadowColor: 'black',
            	shadowBlur: 10,
            	shadowOffset: [20, 20],
            	shadowOpacity: 0.2
            });

            layer.add(lion);
            stage.add(layer);

            var dataUrl = layer.toDataURL();

            testDataUrl(layer.toDataURL(), 'transparent image shadow', 'problem applying shadow to image with transparent pixels');

        };
        imageObj.src = '../assets/lion.png';

        showHit(layer);
    },
     'mask unicolor background filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 600,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            var bamoon = new Kinetic.Image({
                x: 0,
                y: 0,
                image: imageObj,
                draggable: true
            }),
            filtered = new Kinetic.Image({
                x: 300,
                y: 0,
                image: imageObj,
                draggable: true
            });

            layer.add(bamoon);
            layer.add(filtered);
            stage.add(layer);

            filtered.setFilter(Kinetic.Filters.Mask);
            filtered.setFilterThreshold(10);

            layer.draw();
            var dataUrl = layer.toDataURL();
            //console.log(dataUrl);
            testDataUrl(dataUrl, 'mask filter', 'problem with Mask filter.');
        };
        imageObj.src = '../assets/bamoon.jpg';
    }
};

