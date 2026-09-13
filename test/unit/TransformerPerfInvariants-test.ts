import { assert } from 'chai';

import { addStage, Konva } from './test-utils.ts';
import type { Transformer } from '../../src/shapes/Transformer.ts';

function countAnchorWrites(tr: Transformer, mutate: () => void) {
  let writes = 0;
  const anchors = tr.find('._anchor');
  const originals = anchors.map((anchor) => anchor.setAttrs);
  try {
    anchors.forEach((anchor, index) => {
      anchor.setAttrs = function (attrs) {
        writes++;
        return originals[index].call(this, attrs);
      };
    });
    mutate();
    return writes;
  } finally {
    anchors.forEach((anchor, index) => (anchor.setAttrs = originals[index]));
  }
}

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

  it('lays out anchors once per ancestor cascade regardless of attached node count', function () {
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

    // The cascade fires absoluteTransformChange on every attached rect.
    const writes = countAnchorWrites(tr, () => stage.x(5));
    assert.equal(
      writes,
      18,
      'nine anchors receive defaults and layout once per cascade'
    );
  });

  it('anchor writes for a single setAttrs do not grow with attached node count', function () {
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

      // setAttrs on the FIRST attached node only — N controls how many
      // sibling listeners exist, not how many events fire.
      return countAnchorWrites(tr, () =>
        rects[0].setAttrs({ x: 50, y: 50, width: 100, height: 100 })
      );
    }

    const n1 = countUpdates(1);
    const n100 = countUpdates(100);
    // More selected nodes can leave the selection union unchanged, allowing
    // fewer anchor refreshes. It must never add refreshes for the same writes.
    assert.isAtMost(n100, n1);
    assert.isAbove(n1, 0);
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

  it('Konva.autoDrawEnabled stays unchanged in callbacks, even on exception', function () {
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
      true,
      'user callbacks keep the caller draw setting'
    );
    assert.equal(
      Konva.autoDrawEnabled,
      true,
      'autoDraw must be restored after _fitNodesInto returns/throws'
    );

    Konva.autoDrawEnabled = prev;
  });
});

describe('Transformer selected-node bounds reuse', function () {
  it('recalculates only changed shapes while keeping every setter synchronously fresh', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const nodes = Array.from(
      { length: 100 },
      (_, i) => new Konva.Rect({ x: i * 20, width: 10, height: 10 })
    );
    layer.add(...nodes);
    const tr = new Konva.Transformer({ nodes });
    layer.add(tr);
    const reads = Array(100).fill(0);
    nodes.forEach((node, i) => {
      const original = node.getClientRect;
      node.getClientRect = function (config) {
        reads[i]++;
        return original.call(this, config);
      };
    });
    nodes.forEach((node, i) => {
      node.width(15);
      assert.equal(tr.findOne('.top-right')!.x(), i === 99 ? 1995 : 1990);
    });
    assert.deepEqual(reads, Array(100).fill(1));
  });
});

describe('Transformer unchanged selection geometry', function () {
  it('restores default anchor styling when a conditional style stops applying', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const outer = new Konva.Rect({ width: 100, height: 100 });
    const inner = new Konva.Rect({ width: 20, height: 20 });
    layer.add(outer, inner);
    const tr = new Konva.Transformer({
      nodes: [outer, inner],
      anchorFill: 'green',
      anchorSize: 10,
      anchorStyleFunc(anchor) {
        if (inner.width() > 10) {
          anchor.fill('red');
          anchor.width(30);
        }
      },
    });
    layer.add(tr);
    const anchor = tr.findOne('.top-left')!;
    assert.equal(anchor.fill(), 'red');
    assert.equal(anchor.width(), 30);
    inner.width(5);
    assert.equal(tr.width(), 100);
    assert.equal(anchor.fill(), 'green');
    assert.equal(anchor.width(), 10);
  });

  it('does not rewrite unchanged drag configuration during layout', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const node = new Konva.Rect({ width: 20, height: 20, draggable: true });
    layer.add(node);
    const tr = new Konva.Transformer({ nodes: [node] });
    layer.add(tr);
    const back = tr.findOne('.back')!;
    const setDraggable = back.setDraggable;
    let writes = 0;
    back.setDraggable = function (value) {
      writes++;
      return setDraggable.call(this, value);
    };
    try {
      node.width(30);
      assert.equal(tr.findOne('.top-right')!.x(), 30);
      assert.isTrue(back.draggable());
      assert.equal(writes, 0);
    } finally {
      back.setDraggable = setDraggable;
    }
  });

  it('still refreshes configuration and explicit updates with unchanged bounds', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const node = new Konva.Rect({ width: 20, height: 20 });
    layer.add(node);
    const tr = new Konva.Transformer({ nodes: [node] });
    layer.add(tr);
    const anchor = tr.findOne('.top-left')!;
    tr.padding(3);
    assert.equal(anchor.offsetX(), 8);
    tr.anchorSize(20);
    assert.equal(anchor.offsetX(), 13);
    anchor.x(100);
    tr.update();
    assert.equal(anchor.x(), 0);
    anchor.x(100);
    tr.forceUpdate();
    assert.equal(anchor.x(), 0);
  });

  it('keeps requesting drawing when selected bounds stay unchanged', async function () {
    const autoDraw = Konva.autoDrawEnabled;
    Konva.autoDrawEnabled = false;
    try {
      const stage = addStage();
      const layer = new Konva.Layer();
      stage.add(layer);
      const outer = new Konva.Rect({ width: 100, height: 100 });
      const inner = new Konva.Rect({ width: 10, height: 10 });
      layer.add(outer, inner);
      const tr = new Konva.Transformer({ nodes: [outer, inner] });
      layer.add(tr);
      // Let any setup draw finish before measuring the selected-node change.
      await new Promise<void>((resolve) =>
        Konva.Util.requestAnimFrame(resolve)
      );
      let draws = 0;
      layer.on('draw', () => draws++);
      inner.width(15);
      await new Promise<void>((resolve) =>
        Konva.Util.requestAnimFrame(resolve)
      );
      assert.equal(draws, 1);
      assert.equal(tr.findOne('.top-right')!.x(), 100);
    } finally {
      Konva.autoDrawEnabled = autoDraw;
    }
  });

  it('changes drag handling without rebuilding unchanged anchors', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const node = new Konva.Rect({ width: 20, height: 20 });
    layer.add(node);
    const tr = new Konva.Transformer({ nodes: [node] });
    layer.add(tr);
    assert.isUndefined(tr.anchorStyleFunc());
    const writes = countAnchorWrites(tr, () => {
      node.draggable(true);
      assert.isTrue(tr.findOne('.back')!.draggable());
      node.draggable(false);
      assert.isFalse(tr.findOne('.back')!.draggable());
    });
    assert.equal(writes, 0, 'draggable changes do not affect anchor layout');
  });

  it('keeps anchors fresh without rebuilding them for an unchanged union', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const nodes = Array.from(
      { length: 100 },
      () => new Konva.Rect({ width: 10, height: 10 })
    );
    layer.add(...nodes);
    const tr = new Konva.Transformer({ nodes });
    layer.add(tr);
    const writes = countAnchorWrites(tr, () => {
      nodes.forEach((node) => {
        node.width(20);
        assert.equal(tr.findOne('.top-right')!.x(), 20);
      });
    });
    assert.equal(writes, 18);
    // Configuration and user styling still refresh even if geometry is equal.
    let styles = 0;
    tr.anchorStyleFunc(() => styles++);
    styles = 0;
    nodes[0].width(15);
    assert.equal(styles, 9);
    nodes[1].draggable(true);
    assert.isTrue(tr.findOne('.back')!.draggable());
  });

  it('observes arbitrary shape attributes when another selected node triggers a refresh', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const shape = new Konva.Shape({ extent: 10 });
    shape.getSelfRect = () => ({
      x: 0,
      y: 0,
      width: shape.getAttr('extent'),
      height: 10,
    });
    const sibling = new Konva.Rect({ width: 5, height: 5 });
    layer.add(shape, sibling);
    const tr = new Konva.Transformer({ nodes: [shape, sibling] });
    layer.add(tr);
    shape.setAttr('extent', 30);
    sibling.width(6);
    assert.equal(tr.findOne('.top-right')!.x(), 30);
  });
});

describe('Transformer bounds invalidation', function () {
  it('refreshes changed descendants when a selected group is measured again', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const child = new Konva.Rect({ width: 10, height: 10 });
    const group = new Konva.Group().add(child);
    const sibling = new Konva.Rect({ width: 5, height: 5 });
    layer.add(group, sibling);
    const tr = new Konva.Transformer({ nodes: [group, sibling] });
    layer.add(tr);
    child.width(30);
    sibling.width(6);
    assert.equal(tr.findOne('.top-right')!.x(), 30);
    child.width(40);
    tr.forceUpdate();
    assert.equal(tr.findOne('.top-right')!.x(), 40);
  });
});

describe('Transformer mutable image dimensions', function () {
  it('refreshes an intrinsically sized image after its canvas source is resized', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const source = Konva.Util.createCanvasElement();
    source.width = 10;
    source.height = 10;
    const image = new Konva.Image({ image: source });
    const sibling = new Konva.Rect({ width: 5, height: 5 });
    layer.add(image, sibling);
    const tr = new Konva.Transformer({ nodes: [image, sibling] });
    layer.add(tr);
    source.width = 30;
    sibling.width(6);
    assert.equal(image.width(), 30);
    assert.equal(tr.findOne('.top-right')!.x(), 30);
  });
});

describe('Transformer asynchronous image dimensions', function () {
  it('observes a loaded image when the selection is next refreshed', async function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const source = Konva.Util.createImageElement();
    const loaded = new Promise<void>((resolve, reject) => {
      source.onload = () => resolve();
      source.onerror = reject;
    });
    const image = new Konva.Image({ image: source });
    const sibling = new Konva.Rect({ width: 5, height: 5 });
    layer.add(image, sibling);
    const tr = new Konva.Transformer({ nodes: [image, sibling] });
    layer.add(tr);
    const canvas = Konva.Util.createCanvasElement();
    canvas.width = 30;
    canvas.height = 10;
    source.src = canvas.toDataURL();
    await loaded;
    sibling.width(6);
    assert.equal(tr.findOne('.top-right')!.x(), 30);
  });
});

describe('Transformer bounds under a cached ancestor', function () {
  for (const attrs of [
    { x: 100 },
    { scaleX: 2, scaleY: 3 },
    { rotation: 30 },
  ]) {
    it(`matches a fresh selection after ${JSON.stringify(attrs)}`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      stage.add(layer);
      const child = new Konva.Rect({ width: 10, height: 10, fill: 'red' });
      const group = new Konva.Group().add(child);
      const sibling = new Konva.Rect({ x: 20, width: 5, height: 5 });
      layer.add(group, sibling);
      group.cache();
      const tr = new Konva.Transformer({ nodes: [child, sibling] });
      layer.add(tr);
      group.setAttrs(attrs);
      sibling.width(6);
      const read = () => [
        tr.x(),
        tr.y(),
        tr.width(),
        tr.height(),
        tr.findOne('.top-right')!.getAbsolutePosition().x,
        tr.findOne('.top-right')!.getAbsolutePosition().y,
      ];
      const actual = read();
      tr.forceUpdate();
      assert.deepEqual(actual, read());
    });
  }
});

describe('Transformer bounds after an ancestor cache lifecycle', function () {
  for (const attrs of [
    { x: 100 },
    { scaleX: 2, scaleY: 3 },
    { rotation: 30 },
  ]) {
    it(`discards bounds saved before caching after ${JSON.stringify(attrs)}`, function () {
      const stage = addStage();
      const layer = new Konva.Layer();
      stage.add(layer);
      const child = new Konva.Rect({ width: 10, height: 10, fill: 'red' });
      const group = new Konva.Group().add(child);
      const sibling = new Konva.Rect({ x: 20, width: 5, height: 5 });
      layer.add(group, sibling);
      const tr = new Konva.Transformer({ nodes: [child, sibling] });
      layer.add(tr);

      // No selection read occurs while the ancestor is cached.
      group.cache();
      group.setAttrs(attrs);
      group.clearCache();
      sibling.width(6);
      const read = () => [
        tr.x(),
        tr.y(),
        tr.width(),
        tr.height(),
        tr.findOne('.top-right')!.getAbsolutePosition(),
      ];
      const actual = read();
      tr.forceUpdate();
      assert.deepEqual(actual, read());
    });
  }
});

describe('Transformer bounds from shapes that measure themselves', function () {
  it('refreshes a line whose points array is mutated in place', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const line = new Konva.Line({
      points: [0, 0, 100, 100],
      stroke: 'red',
      strokeWidth: 1,
    });
    const sibling = new Konva.Rect({ width: 5, height: 5 });
    layer.add(line, sibling);
    const tr = new Konva.Transformer({ nodes: [line, sibling] });
    layer.add(tr);
    assert.equal(tr.width(), 101);
    line.points().push(300, 300);
    sibling.width(6);
    assert.equal(tr.width(), 301);
  });

  it('refreshes a custom shape whose getSelfRect reads outside its attrs', function () {
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    let size = 100;
    class Custom extends Konva.Shape {
      _sceneFunc(context) {
        context.beginPath();
        context.rect(0, 0, size, size);
        context.closePath();
        context.fillStrokeShape(this);
      }
      getSelfRect() {
        return { x: 0, y: 0, width: size, height: size };
      }
    }
    const custom = new Custom({ fill: 'green' });
    const sibling = new Konva.Rect({ width: 5, height: 5 });
    layer.add(custom, sibling);
    const tr = new Konva.Transformer({ nodes: [custom, sibling] });
    layer.add(tr);
    assert.equal(tr.width(), 100);
    size = 300;
    sibling.width(6);
    assert.equal(tr.width(), 300);
  });
});
