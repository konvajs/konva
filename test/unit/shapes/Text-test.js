'use strict';

suite('Text', function () {
  // ======================================================
  test('text with empty config is allowed', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text();

    layer.add(text);
    layer.draw();

    var trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  // ======================================================
  // TODO: what is the best UX here?
  test('check text with FALSY values', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text();

    layer.add(text);
    layer.draw();

    text.text(0);
    assert.equal(text.text(), '0');

    text.text(true);
    assert.equal(text.text(), 'true');

    text.text(false);
    assert.equal(text.text(), 'false');

    text.setText(undefined);
    assert.equal(text.text(), '');
  });

  // ======================================================
  test('text with undefined text property should not throw an error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({ text: undefined });

    layer.add(text);
    layer.draw();

    assert.equal(text.getWidth(), 0);
  });

  test('add text with shadows', function () {
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
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.2,
      cornerRadius: 10,
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
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.2,
    });

    var group = new Konva.Group({
      draggable: true,
    });

    // center text box
    rect.offsetX(text.getWidth() / 2, text.getHeight() / 2);

    group.add(rect);
    group.add(text);
    layer.add(group);
    stage.add(layer);

    assert.equal(text.getClassName(), 'Text', 'getClassName should be Text');
  });

  test('text with fill and shadow', function () {
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
      shadowBlur: 0,
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

  test('check emoji with letterSpacing', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: '😬',
      fontSize: 50,
      letterSpacing: 1,
    });

    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.textBaseline = 'middle';
    context.font = 'normal normal 50px Arial';
    context.fillStyle = 'darkgrey';
    context.fillText('😬', 10, 10 + 25);

    compareLayerAndCanvas(layer, canvas, 254);
  });

  test('text cache with fill and shadow', function () {
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
      draggable: true,
    });
    layer1.add(text1);

    var layer2 = new Konva.Layer();
    layer2.getCanvas().setPixelRatio(1);

    layer2.add(text1.clone().cache({ pixelRatio: 2 }));
    stage.add(layer1, layer2);

    compareLayers(layer1, layer2, 220);
  });

  test('text cache with fill and shadow and some scale', function () {
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
      draggable: true,
    });
    layer1.add(text1);

    var layer2 = new Konva.Layer({
      scaleX: 0.5,
      scaleY: 0.5,
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
  test('add text with letter spacing', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({
      text: 'hello',
    });
    layer.add(text);
    layer.draw();

    var oldWidth = text.width();
    text.letterSpacing(10);

    assert.equal(text.width(), oldWidth + 40);
    layer.draw();
  });
  // ======================================================
  test('text getters and setters', function () {
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
      shadowOffset: { X: 10, y: 10 },
      shadowOpacity: 0.2,
      draggable: true,
    });

    // center text box
    text.offsetX(text.getWidth() / 2, text.getHeight() / 2);

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
    assert(text.fontSize() > 0, 'text height should be greater than 0');

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
  test('reset text auto width', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      text: 'Hello World!',
      fontSize: 50,
      draggable: true,
      width: 10,
    });

    assert.equal(text.width(), 10);
    text.setAttr('width', undefined);
    assert.equal(text.width() > 100, true);

    layer.add(text);
    stage.add(layer);
  });

  // ======================================================
  test('text multi line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 380,
      height: 300,
      fill: 'red',
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
      wrap: 'WORD',
    });

    rect.height(text.getHeight());
    // center text box
    //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

    layer.add(rect).add(text);
    stage.add(layer);

    assert.equal(text.getLineHeight(), 20);
  });

  // ======================================================
  test('text single line with ellipsis', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 380,
      height: 300,
      fill: 'red',
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
      ellipsis: true,
    });

    layer.add(rect).add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 3);
    assert.equal(text.textArr[2].text.slice(-1), '…');
  });

  // ======================================================
  test('multiline with ellipsis', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text:
        "HEADING\n\nAll the world's a stage, merely players. They have theirrrrrrr exits and theirrrrr entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Calibri',
      fontStyle: 'normal',
      width: 100,
      padding: 0,
      align: 'center',
      height: 100,
      ellipsis: true,
    });

    layer.add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 7);
    assert.equal(text.textArr[6].text.slice(-1), '…');

    var trace =
      "clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 14px Calibri;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(HEADING,18.117,7);restore();save();fillStyle=black;fillText(,50,21);restore();save();fillStyle=black;fillText(All the world's,8.687,35);restore();save();fillStyle=black;fillText(a stage, merely,7.826,49);restore();save();fillStyle=black;fillText(players. They,11.903,63);restore();save();fillStyle=black;fillText(have theirrrrrrr,8.222,77);restore();save();fillStyle=black;fillText(exits and…,17.922,91);restore();restore();";

    console.log(layer.getContext().getTrace());
    assert.equal(layer.getContext().getTrace(), trace);
  });

  // ======================================================
  test('make sure we respect false for ellipsis', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'Hello foo bar',
      wrap: 'word',
      ellipsis: false,
      width: 60,
      height: 20,
    });

    layer.add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 1);
    assert.equal(text.textArr[0].text, 'Hello foo');
  });

  // ======================================================
  test('wrap none check', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'Hello foo bar',
      wrap: 'none',
      ellipsis: false,
      width: 60,
      height: 20,
    });

    layer.add(
      new Konva.Rect({
        ...text.getClientRect(),
        fill: 'rgba(0, 0, 0, 0.4)',
      })
    );

    layer.add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 1);
    assert.equal(text.textArr[0].text, 'Hello foo b');

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);beginPath();rect(0,0,60,20);closePath();fillStyle=rgba(0, 0, 0, 0.4);fill();restore();save();transform(1,0,0,1,10,10);font=normal normal 12px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(Hello foo b,0,6);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  // ======================================================
  test('text multi line with justify align', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 380,
      height: 300,
      fill: 'yellow',
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
      draggable: true,
    });

    rect.height(text.getHeight());
    layer.add(rect).add(text);

    stage.add(layer);

    var trace =
      'fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
  });

  // ======================================================
  test('text multi line with justify align and decoration', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 380,
      height: 300,
      fill: 'yellow',
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
      draggable: true,
    });

    rect.height(text.getHeight());

    layer.add(rect).add(text);

    stage.add(layer);

    var trace =
      'fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
  });

  // ======================================================
  test('text multi line with shadows', function () {
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
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.5,
      draggable: true,
    });

    layer.add(text);
    stage.add(layer);

    assert.equal(
      layer.getContext().getTrace(),
      "clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);shadowColor=rgba(255,0,0,0.5);shadowBlur=1;shadowOffsetX=10;shadowOffsetY=10;font=normal normal 16px Calibri;textBaseline=middle;textAlign=left;translate(20,20);save();fillStyle=#555;fillText(HEADING,133.563,8);restore();save();fillStyle=#555;fillText(,170,24);restore();save();fillStyle=#555;fillText(All the world's a stage, and all the men and women,6.602,40);restore();save();fillStyle=#555;fillText(merely players. They have their exits and their,21.168,56);restore();save();fillStyle=#555;fillText(entrances; And one man in his time plays many,18.035,72);restore();save();fillStyle=#555;fillText(parts.,152.449,88);restore();restore();"
    );
  });

  // ======================================================
  test('text multi line with underline and spacing', function () {
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
      draggable: true,
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 80px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();save();beginPath();moveTo(0,80);lineTo(189,80);stroke();restore();fillStyle=red;fillText(h,0,40);fillStyle=red;fillText(e,49.492,40);fillStyle=red;fillText(l,98.984,40);fillStyle=red;fillText(l,121.758,40);fillStyle=red;fillText(o,144.531,40);restore();save();save();beginPath();moveTo(0,160);lineTo(211,160);stroke();restore();fillStyle=red;fillText(w,0,120);fillStyle=red;fillText(o,62.773,120);fillStyle=red;fillText(r,112.266,120);fillStyle=red;fillText(l,143.906,120);fillStyle=red;fillText(d,166.68,120);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  // ======================================================
  test('test text with crazy font families', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var text = new Konva.Text({
      text: 'hello',
      fontFamily: 'Arial',
    });
    layer.add(text);
    layer.draw();

    text.fontFamily('Font Awesome');
    layer.draw();
    text.fontFamily('Font Awesome, Arial');
    layer.draw();
    text.fontFamily('"Font Awesome", Arial');
    layer.draw();

    var trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 12px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(hello,0,6);restore();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 12px "Font Awesome";textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(hello,0,6);restore();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 12px "Font Awesome", Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(hello,0,6);restore();restore();clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 12px "Font Awesome", Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(hello,0,6);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  // ======================================================
  test('text with underline and large line height', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontFamily: 'Arial',
      text: 'text',
      fontSize: 80,
      lineHeight: 2,
      textDecoration: 'underline',
    });

    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.translate(0, 80);
    context.lineWidth = 2;
    context.font = '80px Arial';
    context.textBaseline = 'middle';
    context.fillText('text', 0, 0);
    context.beginPath();
    context.moveTo(0, 40);
    context.lineTo(text.width(), 40);
    context.lineWidth = 80 / 15;
    context.stroke();
    compareLayerAndCanvas(layer, canvas, 50);
  });

  test('text multi line with strike', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      fill: 'red',
      textDecoration: 'line-through',
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect();save();transform();font;textBaseline;textAlign;translate();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();restore();';
    assert.equal(layer.getContext().getTrace(true), trace);
  });

  test('text multi line with underline and strike', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      fill: 'red',
      textDecoration: 'underline line-through',
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect();save();transform();font;textBaseline;textAlign;translate();save();save();beginPath();moveTo();lineTo();stroke();restore();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();save();save();beginPath();moveTo();lineTo();stroke();restore();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();restore();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
  });

  // ======================================================
  test('change font size should update text data', function () {
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
      draggable: true,
    });

    var width = text.getWidth();
    var height = text.getHeight();

    layer.add(text);
    stage.add(layer);

    text.setFontSize(30);
    layer.draw();

    assert(text.getWidth() > width, 'width should have increased');
    assert(text.getHeight() > height, 'height should have increased');
  });

  test('text vertical align', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 200,
      height: 100,
      stroke: 'black',
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
      draggable: true,
    });

    assert.equal(text.verticalAlign(), 'top');

    text.verticalAlign('middle');

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);beginPath();rect(0,0,200,100);closePath();lineWidth=2;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,10,10);font=normal normal 16px Arial;textBaseline=middle;textAlign=left;translate(10,42);save();fillStyle=#555;fillText(Some awesome text,17.523,8);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  test('get text width', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var text = new Konva.Text({
      text: 'hello asd fasdf asdf asd fasdf asdfasd fa sds helloo',
      fill: 'black',
      width: 100,
    });

    layer.add(text);
    layer.draw();
    assert.equal(text.getTextWidth() > 0 && text.getTextWidth() < 100, true);
  });

  test('get text width of long text with spacing (check it visually!)', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();
    stage.add(layer);

    var textProps = {
      x: 10,
      y: 10,
      fontSize: 19,
      text:
        'very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text.',
      draggable: true,
    };

    var text1 = new Konva.Text(textProps);
    layer.add(text1);
    var box1 = new Konva.Rect(
      Object.assign(text1.getClientRect(), { stroke: 'black' })
    );
    layer.add(box1);

    // demo2
    var text2 = new Konva.Text(
      Object.assign(textProps, { letterSpacing: 4, y: 50 })
    );
    layer.add(text2);
    var box2 = new Konva.Rect(
      Object.assign(text2.getClientRect(), { stroke: 'black' })
    );
    layer.add(box2);

    // demo3

    var text3 = new Konva.Text(
      Object.assign(textProps, {
        text:
          'gregrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg4g4g4',
        letterSpacing: 4,
        fontSize: 20,
        y: 100,
      })
    );
    layer.add(text3);
    var box3 = new Konva.Rect(
      Object.assign(text3.getClientRect(), { stroke: 'black' })
    );
    layer.add(box3);

    // demo4
    var text4 = new Konva.Text(
      Object.assign(textProps, {
        text:
          'gregrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg4g4g4',
        letterSpacing: 4,
        fontSize: 19,
        y: 150,
      })
    );
    layer.add(text4);
    var box4 = new Konva.Rect(
      Object.assign(text4.getClientRect(), { stroke: 'black' })
    );
    layer.add(box4);

    layer.draw();

    assert.almostEqual(text1.width(), 1724.50048828125);
    assert.almostEqual(text2.width(), 2612.50048828125);
    assert.almostEqual(text3.width(), 2005.376953125);
    assert.almostEqual(text4.width(), 1932.30810546875);
  });

  test('default text color should be black', function () {
    var text = new Konva.Text();
    assert.equal(text.fill(), 'black');
  });

  test('text with stoke and strokeScaleEnabled', function () {
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
      scaleX: 2,
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

  test('text getSelfRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 50,
      y: 50,
      x: 50,
      fill: 'black',
      text: 'text',
    });

    layer.add(text);
    stage.add(layer);

    var rect = text.getSelfRect();

    assert.deepEqual(rect, {
      x: 0,
      y: 0,
      width: text.width(),
      height: 50,
    });
  });

  test('linear gradient', function () {
    // Konva.pixelRatio = 1;
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 50,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 300, y: 0 },
      fillLinearGradientColorStops: [0, 'black', 1, 'red'],
      text: 'Text with gradient!!',
      draggable: true,
    });
    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.font = 'normal 50px Arial';
    ctx.textBaseline = 'middle';

    var start = { x: 0, y: 0 };
    var end = { x: 300, y: 0 };
    var colorStops = [0, 'black', 1, 'red'];
    var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);

    // build color stops
    for (var n = 0; n < colorStops.length; n += 2) {
      grd.addColorStop(colorStops[n], colorStops[n + 1]);
    }
    ctx.fillStyle = grd;

    ctx.fillText(text.text(), text.x(), text.y() + text.fontSize() / 2);

    compareLayerAndCanvas(layer, canvas, 200);
  });

  test('linear gradient multiline', function () {
    Konva.pixelRatio = 1;
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 50,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 100 },
      fillLinearGradientColorStops: [0, 'yellow', 1, 'red'],
      text: 'Text with gradient!!\nText with gradient!!',
      draggable: true,
    });
    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.font = 'normal 50px Arial';
    ctx.textBaseline = 'middle';

    var start = { x: 0, y: 0 };
    var end = { x: 0, y: 100 };
    var colorStops = [0, 'yellow', 1, 'red'];
    var grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);

    // build color stops
    for (var n = 0; n < colorStops.length; n += 2) {
      grd.addColorStop(colorStops[n], colorStops[n + 1]);
    }
    ctx.fillStyle = grd;

    ctx.fillText(
      'Text with gradient!!',
      text.x(),
      text.y() + text.fontSize() / 2
    );
    ctx.fillText(
      'Text with gradient!!',
      text.x(),
      text.y() + text.fontSize() / 2 + text.fontSize()
    );

    compareLayerAndCanvas(layer, canvas, 200);

    var data = layer.getContext().getImageData(25, 41, 1, 1).data;
    delete Konva.pixelRatio;
  });

  test('radial gradient', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 50,
      y: 0,
      x: 0,
      fillRadialGradientStartPoint: { x: 100, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: 100,
      fillRadialGradientEndPoint: { x: 100, y: 0 },
      fillRadialGradientColorStops: [0, 'yellow', 1, 'red'],
      text: 'Text with gradient!!',
      draggable: true,
    });
    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.font = 'normal 50px Arial';
    ctx.textBaseline = 'middle';

    var start = { x: 100, y: 0 };
    var end = { x: 100, y: 0 };
    var colorStops = [0, 'yellow', 1, 'red'];
    var grd = ctx.createRadialGradient(start.x, start.y, 0, end.x, end.y, 100);

    // build color stops
    for (var n = 0; n < colorStops.length; n += 2) {
      grd.addColorStop(colorStops[n], colorStops[n + 1]);
    }
    ctx.fillStyle = grd;

    ctx.translate(0, 25);

    ctx.fillText(text.text(), 0, 0);

    compareLayerAndCanvas(layer, canvas, 200);
  });

  test('text should be centered in line height', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    layer.add(
      new Konva.Rect({
        stroke: 'black',
        width: 100,
        height: 40 * 3,
      })
    );

    var text = new Konva.Text({
      fontSize: 40,
      text: 'Some good text',
      lineHeight: 3,
      draggable: true,
    });
    layer.add(text);
    stage.add(layer);

    // this text should look like it is positioned in y = 40

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();rect(0,0,100,120);closePath();lineWidth=2;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,0,0);font=normal normal 40px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(Some good text,0,60);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  test('check wrapping', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      fontSize: 40,
      text: 'Hello, this is some good text',
      width: 185,
      draggable: true,
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

  test('check trip when go to new line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      text: 'Hello, this is some good text',
      fontSize: 30,
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

  test.skip('we should be able to clip underline by group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var group = new Konva.Group({
      clipX: 10,
      clipY: 10,
      clipWidth: 100,
      clipHeight: 27,
    });
    layer.add(group);

    var text = new Konva.Text({
      x: 10,
      y: 10,
      width: 100,
      text: 'Hello World',
      textDecoration: ['underline'],
      fontSize: 40,
    });
    group.add(text);

    layer.draw();

    console.log(layer.getContext().getTrace());

    // assert.equal(layer.getContext().getTrace(), trace);
    throw 1;
  });

  test('image gradient for text', function (done) {
    Konva.pixelRatio = 1;
    var imageObj = new Image();
    imageObj.onload = function () {
      var stage = addStage();
      var layer = new Konva.Layer();

      var text = new Konva.Text({
        text: 'Hello, this is some good text',
        fontSize: 30,
        fillPatternImage: imageObj,
      });
      layer.add(text);
      stage.add(layer);

      var canvas = createCanvas();
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = 'green';
      ctx.font = 'normal normal 30px Arial';
      ctx.textBaseline = 'middle';

      var grd = ctx.createPattern(imageObj, 'repeat');
      ctx.fillStyle = grd;

      ctx.fillText(text.text(), 0, 15);

      compareLayerAndCanvas(layer, canvas, 200);
      delete Konva.pixelRatio;
      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });

  test('image gradient for text with scale', function (done) {
    Konva.pixelRatio = 1;
    var imageObj = new Image();
    imageObj.onload = function () {
      var stage = addStage();
      var layer = new Konva.Layer();

      var text = new Konva.Text({
        text: 'Hello, this is some good text',
        fontSize: 30,
        fillPatternImage: imageObj,
        fillPatternScaleX: 0.5,
        fillPatternScaleY: 0.5,
      });
      layer.add(text);
      stage.add(layer);

      var canvas = createCanvas();
      var ctx = canvas.getContext('2d');

      ctx.fillStyle = 'green';
      ctx.font = 'normal normal 30px Arial';
      ctx.textBaseline = 'middle';

      var grd = ctx.createPattern(imageObj, 'repeat');
      grd.setTransform({
        a: 0.5, // Horizontal scaling. A value of 1 results in no scaling.
        b: 0, // Vertical skewing.
        c: 0, // Horizontal skewing.
        d: 0.5, // Vertical scaling. A value of 1 results in no scaling.
        e: 0, // Horizontal translation (moving).
        f: 0, // Vertical translation (moving).
      });
      ctx.fillStyle = grd;

      ctx.fillText(text.text(), 0, 15);

      compareLayerAndCanvas(layer, canvas, 200);
      delete Konva.pixelRatio;
      done();
    };
    imageObj.src = 'assets/darth-vader.jpg';
  });
});
