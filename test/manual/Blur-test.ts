import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('Blur', function () {
  // ======================================================
  it('basic blur', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      const darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Blur]);
      darth.blurRadius(10);

      assert.equal(darth.blurRadius(), 10);
      assert.equal(darth._filterUpToDate, false);

      layer.draw();

      assert.equal(darth._filterUpToDate, true);

      darth.blurRadius(20);

      assert.equal(darth.blurRadius(), 20);
      assert.equal(darth._filterUpToDate, false);

      layer.draw();

      assert.equal(darth._filterUpToDate, true);

      done();
    });
  });

  it('blur group', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group({
      x: 100,
      y: 100,
      draggable: true,
    });
    var top = new Konva.Circle({
      x: 0,
      y: -70,
      radius: 30,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });
    var right = new Konva.Circle({
      x: 70,
      y: 0,
      radius: 30,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });
    var bottom = new Konva.Circle({
      x: 0,
      y: 70,
      radius: 30,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });
    var left = new Konva.Circle({
      x: -70,
      y: 0,
      radius: 30,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 4,
    });

    group.add(top).add(right).add(bottom).add(left);
    layer.add(group);
    stage.add(layer);

    group.cache();

    group.offset();

    group.filters([Konva.Filters.Blur]);
    group.blurRadius(20);

    layer.draw();
  });

  // ======================================================
  it('tween blur', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      const darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Blur]);
      darth.blurRadius(100);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 2.0,
        blurRadius: 0,
        easing: Konva.Easings.EaseInOut,
      });

      darth.on('mouseover', function () {
        tween.play();
      });

      darth.on('mouseout', function () {
        tween.reverse();
      });

      done();
    });
  });

  // ======================================================
  it('crop blur', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      const darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        crop: { x: 128, y: 48, width: 256, height: 128 },
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Blur]);
      darth.blurRadius(10);
      layer.draw();

      done();
    });
  });

  // ======================================================
  it('crop tween blur', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      const darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        crop: { x: 128, y: 48, width: 256, height: 128 },
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Blur]);
      darth.blurRadius(100);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 2.0,
        blurRadius: 0,
        easing: Konva.Easings.EaseInOut,
      });

      darth.on('mouseover', function () {
        tween.play();
      });

      darth.on('mouseout', function () {
        tween.reverse();
      });

      done();
    });
  });

  // ======================================================
  it('transparency', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      const darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Blur]);
      darth.blurRadius(100);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1,
        blurRadius: 0,
        easing: Konva.Easings.EaseInOut,
      });

      darth.on('mouseover', function () {
        tween.play();
      });

      darth.on('mouseout', function () {
        tween.reverse();
      });

      done();
    });
  });

  // ======================================================
  it('blur hit region', function (done) {
    var stage = addStage();

    loadImage('lion.png', (imageObj) => {
      var layer = new Konva.Layer();
      const darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      //console.log(darth.hasStroke())

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.Blur]);
      darth.blurRadius(20);
      darth.drawHitFromCache(100);
      layer.draw();

      //console.log(darth._getCanvasCache().hit.getContext().getTrace());

      //assert.equal(darth._getCanvasCache().hit.getContext().getTrace(true), 'save();translate();beginPath();rect();closePath();save();fillStyle;fill();restore();restore();clearRect();getImageData();putImageData();');

      done();
    });
  });
});
