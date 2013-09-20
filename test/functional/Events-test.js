suite('Events', function() {
  test('stage content mouse events', function() {
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
  });

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
        clientX: 100,
        clientY: 100 + top
    });

    stage._touchend({
        clientX: 100,
        clientY: 100 + top
    });

    assert.equal(circleTouchstart, 1, 1);
    assert.equal(circleTouchend, 1, 2);
    assert.equal(stageContentTouchstart, 1, 3);
    assert.equal(stageContentTouchend, 1, 4);
    assert.equal(stageContentDbltap, 1, 5);

    stage._touchstart({
        clientX: 1,
        clientY: 1 + top
    });
    stage._touchend({
        clientX: 1,
        clientY: 1 + top
    });

    assert.equal(stageContentTouchstart, 2, 6);
    assert.equal(stageContentTouchend, 2, 6);

    // trigger double tap
    stage._touchstart({
        clientX: 1,
        clientY: 1 + top
    });
    stage._touchend({
        clientX: 1,
        clientY: 1 + top
    });

    assert.equal(stageContentTouchstart, 3, 8);
    assert.equal(stageContentTouchend, 3, 9);
  });
});