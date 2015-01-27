suite('BaseLayer', function() {

    // ======================================================
    test('width and height', function() {
        var stage = addStage();

        var layer = new Konva.FastLayer();
        assert.equal(layer.width(), undefined, 'while layer is not on stage width is undefined');
        assert.equal(layer.height(), undefined, 'while layer is not on stage height is undefined');
        
        layer.width(10);
        assert.equal(layer.width(), undefined, 'while layer is not on stage changing width doing nothing');
        layer.height(10);
        assert.equal(layer.height(), undefined, 'while layer is not on stage changing height doing nothing');
        stage.add(layer);

        assert.equal(layer.width(), stage.width(), 'while layer is on stage width is stage`s width');
        assert.equal(layer.height(), stage.height(), 'while layer is on stage height is stage`s height');

        layer.width(10);
        assert.equal(layer.width(), stage.width(), 'while layer is on stage changing width doing nothing');
        layer.height(10);
        assert.equal(layer.height(), stage.height(), 'while layer is on stage changing height doing nothing');
    });
});