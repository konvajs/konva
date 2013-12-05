suite('Path', function() {
    // ======================================================
    test('add simple path', function() {
        var stage = addStage();

        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'M200,100h100v50z',
            fill: '#ccc',
            stroke: '#333',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 2,
            shadowOffset: [10, 10],
            shadowOpacity: 0.5,
            draggable: true
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);

        stage.add(layer);

        assert.equal(path.getData(), 'M200,100h100v50z');
        assert.equal(path.dataArray.length, 4);

        path.setData('M200');

        assert.equal(path.getData(), 'M200');
        assert.equal(path.dataArray.length, 1);

        path.setData('M200,100h100v50z');
        
        assert.equal(path.getClassName(), 'Path');

    });

    // ======================================================
    test('add path with line cap and line join', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'M200,100h100v50',
            stroke: '#333',
            strokeWidth: 20,
            draggable: true,
            lineCap: 'round',
            lineJoin: 'round'
        });

        layer.add(path);

        stage.add(layer);

    });

    //=======================================================
    test('add path with double closed path and releative moveto', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'm 4.114181,28.970898 8.838835,50.205 22.980968,-48.4372 z m -4.59619304,13.7887 0,18.385 c 14.10943004,-12.211 24.57748204,-6.2149 35.00178204,0 l 2.304443,-8.6004 -13.264598,0 c 2.227131,-5.4642 7.171257,-11.834 -6.858423,-11.8792 -3.920218,12.899 -9.493066,14.6427 -17.18320404,2.0946 z',
            stroke: '#000',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });

        layer.add(path);

        stage.add(layer);

    });
    
    //=======================================================
    test('complex path made of many different closed and open paths (Sopwith Camel)', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'm 15.749277,58.447629 8.495831,-0.05348 m 0.319898,-15.826548 -0.202438,17.295748 0.942206,0.941911 1.345933,-1.816987 0.20211,-11.642611 z m 77.458374,28.680768 c 0,5.308829 -4.303525,9.612686 -9.612485,9.612686 -5.30873,0 -9.612194,-4.303857 -9.612194,-9.612686 0,-5.308829 4.303464,-9.61226 9.612194,-9.61226 5.30896,0 9.612485,4.303431 9.612485,9.61226 z m -3.520874,0 c 0,3.364079 -2.72763,6.091348 -6.091611,6.091348 -3.364243,0 -6.091119,-2.727269 -6.091119,-6.091348 0,-3.363719 2.726876,-6.090791 6.091119,-6.090791 3.363981,0 6.091611,2.727072 6.091611,6.090791 z m -3.997576,0 c 0,1.156718 -0.937743,2.093937 -2.094035,2.093937 -1.156062,0 -2.093871,-0.937219 -2.093871,-2.093937 0,-1.156357 0.937809,-2.093773 2.093871,-2.093773 1.156292,0 2.094035,0.937416 2.094035,2.093773 z m 45.77821,4.283023 c -0.24607,1.90039 5.06492,3.680204 7.61403,5.520093 0.50662,0.514199 0.27889,0.975967 -0.0984,1.427532 l 3.9019,-1.141987 c -0.59258,-0.121397 -1.85951,0.01969 -1.71294,-0.380038 -0.85894,-1.950525 -3.68693,-2.761261 -5.61518,-4.092495 -1.06971,-1.03496 0.0997,-1.60766 0.76126,-2.284203 z M 43.206396,42.60133 55.578964,74.008743 58.71987,73.910313 47.203939,44.40726 c -1.109013,-0.737406 -1.174108,-2.1004 -3.997543,-1.808752 z m -18.654022,-0.570632 12.467721,31.692335 3.140643,0.09843 -12.467656,-31.692927 z m 2.285318,42.353106 -2.636648,-0.06431 0.163066,0.734584 3.709372,9.956142 2.357927,-1.168202 z m 19.411934,0.566268 -6.370726,9.901284 2.090163,1.615665 7.13671,-11.417403 0.303821,-0.4347 -2.942667,-0.02953 z m -12.091915,8.286013 c -5.729323,0 -10.367941,4.560169 -10.367941,10.184405 0,5.62429 4.638618,10.18489 10.367941,10.18489 5.729424,0 10.37654,-4.5606 10.37654,-10.18489 0,-5.624236 -4.647083,-10.184405 -10.37654,-10.184405 z m 0,2.473319 c 4.310029,0 7.811352,3.453552 7.811352,7.711086 0,4.25776 -3.50129,7.71167 -7.811352,7.71167 -4.310157,0 -7.803016,-3.45391 -7.803016,-7.71167 0,-4.257534 3.492859,-7.711086 7.803016,-7.711086 z m 3.528526,-21.795876 c -1.29032,-0.0066 -2.97525,0.03839 -3.402437,1.45155 l -0.01969,7.494437 c 0.586775,0.761915 1.42432,0.688978 2.236565,0.71411 l 26.529545,-0.14502 8.636784,0.761324 0,-7.518487 C 71.56989,75.908478 71.09444,75.467051 70.239377,75.338961 61.126027,73.734287 49.244756,73.929146 37.690371,73.911166 z M 20.959576,41.269176 c -0.0098,0.603377 0.575258,0.881409 0.575258,0.881409 L 58.95771,42.33629 c -4.893946,-0.985482 -16.592629,-2.859625 -32.835015,-2.783473 -1.570354,0.107617 -5.151439,1.109571 -5.163119,1.712718 z m 3.353022,14.276273 c -2.79955,0.01312 -5.595489,0.02953 -8.382964,0.05545 l 0,9.9e-5 0.0033,1.447677 -1.173484,0.01312 0.0066,1.244485 1.184048,0.05807 c -1.34298,0.220812 -2.956414,1.305807 -3.054779,3.476618 0.0098,3.269061 0.01312,6.538943 0.01312,9.808103 l -1.21197,0.0033 -0.01969,-2.361569 -4.6851755,0.0033 0,5.901969 4.6323185,0.0066 -0.02953,-1.7556 1.308596,-0.02297 0.0098,9.180447 c -0.0066,1.315781 2.739048,3.634336 4.542583,3.634336 l 4.811756,-2.995032 c 1.616583,-0.107617 1.758126,0.482078 1.884346,1.076924 l 35.667571,0.318914 6.909664,-0.81031 m 4.994738,-0.585889 85.216614,-9.991675 c 4.93952,-0.487623 14.9162,-22.255511 -3.75098,-25.556727 -5.12814,-0.887479 -15.53194,4.839613 -21.44018,9.104984 -2.31314,1.954593 -1.74166,4.084194 0.0263,5.982879 l -72.209399,-8.111923 -2.12281,-0.0012 c -0.966453,1.390128 -3.158262,3.260465 -4.554559,4.053123 M 49.36027,58.361483 c -1.699757,-1.038536 -2.965602,-2.804438 -4.533856,-2.875275 -3.903936,0.0011 -7.904399,0.0066 -11.882849,0.01312 m -3.081192,0.0066 c -1.043195,0.0033 -2.082715,0.0066 -3.116396,0.0098',
            stroke: '#000',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round'
        });

        layer.add(path);

        stage.add(layer);

    });
    
    

    
    
    // ======================================================
    test('moveTo with implied lineTos and trailing comma', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: 'm200,100,100,0,0,50,z',
            fill: '#fcc',
            stroke: '#333',
            strokeWidth: 2,
            shadowColor: 'maroon',
            shadowBlur: 2,
            shadowOffset: {x:10, y:10},
            shadowOpacity: 0.5,
            draggable: true
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);

        stage.add(layer);

        assert.equal(path.getData(), 'm200,100,100,0,0,50,z');
        assert.equal(path.dataArray.length, 4);

        assert.equal(path.dataArray[1].command, 'L');

        var trace = layer.getContext().getTrace();

        //console.log(trace);
        assert.equal(trace, 'clearRect(0,0,578,200);save();save();globalAlpha=0.5;shadowColor=maroon;shadowBlur=2;shadowOffsetX=10;shadowOffsetY=10;drawImage([object HTMLCanvasElement],0,0);restore();drawImage([object HTMLCanvasElement],0,0);restore();');
    });
    
    // ======================================================
    test('add map path', function() {
        var stage = addStage();
        var mapLayer = new Kinetic.Layer();

        for(var key in worldMap.shapes) {
            var c = worldMap.shapes[key];

            var path = new Kinetic.Path({
                data: c,
                fill: '#ccc',
                stroke: '#999',
                strokeWidth: 1
            });

            if(key === 'US') {
                assert.equal(path.dataArray[0].command, 'M');
            }

            path.on('mouseover', function() {
                this.setFill('red');
                mapLayer.drawScene();
            });

            path.on('mouseout', function() {
                this.setFill('#ccc');
                mapLayer.drawScene();
            });

            mapLayer.add(path);
        }

        stage.add(mapLayer);

        //document.body.appendChild(mapLayer.bufferCanvas.element);
    });
    
    // ======================================================
    test('curved arrow path', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z";

        var path = new Kinetic.Path({
            data: c,
            fill: '#ccc',
            stroke: '#999',
            strokeWidth: 1
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('#ccc');
            layer.draw();
        });

        layer.add(path);
        stage.add(layer);

    });
    
    // ======================================================
    test('Quadradic Curve test from SVG w3c spec', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M200,300 Q400,50 600,300 T1000,300";

        var path = new Kinetic.Path({
            data: c,
            stroke: 'red',
            strokeWidth: 5
        });

        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 200,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 600,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 1000,
            y: 300,
            radius: 10,
            fill: 'black'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 50,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 800,
            y: 550,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Path({
            data: "M200,300 L400,50L600,300L800,550L1000,300",
            stroke: "#888",
            strokeWidth: 2
        }));

        stage.add(layer);

    });
    
    // ======================================================
    test('Cubic Bezier Curve test from SVG w3c spec using setData', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M100,200 C100,100 250,100 250,200 S400,300 400,200";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 5
        });

        path.setData(c);

        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 100,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 200,
            radius: 10,
            stroke: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 100,
            y: 100,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 100,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 400,
            y: 300,
            radius: 10,
            fill: '#888'
        }));

        layer.add(new Kinetic.Circle({
            x: 250,
            y: 300,
            radius: 10,
            stroke: 'blue'
        }));

        stage.add(layer);

    });
    
    // ======================================================
    test('path arc', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M100,350 l 50,-25 a25,25 -30 0,1 50,-25 l 50,-25 a25,50 -30 0,1 50,-25 l 50,-25 a25,75 -30 0,1 50,-25 l 50,-25 a25,100 -30 0,1 50,-25 l 50,-25";

        var path = new Kinetic.Path({
            data: c,
            fill: 'none',
            stroke: '#999',
            strokeWidth: 1
        });

        path.on('mouseover', function() {
            this.setFill('red');
            layer.draw();
        });

        path.on('mouseout', function() {
            this.setFill('none');
            layer.draw();
        });

        layer.add(path);
        stage.add(layer);

    });
    
    // ======================================================
    test('Tiger (RAWR!)', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();
        var group = new Kinetic.Group();

        for(var i = 0; i < tiger.length; i++) {
            var path = new Kinetic.Path(tiger[i]);
            group.add(path);
        }

        group.setDraggable(true);
        layer.add(group);
        stage.add(layer);

        showHit(layer);

    });
    
    // ======================================================
    test('Able to determine point on line some distance from another point on line', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M10,10 210,160";
        // i.e., from a 3-4-5 triangle

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);
        layer.add(path);

        layer.add(new Kinetic.Circle({
            x: 10,
            y: 10,
            radius: 10,
            fill: 'black'
        }));

        var p1 = Kinetic.Path.getPointOnLine(125, 10, 10, 210, 160);
        // should be 1/2 way, or (110,85)
        assert.equal(Math.round(p1.x), 110);
        assert.equal(Math.round(p1.y), 85);

        layer.add(new Kinetic.Circle({
            x: p1.x,
            y: p1.y,
            radius: 10,
            fill: 'blue'
        }));

        stage.add(layer);

    });
    
    // ======================================================
    test('Able to determine points on Cubic Bezier Curve', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M100,200 C100,100 250,100 250,200 S400,300 400,200";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);
        c = 'M 100 200';

        for( t = 0.25; t <= 1; t += 0.25) {
            var p1 = Kinetic.Path.getPointOnCubicBezier(t, 100, 200, 100, 100, 250, 100, 250, 200);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        for( t = 0.25; t <= 1; t += 0.25) {
            var p1 = Kinetic.Path.getPointOnCubicBezier(t, 250, 200, 250, 300, 400, 300, 400, 200);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        var testPath = new Kinetic.Path({
            stroke: 'black',
            strokewidth: 2,
            data: c
        });

        layer.add(testPath);
        stage.add(layer);
    });
    
    // ======================================================
    test('Able to determine points on Quadratic Curve', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M200,300 Q400,50 600,300 T1000,300";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);
        c = 'M 200 300';

        for( t = 0.333; t <= 1; t += 0.333) {
            var p1 = Kinetic.Path.getPointOnQuadraticBezier(t, 200, 300, 400, 50, 600, 300);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        for( t = 0.333; t <= 1; t += 0.333) {
            var p1 = Kinetic.Path.getPointOnQuadraticBezier(t, 600, 300, 800, 550, 1000, 300);
            c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
        }

        var testPath = new Kinetic.Path({
            stroke: 'black',
            strokewidth: 2,
            data: c
        });

        layer.add(testPath);
        stage.add(layer);
    });
    
    // ======================================================
    test('Able to determine points on Elliptical Arc with clockwise stroke', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M 50,100 A 100 50 0 1 1 150 150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);

        var centerParamPoints = Kinetic.Path.convertEndpointToCenterParameterization(50, 100, 150, 150, 1, 1, 100, 50, 0);

        var start = centerParamPoints[4];
        // 4 = theta
        var dTheta = centerParamPoints[5];
        // 5 = dTheta
        var end = centerParamPoints[4] + dTheta;
        var inc = Math.PI / 6.0;
        // 30 degree resolution

        var p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], start, 0);
        c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

        if(dTheta < 0)// clockwise
        {
            for( t = start - inc; t > end; t -= inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        else// counter-clockwise
        {
            for( t = start + inc; t < end; t += inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], end, 0);
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

        var testpath = new Kinetic.Path({
            stroke: 'black',
            strokeWidth: 2,
            data: c
        });

        layer.add(testpath);
        stage.add(layer);
    });
    
    // ======================================================
    test('Able to determine points on Elliptical Arc with counter-clockwise stroke', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M 250,100 A 100 50 0 1 0 150 150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);

        var centerParamPoints = Kinetic.Path.convertEndpointToCenterParameterization(250, 100, 150, 150, 1, 0, 100, 50, 0);

        var start = centerParamPoints[4];
        // 4 = theta
        var dTheta = centerParamPoints[5];
        // 5 = dTheta
        var end = centerParamPoints[4] + dTheta;
        var inc = Math.PI / 6.0;
        // 30 degree resolution

        var p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], start, 0);
        c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

        if(dTheta < 0)// clockwise
        {
            for( t = start - inc; t > end; t -= inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        else// counter-clockwise
        {
            for( t = start + inc; t < end; t += inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, 0);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], end, 0);
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

        var testpath = new Kinetic.Path({
            stroke: 'black',
            strokeWidth: 2,
            data: c
        });

        layer.add(testpath);
        stage.add(layer);
    });
    
    // ======================================================
    test('Able to determine points on Elliptical Arc when rotated', function() {
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var c = "M 250,100 A 100 50 30 1 0 150 150";

        var path = new Kinetic.Path({
            stroke: 'red',
            strokeWidth: 3
        });

        path.setData(c);

        layer.add(path);

        var centerParamPoints = Kinetic.Path.convertEndpointToCenterParameterization(250, 100, 150, 150, 1, 0, 100, 50, 30);

        var start = centerParamPoints[4];
        // 4 = theta
        var dTheta = centerParamPoints[5];
        // 5 = dTheta
        var end = centerParamPoints[4] + dTheta;
        var inc = Math.PI / 6.0;
        // 30 degree resolution
        var psi = centerParamPoints[6];
        // 6 = psi radians

        var p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], start, psi);
        c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

        if(dTheta < 0)// clockwise
        {
            for( t = start - inc; t > end; t -= inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, psi);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        else// counter-clockwise
        {
            for( t = start + inc; t < end; t += inc) {
                p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], t, psi);
                c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
            }
        }
        p1 = Kinetic.Path.getPointOnEllipticalArc(centerParamPoints[0], centerParamPoints[1], centerParamPoints[2], centerParamPoints[3], end, psi);
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

        var testpath = new Kinetic.Path({
            stroke: 'black',
            strokeWidth: 2,
            data: c
        });

        layer.add(testpath);
        stage.add(layer);
    });
    
    // ======================================================
    test('getPointOnLine for different directions', function() {
        var origo = {
            x: 0,
            y: 0
        };

        var p, point;

        //point up left
        p = {
            x: -10,
            y: -10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(point.x < 0 && point.y < 0, 'The new point should be up left');

        //point up right
        p = {
            x: 10,
            y: -10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(point.x > 0 && point.y < 0, 'The new point should be up right');

        //point down right
        p = {
            x: 10,
            y: 10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(point.x > 0 && point.y > 0, 'The new point should be down right');

        //point down left
        p = {
            x: -10,
            y: 10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(point.x < 0 && point.y > 0, 'The new point should be down left');

        //point left
        p = {
            x: -10,
            y: 0
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(point.x == -10 && point.y == 0, 'The new point should be left');

        //point up
        p = {
            x: 0,
            y: -10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(Math.abs(point.x) < 0.0000001 && point.y == -10, 'The new point should be up');

        //point right
        p = {
            x: 10,
            y: 0
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(point.x == 10 && point.y == 0, 'The new point should be right');

        //point down
        p = {
            x: 0,
            y: 10
        };
        point = Kinetic.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
        assert(Math.abs(point.x) < 0.0000001 && point.y == 10, 'The new point should be down');
    });
    
    // ======================================================
    test('Borneo Map (has scientific notation: -10e-4)', function() {

        var stage = addStage();
        var layer = new Kinetic.Layer();

        var borneo = new Kinetic.Path({
            data: "m 136.68513,236.08861 c -0.63689,-0.67792 -0.75417,-1.28099 -1.03556,-5.32352 -0.26489,-3.80589 -0.4465,-4.81397 -1.09951,-6.1026 -0.51169,-1.00981 -0.98721,-1.54361 -1.375,-1.54361 -0.8911,0 -3.48931,-1.22828 -3.80975,-1.80103 -0.16294,-0.29089 -0.87295,-0.56825 -1.68693,-0.65886 -1.13423,-0.12629 -1.91094,0.0661 -4.02248,0.99633 -4.0367,1.77835 -5.46464,1.87106 -6.79674,0.44127 -0.51948,-0.55765 -0.64763,-1.12674 -0.64763,-2.87683 l 0,-2.18167 -0.87832,0.20996 c -0.48312,0.11549 -1.12041,0.33383 -1.41635,0.4852 -1.52799,0.78172 -4.61534,-0.0398 -5.55846,-1.47906 -0.30603,-0.46718 -1.06518,-1.19501 -1.68667,-1.61739 -1.27136,-0.86387 -1.62607,-0.6501 -1.63439,0.98494 -0.007,1.00822 -0.76687,2.38672 -1.31885,2.38672 -0.17579,0 -1.27182,0.66553 -2.4356,1.47895 -4.016775,2.8076 -6.006455,3.29182 -7.693525,1.87231 -0.52348,-0.44054 -1.43004,-1.00203 -2.01445,-1.24775 -1.35902,-0.57143 -2.10139,-0.21496 -5.36296,2.57523 -2.00259,1.71315 -2.55857,2.02869 -3.57441,2.02869 -0.66172,0 -1.31931,-0.17966 -1.46135,-0.39925 -0.27734,-0.42865 -0.75823,-5.15099 -0.87007,-8.54399 -0.0708,-2.14922 -0.41754,-3.83281 -0.78935,-3.83281 -0.1176,0 -0.45993,0.28746 -0.76078,0.63881 -0.66657,0.77849 -3.4572,0.87321 -4.70537,0.15969 -1.29782,-0.7419 -2.38029,-0.55672 -5.01545,0.85797 -2.16783,1.16385 -2.75945,1.33971 -4.5666,1.35746 -1.66762,0.0163 -2.276,-0.12217 -3.09174,-0.70405 -0.61985,-0.44211 -1.09397,-0.5977 -1.21663,-0.39925 -0.32993,0.53385 -2.25686,0.37294 -2.80642,-0.23436 -0.27856,-0.30774 -0.65658,-0.95453 -0.8401,-1.43731 -0.42448,-1.11632 -0.91809,-1.10316 -3.01531,0.0804 -0.93379,0.52702 -2.13107,0.9582 -2.66054,0.9582 -1.46554,0 -1.97734,-0.82307 -2.19476,-3.52955 -0.10515,-1.30865 -0.4137,-2.90864 -0.68575,-3.55553 -0.37975,-0.90312 -0.41736,-1.39768 -0.16196,-2.13038 0.35544,-1.01957 -0.24711,-3.50377 -1.40121,-5.77657 -0.48023,-0.94578 -0.50724,-1.33822 -0.19445,-2.82926 0.40575,-1.93441 -0.0409,-3.36568 -1.16059,-3.72114 -0.3255,-0.10331 -0.93466,-0.55279 -1.35374,-0.99885 -1.12569,-1.19829 -1.03821,-2.92553 0.22088,-4.35957 0.85079,-0.96896 1.01308,-1.45348 1.2082,-3.60666 l 0.22545,-2.48734 -1.16949,-1.19763 c -0.64324,-0.65869 -1.26203,-1.64897 -1.37517,-2.20061 -0.13388,-0.6528 -0.56813,-1.23242 -1.24372,-1.66009 l -1.03807,-0.65709 0,1.0782 c 0,0.59301 -0.21786,1.38922 -0.48413,1.76937 -0.68007,0.97099 -4.56312,2.96438 -5.77445,2.96438 -1.55729,0 -1.88611,-0.67097 -1.88611,-3.84837 0,-3.52819 0.41663,-4.13666 2.83284,-4.13666 1.49279,0 1.57631,-0.0396 1.09598,-0.51996 -0.4316,-0.43155 -0.69566,-0.4587 -1.55343,-0.15971 -0.56839,0.19815 -1.3354,0.35443 -1.70442,0.34729 -0.86278,-0.0167 -2.61563,-1.51607 -3.02205,-2.58498 -0.3513,-0.92403 -0.12267,-3.38466 0.34119,-3.67132 0.16474,-0.1018 -0.39367,-0.50661 -1.24085,-0.89959 -2.032471,-0.94281 -2.321421,-1.35146 -2.487701,-3.51839 -0.0772,-1.00533 -0.30119,-2.31552 -0.4979,-2.91152 -0.48076,-1.45668 -0.16499,-2.30832 0.90163,-2.43139 0.843711,-0.0974 0.860511,-0.14171 0.748911,-1.97594 -0.0696,-1.14269 0.0236,-1.96143 0.23793,-2.09396 0.47223,-0.29188 -2.501621,-3.97433 -3.330171,-4.12358 -0.34456,-0.062 -0.75956,-0.23921 -0.92229,-0.39365 -0.3459,-0.32835 -0.78945,-2.83658 -0.98794,-5.58637 -0.0769,-1.06517 -0.35848,-2.55647 -0.62576,-3.31402 -0.71739,-2.03331 -0.61465,-2.55112 0.76687,-3.86532 l 1.25273,-1.19173 -0.46915,-1.36178 c -0.53343,-1.54826 -0.33638,-2.99085 0.48923,-3.5815 0.65547,-0.46898 1.32731,-2.61652 1.52388,-4.87126 0.13191,-1.51252 0.2658,-1.7153 2.531131,-3.83281 2.21127,-2.06705 2.41106,-2.36144 2.64687,-3.89989 0.31881,-2.07979 0.74608,-2.60075 2.34208,-2.85597 0.69615,-0.11132 1.66359,-0.53718 2.14988,-0.94636 1.89204,-1.59201 4.16695,-1.77416 4.16695,-0.33363 0,0.40454 -0.23171,1.4157 -0.51499,2.24703 -0.28322,0.83134 -0.45486,1.57164 -0.38139,1.64512 0.0735,0.0735 1.32057,0.92807 2.77127,1.89909 2.57827,1.72574 2.68847,1.7655 4.89522,1.7655 1.74495,0 2.50706,-0.15424 3.35669,-0.67937 0.91121,-0.56315 1.2344,-0.61779 1.88934,-0.3194 0.43449,0.19798 1.19684,0.35997 1.69411,0.35997 1.03354,0 1.51204,0.45563 1.67033,1.59058 0.10938,0.78459 0.54215,1.02641 2.56344,1.43244 0.47079,0.0946 1.07249,0.38843 1.33713,0.65302 0.29826,0.29829 0.55659,0.35879 0.67998,0.15922 0.3007,-0.48659 2.51019,-0.38548 3.21433,0.1471 0.90129,0.6817 0.99638,0.6211 1.2201,-0.77786 0.1114,-0.69691 0.4878,-1.53284 0.83642,-1.85761 0.34861,-0.32477 0.76943,-1.29968 0.93532,-2.16645 0.36198,-1.89196 1.67658,-4.95214 2.37708,-5.53353 0.45941,-0.38127 0.45882,-0.50661 -0.007,-1.40586 -0.92929,-1.79695 -1.07762,-2.78281 -0.59325,-3.94207 0.32267,-0.77223 0.71393,-1.13742 1.3562,-1.26589 l 0.90282,-0.18055 -0.12723,-3.168 -0.1273,-3.168021 1.13626,0 c 0.6249,0 1.22425,0.14254 1.33189,0.31676 0.11034,0.17851 0.92013,-0.22348 1.85538,-0.92103 2.57554,-1.920815 3.6054,-2.317745 6.74013,-2.597735 2.80648,-0.25066 4.59942,-0.61535 8.65387,-1.76019 1.05398,-0.29761 2.49129,-0.66582 3.19396,-0.81822 2.5583,-0.55486 5.16562,-1.18239 7.665675,-1.84504 2.13376,-0.56557 2.7297,-0.87493 3.61346,-1.87587 1.968,-2.22882 6.60136,-8.28119 7.54474,-9.85529 0.55323,-0.92329 1.87182,-2.29956 3.218,-3.35904 2.58733,-2.03622 6.23997,-6.36804 7.37413,-8.74536 0.64823,-1.35877 0.73216,-1.8923 0.56253,-3.57654 -0.2316,-2.3005 -0.44696,-2.16353 3.91929,-2.49301 3.85817,-0.29115 6.65679,-1.49266 9.77494,-4.19656 2.99721,-2.5991 5.77546,-4.25711 7.14234,-4.26265 1.34414,-0.005 2.18866,0.95864 1.93792,2.21228 l -0.19117,0.956 1.02783,-0.62674 c 0.66237,-0.40384 1.60221,-0.62716 2.64269,-0.62793 1.73168,-10e-4 3.01752,-0.70122 4.31246,-2.34742 0.89476,-1.13744 0.70339,-1.77317 -0.78398,-2.60556 -0.68465,-0.38314 -1.52661,-1.0834 -1.87097,-1.55613 -0.54929,-0.75408 -0.57635,-0.97959 -0.22059,-1.83856 0.52649,-1.27114 3.93115,-4.11017 4.92904,-4.11017 0.41859,0 1.13672,0.14279 1.59566,0.3173 1.3868,0.52725 2.80354,-0.28364 3.6531,-2.09077 0.39579,-0.84216 1.25891,-2.18904 1.91795,-2.99304 1.48075,-1.80638 2.89866,-4.72745 2.89866,-5.97158 0,-0.75538 0.58238,-1.50827 3.06391,-3.96067 2.7523,-2.72002 6.3045,-6.98689 7.09162,-8.51845 0.1634,-0.318 0.3954,-1.22055 0.51562,-2.00566 0.25722,-1.68064 1.72382,-4.16066 2.46108,-4.16147 0.9766,-10e-4 2.12459,1.22566 2.31255,2.47132 0.0998,0.66067 0.27255,1.72385 0.384,2.36261 0.1155,0.66184 0.0472,1.45181 -0.15868,1.83656 -0.24595,0.45955 -0.25349,0.67517 -0.0229,0.67517 0.51299,0 2.24002,-2.8963 2.24002,-3.75665 0,-0.8354 0.53999,-2.02246 1.08581,-2.38694 0.19334,-0.12906 0.94292,-0.23686 1.66584,-0.23955 1.77381,-0.007 2.99753,0.95517 2.99753,2.35583 0,0.57021 0.21732,1.76868 0.48299,2.66324 l 0.48306,1.6265 0.92969,-0.92972 c 1.22287,-1.22287 2.47045,-1.24866 2.92225,-0.0604 0.22007,0.57891 0.22505,1.10057 0.0151,1.56166 -0.27458,0.60266 -0.20454,0.71514 0.53993,0.86809 1.18369,0.24315 3.55993,2.06175 3.91536,2.99648 0.59574,1.567 0.35077,3.19938 -0.65144,4.34081 -0.94122,1.07196 -0.94371,1.08593 -0.60505,3.28498 0.18712,1.21464 0.38753,2.25901 0.44545,2.32083 0.2451,0.26166 3.313,-0.9897 3.8317,-1.56289 1.62004,-1.79007 4.61934,0.34098 4.61934,3.28202 0,0.59127 -0.10771,1.21358 -0.23953,1.38292 -0.13176,0.16934 0.1309,-0.10749 0.58362,-0.61518 l 0.82309,-0.92308 2.45525,0.57882 c 3.13892,0.74002 4.67982,1.61224 5.4805,3.10222 0.49583,0.92281 0.83285,1.18897 1.50604,1.18964 0.49596,0.001 1.31643,0.39216 1.91637,0.91477 0.57707,0.50266 1.55223,1.17153 2.16717,1.48639 0.61481,0.31487 1.27608,0.78847 1.46955,1.05246 0.39952,0.54529 2.27154,0.59949 2.79024,0.0808 0.66827,-0.66817 2.3398,-0.37712 3.37202,0.58712 0.87138,0.81397 0.99174,1.13441 0.98984,2.63507 -0.007,3.14067 -1.18875,4.18009 -7.03587,6.17196 -3.71253,1.26471 -4.57971,1.44538 -6.93747,1.44538 -2.24861,0 -2.8547,-0.11412 -3.66279,-0.68954 -0.94626,-0.67382 -0.99252,-0.67652 -2.02854,-0.11858 -0.5831,0.31401 -1.383,0.91461 -1.77767,1.33464 l -0.71741,0.76372 1.56061,1.58439 c 1.40266,1.42413 1.61342,1.53657 2.08298,1.11159 0.76662,-0.69377 2.74012,-0.60035 3.50647,0.16598 0.78732,0.78729 0.81648,1.55502 0.0799,2.09925 -0.83901,0.61987 -0.0838,1.18313 1.57667,1.17578 1.61709,-0.007 2.17621,0.35138 2.17621,1.3954 0,0.59148 -0.17166,0.7594 -0.7769,0.7594 -0.48332,0 -0.84989,0.22977 -0.96998,0.60798 -0.26508,0.83534 -2.11417,1.6503 -4.4471,1.96007 -1.90366,0.25276 -5.24254,1.10817 -7.59191,1.94503 -1.09649,0.39058 -1.18265,0.52074 -1.37769,2.08163 -0.25454,2.03716 -0.67941,2.42422 -2.5359,2.31005 -0.79407,-0.0488 -1.53022,-0.002 -1.6359,0.10335 -0.10561,0.10567 0.32091,0.60142 0.94784,1.10167 0.62693,0.50027 1.13993,1.14348 1.13993,1.4294 0,0.28592 0.21555,0.69878 0.47906,0.91747 1.02219,0.84833 0.30092,2.43799 -1.55295,3.4227 -0.52676,0.27977 -0.48306,0.33828 0.3819,0.51126 1.25557,0.25111 1.75716,1.19504 1.48651,2.79737 -0.15363,0.90893 -0.36794,1.2537 -0.77945,1.2537 -1.42926,0 -3.3719,-2.70726 -2.60535,-3.63084 0.50081,-0.60337 -1.57909,-0.86467 -4.87669,-0.61268 -2.37814,0.18174 -2.45709,0.21144 -1.43732,0.54105 0.67928,0.21956 1.25642,0.70374 1.55806,1.30695 0.41505,0.8301 0.62988,0.94551 1.607,0.86325 0.85566,-0.072 1.30196,0.0903 1.84916,0.67285 0.87917,0.9358 1.26172,2.8927 0.69828,3.57163 -0.45639,0.54984 -2.57856,0.65234 -3.08199,0.14886 -0.23101,-0.23099 -0.45619,-0.1844 -0.73549,0.15214 -0.34547,0.41624 -0.19184,0.54147 1.0828,0.88237 2.06555,0.55246 2.84678,1.34484 2.63181,2.66945 -0.12598,0.77608 -0.0111,1.1894 0.4446,1.60189 0.33781,0.30575 0.61514,0.85703 0.61626,1.22506 0,0.40883 0.37665,0.8823 0.9648,1.21704 0.60282,0.34303 1.20761,1.11895 1.61742,2.075045 0.37403,0.87256 1.58191,2.485991 2.81788,3.764031 2.72839,2.82133 3.02053,3.36933 2.75178,5.16167 -0.1765,1.17708 -0.43169,1.57351 -1.52084,2.36249 -0.71977,0.52142 -1.65712,1.46074 -2.08292,2.08735 -0.66074,0.97241 -0.72193,1.26543 -0.41747,2.00042 0.19615,0.47362 1.00666,1.25369 1.80099,1.7335 0.79426,0.47981 1.6716,1.26687 1.94966,1.74904 0.56868,0.98649 2.52869,2.54597 4.42534,3.52103 0.69619,0.35796 1.69715,1.10835 2.22417,1.66754 0.52702,0.55918 1.52124,1.30625 2.2095,1.66012 1.53401,0.78869 4.33814,2.85596 4.33814,3.19814 0,0.64314 2.36392,2.78408 3.29157,2.98114 3.11842,0.66236 2.71293,3.44603 -0.88801,6.09705 l -1.28558,0.94651 -5.32705,-0.0434 c -4.41945,-0.036 -5.46766,-0.13568 -6.15336,-0.58491 -1.12014,-0.734 -3.69123,-1.21344 -3.69123,-0.68833 0,0.88679 -1.22942,1.53613 -2.56839,1.35654 -1.12847,-0.15136 -1.45376,-0.0446 -2.40271,0.78858 -0.60361,0.52999 -1.09747,1.11694 -1.09747,1.30432 0,0.61061 -2.01766,4.84486 -2.64971,5.56065 -0.83547,0.94619 -1.93367,5.6836 -1.50374,6.48688 0.50015,0.93456 0.37973,2.29694 -0.31815,3.59909 -0.77894,1.45317 -0.79106,1.89641 -0.10398,3.81328 0.46,1.28334 0.67568,1.5151 1.48658,1.597 1.48403,0.14992 1.74197,0.90287 0.92798,2.70938 -0.38137,0.84625 -0.78522,2.35688 -0.89764,3.35694 -0.11931,1.06047 -0.42298,2.01508 -0.72888,2.29042 -0.68334,0.61527 -3.70237,1.79849 -4.6086,1.8063 -0.72042,0.007 -3.41815,2.85544 -5.35745,5.65834 -1.05175,1.52015 -2.85327,2.4565 -4.21281,2.18961 -0.75535,-0.14829 -0.87832,-0.0687 -0.87832,0.56857 0,0.91256 -0.75207,1.60008 -2.29008,2.09359 -1.4381,0.46144 -1.7214,0.80341 -1.96204,2.3682 -0.23809,1.54838 -0.68406,2.08325 -2.35507,2.82408 l -1.33701,0.5928 0.77815,0.77808 c 0.69428,0.6944 0.77808,1.05197 0.77808,3.32499 0,1.85231 -0.13241,2.67923 -0.48529,3.03212 -0.43398,0.43402 -0.35818,0.52049 0.71872,0.81954 0.66212,0.18388 1.51875,0.33512 1.9036,0.3361 0.38485,0.001 0.78136,0.13367 0.88094,0.29487 0.25866,0.41856 -0.38281,4.69924 -0.97325,6.49419 l -0.49911,1.51716 -1.65116,-0.001 -1.65116,-10e-4 0.0983,3.6244 0.0984,3.6244 -1.14753,1.00754 c -0.63119,0.55415 -1.34035,1.00754 -1.57601,1.00754 -0.28893,0 -0.47605,0.57495 -0.57491,1.76696 -0.11787,1.42104 -0.33794,1.96816 -1.1244,2.79476 -1.13233,1.19012 -2.96046,4.69205 -2.96046,5.671 0,1.11194 -0.56115,1.80916 -1.6279,2.02253 -0.55663,0.11131 -1.67566,0.67436 -2.48682,1.25124 -1.22006,0.86773 -6.20079,3.10238 -6.91473,3.10238 -0.11119,0 -1.23238,0.43908 -2.49148,0.97576 -1.25917,0.53667 -2.86172,1.21939 -3.56125,1.51716 -0.69952,0.29776 -3.03704,1.4397 -5.19451,2.53764 -2.15747,1.09794 -4.25494,1.99626 -4.66121,1.99626 -0.4062,0 -1.06176,-0.34404 -1.4569,-0.76453 z",
            fill: "blue"
        });
        layer.add(borneo);
        stage.add(layer);
    });
    
    // ======================================================
    test('Stroke only when no fill', function() {

        // https://github.com/ericdrowell/KineticJS/issues/567
        
        var stage = addStage();
        var layer = new Kinetic.Layer();

        var path = new Kinetic.Path({
            data: "M 50 0 C 50 150 170 170 200 170",
            stroke: 'black'
        });

        // override color key so that we can test the context trace
        path.colorKey = 'black';

        path.on('mouseover', function () {
            this.setStroke("#f00");
            layer.draw();
        });

        path.on('mouseout', function(){
            this.setStroke("#000");
            layer.draw();
        });


        layer.add(path);
        stage.add(layer);

        showHit(layer);

        var trace = layer.getContext().getTrace();

        //console.log(trace);

        var hitTrace = layer.hitCanvas.getContext().getTrace();
        //console.log(hitTrace);

        assert.equal(trace,    'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,0);bezierCurveTo(50,150,170,170,200,170);lineWidth=2;strokeStyle=black;stroke();restore();');
        assert.equal(hitTrace, 'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,0);bezierCurveTo(50,150,170,170,200,170);lineWidth=2;strokeStyle=black;stroke();restore();');
    });
     
});