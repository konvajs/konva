function Test() {
    this.testOnly = "";
    this.counter = 0;
    this.tests = {
        ////////////////////////////////////////////////////////////////////////
        //  STAGE tests
        ////////////////////////////////////////////////////////////////////////

        "STAGE - instantiate stage with id": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
        },
        "STAGE - instantiate stage with dom element": function(containerId) {
            var containerDom = document.getElementById(containerId);
            var stage = new Kinetic.Stage(containerDom, 578, 200);
        },
        "STAGE - add shape then stage then layer": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                name: "myCircle"
            });

            group.add(circle);
            stage.add(layer);
            layer.add(group);
            layer.draw();
        },
        "STAGE - add layer then group then shape": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                name: "myCircle"
            });

            stage.add(layer);
            layer.add(group);
            group.add(circle);
            layer.draw();
        },
        "STAGE - scale stage after add layer": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(circle);
            stage.add(layer);

            stage.setScale(0.5);

            stage.draw();
        },
        "STAGE - scale stage before add shape": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            stage.setScale(0.5);
            layer.add(circle);
            stage.add(layer);
        },
        "STAGE - scale stage with no shapes": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            stage.add(layer);
            stage.setScale(0.5);

            stage.draw();
        },
        ////////////////////////////////////////////////////////////////////////
        //  LAYERS tests
        ////////////////////////////////////////////////////////////////////////

        "LAYERS - add layer": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            stage.add(layer);
        },
        "LAYERS - remove all children from layer": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle1 = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            var circle2 = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(circle1);
            layer.add(circle1);
            stage.add(layer);

            test(layer.children.length === 2, "layer should have 2 children");

            layer.removeChildren();

            test(layer.children.length === 0, "layer should have 0 children");
        },
        "LAYERS - remove layer": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                name: "myCircle"
            });

            layer.add(circle);
            stage.add(layer);

            test(stage.children.length === 1, "stage should have 1 children");

            stage.remove(layer);

            test(stage.children.length === 0, "stage should have 0 children");
        },
        "LAYERS - hide layer": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(circle);
            stage.add(layer);

            layer.hide();
            layer.draw();
        },
        ////////////////////////////////////////////////////////////////////////
        //  GROUPS tests
        ////////////////////////////////////////////////////////////////////////

        "GROUPS - add group": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();

            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            group.add(circle);
            layer.add(group);
            stage.add(layer);
        },
        ////////////////////////////////////////////////////////////////////////
        //  SHAPES tests
        ////////////////////////////////////////////////////////////////////////

        "SHAPES - add rect": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                centerOffset: {
                    x: 50
                },
                scale: {
                    x: 2,
                    y: 2
                }
            });

            layer.add(rect);
            stage.add(layer);

            stage.onFrame(function() {
                rect.rotate(Math.PI / 100);
                layer.draw();
            });
            //stage.start();
        },
        "SHAPES - add circle": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                centerOffset: {
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

            stage.onFrame(function() {
                circle.rotate(Math.PI / 100);
                layer.draw();
            });
            //stage.start();
        },
        "SHAPES - add image": function(containerId) {
            var imageObj = new Image();
            imageObj.onload = function() {
                var stage = new Kinetic.Stage(containerId, 578, 200);
                var layer = new Kinetic.Layer();
                var darth = new Kinetic.Image({
                    x: 10,
                    y: 10,
                    image: imageObj,
                    width: 100,
                    centerOffset: {
                        x: this.width / 2,
                        y: this.height / 2
                    }
                });

                layer.add(darth);
                stage.add(layer);

                stage.onFrame(function() {
                    darth.rotate(Math.PI / 100);
                    layer.draw();
                });
                //stage.start();
            };
            imageObj.src = "darth-vader.jpg";
        },
        "SHAPES - add polygon": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
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
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                centerOffset: {
                    x: 300,
                    y: 100
                }
            });

            layer.add(poly);
            stage.add(layer);

            stage.onFrame(function() {
                poly.rotate(Math.PI / 100);
                layer.draw();
            });
            //stage.start();
        },
        "SHAPES - add regular polygon triangle": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var poly = new Kinetic.RegularPolygon({
                x: 200,
                y: 100,
                sides: 3,
                radius: 50,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                name: "foobar",
                centerOffset: {
                    y: -50
                }
            });

            layer.add(poly);
            stage.add(layer);

            stage.onFrame(function() {
                poly.rotate(Math.PI / 100);
                layer.draw();
            });
            //stage.start();
        },
        "SHAPES - add regular polygon square": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var poly = new Kinetic.RegularPolygon({
                x: 200,
                y: 100,
                sides: 4,
                radius: 50,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                name: "foobar"
            });

            layer.add(poly);
            stage.add(layer);
        },
        "SHAPES - add regular polygon pentagon": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var poly = new Kinetic.RegularPolygon({
                x: 200,
                y: 100,
                sides: 5,
                radius: 50,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                name: "foobar"
            });

            layer.add(poly);
            stage.add(layer);
        },
        "SHAPES - add regular polygon octogon": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var poly = new Kinetic.RegularPolygon({
                x: 200,
                y: 100,
                sides: 8,
                radius: 50,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                name: "foobar"
            });

            layer.add(poly);
            stage.add(layer);
        },
        "SHAPES - add 5 point star": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var star = new Kinetic.Star({
                x: 200,
                y: 100,
                points: 5,
                innerRadius: 40,
                outerRadius: 70,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                name: "foobar",
                centerOffset: {
                    y: -70
                },
                scale: {
                    x: 0.5,
                    y: 0.5
                }
            });

            layer.add(star);
            stage.add(layer);

            stage.onFrame(function() {
                star.rotate(Math.PI / 100);
                layer.draw();
            });
            //stage.start();
        },
        "SHAPES - add stroke rect": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                stroke: "green",
                strokeWidth: 4
            });

            layer.add(rect);
            stage.add(layer);
        },
        "SHAPES - use default stroke": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
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

            test(rect.stroke === "black", "stroke should be black");
        },
        "SHAPES - use default stroke width": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                stroke: "blue"
            });

            layer.add(rect);
            stage.add(layer);

            test(rect.strokeWidth === 2, "stroke width should be 2");
        },
        "SHAPES - set center offset after instantiation": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                stroke: "blue",
                centerOffset: {
                    x: 20,
                    y: 20
                }
            });

            layer.add(rect);
            stage.add(layer);

            test(rect.centerOffset.x === 20, "center offset x should be 20");
            test(rect.centerOffset.y === 20, "center offset y should be 20");

            rect.setCenterOffset(40, 40);

            test(rect.centerOffset.x === 40, "center offset x should be 40");
            test(rect.centerOffset.y === 40, "center offset y should be 40");

        },
        "SHAPES - custom shape with fill, stroke, and strokeWidth": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var shape = new Kinetic.Shape({
                drawFunc: function() {
                    var context = this.getContext();
                    context.beginPath();
                    context.moveTo(0, 0);
                    context.lineTo(100, 0);
                    context.lineTo(100, 100);
                    context.closePath();
                    this.fillStroke();
                },
                x: 200,
                y: 100,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5
            });

            layer.add(shape);
            stage.add(layer);
        },
        "SHAPES - init with position, scale, rotation, then change scale": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                scale: {
                    x: 0.5,
                    y: 0.5
                },
                rotation: 20 * Math.PI / 180
            });

            test(rect.getPosition().x == 200, "rect should be at x = 200");
            test(rect.getPosition().y == 100, "rect should be at y = 100");
            test(rect.getScale().x == 0.5, "rect x scale should be 0.5");
            test(rect.getScale().y == 0.5, "rect y scale should be 0.5");
            test(rect.getRotation() == 20 * Math.PI / 180, "rect should rotated by 20 degrees");

            rect.setScale(2, 0.3);
            test(rect.getScale().x == 2, "rect x scale should be 2");
            test(rect.getScale().y == 0.3, "rect y scale should be 0.3");

            layer.add(rect);
            stage.add(layer);
        },
        "SHAPES - rotation in degrees": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                rotationDeg: 10
            });

            test(rect.getRotationDeg() === 10, "rotation should be 10 degrees");
            rect.setRotationDeg(20);
            test(rect.getRotationDeg() === 20, "rotation should be 20 degrees");
            rect.rotateDeg(20);
            test(rect.getRotationDeg() === 40, "rotation should be 40 degrees");

            layer.add(rect);
            stage.add(layer);
        },
        "SHAPES - add text": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var text = new Kinetic.Text({
                x: stage.width / 2,
                y: stage.height / 2,
                stroke: "green",
                strokeWidth: 5,
                fill: "#ddd",
                text: "Hello World!",
                fontSize: 60,
                fontFamily: "Calibri",
                textFill: "#888",
                textStroke: "#333",
                padding: 10,
                //draggable: true,
                align: "center",
                verticalAlign: "middle"
            });

            layer.add(text);
            stage.add(layer);

            stage.onFrame(function() {
                text.rotate(Math.PI / 100);
                layer.draw();
            });
            //stage.start();

            /*
             * test getters and setters
             */
            text.setText("Bye World!");
            test(text.getText() === "Bye World!", "text should be Bye World!");
            test(text.getPadding() === 10, "padding should be 10");
            text.setPadding(20);
            test(text.getPadding() === 20, "padding should be 20");

            layer.draw();

            text.setFontFamily("Arial");
            text.setFontSize(30);
            text.setAlign("right");
            text.setVerticalAlign("top");
            text.setTextFill("blue");
            text.setTextStroke("red");
            text.setTextStrokeWidth(10);

            test(text.getFontFamily() === "Arial", "font family should be Arial");
            test(text.getFontSize() === 30, "text size should be 30");
            test(text.getAlign() === "right", "text align should be right");
            test(text.getVerticalAlign() === "top", "vertical align should be top");
            test(text.getTextFill() === "blue", "text fill should be blue");
            test(text.getTextStroke() === "red", "text stroke should be red");
            test(text.getTextStrokeWidth() === 10, "test stroke width should be 10");
        },
        "SHAPES - get shape name": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                name: "myCircle"
            });

            layer.add(circle);
            stage.add(layer);

            test(circle.getName() == "myCircle", "name should be myCircle");
        },
        "SHAPES - remove shape": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                name: "myCircle"
            });

            layer.add(circle);
            stage.add(layer);

            test(layer.children.length === 1, "layer should have 1 children");

            layer.remove(circle);

            test(layer.children.length === 0, "layer should have 0 children");
            test(layer.getChild("myCircle") === undefined, "shape should be null");

            layer.draw();
        },
        "STAGE - add layer then shape": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4,
                name: "myCircle"
            });

            stage.add(layer);
            layer.add(circle);
            layer.draw();
        },
        "SHAPES - move shape, group, and layer, and then get absolute position": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();

            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            group.add(circle);
            layer.add(group);
            stage.add(layer);

            circle.setPosition(100, 0);
            group.setPosition(100, 0);
            layer.setPosition(100, 0);

            // test relative positions
            test(circle.getPosition().x == 100, "circle should be at x = 100");
            test(group.getPosition().x == 100, "group should be at x = 100");
            test(layer.getPosition().x == 100, "layer should be at x = 100");

            // test absolute positions
            test(circle.getAbsolutePosition().x == 300, "circle should be at x = 300");
            test(group.getAbsolutePosition().x == 200, "group should be at x = 200");
            test(layer.getAbsolutePosition().x == 100, "layer should be at x = 100");

            layer.draw();
        },
        "SHAPES - hide circle": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(circle);
            stage.add(layer);

            circle.hide();
            layer.draw();
        },
        "SHAPES - hide show circle": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(circle);
            stage.add(layer);

            circle.hide();
            layer.draw();

            circle.show();
            layer.draw();
        },
        "GROUPS - hide group": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            group.add(circle);
            layer.add(group);
            stage.add(layer);

            group.hide();
            layer.draw();
        },
        "SHAPES - set shape alpha to 0.5": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            circle.setAlpha(0.5);
            layer.add(circle);
            stage.add(layer);
        },
        "SHAPES - set shape alpha to 0.5 then back to 1": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            circle.setAlpha(0.5);
            layer.add(circle);
            stage.add(layer);

            test(circle.getAbsoluteAlpha() === 0.5, "abs alpha should be 0.5");

            circle.setAlpha(1);
            layer.draw();

            test(circle.getAbsoluteAlpha() === 1, "abs alpha should be 1");
        },
        "STAGE - set shape and layer alpha to 0.5": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            circle.setAlpha(0.5);
            layer.setAlpha(0.5);
            layer.add(circle);
            stage.add(layer);

            test(circle.getAbsoluteAlpha() === 0.25, "abs alpha should be 0.25");
            test(layer.getAbsoluteAlpha() === 0.5, "abs alpha should be 0.5");
        },
        "SHAPES - scale shape by half": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            circle.setScale(0.5, 1);
            layer.add(circle);
            stage.add(layer);
        },
        "SHAPES - scale shape by half then back to 1": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            circle.setScale(0.5, 1);
            circle.setScale(1, 1);
            layer.add(circle);
            stage.add(layer);
        },
        ////////////////////////////////////////////////////////////////////////
        //  LAYERING tests
        ////////////////////////////////////////////////////////////////////////

        "LAYERING - move blue circle on top of green circle with moveToTop": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var blueCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                fill: "blue",
                stroke: "black",
                strokeWidth: 4
            });

            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(blueCircle);
            layer.add(greenCircle);
            stage.add(layer);

            test(blueCircle.getZIndex() === 0, "blue circle should have zindex 0 before relayering");
            test(greenCircle.getZIndex() === 1, "green circle should have zindex 1 before relayering");

            blueCircle.moveToTop();

            test(blueCircle.getZIndex() === 1, "blue circle should have zindex 1 after relayering");
            test(greenCircle.getZIndex() === 0, "green circle should have zindex 0 after relayering");

            layer.draw();
        },
        "LAYERING - move green circle below blue circle with moveDown": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();

            var blueCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                fill: "blue",
                stroke: "black",
                strokeWidth: 4
            });

            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(blueCircle);
            layer.add(greenCircle);
            stage.add(layer);

            test(blueCircle.getZIndex() === 0, "blue circle should have zindex 0 before relayering");
            test(greenCircle.getZIndex() === 1, "green circle should have zindex 1 before relayering");

            greenCircle.moveDown();

            test(blueCircle.getZIndex() === 1, "blue circle should have zindex 1 after relayering");
            test(greenCircle.getZIndex() === 0, "green circle should have zindex 0 after relayering");

            layer.draw();
        },
        "LAYERING - move blue group on top of green group with moveToTop": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var greenGroup = new Kinetic.Group();
            var blueGroup = new Kinetic.Group();

            var blueCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                fill: "blue",
                stroke: "black",
                strokeWidth: 4
            });

            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            blueGroup.add(blueCircle);
            greenGroup.add(greenCircle);

            layer.add(blueGroup);
            layer.add(greenGroup);
            stage.add(layer);

            test(blueGroup.getZIndex() === 0, "blue group should have zindex 0 before relayering");
            test(greenGroup.getZIndex() === 1, "green group should have zindex 1 before relayering");

            blueGroup.moveToTop();

            test(blueGroup.getZIndex() === 1, "blue group should have zindex 1 after relayering");
            test(greenGroup.getZIndex() === 0, "green group should have zindex 0 after relayering");

            layer.draw();
        },
        "LAYERING - move blue group on top of green group with moveUp": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var greenGroup = new Kinetic.Group();
            var blueGroup = new Kinetic.Group();

            var blueCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                fill: "blue",
                stroke: "black",
                strokeWidth: 4
            });

            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            blueGroup.add(blueCircle);
            greenGroup.add(greenCircle);

            layer.add(blueGroup);
            layer.add(greenGroup);
            stage.add(layer);

            test(blueGroup.getZIndex() === 0, "blue group should have zindex 0 before relayering");
            test(greenGroup.getZIndex() === 1, "green group should have zindex 1 before relayering");

            blueGroup.moveUp();

            test(blueGroup.getZIndex() === 1, "blue group should have zindex 1 after relayering");
            test(greenGroup.getZIndex() === 0, "green group should have zindex 0 after relayering");

            layer.draw();
        },
        "LAYERING - move blue layer on top of green layer with moveToTop": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var blueLayer = new Kinetic.Layer();
            var greenLayer = new Kinetic.Layer();

            var blueCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                fill: "blue",
                stroke: "black",
                strokeWidth: 4
            });

            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            blueLayer.add(blueCircle);
            greenLayer.add(greenCircle);

            stage.add(blueLayer);
            stage.add(greenLayer);

            blueLayer.moveToTop();
        },
        "LAYERING - move green layer below blue layer with moveToBottom": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var blueLayer = new Kinetic.Layer();
            var greenLayer = new Kinetic.Layer();

            var blueCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                fill: "blue",
                stroke: "black",
                strokeWidth: 4
            });

            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            blueLayer.add(blueCircle);
            greenLayer.add(greenCircle);

            stage.add(blueLayer);
            stage.add(greenLayer);

            greenLayer.moveToBottom();
        },
        ////////////////////////////////////////////////////////////////////////
        //  ANIMATION tests
        ////////////////////////////////////////////////////////////////////////

        "ANIMATION - stage and global object animation properties": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(rect);
            stage.add(layer);

            var amplitude = 150;
            var period = 1000;
            // in ms
            var centerX = stage.width / 2 - 100 / 2;

            stage.onFrame(function(frame) {
                rect.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;
                layer.draw();
            });
            test(stage.isAnimating === false, "stage should not be animating");
            test(Kinetic.GlobalObject.isAnimating === false, "global object should not be animating");

            stage.start();

            test(stage.isAnimating === true, "stage should be animating");
            test(Kinetic.GlobalObject.isAnimating === true, "global object should be animating");

            stage.stop();

            test(stage.isAnimating === false, "stage should not be animating");
            test(Kinetic.GlobalObject.isAnimating === false, "global object should not be animating");
        },
        "ANIMATION - run animation": function(containerId) {
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var rect = new Kinetic.Rect({
                x: 200,
                y: 100,
                width: 100,
                height: 50,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });

            layer.add(rect);
            stage.add(layer);

            var amplitude = 150;
            var period = 1000;
            // in ms
            var centerX = stage.width / 2 - 100 / 2;

            stage.onFrame(function(frame) {
                rect.x = amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX;
                layer.draw();
            });

            stage.start();

        }
    };
}