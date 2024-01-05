import { addStage, Konva, loadImage } from '../unit/test-utils';
import { cloneAndCompareLayer } from '../unit/test-utils';

describe('Pixelate', function () {
  // ======================================================
  it('tween pixelate', function (done) {
    var stage = addStage();

    loadImage('darth-vader.jpg', (imageObj) => {
      var layer = new Konva.Layer();
      const lion = new Konva.Image({
        x: 10,
        y: 10,
        image: imageObj,
        draggable: true,
      });

      layer.add(lion);
      stage.add(layer);

      lion.cache();
      lion.filters([Konva.Filters.Pixelate]);
      lion.pixelSize(16);
      layer.draw();

      var tween = new Konva.Tween({
        node: lion,
        duration: 3.0,
        pixelSize: 1,
        easing: Konva.Easings.EaseInOut,
      });

      lion.on('mouseover', function () {
        tween.play();
      });

      lion.on('mouseout', function () {
        tween.reverse();
      });

      done();
    });
  });

  it('make sure we have no extra transparent pixels', function (done) {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    Konva.Image.fromURL(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGUAAABmCAYAAADS6F9hAAAAAXNSR0IArs4c6QAAAXJJREFUeF7t1cEJADAMw8B2/6Fd6BT3UCYQEiZ3205HGbhFoXp8mKJ4TYoCNilKUUQDIFM/pSigARCppRQFNAAitZSigAZApJZSFNAAiNRSigIaAJFaSlFAAyBSSykKaABEailFAQ2ASC2lKKABEKmlFAU0ACK1lKKABkCkllIU0ACI1FKKAhoAkVpKUUADIFJLKQpoAERqKUUBDYBILaUooAEQqaUUBTQAIrWUooAGQKSWUhTQAIjUUooCGgCRWkpRQAMgUkspCmgARGopRQENgEgtpSigARCppRQFNAAitZSigAZApJZSFNAAiNRSigIaAJFaSlFAAyBSSykKaABEailFAQ2ASC2lKKABEKmlFAU0ACK1lKKABkCkllIU0ACI1FKKAhoAkVpKUUADIFJLKQpoAERqKUUBDYBILaUooAEQqaUUBTQAIrWUooAGQKSWUhTQAIjUUooCGgCRWkpRQAMgUkspCmgARGopRQENgEgPgGOW3jCsp3sAAAAASUVORK5CYII=',
      function (image) {
        layer.add(image);

        image.cache();
        image.filters([Konva.Filters.Pixelate]);
        image.pixelSize(4);
        layer.draw();
        cloneAndCompareLayer(layer);

        done();
      }
    );
  });
});
