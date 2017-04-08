suite('RGBA', function() {
    // ======================================================
    test('colorize basic', function(done) {
        var data = [
            {
                color: '#2a6511',
                filter: [242, 193, 168, 0.33],
                result: [108, 131, 67, 255]
            },
            {
                color: '#e4d526',
                filter: [175, 98, 37, 0.79],
                result: [186, 122, 37, 255]
            },
        ];

        var stage = new Konva.Stage({
            container: 'konva-container',
            width: data.length,
            height: 1
        });

        var layer = new Konva.Layer({
            id: 'layer'
        });

        for (var i = 0; i < data.length; i += 1) {
            var d = data[i];

            var rect = new Konva.Rect({
              x: i,
              y: 0,
              width: 1,
              height: 1,
              fill: d.color
            });

            rect.cache();

            rect.red(d.filter[0]);
            rect.green(d.filter[1]);
            rect.blue(d.filter[2]);
            rect.alpha(d.filter[3]);

            rect.filters([Konva.Filters.RGBA]);
            layer.add(rect);
        }

        stage.add(layer);
        layer.batchDraw();

        var context = layer.getCanvas().getContext();

        var imageDataToArray = function (x) {
            var imageData = context.getImageData(x, 0, 1, 1).data;

            return [
                imageData['0'], imageData['1'], imageData['2'], imageData['3']
            ];
        };

        var a0 = imageDataToArray(0);
        var a1 = imageDataToArray(1);

        assert.deepEqual(a0, data[0].result);
        assert.deepEqual(a1, data[1].result);

        done();
    });
});
