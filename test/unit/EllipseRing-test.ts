import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvas,
  compareLayerAndCanvas,
  compareLayers,
} from './test-utils';

describe('EllipseRing', function () {
  // ======================================================
  it('add ellipse ring', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var ellipse = new Konva.EllipseRing({
      x: stage.width() / 2,
      y: stage.height() / 2,
      innerRadiusX: 40,
      innerRadiusY: 20,
      outerRadiusX: 80,
      outerRadiusY: 40,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 8,
    });
    layer.add(ellipse);
    stage.add(layer);
    assert.equal(ellipse.getClassName(), 'EllipseRing');

    var trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,289,100);beginPath();ellipse(0,0,40,20,0,0,6.283,false);moveTo(80,0);ellipse(0,0,80,40,0,6.283,0,true);closePath();fillStyle=green;fill();lineWidth=8;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('attrs sync', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var ellipse = new Konva.EllipseRing({
      x: stage.width() / 2,
      y: stage.height() / 2,
      innerRadiusX: 40,
      innerRadiusY: 20,
      outerRadiusX: 80,
      outerRadiusY: 40,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 8,
    });
    layer.add(ellipse);
    stage.add(layer);

    assert.equal(ellipse.getWidth(), 160);
    assert.equal(ellipse.getHeight(), 80);

    ellipse.setWidth(100);
    assert.equal(ellipse.innerRadiusX(), 40);
    assert.equal(ellipse.innerRadiusY(), 20);
    assert.equal(ellipse.outerRadiusX(), 50);
    assert.equal(ellipse.outerRadiusY(), 40);

    ellipse.setHeight(120);
    assert.equal(ellipse.innerRadiusX(), 40);
    assert.equal(ellipse.innerRadiusY(), 20);
    assert.equal(ellipse.outerRadiusX(), 50);
    assert.equal(ellipse.outerRadiusY(), 60);
  });

  it('getSelfRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var ellipse = new Konva.EllipseRing({
      x: stage.width() / 2,
      y: stage.height() / 2,
      innerRadiusX: 40,
      innerRadiusY: 20,
      outerRadiusX: 80,
      outerRadiusY: 40,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 8,
    });
    layer.add(ellipse);
    stage.add(layer);

    assert.deepEqual(ellipse.getSelfRect(), {
      x: -80,
      y: -40,
      width: 160,
      height: 80,
    });
  });

  it('cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var ellipse = new Konva.EllipseRing({
      x: stage.width() / 2,
      y: stage.height() / 2,
      innerRadiusX: 40,
      innerRadiusY: 20,
      outerRadiusX: 80,
      outerRadiusY: 40,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 8,
    });

    layer.add(ellipse);
    stage.add(layer);

    var layer2 = layer.clone();
    stage.add(layer2);
    layer2.hide();

    compareLayers(layer, layer2);
  });
});
