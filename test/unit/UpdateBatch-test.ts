import { assert } from 'chai';
import { addStage, countCalls, Konva } from './test-utils.ts';

function inBatch(fn: () => void) {
  const finish = Konva.beginUpdateBatch();
  try {
    fn();
  } finally {
    finish();
  }
}

function selection(count = 20) {
  const stage = addStage();
  const layer = new Konva.Layer();
  stage.add(layer);
  const nodes = Array.from(
    { length: count },
    (_, i) => new Konva.Rect({ x: i * 20, width: 10, height: 10 })
  );
  layer.add(...nodes);
  const tr = new Konva.Transformer({ nodes });
  layer.add(tr);
  return { stage, layer, nodes, tr };
}

describe('update batches', function () {
  it('coalesces the multi-node setAttrs workload and finishes synchronously', function () {
    const { nodes, tr } = selection();
    const finish = Konva.beginUpdateBatch();
    const during = countCalls(tr, '__getNodeRect', () =>
      nodes.forEach((node) =>
        node.setAttrs({
          x: node.x() + 1,
          y: 1,
          width: 15,
          height: 15,
          rotation: 1,
        })
      )
    );
    assert.equal(during, 0);
    assert.equal(countCalls(tr, '__getNodeRect', finish), 1);
    const anchor = tr.findOne('.bottom-right')!.getAbsolutePosition();
    tr.forceUpdate();
    assert.deepEqual(
      tr.findOne('.bottom-right')!.getAbsolutePosition(),
      anchor
    );
  });

  it('keeps the box fresh during a batch and lays anchors out at completion', function () {
    const { nodes, tr } = selection(1);
    const anchor = tr.findOne('.top-right')!;
    inBatch(() => {
      nodes[0].width(30);
      assert.equal(tr.width(), 30);
      assert.equal(tr.getClientRect().width, 41);
      assert.equal(anchor.x(), 30, 'getClientRect() lays the anchors out');
      nodes[0].width(40);
      assert.equal(anchor.x(), 30);
    });
    assert.equal(anchor.x(), 40);
  });

  it('batches one setAttrs() or position() call automatically', function () {
    const { nodes, tr } = selection(1);
    assert.equal(
      countCalls(tr, '_update', () =>
        nodes[0].setAttrs({ x: 5, y: 5, width: 11, height: 11, rotation: 1 })
      ),
      1
    );
    assert.closeTo(tr.width(), 11, 1e-10);
    assert.equal(
      countCalls(tr, '_update', () => nodes[0].position({ x: 0, y: 0 })),
      1
    );
  });

  for (const method of ['destroyChildren', 'removeChildren']) {
    it(`batches ${method}() automatically`, function () {
      const { layer, nodes, tr } = selection(3);
      const group = new Konva.Group();
      layer.add(group);
      nodes.forEach((node) => node.moveTo(group));
      assert.equal(
        countCalls(tr, '_update', () => group[method]()),
        1
      );
      if (method === 'destroyChildren') {
        assert.deepEqual(tr.nodes(), []);
        assert.equal(tr.getClientRect().width, 0);
      } else {
        assert.deepEqual(tr.nodes(), nodes);
      }
    });
  }

  it('batches one animation frame automatically', function () {
    const { nodes, tr } = selection();
    const anim = new Konva.Animation(() => {
      nodes.forEach((node) => node.width(30));
    });
    anim.start();
    try {
      assert.equal(
        countCalls(tr, '_update', () => Konva.Animation._runFrames()),
        1
      );
    } finally {
      anim.stop();
    }
    assert.equal(tr.findOne('.bottom-right')!.x(), 410);
  });

  it('lays anchors out again after a sync was skipped during a drag', function () {
    const { nodes, tr } = selection(2);
    nodes[0].draggable(true);
    nodes[0].startDrag();
    try {
      nodes[1].destroy();
    } finally {
      nodes[0].stopDrag();
    }
    nodes[0].width(50);
    assert.equal(tr.findOne('.top-right')!.x(), 50);
  });

  it('redraws its own layer when the last attached node is destroyed', function () {
    const { stage, nodes, tr } = selection(1);
    const overlay = new Konva.Layer();
    stage.add(overlay);
    tr.moveTo(overlay);
    assert.isAbove(
      countCalls(overlay, 'batchDraw', () => nodes[0].destroy()),
      0
    );
    assert.equal(tr.getClientRect().width, 0);
  });

  it('does not change attribute-event order or defer node mutations', function () {
    const { nodes } = selection(1);
    const events: string[] = [];
    nodes[0].on('widthChange heightChange', (e) => {
      events.push(e.type);
      assert.equal(nodes[0].width(), 15);
    });
    inBatch(() => {
      nodes[0].setAttrs({ width: 15, height: 25 });
      assert.deepEqual(events, ['widthChange', 'heightChange']);
      assert.equal(nodes[0].height(), 25);
    });
  });

  it('preserves transform-notification count and ordering', function () {
    function record(batching: boolean) {
      const { layer, nodes } = selection(1);
      const parent = new Konva.Group();
      layer.add(parent);
      nodes[0].moveTo(parent);
      const events: string[] = [];
      parent.on('xChange yChange absoluteTransformChange', (event) => {
        events.push(event.type);
      });
      nodes[0].on('absoluteTransformChange', () =>
        events.push('child transform')
      );
      const run = () => parent.setAttrs({ x: 10, y: 20 });
      if (batching) inBatch(run);
      else run();
      return events;
    }
    assert.deepEqual(record(true), record(false));
  });

  // a cached ancestor keeps its descendants' transform caches, so its
  // move is not followed, batch or not. Cache the ancestor after the move.
  it('follows an ancestor rotation in a batch', function () {
    const { layer, nodes, tr } = selection(2);
    const parent = new Konva.Group();
    layer.add(parent);
    nodes.forEach((node) => node.moveTo(parent));
    tr.forceUpdate(); // warm every selected node's saved bounds
    const anchor = tr.findOne('.bottom-right')!;
    anchor.getAbsolutePosition();
    inBatch(() => {
      parent.rotation(90);
    });
    const rects = nodes.map((node) => node.getClientRect());
    const x = Math.min(...rects.map((rect) => rect.x));
    const y = Math.min(...rects.map((rect) => rect.y));
    const right = Math.max(...rects.map((rect) => rect.x + rect.width));
    const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));
    assert.closeTo(tr.x(), x, 1e-8);
    assert.closeTo(tr.y(), y, 1e-8);
    assert.closeTo(tr.width(), right - x, 1e-8);
    assert.closeTo(tr.height(), bottom - y, 1e-8);
    const actual = anchor.getAbsolutePosition();
    assert.closeTo(actual.x, right, 1e-8);
    assert.closeTo(actual.y, bottom, 1e-8);
  });

  it('nests scopes and composes ancestor cascades', function () {
    const { nodes, tr, stage } = selection();
    const outer = Konva.beginUpdateBatch();
    const during = countCalls(tr, '_update', () => {
      stage.x(10);
      inBatch(() => {
        nodes[19].width(15);
      });
      stage.y(5);
    });
    assert.equal(during, 0);
    assert.equal(countCalls(tr, '_update', outer), 1);
    assert.deepEqual(tr.findOne('.bottom-right')!.getAbsolutePosition(), {
      x: 405,
      y: 15,
    });
    assert.equal(
      countCalls(tr, '_update', () => nodes[19].width(20)),
      1,
      'an independent setter stays synchronous'
    );
  });

  it('can close overlapping scopes in either order, ignoring repeats', function () {
    const { nodes, tr } = selection(1);
    const first = Konva.beginUpdateBatch();
    const second = Konva.beginUpdateBatch();
    const during = countCalls(tr, '_update', () => {
      nodes[0].width(20);
      first();
      first();
    });
    assert.equal(during, 0);
    assert.equal(countCalls(tr, '_update', second), 1);
  });

  it('flushes in finally and recovers after application exceptions', function () {
    const { nodes, tr } = selection(1);
    assert.throws(() => {
      const finish = Konva.beginUpdateBatch();
      try {
        nodes[0].width(20);
        throw new Error('application failure');
      } finally {
        finish();
      }
    }, 'application failure');
    assert.equal(tr.findOne('.top-right')!.x(), 20);
    nodes[0].width(30);
    assert.equal(tr.findOne('.top-right')!.x(), 30);
  });

  it('flushes an explicit update once and leaves no redundant automatic refresh', function () {
    const { nodes, tr } = selection(1);
    const finish = Konva.beginUpdateBatch();
    const updates = countCalls(tr, '_update', () => {
      nodes[0].width(20);
      tr.forceUpdate();
      assert.equal(tr.findOne('.top-right')!.x(), 20);
      finish();
    });
    assert.equal(updates, 1);
  });

  it('coalesces descendant-only group updates without waiting for a frame', function () {
    const { layer, tr } = selection(0);
    const children = Array.from(
      { length: 20 },
      (_, i) => new Konva.Rect({ x: i * 20, width: 10, height: 10 })
    );
    const group = new Konva.Group().add(...children);
    layer.add(group);
    tr.nodes([group]);
    const finish = Konva.beginUpdateBatch();
    const updates = countCalls(tr, '_update', () => {
      children.forEach((node) => node.height(30));
      finish();
    });
    assert.equal(updates, 1);
    assert.equal(tr.findOne('.bottom-right')!.y(), 30);
  });

  it('lays a descendant change out at batch end even with a frame already queued', function () {
    const { layer, tr } = selection(0);
    const child = new Konva.Rect({ width: 10, height: 10 });
    const group = new Konva.Group().add(child);
    layer.add(group);
    tr.nodes([group]);
    child.width(20); // outside a batch: layout waits for a frame
    inBatch(() => {
      child.width(40);
    });
    assert.equal(tr.findOne('.top-right')!.x(), 40);
  });
  it('synchronizes a manual draw across layers without repeating it on completion', function () {
    const { stage, nodes, tr } = selection(1);
    const overlay = new Konva.Layer();
    stage.add(overlay);
    tr.moveTo(overlay);
    const finish = Konva.beginUpdateBatch();
    const updates = countCalls(tr, '_update', () => {
      nodes[0].width(30);
      overlay.draw();
      assert.equal(tr.findOne('.top-right')!.x(), 30);
      finish();
    });
    assert.equal(updates, 1);
  });

  it('handles selection replacement and detachment before completion', function () {
    const { nodes, tr } = selection(2);
    inBatch(() => {
      nodes[0].width(30);
      tr.nodes([nodes[1]]);
      nodes[1].width(40);
    });
    assert.deepEqual(tr.nodes(), [nodes[1]]);
    assert.equal(tr.width(), 40);
    assert.equal(tr.findOne('.top-right')!.x(), 40);
    const detached = Konva.beginUpdateBatch();
    const updates = countCalls(tr, '_update', () => {
      nodes[1].width(50);
      tr.detach();
      detached();
    });
    assert.equal(updates, 0);
    assert.equal(tr.getClientRect().width, 0);
  });

  it('drops a destroyed node without touching the survivors', function () {
    const { nodes, tr } = selection(3);
    const [doomed, survivor] = nodes;
    const listeners = survivor.eventListeners.widthChange.slice();
    const cache = tr._nodeRectCache!.get(survivor);
    assert.equal(
      countCalls(survivor, 'on', () => doomed.destroy()),
      0
    );
    assert.deepEqual(survivor.eventListeners.widthChange, listeners);
    assert.strictEqual(tr._nodeRectCache!.get(survivor), cache);
    assert.deepEqual(tr.nodes(), [nodes[1], nodes[2]]);
    assert.equal(tr.findOne('.bottom-right')!.getAbsolutePosition().x, 50);
    assert.equal(
      countCalls(survivor, 'off', () => survivor.destroy()),
      1
    );
  });

  it('preserves node order and single-node rotation after incremental removal', function () {
    const { nodes, tr } = selection(3);
    nodes[2].rotation(30);
    const snapshot = tr.nodes();
    inBatch(() => {
      nodes[1].destroy();
      assert.deepEqual(tr.nodes(), [nodes[0], nodes[2]]);
      assert.deepEqual(snapshot, nodes);
      nodes[0].destroy();
      assert.deepEqual(tr.nodes(), [nodes[2]]);
    });
    assert.closeTo(tr.rotation(), 30, 1e-10);
    assert.closeTo(tr.width(), 10, 1e-10);
  });

  it('releases destroyed group observers and survives ancestor destruction', function () {
    const { layer, nodes, tr } = selection(3);
    const group = new Konva.Group();
    layer.add(group);
    nodes.forEach((node) => node.moveTo(group));
    inBatch(() => {
      group.destroy();
    });
    assert.deepEqual(tr.nodes(), []);
    const child = new Konva.Rect({ width: 10, height: 10 });
    const attached = new Konva.Group().add(child);
    layer.add(attached);
    tr.nodes([attached]);
    const before = Konva.Node._subtreeObserverCount;
    const next = Konva.beginUpdateBatch();
    try {
      attached.destroy();
    } finally {
      next();
    }
    assert.equal(Konva.Node._subtreeObserverCount, before - 1);
    assert.deepEqual(tr.nodes(), []);
  });
});
