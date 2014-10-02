suite('Tween', function() {

    // ======================================================
    test('tween node', function(done) {
        var stage = addStage();

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
            assert(++finishCount <= 1, 'finishCount should not exceed 1');
            done();
        }

        var tweens = 0;
        var attrs = 0;

        for (var key in Kinetic.Tween.tweens) {
            tweens++;
        }
        for (var key in Kinetic.Tween.attrs) {
            attrs++;
        }

        assert.equal(tweens, 0);
        assert.equal(attrs, 0);

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

        assert.equal(tweens, 1);
        assert.equal(attrs, 2);

        assert.notEqual(Kinetic.Tween.attrs[circle._id][tween._id].x, undefined);
        assert.notEqual(Kinetic.Tween.attrs[circle._id][tween._id].y, undefined);

    });

    // ======================================================
    test('destroy tween while tweening', function() {
        var stage = addStage();

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

        assert.notEqual(tween._id, undefined);
        assert.equal(Kinetic.Tween.tweens[circle._id].x, tween._id);
        assert.notEqual(Kinetic.Tween.attrs[circle._id][tween._id], undefined);

        tween.destroy();

        assert.equal(Kinetic.Tween.tweens[circle._id].x, undefined);
        assert.equal(Kinetic.Tween.attrs[circle._id][tween._id], undefined);


    });

    // ======================================================
    test('zero duration', function(done) {
        var stage = addStage();

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
            duration: 0,
            x: 200,
            y: 100
        });
        tween.play();


        setTimeout(function(){
            "use strict";
            assert.equal(circle.x(), 200);
            assert.equal(circle.y(), 100);
            done();
        }, 60);

    });

});