Test.Modules.BLOB = {
    'add blob': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Blob({
            points: [{
                x: 73,
                y: 140
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 170
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            fill: '#aaf',
            tension: 0.8
        });
        

        layer.add(line);
        stage.add(layer);
        

    }
};
