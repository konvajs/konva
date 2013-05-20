
Test.Modules.DD = {
    'remove shape with onclick': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var top = stage.content.getBoundingClientRect().top;

        var layer = new Kinetic.Layer();

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

        layer.add(circle);
        stage.add(layer);

        function remove() {
            circle.remove();
            layer.draw();
            testDataUrl(layer.toDataURL(), 'cleared', 'canvas should be cleared after removing shape onclick');
        }

        circle.on('click', function() {
            setTimeout(remove, 0);
        });

        stage._mousedown({
            clientX: 291,
            clientY: 112 + top
        });
        
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});
    },
    'test dragstart, dragmove, dragend': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        
        var greenCircle = new Kinetic.Circle({
            x: 40,
            y: 40,
            radius: 20,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            opacity: 0.5
        });
        
        
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            opacity: 0.5
            
        });

        circle.setDraggable(true);

        layer.add(circle);
        layer.add(greenCircle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        var dragStart = false;
        var dragMove = false;
        var dragEnd = false;
        var mouseup = false;
        var layerDragMove = false;
        var events = [];

        circle.on('dragstart', function() {
            dragStart = true;
        });

        
        circle.on('dragmove', function() {
            dragMove = true;
        });
        
        
        layer.on('dragmove', function() {
            //console.log('move');
        });

        circle.on('dragend', function() {
            dragEnd = true;
            console.log('dragend');
            events.push('dragend');
        });

        

        circle.on('mouseup', function() {
            console.log('mouseup');
            events.push('mouseup');
        });
        
        testDataUrl(layer.toDataURL(), 'drag circle before', 'start data url is incorrect');

        test(!Kinetic.Global.isDragging(), 'Global isDragging() should be false');
        test(!Kinetic.Global.isDragReady(), 'Global isDragReady()) should be false');

        /*
        * simulate drag and drop
        */
        //console.log(1)
        stage._mousedown({
            clientX: 380,
            clientY: 98 + top
        });
        //console.log(2)
        test(!dragStart, 'dragstart event should not have been triggered');
        //test(!dragMove, 'dragmove event should not have been triggered');
        test(!dragEnd, 'dragend event should not have been triggered');

        test(!Kinetic.Global.isDragging(), 'Global isDragging() should be false');
        test(Kinetic.Global.isDragReady(), 'Global isDragReady()) should be true');

        stage._mousemove({
            clientX: 100,
            clientY: 98 + top
        });

        test(Kinetic.Global.isDragging(), 'Global isDragging() should be true');
        test(Kinetic.Global.isDragReady(), 'Global isDragReady()) should be true');

        test(dragStart, 'dragstart event was not triggered');
        //test(dragMove, 'dragmove event was not triggered');
        test(!dragEnd, 'dragend event should not have been triggered');

        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 100,
            clientY: 98 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});
        
        test(dragStart, 'dragstart event was not triggered');
        test(dragMove, 'dragmove event was not triggered');
        test(dragEnd, 'dragend event was not triggered');
        
        test(events.toString() === 'mouseup,dragend', 'mouseup should occur before dragend');


        test(!Kinetic.Global.isDragging(), 'Global isDragging() should be false');
        test(!Kinetic.Global.isDragReady(), 'Global isDragReady()) should be false');

        testDataUrl(layer.toDataURL(), 'drag circle after', 'end data url is incorrect');
        
        showHit(layer);
        
    },
    'destroy shape while dragging': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        
        var greenCircle = new Kinetic.Circle({
            x: 40,
            y: 40,
            radius: 20,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            opacity: 0.5
        });
        
        
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            opacity: 0.5
            
        });

        circle.setDraggable(true);

        layer.add(circle);
        layer.add(greenCircle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;


        var dragEnd = false;


        circle.on('dragend', function() {
            dragEnd = true;

        });

        

        circle.on('mouseup', function() {
            console.log('mouseup');
            events.push('mouseup');
        });
        
        testDataUrl(layer.toDataURL(), 'drag circle before', 'start data url is incorrect');

        test(!Kinetic.Global.isDragging(), 'Global isDragging() should be false');
        test(!Kinetic.Global.isDragReady(), 'Global isDragReady()) should be false');


        stage._mousedown({
            clientX: 380,
            clientY: 98 + top
        });

        test(!circle.isDragging(), 'circle should not be dragging');

        stage._mousemove({
            clientX: 100,
            clientY: 98 + top
        });

   
        test(circle.isDragging(), 'circle should be dragging');
        test(!dragEnd, 'dragEnd should not have fired yet');

        // at this point, we are in drag and drop mode


        // removing or destroying the circle should trigger dragend
        circle.destroy();
        layer.draw();

        test(!circle.isDragging(), 'destroying circle should stop drag and drop');
        test(dragEnd, 'dragEnd should have fired');
        

        
    },
    'cancel drag and drop by setting draggable to false': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: 100,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            draggable: true
        });

        var dragStart = false;
        var dragMove = false;
        var dragEnd = false;

        circle.on('dragstart', function() {
            dragStart = true;
        });

        circle.on('dragmove', function() {
            dragMove = true;
        });

        circle.on('dragend', function() {
            dragEnd = true;
        });

        circle.on('mousedown', function() {
            circle.setDraggable(false);
        });

        layer.add(circle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        /*
         * simulate drag and drop
         */
        stage._mousedown({
            clientX: 380,
            clientY: 100 + top
        });

        stage._mousemove({
            clientX: 100,
            clientY: 100 + top
        });

        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 100,
            clientY: 100 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});

        test(circle.getPosition().x === 380, 'circle x should be 380');
        test(circle.getPosition().y === 100, 'circle y should be 100');
    },
    'drag and drop layer': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer({
            drawFunc: function() {
                var context = this.getContext();
                context.beginPath();
                context.moveTo(200, 50);
                context.lineTo(420, 80);
                context.quadraticCurveTo(300, 100, 260, 170);
                context.closePath();
                context.fillStyle = 'blue';
                context.fill(context);
            },
            draggable: true
        });

        var circle1 = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });

        var circle2 = new Kinetic.Circle({
            x: 400,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green'
        });

        layer.add(circle1);
        layer.add(circle2);

        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        //console.log(layer.toDataURL())
        testDataUrl(layer.toDataURL(), 'drag layer before', 'start data url is incorrect');

        /*
         * simulate drag and drop
         */
        stage._mousedown({
            clientX: 399,
            clientY: 96 + top
        });

        stage._mousemove({
            clientX: 210,
            clientY: 109 + top
        });

        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 210,
            clientY: 109 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle2});

        //console.log(layer.toDataURL())
        testDataUrl(layer.toDataURL(), 'drag layer after', 'end data url is incorrect');

    }
};

Test.Modules.EVENT = {
    'draw events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });
        
        var eventNodes = [];
        var savedEvt;
        var order = [];

        layer.on('draw', function(evt) {
            savedEvt = evt;
            eventNodes.push(this.getType());
            order.push('layer draw');
        });
        
        stage.on('draw', function(evt) {
            eventNodes.push(this.getType());
            order.push('stage draw');
        });
        
        layer.on('beforeDraw', function(evt) {
            order.push('layer beforeDraw');
        });
        
        stage.on('beforeDraw', function(evt) {
            order.push('stage beforeDraw');
        });
       

        layer.add(circle);
        stage.add(layer);
        
        // Note: draw events no longer bubble
        //test(eventNodes.toString() === 'Layer,Stage', 'layer draw event should have fired followed by stage draw event');
        
        test(savedEvt.node.getType() === 'Layer', 'event object should contain a node property which is Layer');
        
        //test(order.toString() === 'layer beforeDraw,stage beforeDraw,layer draw,stage draw', 'order should be: layer beforeDraw,stage beforeDraw,layer draw,stage draw');

    },
    'click mapping': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer({
            drawFunc: function() {
                var context = this.getContext();
                context.beginPath();
                context.moveTo(200, 50);
                context.lineTo(420, 80);
                context.quadraticCurveTo(300, 100, 260, 170);
                context.closePath();
                context.fillStyle = 'blue';
                context.fill(context);
            }
        });

        var redCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });

        var greenCircle = new Kinetic.Circle({
            x: 400,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green'
        });
        
        var redClicks = 0;
        var greenClicks = 0;
        
        redCircle.on('click', function() {
            console.log('clicked redCircle');
            redClicks++;
        });
        
        greenCircle.on('click', function() {
            console.log('clicked greenCircle');
            greenClicks++;
        });
        

        layer.add(redCircle);
        layer.add(greenCircle);

        stage.add(layer);
        var top = stage.content.getBoundingClientRect().top;

        showHit(layer);

        // mousedown and mouseup on red circle
        stage._mousedown({
            clientX: 284,
            clientY: 113 + top
        });
        
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 284,
            clientY: 113 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:redCircle});
        
        test(redClicks === 1, 'red circle should have 1 click');
        test(greenClicks === 0, 'green circle should have 0 clicks');
        
        // mousedown and mouseup on green circle
        stage._mousedown({
            clientX: 397,
            clientY: 108 + top
        });
        
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 397,
            clientY: 108 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:redCircle});
        
        test(redClicks === 1, 'red circle should have 1 click');
        test(greenClicks === 1, 'green circle should have 1 click');
        
        // mousedown red circle and mouseup on green circle
        stage._mousedown({
            clientX: 284,
            clientY: 113 + top
        });
        
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 397,
            clientY: 108 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:redCircle});
        
        test(redClicks === 1, 'red circle should still have 1 click');
        test(greenClicks === 1, 'green circle should still have 1 click');
        
    },
    'text events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 290,
            y: 111,
            fontFamily: 'Calibri',
            fontSize: 30,
            fill: 'red',
            text: 'Testing 123',
            draggable: true
        });
        
        var click = false
        
        text.on('click', function() {
            console.log('text click');
            click = true; 
        });

        layer.add(text);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;
        
        showHit(layer);
        
        stage._mousedown({
            clientX: 300,
            clientY: 120 + top
        });
        
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 300,
            clientY: 120 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:text});
        
        //TODO: can't get this to pass
        test(click, 'click event should have been fired when mousing down and then up on text');

    },
    'modify fill stroke and stroke width on hover with circle': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer({
            throttle: 999
        });
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        circle.on('mouseover', function() {
            this.setFill('yellow');
            this.setStroke('purple');
            this.setStrokeWidth(20);
            //console.log('mouseover')
            layer.draw();
        });

        circle.on('mouseout', function() {
            this.setFill('red');
            this.setStroke('black');
            this.setStrokeWidth(4);
            //console.log('mouseout')
            layer.draw();
        });

        layer.add(circle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        testDataUrl(layer.toDataURL(), 'modify fill and stroke before', 'start data url is incorrect');

        stage._mousemove({
            clientX: 377,
            clientY: 101 + top
        });

        testDataUrl(layer.toDataURL(), 'modify fill and stroke after', 'mid data url is incorrect');

        // move mouse back out of circle
        stage._mousemove({
            clientX: 157,
            clientY: 138 + top
        });
        stage._mousemove({
            clientX: 157,
            clientY: 138 + top
        });

        testDataUrl(layer.toDataURL(), 'modify fill and stroke before', 'end data url is incorrect');
    },
    'mousedown mouseup mouseover mouseout mousemove click dblclick / touchstart touchend touchmove tap dbltap': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });

        // desktop events
        var mousedown = false;
        var mouseup = false;
        var click = false;
        var dblclick = false;
        var mouseover = false;
        var mouseout = false;
        var mousemove = false;

        // mobile events
        var touchstart = false;
        var touchend = false;
        var tap = false;
        var touchmove = false;
        var dbltap = false;

        circle.on('mousedown', function() {
            mousedown = true;
            //log('mousedown');
        });

        circle.on('mouseup', function() {
            mouseup = true;
            //log('mouseup');
        });

        circle.on('mouseover', function() {
            mouseover = true;
            //log('mouseover');
        });

        circle.on('mouseout', function() {
            mouseout = true;
            //log('mouseout');
        });

        circle.on('mousemove', function() {
            mousemove = true;
            //log('mousemove');
        });

        circle.on('click', function() {
            click = true;
            //log('click');
        });

        circle.on('dblclick', function() {
            dblclick = true;
            //log('dblclick');
        });
        /*
         * mobile
         */
        circle.on('touchstart', function() {
            touchstart = true;
            //log('touchstart');
        });

        circle.on('touchend', function() {
            touchend = true;
            //log('touchend');
        });

        circle.on('touchmove', function() {
            touchmove = true;
            //log('touchmove');
        });

        circle.on('tap', function(evt) {
            tap = true;
            //log('tap');
        });

        circle.on('dbltap', function() {
            dbltap = true;
            //log('dbltap');
        });

        layer.add(circle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        // move mouse to center of circle to trigger mouseover
        stage._mousemove({
            clientX: 290,
            clientY: 100 + top
        });

        test(mouseover, '1) mouseover should be true');
        test(!mousemove, '1) mousemove should be true');
        test(!mousedown, '1) mousedown should be false');
        test(!mouseup, '1) mouseup should be false');
        test(!click, '1) click should be false');
        test(!dblclick, '1) dblclick should be false');
        test(!mouseout, '1) mouseout should be false');

        // move mouse again inside circle to trigger mousemove
        stage._mousemove({
            clientX: 290,
            clientY: 100 + top
        });

        test(mouseover, '2) mouseover should be true');
        test(mousemove, '2) mousemove should be true');
        test(!mousedown, '2) mousedown should be false');
        test(!mouseup, '2) mouseup should be false');
        test(!click, '2) click should be false');
        test(!dblclick, '2) dblclick should be false');
        test(!mouseout, '2) mouseout should be false');

        // mousedown inside circle
        stage._mousedown({
            clientX: 290,
            clientY: 100 + top
        });

        test(mouseover, '3) mouseover should be true');
        test(mousemove, '3) mousemove should be true');
        test(mousedown, '3) mousedown should be true');
        test(!mouseup, '3) mouseup should be false');
        test(!click, '3) click should be false');
        test(!dblclick, '3) dblclick should be false');
        test(!mouseout, '3) mouseout should be false');

        // mouseup inside circle
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 290,
            clientY: 100 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});

        test(mouseover, '4) mouseover should be true');
        test(mousemove, '4) mousemove should be true');
        test(mousedown, '4) mousedown should be true');
        test(mouseup, '4) mouseup should be true');
        test(click, '4) click should be true');
        test(!dblclick, '4) dblclick should be false');
        test(!mouseout, '4) mouseout should be false');

        // mousedown inside circle
        stage._mousedown({
            clientX: 290,
            clientY: 100 + top
        });

        test(mouseover, '5) mouseover should be true');
        test(mousemove, '5) mousemove should be true');
        test(mousedown, '5) mousedown should be true');
        test(mouseup, '5) mouseup should be true');
        test(click, '5) click should be true');
        test(!dblclick, '5) dblclick should be false');
        test(!mouseout, '5) mouseout should be false');

        // mouseup inside circle to trigger double click
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 290,
            clientY: 100 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});

        test(mouseover, '6) mouseover should be true');
        test(mousemove, '6) mousemove should be true');
        test(mousedown, '6) mousedown should be true');
        test(mouseup, '6) mouseup should be true');
        test(click, '6) click should be true');
        test(dblclick, '6) dblclick should be true');
        test(!mouseout, '6) mouseout should be false');

        // move mouse outside of circle to trigger mouseout
        stage._mousemove({
            clientX: 0,
            clientY: 100 + top
        });
        stage._mousemove({
            clientX: 0,
            clientY: 100 + top
        });

        test(mouseover, '7) mouseover should be true');
        test(mousemove, '7) mousemove should be true');
        test(mousedown, '7) mousedown should be true');
        test(mouseup, '7) mouseup should be true');
        test(click, '7) click should be true');
        test(dblclick, '7) dblclick should be true');
        test(mouseout, '7) mouseout should be true');

        /*
        * mobile tests
        */
        // reset inDoubleClickWindow
        stage.inDoubleClickWindow = false;

        // touchstart circle
        stage._touchstart({
            clientX: 289,
            clientY: 100 + top,
            preventDefault: function() {
            }
        });

        test(touchstart, '8) touchstart should be true');
        test(!touchmove, '8) touchmove should be false');
        test(!touchend, '8) touchend should be false');
        test(!tap, '8) tap should be false');
        test(!dbltap, '8) dbltap should be false');

        // touchend circle
        stage._touchend({
            clientX: 289,
            clientY: 100 + top,
            preventDefault: function() {
            }
        });
        // end drag is tied to document mouseup and touchend event
        // which can't be simulated.  call _endDrag manually
        //Kinetic.DD._endDrag();

        test(touchstart, '9) touchstart should be true');
        test(!touchmove, '9) touchmove should be false');
        test(touchend, '9) touchend should be true');
        test(tap, '9) tap should be true');
        test(!dbltap, '9) dbltap should be false');

        // touchstart circle
        stage._touchstart({
            clientX: 289,
            clientY: 100 + top,
            preventDefault: function() {
            }
        });

        test(touchstart, '10) touchstart should be true');
        test(!touchmove, '10) touchmove should be false');
        test(touchend, '10) touchend should be true');
        test(tap, '10) tap should be true');
        test(!dbltap, '10) dbltap should be false');

        // touchend circle to triger dbltap
        stage._touchend({
            clientX: 289,
            clientY: 100 + top,
            preventDefault: function() {
            }
        });
        // end drag is tied to document mouseup and touchend event
        // which can't be simulated.  call _endDrag manually
        //Kinetic.DD._endDrag();

        test(touchstart, '11) touchstart should be true');
        test(!touchmove, '11) touchmove should be false');
        test(touchend, '11) touchend should be true');
        test(tap, '11) tap should be true');
        test(dbltap, '11) dbltap should be true');

        // touchmove circle
        stage._touchmove({
            clientX: 290,
            clientY: 100 + top,
            preventDefault: function() {
            }
        });

        test(touchstart, '12) touchstart should be true');
        test(touchmove, '12) touchmove should be true');
        test(touchend, '12) touchend should be true');
        test(tap, '12) tap should be true');
        test(dbltap, '12) dbltap should be true');
    },
    'test group mousedown events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var redCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'red'
        });

        var greenCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            name: 'green'
        });

        group.add(redCircle);
        group.add(greenCircle);

        layer.add(group);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        var groupMousedowns = 0;
        var greenCircleMousedowns = 0;

        group.on('mousedown', function() {
            groupMousedowns++;
        });

        greenCircle.on('mousedown', function() {
            greenCircleMousedowns++;
        });

        stage._mousedown({
            clientX: 285,
            clientY: 100 + top
        });

        test(groupMousedowns === 1, 'groupMousedowns should be 1');
        test(greenCircleMousedowns === 1, 'greenCircleMousedowns should be 1');

        stage._mousedown({
            clientX: 332,
            clientY: 139 + top
        });

        test(groupMousedowns === 2, 'groupMousedowns should be 2');
        test(greenCircleMousedowns === 1, 'greenCircleMousedowns should be 1');

        stage._mousedown({
            clientX: 285,
            clientY: 92 + top
        });

        test(groupMousedowns === 3, 'groupMousedowns should be 3');
        test(greenCircleMousedowns === 2, 'greenCircleMousedowns should be 2');

        stage._mousedown({
            clientX: 221,
            clientY: 146 + top
        });

        //test(groupMousedowns === 4, 'groupMousedowns should be 4');
        test(greenCircleMousedowns === 2, 'greenCircleMousedowns should be 2');
    },
    'group mouseenter events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 9999
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group({
            name: 'group'
        });

        var redMouseenters = 0;
        var redMouseleaves = 0;
        var greenMouseenters = 0;
        var greenMouseleaves = 0;
        var groupMouseenters = 0;
        var groupMouseleaves = 0;

        var redCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'red'
        });

        var greenCircle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            name: 'green'
        });

        group.on('mouseenter', function() {
            groupMouseenters++;
            //console.log('group over')
        });

        group.on('mouseleave', function() {
            groupMouseleaves++;
            //console.log('group out')
        });

        redCircle.on('mouseenter', function() {
            redMouseenters++;
            //console.log('red over')
        });

        redCircle.on('mouseleave', function() {
            redMouseleaves++;
            //console.log('red out')
        });

        greenCircle.on('mouseenter', function() {
            greenMouseenters++;
            //console.log('green over')
        });

        greenCircle.on('mouseleave', function() {
            greenMouseleaves++;
            //console.log('green out')
        });

        group.add(redCircle);
        group.add(greenCircle);

        layer.add(group);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        // move mouse outside of circles
        stage._mousemove({
            clientX: 177,
            clientY: 146 + top
        });

        test(redMouseenters === 0, 'redMouseenters should be 0');
        test(redMouseleaves === 0, 'redMouseleaves should be 0');
        test(greenMouseenters === 0, 'greenMouseenters should be 0');
        test(greenMouseleaves === 0, 'greenMouseleaves should be 0');
        test(groupMouseenters === 0, 'groupMouseenters should be 0');
        test(groupMouseleaves === 0, 'groupMouseleaves should be 0');

        // move mouse inside of red circle
        stage._mousemove({
            clientX: 236,
            clientY: 145 + top
        });

        //console.log('groupMouseenters=' + groupMouseenters);

        test(redMouseenters === 1, 'redMouseenters should be 1');
        test(redMouseleaves === 0, 'redMouseleaves should be 0');
        test(greenMouseenters === 0, 'greenMouseenters should be 0');
        test(greenMouseleaves === 0, 'greenMouseleaves should be 0');
        test(groupMouseenters === 1, 'groupMouseenters should be 1');
        test(groupMouseleaves === 0, 'groupMouseleaves should be 0');

        // move mouse inside of green circle
        stage._mousemove({
            clientX: 284,
            clientY: 118 + top
        });

        test(redMouseenters === 1, 'redMouseenters should be 1');
        test(redMouseleaves === 1, 'redMouseleaves should be 1');
        test(greenMouseenters === 1, 'greenMouseenters should be 1');
        test(greenMouseleaves === 0, 'greenMouseleaves should be 0');
        test(groupMouseenters === 1, 'groupMouseenters should be 1');
        test(groupMouseleaves === 0, 'groupMouseleaves should be 0');

        // move mouse back to red circle

        stage._mousemove({
            clientX: 345,
            clientY: 105 + top
        });
        stage._mousemove({
            clientX: 345,
            clientY: 105 + top
        });

        test(redMouseenters === 2, 'redMouseenters should be 2');
        test(redMouseleaves === 1, 'redMouseleaves should be 1');
        test(greenMouseenters === 1, 'greenMouseenters should be 1');
        test(greenMouseleaves === 1, 'greenMouseleaves should be 1');
        test(groupMouseenters === 1, 'groupMouseenters should be 1');
        test(groupMouseleaves === 0, 'groupMouseleaves should be 0');

        // move mouse outside of circles
        stage._mousemove({
            clientX: 177,
            clientY: 146 + top
        });
        stage._mousemove({
            clientX: 177,
            clientY: 146 + top
        });
        test(redMouseenters === 2, 'redMouseenters should be 2');
        test(redMouseleaves === 2, 'redMouseleaves should be 2');
        test(greenMouseenters === 1, 'greenMouseenters should be 1');
        test(greenMouseleaves === 1, 'greenMouseleaves should be 1');
        test(groupMouseenters === 1, 'groupMouseenters should be 1');
        test(groupMouseleaves === 1, 'groupMouseleaves should be 1');

        //document.body.appendChild(layer.bufferCanvas.element)

        //layer.bufferCanvas.element.style.marginTop = '220px';

    },
    'test event bubbling': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
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

        var group1 = new Kinetic.Group();
        var group2 = new Kinetic.Group();

        /*
         *   stage
         *     |
         *   layer
         *     |
         *  group2
         *     |
         *  group1
         *     |
         *  circle
         */

        group1.add(circle);
        group2.add(group1);
        layer.add(group2);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        // events array
        var e = [];

        circle.on('click', function() {
            e.push('circle');
        });
        group1.on('click', function() {
            e.push('group1');
        });
        group2.on('click', function() {
            e.push('group2');
        });
        layer.on('click', function() {
            e.push('layer');
        });
        stage.on('click', function() {
            e.push('stage');
        });
        // click on circle
        stage._mousedown({
            clientX: 374,
            clientY: 114 + top
        });
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 374,
            clientY: 114 + top
        });
        Kinetic.DD._endDragAfter({dragEndNode:circle});

        test(e.toString() === 'circle,group1,group2,layer,stage', 'problem with event bubbling');
    }
};

Test.Modules['HIT FUNCS'] = {
    'test custom circle hit function': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            drawHitFunc: function(canvas) {
                var context = canvas.getContext()
                context.beginPath();
                context.arc(0, 0, this.getRadius() + 100, 0, Math.PI * 2, true);
                context.closePath();
                canvas.fill(this);
                canvas.stroke(this);
            }
        });

        circle.setDraggable(true);

        layer.add(circle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        var mouseovers = 0;
        var mouseouts = 0;

        circle.on('mouseover', function() {
            mouseovers++;
        });

        circle.on('mouseout', function() {
            mouseouts++;
        });
        // move mouse far outside circle
        stage._mousemove({
            clientX: 113,
            clientY: 112 + top
        });

        test(mouseovers === 0, '1) mouseovers should be 0');
        test(mouseouts === 0, '1) mouseouts should be 0');

        stage._mousemove({
            clientX: 286,
            clientY: 118 + top
        });

        test(mouseovers === 1, '2) mouseovers should be 1');
        test(mouseouts === 0, '2)mouseouts should be 0');

        stage._mousemove({
            clientX: 113,
            clientY: 112 + top
        });

        test(mouseovers === 1, '3) mouseovers should be 1');
        test(mouseouts === 1, '3) mouseouts should be 1');

        showHit(layer);
        
        
        // set drawBufferFunc with setter

        circle.setDrawHitFunc(function(canvas) {
            var context = canvas.getContext();
            context.beginPath();
            context.arc(0, 0, this.getRadius() - 50, 0, Math.PI * 2, true);
            context.closePath();
            canvas.fill(this);
            canvas.stroke(this);
        });

        layer.getHitCanvas().clear();
        layer.drawHit();
        
  
        // move mouse far outside circle
        stage._mousemove({
            clientX: 113,
            clientY: 112 + top
        });

        test(mouseovers === 1, '4) mouseovers should be 1');
        test(mouseouts === 1, '4) mouseouts should be 1');

        stage._mousemove({
            clientX: 286,
            clientY: 118 + top
        });

        test(mouseovers === 1, '5) mouseovers should be 1');
        test(mouseouts === 1, '5) mouseouts should be 1');

        stage._mousemove({
            clientX: 321,
            clientY: 112 + top
        });

        test(mouseovers === 1, '6) mouseovers should be 1');
        test(mouseouts === 1, '6) mouseouts should be 1');

        // move to center of circle
        stage._mousemove({
            clientX: 375,
            clientY: 112 + top
        });

        test(mouseovers === 2, '7) mouseovers should be 2');
        test(mouseouts === 1, '7) mouseouts should be 1');

    }
};
