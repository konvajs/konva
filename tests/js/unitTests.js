Test.Modules.ANIMATION = {
    /*
     * WARNING: make sure that this is the first unit test that uses
     * animation because it's accessing the global animation object which could
     * be modified by other unit tests
     */
    'ANIMATION - test start and stop': function(containerId) {
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

        test(a.animations.length === 0, 'should be no animations running');

        anim.start();
        test(a.animations.length === 1, 'should be 1 animation running');

        anim.stop();
        test(a.animations.length === 0, 'should be no animations running');

        anim.start();
        test(a.animations.length === 1, 'should be 1 animation running');

        anim.start();
        test(a.animations.length === 1, 'should be 1 animation runningg');

        anim.stop();
        test(a.animations.length === 0, 'should be no animations running');

        anim.stop();
        test(a.animations.length === 0, 'should be no animations running');
    }
};

Test.Modules.GLOBAL = {
    'test Kinetic version number': function(containerId) {
        test(Kinetic.version === 'current', 'Kinetic.version should equal current');
    }
};

Test.Modules.NODE = {
    'set shape and layer opacity to 0.5': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        test(circle.getAbsoluteOpacity() === 0.25, 'abs opacity should be 0.25');
        test(layer.getAbsoluteOpacity() === 0.5, 'abs opacity should be 0.5');
    },
    'listen and don\'t listen': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue'
        });

        var rect2 = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 200,
            height: 50,
            fill: 'red',
            listening: false
        });

        layer.add(rect).add(rect2);
        stage.add(layer);

        test(rect.getListening() === true, 'rect should be listening');
        // test alias
        test(rect.isListening() === true, 'rect should be listening');
        rect.setListening(false);
        test(rect.getListening() === false, 'rect should not be listening');

        test(rect2.getListening() === false, 'rect2 should not be listening');
        rect2.setListening(true);
        test(rect2.getListening() === true, 'rect2 should be listening');
    },
    'listen and don\'t listen with one shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
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
    },
    'group to image': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var rect = new Kinetic.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue'
        });

        var rect2 = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 200,
            height: 50,
            fill: 'red',
            listening: false
        });

        group.add(rect).add(rect2);
        layer.add(group);
        stage.add(layer);

        group.toImage({
            callback: function(imageObj) {
                var img = new Kinetic.Image({
                    image: imageObj,
                    x: 50,
                    y: 50
                });

                layer.add(img).draw();

                var dataUrl = layer.toDataURL();

                warn(dataUrl === dataUrls['group to image'], 'group to image data url is incorrect');
            }
        });

    },
    'test offset attr change': function(containerId) {
        /*
         * the premise of this test to make sure that only
         * root level attributes trigger an attr change event.
         * for this test, we have two offset properties.  one
         * is in the root level, and the other is inside the shadow
         * object
         */
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            offset: [10, 10],
            shadowColor: 'black',
            shadowOffset: [20, 20]
        });

        layer.add(rect);
        stage.add(layer);

        var offsetChange = false;
        var shadowOffsetChange = false;

        rect.on('offsetChange', function(val) {
            offsetChange = true;
        });

        rect.setOffset(1, 2);

        rect.setShadowOffset([3, 4]);

        test(offsetChange, 'offsetChange should have been triggered with setOffset()');
        test(!shadowOffsetChange, 'offsetChange should not have been triggered with setShadow()');
    },
    'simple clone': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
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
    },
    'complex clone': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            offset: [10, 10],
            shadowColor: 'black',
            shadowOffset: [20, 20],
            draggable: true,
            name: 'myRect'
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

        test(clone.getX() === 300, 'clone x should be 300');
        test(clone.getY() === 50, 'clone y should be 50');
        test(clone.getWidth() === 200, 'clone width should be 200');
        test(clone.getHeight() === 50, 'clone height should be 50');
        test(clone.getFill() === 'red', 'clone fill should be red');

        test(rect.getShadowColor() === 'black', 'rect shadow color should be black');
        test(clone.getShadowColor() === 'black', 'clone shadow color should be black');

        clone.setShadowColor('green');

        /*
         * Make sure that when we change a clone object attr that the rect object
         * attr isn't updated by reference
         */

        test(rect.getShadowColor() === 'black', 'rect shadow color should be black');
        test(clone.getShadowColor() === 'green', 'clone shadow color should be green');

        layer.add(rect);
        layer.add(clone);
        stage.add(layer);

        // make sure private ids are different
        test(rect._id !== clone._id, 'rect and clone ids should be different');

        // test user event binding cloning
        test(clicks.length === 0, 'no clicks should have been triggered yet');
        rect.simulate('click');
        test(clicks.toString() === 'myRect', 'only myRect should have been clicked on');
        clone.simulate('click');
        test(clicks.toString() === 'myRect,rectClone', 'click order should be myRect followed by rectClone');
    },
    'clone a group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group({
            x: 50,
            draggable: true,
            name: 'myGroup'
        });

        var rect = new Kinetic.Rect({
            x: 0,
            y: 50,
            width: 200,
            height: 50,
            fill: 'red',
            offset: [10, 10],
            shadowColor: 'black',
            shadowOffset: [20, 20],
            name: 'myRect',
            myAttr: 'group rect'
        });
        var text = new Kinetic.Text({
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

        test(clone.getX() === 300, 'clone x should be 300');
        test(clone.getY() === 0, 'clone y should be 50');
        test(clone.getDraggable() === true, 'clone should be draggable');
        // test alias
        test(clone.isDraggable() === true, 'clone should be draggable');
        test(clone.getName() === 'groupClone', 'clone name should be groupClone');

        test(group.getChildren().length === 2, 'group should have two children');
        test(clone.getChildren().length === 2, 'clone should have two children');
        test(group.get('.myText')[0].getFill() === 'blue', 'group text should be blue');
        test(clone.get('.myText')[0].getFill() === 'blue', 'clone text should be blue');
        clone.get('.myText')[0].setFill('black');
        test(group.get('.myRect')[0].attrs.myAttr === 'group rect', 'group rect should have myAttr: group rect');
        test(clone.get('.myRect')[0].attrs.myAttr === 'group rect', 'clone rect should have myAttr: group rect');
        clone.get('.myRect')[0].setAttrs({
            myAttr: 'clone rect'
        });

        // Make sure that when we change a clone object attr that the rect object
        // attr isn't updated by reference

        test(group.get('.myText')[0].getFill() === 'blue', 'group text should be blue');
        test(clone.get('.myText')[0].getFill() === 'black', 'clone text should be blue');

        test(group.get('.myRect')[0].attrs.myAttr === 'group rect', 'group rect should have myAttr: group rect');
        test(clone.get('.myRect')[0].attrs.myAttr === 'clone rect', 'clone rect should have myAttr: clone rect');

        // make sure private ids are different
        test(group._id !== clone._id, 'rect and clone ids should be different');

        // make sure childrens private ids are different
        test(group.get('.myRect')[0]._id !== clone.get('.myRect')[0]._id, 'group rect and clone rect ids should be different');
        test(group.get('.myText')[0]._id !== clone.get('.myText')[0]._id, 'group text and clone text ids should be different');

        // test user event binding cloning
        test(clicks.length === 0, 'no clicks should have been triggered yet');
        group.simulate('click');
        test(clicks.toString() === 'myGroup', 'only myGroup should have been clicked on');
        clone.simulate('click');
        test(clicks.toString() === 'myGroup,groupClone', 'click order should be myGroup followed by groupClone');

        // test user event binding cloning on children
        test(taps.length === 0, 'no taps should have been triggered yet');
        group.get('.myRect')[0].simulate('tap');
        test(taps.toString() === 'group rect', 'only group rect should have been tapped on');
        clone.get('.myRect')[0].simulate('tap');
        test(taps.toString() === 'group rect,clone rect', 'tap order should be group rect followed by clone rect');

        stage.draw();

        //console.log(layer.toDataURL());

        warn(layer.toDataURL() === dataUrls['clone group'], 'problem cloning group');

    },
    'test on attr change': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 50,
            y: 50,
            width: 200,
            height: 50,
            fill: 'blue',
            shadowOffset: [10, 10],
        });

        var circle = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: [70, 35],
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
            test(evt.oldVal === 200, 'old width should be 200');
            test(evt.newVal === 210, 'new width should be 210');
        });

        rect.on('shadowOffsetChange', function() {
            shadowChanged++;
        });

        circle.on('radiusChange', function() {
            radiusChanged++;
        });

        circle.setRadius(70, 20);

        rect.setSize(210);
        rect.setShadowOffset({
            x: 20
        });

        test(widthChanged === 1, 'width change event was not fired correctly');
        test(shadowChanged === 1, 'shadow change event not fired correctly');
        test(radiusChanged === 1, 'radius change event was not fired correctly');

    },
    'set shape, layer and stage opacity to 0.5': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.setOpacity(0.5);
        stage.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        test(circle.getAbsoluteOpacity() === 0.125, 'abs opacity should be 0.125');
        test(layer.getAbsoluteOpacity() === 0.25, 'abs opacity should be 0.25');
        test(stage.getAbsoluteOpacity() === 0.5, 'abs opacity should be 0.5');
    },
    'hide show layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer1 = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();

        var circle1 = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        var circle2 = new Kinetic.Circle({
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

        test(layer2.isVisible(), 'layer2 should be visible');

        layer2.hide();
        test(!layer2.isVisible(), 'layer2 should be invisible');
        test(layer2.canvas.element.style.display === 'none', 'layer canvas element display should be none');

        layer2.show();
        test(layer2.isVisible(), 'layer2 should be visible');
        test(layer2.canvas.element.style.display === 'block', 'layer canvas element should be block');

    },
    'rotation in degrees': function(containerId) {
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
            strokeWidth: 4,
            rotationDeg: 10
        });

        test(rect.getRotationDeg() === 10, 'rotation should be 10 degrees');
        rect.setRotationDeg(20);
        test(rect.getRotationDeg() === 20, 'rotation should be 20 degrees');
        rect.rotateDeg(20);
        test(rect.getRotationDeg() === 40, 'rotation should be 40 degrees');

        layer.add(rect);
        stage.add(layer);
    },
    'init with position, scale, rotation, then change scale': function(containerId) {
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
            strokeWidth: 4,
            scale: {
                x: 0.5,
                y: 0.5
            },
            rotation: 20 * Math.PI / 180
        });

        test(rect.getPosition().x == 200, 'rect should be at x = 200');
        test(rect.getPosition().y == 100, 'rect should be at y = 100');
        test(rect.getScale().x == 0.5, 'rect x scale should be 0.5');
        test(rect.getScale().y == 0.5, 'rect y scale should be 0.5');
        test(rect.getRotation() == 20 * Math.PI / 180, 'rect should rotated by 20 degrees');

        rect.setScale(2, 0.3);
        test(rect.getScale().x == 2, 'rect x scale should be 2');
        test(rect.getScale().y == 0.3, 'rect y scale should be 0.3');

        layer.add(rect);
        stage.add(layer);
    },
    'clone sprite': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

            var anims = {
                standing: [{
                    x: 0,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 52,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 105,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 158,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 210,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 262,
                    y: 0,
                    width: 49,
                    height: 109
                }],

                kicking: [{
                    x: 0,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 45,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 95,
                    y: 109,
                    width: 63,
                    height: 98
                }, {
                    x: 156,
                    y: 109,
                    width: 70,
                    height: 98
                }, {
                    x: 229,
                    y: 109,
                    width: 60,
                    height: 98
                }, {
                    x: 287,
                    y: 109,
                    width: 41,
                    height: 98
                }]
            };

            //for(var n = 0; n < 50; n++) {
            sprite = new Kinetic.Sprite({
                //x: Math.random() * stage.getWidth() - 30,
                x: 200,
                //y: Math.random() * stage.getHeight() - 50,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: anims,
                index: 0,
                frameRate: Math.random() * 6 + 6,
                frameRate: 10,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 3,
                shadowOffset: [3, 1],
                shadowOpacity: 0.3
            });

            var clone = sprite.clone();
            layer.add(clone);
            stage.add(layer);
            clone.start();
        };
        imageObj.src = '../assets/scorpion-sprite.png';
    },
    'node caching': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var points = [{
            x: 73,
            y: 250
        }, {
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }, {
            x: 500,
            y: 109
        }, {
            x: 499,
            y: 139
        }, {
            x: 342,
            y: 93
        }];

        var poly = new Kinetic.Polygon({
            points: points,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            draggable: true
        });

        group.add(poly);
        layer.add(group);
        stage.add(layer);

        poly.toImage({
            width: 500,
            height: 300,
            callback: function(imageObj) {
                //document.body.appendChild(imageObj)
                test(Kinetic.Type._isElement(imageObj), 'shape toImage() should be an image object');

                var cachedShape = new Kinetic.Image({
                    image: imageObj,
                    draggable: true,
                    stroke: 'red',
                    strokeWidth: 5,
                    x: 50,
                    y: -120

                });

                layer.add(cachedShape);
                layer.draw();

                //console.log(layer.toDataURL());

                cachedShape.createImageHitRegion(function() {

                    layer.draw();
                    //console.log(layer.toDataURL());
                    warn(dataUrls['regular and cached polygon'] === layer.toDataURL(), 'regular and cached polygon layer data url is incorrect');

                });
            }
        });

        showHit(layer);
    },
    'cache shape, group, layer, and stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var rect = new Kinetic.Rect({
            x: 10,
            y: 10,
            width: 50,
            height: 30,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        // cache shape
        rect.toImage({
            x: 8,
            y: 8,
            width: 54,
            height: 34,
            callback: function(imageObj) {
                var cachedShape = new Kinetic.Image({
                    image: imageObj,
                    x: 60,
                    y: 60,
                    draggable: true
                });
                group.add(cachedShape);
                layer.draw();

                // cache group
                group.toImage({
                    x: 8,
                    y: 8,
                    width: 106,
                    height: 86,
                    callback: function(imageObj) {
                        var cachedGroup = new Kinetic.Image({
                            image: imageObj,
                            x: 100,
                            y: 8,
                            draggable: true
                        });
                        group.add(cachedGroup);
                        layer.draw();

                        // cache layer
                        layer.toImage({
                            x: 8,
                            y: 8,
                            width: 200,
                            height: 86,
                            callback: function(imageObj) {

                                var cachedLayer = new Kinetic.Image({
                                    image: imageObj,
                                    x: 190,
                                    y: 8,
                                    draggable: true
                                });
                                group.add(cachedLayer);
                                layer.draw();

                                //var dataUrl = layer.toDataURL();

                                // cache stage

                                stage.toImage({
                                    x: 8,
                                    y: 8,
                                    width: 400,
                                    height: 86,
                                    callback: function(imageObj) {

                                        var cachedStage = new Kinetic.Image({
                                            image: imageObj,
                                            x: 8,
                                            y: 100,
                                            draggable: true
                                        });
                                        group.add(cachedStage);
                                        layer.draw();

                                        var dataUrl = layer.toDataURL();
                                        //console.log(dataUrl);

                                        warn(dataUrl === dataUrls['cache shape, group, layer, and stage'], 'problem caching shape, group, layer, and stage');
                                    }
                                });

                            }
                        });
                    }
                });
            }
        });

        showHit(layer);
    },
    'hide group 2': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var circle1 = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });
        var circle2 = new Kinetic.Circle({
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

        test(group.isVisible(), 'group should be visible');
        test(circle2.isVisible(), 'circle2 should be visible');

        group.hide();
        layer.draw();

        test(!group.isVisible(), 'group should be invisible');
        test(!circle2.isVisible(), 'circle2 should be invisible');
    },
    'add shape with custom attr pointing to self': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        circle = new Kinetic.Circle({
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
    },
    'scale shape by half': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setScale(0.5, 1);
        layer.add(circle);
        stage.add(layer);
    },
    'scale shape by half then back to 1': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setScale(0.5, 1);
        circle.setScale(1, 1);
        layer.add(circle);
        stage.add(layer);
    },
    'set center offset after instantiation': function(containerId) {
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
            stroke: 'blue',
            offset: {
                x: 20,
                y: 20
            }
        });

        layer.add(rect);
        stage.add(layer);

        test(rect.getOffset().x === 20, 'center offset x should be 20');
        test(rect.getOffset().y === 20, 'center offset y should be 20');

        rect.setOffset(40, 40);

        test(rect.getOffset().x === 40, 'center offset x should be 40');
        test(rect.getOffset().y === 40, 'center offset y should be 40');

    },
    'rotation in degrees': function(containerId) {
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
            strokeWidth: 4,
            rotationDeg: 10
        });

        test(rect.getRotationDeg() === 10, 'rotation should be 10 degrees');
        rect.setRotationDeg(20);
        test(rect.getRotationDeg() === 20, 'rotation should be 20 degrees');
        rect.rotateDeg(20);
        test(rect.getRotationDeg() === 40, 'rotation should be 40 degrees');

        layer.add(rect);
        stage.add(layer);
    },
    'get shape name': function(containerId) {
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
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        test(circle.getName() == 'myCircle', 'name should be myCircle');
    },
    'test setting shadow offset': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
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

        rect.setShadowOffset([1, 2]);
        test(rect.getShadowOffset().x === 1, 'shadow offset x should be 1');
        test(rect.getShadowOffset().y === 2, 'shadow offset y should be 2');
        // make sure we still have the other properties
        test(rect.getShadowColor() === 'blue', 'shadow color should still be blue');
        test(rect.getShadowBlur() === 12, 'shadow blur should still be 12');

        rect.setShadowOffset({
            x: 3,
            y: 4
        });
        test(rect.getShadowOffset().x === 3, 'shadow offset x should be 3');
        test(rect.getShadowOffset().y === 4, 'shadow offset y should be 4');

        // test partial setting
        rect.setShadowOffset({
            x: 5
        });
        test(rect.getShadowOffset().x === 5, 'shadow offset x should be 5');
        test(rect.getShadowOffset().y === 4, 'shadow offset y should be 4');

        // test partial setting
        rect.setShadowOffset({
            y: 6
        });
        test(rect.getShadowOffset().x === 5, 'shadow offset x should be 5');
        test(rect.getShadowOffset().y === 6, 'shadow offset y should be 6');

    },
    'test setOffset': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect);
        stage.add(layer);

        rect.setOffset(1, 2);
        test(rect.getOffset().x === 1, 'center offset x should be 1');
        test(rect.getOffset().y === 2, 'center offset y should be 2');

        rect.setOffset([3, 4]);
        test(rect.getOffset().x === 3, 'center offset x should be 3');
        test(rect.getOffset().y === 4, 'center offset y should be 4');

        rect.setOffset({
            x: 5,
            y: 6
        });
        test(rect.getOffset().x === 5, 'center offset x should be 5');
        test(rect.getOffset().y === 6, 'center offset y should be 6');

        rect.setOffset({
            x: 7
        });
        test(rect.getOffset().x === 7, 'center offset x should be 7');
        test(rect.getOffset().y === 6, 'center offset y should be 6');

        rect.setOffset({
            y: 8
        });
        test(rect.getOffset().x === 7, 'center offset x should be 7');
        test(rect.getOffset().y === 8, 'center offset y should be 8');

    },
    'test setPosition and move': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect);
        stage.add(layer);

        rect.setPosition(1, 2);
        test(rect.getPosition().x === 1, 'rect x should be 1');
        test(rect.getPosition().y === 2, 'rect y should be 2');

        rect.setPosition([3, 4]);
        test(rect.getPosition().x === 3, 'rect x should be 3');
        test(rect.getPosition().y === 4, 'rect y should be 4');

        rect.setPosition({
            x: 5,
            y: 6
        });
        test(rect.getPosition().x === 5, 'rect x should be 5');
        test(rect.getPosition().y === 6, 'rect y should be 6');

        rect.setPosition({
            x: 7
        });
        test(rect.getPosition().x === 7, 'rect x should be 7');
        test(rect.getPosition().y === 6, 'rect y should be 6');

        rect.setPosition({
            y: 8
        });
        test(rect.getPosition().x === 7, 'rect x should be 7');
        test(rect.getPosition().y === 8, 'rect y should be 8');

        rect.move(10);
        test(rect.getPosition().x === 17, 'rect x should be 17');
        test(rect.getPosition().y === 18, 'rect y should be 18');

    },
    'test setScale': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
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

        rect.setScale(2, 3);
        test(rect.getScale().x === 2, 'rect scale x should be 2');
        test(rect.getScale().y === 3, 'rect scale x should be 3');

        rect.setScale(4);
        test(rect.getScale().x === 4, 'rect scale x should be 4');
        test(rect.getScale().y === 4, 'rect scale x should be 4');

        rect.setScale([5, 6]);
        test(rect.getScale().x === 5, 'rect scale x should be 5');
        test(rect.getScale().y === 6, 'rect scale x should be 6');

        rect.setScale([7, 8, 999, 999]);
        test(rect.getScale().x === 7, 'rect scale x should be 7');
        test(rect.getScale().y === 8, 'rect scale x should be 8');

        rect.setScale({
            x: 9,
            y: 10
        });
        test(rect.getScale().x === 9, 'rect scale x should be 9');
        test(rect.getScale().y === 10, 'rect scale x should be 10');

        rect.setScale({
            x: 11
        });
        test(rect.getScale().x === 11, 'rect scale x should be 11');
        test(rect.getScale().y === 10, 'rect scale x should be 10');

        rect.setScale({
            y: 12
        });
        test(rect.getScale().x === 11, 'rect scale x should be 11');
        test(rect.getScale().y === 12, 'rect scale x should be 12');

    },
    'test config scale': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect1 = new Kinetic.Rect({
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

        var rect2 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: 2
        });

        var rect3 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: [2, 3]
        });

        var rect4 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {
                x: 2
            }
        });

        var rect5 = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            scale: {
                y: 2
            }
        });

        layer.add(rect1).add(rect2).add(rect3).add(rect4).add(rect5);
        stage.add(layer);

        test(rect1.getScale().x === 2, 'rect1 scale x should be 2');
        test(rect1.getScale().y === 3, 'rect1 scale y should be 3');

        test(rect2.getScale().x === 2, 'rect2 scale x should be 2');
        test(rect2.getScale().y === 2, 'rect2 scale y should be 2');

        test(rect3.getScale().x === 2, 'rect3 scale x should be 2');
        test(rect3.getScale().y === 3, 'rect3 scale y should be 3');

        test(rect4.getScale().x === 2, 'rect4 scale x should be 2');
        test(rect4.getScale().y === 1, 'rect4 scale y should be 1');

        test(rect5.getScale().x === 1, 'rect5 scale x should be 1');
        test(rect5.getScale().y === 2, 'rect5 scale y should be 2');
    },
    'test config position': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect1 = new Kinetic.Rect({
            x: 1,
            y: 2,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect2 = new Kinetic.Rect({
            x: 3,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect3 = new Kinetic.Rect({
            y: 4,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var rect4 = new Kinetic.Rect({
            width: 100,
            height: 50,
            fill: 'red'
        });

        layer.add(rect1).add(rect2).add(rect3).add(rect4);
        stage.add(layer);

        test(rect1.getPosition().x === 1, 'rect1 x should be 1');
        test(rect1.getPosition().y === 2, 'rect1 y should be 2');

        test(rect2.getPosition().x === 3, 'rect2 x should be 3');
        test(rect2.getPosition().y === 0, 'rect2 y should be 0');

        test(rect3.getPosition().x === 0, 'rect3 x should be 0');
        test(rect3.getPosition().y === 4, 'rect3 y should be 4');

        test(rect4.getPosition().x === 0, 'rect4 x should be 0');
        test(rect4.getPosition().y === 0, 'rect4 y should be 0');
    },
    'test getPosition and getAbsolutePosition for shape inside transformed stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
            //rotationDeg: 60
            //rotationDeg: Math.PI / 3
        });

        layer.add(rect);
        stage.add(layer);

        //stage.rotateDeg(20);

        //console.log(rect.getAbsoluteTransform().getTranslation())

        stage.rotate(Math.PI / 3);
        stage.setScale(0.5);

        stage.draw();

        test(rect.getPosition().x === 200, 'rect position x should be 200');
        test(rect.getPosition().y === 20, 'rect position y should be 20');

        test(Math.round(rect.getAbsolutePosition().x) === 41, 'rect absolute position x should be about 41');
        test(Math.round(rect.getAbsolutePosition().y) === 92, 'rect absolute position y should be about 92');
    },
    'test getPosition and getAbsolutePosition for transformed parent with center offset': function(containerId) {
        var side = 100;
        var diagonal = Math.sqrt(side * side * 2);

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId',
            rotationDeg: 45,
            offset: [side / 2, side / 2],
            x: diagonal / 2,
            y: diagonal / 2
        });
        var rect = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: side,
            height: side,
            fill: 'red',
            name: 'rectName',
            id: 'rectId'
        });
        var marker = new Kinetic.Rect({
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

        test(Math.round(marker.getAbsolutePosition().x) === Math.round(diagonal), 'marker absolute position x should be about ' + Math.round(diagonal) + ' but is about ' + Math.round(marker.getAbsolutePosition().x));
        test(Math.round(marker.getAbsolutePosition().y) === Math.round(diagonal / 2), 'marker absolute position y should be about ' + Math.round(diagonal / 2) + ' but is about ' + Math.round(marker.getAbsolutePosition().y));
    },
    'translate, rotate, scale shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Rect({
            x: 100,
            y: 100,
            rotationDeg: 20,
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
    },
    'test isListening': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 100,
            y: 100,
            rotationDeg: 20,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);

        test(rect.isListening(), 'rect should be listening');

        rect.setListening(false);
        test(!rect.isListening(), 'rect should not be listening');

        rect.setListening(true);
        test(rect.isListening(), 'rect should be listening');

        layer.setListening(false);
        test(!rect.isListening(), 'rect should not be listening because layer is not listening');

        layer.setListening(true);
        test(rect.isListening(), 'rect should be listening');

        stage.setListening(false);
        test(!rect.isListening(), 'rect should not be listening because stage is not listening');
    },
    'test simulate and fire event': function(containerId) {
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
        // simulated event
        circle.simulate('click');

        test(clicks.toString() == 'circle,layer', 'problem with simulate');

        // synthetic event
        circle.fire('click');

        test(clicks.toString() == 'circle,layer,circle', 'problem with fire');

        // test custom event
        circle.fire('customEvent', {
            foo: 'bar'
        });

        test(foo === 'bar', 'problem with customEvent param passing');

    },
    'add remove event': function(containerId) {
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
            name: 'myCircle'
        });

        /*
         * test regular on and off
         */
        test(circle.eventListeners['click'] === undefined, 'circle should have no click listeners');

        circle.on('click', function() {
        });
        test(circle.eventListeners['click'].length === 1, 'circle should have 1 click listener');

        circle.on('click', function() {
        });
        test(circle.eventListeners['click'].length === 2, 'circle should have 2 click listeners');

        circle.off('click');
        test(circle.eventListeners['click'] === undefined, 'circle should have no click listeners');

        /*
         * test name spacing
         */
        circle.on('click.foo', function() {
        });
        test(circle.eventListeners['click'].length === 1, 'circle should have 1 click listener');

        circle.on('click.foo', function() {
        });
        test(circle.eventListeners['click'].length === 2, 'circle should have 2 click listeners');
        circle.on('click.bar', function() {
        });
        test(circle.eventListeners['click'].length === 3, 'circle should have 3 click listeners');

        circle.off('click.foo');
        test(circle.eventListeners['click'].length === 1, 'circle should have 1 click listener');

        circle.off('click.bar');
        test(circle.eventListeners['click'] === undefined, 'circle should have no click listeners');

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
        test(circle.eventListeners['click'].length === 3, 'circle should have 3 click listeners');
        test(circle.eventListeners['touch'].length === 2, 'circle should have 2 touch listeners');
        circle.off('.foo');
        test(circle.eventListeners['click'].length === 1, 'circle should have 1 click listener');
        test(circle.eventListeners['touch'].length === 1, 'circle should have 2 touch listeners');

        circle.off('.bar');
        test(circle.eventListeners['click'] === undefined, 'circle should have no click listeners');
        test(circle.eventListeners['touch'] === undefined, 'circle should have no touch listeners');

        stage.add(layer);
        layer.add(circle);
        layer.draw();
    },
    'simulate event bubble': function(containerId) {
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

        circle.simulate('click');

        test(clicks[0] === 'circle', 'circle event should be fired first');
        test(clicks[1] === 'layer', 'layer event should be fired second');
    },
    'move shape, group, and layer, and then get absolute position': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var circle = new Kinetic.Circle({
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

        circle.setPosition(100, 0);
        group.setPosition(100, 0);
        layer.setPosition(100, 0);

        // test relative positions
        test(circle.getPosition().x == 100, 'circle should be at x = 100');
        test(group.getPosition().x == 100, 'group should be at x = 100');
        test(layer.getPosition().x == 100, 'layer should be at x = 100');

        // test absolute positions
        test(circle.getAbsolutePosition().x == 300, 'circle should be at x = 300');
        test(group.getAbsolutePosition().x == 200, 'group should be at x = 200');
        test(layer.getAbsolutePosition().x == 100, 'layer should be at x = 100');

        layer.draw();
    },
    'scale layer, rotate group, position shape, and then get absolute position': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            scale: {
                x: 2,
                y: 2
            }
        });
        var group = new Kinetic.Group({
            x: 100,
            rotationDeg: 90
        });

        var rect = new Kinetic.Rect({
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
        test(rect.getAbsolutePosition().x == 180, 'rect should be at x = 180');
        test(rect.getAbsolutePosition().y == 100, 'rect should be at y = 100');

        layer.draw();
    },
    'hide show circle': function(containerId) {
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
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        test(circle.isVisible() === true, 'circle should be visible');

        circle.hide();
        layer.draw();

        test(circle.isVisible() === false, 'circle should be hidden');

        circle.show();
        layer.draw();

        test(circle.isVisible() === true, 'circle should be visible');
    },
    'set shape opacity to 0.5': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);
    },
    'set shape opacity to 0.5 then back to 1': function(containerId) {
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
            strokeWidth: 4
        });

        circle.setOpacity(0.5);
        layer.add(circle);
        stage.add(layer);

        test(circle.getAbsoluteOpacity() === 0.5, 'abs opacity should be 0.5');

        circle.setOpacity(1);
        layer.draw();

        test(circle.getAbsoluteOpacity() === 1, 'abs opacity should be 1');
    },
    'get absolute z index': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group1 = new Kinetic.Group();
        var group2 = new Kinetic.Group();
        var group3 = new Kinetic.Group();
        var group4 = new Kinetic.Group();

        var shape1 = new Kinetic.Circle({
            x: 150,
            y: stage.getHeight() / 2,
            radius: 40,
            fill: 'green'
        });

        var shape2 = new Kinetic.Circle({
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

        test(stage.getAbsoluteZIndex() === 0, 'stage abs zindex should be 0');
        //console.log(layer.getAbsoluteZIndex());
        test(layer.getAbsoluteZIndex() === 1, 'layer abs zindex should be 1');
        test(group1.getAbsoluteZIndex() === 2, 'group1 abs zindex should be 2');
        test(group2.getAbsoluteZIndex() === 3, 'group2 abs zindex should be 3');
        test(shape1.getAbsoluteZIndex() === 4, 'shape1 abs zindex should be 4');
        test(group3.getAbsoluteZIndex() === 5, 'group3 abs zindex should be 5');
        test(group4.getAbsoluteZIndex() === 6, 'group4 abs zindex should be 6');
        test(shape2.getAbsoluteZIndex() === 7, 'shape2 abs zindex should be 7');
    },
    'JPEG toDataURL() Not Hiding Lower Layers with Black': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer1 = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();

        layer1.add(new Kinetic.Rect({
            x: 10,
            y: 10,
            width: 25,
            height: 15,
            fill: 'red'
        }));
        layer2.add(new Kinetic.Rect({
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
                    layer2.add(new Kinetic.Image({
                        x: 200,
                        y: 10,
                        image: imageObj
                    }));
                    layer2.draw();
                };
                imageObj.src = url;
            }
        })
    },
    'serialize stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
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

        var expectedJson = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"radius":70,"visible":true,"listening":true,"name":"myCircle","opacity":1,"x":289,"y":100,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":true,"fill":"green","stroke":"black","strokeWidth":4},"nodeType":"Shape","shapeType":"Circle"}]}]}]}';

        //console.log(stage.toJSON())

        //console.log(expectedJson);
        //test(stage.toJSON() === expectedJson, 'problem with serialization');
    },
    'serialize shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
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

        var expectedJson = '{"attrs":{"radius":70,"visible":true,"listening":true,"name":"myCircle","opacity":1,"x":289,"y":100,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":true,"fill":"green","stroke":"black","strokeWidth":4},"nodeType":"Shape","shapeType":"Circle"}';

        //console.log(circle.toJSON())

        //console.log(expectedJson);
        //test(circle.toJSON() === expectedJson, 'problem with serialization');
    },
    'load stage using json': function(containerId) {
        var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"radius":70,"visible":true,"listening":true,"name":"myCircle","opacity":1,"x":289,"y":100,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":true,"fill":"green","stroke":"black","strokeWidth":4},"nodeType":"Shape","shapeType":"Circle"}]}]}]}';
        var stage = Kinetic.Node.create(json, containerId);

        //test(stage.toJSON() === json, "problem loading stage with json");
    },
    'serialize stage with custom shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var drawTriangle = function(canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        };
        var triangle = new Kinetic.Shape({
            drawFunc: drawTriangle,
            fill: "#00D2FF",
            stroke: "black",
            strokeWidth: 4,
            id: 'myTriangle'
        });

        group.add(triangle);
        layer.add(group);
        stage.add(layer);

        var startDataUrl = layer.toDataURL();

        warn(startDataUrl === dataUrls['serialize stage with custom shape'], 'start data url is incorrect');
        //test(triangle.getId() === 'myTriangle', 'triangle id should be myTriangle');

        //console.log(stage.toJSON());
        var expectedJson = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false,"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';

        //console.log(stage.toJSON())
        //test(stage.toJSON() === expectedJson, "problem serializing stage with custom shape");

        /*
         * test redrawing layer after serialization
         * drawing should be the same
         */
        layer.draw();

        var endDataUrl = layer.toDataURL();
        warn(endDataUrl === dataUrls['serialize stage with custom shape'], 'end data url is incorrect');

    },
    'load stage with custom shape using json': function(containerId) {
        var drawTriangle = function(canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        };
        var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false,"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';

        var stage = Kinetic.Node.create(json, containerId);

        stage.get('#myTriangle').apply('setDrawFunc', drawTriangle);

        stage.draw();
        //console.log(stage.toJSON());
        //test(stage.toJSON() === json, "problem loading stage with custom shape json");
    },
    'serialize stage with an image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
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
            var expectedJson = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":200,"y":60,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":50,"y":150},"draggable":false,"id":"darth","width":438,"height":300},"nodeType":"Shape","shapeType":"Image"}]}]}';
            //console.log(stage.toJSON())
            //test(stage.toJSON() === expectedJson, 'problem with serializing stage with image');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'load stage with an image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":200,"y":60,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":50,"y":150},"draggable":false,"id":"darth","width":438,"height":300},"nodeType":"Shape","shapeType":"Image"}]}]}';
            var stage = Kinetic.Node.create(json, containerId);

            //test(stage.toJSON(), json, 'problem loading stage json with image');
            stage.get('#darth').apply('setImage', imageObj);
            stage.draw();
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'remove shape': function(containerId) {
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
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        test(layer.children.length === 1, 'layer should have 1 children');

        circle.remove();

        test(layer.children.length === 0, 'layer should have 0 children');

        layer.draw();

        test(circle.getParent() === undefined, 'circle parent should be undefined');
    },
    'destroy shape': function(containerId) {
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
            name: 'myCircle'
        });

        layer.add(circle);
        stage.add(layer);

        test(layer.children.length === 1, 'layer should have 1 children');

        circle.destroy();

        test(layer.children.length === 0, 'layer should have 0 children');

        layer.draw();

        test(circle.getParent() === undefined, 'circle parent should be undefined');
    },
    'destroy shape without adding its parent to stage': function(containerId) {
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
            id: 'myCircle'
        });

        var go = Kinetic.Global;

        layer.add(circle);

        var node = stage.get('#myCircle')[0];

        test(node === undefined, 'node should be undefined');

        circle.destroy();

    },
    'destroy layer with shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            name: 'myLayer'
        });
        var circle = new Kinetic.Circle({
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

        test(stage.children.length === 1, 'stage should have 1 children');
        test(stage.get('.myLayer')[0] !== undefined, 'layer should exist');
        test(stage.get('.myCircle')[0] !== undefined, 'circle should exist');

        layer.destroy();

        test(stage.children.length === 0, 'stage should have 0 children');
        test(stage.get('.myLayer')[0] === undefined, 'layer should not exist');
        test(stage.get('.myCircle')[0] === undefined, 'circle should not exist');

        stage.draw();
    },
    'destroy stage with layer and shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            name: 'myLayer'
        });
        var circle = new Kinetic.Circle({
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

        test(layer.getParent() === undefined, 'layer parent should be undefined');
        test(circle.getParent() === undefined, 'circle parent should be undefined');
        test(stage.children.length === 0, 'stage children length should be 0');
        test(layer.children.length === 0, 'layer children length should be 0');
    },
    'destroy group with shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            name: 'myLayer'
        });
        var group = new Kinetic.Group({
            name: 'myGroup'
        });

        var circle = new Kinetic.Circle({
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

        test(layer.getChildren().length === 1, 'layer should have 1 children');
        test(stage.get('.myGroup')[0] !== undefined, 'group should exist');
        test(stage.get('.myCircle')[0] !== undefined, 'circle should exist');

        group.destroy();

        test(layer.children.length === 0, 'layer should have 0 children');
        test(stage.get('.myGroup')[0] === undefined, 'group should not exist');
        test(stage.get('.myCircle')[0] === undefined, 'circle should not exist');

        stage.draw();
    },
    'destroy layer with no shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
        layer.destroy();

        test(stage.children.length === 0, 'stage should have 0 children');
    },
    'destroy shape multiple times': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape1 = new Kinetic.Circle({
            x: 150,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        var shape2 = new Kinetic.Circle({
            x: 250,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        layer.add(shape1);
        layer.add(shape2);
        stage.add(layer);

        test(layer.getChildren().length === 2, 'layer should have two children');

        shape1.destroy();
        shape1.destroy();

        test(layer.getChildren().length === 1, 'layer should have two children');

        layer.draw();

    },
    'remove layer multiple times': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer1 = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();

        var shape1 = new Kinetic.Circle({
            x: 150,
            y: 100,
            radius: 50,
            fill: 'green',
            name: 'myCircle'
        });

        var shape2 = new Kinetic.Circle({
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

        test(stage.getChildren().length === 2, 'stage should have two children');

        layer1.remove();
        layer1.remove();

        test(stage.getChildren().length === 1, 'stage should have one child');

        stage.draw();

    },
    'destroy shape by id or name': function(containerId) {
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
            id: 'myCircle2'
        });

        var rect = new Kinetic.Rect({
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
        var go = Kinetic.Global;

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        test(go.ids.myCircle2._id === circle._id, 'circle not in ids hash');
        test(go.names.myRect2[0]._id === rect._id, 'rect not in names hash');
        test(Kinetic.Global.shapes[circleColorKey]._id === circle._id, 'circle color key should be in shapes hash');
        test(Kinetic.Global.shapes[rectColorKey]._id === rect._id, 'rect color key should be in shapes hash');

        circle.destroy();

        test(go.ids.myCircle2 === undefined, 'circle still in hash');
        test(go.names.myRect2[0]._id === rect._id, 'rect not in names hash');
        test(Kinetic.Global.shapes[circleColorKey] === undefined, 'circle color key should not be in shapes hash');
        test(Kinetic.Global.shapes[rectColorKey]._id === rect._id, 'rect color key should be in shapes hash');

        rect.destroy();

        test(go.ids.myCircle2 === undefined, 'circle still in hash');
        test(go.names.myRect2 === undefined, 'rect still in hash');
        test(Kinetic.Global.shapes[circleColorKey] === undefined, 'circle color key should not be in shapes hash');
        test(Kinetic.Global.shapes[rectColorKey] === undefined, 'rect color key should not be in shapes hash');
    },
    'destroy node mid transition': function(containerId) {
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

        rect.transitionTo({
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
          /*
                 * TODO: this method fails every now and then, seemingly
                 * from a race condition.  need to investigate
                 */
            //test(rect.transAnim.isRunning(), 'rect trans should be running before destroying it');
            rect.destroy();
            //test(!rect.transAnim.isRunning(), 'rect trans should not be running after destroying it');
            layer.draw();
            warn(layer.toDataURL() === dataUrls['cleared'], 'transitioning rectangle should have been destroyed and removed from the screen');
        }, 1000);
    },
    'hide stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            rotationDeg: 60,
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

    },
    'hide layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            rotationDeg: 60,
            scale: {
                x: 2,
                y: 1
            }
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        layer.hide();
        layer.draw();
        
        console.log(layer.toDataURL());
        
        test(layer.toDataURL() === dataUrls['cleared'], 'layer is still visible');
    },
    'hide group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var rect = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true,
            rotationDeg: 60,
            scale: {
                x: 2,
                y: 1
            }
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        group.hide();
        layer.draw();

        test(layer.toDataURL() === dataUrls['cleared'], 'group is still visible');
    }
};

Test.Modules.STAGE = {
    'instantiate stage with id': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
    },
    'instantiate stage with dom element': function(containerId) {
        var containerDom = document.getElementById(containerId);
        var stage = new Kinetic.Stage({
            container: containerDom,
            width: 578,
            height: 200
        });
    },
    'set stage size': function(containerId) {
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
            name: 'myCircle'
        });

        test(stage.getSize().width === 578 && stage.getSize().height === 200, 'stage size should be 578 x 200');
        stage.setSize(1, 2);
        test(stage.getSize().width === 1 && stage.getSize().height === 2, 'stage size should be 1 x 2');
        stage.setSize(3);
        test(stage.getSize().width === 3 && stage.getSize().height === 3, 'stage size should be 3 x 3');
        stage.setSize({
            width: 4,
            height: 5
        });
        test(stage.getSize().width === 4 && stage.getSize().height === 5, 'stage size should be 4 x 5');
        stage.setSize({
            width: 6
        });
        test(stage.getSize().width === 6 && stage.getSize().height === 5, 'stage size should be 6 x 5');
        stage.setSize({
            height: 7
        });
        test(stage.getSize().width === 6 && stage.getSize().height === 7, 'stage size should be 6 x 7');
        stage.setSize([8, 9]);
        test(stage.getSize().width === 8 && stage.getSize().height === 9, 'stage size should be 8 x 9');
        stage.setSize([1, 1, 10, 11]);
        test(stage.getSize().width === 10 && stage.getSize().height === 11, 'stage size should be 10 x 11');

        layer.add(circle);
        stage.add(layer);

        stage.setSize(333, 155);

        test(stage.getSize().width === 333, 'stage width should be 333');
        test(stage.getSize().height === 155, 'stage height should be 155');
        test(stage.getContent().style.width === '333px', 'content width should be 333');
        test(stage.getContent().style.height === '155px', 'content height should be 155px');
        test(layer.getCanvas().element.width === 333, 'layer canvas element width should be 333');
        test(layer.getCanvas().element.height === 155, 'layer canvas element width should be 155');
    },
    'get stage DOM': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        test(stage.getContent().className === 'kineticjs-content', 'stage DOM class name is wrong');
    },
    'test getIntersections': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();

        var redCircle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            id: 'redCircle'
        });

        var greenCircle = new Kinetic.Circle({
            x: 300,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            id: 'greenCircle'
        });

        layer.add(redCircle);
        layer.add(greenCircle);
        stage.add(layer);

        // test individual shapes
        test(stage.getIntersections(266, 114).length === 1, '17) getIntersections should return one shape');
        test(stage.getIntersections(266, 114)[0].getId() === 'greenCircle', '19) first intersection should be greenCircle');

        test(stage.getIntersections(414, 115).length === 1, '18) getIntersections should return one shape');
        test(stage.getIntersections(414, 115)[0].getId() === 'redCircle', '20) first intersection should be redCircle');

        test(stage.getIntersections(350, 118).length === 2, '1) getIntersections should return two shapes');
        test(stage.getIntersections(350, 118)[0].getId() === 'redCircle', '2) first intersection should be redCircle');
        test(stage.getIntersections(350, 118)[1].getId() === 'greenCircle', '3) second intersection should be greenCircle');

        // hide green circle.  make sure only red circle is in result set
        greenCircle.hide();
        layer.draw();

        test(stage.getIntersections(350, 118).length === 1, '4) getIntersections should return one shape');
        test(stage.getIntersections(350, 118)[0].getId() === 'redCircle', '5) first intersection should be redCircle');

        // show green circle again.  make sure both circles are in result set
        greenCircle.show();
        layer.draw();

        test(stage.getIntersections(350, 118).length === 2, '6) getIntersections should return two shapes');
        test(stage.getIntersections(350, 118)[0].getId() === 'redCircle', '7) first intersection should be redCircle');
        test(stage.getIntersections(350, 118)[1].getId() === 'greenCircle', '8) second intersection should be greenCircle');

        // hide red circle.  make sure only green circle is in result set
        redCircle.hide();
        layer.draw();

        test(stage.getIntersections(350, 118).length === 1, '9) getIntersections should return one shape');
        test(stage.getIntersections(350, 118)[0].getId() === 'greenCircle', '10) first intersection should be greenCircle');

        // show red circle again.  make sure both circles are in result set
        redCircle.show();
        layer.draw();

        test(stage.getIntersections(350, 118).length === 2, '11) getIntersections should return two shapes');
        test(stage.getIntersections(350, 118)[0].getId() === 'redCircle', '12) first intersection should be redCircle');
        test(stage.getIntersections(350, 118)[1].getId() === 'greenCircle', '13) second intersection should be greenCircle');

        // test from layer
        test(layer.getIntersections(350, 118).length === 2, '14) getIntersections should return two shapes');
        test(layer.getIntersections(350, 118)[0].getId() === 'redCircle', '15) first intersection should be redCircle');
        test(layer.getIntersections(350, 118)[1].getId() === 'greenCircle', '16) second intersection should be greenCircle');

    },
    'scale stage after add layer': function(containerId) {
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
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);

        stage.setScale(0.5);

        test(stage.getScale().x === 0.5, 'stage scale x should be 0.5');
        test(stage.getScale().y === 0.5, 'stage scale y should be 0.5');
        stage.draw();
    },
    'scale stage before add shape': function(containerId) {
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
            strokeWidth: 4
        });

        stage.setScale(0.5);

        test(stage.getScale().x === 0.5, 'stage scale x should be 0.5');
        test(stage.getScale().y === 0.5, 'stage scale y should be 0.5');

        layer.add(circle);
        stage.add(layer);
    },
    'scale stage with no shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        stage.add(layer);
        stage.setScale(0.5);

        stage.draw();
    },
    'test stage.getStage()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        test(stage.getStage() !== undefined, 'stage is undefined');

        //console.log(stage.getStage());
    },
    'test stage.getDragLayer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        
        test(stage.getDragLayer().getCanvas().getElement().className === 'kinetic-drag-and-drop-layer', 'problem with stage.getDragLayer');


    }
};
Test.Modules.CONTAINER = {
    'use clipping function': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            draggable: true
        });
        var layer = new Kinetic.Layer({
            clipFunc: function(canvas) {
                var context = canvas.getContext();
                context.rect(0, 0, 400, 100);
            } 
        });
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
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
    },
    'add layer then group then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(group);
        group.add(circle);
        layer.draw();
    },
    'add shape then stage then layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        group.add(circle);
        stage.add(layer);
        layer.add(group);
        layer.draw();
    },
    'select shape by id and name': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer({
            id: 'myLayer'
        });
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            id: 'myCircle'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myRect'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var node;
        node = stage.get('#myCircle')[0];
        test(node.shapeType === 'Circle', 'shape type should be Circle');
        node = layer.get('.myRect')[0];
        test(node.shapeType === 'Rect', 'shape type should be rect');
        node = layer.get('#myLayer')[0];
        test(node === undefined, 'node should be undefined');
        node = stage.get('#myLayer')[0];
        test(node.nodeType === 'Layer', 'node type should be Layer');

    },
    'set x on an array of nodes': function(containerId) {
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
            name: 'myShape'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var shapes = layer.get('.myShape');

        test(shapes.length === 2, 'shapes array should have 2 elements');

        shapes.apply('setX', 200);

        layer.draw();

        shapes.each(function() {
            test(this.getX() === 200, 'shape x should be 200');
        });
    },
    'set fill on array by Shape-selector': function(containerId) {
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
            name: 'myShape'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var shapes = layer.get('Shape');

        test(shapes.length === 2, 'shapes array should have 2 elements');

        shapes.apply('setFill', 'gray');

        layer.draw();

        shapes.each(function() {
            test(this.getFill() === 'gray', 'shape x should be 200');
        });
    },
    'add listener to an array of nodes': function(containerId) {
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
            name: 'myShape'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myShape'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        var shapes = layer.get('.myShape');

        test(shapes.length === 2, 'shapes array should have 2 elements');
        var a = 0;
        shapes.on('mouseover', function() {
            a++;
        });
        circle.simulate('mouseover');
        test(a === 1, 'listener should have fired for circle');
        rect.simulate('mouseover');
        test(a === 2, 'listener should have fired for rect');
    },
    'test ids and names hashes': function(containerId) {
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
            id: 'myCircle3'
        });

        var rect = new Kinetic.Rect({
            x: 300,
            y: 100,
            width: 100,
            height: 50,
            fill: 'purple',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myRect3'
        });

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);
        
        var go = Kinetic.Global;

        test(go.ids['myCircle3'].getId() === 'myCircle3', 'circle id not in ids hash');
        test(go.names['myRect3'][0].getName() === 'myRect3', 'rect name not in names hash');

        circle.setId('newCircleId');
        test(go.ids['newCircleId'] !== undefined, 'circle not in ids hash');
        test(go.ids['myCircle3'] === undefined, 'old circle id key is still in ids hash');

        rect.setName('newRectName');
        test(go.names['newRectName'][0] !== undefined, 'new rect name not in names hash');
        test(go.names['myRect3'] === undefined, 'old rect name is still in names hash');
    },
    'add layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
    },
    'remove all children from layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle1 = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        var circle2 = new Kinetic.Circle({
            x: 300,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle1);
        layer.add(circle2);
        stage.add(layer);

        test(layer.children.length === 2, 'layer should have 2 children');

        layer.removeChildren();
        layer.draw();

        test(layer.children.length === 0, 'layer should have 0 children');
    },
    'add group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var circle = new Kinetic.Circle({
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
    },
    'create two groups, move first group': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var greenLayer = new Kinetic.Layer();
        var blueLayer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var greencircle = new Kinetic.Circle({
            x: stage.getWidth() / 2 - 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        var bluecircle = new Kinetic.Circle({
            x: stage.getWidth() / 2 + 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        greenGroup.add(greencircle);
        blueGroup.add(bluecircle);
        greenLayer.add(greenGroup);
        blueLayer.add(blueGroup);
        stage.add(greenLayer);
        stage.add(blueLayer);

        blueLayer.removeChildren();
        var blueGroup2 = new Kinetic.Group();
        var bluecircle2 = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });
        blueGroup2.add(bluecircle2);
        blueLayer.add(blueGroup2);
        blueLayer.draw();
        blueGroup2.setPosition(100, 0);
        blueLayer.draw();
    },
    'node type selector': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var fooLayer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var blue = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'blue'
        });

        var red = new Kinetic.Rect({
            x: 250,
            y: 100,
            width: 100,
            height: 50,
            fill: 'red'
        });

        group.add(red);
        layer.add(blue);
        layer.add(group);
        stage.add(layer);
        stage.add(fooLayer);

        test(stage.get('Shape').length === 2, 'stage should have 2 shapes');
        test(layer.get('Shape').length === 2, 'layer should have 2 shapes');
        test(group.get('Shape').length === 1, 'layer should have 2 shapes');

        test(stage.get('Layer').length === 2, 'stage should have 2 layers');
        test(stage.get('Group').length === 1, 'stage should have 1 group');

        test(layer.get('Group').length === 1, 'layer should have 1 group');
        test(layer.get('Shape').length === 2, 'layer should have 2 shapes');
        test(layer.get('Layer').length === 0, 'layer should have 0 layers');

        test(fooLayer.get('Group').length === 0, 'layer should have 0 groups');
        test(fooLayer.get('Shape').length === 0, 'layer should have 0 shapes');

        test(group.get('Shape').length === 1, 'group should have 1 shape');
        test(group.get('Layer').length === 0, 'group should have 0 layers');
        test(group.get('Group').length === 0, 'group should have 0 groups');

    },
    'node and shape type selector': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var layer2 = new Kinetic.Layer();
        var fooLayer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var blue = new Kinetic.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'blue'
        });

        var red = new Kinetic.Rect({
            x: 150,
            y: 75,
            width: 100,
            height: 50,
            fill: 'red'
        });

        var green = new Kinetic.Rect({
            x: 200,
            y: 100,
            width: 100,
            height: 50,
            fill: 'green'
        });

        var blueCircle = new Kinetic.Circle({
            x: 350,
            y: 75,
            radius: 40,
            fill: 'blue'
        });

        var redCircle = new Kinetic.Circle({
            x: 400,
            y: 125,
            radius: 40,
            fill: 'red'
        });

        var textpath = new Kinetic.Plugins.TextPath({
            y: 35,
            stroke: 'black',
            strokeWidth: 1,
            fill: 'orange',
            fontSize: '18',
            fontFamily: 'Arial',
            text: 'The quick brown fox jumped over the lazy dog\'s back',
            data: "M 10,10 300,150 550,150"
        });

        var path = new Kinetic.Path({
            x: 200,
            y: -75,
            data: 'M200,100h100v50z',
            fill: '#ccc',
            stroke: '#333',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 2,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5
        });

        var poly = new Kinetic.Plugins.RegularPolygon({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        group.add(red);
        group.add(redCircle);
        layer.add(blue);
        layer.add(green);
        layer.add(blueCircle);
        layer.add(group);
        layer2.add(textpath);
        layer2.add(path);
        layer2.add(poly);
        stage.add(layer);
        stage.add(layer2);
        stage.add(fooLayer);

        test(stage.get('Shape').length === 8, 'stage should have 5 shapes');
        test(stage.get('Layer').length === 3, 'stage should have 2 layers');
        test(stage.get('Group').length === 1, 'stage should have 1 group');
        test(stage.get('Rect').length === 3, 'stage should have 3 rects');
        test(stage.get('Circle').length === 2, 'stage should have 2 circles');
        test(stage.get('RegularPolygon').length === 1, 'stage should have 1 regular polygon');
        test(stage.get('TextPath').length === 1, 'stage should have 1 text path');
        test(stage.get('Path').length === 1, 'stage should have 1 path');

        test(layer.get('Shape').length === 5, 'layer should have 5 shapes');
        test(layer.get('Layer').length === 0, 'layer should have 0 layers');
        test(layer.get('Group').length === 1, 'layer should have 1 group');
        test(layer.get('Rect').length === 3, 'layer should have 3 rects');
        test(layer.get('Circle').length === 2, 'layer should have 2 circles');
        test(layer.get('RegularPolygon').length === 0, 'layer should have 0 regular polygon');
        test(layer.get('TextPath').length === 0, 'layer should have 0 text path');
        test(layer.get('Path').length === 0, 'layer should have 0 path');

        test(layer2.get('Shape').length === 3, 'layer2 should have 3 shapes');
        test(layer2.get('Layer').length === 0, 'layer2 should have 0 layers');
        test(layer2.get('Group').length === 0, 'layer2 should have 0 group');
        test(layer2.get('RegularPolygon').length === 1, 'layer2 should have 1 regular polygon');
        test(layer2.get('TextPath').length === 1, 'layer2 should have 1 text path');
        test(layer2.get('Path').length === 1, 'layer2 should have 1 path');

        test(fooLayer.get('Shape').length === 0, 'layer should have 0 shapes');
        test(fooLayer.get('Group').length === 0, 'layer should have 0 groups');
        test(fooLayer.get('Rect').length === 0, 'layer should have 0 rects');
        test(fooLayer.get('Circle').length === 0, 'layer should have 0 circles');

        test(group.get('Shape').length === 2, 'group should have 2 shape');
        test(group.get('Layer').length === 0, 'group should have 0 layers');
        test(group.get('Group').length === 0, 'group should have 0 groups');
        test(group.get('Rect').length === 1, 'group should have 1 rects');
        test(group.get('Circle').length === 1, 'gropu should have 1 circles');

		//console.log(dataUrls['node shape type selector']);

        stage.toDataURL({
            callback: function(dataUrl) {
            	//console.log(dataUrl)
                warn(dataUrl === dataUrls['node shape type selector'], 'problem with node and shape type selector render.');
            }
        });
    },
    'test get() selector by adding shape, then group, then layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        group.add(rect);
        layer.add(group);
        stage.add(layer);

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');
    },
    'test get() selector by adding group, then shape, then layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        layer.add(group);
        group.add(rect);
        stage.add(layer);

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');
    },
    'test get() selector by adding group, then layer, then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        layer.add(group);
        stage.add(layer);
        group.add(rect);

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');
    },
    'test get() selector by adding layer, then group, then shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            name: 'stageName',
            id: 'stageId'
        });
        var layer = new Kinetic.Layer({
            name: 'layerName',
            id: 'layerId'
        });
        var group = new Kinetic.Group({
            name: 'groupName',
            id: 'groupId'
        });
        var rect = new Kinetic.Rect({
            x: 200,
            y: 20,
            width: 100,
            height: 50,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            name: 'rectName',
            id: 'rectId'
        });

        stage.add(layer);
        layer.add(group);
        group.add(rect);

        test(stage.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(stage.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(layer.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(layer.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');
        test(group.get('.rectName')[0].attrs.id === 'rectId', 'problem with shape name selector');
        test(group.get('#rectId')[0].attrs.id === 'rectId', 'problem with shape id selector');

        test(stage.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(stage.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');
        test(layer.get('.groupName')[0].attrs.id === 'groupId', 'problem with group name selector');
        test(layer.get('#groupId')[0].attrs.id === 'groupId', 'problem with group id selector');

        test(stage.get('.layerName')[0].attrs.id === 'layerId', 'problem with layer name selector');
        test(stage.get('#layerId')[0].attrs.id === 'layerId', 'problem with layer id selector');

        layer.draw();
    },
    'add layer then shape': function(containerId) {
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
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();
    },
    'move blue layer on top of green layer with setZIndex': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        blueLayer.setZIndex(1);
        
        console.log(greenLayer.getZIndex());

        test(greenLayer.getZIndex() === 0, 'green layer should have z index of 0');
        test(blueLayer.getZIndex() === 1, 'blue layer should have z index of 1');

        stage.toDataURL({
            callback: function(dataUrl) {
                //console.log(dataUrl)
                warn(dataUrls['blue on top of green'] === dataUrl, 'layer setZIndex is not working');
            }
        });
    },
    'move blue layer on top of green layer with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        blueLayer.moveToTop();

        stage.toDataURL({
            callback: function(dataUrl) {
                warn(dataUrls['blue on top of green'] === dataUrl, 'layer moveToTop is not working');
            }
        });
    },
    'move green layer below blue layer with moveToBottom': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);

        greenLayer.moveToBottom();

        stage.toDataURL({
            callback: function(dataUrl) {
                warn(dataUrls['blue on top of green'] === dataUrl, 'layer moveToBottom is not working');
            }
        });
    },
    'move green layer below blue layer with moveDown': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);
        greenLayer.moveDown();

        stage.toDataURL({
            callback: function(dataUrl) {
                warn(dataUrls['blue on top of green'] === dataUrl, 'layer moveDown is not working');
            }
        });
    },
    'move blue layer above green layer with moveUp': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var blueLayer = new Kinetic.Layer();
        var greenLayer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueLayer.add(bluecircle);
        greenLayer.add(greencircle);

        stage.add(blueLayer);
        stage.add(greenLayer);
        blueLayer.moveUp();

        stage.toDataURL({
            callback: function(dataUrl) {
                warn(dataUrls['blue on top of green'] === dataUrl, 'layer moveUp is not working');
            }
        });
    },
    'move blue circle on top of green circle with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(bluecircle);
        layer.add(greencircle);
        stage.add(layer);

        test(bluecircle.getZIndex() === 0, 'blue circle should have zindex 0 before relayering');
        test(greencircle.getZIndex() === 1, 'green circle should have zindex 1 before relayering');

        bluecircle.moveToTop();

        test(bluecircle.getZIndex() === 1, 'blue circle should have zindex 1 after relayering');
        test(greencircle.getZIndex() === 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    },
    'move green circle below blue circle with moveDown': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(bluecircle);
        layer.add(greencircle);
        stage.add(layer);

        test(bluecircle.getZIndex() === 0, 'blue circle should have zindex 0 before relayering');
        test(greencircle.getZIndex() === 1, 'green circle should have zindex 1 before relayering');

        greencircle.moveDown();

        test(bluecircle.getZIndex() === 1, 'blue circle should have zindex 1 after relayering');
        test(greencircle.getZIndex() === 0, 'green circle should have zindex 0 after relayering');

        layer.draw();
    },
    'layer layer when only one layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(bluecircle);
        stage.add(layer);

        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveDown();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveToBottom();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveUp();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

        layer.moveToTop();
        test(layer.getZIndex() === 0, 'layer should have zindex of 0');

    },
    'move blue group on top of green group with moveToTop': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueGroup.add(bluecircle);
        greenGroup.add(greencircle);

        layer.add(blueGroup);
        layer.add(greenGroup);
        stage.add(layer);

        test(blueGroup.getZIndex() === 0, 'blue group should have zindex 0 before relayering');
        test(greenGroup.getZIndex() === 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveToTop();

        test(blueGroup.getZIndex() === 1, 'blue group should have zindex 1 after relayering');
        test(greenGroup.getZIndex() === 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    },
    'move blue group on top of green group with moveUp': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var greenGroup = new Kinetic.Group();
        var blueGroup = new Kinetic.Group();

        var bluecircle = new Kinetic.Circle({
            x: 200,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'blue',
            stroke: 'black',
            strokeWidth: 4
        });

        var greencircle = new Kinetic.Circle({
            x: 280,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        blueGroup.add(bluecircle);
        greenGroup.add(greencircle);

        layer.add(blueGroup);
        layer.add(greenGroup);
        stage.add(layer);

        test(blueGroup.getZIndex() === 0, 'blue group should have zindex 0 before relayering');
        test(greenGroup.getZIndex() === 1, 'green group should have zindex 1 before relayering');

        blueGroup.moveUp();

        test(blueGroup.getZIndex() === 1, 'blue group should have zindex 1 after relayering');
        test(greenGroup.getZIndex() === 0, 'green group should have zindex 0 after relayering');

        layer.draw();
    }
};

Test.Modules.LAYER = {
    'test canvas inline styles': function(containerId) {
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

        var style = layer.getCanvas().getElement().style;

        console.log('--' + style.display);

        test(style.position === 'absolute', 'canvas position style should be absolute');
        test(style.border === '0px', 'canvas border style should be 0px');
        test(style.margin === '0px', 'canvas margin style should be 0px');
        test(style.padding === '0px', 'canvas padding style should be 0px');
        test(style.backgroundColor === 'transparent', 'canvas backgroundColor style should be transparent');
    },
    'beforeDraw and afterDraw': function(containerId) {
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

        var counter = 0;

        layer.beforeDraw(function() {
            counter++;
            test(counter === 1, 'counter should be 1');
        });

        layer.afterDraw(function() {
            counter++;
            test(counter === 2, 'counter should be 2');
        });

        layer.draw();
    },
    'set clearBeforeDraw to false, and test toDataURL for stage, layer, group, and shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var layer = new Kinetic.Layer({
            clearBeforeDraw: false,
            throttle: 999
        });

        var group = new Kinetic.Group();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        for(var n = 0; n < 20; n++) {
            circle.move(10, 0);
            layer.draw();
        }

        //console.log(layer.toDataURL());

        stage.toDataURL({
            callback: function(dataUrl) {
                warn(dataUrls['stacked green circles'] === dataUrl, 'stacked green circles stage data url is incorrect');
            }
        });
        warn(dataUrls['stacked green circles'] === layer.toDataURL(), 'stacked green circles layer data url is incorrect');

    },
    'save layer as png (click on Circle to open new window)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var Circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        Circle.on('click', function() {
            window.open(layer.toDataURL());
        });

        layer.add(Circle);
        stage.add(layer);
    },
    'save layer as low quality jpg (click on Circle to open new window)': function(containerId) {
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
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            window.open(layer.toDataURL({
               mimeType: 'image/jpeg',
               quality: 0.2
            }));
        });

        layer.add(circle);
        stage.add(layer);
    },
    'save layer as high quality jpg (click on Circle to open new window)': function(containerId) {
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
            fill: 'violet',
            stroke: 'black',
            strokeWidth: 4
        });

        circle.on('click', function() {
            window.open(layer.toDataURL({
               mimeType: 'image/jpeg',
               quality: 1
            }));
        });

        layer.add(circle);
        stage.add(layer);
    }
};




Test.Modules.SHAPE = {
    'scale rect with stroke scale disabled': function(containerId) {
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
            stroke: 'black',
            strokeWidth: 4,
            scale: [3, 1],
            draggable: true,
            strokeScaleEnabled: false
        });

        layer.add(rect);
        stage.add(layer);
        
        //console.log(layer.toDataURL());
        
        warn(layer.toDataURL() === dataUrls['scaled rect with disabled stroke scale'], 'probem with stroke scale disabling');
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
    'custom shape with two fills and two strokes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var drawTriangle = function(canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            canvas.fillStroke(this);

            context.beginPath();
            context.moveTo(300, 150);
            context.lineTo(520, 180);
            context.quadraticCurveTo(400, 200, 360, 270);
            context.closePath();
            canvas.fillStroke(this);
        };
        var triangle = new Kinetic.Shape({
            drawFunc: drawTriangle,
            fill: "#00D2FF",
            stroke: "black",
            strokeWidth: 4,
            id: 'myTriangle',
            draggable: true,
            shadowColor: 'black',
            shadowOpacity: 0.5,
            shadowBlur: 10,
            shadowOffset: 10
        });

        stage.add(layer.add(triangle));

        var dataUrl = layer.toDataURL();
        //console.log(dataUrl);
        warn(dataUrl === dataUrls['custom shape with two fills and strokes'], 'problem with custom shape with two fills');

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
    'change custom shape draw func': function(containerId) {
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

        shape.setDrawFunc(function(canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        });
        var rect = new Kinetic.Rect({
            x: 10,
            y: 10,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        rect.setDrawFunc(function(canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        });

        layer.add(shape);
        layer.add(rect);
        stage.add(layer);

        var dataUrl = layer.toDataURL();

        //console.log(dataUrl);
        warn(dataUrls['change custom shape draw func'] === dataUrl, 'problem with setDrawFunc');
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

            var star = new Kinetic.Plugins.Star({
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

        var ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: {
                x: 100,
                y: 50
            },
            fill: 'yellow'
        });

        layer.add(ellipse);
        layer.add(circle);
        stage.add(layer);

        // circle tests
        test(circle.attrs.width === undefined, 'circle.attrs.width should be undefined');
        test(circle.attrs.height === undefined, 'circle.attrs.height should be undefined');
        test(circle.getWidth() === 100, 'circle width should be 100');
        test(circle.getHeight() === 100, 'circle height should be 100');
        test(circle.getSize().width === 100, 'circle width should be 100');
        test(circle.getSize().height === 100, 'circle height should be 100');
        test(circle.getRadius() === 50, 'circle radius should be 50');

        circle.setWidth(200);

        test(circle.attrs.width === 200, 'circle.attrs.width should be 200');
        test(circle.attrs.height === undefined, 'circle.attrs.height should be undefined');
        test(circle.getWidth() === 200, 'circle width should be 200');
        test(circle.getHeight() === 200, 'circle height should be 200');
        test(circle.getSize().width === 200, 'circle width should be 200');
        test(circle.getSize().height === 200, 'circle height should be 200');
        test(circle.getRadius() === 100, 'circle radius should be 100');

        // ellipse tests
        test(ellipse.attrs.width === undefined, 'ellipse.attrs.width should be undefined');
        test(ellipse.attrs.height === undefined, 'ellipse.attrs.height should be undefined');
        test(ellipse.getWidth() === 200, 'ellipse width should be 200');
        test(ellipse.getHeight() === 100, 'ellipse height should be 100');
        test(ellipse.getSize().width === 200, 'ellipse width should be 200');
        test(ellipse.getSize().height === 100, 'ellipse height should be 100');
        test(ellipse.getRadius().x === 100, 'ellipse radius x should be 100');

        ellipse.setWidth(400);

        test(ellipse.attrs.width === 400, 'ellipse.attrs.width should be 400');
        test(ellipse.attrs.height === undefined, 'ellipse.attrs.height should be undefined');
        test(ellipse.getWidth() === 400, 'ellipse width should be 400');
        test(ellipse.getHeight() === 100, 'ellipse height should be 100');
        test(ellipse.getSize().width === 400, 'ellipse width should be 400');
        test(ellipse.getSize().height === 100, 'ellipse height should be 100');
        test(ellipse.getRadius().x === 200, 'ellipse radius x should be 200');

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
    'everything enabled': function(containerId) {
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
            dashArray: [10, 10],
            fillEnabled: true,
            strokeEnabled: true,
            shadowEnabled: true,
            dashArrayEnabled: true
        });
        layer.add(circle);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['everything enabled'], 'should be circle with green fill, dashed stroke, and shadow');
    },
    'fill disabled': function(containerId) {
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
            dashArray: [10, 10],
            fillEnabled: false,
            strokeEnabled: true,
            shadowEnabled: true,
            dashArrayEnabled: true
        });
        layer.add(circle);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['fill disabled'], 'should be circle with no fill, dashed stroke, and shadow');
    },
    'stroke disabled': function(containerId) {
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
            dashArray: [10, 10],
            fillEnabled: true,
            strokeEnabled: false,
            shadowEnabled: true,
            dashArrayEnabled: true
        });
        layer.add(circle);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['stroke disabled'], 'should be circle with green fill, no stroke, and shadow');
    },
    'dash array disabled': function(containerId) {
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
            dashArray: [10, 10],
            fillEnabled: true,
            strokeEnabled: true,
            shadowEnabled: true,
            dashArrayEnabled: false
        });
        layer.add(circle);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['dash array disabled'], 'should be circle with green fill, solid stroke, and shadow');
    },
    'shadow disabled': function(containerId) {
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
            dashArray: [10, 10],
            fillEnabled: true,
            strokeEnabled: true,
            shadowEnabled: false,
            dashArrayEnabled: true
        });
        layer.add(circle);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['shadow disabled'], 'should be circle with green fill, dashed stroke, and no shadow');
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

    },
    'fill overrides': function(containerId) {

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Plugins.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,

            fill: 'red',
            fillLinearGradientStartPoint: -35,
            fillLinearGradientEndPoint: 35,
            fillLinearGradientColorStops: [0, 'red', 1, 'blue'],

            stroke: 'blue',
            strokeWidth: 5,
            draggable: true
        });

        layer.add(star);
        stage.add(layer);

        //console.log(layer.toDataURL());

        warn(layer.toDataURL() === dataUrls['red star'], 'star should have red fill');

        star.setFillPriority('linear-gradient');
        layer.draw();

        warn(layer.toDataURL() === dataUrls['star with linear gradient fill'], 'star should have linear gradient fill');

        star.setFillPriority('color');
        layer.draw();
        
        warn(layer.toDataURL() === dataUrls['red star'], 'star should have red fill again');


    }
};

Test.Modules.DD = {
    'test drag and drop properties and methods': function(containerId) {
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
            name: 'myCircle'
        });

        stage.add(layer);
        layer.add(circle);
        layer.draw();

        // test defaults
        test(circle.isDraggable() === false, 'draggable should be false');

        //change properties
        circle.setDraggable(true);

        // test new properties
        test(circle.getDraggable() === true, 'draggable should be true');
    },
    'DRAG AND DROP - multiple drag and drop sets with setDraggable()': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        circle.setDraggable(true);
        test(circle.getDraggable(), 'draggable should be true');
        circle.setDraggable(true);
        test(circle.getDraggable(), 'draggable should be true');
        circle.setDraggable(false);
        test(!circle.getDraggable(), 'draggable should be false');

        layer.add(circle);
        stage.add(layer);

    }
};

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

Test.Modules.RECT = {
    'draw rect': function(containerId) {
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
            stroke: 'black',
            strokeWidth: 4,
            offset: {
                x: 50
            },
            scale: [2, 2],
            cornerRadius: 15,
            draggable: true
        });

        layer.add(rect);
        stage.add(layer);
    },
    'add stroke rect': function(containerId) {
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
            stroke: 'green',
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);
    },
    'use default stroke (stroke color should be black)': function(containerId) {
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
            strokeWidth: 4
        });

        layer.add(rect);
        stage.add(layer);
    },
    'use default stroke width (stroke width should be 2)': function(containerId) {
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
            stroke: 'blue'
        });

        layer.add(rect);
        stage.add(layer);
    }
};

Test.Modules.CIRCLE = {
    'test attrs': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: 100,
            y: 100,
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

        var attrs = circle.getAttrs();

        test(attrs.x === 100, 'x attr should be 100');
        test(attrs.y === 100, 'y attr should be 100');
        test(attrs.radius === 70, 'radius attr should be 70');
        test(attrs.fill === 'green', 'fill attr should be fill');
        test(attrs.stroke === 'black', 'stroke attr should be stroke');
        test(attrs.strokeWidth === 4, 'strokeWidth attr should be strokeWidth');
        test(attrs.name === 'myCircle', 'name attr should be myCircle');
        test(attrs.draggable === true, 'draggable attr should be true');
    },
    'add circle with pattern fill': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();
            var circle = new Kinetic.Circle({
                x: stage.getWidth() / 2,
                y: stage.getHeight() / 2,
                radius: 70,
                fillPatternImage: imageObj,
                fillPatternOffset: -5,
                fillPatternScale: 0.7,
                stroke: 'black',
                strokeWidth: 4,
                name: 'myCircle',
                draggable: true
            });

            group.add(circle);
            layer.add(group);
            stage.add(layer);

            test(circle.getFillPatternOffset().x === -5, 'fill offset x should be -5');
            test(circle.getFillPatternOffset().y === -5, 'fill offset y should be -5');

            /*
             * test offset setting
             */
            circle.setFillPatternOffset(1, 2);
            test(circle.getFillPatternOffset().x === 1, 'fill offset x should be 1');
            test(circle.getFillPatternOffset().y === 2, 'fill offset y should be 2');

            circle.setFillPatternOffset({
                x: 3,
                y: 4
            });
            test(circle.getFillPatternOffset().x === 3, 'fill offset x should be 3');
            test(circle.getFillPatternOffset().y === 4, 'fill offset y should be 4');
        };
        imageObj.src = '../assets/darth-vader.jpg';

    },
    'add circle with radial gradient fill': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fillRadialGradientStartPoint: -20,
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: -60,
            fillRadialGradientEndRadius: 130,
            fillRadialGradientColorStops: [0, 'red', 0.2, 'yellow', 1, 'blue'],
            name: 'myCircle',
            draggable: true,
            scale: {
                x: 0.5,
                y: 0.5
            }
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        test(circle.getFillRadialGradientStartPoint().x === -20, 'fill start x should be 20');
        test(circle.getFillRadialGradientStartPoint().y === -20, 'fill start y should be 20');
        test(circle.getFillRadialGradientStartRadius() === 0, 'fill start radius should be 0');

        test(circle.getFillRadialGradientEndPoint().x === -60, 'fill end x should be 60');
        test(circle.getFillRadialGradientEndPoint().y === -60, 'fill end y should be 60');
        test(circle.getFillRadialGradientEndRadius() === 130, 'fill end radius should be 130');

        test(circle.getFillRadialGradientColorStops().length === 6, 'fill colorStops length should be 6');

    },
    'add circle': function(containerId) {
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
            strokeWidth: 4
        });
        layer.add(circle);
        stage.add(layer);
    },
    'add shape with linear gradient fill': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fillLinearGradientStartPoint: -35,
            fillLinearGradientEndPoint: 35,
            fillLinearGradientColorStops: [0, 'red', 1, 'blue'],
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        test(circle.getName() === 'myCircle', 'circle name should be myCircle');

    },
    'add circle with opacity': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        circle.setOpacity(0.5);
        layer.draw();

        circle.setOpacity(0.5);
        layer.draw();
    },
    'set fill after instantiation': function(containerId) {
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
            strokeWidth: 4
        });
        layer.add(circle);

        circle.setFill('blue');

        stage.add(layer);
    }
};

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

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['wedge'], 'problem rendering wedge');
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
    },
    'rotate wedge by degrees': function(containerId) {
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

        wedge.rotateDeg(180);
        layer.draw();

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['rotate wedge'], 'problem with rotated wedge rendering');
    }
};

Test.Modules.ELLISPE = {
    'add ellipse': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: [70, 35],
            fill: 'green',
            stroke: 'black',
            strokeWidth: 8
        });
        layer.add(circle);
        stage.add(layer);
    }
};

Test.Modules.IMAGE = {
    'add image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 200,
                y: 60,
                image: imageObj,
                width: 100,
                height: 100,
                offset: [50, 30],
                crop: [135, 7, 167, 134],
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setHeight(200);
            layer.draw();

            darth.setHeight(100);
            layer.draw();

            test(darth.getX() === 200, 'x should be 200');
            test(darth.getY() === 60, 'y should be 60');
            test(darth.getWidth() === 100, 'width should be 100');
            test(darth.getHeight() === 100, 'height should be 100');
            test(darth.getOffset().x === 50, 'center offset x should be 50');
            test(darth.getOffset().y === 30, 'center offset y should be 30');
            test(Kinetic.Type._isElement(darth.getImage()), 'darth image should be an element');

            var crop = null;
            crop = darth.getCrop();
            test(crop.x === 135, 'crop x should be 135');
            test(crop.y === 7, 'crop y should be 7');
            test(crop.width === 167, 'crop width should be 167');
            test(crop.height === 134, 'crop height should be134');

            darth.setCrop(0, 1, 2, 3);
            crop = darth.getCrop();
            test(crop.x === 0, 'crop x should be 0');
            test(crop.y === 1, 'crop y should be 1');
            test(crop.width === 2, 'crop width should be2');
            test(crop.height === 3, 'crop height should be 3');

            darth.setCrop([4, 5, 6, 7]);
            crop = darth.getCrop();
            test(crop.x === 4, 'crop x should be 4');
            test(crop.y === 5, 'crop y should be 5');
            test(crop.width === 6, 'crop width should be 6');
            test(crop.height === 7, 'crop height should be 7');

            darth.setCrop({
                x: 8,
                y: 9,
                width: 10,
                height: 11
            });
            crop = darth.getCrop();
            test(crop.x === 8, 'crop x should be 8');
            test(crop.y === 9, 'crop y should be 9');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                x: 12
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 9, 'crop y should be 9');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                y: 13
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 10, 'crop width should be 10');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                width: 14
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 14, 'crop width should be 14');
            test(crop.height === 11, 'crop height should be 11');

            darth.setCrop({
                height: 15
            });
            crop = darth.getCrop();
            test(crop.x === 12, 'crop x should be 12');
            test(crop.y === 13, 'crop y should be 13');
            test(crop.width === 14, 'crop width should be 14');
            test(crop.height === 15, 'crop height should be 15');

            darth.setAttrs({
                x: 200,
                y: 60,
                image: imageObj,
                width: 100,
                height: 100,
                offset: [50, 30],
                crop: [135, 7, 167, 134],
                draggable: true
            });

            //document.body.appendChild(layer.bufferCanvas.element)

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'crop add and scale image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 200,
                y: 75,
                image: imageObj,
                width: 107,
                height: 75,
                crop: [186, 211, 292 - 186, 285 - 211],
                draggable: true,
                scale: [0.5, 0.5]
            });

            layer.add(darth);
            stage.add(layer);
            
            //console.log(layer.toDataURL());
            
            warn(layer.toDataURL() === dataUrls['crop and scale image'], 'problem rendering cropped and scaled image');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'create image hit region': function(containerId) {
        var imageObj = new Image();

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        imageObj.onload = function() {

            var lion = new Kinetic.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true,
                shadowColor: 'black',
            	shadowBlur: 10,
            	shadowOffset: [20, 20],
            	shadowOpacity: 0.2
            });

            // override color key with black
            lion.colorKey = '000000';

            layer.add(lion);

            lion.createImageHitRegion(function() {
                stage.add(layer);
                layer.drawHit();

                var hitDataUrl = layer.hitCanvas.toDataURL();

                //console.log(hitDataUrl);
                warn(hitDataUrl === dataUrls['transparent image hit render'], 'problem rendering image on hit graph');
            });
        };
        imageObj.src = '../assets/lion.png';

        showHit(layer);
    },
    'grayscale image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            test(darth.getWidth() === 438, 'image width should be 438');
            test(darth.getHeight() === 300, 'image height should be 300');

            darth.applyFilter(Kinetic.Filters.Grayscale, null, function() {
                layer.draw();
                var dataUrl = layer.toDataURL();
                //console.log(dataUrl);
                warn(dataUrl === dataUrls['grayscale image'], 'problem with Grayscale filter.');
            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'invert image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            test(darth.getWidth() === 438, 'image width should be 438');
            test(darth.getHeight() === 300, 'image height should be 300');

            darth.applyFilter(Kinetic.Filters.Invert, null, function() {
                layer.draw();
                var dataUrl = layer.toDataURL();
                //console.log(dataUrl);
                warn(dataUrl === dataUrls['invert image'], 'problem with Invert filter.');

            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'adjust image brightness': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            test(darth.getWidth() === 438, 'image width should be 438');
            test(darth.getHeight() === 300, 'image height should be 300');

            darth.applyFilter(Kinetic.Filters.Brighten, {
                val: 100
            }, function() {
                layer.draw();
                var dataUrl = layer.toDataURL();
                //console.log(dataUrl);
                warn(dataUrl === dataUrls['adjust image brightness'], 'problem with Brighten filter.');

            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'gaussian blur filter': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            test(darth.getWidth() === 438, 'image width should be 438');
            test(darth.getHeight() === 300, 'image height should be 300');

            darth.applyFilter(Kinetic.Filters.Gauss, {
                radius: 10
            }, function() {
                layer.draw();
                var dataUrl = layer.toDataURL();
                //console.log(dataUrl);
                warn(dataUrl === dataUrls['adjust image brightness'], 'problem with Brighten filter.');

            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'filter transformed image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer({
                throttle: 999
            });
            darth = new Kinetic.Image({
                x: 50,
                y: 50,
                //width: 438,
                //height: 300,
                image: imageObj,
                draggable: true,
                rotationDeg: 10,
                scale: 0.3
            });

            darth.setOffset(darth.getWidth() / 2, darth.getHeight() / 2);

            layer.add(darth);
            stage.add(layer);

            test(darth.getWidth() === 438, 'image width should be 438');
            test(darth.getHeight() === 300, 'image height should be 300');

            darth.applyFilter(Kinetic.Filters.Grayscale, null, function() {
                //stage.start();
                layer.draw();
                //console.log(layer.toDataURL());
                warn(layer.toDataURL() === dataUrls['filter transformed image'], 'problem filtering transformed image');

            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'apply shadow to transparent image': function(containerId) {
        var imageObj = new Image();

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        imageObj.onload = function() {

            var lion = new Kinetic.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true,
                shadowColor: 'black',
            	shadowBlur: 10,
            	shadowOffset: [20, 20],
            	shadowOpacity: 0.2
            });

            layer.add(lion);
            stage.add(layer);

            var dataUrl = layer.toDataURL();

            warn(dataUrl === dataUrls['transparent image shadow'], 'problem applying shadow to image with transparent pixels');

        };
        imageObj.src = '../assets/lion.png';

        showHit(layer);
    }
};

Test.Modules.POLYGON - {
    'add polygon': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var points = [{
            x: 73,
            y: 192
        }, {
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }, {
            x: 500,
            y: 109
        }, {
            x: 499,
            y: 139
        }, {
            x: 342,
            y: 93
        }];

        var poly = new Kinetic.Polygon({
            points: points,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        layer.add(poly);
        stage.add(layer);

    }	
};

Test.Modules.LINE = {
    'add line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var points = [{
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }
        /*, {
         x: 500,
         y: 109
         }*/
        ];

        var line = new Kinetic.Line({
            points: points,
            stroke: 'blue',
            strokeWidth: 20,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true
        });

        layer.add(line);
        stage.add(layer);

        line.setPoints([1, 2, 3, 4]);
        test(line.getPoints()[0].x === 1, 'first point x should be 1');

        line.setPoints([{
            x: 5,
            y: 6
        }, {
            x: 7,
            y: 8
        }]);
        test(line.getPoints()[0].x === 5, 'first point x should be 5');

        line.setPoints([73, 160, 340, 23]);
        test(line.getPoints()[0].x === 73, 'first point x should be 73');
    },
    'add dashed line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        /*
         var points = [{
         x: 73,
         y: 160
         }, {
         x: 340,
         y: 23
         }, {
         x: 500,
         y: 109
         }, {
         x: 500,
         y: 180
         }];
         */

        var line = new Kinetic.Line({
            points: [73, 160, 340, 23, 500, 109, 500, 180],
            stroke: 'blue',

            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            dashArray: [30, 10, 0, 10, 10, 20],
            shadowColor: '#aaa',
            shadowBlur: 10,
            shadowOffset: [20, 20]
            //opacity: 0.2
        });

        layer.add(line);
        stage.add(layer);

        test(line.getDashArray().length === 6, 'dashArray should have 6 elements');
        line.setDashArray([10, 10]);
        test(line.getDashArray().length === 2, 'dashArray should have 2 elements');

        test(line.getPoints().length === 4, 'line should have 4 points');

    }
};

Test.Modules.SPLINE = {
    'add splines': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line1 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });
        
        var line2 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }],
            stroke: 'red',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });
        
        var line3 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }],
            stroke: 'green',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line1);
        layer.add(line2);
        layer.add(line3);
        stage.add(layer);
        
        /*
         line.transitionTo({
         spline: 3,
         duration: 3
         });
         */
        
        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['curvy lines'], 'problem with curvy lines');

    },
    'create from points represented as a flat array': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Spline({
            points: [
                73, 160,
                340, 23,
                500, 109,
                300, 109
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line);
        stage.add(layer);

        test(line.getPoints().length === 4, 'line should have 4 points');
    },
    'create from points represented as an array of objects': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line);
        stage.add(layer);

        test(line.getPoints().length === 4, 'line should have 4 points');
    },
    'create from points represented as an array of arrays': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Spline({
            points: [
                [73, 160],
                [340, 23],
                [500, 109],
                [300, 109]
            ],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line);
        stage.add(layer);

        test(line.getPoints().length === 4, 'line should have 4 points');
    }
};

Test.Modules.BLOB = {
    'add blobs': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var blob1 = new Kinetic.Blob({
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 170
            }],
            stroke: 'blue',
            strokeWidth: 10,
            draggable: true,
            fill: '#aaf',
            tension: 0.8
        });
        
        var blob2 = new Kinetic.Blob({
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }],
            stroke: 'red',
            strokeWidth: 10,
            draggable: true,
            fill: '#faa',
            tension: 1.2,
            scale: 0.5,
            x: 100,
            y: 50
        });
        

        layer.add(blob1);
        layer.add(blob2);
        stage.add(layer);
        
        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['blobs'], 'problem with blobs');
        
        test(blob1.getTension() === 0.8, 'blob1 tension should be 0.8');
        test(blob2.getTension() === 1.2, 'blob2 tension should be 1.2');
        

    }
};

Test.Modules.Text = {
    'add text with shadows': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            width: 400,
            height: 100,
            shadowColor: 'black',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            cornerRadius: 10
        });

        var text = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            text: 'Hello World!',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#888',
            stroke: '#333',
            align: 'right',
            lineHeight: 1.2,
            width: 400,
            height: 100,
            padding: 10,
            shadowColor: 'red',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2
        });

        var group = new Kinetic.Group({
            draggable: true
        });

        // center text box
        rect.setOffset(text.getWidth() / 2, text.getHeight() / 2);
        text.setOffset(text.getWidth() / 2, text.getHeight() / 2);

        group.add(rect);
        group.add(text);
        layer.add(group);
        stage.add(layer);
    },
    'text getters and setters': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            text: 'Hello World!',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#888',
            stroke: '#333',
            align: 'right',
            lineHeight: 1.2,
            width: 400,
            height: 100,
            padding: 10,
            shadowColor: 'black',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            draggable: true
        });

        // center text box
        text.setOffset(text.getWidth() / 2, text.getHeight() / 2);

        layer.add(text);
        stage.add(layer);

        /*
         * test getters and setters
         */

        test(text.getX() === stage.getWidth() / 2, 'text box x should be in center of stage');
        test(text.getY() === stage.getHeight() / 2, 'text box y should be in center of stage');

        test(text.getText() === 'Hello World!', 'text should be Hello World!');
        test(text.getFontSize() == 50, 'font size should 50');
        test(text.getFontFamily() == 'Calibri', 'font family should be Calibri');
        test(text.getFontStyle() == 'normal', 'font style should be normal');
        test(text.getFill() == '#888', 'text fill should be #888');
        test(text.getStroke() == '#333', 'text fill should be #333');
        test(text.getAlign() === 'right', 'text should be aligned right');
        test(text.getLineHeight() === 1.2, 'line height should be 1.2');
        test(text.getWidth() === 400, 'width should be 400');
        test(text.getHeight() === 100, 'height should be 100');
        test(text.getPadding() === 10, 'padding should be 10');
        test(text.getShadowColor() === 'black', 'text box shadow color should be black');
        test(text.getDraggable() === true, 'text should be draggable');

        test(text.getWidth() === 400, 'box width should be 400');
        test(text.getHeight() === 100, 'box height should be 100');
        test(text.getTextWidth() > 0, 'text width should be greater than 0');
        test(text.getTextHeight() > 0, 'text height should be greater than 0');

        text.setX(1);
        text.setY(2);
        text.setText('bye world!');
        text.setFontSize(10);
        text.setFontFamily('Arial');
        text.setFontStyle('bold');
        text.setFill('green');
        text.setStroke('yellow');
        text.setAlign('left');
        text.setWidth(300);
        text.setHeight(75);
        text.setPadding(20);
        text.setShadowColor('green');
        text.setDraggable(false);

        test(text.getX() === 1, 'text box x should be 1');
        test(text.getY() === 2, 'text box y should be 2');
        test(text.getText() === 'bye world!', 'text should be bye world!');
        test(text.getFontSize() == 10, 'font size should 10');
        test(text.getFontFamily() == 'Arial', 'font family should be Arial');
        test(text.getFontStyle() == 'bold', 'font style should be bold');
        test(text.getFill() == 'green', 'text fill should be green');
        test(text.getStroke() == 'yellow', 'text fill should be yellow');
        test(text.getAlign() === 'left', 'text should be aligned left');
        test(text.getWidth() === 300, 'width should be 300');
        test(text.getHeight() === 75, 'height should be 75');
        test(text.getPadding() === 20, 'padding should be 20');
        test(text.getShadowColor() === 'green', 'text box shadow color should be green');
        test(text.getDraggable() === false, 'text draggable should be false');

        // test set text to integer
        text.setText(5);

        //document.body.appendChild(layer.bufferCanvas.element)

        //layer.setListening(false);
        layer.drawHit();

    },
    'text multi line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'HEADING\n\nAll the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            draggable: true
        });

        // center text box
        //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

        layer.add(text);
        stage.add(layer);

        test(text.getLineHeight() === 1, 'text line height should be defaulted to 1');

        /*
         text.transitionTo({
         width: 500,
         duration: 10
         });
         */
    },
    'text multi line with shadows': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            //stroke: '#555',
            //strokeWidth: 5,
            text: 'HEADING\n\nAll the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            shadowColor: 'red',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5,
            draggable: true
        });

        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());

        warn(layer.toDataURL() === dataUrls['multiline text with shadows'], 'multi line text with shadows data url is incorrect');
    },
    'change font size should update text data': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            align: 'center',
            padding: 5,
            draggable: true
        });

        var width = text.getWidth();
        var height = text.getHeight();
        
        

        layer.add(text);
        stage.add(layer);

        text.setFontSize(30);
        layer.draw();
        
        //console.log(text.getHeight() + ',' + height);

        test(text.getWidth() > width, 'text box width should have increased.');
        test(text.getHeight() > height, 'text box height should have increased.');

    },
    'text everything enabled': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            fillEnabled: true,
            strokeEnabled: true,
            shadowEnabled: true
        });
        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['text everything enabled'], 'should be text with blue fill and red stroke');
    },
    'text fill disabled': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            fillEnabled: false,
            strokeEnabled: true,
            shadowEnabled: true
        });
        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['text fill disabled'], 'should be text with no fill and red stroke');
    },
    'text stroke disabled': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            fillEnabled: true,
            strokeEnabled: false,
            shadowEnabled: true
        });
        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['text stroke disabled'], 'should be text with blue fill and no stroke');
    }
};

Test.Modules.PATH = {
    'add simple path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'M200,100h100v50z',
            fill: '#ccc',
            stroke: '#333',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 2,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5,
            draggable: true
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);

        stage.add(layer);

        test(path.getData() === 'M200,100h100v50z', 'data are incorrect');
        test(path.dataArray.length === 4, 'data array should have 4 elements');

        path.setData('M200');

        test(path.getData() === 'M200', 'data are incorrect');
        test(path.dataArray.length === 1, 'data array should have 1 element');

        path.setData('M200,100h100v50z');

    },
    'add path with line cap and line join': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'M200,100h100v50',
            stroke: '#333',
            strokeWidth: 20,
            draggable: true,
            lineCap: 'round',
            lineJoin: 'round'
        });

        layer.add(path);

        stage.add(layer);

    },
    'moveTo with implied lineTos and trailing comma': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'm200,100,100,0,0,50,z',
            fill: '#fcc',
            stroke: '#333',
            strokeWidth: 2,
            shadowColor: 'maroon',
            shadowBlur: 2,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5,
            draggable: true
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);

        stage.add(layer);

        test(path.getData() === 'm200,100,100,0,0,50,z', 'data are incorrect');
        test(path.dataArray.length === 4, 'data array should have 4 elements');

        test(path.dataArray[1].command === 'L', 'second command should be an implied lineTo');
    },
    'add map path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var mapLayer = new Kinetic.Layer();

        for(var key in worldMap.shapes) {
            var c = worldMap.shapes[key];

            var path = new Kinetic.Path({
                data: c,
                fill: '#ccc',
                stroke: '#999',
                strokeWidth: 1
            });

            if(key === 'US')
                test(path.dataArray[0].command === 'M', 'first command should be a moveTo');

            path.on('mouseover', function() {
                this.setFill('red');
                mapLayer.drawScene();
            });

            path.on('mouseout', function() {
                this.setFill('#ccc');
                mapLayer.drawScene();
            });

            mapLayer.add(path);
        }

        stage.add(mapLayer);

        //document.body.appendChild(mapLayer.bufferCanvas.element);
    },
    'PATH - curved arrow path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z";

        var path = new Kinetic.Path({
            data: c,
            fill: '#ccc',
            stroke: '#999',
            strokeWidth: 1
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);
        stage.add(layer);

    },
    'Quadradic Curve test from SVG w3c spec': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.25,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M200,300 Q400,50 600,300 T1000,300";

        var path = new Kinetic.Path({
            data: c,
            stroke: 'red',
            strokeWidth: 5
        });

        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 200,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 600,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 1000,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 50,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 800,
            y: 550,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Path({
            data: "M200,300 L400,50L600,300L800,550L1000,300",
            stroke: "#888",
            strokeWidth: 2
        }));

        stage.add(layer);

    },
    'Cubic Bezier Curve test from SVG w3c spec using setData': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M100,200 C100,100 250,100 250,200 S400,300 400,200";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 5
        });

        path.setData(c);

        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 100,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 100,
            y: 100,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 100,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 300,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 300,
            radius: 10,
            stroke: 'blue'
        }));

        stage.add(layer);

    },
    'path arc': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M100,350 l 50,-25 a25,25 -30 0,1 50,-25 l 50,-25 a25,50 -30 0,1 50,-25 l 50,-25 a25,75 -30 0,1 50,-25 l 50,-25 a25,100 -30 0,1 50,-25 l 50,-25";

        var path = new Kinetic.Path({
            data: c,
            fill: 'none',
            stroke: '#999',
            strokeWidth: 1
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('none');
            layer.draw();
        });

        layer.add(path);
        stage.add(layer);

    },
    'Tiger (RAWR!)': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            scale: 0.25,
            x: 50,
            y: 50
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        for(var i = 0; i < tiger.length; i++) {
            var path = new Kinetic.Path(tiger[i]);
            group.add(path);
        }

        group.setDraggable(true);
        layer.add(group);
        stage.add(layer);

       	showHit(layer);

    },
    'Able to determine point on line some distance from another point on line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M10,10 210,160";
        // i.e., from a 3-4-5 triangle

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);
        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 10,
            y: 10,
            radius: 10,
            fill: 'black'
        }));

        var p1 = Kinetic.Path.getPointOnLine(125, 10, 10, 210, 160);
        // should be 1/2 way, or (110,85)
        test(Math.round(p1.x) === 110, 'point X value should be 110');
        test(Math.round(p1.y) === 85, 'point Y value should be 85');

        layer.add(new Kinetic.Circle({
            x: p1.x,
            y: p1.y,
            radius: 10,
            fill: 'blue'
        }));

        stage.add(layer);

    },
    'Able to determine points on Cubic Bezier Curve': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.5,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M100,200 C100,100 250,100 250,200 S400,300 400,200";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);
        c = 'M 100 200';

        for( t = 0.25; t <= 1; t += 0.25) {
            var p1 = Kinetic.Path.getPointOnCubicBezier(t, 100, 200, 100, 100, 250, 100, 250, 200);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        for( t = 0.25; t <= 1; t += 0.25) {
            var p1 = Kinetic.Path.getPointOnCubicBezier(t, 250, 200, 250, 300, 400, 300, 400, 200);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        var testPath = new Kinetic.Path({
            stroke: 'black',
            strokewidth: 2,
            data: c
        });

        layer.add(testPath);
        stage.add(layer);
    },
    'Able to determine points on Quadratic Curve': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.333,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M200,300 Q400,50 600,300 T1000,300";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);
        c = 'M 200 300';

        for( t = 0.333; t <= 1; t += 0.333) {
            var p1 = Kinetic.Path.getPointOnQuadraticBezier(t, 200, 300, 400, 50, 600, 300);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        for( t = 0.333; t <= 1; t += 0.333) {
            var p1 = Kinetic.Path.getPointOnQuadraticBezier(t, 600, 300, 800, 550, 1000, 300);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        var testPath = new Kinetic.Path({
            stroke: 'black',
            strokewidth: 2,
            data: c
        });

        layer.add(testPath);
        stage.add(layer);
    },
    'Able to determine points on Elliptical Arc with clockwise stroke': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M 50,100 A 100 50 0 1 1 150 150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);

        var centerParamPoints = Kinetic.Path.convertEndpointToCenterParameterization(50, 100, 150, 150, 1, 1, 100, 50, 0);

        var start = centerParamPoints[4];
        // 4 = theta
        var dTheta = centerParamPoints[5];
        // 5 = dTheta
        var end = centerParamPoints[4] + dTheta;
        var inc = Math.PI / 6.0;
        // 30 degree resolution

        var p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], start, 0);
        c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

        if(dTheta < 0)// clockwise
        {
            for( t = start - inc; t > end; t -= inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        else// counter-clockwise
        {
            for( t = start + inc; t < end; t += inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], end, 0);
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

        var testpath = new Kinetic.Path({
            stroke: 'black',
            strokeWidth: 2,
            data: c
        });

        layer.add(testpath);
        stage.add(layer);
    },
    'Able to determine points on Elliptical Arc with counter-clockwise stroke': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M 250,100 A 100 50 0 1 0 150 150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);

        var centerParamPoints = Kinetic.Path.convertEndpointToCenterParameterization(250, 100, 150, 150, 1, 0, 100, 50, 0);

        var start = centerParamPoints[4];
        // 4 = theta
        var dTheta = centerParamPoints[5];
        // 5 = dTheta
        var end = centerParamPoints[4] + dTheta;
        var inc = Math.PI / 6.0;
        // 30 degree resolution

        var p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], start, 0);
        c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

        if(dTheta < 0)// clockwise
        {
            for( t = start - inc; t > end; t -= inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        else// counter-clockwise
        {
            for( t = start + inc; t < end; t += inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], end, 0);
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

        var testpath = new Kinetic.Path({
            stroke: 'black',
            strokeWidth: 2,
            data: c
        });

        layer.add(testpath);
        stage.add(layer);
    },
    'Able to determine points on Elliptical Arc when rotated': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M 250,100 A 100 50 30 1 0 150 150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);

        var centerParamPoints = Kinetic.Path.convertEndpointToCenterParameterization(250, 100, 150, 150, 1, 0, 100, 50, 30);

        var start = centerParamPoints[4];
        // 4 = theta
        var dTheta = centerParamPoints[5];
        // 5 = dTheta
        var end = centerParamPoints[4] + dTheta;
        var inc = Math.PI / 6.0;
        // 30 degree resolution
        var psi = centerParamPoints[6];
        // 6 = psi radians

        var p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], start, psi);
        c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

        if(dTheta < 0)// clockwise
        {
            for( t = start - inc; t > end; t -= inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, psi);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        else// counter-clockwise
        {
            for( t = start + inc; t < end; t += inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, psi);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], end, psi);
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

        var testpath = new Kinetic.Path({
            stroke: 'black',
            strokeWidth: 2,
            data: c
        });

        layer.add(testpath);
        stage.add(layer);
    },
    'getPointOnLine for different directions': function() {
        var origo = {
            x: 0,
            y: 0
        };

        var p, point;

        //point up left
        p = {
            x: -10,
            y: -10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(point.x < 0 && point.y < 0, 'The new point should be up left');

        //point up right
        p = {
            x: 10,
            y: -10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(point.x > 0 && point.y < 0, 'The new point should be up right');

        //point down right
        p = {
            x: 10,
            y: 10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(point.x > 0 && point.y > 0, 'The new point should be down right');

        //point down left
        p = {
            x: -10,
            y: 10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(point.x < 0 && point.y > 0, 'The new point should be down left');

        //point left
        p = {
            x: -10,
            y: 0
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(point.x == -10 && point.y == 0, 'The new point should be left');

        //point up
        p = {
            x: 0,
            y: -10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(Math.abs(point.x) < 0.0000001 && point.y == -10, 'The new point should be up');

        //point right
        p = {
            x: 10,
            y: 0
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(point.x == 10 && point.y == 0, 'The new point should be right');

        //point down
        p = {
            x: 0,
            y: 10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        test(Math.abs(point.x) < 0.0000001 && point.y == 10, 'The new point should be down');
    },
    'Borneo Map (has scientific notation: -10e-4)': function(containerId) {

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.75,
            x: 10,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var borneo = new Kinetic.Path({
            data: "m 136.68513,236.08861 c -0.63689,-0.67792 -0.75417,-1.28099 -1.03556,-5.32352 -0.26489,-3.80589 -0.4465,-4.81397 -1.09951,-6.1026 -0.51169,-1.00981 -0.98721,-1.54361 -1.375,-1.54361 -0.8911,0 -3.48931,-1.22828 -3.80975,-1.80103 -0.16294,-0.29089 -0.87295,-0.56825 -1.68693,-0.65886 -1.13423,-0.12629 -1.91094,0.0661 -4.02248,0.99633 -4.0367,1.77835 -5.46464,1.87106 -6.79674,0.44127 -0.51948,-0.55765 -0.64763,-1.12674 -0.64763,-2.87683 l 0,-2.18167 -0.87832,0.20996 c -0.48312,0.11549 -1.12041,0.33383 -1.41635,0.4852 -1.52799,0.78172 -4.61534,-0.0398 -5.55846,-1.47906 -0.30603,-0.46718 -1.06518,-1.19501 -1.68667,-1.61739 -1.27136,-0.86387 -1.62607,-0.6501 -1.63439,0.98494 -0.007,1.00822 -0.76687,2.38672 -1.31885,2.38672 -0.17579,0 -1.27182,0.66553 -2.4356,1.47895 -4.016775,2.8076 -6.006455,3.29182 -7.693525,1.87231 -0.52348,-0.44054 -1.43004,-1.00203 -2.01445,-1.24775 -1.35902,-0.57143 -2.10139,-0.21496 -5.36296,2.57523 -2.00259,1.71315 -2.55857,2.02869 -3.57441,2.02869 -0.66172,0 -1.31931,-0.17966 -1.46135,-0.39925 -0.27734,-0.42865 -0.75823,-5.15099 -0.87007,-8.54399 -0.0708,-2.14922 -0.41754,-3.83281 -0.78935,-3.83281 -0.1176,0 -0.45993,0.28746 -0.76078,0.63881 -0.66657,0.77849 -3.4572,0.87321 -4.70537,0.15969 -1.29782,-0.7419 -2.38029,-0.55672 -5.01545,0.85797 -2.16783,1.16385 -2.75945,1.33971 -4.5666,1.35746 -1.66762,0.0163 -2.276,-0.12217 -3.09174,-0.70405 -0.61985,-0.44211 -1.09397,-0.5977 -1.21663,-0.39925 -0.32993,0.53385 -2.25686,0.37294 -2.80642,-0.23436 -0.27856,-0.30774 -0.65658,-0.95453 -0.8401,-1.43731 -0.42448,-1.11632 -0.91809,-1.10316 -3.01531,0.0804 -0.93379,0.52702 -2.13107,0.9582 -2.66054,0.9582 -1.46554,0 -1.97734,-0.82307 -2.19476,-3.52955 -0.10515,-1.30865 -0.4137,-2.90864 -0.68575,-3.55553 -0.37975,-0.90312 -0.41736,-1.39768 -0.16196,-2.13038 0.35544,-1.01957 -0.24711,-3.50377 -1.40121,-5.77657 -0.48023,-0.94578 -0.50724,-1.33822 -0.19445,-2.82926 0.40575,-1.93441 -0.0409,-3.36568 -1.16059,-3.72114 -0.3255,-0.10331 -0.93466,-0.55279 -1.35374,-0.99885 -1.12569,-1.19829 -1.03821,-2.92553 0.22088,-4.35957 0.85079,-0.96896 1.01308,-1.45348 1.2082,-3.60666 l 0.22545,-2.48734 -1.16949,-1.19763 c -0.64324,-0.65869 -1.26203,-1.64897 -1.37517,-2.20061 -0.13388,-0.6528 -0.56813,-1.23242 -1.24372,-1.66009 l -1.03807,-0.65709 0,1.0782 c 0,0.59301 -0.21786,1.38922 -0.48413,1.76937 -0.68007,0.97099 -4.56312,2.96438 -5.77445,2.96438 -1.55729,0 -1.88611,-0.67097 -1.88611,-3.84837 0,-3.52819 0.41663,-4.13666 2.83284,-4.13666 1.49279,0 1.57631,-0.0396 1.09598,-0.51996 -0.4316,-0.43155 -0.69566,-0.4587 -1.55343,-0.15971 -0.56839,0.19815 -1.3354,0.35443 -1.70442,0.34729 -0.86278,-0.0167 -2.61563,-1.51607 -3.02205,-2.58498 -0.3513,-0.92403 -0.12267,-3.38466 0.34119,-3.67132 0.16474,-0.1018 -0.39367,-0.50661 -1.24085,-0.89959 -2.032471,-0.94281 -2.321421,-1.35146 -2.487701,-3.51839 -0.0772,-1.00533 -0.30119,-2.31552 -0.4979,-2.91152 -0.48076,-1.45668 -0.16499,-2.30832 0.90163,-2.43139 0.843711,-0.0974 0.860511,-0.14171 0.748911,-1.97594 -0.0696,-1.14269 0.0236,-1.96143 0.23793,-2.09396 0.47223,-0.29188 -2.501621,-3.97433 -3.330171,-4.12358 -0.34456,-0.062 -0.75956,-0.23921 -0.92229,-0.39365 -0.3459,-0.32835 -0.78945,-2.83658 -0.98794,-5.58637 -0.0769,-1.06517 -0.35848,-2.55647 -0.62576,-3.31402 -0.71739,-2.03331 -0.61465,-2.55112 0.76687,-3.86532 l 1.25273,-1.19173 -0.46915,-1.36178 c -0.53343,-1.54826 -0.33638,-2.99085 0.48923,-3.5815 0.65547,-0.46898 1.32731,-2.61652 1.52388,-4.87126 0.13191,-1.51252 0.2658,-1.7153 2.531131,-3.83281 2.21127,-2.06705 2.41106,-2.36144 2.64687,-3.89989 0.31881,-2.07979 0.74608,-2.60075 2.34208,-2.85597 0.69615,-0.11132 1.66359,-0.53718 2.14988,-0.94636 1.89204,-1.59201 4.16695,-1.77416 4.16695,-0.33363 0,0.40454 -0.23171,1.4157 -0.51499,2.24703 -0.28322,0.83134 -0.45486,1.57164 -0.38139,1.64512 0.0735,0.0735 1.32057,0.92807 2.77127,1.89909 2.57827,1.72574 2.68847,1.7655 4.89522,1.7655 1.74495,0 2.50706,-0.15424 3.35669,-0.67937 0.91121,-0.56315 1.2344,-0.61779 1.88934,-0.3194 0.43449,0.19798 1.19684,0.35997 1.69411,0.35997 1.03354,0 1.51204,0.45563 1.67033,1.59058 0.10938,0.78459 0.54215,1.02641 2.56344,1.43244 0.47079,0.0946 1.07249,0.38843 1.33713,0.65302 0.29826,0.29829 0.55659,0.35879 0.67998,0.15922 0.3007,-0.48659 2.51019,-0.38548 3.21433,0.1471 0.90129,0.6817 0.99638,0.6211 1.2201,-0.77786 0.1114,-0.69691 0.4878,-1.53284 0.83642,-1.85761 0.34861,-0.32477 0.76943,-1.29968 0.93532,-2.16645 0.36198,-1.89196 1.67658,-4.95214 2.37708,-5.53353 0.45941,-0.38127 0.45882,-0.50661 -0.007,-1.40586 -0.92929,-1.79695 -1.07762,-2.78281 -0.59325,-3.94207 0.32267,-0.77223 0.71393,-1.13742 1.3562,-1.26589 l 0.90282,-0.18055 -0.12723,-3.168 -0.1273,-3.168021 1.13626,0 c 0.6249,0 1.22425,0.14254 1.33189,0.31676 0.11034,0.17851 0.92013,-0.22348 1.85538,-0.92103 2.57554,-1.920815 3.6054,-2.317745 6.74013,-2.597735 2.80648,-0.25066 4.59942,-0.61535 8.65387,-1.76019 1.05398,-0.29761 2.49129,-0.66582 3.19396,-0.81822 2.5583,-0.55486 5.16562,-1.18239 7.665675,-1.84504 2.13376,-0.56557 2.7297,-0.87493 3.61346,-1.87587 1.968,-2.22882 6.60136,-8.28119 7.54474,-9.85529 0.55323,-0.92329 1.87182,-2.29956 3.218,-3.35904 2.58733,-2.03622 6.23997,-6.36804 7.37413,-8.74536 0.64823,-1.35877 0.73216,-1.8923 0.56253,-3.57654 -0.2316,-2.3005 -0.44696,-2.16353 3.91929,-2.49301 3.85817,-0.29115 6.65679,-1.49266 9.77494,-4.19656 2.99721,-2.5991 5.77546,-4.25711 7.14234,-4.26265 1.34414,-0.005 2.18866,0.95864 1.93792,2.21228 l -0.19117,0.956 1.02783,-0.62674 c 0.66237,-0.40384 1.60221,-0.62716 2.64269,-0.62793 1.73168,-10e-4 3.01752,-0.70122 4.31246,-2.34742 0.89476,-1.13744 0.70339,-1.77317 -0.78398,-2.60556 -0.68465,-0.38314 -1.52661,-1.0834 -1.87097,-1.55613 -0.54929,-0.75408 -0.57635,-0.97959 -0.22059,-1.83856 0.52649,-1.27114 3.93115,-4.11017 4.92904,-4.11017 0.41859,0 1.13672,0.14279 1.59566,0.3173 1.3868,0.52725 2.80354,-0.28364 3.6531,-2.09077 0.39579,-0.84216 1.25891,-2.18904 1.91795,-2.99304 1.48075,-1.80638 2.89866,-4.72745 2.89866,-5.97158 0,-0.75538 0.58238,-1.50827 3.06391,-3.96067 2.7523,-2.72002 6.3045,-6.98689 7.09162,-8.51845 0.1634,-0.318 0.3954,-1.22055 0.51562,-2.00566 0.25722,-1.68064 1.72382,-4.16066 2.46108,-4.16147 0.9766,-10e-4 2.12459,1.22566 2.31255,2.47132 0.0998,0.66067 0.27255,1.72385 0.384,2.36261 0.1155,0.66184 0.0472,1.45181 -0.15868,1.83656 -0.24595,0.45955 -0.25349,0.67517 -0.0229,0.67517 0.51299,0 2.24002,-2.8963 2.24002,-3.75665 0,-0.8354 0.53999,-2.02246 1.08581,-2.38694 0.19334,-0.12906 0.94292,-0.23686 1.66584,-0.23955 1.77381,-0.007 2.99753,0.95517 2.99753,2.35583 0,0.57021 0.21732,1.76868 0.48299,2.66324 l 0.48306,1.6265 0.92969,-0.92972 c 1.22287,-1.22287 2.47045,-1.24866 2.92225,-0.0604 0.22007,0.57891 0.22505,1.10057 0.0151,1.56166 -0.27458,0.60266 -0.20454,0.71514 0.53993,0.86809 1.18369,0.24315 3.55993,2.06175 3.91536,2.99648 0.59574,1.567 0.35077,3.19938 -0.65144,4.34081 -0.94122,1.07196 -0.94371,1.08593 -0.60505,3.28498 0.18712,1.21464 0.38753,2.25901 0.44545,2.32083 0.2451,0.26166 3.313,-0.9897 3.8317,-1.56289 1.62004,-1.79007 4.61934,0.34098 4.61934,3.28202 0,0.59127 -0.10771,1.21358 -0.23953,1.38292 -0.13176,0.16934 0.1309,-0.10749 0.58362,-0.61518 l 0.82309,-0.92308 2.45525,0.57882 c 3.13892,0.74002 4.67982,1.61224 5.4805,3.10222 0.49583,0.92281 0.83285,1.18897 1.50604,1.18964 0.49596,0.001 1.31643,0.39216 1.91637,0.91477 0.57707,0.50266 1.55223,1.17153 2.16717,1.48639 0.61481,0.31487 1.27608,0.78847 1.46955,1.05246 0.39952,0.54529 2.27154,0.59949 2.79024,0.0808 0.66827,-0.66817 2.3398,-0.37712 3.37202,0.58712 0.87138,0.81397 0.99174,1.13441 0.98984,2.63507 -0.007,3.14067 -1.18875,4.18009 -7.03587,6.17196 -3.71253,1.26471 -4.57971,1.44538 -6.93747,1.44538 -2.24861,0 -2.8547,-0.11412 -3.66279,-0.68954 -0.94626,-0.67382 -0.99252,-0.67652 -2.02854,-0.11858 -0.5831,0.31401 -1.383,0.91461 -1.77767,1.33464 l -0.71741,0.76372 1.56061,1.58439 c 1.40266,1.42413 1.61342,1.53657 2.08298,1.11159 0.76662,-0.69377 2.74012,-0.60035 3.50647,0.16598 0.78732,0.78729 0.81648,1.55502 0.0799,2.09925 -0.83901,0.61987 -0.0838,1.18313 1.57667,1.17578 1.61709,-0.007 2.17621,0.35138 2.17621,1.3954 0,0.59148 -0.17166,0.7594 -0.7769,0.7594 -0.48332,0 -0.84989,0.22977 -0.96998,0.60798 -0.26508,0.83534 -2.11417,1.6503 -4.4471,1.96007 -1.90366,0.25276 -5.24254,1.10817 -7.59191,1.94503 -1.09649,0.39058 -1.18265,0.52074 -1.37769,2.08163 -0.25454,2.03716 -0.67941,2.42422 -2.5359,2.31005 -0.79407,-0.0488 -1.53022,-0.002 -1.6359,0.10335 -0.10561,0.10567 0.32091,0.60142 0.94784,1.10167 0.62693,0.50027 1.13993,1.14348 1.13993,1.4294 0,0.28592 0.21555,0.69878 0.47906,0.91747 1.02219,0.84833 0.30092,2.43799 -1.55295,3.4227 -0.52676,0.27977 -0.48306,0.33828 0.3819,0.51126 1.25557,0.25111 1.75716,1.19504 1.48651,2.79737 -0.15363,0.90893 -0.36794,1.2537 -0.77945,1.2537 -1.42926,0 -3.3719,-2.70726 -2.60535,-3.63084 0.50081,-0.60337 -1.57909,-0.86467 -4.87669,-0.61268 -2.37814,0.18174 -2.45709,0.21144 -1.43732,0.54105 0.67928,0.21956 1.25642,0.70374 1.55806,1.30695 0.41505,0.8301 0.62988,0.94551 1.607,0.86325 0.85566,-0.072 1.30196,0.0903 1.84916,0.67285 0.87917,0.9358 1.26172,2.8927 0.69828,3.57163 -0.45639,0.54984 -2.57856,0.65234 -3.08199,0.14886 -0.23101,-0.23099 -0.45619,-0.1844 -0.73549,0.15214 -0.34547,0.41624 -0.19184,0.54147 1.0828,0.88237 2.06555,0.55246 2.84678,1.34484 2.63181,2.66945 -0.12598,0.77608 -0.0111,1.1894 0.4446,1.60189 0.33781,0.30575 0.61514,0.85703 0.61626,1.22506 0,0.40883 0.37665,0.8823 0.9648,1.21704 0.60282,0.34303 1.20761,1.11895 1.61742,2.075045 0.37403,0.87256 1.58191,2.485991 2.81788,3.764031 2.72839,2.82133 3.02053,3.36933 2.75178,5.16167 -0.1765,1.17708 -0.43169,1.57351 -1.52084,2.36249 -0.71977,0.52142 -1.65712,1.46074 -2.08292,2.08735 -0.66074,0.97241 -0.72193,1.26543 -0.41747,2.00042 0.19615,0.47362 1.00666,1.25369 1.80099,1.7335 0.79426,0.47981 1.6716,1.26687 1.94966,1.74904 0.56868,0.98649 2.52869,2.54597 4.42534,3.52103 0.69619,0.35796 1.69715,1.10835 2.22417,1.66754 0.52702,0.55918 1.52124,1.30625 2.2095,1.66012 1.53401,0.78869 4.33814,2.85596 4.33814,3.19814 0,0.64314 2.36392,2.78408 3.29157,2.98114 3.11842,0.66236 2.71293,3.44603 -0.88801,6.09705 l -1.28558,0.94651 -5.32705,-0.0434 c -4.41945,-0.036 -5.46766,-0.13568 -6.15336,-0.58491 -1.12014,-0.734 -3.69123,-1.21344 -3.69123,-0.68833 0,0.88679 -1.22942,1.53613 -2.56839,1.35654 -1.12847,-0.15136 -1.45376,-0.0446 -2.40271,0.78858 -0.60361,0.52999 -1.09747,1.11694 -1.09747,1.30432 0,0.61061 -2.01766,4.84486 -2.64971,5.56065 -0.83547,0.94619 -1.93367,5.6836 -1.50374,6.48688 0.50015,0.93456 0.37973,2.29694 -0.31815,3.59909 -0.77894,1.45317 -0.79106,1.89641 -0.10398,3.81328 0.46,1.28334 0.67568,1.5151 1.48658,1.597 1.48403,0.14992 1.74197,0.90287 0.92798,2.70938 -0.38137,0.84625 -0.78522,2.35688 -0.89764,3.35694 -0.11931,1.06047 -0.42298,2.01508 -0.72888,2.29042 -0.68334,0.61527 -3.70237,1.79849 -4.6086,1.8063 -0.72042,0.007 -3.41815,2.85544 -5.35745,5.65834 -1.05175,1.52015 -2.85327,2.4565 -4.21281,2.18961 -0.75535,-0.14829 -0.87832,-0.0687 -0.87832,0.56857 0,0.91256 -0.75207,1.60008 -2.29008,2.09359 -1.4381,0.46144 -1.7214,0.80341 -1.96204,2.3682 -0.23809,1.54838 -0.68406,2.08325 -2.35507,2.82408 l -1.33701,0.5928 0.77815,0.77808 c 0.69428,0.6944 0.77808,1.05197 0.77808,3.32499 0,1.85231 -0.13241,2.67923 -0.48529,3.03212 -0.43398,0.43402 -0.35818,0.52049 0.71872,0.81954 0.66212,0.18388 1.51875,0.33512 1.9036,0.3361 0.38485,0.001 0.78136,0.13367 0.88094,0.29487 0.25866,0.41856 -0.38281,4.69924 -0.97325,6.49419 l -0.49911,1.51716 -1.65116,-0.001 -1.65116,-10e-4 0.0983,3.6244 0.0984,3.6244 -1.14753,1.00754 c -0.63119,0.55415 -1.34035,1.00754 -1.57601,1.00754 -0.28893,0 -0.47605,0.57495 -0.57491,1.76696 -0.11787,1.42104 -0.33794,1.96816 -1.1244,2.79476 -1.13233,1.19012 -2.96046,4.69205 -2.96046,5.671 0,1.11194 -0.56115,1.80916 -1.6279,2.02253 -0.55663,0.11131 -1.67566,0.67436 -2.48682,1.25124 -1.22006,0.86773 -6.20079,3.10238 -6.91473,3.10238 -0.11119,0 -1.23238,0.43908 -2.49148,0.97576 -1.25917,0.53667 -2.86172,1.21939 -3.56125,1.51716 -0.69952,0.29776 -3.03704,1.4397 -5.19451,2.53764 -2.15747,1.09794 -4.25494,1.99626 -4.66121,1.99626 -0.4062,0 -1.06176,-0.34404 -1.4569,-0.76453 z",
            fill: "blue"
        });
        layer.add(borneo);
        stage.add(layer);
    }
};

Test.Modules.SPRITE = {
    'add sprite': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

            var anims = {
                standing: [{
                    x: 0,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 52,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 105,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 158,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 210,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 262,
                    y: 0,
                    width: 49,
                    height: 109
                }],

                kicking: [{
                    x: 0,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 45,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 95,
                    y: 109,
                    width: 63,
                    height: 98
                }, {
                    x: 156,
                    y: 109,
                    width: 70,
                    height: 98
                }, {
                    x: 229,
                    y: 109,
                    width: 60,
                    height: 98
                }, {
                    x: 287,
                    y: 109,
                    width: 41,
                    height: 98
                }]
            };

            //for(var n = 0; n < 50; n++) {
            sprite = new Kinetic.Sprite({
                //x: Math.random() * stage.getWidth() - 30,
                x: 200,
                //y: Math.random() * stage.getHeight() - 50,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: anims,
                index: 0,
                frameRate: Math.random() * 6 + 6,
                frameRate: 10,
                draggable: true,
                shadowColor: 'black',
            	shadowBlur: 3,
            	shadowOffset: [3, 1],
            	shadowOpacity: 0.3
            });

            layer.add(sprite);
            sprite.start();
            //}

            stage.add(layer);

            // kick once
            setTimeout(function() {
                sprite.setAnimation('kicking');

                sprite.afterFrame(5, function() {
                    sprite.setAnimation('standing');
                });
            }, 2000);
            setTimeout(function() {
                sprite.stop();
            }, 3000);
            //document.body.appendChild(layer.bufferCanvas.element)
        };
        imageObj.src = '../assets/scorpion-sprite.png';
    }
};

Test.Modules.REGULAR_POLYGON = {
    'add regular polygon triangle': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.Plugins.RegularPolygon({
            x: 200,
            y: 100,
            sides: 3,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            offset: {
                x: 0,
                y: -50
            }
        });

        layer.add(poly);
        stage.add(layer);

    },
    'add regular polygon square': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.Plugins.RegularPolygon({
            x: 200,
            y: 100,
            sides: 4,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    },
    'add regular polygon pentagon': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.Plugins.RegularPolygon({
            x: 200,
            y: 100,
            sides: 5,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    },
    'add regular polygon octogon': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var poly = new Kinetic.Plugins.RegularPolygon({
            x: 200,
            y: 100,
            sides: 8,
            radius: 50,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar'
        });

        layer.add(poly);
        stage.add(layer);
    }
};
Test.Modules.STAR = {
    'add five point star': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Plugins.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            name: 'foobar',
            offset: {
                x: 0,
                y: -70
            },
            scale: {
                x: 0.5,
                y: 0.5
            }
        });

        layer.add(star);
        stage.add(layer);
    },
    'add five point star with line join and shadow': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
            x: 250,
            y: 75,
            width: 100,
            height: 100,
            fill: 'red'
        });

        var star = new Kinetic.Plugins.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: "round",
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: [20, 20],
            shadowOpacity: 0.5,
            draggable: true
        });

        layer.add(rect);
        layer.add(star);

        stage.add(layer);

        test(star.getLineJoin() === 'round', 'lineJoin property should be round');
        star.setLineJoin('bevel');
        test(star.getLineJoin() === 'bevel', 'lineJoin property should be bevel');

        star.setLineJoin('round');
    }
};

Test.Modules['TEXT PATH'] = {
    'Render Text Along Line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M 10,10 300,150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 1,
            data: c
        });

        layer.add(path);

        var textpath = new Kinetic.Plugins.TextPath({
            textStroke: 'black',
            textStrokeWidth: 1,
            textFill: 'orange',
            fontSize: '18',
            fontFamily: 'Arial',
            text: 'The quick brown fox jumped over the lazy dog\'s back',
            data: c
        });

        layer.add(textpath);
        stage.add(layer);
    },
    'Render Text Along two connected Bezier': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M10,10 C0,0 10,150 100,100 S300,150 400,50";
        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 1,
            data: c
        });

        layer.add(path);

        var textpath = new Kinetic.Plugins.TextPath({
            textStroke: 'black',
            textStrokeWidth: 1,
            textFill: 'orange',
            fontSize: '8',
            fontFamily: 'Arial',
            text: 'All the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            data: c
        });

        layer.add(textpath);
        stage.add(layer);

    },
    'Render Text Along Elliptical Arc': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 1,
            x: 50,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = "M 250,100 A 100 50 30 1 0 150 150";
        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 1,
            data: c
        });

        layer.add(path);

        var textpath = new Kinetic.Plugins.TextPath({
            textFill: 'black',
            fontSize: '10',
            text: 'All the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            data: c
        });

        layer.add(textpath);
        stage.add(layer);
    },
    'Render Text Along complex path': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 1024,
            height: 480,
            throttle: 80,
            scale: 0.25,
            x: 10,
            y: 10
        });
        var layer = new Kinetic.Layer();

        var c = 'M 955.92249,-42.126952 L 955.92249,-42.126952 L 955.92249,-42.126952 L 961.93262,212.9279 C 961.72797,213.3372 961.22315,215.2234 960.80572,215.5574 C 957.45077,218.2413 956.9054,218.3026 953.66869,216.6843 C 952.62164,216.1607 951.67338,214.3658 949.91236,214.8061 C 947.3405,215.4491 948.09281,215.8744 946.53166,217.4355 C 945.22315,218.744 943.52659,219.8744 943.52659,222.3188 C 943.52659,225.6087 944.62943,224.7909 946.15603,226.8264 C 947.55965,228.6979 948.18154,229.6696 948.78546,232.0852 C 949.37174,234.4304 951.2918,235.2197 952.16616,236.9685 C 953.11809,238.8723 956.44837,240.9001 955.17122,242.6029 C 955.17122,242.8772 955.27602,243.9657 955.17122,244.1055 C 954.37248,245.1705 952.25782,247.1195 951.79052,248.9887 C 951.25154,251.1447 951.97226,252.3937 951.41489,254.6232 C 950.9178,256.6116 949.53672,257.6472 949.53672,259.8821 C 949.53672,261.2894 949.87203,263.5578 950.66362,265.1409 C 951.32462,266.4629 953.24159,268.3158 953.66869,270.0242 C 954.03114,271.474 954.12634,273.8281 953.66869,275.6587 C 953.20033,277.5321 952.16616,278.7427 952.16616,280.9175 C 952.16616,281.7694 952.66216,286.9313 952.16616,287.3033 C 950.55129,287.3033 950.38215,287.5144 949.16109,288.4302 C 947.74898,289.4893 945.57047,291.4095 944.65349,292.9378 C 943.57061,294.7426 942.86906,296.6011 942.3997,298.9479 C 941.97063,301.0933 941.32659,303.0261 940.1459,304.2068 C 938.60102,305.7517 939.019,307.4128 939.019,309.8413 C 939.019,311.6467 939.44296,314.3005 938.26773,315.4758 C 937.15545,316.5881 934.88703,318.5361 934.88703,320.7346 C 934.88703,322.7058 934.79432,324.8714 935.26267,326.7448 C 935.72373,328.589 935.6383,330.6902 935.6383,332.7549 C 935.6383,334.5937 936.08895,337.1125 935.26267,338.765 C 933.38787,342.5146 935.26267,342.5858 935.26267,345.5264 C 935.61053,346.9179 935.6383,348.2383 935.6383,350.034 C 935.6383,351.5752 934.96036,354.5783 932.63323,353.4147 C 932.09123,353.1437 928.92886,348.8032 927.75,351.1609 C 926.64231,353.3763 926.87972,354.3829 928.12564,356.0442 C 929.10471,357.3496 930.01787,360.3569 928.12564,361.303 C 926.67006,362.0308 924.24963,362.5828 924.74494,365.0593 C 925.21304,367.3998 926.19847,367.8684 926.6231,369.567 C 926.7781,370.1869 927.80544,374.5783 926.24747,375.2014 C 924.2456,376.0022 920.63857,376.64 919.86171,378.5821 C 918.7844,381.2754 918.89909,381.8572 921.36424,383.0897 C 922.93947,383.8774 923.65296,384.6272 925.12057,386.0948 C 925.4026,386.3768 928.41848,391.3951 926.99874,392.1049 C 926.6231,392.2301 926.22599,392.3035 925.87184,392.4806 C 924.02717,393.4029 922.07311,394.7556 920.61297,395.4856 C 918.19436,396.6949 919.66034,398.0609 920.23734,400.3689 C 920.66358,402.0738 920.9143,404.1809 919.48607,405.2521 C 918.27148,406.163 916.40598,407.9567 914.60284,407.5059 C 912.7458,407.0416 911.06841,406.8699 909.71961,407.8815 C 908.08698,409.106 906.39997,410.6424 905.96328,412.3891 C 905.46424,414.3853 903.5041,416.8116 901.83132,417.648 C 900.14443,418.4914 897.73682,419.2163 895.82119,420.6531 C 894.39644,421.7216 891.99114,423.3808 890.93796,424.785 C 889.59804,426.5716 888.40557,428.0687 886.80599,429.6682 C 885.18365,431.2906 883.35936,432.8052 882.29839,434.9271 C 881.56876,436.3864 879.95545,436.9836 879.29333,438.3078 C 878.57656,439.7413 877.73542,441.3406 876.28826,442.0641 C 874.75553,442.8305 873.35007,443.456 871.40503,443.9423 C 867.75936,444.8537 869.30342,446.1864 868.7756,448.8255 C 868.7756,449.4008 868.88599,450.1518 868.7756,450.7037 C 868.4147,452.5082 867.97176,454.46 866.14617,454.46 C 863.87643,454.46 863.13519,452.5202 860.51167,452.9575 C 858.30041,453.326 855.7288,453.4708 853.75028,454.46 C 851.66578,455.5023 850.88183,456.6114 849.24268,457.8407 C 848.34172,458.5165 844.59521,461.2214 842.85692,461.2214 C 841.06194,461.2214 838.75283,461.625 837.59805,460.4702 C 836.02546,458.8976 834.59299,457.0331 834.59299,454.8357 C 834.59299,452.5753 834.44046,450.9268 833.09045,449.5768 C 831.22582,447.7122 830.88608,448.6344 829.33412,450.7037 C 827.57516,453.049 826.50225,455.876 824.07526,457.0895 C 820.97109,458.6416 819.33963,458.3772 818.44076,461.9727 C 817.87317,464.2431 816.93823,466.7246 816.93823,469.1097 C 816.93823,470.8675 817.70296,474.7173 816.93823,476.2468 C 816.14706,477.8291 812.41394,478.9791 810.9281,476.998 C 808.83845,474.2118 810.41749,473.2417 805.66924,473.2417 C 801.6473,473.2417 799.28347,473.0146 799.28347,477.3737 C 799.28347,479.1155 799.58784,484.5107 796.65404,484.5107 C 796.27841,484.5107 795.90277,484.5107 795.52714,484.5107 C 793.06311,484.5107 790.57051,484.2819 789.51701,486.3889 C 789.24153,486.9398 789.17021,490.492 788.39011,491.2721 C 785.76325,493.8989 789.66759,493.7526 790.26828,496.1553 C 790.57092,497.3659 791.29959,501.1341 790.26828,502.1654 C 788.37505,504.0587 788.1443,505.2726 787.63885,507.7999 C 787.12622,510.3631 787.28641,510.4294 784.25815,510.4294 C 779.52049,510.4294 778.62062,512.1783 781.25308,515.6882 C 782.04773,516.7478 784.15693,519.0183 785.76068,519.8202 C 787.2339,520.5568 788.2453,521.5264 787.63885,523.9522 C 787.29534,525.3262 785.38505,526.8783 785.38505,528.8354 C 785.38505,532.3304 785.96541,532.0452 787.63885,533.7186 C 789.35939,535.4392 791.26358,536.4988 790.64391,538.9775 C 790.07532,541.2518 787.846,540.5966 785.38505,540.1044 C 784.8577,539.9989 777.87238,538.1167 777.87238,538.2262 C 777.87238,538.3043 777.87238,541.4667 777.87238,543.1095 C 777.87238,545.7389 776.11001,547.6978 773.74042,549.1196 C 769.72179,551.5308 769.56137,548.92 765.85212,547.9927 C 764.43987,547.6396 762.84706,547.0925 762.84706,544.9876 C 762.84706,542.5025 764.72522,540.5566 764.72522,538.9775 C 764.72522,537.481 764.49962,535.4457 763.97396,533.343 C 763.53464,531.5857 763.96677,529.2128 760.96889,529.9623 C 759.74476,530.2683 755.76059,530.9158 755.3344,529.211 C 754.79258,527.0438 753.83472,525.0819 752.32933,523.5765 C 751.7239,522.9711 748.78535,518.481 747.07047,520.1958 C 745.42956,521.8367 745.1923,522.8794 745.1923,525.4547 C 745.1923,529.5231 743.80555,527.5927 741.43597,529.9623 C 739.21241,532.1859 738.84328,532.0691 738.05527,535.2212 C 737.62578,536.9391 737.33255,538.9489 736.17711,540.1044 C 735.37222,540.9093 731.5352,542.6268 730.91824,543.8607 C 729.89113,545.9149 730.31425,546.7847 731.29388,548.744 C 731.93347,550.0231 732.94949,551.8879 732.42078,554.0028 C 731.86797,556.214 729.92914,558.5699 727.16191,559.2617 C 726.16187,559.7617 724.82639,560.5029 723.78121,560.7642 C 721.91594,561.2305 719.64925,561.351 719.64925,564.1449 C 719.64925,566.832 719.04019,568.7236 721.15178,569.7794 C 722.21289,570.31 724.72561,571.2926 725.28375,572.4088 C 726.18968,574.2207 726.03501,576.214 726.03501,578.419 C 726.03501,580.9518 724.90811,582.9761 724.90811,585.1804 C 724.90811,587.587 724.17206,589.3326 725.28375,590.8149 C 726.38582,592.2843 727.68532,592.9085 728.28881,595.3225 C 728.47077,596.0503 729.29883,599.6882 728.66444,600.957 C 728.20299,601.8799 726.62388,604.7133 724.90811,604.7133 C 722.23081,604.7133 719.55156,603.2108 717.77108,603.2108 C 712.9722,603.2108 711.01958,602.0443 709.88279,606.5915 C 709.52114,608.038 708.85871,610.3121 708.38026,612.2259 C 707.78279,614.6158 706.87772,616.6877 706.87772,619.363 C 706.87772,621.8398 706.7087,624.1711 706.12646,626.5 C 705.78303,627.8737 704.58011,630.6495 702.74576,631.3832 C 700.14612,632.4231 699.90837,632.6269 696.73563,633.2614 C 695.19072,633.5704 692.38471,634.0127 690.34987,634.0127 C 687.92024,634.0127 684.24023,633.3112 682.08594,634.3883 C 680.51621,635.1732 677.63742,637.5327 677.20271,639.2715 C 676.32889,642.7668 669.65019,641.1298 666.68498,639.6472 C 665.51347,639.0614 662.57658,637.112 662.17738,635.5152 C 661.57521,633.1065 663.16351,629.2235 662.17738,627.2513 C 661.26634,625.4292 659.87344,623.4448 658.42105,621.9924 C 657.38134,620.9527 655.38855,620.0777 654.28908,618.6117 C 653.089,617.0116 651.62053,616.0553 650.15712,614.1041 C 648.34003,611.6813 647.12666,612.2259 643.77136,612.2259 C 639.94754,612.2259 634.27092,612.8011 630.99983,610.3478 C 628.83169,608.7217 627.09631,607.7996 625.74097,605.0889 C 624.63961,602.8862 624.51407,601.3082 623.8628,598.7032 C 623.8628,597.1031 624.2465,594.9791 623.8628,593.4443 C 623.39918,591.5898 621.23337,589.3243 621.23337,587.4342 C 621.23337,587.1837 621.29411,586.9258 621.23337,586.6829 C 620.53685,583.8968 622.36027,582.4393 622.36027,580.6728 C 622.36027,578.1478 621.87342,577.1809 620.10647,575.4139 C 619.11396,574.4214 614.71345,572.543 612.96944,574.287 C 611.60526,575.6512 609.17921,577.309 606.95931,578.419 C 604.01326,579.892 598.66588,576.9755 597.19285,579.9215 C 596.40756,581.4921 595.76926,583.6587 595.31468,585.9316 C 594.88705,588.0698 594.09657,589.556 591.55835,590.0636 C 590.26591,590.3221 585.80562,591.0513 585.17259,592.3174 C 584.45323,593.7561 582.33804,595.3917 581.79189,597.5763 C 581.21425,599.8868 580.53762,600.7708 578.78683,602.0839 C 576.60544,603.7199 574.24457,604.0233 571.27416,602.8351 C 569.56134,602.15 566.96195,601.3583 564.51277,601.7082 C 562.15094,602.0456 560.7219,604.7047 559.2539,604.3377 C 556.608,603.6762 556.41629,603.5592 554.74631,601.3326 C 553.7801,600.0443 552.83677,595.5353 551.36561,594.9468 C 549.22437,594.0903 546.63624,594.001 543.85294,593.4443 C 541.39906,592.9535 538.87331,593.0687 536.34028,593.0687 C 532.49916,593.0687 532.93906,592.2969 530.70579,590.0636 C 529.57858,588.9364 527.94151,588.118 525.82255,587.0585 C 523.85495,586.0747 523.02163,585.6928 520.56369,586.3073 C 518.15725,586.9089 517.4765,588.4877 515.68046,588.9367 C 514.53264,589.2237 511.38458,588.643 510.04596,589.3123 C 508.49749,590.0866 507.19267,590.5834 506.66527,592.693 C 506.20828,594.521 505.99947,595.9598 504.7871,597.5763 C 503.10137,599.8239 501.43481,599.4686 499.1526,598.3275 C 496.74377,597.1231 496.63249,597.7484 493.89374,597.2006 C 491.45635,596.7131 490.45647,596.313 488.63487,594.9468 C 486.20245,593.1225 485.84728,591.7342 484.87854,589.3123 C 484.34805,587.9861 483.82138,584.0535 482.24911,584.0535 C 479.1858,584.0535 478.32694,584.2633 476.23898,582.1753 C 475.01433,580.9507 474.104,579.7043 472.85828,578.0433 C 471.87387,576.7308 471.15841,575.0383 468.72632,575.0383 C 465.62648,575.0383 465.0931,574.4101 463.09182,572.4088 C 461.80618,571.1232 459.77548,570.155 457.45733,570.155 C 454.22738,570.155 453.13567,570.2034 450.69593,572.0332 C 449.01793,573.2917 445.74427,574.287 443.5589,574.287 C 441.14907,574.287 438.88122,574.5776 436.7975,573.5357 C 435.27776,572.7759 434.01441,571.5961 432.28991,570.9063 C 429.9965,569.989 427.79078,568.6525 425.15288,568.6525 C 423.40022,568.6525 419.8328,569.7488 418.39148,569.0281 C 418.14106,568.9029 417.89064,568.7777 417.64021,568.6525 C 415.49479,567.5798 416.55622,567.2358 415.38641,564.8962 C 414.77237,563.6681 414.63515,562.1788 414.63515,560.0129 C 414.63515,558.3145 415.04465,556.0165 414.63515,554.3784 C 414.06491,552.0975 414.24886,549.8602 412.38135,547.9927 C 411.40995,547.0213 409.24156,545.0938 408.62502,543.8607 C 408.07318,542.757 407.08617,540.8193 405.99559,539.7288 C 404.23882,537.972 404.86869,537.4962 404.86869,535.2212 C 404.86869,532.3223 402.92378,530.8222 402.23926,528.0841 C 402.03511,527.2676 400.20775,523.9522 399.23419,523.9522 C 397.40724,523.9522 395.17436,524.3278 393.59969,524.3278 C 392.1471,524.3278 388.62445,524.895 387.9652,523.5765 C 387.16017,521.9665 386.46266,520.8647 386.46266,518.3177 C 386.46266,517.2392 387.06995,513.4929 386.46266,512.6832 C 385.44124,511.3213 383.94518,508.9268 382.3307,508.9268 C 380.0442,508.9268 378.68472,509.6505 377.07184,510.0537 C 374.43842,510.7121 375.12089,510.9506 374.06677,513.0588 C 372.99551,515.2013 371.43568,515.6866 369.55917,513.8101 C 367.11608,511.367 367.54854,511.9833 366.17847,513.8101 C 364.4331,516.1372 362.02692,517.942 359.04145,517.942 C 356.27733,517.942 354.79253,517.3325 353.78258,515.3126 C 352.71976,513.187 352.20547,512.3075 349.65062,512.3075 C 347.43943,512.3075 345.67638,511.8115 345.14302,509.6781 C 344.69437,507.8835 343.8574,505.0515 342.51359,504.0436 C 341.49931,503.2829 339.32282,500.99 337.25472,502.5411 C 336.12724,503.3867 330.59067,511.5766 329.49596,511.5766 L 339.92116,9.4291543 L 531.3294,9.5579943 C 531.53498,9.8775343 531.74056,10.197084 531.94614,10.516624 C 532.70213,11.691684 530.89998,12.894794 530.62953,14.247024 C 530.42067,15.291354 532.94855,14.371684 533.70163,15.124764 C 533.96143,15.384574 533.06188,17.795104 533.26276,18.196854 C 533.6241,18.919554 537.09651,16.118584 537.43203,15.783074 C 538.52925,14.685844 541.26067,15.533334 542.2596,15.783074 C 544.36225,16.308734 544.53484,13.969904 545.77057,16.441374 C 546.72008,18.340404 548.8757,18.577754 550.81758,18.855164 C 551.5334,18.957424 552.36959,15.108804 552.7925,14.685894 C 553.70371,13.774684 554.04733,13.026284 554.76742,14.466454 C 555.55609,16.043794 556.96728,16.885754 558.27838,18.196854 C 559.14892,19.067394 560.36843,19.874104 561.35048,20.610644 C 562.42985,21.420174 563.12715,21.998014 564.20314,22.805004 C 565.9662,24.127294 567.78898,25.511804 570.12789,26.096534 C 572.7652,26.755854 576.55367,27.553934 578.90531,28.729754 C 580.9132,29.733704 583.43718,29.459644 585.48837,30.485234 C 586.49144,30.986774 588.94826,31.133324 590.09651,31.362974 C 591.42028,32.024864 591.77294,34.338314 592.07143,35.532254 C 592.3559,36.670124 593.11993,38.320014 593.82691,39.262654 C 594.69143,40.415344 596.17315,41.423224 597.11844,41.895874 C 598.26675,42.470034 600.11464,43.649294 601.28771,44.529104 C 602.4452,45.397214 603.546,45.151114 603.04319,47.162324 C 602.73764,48.384554 601.38101,48.605074 600.62941,49.356674 C 599.50817,50.477904 599.93932,51.519254 600.84884,52.428774 C 601.81016,53.390084 603.26382,53.305314 604.14037,52.428774 C 604.62824,51.940894 608.18038,52.428774 608.96795,52.428774 C 611.1468,52.428774 610.66216,51.127474 612.47891,50.673284 C 612.63759,50.633624 612.77149,50.526994 612.91778,50.453854 C 614.68717,49.569154 616.9206,51.445064 617.9648,49.356674 C 618.52936,48.227544 619.56541,48.220674 619.93972,46.723454 C 620.25133,45.477014 620.37729,44.531694 621.03689,43.212484 C 621.76915,41.747964 621.9135,40.434484 622.79237,39.262654 C 623.77356,37.954414 624.27391,36.972204 625.64503,36.629424 C 627.98413,36.044654 628.95445,36.884634 629.81431,38.604344 C 630.5868,40.149334 629.04661,41.566394 628.05882,42.554184 C 627.03053,43.582464 626.94563,46.049134 627.83939,46.942884 C 628.71859,47.822094 631.7203,46.960114 632.66697,46.723454 C 635.14429,46.104124 638.40825,46.723454 641.00551,46.723454 C 642.99376,46.723454 643.25279,47.744904 644.29704,49.137244 C 645.27121,50.436134 645.05681,51.584644 643.63873,52.648204 C 642.199,53.728004 640.62809,54.372964 639.25003,55.061994 C 637.13418,56.119914 635.43133,55.127564 633.54471,54.184254 C 631.95211,53.387954 630.44161,53.389994 628.71713,53.964814 C 626.84122,54.590124 627.42091,55.720304 625.20616,55.720304 C 623.21044,55.720304 622.67528,55.410144 621.25633,54.842564 C 619.91862,54.307474 619.00883,54.278974 617.9648,55.061994 C 617.10854,55.704184 616.39298,55.720304 614.8927,55.720304 C 613.05499,55.720304 612.78965,55.409564 611.82061,56.378604 C 611.11873,57.080484 611.94664,57.914654 609.40682,57.914654 C 607.90864,57.914654 607.56008,59.135134 606.55416,59.889574 C 605.2063,60.900474 602.08634,60.328444 600.40997,60.328444 C 598.82692,60.328444 597.23216,60.282954 596.02126,60.767314 C 592.93299,62.002624 597.05347,63.219724 597.77675,63.400534 C 599.71594,63.885334 600.39327,64.211484 600.84884,66.033764 C 601.33813,67.990904 602.14535,68.474354 603.48206,66.692064 C 604.91144,64.786234 602.91352,64.497714 606.77359,64.497714 C 607.59464,64.497714 608.63043,67.232284 608.96795,67.569814 C 610.45793,69.059794 611.16665,70.095494 613.13722,71.080774 C 614.46498,71.744654 616.30615,67.595574 616.64819,66.911504 C 617.28296,65.641964 617.99069,64.704204 619.28141,64.058844 C 621.30547,63.046814 622.75619,64.278284 624.76729,64.278284 C 626.50942,64.278284 627.61995,65.003454 627.61995,62.742234 C 627.61995,61.212584 627.63406,61.199134 628.93656,60.547884 C 628.93656,59.039954 631.8995,61.398604 633.10584,62.303364 C 634.22905,63.145774 635.25806,64.560214 636.6168,65.375454 C 638.02819,66.222284 639.45789,65.179164 639.90833,64.278284 C 640.50672,63.081494 642.69629,63.368184 643.63873,63.839414 C 644.9694,64.504744 646.71554,64.500074 648.02744,65.156024 C 649.65658,65.970594 651.25018,66.091894 652.63558,67.130944 C 654.5709,68.582434 655.72441,69.284754 658.12146,69.764164 C 660.76933,70.293734 662.17378,70.473704 664.26565,71.519644 C 666.22906,72.501344 668.08427,73.121854 669.75154,74.372304 C 670.99777,75.306984 673.61008,75.688914 675.23742,75.688914 C 678.09495,75.688914 679.5978,74.715624 682.03992,73.494564 C 683.61178,72.708634 685.09563,72.194334 686.20919,71.080774 C 687.25214,70.037824 688.09533,68.975204 689.28128,67.789244 C 690.81968,66.250844 691.90496,66.472634 694.10886,66.472634 C 695.98476,66.472634 697.61589,67.130944 699.37531,67.130944 C 700.88236,67.130944 702.30921,68.008684 703.98345,68.008684 C 705.78815,68.008684 706.82154,67.443974 708.15272,66.911504 C 709.49084,66.376254 710.32631,65.391024 711.22482,64.717154 C 712.93357,63.435584 713.93405,62.155634 715.83296,61.206184 C 717.44839,60.398474 719.60451,59.255264 721.09941,58.134094 C 722.32027,57.218444 724.55866,55.842944 725.92699,55.500864 C 727.42616,55.126074 729.09302,54.102794 730.53513,53.525944 C 732.4374,52.765044 734.47148,52.545224 736.02101,51.770464 C 736.81463,51.373654 738.38579,51.112164 739.31254,51.112164 C 739.58229,50.977294 739.8977,50.965874 740.19028,50.892724 C 741.93619,50.456234 744.97275,50.145724 746.55391,51.331594 C 747.77567,52.247914 749.08929,52.550364 750.06487,53.525944 C 751.05366,54.514734 751.10636,54.963084 752.6981,55.281434 C 753.97746,55.537304 755.20688,54.403694 756.64793,54.403694 C 757.60799,54.403694 759.65763,56.143574 760.59777,56.378604 C 762.10547,56.755534 763.41059,56.817474 764.98648,56.817474 C 766.46659,56.817474 768.85254,54.943624 770.47236,54.403694 C 772.25575,53.809224 773.23113,53.525944 775.29994,53.525944 C 777.348,53.525944 779.39606,53.525944 781.44413,53.525944 C 783.12504,53.525944 784.01926,53.375894 785.17453,53.087074 C 786.13177,52.847764 786.81429,52.867644 787.80775,52.867644 C 789.68721,52.397784 790.54366,51.799654 792.41589,51.331594 C 793.72507,51.004304 794.52824,48.862394 795.04912,47.820634 C 795.74654,46.425784 796.31421,45.768114 797.24347,44.529104 C 798.0814,43.411864 799.90954,42.318324 801.19331,41.676444 C 802.47959,41.033304 803.007,40.301614 804.04597,39.262654 C 804.9791,38.329524 805.42163,37.448114 806.24032,36.629424 C 807.32555,35.544194 808.33509,33.723304 809.09298,32.460154 C 809.72369,31.408974 811.13754,30.635024 812.16508,29.607494 C 812.75994,29.012634 816.59236,28.500674 817.43152,28.290884 C 818.9728,27.905564 820.03772,26.864014 820.94249,25.657664 C 821.81326,24.496634 822.20664,23.673144 822.47854,22.585564 C 822.70979,21.660554 823.16846,20.484194 823.35628,19.732904 C 823.39176,19.590984 823.35628,19.440324 823.35628,19.294034 C 824.72829,14.181234 833.5556,11.720324 838.16552,9.4153643 C 840.3455,8.3253643 841.62867,5.2222343 843.25846,3.0491743 C 844.34873,1.5954943 847.99376,1.4409443 850.04906,0.92711429 C 853.15105,0.15161429 855.95039,-0.84630571 858.11289,-2.4681757 C 860.2827,-4.0955457 863.83523,-5.3512957 866.17672,-6.2878857 C 868.93603,-7.3916157 871.61677,-9.3068957 873.81614,-10.956426 C 875.97519,-12.575706 878.16034,-13.552932 880.60673,-14.776132 C 882.92916,-15.937342 883.77331,-17.477632 886.5485,-18.171422 C 890.51751,-19.163682 894.57232,-17.476362 898.43204,-19.020252 C 901.2465,-20.146032 904.60721,-21.731172 907.3447,-22.415552 C 909.30842,-22.906482 911.47245,-25.328252 913.28647,-26.235262 C 916.00359,-27.593822 917.08159,-29.412202 919.65265,-30.054972 C 921.32298,-30.472552 924.26602,-31.730552 926.44325,-32.601442 C 928.89479,-33.582062 931.86421,-33.402072 933.65826,-34.299092 C 936.16619,-35.553052 937.08458,-36.322802 939.17561,-36.845562 C 941.67817,-37.471202 944.13749,-38.007702 946.81503,-38.543212 C 948.94134,-38.968472 950.98649,-40.592612 952.33239,-41.938512 C 953.1616,-42.767712 955.07166,-42.233042 955.92249,-42.126952 z ';

        var textpath = new Kinetic.Plugins.TextPath({
            y: 50,
            textFill: 'black',
            fontSize: '24',
            text: Array(4).join('All the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.'),
            data: c
        });

        layer.add(textpath);
        stage.add(layer);
    }
};

Test.Modules.LABEL = {
    '*add label': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var label = new Kinetic.Plugins.Label({
            x: 20,
            y: 20, 
            draggable: true,
            arrow: 'left',
            arrowWidth: 20,
            arrowHeight: 20,
            text: {
                text: 'Hello World!',
                fontSize: 50,
                fontFamily: 'Calibri',
                fontStyle: 'normal',
                lineHeight: 1.2,
                padding: 10,
                fill: 'green',
            },
            rect: {
                fill: '#bbb',
                stroke: '#333',
                shadowColor: 'black',
                shadowBlur: 1,
                shadowOffset: [10, 10],
                shadowOpacity: 0.2,
                lineJoin: 'round'
            }
        });

        layer.add(label);
        stage.add(layer);

        var beforeTextWidth = label.getText().getWidth();

        label.getText().setFontSize(100);

        var afterTextWidth = label.getText().getWidth();

        test(afterTextWidth > beforeTextWidth, 'label text width should have grown');

        label.getText().setFontSize(50);

        layer.draw();
    }
};

