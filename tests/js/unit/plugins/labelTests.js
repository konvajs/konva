Test.Modules.LABEL = {
    '*add label': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var label = new Kinetic.Plugins.Label({
            x: 100,
            y: 100, 
            draggable: true,
            text: { 
                text: '',
                fontSize: 50,
                //fontFamily: 'Calibri',
                //fontStyle: 'normal',
                lineHeight: 1.2,
                //padding: 10,
                fill: 'green'
            }, 
            rect: {
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
            }
        });

        layer.add(label);
        stage.add(layer);

        var beforeTextWidth = label.getText().getWidth();

        label.getText().setFontSize(100);

        var afterTextWidth = label.getText().getWidth();

        //test(afterTextWidth > beforeTextWidth, 'label text width should have grown');

        label.getText().setFontSize(50);
        
        label.getText().setText('Hello big world');

        layer.draw();
    }
};
