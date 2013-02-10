Test.Modules.PERFORMANCE = {
	'*animating nested nodes': function(containerId) {
      var angularVelocity = 6;
      var angularVelocities = [];
      var lastRotations = 0;
      var controlled = false;
      var numWedges = 25;
      var angularFriction = 0.2;
      var target, activeWedge, stage, animatedLayer, wheel, pointer;

      function getAverageAngularVelocity() {
        var total = 0;
        var len = angularVelocities.length;

        if(len === 0) {
          return 0;
        }

        for(var n = 0; n < len; n++) {
          total += angularVelocities[n];
        }
        return total / len;
      }
      function purifyColor(color) {
        var randIndex = Math.round(Math.random() * 3);
        color[randIndex] = 0;
        return color;
      }
      function getRandomColor() {
        var r = 100 + Math.round(Math.random() * 55);
        var g = 100 + Math.round(Math.random() * 55);
        var b = 100 + Math.round(Math.random() * 55);
        var color = [r, b, b];
        color = purifyColor(color);
        color = purifyColor(color);

        return color;
      }
      function bind() {
        wheel.on('mousedown', function(evt) {
          angularVelocity = 0;
          controlled = true;
          target = evt.shape;
        });
        // add listeners to container
        document.body.addEventListener('mouseup', function() {
          controlled = false;
          angularVelocity = getAverageAngularVelocity() * 5;
          angularVelocities = [];
        }, false);

        document.body.addEventListener('mousemove', function(evt) {
          var mousePos = stage.getMousePosition();
          if(controlled && mousePos && target) {
            var x = mousePos.x - wheel.getX();
            var y = mousePos.y - wheel.getY();
            var atan = Math.atan(y / x);
            var rotation = x >= 0 ? atan : atan + Math.PI;
            var targetGroup = target.getParent();

            wheel.setRotation(rotation - targetGroup.startRotation - (target.getAngle() / 2));
          }
        }, false);
      }
      function buildWedge(n) {
        var s = getRandomColor();
        var r = s[0];
        var g = s[1];
        var b = s[2];

        var endColor = 'rgb(' + r + ',' + g + ',' + b + ')';
        r += 100;
        g += 100;
        b += 100;

        var startColor = 'rgb(' + r + ',' + g + ',' + b + ')';

        var wedge = new Kinetic.Group({
          rotation: 2 * n * Math.PI / numWedges,
        });

        var wedgeBackground = new Kinetic.Wedge({
          radius: 400,
          angle: 2 * Math.PI / numWedges,
          fillRadialGradientStartPoint: 0,
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: 0,
          fillRadialGradientEndRadius: 400,
          fillRadialGradientColorStops: [0, startColor, 1, endColor],
          fill: '#64e9f8',
          fillPriority: 'radial-gradient',
          stroke: '#ccc',
          strokeWidth: 2
        });

        var text = new Kinetic.Text({
          x: 0,
          y: 0,
          text: 'testing testing testing testing',
          fontFamily: 'Calibri',
          fontSize: 30,
          fill: 'red'
        });

        wedge.add(wedgeBackground);
        wedge.add(text);

        wedge.startRotation = wedge.getRotation();

        return wedge;
      }
      function animate(frame) {
      	console.log(frame.frameRate);
        // handle wheel spin
        var angularVelocityChange = angularVelocity * frame.timeDiff * (1 - angularFriction) / 1000;
        angularVelocity -= angularVelocityChange;

        if(controlled) {
          if(angularVelocities.length > 10) {
            angularVelocities.shift();
          }

          angularVelocities.push((wheel.getRotation() - lastRotation) * 1000 / frame.timeDiff);
        }
        else {
          wheel.rotate(frame.timeDiff * angularVelocity / 1000);
        }
        lastRotation = wheel.getRotation();

        // activate / deactivate wedges based on point intersection
        var intersection = stage.getIntersection({
          x: stage.getWidth() / 2,
          y: 100
        });

        if(intersection) {
          var shape = intersection.shape;

          if(shape && (!activeWedge || (shape._id !== activeWedge._id))) {
            pointer.setY(20);
            pointer.transitionTo({
              y: 30,
              easing: 'elastic-ease-out',
              duration: 0.3
            });

            if(activeWedge) {
              activeWedge.setFillPriority('radial-gradient');
            }
            shape.setFillPriority('fill');
            activeWedge = shape;
          }
        }
      }
      function init() {
        stage = new Kinetic.Stage({
          container: containerId,
          width: 578,
          height: 200
        });
        animatedLayer = new Kinetic.Layer();
        wheel = new Kinetic.Group({
          x: stage.getWidth() / 2,
          y: 410
        });

        for(var n = 0; n < numWedges; n++) {
          var wedge = buildWedge(n);
          wheel.add(wedge);
        }
        pointer = new Kinetic.Wedge({
          fillRadialGradientStartPoint: 0,
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: 0,
          fillRadialGradientEndRadius: 30,
          fillRadialGradientColorStops: [0, 'white', 1, 'red'],
          stroke: 'white',
          strokeWidth: 2,
          lineJoin: 'round',
          angleDeg: 30,
          radius: 30,
          x: stage.getWidth() / 2,
          y: 30,
          rotationDeg: -105,
          shadowColor: 'black',
          shadowOffset: 3,
          shadowBlur: 2,
          shadowOpacity: 0.5
        });

        // add components to the stage
        animatedLayer.add(wheel);
        animatedLayer.add(pointer);
        stage.add(animatedLayer);

        // bind events
        bind();

        var anim = new Kinetic.Animation(animate, animatedLayer);

        // wait one second and then spin the wheel
        setTimeout(function() {
          anim.start();
        }, 1000);
        
        setTimeout(function() {
        	anim.stop();
        }, 5000);
      }
      init();
    },
    'draw 1000 cropped and scaled images': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

			startTimer();
            for(var n = 0; n < 1000; n++) {
                var darth = new Kinetic.Image({
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
            }

            stage.add(layer);
            endTimer('draw 1000 cropped and scaled images');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'draw 1000 cropped images': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

			startTimer();
            for(var n = 0; n < 1000; n++) {
                var darth = new Kinetic.Image({
                    x: 200,
                    y: 75,
                    image: imageObj,
                    width: 53,
                    height: 37,
                    crop: [186, 211, 292 - 186, 285 - 211],
                    draggable: true
                });

                layer.add(darth);
            }

            stage.add(layer);
            endTimer('draw 1000 cropped images');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'draw 1000 scaled images': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

			startTimer();
            for(var n = 0; n < 1000; n++) {
                var darth = new Kinetic.Image({
                    x: 200,
                    y: 75,
                    image: imageObj,
                    width: 107,
                    height: 75,
                    draggable: true,
                    scale: 0.5
                });

                layer.add(darth);
            }

            stage.add(layer);
            endTimer('draw 1000 scaled images');

        };
        imageObj.src = '../assets/darth-vader.jpg';
    },
    'draw 1000 pre-processed cropped and scaled images': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
            var layer = new Kinetic.Layer();

			startTimer();
            for(var n = 0; n < 1000; n++) {
                var darth = new Kinetic.Image({
                    x: 200,
                    y: 75,
                    image: imageObj,
                    width: 107,
                    height: 75,
                    //crop: [186, 211, 292 - 186, 285 - 211],
                    draggable: true,
                    scale: [0.5, 0.5]
                });

                layer.add(darth);
            }

            stage.add(layer);
            endTimer('draw 1000 pre-processed images');
        };
        imageObj.src = '../assets/cropped-darth.jpg';
    },
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

        var anim = new Kinetic.Animation(function(frame) {
            rect.attrs.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;

            //console.log(frame.timeDiff)
        }, layer);

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

        startTimer();
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

        endTimer('drew 10,000 circles');

        //document.body.appendChild(circlesLayer.bufferCanvas.element)

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
