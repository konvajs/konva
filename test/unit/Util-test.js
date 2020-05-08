suite('Util', function () {
  test('get()', function () {
    assert.equal(Konva.Util.get(1, 2), 1);
    assert.equal(Konva.Util.get(undefined, 2), 2);
    assert.equal(Konva.Util.get(undefined, { foo: 'bar' }).foo, 'bar');
  });

  test('test _prepareToStringify', function () {
    var o = {
      a: 1,
      b: 'string1',
    };
    o.c = {
      d: 'string2',
      e: o,
      f: document.createElement('p'),
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

  test('colorToRGBA() - from HSL to RGBA conversion', function () {
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

  test('make sure Transform is exported', () => {
    assert.equal(!!Konva.Transform, true);
  });
});
