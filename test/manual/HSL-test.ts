import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('HSL', function () {
  // ======================================================
  it('hue shift tween transparancy', function (done) {
    var stage = addStage();

    loadImage('lion.png', (imageObj) => {
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
      darth.filters([Konva.Filters.HSL]);
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
  it('HSL luminance tween transparancy', function (done) {
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
      darth.filters([Konva.Filters.HSL]);
      darth.luminance(1.0);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1.0,
        luminance: -1.0,
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
  it('HSL saturation tween transparancy', function (done) {
    var stage = addStage();

    loadImage('lion.png', (imageObj) => {
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
      darth.filters([Konva.Filters.HSL]);
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
});
