suite('Rect', function(){
  // ======================================================

  test('add rect to stage', function(){
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

    assert.equal(rect.getX(), 100);
    assert.equal(rect.getY(), 50);

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);beginPath();rect(0,0,100,50);closePath();fillStyle=green;fill();save();lineWidth=2;strokeStyle=blue;stroke();restore();restore()');

  });

  // ======================================================

  test('add rect to stage with shadow, rotation, corner radius, and opacity', function(){
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
      stroke: 'blue',
      shadowColor: 'red',
      shadowBlur: 10,
      shadowOffset: 5,
      shadowOpacity: 0.5,
      opacity: 0.4,
      cornerRadius: 5
    });

    layer.add(rect);
    stage.add(layer);

    assert.equal(rect.getShadowColor(), 'red');
    assert.equal(rect.getShadowBlur(), 10);
    assert.equal(rect.getShadowOffsetX(), 5);
    assert.equal(rect.getShadowOffsetY(), 5);
    assert.equal(rect.getShadowOpacity(), 0.5);
    assert.equal(rect.getOpacity(), 0.4);
    assert.equal(rect.getCornerRadius(), 5);

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,50);beginPath();moveTo(5,0);lineTo(95,0);arc(95,5,5,4.712,0,false);lineTo(100,45);arc(95,45,5,0,1.571,false);lineTo(5,50);arc(5,45,5,1.571,3.142,false);lineTo(0,5);arc(5,5,5,3.142,4.712,false);closePath();fillStyle=green;fill();fillStyle=green;fill();save();lineWidth=2;strokeStyle=blue;stroke();restore();restore()');

  });
});