Test.Modules.LAYER = {
    'test canvas inline styles': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        var style = layer.getCanvas().getElement().style;

        console.log('--' + style.display);

        test(style.position === 'absolute', 'canvas position style should be absolute');
        test(style.border === '0px', 'canvas border style should be 0px');
        test(style.margin === '0px', 'canvas margin style should be 0px');
        test(style.padding === '0px', 'canvas padding style should be 0px');
        test(style.backgroundColor === 'transparent', 'canvas backgroundColor style should be transparent');
    },
    'beforeDraw and afterDraw': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        var counter = 0;

        layer.beforeDraw(function() {
            counter++;
            test(counter === 1, 'counter should be 1');
        });

        layer.afterDraw(function() {
            counter++;
            test(counter === 2, 'counter should be 2');
        });

        layer.draw();
    },
    'set clearBeforeDraw to false, and test toDataURL for stage, layer, group, and shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer({
            clearBeforeDraw: false,
            throttle: 999
        });

        var group = new Kinetic.Group();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        for(var n = 0; n < 20; n++) {
            circle.move(10, 0);
            layer.draw();
        }

        //console.log(layer.toDataURL());

        stage.toDataURL({
            callback: function(dataUrl) {
                warn(dataUrls['stacked green circles'] === dataUrl, 'stacked green circles stage data url is incorrect');
            }
        });
        warn(dataUrls['stacked green circles'] === layer.toDataURL(), 'stacked green circles layer data url is incorrect');

    },
    'save layer as png (click on Circle to open new window)': function(containerId) {
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
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle.on('click', function() {
            window.open(layer.toDataURL());
        });

        layer.add(Circle);
        stage.add(layer);
    },
    'save layer as low quality jpg (click on Circle to open new window)': function(containerId) {
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
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            window.open(layer.toDataURL({
               mimeType: 'image/jpeg',
               quality: 0.2
            }));
        });

        layer.add(circle);
        stage.add(layer);
    },
    'save layer as high quality jpg (click on Circle to open new window)': function(containerId) {
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
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            window.open(layer.toDataURL({
               mimeType: 'image/jpeg',
               quality: 1
            }));
        });

        layer.add(circle);
        stage.add(layer);
    }
};



