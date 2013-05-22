Test.Modules.LABEL = {
    'add label': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
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

        //test(afterTextWidth > beforeTextWidth, 'label text width should have grown');

        label.getText().setFontSize(50);
        
        label.getText().setText('Hello big world');

        layer.draw();
      
        
        test(label.getType() === 'Group', 'label should be a group');
        test(label.getClassName() === 'Label', 'label class name should be Label');

        var json = label.toJSON();

        console.log(json);
    },
    'create label from json': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });

        var json = '{"attrs":{"x":100,"y":100,"draggable":true},"className":"Label","children":[{"attrs":{"fill":"#bbb","stroke":"#333","shadowColor":"black","shadowBlur":10,"shadowOffsetX":10,"shadowOffsetY":10,"shadowOpacity":0.2,"lineJoin":"round","pointerDirection":"up","pointerWidth":20,"pointerHeight":20,"cornerRadius":5,"width":303,"height":60},"className":"Tag"},{"attrs":{"width":"auto","height":"auto","text":"Hello big world","fontSize":50,"lineHeight":1.2,"fill":"green"},"className":"Text"}]}';
        var layer = new Kinetic.Layer();

        var label = Kinetic.Node.create(json);

        layer.add(label);
        stage.add(layer);
    }
 
};
