suite('TouchEvents', function() {

    // ======================================================
    test('stage content touch events', function() {
    var stage = addStage();
    var layer = new Kinetic.Layer();
    var circle = new Kinetic.Circle({
        x: 100,
        y: 100,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle'
    });

    layer.add(circle);
    stage.add(layer);

    var circleTouchstart =
        circleTouchend =
        stageContentTouchstart =
        stageContentTouchend =
        stageContentTouchmove =
        stageContentTap =
        stageContentDbltap =
        0;

    var top = stage.content.getBoundingClientRect().top;


    circle.on('touchstart', function() {
      circleTouchstart++;
    });

    circle.on('touchend', function() {
      circleTouchend++;
    });

    stage.on('contentTouchstart', function() {
      stageContentTouchstart++;
    });

    stage.on('contentTouchend', function() {
      stageContentTouchend++;
    });

    stage.on('contentTouchmove', function() {
      stageContentTouchmove++;
    });

    stage.on('contentTap', function() {
      stageContentTap++;
    });

    stage.on('contentDbltap', function() {
      stageContentDbltap++;
    });

    stage._touchstart({
        touches: [{
            clientX: 100,
            clientY: 100 + top
        }]
    });

    stage._touchend({
        touches: []
    });

    assert.equal(circleTouchstart, 1, 1);
    assert.equal(circleTouchend, 1, 2);
    assert.equal(stageContentTouchstart, 1, 3);
    assert.equal(stageContentTouchend, 1, 4);
    assert.equal(stageContentDbltap, 0, 5);

    stage._touchstart({
        touches: [{
            clientX: 1,
            clientY: 1 + top
        }]
    });
    stage._touchend({
        touches: []
    });

    assert.equal(stageContentTouchstart, 2, 6);
    assert.equal(stageContentTouchend, 2, 7);
    assert.equal(stageContentDbltap, 1, 8);

  });


    // ======================================================
    test('touchstart touchend touchmove tap dbltap', function(done) {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4
        });


        // mobile events
        var touchstart = false;
        var touchend = false;
        var tap = false;
        var touchmove = false;
        var dbltap = false;


        /*
         * mobile
         */
        circle.on('touchstart', function() {
            touchstart = true;
            //log('touchstart');
            //alert('touchstart')
        });

        circle.on('touchend', function() {
            touchend = true;
            //alert('touchend')
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

        // reset inDoubleClickWindow
        Kinetic.inDblClickWindow = false;

        // touchstart circle
        stage._touchstart({
            touches: [{
                clientX: 289,
                clientY: 100 + top,
            }],
            preventDefault: function() {
            }
        });

        assert(touchstart, '8) touchstart should be true');
        assert(!touchmove, '8) touchmove should be false');
        assert(!touchend, '8) touchend should be false');
        assert(!tap, '8) tap should be false');
        assert(!dbltap, '8) dbltap should be false');

        // touchend circle
        stage._touchend({
            touches: [],
            preventDefault: function() {
            }
        });
        // end drag is tied to document mouseup and touchend event
        // which can't be simulated.  call _endDrag manually
        //Kinetic.DD._endDrag();

        assert(touchstart, '9) touchstart should be true');
        assert(!touchmove, '9) touchmove should be false');
        assert(touchend, '9) touchend should be true');
        assert(tap, '9) tap should be true');
        assert(!dbltap, '9) dbltap should be false');

        // touchstart circle
        stage._touchstart({
            touches: [{
                clientX: 289,
                clientY: 100 + top,
            }],
            preventDefault: function() {
            }
        });

        assert(touchstart, '10) touchstart should be true');
        assert(!touchmove, '10) touchmove should be false');
        assert(touchend, '10) touchend should be true');
        assert(tap, '10) tap should be true');
        assert(!dbltap, '10) dbltap should be false');

        // touchend circle to triger dbltap
        stage._touchend({
            touches: [],
            preventDefault: function() {
            }
        });
        // end drag is tied to document mouseup and touchend event
        // which can't be simulated.  call _endDrag manually
        //Kinetic.DD._endDrag();

        assert(touchstart, '11) touchstart should be true');
        assert(!touchmove, '11) touchmove should be false');
        assert(touchend, '11) touchend should be true');
        assert(tap, '11) tap should be true');
        assert(dbltap, '11) dbltap should be true');

        setTimeout(function() {
            // touchmove circle
            stage._touchmove({
                touches: [{
                    clientX: 290,
                    clientY: 100 + top,
                }],
                preventDefault: function() {
                }
            });

            assert(touchstart, '12) touchstart should be true');
            assert(touchmove, '12) touchmove should be true');
            assert(touchend, '12) touchend should be true');
            assert(tap, '12) tap should be true');
            assert(dbltap, '12) dbltap should be true');

            done();
        }, 17);
    });
});