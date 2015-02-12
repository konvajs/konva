suite('Caching', function() {

    // CACHING SHAPE

    test('cache simple rectangle', function() {
        var stage = addStage();

        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: 100,
            y: 50,
            width: 100,
            height: 50,
            fill: 'green'
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
        compareSceneAndHit(layer);
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

        if (!window.mochaPhantomJS) {
            compareLayerAndCanvas(layer, canvas, 40);
            compareSceneAndHit(layer);
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
        compareLayerAndCanvas(layer, canvas, 10);
        compareSceneAndHit(layer);
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
            shadowBlur : 10
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
        compareSceneAndHit(layer);
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

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.translate(100, 50);
        context.rotate(Math.PI / 4);
        context.beginPath();
        context.rect(0, 0, 100, 50);
        context.closePath();
        context.fillStyle = 'green';
        context.fill();
        if (!window.mochaPhantomJS) {
            compareLayerAndCanvas(layer, canvas, 150);
            compareSceneAndHit(layer);
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


        compareLayerAndCanvas(layer, canvas, 50);
    });
});