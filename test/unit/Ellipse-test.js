suite('Ellipse', function(){

  // ======================================================
  test('add ellipse', function(){
      var stage = new Kinetic.Stage({
          container: 'container',
          width: 578,
          height: 200
      });
      var layer = new Kinetic.Layer();
      var ellipse = new Kinetic.Ellipse({
          x: stage.getWidth() / 2,
          y: stage.getHeight() / 2,
          radius: [70, 35],
          fill: 'green',
          stroke: 'black',
          strokeWidth: 8
      });
      layer.add(ellipse);
      stage.add(layer);
      assert.equal(ellipse.getClassName(), 'Ellipse');

      var trace = layer.getContext().getTrace();
      assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();save();scale(1,0.5);arc(0,0,70,0,6.283,false);restore();closePath();fillStyle=green;fill();lineWidth=8;strokeStyle=black;stroke();restore()');
  });
});