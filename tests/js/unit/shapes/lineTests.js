Test.Modules.LINE = {
    'add line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var points = [{
            x: 73,
            y: 160
        }, {
            x: 340,
            y: 23
        }
        /*, {
         x: 500,
         y: 109
         }*/
        ];

        var line = new Kinetic.Line({
            points: points,
            stroke: 'blue',
            strokeWidth: 20,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true
        });

        layer.add(line);
        stage.add(layer);

        line.setPoints([1, 2, 3, 4]);
        test(line.getPoints()[0].x === 1, 'first point x should be 1');

        line.setPoints([{
            x: 5,
            y: 6
        }, {
            x: 7,
            y: 8
        }]);
        test(line.getPoints()[0].x === 5, 'first point x should be 5');

        line.setPoints([73, 160, 340, 23]);
        test(line.getPoints()[0].x === 73, 'first point x should be 73');
        
        test(line.getClassName() === 'Line', 'getClassName should be Line');
    },
    'test default ponts array for two lines': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        var line = new Kinetic.Line({
            stroke: 'blue',
            strokeWidth: 20,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true
        });

        var redLine = new Kinetic.Line({
            x: 50,
            stroke: 'red',
            strokeWidth: 20,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true
        });

        line.setPoints([0,1,2,3]);
        redLine.setPoints([4,5,6,7]);

        layer.add(line).add(redLine);
        stage.add(layer);

        test(line.getPoints()[0].x === 0, 'line points is wrong');
        test(redLine.getPoints()[0].x === 4, 'redLine points is wrong');
        
    },
    'add dashed line': function(containerId) {
        var stage = new Kinetic.Stage({
            container: containerId,
            width: 578,
            height: 200
        });
        var layer = new Kinetic.Layer();

        /*
         var points = [{
         x: 73,
         y: 160
         }, {
         x: 340,
         y: 23
         }, {
         x: 500,
         y: 109
         }, {
         x: 500,
         y: 180
         }];
         */

        var line = new Kinetic.Line({
            points: [73, 160, 340, 23, 500, 109, 500, 180],
            stroke: 'blue',

            strokeWidth: 10,
            lineCap: 'round',
            lineJoin: 'round',
            draggable: true,
            dashArray: [30, 10, 0, 10, 10, 20],
            shadowColor: '#aaa',
            shadowBlur: 10,
            shadowOffset: [20, 20]
            //opacity: 0.2
        });

        layer.add(line);
        stage.add(layer);

        test(line.getDashArray().length === 6, 'dashArray should have 6 elements');
        line.setDashArray([10, 10]);
        test(line.getDashArray().length === 2, 'dashArray should have 2 elements');

        test(line.getPoints().length === 4, 'line should have 4 points');

    }
};
