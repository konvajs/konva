suite('Label', function() {
    // ======================================================
    test('add label', function() {
        var stage = buildStage();
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

        var trace = layer.getContext().getTrace();
        //console.log(trace);
        
        // this fails because text can be a slightly different size in different browsers, 
        // resulting in slightly different tag dimensions
        //assert.equal(trace, 'clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,100,120);beginPath();moveTo(0,0);lineTo(-10,0);lineTo(0,-20);lineTo(10,0);lineTo(0,0);lineTo(0,60);lineTo(0,60);closePath();save();globalAlpha=0.2;shadowColor=black;shadowBlur=10;shadowOffsetX=10;shadowOffsetY=10;fillStyle=#bbb;fill();restore();fillStyle=#bbb;fill();lineWidth=2;strokeStyle=#333;stroke();restore();save();transform(1,0,0,1,100,120);font=normal 50px Calibri;textBaseline=middle;textAlign=left;save();translate(0,0);translate(0,25);save();fillStyle=green;fillText(,0,0);restore();translate(0,60);restore();restore();clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,-51.5,120);beginPath();moveTo(0,0);lineTo(141.5,0);lineTo(151.5,-20);lineTo(161.5,0);lineTo(303,0);lineTo(303,60);lineTo(0,60);closePath();save();globalAlpha=0.2;shadowColor=black;shadowBlur=10;shadowOffsetX=10;shadowOffsetY=10;fillStyle=#bbb;fill();restore();fillStyle=#bbb;fill();lineWidth=2;strokeStyle=#333;stroke();restore();save();transform(1,0,0,1,-51.5,120);font=normal 50px Calibri;textBaseline=middle;textAlign=left;save();translate(0,0);translate(0,25);save();fillStyle=green;fillText(Hello big world,0,0);restore();translate(0,60);restore();restore()');
    });

    // ======================================================
    test('create label from json', function() {
        var stage = buildStage();

        var json = '{"attrs":{"x":100,"y":100,"draggable":true},"className":"Label","children":[{"attrs":{"fill":"#bbb","stroke":"#333","shadowColor":"black","shadowBlur":10,"shadowOffsetX":10,"shadowOffsetY":10,"shadowOpacity":0.2,"lineJoin":"round","pointerDirection":"up","pointerWidth":20,"pointerHeight":20,"cornerRadius":5,"x":-151.5,"y":20,"width":303,"height":60},"className":"Tag"},{"attrs":{"text":"Hello big world","fontSize":50,"lineHeight":1.2,"fill":"green","width":"auto","height":"auto","x":-151.5,"y":20},"className":"Text"}]}';
        var layer = new Kinetic.Layer();

        var label = Kinetic.Node.create(json);

        layer.add(label);
        stage.add(layer);
    });
});