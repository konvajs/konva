import { assert } from 'chai';

import {
  addStage,
  Konva,
  createCanvasAndContext,
  compareLayerAndCanvas,
  assertAlmostDeepEqual,
  compareLayers,
} from './test-utils.ts';

describe('Arc', function () {
  // ======================================================
  it('add arc', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 90,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myArc',
      draggable: true,
    });

    layer.add(arc);
    stage.add(layer);

    assert.equal(arc.getClassName(), 'Arc');

    var trace = layer.getContext().getTrace();
    //console.log(trace);
    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,100,100);beginPath();arc(0,0,80,0,1.571,false);arc(0,0,50,1.571,0,true);closePath();fillStyle=green;fill();lineWidth=4;strokeStyle=black;stroke();restore();'
    );
  });

  // ======================================================
  it('attrs sync', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 90,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myArc',
      draggable: true,
    });

    layer.add(arc);
    stage.add(layer);
    assert.equal(arc.getWidth(), 160);
    assert.equal(arc.getHeight(), 160);

    arc.setWidth(100);
    assert.equal(arc.outerRadius(), 50);
    assert.equal(arc.getHeight(), 100);

    arc.setHeight(120);
    assert.equal(arc.outerRadius(), 60);
    assert.equal(arc.getHeight(), 120);
  });

  it('getSelfRect', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 90,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myArc',
      draggable: true,
    });

    layer.add(arc);
    stage.add(layer);

    assertAlmostDeepEqual(arc.getSelfRect(), {
      x: 0,
      y: 0,
      width: 80,
      height: 80,
    });
  });

  it('getSelfRect on clockwise', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 90,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
      name: 'myArc',
      draggable: true,
      clockwise: true,
    });

    layer.add(arc);
    stage.add(layer);

    assertAlmostDeepEqual(arc.getSelfRect(), {
      x: -80,
      y: -80,
      width: 160,
      height: 160,
    });
  });

  it('getSelfRect on quarter clockwise arc bounds to the visible part', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 270,
      strokeWidth: 4,
      clockwise: true,
    });

    layer.add(arc);
    stage.add(layer);

    assertAlmostDeepEqual(arc.getSelfRect(), {
      x: 0,
      y: -80,
      width: 80,
      height: 80,
    });
  });

  it('getSelfRect on small angle arc should bounds to inner radius', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 60,
      strokeWidth: 4,
    });

    layer.add(arc);
    stage.add(layer);

    assertAlmostDeepEqual(arc.getSelfRect(), {
      x: 25,
      y: 0,
      width: 55,
      height: 69.282032302755,
    });
  });

  it('getSelfRect on zero angle clockwise arc should be degenerate, not a full circle', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 30,
      outerRadius: 80,
      angle: 0,
      clockwise: true,
    });

    layer.add(arc);
    stage.add(layer);

    // an angle of 0 draws nothing (context.arc with startAngle === endAngle),
    // same as the counter-clockwise case below - it must not be reported as
    // a full circle just because the 360 - angle flip used internally for
    // clockwise arcs lands on 2*PI.
    assertAlmostDeepEqual(arc.getSelfRect(), {
      x: 30,
      y: 0,
      width: 50,
      height: 0,
    });
  });

  it('getSelfRect on zero angle counter-clockwise arc matches the clockwise case', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 30,
      outerRadius: 80,
      angle: 0,
      clockwise: false,
    });

    layer.add(arc);
    stage.add(layer);

    assertAlmostDeepEqual(arc.getSelfRect(), {
      x: 30,
      y: 0,
      width: 50,
      height: 0,
    });
  });

  it('getSelfRect on full angle arc is a full circle in both directions', function () {
    var stage = addStage();
    var layer = new Konva.Layer();

    // canvas renders a full circle for a 360 end angle in either direction,
    // so both must report the full bounding box
    [true, false].forEach(function (clockwise) {
      var arc = new Konva.Arc({
        x: 100,
        y: 100,
        innerRadius: 30,
        outerRadius: 80,
        angle: 360,
        clockwise: clockwise,
      });

      layer.add(arc);
      stage.add(layer);

      assertAlmostDeepEqual(arc.getSelfRect(), {
        x: -80,
        y: -80,
        width: 160,
        height: 160,
      });
    });
  });

  it('cache', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var arc = new Konva.Arc({
      x: 100,
      y: 100,
      innerRadius: 50,
      outerRadius: 80,
      angle: 90,
      fill: 'green',
      stroke: 'black',
      strokeWidth: 4,
    });

    layer.add(arc);
    stage.add(layer);

    const { canvas, context } = createCanvasAndContext();
    context.beginPath();
    context.arc(100, 100, 80, 0, Math.PI / 2, false);
    context.arc(100, 100, 50, Math.PI / 2, 0, true);
    context.closePath();
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 4;
    context.stroke();
    compareLayerAndCanvas(layer, canvas, 10);
  });

  it('negative radii draws as its absolute value', function () {
    var stage = addStage();
    var layer = new Konva.Layer();
    var layer2 = new Konva.Layer();
    layer.add(
      new Konva.Arc({
        x: 100,
        y: 100,
        fill: 'green',
        innerRadius: 20,
        outerRadius: 40,
        angle: 120,
      })
    );
    layer2.add(
      new Konva.Arc({
        x: 100,
        y: 100,
        fill: 'green',
        innerRadius: -20,
        outerRadius: -40,
        angle: 120,
      })
    );
    stage.add(layer);
    stage.add(layer2);

    compareLayers(layer, layer2, 10);
  });
});

describe('Arc bounds', function () {
  it('negative and multi-turn angles have the bounds of the rendered sweep', function () {
    const arc = new Konva.Arc({ innerRadius: 20, outerRadius: 40, angle: -90 });
    try {
      assertAlmostDeepEqual(arc.getSelfRect(), {
        x: -40,
        y: -40,
        width: 80,
        height: 80,
      });
      arc.angle(450);
      assertAlmostDeepEqual(arc.getSelfRect(), {
        x: -40,
        y: -40,
        width: 80,
        height: 80,
      });
      arc.clockwise(true);
      arc.angle(-90);
      assertAlmostDeepEqual(arc.getSelfRect(), {
        x: 0,
        y: -40,
        width: 40,
        height: 40,
      });
    } finally {
      arc.destroy();
    }
  });

  it('clockwise bounds respect radians mode', function () {
    const previous = Konva.angleDeg;
    Konva.angleDeg = false;
    const arc = new Konva.Arc({
      innerRadius: 20,
      outerRadius: 40,
      angle: -Math.PI / 2,
      clockwise: true,
    });
    try {
      assertAlmostDeepEqual(arc.getSelfRect(), {
        x: 0,
        y: -40,
        width: 40,
        height: 40,
      });
    } finally {
      arc.destroy();
      Konva.angleDeg = previous;
    }
  });
});
