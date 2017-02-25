suite('Noise', function() {
  // ======================================================
  test('noise tween', function(done) {
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
      darth.filters([Konva.Filters.Noise]);
      darth.noise(1);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 5.0,
        noise: 0,
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
    imageObj.src = 'assets/lion.png';
  });
});
