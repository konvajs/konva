import {
  addStage,
  cloneAndCompareLayer,
  collectCanvasAllocations,
  compareCanvases,
  compareCanvasEdges,
  isNode,
  Konva,
} from './test-utils.ts';
import { assert } from 'chai';

function pixel(canvas: HTMLCanvasElement, x: number, y: number) {
  return Array.from(canvas.getContext('2d')!.getImageData(x, y, 1, 1).data);
}

function withOpacity(source: HTMLCanvasElement, opacity: number) {
  const canvas = Konva.Util.createCanvasElement();
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext('2d')!;
  context.globalAlpha = opacity;
  context.drawImage(source, 0, 0);
  return canvas;
}

describe('Isolated groups', function () {
  it('does not repeatedly measure the same glyphs for isolation bounds', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    const group = new Konva.Group().add(
      new Konva.Text({
        text: 'A B C '.repeat(150),
        width: 500,
        fontSize: 16,
        align: 'justify',
        fill: 'red',
      })
    );
    stage.add(layer.add(group));
    const prototype = Object.getPrototypeOf(layer.getContext()._context);
    const measureText = prototype.measureText;
    let calls = 0;
    prototype.measureText = function (text: string) {
      calls++;
      return measureText.call(this, text);
    };
    try {
      layer.drawScene();
      const plainCalls = calls;
      calls = 0;
      group.isolated(true);
      layer.drawScene();
      assert.isBelow(
        calls - plainCalls,
        50,
        'additional native text measurements per draw'
      );
    } finally {
      prototype.measureText = measureText;
      stage.destroy();
    }
  });

  it('sizes perfect-draw buffers to the shape, not the group', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const group = new Konva.Group({ isolated: true }).add(
      new Konva.Rect({
        width: 50,
        height: 50,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4,
        opacity: 0.5,
      }),
      new Konva.Rect({ x: 500, y: 500, width: 10, height: 10, fill: 'blue' })
    );
    stage.add(layer.add(group));
    const prototype = Object.getPrototypeOf(layer.getContext()._context);
    const drawImage = prototype.drawImage;
    const widths: number[] = [];
    prototype.drawImage = function (source: any, ...rest: any[]) {
      widths.push(source.width);
      return drawImage.call(this, source, ...rest);
    };
    try {
      layer.drawScene();
    } finally {
      prototype.drawImage = drawImage;
      stage.destroy();
    }
    assert.isAtMost(Math.min(...widths), 60);
  });

  it('does not reallocate the surface on every frame of a growing group', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    const group = new Konva.Group({ isolated: true }).add(
      new Konva.Rect({ width: 20, height: 20, fill: 'red' })
    );
    stage.add(layer.add(group));
    const allocations = collectCanvasAllocations(() => {
      for (let frame = 0; frame < 30; frame++) {
        group.scale({ x: 1 + frame * 0.2, y: 1 + frame * 0.2 });
        layer.drawScene();
      }
    });
    stage.destroy();
    assert.isBelow(allocations.length, 10);
  });

  it('grows the surface only in the direction a group grows', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const rect = new Konva.Rect({ width: 50, height: 10, fill: 'red' });
    stage.add(layer.add(new Konva.Group({ isolated: true }).add(rect)));
    const allocations = collectCanvasAllocations(() => {
      for (let frame = 0; frame < 60; frame++) {
        rect.height(10 + frame * 3);
        layer.drawScene();
      }
    });
    assert.isBelow(allocations.length, 12);
    assert.isAtMost(layer.getCanvas()._isolationCanvas!.width, 60);
    stage.destroy();
  });

  it('keeps a surface shared by a wide and a tall buffer across frames', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    const line = { stroke: 'black', strokeWidth: 4, opacity: 0.5 };
    layer.add(
      new Konva.Rect({ ...line, width: 500, height: 4, fill: 'red' }),
      new Konva.Rect({ ...line, width: 4, height: 500, fill: 'red' })
    );
    stage.add(layer);
    layer.drawScene();
    layer.drawScene();
    const surface = layer.getCanvas()._isolationCanvas;
    assert.isDefined(surface);
    layer.drawScene();
    assert.strictEqual(layer.getCanvas()._isolationCanvas, surface);
    stage.destroy();
  });

  it('keeps the surface while content alternates between sizes', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({ width: 500, height: 500, fill: 'red' });
    stage.add(layer.add(new Konva.Group({ isolated: true }).add(rect)));
    layer.drawScene();
    const allocations = collectCanvasAllocations(() => {
      for (let frame = 0; frame < 60; frame++) {
        rect.size({
          width: frame % 2 ? 20 : 500,
          height: frame % 2 ? 20 : 500,
        });
        layer.drawScene();
      }
    });
    assert.equal(allocations.length, 0);
    stage.destroy();
  });

  it('frees surfaces a layer no longer uses or uses a small part of', function () {
    const stage = addStage({ width: 600, height: 600 });
    const layer = new Konva.Layer();
    const big = new Konva.Rect({ width: 500, height: 500, fill: 'red' });
    const group = new Konva.Group({ isolated: true }).add(big);
    stage.add(layer.add(group));
    const surface = () => layer.getCanvas()._isolationCanvas;
    const draw = (frames: number) => {
      for (let i = 0; i < frames; i++) layer.drawScene();
    };
    draw(1);
    assert.isAtLeast(surface()!.width, 500);
    big.size({ width: 20, height: 20 });
    draw(9);
    assert.isAtLeast(surface()!.width, 500, 'kept while usage may come back');
    draw(1);
    assert.isUndefined(surface());
    draw(1);
    assert.isAtMost(surface()!.width, 100);
    group.isolated(false);
    draw(10);
    assert.isUndefined(surface());
    stage.destroy();
  });

  it('keeps stroke padding tight when paths have no sharp joins', function () {
    for (const [shape, maxWidth, maxHeight] of [
      [new Konva.Rect({ width: 100, height: 100 }), 114, 114],
      [new Konva.Circle({ radius: 50 }), 114, 114],
      [new Konva.Ellipse({ radiusX: 50, radiusY: 30 }), 114, 74],
      [new Konva.Ring({ innerRadius: 20, outerRadius: 50 }), 114, 114],
      [new Konva.Line({ points: [0, 0, 100, 0] }), 114, 14],
      [
        new Konva.Line({ points: [0, 0, 100, 100], lineCap: 'square' }),
        118,
        118,
      ],
      [
        new Konva.Line({
          points: [0, 0, 100, 0],
          strokeScaleEnabled: false,
          scaleX: 2,
          scaleY: 3,
        }),
        214,
        14,
      ],
    ] as const) {
      shape.stroke('red').strokeWidth(10);
      const stage = addStage({ width: 600, height: 600 });
      const layer = new Konva.Layer();
      layer.getCanvas().setPixelRatio(1);
      layer.add(new Konva.Group({ x: 200, y: 200, isolated: true }).add(shape));
      stage.add(layer);
      const ctx = layer.getNativeCanvasElement().getContext('2d')!;
      const original = ctx.drawImage;
      let width = 0,
        height = 0;
      ctx.drawImage = function (...args: any[]) {
        width = args[0].width;
        height = args[0].height;
        original.apply(this, args as any);
      };
      try {
        layer.drawScene();
        assert.isAtMost(width, maxWidth);
        assert.isAtMost(height, maxHeight);
      } finally {
        ctx.drawImage = original;
        stage.destroy();
      }
    }
  });

  it('includes negative letter spacing in text bounds', function () {
    const group = new Konva.Group({ x: 200, y: 200 }).add(
      new Konva.Text({
        text: 'WWWWWWiiiiii',
        letterSpacing: -30,
        fontFamily: 'Arial',
        fontSize: 50,
        fill: 'red',
      })
    );
    const config = { x: 0, y: 0, width: 600, height: 400, pixelRatio: 1 };
    const expected = group.toCanvas(config);
    group.isolated(true);
    compareCanvasEdges(group.toCanvas(config), expected);
    group.destroy();
  });

  it('includes negative underline offsets in isolation bounds', function () {
    const group = new Konva.Group();
    group.add(
      new Konva.Text({
        x: 100,
        y: 100,
        text: 'ABC',
        fontSize: 30,
        fill: 'red',
        textDecoration: 'underline',
        underlineOffset: -80,
      })
    );
    const config = { x: 0, y: 0, width: 300, height: 200, pixelRatio: 1 };
    const expected = group.toCanvas(config);
    group.isolated(true);
    compareCanvasEdges(group.toCanvas(config), expected);
    group.destroy();
  });

  it('bounds TextPath baselines for isolation', function () {
    for (const textBaseline of [
      'top',
      'bottom',
      'middle',
      'alphabetic',
      'hanging',
    ]) {
      const group = new Konva.Group({ x: 80, y: 120 });
      group.add(
        new Konva.TextPath({
          data: 'M0,0 L250,0',
          text: 'Hello',
          fontSize: 70,
          fontFamily: 'Arial',
          textBaseline,
          fill: 'red',
        })
      );
      const config = { x: 0, y: 0, width: 500, height: 300, pixelRatio: 1 };
      const expected = group.toCanvas(config);
      group.isolated(true);
      compareCanvasEdges(group.toCanvas(config), expected);
      group.destroy();
    }
  });

  it('isolation bounds include italic overhang', function () {
    for (const attrs of [
      { text: 'fff', fontStyle: 'italic', fontFamily: 'Georgia' },
      { text: 'Việt ẫ Ậ', fontFamily: 'Arial' },
    ]) {
      const group = new Konva.Group({ x: 150, y: 180 }).add(
        new Konva.Text({
          fontSize: 70,
          fill: 'red',
          ...attrs,
        })
      );
      const config = { x: 0, y: 0, width: 500, height: 350, pixelRatio: 1 };
      const expected = group.toCanvas(config);
      group.isolated(true);
      compareCanvasEdges(group.toCanvas(config), expected);
      group.destroy();
    }
  });

  it('preserves inherited RTL direction, including perfect drawing', function () {
    for (const stroke of [undefined, 'blue']) {
      const stage = addStage({ width: 400, height: 140 });
      const layer = new Konva.Layer();
      layer.getCanvas().setPixelRatio(1);
      const group = new Konva.Group({ x: 30, y: 30 });
      const text = new Konva.Text({
        text: 'שלום עולם',
        fontSize: 40,
        letterSpacing: 2,
        fill: 'red',
        stroke,
        strokeWidth: 2,
        opacity: 0.7,
        direction: 'rtl',
      });
      group.add(text);
      layer.add(group);
      stage.add(layer);
      layer.getContext().direction = 'rtl';
      layer.drawScene();
      const expected = Konva.Util.createCanvasElement();
      expected.width = 400;
      expected.height = 140;
      const ctx = expected.getContext('2d')!;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(layer.getNativeCanvasElement(), 0, 0);
      text.direction('inherit');
      group.isolated(true).opacity(0.5);
      layer.drawScene();
      compareCanvasEdges(layer.getNativeCanvasElement(), expected);
      stage.destroy();
    }
  });

  it('copies device pixels without filtering and preserves child smoothing', function () {
    const stage = addStage({ width: 100, height: 100 });
    const layer = new Konva.Layer();
    const group = new Konva.Group({ isolated: true });
    let childSmoothing: boolean | undefined;
    group.add(
      new Konva.Shape({
        width: 100,
        height: 100,
        sceneFunc(context) {
          childSmoothing = context.imageSmoothingEnabled;
          context.fillStyle = 'red';
          context.fillRect(10, 10, 20, 20);
        },
      })
    );
    layer.add(group);
    stage.add(layer);
    const context = layer.getNativeCanvasElement().getContext('2d')!;
    const drawImage = context.drawImage;
    const copies: boolean[] = [];
    context.drawImage = function (...args: any[]) {
      copies.push(this.imageSmoothingEnabled);
      drawImage.apply(this, args as any);
    };
    try {
      for (const smoothing of [true, false]) {
        context.imageSmoothingEnabled = smoothing;
        layer.drawScene();
        assert.equal(childSmoothing, smoothing);
        assert.equal(context.imageSmoothingEnabled, smoothing);
      }
      assert.deepEqual(copies, [false, false]);
    } finally {
      context.drawImage = drawImage;
    }
  });

  it('does not clip radial shapes whose inner radius exceeds their outer radius', function () {
    for (const Shape of [Konva.Ring, Konva.Star, Konva.Arc]) {
      for (const [innerRadius, outerRadius] of [
        [10, 30],
        [-10, 30],
        [10, -30],
        [-10, -30],
        [30, 10],
        [-30, 10],
        [30, -10],
        [-30, -10],
      ]) {
        const group = new Konva.Group({ x: 50, y: 50 });
        group.add(
          new Shape({
            innerRadius,
            outerRadius,
            numPoints: 5,
            angle: 270,
            fill: 'red',
          })
        );
        const config = { x: 0, y: 0, width: 100, height: 100, pixelRatio: 1.5 };
        const source = group.toCanvas(config);
        const expected = withOpacity(source, 0.5);
        group.isolated(true).opacity(0.5);
        compareCanvasEdges(group.toCanvas(config), expected);
        group.destroy();
        Konva.Util.releaseCanvas(source, expected);
      }
    }
  });

  it('matches native compositing for bounded built-in paths and sprites', function () {
    const image = Konva.Util.createCanvasElement();
    image.width = image.height = 10;
    const imageContext = image.getContext('2d')!;
    imageContext.fillStyle = 'blue';
    imageContext.fillRect(0, 0, 10, 10);
    const shapes = [
      new Konva.Rect({ width: 30, height: 20, cornerRadius: 8 }),
      new Konva.Image({ image, width: 30, height: 20, cornerRadius: 8 }),
      new Konva.Circle({ radius: -25 }),
      new Konva.Ellipse({ radiusX: -25, radiusY: 15 }),
      new Konva.RegularPolygon({ sides: 5, radius: -30 }),
      new Konva.Wedge({ radius: -30, angle: 240 }),
      new Konva.Line({ points: [-25, -15, 20, -10, 0, 30], closed: true }),
      new Konva.Line({
        points: [-25, -15, 20, -10, 0, 30],
        tension: 0.5,
        closed: true,
      }),
      new Konva.Arrow({
        points: [-25, -15, 20, 20],
        pointerLength: -15,
        pointerWidth: 20,
        pointerAtBeginning: true,
      }),
      new Konva.Path({ data: 'M-30 0C-20 -60 50 50 30 0Q0 60 -30 0Z' }),
      new Konva.Sprite({
        image: image as any,
        animation: 'idle',
        animations: { idle: [0, 0, 10, 10] },
      }),
    ];
    for (const shape of shapes) {
      shape.fill('red');
      const group = new Konva.Group({ x: 60, y: 60 });
      group.add(shape);
      const config = { x: 0, y: 0, width: 120, height: 120, pixelRatio: 1.5 };
      const source = group.toCanvas(config);
      const expected = withOpacity(source, 0.5);
      group.isolated(true).opacity(0.5);
      compareCanvasEdges(group.toCanvas(config), expected);
      group.destroy();
      Konva.Util.releaseCanvas(source, expected);
    }
    Konva.Util.releaseCanvas(image);
  });

  it('clamps buffer capacity to a fractional destination', function () {
    const stage = addStage({ width: 41.5, height: 31.5 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1.5);
    let size: number[] = [];
    const group = new Konva.Group({ isolated: true });
    group.add(
      new Konva.Shape({
        width: 100,
        height: 100,
        sceneFunc(ctx) {
          size = [ctx.getCanvas().getWidth(), ctx.getCanvas().getHeight()];
        },
      })
    );
    layer.add(group);
    stage.add(layer);
    layer.drawScene();
    assert.deepEqual(size, [62, 47]);
  });

  it('uses a small reusable surface for bounded children as they move and grow', function () {
    const stage = addStage({ width: 1000, height: 800 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(2);
    const group = new Konva.Group({ isolated: true, x: 300, y: 200 });
    const rect = new Konva.Rect({ width: 20, height: 20, fill: 'red' });
    group.add(rect);
    layer.add(group);
    stage.add(layer);
    const context = layer.getNativeCanvasElement().getContext('2d')!;
    const drawImage = context.drawImage;
    const surfaces: HTMLCanvasElement[] = [];
    context.drawImage = function (...args: any[]) {
      surfaces.push(args[0]);
      drawImage.apply(this, args as any);
    };
    try {
      layer.drawScene();
      assert.isBelow(surfaces[0].width * surfaces[0].height, 128 * 128);
      group.x(600);
      rect.width(40);
      layer.drawScene();
      assert.equal(surfaces[0], surfaces[1]);
      assert.isBelow(surfaces[1].width * surfaces[1].height, 128 * 128);
      assert.deepEqual(
        pixel(layer.getNativeCanvasElement(), 1220, 420),
        [255, 0, 0, 255]
      );
      assert.deepEqual(
        pixel(layer.getNativeCanvasElement(), 620, 420),
        [0, 0, 0, 0]
      );
    } finally {
      context.drawImage = drawImage;
    }
  });

  it('keeps rotated group surfaces small regardless of their position', function () {
    const stage = addStage({ width: 1000, height: 800 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(2);
    const group = new Konva.Group({
      isolated: true,
      x: 800,
      y: 600,
      rotation: 17,
    });
    group.add(new Konva.Rect({ width: 40, height: 40, fill: 'red' }));
    layer.add(group);
    stage.add(layer);
    const context = layer.getNativeCanvasElement().getContext('2d')!;
    const drawImage = context.drawImage;
    let area = 0;
    context.drawImage = function (...args: any[]) {
      area = args[0].width * args[0].height;
      drawImage.apply(this, args as any);
    };
    try {
      layer.drawScene();
      assert.isBelow(area, 128 * 128);
      assert.deepEqual(
        pixel(layer.getNativeCanvasElement(), 1610, 1220),
        [255, 0, 0, 255]
      );
    } finally {
      context.drawImage = drawImage;
    }
  });

  it('bounds decorated children and aligns their perfect drawing buffer', function () {
    const stage = addStage({ width: 1000, height: 800 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(2);
    const group = new Konva.Group({ isolated: true, x: 800, y: 600 });
    const rect = new Konva.Rect({
      width: 30,
      height: 20,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 6,
      opacity: 0.6,
      shadowColor: 'black',
      shadowEnabled: false,
      shadowBlur: 6,
      shadowOffsetX: 10,
    });
    group.add(rect);
    layer.add(group);
    stage.add(layer);
    const context = layer.getNativeCanvasElement().getContext('2d')!;
    const drawImage = context.drawImage;
    let area = 0;
    context.drawImage = function (...args: any[]) {
      area = args[0].width * args[0].height;
      drawImage.apply(this, args as any);
    };
    try {
      layer.drawScene();
      assert.isBelow(area, 256 * 256);
      assert.isAbove(pixel(layer.getNativeCanvasElement(), 1620, 1220)[3], 140);
      rect.shadowEnabled(true);
      layer.drawScene();
      assert.isBelow(area, 256 * 256);
    } finally {
      context.drawImage = drawImage;
    }
  });

  it('clears only the active surface region and clears newly reused pixels', function () {
    const stage = addStage({ width: 800, height: 600 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const large = new Konva.Group({ isolated: true });
    large.add(new Konva.Rect({ width: 300, height: 200, fill: 'red' }));
    const small = new Konva.Group({ isolated: true, x: 400, y: 300 });
    small.add(new Konva.Rect({ width: 20, height: 20, fill: 'blue' }));
    layer.add(large, small);
    stage.add(layer);
    const context = layer.getNativeCanvasElement().getContext('2d')!;
    const drawImage = context.drawImage;
    let surfaceContext: CanvasRenderingContext2D | undefined;
    let clearRect: CanvasRenderingContext2D['clearRect'];
    const clears: number[][] = [];
    context.drawImage = function (...args: any[]) {
      if (!surfaceContext) {
        surfaceContext = args[0].getContext('2d');
        clearRect = surfaceContext!.clearRect;
        surfaceContext!.clearRect = function (x, y, w, h) {
          clears.push([w, h]);
          clearRect.call(this, x, y, w, h);
        };
      }
      drawImage.apply(this, args as any);
    };
    try {
      layer.drawScene();
      assert.isBelow(clears[0][0] * clears[0][1], 30 * 30);
      large.destroy();
      small.add(new Konva.Rect({ x: 70, width: 20, height: 20, fill: 'lime' }));
      layer.drawScene();
      assert.deepEqual(
        pixel(layer.getNativeCanvasElement(), 450, 310),
        [0, 0, 0, 0]
      );
      assert.deepEqual(
        pixel(layer.getNativeCanvasElement(), 480, 310),
        [0, 255, 0, 255]
      );
    } finally {
      context.drawImage = drawImage;
      if (surfaceContext) surfaceContext.clearRect = clearRect!;
    }
  });

  it('includes sharp miters, non-scaling strokes and device-space shadow extents', function () {
    const shapes = [
      new Konva.Arrow({
        points: [0, 0, 100, 0],
        pointerLength: 40,
        pointerWidth: 10,
        stroke: 'red',
        strokeWidth: 10,
        miterLimit: 20,
      }),
      new Konva.Line({
        points: [-5, 50, 0, 0, 5, 50],
        stroke: 'blue',
        strokeWidth: 12,
        miterLimit: 20,
      }),
      new Konva.Line({
        points: [-30, -20, 30, 20],
        stroke: 'red',
        strokeWidth: 12,
        strokeScaleEnabled: false,
        lineCap: 'square',
        rotation: 25,
        scaleX: 0.4,
        scaleY: 2,
      }),
      new Konva.Rect({
        width: 30,
        height: 20,
        rotation: 90,
        fill: 'red',
        shadowColor: 'black',
        shadowOffsetX: 40,
        shadowBlur: 5,
      }),
      new Konva.Rect({
        width: 30,
        height: 20,
        fill: 'red',
        shadowColor: 'black',
        shadowBlur: 30,
      }),
      new Konva.Rect({
        width: -30,
        height: -20,
        stroke: 'blue',
        strokeWidth: 12,
      }),
    ];
    for (const shape of shapes) {
      const group = new Konva.Group({ x: 120, y: 120 });
      group.add(shape);
      for (const pixelRatio of [1, 1.5, 3]) {
        const config = { x: 0, y: 0, width: 300, height: 300, pixelRatio };
        group.isolated(false).opacity(1);
        const source = group.toCanvas(config);
        const expected = withOpacity(source, 0.6);
        group.isolated(true).opacity(0.6);
        compareCanvasEdges(group.toCanvas(config), expected);
        Konva.Util.releaseCanvas(source, expected);
      }
      group.destroy();
    }
  });

  it('includes square dash caps on closed curves and rounded rectangles', function () {
    const image = Konva.Util.createCanvasElement();
    image.width = image.height = 10;
    const shapes = [
      new Konva.Circle({ radius: 10 }),
      new Konva.Ellipse({ radiusX: 10, radiusY: 15 }),
      new Konva.Ring({ innerRadius: 5, outerRadius: 10 }),
      new Konva.Rect({ width: 30, height: 20, cornerRadius: 8 }),
      new Konva.Image({ image, width: 30, height: 20, cornerRadius: 8 }),
    ];
    for (const shape of shapes) {
      shape.setAttrs({
        stroke: 'red',
        strokeWidth: 100,
        lineCap: 'square',
        dash: [1, 8],
      });
      const group = new Konva.Group({ x: 150, y: 150 });
      group.add(shape);
      for (const pixelRatio of [1, 1.5]) {
        const config = { x: 0, y: 0, width: 300, height: 300, pixelRatio };
        group.isolated(false).opacity(1);
        const source = group.toCanvas(config);
        const expected = withOpacity(source, 0.6);
        group.isolated(true).opacity(0.6);
        compareCanvasEdges(group.toCanvas(config), expected);
        Konva.Util.releaseCanvas(source, expected);
      }
      group.destroy();
    }
    Konva.Util.releaseCanvas(image);
  });

  it('keeps child fill and stroke blending independent of group opacity', function () {
    const group = new Konva.Group({ isolated: true });
    group.add(
      new Konva.Rect({ width: 100, height: 100, fill: 'white' }),
      new Konva.Rect({
        x: 20,
        y: 20,
        width: 50,
        height: 50,
        fill: 'red',
        stroke: 'blue',
        strokeWidth: 10,
        globalCompositeOperation: 'multiply',
      })
    );
    const source = group.toCanvas();
    const expected = withOpacity(source, 0.5);
    group.opacity(0.5);
    compareCanvases(group.toCanvas(), expected);
    group.destroy();
    Konva.Util.releaseCanvas(source, expected);
  });

  it('preserves cropped transforms and nested images at fractional export resolutions', function () {
    const parent = new Konva.Group({
      x: 110,
      y: 30,
      scaleX: -1.25,
      scaleY: 1.5,
    });
    const group = new Konva.Group({
      x: 10,
      y: 8,
      rotation: 31,
      skewX: 0.2,
      scaleX: 1.4,
      scaleY: 0.7,
      offsetX: 2,
    });
    const nested = new Konva.Group({
      isolated: true,
      x: 15,
      y: 12,
      opacity: 0.6,
    });
    const sourceImage = Konva.Util.createCanvasElement();
    sourceImage.width = sourceImage.height = 10;
    const imageContext = sourceImage.getContext('2d')!;
    imageContext.fillStyle = 'lime';
    imageContext.fillRect(0, 0, 5, 10);
    imageContext.fillStyle = 'blue';
    imageContext.fillRect(5, 0, 5, 10);
    nested.add(new Konva.Image({ image: sourceImage, width: 30, height: 25 }));
    group.add(
      new Konva.Ellipse({ radiusX: 25, radiusY: 20, fill: 'red' }),
      nested
    );
    parent.add(group);
    for (const pixelRatio of [1, 1.5, 3]) {
      const config = {
        x: 12.25,
        y: -10.5,
        width: 140,
        height: 120,
        pixelRatio,
        imageSmoothingEnabled: false,
      };
      group.isolated(false).opacity(1);
      const source = parent.toCanvas(config);
      const expected = withOpacity(source, 0.5);
      group.isolated(true).opacity(0.5);
      compareCanvasEdges(parent.toCanvas(config), expected);
      Konva.Util.releaseCanvas(source, expected);
    }
    parent.destroy();
    Konva.Util.releaseCanvas(sourceImage);
  });

  it('bounds cached descendants by their frozen bitmap after their geometry changes', function () {
    const group = new Konva.Group({ isolated: true, x: 100, y: 50 });
    const cached = new Konva.Group({ x: 20, y: 10 });
    const rect = new Konva.Rect({
      x: -20,
      y: -10,
      width: 100,
      height: 60,
      fill: 'red',
    });
    cached.add(rect);
    cached.cache({ pixelRatio: 2 });
    rect.size({ width: 1, height: 1 });
    rect.fill('blue');
    group.add(cached);
    const canvas = group.toCanvas({ x: 0, y: 0, width: 300, height: 200 });
    assert.deepEqual(pixel(canvas, 190, 100), [255, 0, 0, 255]);
    cached.clearCache();
    assert.deepEqual(
      pixel(group.toCanvas({ x: 0, y: 0, width: 300, height: 200 }), 190, 100),
      [0, 0, 0, 0]
    );
    group.destroy();
  });

  it('uses custom drawing bounds as content is added and removed', function () {
    const stage = addStage({ width: 400, height: 300 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const group = new Konva.Group({ isolated: true, x: 200, y: 100 });
    group.add(new Konva.Rect({ width: 20, height: 20, fill: 'red' }));
    layer.add(group);
    stage.add(layer);
    const custom = new Konva.Shape({
      width: 1,
      height: 1,
      sceneFunc(ctx) {
        ctx.setAttr('fillStyle', 'blue');
        ctx.fillRect(-100, -50, 20, 20);
      },
    });
    custom.getSelfRect = () => ({ x: -100, y: -50, width: 20, height: 20 });
    group.add(custom);
    layer.drawScene();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 110, 60),
      [0, 0, 255, 255]
    );
    custom.destroy();
    group.x(250);
    layer.drawScene();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 110, 60),
      [0, 0, 0, 0]
    );
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 260, 110),
      [255, 0, 0, 255]
    );
  });

  it('applies group opacity once to overlapping children', function () {
    const group = new Konva.Group({ isolated: true, opacity: 0.5 });
    group.add(
      new Konva.Rect({ x: 10, y: 10, width: 40, height: 30, fill: 'red' }),
      new Konva.Rect({ x: 30, y: 10, width: 40, height: 30, fill: 'red' })
    );
    const canvas = group.toCanvas({ x: 0, y: 0, width: 80, height: 50 });
    assert.deepEqual(pixel(canvas, 35, 15), [255, 0, 0, 128]);
    assert.deepEqual(pixel(canvas, 15, 15), [255, 0, 0, 128]);
    assert.isFalse(group.isCached());
    group.destroy();
  });

  it('reuses the drawing surface while refreshing its pixels on every draw', function () {
    const stage = addStage({ width: 80, height: 50 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const surfaces = new Set();
    const group = new Konva.Group({ isolated: true });
    const shape = new Konva.Shape({
      x: 10,
      width: 20,
      height: 30,
      fill: 'red',
      sceneFunc(ctx, shape) {
        surfaces.add(ctx.getCanvas());
        ctx.beginPath();
        ctx.rect(0, 10, 20, 20);
        ctx.fillStrokeShape(shape);
      },
    });
    group.add(shape);
    layer.add(group);
    stage.add(layer);
    surfaces.clear();
    layer.drawScene();
    shape.x(40);
    layer.drawScene();
    assert.equal(surfaces.size, 1);
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 15, 15),
      [0, 0, 0, 0]
    );
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 45, 15),
      [255, 0, 0, 255]
    );
  });

  it('blends the completed group once and preserves child blend modes', function () {
    const root = new Konva.Group();
    root.add(new Konva.Rect({ width: 80, height: 50, fill: 'blue' }));
    const group = new Konva.Group({
      isolated: true,
      globalCompositeOperation: 'difference',
    });
    group.add(
      new Konva.Rect({ x: 10, y: 10, width: 40, height: 30, fill: 'red' }),
      new Konva.Rect({ x: 30, y: 10, width: 40, height: 30, fill: 'red' }),
      new Konva.Rect({
        x: 40,
        y: 10,
        width: 20,
        height: 30,
        fill: 'blue',
        globalCompositeOperation: 'screen',
      })
    );
    root.add(group);
    const canvas = root.toCanvas({ x: 0, y: 0, width: 80, height: 50 });
    assert.deepEqual(pixel(canvas, 15, 15), [255, 0, 255, 255]);
    assert.deepEqual(pixel(canvas, 35, 15), [255, 0, 255, 255]);
    assert.deepEqual(pixel(canvas, 45, 15), [255, 0, 0, 255]);
    assert.deepEqual(pixel(canvas, 75, 15), [0, 0, 255, 255]);
    root.destroy();
  });

  it('confines child erasing to the group without changing hit testing', function () {
    const stage = addStage({ width: 80, height: 50 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const background = new Konva.Rect({ width: 80, height: 50, fill: 'blue' });
    const group = new Konva.Group({ isolated: true });
    const rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 40,
      height: 30,
      fill: 'red',
    });
    const eraser = new Konva.Rect({
      x: 30,
      y: 10,
      width: 40,
      height: 30,
      fill: 'black',
      globalCompositeOperation: 'destination-out',
    });
    group.add(rect, eraser);
    layer.add(background, group);
    stage.add(layer);
    layer.draw();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 35, 15),
      [0, 0, 255, 255]
    );
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 65, 15),
      [0, 0, 255, 255]
    );
    assert.equal(stage.getIntersection({ x: 35, y: 15 }), eraser);
    eraser.listening(false);
    layer.drawHit();
    assert.equal(stage.getIntersection({ x: 35, y: 15 }), rect);
  });

  it('applies nested opacity at each boundary and preserves ordinary subgroups', function () {
    const root = new Konva.Group({ opacity: 0.5 });
    const outer = new Konva.Group({ isolated: true, opacity: 0.5 });
    const inner = new Konva.Group({ isolated: true, opacity: 0.5 });
    const ordinary = new Konva.Group({ x: 80, opacity: 0.5 });
    for (const group of [inner, ordinary]) {
      group.add(
        new Konva.Rect({ x: 10, y: 10, width: 40, height: 30, fill: 'red' }),
        new Konva.Rect({ x: 30, y: 10, width: 40, height: 30, fill: 'red' })
      );
    }
    outer.add(inner, ordinary);
    root.add(outer);
    const canvas = root.toCanvas({ x: 0, y: 0, width: 160, height: 50 });
    assert.closeTo(pixel(canvas, 35, 15)[3], 32, 1);
    assert.closeTo(pixel(canvas, 115, 15)[3], 48, 1);
    assert.equal(inner.children[0].getAbsoluteOpacity(), 0.125);
    root.opacity(0);
    assert.equal(
      pixel(root.toCanvas({ width: 160, height: 50 }), 35, 15)[3],
      0
    );
    root.destroy();
  });

  for (const clipType of ['rectangle', 'function', 'Path2D']) {
    it(`limits group compositing to its ${clipType} clip, including transparent source pixels`, function () {
      if (clipType === 'Path2D' && Konva._renderBackend === 'node-canvas') {
        // This backend provides a Path2D stub, not native path rendering.
        this.skip();
      }
      const clip =
        clipType === 'rectangle'
          ? { clipX: 10, clipY: 10, clipWidth: 40, clipHeight: 30 }
          : {
              clipFunc(ctx) {
                if (clipType === 'Path2D')
                  return [new Path2D('M10 10h40v30h-40Z')] as [Path2D];
                ctx.rect(10, 10, 40, 30);
              },
            };
      for (const globalCompositeOperation of [
        'destination-in',
        'copy',
      ] as const) {
        const root = new Konva.Group();
        root.add(new Konva.Rect({ width: 80, height: 50, fill: 'blue' }));
        const group = new Konva.Group({
          isolated: true,
          globalCompositeOperation,
          ...clip,
        });
        group.add(
          new Konva.Rect({ x: 10, y: 10, width: 20, height: 30, fill: 'red' })
        );
        root.add(group);
        const canvas = root.toCanvas({ x: 0, y: 0, width: 80, height: 50 });
        assert.deepEqual(pixel(canvas, 75, 15), [0, 0, 255, 255]);
        assert.deepEqual(pixel(canvas, 35, 15), [0, 0, 0, 0]);
        assert.deepEqual(
          pixel(canvas, 15, 15),
          globalCompositeOperation === 'copy'
            ? [255, 0, 0, 255]
            : [0, 0, 255, 255]
        );
        root.destroy();
      }
    });
  }

  it('keeps explicit caches frozen and resumes live drawing after clearCache', function () {
    const root = new Konva.Group();
    const group = new Konva.Group({ isolated: true, opacity: 0.5 });
    const rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 30,
      height: 30,
      fill: 'red',
    });
    group.add(rect);
    root.add(group);
    const color = () =>
      pixel(root.toCanvas({ x: 0, y: 0, width: 50, height: 50 }), 20, 20);
    group.cache({ pixelRatio: 1 });
    rect.fill('blue');
    assert.deepEqual(color(), [255, 0, 0, 128]);
    group.clearCache();
    assert.deepEqual(color(), [0, 0, 255, 128]);

    rect.cache({ pixelRatio: 1 });
    rect.fill('lime');
    assert.deepEqual(color(), [0, 0, 255, 128]);
    rect.clearCache();
    assert.deepEqual(color(), [0, 255, 0, 128]);

    root.cache({ pixelRatio: 1 });
    rect.fill('red');
    assert.deepEqual(color(), [0, 255, 0, 128]);
    root.clearCache();
    assert.deepEqual(color(), [255, 0, 0, 128]);
    root.destroy();
  });

  it('recovers clipping and drawing state after a child throws', function () {
    const stage = addStage({ width: 80, height: 50 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const background = new Konva.Rect({ width: 80, height: 50, fill: 'blue' });
    const group = new Konva.Group({
      isolated: true,
      globalCompositeOperation: 'copy',
      clipX: 10,
      clipY: 10,
      clipWidth: 40,
      clipHeight: 30,
    });
    let fail = false;
    group.add(
      new Konva.Shape({
        width: 100,
        height: 100,
        sceneFunc(ctx) {
          if (fail) {
            ctx.translate(500, 500);
            ctx.beginPath();
            ctx.rect(0, 0, 1, 1);
            ctx.clip();
            throw new Error('drawing failed');
          }
          ctx.setAttr('fillStyle', 'red');
          ctx.fillRect(10, 10, 40, 30);
        },
      })
    );
    layer.add(background, group);
    stage.add(layer);
    fail = true;
    assert.throws(() => layer.drawScene(), 'drawing failed');
    fail = false;
    background.fill('lime');
    layer.drawScene();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 75, 15),
      [0, 255, 0, 255]
    );
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 15, 15),
      [255, 0, 0, 255]
    );
  });

  for (const shadowEnabled of [false, true]) {
    it(`preserves transformed strokes and perfect drawing on export (shadow=${shadowEnabled})`, function () {
      // Cairo's image shadows depend on bitmap origin and size. Cropped
      // buffers deliberately use browser rendering rules without a fallback.
      if (shadowEnabled && Konva._renderBackend === 'node-canvas') this.skip();
      const parent = new Konva.Group({
        x: 110,
        y: 30,
        scaleX: -1.25,
        scaleY: 1.5,
      });
      const group = new Konva.Group({
        x: 10,
        y: 8,
        rotation: 31,
        skewX: 0.2,
        scaleX: 1.4,
        scaleY: 0.7,
        offsetX: 2,
      });
      group.add(
        new Konva.Rect({
          width: 35,
          height: 30,
          fill: 'red',
          stroke: 'blue',
          strokeWidth: 4,
          opacity: 0.6,
          shadowEnabled,
          shadowColor: 'black',
          shadowBlur: 3,
          shadowOffsetX: 5,
          shadowOffsetY: 2,
        }),
        new Konva.Line({
          points: [-10, 0, 40, 40],
          stroke: 'lime',
          strokeWidth: 3,
          strokeScaleEnabled: false,
        })
      );
      parent.add(group);
      for (const pixelRatio of [1, 1.5, 3]) {
        const config = {
          x: 12.25,
          y: -10.5,
          width: 140,
          height: 120,
          pixelRatio,
        };
        group.isolated(false).opacity(1);
        const source = parent.toCanvas(config);
        const expected = withOpacity(source, 0.5);
        group.isolated(true).opacity(0.5);
        compareCanvasEdges(parent.toCanvas(config), expected);
        Konva.Util.releaseCanvas(source, expected);
      }
      parent.destroy();
    });
  }

  it('can draw into an initially empty stage and after resizing it', function () {
    const stage = addStage({ width: 0, height: 0 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const group = new Konva.Group({ isolated: true });
    group.add(new Konva.Rect({ width: 30, height: 30, fill: 'red' }));
    layer.add(group);
    stage.add(layer);
    stage.size({ width: 80, height: 50 });
    layer.drawScene();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 15, 15),
      [255, 0, 0, 255]
    );
    stage.size({ width: 160, height: 100 });
    layer.getCanvas().setPixelRatio(2);
    group.x(100);
    layer.drawScene();
    assert.equal(layer.getNativeCanvasElement().width, 320);
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 230, 30),
      [255, 0, 0, 255]
    );
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 30, 30),
      [0, 0, 0, 0]
    );
  });

  it('keeps changing canvas sources live without changing image attributes', function () {
    const stage = addStage({ width: 40, height: 40 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const source = Konva.Util.createCanvasElement();
    source.width = source.height = 20;
    const ctx = source.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 20, 20);
    const group = new Konva.Group({ isolated: true });
    group.add(new Konva.Image({ image: source, x: 10, y: 10 }));
    layer.add(group);
    stage.add(layer);
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 15, 15),
      [255, 0, 0, 255]
    );
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 20, 20);
    layer.drawScene();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 15, 15),
      [0, 0, 255, 255]
    );
    stage.destroy();
    Konva.Util.releaseCanvas(source);
  });

  it('automatically redraws an isolated group when its image loads', async function () {
    if (isNode) {
      this.skip();
    }
    const stage = addStage({ width: 40, height: 40 });
    const layer = new Konva.Layer();
    layer.getCanvas().setPixelRatio(1);
    const source = Konva.Util.createCanvasElement();
    source.width = source.height = 20;
    const ctx = source.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 20, 20);
    const image = new Image();
    const group = new Konva.Group({ isolated: true });
    group.add(new Konva.Image({ image, x: 10, y: 10 }));
    layer.add(group);
    stage.add(layer);
    const nextFrame = () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await nextFrame();
    await nextFrame();
    assert.equal(pixel(layer.getNativeCanvasElement(), 15, 15)[3], 0);
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = source.toDataURL();
    });
    await nextFrame();
    await nextFrame();
    assert.deepEqual(
      pixel(layer.getNativeCanvasElement(), 15, 15),
      [255, 0, 0, 255]
    );
    Konva.Util.releaseCanvas(source);
  });

  it('composites a transparent result even when there are no children', function () {
    for (const globalCompositeOperation of [
      'copy',
      'destination-in',
      'source-in',
      'source-out',
      'destination-atop',
    ] as const) {
      const root = new Konva.Group();
      root.add(new Konva.Rect({ width: 30, height: 30, fill: 'blue' }));
      root.add(new Konva.Group({ isolated: true, globalCompositeOperation }));
      assert.deepEqual(
        pixel(root.toCanvas({ width: 30, height: 30 }), 15, 15),
        [0, 0, 0, 0]
      );
      root.destroy();
    }
  });

  it('serializes isolation and restores ordinary opacity when disabled', function () {
    const group = new Konva.Group({ opacity: 0.5 });
    assert.isFalse(group.isolated());
    group.add(
      new Konva.Rect({ width: 30, height: 30, fill: 'red' }),
      new Konva.Rect({ width: 30, height: 30, fill: 'red' })
    );
    group.isolated(true);
    const restored = Konva.Node.create(group.toJSON()) as Konva.Group;
    assert.isTrue(restored.isolated());
    assert.equal(pixel(restored.toCanvas(), 15, 15)[3], 128);
    restored.isolated(false);
    assert.closeTo(pixel(restored.toCanvas(), 15, 15)[3], 191, 1);
    group.destroy();
    restored.destroy();
  });
});

describe('Group', function () {
  // ======================================================
  it('cache group with text', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    var group = new Konva.Group({
      draggable: true,
      x: 50,
      y: 40,
    });
    var text = new Konva.Text({
      text: 'some text',
      fontSize: 20,
      fill: 'black',
      y: 50,
    });

    var rect = new Konva.Rect({
      height: 100,
      width: 100,
      stroke: 'black',
      strokeWidth: 10,
      // cornerRadius: 1,
    });
    group.add(text);
    group.add(rect);
    layer.add(group);

    stage.add(layer);

    group
      .cache({
        x: -15,
        y: -15,
        width: 150,
        height: 150,
      })!
      .offsetX(5)
      .offsetY(5);

    layer.draw();

    cloneAndCompareLayer(layer, 200);
  });

  it('clip group with a Path2D', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var path = new Konva.Group({
      width: 100,
      height: 100,
      clipFunc: () => [new Path2D('M0 0v50h50Z')],
    });

    layer.add(path);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();clip([object Path2D]);transform(1,0,0,1,0,0);restore();'
    );
  });

  it('clip group with by zero size', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var group = new Konva.Group({
      width: 100,
      height: 100,
      clipWidth: 0,
      clipHeight: 0,
    });

    layer.add(group);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();rect(0,0,0,0);clip();transform(1,0,0,1,0,0);restore();'
    );
  });

  it('clip group with a Path2D and clipRule', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var path = new Konva.Group({
      width: 100,
      height: 100,
      clipFunc: () => [new Path2D('M0 0v50h50Z'), 'evenodd'],
    });

    layer.add(path);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();clip([object Path2D],evenodd);transform(1,0,0,1,0,0);restore();'
    );
  });
});
