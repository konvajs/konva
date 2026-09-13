import { assert } from 'chai';
import {
  addStage,
  Konva,
  cloneAndCompareLayer,
  loadImage,
  compareLayers,
  assertAlmostDeepEqual,
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

  it('a filter chain uploads the image data once', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 50,
      height: 50,
      fill: 'red',
    });
    layer.add(rect);
    rect.cache();
    rect.filters([
      Konva.Filters.Invert,
      Konva.Filters.Grayscale,
      Konva.Filters.Brighten,
    ]);
    stage.add(layer);

    const trace = rect._getCanvasCache().filter.getContext().getTrace(true);
    assert.equal(trace.split('putImageData()').length - 1, 1);
  });

  function uniformImageData(rgba: number[]) {
    const context = Konva.Util.createCanvasElement().getContext('2d')!;
    const imageData = context.createImageData(20, 20);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data.set(rgba, i);
    }
    return imageData;
  }
  function centerPixel(imageData) {
    const i = (10 * imageData.width + 10) * 4;
    return Array.from(imageData.data.slice(i, i + 4));
  }

  it('Blur keeps the colour of semi-transparent pixels', function () {
    const imageData = uniformImageData([200, 100, 50, 128]);

    Konva.Filters.Blur.call({ blurRadius: () => 5 }, imageData);

    assertAlmostDeepEqual(centerPixel(imageData), [200, 100, 50, 128], 3);
  });

  it('Blur keeps a 1 pixel tall image', function () {
    const context = Konva.Util.createCanvasElement().getContext('2d')!;
    const imageData = context.createImageData(5, 1);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data.set([200, 100, 50, 255], i);
    }

    Konva.Filters.Blur.call({ blurRadius: () => 2 }, imageData);

    assertAlmostDeepEqual(
      Array.from(imageData.data.slice(8, 12)),
      [200, 100, 50, 255],
      3
    );
  });

  it('Blur with a huge radius does not blank the image', function () {
    const imageData = uniformImageData([255, 0, 0, 255]);

    Konva.Filters.Blur.call({ blurRadius: () => 200 }, imageData);

    assertAlmostDeepEqual(centerPixel(imageData), [255, 0, 0, 255], 3);
  });

  it('red, green and blue clamp, round and invalidate the filter', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);
    var rect = new Konva.Rect({ width: 10, height: 10, fill: 'red' });
    layer.add(rect);
    rect.cache();
    rect.filters([Konva.Filters.RGBA]);
    layer.draw();
    assert.equal(rect._filterUpToDate, true);

    rect.red(300);
    assert.equal(rect.red(), 255);
    assert.equal(rect._filterUpToDate, false);
    layer.draw();
    rect.green(-5);
    assert.equal(rect.green(), 0);
    assert.equal(rect._filterUpToDate, false);
    layer.draw();
    rect.blue(10.6);
    assert.equal(rect.blue(), 11);
    assert.equal(rect._filterUpToDate, false);
  });

  it('HSL and HSV hue wraps around below -360 and above 360', function () {
    [Konva.Filters.HSL, Konva.Filters.HSV].forEach((filter) => {
      var results = [-400, -40, 320, 680].map((hue) => {
        var rect = new Konva.Rect({ width: 4, height: 4, fill: '#8040c0' });
        rect.cache();
        rect.filters([filter]);
        rect.hue(hue);
        var canvas = rect._getCachedSceneCanvas();
        return Array.from(canvas.getContext().getImageData(1, 1, 1, 1).data);
      });
      results.forEach((pixel) => assert.deepEqual(pixel, results[0]));
    });
  });
});

describe('Filter', function () {
  function pixels(rgba: number[], width = 3, height = 3) {
    const data = Konva.Util.createCanvasElement()
      .getContext('2d')!
      .createImageData(width, height);
    for (let i = 0; i < data.data.length; i += 4) data.data.set(rgba, i);
    return data;
  }

  it('Brightness defaults to identity and keeps an explicit zero', function () {
    const rect = new Konva.Rect();
    try {
      const data = pixels([120, 80, 40, 255]);
      Konva.Filters.Brightness.call(rect, data);
      assert.deepEqual(Array.from(data.data.slice(0, 4)), [120, 80, 40, 255]);
      rect.brightness(0);
      Konva.Filters.Brightness.call(rect, data);
      assert.deepEqual(Array.from(data.data.slice(0, 4)), [0, 0, 0, 255]);
    } finally {
      rect.destroy();
    }
  });

  it('Threshold has its documented default even with Mask imported', function () {
    const rect = new Konva.Rect();
    try {
      assert.equal(rect.threshold(), 0.5);
      const data = pixels([40, 140, 200, 255]);
      Konva.Filters.Threshold.call(rect, data);
      assert.deepEqual(Array.from(data.data.slice(0, 4)), [0, 255, 255, 255]);
    } finally {
      rect.destroy();
    }
  });

  it('Emboss processes borders and one-pixel images', function () {
    const rect = new Konva.Rect();
    try {
      for (const [width, height] of [
        [3, 3],
        [1, 3],
        [3, 1],
        [1, 1],
      ]) {
        const data = pixels([200, 40, 80, 128], width, height);
        Konva.Filters.Emboss.call(rect, data);
        for (let i = 0; i < data.data.length; i += 4) {
          assert.deepEqual(
            Array.from(data.data.slice(i, i + 4)),
            [128, 128, 128, 128]
          );
        }
      }
    } finally {
      rect.destroy();
    }
  });

  it('CSS fallback applies a chain without changing node attributes', function () {
    const rect = new Konva.Rect({
      width: 10,
      height: 10,
      fill: 'rgb(80,40,20)',
      brightness: 0.6,
    });
    try {
      let changes = 0;
      rect.on('brightnessChange', () => changes++);
      rect.filters([
        'brightness(200%) invert(1)',
        function () {
          assert.equal(this.brightness(), 0.6);
        },
      ]);
      rect.cache();
      const canvas = rect.toCanvas({ x: 0, y: 0, width: 10, height: 10 });
      assert.deepEqual(
        Array.from(canvas.getContext('2d')!.getImageData(5, 5, 1, 1).data),
        [95, 175, 215, 255]
      );
      assert.equal(rect.brightness(), 0.6);
      assert.equal(changes, 0);
    } finally {
      rect.destroy();
    }
  });

  it('CSS fallback honors zero and partial amounts', function () {
    for (const [filter, expected] of [
      ['grayscale(0) sepia(0) invert(0) contrast(100%)', [80, 40, 20, 255]],
      ['invert(50%)', [128, 128, 128, 255]],
    ] as const) {
      const rect = new Konva.Rect({
        width: 10,
        height: 10,
        fill: 'rgb(80,40,20)',
        filters: [filter, function () {}],
      });
      try {
        rect.cache();
        const canvas = rect.toCanvas({ x: 0, y: 0, width: 10, height: 10 });
        assert.deepEqual(
          Array.from(canvas.getContext('2d')!.getImageData(5, 5, 1, 1).data),
          Array.from(expected)
        );
      } finally {
        rect.destroy();
      }
    }
  });
  it('partial sepia blends before clipping bright channels', function () {
    const rect = new Konva.Rect({
      width: 10,
      height: 10,
      fill: 'rgb(200,200,200)',
      filters: ['sepia(50%)', function () {}],
    });
    try {
      rect.cache();
      const canvas = rect.toCanvas();
      assert.deepEqual(
        Array.from(canvas.getContext('2d')!.getImageData(5, 5, 1, 1).data),
        [235, 220, 194, 255]
      );
    } finally {
      rect.destroy();
    }
  });
});
