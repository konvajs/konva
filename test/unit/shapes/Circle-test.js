suite('Circle', function(){
  // ======================================================

  test('add circle to stage', function(){
    var stage = addStage();
    var layer = new Kinetic.Layer();
    var group = new Kinetic.Group();
    var circle = new Kinetic.Circle({
        x: 100,
        y: 100,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true
    });

    stage.add(layer);
    layer.add(group);
    group.add(circle);
    layer.draw();


    var attrs = circle.getAttrs();

    assert.equal(attrs.x, 100);
    assert.equal(attrs.y, 100);
    assert.equal(attrs.radius, 70);
    assert.equal(attrs.fill, 'green');
    assert.equal(attrs.stroke, 'black');
    assert.equal(attrs.strokeWidth, 4);
    assert.equal(attrs.name, 'myCircle');
    assert.equal(attrs.draggable, true);
    assert.equal(circle.getClassName(), 'Circle');



    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(trace, 'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();');
  });

  // ======================================================
  test('add circle with pattern fill', function(done) {
      var imageObj = new Image();
      imageObj.onload = function() {
          var stage = addStage();
          var layer = new Kinetic.Layer();
          var group = new Kinetic.Group();
          var circle = new Kinetic.Circle({
              x: stage.getWidth() / 2,
              y: stage.getHeight() / 2,
              radius: 70,
              fillPatternImage: imageObj,
              fillPatternOffset: {x: -5, y: -5},
              fillPatternScale: {x: 0.7, y: 0.7},
              stroke: 'black',
              strokeWidth: 4,
              name: 'myCircle',
              draggable: true
          });

          group.add(circle);
          layer.add(group);
          stage.add(layer);

          assert.equal(circle.getFillPatternOffset().x, -5);
          assert.equal(circle.getFillPatternOffset().y, -5);

          circle.setFillPatternOffset({x:1, y:2});
          assert.equal(circle.getFillPatternOffset().x, 1);
          assert.equal(circle.getFillPatternOffset().y, 2);

          circle.setFillPatternOffset({
              x: 3,
              y: 4
          });
          assert.equal(circle.getFillPatternOffset().x, 3);
          assert.equal(circle.getFillPatternOffset().y, 4);

          done();
      };
      imageObj.src = 'assets/darth-vader.jpg';

  });


  // ======================================================
  test('add circle with radial gradient fill', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var group = new Kinetic.Group();
      var circle = new Kinetic.Circle({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          radius: 70,
          fillRadialGradientStartPoint: {x: -20, y: -20},
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: {x: -60, y: -60},
          fillRadialGradientEndRadius: 130,
          fillRadialGradientColorStops: [0, 'red', 0.2, 'yellow', 1, 'blue'],
          name: 'myCircle',
          draggable: true,
          scale: {
              x: 0.5,
              y: 0.5
          }
      });

      group.add(circle);
      layer.add(group);
      stage.add(layer);

      assert.equal(circle.getFillRadialGradientStartPoint().x, -20);
      assert.equal(circle.getFillRadialGradientStartPoint().y, -20);
      assert.equal(circle.getFillRadialGradientStartRadius(), 0);
      assert.equal(circle.getFillRadialGradientEndPoint().x, -60);
      assert.equal(circle.getFillRadialGradientEndPoint().y, -60);
      assert.equal(circle.getFillRadialGradientEndRadius(), 130);
      assert.equal(circle.getFillRadialGradientColorStops().length, 6);

  });

  // ======================================================
  test('add shape with linear gradient fill', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var group = new Kinetic.Group();
      var circle = new Kinetic.Circle({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          radius: 70,
          fillLinearGradientStartPoint: {x:-35,y:-35},
          fillLinearGradientEndPoint: {x:35,y:35},
          fillLinearGradientColorStops: [0, 'red', 1, 'blue'],
          stroke: 'black',
          strokeWidth: 4,
          name: 'myCircle',
          draggable: true
      });

      group.add(circle);
      layer.add(group);
      stage.add(layer);

      assert.equal(circle.getName(), 'myCircle');

  });

  // ======================================================
  test('set opacity after instantiation', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var group = new Kinetic.Group();
      var circle = new Kinetic.Circle({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          radius: 70,
          fill: 'red'
      });

      group.add(circle);
      layer.add(group);
      stage.add(layer);

      circle.setOpacity(0.5);
      layer.draw();

      circle.setOpacity(0.5);
      layer.draw();
  });

  // ======================================================
  test('set fill after instantiation', function() {
      var stage = addStage();
      var layer = new Kinetic.Layer();
      var circle = new Kinetic.Circle({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          radius: 70,
          fill: 'green',
          stroke: 'black',
          strokeWidth: 4
      });
      layer.add(circle);

      circle.setFill('blue');

      stage.add(layer);
  });
});