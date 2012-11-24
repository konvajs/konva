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
				
				warn(dataUrl === groupToImageDataUrl, 'group to image data url is incorrect');
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
        test(group.get('.myText')[0].getTextFill() === 'blue', 'group text should be blue');
        test(clone.get('.myText')[0].getTextFill() === 'blue', 'clone text should be blue');
        clone.get('.myText')[0].setTextFill('black');
        test(group.get('.myRect')[0].attrs.myAttr === 'group rect', 'group rect should have myAttr: group rect');
        test(clone.get('.myRect')[0].attrs.myAttr === 'group rect', 'clone rect should have myAttr: group rect');
        clone.get('.myRect')[0].setAttrs({
            myAttr: 'clone rect'
        });

        
         // Make sure that when we change a clone object attr that the rect object
         // attr isn't updated by reference
         

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
        
        warn(layer.toDataURL() === cloneGroup, 'problem cloning group');
        
        
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

				
                cachedShape.createImageBuffer(function() {
                	console.log(111)
                    layer.draw();
                    //console.log(layer.toDataURL());
                    warn(dataUrls['regular and cahced polygon'] === layer.toDataURL(), 'regular and cached polygon layer data url is incorrect');

                    
                });
                
            }
            
            
        });

		/*
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
     	*/

        showHit(layer);
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
