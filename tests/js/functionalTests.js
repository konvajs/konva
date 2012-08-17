Test.prototype.tests = {
    'DRAG AND DROP - test dragstart, dragmove, dragend': function(containerId) {
        var urls = dataUrls['DRAG AND DROP - test dragstart, dragmove, dragend'];

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Ellipse({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        circle.setDraggable(true);

        layer.add(circle);
        stage.add(layer);

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
        startDataUrl = layer.toDataURL();
        warn(urls[0] === startDataUrl, 'start data url is incorrect');
        /*
         * simulate drag and drop
         */
        console.log(1)
        stage._mousedown({
            clientX: 380,
            clientY: 98
        });
		console.log(2)
        test(!dragStart, 'dragstart event should not have been triggered');
        test(!dragMove, 'dragmove event should not have been triggered');
        test(!dragEnd, 'dragend event should not have been triggered');

        stage._mousemove({
            clientX: 100,
            clientY: 98
        });

        test(dragStart, 'dragstart event was not triggered');
        test(dragMove, 'dragmove event was not triggered');
        test(!dragEnd, 'dragend event should not have been triggered');

        stage._mouseup({
            clientX: 100,
            clientY: 98
        });

        test(dragStart, 'dragstart event was not triggered');
        test(dragMove, 'dragmove event was not triggered');
        test(dragEnd, 'dragend event was not triggered');

        var endDataUrl = layer.toDataURL();
        warn(urls[1] === endDataUrl, 'end data url is incorrect');
    },
    'DRAG AND DROP - cancel drag and drop by setting draggable to false': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Ellipse({
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

        /*
         * simulate drag and drop
         */
        stage._mousedown({
            clientX: 380,
            clientY: 100
        });

        stage._mousemove({
            clientX: 100,
            clientY: 100
        });

        stage._mouseup({
            clientX: 100,
            clientY: 100
        });

        test(circle.getPosition().x === 380, 'circle x should be 380');
        test(circle.getPosition().y === 100, 'circle y should be 100');
    },
    'DRAG AND DROP - drag and drop layer': function(containerId) {
        var urls = dataUrls['DRAG AND DROP - drag and drop layer'];
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

        var circle1 = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red'
        });

        var circle2 = new Kinetic.Ellipse({
            x: 400,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green'
        });

        layer.add(circle1);
        layer.add(circle2);

        stage.add(layer);

        var startDataUrl = layer.toDataURL();
        warn(urls[0] === startDataUrl, 'start data url is incorrect');

        /*
         * simulate drag and drop
         */
        stage._mousedown({
            clientX: 399,
            clientY: 96
        });

        stage._mousemove({
            clientX: 210,
            clientY: 109
        });

        stage._mouseup({
            clientX: 210,
            clientY: 109
        });

        var endDataUrl = layer.toDataURL()
        warn(urls[1] === endDataUrl, 'end data url is incorrect');

    },
    'EVENTS - modify fill stroke and stroke width on hover with circle': function(containerId) {
        var urls = dataUrls['EVENTS - modify fill stroke and stroke width on hover with circle'];
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer({
            throttle: 999
        });
        var circle = new Kinetic.Ellipse({
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

        warn(layer.toDataURL() === urls[0], 'start data url is incorrect');

        stage._mousemove({
            clientX: 377,
            clientY: 101
        });

        warn(layer.toDataURL() === urls[1], 'mid data url is incorrect');
        
        // move mouse back out of circle
        stage._mousemove({
            clientX: 157,
            clientY: 138
        });
        stage._mousemove({
            clientX: 157,
            clientY: 138
        });
        
        warn(layer.toDataURL() === urls[0], 'end data url is incorrect');
    },
    'EVENTS - mousedown mouseup mouseover mouseout mousemove click dblclick / touchstart touchend touchmove tap dbltap': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Ellipse({
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

        // move mouse to center of circle to trigger mouseover
        stage._mousemove({
            clientX: 290,
            clientY: 100
        });

        test(mouseover, '1) mouseover should be true');
        test(mousemove, '1) mousemove should be true');
        test(!mousedown, '1) mousedown should be false');
        test(!mouseup, '1) mouseup should be false');
        test(!click, '1) click should be false');
        test(!dblclick, '1) dblclick should be false');
        test(!mouseout, '1) mouseout should be false');

        // move mouse again inside circle to trigger mousemove
        stage._mousemove({
            clientX: 290,
            clientY: 100
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
            clientY: 100
        });

        test(mouseover, '3) mouseover should be true');
        test(mousemove, '3) mousemove should be true');
        test(mousedown, '3) mousedown should be true');
        test(!mouseup, '3) mouseup should be false');
        test(!click, '3) click should be false');
        test(!dblclick, '3) dblclick should be false');
        test(!mouseout, '3) mouseout should be false');

        // mouseup inside circle
        stage._mouseup({
            clientX: 290,
            clientY: 100
        });

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
            clientY: 100
        });

        test(mouseover, '5) mouseover should be true');
        test(mousemove, '5) mousemove should be true');
        test(mousedown, '5) mousedown should be true');
        test(mouseup, '5) mouseup should be true');
        test(click, '5) click should be true');
        test(!dblclick, '5) dblclick should be false');
        test(!mouseout, '5) mouseout should be false');

        // mouseup inside circle to trigger double click
        stage._mouseup({
            clientX: 290,
            clientY: 100
        });

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
            clientY: 100
        });
        stage._mousemove({
            clientX: 0,
            clientY: 100
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
            clientY: 100,
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
            clientY: 100,
            preventDefault: function() {
            }
        });

        test(touchstart, '9) touchstart should be true');
        test(!touchmove, '9) touchmove should be false');
        test(touchend, '9) touchend should be true');
        test(tap, '9) tap should be true');
        test(!dbltap, '9) dbltap should be false');

        // touchstart circle
        stage._touchstart({
            clientX: 289,
            clientY: 100,
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
            clientY: 100,
            preventDefault: function() {
            }
        });

        test(touchstart, '11) touchstart should be true');
        test(!touchmove, '11) touchmove should be false');
        test(touchend, '11) touchend should be true');
        test(tap, '11) tap should be true');
        test(dbltap, '11) dbltap should be true');

        // touchmove circle
        stage._touchmove({
            clientX: 290,
            clientY: 100,
            preventDefault: function() {
            }
        });

        test(touchstart, '12) touchstart should be true');
        test(touchmove, '12) touchmove should be true');
        test(touchend, '12) touchend should be true');
        test(tap, '12) tap should be true');
        test(dbltap, '12) dbltap should be true');
    },
    'EVENTS - test group mousedown events': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        var redCircle = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'red'
        });

        var greenCircle = new Kinetic.Ellipse({
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
            clientY: 100
        });

        test(groupMousedowns === 1, 'groupMousedowns should be 1');
        test(greenCircleMousedowns === 1, 'greenCircleMousedowns should be 1');

        stage._mousedown({
            clientX: 332,
            clientY: 139
        });

        test(groupMousedowns === 2, 'groupMousedowns should be 2');
        test(greenCircleMousedowns === 1, 'greenCircleMousedowns should be 1');

        stage._mousedown({
            clientX: 285,
            clientY: 92
        });

        test(groupMousedowns === 3, 'groupMousedowns should be 3');
        test(greenCircleMousedowns === 2, 'greenCircleMousedowns should be 2');

        stage._mousedown({
            clientX: 221,
            clientY: 146
        });

        test(groupMousedowns === 4, 'groupMousedowns should be 4');
        test(greenCircleMousedowns === 2, 'greenCircleMousedowns should be 2');
    },
    'EVENTS - group mouseover events': function(containerId) {
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

        var redMouseovers = 0;
        var redMouseouts = 0;
        var greenMouseovers = 0;
        var greenMouseouts = 0;
        var groupMouseovers = 0;
        var groupMouseouts = 0;

        var redEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 80,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            name: 'red'
        });

        var greenEllipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 40,
            strokeWidth: 4,
            fill: 'green',
            stroke: 'black',
            name: 'green'
        });

        group.on('mouseover', function() {
            groupMouseovers++;
            console.log('group over')
        });

        group.on('mouseout', function() {
            groupMouseouts++;
            console.log('group out')
        });

        redEllipse.on('mouseover', function() {
            redMouseovers++;
            console.log('red over')
        });

        redEllipse.on('mouseout', function() {
            redMouseouts++;
            console.log('red out')
        });

        greenEllipse.on('mouseover', function() {
            greenMouseovers++;
            console.log('green over')
        });

        greenEllipse.on('mouseout', function() {
            greenMouseouts++;
            console.log('green out')
        });

        group.add(redEllipse);
        group.add(greenEllipse);

        layer.add(group);
        stage.add(layer);

        // move mouse outside of circles
        stage._mousemove({
            clientX: 177,
            clientY: 146
        });

        test(redMouseovers === 0, 'redMouseovers should be 0');
        test(redMouseouts === 0, 'redMouseouts should be 0');
        test(greenMouseovers === 0, 'greenMouseovers should be 0');
        test(greenMouseouts === 0, 'greenMouseouts should be 0');
        test(groupMouseovers === 0, 'groupMouseovers should be 0');
        test(groupMouseouts === 0, 'groupMouseouts should be 0');

        // move mouse inside of red circle
        stage._mousemove({
            clientX: 236,
            clientY: 145
        });

        test(redMouseovers === 1, 'redMouseovers should be 1');
        test(redMouseouts === 0, 'redMouseouts should be 0');
        test(greenMouseovers === 0, 'greenMouseovers should be 0');
        test(greenMouseouts === 0, 'greenMouseouts should be 0');
        test(groupMouseovers === 1, 'groupMouseovers should be 1');
        test(groupMouseouts === 0, 'groupMouseouts should be 0');

        // move mouse inside of green circle
        stage._mousemove({
            clientX: 284,
            clientY: 118
        });

        test(redMouseovers === 1, 'redMouseovers should be 1');
        test(redMouseouts === 1, 'redMouseouts should be 1');
        test(greenMouseovers === 1, 'greenMouseovers should be 1');
        test(greenMouseouts === 0, 'greenMouseouts should be 0');
        test(groupMouseovers === 1, 'groupMouseovers should be 1');
        test(groupMouseouts === 0, 'groupMouseouts should be 0');

        // move mouse back to red circle

        stage._mousemove({
            clientX: 345,
            clientY: 105
        });
        stage._mousemove({
            clientX: 345,
            clientY: 105
        });

        test(redMouseovers === 2, 'redMouseovers should be 2');
        test(redMouseouts === 1, 'redMouseouts should be 1');
        test(greenMouseovers === 1, 'greenMouseovers should be 1');
        test(greenMouseouts === 1, 'greenMouseouts should be 1');
        test(groupMouseovers === 1, 'groupMouseovers should be 1');
        test(groupMouseouts === 0, 'groupMouseouts should be 0');

        // move mouse outside of circles
        stage._mousemove({
            clientX: 177,
            clientY: 146
        });
        stage._mousemove({
            clientX: 177,
            clientY: 146
        });
        test(redMouseovers === 2, 'redMouseovers should be 2');
        test(redMouseouts === 2, 'redMouseouts should be 2');
        test(greenMouseovers === 1, 'greenMouseovers should be 1');
        test(greenMouseouts === 1, 'greenMouseouts should be 1');
        test(groupMouseovers === 1, 'groupMouseovers should be 1');
        test(groupMouseouts === 1, 'groupMouseouts should be 1');
    
    },
    'EVENTS - test event bubbling': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 999
        });
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Ellipse({
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
            clientY: 114
        });
        stage._mouseup({
            clientX: 374,
            clientY: 114
        });

        test(e.toString() === 'circle,group1,group2,layer,stage', 'problem with event bubbling');
    }
};
