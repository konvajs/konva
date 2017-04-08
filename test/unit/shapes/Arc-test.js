suite('Arc', function() {
    // ======================================================
    test('add arc', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var arc = new Konva.Arc({
            x: 100,
            y: 100,
            innerRadius: 50,
            outerRadius: 80,
            angle: 90,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myArc',
            draggable: true
        });

        layer.add(arc);
        stage.add(layer);

        assert.equal(arc.getClassName(), 'Arc');

        var trace = layer.getContext().getTrace();
        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,80,0,1.571,false);arc(0,0,50,1.571,0,true);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();');
    });

    // ======================================================
    test('attrs sync', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var arc = new Konva.Arc({
            x: 100,
            y: 100,
            innerRadius: 50,
            outerRadius: 80,
            angle: 90,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myArc',
            draggable: true
        });

        layer.add(arc);
        stage.add(layer);
        assert.equal(arc.getWidth(), 160);
        assert.equal(arc.getHeight(), 160);

        arc.setWidth(100);
        assert.equal(arc.outerRadius(), 50);
        assert.equal(arc.getHeight(), 100);

        arc.setHeight(120);
        assert.equal(arc.outerRadius(), 60);
        assert.equal(arc.getHeight(), 120);
    });

    test('getSelfRect', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var arc = new Konva.Arc({
            x: 100,
            y: 100,
            innerRadius: 50,
            outerRadius: 80,
            angle: 90,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
            name: 'myArc',
            draggable: true
        });

        layer.add(arc);
        stage.add(layer);

        assert.deepEqual(arc.getSelfRect(), {
            x : -80,
            y : -80,
            width : 160,
            height : 160
        });
    });

    test('cache', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        var arc = new Konva.Arc({
            x: 100,
            y: 100,
            innerRadius: 50,
            outerRadius: 80,
            angle: 90,
            fill: 'green',
            stroke: 'black',
            strokeWidth: 4,
        });

        layer.add(arc);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.arc(100, 100, 80, 0, Math.PI / 2, false);
        context.arc(100, 100, 50, Math.PI / 2, 0, true);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth  = 4;
        context.stroke();
        compareLayerAndCanvas(layer, canvas, 10);
    });

});