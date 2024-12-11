import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('Mask', function () {
  // ======================================================
  it('basic', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer({
        throttle: 999,
      });
      var bamoon = new Konva.Image({
          x: 0,
          y: 0,
          image: imageObj,
          draggable: true,
        }),
        filtered = new Konva.Image({
          x: 300,
          y: 0,
          image: imageObj,
          draggable: true,
        });

      layer.add(bamoon);
      layer.add(filtered);
      stage.add(layer);

      filtered.cache();
      filtered.filters([Konva.Filters.Mask]);
      filtered.threshold(10);

      layer.draw();

      done();
    });
  });
});
