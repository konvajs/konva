Test.Modules.UTIL = {
    'util get()': function(containerId) {
        var get = Kinetic.Util.get;

        test(get(1, 2) === 1, 'get() should return 1');
        test(get(0, 2) === 0, 'get() should return 0');
        test(get(undefined, {foo:'bar'}).foo === 'bar', 'get() should return bar');
    }
};