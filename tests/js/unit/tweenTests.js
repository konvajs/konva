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
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        var finishCount = 0;
        var onFinish = function() {
            test(++finishCount <= 1, 'finishCount should not exceed 1');
        }

        var tweens = 0;
        var attrs = 0;

        for (var key in Kinetic.Tween.tweens) {
            tweens++;
        }
        for (var key in Kinetic.Tween.attrs) {
            attrs++;
        }

        test(tweens === 0, 'should be no tweens');
        test(attrs === 0, 'should be no attrs');

        var tween = new Kinetic.Tween({
            node: circle,
            duration: 0.2,
            x: 200,
            y: 100,
            onFinish: onFinish
        }).play();

        var tweens = 0;
        var attrs = 0;
        for (var key in Kinetic.Tween.tweens) {
            tweens++;
        }
        for (var key in Kinetic.Tween.attrs[circle._id][tween._id]) {
            attrs++;
        }

        test(tweens === 1, 'should one tween');
        test(attrs === 2, 'should two attrs');

        test(Kinetic.Tween.attrs[circle._id][tween._id].x !== undefined, 'x should not be undefined');
        test(Kinetic.Tween.attrs[circle._id][tween._id].y !== undefined, 'y should not be undefined');

    },
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
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


        var tween = new Kinetic.Tween({
            node: circle,
            duration: 0.2,
            x: 200,
            y: 100
        }).play();

        // start/diff object = attrs.nodeId.tweenId.attr
        // tweenId = tweens.nodeId.attr

        test(tween._id !== undefined, 'tween.play should return an instance of the tween');
        test(Kinetic.Tween.tweens[circle._id].x === tween._id, 'circle should be in the tweens hash');
        test(Kinetic.Tween.attrs[circle._id][tween._id] !== undefined, 'tween should be in the attrs hash');

        tween.destroy();

        test(Kinetic.Tween.tweens[circle._id].x === undefined, 'circle should not be in the tweens hash');
        test(Kinetic.Tween.attrs[circle._id][tween._id] === undefined, 'tween should not be in the attrs hash');


    }
};