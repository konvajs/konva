import { assert } from 'chai';

import {
  addStage,
  Konva,
  isNode,
  isBrowser,
  simulateMouseMove,
  countCalls,
  nextFrames,
} from './test-utils.ts';
import type { Layer } from '../../src/Layer.ts';

// Konva.Html needs the HTML-in-Canvas API, Chrome 157+. Without it only the
// first test runs. `npm run test:browser` uses the Chrome of .puppeteerrc.cjs.
const supported =
  isBrowser && 'updateElementGeometry' in document.createElement('canvas');

// a block of the given color, 50px high
function makeElement(color: string, html = '') {
  const element = document.createElement('div');
  element.style.background = color;
  element.innerHTML = '<div style="height: 50px">' + html + '</div>';
  return element;
}

// The browser paints nothing for an element far outside the viewport, and
// the test report above the stages is long. So the stage is scrolled to.
function addVisibleStage() {
  const stage = addStage();
  stage.content.scrollIntoView();
  return stage;
}

// the browser hands out the picture of an element within some frames
const nextPaint = () => nextFrames(5);

// the color of the layer at a stage position, as 'r,g,b,a'
function pixel(layer: Layer, x: number, y: number) {
  const ratio = layer.getCanvas().getPixelRatio();
  return Array.from(
    layer.getContext().getImageData(x * ratio, y * ratio, 1, 1).data
  ).join(',');
}

const RED = '255,0,0,255';
const EMPTY = '0,0,0,0';

describe('Html', function () {
  it('draws nothing without the HTML-in-Canvas API', function () {
    if (supported) {
      return this.skip();
    }
    const stage = addStage();
    const layer = new Konva.Layer();
    stage.add(layer);
    const element = isNode
      ? ({ style: {} } as HTMLElement)
      : makeElement('red');
    const html = new Konva.Html({ x: 10, y: 10, width: 100, element });
    layer.add(html);

    layer.draw();
    stage.toCanvas();
    layer.draw();

    assert.equal(pixel(layer, 20, 20), EMPTY);
    assert.equal(html.width(), 100);
    assert.equal(html.height(), 0);
    html.destroy();
  });

  describe('with the HTML-in-Canvas API', function () {
    before(function () {
      if (!supported) {
        this.skip();
      }
    });

    it('draws the element in the order and with the transform of the node', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const element = makeElement('red');
      const html = new Konva.Html({
        x: 20,
        y: 20,
        width: 100,
        scaleX: 2,
        scaleY: 2,
        element,
      });
      layer.add(new Konva.Rect({ width: 300, height: 150, fill: 'blue' }));
      layer.add(html);
      layer.add(
        new Konva.Rect({ x: 150, y: 60, width: 200, height: 20, fill: 'lime' })
      );
      await nextPaint();

      // 100x50 at scale 2 covers 20..220 x 20..120
      assert.equal(pixel(layer, 25, 25), RED);
      assert.equal(pixel(layer, 215, 115), RED);
      assert.equal(pixel(layer, 225, 125), '0,0,255,255', 'rect below');
      assert.equal(pixel(layer, 200, 70), '0,255,0,255', 'rect above');
      // the element lives inside the stage
      assert.equal(stage.content.contains(element), true);
    });

    it('has the size of the element, and follows its changes', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const element = makeElement('red');
      const html = new Konva.Html({ x: 20, y: 20, width: 120, element });
      const group = new Konva.Group();
      group.add(html);
      layer.add(group);
      const tr = new Konva.Transformer({ nodes: [html] });
      const groupTr = new Konva.Transformer({ nodes: [group] });
      layer.add(tr, groupTr);
      await nextPaint();

      assert.equal(element.offsetWidth, 120, 'width sets the CSS width');
      assert.equal(html.width(), 120);
      assert.equal(html.height(), 50, 'height comes from the layout');
      assert.equal(tr.height(), 50);

      let changes = 0;
      html.on('heightChange', () => changes++);
      (element.firstChild as HTMLElement).style.height = '80px';
      await nextPaint();

      assert.equal(html.height(), 80);
      assert.equal(changes, 1);
      assert.equal(tr.height(), 80, 'transformer follows');
      assert.equal(groupTr.height(), 80, 'also on a parent');
      assert.equal(pixel(layer, 30, 95), RED, 'the new part is drawn');

      html.width(60);
      html.height(30);
      await nextPaint();
      assert.equal(element.offsetWidth, 60);
      assert.equal(element.offsetHeight, 30);
      assert.equal(pixel(layer, 30, 60), EMPTY);
    });

    it('keeps the CSS size of the element when it has no size attrs', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const element = makeElement('red', 'text');
      element.style.width = '80px';
      const html = new Konva.Html({ x: 20, y: 20, element });
      layer.add(html);
      await nextPaint();
      assert.equal(html.width(), 80);
      assert.equal(pixel(layer, 95, 30), RED);
      assert.equal(pixel(layer, 105, 30), EMPTY);

      html.width(120);
      await nextPaint();
      assert.equal(element.offsetWidth, 120);

      // without the attr the element takes the width of its content
      html.width(undefined);
      await nextPaint();
      assert.equal(html.width(), element.offsetWidth);
      assert.isAbove(html.width(), 0);
      assert.isBelow(html.width(), 120);
    });

    it('clones the element with the node', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const html = new Konva.Html({
        x: 20,
        y: 20,
        width: 100,
        element: makeElement('red'),
      });
      const clone = html.clone({ x: 200 });
      layer.add(html, clone);
      await nextPaint();
      assert.notEqual(clone.element(), html.element());
      assert.equal(pixel(layer, 30, 30), RED);
      assert.equal(pixel(layer, 210, 30), RED);

      // the clone does not depend on the element of the original
      html.destroy();
      layer.draw();
      assert.equal(pixel(layer, 30, 30), EMPTY);
      assert.equal(pixel(layer, 210, 30), RED);
    });

    it('redraws only its own layer when the element changes', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      const otherLayer = new Konva.Layer();
      stage.add(layer, otherLayer);

      const element = makeElement('red');
      layer.add(new Konva.Html({ x: 20, y: 20, width: 100, element }));
      otherLayer.add(new Konva.Rect({ width: 10, height: 10, fill: 'blue' }));
      await nextPaint();
      assert.equal(pixel(layer, 30, 30), RED);

      let otherDraws = 0;
      otherLayer.on('draw', () => otherDraws++);
      element.style.background = 'lime';
      await nextPaint();

      assert.equal(pixel(layer, 30, 30), '0,255,0,255');
      assert.equal(otherDraws, 0);
    });

    it('places the element where the node is drawn', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const outer = new Konva.Group({ x: 150, y: 20, rotation: 20 });
      const inner = new Konva.Group({ x: 10, y: 10, scaleX: 1.5, scaleY: 2 });
      const element = makeElement('red');
      const html = new Konva.Html({ x: 5, y: 5, width: 100, element });
      inner.add(html);
      outer.add(inner);
      layer.add(outer);
      await nextPaint();

      const check = () => {
        const content = stage.content.getBoundingClientRect();
        const dom = element.getBoundingClientRect();
        const rect = html.getClientRect();
        assert.closeTo(dom.left - content.left, rect.x, 0.5);
        assert.closeTo(dom.top - content.top, rect.y, 0.5);
        assert.closeTo(dom.width, rect.width, 0.5);
        assert.closeTo(dom.height, rect.height, 0.5);
      };
      check();

      // a parent moves the element too
      outer.x(200);
      outer.rotation(-10);
      layer.draw();
      check();
    });

    it('is exported, cached and filtered like other shapes', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const group = new Konva.Group({ x: 20, y: 20 });
      group.add(new Konva.Html({ width: 100, element: makeElement('red') }));
      layer.add(group);
      await nextPaint();

      const exported = stage.toCanvas({ pixelRatio: 2 });
      const data = exported.getContext('2d')!.getImageData(100, 100, 1, 1).data;
      assert.equal(Array.from(data).join(','), RED);

      group.cache();
      group.filters([Konva.Filters.Invert]);
      layer.draw();
      assert.equal(pixel(layer, 50, 50), '0,255,255,255');
    });

    it('gives input to an interactive element only where its node is on top', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);

      const element = makeElement('red', '<input />');
      const html = new Konva.Html({ x: 20, y: 20, width: 200, element });
      layer.add(html);
      const cover = new Konva.Rect({
        x: 150,
        y: 20,
        width: 100,
        height: 50,
        fill: 'blue',
      });
      layer.add(cover);
      await nextPaint();

      // what a real click at the stage position would land on
      const isTarget = (x: number, y: number) => {
        const content = stage.content.getBoundingClientRect();
        const target = document.elementFromPoint(
          content.left + x,
          content.top + y
        );
        return element.contains(target);
      };
      const takesInputAt = (x: number, y: number) => {
        simulateMouseMove(stage, { x, y });
        return isTarget(x, y);
      };

      // the pointer is not on the stage yet: nothing to do, and no warning
      const warnings = countCalls(Konva.Util, 'warn', () => {
        html.interactive(true);
        html.interactive(false);
      });
      assert.equal(warnings, 0);

      assert.equal(takesInputAt(40, 40), false, 'a picture by default');

      html.interactive(true);
      assert.equal(takesInputAt(40, 40), true);
      assert.equal(takesInputAt(170, 40), false, 'under another shape');
      assert.equal(takesInputAt(40, 40), true);

      cover.moveToBottom();
      layer.draw();
      assert.equal(takesInputAt(170, 40), true, 'now above that shape');

      html.hide();
      layer.draw();
      assert.equal(takesInputAt(40, 40), false, 'hidden');
      html.show();
      layer.draw();
      assert.equal(takesInputAt(40, 40), true);

      // the pointer rests on the node: no move comes before the next click
      html.interactive(false);
      assert.equal(isTarget(40, 40), false);
      html.interactive(true);
      assert.equal(isTarget(40, 40), true);
    });

    it('lets a tap focus an interactive element', function () {
      // Konva cancels touchstart on a shape with preventDefault, and a
      // canceled touch does not focus an input
      const html = new Konva.Html({ element: makeElement('red') });
      assert.equal(html.preventDefault(), true);
      html.interactive(true);
      assert.equal(html.preventDefault(), false);
      html.preventDefault(true);
      assert.equal(html.preventDefault(), true);
    });

    it('moves the element with the node, and gives it back on destroy', async function () {
      const stage = addVisibleStage();
      const layer = new Konva.Layer();
      stage.add(layer);
      const stage2 = addVisibleStage();
      const layer2 = new Konva.Layer();
      stage2.add(layer2);

      const element = makeElement('red');
      const html = new Konva.Html({ x: 20, y: 20, width: 100, element });
      const other = new Konva.Html({ element: makeElement('blue') });
      layer.add(html, other);
      await nextPaint();
      assert.equal(stage.content.contains(element), true);

      html.moveTo(layer2);
      await nextPaint();
      assert.equal(stage2.content.contains(element), true);
      assert.equal(pixel(layer2, 30, 30), RED);
      assert.equal(pixel(layer, 30, 30), EMPTY);

      html.destroy();
      assert.equal(element.parentNode, null);
      assert.equal(element.style.pointerEvents, '');
      assert.equal(stage2.content.querySelectorAll('canvas').length, 1);
      // the first stage still has a node, so it keeps its host canvas
      assert.equal(stage.content.querySelectorAll('canvas').length, 2);
      other.destroy();
      assert.equal(stage.content.querySelectorAll('canvas').length, 1);
    });
  });
});
