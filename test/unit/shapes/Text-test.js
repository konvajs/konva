'use strict';

suite('Text', function() {
  // ======================================================
  test('text with empty config is allowed', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text();

    layer.add(text);
    layer.draw();
  });

  // ======================================================
  test('text with undefined text property should not throw an error', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({ text: undefined });

    layer.add(text);
    layer.draw();

    assert.equal(text.getWidth(), 0);
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

    assert.equal(text.getClassName(), 'Text', 'getClassName should be Text');
  });

  test('text with fill and shadow', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'Hello World!',
      fontSize: 50,
      fill: 'black',
      shadowColor: 'darkgrey',
      shadowOffsetX: 0,
      shadowOffsetY: 50,
      shadowBlur: 0
    });

    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.textBaseline = 'middle';
    context.font = 'normal normal 50px Arial';
    context.fillStyle = 'darkgrey';
    context.fillText('Hello World!', 10, 10 + 50 + 25);
    context.fillStyle = 'black';
    context.fillText('Hello World!', 10, 10 + 25);

    compareLayerAndCanvas(layer, canvas, 254);
  });

  test('text cache with fill and shadow', function() {
    var stage = addStage();
    var layer1 = new Konva.Layer();
    layer1.getCanvas().setPixelRatio(1);
    stage.add(layer1);

    var text1 = new Konva.Text({
      x: 10,
      y: 10,
      text: 'some text',
      fontSize: 50,
      fill: 'black',
      shadowColor: 'black',
      shadowOffsetX: 0,
      shadowOffsetY: 50,
      opacity: 1,
      shadowBlur: 10,
      draggable: true
    });
    layer1.add(text1);

    var layer2 = new Konva.Layer();
    layer2.getCanvas().setPixelRatio(1);

    layer2.add(text1.clone().cache({ pixelRatio: 2 }));
    stage.add(layer1, layer2);

    if (!window.isPhantomJS) {
      compareLayers(layer1, layer2, 220);
    }
  });

  test('text cache with fill and shadow and some scale', function() {
    var stage = addStage();
    var layer1 = new Konva.Layer();
    stage.add(layer1);

    var text1 = new Konva.Text({
      x: 10,
      y: 10,
      text: 'some text',
      fontSize: 50,
      fill: 'black',
      shadowColor: 'black',
      shadowOffsetX: 0,
      shadowOffsetY: 50,
      opacity: 1,
      shadowBlur: 10,
      draggable: true
    });
    layer1.add(text1);

    var layer2 = new Konva.Layer({
      scaleX: 0.5,
      scaleY: 0.5
    });
    stage.add(layer2);

    var group = new Konva.Group();
    layer2.add(group);

    var text2 = text1.clone();
    group.add(text2);

    text2.cache();
    group.scale({ x: 2, y: 2 });

    stage.draw();

    compareLayers(layer1, layer2, 200);
  });

  // ======================================================
  test('add text with letter spacing', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({
      text: 'hello'
    });
    layer.add(text);
    layer.draw();

    var oldWidth = text.width();
    text.letterSpacing(10);

    assert.equal(text.width(), oldWidth + 40);
    layer.draw();
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
      text:
        "HEADING\n\nAll the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
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
  test('text single line with ellipsis', function() {
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
      text:
        "HEADING\n\nAll the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Calibri',
      fontStyle: 'normal',
      fill: '#555',
      width: 100,
      padding: 0,
      lineHeight: 20,
      align: 'center',
      wrap: 'none',
      ellipsis: true
    });

    layer.add(rect).add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 3);
    assert.equal(text.textArr[2].text.slice(-1), '…');
  });

  // ======================================================
  test('text multi line with justify align', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 380,
      height: 300,
      fill: 'yellow'
    });

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text:
        "HEADING\n\n    All the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Calibri',
      fontStyle: 'normal',
      fill: '#555',
      width: 380,
      align: 'justify',
      letterSpacing: 5,
      draggable: true
    });

    rect.height(text.getHeight());
    layer.add(rect).add(text);

    stage.add(layer);

    var trace =
      'translate();fillStyle;fillText();translate();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();restore();translate();save();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();restore();translate();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
  });

  // ======================================================
  test('text multi line with justify align and decoration', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 380,
      height: 300,
      fill: 'yellow'
    });

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text:
        "HEADING\n\n    All the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Calibri',
      fontStyle: 'normal',
      fill: '#555',
      width: 380,
      align: 'justify',
      letterSpacing: 5,
      textDecoration: 'underline',
      padding: 20,
      draggable: true
    });

    rect.height(text.getHeight());

    layer.add(rect).add(text);

    stage.add(layer);

    var trace =
      'fillText();translate();fillStyle;fillText();translate();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();restore();translate();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();fillStyle;fillText();translate();restore();translate();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
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
      text:
        "HEADING\n\nAll the world's a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.",
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
  // skiping this test for now. It fails on travis. WHYYY??!?!?!
  // TODO: restore it
  test('text multi line with underline and spacing', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      fill: 'red',
      letterSpacing: 5,
      textDecoration: 'underline',
      draggable: true
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 80px Arial;textBaseline=middle;textAlign=left;translate(0,40);save();save();beginPath();moveTo(0,40);lineTo(189,40);stroke();restore();fillStyle=red;fillText(h,0,0);translate(49,0);fillStyle=red;fillText(e,0,0);translate(49,0);fillStyle=red;fillText(l,0,0);translate(23,0);fillStyle=red;fillText(l,0,0);translate(23,0);fillStyle=red;fillText(o,0,0);translate(49,0);restore();translate(0,80);save();save();beginPath();moveTo(0,40);lineTo(211,40);stroke();restore();fillStyle=red;fillText(w,0,0);translate(63,0);fillStyle=red;fillText(o,0,0);translate(49,0);fillStyle=red;fillText(r,0,0);translate(32,0);fillStyle=red;fillText(l,0,0);translate(23,0);fillStyle=red;fillText(d,0,0);translate(49,0);restore();translate(0,80);restore();';

    // console.log(layer.getContext().getTrace());
    assert.equal(layer.getContext().getTrace(), trace);
  });

  test('text multi line with strike', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      fill: 'red',
      textDecoration: 'line-through'
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect();save();transform();font;textBaseline;textAlign;translate();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();translate();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();translate();restore();';
    // console.log(layer.getContext().getTrace(true));
    // console.log(trace);
    assert.equal(layer.getContext().getTrace(true), trace);
  });

  test('text multi line with underline and strike', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      fill: 'red',
      textDecoration: 'underline line-through'
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect();save();transform();font;textBaseline;textAlign;translate();save();save();beginPath();moveTo();lineTo();stroke();restore();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();translate();save();save();beginPath();moveTo();lineTo();stroke();restore();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();translate();restore();';
    assert.equal(layer.getContext().getTrace(true), trace);
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

  test('text vertical align', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 200,
      height: 100,
      stroke: 'black'
    });
    layer.add(rect);

    var text = new Konva.Text({
      x: rect.x(),
      y: rect.y(),
      width: rect.width(),
      height: rect.height(),
      text: 'Some awesome text',
      fontSize: 16,
      fill: '#555',
      align: 'center',
      padding: 10,
      draggable: true
    });

    assert.equal(text.verticalAlign(), 'top');

    text.verticalAlign('middle');

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);beginPath();rect(0,0,200,100);closePath();lineWidth=2;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,10,10);font=normal normal 16px Arial;textBaseline=middle;textAlign=left;translate(10,0);translate(0,50);save();translate(17.523,0);fillStyle=#555;fillText(Some awesome text,0,0);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  test('get text width', function() {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var text = new Konva.Text({
      text: 'hello asd fasdf asdf asd fasdf asdfasd fa sds helloo',
      fill: 'black',
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
      y: 50,
      x: 50,
      fill: 'black',
      text: 'text',
      stroke: 'red',
      strokeScaleEnabled: false,
      strokeWidth: 2,
      scaleX: 2
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
      y: 50,
      x: 50,
      fill: 'black',
      text: 'text'
    });

    layer.add(text);
    stage.add(layer);

    var rect = text.getSelfRect();

    assert.deepEqual(rect, {
      x: 0,
      y: 0,
      width: text.width(),
      height: 50
    });
  });

  test('gradient', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 100,
      y: 10,
      x: 10,
      fillLinearGradientStartPoint: { x: -50, y: -50 },
      fillLinearGradientEndPoint: { x: 50, y: 50 },
      fillLinearGradientColorStops: [0, 'yellow', 1, 'yellow'],
      text: 'Text with gradient!!',
      draggable: true
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

  test('text should be centered in line height', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 40,
      text: 'Some good text',
      lineHeight: 3,
      draggable: true
    });
    layer.add(text);
    stage.add(layer);

    // this text should look like it is positioned in y = 40

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 40px Arial;textBaseline=middle;textAlign=left;translate(0,60);save();fillStyle=black;fillText(Some good text,0,0);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  test('check wrapping', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 40,
      text: 'Hello, this is some good text',
      width: 185,
      draggable: true
    });
    layer.add(text);
    stage.add(layer);

    var lines = text.textArr;

    // first line should fit "Hello, this"
    // I faced this issue in large app
    // we should draw as much text in one line, as possible
    // so Konva.Text + textarea editing works better
    assert.equal(lines[0].text, 'Hello, this');
  });

  test('check trip when go to new line', function() {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      text: 'Hello, this is some good text',
      fontSize: 30
    });
    layer.add(text);
    stage.add(layer);

    text.setWidth(245);

    var lines = text.textArr;

    // remove all trimming spaces
    // it also looks better in many cases
    // it will work as text in div
    assert.equal(lines[0].text, 'Hello, this is some');
    assert.equal(lines[1].text, 'good text');

    text.setWidth(261);
    var lines = text.textArr;

    assert.equal(lines[0].text, 'Hello, this is some');
    assert.equal(lines[1].text, 'good text');
    layer.draw();
  });
});
