import { assert } from 'chai';
import { addStage, Konva } from './test-utils.ts';
import { isCSSFiltersSupported } from '../../src/Context.ts';

describe('Context', function () {
  // ======================================================
  var contextMethods = [
    'clearRect',
    'fillRect',
    'strokeRect',
    'fillText',
    'strokeText',
    'measureText',
    'createLinearGradient',
    'createRadialGradient',
    'createPattern',
    'beginPath',
    'closePath',
    'moveTo',
    'lineTo',
    'bezierCurveTo',
    'quadraticCurveTo',
    'arc',
    'arcTo',
    'rect',
    'roundRect',
    'ellipse',
    'fill',
    'stroke',
    'clip',
    'isPointInPath',
    'scale',
    'rotate',
    'translate',
    'transform',
    'setTransform',
    'drawImage',
    'createImageData',
    'getImageData',
    'putImageData',
    'save',
    'restore',
  ];

  var contextProperties = [
    'fillStyle',
    'strokeStyle',
    'shadowColor',
    'shadowBlur',
    'shadowOffsetX',
    'shadowOffsetY',
    'lineCap',
    'lineDashOffset',
    'lineJoin',
    'lineWidth',
    'miterLimit',
    'font',
    'textAlign',
    'textBaseline',
    'globalAlpha',
    'globalCompositeOperation',
  ] as const;

  it('context wrapper should work like native context', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 100,
      y: 70,
      radius: 70,
      fill: 'green',
      stroke: 'blue',
      strokeWidth: 4,
      draggable: true,
    });

    layer.add(circle);
    stage.add(layer);

    var context = layer.getContext();
    var nativeContext = context._context;

    contextMethods.forEach(function (method) {
      assert.equal(
        typeof nativeContext[method],
        'function',
        'native context has no method ' + method
      );
      assert.equal(
        typeof context[method],
        'function',
        'context wrapper has no method ' + method
      );
    });

    contextProperties.forEach(function (prop) {
      assert.equal(
        nativeContext[prop] !== undefined,
        true,
        'native context has no property ' + prop
      );
      assert.equal(
        context[prop] !== undefined,
        true,
        'context wrapper has no property ' + prop
      );
    });

    // test get
    nativeContext.fillStyle = '#ff0000';
    assert.equal(context.fillStyle, '#ff0000');

    // test set
    context.globalAlpha = 0.5;
    assert.equal(context.globalAlpha, 0.5);
  });

  it('isCSSFiltersSupported creates at most one probe canvas and releases it', function () {
    const created: any[] = [];
    const original = Konva.Util.createCanvasElement;
    Konva.Util.createCanvasElement = function () {
      const canvas = original.call(this);
      created.push(canvas);
      return canvas;
    };
    try {
      isCSSFiltersSupported();
      isCSSFiltersSupported();
    } finally {
      Konva.Util.createCanvasElement = original;
    }
    assert.isAtMost(created.length, 1, 'result is memoized');
    created.forEach((canvas) => {
      assert.equal(canvas.width, 0, 'probe canvas is released');
    });
  });
});

describe('Stroke rendering', function () {
  it('disabling stroke shadows preserves a fill drawn after the stroke', function () {
    const stage = addStage(),
      layer = new Konva.Layer();
    stage.add(layer);
    layer.add(
      new Konva.Rect({
        x: 20,
        y: 20,
        width: 20,
        height: 20,
        fill: 'red',
        stroke: 'blue',
        shadowColor: 'black',
        shadowOffsetX: 40,
        shadowForStrokeEnabled: false,
        fillAfterStrokeEnabled: true,
        perfectDrawEnabled: false,
      })
    );
    layer.draw();
    assert.deepEqual(
      Array.from(layer.getContext().getImageData(70, 30, 1, 1).data),
      [0, 0, 0, 255]
    );
  });

  it('an unscaled gradient stroke stays in the shape coordinate space', function () {
    const stage = addStage(),
      layer = new Konva.Layer();
    stage.add(layer);
    layer.add(
      new Konva.Rect({
        x: 100,
        y: 40,
        width: 100,
        height: 40,
        strokeWidth: 10,
        strokeScaleEnabled: false,
        strokeLinearGradientStartPoint: { x: 0, y: 0 },
        strokeLinearGradientEndPoint: { x: 100, y: 0 },
        strokeLinearGradientColorStops: [0, 'red', 1, 'blue'],
      })
    );
    layer.draw();
    const pixel = layer.getContext().getImageData(110, 40, 1, 1).data;
    assert.isAbove(pixel[0], 200);
    assert.isBelow(pixel[2], 40);
  });
  it('an unscaled diagonal gradient preserves colors under nonuniform scaling', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(
      new Konva.Rect({
        x: 30,
        y: 30,
        width: 100,
        height: 100,
        scaleX: 2,
        strokeWidth: 10,
        strokeScaleEnabled: false,
        strokeLinearGradientStartPoint: { x: 0, y: 0 },
        strokeLinearGradientEndPoint: { x: 100, y: 100 },
        strokeLinearGradientColorStops: [0, 'red', 1, 'blue'],
      })
    );
    layer.draw();
    const pixel = layer.getContext().getImageData(130, 30, 1, 1).data;
    assert.closeTo(pixel[0], 190, 1);
    assert.closeTo(pixel[2], 65, 1);
    assert.equal(pixel[3], 255);
  });
});
