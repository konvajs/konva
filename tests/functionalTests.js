function Test(){
    this.testOnly = "";
    this.counter = 0;
    this.tests = {
        "DRAG AND DROP - draggable true": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle.draggable(true);
            
            layer.add(circle);
            stage.add(layer);
        },
        "DRAG AND DROP - draggable true false": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle.draggable(true);
            
            layer.add(circle);
            stage.add(layer);
            
            circle.draggable(false);
        },
        "DRAG AND DROP - scale stage after add layer then drag and drop shape": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle.draggable(true);
            
            layer.add(circle);
            stage.add(layer);
            
            stage.setScale(0.5);
            
            stage.draw();
        },
        "DRAG AND DROP - scale stage before add shape then drag and drop shape": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle.draggable(true);
            
            stage.setScale(0.5);
            layer.add(circle);
            stage.add(layer);
        },
        "DRAG AND DROP - set stage scale to 1.5 after add layer then drag and drop shape": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle.draggable(true);
            
            layer.add(circle);
            stage.add(layer);
            
            stage.setScale(1.5);
            
            stage.draw();
        },
        "DRAG AND DROP - set stage scale to 1.5 before add layer then drag and drop shape": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle.draggable(true);
            
            stage.setScale(1.5);
            
            layer.add(circle);
            stage.add(layer);
        },
        "DRAG AND DROP - check that other events are disabled": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle1 = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4
            });
            
            var circle2 = new Kinetic.Circle({
                x: stage.width / 2 + 50,
                y: stage.height / 2,
                radius: 70,
                fill: "green",
                stroke: "black",
                strokeWidth: 4
            });
            
            circle1.draggable(true);
            
            circle2.on("mouseover", function(){
                log("mouseover green circle");
            });
            
            layer.add(circle1);
            layer.add(circle2);
            stage.add(layer);
        },
        "EVENTS - mousedown mouseup mouseover mouseout click dblclick": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 70,
                fill: "red",
                stroke: "black",
                strokeWidth: 4,
                draggable: true
            });
            
            circle.on('mousedown', function(){
                log('mousedown');
            });
            
            circle.on('mouseup', function(){
                log('mouseup');
            });
            
            circle.on('mouseover', function(){
                log('mouseover');
            });
            
            circle.on('mouseout', function(){
                log('mouseout');
            });
            
            circle.on('click', function(){
                log('click');
            });
            
            circle.on('dblclick', function(){
                log('dblclick');
            });
            
            layer.add(circle);
            stage.add(layer);
        },
        "EVENTS - modify fill stroke and stroke width": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: 380,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "red",
                stroke: "black"
            });
            
            circle.on("mouseover", function(){
                this.setFill("yellow");
                this.setStroke("purple");
                this.setStrokeWidth(20);
                layer.draw();
            });
            
            circle.on("mouseout", function(){
                this.setFill("red");
                this.setStroke("black");
                this.setStrokeWidth(4);
                layer.draw();
            });
            
            layer.add(circle);
            stage.add(layer);
        },
        "EVENTS - 10 point star geometry modify stroke fill and stroke width": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            
            var star = new Kinetic.Star({
                x: 200,
                y: 100,
                points: 10,
                innerRadius: 40,
                outerRadius: 70,
                fill: "green",
                stroke: "blue",
                strokeWidth: 5,
                name: "foobar"
            });
            
            star.on("mouseover", function(){
                this.setFill("yellow");
                this.setStroke("purple");
                this.setStrokeWidth(20);
                layer.draw();
            });
            
            star.on("mouseout", function(){
                this.setFill("green");
                this.setStroke("blue");
                this.setStrokeWidth(5);
                layer.draw();
            });
            
            layer.add(star);
            stage.add(layer);
        },
        "EVENTS - image geometry modify fill stroke and stroke width": function(containerId){
            var imageObj = new Image();
            imageObj.onload = function(){
                var stage = new Kinetic.Stage(containerId, 578, 200);
                var layer = new Kinetic.Layer();
                var darth = new Kinetic.Image({
                    x: 60,
                    y: 60,
                    image: imageObj
                });
                
                darth.on("mouseover", function(){
                    this.setFill("yellow");
                    this.setStroke("purple");
                    this.setStrokeWidth(20);
                    layer.draw();
                });
                
                darth.on("mouseout", function(){
                    this.setFill("");
                    this.setStroke("");
                    this.setStrokeWidth(0);
                    layer.draw();
                });
                
                layer.add(darth);
                stage.add(layer);
            };
            imageObj.src = "darth-vader.jpg";
        },
        "EVENTS - drag events click": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: 380,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "red",
                stroke: "black"
            });
            
            circle.draggable(true);
            
            
            
            circle.on('dragstart', function(){
                log('dragstart');
            });
            
            circle.on('dragmove', function(){
                log('dragmove');
            });
            
            circle.on('dragend', function(){
                log('dragend');
            });
            
            circle.on('click', function(){
                log('click');
            });
            
            layer.add(circle);
            stage.add(layer);
        },
        "EVENTS - isDragging": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var circle = new Kinetic.Circle({
                x: 380,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "red",
                stroke: "black"
            });
            
            //log('not dragging yet before draggable, isDragging: ' + circle.isDragging());
            test(circle.isDragging() === false, "isDragging() should be false");
            
            circle.draggable(true);
            
            //log('not dragging yet after draggable, isDragging: ' + circle.isDragging());
            test(circle.isDragging() === false, "isDragging() should be false");
            
            circle.on('dragstart', function(){
                log('dragstart, isDragging: ' + this.isDragging());
                test(circle.isDragging() === true, "isDragging() should be true");
            });
            
            circle.on('dragmove', function(){
                log('dragmove, isDragging: ' + this.isDragging());
                test(circle.isDragging() === true, "isDragging() should be true");
            });
            
            circle.on('dragend', function(){
                log('dragend, isDragging: ' + this.isDragging());
                test(circle.isDragging() === false, "isDragging() should be false");
            });
            
            layer.add(circle);
            stage.add(layer);
        },
        "EVENTS - mousemove from shape to another shape in same layer": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            
            var redCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "red",
                stroke: "black"
            });
            
            redCircle.on("mouseover", function(){
                log('mouseover red circle');
            });
            redCircle.on("mouseout", function(){
                log('mouseout red circle');
            });
            
            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "green",
                stroke: "black"
            });
            
            greenCircle.on("mouseover", function(){
                log('mouseover green circle');
            });
            greenCircle.on("mouseout", function(){
                log('mouseout green circle');
            });
            
            layer.add(redCircle);
            layer.add(greenCircle);
            
            stage.add(layer);
        },
        "EVENTS - mousemove from shape in one layer to shape in another layer": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var redLayer = new Kinetic.Layer();
            var greenLayer = new Kinetic.Layer();
            
            var redCircle = new Kinetic.Circle({
                x: 200,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "red",
                stroke: "black"
            });
            
            redCircle.on("mouseover", function(){
                log('mouseover red circle');
            });
            redCircle.on("mouseout", function(){
                log('mouseout red circle');
            });
            
            var greenCircle = new Kinetic.Circle({
                x: 280,
                y: stage.height / 2,
                radius: 70,
                strokeWidth: 4,
                fill: "green",
                stroke: "black"
            });
            
            greenCircle.on("mouseover", function(){
                log('mouseover green circle');
            });
            greenCircle.on("mouseout", function(){
                log('mouseout green circle');
            });
            
            redLayer.add(redCircle);
            greenLayer.add(greenCircle);
            
            stage.add(redLayer);
            stage.add(greenLayer);
        },
        "EVENTS - event bubbling": function(containerId){
            var stage = new Kinetic.Stage(containerId, 578, 200);
            var layer = new Kinetic.Layer();
            var group = new Kinetic.Group();
            
            layer.on("mouseover", function(){
                log('mouseover layer');
                //console.log(this);
            });
            layer.on("mouseout", function(){
                log('mouseout layer');
                //console.log(this);
            });
            
            group.on("mouseover", function(){
                log('mouseover group');
                //console.log(this);
            });
            group.on("mouseout", function(){
                log('mouseout group');
                //console.log(this);
            });
            
            var redCircle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 80,
                strokeWidth: 4,
                fill: "red",
                stroke: "black"
            });
            
            redCircle.on("mouseover", function(){
                log('mouseover red circle');
                //console.log(this);
            });
            redCircle.on("mouseout", function(){
                log('mouseout red circle');
                //console.log(this);
            });
            
            var greenCircle = new Kinetic.Circle({
                x: stage.width / 2,
                y: stage.height / 2,
                radius: 40,
                strokeWidth: 4,
                fill: "green",
                stroke: "black"
            });
            
            greenCircle.on("mouseover", function(){
                log('mouseover green circle');
                //console.log(this);
            });
            greenCircle.on("mouseout", function(){
                log('mouseout green circle');
                //console.log(this);
            });
            
            group.add(redCircle);
            group.add(greenCircle);
            
            layer.add(group);
            stage.add(layer);
        }
    };
}
