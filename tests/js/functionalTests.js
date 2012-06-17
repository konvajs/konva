Test.prototype.tests = {
    'DRAG AND DROP - test dragstart, dragmove, dragend': function(containerId) {
        var urls = dataUrls['DRAG AND DROP - test dragstart, dragmove, dragend'];

        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        Ellipse.draggable(true);

        layer.add(Ellipse);
        stage.add(layer);

        var dragStart = false;
        var dragMove = false;
        var dragEnd = false;

        Ellipse.on('dragstart', function() {
            dragStart = true;
        });

        Ellipse.on('dragstart', function() {
            dragStart = true;
        });

        Ellipse.on('dragmove', function() {
            dragMove = true;
        });

        Ellipse.on('dragend', function() {
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
    'EVENTS - modify fill stroke and stroke width on hover with Ellipse': function(containerId) {
        var urls = dataUrls['EVENTS - modify fill stroke and stroke width on hover with Ellipse'];
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var Ellipse = new Kinetic.Ellipse({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black'
        });

        Ellipse.on('mouseover', function() {
            this.setFill('yellow');
            this.setStroke('purple');
            this.setStrokeWidth(20);
            layer.draw();
        });

        Ellipse.on('mouseout', function() {
            this.setFill('red');
            this.setStroke('black');
            this.setStrokeWidth(4);
            layer.draw();
        });

        layer.add(Ellipse);
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
    }
};
