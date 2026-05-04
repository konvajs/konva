import { assert } from 'chai';

import { addStage, Konva } from './test-utils.ts';

// Regression / invariant tests for the Transformer & cascade-batching perf
// fixes. Each `it` block targets a single observable property of the system
// so that a regression points clearly at what broke.

describe('TransformerPerfInvariants', function () {
  // ---------- Group 1: correctness invariants of the cascade machinery ----------

  it('Node._absTransformCascadeDepth returns to 0 after a normal cascade', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(new Konva.Rect({ x: 0, y: 0, width: 10, height: 10 }));

    stage.x(5); // triggers a full absoluteTransform cascade

    assert.equal(
      (Konva.Node as any)._absTransformCascadeDepth,
      0,
      'depth must be 0 after a clean cascade'
    );
  });

  it('Node._absTransformCascadeDepth returns to 0 even if a listener throws', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const rect = new Konva.Rect({ x: 0, y: 0, width: 10, height: 10 });
    layer.add(rect);

    const thrower = () => {
      throw new Error('boom from absoluteTransformChange listener');
    };
    rect.on('absoluteTransformChange.test', thrower);

    let caught: Error | null = null;
    try {
      stage.x(7);
    } catch (e: any) {
      caught = e;
    } finally {
      rect.off('absoluteTransformChange.test', thrower);
    }

    assert.isNotNull(caught, 'listener exception should propagate');
    assert.equal(
      (Konva.Node as any)._absTransformCascadeDepth,
      0,
      'depth must be 0 even when a listener throws — global state must not leak'
    );
  });

  it('_runAfterAbsTransformCascade defers callback while inside a cascade and runs it once at depth 0', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const rect = new Konva.Rect({ x: 0, y: 0, width: 10, height: 10 });
    layer.add(rect);

    let runCount = 0;
    let depthWhenScheduled = -1;
    const listener = () => {
      depthWhenScheduled = (Konva.Node as any)._absTransformCascadeDepth;
      (Konva.Node as any)._runAfterAbsTransformCascade(() => {
        runCount++;
      });
    };
    rect.on('absoluteTransformChange.test', listener);

    try {
      stage.x(3);
    } finally {
      // always detach so cleanup in addStage's afterEach doesn't re-trigger
      rect.off('absoluteTransformChange.test', listener);
    }

    assert.isAbove(
      depthWhenScheduled,
      0,
      'listener should observe depth > 0 (we are inside a cascade)'
    );
    assert.equal(runCount, 1, 'pending callback runs exactly once after flush');
    assert.equal(
      (Konva.Node as any)._absTransformCascadeDepth,
      0,
      'depth back to 0 after flush'
    );
  });

  it('_runAfterAbsTransformCascade runs synchronously when called outside a cascade', function () {
    let runCount = 0;
    (Konva.Node as any)._runAfterAbsTransformCascade(() => {
      runCount++;
    });
    assert.equal(
      runCount,
      1,
      'with no active cascade the callback runs immediately'
    );
  });

  // ---------- Group 2: prototype listener dedup ----------

  it('_getProtoListeners returns each handler exactly once for Stage/Layer/Group', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const group = new Konva.Group();
    layer.add(group);

    // xChange has a single prototype listener wired in Node.ts (the
    // TRANSFORM_CHANGE_STR cascade trigger). Subclasses without their own
    // `eventListeners` inherit Node's via the prototype chain — the walker
    // must dedupe so each handler is invoked once per fire, not N-times-
    // chain-depth.
    assert.equal(
      (stage as any)._getProtoListeners('xChange').length,
      1,
      'Stage proto listeners for xChange'
    );
    assert.equal(
      (layer as any)._getProtoListeners('xChange').length,
      1,
      'Layer proto listeners for xChange'
    );
    assert.equal(
      (group as any)._getProtoListeners('xChange').length,
      1,
      'Group proto listeners for xChange'
    );
  });

  it('a single attr write fires _clearSelfAndDescendantCache cascade exactly once', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(new Konva.Rect({ x: 0, y: 0, width: 10, height: 10 }));

    let outerCascades = 0;
    const ContainerProto = Object.getPrototypeOf(
      (Konva as any).Layer.prototype
    );
    const orig = ContainerProto._clearSelfAndDescendantCache;
    ContainerProto._clearSelfAndDescendantCache = function (attr: string) {
      if (
        attr === 'absoluteTransform' &&
        (Konva.Node as any)._absTransformCascadeDepth === 0
      ) {
        outerCascades++;
      }
      return orig.call(this, attr);
    };

    try {
      stage.x(11); // ONE attr write
    } finally {
      ContainerProto._clearSelfAndDescendantCache = orig;
    }

    assert.equal(
      outerCascades,
      1,
      'one attr write should produce one outer cascade — not N (chain depth)'
    );
  });

  // ---------- Group 3: Transformer perf invariants ----------

  it('Transformer.update() fires once per ancestor cascade regardless of attached node count', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);

    const N = 100;
    const rects: any[] = [];
    for (let i = 0; i < N; i++) {
      const r = new Konva.Rect({
        x: 5 + (i % 10) * 12,
        y: 5 + Math.floor(i / 10) * 12,
        width: 10,
        height: 10,
      });
      layer.add(r);
      rects.push(r);
    }
    const tr = new Konva.Transformer({ nodes: rects });
    layer.add(tr);
    layer.draw();

    let updateCalls = 0;
    const orig = (tr as any).update;
    (tr as any).update = function () {
      updateCalls++;
      return orig.apply(this, arguments);
    };

    stage.x(5); // one ancestor change → cascade fires absoluteTransformChange
    // on every attached rect; without the fix, update() would be called N times.

    (tr as any).update = orig;

    assert.equal(
      updateCalls,
      1,
      `expected exactly 1 update() per ancestor cascade with N=${N} attached nodes`
    );
  });

  it('Transformer update count for a single setAttrs is independent of attached node count', function () {
    // We do NOT (currently) batch update() across the per-attr *Change events
    // emitted by a single setAttrs — the cascade-depth counter only kicks in
    // for Container-rooted ancestor cascades. But the count must still NOT
    // grow with N attached nodes: setAttrs on one node should hit one
    // listener registration N times only via constant per-attr churn, not
    // O(N) per attr.
    function countUpdates(N: number): number {
      const stage = addStage();
      const layer = new Konva.Layer();
      stage.add(layer);
      const rects: any[] = [];
      for (let i = 0; i < N; i++) {
        const r = new Konva.Rect({
          x: i * 5,
          y: 0,
          width: 10,
          height: 10,
        });
        layer.add(r);
        rects.push(r);
      }
      const tr = new Konva.Transformer({ nodes: rects });
      layer.add(tr);
      layer.draw();

      let count = 0;
      const orig = (tr as any).update;
      (tr as any).update = function () {
        count++;
        return orig.apply(this, arguments);
      };
      // setAttrs on the FIRST attached node only — N controls how many
      // sibling listeners exist, not how many events fire.
      rects[0].setAttrs({ x: 50, y: 50, width: 100, height: 100 });
      (tr as any).update = orig;
      return count;
    }

    const n1 = countUpdates(1);
    const n100 = countUpdates(100);
    assert.equal(
      n1,
      n100,
      `update() count must not depend on attached node count (N=1: ${n1}, N=100: ${n100})`
    );
  });

  it('Transformer state (anchor positions) is correct synchronously after an ancestor change', function () {
    // Guards that the cascade flush is SYNCHRONOUS — i.e. reads of derived
    // state right after a stage change must reflect the new state without
    // any microtask flushing. Microtask deferral was tried and rejected
    // because it broke this contract.
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const rect = new Konva.Rect({ x: 50, y: 50, width: 100, height: 100 });
    layer.add(rect);
    const tr = new Konva.Transformer({ nodes: [rect] });
    layer.add(tr);
    layer.draw();

    stage.scaleX(2);
    stage.scaleY(2);

    assert.equal(tr.x(), 100, 'tr.x() must be fresh');
    assert.equal(tr.width(), 200, 'tr.width() must be fresh');
    assert.equal(
      tr.findOne<any>('.top-right')!.getAbsolutePosition().x,
      300,
      'anchor absolute position must be fresh — proves update() ran synchronously'
    );
  });

  // ---------- Group 4: _fitNodesInto invariants ----------

  it('Konva.autoDrawEnabled is restored after _fitNodesInto, even on exception', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const rect = new Konva.Rect({ x: 0, y: 0, width: 100, height: 100 });
    layer.add(rect);
    const tr = new Konva.Transformer({ nodes: [rect] });
    layer.add(tr);
    layer.draw();

    const prev = Konva.autoDrawEnabled;
    Konva.autoDrawEnabled = true;

    let observedDuring: boolean | null = null;
    tr.boundBoxFunc(function (oldBox, newBox) {
      // observe the flag mid-transform, then throw to test the finally path
      observedDuring = Konva.autoDrawEnabled;
      throw new Error('boom from boundBoxFunc');
    });

    let caught: Error | null = null;
    try {
      (tr as any)._fitNodesInto({
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        rotation: 0,
      });
    } catch (e: any) {
      caught = e;
    }

    assert.isNotNull(caught, 'exception must propagate');
    assert.equal(
      observedDuring,
      false,
      'autoDraw must be suspended during _fitNodesInto'
    );
    assert.equal(
      Konva.autoDrawEnabled,
      true,
      'autoDraw must be restored after _fitNodesInto returns/throws'
    );

    Konva.autoDrawEnabled = prev;
  });
});
