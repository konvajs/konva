suite('Image', function(){

  // ======================================================
  test('add image', function(done) {
      var imageObj = new Image();
      imageObj.onload = function() {
          var stage = addStage();

          var layer = new Kinetic.Layer();
          darth = new Kinetic.Image({
              x: 200,
              y: 60,
              image: imageObj,
              width: 100,
              height: 100,
              offset: {x: 50, y: 30},
              crop: {x: 135, y: 7, width: 167, height: 134},
              draggable: true
          });

          layer.add(darth);
          stage.add(layer);

          darth.setHeight(200);
          layer.draw();

          darth.setHeight(100);
          layer.draw();

          assert.equal(darth.getX(), 200);
          assert.equal(darth.getY(), 60);
          assert.equal(darth.getWidth(), 100);
          assert.equal(darth.getHeight(), 100);
          assert.equal(darth.offset().x, 50);
          assert.equal(darth.offset().y, 30);
          assert.equal(Kinetic.Util._isElement(darth.getImage()), true);

          var crop = null;
          crop = darth.getCrop();

          assert.equal(crop.x, 135);
          assert.equal(crop.y, 7);
          assert.equal(crop.width, 167);
          assert.equal(crop.height, 134);

          darth.setCrop({
              x: 8,
              y: 9,
              width: 10,
              height: 11
          });
          crop = darth.getCrop();
          assert.equal(crop.x, 8);
          assert.equal(crop.y, 9);
          assert.equal(crop.width, 10);
          assert.equal(crop.height, 11);

          darth.setCropX(12);
          crop = darth.getCrop();
          assert.equal(crop.x, 12);
          assert.equal(crop.y, 9);
          assert.equal(crop.width, 10);
          assert.equal(crop.height, 11);

          darth.setCropY(13);
          crop = darth.getCrop();
          assert.equal(crop.x, 12);
          assert.equal(crop.y, 13);
          assert.equal(crop.width, 10);
          assert.equal(crop.height, 11);

          darth.setCropWidth(14);
          crop = darth.getCrop();
          assert.equal(crop.x, 12);
          assert.equal(crop.y, 13);
          assert.equal(crop.width, 14);
          assert.equal(crop.height, 11);

          darth.setCropHeight(15);
          crop = darth.getCrop();
          assert.equal(crop.x, 12);
          assert.equal(crop.y, 13);
          assert.equal(crop.width, 14);
          assert.equal(crop.height, 15);

          darth.setAttrs({
              x: 200,
              y: 60,
              image: imageObj,
              width: 100,
              height: 100,
              offsetX: 50,
              offsetY: 30,
              crop: {x: 135, y: 7, width: 167, height: 134},
              draggable: true
          });

          //document.body.appendChild(layer.bufferCanvas.element)
          
          assert.equal(darth.getClassName(), 'Image');

          var trace = layer.getContext().getTrace();
          //console.log(trace);

          assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);beginPath();rect(0,0,100,100);closePath();drawImage([object HTMLImageElement],135,7,167,134,0,0,100,100);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);beginPath();rect(0,0,100,200);closePath();drawImage([object HTMLImageElement],135,7,167,134,0,0,100,200);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);beginPath();rect(0,0,100,100);closePath();drawImage([object HTMLImageElement],135,7,167,134,0,0,100,100);restore();');

          done();

      };
      imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('crop and scale image', function(done) {
      var imageObj = new Image();
      imageObj.onload = function() {
          var stage = addStage();
          var layer = new Kinetic.Layer();
          darth = new Kinetic.Image({
              x: 200,
              y: 75,
              image: imageObj,
              width: 107,
              height: 75,
              crop: {x:186, y:211, width:106, height:74},
              draggable: true,
              scale: [0.5, 0.5]
          });

          layer.add(darth);
          stage.add(layer);


          assert.equal(darth.getCrop().x, 186);
          assert.equal(darth.getCrop().y, 211);
          assert.equal(darth.getCrop().width, 106);
          assert.equal(darth.getCrop().height, 74);

          assert.equal(darth.getCropX(), 186);
          assert.equal(darth.getCropY(), 211);
          assert.equal(darth.getCropWidth(), 106);
          assert.equal(darth.getCropHeight(), 74);

          darth.setCrop({x: 1, y: 2, width: 3, height: 4});
          
          assert.equal(darth.getCrop().x, 1);
          assert.equal(darth.getCrop().y, 2);
          assert.equal(darth.getCrop().width, 3);
          assert.equal(darth.getCrop().height, 4);

          assert.equal(darth.getCropX(), 1);
          assert.equal(darth.getCropY(), 2);
          assert.equal(darth.getCropWidth(), 3);
          assert.equal(darth.getCropHeight(), 4);

          darth.setCropX(5);
          darth.setCropY(6);
          darth.setCropWidth(7);
          darth.setCropHeight(8);

          assert.equal(darth.getCrop().x, 5);
          assert.equal(darth.getCrop().y, 6);
          assert.equal(darth.getCrop().width, 7);
          assert.equal(darth.getCrop().height, 8);

          assert.equal(darth.getCropX(), 5);
          assert.equal(darth.getCropY(), 6);
          assert.equal(darth.getCropWidth(), 7);
          assert.equal(darth.getCropHeight(), 8);  

          done();    

      };
      imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('image with svg source', function(done) {
      var imageObj = new Image();

      var stage = addStage();
      var layer = new Kinetic.Layer();

      imageObj.onload = function() {

          var tiger = new Kinetic.Image({
              x: 0,
              y: 0,
              image: imageObj,
              draggable: true,
              scale: 0.25
          });

          layer.add(tiger);
          stage.add(layer);

          done();  
      };
      imageObj.src = 'assets/Ghostscript_Tiger.svg';
  });

  // ======================================================
  test('opacity test for image with svg source', function(done) {
      var imageObj = new Image();

      var stage = addStage();
      var layer = new Kinetic.Layer();

      layer.add(new Kinetic.Line({
          points: [0,0,578,200],
          stroke: 'black',
          strokeWidth: 5
      }));
      
      imageObj.onload = function() {

          var tiger = new Kinetic.Image({
              x: 0,
              y: 0,
              image: imageObj,
              draggable: true,
              scale: 0.25,
              opacity: 0.5
          });

          layer.add(tiger);
          
          layer.add(new Kinetic.Line({
              points: [578,0,0,200],
              stroke: 'blue',
              strokeWidth: 5
          }));
      
          stage.add(layer);

          done();  

      };
      imageObj.style.opacity = 0.5;
      imageObj.src = 'assets/Ghostscript_Tiger.svg';
              
  });

  // ======================================================
  test('image with opacity and shadow', function(done) {
      var imageObj = new Image();
      imageObj.onload = function() {
          var stage = addStage();

          var layer = new Kinetic.Layer();
          darth = new Kinetic.Image({
              x: 200,
              y: 60,
              image: imageObj,
              width: 100,
              height: 100,
              offset: {x: 50, y:30},
              draggable: true,
              opacity: 0.5,
              shadowColor: 'black',
              shadowBlur: 10,
              shadowOpacity: 0.5,
              shadowOffset: {x: 20, y:20}
          });

          layer.add(darth);
          stage.add(layer);

          var trace = layer.getContext().getTrace();
          //console.log(trace);
          assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);save();globalAlpha=0.25;shadowColor=black;shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;beginPath();rect(0,0,100,100);closePath();drawImage([object HTMLImageElement],0,0,100,100);restore();globalAlpha=0.5;beginPath();rect(0,0,100,100);closePath();drawImage([object HTMLImageElement],0,0,100,100);restore();');

          done();

      };
      imageObj.src = 'assets/darth-vader.jpg';
  });

  // ======================================================
  test('image with stroke, opacity and shadow', function(done) {
      var imageObj = new Image();
      imageObj.onload = function() {
          var stage = addStage();

          var layer = new Kinetic.Layer();
          darth = new Kinetic.Image({
              x: 200,
              y: 60,
              image: imageObj,
              width: 100,
              height: 100,
              offset: {x: 50, y: 30},
              draggable: true,
              opacity: 0.5,
              shadowColor: 'black',
              shadowBlur: 10,
              shadowOpacity: 0.5,
              shadowOffset: {x:20, y:20},
              stroke: 'red',
              strokeWidth: 20
          });

          layer.add(darth);
          stage.add(layer);

          var trace = layer.getContext().getTrace();
          //console.log(trace);
          assert.equal(trace, 'clearRect(0,0,578,200);save();save();globalAlpha=0.25;shadowColor=black;shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;drawImage([object HTMLCanvasElement],0,0);restore();globalAlpha=0.5;drawImage([object HTMLCanvasElement],0,0);restore();');

          done();

      };
      imageObj.src = 'assets/darth-vader.jpg';
  });
});