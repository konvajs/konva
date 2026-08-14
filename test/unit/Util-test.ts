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

  it('colorToRGBA() - from HSLA to RGBA conversion', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('hsla(120, 50%, 50%, 0.5)'), {
      r: 64,
      g: 191,
      b: 64,
      a: 0.5,
    });

    // the alpha may be a percentage
    assert.deepEqual(Konva.Util.colorToRGBA('hsla(120, 50%, 50%, 50%)'), {
      r: 64,
      g: 191,
      b: 64,
      a: 0.5,
    });
  });

  it('colorToRGBA() - HSL hue with a unit, out of the 0-360 range or negative', function () {
    const green = { r: 64, g: 191, b: 64, a: 1 };
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120deg, 50%, 50%)'), green);
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(480, 50%, 50%)'), green);
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(-240, 50%, 50%)'), green);

    // every CSS angle unit gives the same 180deg cyan
    const cyan = { r: 64, g: 191, b: 191, a: 1 };
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(180deg, 50%, 50%)'), cyan);
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(0.5turn, 50%, 50%)'), cyan);
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(200grad, 50%, 50%)'), cyan);
    assert.deepEqual(
      Konva.Util.colorToRGBA('hsl(3.14159265rad, 50%, 50%)'),
      cyan
    );

    // a unit we do not know must fail, not read as degrees
    assert.equal(Konva.Util.colorToRGBA('hsl(120px, 50%, 50%)'), undefined);
    // the hue is as strict a number as every other component
    assert.equal(Konva.Util.colorToRGBA('hsl(1.2.3, 100%, 50%)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(12-3deg, 100%, 50%)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(120e, 50%, 50%)'), undefined);
    // an exponent with a unit is still a valid angle
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(1e2deg, 50%, 50%)'), {
      r: 106,
      g: 191,
      b: 64,
      a: 1,
    });

    // CSS is not case sensitive
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120DEG, 50%, 50%)'), green);
  });

  it('colorToRGBA() - the color function name is not case sensitive', function () {
    const red = { r: 255, g: 0, b: 0, a: 1 };
    assert.deepEqual(Konva.Util.colorToRGBA('RGB(255, 0, 0)'), red);
    assert.deepEqual(Konva.Util.colorToRGBA('HSL(0, 100%, 50%)'), red);
    assert.deepEqual(Konva.Util.colorToRGBA('Red'), red);
  });

  it('colorToRGBA() - HSL with no saturation gives gray', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(210, 0%, 100%)'), {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    });

    // the gray shortcut used to hard-code the alpha to 1
    assert.deepEqual(Konva.Util.colorToRGBA('hsla(210, 0%, 50%, 0.5)'), {
      r: 128,
      g: 128,
      b: 128,
      a: 0.5,
    });
  });

  it('colorToRGBA() - a hue inside 0-360 keeps its exact value', function () {
    // normalizing the hue must not cost precision: a rounding difference of
    // one step in the last digit moves a channel by 1
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(5, 20%, 4%)'), {
      r: 12,
      g: 9,
      b: 8,
      a: 1,
    });
  });

  it('colorToRGBA() - HSL saturation and lightness without the % sign', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120, 50, 50)'), {
      r: 64,
      g: 191,
      b: 64,
      a: 1,
    });
  });

  it('colorToRGBA() - accepts a color with spaces around it', function () {
    // getComputedStyle().getPropertyValue('--brand') keeps the leading space
    assert.deepEqual(Konva.Util.colorToRGBA(' #ff0000 '), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA(' rgb(255, 0, 0) '), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  it('colorToRGBA() - space separated CSS Color 4 syntax', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('rgb(255 0 0)'), {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgba(255 0 0 / 50%)'), {
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgb(255 0 0 / 0.5)'), {
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120 50% 50% / 0.5)'), {
      r: 64,
      g: 191,
      b: 64,
      a: 0.5,
    });
  });

  it('colorToRGBA() - alpha in rgb(), no alpha in rgba()', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('rgb(50, 100, 150, 0.5)'), {
      r: 50,
      g: 100,
      b: 150,
      a: 0.5,
    });

    assert.deepEqual(Konva.Util.colorToRGBA('rgba(50, 100, 150)'), {
      r: 50,
      g: 100,
      b: 150,
      a: 1,
    });
  });

  it('colorToRGBA() - an unparsable color gives undefined, not a broken color', function () {
    // a NaN component stays invisible until it reaches the canvas
    // and drops the shape, so the whole color must fail instead
    assert.equal(Konva.Util.colorToRGBA('rgb(255)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(120)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('not-a-color'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgb(a, b, c)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgb(none 0 0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgba(255, 0, 0, x)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(abc, 50%, 50%)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(120, 50%, abc)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('#ff00zz'), undefined);
    assert.equal(Konva.Util.colorToRGBA('#ff00zzff'), undefined);
    // parseInt() reads "0g" as 0, so one bad digit must fail the color too
    assert.equal(Konva.Util.colorToRGBA('#0g0000'), undefined);
    assert.equal(Konva.Util.colorToRGBA('#ff00000z'), undefined);
    // the saturation and the lightness are as strict as the hue
    assert.equal(Konva.Util.colorToRGBA('hsl(120, 50px, 50%)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(120, %, 50%)'), undefined);
    // a component is a number with an optional "%", and nothing else
    assert.equal(Konva.Util.colorToRGBA('rgb(50abc%, 0, 0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgb(0x10, 0, 0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgb(1.2.3, 0, 0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgba(0, 0, 0, 50abc%)'), undefined);
  });

  it('colorToRGBA() - a component the user left empty fails the color', function () {
    // the components must not shift left, which would silently move the alpha
    assert.equal(Konva.Util.colorToRGBA('rgba(255,,0,0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgb(,255,0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgba(1,2,3,)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsla(120,50%,,0)'), undefined);
  });

  it('colorToRGBA() - a space inside a comma separated color adds no component', function () {
    // "2 55" must not become two components and push the alpha out of range
    assert.equal(Konva.Util.colorToRGBA('rgb(2 55, 0, 0)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgba(255, 0, 0 0.5)'), undefined);
  });

  it('colorToRGBA() - too many components, or text after the color, fails', function () {
    assert.equal(Konva.Util.colorToRGBA('rgb(1,2,3,4,5)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('rgb(1,2,3) rgb(4,5,6)'), undefined);
    assert.equal(Konva.Util.colorToRGBA('hsl(120,50%,50%,0.5,9)'), undefined);
  });

  it('colorToRGBA() - HSL keeps the saturation and the lightness in range', function () {
    // out of [0, 1] the conversion gives a negative channel,
    // which the canvas can not read
    const green = { r: 0, g: 255, b: 0, a: 1 };
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120, 120%, 50%)'), green);
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120, 100%, 50%)'), green);
    assert.deepEqual(Konva.Util.colorToRGBA('hsl(120, -50%, 50%)'), {
      r: 128,
      g: 128,
      b: 128,
      a: 1,
    });
  });

  it('colorToRGBA() - every valid number form of a component', function () {
    assert.deepEqual(Konva.Util.colorToRGBA('rgb(1e2, .5, +10)'), {
      r: 100,
      g: 0.5,
      b: 10,
      a: 1,
    });
  });

  it('colorToRGBA() - an empty color is black, with or without spaces', function () {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    assert.deepEqual(Konva.Util.colorToRGBA(''), black);
    assert.deepEqual(Konva.Util.colorToRGBA('   '), black);
  });

  it('getRGB() - parses every syntax colorToRGBA() supports', function () {
    assert.deepEqual(Konva.Util.getRGB('rgb(255 0 0)'), { r: 255, g: 0, b: 0 });
    assert.deepEqual(Konva.Util.getRGB('rgb(0,0,255)'), { r: 0, g: 0, b: 255 });
    assert.deepEqual(Konva.Util.getRGB('#00f'), { r: 0, g: 0, b: 255 });
    assert.deepEqual(Konva.Util.getRGB('hsl(120, 50%, 50%)'), {
      r: 64,
      g: 191,
      b: 64,
    });
    // a percentage keeps its fraction, as colorToRGBA() gives it
    assert.deepEqual(Konva.Util.getRGB('rgb(50%, 0%, 0%)'), {
      r: 127.5,
      g: 0,
      b: 0,
    });
    // black for a color we can not parse
    assert.deepEqual(Konva.Util.getRGB('not-a-color'), { r: 0, g: 0, b: 0 });
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

  it('colorToRGBA() - named colors with a wrong value in the table', function () {
    // these seven had a typo and gave a color no browser gives
    assert.deepEqual(Konva.Util.colorToRGBA('yellowgreen'), {
      r: 154,
      g: 205,
      b: 50, // was 5
      a: 1,
    });
    assert.deepEqual(Konva.Util.colorToRGBA('plum'), {
      r: 221,
      g: 160,
      b: 221, // was 203
      a: 1,
    });
    assert.deepEqual(Konva.Util.colorToRGBA('slategray'), {
      r: 112, // was 119
      g: 128,
      b: 144,
      a: 1,
    });
    assert.deepEqual(
      Konva.Util.colorToRGBA('slategrey'),
      Konva.Util.colorToRGBA('slategray')
    );
    assert.deepEqual(Konva.Util.colorToRGBA('darkgoldenrod'), {
      r: 184,
      g: 134, // was 132
      b: 11,
      a: 1,
    });
    assert.deepEqual(Konva.Util.colorToRGBA('floralwhite'), {
      r: 255,
      g: 250, // was 255
      b: 240,
      a: 1,
    });
    assert.deepEqual(Konva.Util.colorToRGBA('snow'), {
      r: 255,
      g: 250, // was 255
      b: 250,
      a: 1,
    });
  });

  it('make sure Transform is exported', () => {
    assert.equal(!!Konva.Transform, true);
  });
});
