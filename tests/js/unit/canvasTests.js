Test.Modules.CANVAS = {
    'pixel ratio': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: 578/2,
            y: 100,
            radius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


        stage.setWidth(578/2);
        stage.setHeight(100);

        stage.draw();

        layer.getCanvas().setPixelRatio(1);
        test(layer.getCanvas().getPixelRatio() === 1, 'pixel ratio should be 1');
        test(layer.getCanvas().width === 289, 'canvas width should be 289');
        test(layer.getCanvas().height === 100, 'canvas height should be 100');

        layer.getCanvas().setPixelRatio(2);
        test(layer.getCanvas().getPixelRatio() === 2, 'pixel ratio should be 2');
        test(layer.getCanvas().width === 578, 'canvas width should be 578');
        test(layer.getCanvas().height === 200, 'canvas height should be 200');



        layer.draw();




    }
};