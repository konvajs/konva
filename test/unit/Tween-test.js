suite('Tween', function() {

    // ======================================================
    test('tween node', function(done) {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
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
        };

        var tweens = 0;
        var attrs = 0;

        for (var key in Konva.Tween.tweens) {
            tweens++;
        }
        for (var key in Konva.Tween.attrs) {
            attrs++;
        }

        assert.equal(tweens, 0);
        assert.equal(attrs, 0);

        var tween = new Konva.Tween({
            node: circle,
            duration: 0.2,
            x: 200,
            y: 100,
            onFinish: onFinish
        }).play();

        var tweens = 0;
        var attrs = 0;
        for (var key in Konva.Tween.tweens) {
            tweens++;
        }
        for (var key in Konva.Tween.attrs[circle._id][tween._id]) {
            attrs++;
        }

        assert.equal(tweens, 1);
        assert.equal(attrs, 2);

        assert.notEqual(Konva.Tween.attrs[circle._id][tween._id].x, undefined);
        assert.notEqual(Konva.Tween.attrs[circle._id][tween._id].y, undefined);

    });

    // ======================================================
    test('destroy tween while tweening', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


        var tween = new Konva.Tween({
            node: circle,
            duration: 0.2,
            x: 200,
            y: 100
        }).play();

        // start/diff object = attrs.nodeId.tweenId.attr
        // tweenId = tweens.nodeId.attr

        assert.notEqual(tween._id, undefined);
        assert.equal(Konva.Tween.tweens[circle._id].x, tween._id);
        assert.notEqual(Konva.Tween.attrs[circle._id][tween._id], undefined);

        tween.destroy();

        assert.equal(Konva.Tween.tweens[circle._id].x, undefined);
        assert.equal(Konva.Tween.attrs[circle._id][tween._id], undefined);


    });

    // ======================================================
    test('zero duration', function(done) {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


        var tween = new Konva.Tween({
            node: circle,
            duration: 0,
            x: 200,
            y: 100
        });
        tween.play();


        setTimeout(function(){
            assert.equal(circle.x(), 200);
            assert.equal(circle.y(), 100);
            done();
        }, 60);

    });

    test('color tweening', function(done) {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        var duration = 0.1;
        var c = Konva.Util.colorToRGBA('rgba(0,255,0,0.5)');
        var endFill = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
        var midFill = 'rgba(128,128,0,0.75)';

        var tween = new Konva.Tween({
            node: circle,
            duration: duration,
            fill : endFill,
            onFinish : function() {
                assert.equal(endFill, circle.fill());
                done();
            }
        });

        tween.seek(duration * 0.5);
        assert.equal(midFill, circle.fill());

        tween.seek(0);
        tween.play();
    });

    test('to method', function(done) {
        var stage = addStage();

        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            radius: 70,
            fill: 'red',
            stroke: 'blue',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        circle.to({
            x: stage.width() / 2,
            y: stage.getHeight() / 2,
            duration : 0.1,
            onFinish : function() {
                assert.equal(circle.x(), stage.width() / 2);
                assert.equal(Object.keys(Konva.Tween.attrs[circle._id]).length, 0);
                done();
            }
        });
    });

    test('to method simple usage', function(done) {
        var stage = addStage();

        stage.to({
            x : 10,
            duration : 0.001
        });
        setTimeout(function() {
            done();
        }, 50);
    });

    suite('tween array with different length', function() {
        test('prepare array closed', function() {
            var start = [0, 0, 10, 0, 10, 10];
            var end = [0, 0, 10, 0, 10, 10, 0, 10];
            var newStart = Konva.Util._prepareArrayForTween(start, end, true);
            assert.deepEqual(newStart, [0, 0, 10, 0, 10, 10, 5, 5]);
        });

        test('prepare array - opened', function() {
            var start = [0, 0, 10, 0, 10, 10, 0, 10];
            var end = [0, 0, 10, 0, 7, 9];
            end = Konva.Util._prepareArrayForTween(start, end, false);
            assert.deepEqual(end, [0, 0, 10, 0, 7, 9, 7, 9]);
        });

        test('tween array with bigger size', function(done) {
            var stage = addStage();

            var layer = new Konva.Layer();
            stage.add(layer);

            var line = new Konva.Line({
                stroke: 'black',
                points: [100, 100, 200, 100, 200, 200],
                closed: true
            });
            layer.add(line);

            line.to({
                points: [100, 100, 200, 100, 200, 200, 100, 200],
                duration: 0.1,
                onFinish: function() {
                    assert.deepEqual(line.points(), [100, 100, 200, 100, 200, 200, 100, 200]);
                    done();
                }
            });
        });

        test('tween array to lower size', function(done) {
            var stage = addStage();

            var layer = new Konva.Layer();
            stage.add(layer);

            var line = new Konva.Line({
                stroke: 'black',
                points: [100, 100, 200, 100, 200, 200, 100, 200],
                closed: true
            });
            layer.add(line);

            line.to({
                points: [100, 100, 200, 100, 200, 200],
                duration: 0.1,
                onFinish: function() {
                    assert.deepEqual(line.points(), [100, 100, 200, 100, 200, 200]);
                    done();
                }
            });
        });

        test('tween array to lower size and go back', function(done) {
            var stage = addStage();

            var layer = new Konva.Layer();
            stage.add(layer);

            var line = new Konva.Line({
                stroke: 'black',
                points: [100, 100, 200, 100, 200, 200, 100, 200],
                closed: true
            });
            layer.add(line);

            var tween = new Konva.Tween({
                node: line,
                points: [100, 100, 200, 100, 200, 200],
                duration: 0.01,
                onFinish: function() {
                    tween.reverse();
                },
                onReset: function() {
                    assert.deepEqual(line.points(), [100, 100, 200, 100, 200, 200, 100, 200]);
                    done();
                }
            });
            tween.play();
        });

        test('tween array to bigger size and go back', function(done) {
            var stage = addStage();

            var layer = new Konva.Layer();
            stage.add(layer);

            var line = new Konva.Line({
                stroke: 'black',
                points: [100, 100, 200, 100, 200, 200],
                closed: true
            });
            layer.add(line);

            var tween = new Konva.Tween({
                node: line,
                points: [100, 100, 200, 100, 200, 200, 100, 200],
                duration: 0.01,
                onFinish: function() {
                    tween.reverse();
                },
                onReset: function() {
                    assert.deepEqual(line.points(), [100, 100, 200, 100, 200, 200]);
                    done();
                }
            });
            tween.play();
        });

    });

});
