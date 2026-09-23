// compile-only checks of the public types: `npm run test:types`.
// Node configs have an index signature, so a config literal never fails to
// type-check; the checks below go through the accessors where it matters
import Konva from '../../src/index.ts';
import type { GetClientRectConfig } from '../../src/Node.ts';

// clipFunc receives the Konva context and the container
const group = new Konva.Group({
  clipFunc: (ctx) => {
    ctx.setAttr('fillStyle', 'red');
    ctx.rect(0, 0, 10, 10);
  },
});
group.clipFunc((ctx, container) => {
  ctx.setAttr('fillStyle', 'red');
  container.getChildren();
});

// Isolation is a Group property with a boolean accessor and chainable setter.
const isolatedGroup = new Konva.Group({ isolated: true });
const isolation: boolean = isolatedGroup.isolated();
const chainedGroup: Konva.Group = isolatedGroup.isolated(false);
// @ts-expect-error isolation accepts a boolean only
isolatedGroup.isolated('isolate');
// @ts-expect-error the constructor also requires a boolean
new Konva.Group({ isolated: 'isolate' });
// @ts-expect-error layers do not expose group isolation
new Konva.Layer().isolated(true);

// points accept the typed arrays the config accepts, the getter stays an array
const line = new Konva.Line({ points: new Float32Array([0, 0, 10, 10]) });
line.points(new Float32Array(4));
line.points([1, 2, 3, 4]);
line.points(line.points().concat([70, 80]));
new Konva.Arrow({ points: new Float32Array(4) }).points(new Int16Array(4));

// text width and height can be 'auto', the getters return numbers
const text = new Konva.Text({ width: 100 });
text.width('auto');
text.height('auto');
const textWidth: number = text.width();
const textHeight: number = text.height();
// @ts-expect-error only 'auto' is accepted besides a number
text.width('wide');
// @ts-expect-error other nodes take a number only
new Konva.Rect().width('auto');

// a Tag corner radius can be given per corner
new Konva.Tag({ cornerRadius: [1, 2, 3, 4] }).cornerRadius([1, 2, 3, 4]);

// charRenderFunc is part of the text config
new Konva.Text({
  charRenderFunc: ({ char, context, isLastInLine }) => {
    if (isLastInLine) {
      context.fillText(char, 0, 0);
    }
  },
});

// an ellipse takes a radius object or the two components
new Konva.Ellipse({ radius: { x: 10, y: 20 } });
new Konva.Ellipse({ radiusX: 10, radiusY: 20 });

// the stage container can be set by id, the getter returns the element
const stage = new Konva.Stage({ container: 'container' });
stage.container('other');
const container: HTMLDivElement = stage.container();
// @ts-expect-error an id or an element only
stage.container(5);

// anchorDragBoundFunc receives the native event of any kind
new Konva.Transformer().anchorDragBoundFunc((oldPos, newPos, evt) => {
  evt.type;
  return newPos;
});

// the stroke gradient attributes are part of the shape config
new Konva.Rect({
  strokeLinearGradientStartPoint: { x: 0, y: 0 },
  strokeLinearGradientEndPoint: { x: 10, y: 10 },
  strokeLinearGradientColorStops: [0, 'red', 1, 'blue'],
  strokeLinearGradientStartPointX: 0,
});
new Konva.Rect().strokeLinearGradientColorStops([0, 'red', 1, 'blue']);

// one getClientRect() config for nodes, containers and shapes
const rectConfig: GetClientRectConfig = { relativeTo: group, skipStroke: true };
group.getClientRect(rectConfig);
new Konva.Rect().getClientRect(rectConfig);
stage.getClientRect(rectConfig);
// any node, as the runtime accepts, e.g. an ancestor found by selector
new Konva.Rect().getClientRect({ relativeTo: new Konva.Rect() });

// types reachable from the Konva namespace
const rect: Konva.IRect = { x: 0, y: 0, width: 10, height: 10 };
const box: Konva.Box = { ...rect, rotation: 0 };
const filter: Konva.Filter = Konva.Filters.Blur;
const cap: Konva.LineCap = 'round';
const join: Konva.LineJoin = 'miter';
const x: Konva.GetSet<number, Konva.Node> = new Konva.Rect().x;

// change events carry the old and the new value
new Konva.Rect().on('xChange', (e) => {
  e.oldVal;
  e.newVal;
});

export { textWidth, textHeight, container, box, filter, cap, join, x };

// The integration hook is Stage-only, optional, and synchronously callable.
const eventBatch: ((run: () => void) => void) | undefined =
  stage.eventBatchFunc();
stage.eventBatchFunc((run) => run());
stage.eventBatchFunc(undefined);
// @ts-expect-error Shapes do not expose a framework integration hook.
new Konva.Rect().eventBatchFunc();
void eventBatch;

// toBlob() resolves with a Blob: it rejects instead of handing back null.
const blob: Promise<Blob> = new Konva.Rect().toBlob();
new Konva.Rect().toBlob({ callback: (value: Blob) => void value });
void blob;

// position(), absolutePosition() and size() read the components off the value,
// so they take neither null nor undefined: both throw at runtime, and
// absolutePosition() throws after it has cleared rotation, scale and offset
const shape = new Konva.Rect();
shape.position({ x: 10, y: 20 });
shape.absolutePosition({ x: 10, y: 20 });
shape.size({ width: 10, height: 20 });
const pointer = stage.getPointerPosition();
if (pointer) {
  shape.absolutePosition(pointer);
}
// @ts-expect-error getPointerPosition() returns null when there is no pointer
shape.absolutePosition(stage.getPointerPosition());
// @ts-expect-error position() has nothing to read x and y from
shape.position(null);
// @ts-expect-error position() has nothing to read x and y from
shape.position(undefined);
// @ts-expect-error size() has nothing to read width and height from
shape.size(null);

// the attribute setters do reset on null and undefined, offset, scale and skew
// included: the components go back to their defaults
shape.offset(null);
shape.scale(undefined);
shape.skew(null);
shape.fill(null);
new Konva.Group().clip(null);
text.width(undefined);
text.width(null);
line.points(undefined);

// the stage container is attached to, not stored, so it takes neither
// @ts-expect-error there is nothing to attach the stage content to
stage.container(null);
// @ts-expect-error there is nothing to attach the stage content to
stage.container(undefined);
