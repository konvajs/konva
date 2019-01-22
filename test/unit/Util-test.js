suite('Util', function() {
  test('get()', function() {
    assert.equal(Konva.Util.get(1, 2), 1);
    assert.equal(Konva.Util.get(undefined, 2), 2);
    assert.equal(Konva.Util.get(undefined, { foo: 'bar' }).foo, 'bar');
  });

  test('test _prepareToStringify', function() {
    var o = {
      a: 1,
      b: 'string1'
    };
    o.c = {
      d: 'string2',
      e: o,
      f: document.createElement('p')
    };
    o.g = o;

    assert.deepEqual(Konva.Util._prepareToStringify(o), {
      a: 1,
      b: 'string1',
      c: {
        d: 'string2'
      }
    });
  });
});
