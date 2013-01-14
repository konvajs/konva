Test.Modules.TRANSITION = {
    'start animation when transition completes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
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
        var centerX = 0;

        var anim = new Kinetic.Animation(function(frame) {
                rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
            }, layer);

        anim.start();
        anim.stop();
        centerX = 300;

        var go = Kinetic.Global;

        rect.transitionTo({
            x: 300,
            duration: 1,
            callback: function() {
                test(rect.getX() === 300, 'rect x is not 300');
                anim.start();
            }
        });
    },
    'stop and resume transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        var transFinished = false;

        var trans = rect.transitionTo({
            duration: 0.2,
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            easing: 'bounce-ease-out',
            callback: function() {
                transFinished = true;
            }
        });

        setTimeout(function() {
            trans.stop();
        }, 100);
        setTimeout(function() {
            trans.resume();
        }, 100);
    },
    'transition stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        var trans = stage.transitionTo({
            duration: 1,
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            easing: 'bounce-ease-out',
            callback: function() {
                test(stage.getX() === 400, 'stage x should be 400');
                test(stage.getY() === 30, 'stage y should be 30');
                test(stage.getRotation() == Math.PI * 2, 'stage rotation should be Math.PI * 2');
            }
        });
    },
    'overwrite active transition with new transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        rect.transitionTo({
            x: 400,
            y: 30,
            duration: 500
        });

        rect.transitionTo({
            rotation: Math.PI * 2,
            duration: 1,
            callback: function() {
                /*
                 * TODO: this method fails every now and then, seemingly
                 * from a race condition.  need to investigate
                 */
                /*
                 test(rect.getX() === 100, 'rect x should be 100');
                 test(rect.getY() === 100, 'rect y should be 100');
                 test(rect.getRotation() == Math.PI * 2, 'rect x should be Math.PI * 2');
                 */
            }
        });
    },
    'stop transition': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            shadowColor: 'black',
            shadowOffset: 10,
            shadowOpacity: 0.5
        });

        layer.add(rect);
        stage.add(layer);

        var trans = rect.transitionTo({
            duration: 2,
            shadowOffset: {
                x: 80
            },
            x: 400,
            y: 30,
            rotation: Math.PI * 2,
            easing: 'bounce-ease-out'
        });
        
        setTimeout(function() {
        	test(rect.transAnim.isRunning(), 'rect trans should be running');
            trans.stop();
            test(!rect.transAnim.isRunning(), 'rect trans should not be running');
        }, 1000);
        
        setTimeout(function() {
            trans.resume();
            test(rect.transAnim.isRunning(), 'rect trans should be running after resume');
        }, 1500);
    }
};
