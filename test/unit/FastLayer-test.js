suite('FastLayer', function() {

    // ======================================================
    test('basic render', function() {
        var stage = addStage();

        var layer = new Kinetic.FastLayer();

        var circle = new Kinetic.Circle({
            x: 100,
            y: stage.getHeight() / 2,
            radius: 70,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4
        });

        layer.add(circle);
        stage.add(layer);


    });

test('cache shape on fast layer', function(){
    var stage = addStage();
    var layer = new Kinetic.FastLayer();

    var circle = new Kinetic.Circle({
        x: 74,
        y: 74,
        radius: 70,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 4,
        name: 'myCircle'
    });

    layer.add(circle);
    stage.add(layer);


    circle.cache({
        x: -74,
        y: -74,
        width: 148,
        height: 148
    }).offset({
        x: 74,
        y: 74
    });

    layer.draw();


  });


});