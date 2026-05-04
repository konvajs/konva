import { assert } from 'chai';

import { addStage, Konva } from './test-utils.ts';

// Counter helpers — wrap a method on prototype/instance to count calls.
function instrument(obj: any, key: string, counters: Record<string, number>) {
  const original = obj[key];
  counters[key] = 0;
  obj[key] = function (...args: any[]) {
    counters[key]++;
    return original.apply(this, args);
  };
  return () => {
    obj[key] = original;
  };
}

function runScenario(NODE_COUNT: number, STEPS: number) {
  const stage = addStage();
  const layer = new Konva.Layer();
  stage.add(layer);

  const rects: any[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const rect = new Konva.Rect({
      x: 10 + (i % 10) * 20,
      y: 10 + Math.floor(i / 10) * 20,
      width: 15,
      height: 15,
      fill: 'red',
      draggable: true,
    });
    layer.add(rect);
    rects.push(rect);
  }

  const tr = new Konva.Transformer({ nodes: rects });
  layer.add(tr);
  layer.draw();

  const trCounters: Record<string, number> = {};
  const restoreFns: Array<() => void> = [];
  restoreFns.push(instrument(tr as any, 'update', trCounters));
  restoreFns.push(instrument(tr as any, '_resetTransformCache', trCounters));
  restoreFns.push(instrument(tr as any, '_getNodeRect', trCounters));
  restoreFns.push(instrument(tr as any, '__getNodeRect', trCounters));
  restoreFns.push(instrument(tr as any, '_fitNodesInto', trCounters));

  const nodeCounters: Record<string, number> = {};
  const NodeProto = (Konva as any).Node.prototype;
  restoreFns.push(instrument(NodeProto, 'getClientRect', nodeCounters));
  restoreFns.push(
    instrument(NodeProto, '_clearSelfAndDescendantCache', nodeCounters)
  );
  restoreFns.push(instrument(NodeProto, 'getAbsoluteTransform', nodeCounters));
  restoreFns.push(instrument(NodeProto, 'fire', nodeCounters));
  restoreFns.push(instrument(NodeProto, '_fire', nodeCounters));

  const tAny = tr as any;
  tAny._transforming = true;
  tAny._movingAnchorName = 'bottom-right';
  tAny._anchorDragOffset = { x: 0, y: 0 };

  const initialRect = tr._getNodeRect();
  Object.keys(trCounters).forEach((k) => (trCounters[k] = 0));
  Object.keys(nodeCounters).forEach((k) => (nodeCounters[k] = 0));

  const t0 = performance.now();
  for (let s = 1; s <= STEPS; s++) {
    const factor = 1 + s * 0.001;
    tr._fitNodesInto({
      x: initialRect.x,
      y: initialRect.y,
      width: initialRect.width * factor,
      height: initialRect.height * factor,
      rotation: initialRect.rotation,
    });
  }
  const dt = performance.now() - t0;

  tAny._transforming = false;
  restoreFns.forEach((r) => r());

  console.log(
    `\n=== N=${NODE_COUNT}, STEPS=${STEPS} — total ${dt.toFixed(2)}ms (${(dt / STEPS).toFixed(3)}ms/step) ===`
  );
  console.log('Transformer:', trCounters);
  console.log('Node proto :', nodeCounters);
}

async function flushMicrotasks() {
  // 2 ticks: scheduled microtask + any microtask it schedules in turn.
  await Promise.resolve();
  await Promise.resolve();
}

async function runStageDragScenario(NODE_COUNT: number, STEPS: number) {
  const stage = addStage();
  const layer = new Konva.Layer();
  stage.add(layer);

  const rects: any[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const rect = new Konva.Rect({
      x: 10 + (i % 10) * 20,
      y: 10 + Math.floor(i / 10) * 20,
      width: 15,
      height: 15,
      fill: 'red',
    });
    layer.add(rect);
    rects.push(rect);
  }

  const tr = new Konva.Transformer({ nodes: rects });
  layer.add(tr);
  layer.draw();

  const trCounters: Record<string, number> = {};
  const restoreFns: Array<() => void> = [];
  restoreFns.push(instrument(tr as any, 'update', trCounters));
  restoreFns.push(instrument(tr as any, '_resetTransformCache', trCounters));
  restoreFns.push(instrument(tr as any, '_getNodeRect', trCounters));
  restoreFns.push(instrument(tr as any, '__getNodeRect', trCounters));

  const nodeCounters: Record<string, number> = {};
  const NodeProto = (Konva as any).Node.prototype;
  restoreFns.push(instrument(NodeProto, 'getClientRect', nodeCounters));
  restoreFns.push(
    instrument(NodeProto, '_clearSelfAndDescendantCache', nodeCounters)
  );
  restoreFns.push(instrument(NodeProto, 'getAbsoluteTransform', nodeCounters));
  restoreFns.push(instrument(NodeProto, '_fire', nodeCounters));

  // Reset counters after warmup (initial draw triggered some)
  Object.keys(trCounters).forEach((k) => (trCounters[k] = 0));
  Object.keys(nodeCounters).forEach((k) => (nodeCounters[k] = 0));

  const t0 = performance.now();
  for (let s = 1; s <= STEPS; s++) {
    stage.x(s);
    stage.y(s);
  }
  const dt = performance.now() - t0;

  restoreFns.forEach((r) => r());

  console.log(
    `\n=== STAGE DRAG: N=${NODE_COUNT}, STEPS=${STEPS} — total ${dt.toFixed(2)}ms (${(dt / STEPS).toFixed(3)}ms/step) ===`
  );
  console.log('Transformer:', trCounters);
  console.log('Node proto :', nodeCounters);
}

describe('TransformerPerf', function () {
  this.timeout(30000);

  it('counts and times multi-node resize', function () {
    runScenario(10, 1);
    runScenario(50, 1);
    runScenario(200, 1);
    runScenario(50, 50);
    runScenario(200, 50);
  });

  it('counts and times STAGE drag with many attached nodes', async function () {
    await runStageDragScenario(10, 1);
    await runStageDragScenario(50, 1);
    await runStageDragScenario(200, 1);
    await runStageDragScenario(50, 30);
    await runStageDragScenario(200, 30);
  });

  it.skip('legacy single resize counters', function () {
    const NODE_COUNT = 50;

    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);

    const rects: any[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const rect = new Konva.Rect({
        x: 10 + (i % 10) * 20,
        y: 10 + Math.floor(i / 10) * 20,
        width: 15,
        height: 15,
        fill: 'red',
        draggable: true,
      });
      layer.add(rect);
      rects.push(rect);
    }

    const tr = new Konva.Transformer({ nodes: rects });
    layer.add(tr);
    layer.draw();

    // Instrument transformer methods we care about
    const trCounters: Record<string, number> = {};
    const restoreFns: Array<() => void> = [];
    restoreFns.push(instrument(tr as any, 'update', trCounters));
    restoreFns.push(instrument(tr as any, '_resetTransformCache', trCounters));
    restoreFns.push(instrument(tr as any, '_getNodeRect', trCounters));
    restoreFns.push(instrument(tr as any, '__getNodeRect', trCounters));
    restoreFns.push(instrument(tr as any, '_fitNodesInto', trCounters));

    // Instrument Node prototype methods (count for ALL nodes)
    const nodeCounters: Record<string, number> = {};
    const NodeProto = (Konva as any).Node.prototype;
    restoreFns.push(instrument(NodeProto, 'getClientRect', nodeCounters));
    restoreFns.push(
      instrument(NodeProto, '_clearSelfAndDescendantCache', nodeCounters)
    );
    restoreFns.push(
      instrument(NodeProto, 'getAbsoluteTransform', nodeCounters)
    );
    restoreFns.push(instrument(NodeProto, 'fire', nodeCounters));
    restoreFns.push(instrument(NodeProto, '_fire', nodeCounters));

    // Trigger ONE simulated resize via the public path
    // Pretend the user dragged the bottom-right anchor: directly call _fitNodesInto.
    // Mimic _handleMouseDown's effect first (so _transforming flag is on, _movingAnchorName set)
    const tAny = tr as any;
    tAny._transforming = true;
    tAny._movingAnchorName = 'bottom-right';
    tAny._anchorDragOffset = { x: 0, y: 0 };

    const initialRect = tr._getNodeRect();
    // Reset counts after warmup (the _getNodeRect above counts)
    Object.keys(trCounters).forEach((k) => (trCounters[k] = 0));
    Object.keys(nodeCounters).forEach((k) => (nodeCounters[k] = 0));

    // Single resize step
    tr._fitNodesInto({
      x: initialRect.x,
      y: initialRect.y,
      width: initialRect.width * 1.1,
      height: initialRect.height * 1.1,
      rotation: initialRect.rotation,
    });

    tAny._transforming = false;

    // Print counters for analysis
    console.log(
      '=== TRANSFORMER COUNTERS (single resize, N=' + NODE_COUNT + ') ==='
    );
    console.log(JSON.stringify(trCounters, null, 2));
    console.log('=== NODE PROTO COUNTERS ===');
    console.log(JSON.stringify(nodeCounters, null, 2));

    // Restore
    restoreFns.forEach((r) => r());

    // Just assert the test ran; the printed numbers are the diagnostic.
    assert.ok(initialRect);
  });
});
