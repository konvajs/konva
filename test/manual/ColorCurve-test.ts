import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('Filter ColorCurve', function () {
  // ======================================================
  it('basic', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.ColorCurve]);
      darth.colorCurve({red: 0.8});
      layer.draw();

      assert.equal(darth.colorCurve().red, 0.8);

      done();
    });
  });

  // ======================================================
  it('tween', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.ColorCurve]);
      darth.colorCurve({red: 0.8});
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 2.0,
        contrast: 0,
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
  it('crop', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      var darth = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        crop: { x: 128, y: 48, width: 256, height: 128 },
        draggable: true,
      });

      layer.add(darth);
      stage.add(layer);

      darth.cache();
      darth.filters([Konva.Filters.ColorCurve]);
      darth.colorCurve({red: 0.8});
      layer.draw();

      assert.equal(darth.colorCurve().red, 0.8);

      done();
    });
  });
});
