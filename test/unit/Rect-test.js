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
      var n = 0;
      //console.log(traceArr);
      assert.equal(traceArr[n++], 'clearRect(0,0,578,200)');
      assert.equal(traceArr[n++], 'save()');
      assert.equal(traceArr[n++], 'transform(1,0,0,1,100,50)');
      assert.equal(traceArr[n++], 'rect(0,0,100,50)');
      assert.equal(traceArr[n++], 'fillStyle=green');
      assert.equal(traceArr[n++], 'fill()');
      assert.equal(traceArr[n++], 'save()');
      assert.equal(traceArr[n++], 'lineWidth=2');
      assert.equal(traceArr[n++], 'strokeStyle=blue');
      assert.equal(traceArr[n++], 'stroke()');
      assert.equal(traceArr[n++], 'restore()');
      assert.equal(traceArr[n++], 'restore()');
    });
  });
});