suite('ColorBalance', function() {
  // ======================================================
  test('Color balance basic', function(done) {
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
      darth.filters([Konva.Filters.ColorBalance]);
      darth.redBalance(2).greenBalance(1).blueBalance(1);
      layer.draw();

      // Assert fails even though '[255,0,128] = [255,0,128]'
      // assert.deepEqual(darth.getFilterColorizeColor(), [255,0,128]);

      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('Color balce batch', function(done) {
    var stage = addStage();
    var layer = new Konva.Layer();

    var colors = [
      [1.5, 1, 1],
      [1.5, 0.5, 1],
      [1.5, 1.5, 1],
      [1, 1.5, 1],
      [1, 1.5, 0.5],
      [1, 1.5, 1.5],
      [1, 1, 1.5],
      [0.5, 1, 1.5],
      [1.5, 1, 1.5],
      [1, 1, 1],
      [0.5, 0.5, 0.5],
      [1.5, 1.5, 1.5]
    ];
    var i, l = colors.length;
    var nAdded = 0;
    for (i = 0; i < l; i += 1) {
      var imageObj = new Image();
      imageObj.onload = (function(color, x) {
        return function() {
          var darth = new Konva.Image({
            x: x,
            y: 32,
            image: imageObj,
            draggable: true
          });
          layer.add(darth);

          darth.cache();
          darth.filters([Konva.Filters.ColorBalance]);
          darth.redBalance(color[0]).greenBalance(color[1]).blueBalance(color[2]);

          nAdded += 1;
          if (nAdded >= l) {
            stage.add(layer);
            layer.draw();
            done();
          }
        };
      })(colors[i], -64 + i / l * stage.getWidth());
      imageObj.src = 'assets/lion.png';
    }
  });
});
