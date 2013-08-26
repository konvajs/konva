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



    }
};