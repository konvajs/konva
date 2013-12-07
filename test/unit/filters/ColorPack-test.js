suite('Color Pack', function() {
    // ======================================================
    test('colorize basic', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Colorize);
            darth.setFilterColorizeColor([255,0,128]);
            layer.draw();

            // Assert fails even though '[255,0,128] = [255,0,128]'
            //assert.equal(darth.getFilterColorizeColor(), [255,0,128]);

            done();
        };
        imageObj.src = 'assets/darth-vader.jpg';

    });

    // ======================================================
    test('colorize crop', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                crop: {x:128, y:48, width:256, height:128},
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.Colorize);
            darth.setFilterColorizeColor([0,255,0]);
            layer.draw();

            // assert.equal(darth.getFilterColorizeColor(), [0,255,0]);

            done();

        };
        imageObj.src = 'assets/darth-vader.jpg';
    });

    // ======================================================
    test('colorize transparancy', function(done) {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var colors = [
            [255,0,0],
            [255,128,0],
            [255,255,0],
            [0,255,0],
            [0,255,128],
            [0,255,255],
            [0,0,255],
            [128,0,255],
            [255,0,255],
            [0,0,0],
            [128,128,128],
            [255,255,255]
        ];
        var i,l = colors.length;
        var nAdded = 0;
        for( i=0; i<l; i+=1 ){
            var imageObj = new Image();
            imageObj.onload = (function(color,x){ return function() {
            
                var darth = new Kinetic.Image({
                    x: x,
                    y: 32,
                    image: imageObj,
                    draggable: true
                });
                layer.add(darth);

                darth.setFilter(Kinetic.Filters.Colorize);
                darth.setFilterColorizeColor(color);

                nAdded += 1;
                if( nAdded >= l ){
                    stage.add(layer);
                    layer.draw();
                    done();
                }
            };})(colors[i],-64+i/l*stage.getWidth());
            imageObj.src = 'assets/lion.png';
        }

    });


    // ======================================================
    test('hue shift tween transparancy', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.HSV);
            darth.setFilterHue(360);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              filterHue: 0,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('saturation tween transparancy', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.HSV);
            darth.setFilterSaturation(2.0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              filterSaturation: 0.001,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('value tween transparancy', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            darth = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(darth);
            stage.add(layer);

            darth.setFilter(Kinetic.Filters.HSV);
            darth.setFilterValue(2.0);
            layer.draw();

            var tween = new Kinetic.Tween({
              node: darth, 
              duration: 5.0,
              filterValue: 0.001,
              easing: Kinetic.Easings.EaseInOut
            });
        
            darth.on('mouseover', function() {
              tween.play();
            });
      
            darth.on('mouseout', function() {
              tween.reverse();
            });

            done();
        };
        imageObj.src = 'assets/lion.png';

    });

    // ======================================================
    test('hue shift rainbow', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        // The important line!
        shapesLayer.on('draw', function () {
          var src, dst, i, w=40;
          var ctx = this.getContext();
          var ctxWidth = this.getCanvas().width/2;
          var ctxHeight = this.getCanvas().height;
          var xSize = Math.floor(ctxWidth/w);
          var ySize = Math.floor(ctxHeight);
          for( i=0; i<w; i+=1 ){
              src = ctx.getImageData(i*xSize,0,xSize,ySize);
              dst = ctx.createImageData(src);
              Kinetic.Filters.HSV(src,dst,{hue:i*360/w,saturation:5});
              ctx.putImageData(dst,i*xSize,0);
              //ctx.strokeRect(i*xSize,0,xSize,ySize);
          }
        });

        var triangle = new Kinetic.RegularPolygon({
          x: stage.getWidth() / 4,
          y: stage.getHeight() / 2,
          sides: 3,
          radius: 80,
          fillRadialGradientStartPoint: 0,
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: 0,
          fillRadialGradientEndRadius: 70,
          fillRadialGradientColorStops: [0, '#881111', 0.5, '#888811', 1, '#000088'],
          stroke: 'black',
          strokeWidth: 4,
          draggable: true
        });

        var circle = new Kinetic.Circle({
          x: 3 * stage.getWidth() / 4,
          y: stage.getHeight() / 2,
          radius: 70,
          fill: '#880000',
          stroke: 'black',
          strokeWidth: 4,
          draggable: true,
          id: 'myCircle'
        });

        for( var i=0; i<10; i+=1 ){
          for( var j=0; j<10; j+=1 ){
            var rect = new Kinetic.Rect({
              x: i/10*stage.getWidth(),
              y: j/10*stage.getHeight(),
              width: stage.getWidth()/10,
              height: stage.getHeight()/10,
              fill: (i+j)%2===0?'#FF0000':'#FFFF00',
              stroke: 'black',
              strokeWidth: 4,
              draggable: true
            });
            shapesLayer.add(rect);
          }
        }

        shapesLayer.add(circle);
        shapesLayer.add(triangle);

        stage.add(shapesLayer);

        done();
    });

    // ======================================================
    test('saturation gradient', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        // The important line!
        shapesLayer.on('draw', function () {
          var src, dst, i, w=40;
          var ctx = this.getContext();
          var ctxWidth = this.getCanvas().width;
          var ctxHeight = this.getCanvas().height;
          var xSize = Math.floor(ctxWidth/w);
          var ySize = Math.floor(ctxHeight);
          for( i=0; i<w; i+=1 ){
              src = ctx.getImageData(i*xSize,0,xSize,ySize);
              dst = ctx.createImageData(src);
              Kinetic.Filters.HSV(src,dst,{saturation:2*(0.001+i)/w});
              ctx.putImageData(dst,i*xSize,0);
              //ctx.strokeRect(i*xSize,0,xSize,ySize);
          }
        });

        var triangle = new Kinetic.RegularPolygon({
          x: stage.getWidth() / 4,
          y: stage.getHeight() / 2,
          sides: 3,
          radius: 80,
          fillRadialGradientStartPoint: 0,
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: 0,
          fillRadialGradientEndRadius: 70,
          fillRadialGradientColorStops: [0, '#881111', 0.5, '#888811', 1, '#000088'],
          stroke: 'black',
          strokeWidth: 4,
          draggable: true
        });

        var circle = new Kinetic.Circle({
          x: 3 * stage.getWidth() / 4,
          y: stage.getHeight() / 2,
          radius: 70,
          fill: '#880000',
          stroke: 'black',
          strokeWidth: 4,
          draggable: true,
          id: 'myCircle'
        });

        for( var i=0; i<10; i+=1 ){
          for( var j=0; j<10; j+=1 ){
            var rect = new Kinetic.Rect({
              x: i/10*stage.getWidth(),
              y: j/10*stage.getHeight(),
              width: stage.getWidth()/10,
              height: stage.getHeight()/10,
              fill: (i+j)%2===0?'#FF0000':'#FFFF00',
              stroke: 'black',
              strokeWidth: 4,
              draggable: true
            });
            shapesLayer.add(rect);
          }
        }

        shapesLayer.add(circle);
        shapesLayer.add(triangle);

        stage.add(shapesLayer);

        done();
    });

    // ======================================================
    test('value gradient', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        // The important line!
        shapesLayer.on('draw', function () {
          var src, dst, i, w=40;
          var ctx = this.getContext();
          var ctxWidth = this.getCanvas().width;
          var ctxHeight = this.getCanvas().height;
          var xSize = Math.floor(ctxWidth/w);
          var ySize = Math.floor(ctxHeight);
          for( i=0; i<w; i+=1 ){
              src = ctx.getImageData(i*xSize,0,xSize,ySize);
              dst = ctx.createImageData(src);
              Kinetic.Filters.HSV(src,dst,{value:2*(0.001+i)/w});
              ctx.putImageData(dst,i*xSize,0);
              //ctx.strokeRect(i*xSize,0,xSize,ySize);
          }
        });

        var triangle = new Kinetic.RegularPolygon({
          x: stage.getWidth() / 4,
          y: stage.getHeight() / 2,
          sides: 3,
          radius: 80,
          fillRadialGradientStartPoint: 0,
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: 0,
          fillRadialGradientEndRadius: 70,
          fillRadialGradientColorStops: [0, '#881111', 0.5, '#888811', 1, '#000088'],
          stroke: 'black',
          strokeWidth: 4,
          draggable: true
        });

        var circle = new Kinetic.Circle({
          x: 3 * stage.getWidth() / 4,
          y: stage.getHeight() / 2,
          radius: 70,
          fill: '#880000',
          stroke: 'black',
          strokeWidth: 4,
          draggable: true,
          id: 'myCircle'
        });

        for( var i=0; i<10; i+=1 ){
          for( var j=0; j<10; j+=1 ){
            var rect = new Kinetic.Rect({
              x: i/10*stage.getWidth(),
              y: j/10*stage.getHeight(),
              width: stage.getWidth()/10,
              height: stage.getHeight()/10,
              fill: (i+j)%2===0?'#FF0000':'#FFFF00',
              stroke: 'black',
              strokeWidth: 4,
              draggable: true
            });
            shapesLayer.add(rect);
          }
        }

        shapesLayer.add(circle);
        shapesLayer.add(triangle);

        stage.add(shapesLayer);

        done();
    });

});
