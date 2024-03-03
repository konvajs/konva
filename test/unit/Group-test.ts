import { addStage, cloneAndCompareLayer, Konva } from './test-utils';
import { assert } from 'chai';

describe('Group', function () {
  // ======================================================
  it('cache group with text', function () {
    var stage = addStage();

    var layer = new Konva.Layer();
    var group = new Konva.Group({
      draggable: true,
      x: 50,
      y: 40,
    });
    var text = new Konva.Text({
      text: 'some text',
      fontSize: 20,
      fill: 'black',
      y: 50,
    });

    var rect = new Konva.Rect({
      height: 100,
      width: 100,
      stroke: 'black',
      strokeWidth: 10,
      // cornerRadius: 1,
    });
    group.add(text);
    group.add(rect);
    layer.add(group);

    stage.add(layer);

    group
      .cache({
        x: -15,
        y: -15,
        width: 150,
        height: 150,
      })
      .offsetX(5)
      .offsetY(5);

    layer.draw();

    cloneAndCompareLayer(layer, 200);
  });

  it('clip group with a Path2D', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var path = new Konva.Group({
      width: 100,
      height: 100,
      clipFunc: () => [new Path2D('M0 0v50h50Z')],
    });

    layer.add(path);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();clip([object Path2D]);transform(1,0,0,1,0,0);restore();'
    );
  });

  it('clip group with by zero size', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var group = new Konva.Group({
      width: 100,
      height: 100,
      clipWidth: 0,
      clipHeight: 0,
    });

    layer.add(group);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    console.log(trace);

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();rect(0,0,0,0);clip();transform(1,0,0,1,0,0);restore();'
    );
  });

  it('clip group with a Path2D and clipRule', function () {
    var stage = addStage();

    var layer = new Konva.Layer();

    var path = new Konva.Group({
      width: 100,
      height: 100,
      clipFunc: () => [new Path2D('M0 0v50h50Z'), 'evenodd'],
    });

    layer.add(path);
    stage.add(layer);

    const trace = layer.getContext().getTrace();

    assert.equal(
      trace,
      'clearRect(0,0,578,200);save();transform(1,0,0,1,0,0);beginPath();clip([object Path2D],evenodd);transform(1,0,0,1,0,0);restore();'
    );
  });
});
