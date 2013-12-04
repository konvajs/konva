suite('Color Stretch', function () {
    // ======================================================
    test('enhancing colors on layer', function (done) {
        var stage = addStage();

        var shapesLayer = new Kinetic.Layer();

        // The important line!
        shapesLayer.on('draw', function () {
          var imageData = this.getContext().getImageData(0, 0, this.getCanvas().width/2, this.getCanvas().height);
          var scratchData = this.getContext().createImageData(imageData); // only size copied
          Kinetic.Filters.ColorStretch(imageData, scratchData, {});
          this.getContext().putImageData(scratchData, 0, 0);
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

        shapesLayer.add(circle);
        shapesLayer.add(triangle);

        stage.add(shapesLayer);

        done();
    });

    // ======================================================
    test('on image', function(done) {
        var stage = addStage();

        var imageObj = new Image();
        imageObj.onload = function() {
            
            var layer = new Kinetic.Layer();
            var filt = new Kinetic.Image({
                x: 10,
                y: 10,
                image: imageObj,
                draggable: true
            });
            var orig = new Kinetic.Image({
                x: 200,
                y: 10,
                image: imageObj,
                draggable: true
            });

            layer.add(filt);
            layer.add(orig);
            stage.add(layer);

            filt.setFilter(Kinetic.Filters.ColorStretch);
            layer.draw();

            done();
        };
        imageObj.src = 'assets/bamoon.jpg';

    });
});
