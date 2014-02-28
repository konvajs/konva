var fs = require('fs'),
    Kinetic = require('./dist/kinetic-dev');

var stage = new Kinetic.Stage({
    width : 100,
    height : 100
});

var layer = new Kinetic.Layer();
stage.add(layer);
var rect = new Kinetic.Rect({
    width : 100,
    height : 100,
    x : 50,
    y : 50,
    fill : 'green'
});
var text = new Kinetic.Text({
    text : 'Generated inside node js',
    x : 20,
    y : 20,
    fill : 'black'
});
layer.add(rect).add(text);
layer.draw();
stage.setSize({
    width : 200,
    height : 200
});

// check tween works
var tween = new Kinetic.Tween({
    node : rect,
    duration : 1,
    x : -50
});
tween.play();

setTimeout(function(){
    stage.toDataURL({
        callback: function(data){
            // adding image to stage
            var img = new Kinetic.window.Image();
            img.onload = function() {
                var image = new Kinetic.Image({
                    image : img,
                    x : 10
                });
                layer.add(image);
                layer.draw();
                // save stage to disk
                stage.toDataURL({
                    callback: function(data){
                        console.log(1);
                        var base64Data = data.replace(/^data:image\/png;base64,/,"");

                        fs.writeFile("out.png", base64Data, 'base64', function(err) {
                           console.log(err);
                        });
                    }
                });
            };
            img.src = data;

        }
    });
}, 1050);