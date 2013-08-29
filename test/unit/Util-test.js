suite('Util', function(){
  var util;

  setup(function(){

  });

  suite('get()', function(){
    var get = Kinetic.Util.get;

    test('get integer', function(){
      assert.equal(get(1, 2), 1);
    });
    test('default to integer', function(){
      assert.equal(get(undefined, 2), 2);
    });
    test('default to object', function(){
      assert.equal(get(undefined, {foo:'bar'}).foo, 'bar');
    });
  });
});
