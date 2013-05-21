Test.Modules.TWEEN = {
    'tween node': function(containerId) {
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

        var finishCount = 0;
        var onFinish = function() {
            test(++finishCount <= 1, 'finishCount should not exceed 1');
        }

        var tween = new Kinetic.Tween({
            node: circle,
            duration: 0.2,
            x: 200,
            y: 100,
            onFinish: onFinish
        }).play();

    }
};