Test.Modules.ELLIPSE = {
    'add ellipse': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: [70, 35],
            fill: 'green',
            stroke: 'black',
            strokeWidth: 8
        });
        layer.add(ellipse);
        stage.add(layer);
        test(ellipse.getShapeType() === 'Ellipse', 'shape type should be Ellipse');
    }
};
