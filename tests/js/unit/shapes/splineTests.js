Test.Modules.SPLINE = {
    'add splines': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line1 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }, {
                x: 300,
                y: 109
            }],
            stroke: 'blue',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });
        
        var line2 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }, {
                x: 500,
                y: 109
            }],
            stroke: 'red',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });
        
        var line3 = new Kinetic.Spline({
            points: [{
                x: 73,
                y: 160
            }, {
                x: 340,
                y: 23
            }],
            stroke: 'green',
            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            tension: 1
        });

        layer.add(line1);
        layer.add(line2);
        layer.add(line3);
        stage.add(layer);
        
        /*
         line.transitionTo({
         spline: 3,
         duration: 3
         });
         */
        
        //console.log(layer.toDataURL());
        warn(layer.toDataURL() === dataUrls['curvy lines'], 'problem with curvy lines');

    }
};
