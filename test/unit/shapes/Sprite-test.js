suite('Sprite', function() {
    // ======================================================
    test('add sprite', function(done) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = addStage();
            var layer = new Kinetic.Layer();

            var anims = {
                standing: [{
                    x: 0,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 52,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 105,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 158,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 210,
                    y: 0,
                    width: 49,
                    height: 109
                }, {
                    x: 262,
                    y: 0,
                    width: 49,
                    height: 109
                }],

                kicking: [{
                    x: 0,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 45,
                    y: 109,
                    width: 45,
                    height: 98
                }, {
                    x: 95,
                    y: 109,
                    width: 63,
                    height: 98
                }, {
                    x: 156,
                    y: 109,
                    width: 70,
                    height: 98
                }, {
                    x: 229,
                    y: 109,
                    width: 60,
                    height: 98
                }, {
                    x: 287,
                    y: 109,
                    width: 41,
                    height: 98
                }]
            };

            //for(var n = 0; n < 50; n++) {
            sprite = new Kinetic.Sprite({
                //x: Math.random() * stage.getWidth() - 30,
                x: 200,
                //y: Math.random() * stage.getHeight() - 50,
                y: 50,
                image: imageObj,
                animation: 'standing',
                animations: anims,
                frameRate: Math.random() * 6 + 6,
                frameRate: 10,
                draggable: true,
                shadowColor: 'black',
                shadowBlur: 3,
                shadowOffset: [3, 1],
                shadowOpacity: 0.3
            });

            layer.add(sprite);
            stage.add(layer);

            assert.equal(sprite.getClassName(), 'Sprite');
            assert.equal(sprite.getIndex(), 0);

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
});