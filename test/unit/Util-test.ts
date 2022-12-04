import { assert } from 'chai';
import { Konva } from './test-utils';

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

  it('make sure Transform is exported', () => {
    assert.equal(!!Konva.Transform, true);
  });
});
