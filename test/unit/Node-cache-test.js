suite('Caching', function() {
    this.timeout(5000);
    // CACHING SHAPE

    test('cache simple rectangle', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            draggable : true
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();

        compareLayerAndCanvas(layer, canvas, 10);
        cloneAndCompareLayer(layer);

    });

    test('cache simple rectangle with transform', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            rotation : 45,
            scaleY : 2,
            fill: 'green'
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.translate(100, 50);
        context.rotate(Math.PI / 4);
        context.beginPath();
        context.rect(0, 0, 100, 100);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();

        if (!window.isPhantomJS) {
            compareLayerAndCanvas(layer, canvas, 200);
            cloneAndCompareLayer(layer, 150);
        }

    });

    test('cache rectangle with fill and stroke', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            stroke : 'black',
            strokeWidth : 20
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth  = 20;
        context.stroke();
        compareLayerAndCanvas(layer, canvas, 50);
        cloneAndCompareLayer(layer, 50);
    });


    test.skip('cache rectangle with fill and opacity', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            opacity : 0.5
        });
        rect.cache();
        rect.opacity(0.3);

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.globalAlpha = 0.3;
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();
        compareLayerAndCanvas(layer, canvas, 5);
    });

    test('cache rectangle with fill, stroke opacity', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            opacity : 0.5,
            stroke : 'black',
            strokeWidth : 10
        });
        rect.cache();
        rect.opacity(0.3);

        layer.add(rect);
        stage.add(layer);

        cloneAndCompareLayer(layer, 100);
    });

    test.skip('cache rectangle with fill, shadow and opacity', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            opacity : 0.5,
            shadowBlur : 10,
            shadowColor : 'black'
        });
        rect.cache();
        rect.opacity(0.3);

        layer.add(rect);
        stage.add(layer);

        if (!window.isPhantomJS) {
            cloneAndCompareLayer(layer, 10);
        }
    });

    test('cache rectangle with fill and simple shadow', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green',
            shadowColor : 'black',
            shadowBlur : 10,
            draggable : true
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.fill();

        showCanvas(rect._cache.canvas.scene._canvas);
        showCanvas(rect._cache.canvas.hit._canvas);
        showHit(layer);
        compareLayerAndCanvas(layer, canvas, 10);
    });

    test('cache rectangle with fill and shadow with offset', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 50,
            height: 25,
            fill: 'green',
            shadowOffsetX : 10,
            shadowOffsetY : 10,
            shadowColor : 'black',
            shadowBlur : 10
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        context.translate(100, 50);
        context.beginPath();
        context.rect(0, 0, 50, 25);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.shadowOffsetX = 10;
        context.shadowOffsetY = 10;
        context.fill();
        compareLayerAndCanvas(layer, canvas, 50);
    });

    test('cache rectangle with fill and shadow with negative offset', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 50,
            height: 25,
            fill: 'green',
            shadowOffsetX : -10,
            shadowOffsetY : -10,
            shadowColor : 'black',
            shadowBlur : 10
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        context.translate(100, 50);
        context.beginPath();
        context.rect(0, 0, 50, 25);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.shadowOffsetX = -10;
        context.shadowOffsetY = -10;
        context.fill();
        compareLayerAndCanvas(layer, canvas, 50);
    });

    test('cache rectangle with fill and shadow and some transform', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 50,
            height: 25,
            fill: 'green',
            shadowOffsetX : -10,
            shadowOffsetY : -10,
            shadowColor : 'black',
            shadowBlur : 10,
            offsetX : 50,
            offsetY : 25
        });
        rect.cache();

        layer.add(rect);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        context.translate(50, 25);
        context.beginPath();
        context.rect(0, 0, 50, 25);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.shadowOffsetX = -10;
        context.shadowOffsetY = -10;
        context.fill();
        compareLayerAndCanvas(layer, canvas, 50);
    });


    // CACHING CONTAINERS
    test('cache group with simple rectangle', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var group = new Konva.Group({
            x: 100,
            y: 50
        });

        var rect = new Konva.Rect({
            width: 100,
            height: 50,
            fill: 'green'
        });
        group.add(rect);
        group.cache();

        layer.add(group);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();
        compareLayerAndCanvas(layer, canvas, 10);
        cloneAndCompareLayer(layer);
    });

    test('cache group with simple rectangle with transform', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var group = new Konva.Group({
            x: 50,
            y: 25
        });

        var rect = new Konva.Rect({
            x : 50,
            y : 25,
            width: 100,
            height: 50,
            fill: 'green',
            rotation : 45
        });
        group.add(rect);
        group.cache();

        layer.add(group);
        stage.add(layer);
        if (!window.isPhantomJS) {
            cloneAndCompareLayer(layer, 200);
        }
    });

    test('cache group with several shape with transform', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var group = new Konva.Group({
            x: 50,
            y: 25
        });

        var rect = new Konva.Rect({
            x : 50,
            y : 25,
            width: 100,
            height: 50,
            fill: 'green',
            shadowOffsetX : 10,
            shadowOffsetY : 10,
            shadowBlur : 10
        });
        group.add(rect);

        var circle = new Konva.Circle({
            x : 250,
            y : 50,
            radius : 25,
            fill: 'red',
            // rotation on circle should not have any effects
            rotation : 45,
            stroke : 2,
            scaleX : 2,
            scaleY : 2
        });
        group.add(circle);

        group.cache();

        layer.add(group);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        // draw rect
        context.save();
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.shadowOffsetX = 10;
        context.shadowOffsetY = 10;
        context.fill();
        context.restore();

        // circle
        context.save();
        context.beginPath();
        context.arc(300, 75, 50, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = 'red';
        context.lineWidth = 4;
        context.fill();
        context.stroke();
        context.restore();


        compareLayerAndCanvas(layer, canvas, 150);

        // recache
        group.cache();
        layer.draw();
        compareLayerAndCanvas(layer, canvas, 150);
    });

    test('cache group with rectangle and text', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var button = new Konva.Group({
            width: 100,
            height: 50,
            draggable: true
        });

        var face = new Konva.Rect({
            fill: 'red',
            x: 0, y: 0,
            width: 100,
            height: 50
        });

        var text = new Konva.Text({
            text: 'Wrong button',
            x: 15,
            y: 20
        });

        button.add(face);
        button.add(text);

        button.cache();

        layer.add(button);
        stage.add(layer);

        cloneAndCompareLayer(layer, 100);
    });

    test('cache layer with several shape with transform', function() {
        var stage = addStage();

        var layer = new Konva.Layer({
            draggable : true
        });

        var group = new Konva.Group({
            x: 50,
            y: 25
        });

        var rect = new Konva.Rect({
            x : 50,
            y : 25,
            width: 100,
            height: 50,
            fill: 'green',
            shadowOffsetX : 10,
            shadowOffsetY : 10,
            shadowBlur : 10
        });
        group.add(rect);

        var circle = new Konva.Circle({
            x : 250,
            y : 50,
            radius : 25,
            fill: 'red',
            // rotation on circle should not have any effects
            rotation : 45,
            stroke : 2,
            scaleX : 2,
            scaleY : 2
        });
        group.add(circle);

        group.cache();

        layer.add(group);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        // draw rect
        context.save();
        context.beginPath();
        context.rect(100, 50, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.shadowColor = 'black';
        context.shadowBlur = 10;
        context.shadowOffsetX = 10;
        context.shadowOffsetY = 10;
        context.fill();
        context.restore();

        // circle
        context.save();
        context.beginPath();
        context.arc(300, 75, 50, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = 'red';
        context.lineWidth = 4;
        context.fill();
        context.stroke();
        context.restore();


        compareLayerAndCanvas(layer, canvas, 150);

        // recache
        group.cache();
        layer.draw();
        compareLayerAndCanvas(layer, canvas, 150);
    });

    test('cache shape that is larger than stage', function(){
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();
        var circle = new Konva.Circle({
            x: 74,
            y: 74,
            radius: 300,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 4,
            scaleX : 1 /2,
            scaleY : 1 / 2
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);

        assert.equal(circle._cache.canvas, undefined);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        // circle
        context.save();
        context.beginPath();
        context.arc(74, 74, 150, 0, Math.PI * 2);
        context.closePath();
        context.fillStyle = 'red';
        context.lineWidth = 2;
        context.fill();
        context.stroke();
        context.restore();


        compareLayerAndCanvas(layer, canvas, 150);
    });

    test('cache shape that is larger than stage but need buffer canvas', function(){
        var stage = addStage();
        var layer = new Konva.Layer();
        var group = new Konva.Group();
        var circle = new Konva.Circle({
            x: stage.width() / 2,
            y: stage.height() / 2,
            radius: 400,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 50,
            opacity : 0.5,
            scaleX : 1 / 5,
            scaleY : 1 / 5
        });

        group.add(circle);
        layer.add(group);
        stage.add(layer);
        circle.cache();
        layer.draw();

        cloneAndCompareLayer(layer, 200);
    });

    test('cache nested groups', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var groupOuter = new Konva.Group({
            x: 50,
            y: 10
        });

        var groupInner = new Konva.Group({
            x: 10,
            y: 10,
            draggable : true
        });
        var rect = new Konva.Rect({
            width: 50,
            height: 50,
            stroke: 'grey',
            strokeWidth: 3,
            fill: 'yellow'
        });

        var text = new Konva.Text({
            x: 18,
            y: 15,
            text: 'A',
            fill: 'black',
            fontSize: 24
        });

        groupInner.add(rect);
        groupInner.add(text);

        groupOuter.add(groupInner);

        layer.add(groupOuter);
        stage.add(layer);

        groupInner.cache();

        layer.draw();
        cloneAndCompareLayer(layer, 150);

        groupInner.clearCache();
        groupOuter.cache();
        layer.draw();
        cloneAndCompareLayer(layer, 150);

        groupOuter.clearCache();
        groupInner.clearCache();
        rect.cache();
        layer.draw();
        cloneAndCompareLayer(layer, 150);
    });

    test('test group with circle + buffer canvas usage', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        stage.add(layer);

        var group = new Konva.Group({
            x: 100,
            y: 100,
            draggable: true
        });
        layer.add(group);

        var circle = new Konva.Circle({
            radius: 10,
            // fill: 'white',
            fillRadialGradientStartPoint: 0,
            fillRadialGradientStartRadius: 0,
            fillRadialGradientEndPoint: 0,
            fillRadialGradientEndRadius: 10,
            fillRadialGradientColorStops: [0, 'red', 0.5, 'yellow', 1, 'blue'],
            opacity: 0.4,
            strokeHitEnabled: false,
            stroke: 'rgba(0,0,0,0)'
        });
        group.add(circle);
        group.cache();
        stage.draw();

        cloneAndCompareLayer(layer, 150);
    });
});
