/* eslint-disable max-nested-callbacks */
// TODO: repair it
suite.skip('PointerEvents', function () {
  Konva._pointerEventsEnabled = true;
  // ======================================================
  test('pointerdown pointerup pointermove', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // mobile events
    var pointerdown = false;
    var pointerup = false;
    var pointermove = false;

    /*
     * mobile
     */
    circle.on('pointerdown', function () {
      pointerdown = true;
    });

    circle.on('pointerup', function () {
      pointerup = true;
    });

    circle.on('pointermove', function () {
      pointermove = true;
    });

    layer.add(circle);
    stage.add(layer);

    var top = stage.content.getBoundingClientRect().top;

    // touchstart circle
    stage._pointerdown({
      clientX: 289,
      clientY: 100 + top,
      pointerId: 1,
      preventDefault: function () {},
    });

    assert(pointerdown, '1) pointerdown should be true');
    assert(!pointermove, '1) pointermove should be false');
    assert(!pointerup, '1) pointerup should be false');

    // pointerup circle
    stage._pointerup({
      touches: [],
      preventDefault: function () {},
    });

    assert(pointerdown, '2) pointerdown should be true');
    assert(!pointermove, '2) pointermove should be false');
    assert(pointerup, '2) pointerup should be true');

    // pointerdown circle
    stage._pointerdown({
      touches: [
        {
          clientX: 289,
          clientY: 100 + top,
        },
      ],
      preventDefault: function () {},
    });

    assert(pointerdown, '3) pointerdown should be true');
    assert(!pointermove, '3) pointermove should be false');
    assert(pointerup, '3) pointerup should be true');

    // pointerup circle to triger dbltap
    stage._pointerup({
      touches: [],
      preventDefault: function () {},
    });
    // end drag is tied to document mouseup and pointerup event
    // which can't be simulated.  call _endDrag manually
    //Konva.DD._endDrag();

    assert(pointerdown, '4) pointerdown should be true');
    assert(!pointermove, '4) pointermove should be false');
    assert(pointerup, '4) pointerup should be true');

    setTimeout(function () {
      // pointermove circle
      stage._pointermove({
        touches: [
          {
            clientX: 290,
            clientY: 100 + top,
          },
        ],
        preventDefault: function () {},
      });

      assert(pointerdown, '5) pointerdown should be true');
      assert(pointermove, '5) pointermove should be true');
      assert(pointerup, '5) pointerup should be true');

      done();
    }, 17);
  });

  // ======================================================
  test('pointer capture', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: stage.getHeight() / 2,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    var circle2 = new Konva.Circle({
      x: stage.getWidth() / 2,
      y: 20,
      radius: 20,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // mobile events
    var downCount = 0;
    var otherDownCount = 0;

    var pointerup = false;
    var pointermove = false;

    circle2.on('pointerdown', function () {
      otherDownCount++;
    });

    circle.on('pointerdown', function (event) {
      downCount++;
      this.setPointerCapture(event.pointerId);
    });

    circle.on('pointerup', function (evt) {
      assert(this.hasPointerCapture(evt.pointerId), 'circle released capture');
      pointerup = true;
    });

    circle.on('pointermove', function (evt) {
      assert(this.hasPointerCapture(evt.pointerId), 'circle has capture');
      pointermove = true;
    });

    layer.add(circle);
    layer.add(circle2);
    stage.add(layer);

    var top = stage.content.getBoundingClientRect().top;

    // on circle 2 to confirm it works
    stage._pointerdown({
      clientX: 289,
      clientY: 10 + top,
      pointerId: 0,
      preventDefault: function () {},
    });

    assert(otherDownCount === 1, '6) otherDownCount should be 1');
    assert(downCount === 0, '6) downCount should be 0');
    assert(!pointermove, '6) pointermove should be false');
    assert(!pointerup, '6) pointerup should be false');

    // on circle with capture
    stage._pointerdown({
      clientX: 289,
      clientY: 100 + top,
      pointerId: 1,
      preventDefault: function () {},
    });

    assert(otherDownCount === 1, '7) otherDownCount should be 1');
    assert(downCount === 1, '7) downCount should be 1');
    assert(!pointermove, '7) pointermove should be false');
    assert(!pointerup, '7) pointerup should be true');

    // second pointerdown
    stage._pointerdown({
      clientX: 289,
      clientY: 10 + top,
      pointerId: 1,
      preventDefault: function () {},
    });

    assert(otherDownCount === 1, '8) otherDownCount should be 1');
    assert(downCount === 2, '8) pointerdown should be 2');
    assert(!pointermove, '8) pointermove should be false');
    assert(!pointerup, '8) pointerup should be true');

    setTimeout(function () {
      // pointermove over circle 2
      stage._pointermove({
        clientX: 290,
        clientY: 10 + top,
        pointerId: 1,
        preventDefault: function () {},
      });

      assert(otherDownCount === 1, '9) otherDownCount should be 1');
      assert(pointermove, '9) pointermove should be true');

      stage._pointerup({
        pointerId: 1,
        preventDefault: function () {},
      });

      stage._pointerdown({
        clientX: 289,
        clientY: 10 + top,
        pointerId: 1,
        preventDefault: function () {},
      });

      assert(otherDownCount === 2, '10) otherDownCount should be 1');
      assert(pointerup, '10) pointerup should be true');

      done();
    }, 17);
  });
});
