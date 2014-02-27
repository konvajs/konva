var fs = require('fs'),
    Kinetic = require('./kinetic');

var layer = new Kinetic.Layer({
    width : 200,
    height : 200
});

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

var stream = layer.createPNGStream();
var file = fs.createWriteStream(__dirname + '/helloworld.png');
stream.on('data', function(chunk) {
  file.write(chunk);
});