import { assert } from 'chai';
import { Line } from '../../src/shapes/Line';

import { addStage, Konva, cloneAndCompareLayer } from './test-utils';

describe('Blob', function () {
  // ======================================================
  it('add blob', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var blob = new Konva.Line({
      points: [73, 140, 340, 23, 500, 109, 300, 170],
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      fill: '#aaf',
      tension: 0.8,
      closed: true,
    });

    layer.add(blob);
    stage.add(layer);

    assert.equal(blob.tension(), 0.8);

    assert.equal(blob.getClassName(), 'Line');

    //console.log(blob1.getPoints())

    // test setter
    blob.tension(1.5);
    assert.equal(blob.tension(), 1.5);

    var trace = layer.getContext().getTrace();
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();moveTo(73,140);bezierCurveTo(90.922,74.135,129.542,38.279,340,23);bezierCurveTo(471.142,13.479,514.876,54.33,500,109);bezierCurveTo(482.876,171.93,463.05,158.163,300,170);bezierCurveTo(121.45,182.963,58.922,191.735,73,140);closePath();fillStyle=#aaf;fill();lineWidth=10;strokeStyle=blue;stroke();restore();'
    );
  });

  // ======================================================
  it('define tension first', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var blob = new Konva.Line({
      tension: 0.8,
      points: [73, 140, 340, 23, 500, 109, 300, 170],
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      fill: '#aaf',
      closed: true,
    });

    layer.add(blob);
    stage.add(layer);

    assert.equal(stage.findOne<Line>('Line').points().length, 8);
  });

  // ======================================================
  it('check for konva event handlers', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    var blob = new Konva.Line({
      points: [73, 140, 340, 23, 500, 109, 300, 170],
      stroke: 'blue',
      strokeWidth: 10,
      draggable: true,
      fill: '#aaf',
      tension: 0.8,
      closed: true,
    });

    layer.add(blob);

    stage.add(layer);

    assert.equal(blob.eventListeners.pointsChange[0].name, 'konva');
    assert.equal(blob.eventListeners.tensionChange[0].name, 'konva');

    // removing handlers should not remove konva specific handlers
    blob.off('pointsChange');
    blob.off('tensionChange');

    assert.equal(blob.eventListeners.pointsChange[0].name, 'konva');
    assert.equal(blob.eventListeners.tensionChange[0].name, 'konva');

    // you can force remove an event by adding the name
    blob.off('pointsChange.konva');
    blob.off('tensionChange.konva');

    assert.equal(blob.eventListeners.pointsChange, undefined);
    assert.equal(blob.eventListeners.tensionChange, undefined);
  });

  it('cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var blob = new Konva.Line({
      x: 50,
      y: 50,
      points: [-25, 50, 250, -30, 150, 50, 250, 110],
      stroke: 'black',
      strokeWidth: 10,
      draggable: true,
      fill: '#aaf',
      tension: 0.3,
      closed: true,
    });

    blob.cache();
    layer.add(blob);
    stage.add(layer);

    cloneAndCompareLayer(layer, 150);
  });
});
