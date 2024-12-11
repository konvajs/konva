import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('Threshold', function () {
  // ======================================================
  it('image tween', function (done) {
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
      darth.filters([Konva.Filters.Threshold]);
      darth.threshold(1);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 5.0,
        threshold: 0,
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
