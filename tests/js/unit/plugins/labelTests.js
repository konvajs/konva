Test.Modules.LABEL = {
    '*add label': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var label = new Kinetic.Plugins.Label({
            x: 20,
            y: 20, 
            draggable: true,
            text: {
                text: 'Hello World!',
                fontSize: 50,
                fontFamily: 'Calibri',
                fontStyle: 'normal',
                lineHeight: 1.2,
                padding: 10,
                fill: 'green',
            },
            rect: {
                fill: '#bbb',
                stroke: '#333',
                shadowColor: 'black',
                shadowBlur: 1,
                shadowOffset: [10, 10],
                shadowOpacity: 0.2,
                cornerRadius: 10,
            }
        });

        layer.add(label);
        stage.add(layer);

        var beforeTextWidth = label.getText().getWidth();

        label.getText().setFontSize(100);

        var afterTextWidth = label.getText().getWidth();

        test(afterTextWidth > beforeTextWidth, 'label text width should have grown');

        label.getText().setFontSize(50);

        layer.draw();
    }
};
