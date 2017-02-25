suite('Filter Sepia', function() {
  // ======================================================
  test('basic', function(done) {
    var stage = addStage();

    var imageObj = new Image();
    imageObj.onload = function() {
      var layer = new Konva.Layer();
      darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Sepia]);
      layer.draw();

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
      darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        crop: { x: 128, y: 48, width: 256, height: 128 },
        draggable: true
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Sepia]);
      layer.draw();

      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('with transparency', function(done) {
    var stage = addStage();

    var imageObj = new Image();
    imageObj.onload = function() {
      var layer = new Konva.Layer();
      darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Sepia]);
      layer.draw();

      done();
    };
    imageObj.src = 'assets/lion.png';
  });
});
