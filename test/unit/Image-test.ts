import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
  loadImage,
  isNode,
  isBrowser,
} from './test-utils';

describe('Image', function () {
  // ======================================================
  it('add image', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();

      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 200,
        y: 60,
        image: imageObj,
        width: 100,
        height: 100,
        offset: { x: 50, y: 30 },
        crop: { x: 135, y: 7, width: 167, height: 134 },
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.width(200);
      layer.draw();

      darth.width(100);
      layer.draw();

      assert.equal(darth.x(), 200);
      assert.equal(darth.y(), 60);
      assert.equal(darth.getWidth(), 100);
      assert.equal(darth.getHeight(), 100);
      assert.equal(darth.offset().x, 50);
      assert.equal(darth.offset().y, 30);

      var crop = darth.crop();

      assert.equal(crop.x, 135);
      assert.equal(crop.y, 7);
      assert.equal(crop.width, 167);
      assert.equal(crop.height, 134);

      darth.crop({
        x: 8,
        y: 9,
        width: 10,
        height: 11,
      });
      crop = darth.crop();
      assert.equal(crop.x, 8);
      assert.equal(crop.y, 9);
      assert.equal(crop.width, 10);
      assert.equal(crop.height, 11);

      darth.cropX(12);
      crop = darth.crop();
      assert.equal(crop.x, 12);
      assert.equal(crop.y, 9);
      assert.equal(crop.width, 10);
      assert.equal(crop.height, 11);

      darth.cropY(13);
      crop = darth.crop();
      assert.equal(crop.x, 12);
      assert.equal(crop.y, 13);
      assert.equal(crop.width, 10);
      assert.equal(crop.height, 11);

      darth.cropWidth(14);
      crop = darth.crop();
      assert.equal(crop.x, 12);
      assert.equal(crop.y, 13);
      assert.equal(crop.width, 14);
      assert.equal(crop.height, 11);

      darth.cropHeight(15);
      crop = darth.crop();
      assert.equal(crop.x, 12);
      assert.equal(crop.y, 13);
      assert.equal(crop.width, 14);
      assert.equal(crop.height, 15);

      darth.setAttrs({
        x: 200,
        y: 60,
        image: imageObj,
        width: 100,
        height: 100,
        offsetX: 50,
        offsetY: 30,
        crop: { x: 135, y: 7, width: 167, height: 134 },
        draggable: true,
      });

      assert.equal(darth.getClassName(), 'Image');

      var trace = layer.getContext().getTrace();

      if (isBrowser) {
        assert.equal(
          trace,
          'clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);drawImage([object HTMLImageElement],135,7,167,134,0,0,100,100);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);drawImage([object HTMLImageElement],135,7,167,134,0,0,200,100);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);drawImage([object HTMLImageElement],135,7,167,134,0,0,100,100);restore();'
        );
      } else {
        assert.equal(
          trace,
          'clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);drawImage([object Object],135,7,167,134,0,0,100,100);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);drawImage([object Object],135,7,167,134,0,0,200,100);restore();clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);drawImage([object Object],135,7,167,134,0,0,100,100);restore();'
        );
      }

      done();
    });
  });

  // ======================================================
  it('try image will fill pattern', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      loadImage('lion.png', (lion) => {
        var stage = addStage();

        var layer = new Konva.Layer();
        var darth = new Konva.Image({
          x: 20,
          y: 20,
          image: lion,
          draggable: true,
          fillPatternImage: imageObj,
          fillPatternRepeat: 'no-repeat',
          fillPatternX: 50,
        });

        layer.add(darth);
        stage.add(layer);

        assert.equal(
          layer.getContext().getTrace(true),
          'clearRect();save();transform();beginPath();rect();closePath();fillStyle;fill();drawImage();restore();'
        );

        done();
      });
    });
  });

  // ======================================================
  it('crop and scale image', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 200,
        y: 75,
        image: imageObj,
        width: 107,
        height: 75,
        crop: { x: 186, y: 211, width: 106, height: 74 },
        draggable: true,
        scale: { x: 0.5, y: 0.5 },
        cornerRadius: 15,
      });

      layer.add(darth);
      stage.add(layer);

      assert.equal(darth.crop().x, 186);
      assert.equal(darth.crop().y, 211);
      assert.equal(darth.crop().width, 106);
      assert.equal(darth.crop().height, 74);

      assert.equal(darth.cropX(), 186);
      assert.equal(darth.cropY(), 211);
      assert.equal(darth.cropWidth(), 106);
      assert.equal(darth.cropHeight(), 74);

      darth.crop({ x: 1, y: 2, width: 3, height: 4 });

      assert.equal(darth.crop().x, 1);
      assert.equal(darth.crop().y, 2);
      assert.equal(darth.crop().width, 3);
      assert.equal(darth.crop().height, 4);

      assert.equal(darth.cropX(), 1);
      assert.equal(darth.cropY(), 2);
      assert.equal(darth.cropWidth(), 3);
      assert.equal(darth.cropHeight(), 4);

      darth.cropX(5);
      darth.cropY(6);
      darth.cropWidth(7);
      darth.cropHeight(8);

      assert.equal(darth.crop().x, 5);
      assert.equal(darth.crop().y, 6);
      assert.equal(darth.crop().width, 7);
      assert.equal(darth.crop().height, 8);

      assert.equal(darth.cropX(), 5);
      assert.equal(darth.cropY(), 6);
      assert.equal(darth.cropWidth(), 7);
      assert.equal(darth.cropHeight(), 8);
      assert.equal(darth.cornerRadius(), 15);

      done();
    });
  });

  // ======================================================
  it('image with opacity and shadow', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();

      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 200,
        y: 60,
        image: imageObj,
        width: 100,
        height: 100,
        offset: { x: 50, y: 30 },
        draggable: true,
        opacity: 0.5,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOpacity: 0.1,
        shadowOffset: { x: 20, y: 20 },
      });

      layer.add(darth);
      stage.add(layer);

      var trace = layer.getContext().getTrace();

      if (isBrowser) {
        assert.equal(
          trace,
          'clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);globalAlpha=0.5;shadowColor=rgba(0,0,0,0.1);shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;drawImage([object HTMLImageElement],0,0,100,100);restore();'
        );
      } else {
        assert.equal(
          trace,
          'clearRect(0,0,578,200);save();transform(1,0,0,1,150,30);globalAlpha=0.5;shadowColor=rgba(0,0,0,0.1);shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;drawImage([object Object],0,0,100,100);restore();'
        );
      }

      done();
    });
  });

  // ======================================================
  it('image with stroke, opacity and shadow', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();

      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 200,
        y: 60,
        image: imageObj,
        width: 100,
        height: 100,
        offset: { x: 50, y: 30 },
        draggable: true,
        opacity: 0.5,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOpacity: 0.5,
        shadowOffset: { x: 20, y: 20 },
        stroke: 'red',
        strokeWidth: 20,
      });

      layer.add(darth);
      stage.add(layer);

      var trace = layer.getContext().getTrace();

      if (isBrowser) {
        assert.equal(
          trace,
          'clearRect(0,0,578,200);save();shadowColor=rgba(0,0,0,0.5);shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;globalAlpha=0.5;drawImage([object HTMLCanvasElement],0,0,578,200);restore();'
        );
      } else {
        assert.equal(
          trace,
          'clearRect(0,0,578,200);save();shadowColor=rgba(0,0,0,0.5);shadowBlur=10;shadowOffsetX=20;shadowOffsetY=20;globalAlpha=0.5;drawImage([object Object],0,0,578,200);restore();'
        );
      }

      done();
    });
  });

  // ======================================================
  it('image caching', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 200,
        y: 60,
        image: imageObj,
        width: 100,
        height: 100,
        draggable: true,
      });

      darth.cache();
      layer.add(darth);
      stage.add(layer);

      assert.deepEqual(darth.getSelfRect(), {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });

      var canvas = createCanvas();
      var context = canvas.getContext('2d');
      context.drawImage(imageObj, 200, 60, 100, 100);
      compareLayerAndCanvas(layer, canvas, 10);
      done();
    });
  });

  it('image loader', function (done) {
    if (isNode) {
      done();
      return;
    }
    loadImage('darth-vader.jpg', (img) => {
      var stage = addStage();
      var layer = new Konva.Layer();
      stage.add(layer);
      var src = img.src;
      Konva.Image.fromURL(src, function (image) {
        layer.add(image);
        layer.draw();
        assert.equal(image instanceof Konva.Image, true);
        var nativeImg = image.image();
        assert.equal(nativeImg instanceof Image, true);
        assert.equal(nativeImg.src.indexOf(src) !== -1, true);
        assert.equal(nativeImg.complete, true);
        done();
      });
    });
  });

  it('check loading failure', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var src = 'non-existent.jpg';
    Konva.Image.fromURL(src, null, function (e) {
      done();
    });
  });

  it('check zero values', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();
      stage.add(layer);

      const image = new Konva.Image({ image: imageObj });
      layer.add(image);

      image.width(0);
      image.height(0);
      layer.draw();

      assert.equal(image.width(), 0);
      assert.equal(image.height(), 0);
      done();
    });
  });

  it('corner radius', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();

      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 20,
        y: 20,
        image: imageObj,
        cornerRadius: 10,
        draggable: true,
        stroke: 'red',
        strokeWidth: 100,
        strokeEnabled: false,
      });

      layer.add(darth);
      stage.add(layer);

      assert.equal(
        layer.getContext().getTrace(true),
        'clearRect();save();transform();beginPath();moveTo();lineTo();arc();lineTo();arc();lineTo();arc();lineTo();arc();closePath();clip();drawImage();restore();'
      );

      done();
    });
  });

  it('corner radius with shadow', function (done) {
    // that will trigger buffer canvas
    loadImage('darth-vader.jpg', (imageObj) => {
      var stage = addStage();

      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 20,
        y: 20,
        image: imageObj,
        cornerRadius: 10,
        draggable: true,
        stroke: 'red',
        strokeWidth: 100,
        strokeEnabled: false,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffsetX: 10,
        shadowOffsetY: 10,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      layer.add(darth);
      stage.add(layer);

      assert.equal(
        layer.getContext().getTrace(true),
        'clearRect();save();shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();'
      );

      done();
    });
  });
});
