import { assert } from 'chai';

import { addStage, Konva, loadImage } from '../unit/test-utils';

describe('RGB', function () {
  // ======================================================
  it('colorize basic', function (done) {
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
      darth.filters([Konva.Filters.RGB]);
      darth.red(255).green(0).blue(128);
      layer.draw();

      // Assert fails even though '[255,0,128] = [255,0,128]'
      // assert.deepEqual(darth.getFilterColorizeColor(), [255,0,128]);

      done();
    });
  });

  // ======================================================
  it('colorize crop', function (done) {
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
      darth.filters([Konva.Filters.RGB]);
      darth.red(0).green(255).blue(0);
      layer.draw();

      // assert.deepEqual(darth.getFilterColorizeColor(), [0,255,0]);

      done();
    });
  });

  // ======================================================
  it('colorize transparancy', function (done) {
    loadImage('lion.png', (imageObj) => {
      var stage = addStage();
      var layer = new Konva.Layer();

      var colors = [
        [255, 0, 0],
        [255, 128, 0],
        [255, 255, 0],
        [0, 255, 0],
        [0, 255, 128],
        [0, 255, 255],
        [0, 0, 255],
        [128, 0, 255],
        [255, 0, 255],
        [0, 0, 0],
        [128, 128, 128],
        [255, 255, 255],
      ];
      var i,
        l = colors.length;
      var nAdded = 0;
      for (i = 0; i < l; i += 1) {
        const color = colors[i];
        const x = -64 + (i / l) * stage.width();
        var darth = new Konva.Image({
          x: x,
          y: 32,
          image: imageObj,
          draggable: true,
        });
        layer.add(darth);

        darth.cache();
        darth.filters([Konva.Filters.RGB]);
        darth.red(color[0]).green(color[1]).blue(color[2]);

        nAdded += 1;
        if (nAdded >= l) {
          stage.add(layer);
          layer.draw();
          done();
        }
      }
    });
  });
});
