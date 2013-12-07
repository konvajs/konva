suite('Polar Coordinates', function () {
    // ======================================================
    test('to polar', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        // The important line!
        shapesLayer.on('draw', function () {
          var imageData = this.getContext().getImageData(0, 0, this.getCanvas().width/2, this.getCanvas().height);
          var scratchData = this.getContext().createImageData(imageData); // only size copied
          Kinetic.Filters.ToPolar(imageData,scratchData,{x:this.getWidth()/2,y:this.getHeight()/2});
          this.getContext().putImageData(scratchData,0,0);
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
    test('phase shift (rotation)', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        // The important line!
        var theta = 0;
        shapesLayer.on('draw', function () {
          theta = theta+1 || 0;
          var imageData = this.getContext().getImageData(0, 0, this.getCanvas().width/2, this.getCanvas().height);
          var scratchData = this.getContext().createImageData(imageData); // only size copied
          Kinetic.Filters.ToPolar(imageData,scratchData,{polarCenterX:this.getWidth()/2,polarCenterY:this.getHeight()/2});
          Kinetic.Filters.FromPolar(scratchData,imageData,{polarRotation:theta});
          this.getContext().putImageData(imageData,0,0);
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
    test('radial blur', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        shapesLayer.on('draw', function () {
          var imageData = this.getContext().getImageData(0, 0, this.getCanvas().width/2, this.getCanvas().height);
          var scratchData = this.getContext().createImageData(imageData); // only size copied
          Kinetic.Filters.ToPolar(imageData,scratchData,{polarCenterX:this.getWidth()/2,polarCenterY:this.getHeight()/2});
          Kinetic.Filters.BlurX(scratchData,imageData,{blurWidth:13});
          Kinetic.Filters.FromPolar(imageData,scratchData,{});
          this.getContext().putImageData(scratchData,0,0);
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
    test('zoom blur', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        shapesLayer.on('draw', function () {
          var imageData = this.getContext().getImageData(0, 0, this.getCanvas().width/2, this.getCanvas().height);
          var scratchData = this.getContext().createImageData(imageData); // only size copied
          Kinetic.Filters.ToPolar(imageData,scratchData,{polarCenterX:this.getWidth()/2,polarCenterY:this.getHeight()/2});
          Kinetic.Filters.BlurY(scratchData,imageData,{blurHeight:33});
          Kinetic.Filters.FromPolar(imageData,scratchData,{});
          this.getContext().putImageData(scratchData,0,0);
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
    test('pixelate', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        shapesLayer.on('draw', function () {
          var imageData = this.getContext().getImageData(0, 0, this.getCanvas().width/2, this.getCanvas().height);
          var scratchData = this.getContext().createImageData(imageData); // only size copied
          Kinetic.Filters.ToPolar(imageData,scratchData,{polarCenterX:this.getWidth()/2,polarCenterY:this.getHeight()/2});
          Kinetic.Filters.Pixelate(scratchData,imageData,{pixelWidth:8,pixelHeight:8});
          Kinetic.Filters.FromPolar(imageData,scratchData,{});
          this.getContext().putImageData(scratchData,0,0);
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
    test('ripples', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        shapesLayer.on('draw', function () {
          var filterWidth = this.getCanvas().width/2;
          var filterHeight = this.getCanvas().height;

          var imageData = this.getContext().getImageData(0, 0, filterWidth, filterHeight);
          var scratchData = this.getContext().createImageData(imageData); // only size copied

          Kinetic.Filters.ToPolar(imageData,scratchData,{polarCenterX:this.getWidth()/2,polarCenterY:this.getHeight()/2});

          // Copy/repeat a section along the r axis for effect
          var nCopies = 8;
          var sectionHeight = Math.floor(filterHeight/nCopies);
          var x,y,i, r,g,b,a, srcPos, dstPos;
          for( x=0; x<filterWidth; x+=1 ){
            for( y=0; y<sectionHeight; y+=1 ){
              srcPos = (filterWidth*y+x)*4;
              r = scratchData.data[srcPos+0];
              g = scratchData.data[srcPos+1];
              b = scratchData.data[srcPos+2];
              a = scratchData.data[srcPos+3];
              for( i=1; i<nCopies; i+=1 ){
                dstPos = (filterWidth*(sectionHeight*i+y)+x)*4;
                scratchData.data[dstPos+0] = r;
                scratchData.data[dstPos+1] = g;
                scratchData.data[dstPos+2] = b;
                scratchData.data[dstPos+3] = a;
              }
            }
          }
          Kinetic.Filters.FromPolar(scratchData,imageData,{});
          this.getContext().putImageData(imageData,0,0);
        });

        var triangle = new Kinetic.RegularPolygon({
          x: stage.getWidth() / 4+48,
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
    test('kalidescope', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        shapesLayer.on('draw', function () {
          var filterWidth = this.getCanvas().width/2;
          var filterHeight = this.getCanvas().height;

          var imageData = this.getContext().getImageData(0, 0, filterWidth, filterHeight);
          var scratchData = this.getContext().createImageData(imageData); // only size copied

          Kinetic.Filters.ToPolar(imageData,scratchData,{polarCenterX:this.getWidth()/2,polarCenterY:this.getHeight()/2});

          // Copy/repeat a section along the theta axis for effect
          var nCopies = 6;
          var sectionSize = Math.floor(filterWidth/nCopies);
          var x,y,i, r,g,b,a, srcPos, dstPos;
          for( y=0; y<filterHeight; y+=1 ){
            for( x=0; x<sectionSize; x+=1 ){
              srcPos = (filterWidth*y+x)*4;
              r = scratchData.data[srcPos+0];
              g = scratchData.data[srcPos+1];
              b = scratchData.data[srcPos+2];
              a = scratchData.data[srcPos+3];
              for( i=1; i<nCopies; i+=1 ){
                dstPos = (filterWidth*y+x+sectionSize*i)*4;
                scratchData.data[dstPos+0] = r;
                scratchData.data[dstPos+1] = g;
                scratchData.data[dstPos+2] = b;
                scratchData.data[dstPos+3] = a;
              }
            }
          }
          Kinetic.Filters.FromPolar(scratchData,imageData,{});
          this.getContext().putImageData(imageData,0,0);
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
