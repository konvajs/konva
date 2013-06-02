Test.Modules.SHAPE = {
    'shape color components': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 90,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'red'

        });

        layer.add(rect);
        stage.add(layer);

        // test component getters
        test(rect.getFillRGB().r === 0, 'rect fill RGB.r should be 0');
        test(rect.getFillRGB().g === 128, 'rect fill RGB.g should be 128');
        test(rect.getFillRGB().b === 0, 'rect fill RGB.b should be 0');

        test(rect.getFillR() === 0, 'rect fill r should be 0');
        test(rect.getFillG() === 128, 'rect fill g should be 128');
        test(rect.getFillB() === 0, 'rect fill b should be 0');

        test(rect.getStrokeR() === 255, 'rect stroke r should be 255');
        test(rect.getStrokeG() === 0, 'rect stroke g should be 0');
        test(rect.getStrokeB() === 0, 'rect stroke b should be 0');

        rect.setFill('#008000');
        rect.setStroke('#ff0000');

        test(rect.getFillR() === 0, 'rect fill r should be 0');
        test(rect.getFillG() === 128, 'rect fill g should be 128');
        test(rect.getFillB() === 0, 'rect fill b should be 0');

        test(rect.getStrokeR() === 255, 'rect stroke r should be 255');
        test(rect.getStrokeG() === 0, 'rect stroke g should be 0');
        test(rect.getStrokeB() === 0, 'rect stroke b should be 0');

        rect.setFill('rgb(0,128,0)');
        rect.setStroke('rgb(255, 0, 0)');

        test(rect.getFillR() === 0, 'rect fill r should be 0');
        test(rect.getFillG() === 128, 'rect fill g should be 128');
        test(rect.getFillB() === 0, 'rect fill b should be 0');

        test(rect.getStrokeR() === 255, 'rect stroke r should be 255');
        test(rect.getStrokeG() === 0, 'rect stroke g should be 0');
        test(rect.getStrokeB() === 0, 'rect stroke b should be 0');

        // test setters
        rect.setFillRGB({
            r: 100,
            b: 200
        });

        test(rect.getFillR() === 100, 'rect fill r should be 100');
        test(rect.getFillG() === 128, 'rect fill g should be 128');
        test(rect.getFillB() === 200, 'rect fill b should be 200');

        rect.setFillR(130);
        test(rect.getFillR() === 130, 'rect fill r should be 130');

        rect.setFillG(140);
        test(rect.getFillG() === 140, 'rect fill g should be 140');

        rect.setFillB(150);
        test(rect.getFillB() === 150, 'rect fill b should be 150');
    },

    'test intersects()': function(containerId) {
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

        test(rect.intersects({
            x: 200,
            y: 100
        }) === true, '(200,100) should intersect the shape');

        test(rect.intersects({
            x: 197,
            y: 97
        }) === false, '(197, 97) should not intersect the shape');

        test(rect.intersects({
            x: 250,
            y: 125
        }) === true, '(250, 125) should intersect the shape');

        test(rect.intersects({
            x: 300,
            y: 150
        }) === true, '(300, 150) should intersect the shape');

        test(rect.intersects({
            x: 303,
            y: 153
        }) === false, '(303, 153) should not intersect the shape');

    },
    'custom shape with fill, stroke, and strokeWidth': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function(canvas) {
                var context = canvas.getContext();
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                canvas.fill(this);
                canvas.stroke(this);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        layer.add(shape);
        stage.add(layer);
    },
    'add star with translated, scaled, rotated fill': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

            var star = new Kinetic.Star({
                x: 200,
                y: 100,
                numPoints: 5,
                innerRadius: 40,
                outerRadius: 70,

                fillPatternImage: imageObj,
                fillPatternX: -20,
                fillPatternY: -30,
                fillPatternScale: 0.5,
                fillPatternOffset: [219, 150],
                fillPatternRotation: Math.PI * 0.5,
                fillPatternRepeat: 'no-repeat',

                stroke: 'blue',
                strokeWidth: 5,
                draggable: true
            });

            layer.add(star);
            stage.add(layer);

            /*
             var anim = new Kinetic.Animation(function() {
             star.attrs.fill.rotation += 0.02;
             }, layer);
             anim.start();
             */

            test(star.getFillPatternX() === -20, 'star fill x should be -20');
            test(star.getFillPatternY() === -30, 'star fill y should be -30');
            test(star.getFillPatternScale().x === 0.5, 'star fill scale x should be 0.5');
            test(star.getFillPatternScale().y === 0.5, 'star fill scale y should be 0.5');
            test(star.getFillPatternOffset().x === 219, 'star fill offset x should be 219');
            test(star.getFillPatternOffset().y === 150, 'star fill offset y should be 150');
            test(star.getFillPatternRotation() === Math.PI * 0.5, 'star fill rotation should be Math.PI * 0.5');

            star.setFillPatternRotationDeg(180);

            test(star.getFillPatternRotation() === Math.PI, 'star fill rotation should be Math.PI');

            star.setFillPatternScale(1);

            test(star.getFillPatternScale().x === 1, 'star fill scale x should be 1');
            test(star.getFillPatternScale().y === 1, 'star fill scale y should be 1');

            star.setFillPatternOffset([100, 120]);

            test(star.getFillPatternOffset().x === 100, 'star fill offset x should be 100');
            test(star.getFillPatternOffset().y === 120, 'star fill offset y should be 120');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'test size setters and getters': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 50,
            fill: 'red'
        });

        var ellipse = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 50,
            fill: 'yellow'
        });

        layer.add(ellipse);
        layer.add(circle);
        stage.add(layer);

        // circle tests
        test(circle.getWidth() === 100, 'circle width should be 100');
        test(circle.getHeight() === 100, 'circle height should be 100');
        test(circle.getSize().width === 100, 'circle width should be 100');
        test(circle.getSize().height === 100, 'circle height should be 100');
        test(circle.getRadius() === 50, 'circle radius should be 50');

        circle.setWidth(200);

        test(circle.getWidth() === 200, 'circle width should be 200');
        test(circle.getHeight() === 200, 'circle height should be 200');
        test(circle.getSize().width === 200, 'circle width should be 200');
        test(circle.getSize().height === 200, 'circle height should be 200');
        test(circle.getRadius() === 100, 'circle radius should be 100');


    },
    'set image fill to color then image then linear gradient then back to image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: 200,
                y: 60,
                radius: 50,
                fill: 'blue'
            });

            layer.add(circle);
            stage.add(layer);

            test(circle.getFill() === 'blue', 'circle fill should be blue');

            circle.setFill(null);
            circle.setFillPatternImage(imageObj);
            circle.setFillPatternRepeat('no-repeat');
            circle.setFillPatternOffset([-200, -70]);

            test(circle.getFillPatternImage() !== undefined, 'circle fill image should be defined');
            test(circle.getFillPatternRepeat() === 'no-repeat', 'circle fill repeat should be no-repeat');
            test(circle.getFillPatternOffset().x === -200, 'circle fill offset x should be -200');
            test(circle.getFillPatternOffset().y === -70, 'circle fill offset y should be -70');

            circle.setFillPatternImage(null);
            circle.setFillLinearGradientStartPoint(-35);
            circle.setFillLinearGradientEndPoint(35);
            circle.setFillLinearGradientColorStops([0, 'red', 1, 'blue']);

            circle.setFillLinearGradientStartPoint(null);
            circle.setFillPatternImage(imageObj);
            circle.setFillPatternRepeat('repeat');
            circle.setFillPatternOffset(0);

            layer.draw();
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'test enablers and disablers': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            dashArray: [10, 10]
        });
        layer.add(circle);
        stage.add(layer);

        test(circle.getFillEnabled() === true, 'fillEnabled should be true');
        test(circle.getStrokeEnabled() === true, 'strokeEnabled should be true');
        test(circle.getShadowEnabled() === true, 'shadowEnabled should be true');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.disableFill();
        
        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === true, 'strokeEnabled should be true');
        test(circle.getShadowEnabled() === true, 'shadowEnabled should be true');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.disableStroke();

        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === false, 'strokeEnabled should be false');
        test(circle.getShadowEnabled() === true, 'shadowEnabled should be true');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.disableShadow();

        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === false, 'strokeEnabled should be false');
        test(circle.getShadowEnabled() === false, 'shadowEnabled should be false');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.disableDashArray();

        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === false, 'strokeEnabled should be false');
        test(circle.getShadowEnabled() === false, 'shadowEnabled should be false');
        test(circle.getDashArrayEnabled() === false, 'dashArrayEnabled should be false');

        // re-enable

        circle.enableDashArray();

        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === false, 'strokeEnabled should be false');
        test(circle.getShadowEnabled() === false, 'shadowEnabled should be false');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.enableShadow();

        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === false, 'strokeEnabled should be false');
        test(circle.getShadowEnabled() === true, 'shadowEnabled should be true');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.enableStroke();

        test(circle.getFillEnabled() === false, 'fillEnabled should be false');
        test(circle.getStrokeEnabled() === true, 'strokeEnabled should be true');
        test(circle.getShadowEnabled() === true, 'shadowEnabled should be true');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

        circle.enableFill();

        test(circle.getFillEnabled() === true, 'fillEnabled should be true');
        test(circle.getStrokeEnabled() === true, 'strokeEnabled should be true');
        test(circle.getShadowEnabled() === true, 'shadowEnabled should be true');
        test(circle.getDashArrayEnabled() === true, 'dashArrayEnabled should be true');

    }
};
