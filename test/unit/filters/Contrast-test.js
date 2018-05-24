suite('Filter Contrast', function() {
  // ======================================================
  test('basic', function(done) {
    var stage = addStage();

    var imageObj = new Image();
    imageObj.onload = function() {
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Contrast]);
      darth.contrast(40);
      layer.draw();

      assert.equal(darth.contrast(), 40);

      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('tween', function(done) {
    var stage = addStage();

    var imageObj = new Image();
    imageObj.onload = function() {
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Contrast]);
      darth.contrast(40);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 2.0,
        contrast: 0,
        easing: Konva.Easings.EaseInOut
      });

      darth.on('mouseover', function() {
        tween.play();
      });

      darth.on('mouseout', function() {
        tween.reverse();
      });

      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('crop', function(done) {
    var stage = addStage();

    var imageObj = new Image();
    imageObj.onload = function() {
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        crop: { x: 128, y: 48, width: 256, height: 128 },
        draggable: true
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Contrast]);
      darth.contrast(-40);
      layer.draw();

      assert.equal(darth.contrast(), -40);

      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });
});
