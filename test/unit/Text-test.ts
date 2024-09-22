import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
  compareLayers,
  loadImage,
  isBrowser,
  isNode,
  compareCanvases,
} from './test-utils';

describe('Text', function () {
  // ======================================================
  it('text with empty config is allowed', function () {
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

  it('check text with FALSY values', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text();

    layer.add(text);
    layer.draw();

    text.text(0 as any);
    assert.equal(text.text(), '0');

    text.text(true as any);
    assert.equal(text.text(), 'true');

    text.text(false as any);
    assert.equal(text.text(), 'false');

    text.text(undefined);
    assert.equal(text.text(), '');
  });

  // ======================================================
  it('text with undefined text property should not throw an error', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({ text: undefined });

    layer.add(text);
    layer.draw();

    assert.equal(text.getWidth(), 0);
  });

  it('add text with shadows', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 40,
      y: 40,
      text: 'Hello World!',
      fontSize: 50,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: '#888',
      stroke: '#333',
      align: 'right',
      shadowForStrokeEnabled: false,
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

    group.add(text);
    layer.add(group);
    stage.add(layer);

    assert.equal(
      layer.getContext().getTrace(false, true),
      'clearRect(0,0,578,200);save();transform(1,0,0,1,40,40);shadowColor=rgba(255,0,0,0.2);shadowBlur=1;shadowOffsetX=10;shadowOffsetY=10;font=normal normal 50px Arial;textBaseline=middle;textAlign=left;translate(10,10);save();fillStyle=#888;fillText(Hello World!,108,30);lineWidth=2;shadowColor=rgba(0,0,0,0);strokeStyle=#333;miterLimit=2;strokeText(Hello World!,108,30);restore();restore();'
    );

    assert.equal(text.getClassName(), 'Text', 'getClassName should be Text');
  });

  it('text with fill and shadow', function () {
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

    compareLayerAndCanvas(layer, canvas, 254, 200);
  });

  it('check emoji with letterSpacing', function () {
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

  it('check hindi with letterSpacing', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'आपकी दौड़ के लिए परफेक्ट जूते!',
      fontSize: 50,
      letterSpacing: 10,
    });

    layer.add(text);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    context.textBaseline = 'middle';
    context.letterSpacing = '10px';
    context.font = 'normal normal 50px Arial';
    context.fillStyle = 'darkgrey';
    context.fillText('आपकी दौड़ के लिए परफेक्ट जूते!', 10, 10 + 25);

    if (isBrowser) {
      compareLayerAndCanvas(layer, canvas, 254, 200);
    }
  });

  it('text cache with fill and shadow', function () {
    // TODO: on node-canvas it doesn't work
    // text scaling is not correct
    if (isNode) {
      return;
    }
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

    layer2.add(text1.clone().cache({ pixelRatio: 3 }));
    stage.add(layer1, layer2);

    compareLayers(layer1, layer2, 250, 100);
  });

  it('text cache with fill and shadow and some scale', function () {
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
  it('add text with letter spacing', function () {
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
  it('text getters and setters', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: stage.width() / 2,
      y: stage.height() / 2,
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
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.2,
      draggable: true,
    });

    // center text box
    text.offsetX(text.getWidth() / 2);

    layer.add(text);
    stage.add(layer);

    /*
     * test getters and setters
     */

    assert.equal(text.x(), stage.width() / 2);
    assert.equal(text.y(), stage.height() / 2);
    assert.equal(text.text(), 'Hello World!');
    assert.equal(text.fontSize(), 50);
    assert.equal(text.fontFamily(), 'Calibri');
    assert.equal(text.fontStyle(), 'normal');
    assert.equal(text.fontVariant(), 'normal');
    assert.equal(text.fill(), '#888');
    assert.equal(text.stroke(), '#333');
    assert.equal(text.align(), 'right');
    assert.equal(text.lineHeight(), 1.2);
    assert.equal(text.getWidth(), 400);
    assert.equal(text.height(), 100);
    assert.equal(text.padding(), 10);
    assert.equal(text.shadowColor(), 'black');
    assert.equal(text.draggable(), true);
    assert.equal(text.getWidth(), 400);
    assert.equal(text.height(), 100);
    assert(text.getTextWidth() > 0, 'text width should be greater than 0');
    assert(text.fontSize() > 0, 'text height should be greater than 0');

    text.x(1);
    text.y(2);
    text.text('bye world!');
    text.fontSize(10);
    text.fontFamily('Arial');
    text.fontStyle('bold');
    text.fontVariant('small-caps');
    text.fill('green');
    text.stroke('yellow');
    text.align('left');
    text.width(300);
    text.height(75);
    text.padding(20);
    text.shadowColor('green');
    text.setDraggable(false);

    assert.equal(text.x(), 1);
    assert.equal(text.y(), 2);
    assert.equal(text.text(), 'bye world!');
    assert.equal(text.fontSize(), 10);
    assert.equal(text.fontFamily(), 'Arial');
    assert.equal(text.fontStyle(), 'bold');
    assert.equal(text.fontVariant(), 'small-caps');
    assert.equal(text.fill(), 'green');
    assert.equal(text.stroke(), 'yellow');
    assert.equal(text.align(), 'left');
    assert.equal(text.getWidth(), 300);
    assert.equal(text.height(), 75);
    assert.equal(text.padding(), 20);
    assert.equal(text.shadowColor(), 'green');
    assert.equal(text.draggable(), false);

    // test set text to integer
    text.text(5 as any);

    //document.body.appendChild(layer.bufferCanvas.element)

    //layer.setListening(false);
    layer.drawHit();
  });

  // ======================================================
  it('reset text auto width', function () {
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
  it('text multi line', function () {
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
      text: "HEADING\n\nAll the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
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

    rect.height(text.height());
    // center text box
    //text.setOffset(text.getBoxWidth() / 2, text.getBoxHeight() / 2);

    layer.add(rect).add(text);
    stage.add(layer);

    assert.equal(text.lineHeight(), 20);
  });

  // ======================================================
  it('text single line with ellipsis', function () {
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
      text: "HEADING\n\nAll the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
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
  it('text single line with ellipsis when there is no need in them', function () {
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
      width: 497,
      height: 49,
      text: 'Body text',
      fill: 'black',
      fontSize: 40,
      shadowColor: 'black',
      shadowOpacity: 1,
      lineHeight: 1.2,
      letterSpacing: 0,
      ellipsis: true,
    });

    layer.add(rect).add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 1);
    assert.equal(text.textArr[0].text.slice(-1), 't');
  });

  // ======================================================
  it('multiline with ellipsis', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: "HEADING\n\nAll the world's a stage, merely players. They have theirrrrrrr exits and theirrrrr entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Arial',
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

    if (isBrowser) {
      assert.equal(
        layer.getContext().getTrace(false, true),
        "clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 14px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(HEADING,18,7);restore();save();fillStyle=black;fillText(,50,21);restore();save();fillStyle=black;fillText(All the world's,7,35);restore();save();fillStyle=black;fillText(a stage,,25,49);restore();save();fillStyle=black;fillText(merely,28,63);restore();save();fillStyle=black;fillText(players. They,7,77);restore();save();fillStyle=black;fillText(have…,27,91);restore();restore();"
      );
    }
  });

  // ======================================================
  it('multiline with ellipsis and lineWidth less than maxWidth', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: "HEADING\nAll the\n world's a stage, merely players. They have theirrrrrrr exits and theirrrrr entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      width: 100,
      padding: 0,
      align: 'center',
      height: 30,
      ellipsis: true,
    });

    layer.add(text);
    stage.add(layer);

    assert.equal(text.textArr.length, 2);
    assert.equal(text.textArr[1].text.slice(-1), '…');

    if (isBrowser) {
      assert.equal(
        layer.getContext().getTrace(false, true),
        'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 14px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(HEADING,18,7);restore();save();fillStyle=black;fillText(All the…,23,21);restore();restore();'
      );
    }
  });

  // ======================================================
  it('make sure we respect false for ellipsis', function () {
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
  it('wrap none check', function () {
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
  it('text multi line with justify align', function () {
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
      text: "HEADING\n\n    All the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: '#555',
      width: 380,
      align: 'justify',
      letterSpacing: 5,
      draggable: true,
    });

    rect.height(text.height());
    layer.add(rect).add(text);

    stage.add(layer);

    var trace =
      'fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
  });

  it('text justify should not justify just one line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      rotation: 0,
      width: 500,
      height: 58,
      text: 'YOU ARE INVITED!',
      fontSize: 30,
      align: 'justify',
      draggable: true,
    });

    layer.add(text);

    stage.add(layer);

    if (Konva.isBrowser) {
      var trace =
        'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 30px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(Y,0,15);fillStyle=black;fillText(O,20,15);fillStyle=black;fillText(U,43,15);fillStyle=black;fillText( ,65,15);fillStyle=black;fillText(A,73,15);fillStyle=black;fillText(R,93,15);fillStyle=black;fillText(E,115,15);fillStyle=black;fillText( ,135,15);fillStyle=black;fillText(I,143,15);fillStyle=black;fillText(N,151,15);fillStyle=black;fillText(V,173,15);fillStyle=black;fillText(I,193,15);fillStyle=black;fillText(T,201,15);fillStyle=black;fillText(E,220,15);fillStyle=black;fillText(D,240,15);fillStyle=black;fillText(!,261,15);restore();restore();';

      assert.equal(layer.getContext().getTrace(false, true), trace);
    }
  });

  it('text multi line with justify align and several paragraphs', function () {
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
      text: "HEADING\n\n    All the world's a stage, merely players. They have their exits and their entrances;\nAnd one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: '#555',
      width: 380,
      align: 'justify',
      letterSpacing: 5,
      draggable: true,
    });

    rect.height(text.height());
    layer.add(rect).add(text);

    stage.add(layer);

    var trace =
      'fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);
  });

  // ======================================================
  it('text multi line with justify align and decoration', function () {
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
      text: "HEADING\n\n    All the world's a stage, merely players. They have their exits and their entrances; And one man in his time plays many parts.",
      fontSize: 14,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      fill: '#555',
      width: 380,
      align: 'justify',
      letterSpacing: 5,
      textDecoration: 'underline',
      padding: 20,
      draggable: true,
    });

    rect.height(text.height());

    layer.add(rect).add(text);

    stage.add(layer);

    if (isNode) {
      return;
    }

    var trace =
      'fillText(c,69.696,77);fillStyle=#555;fillText(e,81.696,77);fillStyle=#555;fillText(s,94.482,77);fillStyle=#555;fillText(;,106.482,77);fillStyle=#555;fillText( ,117.549,77);fillStyle=#555;fillText(A,126.438,77);fillStyle=#555;fillText(n,140.776,77);fillStyle=#555;fillText(d,153.563,77);fillStyle=#555;fillText( ,168.525,77);fillStyle=#555;fillText(o,177.415,77);fillStyle=#555;fillText(n,190.201,77);fillStyle=#555;fillText(e,202.987,77);fillStyle=#555;fillText( ,217.95,77);fillStyle=#555;fillText(m,226.84,77);fillStyle=#555;fillText(a,243.502,77);fillStyle=#555;fillText(n,256.288,77);fillStyle=#555;fillText( ,271.251,77);fillStyle=#555;fillText(i,280.141,77);fillStyle=#555;fillText(n,288.251,77);fillStyle=#555;fillText( ,303.214,77);fillStyle=#555;fillText(h,312.104,77);fillStyle=#555;fillText(i,324.89,77);fillStyle=#555;fillText(s,333,77);restore();save();save();beginPath();moveTo(0,98);lineTo(245,98);stroke();restore();fillStyle=#555;fillText(t,0,91);fillStyle=#555;fillText(i,8.89,91);fillStyle=#555;fillText(m,17,91);fillStyle=#555;fillText(e,33.662,91);fillStyle=#555;fillText( ,46.448,91);fillStyle=#555;fillText(p,55.338,91);fillStyle=#555;fillText(l,68.124,91);fillStyle=#555;fillText(a,76.234,91);fillStyle=#555;fillText(y,89.021,91);fillStyle=#555;fillText(s,101.021,91);fillStyle=#555;fillText( ,113.021,91);fillStyle=#555;fillText(m,121.91,91);fillStyle=#555;fillText(a,138.572,91);fillStyle=#555;fillText(n,151.358,91);fillStyle=#555;fillText(y,164.145,91);fillStyle=#555;fillText( ,176.145,91);fillStyle=#555;fillText(p,185.034,91);fillStyle=#555;fillText(a,197.82,91);fillStyle=#555;fillText(r,210.606,91);fillStyle=#555;fillText(t,220.269,91);fillStyle=#555;fillText(s,229.158,91);fillStyle=#555;fillText(.,241.158,91);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  // ======================================================
  it('text multi line with shadows', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      //stroke: '#555',
      //strokeWidth: 5,
      text: "HEADING\n\nAll the world's a stage, and all the men and women merely players. They have their exits and their entrances; And one man in his time plays many parts.",
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

    if (isBrowser) {
      assert.equal(
        layer.getContext().getTrace(false, true),
        "clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);shadowColor=rgba(255,0,0,0.5);shadowBlur=1;shadowOffsetX=10;shadowOffsetY=10;font=normal normal 16px Calibri;textBaseline=middle;textAlign=left;translate(20,20);save();fillStyle=#555;fillText(HEADING,133,8);restore();save();fillStyle=#555;fillText(,170,24);restore();save();fillStyle=#555;fillText(All the world's a stage, and all the men and women,6,40);restore();save();fillStyle=#555;fillText(merely players. They have their exits and their,21,56);restore();save();fillStyle=#555;fillText(entrances; And one man in his time plays many,18,72);restore();save();fillStyle=#555;fillText(parts.,152,88);restore();restore();"
      );
    } else {
      // use relax, because in GitHub Actions calculations are too different
      assert.equal(
        layer.getContext().getTrace(true, true),
        'clearRect();save();transform();shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;font;textBaseline;textAlign;translate();save();fillStyle;fillText();restore();save();fillStyle;fillText();restore();save();fillStyle;fillText();restore();save();fillStyle;fillText();restore();save();fillStyle;fillText();restore();save();fillStyle;fillText();restore();restore();'
      );
    }
  });

  // ======================================================
  it('text multi line with underline and spacing', function () {
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

    assert.equal(
      layer.getContext().getTrace(true),
      'clearRect();save();transform();font;textBaseline;textAlign;translate();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();save();save();beginPath();moveTo();lineTo();stroke();restore();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();fillStyle;fillText();restore();restore();'
    );
  });

  // ======================================================
  it('test text with crazy font families', function () {
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
  it('text with underline and large line height', function () {
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

  it('text multi line with strike', function () {
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

  it('text multi line with underline and strike', function () {
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

  it('text multi line with underline and strike and gradient', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      // fill: 'red',
      fillPriority: 'linear-gradient',
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 100, y: 0 },
      fillLinearGradientColorStops: [0, 'red', 1, 'yellow'],
      fillAfterStrokeEnabled: true,
      textDecoration: 'underline line-through',
    });

    layer.add(text);
    stage.add(layer);

    if (isNode) {
      return;
    }
    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 80px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();save();beginPath();moveTo(0,80);lineTo(169,80);stroke();restore();save();beginPath();moveTo(0,40);lineTo(169,40);stroke();restore();fillStyle=[object CanvasGradient];fillText(hello,0,40);restore();save();save();beginPath();moveTo(0,160);lineTo(191,160);stroke();restore();save();beginPath();moveTo(0,120);lineTo(191,120);stroke();restore();fillStyle=[object CanvasGradient];fillText(world,0,120);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  it('text multi line with underline and strike and gradient vertical', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      x: 10,
      y: 10,
      text: 'hello\nworld',
      fontSize: 80,
      // fill: 'red',
      fillPriority: 'linear-gradient',
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 160 },
      fillLinearGradientColorStops: [0, 'red', 1, 'yellow'],
      fillAfterStrokeEnabled: true,
      textDecoration: 'underline line-through',
    });

    layer.add(text);
    stage.add(layer);

    if (isNode) {
      return;
    }

    var trace =
      'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);font=normal normal 80px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();save();beginPath();moveTo(0,80);lineTo(169,80);stroke();restore();save();beginPath();moveTo(0,40);lineTo(169,40);stroke();restore();fillStyle=[object CanvasGradient];fillText(hello,0,40);restore();save();save();beginPath();moveTo(0,160);lineTo(191,160);stroke();restore();save();beginPath();moveTo(0,120);lineTo(191,120);stroke();restore();fillStyle=[object CanvasGradient];fillText(world,0,120);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  it('text with underline and shadow', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      text: 'Test',
      fill: 'black',
      fontSize: 40,
      textDecoration: 'underline',
      shadowEnabled: true,
      shadowColor: 'red',
      shadowOffsetX: 15,
      shadowOffsetY: 15,
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect();save();shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);

    // now check result visually
    // text with red shadow is the same as red text with back text on top
    const group = new Konva.Group({});
    layer.add(group);
    group.add(text.clone({ shadowEnabled: false, x: 15, y: 15, fill: 'red' }));
    group.add(text.clone({ shadowEnabled: false }));
    const groupCanvas = group.toCanvas();

    compareCanvases(groupCanvas, text.toCanvas(), 200);
  });

  it('text with line-through and shadow', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      text: 'Test',
      fill: 'black',
      fontSize: 40,
      textDecoration: 'line-through',
      shadowEnabled: true,
      shadowColor: 'red',
      shadowOffsetX: 5,
      shadowOffsetY: 5,
    });

    layer.add(text);
    stage.add(layer);

    var trace =
      'clearRect();save();shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();';

    assert.equal(layer.getContext().getTrace(true), trace);

    // now check result visually
    // text with red shadow is the same as red text with back text on top
    const group = new Konva.Group({});
    layer.add(group);
    group.add(text.clone({ shadowEnabled: false, x: 5, y: 5, fill: 'red' }));
    group.add(text.clone({ shadowEnabled: false }));
    const groupCanvas = group.toCanvas();

    compareCanvases(groupCanvas, text.toCanvas(), 200, 50);
  });

  // ======================================================
  it('change font size should update text data', function () {
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
    var height = text.height();

    layer.add(text);
    stage.add(layer);

    text.fontSize(30);
    layer.draw();

    assert(text.getWidth() > width, 'width should have increased');
    assert(text.height() > height, 'height should have increased');
  });

  it('text vertical align', function () {
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

    if (isBrowser) {
      assert.equal(
        layer.getContext().getTrace(false, true),
        'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);beginPath();rect(0,0,200,100);closePath();lineWidth=2;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,10,10);font=normal normal 16px Arial;textBaseline=middle;textAlign=left;translate(10,42);save();fillStyle=#555;fillText(Some awesome text,17,8);restore();restore();'
      );
    } else {
      assert.equal(
        layer.getContext().getTrace(false, true),
        'clearRect(0,0,578,200);save();transform(1,0,0,1,10,10);beginPath();rect(0,0,200,100);closePath();lineWidth=2;strokeStyle=black;stroke();restore();save();transform(1,0,0,1,10,10);font=normal normal 16px Arial;textBaseline=middle;textAlign=left;translate(10,42);save();fillStyle=#555;fillText(Some awesome text,17,8);restore();restore();'
      );
    }
  });

  it('get text width', function () {
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

  it('get text width of long text with spacing (check it visually!)', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();
    stage.add(layer);

    var textProps = {
      x: 10,
      y: 10,
      fontSize: 19,
      text: 'very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text, very long text.',
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
        text: 'gregrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg4g4g4',
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
        text: 'gregrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg44g4g4g4g4g4g4g4regrg4g4g4',
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

    // on nodejs the length is very different
    // so we need to adjust offset
    const diff = isBrowser ? 4 : 50;
    assert.equal(Math.abs(Math.round(text1.width()) - 1725) < diff, true);
    assert.equal(Math.abs(Math.round(text2.width()) - 2613) < diff, true);
    assert.equal(Math.abs(Math.round(text3.width()) - 2005) < diff, true);
    assert.equal(Math.abs(Math.round(text4.width()) - 1932) < diff, true);
  });

  it('default text color should be black', function () {
    var text = new Konva.Text();
    assert.equal(text.fill(), 'black');
  });

  it('text with stoke and strokeScaleEnabled', function () {
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
    context.miterLimit = 2;
    context.strokeText('text', 0, 25);
    compareLayerAndCanvas(layer, canvas);
  });

  it('text getSelfRect', function () {
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

  it('linear gradient', function () {
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
      grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
    }
    ctx.fillStyle = grd;

    ctx.fillText(text.text(), text.x(), text.y() + text.fontSize() / 2);

    compareLayerAndCanvas(layer, canvas, 200);
  });

  it('linear gradient multiline', function () {
    const oldRatio = Konva.pixelRatio;
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
      grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
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
    Konva.pixelRatio = oldRatio;
  });

  it('radial gradient', function () {
    const oldRatio = Konva.pixelRatio;
    Konva.pixelRatio = 1;
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
      grd.addColorStop(colorStops[n] as number, colorStops[n + 1] as string);
    }
    ctx.fillStyle = grd;

    ctx.translate(0, 25);

    ctx.fillText(text.text(), 0, 0);

    Konva.pixelRatio = oldRatio;

    compareLayerAndCanvas(layer, canvas, 100, 30);
  });

  it('text should be centered in line height', function () {
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

  it('check wrapping', function () {
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

  it('check trip when go to new line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var text = new Konva.Text({
      text: 'Hello, this is some good text',
      fontSize: 30,
    });
    layer.add(text);
    stage.add(layer);

    text.width(245);

    var lines = text.textArr;

    // remove all trimming spaces
    // it also looks better in many cases
    // it will work as text in div
    assert.equal(lines[0].text, 'Hello, this is some');
    assert.equal(lines[1].text, 'good text');

    text.width(261);
    var lines = text.textArr;

    assert.equal(lines[0].text, 'Hello, this is some');
    assert.equal(lines[1].text, 'good text');
    layer.draw();
  });

  it('image gradient for text', function (done) {
    const oldRatio = Konva.pixelRatio;
    Konva.pixelRatio = 1;
    loadImage('darth-vader.jpg', (imageObj) => {
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
      Konva.pixelRatio = oldRatio;
      done();
    });
  });

  it('image gradient for text with offset', function (done) {
    if (isNode) {
      // skip in NodeJS because it has not transform API on gradients
      return done();
    }
    const oldRatio = Konva.pixelRatio;
    Konva.pixelRatio = 1;
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();

      var text = new Konva.Text({
        text: 'Hello, this is some good text',
        fontSize: 30,
        fillPatternImage: imageObj,
        fillPatternOffsetX: 50,
        fillPatternRotation: 0,
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
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: -50,
        f: 0,
      });
      ctx.fillStyle = grd;

      ctx.fillText(text.text(), 0, 15);

      compareLayerAndCanvas(layer, canvas, 200);
      Konva.pixelRatio = oldRatio;
      done();
    });
  });

  it('image gradient for text with scale', function (done) {
    const oldRatio = Konva.pixelRatio;
    Konva.pixelRatio = 1;
    loadImage('darth-vader.jpg', (imageObj) => {
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
      const matrix =
        typeof DOMMatrix === 'undefined'
          ? {
              a: 0.5, // Horizontal scaling. A value of 1 results in no scaling.
              b: 0, // Vertical skewing.
              c: 0, // Horizontal skewing.
              d: 0.5,
              e: 0, // Horizontal translation (moving).
              f: 0, // Vertical translation (moving).
            }
          : new DOMMatrix([0.5, 0, 0, 0.5, 0, 0]);

      grd.setTransform(matrix);

      ctx.fillStyle = grd;

      ctx.fillText(text.text(), 0, 15);

      compareLayerAndCanvas(layer, canvas, 200);
      Konva.pixelRatio = oldRatio;
      done();
    });
  });

  it('stripe bad stroke', () => {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({
      text: 'HELLO WORLD',
      fontFamily: 'Arial',
      fontSize: 80,
      stroke: 'red',
      strokeWidth: 20,
      fillAfterStrokeEnabled: true,
      draggable: true,
    });

    layer.add(text);
    layer.draw();

    var trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 80px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();lineWidth=20;strokeStyle=red;miterLimit=2;strokeText(HELLO WORLD,0,40);fillStyle=black;fillText(HELLO WORLD,0,40);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  it('sets ltr text direction', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({
      text: 'ltr text',
      direction: 'ltr',
    });

    layer.add(text);
    layer.draw();

    var trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 12px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(ltr text,0,6);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  it('sets rtl text direction', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({
      text: 'rtl text',
      direction: 'rtl',
    });

    layer.add(text);
    layer.draw();

    var trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);direction=rtl;font=normal normal 12px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();fillStyle=black;fillText(rtl text,0,6);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  it('sets rtl text direction with letterSpacing', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({
      text: 'rtl text',
      direction: 'rtl',
      letterSpacing: 2,
    });

    layer.add(text);
    layer.draw();

    var trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);direction=rtl;font=normal normal 12px Arial;textBaseline=middle;textAlign=left;translate(0,0);save();letterSpacing=2px;fillStyle=black;fillText(rtl text,0,6);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });

  it('try fixed render', () => {
    Konva._fixTextRendering = true;
    var stage = addStage();
    var layer = new Konva.Layer();

    stage.add(layer);
    var text = new Konva.Text({ text: 'hello', fontSize: 100 });

    layer.add(text);
    layer.draw();
    Konva._fixTextRendering = false;

    const trace =
      'clearRect(0,0,578,200);clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);font=normal normal 100px Arial;textBaseline=alphabetic;textAlign=left;translate(0,0);save();fillStyle=black;fillText(hello,0,85);restore();restore();';

    assert.equal(layer.getContext().getTrace(), trace);
  });
});
