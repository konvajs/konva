import { assert } from 'chai';
import { isBrowser, Konva, simulateMouseDown } from './test-utils.ts';

describe('DragAndDrop owner window', function () {
  it('continues dragging in the stage owner window', function () {
    if (!isBrowser) {
      return;
    }

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow!;
    const frameDocument = iframe.contentDocument!;
    const container = frameDocument.createElement('div');
    frameDocument.body.appendChild(container);

    const stage = new Konva.Stage({
      container,
      width: 200,
      height: 200,
    });
    const layer = new Konva.Layer();
    const rect = new Konva.Rect({
      x: 10,
      y: 10,
      width: 40,
      height: 40,
      draggable: true,
    });

    layer.add(rect);
    stage.add(layer);

    let dragMoves = 0;
    let dragEnds = 0;
    rect.on('dragmove', () => dragMoves++);
    rect.on('dragend', () => dragEnds++);

    try {
      simulateMouseDown(stage, { x: 20, y: 20 });

      frameWindow.dispatchEvent(
        new frameWindow.MouseEvent('mousemove', {
          clientX: 60,
          clientY: 60,
          bubbles: true,
        })
      );

      assert.isTrue(rect.isDragging());
      assert.isAbove(dragMoves, 0);
      assert.equal(rect.x(), 50);
      assert.equal(rect.y(), 50);

      frameWindow.dispatchEvent(
        new frameWindow.MouseEvent('mouseup', {
          clientX: 60,
          clientY: 60,
          bubbles: true,
        })
      );

      assert.isFalse(rect.isDragging());
      assert.equal(dragEnds, 1);
    } finally {
      rect.stopDrag();
      stage.destroy();
      iframe.remove();
    }
  });
});
