Test.Modules.Text = {
    'add text with shadows': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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
        rect.setOffset(text.getWidth() / 2, text.getHeight() / 2);
        text.setOffset(text.getWidth() / 2, text.getHeight() / 2);

        group.add(rect);
        group.add(text);
        layer.add(group);
        stage.add(layer);
        
        test(text.getClassName() === 'Text', 'getClassName should be Text');
    },
    'text getters and setters': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

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
            shadowColor: 'black',
            shadowBlur: 1,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            draggable: true
        });

        // center text box
        text.setOffset(text.getWidth() / 2, text.getHeight() / 2);

        layer.add(text);
        stage.add(layer);

        /*
         * test getters and setters
         */

        test(text.getX() === stage.getWidth() / 2, 'text box x should be in center of stage');
        test(text.getY() === stage.getHeight() / 2, 'text box y should be in center of stage');

        test(text.getText() === 'Hello World!', 'text should be Hello World!');
        test(text.getFontSize() == 50, 'font size should 50');
        test(text.getFontFamily() == 'Calibri', 'font family should be Calibri');
        test(text.getFontStyle() == 'normal', 'font style should be normal');
        test(text.getFill() == '#888', 'text fill should be #888');
        test(text.getStroke() == '#333', 'text fill should be #333');
        test(text.getAlign() === 'right', 'text should be aligned right');
        test(text.getLineHeight() === 1.2, 'line height should be 1.2');
        test(text.getWidth() === 400, 'width should be 400');
        test(text.getHeight() === 100, 'height should be 100');
        test(text.getPadding() === 10, 'padding should be 10');
        test(text.getShadowColor() === 'black', 'text box shadow color should be black');
        test(text.getDraggable() === true, 'text should be draggable');

        test(text.getWidth() === 400, 'box width should be 400');
        test(text.getHeight() === 100, 'box height should be 100');
        test(text.getTextWidth() > 0, 'text width should be greater than 0');
        test(text.getTextHeight() > 0, 'text height should be greater than 0');

        text.setX(1);
        text.setY(2);
        text.setText('bye world!');
        text.setFontSize(10);
        text.setFontFamily('Arial');
        text.setFontStyle('bold');
        text.setFill('green');
        text.setStroke('yellow');
        text.setAlign('left');
        text.setWidth(300);
        text.setHeight(75);
        text.setPadding(20);
        text.setShadowColor('green');
        text.setDraggable(false);

        test(text.getX() === 1, 'text box x should be 1');
        test(text.getY() === 2, 'text box y should be 2');
        test(text.getText() === 'bye world!', 'text should be bye world!');
        test(text.getFontSize() == 10, 'font size should 10');
        test(text.getFontFamily() == 'Arial', 'font family should be Arial');
        test(text.getFontStyle() == 'bold', 'font style should be bold');
        test(text.getFill() == 'green', 'text fill should be green');
        test(text.getStroke() == 'yellow', 'text fill should be yellow');
        test(text.getAlign() === 'left', 'text should be aligned left');
        test(text.getWidth() === 300, 'width should be 300');
        test(text.getHeight() === 75, 'height should be 75');
        test(text.getPadding() === 20, 'padding should be 20');
        test(text.getShadowColor() === 'green', 'text box shadow color should be green');
        test(text.getDraggable() === false, 'text draggable should be false');

        // test set text to integer
        text.setText(5);

        //document.body.appendChild(layer.bufferCanvas.element)

        //layer.setListening(false);
        layer.drawHit();

    },
    'text multi line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(text.getLineHeight() === 1, 'text line height should be defaulted to 1');

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
         
         
    },
    'text multi line with shadows': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        //console.log(layer.toDataURL());

        testDataUrl(layer.toDataURL(),'multiline text with shadows', 'multi line text with shadows data url is incorrect');
    },
    'change font size should update text data': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        test(text.getWidth() > width, 'text box width should have increased.');
        test(text.getHeight() > height, 'text box height should have increased.');

    },
    'text everything enabled': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            fillEnabled: true,
            strokeEnabled: true,
            shadowEnabled: true
        });
        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());
        testDataUrl(layer.toDataURL(), 'text everything enabled', 'should be text with blue fill and red stroke');
    },
    'text fill disabled': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            fillEnabled: false,
            strokeEnabled: true,
            shadowEnabled: true
        });
        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());
        testDataUrl(layer.toDataURL(), 'text fill disabled', 'should be text with no fill and red stroke');
    },
    'text stroke disabled': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            text: 'Some awesome text',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'bold',
            fill: 'blue',
            stroke: 'red',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            fillEnabled: true,
            strokeEnabled: false,
            shadowEnabled: true
        });
        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());
        testDataUrl(layer.toDataURL(),'text stroke disabled', 'should be text with blue fill and no stroke');
    },
    'wrapped text': function (containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var txt = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            arr = [txt, txt];

        var layer = new Kinetic.Layer();
        var text = new Kinetic.Text({
            x: 0,
            y: 0,
            width: 578,
            text: arr.join(''),
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: '#000',
            wrap: 'word'
        });

        layer.add(text);
        stage.add(layer);

        testDataUrl(layer.toDataURL(),'wrapping to words', 'text should be wrapped to words');

        text.setWrap('none');
        layer.draw();
        testDataUrl(layer.toDataURL(),'no wrapping', 'text should not be wrapped');

        text.setWrap('char');
        layer.draw();
        testDataUrl(layer.toDataURL(), 'wrapping to chars', 'text should be wrapped to chars');

    }
};
