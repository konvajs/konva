suite('Label', function() {
    // ======================================================
    test('add label', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var label = new Konva.Label({
            x: 100,
            y: 100,
            draggable: true
        });

        // add a tag to the label
        label.add(new Konva.Tag({
            fill: '#bbb',
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
        label.add(new Konva.Text({
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


        label.getText().setFontSize(100);

        label.getText().setFontSize(50);

        label.getText().setText('Hello big world');

        layer.draw();


        assert.equal(label.getType(), 'Group');
        assert.equal(label.getClassName(), 'Label');


        // use relaxed trace because  text can be a slightly different size in different browsers,
        // resulting in slightly different tag dimensions
        var relaxedTrace = layer.getContext().getTrace(true);
//        console.log(relaxedTrace);
//        assert.equal(relaxedTrace, 'clearRect();save();save();globalAlpha;shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();drawImage();restore();save();transform();font;textBaseline;textAlign;save();translate();save();fillStyle;fillText();restore();translate();restore();restore();clearRect();save();save();globalAlpha;shadowColor;shadowBlur;shadowOffsetX;shadowOffsetY;drawImage();restore();drawImage();restore();save();transform();font;textBaseline;textAlign;save();translate();save();fillStyle;fillText();restore();translate();restore();restore();');

    });

    // ======================================================
    test('create label from json', function() {
        var stage = addStage();

        var json = '{"attrs":{"x":100,"y":100,"draggable":true},"className":"Label","children":[{"attrs":{"fill":"#bbb","stroke":"#333","shadowColor":"black","shadowBlur":10,"shadowOffsetX":10,"shadowOffsetY":10,"shadowOpacity":0.2,"lineJoin":"round","pointerDirection":"up","pointerWidth":20,"pointerHeight":20,"cornerRadius":5,"x":-151.5,"y":20,"width":303,"height":60},"className":"Tag"},{"attrs":{"text":"Hello big world","fontSize":50,"lineHeight":1.2,"fill":"green","width":"auto","height":"auto","x":-151.5,"y":20},"className":"Text"}]}';
        var layer = new Konva.Layer();

        var label = Konva.Node.create(json);

        layer.add(label);
        stage.add(layer);
    });

    test('find label class', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        var label = new Konva.Label({
            x: 100,
            y: 100
        });

        // add a tag to the label
        label.add(new Konva.Tag({
            fill: '#bbb'
        }));

        // add text to the label
        label.add(new Konva.Text({
            text: 'Test Label',
            fill: 'green'
        }));

        layer.add(label);
        stage.add(layer);

        assert.equal(stage.find('Label')[0], label);
    });

    test.skip('cache label', function() {
        var stage = addStage();
        var layer = new Konva.Layer();

        // tooltip
        var tooltip = new Konva.Label({
            x: 170,
            y: 75,
            opacity: 0.75
        });
        tooltip.add(new Konva.Tag({
            fill: 'black',
            pointerDirection: 'down',
            pointerWidth: 10,
            pointerHeight: 10,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            shadowOpacity: 0.5
        }));
        tooltip.add(new Konva.Text({
            text: 'Tooltip pointing down',
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'white'
        }));

        var tooltipUp = new Konva.Label({
            x: 170,
            y: 75,
            opacity: 0.75
        });
        tooltipUp.add(new Konva.Tag({
            fill: 'black',
            pointerDirection: 'up',
            pointerWidth: 10,
            pointerHeight: 10,
            lineJoin: 'round',
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: 10,
            shadowOpacity: 0.5
        }));
        tooltipUp.add(new Konva.Text({
            text: 'Tooltip pointing up',
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'white'
        }));
        // label with left pointer
        var labelLeft = new Konva.Label({
            x: 20,
            y: 130,
            opacity: 0.75
        });
        labelLeft.add(new Konva.Tag({
            fill: 'green',
            pointerDirection: 'left',
            pointerWidth: 30,
            pointerHeight: 28,
            lineJoin: 'round'
        }));
        labelLeft.add(new Konva.Text({
            text: 'Label pointing left',
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'white'
        }));
        // label with left pointer
        var labelRight = new Konva.Label({
            x: 160,
            y: 170,
            offsetX : 20,
            opacity: 0.75
        });
        labelRight.add(new Konva.Tag({
            fill: 'green',
            pointerDirection: 'right',
            pointerWidth: 20,
            pointerHeight: 28,
            lineJoin: 'round'
        }));
        labelRight.add(new Konva.Text({
            text: 'Label right',
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'white'
        }));
        // simple label
        var simpleLabel = new Konva.Label({
            x: 180,
            y: 150,
            opacity: 0.75
        });
        simpleLabel.add(new Konva.Tag({
            fill: 'yellow'
        }));
        simpleLabel.add(new Konva.Text({
            text: 'Simple label',
            fontFamily: 'Calibri',
            fontSize: 18,
            padding: 5,
            fill: 'black'
        }));
        // add the labels to layer
        layer.add(tooltip, tooltipUp, labelLeft, labelRight, simpleLabel);
        layer.children.cache();

        stage.add(layer);

        cloneAndCompareLayer(layer, 254);
    });

});
