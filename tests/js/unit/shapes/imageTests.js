Test.Modules.IMAGE = {
    'add image': function(containerId) {
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
                y: 60,
                image: imageObj,
                width: 100,
                height: 100,
                offset: [50, 30],
                crop: [135, 7, 167, 134],
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setHeight(200);
            layer.draw();

            darth.setHeight(100);
            layer.draw();

            test(darth.getX() === 200, 'x should be 200');
            test(darth.getY() === 60, 'y should be 60');
            test(darth.getWidth() === 100, 'width should be 100');
            test(darth.getHeight() === 100, 'height should be 100');
            test(darth.getOffset().x === 50, 'center offset x should be 50');
            test(darth.getOffset().y === 30, 'center offset y should be 30');
            test(Kinetic.Util._isElement(darth.getImage()), 'darth image should be an element');

            var crop = null;
            crop = darth.getCrop();
            test(crop.x === 135, 'crop x should be 135');
            test(crop.y === 7, 'crop y should be 7');
            test(crop.width === 167, 'crop width should be 167');
            test(crop.height === 134, 'crop height should be134');

            darth.setCrop(0, 1, 2, 3);
            crop = darth.getCrop();
            test(crop.x === 0, 'crop x should be 0');
            test(crop.y === 1, 'crop y should be 1');
            test(crop.width === 2, 'crop width should be2');
            test(crop.height === 3, 'crop height should be 3');

            darth.setCrop([4, 5, 6, 7]);
            crop = darth.getCrop();
            test(crop.x === 4, 'crop x should be 4');
            test(crop.y === 5, 'crop y should be 5');
            test(crop.width === 6, 'crop width should be 6');
            test(crop.height === 7, 'crop height should be 7');

            darth.setCrop({
                x: 8,
                y: 9,
                width: 10,
                height: 11
            });
            crop = darth.getCrop();
            test(crop.x === 8, 'crop x should be 8');
            test(crop.y === 9, 'crop y should be 9');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                x: 12
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 9, 'crop y should be 9');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                y: 13
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                width: 14
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 14, 'crop width should be 14');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                height: 15
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 14, 'crop width should be 14');
            test(crop.height === 15, 'crop height should be 15');

            darth.setAttrs({
                x: 200,
                y: 60,
                image: imageObj,
                width: 100,
                height: 100,
                offset: [50, 30],
                crop: [135, 7, 167, 134],
                draggable: true
            });

            //document.body.appendChild(layer.bufferCanvas.element)
            
            test(darth.getClassName() === 'Image', 'getClassName should be Image');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'crop and scale image': function(containerId) {
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
                crop: [186, 211, 106, 74],
                draggable: true,
                scale: [0.5, 0.5]
            });

            layer.add(darth);
            stage.add(layer);


            test(darth.getCrop().x === 186, 'crop x should be 186');
            test(darth.getCrop().y === 211, 'crop y should be 211');
            test(darth.getCrop().width === 106, 'crop width should be 106');
            test(darth.getCrop().height === 74, 'crop height should be 74');

            test(darth.getCropX() === 186, 'crop x should be 186');
            test(darth.getCropY() === 211, 'crop y should be 211');
            test(darth.getCropWidth() === 106, 'crop width should be 106');
            test(darth.getCropHeight() === 74, 'crop height should be 74');

            darth.setCrop([1, 2, 3, 4]);
            
            test(darth.getCrop().x === 1, 'crop x should be 1');
            test(darth.getCrop().y === 2, 'crop y should be 2');
            test(darth.getCrop().width === 3, 'crop width should be 3');
            test(darth.getCrop().height === 4, 'crop height should be 4');

            test(darth.getCropX() === 1, 'crop x should be 1');
            test(darth.getCropY() === 2, 'crop y should be 2');
            test(darth.getCropWidth() === 3, 'crop width should be 3');
            test(darth.getCropHeight() === 4, 'crop height should be 4');

            darth.setCropX(5);
            darth.setCropY(6);
            darth.setCropWidth(7);
            darth.setCropHeight(8);

            test(darth.getCrop().x === 5, 'crop x should be 5');
            test(darth.getCrop().y === 6, 'crop y should be 6');
            test(darth.getCrop().width === 7, 'crop width should be 7');
            test(darth.getCrop().height === 8, 'crop height should be 8');

            test(darth.getCropX() === 5, 'crop x should be 5');
            test(darth.getCropY() === 6, 'crop y should be 6');
            test(darth.getCropWidth() === 7, 'crop width should be 7');
            test(darth.getCropHeight() === 8, 'crop height should be 8');      

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

            });
        };
        imageObj.src = '../assets/lion.png';

        showHit(layer);
    }
};
