import {
  addStage,
  Konva,
  cloneAndCompareLayer,
  loadImage,
  compareLayers,
} from '../unit/test-utils';

describe('Filter', function () {
  it('pixelRaio check', function () {
    Konva.pixelRatio = 2;
    var stage = addStage();
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: stage.width() / 2,
      y: stage.height() / 2,
      fill: 'red',
      stroke: 'green',
      radius: 15,
    });

    layer.add(circle);
    stage.add(layer);
    circle.cache();
    circle.filters([Konva.Filters.Blur]);
    circle.blurRadius(0);
    layer.draw();

    cloneAndCompareLayer(layer, 150);
    Konva.pixelRatio = 1;
  });

  // Blur filter comparison
  it('native CSS blur vs Konva blur comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['blur(10px)']);

      // Apply equivalent Konva filter (CSS 10px = Konva 5 due to scaling)
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Blur]);
      imageKonva.blurRadius(5); // 10px * 0.5 scaling factor

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2, 150, 150);

      done();
    });
  });

  // Brightness filter comparison
  it('native CSS brightness vs Konva brightness comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter (1.3 = 30% brighter)
      imageCSS.cache();
      imageCSS.filters(['brightness(150%)']);

      // Apply equivalent Konva filter (CSS 1.5 = Konva 1.5 multiplier)
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Brightness]);
      imageKonva.brightness(1.5);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Contrast filter comparison
  it('native CSS contrast vs Konva contrast comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter (1.2 = 20% more contrast)
      imageCSS.cache();
      imageCSS.filters(['contrast(1.2)']);

      // Apply equivalent Konva filter (CSS 1.2 should now match with square root conversion)
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Contrast]);
      // Manual calculation: 100 * (√1.2 - 1) ≈ 100 * (1.095 - 1) = 9.54
      imageKonva.contrast(100 * (Math.sqrt(1.2) - 1));

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Grayscale filter comparison
  it('native CSS grayscale vs Konva grayscale comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['grayscale(1)']);

      // Apply equivalent Konva filter
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Grayscale]);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2, 10);

      done();
    });
  });

  // Sepia filter comparison
  it('native CSS sepia vs Konva sepia comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['sepia(1)']);

      // Apply equivalent Konva filter
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Sepia]);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Invert filter comparison
  it('native CSS invert vs Konva invert comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Native CSS filter image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Konva function filter image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply CSS filter
      imageCSS.cache();
      imageCSS.filters(['invert(1)']);

      // Apply equivalent Konva filter
      imageKonva.cache();
      imageKonva.filters([Konva.Filters.Invert]);

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2);

      done();
    });
  });

  // Multiple filters comparison (mixed CSS and function)
  it('multiple mixed filters comparison', function (done) {
    loadImage('darth-vader.jpg', (imageObj) => {
      const oldPixelRatio = Konva.pixelRatio;
      Konva.pixelRatio = 1;
      var stage = addStage();

      var layer1 = new Konva.Layer();
      var layer2 = new Konva.Layer();

      // Mixed CSS filters image
      var imageCSS = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      // Equivalent Konva function filters image
      var imageKonva = new Konva.Image({
        image: imageObj,
        draggable: true,
      });

      layer1.add(imageCSS);
      layer2.add(imageKonva);
      stage.add(layer1);
      stage.add(layer2);

      // Apply multiple CSS filters
      imageCSS.cache();
      imageCSS.filters([
        'blur(10px)',
        'brightness(1.2)',
        'contrast(1.1)',
        'sepia(1)',
      ]);

      // Apply equivalent Konva filters
      imageKonva.cache();
      imageKonva.filters([
        Konva.Filters.Blur,
        Konva.Filters.Brightness,
        Konva.Filters.Contrast,
        Konva.Filters.Sepia,
      ]);
      imageKonva.blurRadius(20); // 20px * 0.5 scaling factor
      imageKonva.brightness(1.2); // CSS 1.2 = Konva 1.2 multiplier
      imageKonva.contrast(100 * (Math.sqrt(1.1) - 1)); // CSS 1.1 = Konva 110 percentage

      stage.draw();

      Konva.pixelRatio = oldPixelRatio;
      // Compare the results
      compareLayers(layer1, layer2, 150, 200);

      done();
    });
  });
});
