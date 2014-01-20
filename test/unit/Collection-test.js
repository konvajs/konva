suite('Collection', function(){
  var util;

  test('test collection method mapping', function(){
    // Node method
    assert.notEqual(Kinetic.Collection.prototype.on, undefined);

    // Layer method
    assert.notEqual(Kinetic.Collection.prototype.getContext, undefined);

    // Container method
    assert.notEqual(Kinetic.Collection.prototype.hasChildren, undefined);

    // Shape method
    assert.notEqual(Kinetic.Collection.prototype.strokeWidth, undefined);
  });

  test('add circle to stage', function(){
    var stage = addStage();
    var layer = new Kinetic.Layer();
    var circle1 = new Kinetic.Circle({
        x: 100,
        y: 100,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true
    });


    var circle2 = new Kinetic.Circle({
        x:300,
        y: 100,
        radius: 70,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle',
        draggable: true
    });

    
    layer.add(circle1).add(circle2);
    stage.add(layer);

    layer.find('Circle').fill('blue').stroke('green');
    layer.draw();

    //console.log(layer.getContext().getTrace());

    assert.equal(layer.getContext().getTrace(),'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,300,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=red;fill();lineWidth=4;strokeStyle=black;stroke();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=blue;fill();lineWidth=4;strokeStyle=green;stroke();restore();save();transform(1,0,0,1,300,100);beginPath();arc(0,0,70,0,6.283,false);closePath();fillStyle=blue;fill();lineWidth=4;strokeStyle=green;stroke();restore();');


  });
});