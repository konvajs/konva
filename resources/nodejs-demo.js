var fs = require('fs'),
    Konva = require('konva');


// Create stage. Container parameter is not required in NodeJS.
var stage = new Konva.Stage({
    width : 100,
    height : 100
});

var layer = new Konva.Layer();
stage.add(layer);
var rect = new Konva.Rect({
    width : 100,
    height : 100,
    x : 50,
    y : 50,
    fill : 'green'
});
var text = new Konva.Text({
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
var tween = new Konva.Tween({
    node : rect,
    duration : 1,
    x : -50
});
tween.play();

// After tween we want to convert stage to dataURL
setTimeout(function(){
    stage.toDataURL({
        callback: function(data){
            // Then add result to stage
            var img = new Konva.window.Image();
            img.onload = function() {
                var image = new Konva.Image({
                    image : img,
                    x : 10,
                    y : 50
                });
                layer.add(image);
                layer.draw();
                // save stage image as file
                stage.toDataURL({
                    callback: function(data){
                        var base64Data = data.replace(/^data:image\/png;base64,/, '');
                        fs.writeFile('out.png', base64Data, 'base64', function(err) {
                           err && console.log(err);
                           console.log('See out.png');
                        });
                    }
                });
            };
            img.src = data;

        }
    });
}, 1050);
