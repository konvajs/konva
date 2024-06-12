import { assert } from 'chai';

import worldMap from '../assets/worldMap';
import tiger from '../assets/tiger';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
  cloneAndCompareLayer,
  isNode,
  assertAlmostDeepEqual,
  isBrowser,
} from './test-utils';

describe('Path', function () {
  // ======================================================
  it('add simple path', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'M200,100h100v50z',
      fill: '#ccc',
      stroke: '#333',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 2,
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 0.5,
      draggable: true,
    });

    path.on('mouseover', function () {
      this.fill('red');
      layer.draw();
    });

    path.on('mouseout', function () {
      this.fill('#ccc');
      layer.draw();
    });

    layer.add(path);

    stage.add(layer);

    assert.equal(path.data(), 'M200,100h100v50z');
    assert.equal(path.dataArray.length, 4);

    path.data('M200');

    assert.equal(path.data(), 'M200');
    assert.equal(path.dataArray.length, 1);

    path.data('M200,100h100v50z');

    assert.equal(path.getClassName(), 'Path');
  });

  // ======================================================
  it('add path with line cap and line join', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'M200,100h100v50',
      stroke: '#333',
      strokeWidth: 20,
      draggable: true,
      lineCap: 'round',
      lineJoin: 'round',
    });

    layer.add(path);

    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,0,0);beginPath();moveTo(200,100);lineTo(300,100);lineTo(300,150);lineCap=round;lineWidth=20;strokeStyle=#333;stroke();restore();'
    );
  });

  //=======================================================
  it('add path with double closed path and releative moveto', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'm 4.114181,28.970898 8.838835,50.205 22.980968,-48.4372 z m -4.59619304,13.7887 0,18.385 c 14.10943004,-12.211 24.57748204,-6.2149 35.00178204,0 l 2.304443,-8.6004 -13.264598,0 c 2.227131,-5.4642 7.171257,-11.834 -6.858423,-11.8792 -3.920218,12.899 -9.493066,14.6427 -17.18320404,2.0946 z',
      stroke: '#000',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
    });

    layer.add(path);

    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,0,0);beginPath();moveTo(4.114,28.971);lineTo(12.953,79.176);lineTo(35.934,30.739);closePath();moveTo(-0.482,42.76);lineTo(-0.482,61.145);bezierCurveTo(13.627,48.934,24.095,54.93,34.52,61.145);lineTo(36.824,52.544);lineTo(23.56,52.544);bezierCurveTo(25.787,47.08,30.731,40.71,16.701,40.665);bezierCurveTo(12.781,53.564,7.208,55.308,-0.482,42.76);closePath();lineCap=round;lineWidth=1;strokeStyle=#000;stroke();restore();'
    );
  });

  //=======================================================
  it('complex path made of many different closed and open paths (Sopwith Camel)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'm 15.749277,58.447629 8.495831,-0.05348 m 0.319898,-15.826548 -0.202438,17.295748 0.942206,0.941911 1.345933,-1.816987 0.20211,-11.642611 z m 77.458374,28.680768 c 0,5.308829 -4.303525,9.612686 -9.612485,9.612686 -5.30873,0 -9.612194,-4.303857 -9.612194,-9.612686 0,-5.308829 4.303464,-9.61226 9.612194,-9.61226 5.30896,0 9.612485,4.303431 9.612485,9.61226 z m -3.520874,0 c 0,3.364079 -2.72763,6.091348 -6.091611,6.091348 -3.364243,0 -6.091119,-2.727269 -6.091119,-6.091348 0,-3.363719 2.726876,-6.090791 6.091119,-6.090791 3.363981,0 6.091611,2.727072 6.091611,6.090791 z m -3.997576,0 c 0,1.156718 -0.937743,2.093937 -2.094035,2.093937 -1.156062,0 -2.093871,-0.937219 -2.093871,-2.093937 0,-1.156357 0.937809,-2.093773 2.093871,-2.093773 1.156292,0 2.094035,0.937416 2.094035,2.093773 z m 45.77821,4.283023 c -0.24607,1.90039 5.06492,3.680204 7.61403,5.520093 0.50662,0.514199 0.27889,0.975967 -0.0984,1.427532 l 3.9019,-1.141987 c -0.59258,-0.121397 -1.85951,0.01969 -1.71294,-0.380038 -0.85894,-1.950525 -3.68693,-2.761261 -5.61518,-4.092495 -1.06971,-1.03496 0.0997,-1.60766 0.76126,-2.284203 z M 43.206396,42.60133 55.578964,74.008743 58.71987,73.910313 47.203939,44.40726 c -1.109013,-0.737406 -1.174108,-2.1004 -3.997543,-1.808752 z m -18.654022,-0.570632 12.467721,31.692335 3.140643,0.09843 -12.467656,-31.692927 z m 2.285318,42.353106 -2.636648,-0.06431 0.163066,0.734584 3.709372,9.956142 2.357927,-1.168202 z m 19.411934,0.566268 -6.370726,9.901284 2.090163,1.615665 7.13671,-11.417403 0.303821,-0.4347 -2.942667,-0.02953 z m -12.091915,8.286013 c -5.729323,0 -10.367941,4.560169 -10.367941,10.184405 0,5.62429 4.638618,10.18489 10.367941,10.18489 5.729424,0 10.37654,-4.5606 10.37654,-10.18489 0,-5.624236 -4.647083,-10.184405 -10.37654,-10.184405 z m 0,2.473319 c 4.310029,0 7.811352,3.453552 7.811352,7.711086 0,4.25776 -3.50129,7.71167 -7.811352,7.71167 -4.310157,0 -7.803016,-3.45391 -7.803016,-7.71167 0,-4.257534 3.492859,-7.711086 7.803016,-7.711086 z m 3.528526,-21.795876 c -1.29032,-0.0066 -2.97525,0.03839 -3.402437,1.45155 l -0.01969,7.494437 c 0.586775,0.761915 1.42432,0.688978 2.236565,0.71411 l 26.529545,-0.14502 8.636784,0.761324 0,-7.518487 C 71.56989,75.908478 71.09444,75.467051 70.239377,75.338961 61.126027,73.734287 49.244756,73.929146 37.690371,73.911166 z M 20.959576,41.269176 c -0.0098,0.603377 0.575258,0.881409 0.575258,0.881409 L 58.95771,42.33629 c -4.893946,-0.985482 -16.592629,-2.859625 -32.835015,-2.783473 -1.570354,0.107617 -5.151439,1.109571 -5.163119,1.712718 z m 3.353022,14.276273 c -2.79955,0.01312 -5.595489,0.02953 -8.382964,0.05545 l 0,9.9e-5 0.0033,1.447677 -1.173484,0.01312 0.0066,1.244485 1.184048,0.05807 c -1.34298,0.220812 -2.956414,1.305807 -3.054779,3.476618 0.0098,3.269061 0.01312,6.538943 0.01312,9.808103 l -1.21197,0.0033 -0.01969,-2.361569 -4.6851755,0.0033 0,5.901969 4.6323185,0.0066 -0.02953,-1.7556 1.308596,-0.02297 0.0098,9.180447 c -0.0066,1.315781 2.739048,3.634336 4.542583,3.634336 l 4.811756,-2.995032 c 1.616583,-0.107617 1.758126,0.482078 1.884346,1.076924 l 35.667571,0.318914 6.909664,-0.81031 m 4.994738,-0.585889 85.216614,-9.991675 c 4.93952,-0.487623 14.9162,-22.255511 -3.75098,-25.556727 -5.12814,-0.887479 -15.53194,4.839613 -21.44018,9.104984 -2.31314,1.954593 -1.74166,4.084194 0.0263,5.982879 l -72.209399,-8.111923 -2.12281,-0.0012 c -0.966453,1.390128 -3.158262,3.260465 -4.554559,4.053123 M 49.36027,58.361483 c -1.699757,-1.038536 -2.965602,-2.804438 -4.533856,-2.875275 -3.903936,0.0011 -7.904399,0.0066 -11.882849,0.01312 m -3.081192,0.0066 c -1.043195,0.0033 -2.082715,0.0066 -3.116396,0.0098',
      stroke: '#000',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
    });

    layer.add(path);

    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'bezierCurveTo(140.037,77.432,145.348,79.212,147.897,81.051);bezierCurveTo(148.404,81.566,148.176,82.027,147.799,82.479);lineTo(151.701,81.337);bezierCurveTo(151.108,81.216,149.841,81.357,149.988,80.957);bezierCurveTo(149.129,79.006,146.301,78.196,144.373,76.864);bezierCurveTo(143.303,75.83,144.472,75.257,145.134,74.58);closePath();moveTo(43.206,42.601);lineTo(55.579,74.009);lineTo(58.72,73.91);lineTo(47.204,44.407);bezierCurveTo(46.095,43.67,46.03,42.307,43.206,42.599);closePath();moveTo(24.552,42.031);lineTo(37.02,73.723);lineTo(40.161,73.821);lineTo(27.693,42.129);closePath();moveTo(26.838,84.384);lineTo(24.201,84.319);lineTo(24.364,85.054);lineTo(28.073,95.01);lineTo(30.431,93.842);closePath();moveTo(46.25,84.95);lineTo(39.879,94.851);lineTo(41.969,96.467);lineTo(49.106,85.05);lineTo(49.41,84.615);lineTo(46.467,84.585);closePath();moveTo(34.158,93.236);bezierCurveTo(28.428,93.236,23.79,97.796,23.79,103.42);bezierCurveTo(23.79,109.045,28.428,113.605,34.158,113.605);bezierCurveTo(39.887,113.605,44.534,109.045,44.534,103.42);bezierCurveTo(44.534,97.796,39.887,93.236,34.158,93.236);closePath();moveTo(34.158,95.709);bezierCurveTo(38.468,95.709,41.969,99.163,41.969,103.42);bezierCurveTo(41.969,107.678,38.468,111.132,34.158,111.132);bezierCurveTo(29.848,111.132,26.355,107.678,26.355,103.42);bezierCurveTo(26.355,99.163,29.848,95.709,34.158,95.709);closePath();moveTo(37.686,73.914);bezierCurveTo(36.396,73.907,34.711,73.952,34.284,75.365);lineTo(34.264,82.86);bezierCurveTo(34.851,83.621,35.688,83.548,36.501,83.574);lineTo(63.03,83.429);lineTo(71.667,84.19);lineTo(71.667,76.671);bezierCurveTo(71.57,75.908,71.094,75.467,70.239,75.339);bezierCurveTo(61.126,73.734,49.245,73.929,37.69,73.911);closePath();moveTo(20.96,41.269);bezierCurveTo(20.95,41.873,21.535,42.151,21.535,42.151);lineTo(58.958,42.336);bezierCurveTo(54.064,41.351,42.365,39.477,26.123,39.553);bezierCurveTo(24.552,39.66,20.971,40.662,20.96,41.266);closePath();moveTo(24.313,55.545);bezierCurveTo(21.513,55.559,18.717,55.575,15.93,55.601);lineTo(15.93,55.601);lineTo(15.933,57.049);lineTo(14.759,57.062);lineTo(14.766,58.306);lineTo(15.95,58.364);bezierCurveTo(14.607,58.585,12.994,59.67,12.895,61.841);bezierCurveTo(12.905,65.11,12.908,68.38,12.908,71.649);lineTo(11.696,71.652);lineTo(11.677,69.291);lineTo(6.992,69.294);lineTo(6.992,75.196);lineTo(11.624,75.203);lineTo(11.594,73.447);lineTo(12.903,73.424);lineTo(12.913,82.605);bezierCurveTo(12.906,83.92,15.652,86.239,17.455,86.239);lineTo(22.267,83.244);bezierCurveTo(23.884,83.136,24.025,83.726,24.151,84.321);lineTo(59.819,84.64);lineTo(66.729,83.829);moveTo(71.723,83.243);lineTo(156.94,73.252);bezierCurveTo(161.88,72.764,171.856,50.996,153.189,47.695);bezierCurveTo(148.061,46.808,137.657,52.535,131.749,56.8);bezierCurveTo(129.436,58.755,130.007,60.884,131.775,62.783);lineTo(59.566,54.671);lineTo(57.443,54.67);bezierCurveTo(56.477,56.06,54.285,57.93,52.888,58.723);moveTo(49.36,58.361);bezierCurveTo(47.661,57.323,46.395,55.557,44.826,55.486);bezierCurveTo(40.922,55.487,36.922,55.493,32.944,55.499);moveTo(29.862,55.506);bezierCurveTo(28.819,55.509,27.78,55.513,26.746,55.516);lineCap=round;lineWidth=1;strokeStyle=#000;stroke();restore();'
    );
  });

  //=======================================================
  it('complex path made of many different closed and open paths (Sopwith Camel) cached', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'm 15.749277,58.447629 8.495831,-0.05348 m 0.319898,-15.826548 -0.202438,17.295748 0.942206,0.941911 1.345933,-1.816987 0.20211,-11.642611 z m 77.458374,28.680768 c 0,5.308829 -4.303525,9.612686 -9.612485,9.612686 -5.30873,0 -9.612194,-4.303857 -9.612194,-9.612686 0,-5.308829 4.303464,-9.61226 9.612194,-9.61226 5.30896,0 9.612485,4.303431 9.612485,9.61226 z m -3.520874,0 c 0,3.364079 -2.72763,6.091348 -6.091611,6.091348 -3.364243,0 -6.091119,-2.727269 -6.091119,-6.091348 0,-3.363719 2.726876,-6.090791 6.091119,-6.090791 3.363981,0 6.091611,2.727072 6.091611,6.090791 z m -3.997576,0 c 0,1.156718 -0.937743,2.093937 -2.094035,2.093937 -1.156062,0 -2.093871,-0.937219 -2.093871,-2.093937 0,-1.156357 0.937809,-2.093773 2.093871,-2.093773 1.156292,0 2.094035,0.937416 2.094035,2.093773 z m 45.77821,4.283023 c -0.24607,1.90039 5.06492,3.680204 7.61403,5.520093 0.50662,0.514199 0.27889,0.975967 -0.0984,1.427532 l 3.9019,-1.141987 c -0.59258,-0.121397 -1.85951,0.01969 -1.71294,-0.380038 -0.85894,-1.950525 -3.68693,-2.761261 -5.61518,-4.092495 -1.06971,-1.03496 0.0997,-1.60766 0.76126,-2.284203 z M 43.206396,42.60133 55.578964,74.008743 58.71987,73.910313 47.203939,44.40726 c -1.109013,-0.737406 -1.174108,-2.1004 -3.997543,-1.808752 z m -18.654022,-0.570632 12.467721,31.692335 3.140643,0.09843 -12.467656,-31.692927 z m 2.285318,42.353106 -2.636648,-0.06431 0.163066,0.734584 3.709372,9.956142 2.357927,-1.168202 z m 19.411934,0.566268 -6.370726,9.901284 2.090163,1.615665 7.13671,-11.417403 0.303821,-0.4347 -2.942667,-0.02953 z m -12.091915,8.286013 c -5.729323,0 -10.367941,4.560169 -10.367941,10.184405 0,5.62429 4.638618,10.18489 10.367941,10.18489 5.729424,0 10.37654,-4.5606 10.37654,-10.18489 0,-5.624236 -4.647083,-10.184405 -10.37654,-10.184405 z m 0,2.473319 c 4.310029,0 7.811352,3.453552 7.811352,7.711086 0,4.25776 -3.50129,7.71167 -7.811352,7.71167 -4.310157,0 -7.803016,-3.45391 -7.803016,-7.71167 0,-4.257534 3.492859,-7.711086 7.803016,-7.711086 z m 3.528526,-21.795876 c -1.29032,-0.0066 -2.97525,0.03839 -3.402437,1.45155 l -0.01969,7.494437 c 0.586775,0.761915 1.42432,0.688978 2.236565,0.71411 l 26.529545,-0.14502 8.636784,0.761324 0,-7.518487 C 71.56989,75.908478 71.09444,75.467051 70.239377,75.338961 61.126027,73.734287 49.244756,73.929146 37.690371,73.911166 z M 20.959576,41.269176 c -0.0098,0.603377 0.575258,0.881409 0.575258,0.881409 L 58.95771,42.33629 c -4.893946,-0.985482 -16.592629,-2.859625 -32.835015,-2.783473 -1.570354,0.107617 -5.151439,1.109571 -5.163119,1.712718 z m 3.353022,14.276273 c -2.79955,0.01312 -5.595489,0.02953 -8.382964,0.05545 l 0,9.9e-5 0.0033,1.447677 -1.173484,0.01312 0.0066,1.244485 1.184048,0.05807 c -1.34298,0.220812 -2.956414,1.305807 -3.054779,3.476618 0.0098,3.269061 0.01312,6.538943 0.01312,9.808103 l -1.21197,0.0033 -0.01969,-2.361569 -4.6851755,0.0033 0,5.901969 4.6323185,0.0066 -0.02953,-1.7556 1.308596,-0.02297 0.0098,9.180447 c -0.0066,1.315781 2.739048,3.634336 4.542583,3.634336 l 4.811756,-2.995032 c 1.616583,-0.107617 1.758126,0.482078 1.884346,1.076924 l 35.667571,0.318914 6.909664,-0.81031 m 4.994738,-0.585889 85.216614,-9.991675 c 4.93952,-0.487623 14.9162,-22.255511 -3.75098,-25.556727 -5.12814,-0.887479 -15.53194,4.839613 -21.44018,9.104984 -2.31314,1.954593 -1.74166,4.084194 0.0263,5.982879 l -72.209399,-8.111923 -2.12281,-0.0012 c -0.966453,1.390128 -3.158262,3.260465 -4.554559,4.053123 M 49.36027,58.361483 c -1.699757,-1.038536 -2.965602,-2.804438 -4.533856,-2.875275 -3.903936,0.0011 -7.904399,0.0066 -11.882849,0.01312 m -3.081192,0.0066 c -1.043195,0.0033 -2.082715,0.0066 -3.116396,0.0098',
      stroke: '#000',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    layer.add(path);

    stage.add(layer);

    path.cache();
    layer.draw();
    //        layer.draw();
    cloneAndCompareLayer(layer, 230);
  });

  // ======================================================
  it('moveTo with implied lineTos and trailing comma', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'm200,100,100,0,0,50,-100,0z',
      fill: '#fcc',
      //            stroke: '#333',
      //            strokeWidth: 2,
      shadowColor: 'maroon',
      shadowBlur: 2,
      shadowOffset: { x: 10, y: 10 },
      shadowOpacity: 1,
      draggable: true,
    });

    path.on('mouseover', function () {
      this.fill('red');
      layer.draw();
    });

    path.on('mouseout', function () {
      this.fill('#ccc');
      layer.draw();
    });

    layer.add(path);

    stage.add(layer);

    assert.equal(path.data(), 'm200,100,100,0,0,50,-100,0z');
    assert.equal(path.dataArray.length, 5);

    assert.equal(path.dataArray[1].command, 'L');

    var canvas = createCanvas();
    var context = canvas.getContext('2d');
    // stroke
    context.beginPath();
    context.moveTo(200, 100);
    context.lineTo(300, 100);
    context.lineTo(300, 150);
    context.lineTo(200, 150);
    context.closePath();
    context.fillStyle = '#fcc';
    context.shadowColor = 'maroon';
    context.shadowBlur = 2 * Konva.pixelRatio;
    context.shadowOffsetX = 10 * Konva.pixelRatio;
    context.shadowOffsetY = 10 * Konva.pixelRatio;
    context.fill();
    //        context.stroke();
    compareLayerAndCanvas(layer, canvas, 20);
  });

  // ======================================================
  it('add map path', function () {
    var stage = addStage();
    var mapLayer = new Konva.Layer();

    for (var key in worldMap.shapes) {
      var c = worldMap.shapes[key];

      var path = new Konva.Path({
        data: c,
        fill: '#ccc',
        stroke: '#999',
        strokeWidth: 1,
      });

      if (key === 'US') {
        assert.equal(path.dataArray[0].command, 'M');
      }

      path.on('mouseover', function () {
        this.fill('red');
        mapLayer.drawScene();
      });

      path.on('mouseout', function () {
        this.fill('#ccc');
        mapLayer.drawScene();
      });

      mapLayer.add(path);
    }

    stage.add(mapLayer);

    //document.body.appendChild(mapLayer.bufferCanvas.element);
  });

  // ======================================================
  it('curved arrow path', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c =
      'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z';

    var path = new Konva.Path({
      data: c,
      fill: '#ccc',
      stroke: '#999',
      strokeWidth: 1,
    });

    path.on('mouseover', function () {
      this.fill('red');
      layer.draw();
    });

    path.on('mouseout', function () {
      this.fill('#ccc');
      layer.draw();
    });

    layer.add(path);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(12.582,9.551);bezierCurveTo(3.251,16.237,0.921,29.021,7.08,38.564);lineTo(4.72,40.253);lineTo(9.613,42.515);lineTo(14.506,44.777);lineTo(13.938,39.417);lineTo(13.371,34.058);lineTo(11.006,35.752);bezierCurveTo(6.349,28.377,8.176,18.567,15.358,13.422);bezierCurveTo(22.809,8.084,33.175,9.797,38.514,17.246);bezierCurveTo(43.851,24.695,42.139,35.059,34.693,40.398);lineTo(37.55,44.386);bezierCurveTo(47.167,37.493,49.377,24.109,42.485,14.49);bezierCurveTo(35.591,4.87,22.204,2.658,12.582,9.551);closePath();fillStyle=#ccc;fill();lineWidth=1;strokeStyle=#999;stroke();restore();'
    );
  });

  // ======================================================
  it('Quadradic Curve test from SVG w3c spec', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M200,300 Q400,50 600,300 T1000,300';

    var path = new Konva.Path({
      data: c,
      stroke: 'red',
      strokeWidth: 5,
    });

    layer.add(path);

    layer.add(
      new Konva.Circle({
        x: 200,
        y: 300,
        radius: 10,
        fill: 'black',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 600,
        y: 300,
        radius: 10,
        fill: 'black',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 1000,
        y: 300,
        radius: 10,
        fill: 'black',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 400,
        y: 50,
        radius: 10,
        fill: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 800,
        y: 550,
        radius: 10,
        fill: '#888',
      })
    );

    layer.add(
      new Konva.Path({
        data: 'M200,300 L400,50L600,300L800,550L1000,300',
        stroke: '#888',
        strokeWidth: 2,
      })
    );

    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(200,300);quadraticCurveTo(400,50,600,300);quadraticCurveTo(800,550,1000,300);lineWidth=5;strokeStyle=red;stroke();restore();save();transform(1,0,0,1,200,300);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=black;fill();restore();save();transform(1,0,0,1,600,300);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=black;fill();restore();save();transform(1,0,0,1,1000,300);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=black;fill();restore();save();transform(1,0,0,1,400,50);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=#888;fill();restore();save();transform(1,0,0,1,800,550);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=#888;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(200,300);lineTo(400,50);lineTo(600,300);lineTo(800,550);lineTo(1000,300);lineWidth=2;strokeStyle=#888;stroke();restore();'
    );
  });

  // ======================================================
  it('Cubic Bezier Curve test from SVG w3c spec using data', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M100,200 C100,100 250,100 250,200 S400,300 400,200';

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 5,
    });

    path.data(c);

    layer.add(path);

    layer.add(
      new Konva.Circle({
        x: 100,
        y: 200,
        radius: 10,
        stroke: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 250,
        y: 200,
        radius: 10,
        stroke: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 400,
        y: 200,
        radius: 10,
        stroke: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 100,
        y: 100,
        radius: 10,
        fill: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 250,
        y: 100,
        radius: 10,
        fill: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 400,
        y: 300,
        radius: 10,
        fill: '#888',
      })
    );

    layer.add(
      new Konva.Circle({
        x: 250,
        y: 300,
        radius: 10,
        stroke: 'blue',
      })
    );

    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(100,200);bezierCurveTo(100,100,250,100,250,200);bezierCurveTo(250,300,400,300,400,200);lineWidth=5;strokeStyle=red;stroke();restore();save();transform(1,0,0,1,100,200);beginPath();arc(0,0,10,0,6.283,false);closePath();lineWidth=2;strokeStyle=#888;stroke();restore();save();transform(1,0,0,1,250,200);beginPath();arc(0,0,10,0,6.283,false);closePath();lineWidth=2;strokeStyle=#888;stroke();restore();save();transform(1,0,0,1,400,200);beginPath();arc(0,0,10,0,6.283,false);closePath();lineWidth=2;strokeStyle=#888;stroke();restore();save();transform(1,0,0,1,100,100);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=#888;fill();restore();save();transform(1,0,0,1,250,100);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=#888;fill();restore();save();transform(1,0,0,1,400,300);beginPath();arc(0,0,10,0,6.283,false);closePath();fillStyle=#888;fill();restore();save();transform(1,0,0,1,250,300);beginPath();arc(0,0,10,0,6.283,false);closePath();lineWidth=2;strokeStyle=blue;stroke();restore();'
    );
  });

  // ======================================================
  it('path arc', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c =
      'M100,350 l 50,-25 a25,25 -30 0,1 50,-25 l 50,-25 a25,50 -30 0,1 50,-25 l 50,-25 a25,75 -30 0,1 50,-25 l 50,-25 a25,100 -30 0,1 50,-25 l 50,-25';

    var path = new Konva.Path({
      data: c,
      fill: 'none',
      stroke: '#999',
      strokeWidth: 1,
    });

    path.on('mouseover', function () {
      this.fill('red');
      layer.draw();
    });

    path.on('mouseout', function () {
      this.fill('none');
      layer.draw();
    });

    layer.add(path);
    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(100,350);lineTo(150,325);translate(175,312.5);rotate(-0.524);scale(1,1);arc(0,0,27.951,-3.082,0.06,0);scale(1,1);rotate(0.524);translate(-175,-312.5);lineTo(250,275);translate(275,262.5);rotate(-0.524);scale(0.5,1);arc(0,0,55.826,-3.112,0.03,0);scale(2,1);rotate(0.524);translate(-275,-262.5);lineTo(350,225);translate(375,212.5);rotate(-0.524);scale(0.333,1);arc(0,0,83.719,-3.122,0.02,0);scale(3,1);rotate(0.524);translate(-375,-212.5);lineTo(450,175);translate(475,162.5);rotate(-0.524);scale(0.25,1);arc(0,0,111.615,-3.127,0.015,0);scale(4,1);rotate(0.524);translate(-475,-162.5);lineTo(550,125);fillStyle=none;fill();lineWidth=1;strokeStyle=#999;stroke();restore();'
    );
  });

  // ======================================================
  it('Tiger (RAWR!)', function () {
    this.timeout(5000);
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();

    for (var i = 0; i < tiger.length; i++) {
      var path = new Konva.Path(tiger[i]);
      group.add(path);
    }

    group.setDraggable(true);
    layer.add(group);
    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'moveTo(-44.4,313.001);bezierCurveTo(-44.4,313.001,-32.8,290.601,-54.6,316.401);bezierCurveTo(-54.6,316.401,-43.6,306.601,-44.4,313.001);closePath();fillStyle=#cccccc;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(-59.8,298.401);bezierCurveTo(-59.8,298.401,-55,279.601,-52.4,279.801);bezierCurveTo(-52.4,279.801,-44.2,270.801,-50.8,281.401);bezierCurveTo(-50.8,281.401,-56.8,291.001,-56.2,300.801);bezierCurveTo(-56.2,300.801,-56.8,291.201,-59.8,298.401);closePath();fillStyle=#cccccc;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(270.5,287);bezierCurveTo(270.5,287,258.5,277,256,273.5);bezierCurveTo(256,273.5,269.5,292,269.5,299);bezierCurveTo(269.5,299,272,291.5,270.5,287);closePath();fillStyle=#cccccc;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(276,265);bezierCurveTo(276,265,255,250,251.5,242.5);bezierCurveTo(251.5,242.5,278,272,278,276.5);bezierCurveTo(278,276.5,278.5,267.5,276,265);closePath();fillStyle=#cccccc;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(293,111);bezierCurveTo(293,111,281,103,279.5,105);bezierCurveTo(279.5,105,290,111.5,292.5,120);bezierCurveTo(292.5,120,291,111,293,111);closePath();fillStyle=#cccccc;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(301.5,191.5);lineTo(284,179.5);bezierCurveTo(284,179.5,303,196.5,303.5,200.5);lineTo(301.5,191.5);closePath();fillStyle=#cccccc;fill();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(-89.25,169);lineTo(-67.25,173.75);lineWidth=2;strokeStyle=#000000;stroke();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(-39,331);bezierCurveTo(-39,331,-39.5,327.5,-48.5,338);lineWidth=2;strokeStyle=#000000;stroke();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(-33.5,336);bezierCurveTo(-33.5,336,-31.5,329.5,-38,334);lineWidth=2;strokeStyle=#000000;stroke();restore();save();transform(1,0,0,1,0,0);beginPath();moveTo(20.5,344.5);bezierCurveTo(20.5,344.5,22,333.5,10.5,346.5);lineWidth=2;strokeStyle=#000000;stroke();restore();'
    );
  });

  // ======================================================
  it('Tiger (RAWR!) cached', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var group = new Konva.Group();

    for (var i = 0; i < tiger.length; i++) {
      var path = new Konva.Path(tiger[i]);
      group.add(path);
    }

    group.setDraggable(true);
    layer.add(group);
    stage.add(layer);
    group.cache();
    layer.draw();

    cloneAndCompareLayer(layer, 200);
  });

  // ======================================================
  it('Able to determine point on line some distance from another point on line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M10,10 210,160';
    // i.e., from a 3-4-5 triangle

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
    });

    path.data(c);
    layer.add(path);

    layer.add(
      new Konva.Circle({
        x: 10,
        y: 10,
        radius: 10,
        fill: 'black',
      })
    );

    var p1 = Konva.Path.getPointOnLine(125, 10, 10, 210, 160);
    // should be 1/2 way, or (110,85)
    assert.equal(Math.round(p1.x), 110);
    assert.equal(Math.round(p1.y), 85);

    layer.add(
      new Konva.Circle({
        x: p1.x,
        y: p1.y,
        radius: 10,
        fill: 'blue',
      })
    );

    stage.add(layer);
  });

  // ======================================================
  it('Able to determine points on Cubic Bezier Curve', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M100,200 C100,100 250,100 250,200 S400,300 400,200';

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
    });

    path.data(c);

    layer.add(path);
    c = 'M 100 200';

    for (let t = 0.25; t <= 1; t += 0.25) {
      var p1 = Konva.Path.getPointOnCubicBezier(
        t,
        100,
        200,
        100,
        100,
        250,
        100,
        250,
        200
      );
      c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
    }

    for (let t = 0.25; t <= 1; t += 0.25) {
      var p1 = Konva.Path.getPointOnCubicBezier(
        t,
        250,
        200,
        250,
        300,
        400,
        300,
        400,
        200
      );
      c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
    }

    var testPath = new Konva.Path({
      stroke: 'black',
      strokewidth: 2,
      data: c,
    });

    layer.add(testPath);
    stage.add(layer);

    assert.equal(
      c,
      'M 100 200 123.4375 143.75 175 125 226.5625 143.75 250 200 273.4375 256.25 325 275 376.5625 256.25 400 200'
    );
  });

  // ======================================================
  it('Able to determine points on Quadratic Curve', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M200,300 Q400,50 600,300 T1000,300';

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
    });

    path.data(c);

    layer.add(path);
    c = 'M 200 300';

    for (let t = 0.333; t <= 1; t += 0.333) {
      var p1 = Konva.Path.getPointOnQuadraticBezier(
        t,
        200,
        300,
        400,
        50,
        600,
        300
      );
      c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
    }

    for (let t = 0.333; t <= 1; t += 0.333) {
      var p1 = Konva.Path.getPointOnQuadraticBezier(
        t,
        600,
        300,
        800,
        550,
        1000,
        300
      );
      c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
    }

    var testPath = new Konva.Path({
      stroke: 'black',
      strokewidth: 2,
      data: c,
    });

    layer.add(testPath);
    stage.add(layer);

    assert.equal(
      c,
      'M 200 300 333.20000000000005 188.9445 466.40000000000003 188.77800000000002 599.6 299.50050000000005 733.2 411.05550000000005 866.4 411.222 999.6 300.49949999999995'
    );
  });

  // ======================================================
  it('Able to determine points on Elliptical Arc with clockwise stroke', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M 50,100 A 100 50 0 1 1 150 150';

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
    });

    path.data(c);

    layer.add(path);

    var centerParamPoints = Konva.Path.convertEndpointToCenterParameterization(
      50,
      100,
      150,
      150,
      1,
      1,
      100,
      50,
      0
    );

    var start = centerParamPoints[4];
    // 4 = theta
    var dTheta = centerParamPoints[5];
    // 5 = dTheta
    var end = centerParamPoints[4] + dTheta;
    var inc = Math.PI / 6.0;
    // 30 degree resolution

    var p1 = Konva.Path.getPointOnEllipticalArc(
      centerParamPoints[0],
      centerParamPoints[1],
      centerParamPoints[2],
      centerParamPoints[3],
      start,
      0
    );
    c = 'M ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);

    if (
      dTheta < 0 // clockwise
    ) {
      for (let t = start - inc; t > end; t -= inc) {
        p1 = Konva.Path.getPointOnEllipticalArc(
          centerParamPoints[0],
          centerParamPoints[1],
          centerParamPoints[2],
          centerParamPoints[3],
          t,
          0
        );
        c += ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);
      }
    } else {
      // counter-clockwise
      for (let t = start + inc; t < end; t += inc) {
        p1 = Konva.Path.getPointOnEllipticalArc(
          centerParamPoints[0],
          centerParamPoints[1],
          centerParamPoints[2],
          centerParamPoints[3],
          t,
          0
        );
        c += ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);
      }
    }
    p1 = Konva.Path.getPointOnEllipticalArc(
      centerParamPoints[0],
      centerParamPoints[1],
      centerParamPoints[2],
      centerParamPoints[3],
      end,
      0
    );
    c += ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);

    var testpath = new Konva.Path({
      stroke: 'black',
      strokeWidth: 2,
      data: c,
    });

    layer.add(testpath);
    stage.add(layer);

    assert.equal(
      c,
      'M 50.00 100.00 63.40 75.00 100.00 56.70 150.00 50.00 200.00 56.70 236.60 75.00 250.00 100.00 236.60 125.00 200.00 143.30 150.00 150.00'
    );
  });

  // ======================================================
  it('Able to determine points on Elliptical Arc with counter-clockwise stroke', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M 250,100 A 100 50 0 1 0 150 150';

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
    });

    path.data(c);

    layer.add(path);

    var centerParamPoints = Konva.Path.convertEndpointToCenterParameterization(
      250,
      100,
      150,
      150,
      1,
      0,
      100,
      50,
      0
    );

    var start = centerParamPoints[4];
    // 4 = theta
    var dTheta = centerParamPoints[5];
    // 5 = dTheta
    var end = centerParamPoints[4] + dTheta;
    var inc = Math.PI / 6.0;
    // 30 degree resolution

    var p1 = Konva.Path.getPointOnEllipticalArc(
      centerParamPoints[0],
      centerParamPoints[1],
      centerParamPoints[2],
      centerParamPoints[3],
      start,
      0
    );
    c = 'M ' + p1.x.toString() + ' ' + p1.y.toString();

    if (
      dTheta < 0 // clockwise
    ) {
      for (let t = start - inc; t > end; t -= inc) {
        p1 = Konva.Path.getPointOnEllipticalArc(
          centerParamPoints[0],
          centerParamPoints[1],
          centerParamPoints[2],
          centerParamPoints[3],
          t,
          0
        );
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
      }
    } else {
      // counter-clockwise
      for (let t = start + inc; t < end; t += inc) {
        p1 = Konva.Path.getPointOnEllipticalArc(
          centerParamPoints[0],
          centerParamPoints[1],
          centerParamPoints[2],
          centerParamPoints[3],
          t,
          0
        );
        c += ' ' + p1.x.toString() + ' ' + p1.y.toString();
      }
    }
    p1 = Konva.Path.getPointOnEllipticalArc(
      centerParamPoints[0],
      centerParamPoints[1],
      centerParamPoints[2],
      centerParamPoints[3],
      end,
      0
    );
    c += ' ' + p1.x.toString() + ' ' + p1.y.toString();

    var testpath = new Konva.Path({
      stroke: 'black',
      strokeWidth: 2,
      data: c,
    });

    layer.add(testpath);
    stage.add(layer);

    assert.equal(
      c,
      'M 250 100 236.60254037844388 75 200 56.69872981077807 150 50 100.00000000000003 56.69872981077806 63.39745962155615 74.99999999999999 50 99.99999999999997 63.397459621556095 124.99999999999997 99.99999999999996 143.30127018922192 149.99999999999997 150'
    );
  });

  // ======================================================
  it('Able to determine points on Elliptical Arc when rotated', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var c = 'M 250,100 A 100 50 30 1 0 150 150';

    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
    });

    path.data(c);

    layer.add(path);

    var centerParamPoints = Konva.Path.convertEndpointToCenterParameterization(
      250,
      100,
      150,
      150,
      1,
      0,
      100,
      50,
      30
    );

    var start = centerParamPoints[4];
    // 4 = theta
    var dTheta = centerParamPoints[5];
    // 5 = dTheta
    var end = centerParamPoints[4] + dTheta;
    var inc = Math.PI / 6.0;
    // 30 degree resolution
    var psi = centerParamPoints[6];
    // 6 = psi radians

    var p1 = Konva.Path.getPointOnEllipticalArc(
      centerParamPoints[0],
      centerParamPoints[1],
      centerParamPoints[2],
      centerParamPoints[3],
      start,
      psi
    );
    c = 'M ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);

    if (
      dTheta < 0 // clockwise
    ) {
      for (let t = start - inc; t > end; t -= inc) {
        p1 = Konva.Path.getPointOnEllipticalArc(
          centerParamPoints[0],
          centerParamPoints[1],
          centerParamPoints[2],
          centerParamPoints[3],
          t,
          psi
        );
        c += ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);
      }
    } else {
      // counter-clockwise
      for (let t = start + inc; t < end; t += inc) {
        p1 = Konva.Path.getPointOnEllipticalArc(
          centerParamPoints[0],
          centerParamPoints[1],
          centerParamPoints[2],
          centerParamPoints[3],
          t,
          psi
        );
        c += ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);
      }
    }
    p1 = Konva.Path.getPointOnEllipticalArc(
      centerParamPoints[0],
      centerParamPoints[1],
      centerParamPoints[2],
      centerParamPoints[3],
      end,
      psi
    );
    c += ' ' + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2);

    var testpath = new Konva.Path({
      stroke: 'black',
      strokeWidth: 2,
      data: c,
    });

    layer.add(testpath);
    stage.add(layer);

    assert.equal(
      c,
      'M 250.00 100.00 209.63 69.47 162.97 50.77 122.52 48.92 99.13 64.41 99.05 93.09 122.32 127.28 150.00 150.00'
    );
  });

  // ======================================================
  it('getPointOnLine for different directions', function () {
    var origo = {
      x: 0,
      y: 0,
    };

    var p, point;

    //point up left
    p = {
      x: -10,
      y: -10,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(point.x < 0 && point.y < 0, 'The new point should be up left');

    //point up right
    p = {
      x: 10,
      y: -10,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(point.x > 0 && point.y < 0, 'The new point should be up right');

    //point down right
    p = {
      x: 10,
      y: 10,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(point.x > 0 && point.y > 0, 'The new point should be down right');

    //point down left
    p = {
      x: -10,
      y: 10,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(point.x < 0 && point.y > 0, 'The new point should be down left');

    //point left
    p = {
      x: -10,
      y: 0,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(point.x == -10 && point.y == 0, 'The new point should be left');

    //point up
    p = {
      x: 0,
      y: -10,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(
      Math.abs(point.x) < 0.0000001 && point.y == -10,
      'The new point should be up'
    );

    //point right
    p = {
      x: 10,
      y: 0,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(point.x == 10 && point.y == 0, 'The new point should be right');

    //point down
    p = {
      x: 0,
      y: 10,
    };
    point = Konva.Path.getPointOnLine(10, origo.x, origo.y, p.x, p.y);
    assert(
      Math.abs(point.x) < 0.0000001 && point.y == 10,
      'The new point should be down'
    );
  });

  // ======================================================
  it('get path length', function () {
    var path = new Konva.Path({ data: 'M 10,10 L 20,10 L 20,20' });
    assert.equal(path.getLength(), 20);
  });

  // ======================================================

  it('get point at path', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    const data =
      'M 300,10 L 250,100 A 100 40 30 1 0 150 150 C 160,100, 290,100, 300,150';
    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
      data,
    });
    layer.add(path);
    if (isBrowser) {
      const SVGPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      ) as SVGPathElement;
      SVGPath.setAttribute('d', data);
      for (var i = 0; i < path.getLength(); i += 1) {
        var p = path.getPointAtLength(i);
        var circle = new Konva.Circle({
          x: p.x,
          y: p.y,
          radius: 2,
          fill: 'black',
          stroke: 'black',
        });
        layer.add(circle);
        const position = SVGPath.getPointAtLength(i);
        assert(
          Math.abs(p.x / position.x) >= 0.8,
          'error should be smaller than 10%'
        );
        assert(
          Math.abs(p.y / position.y) >= 0.8,
          'error should be smaller than 10%'
        );
      }
    } else {
      var points = [];
      for (var i = 0; i < path.getLength(); i += 20) {
        var p = path.getPointAtLength(i);
        points.push(p);
        var circle = new Konva.Circle({
          x: p.x,
          y: p.y,
          radius: 2,
          fill: 'black',
          stroke: 'black',
        });
        layer.add(circle);
      }

      assert.deepEqual(points, [
        { x: 300, y: 10 },
        { x: 290.28714137642737, y: 27.483145522430753 },
        { x: 280.57428275285474, y: 44.96629104486151 },
        { x: 270.86142412928206, y: 62.44943656729226 },
        { x: 261.1485655057094, y: 79.93258208972301 },
        { x: 251.4357068821368, y: 97.41572761215377 },
        { x: 230.89220826660141, y: 87.23996356219386 },
        { x: 207.0639321224534, y: 74.08466390481559 },
        { x: 182.87529785963875, y: 63.52674972743341 },
        { x: 159.56025996483157, y: 56.104820499018956 },
        { x: 138.30820744216845, y: 52.197497135977514 },
        { x: 120.20328854394192, y: 52.00410710518156 },
        { x: 106.16910423342256, y: 55.53451596967142 },
        { x: 96.92159177720502, y: 62.60862410865827 },
        { x: 92.93250205472883, y: 72.86555428606191 },
        { x: 94.40533374670959, y: 85.78206137467119 },
        { x: 101.26495209131289, y: 100.69922508568548 },
        { x: 113.1614217949117, y: 116.85606400569954 },
        { x: 129.4878585660311, y: 133.42835616090537 },
        { x: 149.41138859764925, y: 149.5706857234721 },
        { x: 159.43138712714935, y: 133.06025615594774 },
        { x: 175.3017710206886, y: 122.31378864213205 },
        { x: 194.92856277944335, y: 115.73314636675508 },
        { x: 214.84499816899648, y: 112.85265466076682 },
        { x: 234.86585690487928, y: 112.83275701234302 },
        { x: 254.65745479392615, y: 115.6401774356189 },
        { x: 273.58108654098885, y: 121.79846344304384 },
        { x: 289.93157588171135, y: 132.43782950384232 },
        { x: 299.87435436448743, y: 149.4028482225714 },
      ]);
    }

    stage.add(layer);
  });

  it('get point at path with float attrs', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    const data =
      'M419.0000314094981 342.88624187900973 L419.00003140949804 577.0038889378335 L465.014001082264 577.0038889378336 Z';
    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
      data,
    });
    layer.add(path);
    if (isBrowser) {
      const SVGPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      ) as SVGPathElement;
      SVGPath.setAttribute('d', data);
      for (var i = 0; i < path.getLength(); i += 1) {
        var p = path.getPointAtLength(i);
        var circle = new Konva.Circle({
          x: p.x,
          y: p.y,
          radius: 2,
          fill: 'black',
          stroke: 'black',
        });
        layer.add(circle);
        const position = SVGPath.getPointAtLength(i);
        assert(
          Math.abs(p.x - position.x) <= 1,
          'error for x should be smaller than 10% for i = ' + i
        );
        assert(
          Math.abs(p.y - position.y) <= 1,
          'error for y should be smaller than 10% for i = ' + i
        );
      }
    }
  });

  it('get point at path - bezier', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    const data =
      'M100,250 q150,-150 300,0 M 117.12814070351759 108.66938206658291 C 79.18719346733668 277.73956799623113 75.85761180904522 379.96743797110554 82.84673366834171 395.7761659861809 S 148.83130025125627 280.47708118718595 177.12060301507537 244.36661824748745 S 326.1725898241206 61.02036887562815 325.67336683417085 85.815110709799 S 174.998726758794 435.7304316896985 172.8354271356784 457.1970202575377 S 273.65633103015074 310.01551271984926 307.1042713567839 270.07767352386935 S 466.09929459798997 92.08432302135678 459.9422110552764 114.3829499057789 S 266.23512060301505 435.5226006595478 254.2537688442211 461.4821961369347 S 328.1430565326633 368.1639210113065 357.09798994974875 337.2120956344221 S 486.31961118090453 207.61623570979899 502.79396984924625 195.8012916143216 S 511.48859170854274 200.85065719221106 498.50879396984925 235.79626648869348 S 379.73086055276383 489.4401119660804 391.37939698492465 495.76360317211055 S 573.2022663316583 313.03941849874377 598.4962311557789 290.0751609610553 S 608.3285672110553 288.6610529208543 608.4949748743719 298.64551271984925 S 604.9168530150754 352.64801334799 599.9246231155779 375.778678548995 S 540.6820665829146 508.5077162374372 565.643216080402 497.19199513190955 S 690.3761155778894 408.77881799623117 814.1834170854271 278.6480252826633';
    var path = new Konva.Path({
      stroke: 'red',
      strokeWidth: 3,
      data,
    });
    layer.add(path);
    if (isBrowser) {
      const SVGPath = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      ) as SVGPathElement;
      SVGPath.setAttribute('d', data);
      for (var i = 0; i < path.getLength(); i += 10) {
        var p = path.getPointAtLength(i);
        var circle = new Konva.Circle({
          x: p.x,
          y: p.y,
          radius: 2,
          fill: 'black',
          stroke: 'black',
        });
        layer.add(circle);
        const position = SVGPath.getPointAtLength(i);
        assert(
          Math.abs(p.x / position.x) >= 0.8,
          'error should be smaller than 10%'
        );
        assert(
          Math.abs(p.y / position.y) >= 0.8,
          'error should be smaller than 10%'
        );
      }
    } else {
      var points = [];
      for (var i = 0; i < path.getLength(); i += 500) {
        var p = path.getPointAtLength(i);
        points.push(p);
        var circle = new Konva.Circle({
          x: p.x,
          y: p.y,
          radius: 2,
          fill: 'black',
          stroke: 'black',
        });
        layer.add(circle);
      }

      assert.deepEqual(points, [
        { x: 100, y: 250 },
        { x: 88.80979830887104, y: 261.9310198815103 },
        { x: 296.17215373535686, y: 105.30891997028526 },
        { x: 207.5911710830848, y: 414.96086124898176 },
        { x: 410.01622229664224, y: 202.72024124427364 },
        { x: 374.86125434742394, y: 318.78396882819396 },
        { x: 392.21257855027216, y: 483.8201732191269 },
        { x: 572.3287288437606, y: 447.38305323763467 },
      ]);
    }
    stage.add(layer);
  });

  // ======================================================
  it('Borneo Map (has scientific notation: -10e-4)', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var borneo = new Konva.Path({
      data: 'm 136.68513,236.08861 c -0.63689,-0.67792 -0.75417,-1.28099 -1.03556,-5.32352 -0.26489,-3.80589 -0.4465,-4.81397 -1.09951,-6.1026 -0.51169,-1.00981 -0.98721,-1.54361 -1.375,-1.54361 -0.8911,0 -3.48931,-1.22828 -3.80975,-1.80103 -0.16294,-0.29089 -0.87295,-0.56825 -1.68693,-0.65886 -1.13423,-0.12629 -1.91094,0.0661 -4.02248,0.99633 -4.0367,1.77835 -5.46464,1.87106 -6.79674,0.44127 -0.51948,-0.55765 -0.64763,-1.12674 -0.64763,-2.87683 l 0,-2.18167 -0.87832,0.20996 c -0.48312,0.11549 -1.12041,0.33383 -1.41635,0.4852 -1.52799,0.78172 -4.61534,-0.0398 -5.55846,-1.47906 -0.30603,-0.46718 -1.06518,-1.19501 -1.68667,-1.61739 -1.27136,-0.86387 -1.62607,-0.6501 -1.63439,0.98494 -0.007,1.00822 -0.76687,2.38672 -1.31885,2.38672 -0.17579,0 -1.27182,0.66553 -2.4356,1.47895 -4.016775,2.8076 -6.006455,3.29182 -7.693525,1.87231 -0.52348,-0.44054 -1.43004,-1.00203 -2.01445,-1.24775 -1.35902,-0.57143 -2.10139,-0.21496 -5.36296,2.57523 -2.00259,1.71315 -2.55857,2.02869 -3.57441,2.02869 -0.66172,0 -1.31931,-0.17966 -1.46135,-0.39925 -0.27734,-0.42865 -0.75823,-5.15099 -0.87007,-8.54399 -0.0708,-2.14922 -0.41754,-3.83281 -0.78935,-3.83281 -0.1176,0 -0.45993,0.28746 -0.76078,0.63881 -0.66657,0.77849 -3.4572,0.87321 -4.70537,0.15969 -1.29782,-0.7419 -2.38029,-0.55672 -5.01545,0.85797 -2.16783,1.16385 -2.75945,1.33971 -4.5666,1.35746 -1.66762,0.0163 -2.276,-0.12217 -3.09174,-0.70405 -0.61985,-0.44211 -1.09397,-0.5977 -1.21663,-0.39925 -0.32993,0.53385 -2.25686,0.37294 -2.80642,-0.23436 -0.27856,-0.30774 -0.65658,-0.95453 -0.8401,-1.43731 -0.42448,-1.11632 -0.91809,-1.10316 -3.01531,0.0804 -0.93379,0.52702 -2.13107,0.9582 -2.66054,0.9582 -1.46554,0 -1.97734,-0.82307 -2.19476,-3.52955 -0.10515,-1.30865 -0.4137,-2.90864 -0.68575,-3.55553 -0.37975,-0.90312 -0.41736,-1.39768 -0.16196,-2.13038 0.35544,-1.01957 -0.24711,-3.50377 -1.40121,-5.77657 -0.48023,-0.94578 -0.50724,-1.33822 -0.19445,-2.82926 0.40575,-1.93441 -0.0409,-3.36568 -1.16059,-3.72114 -0.3255,-0.10331 -0.93466,-0.55279 -1.35374,-0.99885 -1.12569,-1.19829 -1.03821,-2.92553 0.22088,-4.35957 0.85079,-0.96896 1.01308,-1.45348 1.2082,-3.60666 l 0.22545,-2.48734 -1.16949,-1.19763 c -0.64324,-0.65869 -1.26203,-1.64897 -1.37517,-2.20061 -0.13388,-0.6528 -0.56813,-1.23242 -1.24372,-1.66009 l -1.03807,-0.65709 0,1.0782 c 0,0.59301 -0.21786,1.38922 -0.48413,1.76937 -0.68007,0.97099 -4.56312,2.96438 -5.77445,2.96438 -1.55729,0 -1.88611,-0.67097 -1.88611,-3.84837 0,-3.52819 0.41663,-4.13666 2.83284,-4.13666 1.49279,0 1.57631,-0.0396 1.09598,-0.51996 -0.4316,-0.43155 -0.69566,-0.4587 -1.55343,-0.15971 -0.56839,0.19815 -1.3354,0.35443 -1.70442,0.34729 -0.86278,-0.0167 -2.61563,-1.51607 -3.02205,-2.58498 -0.3513,-0.92403 -0.12267,-3.38466 0.34119,-3.67132 0.16474,-0.1018 -0.39367,-0.50661 -1.24085,-0.89959 -2.032471,-0.94281 -2.321421,-1.35146 -2.487701,-3.51839 -0.0772,-1.00533 -0.30119,-2.31552 -0.4979,-2.91152 -0.48076,-1.45668 -0.16499,-2.30832 0.90163,-2.43139 0.843711,-0.0974 0.860511,-0.14171 0.748911,-1.97594 -0.0696,-1.14269 0.0236,-1.96143 0.23793,-2.09396 0.47223,-0.29188 -2.501621,-3.97433 -3.330171,-4.12358 -0.34456,-0.062 -0.75956,-0.23921 -0.92229,-0.39365 -0.3459,-0.32835 -0.78945,-2.83658 -0.98794,-5.58637 -0.0769,-1.06517 -0.35848,-2.55647 -0.62576,-3.31402 -0.71739,-2.03331 -0.61465,-2.55112 0.76687,-3.86532 l 1.25273,-1.19173 -0.46915,-1.36178 c -0.53343,-1.54826 -0.33638,-2.99085 0.48923,-3.5815 0.65547,-0.46898 1.32731,-2.61652 1.52388,-4.87126 0.13191,-1.51252 0.2658,-1.7153 2.531131,-3.83281 2.21127,-2.06705 2.41106,-2.36144 2.64687,-3.89989 0.31881,-2.07979 0.74608,-2.60075 2.34208,-2.85597 0.69615,-0.11132 1.66359,-0.53718 2.14988,-0.94636 1.89204,-1.59201 4.16695,-1.77416 4.16695,-0.33363 0,0.40454 -0.23171,1.4157 -0.51499,2.24703 -0.28322,0.83134 -0.45486,1.57164 -0.38139,1.64512 0.0735,0.0735 1.32057,0.92807 2.77127,1.89909 2.57827,1.72574 2.68847,1.7655 4.89522,1.7655 1.74495,0 2.50706,-0.15424 3.35669,-0.67937 0.91121,-0.56315 1.2344,-0.61779 1.88934,-0.3194 0.43449,0.19798 1.19684,0.35997 1.69411,0.35997 1.03354,0 1.51204,0.45563 1.67033,1.59058 0.10938,0.78459 0.54215,1.02641 2.56344,1.43244 0.47079,0.0946 1.07249,0.38843 1.33713,0.65302 0.29826,0.29829 0.55659,0.35879 0.67998,0.15922 0.3007,-0.48659 2.51019,-0.38548 3.21433,0.1471 0.90129,0.6817 0.99638,0.6211 1.2201,-0.77786 0.1114,-0.69691 0.4878,-1.53284 0.83642,-1.85761 0.34861,-0.32477 0.76943,-1.29968 0.93532,-2.16645 0.36198,-1.89196 1.67658,-4.95214 2.37708,-5.53353 0.45941,-0.38127 0.45882,-0.50661 -0.007,-1.40586 -0.92929,-1.79695 -1.07762,-2.78281 -0.59325,-3.94207 0.32267,-0.77223 0.71393,-1.13742 1.3562,-1.26589 l 0.90282,-0.18055 -0.12723,-3.168 -0.1273,-3.168021 1.13626,0 c 0.6249,0 1.22425,0.14254 1.33189,0.31676 0.11034,0.17851 0.92013,-0.22348 1.85538,-0.92103 2.57554,-1.920815 3.6054,-2.317745 6.74013,-2.597735 2.80648,-0.25066 4.59942,-0.61535 8.65387,-1.76019 1.05398,-0.29761 2.49129,-0.66582 3.19396,-0.81822 2.5583,-0.55486 5.16562,-1.18239 7.665675,-1.84504 2.13376,-0.56557 2.7297,-0.87493 3.61346,-1.87587 1.968,-2.22882 6.60136,-8.28119 7.54474,-9.85529 0.55323,-0.92329 1.87182,-2.29956 3.218,-3.35904 2.58733,-2.03622 6.23997,-6.36804 7.37413,-8.74536 0.64823,-1.35877 0.73216,-1.8923 0.56253,-3.57654 -0.2316,-2.3005 -0.44696,-2.16353 3.91929,-2.49301 3.85817,-0.29115 6.65679,-1.49266 9.77494,-4.19656 2.99721,-2.5991 5.77546,-4.25711 7.14234,-4.26265 1.34414,-0.005 2.18866,0.95864 1.93792,2.21228 l -0.19117,0.956 1.02783,-0.62674 c 0.66237,-0.40384 1.60221,-0.62716 2.64269,-0.62793 1.73168,-10e-4 3.01752,-0.70122 4.31246,-2.34742 0.89476,-1.13744 0.70339,-1.77317 -0.78398,-2.60556 -0.68465,-0.38314 -1.52661,-1.0834 -1.87097,-1.55613 -0.54929,-0.75408 -0.57635,-0.97959 -0.22059,-1.83856 0.52649,-1.27114 3.93115,-4.11017 4.92904,-4.11017 0.41859,0 1.13672,0.14279 1.59566,0.3173 1.3868,0.52725 2.80354,-0.28364 3.6531,-2.09077 0.39579,-0.84216 1.25891,-2.18904 1.91795,-2.99304 1.48075,-1.80638 2.89866,-4.72745 2.89866,-5.97158 0,-0.75538 0.58238,-1.50827 3.06391,-3.96067 2.7523,-2.72002 6.3045,-6.98689 7.09162,-8.51845 0.1634,-0.318 0.3954,-1.22055 0.51562,-2.00566 0.25722,-1.68064 1.72382,-4.16066 2.46108,-4.16147 0.9766,-10e-4 2.12459,1.22566 2.31255,2.47132 0.0998,0.66067 0.27255,1.72385 0.384,2.36261 0.1155,0.66184 0.0472,1.45181 -0.15868,1.83656 -0.24595,0.45955 -0.25349,0.67517 -0.0229,0.67517 0.51299,0 2.24002,-2.8963 2.24002,-3.75665 0,-0.8354 0.53999,-2.02246 1.08581,-2.38694 0.19334,-0.12906 0.94292,-0.23686 1.66584,-0.23955 1.77381,-0.007 2.99753,0.95517 2.99753,2.35583 0,0.57021 0.21732,1.76868 0.48299,2.66324 l 0.48306,1.6265 0.92969,-0.92972 c 1.22287,-1.22287 2.47045,-1.24866 2.92225,-0.0604 0.22007,0.57891 0.22505,1.10057 0.0151,1.56166 -0.27458,0.60266 -0.20454,0.71514 0.53993,0.86809 1.18369,0.24315 3.55993,2.06175 3.91536,2.99648 0.59574,1.567 0.35077,3.19938 -0.65144,4.34081 -0.94122,1.07196 -0.94371,1.08593 -0.60505,3.28498 0.18712,1.21464 0.38753,2.25901 0.44545,2.32083 0.2451,0.26166 3.313,-0.9897 3.8317,-1.56289 1.62004,-1.79007 4.61934,0.34098 4.61934,3.28202 0,0.59127 -0.10771,1.21358 -0.23953,1.38292 -0.13176,0.16934 0.1309,-0.10749 0.58362,-0.61518 l 0.82309,-0.92308 2.45525,0.57882 c 3.13892,0.74002 4.67982,1.61224 5.4805,3.10222 0.49583,0.92281 0.83285,1.18897 1.50604,1.18964 0.49596,0.001 1.31643,0.39216 1.91637,0.91477 0.57707,0.50266 1.55223,1.17153 2.16717,1.48639 0.61481,0.31487 1.27608,0.78847 1.46955,1.05246 0.39952,0.54529 2.27154,0.59949 2.79024,0.0808 0.66827,-0.66817 2.3398,-0.37712 3.37202,0.58712 0.87138,0.81397 0.99174,1.13441 0.98984,2.63507 -0.007,3.14067 -1.18875,4.18009 -7.03587,6.17196 -3.71253,1.26471 -4.57971,1.44538 -6.93747,1.44538 -2.24861,0 -2.8547,-0.11412 -3.66279,-0.68954 -0.94626,-0.67382 -0.99252,-0.67652 -2.02854,-0.11858 -0.5831,0.31401 -1.383,0.91461 -1.77767,1.33464 l -0.71741,0.76372 1.56061,1.58439 c 1.40266,1.42413 1.61342,1.53657 2.08298,1.11159 0.76662,-0.69377 2.74012,-0.60035 3.50647,0.16598 0.78732,0.78729 0.81648,1.55502 0.0799,2.09925 -0.83901,0.61987 -0.0838,1.18313 1.57667,1.17578 1.61709,-0.007 2.17621,0.35138 2.17621,1.3954 0,0.59148 -0.17166,0.7594 -0.7769,0.7594 -0.48332,0 -0.84989,0.22977 -0.96998,0.60798 -0.26508,0.83534 -2.11417,1.6503 -4.4471,1.96007 -1.90366,0.25276 -5.24254,1.10817 -7.59191,1.94503 -1.09649,0.39058 -1.18265,0.52074 -1.37769,2.08163 -0.25454,2.03716 -0.67941,2.42422 -2.5359,2.31005 -0.79407,-0.0488 -1.53022,-0.002 -1.6359,0.10335 -0.10561,0.10567 0.32091,0.60142 0.94784,1.10167 0.62693,0.50027 1.13993,1.14348 1.13993,1.4294 0,0.28592 0.21555,0.69878 0.47906,0.91747 1.02219,0.84833 0.30092,2.43799 -1.55295,3.4227 -0.52676,0.27977 -0.48306,0.33828 0.3819,0.51126 1.25557,0.25111 1.75716,1.19504 1.48651,2.79737 -0.15363,0.90893 -0.36794,1.2537 -0.77945,1.2537 -1.42926,0 -3.3719,-2.70726 -2.60535,-3.63084 0.50081,-0.60337 -1.57909,-0.86467 -4.87669,-0.61268 -2.37814,0.18174 -2.45709,0.21144 -1.43732,0.54105 0.67928,0.21956 1.25642,0.70374 1.55806,1.30695 0.41505,0.8301 0.62988,0.94551 1.607,0.86325 0.85566,-0.072 1.30196,0.0903 1.84916,0.67285 0.87917,0.9358 1.26172,2.8927 0.69828,3.57163 -0.45639,0.54984 -2.57856,0.65234 -3.08199,0.14886 -0.23101,-0.23099 -0.45619,-0.1844 -0.73549,0.15214 -0.34547,0.41624 -0.19184,0.54147 1.0828,0.88237 2.06555,0.55246 2.84678,1.34484 2.63181,2.66945 -0.12598,0.77608 -0.0111,1.1894 0.4446,1.60189 0.33781,0.30575 0.61514,0.85703 0.61626,1.22506 0,0.40883 0.37665,0.8823 0.9648,1.21704 0.60282,0.34303 1.20761,1.11895 1.61742,2.075045 0.37403,0.87256 1.58191,2.485991 2.81788,3.764031 2.72839,2.82133 3.02053,3.36933 2.75178,5.16167 -0.1765,1.17708 -0.43169,1.57351 -1.52084,2.36249 -0.71977,0.52142 -1.65712,1.46074 -2.08292,2.08735 -0.66074,0.97241 -0.72193,1.26543 -0.41747,2.00042 0.19615,0.47362 1.00666,1.25369 1.80099,1.7335 0.79426,0.47981 1.6716,1.26687 1.94966,1.74904 0.56868,0.98649 2.52869,2.54597 4.42534,3.52103 0.69619,0.35796 1.69715,1.10835 2.22417,1.66754 0.52702,0.55918 1.52124,1.30625 2.2095,1.66012 1.53401,0.78869 4.33814,2.85596 4.33814,3.19814 0,0.64314 2.36392,2.78408 3.29157,2.98114 3.11842,0.66236 2.71293,3.44603 -0.88801,6.09705 l -1.28558,0.94651 -5.32705,-0.0434 c -4.41945,-0.036 -5.46766,-0.13568 -6.15336,-0.58491 -1.12014,-0.734 -3.69123,-1.21344 -3.69123,-0.68833 0,0.88679 -1.22942,1.53613 -2.56839,1.35654 -1.12847,-0.15136 -1.45376,-0.0446 -2.40271,0.78858 -0.60361,0.52999 -1.09747,1.11694 -1.09747,1.30432 0,0.61061 -2.01766,4.84486 -2.64971,5.56065 -0.83547,0.94619 -1.93367,5.6836 -1.50374,6.48688 0.50015,0.93456 0.37973,2.29694 -0.31815,3.59909 -0.77894,1.45317 -0.79106,1.89641 -0.10398,3.81328 0.46,1.28334 0.67568,1.5151 1.48658,1.597 1.48403,0.14992 1.74197,0.90287 0.92798,2.70938 -0.38137,0.84625 -0.78522,2.35688 -0.89764,3.35694 -0.11931,1.06047 -0.42298,2.01508 -0.72888,2.29042 -0.68334,0.61527 -3.70237,1.79849 -4.6086,1.8063 -0.72042,0.007 -3.41815,2.85544 -5.35745,5.65834 -1.05175,1.52015 -2.85327,2.4565 -4.21281,2.18961 -0.75535,-0.14829 -0.87832,-0.0687 -0.87832,0.56857 0,0.91256 -0.75207,1.60008 -2.29008,2.09359 -1.4381,0.46144 -1.7214,0.80341 -1.96204,2.3682 -0.23809,1.54838 -0.68406,2.08325 -2.35507,2.82408 l -1.33701,0.5928 0.77815,0.77808 c 0.69428,0.6944 0.77808,1.05197 0.77808,3.32499 0,1.85231 -0.13241,2.67923 -0.48529,3.03212 -0.43398,0.43402 -0.35818,0.52049 0.71872,0.81954 0.66212,0.18388 1.51875,0.33512 1.9036,0.3361 0.38485,0.001 0.78136,0.13367 0.88094,0.29487 0.25866,0.41856 -0.38281,4.69924 -0.97325,6.49419 l -0.49911,1.51716 -1.65116,-0.001 -1.65116,-10e-4 0.0983,3.6244 0.0984,3.6244 -1.14753,1.00754 c -0.63119,0.55415 -1.34035,1.00754 -1.57601,1.00754 -0.28893,0 -0.47605,0.57495 -0.57491,1.76696 -0.11787,1.42104 -0.33794,1.96816 -1.1244,2.79476 -1.13233,1.19012 -2.96046,4.69205 -2.96046,5.671 0,1.11194 -0.56115,1.80916 -1.6279,2.02253 -0.55663,0.11131 -1.67566,0.67436 -2.48682,1.25124 -1.22006,0.86773 -6.20079,3.10238 -6.91473,3.10238 -0.11119,0 -1.23238,0.43908 -2.49148,0.97576 -1.25917,0.53667 -2.86172,1.21939 -3.56125,1.51716 -0.69952,0.29776 -3.03704,1.4397 -5.19451,2.53764 -2.15747,1.09794 -4.25494,1.99626 -4.66121,1.99626 -0.4062,0 -1.06176,-0.34404 -1.4569,-0.76453 z',
      fill: 'blue',
    });
    layer.add(borneo);
    stage.add(layer);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'bezierCurveTo(209.761,60.371,209.972,60.483,210.442,60.058);bezierCurveTo(211.208,59.365,213.182,59.458,213.948,60.224);bezierCurveTo(214.736,61.012,214.765,61.779,214.028,62.324);bezierCurveTo(213.189,62.943,213.944,63.507,215.605,63.499);bezierCurveTo(217.222,63.492,217.781,63.851,217.781,64.895);bezierCurveTo(217.781,65.486,217.609,65.654,217.004,65.654);bezierCurveTo(216.521,65.654,216.154,65.884,216.034,66.262);bezierCurveTo(215.769,67.097,213.92,67.912,211.587,68.222);bezierCurveTo(209.683,68.475,206.345,69.33,203.995,70.167);bezierCurveTo(202.899,70.558,202.813,70.688,202.617,72.249);bezierCurveTo(202.363,74.286,201.938,74.673,200.082,74.559);bezierCurveTo(199.287,74.51,198.551,74.557,198.446,74.662);bezierCurveTo(198.34,74.768,198.767,75.264,199.394,75.764);bezierCurveTo(200.02,76.264,200.533,76.907,200.533,77.193);bezierCurveTo(200.533,77.479,200.749,77.892,201.012,78.111);bezierCurveTo(202.035,78.959,201.313,80.549,199.46,81.533);bezierCurveTo(198.933,81.813,198.976,81.872,199.841,82.045);bezierCurveTo(201.097,82.296,201.599,83.24,201.328,84.842);bezierCurveTo(201.174,85.751,200.96,86.096,200.549,86.096);bezierCurveTo(199.119,86.096,197.177,83.389,197.943,82.465);bezierCurveTo(198.444,81.862,196.364,81.6,193.066,81.852);bezierCurveTo(190.688,82.034,190.609,82.064,191.629,82.393);bezierCurveTo(192.308,82.613,192.886,83.097,193.187,83.7);bezierCurveTo(193.602,84.53,193.817,84.646,194.794,84.564);bezierCurveTo(195.65,84.492,196.096,84.654,196.643,85.236);bezierCurveTo(197.523,86.172,197.905,88.129,197.342,88.808);bezierCurveTo(196.885,89.358,194.763,89.46,194.26,88.957);bezierCurveTo(194.029,88.726,193.803,88.772,193.524,89.109);bezierCurveTo(193.179,89.525,193.332,89.65,194.607,89.991);bezierCurveTo(196.673,90.544,197.454,91.336,197.239,92.661);bezierCurveTo(197.113,93.437,197.228,93.85,197.683,94.263);bezierCurveTo(198.021,94.568,198.299,95.12,198.3,95.488);bezierCurveTo(198.3,95.897,198.676,96.37,199.264,96.705);bezierCurveTo(199.867,97.048,200.472,97.824,200.882,98.78);bezierCurveTo(201.256,99.652,202.464,101.266,203.7,102.544);bezierCurveTo(206.428,105.365,206.72,105.913,206.452,107.706);bezierCurveTo(206.275,108.883,206.02,109.279,204.931,110.068);bezierCurveTo(204.211,110.589,203.274,111.529,202.848,112.155);bezierCurveTo(202.187,113.128,202.126,113.421,202.43,114.156);bezierCurveTo(202.626,114.629,203.437,115.409,204.231,115.889);bezierCurveTo(205.026,116.369,205.903,117.156,206.181,117.638);bezierCurveTo(206.75,118.625,208.71,120.184,210.606,121.159);bezierCurveTo(211.302,121.517,212.303,122.268,212.83,122.827);bezierCurveTo(213.357,123.386,214.352,124.133,215.04,124.487);bezierCurveTo(216.574,125.276,219.378,127.343,219.378,127.685);bezierCurveTo(219.378,128.328,221.742,130.469,222.67,130.666);bezierCurveTo(225.788,131.329,225.383,134.112,221.782,136.763);lineTo(220.496,137.71);lineTo(215.169,137.666);bezierCurveTo(210.75,137.63,209.701,137.531,209.016,137.082);bezierCurveTo(207.896,136.348,205.324,135.868,205.324,136.393);bezierCurveTo(205.324,137.28,204.095,137.929,202.756,137.75);bezierCurveTo(201.628,137.598,201.302,137.705,200.353,138.538);bezierCurveTo(199.75,139.068,199.256,139.655,199.256,139.843);bezierCurveTo(199.256,140.453,197.238,144.688,196.606,145.403);bezierCurveTo(195.771,146.35,194.672,151.087,195.102,151.89);bezierCurveTo(195.603,152.825,195.482,154.187,194.784,155.489);bezierCurveTo(194.005,156.942,193.993,157.386,194.68,159.303);bezierCurveTo(195.14,160.586,195.356,160.818,196.167,160.9);bezierCurveTo(197.651,161.049,197.909,161.802,197.095,163.609);bezierCurveTo(196.713,164.455,196.31,165.966,196.197,166.966);bezierCurveTo(196.078,168.026,195.774,168.981,195.468,169.256);bezierCurveTo(194.785,169.872,191.766,171.055,190.86,171.063);bezierCurveTo(190.139,171.07,187.442,173.918,185.502,176.721);bezierCurveTo(184.451,178.241,182.649,179.177,181.289,178.911);bezierCurveTo(180.534,178.762,180.411,178.842,180.411,179.479);bezierCurveTo(180.411,180.392,179.659,181.079,178.121,181.573);bezierCurveTo(176.683,182.034,176.4,182.376,176.159,183.941);bezierCurveTo(175.921,185.489,175.475,186.024,173.804,186.765);lineTo(172.467,187.358);lineTo(173.245,188.136);bezierCurveTo(173.939,188.83,174.023,189.188,174.023,191.461);bezierCurveTo(174.023,193.313,173.891,194.14,173.538,194.493);bezierCurveTo(173.104,194.927,173.18,195.013,174.257,195.313);bezierCurveTo(174.919,195.496,175.775,195.648,176.16,195.649);bezierCurveTo(176.545,195.65,176.942,195.782,177.041,195.944);bezierCurveTo(177.3,196.362,176.658,200.643,176.068,202.438);lineTo(175.569,203.955);lineTo(173.918,203.954);lineTo(172.266,203.953);lineTo(172.365,207.577);lineTo(172.463,211.202);lineTo(171.316,212.209);bezierCurveTo(170.684,212.763,169.975,213.217,169.74,213.217);bezierCurveTo(169.451,213.217,169.264,213.792,169.165,214.984);bezierCurveTo(169.047,216.405,168.827,216.952,168.04,217.778);bezierCurveTo(166.908,218.969,165.08,222.471,165.08,223.449);bezierCurveTo(165.08,224.561,164.519,225.259,163.452,225.472);bezierCurveTo(162.895,225.583,161.776,226.146,160.965,226.723);bezierCurveTo(159.745,227.591,154.764,229.826,154.05,229.826);bezierCurveTo(153.939,229.826,152.818,230.265,151.559,230.801);bezierCurveTo(150.3,231.338,148.697,232.021,147.998,232.319);bezierCurveTo(147.298,232.616,144.961,233.758,142.803,234.856);bezierCurveTo(140.646,235.954,138.548,236.852,138.142,236.852);bezierCurveTo(137.736,236.852,137.08,236.508,136.685,236.088);closePath();fillStyle=blue;fill();restore();'
    );
  });

  // ======================================================
  it('Stroke and fill when no closed', function () {
    // https://github.com/konvajs/konva/issues/150

    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'M 50 0 C 50 150 170 170 200 170',
      stroke: 'black',
      fill: '#ff0000',
    });

    // override color key so that we can test the context trace
    path.colorKey = 'black';

    path.on('mouseover', function () {
      this.stroke('#f00');
      layer.draw();
    });

    path.on('mouseout', function () {
      this.stroke('#000');
      layer.draw();
    });

    layer.add(path);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    //console.log(trace);

    var hitTrace = layer.hitCanvas.getContext().getTrace();
    //console.log(hitTrace);

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,0);bezierCurveTo(50,150,170,170,200,170);fillStyle=#ff0000;fill();lineWidth=2;strokeStyle=black;stroke();restore();'
    );
    assert.equal(
      hitTrace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(50,0);bezierCurveTo(50,150,170,170,200,170);save();fillStyle=black;fill();restore();lineWidth=2;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  // do we need to fill hit, when it is not closed?
  it('Stroke when no closed', function () {
    // https://github.com/konvajs/konva/issues/867

    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'M 0 0 L 100 100 L 100 0',
      stroke: 'black',
    });

    // override color key so that we can test the context trace
    path.colorKey = 'black';

    path.on('mouseover', function () {
      this.stroke('#f00');
      layer.draw();
    });

    path.on('mouseout', function () {
      this.stroke('#000');
      layer.draw();
    });

    layer.add(path);
    stage.add(layer);

    var trace = layer.getContext().getTrace();

    var hitTrace = layer.hitCanvas.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(0,0);lineTo(100,100);lineTo(100,0);lineWidth=2;strokeStyle=black;stroke();restore();'
    );
    assert.equal(
      hitTrace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(0,0);lineTo(100,100);lineTo(100,0);lineWidth=2;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('draw path with no space in numbers', function () {
    // https://github.com/konvajs/konva/issues/329

    var stage = addStage();
    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'M10.5.5l10 10',
      stroke: 'black',
    });
    layer.add(path);

    stage.add(layer);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(10.5,0.5);lineTo(20.5,10.5);lineWidth=2;strokeStyle=black;stroke();restore();'
    );
  });

  it('getClientRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var path = new Konva.Path({
      data: 'M61.55,184.55 60.55,280.55 164.55,284.55 151.55,192.55 Z',
      fill: 'black',
      stroke: 'red',
    });
    layer.add(path);
    var rect = path.getClientRect();
    assertAlmostDeepEqual(rect, {
      x: 59.55,
      y: 183.55,
      width: 106,
      height: 102,
    });
  });

  it('getClientRect of complex path', function () {
    // TODO: it is failing on Node
    if (isNode) {
      return;
    }
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var path = new Konva.Path({
      data: 'M9.9,104.71l2.19-1.27a2,2,0,0,1,1.94,0l.5.29a.5.5,0,0,1,.21.67s0,0,0,0a.5.5,0,0,1-.19.19l-2.2,1.27a1.92,1.92,0,0,1-1.94,0l-.5-.29a.51.51,0,0,1-.21-.68l0,0A.52.52,0,0,1,9.9,104.71Zm4.85-1.9.5.29a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.21.67s0,0,0,0a.5.5,0,0,0,.19.19Zm4.86-2.8.5.29a1.92,1.92,0,0,0,1.94,0L24.25,99a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0l-2.19,1.27a.5.5,0,0,0-.21.67s0,0,0,0a.5.5,0,0,0,.19.19Zm4.85-2.8.5.29a2,2,0,0,0,2,0l2.21-1.27a.52.52,0,0,0,.21-.68s0,0,0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0L24.51,96.3a.5.5,0,0,0-.25.66s0,0,0,0a.49.49,0,0,0,.18.2Zm4.86-2.8.5.29a2,2,0,0,0,1.94,0L34,93.43a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0L29.32,93.5a.52.52,0,0,0-.18.72A.47.47,0,0,0,29.32,94.41Zm4.85-2.81.5.29a1.92,1.92,0,0,0,1.94,0l2.2-1.26A.52.52,0,0,0,39,90s0,0,0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.5.5,0,0,0-.22.67l0,0A.5.5,0,0,0,34.17,91.6ZM39,88.8l.5.29a1.92,1.92,0,0,0,1.94,0l2.21-1.26a.53.53,0,0,0,.18-.73.77.77,0,0,0-.18-.18l-.5-.29a2,2,0,0,0-1.94,0L39,87.9a.5.5,0,0,0-.23.67l0,0a.52.52,0,0,0,.19.2ZM43.88,86l.5.29a1.92,1.92,0,0,0,1.94,0L48.52,85a.52.52,0,0,0,.21-.68l0,0a.57.57,0,0,0-.19-.19l-.5-.29a2,2,0,0,0-2,0L43.83,85.1a.49.49,0,0,0-.17.69h0a.44.44,0,0,0,.2.18Zm4.85-2.8.5.29a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.21-.68l0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0L48.73,82.3a.5.5,0,0,0-.2.68l0,0a.47.47,0,0,0,.18.19Zm4.86-2.8.5.29a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.21-.68s0,0,0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0L53.6,79.5a.5.5,0,0,0-.21.68l0,0a.58.58,0,0,0,.19.19Zm4.85-2.8.5.29a2,2,0,0,0,2,0l2.19-1.27a.52.52,0,0,0,.21-.68s0,0,0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.49.49,0,0,0-.25.66.08.08,0,0,0,0,0,.49.49,0,0,0,.18.2Zm4.86-2.8.5.29a2,2,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.21-.68s0,0,0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.53.53,0,0,0-.19.73h0a.52.52,0,0,0,.18.18ZM68.15,72l.5.29a1.92,1.92,0,0,0,1.94,0L72.79,71a.52.52,0,0,0,.21-.68l0,0a.57.57,0,0,0-.19-.19l-.5-.29a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.5.5,0,0,0-.22.67l0,0A.5.5,0,0,0,68.15,72ZM73,69.19l.5.29a1.92,1.92,0,0,0,1.94,0l2.19-1.26a.53.53,0,0,0,.18-.73.7.7,0,0,0-.15-.19l-.5-.29a2,2,0,0,0-1.94,0L73,68.3a.49.49,0,0,0-.22.67s0,0,0,0a.5.5,0,0,0,.19.19ZM12.94,107.37l2.2,1.27a2,2,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,12.94,107.37Zm4.86-2.8L20,105.83a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0l-2.19,1.27a.5.5,0,0,0-.17.69s0,0,0,0a.54.54,0,0,0,.15.15Zm4.85-2.8,2.2,1.26a1.92,1.92,0,0,0,1.94,0L29,101.77a.54.54,0,0,0,.19-.73.66.66,0,0,0-.19-.18L26.79,99.6a1.92,1.92,0,0,0-1.94,0l-2.18,1.26a.52.52,0,0,0-.19.72.58.58,0,0,0,.19.19ZM27.51,99l2.19,1.27a1.92,1.92,0,0,0,1.94,0L33.84,99a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19L31.67,96.8a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.5.5,0,0,0-.22.67l0,0a.5.5,0,0,0,.19.19Zm4.85-2.8,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19L36.5,94a2,2,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,32.36,96.16Zm4.86-2.8,2.19,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0l-2.19,1.27a.5.5,0,0,0-.21.67l0,0A.5.5,0,0,0,37.22,93.36Zm4.85-2.8,2.2,1.27a2,2,0,0,0,1.94,0l2.19-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.27a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.2.68.48.48,0,0,0,.2.2Zm4.85-2.8L49.12,89a2,2,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,46.92,87.76ZM51.78,85,54,86.22a1.94,1.94,0,0,0,2,0L58.16,85a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19L56,82.8a1.94,1.94,0,0,0-2,0l-2.19,1.27a.5.5,0,0,0-.21.67s0,0,0,0a.5.5,0,0,0,.19.19Zm4.85-2.8,2.2,1.26a1.92,1.92,0,0,0,1.94,0L63,82.16a.51.51,0,0,0,.21-.68l0,0a.62.62,0,0,0-.18-.18L60.77,80a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.52.52,0,0,0-.18.72A.47.47,0,0,0,56.63,82.16Zm4.86-2.81,2.19,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.26a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,61.49,79.35Zm4.85-2.8,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.21-.68l0,0a.57.57,0,0,0-.19-.19l-2.19-1.27a2,2,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.2.68l0,0a.62.62,0,0,0,.18.18Zm4.91-2.83L73.45,75a2,2,0,0,0,1.94,0l7-4a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19L80.2,68.8a2,2,0,0,0-1.94,0l-7,4a.49.49,0,0,0-.22.67s0,0,0,0a.5.5,0,0,0,.19.19ZM17.83,110.19l2.2,1.27a2,2,0,0,0,1.94,0l3.82-2.21a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.27a1.92,1.92,0,0,0-1.94,0l-3.83,2.22a.48.48,0,0,0-.17.68v0a.5.5,0,0,0,.19.19Zm6.5-3.74,2.19,1.26a1.92,1.92,0,0,0,1.94,0l2.21-1.26a.52.52,0,0,0,.21-.68l0,0a.77.77,0,0,0-.18-.18l-2.22-1.24a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.52.52,0,0,0-.18.72.47.47,0,0,0,.18.19Zm4.85-2.8,2.2,1.26a1.92,1.92,0,0,0,1.94,0l2.19-1.26a.51.51,0,0,0,.21-.68l0,0a.62.62,0,0,0-.18-.18l-2.19-1.26a1.92,1.92,0,0,0-1.94,0l-2.21,1.26a.52.52,0,0,0-.19.72.58.58,0,0,0,.19.19ZM34,100.84l2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0L34,99.94a.5.5,0,0,0-.23.67l0,0a.52.52,0,0,0,.19.2ZM38.89,98l2.18,1.26a1.94,1.94,0,0,0,2,0L45.26,98a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.27a2,2,0,0,0-2,0l-2.19,1.27a.5.5,0,0,0-.21.67s0,0,0,0a.5.5,0,0,0,.19.19Zm4.85-2.8,2.2,1.27a2,2,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,43.74,95.24Zm4.86-2.8,2.19,1.27a2,2,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0L48.6,91.54a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,48.6,92.44Zm4.85-2.8,2.2,1.27a2,2,0,0,0,1.94,0l2.19-1.27A.51.51,0,0,0,60,89l0,0a.44.44,0,0,0-.19-.19l-2.19-1.27a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.21.67l0,0A.5.5,0,0,0,53.45,89.64Zm4.86-2.8L60.5,88.1a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17l-2.2-1.26a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.52.52,0,0,0-.18.72.47.47,0,0,0,.18.19ZM63.16,84l2.2,1.26a1.92,1.92,0,0,0,1.94,0L69.49,84a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17L67.3,81.87a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.52.52,0,0,0-.18.72.47.47,0,0,0,.18.19ZM68,81.23l2.19,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.19-.71.44.44,0,0,0-.19-.19l-2.2-1.26a1.92,1.92,0,0,0-1.94,0L68,80.33a.5.5,0,0,0-.22.67l0,0a.41.41,0,0,0,.18.19Zm4.85-2.8,2.19,1.27a1.94,1.94,0,0,0,2,0l2.19-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.27a2,2,0,0,0-2,0l-2.19,1.27a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,72.87,78.43Zm4.91-2.83L80,76.87a2,2,0,0,0,1.94,0l5.36-3.1a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0l-5.36,3.1a.5.5,0,0,0-.21.67s0,0,0,0A.5.5,0,0,0,77.78,75.6ZM22.78,113,25,114.3a1.92,1.92,0,0,0,1.94,0l3.83-2.2a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17l-2.2-1.26a1.92,1.92,0,0,0-1.94,0l-3.83,2.2a.52.52,0,0,0-.19.72h0a.55.55,0,0,0,.18.19Zm6.5-3.75,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.17-1.26a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.26a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.5.5,0,0,0-.22.67l0,0a.41.41,0,0,0,.18.19Zm4.85-2.8,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.2-.68h0a.57.57,0,0,0-.19-.19l-2.23-1.31a2,2,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.29.65l0,0a.53.53,0,0,0,.26.27Zm4.86-2.8L41.17,105a2,2,0,0,0,1.95,0l2.19-1.27a.52.52,0,0,0,.21-.68l0,0a.57.57,0,0,0-.19-.19l-2.2-1.25a2,2,0,0,0-2,0L39,102.8a.5.5,0,0,0-.15.69s0,0,0,0a.44.44,0,0,0,.17.16Zm4.85-2.8,2.2,1.27a2,2,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.19-.71.44.44,0,0,0-.19-.19L48,98.72a1.92,1.92,0,0,0-1.94,0L43.84,100a.5.5,0,0,0-.22.67l0,0a.41.41,0,0,0,.18.19Zm4.86-2.8,2.19,1.27a2,2,0,0,0,1.94,0L55,98.09a.52.52,0,0,0,.19-.71.44.44,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0l-2.22,1.27a.49.49,0,0,0-.22.67s0,0,0,0a.44.44,0,0,0,.19.19Zm4.85-2.8,2.2,1.26a1.92,1.92,0,0,0,1.94,0l2.19-1.26a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.21-1.27a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.49.49,0,0,0-.22.67s0,0,0,0a.44.44,0,0,0,.19.19Zm4.86-2.8,2.19,1.26a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17l-2.2-1.26a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.53.53,0,0,0-.26.7.57.57,0,0,0,.25.26Zm4.85-2.81L65.46,91a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19L67.4,87.52a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.5.5,0,0,0-.22.67l0,0a.41.41,0,0,0,.18.19Zm4.86-2.8,2.19,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0L68.12,86a.5.5,0,0,0-.22.67l0,0a.41.41,0,0,0,.18.19ZM73,84.08l2.2,1.27a2,2,0,0,0,2,0l2.19-1.27a.53.53,0,0,0,.19-.71.69.69,0,0,0-.19-.19l-2.19-1.27a2,2,0,0,0-2,0L73,83.18a.49.49,0,0,0-.22.67s0,0,0,0a.44.44,0,0,0,.19.19Zm4.85-2.8L80,82.54a2,2,0,0,0,1.94,0l2.2-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19L82,79.1a1.92,1.92,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.23.67l0,0a.58.58,0,0,0,.2.21Zm4.92-2.83,2.19,1.26a1.92,1.92,0,0,0,1.94,0l5.36-3.09a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19L90,74.45a1.92,1.92,0,0,0-1.94,0l-5.36,3.09a.53.53,0,0,0-.18.73.52.52,0,0,0,.18.18Zm-55,37.43,2.19,1.27a1.94,1.94,0,0,0,1.95,0l7.29-4.21a.55.55,0,0,0,.17-.74.46.46,0,0,0-.17-.17L37,110.77a1.92,1.92,0,0,0-1.94,0L27.73,115a.5.5,0,0,0-.23.67l0,0a.52.52,0,0,0,.19.2Zm10-5.75,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19L41.88,108a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm4.86-2.8,2.19,1.27a1.92,1.92,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0l-2.19,1.27a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm4.85-2.8,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.19-1.27a2,2,0,0,0-1.94,0l-2.2,1.27a.5.5,0,0,0-.3.64l0,0a.45.45,0,0,0,.19.22Zm4.86-2.8L54.5,103a2,2,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0l-2.19,1.27a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm4.85-2.8,2.19,1.27a2,2,0,0,0,2,0l2.19-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.19-1.27a1.94,1.94,0,0,0-2,0L57.17,98a.49.49,0,0,0-.26.66s0,0,0,0a.41.41,0,0,0,.18.21ZM62,96.13l2.2,1.26a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19L66.15,94a1.92,1.92,0,0,0-1.94,0L62,95.23a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm4.86-2.8,2.19,1.26a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17L71,91.16a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.52.52,0,0,0-.23.71.55.55,0,0,0,.17.2Zm4.85-2.81,2.2,1.27a1.92,1.92,0,0,0,1.94,0L78,90.54a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.26a1.92,1.92,0,0,0-1.94,0l-2.2,1.26a.51.51,0,0,0-.24.67l0,0a.49.49,0,0,0,.18.2Zm4.86-2.8L78.77,89a1.92,1.92,0,0,0,1.94,0l2.2-1.27A.52.52,0,0,0,83.1,87a.58.58,0,0,0-.19-.19l-2.2-1.27a2,2,0,0,0-1.94,0L76.56,86.8a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm4.85-2.8,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.19-1.27a2,2,0,0,0-1.94,0L81.43,84a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm4.84-2.79,2.2,1.26a1.92,1.92,0,0,0,1.94,0l6.81-3.92a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17L95,77.3a1.92,1.92,0,0,0-1.94,0l-6.81,3.93a.5.5,0,0,0-.26.66l0,0a.46.46,0,0,0,.18.21Zm-53.58,36.6,2.2,1.27a2,2,0,0,0,1.94,0l3.84-2.2a.53.53,0,0,0,.19-.71.69.69,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0l-3.83,2.21a.49.49,0,0,0-.26.66s0,0,0,0a.41.41,0,0,0,.18.21Zm6.5-3.74,2.19,1.27a2,2,0,0,0,1.94,0l2.2-1.27a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.21-1.29a1.92,1.92,0,0,0-1.94,0l-2.2,1.29a.49.49,0,0,0-.26.66s0,0,0,0a.41.41,0,0,0,.18.21Zm4.85-2.8,2.2,1.26a1.92,1.92,0,0,0,1.94,0l2.19-1.26a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19L48.17,110a1.92,1.92,0,0,0-1.94,0L44,111.3a.51.51,0,0,0-.24.67l0,0a.49.49,0,0,0,.18.2Zm4.86-2.8,2.19,1.26a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.54.54,0,0,0,.17-.74.46.46,0,0,0-.17-.17L53,107.22a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.52.52,0,0,0-.23.71.55.55,0,0,0,.17.2Zm4.85-2.81,2.2,1.27a1.92,1.92,0,0,0,1.94,0L79.48,95.39a.52.52,0,0,0,.19-.71.58.58,0,0,0-.19-.19l-2.19-1.27a1.94,1.94,0,0,0-2,0L53.7,105.68a.5.5,0,0,0-.17.69l0,0a.44.44,0,0,0,.13.14ZM78,92.54l2.2,1.26a1.92,1.92,0,0,0,1.94,0l2.2-1.26a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.2-1.27a1.92,1.92,0,0,0-1.94,0L78,91.64a.5.5,0,0,0-.21.67l0,0a.47.47,0,0,0,.18.19Zm4.86-2.8L85.06,91A1.92,1.92,0,0,0,87,91l2.2-1.26a.52.52,0,0,0,0-.91L87,87.57a1.92,1.92,0,0,0-1.94,0l-2.19,1.26a.53.53,0,0,0-.05,1Zm4.85-2.81,2.2,1.27a1.92,1.92,0,0,0,1.94,0l2.19-1.27a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19l-2.19-1.26a1.92,1.92,0,0,0-1.94,0L87.72,86a.51.51,0,0,0-.34.62.54.54,0,0,0,.29.32Zm4.91-2.83,2.2,1.27a2,2,0,0,0,1.94,0l5.36-3.1a.51.51,0,0,0,.21-.68l0,0a.44.44,0,0,0-.19-.19L99.94,80.1a2,2,0,0,0-1.94,0l-5.37,3.1a.51.51,0,0,0-.34.62.54.54,0,0,0,.29.32ZM59,109.65l12.15,7a1.92,1.92,0,0,0,1.94,0l21.57-12.46a.52.52,0,0,0,.21-.68l0,0a.54.54,0,0,0-.19-.18l-12.15-7a2,2,0,0,0-1.94,0L59,108.75a.52.52,0,0,0-.19.72.49.49,0,0,0,.2.18Z',
      fill: 'black',
      stroke: 'red',
    });
    layer.add(path);
    var rect = path.getClientRect();

    var back = new Konva.Rect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stroke: 'red',
    });
    layer.add(back);
    layer.draw();

    assertAlmostDeepEqual(rect, {
      x: 8.6440882161882,
      y: 65.75902834,
      width: 94.74182356762,
      height: 55.4919433,
    });
  });

  it('getClientRect of another complex path', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var path = new Konva.Path({
      x: 50,
      y: 50,
      data: 'M0,29 C71,-71,142,128,213,29 L213,207 C142,307,71,108,0,207 L0,29 Z',
      fill: 'black',
      stroke: 'red',
      scaleY: 0.3,
    });
    layer.add(path);
    var rect = path.getClientRect();

    var back = new Konva.Rect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stroke: 'red',
    });
    layer.add(back);
    layer.draw();

    assertAlmostDeepEqual(rect, {
      x: 49,
      y: 49.7086649,
      width: 215,
      height: 71.3826701999,
    });
  });

  it('getClientRect of one more path', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var path = new Konva.Path({
      x: 50,
      y: 50,
      data: 'M25.21,2.36C22.11,6.1,19,10.17,22.1,15.52a2.14,2.14,0,0,1,.22.69c.18,1.09-.52,1.31-1.31,1.11C19.88,17,19.29,16,18.55,15.21a12.71,12.71,0,0,0-7.82-4.28c-3.24-.42-7.9,1.26-9,3.68-2.24,5-2.64,10.23.66,14.94a26,26,0,0,0,11.57,9c6.17,2.56,12.6,4.45,18.67,7.28,1.33.62,1.67-.14,2.11-1.12,3.84-8.44,5.64-17.32,6-28.25.53-3.82-1.37-8.64-4.3-13.12C33.91-.58,28.2-1.24,25.21,2.36Z',
      fill: 'black',
      stroke: 'red',
    });
    layer.add(path);
    var rect = path.getClientRect();

    var back = new Konva.Rect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stroke: 'red',
    });
    layer.add(back);
    layer.draw();

    assertAlmostDeepEqual(rect, {
      x: 48.981379,
      y: 48.996825,
      width: 42.84717526,
      height: 48.057550000000006,
    });
  });

  it('getClientRect for arc', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var path = new Konva.Path({
      data: 'M -12274.95703125 17975.16015625 C -12271.4072265625 17975.16015625 -12268.017578125 17974.345703125 -12264.8837890625 17972.740234375 C -12261.892578125 17971.208984375 -12259.24609375 17968.97265625 -12257.2314453125 17966.2734375 L -12256.775390625 17965.662109375 L -12256.0654296875 17965.939453125 C -12253.494140625 17966.947265625 -12250.7783203125 17967.45703125 -12247.9921875 17967.45703125 C -12245.01171875 17967.45703125 -12242.1201171875 17966.873046875 -12239.396484375 17965.720703125 C -12236.765625 17964.607421875 -12234.4013671875 17963.013671875 -12232.3701171875 17960.982421875 C -12230.3388671875 17958.953125 -12228.7431640625 17956.587890625 -12227.62890625 17953.95703125 C -12226.4755859375 17951.232421875 -12225.890625 17948.337890625 -12225.890625 17945.35546875 C -12225.890625 17941.30859375 -12226.99609375 17937.349609375 -12229.0888671875 17933.90625 C -12231.12109375 17930.5625 -12234.01171875 17927.802734375 -12237.447265625 17925.927734375 L -12237.849609375 17925.708984375 L -12237.9462890625 17925.26171875 C -12238.99609375 17920.408203125 -12241.708984375 17915.994140625 -12245.5830078125 17912.83203125 C -12247.5146484375 17911.2578125 -12249.6748046875 17910.029296875 -12252.0068359375 17909.18359375 C -12254.41796875 17908.306640625 -12256.9541015625 17907.86328125 -12259.54296875 17907.86328125 C -12263.171875 17907.86328125 -12266.7568359375 17908.75390625 -12269.9111328125 17910.44140625 L -12270.556640625 17910.78515625 L -12271.0810546875 17910.275390625 C -12275.2353515625 17906.2265625 -12280.7138671875 17903.99609375 -12286.5078125 17903.99609375 C -12288.9462890625 17903.99609375 -12291.34375 17904.390625 -12293.630859375 17905.171875 C -12295.84375 17905.92578125 -12297.916015625 17907.0234375 -12299.791015625 17908.4375 C -12301.646484375 17909.8359375 -12303.2646484375 17911.509765625 -12304.599609375 17913.41015625 C -12305.9541015625 17915.3359375 -12306.984375 17917.44921875 -12307.6640625 17919.69140625 L -12307.8193359375 17920.203125 L -12308.3310546875 17920.359375 C -12310.5712890625 17921.0390625 -12312.6826171875 17922.068359375 -12314.6044921875 17923.421875 C -12316.501953125 17924.755859375 -12318.1708984375 17926.37109375 -12319.56640625 17928.224609375 C -12322.466796875 17932.078125 -12324 17936.671875 -12324 17941.51171875 C -12324 17944.498046875 -12323.416015625 17947.392578125 -12322.2646484375 17950.1171875 C -12321.15234375 17952.75 -12319.55859375 17955.11328125 -12317.529296875 17957.142578125 C -12315.5 17959.171875 -12313.1376953125 17960.765625 -12310.505859375 17961.876953125 C -12307.7822265625 17963.029296875 -12304.8876953125 17963.61328125 -12301.90234375 17963.61328125 C -12299.7900390625 17963.61328125 -12297.71875 17963.322265625 -12295.744140625 17962.74609375 L -12294.95703125 17962.517578125 L -12294.578125 17963.24609375 C -12292.7373046875 17966.78125 -12289.9716796875 17969.759765625 -12286.580078125 17971.861328125 C -12283.095703125 17974.01953125 -12279.076171875 17975.16015625 -12274.95703125 17975.16015625 M -12274.95703125 17976.16015625 C -12283.8671875 17976.16015625 -12291.609375 17971.11328125 -12295.46484375 17963.70703125 C -12297.50390625 17964.30078125 -12299.66796875 17964.61328125 -12301.90234375 17964.61328125 C -12314.6640625 17964.61328125 -12325 17954.27734375 -12325 17941.51171875 C -12325 17931.08203125 -12318.1015625 17922.27734375 -12308.62109375 17919.40234375 C -12305.74609375 17909.91015625 -12296.92578125 17902.99609375 -12286.5078125 17902.99609375 C -12280.234375 17902.99609375 -12274.54296875 17905.50390625 -12270.3828125 17909.55859375 C -12267.15234375 17907.83203125 -12263.46484375 17906.86328125 -12259.54296875 17906.86328125 C -12248.48046875 17906.86328125 -12239.21875 17914.65234375 -12236.96875 17925.05078125 C -12229.78125 17928.97265625 -12224.890625 17936.58984375 -12224.890625 17945.35546875 C -12224.890625 17958.11328125 -12235.25 17968.45703125 -12247.9921875 17968.45703125 C -12250.96875 17968.45703125 -12253.81640625 17967.89453125 -12256.4296875 17966.87109375 C -12260.640625 17972.51171875 -12267.37109375 17976.16015625 -12274.95703125 17976.16015625 Z',
      fill: 'black',
      stroke: 'blue',
      strokeWidth: 10,
    });
    layer.add(path);
    var rect = path.getClientRect();

    var scale = stage.height() / rect.height / 2;

    path.x(-rect.x * scale);
    path.y(-rect.y * scale);
    path.scaleX(scale);
    path.scaleY(scale);

    rect = path.getClientRect();

    var back = new Konva.Rect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stroke: 'red',
    });
    layer.add(back);
    layer.draw();

    assertAlmostDeepEqual(rect, {
      x: 0,
      y: 0,
      width: 132.4001878816343,
      height: 100,
    });
  });

  it('getClientRect on scaled', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var path = new Konva.Path({
      x: -100,
      y: -190,
      data: 'M10 10 h10 v10 h-10 z',
      fill: 'yellow',
      stroke: 'blue',
      strokeWidth: 0.1,
      scaleX: 20,
      scaleY: 20,
    });
    layer.add(path);
    var rect = path.getClientRect();

    var back = new Konva.Rect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      stroke: 'red',
    });
    layer.add(back);
    layer.draw();

    assertAlmostDeepEqual(rect, {
      height: 201.99999999999994,
      width: 201.99999999999994,
      x: 99,
      y: 9,
    });
  });

  it('check arc parsing', function () {
    var stage = addStage();
    var layer1 = new Konva.Layer();
    stage.add(layer1);

    const weirdPath = new Konva.Path({
      x: 40,
      y: 40,
      scale: { x: 5, y: 5 },
      data:
        'M16 5.095c0-2.255-1.88-4.083-4.2-4.083-1.682 0-3.13.964-3.8 2.352' +
        'a4.206 4.206 0 00-3.8-2.352' + // Merged arc command flags (00)
        'C1.88 1.012 0 2.84 0 5.095c0 .066.007.13.01.194H.004c.001.047.01.096.014.143l.013.142c.07.8.321 1.663.824 2.573C2.073 10.354 4.232 12.018 8 15c3.767-2.982 5.926-4.647 7.144-6.854.501-.905.752-1.766.823-2.562.007-.055.012-.11.016-.164.003-.043.012-.088.013-.13h-.006c.003-.066.01-.13.01-.195z',
      fill: 'red',
    });
    layer1.add(weirdPath);
    layer1.draw();

    const layer2 = new Konva.Layer();
    stage.add(layer2);

    const normalPath = new Konva.Path({
      x: 40,
      y: 40,
      scale: { x: 5, y: 5 },
      data:
        'M16 5.095c0-2.255-1.88-4.083-4.2-4.083-1.682 0-3.13.964-3.8 2.352' +
        'a4.206 4.206 0 0 0-3.8-2.352' + // Spaced arc command flags (0 0)
        'C1.88 1.012 0 2.84 0 5.095c0 .066.007.13.01.194H.004c.001.047.01.096.014.143l.013.142c.07.8.321 1.663.824 2.573C2.073 10.354 4.232 12.018 8 15c3.767-2.982 5.926-4.647 7.144-6.854.501-.905.752-1.766.823-2.562.007-.055.012-.11.016-.164.003-.043.012-.088.013-.13h-.006c.003-.066.01-.13.01-.195z',
      fill: 'red',
    });
    layer2.add(normalPath);
    layer2.draw();

    var trace1 = layer1.getContext().getTrace();
    var trace2 = layer2.getContext().getTrace();

    assert.equal(trace1, trace2);
  });

  it('draw path with fillRule', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var path = new Konva.Path({
      data: 'M200,100h100v50z',
      fill: '#ccc',
      fillRule: 'evenodd',
    });

    layer.add(path);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(200,100);lineTo(300,100);lineTo(300,150);closePath();fillStyle=#ccc;fill(evenodd);restore();'
    );
  });
});
