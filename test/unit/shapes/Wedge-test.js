suite('Wedge', function() {
    // ======================================================
    test('add wedge', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var wedge = new Kinetic.Wedge({
            x: 100,
            y: 100,
            radius: 70,
            angle: 180 * 0.4,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myCircle',
            draggable: true
        });

        layer.add(wedge);
        stage.add(layer);

        assert.equal(wedge.getClassName(), 'Wedge');

        var trace = layer.getContext().getTrace();
        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,70,0,1.257,false);lineTo(0,0);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();');
    });

});