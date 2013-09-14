suite('Shape-test', function() {

    // ======================================================
    test('shape color components', function() {
        var stage = addStage();
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
        assert.equal(rect.getFillRGB().r, 0, 'rect fill RGB.r should be 0');
        assert.equal(rect.getFillRGB().g, 128, 'rect fill RGB.g should be 128');
        assert.equal(rect.getFillRGB().b, 0, 'rect fill RGB.b should be 0');

        assert.equal(rect.getFillR(), 0, 'rect fill r should be 0');
        assert.equal(rect.getFillG(), 128, 'rect fill g should be 128');
        assert.equal(rect.getFillB(), 0, 'rect fill b should be 0');

        assert.equal(rect.getStrokeR(), 255, 'rect stroke r should be 255');
        assert.equal(rect.getStrokeG(), 0, 'rect stroke g should be 0');
        assert.equal(rect.getStrokeB(), 0, 'rect stroke b should be 0');

        rect.setFill('#008000');
        rect.setStroke('#ff0000');

        assert.equal(rect.getFillR(), 0, 'rect fill r should be 0');
        assert.equal(rect.getFillG(), 128, 'rect fill g should be 128');
        assert.equal(rect.getFillB(), 0, 'rect fill b should be 0');

        assert.equal(rect.getStrokeR(), 255, 'rect stroke r should be 255');
        assert.equal(rect.getStrokeG(), 0, 'rect stroke g should be 0');
        assert.equal(rect.getStrokeB(), 0, 'rect stroke b should be 0');

        rect.setFill('rgb(0,128,0)');
        rect.setStroke('rgb(255, 0, 0)');

        assert.equal(rect.getFillR(), 0, 'rect fill r should be 0');
        assert.equal(rect.getFillG(), 128, 'rect fill g should be 128');
        assert.equal(rect.getFillB(), 0, 'rect fill b should be 0');

        assert.equal(rect.getStrokeR(), 255, 'rect stroke r should be 255');
        assert.equal(rect.getStrokeG(), 0, 'rect stroke g should be 0');
        assert.equal(rect.getStrokeB(), 0, 'rect stroke b should be 0');

        // test setters
        rect.setFillRGB({
            r: 100,
            b: 200
        });

        assert.equal(rect.getFillR(), 100, 'rect fill r should be 100');
        assert.equal(rect.getFillG(), 128, 'rect fill g should be 128');
        assert.equal(rect.getFillB(), 200, 'rect fill b should be 200');

        rect.setFillR(130);
        assert.equal(rect.getFillR(), 130, 'rect fill r should be 130');

        rect.setFillG(140);
        assert.equal(rect.getFillG(), 140, 'rect fill g should be 140');

        rect.setFillB(150);
        assert.equal(rect.getFillB(), 150, 'rect fill b should be 150');
    });

    // ======================================================
    test('test intersects()', function() {
        var stage = addStage();
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

        assert.equal(rect.intersects({
            x: 200,
            y: 100
        }), true, '(200,100) should intersect the shape');

        assert.equal(rect.intersects({
            x: 197,
            y: 97
        }), false, '(197, 97) should not intersect the shape');

        assert.equal(rect.intersects({
            x: 250,
            y: 125
        }), true, '(250, 125) should intersect the shape');

        assert.equal(rect.intersects({
            x: 300,
            y: 150
        }), true, '(300, 150) should intersect the shape');

        assert.equal(rect.intersects({
            x: 303,
            y: 153
        }), false, '(303, 153) should not intersect the shape');

    });

    // ======================================================
    test('test hasShadow() method', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function(context) {

                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                context.fillStrokeShape(this);
            },
            x: 10,
            y: 10,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            shadowColor: 'black',
            shadowOffset: 10,
            shadowOpacity: 0
        });

        layer.add(shape);
        stage.add(layer);

        assert.equal(shape.hasShadow(), false, 'shape should not have a shadow because opacity is 0');

        shape.setShadowOpacity(0.5);

        assert.equal(shape.hasShadow(), true, 'shape should have a shadow because opacity is nonzero');
    });

    // ======================================================
    test('custom shape with fill, stroke, and strokeWidth', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                context.fillStrokeShape(this);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        layer.add(shape);
        stage.add(layer);
    });

    // ======================================================
    test('add star with translated, scaled, rotated fill', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
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

            assert.equal(star.getFillPatternX(), -20, 'star fill x should be -20');
            assert.equal(star.getFillPatternY(), -30, 'star fill y should be -30');
            assert.equal(star.getFillPatternScale().x, 0.5, 'star fill scale x should be 0.5');
            assert.equal(star.getFillPatternScale().y, 0.5, 'star fill scale y should be 0.5');
            assert.equal(star.getFillPatternOffset().x, 219, 'star fill offset x should be 219');
            assert.equal(star.getFillPatternOffset().y, 150, 'star fill offset y should be 150');
            assert.equal(star.getFillPatternRotation(), Math.PI * 0.5, 'star fill rotation should be Math.PI * 0.5');

            star.setFillPatternRotationDeg(180);

            assert.equal(star.getFillPatternRotation(), Math.PI, 'star fill rotation should be Math.PI');

            star.setFillPatternScale(1);

            assert.equal(star.getFillPatternScale().x, 1, 'star fill scale x should be 1');
            assert.equal(star.getFillPatternScale().y, 1, 'star fill scale y should be 1');

            star.setFillPatternOffset([100, 120]);

            assert.equal(star.getFillPatternOffset().x, 100, 'star fill offset x should be 100');
            assert.equal(star.getFillPatternOffset().y, 120, 'star fill offset y should be 120');

            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('test size setters and getters', function() {
        var stage = addStage();
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
        assert.equal(circle.getWidth(), 100, 'circle width should be 100');
        assert.equal(circle.getHeight(), 100, 'circle height should be 100');
        assert.equal(circle.getSize().width, 100, 'circle width should be 100');
        assert.equal(circle.getSize().height, 100, 'circle height should be 100');
        assert.equal(circle.getRadius(), 50, 'circle radius should be 50');

        circle.setWidth(200);

        assert.equal(circle.getWidth(), 200, 'circle width should be 200');
        assert.equal(circle.getHeight(), 200, 'circle height should be 200');
        assert.equal(circle.getSize().width, 200, 'circle width should be 200');
        assert.equal(circle.getSize().height, 200, 'circle height should be 200');
        assert.equal(circle.getRadius(), 100, 'circle radius should be 100');


    });

    // ======================================================
    test('set image fill to color then image then linear gradient then back to image', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: 200,
                y: 60,
                radius: 50,
                fill: 'blue'
            });

            layer.add(circle);
            stage.add(layer);

            assert.equal(circle.getFill(), 'blue', 'circle fill should be blue');

            circle.setFill(null);
            circle.setFillPatternImage(imageObj);
            circle.setFillPatternRepeat('no-repeat');
            circle.setFillPatternOffset([-200, -70]);

            assert.notEqual(circle.getFillPatternImage(), undefined, 'circle fill image should be defined');
            assert.equal(circle.getFillPatternRepeat(), 'no-repeat', 'circle fill repeat should be no-repeat');
            assert.equal(circle.getFillPatternOffset().x, -200, 'circle fill offset x should be -200');
            assert.equal(circle.getFillPatternOffset().y, -70, 'circle fill offset y should be -70');

            circle.setFillPatternImage(null);
            circle.setFillLinearGradientStartPoint(-35);
            circle.setFillLinearGradientEndPoint(35);
            circle.setFillLinearGradientColorStops([0, 'red', 1, 'blue']);

            circle.setFillLinearGradientStartPoint(null);
            circle.setFillPatternImage(imageObj);
            circle.setFillPatternRepeat('repeat');
            circle.setFillPatternOffset(0);

            layer.draw();

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('test enablers and disablers', function() {
        var stage = addStage();
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

        assert.equal(circle.getFillEnabled(), true, 'fillEnabled should be true');
        assert.equal(circle.getStrokeEnabled(), true, 'strokeEnabled should be true');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.disableFill();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), true, 'strokeEnabled should be true');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.disableStroke();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), false, 'strokeEnabled should be false');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.disableShadow();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), false, 'strokeEnabled should be false');
        assert.equal(circle.getShadowEnabled(), false, 'shadowEnabled should be false');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.disableDashArray();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), false, 'strokeEnabled should be false');
        assert.equal(circle.getShadowEnabled(), false, 'shadowEnabled should be false');
        assert.equal(circle.getDashArrayEnabled(), false, 'dashArrayEnabled should be false');

        // re-enable

        circle.enableDashArray();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), false, 'strokeEnabled should be false');
        assert.equal(circle.getShadowEnabled(), false, 'shadowEnabled should be false');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.enableShadow();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), false, 'strokeEnabled should be false');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.enableStroke();

        assert.equal(circle.getFillEnabled(), false, 'fillEnabled should be false');
        assert.equal(circle.getStrokeEnabled(), true, 'strokeEnabled should be true');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        circle.enableFill();

        assert.equal(circle.getFillEnabled(), true, 'fillEnabled should be true');
        assert.equal(circle.getStrokeEnabled(), true, 'strokeEnabled should be true');
        assert.equal(circle.getShadowEnabled(), true, 'shadowEnabled should be true');
        assert.equal(circle.getDashArrayEnabled(), true, 'dashArrayEnabled should be true');

        var trace = layer.getContext().getTrace();
        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();save();shadowColor=black;shadowBlur=10;shadowOffsetX=10;shadowOffsetY=10;fillStyle=green;fill();restore();fillStyle=green;fill();setLineDash([10,10]);lineWidth=4;strokeStyle=black;stroke();restore()');

    });


});