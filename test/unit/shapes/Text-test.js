'use strict';

suite('Text', function(){
    // ======================================================
    test('text with empty config is allowed', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        stage.add(layer);
        var text = new Konva.Text();

        layer.add(text);
        layer.draw();
    });

    test('add text with shadows', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            width: 400,
            height: 100,
            shadowColor: 'black',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            cornerRadius: 10
        });

        var text = new Konva.Text({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            text: 'Hello World!',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#888',
            stroke: '#333',
            align: 'right',
            lineHeight: 1.2,
            width: 400,
            height: 100,
            padding: 10,
            shadowColor: 'red',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2
        });

        var group = new Konva.Group({
            draggable: true
        });

        // center text box
        rect.offset(text.getWidth() / 2, text.getHeight() / 2);
        text.offset(text.getWidth() / 2, text.getHeight() / 2);

        group.add(rect);
        group.add(text);
        layer.add(group);
        stage.add(layer);

        assert.equal(text.getClassName(),'Text', 'getClassName should be Text');
    });

    // ======================================================
    test('text getters and setters', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            text: 'Hello World!',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fontVariant: 'normal',
            fill: '#888',
            stroke: '#333',
            align: 'right',
            lineHeight: 1.2,
            width: 400,
            height: 100,
            padding: 10,
            shadowColor: 'black',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            draggable: true
        });

        // center text box
        text.offset(text.getWidth() / 2, text.getHeight() / 2);

        layer.add(text);
        stage.add(layer);

        /*
         * test getters and setters
         */

        assert.equal(text.getX(), stage.getWidth() / 2);
        assert.equal(text.getY(), stage.getHeight() / 2);
        assert.equal(text.getText(), 'Hello World!');
        assert.equal(text.getFontSize(), 50);
        assert.equal(text.getFontFamily(), 'Calibri');
        assert.equal(text.getFontStyle(), 'normal');
        assert.equal(text.getFontVariant(), 'normal');
        assert.equal(text.getFill(), '#888');
        assert.equal(text.getStroke(), '#333');
        assert.equal(text.getAlign(), 'right');
        assert.equal(text.getLineHeight(), 1.2);
        assert.equal(text.getWidth(), 400);
        assert.equal(text.getHeight(), 100);
        assert.equal(text.getPadding(), 10);
        assert.equal(text.getShadowColor(), 'black');
        assert.equal(text.getDraggable(), true);
        assert.equal(text.getWidth(), 400);
        assert.equal(text.getHeight(), 100);
        assert(text.getTextWidth() > 0, 'text width should be greater than 0');
        assert(text.getTextHeight() > 0, 'text height should be greater than 0');

        text.setX(1);
        text.setY(2);
        text.setText('bye world!');
        text.setFontSize(10);
        text.setFontFamily('Arial');
        text.setFontStyle('bold');
        text.setFontVariant('small-caps');
        text.setFill('green');
        text.setStroke('yellow');
        text.setAlign('left');
        text.setWidth(300);
        text.setHeight(75);
        text.setPadding(20);
        text.setShadowColor('green');
        text.setDraggable(false);

        assert.equal(text.getX(), 1);
        assert.equal(text.getY(), 2);
        assert.equal(text.getText(), 'bye world!');
        assert.equal(text.getFontSize(), 10);
        assert.equal(text.getFontFamily(), 'Arial');
        assert.equal(text.getFontStyle(), 'bold');
        assert.equal(text.getFontVariant(), 'small-caps');
        assert.equal(text.getFill(), 'green');
        assert.equal(text.getStroke(), 'yellow');
        assert.equal(text.getAlign(), 'left');
        assert.equal(text.getWidth(), 300);
        assert.equal(text.getHeight(), 75);
        assert.equal(text.getPadding(), 20);
        assert.equal(text.getShadowColor(), 'green');
        assert.equal(text.getDraggable(), false);

        // test set text to integer
        text.setText(5);

        //document.body.appendChild(layer.bufferCanvas.element)

        //layer.setListening(false);
        layer.drawHit();

    });

    // ======================================================
    test('reset text auto width', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            text: 'Hello World!',
            fontSize: 50,
            draggable: true,
            width: 10
        });

        assert.equal(text.width(), 10);
        text.setAttr('width', undefined);
        assert.equal(text.width() > 100, true);

        layer.add(text);
        stage.add(layer);
    });

    // ======================================================
    test('text multi line', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var rect = new Konva.Rect({
          x: 10,
          y: 10,
          width: 380,
          height: 300,
          fill: 'red'
        });

        var text = new Konva.Text({
            x: 10,
            y: 10,
            text: 'HEADING\n\nAll the world\'s a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 14,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 10,
            lineHeight: 20,
            align: 'center',
            draggable: true,
            wrap: 'WORD'
        });

        rect.height(text.getHeight());
        // center text box
        //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

        layer.add(rect).add(text);
        stage.add(layer);

        assert.equal(text.getLineHeight(), 20);
    });

    // ======================================================
    test('text multi line with shadows', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            x: 10,
            y: 10,
            //stroke: '#555',
            //strokeWidth: 5,
            text: 'HEADING\n\nAll the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            shadowColor: 'red',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5,
            draggable: true
        });

        layer.add(text);
        stage.add(layer);

        //console.log(layer.getContext().getTrace());

    });

    // ======================================================
    test('change font size should update text data', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            align: 'center',
            padding: 5,
            draggable: true
        });

        var width = text.getWidth();
        var height = text.getHeight();



        layer.add(text);
        stage.add(layer);

        text.setFontSize(30);
        layer.draw();

        //console.log(text.getHeight() + ',' + height);

        assert(text.getWidth() > width, 'width should have increased');
        assert(text.getHeight() > height, 'height should have increased');

    });
    test('get text width', function() {
        var stage = addStage();
        var layer = new Konva.Layer();
        stage.add(layer);
        var text = new Konva.Text({
            text : 'hello asd fasdf asdf asd fasdf asdfasd fa sds helloo',
            fill : 'black',
            width: 100
        });

        layer.add(text);
        layer.draw();
        assert.equal(text.getTextWidth() > 0 && text.getTextWidth() < 100, true);

    });

    test('default text color should be black', function() {
        var text = new Konva.Text();
        assert.equal(text.fill(), 'black');
    });

    test('text with stoke and strokeScaleEnabled', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            fontSize: 50,
            y : 50,
            x : 50,
            fill: 'black',
            text: 'text',
            stroke : 'red',
            strokeScaleEnabled: false,
            strokeWidth:2,
            scaleX : 2
        });
        layer.add(text);
        stage.add(layer);

        var canvas = createCanvas();
        var context = canvas.getContext('2d');
        context.translate(50, 50);
        context.lineWidth = 2;
        context.font = '50px Arial';
        context.strokeStyle = 'red';
        context.scale(2, 1);
        context.textBaseline = 'middle';
        context.fillText('text', 0, 25);
        context.strokeText('text', 0, 25);
        compareLayerAndCanvas(layer, canvas);
    });

    test('text getSelfRect', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            fontSize: 50,
            y : 50,
            x : 50,
            fill: 'black',
            text: 'text'
        });

        layer.add(text);
        stage.add(layer);

        var rect = text.getSelfRect();

        assert.deepEqual(rect, {
            x : 0,y : 0, width : text.width(), height : 50
        });
    });

    test.skip('cache text', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            fontSize: 20,
            y : 50,
            x : 50,
            fill: 'black',
            text: 'Hello world with cache!\nHow are you?',
            draggable : true
        });

        text.cache();
        layer.add(text);

        var text2 = new Konva.Text({
            fontSize: 20,
            y : 50,
            x : 260,
            fill: 'black',
            text: 'Hello world without cache!\nHow are you?',
            draggable : true
        });

        layer.add(text2);

        stage.add(layer);
    });

    test('gradient', function(){
        var stage = addStage();
        var layer = new Konva.Layer();

        var text = new Konva.Text({
            fontSize: 100,
            y : 10,
            x : 10,
            fillLinearGradientStartPoint: { x : -50, y : -50},
            fillLinearGradientEndPoint: { x : 50, y : 50},
            fillLinearGradientColorStops: [0, 'yellow', 1, 'yellow'],
            text: 'Text with gradient!!',
            draggable : true
        });
        layer.add(text);
        stage.add(layer);

        //stage.on('mousemove', function() {
        //    console.log(stage.getPointerPosition());
        //});
        var data = layer.getContext().getImageData(41, 50, 1, 1).data;
        assert.equal(data[0], 255, 'full green');
        assert.equal(data[1], 255, 'full red');
        assert.equal(data[2], 0, 'no blue');
        assert.equal(data[3], 255, '255 alpha - fully visible');
    });

});
