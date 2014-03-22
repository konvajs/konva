suite('Global', function() {

    // ======================================================
    test('test Kinetic version number', function() {
        assert.equal(Kinetic.version, 'dev');
    });

    // ======================================================
    test('getAngle()', function() {
        // test that default angleDeg is true
        assert.equal(Kinetic.angleDeg, true);
        assert.equal(Kinetic.getAngle(180), Math.PI);

        Kinetic.angleDeg = false;
        assert.equal(Kinetic.getAngle(1), 1);

        // set angleDeg back to true for future tests
        Kinetic.angleDeg = true;
    });
});