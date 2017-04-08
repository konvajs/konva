suite('Ring', function() {

  // ======================================================
  test('add ring', function() {
      var stage = addStage();
      var layer = new Konva.Layer();
      var ring = new Konva.Ring({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          innerRadius: 50,
          outerRadius: 90,
          fill: 'green',
          stroke: 'black',
          strokeWidth: 4,
          draggable: true
      });
      layer.add(ring);
      stage.add(layer);
      assert.equal(ring.getClassName(), 'Ring');

      var trace = layer.getContext().getTrace();
      assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();arc(0,0,50,0,6.283,false);moveTo(90,0);arc(0,0,90,6.283,0,true);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();');
   });

  // ======================================================
  test('ring attrs sync', function() {
      var stage = addStage();
      var layer = new Konva.Layer();
      var ring = new Konva.Ring({
          name: 'ring',
          x: 30,
          y: 50,
          innerRadius: 15,
          outerRadius: 30,
          fill: 'green',
          stroke: 'black',
          strokeWidth: 4,
          draggable: true
      });
      layer.add(ring);
      stage.add(layer);

      assert(ring.width(),60);
      assert(ring.height(), 60);

      ring.height(100);
      assert(ring.width(), 100);
      assert(ring.outerRadius(), 50);

      ring.width(120);
      assert(ring.height(), 120);
      assert(ring.outerRadius(), 60);
   });

    test('ring cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var ring = new Konva.Ring({
            name: 'ring',
            x: 30,
            y: 50,
            innerRadius: 15,
            outerRadius: 30,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        layer.add(ring);
        stage.add(layer);

        assert.deepEqual(ring.getSelfRect(), {
            x : -30,
            y : -30,
            width : 60,
            height : 60
        });

        var layer2 = layer.clone();
        stage.add(layer2);
        layer2.hide();

        compareLayers(layer, layer2);


    });

});