import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
  compareLayers,
} from './test-utils';

describe('Line', function () {
  // ======================================================
  it('add line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      stroke: 'blue',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      tension: 0,
    });

    layer.add(line);
    stage.add(layer);

    line.points([1, 2, 3, 4]);
    assert.equal(line.points()[0], 1);

    line.points([5, 6, 7, 8]);
    assert.equal(line.points()[0], 5);

    line.points([73, 160, 340, 23, 340, 80]);
    assert.equal(line.points()[0], 73);

    assert.equal(line.getClassName(), 'Line');

    layer.draw();
  });

  // ======================================================
  it('test default ponts array for two lines', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      stroke: 'blue',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    var redLine = new Konva.Line({
      x: 50,
      stroke: 'red',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
    });

    line.points([0, 1, 2, 3]);
    redLine.points([4, 5, 6, 7]);

    layer.add(line).add(redLine);
    stage.add(layer);

    assert.equal(line.points()[0], 0);
    assert.equal(redLine.points()[0], 4);
  });

  // ======================================================
  it('add dashed line', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

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

    var line = new Konva.Line({
      points: [73, 160, 340, 23, 500, 109, 500, 180],
      stroke: 'blue',

      strokeWidth: 10,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: true,
      dash: [30, 10, 0, 10, 10, 20],
      shadowColor: '#aaa',
      shadowBlur: 10,
      shadowOffset: {
        x: 20,
        y: 20,
      },
      //opacity: 0.2
    });

    layer.add(line);
    stage.add(layer);

    assert.equal(line.dash().length, 6);
    line.dash([10, 10]);
    assert.equal(line.dash().length, 2);

    assert.equal(line.points().length, 8);
  });

  // ======================================================
  it('add line with shadow', function () {
    const oldRatio = Konva.pixelRatio;
    Konva.pixelRatio = 1;
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      points: [73, 160, 340, 23],
      stroke: 'blue',
      strokeWidth: 20,
      lineCap: 'round',
      lineJoin: 'round',
      shadowColor: 'black',
      shadowBlur: 20,
      shadowOffset: {
        x: 10,
        y: 10,
      },
      shadowOpacity: 0.5,
      draggable: true,
    });

    layer.add(line);
    stage.add(layer);

    var canvas = createCanvas();
    var context = canvas.getContext('2d');

    context.save();
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = 20;
    context.strokeStyle = 'blue';

    context.shadowColor = 'rgba(0,0,0,0.5)';
    context.shadowBlur = 20;
    context.shadowOffsetX = 10;
    context.shadowOffsetY = 10;
    context.moveTo(73, 160);
    context.lineTo(340, 23);

    context.stroke();
    // context.fill();
    context.restore();

    Konva.pixelRatio = oldRatio;

    compareLayerAndCanvas(layer, canvas, 50);

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();lineJoin=round;transform(1,0,0,1,0,0);shadowColor=rgba(0,0,0,0.5);shadowBlur=20;shadowOffsetX=10;shadowOffsetY=10;beginPath();moveTo(73,160);lineTo(340,23);lineCap=round;lineWidth=20;strokeStyle=blue;stroke();restore();'
    );
  });

  it('line hit test with strokeScaleEnabled = false', function () {
    var stage = addStage();
    var scale = 0.1;
    var layer = new Konva.Layer();

    var group = new Konva.Group({
      scale: {
        x: scale,
        y: scale,
      },
    });

    var line1 = new Konva.Line({
      points: [0, 0, 300, 0],
      stroke: 'red',
      strokeScaleEnabled: false,
      strokeWidth: 10,
      y: 0,
    });
    group.add(line1);

    var line2 = new Konva.Line({
      points: [0, 0, 300, 0],
      stroke: 'green',
      strokeWidth: 40 / scale,
      y: 60 / scale,
    });
    group.add(line2);

    layer.add(group);
    stage.add(layer);

    var shape = layer.getIntersection({
      x: 10,
      y: 60,
    });
    assert.equal(shape, line2, 'second line detected');

    shape = layer.getIntersection({
      x: 10,
      y: 4,
    });
    assert.equal(shape, line1, 'first line detected');
  });

  it('line get size', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      points: [73, 160, 340, 23, 500, 109, 500, 180],
      stroke: 'blue',

      strokeWidth: 10,
    });

    layer.add(line);
    stage.add(layer);

    assert.deepEqual(line.size(), {
      width: 500 - 73,
      height: 180 - 23,
    });
  });

  it('getSelfRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: [-25, 50, 250, -30, 150, 50, 250, 110],
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      fill: '#aaf',
      closed: true,
    });

    layer.add(blob);
    stage.add(layer);

    assert.deepEqual(blob.getSelfRect(), {
      x: -25,
      y: -30,
      width: 275,
      height: 140,
    });
  });

  it('getClientRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var poly = new Konva.Line({
      x: 0,
      y: 0,
      points: [-100, 0, +100, 0, +100, 100, -100, 100],
      closed: true,
      fill: '#0f0',
    });

    stage.position({
      x: 150,
      y: 50,
    });

    layer.add(poly);
    stage.add(layer);

    var rect = layer.getClientRect({ relativeTo: stage as any });
    assert.deepEqual(rect, {
      x: -100,
      y: 0,
      width: 200,
      height: 100,
    });
  });

  it('getClientRect with tension', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      x: 0,
      y: 0,
      points: [75, 75, 100, 200, 300, 140],
      tension: 0.5,
      stroke: '#0f0',
    });
    layer.add(line);

    var client = line.getClientRect();
    var rect = new Konva.Rect(Konva.Util._assign({ stroke: 'red' }, client));
    layer.add(rect);

    stage.add(layer);

    assert.equal(Math.round(client.x), 56, 'check x');
    assert.equal(Math.round(client.y), 74, 'check y');
    assert.equal(Math.round(client.width), 245, 'check width');
    assert.equal(Math.round(client.height), 147, 'check height');
  });

  it('getClientRect with tension 2', function () {
    var stage = addStage();
    stage.draggable(true);
    var layer = new Konva.Layer();

    var line = new Konva.Line({
      x: 0,
      y: 0,
      points: [
        494.39880507841673,
        795.3696788648244,
        494.49880507841675,
        795.4696788648245,
        494.39880507841673,
        796.8633308439133,
        489.9178491411501,
        798.3569828230022,
        480.95593726661684,
        802.8379387602688,
        467.513069454817,
        810.3061986557132,
        451.0828976848394,
        820.7617625093353,
        433.15907393577294,
        832.7109783420462,
        415.2352501867065,
        846.1538461538461,
        398.8050784167289,
        859.596713965646,
        383.8685586258402,
        871.545929798357,
        374.90664675130694,
        880.5078416728902,
        371.9193427931292,
        883.4951456310679,
        371.9193427931292,
        883.4951456310679,
        371.9193427931292,
        883.4951456310679,
        376.40029873039583,
        882.0014936519791,
        395.8177744585511,
        876.0268857356235,
        443.6146377893951,
        856.6094100074682,
        507.84167289021656,
        838.6855862584017,
        551.1575802837939,
        825.2427184466019,
        624.3465272591486,
        807.3188946975355,
        696.0418222554144,
        789.395070948469,
        758.7752053771471,
        777.445855115758,
        802.0911127707244,
        772.9648991784914,
        820.0149365197909,
        771.4712471994025,
        821.5085884988797,
        771.4712471994025,
        820.0149365197909,
        775.9522031366691,
        799.1038088125466,
        790.8887229275579,
        743.8386855862584,
        825.2427184466019,
        652.7259148618372,
        871.545929798357,
        542.1956684092606,
        926.8110530246452,
        455.563853622106,
        977.5952203136669,
        412.24794622852875,
        1010.455563853622,
        397.31142643764,
        1026.8857356235997,
        397.31142643764,
        1032.8603435399552,
        400.29873039581776,
        1038.8349514563106,
        415.2352501867065,
        1043.3159073935774,
        463.0321135175504,
        1043.3159073935774,
        563.1067961165048,
        1040.3286034353996,
        696.0418222554144,
        1032.8603435399552,
        787.1545929798357,
        1026.8857356235997,
        921.5832710978342,
        1017.9238237490664,
        1018.6706497386109,
        1013.4428678117998,
        1069.4548170276325,
        1013.4428678117998,
        1076.923076923077,
        1013.4428678117998,
        1075.4294249439881,
        1014.9365197908887,
        1051.530993278566,
        1026.8857356235997,
        979.8356982823002,
        1053.7714712471993,
        888.722927557879,
        1079.1635548917102,
        761.7625093353248,
        1116.504854368932,
        672.1433905899925,
        1150.858849887976,
        628.8274831964152,
        1171.7699775952203,
        615.3846153846154,
        1180.7318894697535,
        615.3846153846154,
        1182.2255414488425,
        618.3719193427931,
        1183.7191934279313,
        633.3084391336819,
        1182.2255414488425,
        687.0799103808812,
        1171.7699775952203,
        775.2053771471248,
        1150.858849887976,
        902.1657953696788,
        1116.504854368932,
        990.2912621359224,
        1091.1127707244211,
        1082.8976848394325,
        1062.7333831217327,
        1133.681852128454,
        1046.303211351755,
        1144.1374159820762,
        1041.8222554144884,
        1144.1374159820762,
        1041.8222554144884,
        1141.1501120238984,
        1041.8222554144884,
        1117.2516803584765,
        1043.3159073935774,
        1082.8976848394325,
        1046.303211351755,
        1008.2150858849888,
        1062.7333831217327,
        917.1023151605675,
        1092.6064227035101,
        861.8371919342793,
        1117.9985063480208,
        814.0403286034353,
        1152.352501867065,
        794.62285287528,
        1176.250933532487,
        790.1418969380135,
        1189.6938013442868,
        793.1292008961912,
        1198.65571321882,
        802.0911127707244,
        1206.1239731142643,
        831.9641523525019,
        1216.5795369678865,
        903.6594473487677,
        1225.5414488424196,
        1014.1896938013442,
        1228.5287528005974,
        1148.6183719193427,
        1228.5287528005974,
        1272.591486183719,
        1225.5414488424196,
        1314.4137415982075,
        1225.5414488424196,
        1326.3629574309186,
        1225.5414488424196,
        1326.3629574309186,
        1225.5414488424196,
        1314.4137415982075,
        1228.5287528005974,
        1272.591486183719,
        1237.4906646751306,
        1197.9088872292755,
        1247.9462285287527,
        1105.3024645257656,
        1270.3510082150858,
        1048.5436893203882,
        1286.7811799850635,
        1024.6452576549664,
        1295.7430918595967,
        1006.7214339058999,
        1306.1986557132188,
        1000.7468259895444,
        1313.6669156086632,
        1000.7468259895444,
        1315.160567587752,
        1003.7341299477222,
        1316.6542195668408,
        1015.6833457804331,
        1319.6415235250186,
        1050.0373412994772,
        1321.1351755041076,
        1103.8088125466766,
        1321.1351755041076,
        1169.529499626587,
        1316.6542195668408,
        1220.3136669156086,
        1310.6796116504854,
        1248.6930545182972,
        1307.6923076923076,
        1253.1740104555638,
        1307.6923076923076,
        1253.1740104555638,
        1307.6923076923076,
        1253.1740104555638,
        1307.6923076923076,
        1248.6930545182972,
        1309.1859596713964,
        1229.275578790142,
        1312.1732636295742,
        1199.4025392083645,
        1319.6415235250186,
        1172.5168035847648,
        1330.0970873786407,
        1154.5929798356983,
        1342.0463032113516,
        1144.1374159820762,
        1353.9955190440626,
        1139.6564600448096,
        1361.463778939507,
        1138.1628080657206,
        1364.4510828976847,
        1138.1628080657206,
        1365.9447348767737,
        1138.1628080657206,
        1365.9447348767737,
      ],
      tension: 0.5,
      stroke: '#0f0',
    });
    layer.add(line);

    var client = line.getClientRect();
    var rect = new Konva.Rect(Konva.Util._assign({ stroke: 'red' }, client));
    layer.add(rect);

    stage.add(layer);

    assert.equal(Math.round(client.x), 371, 'check x');
    assert.equal(Math.round(client.y), 770, 'check y');
    assert.equal(Math.round(client.width), 956, 'check width');
    assert.equal(Math.round(client.height), 597, 'check height');
  });

  it('getClientRect with low number of points', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    stage.add(layer);

    var line = new Konva.Line({
      x: 0,
      y: 0,
      points: [],
      tension: 0.5,
      stroke: '#0f0',
    });
    layer.add(line);
    layer.draw();

    var client = line.getClientRect();

    assert.equal(client.x, -1, 'check x');
    assert.equal(client.y, -1, 'check y');
    assert.equal(client.width, 2, 'check width');
    assert.equal(client.height, 2, 'check height');

    line.points([10, 10]);
    client = line.getClientRect();

    assert.equal(client.x, 9, 'check x');
    assert.equal(client.y, 9, 'check y');
    assert.equal(client.width, 2, 'check width');
    assert.equal(client.height, 2, 'check height');
  });

  it('line caching', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: [-25, 50, 250, -30, 150, 50, 250, 110],
      stroke: 'black',
      strokeWidth: 10,
      draggable: true,
      closed: true,
    });

    layer.add(blob);
    var layer2 = layer.clone();
    blob.cache({
      offset: 30,
    });
    stage.add(layer);
    stage.add(layer2);
    layer2.hide();
    compareLayers(layer, layer2, 150);
  });

  it('updating points with old mutable array should trigger recalculations', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var points = [-25, 50, 250, -30, 150, 50];
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: points,
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      closed: true,
      tension: 1,
    });

    var tensionPoints = blob.getTensionPoints();
    points.push(250, 100);
    blob.points(points);

    layer.add(blob);
    stage.add(layer);

    assert.equal(
      tensionPoints === blob.getTensionPoints(),
      false,
      'calculated points should change'
    );
  });

  it('hit test for scaled line', function () {
    var stage = addStage();
    var scale = 42;
    stage.scaleX(scale);
    stage.scaleY(scale);
    var layer = new Konva.Layer();
    stage.add(layer);

    var points = [1, 1, 7, 2, 8, 7, 2, 6];
    var line = new Konva.Line({
      points: points.map(function (v) {
        return (v * 20) / scale;
      }),
      closed: true,
      fill: 'green',
      draggable: true,
    });
    layer.add(line);
    layer.draw();

    assert.equal(line.hasHitStroke(), false);
    assert.equal(layer.getIntersection({ x: 1, y: 1 }), null);

    layer.toggleHitCanvas();
  });

  it('getClientRect with scaling', function () {
    var stage = addStage();
    var scale = 42;
    stage.scaleX(scale);
    stage.scaleY(scale);
    var layer = new Konva.Layer();
    stage.add(layer);

    var points = [1, 1, 7, 2, 8, 7, 2, 6];
    var line = new Konva.Line({
      points: points.map(function (v) {
        return (v * 20) / scale;
      }),
      closed: true,
      fill: 'green',
      draggable: true,
    });
    layer.add(line);
    layer.draw();

    var client = line.getClientRect();

    assert.equal(client.x, 20, 'check x');
    assert.equal(client.y, 20, 'check y');
    assert.equal(client.width, 140, 'check width');
    assert.equal(client.height, 120, 'check height');
  });
});
