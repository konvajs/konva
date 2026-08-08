import { assert } from 'chai';
import { addStage, Konva } from './test-utils.ts';

describe('Util', function () {
  it('test _prepareToStringify', function () {
    var o: any = {
      a: 1,
      b: 'string1',
    };
    o.c = {
      d: 'string2',
      e: o,
      f: global.document ? global.document.createElement('p') : { nodeType: 1 },
    };
    o.g = o;

    assert.deepEqual(Konva.Util._prepareToStringify(o), {
      a: 1,
      b: 'string1',
      c: {
        d: 'string2',
      },
    });
  });

  it('colorToRGBA() - from HSL to RGBA conversion', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(0, 0%, 0%)'), {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('hsl(96, 48%, 59%)'), {
      r: 140,
      g: 201,
      b: 100,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('hsl(200, 100%, 70%)'), {
      r: 102,
      g: 204,
      b: 255,
      a: 1,
    });
  });

  it('colorToRGBA() - HSL with a non-integer hue or extra whitespace', function () {
    // CSS Color 4 allows a non-integer hue and whitespace around the
    // commas/parens; colorToRGBA must not silently fail to parse these.
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(96.5, 48%, 59%)'), {
      r: 140,
      g: 201,
      b: 100,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('hsl( 96 , 48% , 59% )'), {
      r: 140,
      g: 201,
      b: 100,
      a: 1,
    });
  });

  it('Tween can animate a color to/from an HSL color with a non-integer hue', function () {
    // Regression: colorToRGBA() previously returned undefined for a
    // non-integer hue, which made Tween's color diff throw
    // "Cannot read properties of undefined (reading 'r')".
    const stage = addStage();
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      fill: 'hsl(120, 50%, 50%)',
    });
    const layer = new Konva.Layer();
    layer.add(rect);
    stage.add(layer);

    const tween = new Konva.Tween({
      node: rect,
      duration: 1,
      fill: 'hsl(240.5, 50%, 50%)',
    });

    assert.doesNotThrow(() => {
      tween.seek(0.5);
    });
  });

  it('colorToRGBA() - from color string with percentage to RGBA conversion!', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('rgba(50, 100, 150, 0.5)'), {
      r: 50,
      g: 100,
      b: 150,
      a: 0.5,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgba(50, 100, 150, 50%)'), {
      r: 50,
      g: 100,
      b: 150,
      a: 0.5,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgba(25%, 50%, 100%, 0.5)'), {
      r: 63.75,
      g: 127.5,
      b: 255,
      a: 0.5,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgba(0%, 50%, 100%, 100%)'), {
      r: 0,
      g: 127.5,
      b: 255,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgb(25%, 50%, 100%)'), {
      r: 63.75,
      g: 127.5,
      b: 255,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgb(0, 128, 255)'), {
      r: 0,
      g: 128,
      b: 255,
      a: 1,
    });

    // a percentage is allowed to be fractional
    assert.deepEqual(Konva.Util.colorToRGBA('rgba(10.5%, 0%, 0%, 25.5%)'), {
      r: 26.775,
      g: 0,
      b: 0,
      a: 0.255,
    });
  });

  it('colorToRGBA() - from hex color string with percentage to RGBA conversion!', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('#F00'), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('#F00F'), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('#F00C'), {
      r: 255,
      g: 0,
      b: 0,
      a: 0.8,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('#FF0000FF'), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('#FF0000CC'), {
      r: 255,
      g: 0,
      b: 0,
      a: 0.8,
    });
  });

  it('colorToRGBA() - named color transparent keeps its alpha', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('transparent'), {
      r: 255,
      g: 255,
      b: 255,
      a: 0,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('red'), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  it('make sure Transform is exported', () => {
    assert.equal(!!Konva.Transform, true);
  });
});
