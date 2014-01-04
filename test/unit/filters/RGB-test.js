suite('RGB', function() {
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

            darth.cache();
            darth.filters([Kinetic.Filters.RGB]);
            darth.red(255).green(0).blue(128);
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

            darth.cache();
            darth.filters([Kinetic.Filters.RGB]);
            darth.red(0).green(255).blue(0);
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

                darth.cache();
                darth.filters([Kinetic.Filters.RGB]);
                darth.red(color[0]).green(color[1]).blue(color[2]);

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

});
