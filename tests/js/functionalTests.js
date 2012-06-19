Test.prototype.tests = {
    'DRAG AND DROP - test dragstart, dragmove, dragend': function(containerId) {
        var urls = dataUrls['DRAG AND DROP - test dragstart, dragmove, dragend'];

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
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

        circle.draggable(true);

        layer.add(circle);
        stage.add(layer);

        var dragStart = false;
        var dragMove = false;
        var dragEnd = false;

        circle.on('dragstart', function() {
            dragStart = true;
        });

        circle.on('dragstart', function() {
            dragStart = true;
        });

        circle.on('dragmove', function() {
            dragMove = true;
        });

        circle.on('dragend', function() {
            dragEnd = true;
        });

        stage.toDataURL(function(startDataUrl) {
            test(urls[0] === startDataUrl, 'start data url is incorrect', true);
            /*
             * simulate drag and drop
             */
            stage._mousedown({
                clientX: 380,
                clientY: 98
            });

            test(!dragStart, 'dragstart event should not have been triggered');
            test(!dragMove, 'dragmove event should not have been triggered');
            test(!dragEnd, 'dragend event should not have been triggered');

            setTimeout(function() {
                stage._mousemove({
                    clientX: 100,
                    clientY: 98
                });

                test(dragStart, 'dragstart event was not triggered');
                test(dragMove, 'dragmove event was not triggered');
                test(!dragEnd, 'dragend event should not have been triggered');
            }, 50);
            setTimeout(function() {
                stage._mouseup({
                    clientX: 100,
                    clientY: 98
                });

                test(dragStart, 'dragstart event was not triggered');
                test(dragMove, 'dragmove event was not triggered');
                test(dragEnd, 'dragend event was not triggered');

                stage.toDataURL(function(endDataUrl) {
                    //test(urls[1] === endDataUrl, 'end data url is incorrect');
                });
            }, 100);
        });
    },
    'EVENTS - modify fill stroke and stroke width on hover with circle': function(containerId) {
        var urls = dataUrls['EVENTS - modify fill stroke and stroke width on hover with circle'];
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
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

        circle.on('mouseover', function() {
            this.setFill('yellow');
            this.setStroke('purple');
            this.setStrokeWidth(20);
            layer.draw();
        });

        circle.on('mouseout', function() {
            this.setFill('red');
            this.setStroke('black');
            this.setStrokeWidth(4);
            layer.draw();
        });

        layer.add(circle);
        stage.add(layer);

        stage.toDataURL(function(startDataUrl) {
            //test(startDataUrl === urls[0], 'start data url is incorrect');

            stage._mousemove({
                clientX: 377,
                clientY: 101
            });

            stage.toDataURL(function(endDataUrl) {
                //test(urls[1] === endDataUrl, 'end data url is incorrect');
            });
        });
    },
    'EVENTS - mousedown mouseup mouseover mouseout mousemove click dblclick / touchstart touchend touchmove tap dbltap': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200,
            throttle: 9999
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
            //log('mousedown');
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
        test(!mousemove, '1) mousemove should be false');
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
        stage._mouseout({
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
    }
};
