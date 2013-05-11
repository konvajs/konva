Test.Modules.ANIMATION = {
    /*
     * WARNING: make sure that this is the first unit test that uses
     * animation because it's accessing the global animation object which could
     * be modified by other unit tests
     */
    'test start and stop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        var amplitude = 150;
        var period = 1000;
        // in ms
        var centerX = stage.getWidth() / 2 - 100 / 2;

        var anim = new Kinetic.Animation(function(frame) {
            rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
        }, layer);
        var a = Kinetic.Animation;

        test(a.animations.length === 0, '1should be no animations running');

        anim.start();
        test(a.animations.length === 1, '2should be 1 animation running');

        anim.stop();
        test(a.animations.length === 0, '3should be no animations running');

        anim.start();
        test(a.animations.length === 1, '4should be 1 animation running');

        anim.start();
        test(a.animations.length === 1, '5should be 1 animation runningg');

        anim.stop();
        test(a.animations.length === 0, '6should be no animations running');

        anim.stop();
        test(a.animations.length === 0, '7should be no animations running');
    },
    'batch draw': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        draws = 0;

        layer.on('draw', function() {
            console.log('draw')
            draws++;
        });

        layer.draw();
        layer.draw();
        layer.draw();

        test(draws === 3, 'draw count should be 3');

        layer.batchDraw();
        layer.batchDraw();
        layer.batchDraw();

        test(Kinetic.Layer.batchAnim.getLayers().length === 1, 'batch animation should only have one layer');

        test(draws !== 6, 'should not be 6 draws');
    }
};
