Test.Modules.Wedge = {
    'add wedge': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var wedge = new Kinetic.Wedge({
            x: 100,
            y: 100,
            radius: 70,
            angle: Math.PI * 0.4,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        layer.add(wedge);
        stage.add(layer);

        test(wedge.getClassName() === 'Wedge', 'getClassName should be Wedge');
    },
    'set wedge angle using degrees': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var wedge = new Kinetic.Wedge({
            x: 100,
            y: 100,
            radius: 70,
            angleDeg: 90,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true,
            lineJoin: 'round'
        });

        layer.add(wedge);
        stage.add(layer);

        test(wedge.getAngle() === Math.PI / 2, 'problem setting wedge angle using degrees');
    }
};
