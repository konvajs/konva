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
});
