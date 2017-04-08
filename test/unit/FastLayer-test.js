suite('FastLayer', function() {

    // ======================================================
    test('basic render', function() {
        var stage = addStage();

        var layer = new Konva.FastLayer();

        var circle = new Konva.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


    });

    test('transform', function() {
      var stage = addStage();

      var fastLayer = new Konva.FastLayer({
        x: stage.width() / 2,
        y: stage.height() / 2
      });

      var layer = new Konva.Layer({
        x: stage.width() / 2,
        y: stage.height() / 2
      });

      var circle = new Konva.Circle({
          radius: 70,
          fill: 'green'
      });

      fastLayer.add(circle);
      layer.add(circle.clone());
      stage.add(layer, fastLayer);

      compareLayers(fastLayer, layer);
    });

test('cache shape on fast layer', function(){
    var stage = addStage();
    var layer = new Konva.FastLayer();

    var circle = new Konva.Circle({
        x: 74,
        y: 74,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle'
    });

    layer.add(circle);
    stage.add(layer);


    circle.cache({
        x: -74,
        y: -74,
        width: 148,
        height: 148
    }).offset({
        x: 74,
        y: 74
    });

    layer.draw();


  });


});
