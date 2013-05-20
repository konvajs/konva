Test.Modules.SPRITE = {
    'add sprite': function(containerId) {
        var imageObj = new Image();
        imageObj.onload = function() {
            var stage = new Kinetic.Stage({
                container: containerId,
                width: 578,
                height: 200
            });
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
            sprite.start();
            //}

            stage.add(layer);

            // kick once
            setTimeout(function() {
                sprite.setAnimation('kicking');

                sprite.afterFrame(5, function() {
                    sprite.setAnimation('standing');
                });
            }, 2000);
            setTimeout(function() {
                sprite.stop();
            }, 3000);
            //document.body.appendChild(layer.bufferCanvas.element)
            
            test(sprite.getClassName() === 'Sprite', 'getClassName should be Sprite');

            test(sprite.getIndex() === 0, 'sprite index should default to 0');
        };
        imageObj.src = '../assets/scorpion-sprite.png';
    }
};
