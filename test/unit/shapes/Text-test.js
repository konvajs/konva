suite('Text', function(){
    // ======================================================
    test('add text with shadows', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
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

        var text = new Kinetic.Text({
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

        var group = new Kinetic.Group({
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
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
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
    test('text multi line', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var rect = new Kinetic.Rect({
          x: 10,
          y: 10,
          width: 380,
          height: 300,
          fill: 'red'
        });

        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'HEADING\n\nAll the world\'s a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 24,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            fill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 10,
            align: 'center',
            draggable: true,
            wrap: 'WORD'
        });

        // center text box
        //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

        layer.add(rect).add(text);
        stage.add(layer);

        assert.equal(text.getLineHeight(), 1);

         /*
         text.transitionTo({
             width: 50,
             duration: 20
         });

         rect.transitionTo({
             width: 50,
             duration: 20
         });
         */


    });

    // ======================================================
    test('text multi line with shadows', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
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
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
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
        var layer = new Kinetic.Layer();
        stage.add(layer);
        var text = new Kinetic.Text({
            text : 'hello asd fasdf asdf asd fasdf asdfasd fa sds helloo',
            fill : 'black',
            width: 100
        });

        layer.add(text);
        layer.draw();
        assert.equal(text.getTextWidth() > 0 && text.getTextWidth() < 100, true);

    });
});