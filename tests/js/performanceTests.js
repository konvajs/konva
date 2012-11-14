Test.Modules.PERFORMANCE = {
    'DRAWING - draw rect': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        startTimer();
        for(var n = 0; n < 1000; n++) {
            var rect = new Kinetic.Rect({
                x: 10,
                y: 10,
                width: 100,
                height: 100,
                fill: 'yellow',
                stroke: 'blue'
            });

            layer.add(rect);
        }
        stage.add(layer);

        endTimer('add and draw 1,000 Kinetic rectangles');

    },
    'ANIMATION - test animation frame rate': function(containerId) {
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
                rect.attrs.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;
                layer.draw();
                //console.log(frame.timeDiff)
            }
        });

        anim.start();

        setTimeout(function() {
            anim.stop();
        }, 2000);
        setTimeout(function() {
            anim.start();
        }, 4000);
    },
    'DRAWING - draw 10,000 small circles with tooltips': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var circlesLayer = new Kinetic.Layer();
        var tooltipLayer = new Kinetic.Layer();
        var colors = ["red", "orange", "yellow", "green", "blue", "cyan", "purple"];
        var colorIndex = 0;

        for(var n = 0; n < 10000; n++) {
            // induce scope
            ( function() {
                var i = n;
                var color = colors[colorIndex++];
                if(colorIndex >= colors.length) {
                    colorIndex = 0;
                }

                var randX = Math.random() * stage.getWidth();
                var randY = Math.random() * stage.getHeight();
                
                var circle = new Kinetic.Ellipse({
                    x: randX,
                    y: randY,
                    radius: 2,
                    fill: color
                });

                circle.on("mousemove", function() {
                    // update tooltip
                    console.log('mouseover')
                    var mousePos = stage.getMousePosition();
                    tooltip.setPosition(mousePos.x + 5, mousePos.y + 5);
                    tooltip.setText("node: " + i + ", color: " + color);
                    tooltip.show();
                    tooltipLayer.draw();
                });

                circle.on("mouseout", function() {
                    tooltip.hide();
                    tooltipLayer.draw();
                });

                circlesLayer.add(circle);
            }());
        }
      
        var tooltip = new Kinetic.Text({
            text: "",
            fontFamily: "Calibri",
            fontSize: 12,
            padding: 5,
            visible: false,
            fill: "black",
            alpha: 0.75,
            textFill: "white"
        });

        tooltipLayer.add(tooltip);
        

        stage.add(circlesLayer);
        stage.add(tooltipLayer);
        
        document.body.appendChild(circlesLayer.bufferCanvas.element)

    },
    'DRAWING - draw rect vs image from image data': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);

        var canvas = layer.getCanvas();
        var context = layer.getContext();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.fillStyle = 'blue';
            context.lineWidth = 6;
            context.strokeStyle = 'red';
            context.fillRect(10, 10, 100, 100);
            context.strokeRect(10, 10, 100, 100);
        }
        endTimer('draw 10,000 rects with canvas API');

        startTimer();
        var imageData = context.getImageData(7, 7, 106, 106);
        endTimer('create image data');

        layer.canvas.clear();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.putImageData(imageData, 7, 7);
        }
        endTimer('draw 10,000 images with putImageData');

    },
    'DRAWING - draw rect vs image from data url': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        stage.add(layer);

        var canvas = layer.getCanvas();
        var context = layer.getContext();

        startTimer();
        for(var n = 0; n < 10000; n++) {
            context.fillStyle = 'blue';
            context.lineWidth = 6;
            context.strokeStyle = 'red';
            context.fillRect(10, 10, 100, 100);
            context.strokeRect(10, 10, 100, 100);
        }
        endTimer('draw 10,000 rects with canvas API');

        startTimer();
        var url = layer.toDataURL();
        endTimer('create data url');

        var imageObj = new Image();
        imageObj.onload = function() {
            layer.canvas.clear();

            startTimer();
            for(var n = 0; n < 10000; n++) {
                context.drawImage(imageObj, 7, 7, 106, 106, 10, 10, 106, 106);
            }
            endTimer('draw 10,000 images with image object from data url');
        }
        imageObj.src = url;

    },
    'DRAWING - draw 1,000 stars': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        startTimer();
        for(var n = 0; n < 1000; n++) {
            var star = new Kinetic.Star({
                innerRadius: 20,
                outerRadius: 50,
                fill: 'yellow',
                stroke: 'black',
                strokeWidth: 5,
                numPoints: 5,
                x: Math.random() * stage.getWidth(),
                y: Math.random() * stage.getHeight(),
                shadow: {
                    offset: 5,
                    color: 'black',
                    blur: 5,
                    alpha: 0.5
                }
            });

            layer.add(star);
        }

        stage.add(layer);

        endTimer('draw 1,000 stars');
    },
    'DRAWING - draw 1,000 cached stars': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var star = new Kinetic.Star({
            innerRadius: 20,
            outerRadius: 50,
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 5,
            numPoints: 5,
            x: 70,
            y: 70,
            shadow: {
                offset: 5,
                color: 'black',
                blur: 5,
                alpha: 0.5
            }
        });

        layer.add(star);
        stage.add(layer);

        star.toImage({
            callback: function(img) {
                startTimer();
                for(var n = 0; n < 1000; n++) {
                    var image = new Kinetic.Image({
                        image: img,
                        x: Math.random() * stage.getWidth(),
                        y: Math.random() * stage.getHeight(),
                        offset: 70
                    });

                    layer.add(image);
                }

                layer.draw();

                endTimer('draw 1,000 cached stars');
            }
        });
    },
    'PATH - add map path': function(containerId) {
        startTimer();
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
                mapLayer.draw();
            });

            path.on('mouseout', function() {
                this.setFill('#ccc');
                mapLayer.draw();
            });

            mapLayer.add(path);
        }

        stage.add(mapLayer);

        endTimer('time build and to draw map');

        mapLayer.beforeDraw(startTimer);
        mapLayer.afterDraw(function() {
            endTimer('redraw layer');
        });
    }
};
