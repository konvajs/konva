require(['kinetic-vcurrent'], function(Kinetic) {

    var stage = new Kinetic.Stage({
        container: 'container',
        width: 578,
        height: 200
    });
    var layer = new Kinetic.Layer();
    var rectX = stage.getWidth() / 2 - 50;
    var rectY = stage.getHeight() / 2 - 25;

    var box = new Kinetic.Rect({
        x: rectX,
        y: rectY,
        width: 100,
        height: 50,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 4,
        draggable: true
    });

    // add cursor styling
    box.on('mouseover', function() {
        document.body.style.cursor = 'pointer';
    });
    box.on('mouseout', function() {
        document.body.style.cursor = 'default';
    });

    layer.add(box);
    stage.add(layer);

});
