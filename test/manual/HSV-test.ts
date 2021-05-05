import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('HSV', function () {
  // ======================================================
  it('hue shift tween transparancy', function (done) {
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
      darth.filters([Konva.Filters.HSV]);
      darth.hue(360);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1.0,
        hue: 0,
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
  it('saturate image', function (done) {
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
      darth.filters([Konva.Filters.HSV]);

      darth.saturation(1.0);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1.0,
        saturation: -1.0,
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
  it('saturation tween transparancy', function (done) {
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
      darth.filters([Konva.Filters.HSV]);
      darth.saturation(1.0);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1.0,
        saturation: -1,
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
  it('value tween transparancy', function (done) {
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
      darth.filters([Konva.Filters.HSV]);
      darth.value(1.0);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1.0,
        value: -1.0,
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
});
