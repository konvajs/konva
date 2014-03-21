suite('MouseEvents', function() {

    // NOTE: disable throttling so these tests can run synchronously
    Kinetic.enableThrottling = false;
    
    // ======================================================
    test('stage content mouse events', function(done) {

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

    var circleMousedown =
        circleMouseup =
        stageContentMousedown =
        stageContentMouseup =
        stageContentMousemove =
        stageContentMouseout =
        stageContentMouseover =
        stageContentClick =
        stageContentDblClick =
        0;

    var top = stage.content.getBoundingClientRect().top;


    circle.on('mousedown', function() {
      circleMousedown++;
    });

    circle.on('mouseup', function() {
      circleMouseup++;
    });

    stage.on('contentMousedown', function() {
      stageContentMousedown++;
    });

    stage.on('contentMouseup', function() {
      stageContentMouseup++;
    });

    stage.on('contentMousemove', function() {
      stageContentMousemove++;
    });

    stage.on('contentMouseout', function() {
      stageContentMouseout++;
    });

    stage.on('contentMouseover', function() {
      stageContentMouseover++;
    });

    stage.on('contentClick', function() {
      //console.log('click');
      stageContentClick++;
    });

    stage.on('contentDblclick', function() {
      //console.log('dbl click');
      stageContentDblClick++;
    });

    stage._mousedown({
        clientX: 100,
        clientY: 100 + top
    });

    stage._mouseup({
        clientX: 100,
        clientY: 100 + top
    });

    assert.equal(circleMousedown, 1);
    assert.equal(circleMouseup, 1);
    assert.equal(stageContentMousedown, 1);
    assert.equal(stageContentMouseup, 1);
    assert.equal(stageContentClick, 1);

    stage._mousedown({
        clientX: 1,
        clientY: 1 + top
    });
    stage._mouseup({
        clientX: 1,
        clientY: 1 + top
    });

    assert.equal(stageContentMousedown, 2);
    assert.equal(stageContentMouseup, 2);

    // trigger double click
    stage._mousedown({
        clientX: 1,
        clientY: 1 + top
    });
    stage._mouseup({
        clientX: 1,
        clientY: 1 + top
    });

    assert.equal(stageContentMousedown, 3);
    assert.equal(stageContentMouseup, 3);
    //assert.equal(stageContentDblClick, 1);

    setTimeout(function() {
        stage._mousemove({
            clientX: 200,
            clientY: 1 + top
        });

        assert.equal(stageContentMousemove, 1);

        stage._mouseout({
            clientX: 0,
            clientY: 0
        });

        assert.equal(stageContentMouseout, 1);

        stage._mouseover({
            clientX: 0,
            clientY: 0
        });

        assert.equal(stageContentMouseover, 1);

        done();
    }, 20);
  });



    // ======================================================
    test('remove shape with onclick', function() {
        var stage = addStage();

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
    });

    // ======================================================
    test('test listening true/false with clicks', function() {
        var stage = addStage();

        var top = stage.content.getBoundingClientRect().top;

        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle'
        });

        var clickCount = 0;

        circle.on('click', function() {
            clickCount++;
        });

        layer.add(circle);
        stage.add(layer);

        // -----------------------------------
        stage._mousedown({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        assert.equal(clickCount, 1, 'should be 1 click');

        // -----------------------------------
        circle.setListening(false);
        stage._mousedown({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        assert.equal(clickCount, 1, 'should be 1 click even though another click occurred');

        // -----------------------------------
        circle.setListening(true);
        stage._mousedown({
            clientX: 291,
            clientY: 112 + top
        });
        Kinetic.DD._endDragBefore();
        stage._mouseup({
            clientX: 291,
            clientY: 112 + top
        });
        assert.equal(clickCount, 2, 'should be 2 clicks');

    });

    // ======================================================
    test('click mapping', function() {
        var stage = addStage();
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
            //console.log('clicked redCircle');
            redClicks++;
        });

        greenCircle.on('click', function() {
            //console.log('clicked greenCircle');
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

        assert.equal(redClicks, 1, 'red circle should have 1 click');
        assert.equal(greenClicks, 0, 'green circle should have 0 clicks');

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

        assert.equal(redClicks, 1, 'red circle should have 1 click');
        assert.equal(greenClicks, 1, 'green circle should have 1 click');

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

        assert.equal(redClicks, 1, 'red circle should still have 1 click');
        assert.equal(greenClicks, 1, 'green circle should still have 1 click');

    });

    // ======================================================
    test('text events', function() {
        var stage = addStage();
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
            //console.log('text click');
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
        assert.equal(click, true, 'click event should have been fired when mousing down and then up on text');

    });

    // ======================================================
    test('modify fill stroke and stroke width on hover with circle', function(done) {
        var stage = addStage();
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

        assert.equal(circle.getFill(), 'red', 'circle fill should be red');
        assert.equal(circle.getStroke(), 'black', 'circle stroke should be black');

        setTimeout(function() {
            stage._mousemove({
                clientX: 377,
                clientY: 101 + top
            });

            assert.equal(circle.getFill(), 'yellow', 'circle fill should be yellow');
            assert.equal(circle.getStroke(), 'purple', 'circle stroke should be purple');

            setTimeout(function() {
                // move mouse back out of circle
                stage._mousemove({
                    clientX: 157,
                    clientY: 138 + top
                });


                assert.equal(circle.getFill(), 'red', 'circle fill should be red');
                assert.equal(circle.getStroke(), 'black', 'circle stroke should be black');
                done();
            }, 20);
        }, 20);
    });

    // ======================================================
    test('mousedown mouseup mouseover mouseout mousemove click dblclick', function(done) {
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

        // desktop events
        var mousedown = false;
        var mouseup = false;
        var click = false;
        var dblclick = false;
        var mouseover = false;
        var mouseout = false;
        var mousemove = false;

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


        layer.add(circle);
        stage.add(layer);

        var top = stage.content.getBoundingClientRect().top;

        setTimeout(function() {
            // move mouse to center of circle to trigger mouseover
            stage._mousemove({
                clientX: 290,
                clientY: 100 + top
            });

            assert(mouseover, '1) mouseover should be true');
            assert(!mousemove, '1) mousemove should be true');
            assert(!mousedown, '1) mousedown should be false');
            assert(!mouseup, '1) mouseup should be false');
            assert(!click, '1) click should be false');
            assert(!dblclick, '1) dblclick should be false');
            assert(!mouseout, '1) mouseout should be false');

            setTimeout(function() {
                // move mouse again inside circle to trigger mousemove
                stage._mousemove({
                    clientX: 290,
                    clientY: 100 + top
                });

                assert(mouseover, '2) mouseover should be true');
                assert(mousemove, '2) mousemove should be true');
                assert(!mousedown, '2) mousedown should be false');
                assert(!mouseup, '2) mouseup should be false');
                assert(!click, '2) click should be false');
                assert(!dblclick, '2) dblclick should be false');
                assert(!mouseout, '2) mouseout should be false');

                // mousedown inside circle
                stage._mousedown({
                    clientX: 290,
                    clientY: 100 + top
                });

                assert(mouseover, '3) mouseover should be true');
                assert(mousemove, '3) mousemove should be true');
                assert(mousedown, '3) mousedown should be true');
                assert(!mouseup, '3) mouseup should be false');
                assert(!click, '3) click should be false');
                assert(!dblclick, '3) dblclick should be false');
                assert(!mouseout, '3) mouseout should be false');

                // mouseup inside circle
                stage._mouseup({
                    clientX: 290,
                    clientY: 100 + top
                });

                assert(mouseover, '4) mouseover should be true');
                assert(mousemove, '4) mousemove should be true');
                assert(mousedown, '4) mousedown should be true');
                assert(mouseup, '4) mouseup should be true');
                assert(click, '4) click should be true');
                assert(!dblclick, '4) dblclick should be false');
                assert(!mouseout, '4) mouseout should be false');

                // mousedown inside circle
                stage._mousedown({
                    clientX: 290,
                    clientY: 100 + top
                });

                assert(mouseover, '5) mouseover should be true');
                assert(mousemove, '5) mousemove should be true');
                assert(mousedown, '5) mousedown should be true');
                assert(mouseup, '5) mouseup should be true');
                assert(click, '5) click should be true');
                assert(!dblclick, '5) dblclick should be false');
                assert(!mouseout, '5) mouseout should be false');

                // mouseup inside circle to trigger double click
                stage._mouseup({
                    clientX: 290,
                    clientY: 100 + top
                });

                assert(mouseover, '6) mouseover should be true');
                assert(mousemove, '6) mousemove should be true');
                assert(mousedown, '6) mousedown should be true');
                assert(mouseup, '6) mouseup should be true');
                assert(click, '6) click should be true');
                assert(dblclick, '6) dblclick should be true');
                assert(!mouseout, '6) mouseout should be false');

                setTimeout(function() {
                    // move mouse outside of circle to trigger mouseout
                    stage._mousemove({
                        clientX: 0,
                        clientY: 100 + top
                    });

                    assert(mouseover, '7) mouseover should be true');
                    assert(mousemove, '7) mousemove should be true');
                    assert(mousedown, '7) mousedown should be true');
                    assert(mouseup, '7) mouseup should be true');
                    assert(click, '7) click should be true');
                    assert(dblclick, '7) dblclick should be true');
                    assert(mouseout, '7) mouseout should be true');
                    done();
                }, 20);
            }, 20);
        }, 20);
    });

    // ======================================================
    test('test group mousedown events', function() {
        var stage = addStage();
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

        assert.equal(groupMousedowns, 1, 'groupMousedowns should be 1');
        assert.equal(greenCircleMousedowns, 1, 'greenCircleMousedowns should be 1');

        stage._mousedown({
            clientX: 332,
            clientY: 139 + top
        });

        assert.equal(groupMousedowns, 2, 'groupMousedowns should be 2');
        assert.equal(greenCircleMousedowns, 1, 'greenCircleMousedowns should be 1');

        stage._mousedown({
            clientX: 285,
            clientY: 92 + top
        });

        assert.equal(groupMousedowns, 3, 'groupMousedowns should be 3');
        assert.equal(greenCircleMousedowns, 2, 'greenCircleMousedowns should be 2');

        stage._mousedown({
            clientX: 221,
            clientY: 146 + top
        });

        //assert.equal(groupMousedowns, 4, 'groupMousedowns should be 4');
        assert.equal(greenCircleMousedowns, 2, 'greenCircleMousedowns should be 2');
    });

    // ======================================================
    test('group mouseenter events', function(done) {
        var stage = addStage();
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

        setTimeout(function() {
            // move mouse outside of circles
            stage._mousemove({
                clientX: 177,
                clientY: 146 + top
            });

            assert.equal(redMouseenters, 0, 'redMouseenters should be 0');
            assert.equal(redMouseleaves, 0, 'redMouseleaves should be 0');
            assert.equal(greenMouseenters, 0, 'greenMouseenters should be 0');
            assert.equal(greenMouseleaves, 0, 'greenMouseleaves should be 0');
            assert.equal(groupMouseenters, 0, 'groupMouseenters should be 0');
            assert.equal(groupMouseleaves, 0, 'groupMouseleaves should be 0');

            setTimeout(function() {
                // move mouse inside of red circle
                stage._mousemove({
                    clientX: 236,
                    clientY: 145 + top
                });

                //console.log('groupMouseenters=' + groupMouseenters);

                assert.equal(redMouseenters, 1, 'redMouseenters should be 1');
                assert.equal(redMouseleaves, 0, 'redMouseleaves should be 0');
                assert.equal(greenMouseenters, 0, 'greenMouseenters should be 0');
                assert.equal(greenMouseleaves, 0, 'greenMouseleaves should be 0');
                assert.equal(groupMouseenters, 1, 'groupMouseenters should be 1');
                assert.equal(groupMouseleaves, 0, 'groupMouseleaves should be 0');

                setTimeout(function() {
                    // move mouse inside of green circle
                    stage._mousemove({
                        clientX: 284,
                        clientY: 118 + top
                    });

                    assert.equal(redMouseenters, 1, 'redMouseenters should be 1');
                    assert.equal(redMouseleaves, 1, 'redMouseleaves should be 1');
                    assert.equal(greenMouseenters, 1, 'greenMouseenters should be 1');
                    assert.equal(greenMouseleaves, 0, 'greenMouseleaves should be 0');
                    assert.equal(groupMouseenters, 1, 'groupMouseenters should be 1');
                    assert.equal(groupMouseleaves, 0, 'groupMouseleaves should be 0');

                    setTimeout(function() {
                        // move mouse back to red circle

                        stage._mousemove({
                            clientX: 345,
                            clientY: 105 + top
                        });


                        assert.equal(redMouseenters, 2, 'redMouseenters should be 2');
                        assert.equal(redMouseleaves, 1, 'redMouseleaves should be 1');
                        assert.equal(greenMouseenters, 1, 'greenMouseenters should be 1');
                        assert.equal(greenMouseleaves, 1, 'greenMouseleaves should be 1');
                        assert.equal(groupMouseenters, 1, 'groupMouseenters should be 1');
                        assert.equal(groupMouseleaves, 0, 'groupMouseleaves should be 0');

                        setTimeout(function() {
                            // move mouse outside of circles
                            stage._mousemove({
                                clientX: 177,
                                clientY: 146 + top
                            });

                            assert.equal(redMouseenters, 2, 'redMouseenters should be 2');
                            assert.equal(redMouseleaves, 2, 'redMouseleaves should be 2');
                            assert.equal(greenMouseenters, 1, 'greenMouseenters should be 1');
                            assert.equal(greenMouseleaves, 1, 'greenMouseleaves should be 1');
                            assert.equal(groupMouseenters, 1, 'groupMouseenters should be 1');
                            assert.equal(groupMouseleaves, 1, 'groupMouseleaves should be 1');

                            //document.body.appendChild(layer.bufferCanvas.element)

                            //layer.bufferCanvas.element.style.marginTop = '220px';

                            done();
                        }, 20);
                    }, 20);
                }, 20);
            }, 20);
        }, 20);

    });

    // ======================================================
    test('test event bubbling', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            id: 'myCircle'
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
        layer.on('click', function(evt) {
            //console.log(evt)
            assert.equal(evt.target.id(), 'myCircle');
            assert.equal(evt.type, 'click');
            e.push('layer');
        });
        stage.on('click', function(evt) {
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

        assert.equal(e.toString(), 'circle,group1,group2,layer,stage', 'problem with event bubbling');
  
    });

    // ======================================================
    test('test custom circle hit function', function(done) {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var circle = new Kinetic.Circle({
            x: 380,
            y: stage.getHeight() / 2,
            radius: 70,
            strokeWidth: 4,
            fill: 'red',
            stroke: 'black',
            hitFunc: function(context) {
                var _context = context._context;

                _context.beginPath();
                _context.arc(0, 0, this.getRadius() + 100, 0, Math.PI * 2, true);
                _context.closePath();
                context.fillStrokeShape(this);
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

        setTimeout(function() {


            // move mouse far outside circle
            stage._mousemove({
                clientX: 113,
                clientY: 112 + top
            });

            setTimeout(function() {
                assert.equal(mouseovers, 0, '1) mouseovers should be 0');
                assert.equal(mouseouts, 0, '1) mouseouts should be 0');

                stage._mousemove({
                    clientX: 286,
                    clientY: 118 + top
                });

                assert.equal(mouseovers, 1, '2) mouseovers should be 1');
                assert.equal(mouseouts, 0, '2)mouseouts should be 0');

                setTimeout(function() {
                    stage._mousemove({
                        clientX: 113,
                        clientY: 112 + top
                    });

                    assert.equal(mouseovers, 1, '3) mouseovers should be 1');
                    assert.equal(mouseouts, 1, '3) mouseouts should be 1');

                    showHit(layer);


                    // set drawBufferFunc with setter

                    circle.hitFunc(function(context) {
                        var _context = context._context;
                        _context.beginPath();
                        _context.arc(0, 0, this.getRadius() - 50, 0, Math.PI * 2, true);
                        _context.closePath();
                        context.fillStrokeShape(this);

                    });

                    layer.getHitCanvas().getContext().clear();
                    layer.drawHit();

                    setTimeout(function() {

                        // move mouse far outside circle
                        stage._mousemove({
                            clientX: 113,
                            clientY: 112 + top
                        });

                        assert.equal(mouseovers, 1, '4) mouseovers should be 1');
                        assert.equal(mouseouts, 1, '4) mouseouts should be 1');

                        setTimeout(function() {

                            stage._mousemove({
                                clientX: 286,
                                clientY: 118 + top
                            });

                            assert.equal(mouseovers, 1, '5) mouseovers should be 1');
                            assert.equal(mouseouts, 1, '5) mouseouts should be 1');

                            setTimeout(function() {
                                stage._mousemove({
                                    clientX: 321,
                                    clientY: 112 + top
                                });

                                assert.equal(mouseovers, 1, '6) mouseovers should be 1');
                                assert.equal(mouseouts, 1, '6) mouseouts should be 1');

                                setTimeout(function() {
                                    // move to center of circle
                                    stage._mousemove({
                                        clientX: 375,
                                        clientY: 112 + top
                                    });

                                    assert.equal(mouseovers, 2, '7) mouseovers should be 2');
                                    assert.equal(mouseouts, 1, '7) mouseouts should be 1');

                                    done();
                                }, 20);
                            }, 20);
                        }, 20);
                    }, 20);
                }, 20);
            }, 20);
        }, 20);

    });
});