Test.Modules.NODE = {
    'test pixel ratio toDataURL': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        // override pixel ratio
       
        layer.canvas = new Kinetic.SceneCanvas({
           pixelRatio: 2 
        });
        layer.canvas._canvas.style.position = 'absolute';

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

        testDataUrl(layer.toDataURL(), 'green circle', 'problem with pixel ratio and dataURL');  
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

                testDataUrl(dataUrl, 'group to image', 'group to image data url is incorrect');
            }
        });

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

        var clone = group.clone({
            x: 300,
            name: 'groupClone'
        });

        showHit(layer);

        layer.add(group);
        layer.add(clone);
        stage.add(layer);

        testDataUrl(layer.toDataURL(), 'clone group', 'problem cloning group');

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
                    testDataUrl(layer.toDataURL(), 'regular and cached polygon', 'regular and cached polygon layer data url is incorrect');

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

                                        testDataUrl(dataUrl, 'cache shape, group, layer, and stage', 'problem caching shape, group, layer, and stage');
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
    'serialize stage with custom shape': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var drawTriangle = function(context) {
            var _context = context._context;

            _context.beginPath();
            _context.moveTo(200, 50);
            _context.lineTo(420, 80);
            _context.quadraticCurveTo(300, 100, 260, 170);
            _context.closePath();
            context.fillStroke(this);
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

        testDataUrl(startDataUrl, 'serialize stage with custom shape', 'start data url is incorrect');

        var expectedJson = '{"attrs":{"width":578,"height":200},"nodeType":"Stage","children":[{"attrs":{},"nodeType":"Layer","children":[{"attrs":{},"nodeType":"Group","children":[{"attrs":{"fill":"#00D2FF","stroke":"black","strokeWidth":4,"id":"myTriangle"},"nodeType":"Shape"}]}]}]}';

    
        layer.draw();

        var endDataUrl = layer.toDataURL();
        testDataUrl(endDataUrl,'serialize stage with custom shape', 'end data url is incorrect');

    },
    '!destroy node mid transition': function(containerId) {
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
      
            rect.destroy();

            layer.draw();
            testDataUrl(layer.toDataURL(), 'cleared', 'transitioning rectangle should have been destroyed and removed from the screen');
        }, 1000);
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
        
        
        //console.log(layer.toDataURL());
        testDataUrl(layer.toDataURL(), 'cleared', 'layer is still visible');
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

        testDataUrl(layer.toDataURL(), 'cleared', 'group is still visible');
    }
};

Test.Modules.CONTAINER = {

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

        stage.toDataURL({
            callback: function(dataUrl) {
            	//console.log(dataUrl)
                testDataUrl(dataUrl,'node shape type selector', 'problem with node and shape type selector render.');
            }
        });
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
        
        stage.toDataURL({
            callback: function(dataUrl) {
                //console.log(dataUrl)
                testDataUrl(dataUrl, 'blue on top of green', 'layer setZIndex is not working');
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
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveToTop is not working');
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
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveToBottom is not working');
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
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveDown is not working');
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
                testDataUrl(dataUrl, 'blue on top of green', 'layer moveUp is not working');
            }
        });
    }
};

Test.Modules.LAYER = {
    'redraw hit graph': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var rect = new Kinetic.Rect({
            x: 200,
            width: 100,
            height: 50,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            scale: [3, 1],
            draggable: true,
            strokeScaleEnabled: false
        });

        rect.colorKey = '000000';

        layer.add(rect);
        stage.add(layer);

        rect.setY(100);
        layer.drawHit();

        showHit(layer);

        testDataUrl(layer.hitCanvas.toDataURL(), 'black rect hit graph', 'redrawn hitgraph data url is incorrect');

    }
};

Test.Modules.STAGE = {
    'hide stage': function(containerId) {
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

        stage.hide();

        stage.toDataURL({
            callback: function(dataUrl) {
                testDataUrl(dataUrl, 'cleared', 'stage should not be visible');
            }
        })

        stage.draw();
    },
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
        
        testDataUrl(layer.toDataURL(), 'scaled rect with disabled stroke scale', 'probem with stroke scale disabling');
    },
    'custom shape with two fills and two strokes': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var drawTriangle = function(context) {
            var _context = context._context;

            _context.beginPath();
            _context.moveTo(200, 50);
            _context.lineTo(420, 80);
            _context.quadraticCurveTo(300, 100, 260, 170);
            _context.closePath();
            context.fillStroke(this);

            _context.beginPath();
            _context.moveTo(300, 150);
            _context.lineTo(520, 180);
            _context.quadraticCurveTo(400, 200, 360, 270);
            _context.closePath();
            context.fillStroke(this);
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
        testDataUrl(dataUrl, 'custom shape with two fills and strokes', 'problem with custom shape with two fills');

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
                var _context = context._context;

                _context.beginPath();
                _context.moveTo(0, 0);
                _context.lineTo(100, 0);
                _context.lineTo(100, 100);
                _context.closePath();
                context.fillStroke(this);
            },
            x: 200,
            y: 100,
            fill: 'green',
            stroke: 'blue',
            strokeWidth: 5
        });

        shape.setDrawFunc(function(context) {
            var _context = context._context;

            _context.beginPath();
            _context.moveTo(0, 0);
            _context.lineTo(200, 0);
            _context.lineTo(200, 100);
            _context.closePath();
            context.fillStroke(this);
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
            var _context = context._context;

            _context.beginPath();
            _context.moveTo(0, 0);
            _context.lineTo(200, 0);
            _context.lineTo(200, 100);
            _context.closePath();
            context.fillStroke(this);
        });

        layer.add(shape);
        layer.add(rect);
        stage.add(layer);

        var dataUrl = layer.toDataURL();

        //console.log(dataUrl);
        testDataUrl(dataUrl, 'change custom shape draw func', 'problem with setDrawFunc');
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
        testDataUrl(layer.toDataURL(), 'everything enabled', 'should be circle with green fill, dashed stroke, and shadow');
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
        testDataUrl(layer.toDataURL(), 'fill disabled', 'should be circle with no fill, dashed stroke, and shadow');
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
        testDataUrl(layer.toDataURL(), 'stroke disabled', 'should be circle with green fill, no stroke, and shadow');
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
        testDataUrl(layer.toDataURL(), 'dash array disabled', 'should be circle with green fill, solid stroke, and shadow');
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
        testDataUrl(layer.toDataURL(), 'shadow disabled', 'should be circle with green fill, dashed stroke, and no shadow');
    },
    'fill overrides': function(containerId) {

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

        testDataUrl(layer.toDataURL(), 'red star', 'star should have red fill');

        star.setFillPriority('linear-gradient');
        layer.draw();

        testDataUrl(layer.toDataURL(), 'star with linear gradient fill', 'star should have linear gradient fill');

        star.setFillPriority('color');
        layer.draw();
        
        testDataUrl(layer.toDataURL(), 'red star', 'star should have red fill again');


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
        testDataUrl(layer.toDataURL(), 'blobs', 'problem with blobs');
        
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
        testDataUrl(layer.toDataURL(), 'curvy lines', 'problem with curvy lines');
        
    }
};

Test.Modules.Text = {

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

        testDataUrl(layer.toDataURL(),'multiline text with shadows', 'multi line text with shadows data url is incorrect');
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
        testDataUrl(layer.toDataURL(), 'text everything enabled', 'should be text with blue fill and red stroke');
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
        testDataUrl(layer.toDataURL(), 'text fill disabled', 'should be text with no fill and red stroke');
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
        testDataUrl(layer.toDataURL(),'text stroke disabled', 'should be text with blue fill and no stroke');
    },
    'wrapped text': function (containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var txt = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            arr = [txt, txt];

        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 0,
            y: 0,
            width: 578,
            text: arr.join(''),
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: '#000',
            wrap: 'word'
        });

        layer.add(text);
        stage.add(layer);

        testDataUrl(layer.toDataURL(),'wrapping to words', 'text should be wrapped to words');

        text.setWrap('none');
        layer.draw();
        testDataUrl(layer.toDataURL(),'no wrapping', 'text should not be wrapped');

        text.setWrap('char');
        layer.draw();
        testDataUrl(layer.toDataURL(), 'wrapping to chars', 'text should be wrapped to chars');

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
        testDataUrl(layer.toDataURL(), 'wedge', 'problem rendering wedge');
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
        testDataUrl(layer.toDataURL(), 'rotate wedge', 'problem with rotated wedge rendering');
    }
};
