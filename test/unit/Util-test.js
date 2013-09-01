suite('Util', function(){
  var util;

  test('get()', function(){
    var get = Kinetic.Util.get;

    assert.equal(get(1, 2), 1);
    assert.equal(get(undefined, 2), 2);
    assert.equal(get(undefined, {foo:'bar'}).foo, 'bar');
  });
});
