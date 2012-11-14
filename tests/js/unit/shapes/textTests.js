Test.Modules.Text = {
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
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            text: 'Hello World!',
            fontSize: 50,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#888',
            textStroke: '#333',
            align: 'right',
            lineHeight: 1.2,
            width: 400,
            height: 100,
            padding: 10,
            shadow: {
                color: 'black',
                blur: 1,
                offset: [10, 10],
                opacity: 0.2
            },
            cornerRadius: 10,
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
        test(text.getStroke() === '#555', 'text box stroke should be #555');
        test(text.getStrokeWidth() === 5, 'text box stroke width should be 5');
        test(text.getFill() === '#ddd', 'text box fill should be #ddd');
        test(text.getText() === 'Hello World!', 'text should be Hello World!');
        test(text.getFontSize() == 50, 'font size should 50');
        test(text.getFontFamily() == 'Calibri', 'font family should be Calibri');
        test(text.getFontStyle() == 'normal', 'font style should be normal');
        test(text.getTextFill() == '#888', 'text fill should be #888');
        test(text.getTextStroke() == '#333', 'text fill should be #333');
        test(text.getAlign() === 'right', 'text should be aligned right');
        test(text.getLineHeight() === 1.2, 'line height should be 1.2');
        test(text.getWidth() === 400, 'width should be 400');
        test(text.getHeight() === 100, 'height should be 100');
        test(text.getPadding() === 10, 'padding should be 10');
        test(text.getShadow().color === 'black', 'text box shadow color should be black');
        test(text.getCornerRadius() === 10, 'text box corner radius should be 10');
        test(text.getDraggable() === true, 'text should be draggable');

        test(text.getWidth() === 400, 'box width should be 400');
        test(text.getHeight() === 100, 'box height should be 100');
        test(text.getTextWidth() > 0, 'text width should be greater than 0');
        test(text.getTextHeight() > 0, 'text height should be greater than 0');

        text.setX(1);
        text.setY(2);
        text.setStroke('orange');
        text.setStrokeWidth(20);
        text.setFill('red');
        text.setText('bye world!');
        text.setFontSize(10);
        text.setFontFamily('Arial');
        text.setFontStyle('bold');
        text.setTextFill('green');
        text.setTextStroke('yellow');
        text.setAlign('left');
        text.setWidth(300);
        text.setHeight(75);
        text.setPadding(20);
        text.setShadow({
            color: 'green'
        });
        text.setCornerRadius(20);
        text.setDraggable(false);

        test(text.getX() === 1, 'text box x should be 1');
        test(text.getY() === 2, 'text box y should be 2');
        test(text.getStroke() === 'orange', 'text box stroke should be orange');
        test(text.getStrokeWidth() === 20, 'text box stroke width should be 20');
        test(text.getFill() === 'red', 'text box fill should be red');
        test(text.getText() === 'bye world!', 'text should be bye world!');
        test(text.getFontSize() == 10, 'font size should 10');
        test(text.getFontFamily() == 'Arial', 'font family should be Arial');
        test(text.getFontStyle() == 'bold', 'font style should be bold');
        test(text.getTextFill() == 'green', 'text fill should be green');
        test(text.getTextStroke() == 'yellow', 'text fill should be yellow');
        test(text.getAlign() === 'left', 'text should be aligned left');
        test(text.getWidth() === 300, 'width should be 300');
        test(text.getHeight() === 75, 'height should be 75');
        test(text.getPadding() === 20, 'padding should be 20');
        test(text.getShadow().color === 'green', 'text box shadow color should be green');
        test(text.getCornerRadius() === 20, 'text box corner radius should be 20');
        test(text.getDraggable() === false, 'text draggable should be false');

        // test set text to integer
        text.setText(5);

        //document.body.appendChild(layer.bufferCanvas.element)

        //layer.setListening(false);
        layer.drawBuffer();

    },
    'test size setters and getters': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var circle = new Kinetic.Circle({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: 50,
            fill: 'red'
        });

        var ellipse = new Kinetic.Ellipse({
            x: stage.getWidth() / 2,
            y: stage.getHeight() / 2,
            radius: {
                x: 100,
                y: 50
            },
            fill: 'yellow'
        });

        layer.add(ellipse);
        layer.add(circle);
        stage.add(layer);

        // circle tests
        test(circle.attrs.width === undefined, 'circle.attrs.width should be undefined');
        test(circle.attrs.height === undefined, 'circle.attrs.height should be undefined');
        test(circle.getWidth() === 100, 'circle width should be 100');
        test(circle.getHeight() === 100, 'circle height should be 100');
        test(circle.getSize().width === 100, 'circle width should be 100');
        test(circle.getSize().height === 100, 'circle height should be 100');
        test(circle.getRadius() === 50, 'circle radius should be 50');

        circle.setWidth(200);

        test(circle.attrs.width === 200, 'circle.attrs.width should be 200');
        test(circle.attrs.height === undefined, 'circle.attrs.height should be undefined');
        test(circle.getWidth() === 200, 'circle width should be 200');
        test(circle.getHeight() === 200, 'circle height should be 200');
        test(circle.getSize().width === 200, 'circle width should be 200');
        test(circle.getSize().height === 200, 'circle height should be 200');
        test(circle.getRadius() === 100, 'circle radius should be 100');

        // ellipse tests
        test(ellipse.attrs.width === undefined, 'ellipse.attrs.width should be undefined');
        test(ellipse.attrs.height === undefined, 'ellipse.attrs.height should be undefined');
        test(ellipse.getWidth() === 200, 'ellipse width should be 200');
        test(ellipse.getHeight() === 100, 'ellipse height should be 100');
        test(ellipse.getSize().width === 200, 'ellipse width should be 200');
        test(ellipse.getSize().height === 100, 'ellipse height should be 100');
        test(ellipse.getRadius().x === 100, 'ellipse radius x should be 100');

        ellipse.setWidth(400);

        test(ellipse.attrs.width === 400, 'ellipse.attrs.width should be 400');
        test(ellipse.attrs.height === undefined, 'ellipse.attrs.height should be undefined');
        test(ellipse.getWidth() === 400, 'ellipse width should be 400');
        test(ellipse.getHeight() === 100, 'ellipse height should be 100');
        test(ellipse.getSize().width === 400, 'ellipse width should be 400');
        test(ellipse.getSize().height === 100, 'ellipse height should be 100');
        test(ellipse.getRadius().x === 200, 'ellipse radius x should be 200');

    },
    'text multi line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var text = new Kinetic.Text({
            x: 10,
            y: 10,
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            text: 'HEADING\n\nAll the world\'s a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.',
            //text: 'HEADING\n\nThis is a really cool paragraph. \n And this is a footer.',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            shadow: {
                color: 'black',
                blur: 1,
                offset: [10, 10],
                opacity: 0.2
            },
            cornerRadius: 10,
            draggable: true,
            detectionType: 'path'
        });

        // center text box
        //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

        layer.add(text);
        stage.add(layer);

        /*
         text.transitionTo({
         width: 500,
         duration: 10
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
            textFill: '#555',
            //width: 20,
            width: 380,
            //width: 200,
            padding: 20,
            align: 'center',
            shadow: {
                color: 'red',
                blur: 1,
                offset: [10, 10],
                opacity: 0.5
            },
            cornerRadius: 10,
            draggable: true,
            detectionType: 'path'
        });

        layer.add(text);
        stage.add(layer);

        //console.log(layer.toDataURL());

        warn(layer.toDataURL() === dataUrls['multi line text with shadows'], 'multi line text with shadows data url is incorrect');
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
            fill: '#ddd',
            text: 'Some awesome text',
            fontSize: 16,
            fontFamily: 'Calibri',
            fontStyle: 'normal',
            textFill: '#555',
            align: 'center',
            padding: 5,
            draggable: true,
            detectionType: 'path'
        });

        var width = text.getWidth();
        var height = text.getHeight();

        layer.add(text);
        stage.add(layer);

        text.setFontSize(30);
        layer.draw();

        test(text.getWidth() > width, 'text box width should have increased.');
        test(text.getHeight() > height, 'text box height should have increased.');

    }
};
