suite('Label', function() {
    // ======================================================
    test('add label', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var label = new Kinetic.Label({
            x: 100,
            y: 100,
            draggable: true
        });

        // add a tag to the label
        label.add(new Kinetic.Tag({
            fill: '#bbb',
            stroke: '#333',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            lineJoin: 'round',
            pointerDirection: 'up',
            pointerWidth: 20,
            pointerHeight: 20,
            cornerRadius: 5
        }));

        // add text to the label
        label.add(new Kinetic.Text({
            text: '',
            fontSize: 50,
            //fontFamily: 'Calibri',
            //fontStyle: 'normal',
            lineHeight: 1.2,
            //padding: 10,
            fill: 'green'
        }));

        layer.add(label);
        stage.add(layer);


        var beforeTextWidth = label.getText().getWidth();

        label.getText().setFontSize(100);

        var afterTextWidth = label.getText().getWidth();

        label.getText().setFontSize(50);

        label.getText().setText('Hello big world');

        layer.draw();


        assert.equal(label.getType(), 'Group');
        assert.equal(label.getClassName(), 'Label');

        var json = label.toJSON();
        //console.log(json);

        // use relaxed trace because  text can be a slightly different size in different browsers,
        // resulting in slightly different tag dimensions
        var relaxedTrace = layer.getContext().getTrace(true);
        //console.log(relaxedTrace);

        assert.equal(relaxedTrace, 'clearRect();save();save();globalAlpha;shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();drawImage();restore();save();transform();font;textBaseline;textAlign;save();translate();translate();save();fillStyle;fillText();restore();translate();restore();restore();clearRect();save();save();globalAlpha;shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();drawImage();restore();save();transform();font;textBaseline;textAlign;save();translate();translate();save();fillStyle;fillText();restore();translate();restore();restore();');

    });

    // ======================================================
    test('create label from json', function() {
        var stage = addStage();

        var json = '{"attrs":{"x":100,"y":100,"draggable":true},"className":"Label","children":[{"attrs":{"fill":"#bbb","stroke":"#333","shadowColor":"black","shadowBlur":10,"shadowOffsetX":10,"shadowOffsetY":10,"shadowOpacity":0.2,"lineJoin":"round","pointerDirection":"up","pointerWidth":20,"pointerHeight":20,"cornerRadius":5,"x":-151.5,"y":20,"width":303,"height":60},"className":"Tag"},{"attrs":{"text":"Hello big world","fontSize":50,"lineHeight":1.2,"fill":"green","width":"auto","height":"auto","x":-151.5,"y":20},"className":"Text"}]}';
        var layer = new Kinetic.Layer();

        var label = Kinetic.Node.create(json);

        layer.add(label);
        stage.add(layer);
    });
});