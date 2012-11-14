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
            shadow: {
                color: 'black',
                offset: [20, 20]
            }
        });

        layer.add(rect);
        stage.add(layer);

        var offsetChange = false;
        var shadowOffsetChange = false;

        rect.on('offsetChange', function(val) {
            offsetChange = true;
        });

        rect.setOffset(1, 2);

        rect.setShadow({
            offset: [3, 4]
        });

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
            shadow: {
                color: 'black',
                offset: [20, 20]
            },
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

        test(rect.getShadow().color === 'black', 'rect shadow color should be black');
        test(clone.getShadow().color === 'black', 'clone shadow color should be black');

        clone.setShadow({
            color: 'green'
        });

        /*
         * Make sure that when we change a clone object attr that the rect object
         * attr isn't updated by reference
         */

        test(rect.getShadow().color === 'black', 'rect shadow color should be black');
        test(clone.getShadow().color === 'green', 'clone shadow color should be green');

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
            shadow: {
                color: 'black',
                offset: [20, 20]
            },
            name: 'myRect',
            myAttr: 'group rect'
        });
        var text = new Kinetic.Text({
            x: 0,
            y: 110,
            text: 'Some awesome text!',
            fontSize: 14,
            fontFamily: 'Calibri',
            textFill: 'blue',
            shadow: {
                color: 'red',
                offset: [20, 20]
            },
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

        test(clone.getX() === 300, 'clone x should be 300');
        test(clone.getY() === 0, 'clone y should be 50');
        test(clone.getDraggable() === true, 'clone should be draggable');
        // test alias
        test(clone.isDraggable() === true, 'clone should be draggable');
        test(clone.getName() === 'groupClone', 'clone name should be groupClone');

        test(group.getChildren().length === 2, 'group should have two children');
        test(clone.getChildren().length === 2, 'clone should have two children');

        layer.add(group);
        layer.add(clone);
        stage.add(layer);

        test(group.get('.myText')[0].getTextFill() === 'blue', 'group text should be blue');
        test(clone.get('.myText')[0].getTextFill() === 'blue', 'clone text should be blue');
        clone.get('.myText')[0].setTextFill('black');
        test(group.get('.myRect')[0].attrs.myAttr === 'group rect', 'group rect should have myAttr: group rect');
        test(clone.get('.myRect')[0].attrs.myAttr === 'group rect', 'clone rect should have myAttr: group rect');
        clone.get('.myRect')[0].setAttrs({
            myAttr: 'clone rect'
        });

        /*
         * Make sure that when we change a clone object attr that the rect object
         * attr isn't updated by reference
         */

        test(group.get('.myText')[0].getTextFill() === 'blue', 'group text should be blue');
        test(clone.get('.myText')[0].getTextFill() === 'black', 'clone text should be blue');

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
            shadow: {
                offset: [10, 10]
            }
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

        rect.on('shadowChange', function() {
            shadowChanged++;
        });

        circle.on('radiusChange', function() {
            radiusChanged++;
        });

        circle.setRadius(70, 20);

        rect.setSize(210);
        rect.setShadow({
            offset: {
                x: 20
            }
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

        //console.log(layer1.toDataURL());

        stage.toDataURL({
            callback: function(dataUrl) {
                //console.log(dataUrl);

                layer2.show();
                test(layer2.isVisible(), 'layer2 should be visible');
                test(layer2.canvas.element.style.display === 'block', 'layer canvas element display should be block');
            }
        });

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
                shadow: {
                    color: 'black',
                    blur: 3,
                    offset: [3, 1],
                    opacity: 0.3
                }
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

                //console.log(layer.toDataURL());

                cachedShape.createImageBuffer(function() {
                    layer.draw();
                    //console.log(layer.toDataURL());
                    warn(dataUrls['regular and cahced polygon'] === layer.toDataURL(), 'regular and cached polygon layer data url is incorrect');

                    //document.body.appendChild(layer.bufferCanvas.element)
                });
            }
        });

        group.toImage({
            callback: function(imageObj) {
                test(Kinetic.Type._isElement(imageObj), 'group toImage() should be an image object');
            }
        });
        layer.toImage({
            callback: function(imageObj) {
                test(Kinetic.Type._isElement(imageObj), 'layer toImage() should be an image object');
            }
        });
        stage.toImage({
            callback: function(imageObj) {
                test(Kinetic.Type._isElement(imageObj), 'stage toImage() should be an image object');
            }
        });

        //document.body.appendChild(layer.bufferCanvas.element)
    },
    'hide group': function(containerId) {
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
            shadow: {
                color: 'blue',
                blur: 12
            }
        });

        layer.add(rect);
        stage.add(layer);

        rect.setShadow({
            offset: [1, 2]
        });
        test(rect.getShadow().offset.x === 1, 'shadow offset x should be 1');
        test(rect.getShadow().offset.y === 2, 'shadow offset y should be 2');
        // make sure we still have the other properties
        test(rect.getShadow().color === 'blue', 'shadow color should still be blue');
        test(rect.getShadow().blur === 12, 'shadow blur should still be 12');

        rect.setShadow({
            offset: {
                x: 3,
                y: 4
            }
        });
        test(rect.getShadow().offset.x === 3, 'shadow offset x should be 3');
        test(rect.getShadow().offset.y === 4, 'shadow offset y should be 4');

        // test partial setting
        rect.setShadow({
            offset: {
                x: 5
            }
        });
        test(rect.getShadow().offset.x === 5, 'shadow offset x should be 5');
        test(rect.getShadow().offset.y === 4, 'shadow offset y should be 4');

        // test partial setting
        rect.setShadow({
            offset: {
                y: 6
            }
        });
        test(rect.getShadow().offset.x === 5, 'shadow offset x should be 5');
        test(rect.getShadow().offset.y === 6, 'shadow offset y should be 6');

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
        circle.fire('customEvent', {foo:'bar'});
        
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
        test(stage.toJSON() === expectedJson, 'problem with serialization');
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
        test(circle.toJSON() === expectedJson, 'problem with serialization');
    },
    'load stage using json': function(containerId) {
        var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"radius":70,"visible":true,"listening":true,"name":"myCircle","opacity":1,"x":289,"y":100,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":true,"fill":"green","stroke":"black","strokeWidth":4},"nodeType":"Shape","shapeType":"Circle"}]}]}]}';
        var stage = Kinetic.Node.create(json, containerId);

        test(stage.toJSON() === json, "problem loading stage with json");
    },
    'serialize stage with custom shape': function(containerId) {
        var urls = dataUrls['STAGE - serialize stage with custom shape'];

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var drawTriangle = function(context) {
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            this.fill(context);
            this.stroke(context);
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

        //warn(startDataUrl === urls[0], 'start data url is incorrect');
        test(triangle.getId() === 'myTriangle', 'triangle id should be myTriangle');

        //console.log(stage.toJSON());
        var expectedJson = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false,"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';

        //console.log(stage.toJSON())
        test(stage.toJSON() === expectedJson, "problem serializing stage with custom shape");

        /*
         * test redrawing layer after serialization
         * drawing should be the same
         */
        layer.draw();

        var endDataUrl = layer.toDataURL();
        //warn(endDataUrl === urls[0], 'end data url is incorrect');

    },
    'load stage with custom shape using json': function(containerId) {
        var drawTriangle = function(context) {
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            this.fill(context);
            this.stroke(context);
        };
        var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Group","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false,"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';

        var stage = Kinetic.Node.create(json, containerId);

        stage.get('#myTriangle').apply('setDrawFunc', drawTriangle);

        stage.draw();
        //console.log(stage.toJSON());
        test(stage.toJSON() === json, "problem loading stage with custom shape json");
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
            test(stage.toJSON() === expectedJson, 'problem with serializing stage with image');
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'load stage with an image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var json = '{"attrs":{"width":578,"height":200,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Stage","children":[{"attrs":{"clearBeforeDraw":true,"visible":true,"listening":true,"opacity":1,"x":0,"y":0,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":0,"y":0},"draggable":false},"nodeType":"Layer","children":[{"attrs":{"visible":true,"listening":true,"opacity":1,"x":200,"y":60,"scale":{"x":1,"y":1},"rotation":0,"offset":{"x":50,"y":150},"draggable":false,"id":"darth","width":438,"height":300},"nodeType":"Shape","shapeType":"Image"}]}]}';
            var stage = Kinetic.Node.create(json, containerId);

            test(stage.toJSON(), json, 'problem loading stage json with image');
            stage.get('#darth').apply('setImage', imageObj);
            stage.draw();
        };
        imageObj.src = '../assets/darth-vader.jpg';
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
        test(stage.getDOM().style.width === '333px', 'content width should be 333');
        test(stage.getDOM().style.height === '155px', 'content height should be 155px');
        test(layer.getCanvas().element.width === 333, 'layer canvas element width should be 333');
        test(layer.getCanvas().element.height === 155, 'layer canvas element width should be 155');
    },
    'reset stage': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            x: 100
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

        test(stage.getChildren().length === 1, 'stage should have one child');
        test(stage.getX() === 100, 'stage x should be 100');
        stage.reset();
        test(stage.getChildren().length === 0, 'stage should have no children');
        test(stage.getX() === 0, 'stage x should be 0');
    },
    'get stage DOM': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        test(stage.getDOM().className === 'kineticjs-content', 'stage DOM class name is wrong');
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
    }
};
Test.Modules.CONTAINER = {
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
    'remove shape by id or name': function(containerId) {
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

        var circleColorKey = circle.colorKey;
        var rectColorKey = rect.colorKey;

        layer.add(circle);
        layer.add(rect);
        stage.add(layer);

        test(stage.ids.myCircle._id === circle._id, 'circle not in ids hash');
        test(stage.names.myRect[0]._id === rect._id, 'rect not in names hash');
        test(Kinetic.Global.shapes[circleColorKey]._id === circle._id, 'circle color key should be in shapes hash');
        test(Kinetic.Global.shapes[rectColorKey]._id === rect._id, 'rect color key should be in shapes hash');

        circle.remove();

        test(stage.ids.myCircle === undefined, 'circle still in hash');
        test(stage.names.myRect[0]._id === rect._id, 'rect not in names hash');
        test(Kinetic.Global.shapes[circleColorKey] === undefined, 'circle color key should not be in shapes hash');
        test(Kinetic.Global.shapes[rectColorKey]._id === rect._id, 'rect color key should be in shapes hash');

        rect.remove();

        test(stage.ids.myCircle === undefined, 'circle still in hash');
        test(stage.names.myRect === undefined, 'rect still in hash');
        test(Kinetic.Global.shapes[circleColorKey] === undefined, 'circle color key should not be in shapes hash');
        test(Kinetic.Global.shapes[rectColorKey] === undefined, 'rect color key should not be in shapes hash');
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

        test(stage.ids['myCircle'].getId() === 'myCircle', 'circle id not in ids hash');
        test(stage.names['myRect'][0].getName() === 'myRect', 'rect name not in names hash');

        circle.setId('newCircleId');
        test(stage.ids['newCircleId'] !== undefined, 'circle not in ids hash');
        test(stage.ids['myCircle'] === undefined, 'old circle id key is still in ids hash');

        rect.setName('newRectName');
        test(stage.names['newRectName'][0] !== undefined, 'new rect name not in names hash');
        test(stage.names['myRect'] === undefined, 'old rect name is still in names hash');
    },
    'remove shape without adding its parent to stage': function(containerId) {
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

        test(go.tempNodes[circle._id] === undefined, 'circle shouldn\'t be in the temp nodes hash');

        layer.add(circle);

        var node = stage.get('#myCircle')[0];

        test(node === undefined, 'node should be undefined');

        test(go.tempNodes[circle._id].attrs.id === 'myCircle', 'circle should be in temp nodes');

        circle.remove();

        test(go.tempNodes[circle._id] === undefined, 'circle shouldn\'t be in the temp nodes hash');

    },
    'remove layer with shape': function(containerId) {
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

        layer.remove();

        test(stage.children.length === 0, 'stage should have 0 children');
        test(stage.get('.myLayer')[0] === undefined, 'layer should not exist');
        test(stage.get('.myCircle')[0] === undefined, 'circle should not exist');

        stage.draw();
    },
    'remove layer with no shapes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);
        layer.remove();

        test(stage.children.length === 0, 'stage should have 0 children');
    },
    'remove shape multiple times': function(containerId) {
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

        shape1.remove();
        shape1.remove();

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

        var textpath = new Kinetic.TextPath({
            y: 35,
            textStroke: 'black',
            textStrokeWidth: 1,
            textFill: 'orange',
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
            shadow: {
                color: 'black',
                blur: 2,
                offset: [10, 10],
                opacity: 0.5
            },
        });

        var poly = new Kinetic.RegularPolygon({
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
        //test(layer.getChild('myCircle') === undefined, 'shape should be null');

        layer.draw();
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

    }
};




Test.Modules.SHAPE = {
    'SHAPE - test intersects()': function(containerId) {
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
        test(circle.attrs.draggable === false, 'draggable should be false');

        //change properties
        circle.setDraggable(true);

        // test new properties
        test(circle.attrs.draggable === true, 'draggable should be true');
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

Test.Modules['CUSTOM SHAPE'] = {
    'custom shape with fill, stroke, and strokeWidth': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var shape = new Kinetic.Shape({
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                this.fill(context);
                this.stroke(context);
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
            drawFunc: function(context) {
                context.beginPath();
                context.moveTo(0, 0);
                context.lineTo(100, 0);
                context.lineTo(100, 100);
                context.closePath();
                this.fill(context);
                this.stroke(context);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        shape.setDrawFunc(function(context) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            this.fill(context);
            this.stroke(context);
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

        rect.setDrawFunc(function(context) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(200, 0);
            context.lineTo(200, 100);
            context.closePath();
            this.fill(context);
            this.stroke(context);
        });

        layer.add(shape);
        layer.add(rect);
        stage.add(layer);

        var dataUrl = layer.toDataURL();

        test(dataUrls['SHAPE - change custom shape draw func'] === dataUrl, 'problem with setDrawFunc');
    }
};

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

        var anim = new Kinetic.Animation({
            func: function(frame) {
                rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
                layer.draw();
            }
        });
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

        var anim = new Kinetic.Animation({
            func: function(frame) {
                rect.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
                layer.draw();
            }
        });

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
                fill: {
                    image: imageObj,
                    repeat: 'no-repeat',
                    offset: [-200, -70],
                    scale: 0.7
                },
                stroke: 'black',
                strokeWidth: 4,
                name: 'myCircle',
                draggable: true
            });

            group.add(circle);
            layer.add(group);
            stage.add(layer);

            test(circle.getFill().repeat === 'no-repeat', 'repeat option should be no-repeat');
            test(circle.getFill().offset.x === -200, 'fill offset x should be -200');
            test(circle.getFill().offset.y === -70, 'fill offset y should be -70');

            /*
             * test offset setting
             */
            circle.setFill({
                offset: [1, 2]
            });
            test(circle.getFill().offset.x === 1, 'fill offset x should be 1');
            test(circle.getFill().offset.y === 2, 'fill offset y should be 2');

            circle.setFill({
                offset: {
                    x: 3,
                    y: 4
                }
            });
            test(circle.getFill().offset.x === 3, 'fill offset x should be 3');
            test(circle.getFill().offset.y === 4, 'fill offset y should be 4');

            circle.setFill({
                offset: {
                    x: 5
                }
            });
            test(circle.getFill().offset.x === 5, 'fill offset x should be 5');
            test(circle.getFill().offset.y === 4, 'fill offset y should be 4');

            circle.setFill({
                offset: {
                    y: 6
                }
            });
            test(circle.getFill().offset.x === 5, 'fill offset x should be 5');
            test(circle.getFill().offset.y === 6, 'fill offset y should be 6');

            circle.setFill({
                offset: [-200, -70]
            });

            //document.body.appendChild(layer.bufferCanvas.element)
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
            fill: {
                start: {
                    x: -20,
                    y: -20,
                    radius: 0
                },
                end: {
                    x: -60,
                    y: -60,
                    radius: 130
                },
                colorStops: [0, 'red', 0.2, 'yellow', 1, 'blue']
            },
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

        var fill = circle.getFill();

        test(fill.start.x === -20, 'fill start x should be 20');
        test(fill.start.y === -20, 'fill start y should be 20');
        test(fill.start.radius === 0, 'fill start radius should be 0');

        test(fill.end.x === -60, 'fill end x should be 60');
        test(fill.end.y === -60, 'fill end y should be 60');
        test(fill.end.radius === 130, 'fill end radius should be 130');

        test(fill.colorStops.length === 6, 'fill colorStops length should be 6');

        //document.body.appendChild(layer.bufferCanvas.element)

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
            fill: {
                start: {
                    x: -35,
                    y: -35
                },
                end: {
                    x: 35,
                    y: 35
                },
                colorStops: [0, 'red', 1, 'blue']
            },
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        test(circle.getName() === 'myCircle', 'circle name should be myCircle');

        document.body.appendChild(layer.bufferCanvas.element)
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
            var layer = new Kinetic.Layer({
                throttle: 999
            });
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

            darth.applyFilter({
                filter: Kinetic.Filters.Grayscale,
                callback: function() {
                    layer.draw();
                    var dataUrl = layer.toDataURL();
                    //console.log(dataUrl);
                    warn(dataUrl === dataUrls['Filters - grayscale image'], 'problem with Grayscale filter.');
                }
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

            darth.applyFilter({
                filter: Kinetic.Filters.Invert,
                callback: function() {
                    layer.draw();
                    var dataUrl = layer.toDataURL();
                    //console.log(dataUrl);
                    //warn(dataUrl === dataUrls['Filters - invert image'], 'problem with Invert filter.');
                }
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

            darth.applyFilter({
                filter: Kinetic.Filters.Brighten,
                config: {
                    val: 100
                },
                callback: function() {
                    layer.draw();
                    var dataUrl = layer.toDataURL();
                    //console.log(dataUrl);
                    warn(dataUrl === dataUrls['Filters - adjust image brightness'], 'problem with Brighten filter.');
                }
            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'filter transformed image': function(containerId) {
        var urls = dataUrls['SHAPE - filter transformed image'];
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

            darth.applyFilter({
                filter: Kinetic.Filters.Grayscale,
                callback: function() {
                    //stage.start();
                    layer.draw();
                    warn(layer.toDataURL() === urls[0], 'data url is incorrect');
                }
            });
        };
        imageObj.src = '../assets/darth-vader.jpg';
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

            circle.setFill({
                image: imageObj,
                repeat: 'no-repeat',
                offset: [-200, -70]
            });

            test(circle.getFill().image !== undefined, 'circle fill image should be defined');
            test(circle.getFill().repeat === 'no-repeat', 'circle fill repeat should be no-repeat');
            test(circle.getFill().offset.x === -200, 'circle fill offset x should be -200');
            test(circle.getFill().offset.y === -70, 'circle fill offset y should be -70');

            circle.setFill({
                start: {
                    x: -35,
                    y: -35
                },
                end: {
                    x: 35,
                    y: 35
                },
                colorStops: [0, 'red', 1, 'blue']
            });

            test(circle.getFill().image === undefined, 'circle fill image should be undefined');

            circle.setFill({
                image: imageObj,
                repeat: 'no-repeat',
                offset: [-200, -70]
            });

            layer.draw();
        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'apply shadow to transparent image': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();
            var lion = new Kinetic.Image({
                x: 200,
                y: 40,
                image: imageObj,
                draggable: true,
                shadow: {
                    color: 'black',
                    blur: 10,
                    offset: [20, 20],
                    opacity: 0.2
                }
            });

            layer.add(lion);
            lion.createImageBuffer(function() {
                stage.add(layer);
            });
            //document.body.appendChild(layer.bufferCanvas.element);

        };
        imageObj.src = '../assets/lion.png';
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
            shadow: {
                color: '#aaa',
                blur: 10,
                offset: [20, 20]
            },
            opacity: 0.2
        });

        layer.add(line);
        stage.add(layer);

        test(line.getDashArray().length === 6, 'dashArray should have 6 elements');
        line.setDashArray([10, 10]);
        test(line.getDashArray().length === 2, 'dashArray should have 2 elements');

        test(line.getPoints().length === 4, 'line should have 4 points');

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

        var poly = new Kinetic.RegularPolygon({
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

        var poly = new Kinetic.RegularPolygon({
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

        var poly = new Kinetic.RegularPolygon({
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

        var poly = new Kinetic.RegularPolygon({
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

        var star = new Kinetic.Star({
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

        var star = new Kinetic.Star({
            x: 200,
            y: 100,
            numPoints: 5,
            innerRadius: 40,
            outerRadius: 70,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5,
            lineJoin: "round",
            shadow: {
                color: 'black',
                blur: 10,
                offset: [20, 20],
                opacity: 0.5
            },
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

Test.Modules.Text = {
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
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            text: 'Hello World!',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#888',
            textStroke: '#333',
            align: 'right',
            lineHeight: 1.2,
            width: 400,
            height: 100,
            padding: 10,
            shadow: {
                color: 'black',
                blur: 1,
                offset: [10, 10],
                opacity: 0.2
            },
            cornerRadius: 10,
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
        test(text.getStroke() === '#555', 'text box stroke should be #555');
        test(text.getStrokeWidth() === 5, 'text box stroke width should be 5');
        test(text.getFill() === '#ddd', 'text box fill should be #ddd');
        test(text.getText() === 'Hello World!', 'text should be Hello World!');
        test(text.getFontSize() == 50, 'font size should 50');
        test(text.getFontFamily() == 'Calibri', 'font family should be Calibri');
        test(text.getFontStyle() == 'normal', 'font style should be normal');
        test(text.getTextFill() == '#888', 'text fill should be #888');
        test(text.getTextStroke() == '#333', 'text fill should be #333');
        test(text.getAlign() === 'right', 'text should be aligned right');
        test(text.getLineHeight() === 1.2, 'line height should be 1.2');
        test(text.getWidth() === 400, 'width should be 400');
        test(text.getHeight() === 100, 'height should be 100');
        test(text.getPadding() === 10, 'padding should be 10');
        test(text.getShadow().color === 'black', 'text box shadow color should be black');
        test(text.getCornerRadius() === 10, 'text box corner radius should be 10');
        test(text.getDraggable() === true, 'text should be draggable');

        test(text.getWidth() === 400, 'box width should be 400');
        test(text.getHeight() === 100, 'box height should be 100');
        test(text.getTextWidth() > 0, 'text width should be greater than 0');
        test(text.getTextHeight() > 0, 'text height should be greater than 0');

        text.setX(1);
        text.setY(2);
        text.setStroke('orange');
        text.setStrokeWidth(20);
        text.setFill('red');
        text.setText('bye world!');
        text.setFontSize(10);
        text.setFontFamily('Arial');
        text.setFontStyle('bold');
        text.setTextFill('green');
        text.setTextStroke('yellow');
        text.setAlign('left');
        text.setWidth(300);
        text.setHeight(75);
        text.setPadding(20);
        text.setShadow({
            color: 'green'
        });
        text.setCornerRadius(20);
        text.setDraggable(false);

        test(text.getX() === 1, 'text box x should be 1');
        test(text.getY() === 2, 'text box y should be 2');
        test(text.getStroke() === 'orange', 'text box stroke should be orange');
        test(text.getStrokeWidth() === 20, 'text box stroke width should be 20');
        test(text.getFill() === 'red', 'text box fill should be red');
        test(text.getText() === 'bye world!', 'text should be bye world!');
        test(text.getFontSize() == 10, 'font size should 10');
        test(text.getFontFamily() == 'Arial', 'font family should be Arial');
        test(text.getFontStyle() == 'bold', 'font style should be bold');
        test(text.getTextFill() == 'green', 'text fill should be green');
        test(text.getTextStroke() == 'yellow', 'text fill should be yellow');
        test(text.getAlign() === 'left', 'text should be aligned left');
        test(text.getWidth() === 300, 'width should be 300');
        test(text.getHeight() === 75, 'height should be 75');
        test(text.getPadding() === 20, 'padding should be 20');
        test(text.getShadow().color === 'green', 'text box shadow color should be green');
        test(text.getCornerRadius() === 20, 'text box corner radius should be 20');
        test(text.getDraggable() === false, 'text draggable should be false');

        // test set text to integer
        text.setText(5);

        //document.body.appendChild(layer.bufferCanvas.element)

        //layer.setListening(false);
        layer.drawBuffer();

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
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            text: 'HEADING\n\nAll the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            shadow: {
                color: 'black',
                blur: 1,
                offset: [10, 10],
                opacity: 0.2
            },
            cornerRadius: 10,
            draggable: true,
            detectionType: 'path'
        });

        // center text box
        //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

        layer.add(text);
        stage.add(layer);

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
            textFill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            shadow: {
                color: 'red',
                blur: 1,
                offset: [10, 10],
                opacity: 0.5
            },
            cornerRadius: 10,
            draggable: true,
            detectionType: 'path'
        });

        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());

        warn(layer.toDataURL() === dataUrls['multi line text with shadows'], 'multi line text with shadows data url is incorrect');
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
            fill: '#ddd',
            text: 'Some awesome text',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#555',
            align: 'center',
            padding: 5,
            draggable: true,
            detectionType: 'path'
        });

        var width = text.getWidth();
        var height = text.getHeight();

        layer.add(text);
        stage.add(layer);

        text.setFontSize(30);
        layer.draw();

        test(text.getWidth() > width, 'text box width should have increased.');
        test(text.getHeight() > height, 'text box height should have increased.');

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
            shadow: {
                color: 'black',
                blur: 2,
                offset: [10, 10],
                opacity: 0.5
            },
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
            shadow: {
                color: 'maroon',
                blur: 2,
                offset: [10, 10],
                opacity: 0.5
            },
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

        //document.body.appendChild(layer.bufferCanvas.element)

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

