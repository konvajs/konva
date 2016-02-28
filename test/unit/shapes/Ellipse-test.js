suite('Ellipse', function(){

    // ======================================================
    test('add ellipse', function(){
      var stage = addStage();
      var layer = new Konva.Layer();
      var ellipse = new Konva.Ellipse({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          radius: {x:70, y:35},
          fill: 'green',
          stroke: 'black',
          strokeWidth: 8
      });
      layer.add(ellipse);
      stage.add(layer);
      assert.equal(ellipse.getClassName(), 'Ellipse');

      var trace = layer.getContext().getTrace();
      assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();save();scale(1,0.5);arc(0,0,70,0,6.283,false);restore();closePath();fillStyle=green;fill();lineWidth=8;strokeStyle=black;stroke();restore();');
    });

    // ======================================================
    test('attrs sync', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var ellipse = new Konva.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: {x:70, y:35},
            fill: 'green',
            stroke: 'black',
            strokeWidth: 8
        });
        layer.add(ellipse);
        stage.add(layer);

        assert.equal(ellipse.getWidth(), 140);
        assert.equal(ellipse.getHeight(), 70);

        ellipse.setWidth(100);
        assert.equal(ellipse.radiusX(), 50);
        assert.equal(ellipse.radiusY(), 35);

        ellipse.setHeight(120);
        assert.equal(ellipse.radiusX(), 50);
        assert.equal(ellipse.radiusY(), 60);
    });

    test('getSelfRect', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var ellipse = new Konva.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: {x:70, y:35},
            fill: 'green',
            stroke: 'black',
            strokeWidth: 8
        });
        layer.add(ellipse);
        stage.add(layer);

        assert.deepEqual(ellipse.getSelfRect(), {
            x : -70,
            y : -35,
            width : 140,
            height : 70
        });
    });

    test('cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var ellipse = new Konva.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: {x:70, y:35},
            fill: 'green',
            stroke: 'black',
            strokeWidth: 8
        });
        ellipse.cache();
        layer.add(ellipse);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.save();
        context.beginPath();
        context.scale(1, 0.5);
        context.arc(stage.getWidth() / 2, stage.getHeight(), 70, 0, Math.PI * 2, false);
        context.closePath();
        context.restore();
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth  = 8;
        context.stroke();
        compareLayerAndCanvas(layer, canvas, 80);
    });
});
