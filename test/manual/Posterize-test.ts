import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('Posterize', function () {
  // ======================================================
  it('on image tween', function (done) {
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
      darth.filters([Konva.Filters.Posterize]);
      darth.levels(0.2);
      layer.draw();

      var tween = new Konva.Tween({
        node: darth,
        duration: 1.0,
        levels: 0,
        easing: Konva.Easings.Linear,
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
