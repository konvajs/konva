suite('Sprite', function() {
    // ======================================================
    test('add sprite', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Kinetic.Layer();


            var sprite = new Kinetic.Sprite({
                x: 200,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: {
                    standing: [
                        0, 0, 49, 109,
                        52, 0, 49, 109,
                        105, 0, 49, 109,
                        158, 0, 49, 109,
                        210, 0, 49, 109,
                        262, 0, 49, 109
                    ],
                    kicking: [
                        0, 109, 45, 98,
                        45, 109, 45, 98,
                        95, 109, 63, 98,
                        156, 109, 70, 98,
                        229, 109, 60, 98,
                        287, 109, 41, 98
                    ]
                },
                frameRate: 10,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 3,
                shadowOffset: {x: 3, y:1},
                shadowOpacity: 0.3
            });

            layer.add(sprite);
            stage.add(layer);

            assert.equal(sprite.getClassName(), 'Sprite');
            assert.equal(sprite.frameIndex(), 0);

            showHit(layer);

            var trace = layer.hitCanvas.getContext().getTrace();

            assert.equal(trace.indexOf(sprite.colorKey) >= 0, true);

            sprite.start();


            // kick once
            setTimeout(function() {
                sprite.setAnimation('kicking');
                sprite.on('indexChange', function(evt) {
                    if (evt.newVal === 0 && this.getAnimation() === 'kicking') {
                        sprite.setAnimation('standing');
                    }
                });
            }, 2000);
            setTimeout(function() {
                sprite.stop();
            }, 3000);



            done();
        };
        imageObj.src = 'assets/scorpion-sprite.png';
    });

    test('check is sprite running', function(done){
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Kinetic.Layer();


            var sprite = new Kinetic.Sprite({
                x: 200,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: {
                    standing: [
                        0, 0, 49, 109,
                        52, 0, 49, 109,
                        105, 0, 49, 109,
                        158, 0, 49, 109,
                        210, 0, 49, 109,
                        262, 0, 49, 109
                    ]
                },
                frameRate: 50,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 3,
                shadowOffset: {x: 3, y:1},
                shadowOpacity: 0.3
            });

            layer.add(sprite);
            stage.add(layer);
            assert.equal(sprite.isRunning(), false);
            sprite.start();
            assert.equal(sprite.isRunning(), true);
            sprite.stop();
            done();
        };
        imageObj.src = 'assets/scorpion-sprite.png';
    });

    test.skip('can change frame rate on fly', function(done){
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Kinetic.Layer();


            var sprite = new Kinetic.Sprite({
                x: 200,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: {
                    standing: [
                        0, 0, 49, 109,
                        52, 0, 49, 109,
                        105, 0, 49, 109,
                        158, 0, 49, 109,
                        210, 0, 49, 109,
                        262, 0, 49, 109
                    ]
                },
                frameRate: 50,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 3,
                shadowOffset: {x: 3, y:1},
                shadowOpacity: 0.3
            });

            layer.add(sprite);
            stage.add(layer);
            assert.equal(sprite.frameRate(), 50);
            setTimeout(function(){
                sprite.frameRate(100);
                assert.equal(sprite.frameRate(), 100);
                // don't run animation after change frame rate
                assert.equal(sprite.anim.isRunning(), false);

                sprite.start();
            }, 23);

            setTimeout(function(){
                sprite.frameRate(52);
                assert.equal(sprite.anim.isRunning(), true);
                // for this moment should tick more than 2 times
                // make sure that sprite is not restating after set frame rate
                assert.equal(sprite.frameIndex() > 2, true);
                done();
            }, 68);
        };
        imageObj.src = 'assets/scorpion-sprite.png';
    });

});