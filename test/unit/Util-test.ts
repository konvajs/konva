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

  it('make sure Transform is exported', () => {
    assert.equal(!!Konva.Transform, true);
  });
});
