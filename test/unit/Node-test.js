suite('Node', function() {

    // ======================================================
    test('getType and getClassName', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        stage.add(layer.add(group.add(circle)));

        //console.log(stage.getType());

        assert.equal(stage.getType(), 'Stage');
        assert.equal(layer.getType(), 'Layer');
        assert.equal(group.getType(), 'Group');
        assert.equal(circle.getType(), 'Shape');

        assert.equal(stage.getClassName(), 'Stage');
        assert.equal(layer.getClassName(), 'Layer');
        assert.equal(group.getClassName(), 'Group');
        assert.equal(circle.getClassName(), 'Circle');


    });
    // ======================================================
    test('get layer', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        assert.equal(circle.getLayer(), null);

        stage.add(layer.add(circle));
        assert.equal(circle.getLayer(), layer);

    });
    // ======================================================
    test('setAttr', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        stage.add(layer.add(circle));

        circle.setAttr('fill', 'red');
        layer.draw();

        assert.equal(circle.getFill(), 'red');

        circle.setAttr('position', {x: 5, y: 6});

        assert.equal(circle.getX(), 5);
        assert.equal(circle.getY(), 6);

        circle.setAttr('foobar', 12);

        assert.equal(circle.getAttr('foobar'), 12);
    });

    // ======================================================
    test('unset attr', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        stage.add(layer.add(circle));


        circle.setAttr('x', undefined);
        assert.equal(circle.getX(), 0);

        circle.y(null);
        assert.equal(circle.y(), 0);
    });

    // ======================================================
    test('set shape and layer opacity to 0.5', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        assert.equal(circle.getAbsoluteOpacity(), 0.25);
        assert.equal(layer.getAbsoluteOpacity(), 0.5);
    });

    // ======================================================
    test('transform cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        assert.equal(circle._cache.transform, undefined);

        layer.add(circle);
        stage.add(layer);

        // transform cache
        assert.notEqual(circle._cache.transform, undefined);
        circle.setX(100);
        assert.equal(circle._cache.transform, undefined);
        layer.draw();
        assert.notEqual(circle._cache.transform, undefined);
    });

    // ======================================================
    test('visible cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        layer.add(circle);
        stage.add(layer);

        // visible cache
        assert.equal(circle._cache.visible, true);
        circle.hide();
        assert.equal(circle._cache.visible, undefined);
        stage.draw();
        assert.equal(circle._cache.visible, false);
        circle.show();
        assert.equal(circle._cache.visible, undefined);
        layer.draw();
        assert.equal(circle._cache.visible, true);

    });

    // ======================================================
    test('shadow cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        layer.add(circle);
        stage.add(layer);

        // shadow cache
        assert.equal(circle._cache.hasShadow, false);
        circle.setShadowColor('red');
        circle.setShadowOffset(10);
        assert.equal(circle._cache.hasShadow, undefined);
        layer.draw();
        assert.equal(circle._cache.hasShadow, true);
        layer.draw();
        assert.equal(circle._cache.hasShadow, true);

    });

    // ======================================================
    test('has shadow', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 10,
            y: stage.getHeight() / 3,
            width: 100,
            height: 100,
            fill : "red",
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });
        layer.add(rect);
        stage.add(layer);
        rect.shadowEnabled(true);
        rect.shadowColor("grey");
        assert.equal(rect.hasShadow(), true);
        rect.shadowEnabled(false);
        assert.equal(rect.hasShadow(), false);

    });

    // ======================================================
    test('opacity cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        layer.add(circle);
        stage.add(layer);

        // opacity cache
        assert.equal(circle._cache.absoluteOpacity, 1);
        circle.setOpacity(0.5);
        assert.equal(circle._cache.absoluteOpacity, undefined);
        layer.draw();
        assert.equal(circle._cache.absoluteOpacity, 0.5);

    });

    // ======================================================
    test('listening cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        layer.add(circle);
        stage.add(layer);

        // listening cache

        // prime the cache
        circle.isListening();

        assert.equal(circle._cache.listening, true);
        circle.setListening(false);
        assert.equal(circle._cache.listening, undefined);
        circle.isListening();
        assert.equal(circle._cache.listening, false);

    });

    // ======================================================
    test('stage cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        layer.add(circle);
        stage.add(layer);

        // stage cache
        var st = circle.getStage();
        assert.equal(circle._cache.stage._id, stage._id);

    });

    // ======================================================
    test('toDataURL + HDPI', function(done) {
        this.timeout(5000);
        var oldRatio = Konva.pixelRatio;
        Konva.pixelRatio = 2;

        var stage = addStage();
        var layer = new Konva.Layer();
        stage.add(layer);

        var circle = new Konva.Circle({
            fill : 'green',
            x : stage.width() / 2,
            y : stage.height() / 2,
            radius : 50
        });
        layer.add(circle);

        var layer2 = new Konva.Layer();
        stage.add(layer2);

        stage.draw();
        stage.toDataURL({
            pixelRatio : 2,
            callback : function(url) {
                var img = new Image();
                img.onload = function() {
                    var image = new Konva.Image({
                        image : img,
                        scaleX: 0.5,
                        scaleY: 0.5
                    });
                    assert.equal(image.width(), stage.width() * 2, 'image has double size');
                    layer2.add(image);
                    layer2.draw();
                    compareLayers(layer, layer2, 50);
                    Konva.pixelRatio = oldRatio;
                    done();
                }
                img.src = url;
            }
        });
    });



    // ======================================================
    test('listen and don\'t listen', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue'
        });

        var rect2 = new Konva.Rect({
            x: 200,
            y: 100,
            width: 200,
            height: 50,
            fill: 'red',
            listening: false
        });

        layer.add(rect).add(rect2);
        stage.add(layer);

        assert.equal(rect.getListening(), 'inherit');

        assert.equal(rect.isListening(), true);
        rect.setListening(false);
        assert.equal(rect.getListening(), false);

        assert.equal(rect2.getListening(), false);
        rect2.setListening(true);
        assert.equal(rect2.getListening(), true);
    });

    // ======================================================
    test('listen and don\'t listen with one shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue'
        });

        layer.add(rect);
        stage.add(layer);

        rect.setListening(false);
        layer.drawHit();

        showHit(layer);
    });

    // ======================================================
    test('test offset attr change', function() {
        /*
         * the premise of this test to make sure that only
         * root level attributes trigger an attr change event.
         * for this test, we have two offset properties.  one
         * is in the root level, and the other is inside the shadow
         * object
         */
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            offset: {x:10, y:10},
            shadowColor: 'black',
            shadowOffset: {x:20, y:20}
        });

        layer.add(rect);
        stage.add(layer);

        var offsetChange = false;
        var shadowOffsetChange = false;

        rect.on('offsetChange', function(val) {
            offsetChange = true;
        });

        rect.offset({x:1, y:2});

        assert.equal(offsetChange, true);
    });

    // ======================================================
    test('simple clone', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            stroke: 'red'
        });

        var clone = rect.clone({
            stroke: 'green'
        });

        layer.add(clone);
        stage.add(layer);

        assert.equal(rect.getStroke(), 'red');
        assert.equal(clone.getStroke(), 'green');
    });

    // ======================================================
    test('clone - check reference', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var line = new Konva.Line({
            x: 0,
            y: 0,
            stroke : 'red',
            points : [0, 0, 10, 10]
        });

        var clone = line.clone({
            stroke: 'green'
        });

        layer.add(clone);
        stage.add(layer);

        assert.equal(line.points() === clone.points(), false);
        assert.equal(JSON.stringify(clone.points()), '[0,0,10,10]');
    });

    // ======================================================
    test('complex clone', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            offsetX: 10,
            offsetY: 10,
            shadowColor: 'black',
            shadowOffsetX: 20,
            shadowOffsetY: 20,
            draggable: true,
            name: 'myRect',
            id : 'myRect'
        });

        var clicks = [];

        rect.on('click', function() {
            clicks.push(this.getName());
        });
        var clone = rect.clone({
            x: 300,
            fill: 'red',
            name: 'rectClone'
        });

        assert.equal(clone.getX(), 300);
        assert.equal(clone.getY(), 50);
        assert.equal(clone.getWidth(), 200);
        assert.equal(clone.getHeight(), 50);
        assert.equal(clone.getFill(), 'red');

        assert.equal(rect.getShadowColor(), 'black');
        assert.equal(clone.getShadowColor(), 'black');

        assert.equal(clone.id() == undefined, true, 'do not clone id');

        clone.setShadowColor('green');

        /*
         * Make sure that when we change a clone object attr that the rect object
         * attr isn't updated by reference
         */

        assert.equal(rect.getShadowColor(), 'black');
        assert.equal(clone.getShadowColor(), 'green');

        layer.add(rect);
        layer.add(clone);
        stage.add(layer);

        // make sure private ids are different
        assert(rect._id !== clone._id, 'rect and clone ids should be different');

        // test user event binding cloning
        assert.equal(clicks.length, 0);
        rect.fire('click');
        assert.equal(clicks.toString(), 'myRect');
        clone.fire('click');
        assert.equal(clicks.toString(), 'myRect,rectClone');
    });

    // ======================================================
    test('clone a group', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group({
            x: 50,
            draggable: true,
            name: 'myGroup'
        });

        var rect = new Konva.Rect({
            x: 0,
            y: 50,
            width: 200,
            height: 50,
            fill: 'red',
            offsetX: 10,
            offsetY: 10,
            shadowColor: 'black',
            shadowOffset: [20, 20],
            name: 'myRect',
            myAttr: 'group rect'
        });
        var text = new Konva.Text({
            x: 0,
            y: 110,
            text: 'Some awesome text!',
            fontSize: 14,
            fontFamily: 'Calibri',
            fill: 'blue',
            name: 'myText'
        });
        group.add(rect);
        group.add(text);

        var clicks = [];
        var taps = [];

        group.on('click', function() {
            clicks.push(this.getName());
        });
        rect.on('tap', function() {
            taps.push(this.attrs.myAttr);
        });
        var clone = group.clone({
            x: 300,
            name: 'groupClone'
        });

        showHit(layer);

        layer.add(group);
        layer.add(clone);
        stage.add(layer);

        assert.equal(clone.getX(), 300);
        assert.equal(clone.getY(), 0);
        assert.equal(clone.getDraggable(), true);
        // test alias
        assert.equal(clone.draggable(), true);
        assert.equal(clone.getName(), 'groupClone');

        assert.equal(group.getChildren().length, 2);
        assert.equal(clone.getChildren().length, 2);
        assert.equal(group.find('.myText')[0].getFill(), 'blue');
        assert.equal(clone.find('.myText')[0].getFill(), 'blue');
        clone.find('.myText')[0].setFill('black');
        assert.equal(group.find('.myRect')[0].attrs.myAttr, 'group rect');
        assert.equal(clone.find('.myRect')[0].attrs.myAttr, 'group rect');
        clone.find('.myRect')[0].setAttrs({
            myAttr: 'clone rect'
        });

        // Make sure that when we change a clone object attr that the rect object
        // attr isn't updated by reference

        assert.equal(group.find('.myText')[0].getFill(), 'blue');
        assert.equal(clone.find('.myText')[0].getFill(), 'black');

        assert.equal(group.find('.myRect')[0].attrs.myAttr, 'group rect');
        assert.equal(clone.find('.myRect')[0].attrs.myAttr, 'clone rect');

        // make sure private ids are different
        assert.notEqual(group._id, clone._id);

        // make sure childrens private ids are different
        assert.notEqual(group.find('.myRect')[0]._id, clone.find('.myRect')[0]._id);
        assert.notEqual(group.find('.myText')[0]._id, clone.find('.myText')[0]._id);

        // test user event binding cloning
        assert.equal(clicks.length, 0);
        group.fire('click');
        assert.equal(clicks.toString(), 'myGroup');
        clone.fire('click');
        assert.equal(clicks.toString(), 'myGroup,groupClone');

        // test user event binding cloning on children
        assert.equal(taps.length, 0);
        group.find('.myRect')[0].fire('tap');
        assert.equal(taps.toString(), 'group rect');
        clone.find('.myRect')[0].fire('tap');
        assert.equal(taps.toString(), 'group rect,clone rect');

        stage.draw();

    });

    // ======================================================
    test('test on attr change', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            shadowOffset: {x: 10, y: 10},
        });

        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 35,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var widthChanged = 0;
        var shadowChanged = 0;
        var radiusChanged = 0;

        rect.on('widthChange', function(evt) {
            widthChanged++;
            assert.equal(evt.oldVal, 200);
            assert.equal(evt.newVal, 210);
        });

        rect.on('shadowOffsetChange', function() {
            shadowChanged++;
        });

        circle.on('radiusChange', function() {
            radiusChanged++;
        });

        circle.setRadius(70);

        rect.setSize({width: 210, height: 210});
        rect.setShadowOffset({
            x: 20
        });

        assert.equal(widthChanged, 1);
        assert.equal(shadowChanged, 1);
        assert.equal(radiusChanged, 1);

    });

    // ======================================================
    test('test on attr change for same value', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            shadowOffset: {x: 10, y: 10},
        });

        layer.add(rect);
        stage.add(layer);

        var widthChanged = 0;

        rect.on('widthChange', function(evt) {
            widthChanged++;
        });


        rect.width(210);
        rect.width(210);

        assert.equal(widthChanged, 1, 'should trigger only once');

    });

    // ======================================================
    test('set shape, layer and stage opacity to 0.5', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.setOpacity(0.5);
        stage.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        assert.equal(circle.getAbsoluteOpacity(), 0.125);
        assert.equal(layer.getAbsoluteOpacity(), 0.25);
        assert.equal(stage.getAbsoluteOpacity(), 0.5);
    });

    // ======================================================
    test('hide show layer', function() {
        var stage = addStage();

        var layer1 = new Konva.Layer();
        var layer2 = new Konva.Layer();

        var circle1 = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        var circle2 = new Konva.Circle({
            x: 150,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle1.on('mousemove', function() {
            console.log('mousemove circle1');
        });

        circle2.on('mousemove', function() {
            console.log('mousemove circle2');
        });

        layer1.add(circle1);
        layer2.add(circle2);
        stage.add(layer1).add(layer2);


        assert.equal(layer2.isVisible(), true);
        layer2.hide();
        assert.equal(layer2.isVisible(), false);
        assert.equal(layer2.canvas._canvas.style.display, 'none');

        layer2.show();
        assert.equal(layer2.isVisible(), true);
        assert.equal(layer2.canvas._canvas.style.display, 'block');

    });

    // ======================================================
    test('rotation in degrees', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            rotation: 10
        });

        assert.equal(rect.rotation(), 10);
        rect.rotation(20);
        assert.equal(rect.rotation(), 20);
        rect.rotate(20);
        assert.equal(rect.rotation(), 40);

        layer.add(rect);
        stage.add(layer);
    });

    // ======================================================
    test('skew', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            skewX: 1
        });


        layer.add(rect);
        stage.add(layer);

        assert.equal(rect.getSkewX(), 1);
        assert.equal(rect.getSkewY(), 0);

        /*
        rect.transitionTo({
            duration: 4,
            skewY: -2,
            easing: 'ease-in-out'


        })
        */
    });

    // ======================================================
    test('init with position, scale, rotation, then change scale', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            scale: {
                x: 0.5,
                y: 0.5
            },
            rotation: 20
        });

        assert.equal(rect.getPosition().x, 200);
        assert.equal(rect.getPosition().y, 100);
        assert.equal(rect.getScale().x, 0.5);
        assert.equal(rect.getScale().y, 0.5);
        assert.equal(rect.getRotation(), 20);

        rect.setScale({x:2, y:0.3});
        assert.equal(rect.getScale().x, 2);
        assert.equal(rect.getScale().y, 0.3);

        layer.add(rect);
        stage.add(layer);
    });

    // ======================================================
    test('clone sprite', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Konva.Layer();

            var sprite = new Konva.Sprite({
                x: 200,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: {
                    standing: [
                        0, 0, 49, 109,
                        52, 0, 49, 109,
                        105, 0, 49, 109,
                        158, 0, 49, 109,
                        210, 0, 49, 109,
                        262, 0, 49, 109
                    ],
                    kicking: [
                        0, 109, 45, 98,
                        45, 109, 45, 98,
                        95, 109, 63, 98,
                        156, 109, 70, 98,
                        229, 109, 60, 98,
                        287, 109, 41, 98
                    ]
                },
                frameRate: 10,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 3,
                shadowOffset: {x: 3, y:1},
                shadowOpacity: 0.3
            });

            var clone = sprite.clone();
            layer.add(clone);
            stage.add(layer);
            clone.start();

            done();
        };
        imageObj.src = 'assets/scorpion-sprite.png';
    });

    // ======================================================
    test('node caching', function(done) {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();

        var points = [73, 250, 73, 160, 340, 23, 500, 109, 499, 139, 342, 93];

        var poly = new Konva.Line({
            points: points,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            draggable: true,
            closed: true
        });

        group.add(poly);
        layer.add(group);
        stage.add(layer);

        poly.toImage({
            width: 500,
            height: 300,
            callback: function(imageObj) {
                //document.body.appendChild(imageObj)
                assert.equal(Konva.Util._isElement(imageObj), true);

                var cachedShape = new Konva.Image({
                    image: imageObj,
                    draggable: true,
                    stroke: 'red',
                    strokeWidth: 5,
                    x: 50,
                    y: -120

                });

                layer.add(cachedShape);
                layer.draw();
                done();
            }
        });

        showHit(layer);
    });

    // ======================================================
    test('hide group', function() {
        var stage = addStage();

        var layer = new Konva.Layer();
        var group = new Konva.Group();

        var circle1 = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        var circle2 = new Konva.Circle({
            x: 150,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        circle1.on('mousemove', function() {
            console.log('mousemove circle1');
        });

        circle2.on('mousemove', function() {
            console.log('mousemove circle2');
        });

        group.add(circle2);
        layer.add(circle1).add(group);
        stage.add(layer);

        assert.equal(group.isVisible(), true);
        assert.equal(circle2.isVisible(), true);

        group.hide();
        layer.draw();

        assert.equal(!group.isVisible(), true);
        assert.equal(!circle2.isVisible(), true);
    });

    // ======================================================
    test('add shape with custom attr pointing to self', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            offset: {
                x: 0,
                y: 0
            },
            scale: {
                x: 2,
                y: 2
            }
        });
        layer.add(circle);
        stage.add(layer);

        /*
         * add custom attr that points to self.  The setAttrs method should
         * not inifinitely recurse causing a stack overflow
         */
        circle.setAttrs({
            self: circle
        });

        /*
         * serialize the stage.  The json should succeed because objects that have
         * methods, such as self, are not serialized, and will therefore avoid
         * circular json errors.
         */
        var json = stage.toJSON();
    });

    // ======================================================
    test('scale shape by half', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.setScale(0.5, 1);
        layer.add(circle);
        stage.add(layer);
    });

    // ======================================================
    test('scale shape by half then back to 1', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.setScale(0.5, 1);
        circle.setScale(1, 1);
        layer.add(circle);
        stage.add(layer);
    });

    // ======================================================
    test('set offset offset after instantiation', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            stroke: 'blue',
            offset: {
                x: 40,
                y: 20
            }
        });

        layer.add(rect);
        stage.add(layer);

        assert.equal(rect.offsetX(), 40);
        assert.equal(rect.offsetY(), 20);

        assert.equal(rect.offset().x, 40);
        assert.equal(rect.offset().y, 20);

        rect.offset({x:80, y:40});

        assert.equal(rect.offsetX(), 80);
        assert.equal(rect.offsetY(), 40);

        assert.equal(rect.offset().x, 80);
        assert.equal(rect.offset().y, 40);

    });

    // ======================================================
    test('test name methods', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);
        assert.equal(circle.getName(), undefined);

        circle.addName('foo');
        assert.equal(circle.getName(),'foo');
        circle.addName('myCircle');
        assert.equal(circle.getName(),'foo myCircle');

        // add existing name
        circle.addName('foo');
        assert.equal(circle.getName(),'foo myCircle');


        // check hasName
        assert.equal(circle.hasName('myCircle'), true);
        assert.equal(circle.hasName('foo'), true);
        assert.equal(circle.hasName('boo'), false);
        assert.equal(stage.findOne('.foo'), circle);

        // removing name
        circle.removeName('foo');
        assert.equal(circle.getName(), 'myCircle');
        assert.equal(layer.find('.foo').length, 0);
    });

    // ======================================================
    test('test setting shadow offset', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red',
            shadowColor: 'blue',
            shadowBlur: 12
        });

        layer.add(rect);
        stage.add(layer);

        rect.setShadowOffset({x:1, y:2});
        assert.equal(rect.getShadowOffset().x, 1);
        assert.equal(rect.getShadowOffset().y, 2);
        // make sure we still have the other properties
        assert.equal(rect.getShadowColor(), 'blue');
        assert.equal(rect.getShadowBlur(), 12);

        rect.setShadowOffset({
            x: 3,
            y: 4
        });
        assert.equal(rect.getShadowOffset().x, 3);
        assert.equal(rect.getShadowOffset().y, 4);

        // test partial setting
        rect.setShadowOffsetX(5);
        assert.equal(rect.getShadowOffset().x, 5);
        assert.equal(rect.getShadowOffset().y, 4);

        // test partial setting
        rect.setShadowOffsetY(6);
        assert.equal(rect.getShadowOffset().x, 5);
        assert.equal(rect.getShadowOffset().y, 6);

    });

    // ======================================================
    test('test offset', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect);
        stage.add(layer);

        rect.offset({x:1, y: 2});
        assert.equal(rect.offset().x, 1);
        assert.equal(rect.offset().y, 2);

        rect.offset({x:3, y:4});
        assert.equal(rect.offset().x, 3);
        assert.equal(rect.offset().y, 4);

        rect.offset({
            x: 5,
            y: 6
        });
        assert.equal(rect.offset().x, 5);
        assert.equal(rect.offset().y, 6);

        rect.offsetX(7);
        assert.equal(rect.offset().x, 7);
        assert.equal(rect.offset().y, 6);

        rect.offsetY(8);
        assert.equal(rect.offset().x, 7);
        assert.equal(rect.offset().y, 8);

    });

    // ======================================================
    test('test setPosition and move', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect);
        stage.add(layer);

        rect.setPosition({x:1, y:2});
        assert.equal(rect.getPosition().x, 1);
        assert.equal(rect.getPosition().y, 2);

        rect.setPosition({x:3, y:4});
        assert.equal(rect.getPosition().x, 3);
        assert.equal(rect.getPosition().y, 4);

        rect.setPosition({
            x: 5,
            y: 6
        });
        assert.equal(rect.getPosition().x, 5);
        assert.equal(rect.getPosition().y, 6);

        rect.setX(7);
        assert.equal(rect.getPosition().x, 7);
        assert.equal(rect.getPosition().y, 6);

        rect.setY(8);
        assert.equal(rect.getPosition().x, 7);
        assert.equal(rect.getPosition().y, 8);

        rect.move({x: 10, y: 10});
        assert.equal(rect.getPosition().x, 17);
        assert.equal(rect.getPosition().y, 18);

    });

    // ======================================================
    test('test setScale', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        rect.setScale({x:2, y:3});
        assert.equal(rect.getScale().x, 2);
        assert.equal(rect.getScale().y, 3);

        rect.setScale({x:4,y:4});
        assert.equal(rect.getScale().x, 4);
        assert.equal(rect.getScale().y, 4);

        rect.setScale({x:5, y:6});
        assert.equal(rect.getScale().x, 5);
        assert.equal(rect.getScale().y, 6);

        rect.setScale({x: 7, y:8});
        assert.equal(rect.getScale().x, 7);
        assert.equal(rect.getScale().y, 8);

        rect.setScale({
            x: 9,
            y: 10
        });
        assert.equal(rect.getScale().x, 9);
        assert.equal(rect.getScale().y, 10);

        rect.setScaleX(11);
        assert.equal(rect.getScale().x, 11);
        assert.equal(rect.getScale().y, 10);

        rect.setScaleY(12);
        assert.equal(rect.getScale().x, 11);
        assert.equal(rect.getScale().y, 12);

    });

    // ======================================================
    test('test config scale', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect1 = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {
                x: 2,
                y: 3
            }
        });

        var rect2 = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {x:2,y:2}
        });

        var rect3 = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {x:2, y:3}
        });

        var rect4 = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scaleX: 2
        });

        var rect5 = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scaleY: 2
        });

        layer.add(rect1).add(rect2).add(rect3).add(rect4).add(rect5);
        stage.add(layer);

        assert.equal(rect1.getScale().x, 2);
        assert.equal(rect1.getScale().y, 3);

        assert.equal(rect2.getScale().x, 2);
        assert.equal(rect2.getScale().y, 2);

        assert.equal(rect3.getScale().x, 2);
        assert.equal(rect3.getScale().y, 3);

        assert.equal(rect4.getScale().x, 2);
        assert.equal(rect4.getScale().y, 1);

        //assert.equal(rect5.getScale().x, 1);
        assert.equal(rect5.getScale().y, 2);
    });

    // ======================================================
    test('test config position', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect1 = new Konva.Rect({
            x: 1,
            y: 2,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect2 = new Konva.Rect({
            x: 3,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect3 = new Konva.Rect({
            y: 4,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect4 = new Konva.Rect({
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect1).add(rect2).add(rect3).add(rect4);
        stage.add(layer);

        assert.equal(rect1.getPosition().x, 1);
        assert.equal(rect1.getPosition().y, 2);

        assert.equal(rect2.getPosition().x, 3);
        assert.equal(rect2.getPosition().y, 0);

        assert.equal(rect3.getPosition().x, 0);
        assert.equal(rect3.getPosition().y, 4);

        assert.equal(rect4.getPosition().x, 0);
        assert.equal(rect4.getPosition().y, 0);
    });

    // ======================================================
    test('test getPosition and getAbsolutePosition for shape inside transformed stage', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        layer.add(rect);
        stage.add(layer);


        stage.rotate(180 / 3);
        stage.setScale({x:0.5, y:0.5});

        stage.draw();

        assert.equal(rect.getPosition().x, 200);
        assert.equal(rect.getPosition().y, 20);

        assert.equal(Math.round(rect.getAbsolutePosition().x), 41);
        assert.equal(Math.round(rect.getAbsolutePosition().y), 92);
    });

    // ======================================================
    test('test consecutive getAbsolutePositions()s when shape has offset', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            offsetX: 30,
            offsetY: 30
            //rotationDeg: 60
            //rotationDeg: Math.PI / 3
        });

        layer.add(rect);
        stage.add(layer);


        assert(rect.getAbsolutePosition().x === 200 && rect.getAbsolutePosition().y === 20, 'absolute position should be 200, 20');
        assert(rect.getAbsolutePosition().x === 200 && rect.getAbsolutePosition().y === 20, 'absolute position should be 200, 20');
        assert(rect.getAbsolutePosition().x === 200 && rect.getAbsolutePosition().y === 20, 'absolute position should be 200, 20');
        assert(rect.getAbsolutePosition().x === 200 && rect.getAbsolutePosition().y === 20, 'absolute position should be 200, 20');
        assert(rect.getAbsolutePosition().x === 200 && rect.getAbsolutePosition().y === 20, 'absolute position should be 200, 20');
    });

    // ======================================================
    test('test getPosition and getAbsolutePosition for transformed parent with offset offset', function() {
        var side = 100;
        var diagonal = Math.sqrt(side * side * 2);

        var stage = addStage();
        var layer = new Konva.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Konva.Group({
            name: 'groupName',
            id: 'groupId',
            rotation: 45,
            offset: {x:side / 2, y:side / 2},
            x: diagonal / 2,
            y: diagonal / 2
        });
        var rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: side,
            height: side,
            fill: 'red',
            name: 'rectName',
            id: 'rectId'
        });
        var marker = new Konva.Rect({
            x: side,
            y: 0,
            width: 1,
            height: 1,
            fill: 'blue',
            stroke: 'blue',
            strokeWidth: 4,
            name: 'markerName',
            id: 'markerId'
        });

        group.add(rect);
        group.add(marker);
        layer.add(group);
        stage.add(layer);

        assert.equal(Math.round(marker.getAbsolutePosition().x), Math.round(diagonal), 'marker absolute position x should be about ' + Math.round(diagonal) + ' but is about ' + Math.round(marker.getAbsolutePosition().x));
        assert.equal(Math.round(marker.getAbsolutePosition().y), Math.round(diagonal / 2), 'marker absolute position y should be about ' + Math.round(diagonal / 2) + ' but is about ' + Math.round(marker.getAbsolutePosition().y));
    });

    // ======================================================
    test('test relative getAbsolutePosition for transformed parent ', function() {
        var stage = addStage();
        var layer = new Konva.Layer({
            name: 'layerName',
            id: 'layerId',
            x: 100,
            y: 100
        });
        var group = new Konva.Group({
            name: 'groupName',
            id: 'groupId',
            x: 100,
            y: 100
        });
        var rect = new Konva.Rect({
            x: 50,
            y: 60,
            width: 50,
            height: 50,
            fill: 'red',
            name: 'rectName',
            id: 'rectId'
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        assert.equal(rect.getAbsolutePosition(layer).x, 150);
        assert.equal(rect.getAbsolutePosition(layer).y, 160);

    });

    // ======================================================
    test('test dragDistance', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect1 = new Konva.Rect({
            x: 1,
            y: 2,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var group = new Konva.Group({
            dragDistance : 2
        });

        var rect2 = new Konva.Rect({
            x: 3,
            width: 100,
            height: 50,
            fill: 'red'
        });
        group.add(rect2);

        layer.add(rect1).add(group);
        stage.add(layer);

        assert.equal(rect1.dragDistance(), 0);
        assert.equal(group.dragDistance(), 2);
        assert.equal(rect2.dragDistance(), 2);
    });

    // ======================================================
    test('translate, rotate, scale shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Rect({
            x: 100,
            y: 100,
            rotation: 20,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            scale: {
                x: 2,
                y: 1
            },
            offset: {
                x: 50,
                y: 25
            }
        });

        layer.add(circle);
        stage.add(layer);
    });

    // ======================================================
    test('test isListening', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var rect = new Konva.Rect({
            x: 100,
            y: 100,
            rotation: 20,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        assert.equal(rect.isListening(), true);

        rect.setListening(false);
        assert.equal(rect.isListening(), false);

        rect.setListening('inherit');
        assert.equal(rect.isListening(), true);

        layer.setListening(false);

        assert.equal(rect.isListening(), false);

        layer.setListening(true);
        assert.equal(rect.isListening(), true);

        // even though we set stage listening to false, since the layer
        // listening is set to try, rect listening will be true
        stage.setListening(false);
        assert.equal(rect.isListening(), true);

        // setting layer listening to inherit means that the layer listening
        // will inherit the stage listening, which is false
        layer.setListening('inherit');
        assert.equal(rect.isListening(), false);

    });

    // ======================================================
    test('test fire event', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();

        var clicks = [];

        circle.on('click', function() {
            clicks.push('circle');

            /*
             var evt = window.event;
             var rightClick = evt.which ? evt.which == 3 : evt.button == 2;
             console.log(rightClick);
             */
        });
        var foo;
        circle.on('customEvent', function(evt) {
            foo = evt.foo;
        });

        layer.on('click', function() {
            clicks.push('layer');
        });
        // fire event with bubbling
        circle.fire('click', null, true);

        //console.log(clicks);

        assert.equal(clicks.toString(),'circle,layer');

        // no bubble
        circle.fire('click');

        assert.equal(clicks.toString(), 'circle,layer,circle');

        // test custom event
        circle.fire('customEvent', {
            foo: 'bar'
        });

        assert.equal(foo, 'bar');

        // test fireing custom event that doesn't exist.  script should not fail
        circle.fire('kaboom');

    });

    // ======================================================
    test('add remove event', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        /*
         * test regular on and off
         */
        assert.equal(circle.eventListeners['click'], undefined);

        circle.on('click', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 1);

        circle.on('click', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 2);

        circle.off('click');
        assert.equal(circle.eventListeners['click'], undefined);

        /*
         * test name spacing
         */
        circle.on('click.foo', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 1);

        circle.on('click.foo', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 2);
        circle.on('click.bar', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 3);

        circle.off('click.foo');
        assert.equal(circle.eventListeners['click'].length, 1);

        circle.off('click.bar');
        assert.equal(circle.eventListeners['click'], undefined);

        /*
         * test remove all events in name space
         */
        circle.on('click.foo', function() {
        });
        circle.on('click.foo', function() {
        });
        circle.on('touch.foo', function() {
        });
        circle.on('click.bar', function() {
        });
        circle.on('touch.bar', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 3);
        assert.equal(circle.eventListeners['touch'].length, 2);
        circle.off('.foo');
        assert.equal(circle.eventListeners['click'].length, 1);
        assert.equal(circle.eventListeners['touch'].length, 1);

        circle.off('.bar');
        assert.equal(circle.eventListeners['click'], undefined);
        assert.equal(circle.eventListeners['touch'], undefined);


        //  test remove all events
        circle.on('click.konva', function() {
        });
        circle.on('click', function() {
        });
        circle.on('boo', function() {
        });
        assert.equal(circle.eventListeners['click'].length, 2);
        assert.equal(circle.eventListeners['boo'].length, 1);
        circle.off();
        assert.equal(circle.eventListeners['boo'], undefined);
        // should not remove konva listeners
        assert.equal(circle.eventListeners['click'].length, 1);
        stage.add(layer);
        layer.add(circle);
        layer.draw();
    });

    // ======================================================
    test('simulate event bubble', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();

        var clicks = [];

        circle.on('click', function() {
            clicks.push('circle');
        });

        layer.on('click', function() {
            clicks.push('layer');
        });

        circle.fire('click', null, true);

        assert.equal(clicks[0], 'circle');
        assert.equal(clicks[1], 'layer');
    });

    // ======================================================
    test('simulate cancel event bubble', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();

        var clicks = [];

        circle.on('click', function(e) {
            e.cancelBubble = true;
            clicks.push('circle');
        });

        layer.on('click', function() {
            clicks.push('layer');
        });

        circle.fire('click', {}, true);

        assert.equal(clicks[0], 'circle');
        assert.equal(clicks.length, 1);
    });

    test('simple event delegation', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();

        var fired = false;
        layer.on('click', 'Circle', function(e) {
            assert.equal(this, circle);
            assert.equal(e.currentTarget, circle);
            fired = true;
        });
        circle.fire('click', null, true);
        assert.equal(fired, true);
    });

    test('complex event delegation', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        stage.add(layer);
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });
        var group = new Konva.Group({
            name: 'group1 group2'
        });
        group.add(circle);
        layer.add(group);

        layer.draw();

        var fired = false;
        layer.on('click', '.group1', function(e) {
            assert.equal(this, group);
            assert.equal(e.currentTarget, group);
            fired = true;
        });
        circle.fire('click', null, true);
        assert.equal(fired, true);
    });
    // ======================================================
    test('move shape, group, and layer, and then get absolute position', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();

        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        circle.setPosition({x:100, y:0});
        group.setPosition({x: 100, y: 0});
        layer.setPosition({x: 100, y: 0});

        // test relative positions
        assert.equal(circle.getPosition().x, 100);
        assert.equal(group.getPosition().x, 100);
        assert.equal(layer.getPosition().x, 100);

        // test absolute positions
        assert.equal(circle.getAbsolutePosition().x, 300);
        assert.equal(group.getAbsolutePosition().x, 200);
        assert.equal(layer.getAbsolutePosition().x, 100);

        layer.draw();
    });

    // ======================================================
    test('scale layer, rotate group, position shape, and then get absolute position', function() {
        var stage = addStage();
        var layer = new Konva.Layer({
            scale: {
                x: 2,
                y: 2
            }
        });
        var group = new Konva.Group({
            x: 100,
            rotation: 90
        });

        var rect = new Konva.Rect({
            x: 50,
            y: 10,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        // test absolute positions
        assert.equal(rect.getAbsolutePosition().x, 180);
        assert.equal(rect.getAbsolutePosition().y, 100);

        layer.draw();
    });

    // ======================================================
    test('hide show circle', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        assert.equal(circle.isVisible(), true);

        circle.hide();
        layer.draw();

        assert.equal(circle.isVisible(), false);

        circle.show();
        layer.draw();

        assert.equal(circle.isVisible(), true);
    });

    // ======================================================
    test('set shape opacity to 0.5', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 20,
            draggable: true
        });

        circle.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        var sceneTrace = layer.getContext().getTrace();
        //console.log(sceneTrace);

        var bufferTrace = stage.bufferCanvas.getContext().getTrace();
        //console.log(bufferTrace);

        assert.equal(sceneTrace, 'clearRect(0,0,578,200);save();globalAlpha=0.5;drawImage([object HTMLCanvasElement],0,0,578,200);restore();');
        assert.equal(bufferTrace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=20;strokeStyle=black;stroke();restore();');
    });

    test('set shape opacity to 0.5 then back to 1', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        assert.equal(circle.getAbsoluteOpacity(), 0.5);

        circle.setOpacity(1);
        layer.draw();

        assert.equal(circle.getAbsoluteOpacity(), 1);
    });

    // ======================================================
    test('get absolute z index', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group1 = new Konva.Group();
        var group2 = new Konva.Group();
        var group3 = new Konva.Group();
        var group4 = new Konva.Group();

        var shape1 = new Konva.Circle({
            x: 150,
            y: stage.getHeight() / 2,
            radius: 40,
            fill: 'green'
        });

        var shape2 = new Konva.Circle({
            x: 250,
            y: stage.getHeight() / 2,
            radius: 40,
            fill: 'green'
        });

        /*
         *        Stage(0)
         *          |
         *        Layer(1)
         *          |
         *    +-----+-----+
         *    |           |
         *   G1(2)       G2(3)
         *    |           |
         *    +       +---+---+
         *    |       |       |
         *   S1(4)   G3(5)  G4(6)
         *            |
         *            +
         *            |
         *           S2(7)
         */

        group1.add(shape1);
        group2.add(group3);
        group2.add(group4);
        group3.add(shape2);
        layer.add(group1);
        layer.add(group2);
        stage.add(layer);

        assert.equal(stage.getAbsoluteZIndex(), 0);
        //console.log(layer.getAbsoluteZIndex());
        assert.equal(layer.getAbsoluteZIndex(), 1);
        assert.equal(group1.getAbsoluteZIndex(), 2);
        assert.equal(group2.getAbsoluteZIndex(), 3);
        assert.equal(shape1.getAbsoluteZIndex(), 4);
        assert.equal(group3.getAbsoluteZIndex(), 5);
        assert.equal(group4.getAbsoluteZIndex(), 6);
        assert.equal(shape2.getAbsoluteZIndex(), 7);
    });

    // ======================================================
    test('JPEG toDataURL() Not Hiding Lower Layers with Black', function(done) {
        var stage = addStage();

        var layer1 = new Konva.Layer();
        var layer2 = new Konva.Layer();

        layer1.add(new Konva.Rect({
            x: 10,
            y: 10,
            width: 25,
            height: 15,
            fill: 'red'
        }));
        layer2.add(new Konva.Rect({
            x: 50,
            y: 50,
            width: 15,
            height: 25,
            fill: 'green'
        }));

        stage.add(layer1);
        stage.add(layer2);

        stage.toDataURL({
            height: 100,
            width: 100,
            mimeType: 'image/jpeg',
            quality: 0.8,
            callback: function(url) {
                var imageObj = new Image();
                imageObj.onload = function() {
                    layer2.add(new Konva.Image({
                        x: 200,
                        y: 10,
                        image: imageObj
                    }));
                    layer2.draw();
                    done();
                };
                imageObj.src = url;
            }
        })
    });

    // ======================================================
    test('serialize stage', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();

        var expectedJson = '{"attrs":{"width":578,"height":200},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[{"attrs":{},"className":"Group","children":[{"attrs":{"x":289,"y":100,"radius":70,"fill":"green","stroke":"black","strokeWidth":4,"name":"myCircle","draggable":true},"className":"Circle"}]}]}]}';

        assert.equal(stage.toJSON(), expectedJson);
    });

    // ======================================================
    test('serialize shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();

        var expectedJson = '{"attrs":{"x":289,"y":100,"radius":70,"fill":"green","stroke":"black","strokeWidth":4,"name":"myCircle","draggable":true},"className":"Circle"}';


        assert.equal(circle.toJSON(), expectedJson);
    });

    // ======================================================
    test('serialize shape with custom attributes', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();

        circle.setAttr('customAttr', 3);
        circle.setAttr('customAttrObj', {
            x:1,
            y:5,
            size: {
                width: 10,
                height: 20
            }
        });

        var expectedJson = '{"attrs":{"x":289,"y":100,"radius":70,"fill":"green","stroke":"black","strokeWidth":4,"name":"myCircle","draggable":true,"customAttr":3,"customAttrObj":{"x":1,"y":5,"size":{"width":10,"height":20}}},"className":"Circle"}';

        assert.equal(circle.toJSON(), expectedJson);
    });

    // ======================================================
    test('load stage using json', function() {
        var container = addContainer();
        var json = '{"attrs":{"width":578,"height":200},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[{"attrs":{},"className":"Group","children":[{"attrs":{"x":289,"y":100,"radius":70,"fill":"green","stroke":"black","strokeWidth":4,"name":"myCircle","draggable":true},"className":"Shape"}]}]}]}';
        var stage = Konva.Node.create(json, container);

        assert.equal(stage.toJSON(), json);
    });

    // ======================================================
    test('create node using object', function() {
        var node = new Konva.Circle({
            id: 'test',
            radius: 10
        });
        var clone = Konva.Node.create(node.toObject());

        assert.deepEqual(node.toObject(), clone.toObject());
    });

    // ======================================================
    test('serialize stage with custom shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();

        var drawTriangle = function(context) {
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            context.fillStrokeShape(this);
        };
        var triangle = new Konva.Shape({
            sceneFunc: drawTriangle,
            fill: "#00D2FF",
            stroke: "black",
            strokeWidth: 4,
            id: 'myTriangle'
        });

        group.add(triangle);
        layer.add(group);
        stage.add(layer);

        assert.equal(triangle.getId(), 'myTriangle');

        var expectedJson = '{"attrs":{"width":578,"height":200},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[{"attrs":{},"className":"Group","children":[{"attrs":{"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle"},"className":"Shape"}]}]}]}';


        assert.equal(stage.toJSON(), expectedJson);

        layer.draw();

    });

    // ======================================================
    test('load stage with custom shape using json', function() {
        var container = addContainer();

        var drawTriangle = function(context) {
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            context.fillStrokeShape(this);
        };
        var json = '{"attrs":{"width":578,"height":200},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[{"attrs":{},"className":"Group","children":[{"attrs":{"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle","customAttrObj":{"x":1,"y":5,"size":{"width":10,"height":20}}},"className":"Shape"}]}]}]}';

        var stage = Konva.Node.create(json, container);

        stage.find('#myTriangle').each(function(node) {
            node.sceneFunc(drawTriangle);
        });

        stage.draw();

        assert.equal(stage.toJSON(), json);
    });

    // ======================================================
    test('serialize stage with an image', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Konva.Layer();
            darth = new Konva.Image({
                x: 200,
                y: 60,
                image: imageObj,
                offset: {
                    x: 50,
                    y: imageObj.height / 2
                },
                id: 'darth'
            });

            layer.add(darth);
            stage.add(layer);
            var json = '{"attrs":{"width":578,"height":200},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[{"attrs":{"x":200,"y":60,"offsetX":50,"offsetY":150,"id":"darth"},"className":"Image"}]}]}';

            assert.equal(stage.toJSON(), json);

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('load stage with an image', function(done) {
        var imageObj = new Image();
        var container = addContainer();
        imageObj.onload = function() {
            var json = '{"attrs":{"width":578,"height":200},"className":"Stage","children":[{"attrs":{},"className":"Layer","children":[{"attrs":{"x":200,"y":60,"offsetX":50,"offsetY":150,"id":"darth"},"className":"Image"}]}]}';
            var stage = Konva.Node.create(json, container);

            assert.equal(stage.toJSON(), json);
            stage.find('#darth').each(function(node) {
                node.setImage(imageObj);
            });
            stage.draw();

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('remove shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        assert.equal(layer.children.length, 1);

        circle.remove();

        assert.equal(layer.children.length, 0);

        layer.draw();

        assert.equal(circle.getParent(), undefined);
    });

    // ======================================================
    test('destroy shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        assert.equal(layer.children.length, 1);

        circle.destroy();

        assert.equal(layer.children.length, 0);

        layer.draw();

        assert.equal(circle.getParent(), undefined);
    });

    // ======================================================
    test('destroy shape without adding its parent to stage', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            id: 'myCircle'
        });

        layer.add(circle);

        var node = stage.find('#myCircle')[0];

        assert.equal(node, undefined);

        circle.destroy();

    });

    // ======================================================
    test('destroy layer with shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer({
            name: 'myLayer'
        });
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        assert.equal(stage.children.length, 1);
        assert(stage.find('.myLayer')[0] !== undefined);
        assert(stage.find('.myCircle')[0] !== undefined);

        layer.destroy();

        assert.equal(stage.children.length, 0);
        assert.equal(stage.find('.myLayer')[0], undefined);
        assert.equal(stage.find('.myCircle')[0], undefined);

        stage.draw();
    });

    // ======================================================
    test('destroy stage with layer and shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer({
            name: 'myLayer'
        });
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        stage.destroy();

        assert.equal(layer.getParent(), undefined);
        assert.equal(circle.getParent(), undefined);
        assert.equal(stage.children.length, 0);
        assert.equal(layer.children.length, 0);
    });

    // ======================================================
    test('destroy group with shape', function() {
        var stage = addStage();
        var layer = new Konva.Layer({
            name: 'myLayer'
        });
        var group = new Konva.Group({
            name: 'myGroup'
        });

        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        assert.equal(layer.getChildren().length, 1);
        assert(stage.find('.myGroup')[0] !== undefined);
        assert(stage.find('.myCircle')[0] !== undefined);

        group.destroy();

        assert.equal(layer.children.length, 0);
        assert.equal(stage.find('.myGroup')[0], undefined);
        assert.equal(stage.find('.myCircle')[0], undefined);

        stage.draw();
    });

    // ======================================================
    test('destroy layer with no shapes', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        stage.add(layer);
        layer.destroy();

        assert.equal(stage.children.length, 0);
    });

    // ======================================================
    test('destroy shape multiple times', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var shape1 = new Konva.Circle({
            x: 150,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        var shape2 = new Konva.Circle({
            x: 250,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        layer.add(shape1);
        layer.add(shape2);
        stage.add(layer);

        assert.equal(layer.getChildren().length, 2);

        shape1.destroy();
        shape1.destroy();

        assert.equal(layer.getChildren().length, 1);

        layer.draw();

    });

    // ======================================================
    test('remove layer multiple times', function() {
        var stage = addStage();
        var layer1 = new Konva.Layer();
        var layer2 = new Konva.Layer();

        var shape1 = new Konva.Circle({
            x: 150,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        var shape2 = new Konva.Circle({
            x: 250,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        layer1.add(shape1);
        layer2.add(shape2);
        stage.add(layer1);
        stage.add(layer2);

        assert.equal(stage.getChildren().length, 2);

        layer1.remove();
        layer1.remove();

        assert.equal(stage.getChildren().length, 1);

        stage.draw();

    });

    // ======================================================
    test('destroy shape by id or name', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var circle = new Konva.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            id: 'myCircle2'
        });

        var rect = new Konva.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myRect2'
        });

        var circleColorKey = circle.colorKey;
        var rectColorKey = rect.colorKey;

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        assert.equal(Konva.ids.myCircle2._id, circle._id);
        assert.equal(Konva.names.myRect2[0]._id, rect._id);
        assert.equal(Konva.shapes[circleColorKey]._id, circle._id);
        assert.equal(Konva.shapes[rectColorKey]._id, rect._id);

        circle.destroy();

        assert.equal(Konva.ids.myCircle2, undefined);
        assert.equal(Konva.names.myRect2[0]._id, rect._id);
        assert.equal(Konva.shapes[circleColorKey], undefined);
        assert.equal(Konva.shapes[rectColorKey]._id, rect._id);

        rect.destroy();

        assert.equal(Konva.ids.myCircle2, undefined);
        assert.equal(Konva.names.myRect2, undefined);
        assert.equal(Konva.shapes[circleColorKey], undefined);
        assert.equal(Konva.shapes[rectColorKey], undefined);
    });

    // ======================================================
    test('hide stage', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();

        var rect = new Konva.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            rotation: 60,
            scale: {
                x: 2,
                y: 1
            }
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        stage.hide();
        stage.draw();

        // TODO: stage hide() fails.  also need to find a good way to test this

    });

  // ======================================================
  test('listening, & shouldDrawHit', function(){
    var stage = addStage();

    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'blue'
    });

    layer.add(rect);
    stage.add(layer);



    assert.equal(rect.isListening(), true);
    assert.equal(rect.shouldDrawHit(), true);

    rect.setListening(false);


    assert.equal(rect.isListening(), false);
    assert.equal(rect.shouldDrawHit(), false);


  });

  // ======================================================
  test('group, listening, & shouldDrawHit', function(){
    var stage = addStage();

    var layer = new Konva.Layer({
        listening : false
    });
    stage.add(layer);

    var group = new Konva.Group({
        listening : false
    });
    layer.add(group);

    var rect = new Konva.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'blue',
      listening : true
    });
    group.add(rect);
    layer.draw();

    showHit(layer);

    assert.equal(rect.isListening(), true);
    assert.equal(rect.shouldDrawHit(), true);

    assert.equal(group.isListening(), false);
    assert.equal(group.shouldDrawHit(), true, 'hit graph for group');

    assert.equal(layer.isListening(), false);
    assert.equal(layer.shouldDrawHit(), true, 'hit graph for layer');

    var layerClick = 0;
    var groupClick = 0;
    var rectClick = 0;

    rect.on('click', function() {
        rectClick += 1;
    });
    group.on('click', function() {
        groupClick += 1;
    });
    layer.on('click', function() {
        layerClick += 1;
    });
      showHit(layer);
    var top = stage.content.getBoundingClientRect().top;

    stage._mousedown({
        clientX: 150,
        clientY: 75 + top
    });
    Konva.DD._endDragBefore();
    stage._mouseup({
        clientX: 150,
        clientY: 75 + top
    });

    assert.equal(rectClick, 1, 'click on rectangle');
    assert.equal(groupClick, 0, 'no click on group');
    assert.equal(layerClick, 0, 'no click on layer');
  });

    // ======================================================
  test('isVisible', function(){
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
        x: 100,
        y: 100,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    assert.equal(stage.isVisible(), true);
    assert.equal(layer.isVisible(), true);
    assert.equal(circle.isVisible(), true);

    stage.setVisible(false);

    assert.equal(stage.isVisible(), false);
    assert.equal(layer.isVisible(), false);
    assert.equal(circle.isVisible(), false);

    stage.setVisible('inherit');
    layer.setVisible(false);

    assert.equal(stage.isVisible(), true);
    assert.equal(layer.isVisible(), false);
    assert.equal(circle.isVisible(), false);

    layer.setVisible('inherit');
    circle.setVisible(false);

    assert.equal(stage.isVisible(), true);
    assert.equal(layer.isVisible(), true);
    assert.equal(circle.isVisible(), false);

    circle.setVisible('inherit');
    stage.setVisible(true);

    assert.equal(stage.isVisible(), true);
    assert.equal(layer.isVisible(), true);
    assert.equal(circle.isVisible(), true);

    stage.setVisible('inherit');
    layer.setVisible(true);

    assert.equal(stage.isVisible(), true);
    assert.equal(layer.isVisible(), true);
    assert.equal(circle.isVisible(), true);

    layer.setVisible('inherit');
    circle.setVisible(true);

    assert.equal(stage.isVisible(), true);
    assert.equal(layer.isVisible(), true);
    assert.equal(circle.isVisible(), true);

  });

  test('overloaders', function(){
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
        x: 100,
        y: 100,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    circle.x(1);
    assert.equal(circle.x(), 1);

    circle.y(2);
    assert.equal(circle.y(), 2);

    circle.opacity(0.5);
    assert.equal(circle.opacity(), 0.5);

    circle.name('foo');
    assert.equal(circle.name(), 'foo');

    circle.id('bar');
    assert.equal(circle.id(), 'bar');

    circle.rotation(2);
    assert.equal(circle.rotation(), 2);

    circle.scale({x: 2, y: 2});
    assert.equal(circle.scale().x, 2);
    assert.equal(circle.scale().y, 2);

    circle.scaleX(5);
    assert.equal(circle.scaleX(), 5);

    circle.scaleY(8);
    assert.equal(circle.scaleY(), 8);

    circle.skew({x: 2, y: 2});
    assert.equal(circle.skew().x, 2);
    assert.equal(circle.skew().y, 2);

    circle.skewX(5);
    assert.equal(circle.skewX(), 5);

    circle.skewY(8);
    assert.equal(circle.skewY(), 8);

    circle.offset({x: 2, y: 2});
    assert.equal(circle.offset().x, 2);
    assert.equal(circle.offset().y, 2);

    circle.offsetX(5);
    assert.equal(circle.offsetX(), 5);

    circle.offsetY(8);
    assert.equal(circle.offsetY(), 8);

    circle.width(23);
    assert.equal(circle.width(), 23);

    circle.height(11);
    assert.equal(circle.height(), 11);

    circle.listening(false);
    assert.equal(circle.listening(), false);

    circle.visible(false);
    assert.equal(circle.visible(), false);

    circle.transformsEnabled(false);
    assert.equal(circle.transformsEnabled(), false);

    circle.position({x: 6, y: 8});
    assert.equal(circle.position().x, 6);
    assert.equal(circle.position().y, 8);

    // because the height was set to 11, the width
    // is also 11 because the node is a circle
    assert.equal(circle.size().width, 11);
    assert.equal(circle.size().height, 11);
  });

  test('cache shape', function(){
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();
    var circle = new Konva.Circle({
        x: 74,
        y: 74,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true
    });

    group.add(circle);
    layer.add(group);
    stage.add(layer);

    assert.equal(circle._cache.canvas, undefined);

    circle.cache({
        x: -74,
        y: -74,
        width: 148,
        height: 148
    }).offset({
        x: 74,
        y: 74
    });

    assert.notEqual(circle._cache.canvas.scene, undefined);
    assert.notEqual(circle._cache.canvas.hit, undefined);

    layer.draw();


    //document.body.appendChild(circle._cache.canvas.scene._canvas);
    // document.body.appendChild(circle._cache.canvas.hit._canvas);

    showHit(layer);

    //assert.equal(layer.getContext().getTrace(), 'clearRect(0,0,578,200);save();transform(1,0,0,1,74,74);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);drawImage([object HTMLCanvasElement],0,0);restore();');

    //assert.equal(circle._cache.canvas.scene.getContext().getTrace(), 'save();translate(74,74);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();');
  });

  test('cache shape before adding to layer', function(){
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group({
        x : 0,
        y : 0
    });
    var rect = new Konva.Rect({
        x: 35,
        y: 35,
        width: 50,
        height : 50,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        offsetX : 25,
        offsetY: 25,
        rotation : 45,
        draggable: true,
    });
    group.add(rect);


    assert.equal(rect._cache.canvas, undefined);
    group.cache({
        x: 0,
        y: 0,
        width: 148,
        height: 148
    });
    stage.add(layer);

    assert(group._cache.canvas.scene);
    assert(group._cache.canvas.hit);


    layer.add(group);
    layer.draw();
    var shape = stage.getIntersection({
        x : 5,
        y : 5
    });
    assert(!shape, 'no shape (rotate applied)');
    shape = stage.getIntersection({
        x : 35,
        y : 35
    });
    assert.equal(shape, rect, 'rect found');
  });

  test('stage.toObject() when stage contains an image', function(done){
      var imageObj = new Image();
      imageObj.onload = function() {
          var stage = addStage();

          var layer = new Konva.Layer();
          darth = new Konva.Image({
              x: 200,
              y: 60,
              image: imageObj,
              width: 100,
              height: 100,
              offset: {x: 50, y: 30},
              crop: {x: 135, y: 7, width: 167, height: 134},
              draggable: true
          });

          layer.add(darth);
          stage.add(layer);

          assert.equal(stage.toObject().className, 'Stage');

          done();

      };
      imageObj.src = 'assets/darth-vader.jpg';
  });

  test('toObject with extended prototypes', function() {
      var node = new Konva.Circle({
          id: 'foo',
          radius: 10
      });
      Number.prototype.customFunc = function() {};
      console.dir(node.toObject());
      assert.equal(node.toObject().attrs.radius, 10);
      delete Number.prototype.customFunc;
  });


    test('test findAncestor', function() {
        var stage = addStage();
        stage.setAttrs({
            name: 'stage',
            id: 'stage'
        });
        var layer = new Konva.Layer({
            id: 'layer',
            name: 'layer'
        });
        stage.add(layer);

        var group = new Konva.Group({
            id: 'group',
            name: 'group'
        });
        layer.add(group);

        var rect = new Konva.Rect({
            x: 35,
            y: 35,
            width: 50,
            height : 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rect',
        });
        group.add(rect);

        stage.draw();

        assert.equal(!!rect.findAncestor('.null'), false);

        assert.notEqual(rect.findAncestor('.rect'), rect, 'do not find self in ancestors')

        assert.equal(rect.findAncestor('.stage'), stage, 'find stage by name');
        assert.equal(rect.findAncestor('#stage'), stage, 'find stage by id');
        assert.equal(rect.findAncestor('Stage'), stage, 'find stage by node type');

        assert.equal(rect.findAncestor('.layer'), layer);
        assert.equal(rect.findAncestor('#layer'), layer);
        assert.equal(rect.findAncestor('Layer'), layer);

        assert.equal(rect.findAncestor('.group'), group);
        assert.equal(rect.findAncestor('#group'), group);
        assert.equal(rect.findAncestor('Group'), group);

        assert.equal(rect.findAncestor(), null, 'return null if no selector');
    });

});
