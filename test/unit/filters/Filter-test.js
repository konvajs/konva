"use strict";

suite('Filter', function() {

    test('pixelRaio check', function () {
        Konva.pixelRatio = 2;
        var stage = addStage();
        var layer = new Konva.Layer();

        var circle = new Konva.Circle({
            x : stage.width() / 2,
            y : stage.height() / 2,
            fill : 'red',
            stroke: 'green',
            radius : 15
        });

        layer.add(circle);
        stage.add(layer);
        circle.cache();
        circle.filters([Konva.Filters.Blur ]);
        circle.blurRadius(0);
        layer.draw();

        if (!window.isPhantomJS) {
            cloneAndCompareLayer(layer, 50);
        }
        Konva.pixelRatio = 1;
    });
});
