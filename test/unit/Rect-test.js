suite('Rect', function(){
  var util;

  setup(function(){

  });

  suite('add rect to stage', function(){
    var stage = new Kinetic.Stage({
      container: 'container',
      width: 578,
      height: 200
    });

    var layer = new Kinetic.Layer();

    var rect = new Kinetic.Rect({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: 'green',
      stroke: 'blue'
    });

    layer.add(rect);
    stage.add(layer);

    test('getters', function(){
      assert.equal(rect.getX(), 100);
      assert.equal(rect.getY(), 50);

    });

    test('context trace array', function() {
      var traceArr = layer.getContext().traceArr;
      console.log(traceArr)
      assert.equal(traceArr[0], 'clearRect(0,0,578,200)');
    });
  });
});