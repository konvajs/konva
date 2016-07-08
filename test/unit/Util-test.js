suite('Util', function(){
  test('get()', function(){
    assert.equal(Konva.Util.get(1, 2), 1);
    assert.equal(Konva.Util.get(undefined, 2), 2);
    assert.equal(Konva.Util.get(undefined, {foo:'bar'}).foo, 'bar');
  });

  test('test _getRGBString()', function(){

    assert.equal(Konva.Util._getRGBAString({}), 'rgba(0,0,0,1)');

    assert.equal(Konva.Util._getRGBAString({
      red: 100,
      green: 150,
      blue: 200,
      alpha: 0.5
    }), 'rgba(100,150,200,0.5)');
  });

    test('test colorToRGBA', function(){
        assert.deepEqual(Konva.Util.colorToRGBA('black'), {
            r : 0,
            g : 0,
            b : 0,
            a : 1
        });

        assert.deepEqual(Konva.Util.colorToRGBA('#ffcc00'), {
            r : 255,
            g : 204,
            b : 0,
            a : 1
        });

        assert.deepEqual(Konva.Util.colorToRGBA(), {
            r : 0,
            g : 0,
            b : 0,
            a : 1
        });
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
        })
    });
});
