import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('Kaleidoscope', function () {
  // ======================================================
  it('basic', function (done) {
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
      darth.filters([Konva.Filters.Kaleidoscope]);
      darth.kaleidoscopePower(2);

      assert.equal(darth.kaleidoscopePower(), 2);
      assert.equal(darth._filterUpToDate, false);

      layer.draw();

      assert.equal(darth._filterUpToDate, true);

      darth.kaleidoscopePower(3);

      assert.equal(darth.kaleidoscopePower(), 3);
      assert.equal(darth._filterUpToDate, false);

      layer.draw();

      assert.equal(darth._filterUpToDate, true);

      done();
    });
  });

  // ======================================================
  it('tween angle', function (done) {
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
      darth.filters([Konva.Filters.Kaleidoscope]);
      darth.kaleidoscopePower(3);
      darth.kaleidoscopeAngle(0);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 10.0,
        kaleidoscopeAngle: 720,
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
  it('tween power', function (done) {
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
      darth.filters([Konva.Filters.Kaleidoscope]);
      darth.kaleidoscopePower(0);
      darth.kaleidoscopeAngle(0);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 2.0,
        kaleidoscopePower: 8,
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
