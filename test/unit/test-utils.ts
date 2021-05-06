import { assert } from 'chai';
import KonvaModule from '../../src/index';
import '../../src/index-node';

export const Konva = KonvaModule;

import * as canvas from 'canvas';

Konva.enableTrace = true;
Konva.showWarnings = true;

import { imagediff } from './imagediff';
import { Layer } from '../../src/Layer.js';
import { Stage } from '../../src/Stage.js';

// reset some data
beforeEach(function () {
  Konva['inDblClickWindow'] = false;
});

// clear after test
afterEach(function () {
  var isFailed = this.currentTest.state == 'failed';
  var isManual = this.currentTest.parent.title === 'Manual';

  Konva.stages.forEach(function (stage) {
    clearTimeout(stage.dblTimeout);
  });

  console.log(isFailed);

  if (!isFailed && !isManual) {
    Konva.stages.forEach(function (stage) {
      stage.destroy();
    });
    if (Konva.DD._dragElements.size) {
      throw 'Why drag elements are not cleaned?';
    }
  }
});

export const isNode = typeof global.document === 'undefined';
export const isBrowser = !isNode;

export function getContainer() {
  return document.getElementById('konva-container');
}

export function addContainer() {
  if (isNode) {
    return;
  }
  var container = document.createElement('div');

  getContainer().appendChild(container);
  return container;
}

export function addStage(attrs?) {
  var container =
    (!isNode && global.document.createElement('div')) || undefined;

  var stage = new Konva.Stage({
    container: container,
    width: 578,
    height: 200,
    ...attrs,
  });

  if (!isNode) {
    getContainer().appendChild(container);
  }

  return stage;
}

export function loadImage(url, callback) {
  const isBase64 = url.indexOf('base64') >= 0;
  if (isNode && !isBase64) {
    url = './test/assets/' + url;
  } else if (!isBase64) {
    url = (document.getElementById(url) as HTMLImageElement).src;
  }

  return canvas
    .loadImage(url)
    .then(callback)
    .catch((e) => {
      console.error(e);
    });
}

export function getPixelRatio() {
  return (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
}

function get(element, content?) {
  element = document.createElement(element);
  if (element && content) {
    element.innerHTML = content;
  }
  return element;
}

export function compareCanvases(canvas1, canvas2, tol?, secondTol?) {
  // don't test in PhantomJS as it use old chrome engine
  // it it has opacity + shadow bug
  var equal = imagediff.equal(canvas1, canvas2, tol, secondTol);
  if (!equal) {
    const diff = imagediff.diff(canvas1, canvas2);
    const diffCanvas = createCanvas();

    const context = diffCanvas.getContext('2d');
    context.putImageData(diff, 0, 0);

    var base64 = diffCanvas.toDataURL();
    console.error('Diff image:');
    console.error(base64);

    if (isBrowser) {
      var div = get('div'),
        b = get('div', '<div>Expected:</div>'),
        c = get('div', '<div>Diff:</div>');
      div.style.overflow = 'hidden';
      b.style.float = 'left';
      c.style.float = 'left';
      canvas2.style.position = '';
      canvas2.style.display = '';
      b.appendChild(canvas2);
      c.appendChild(diffCanvas);
      div.appendChild(b);
      div.appendChild(c);
      getContainer().appendChild(div);
    }
  }
  assert.equal(
    equal,
    true,
    'Result from Konva is different with canvas result'
  );
}

export function compareLayerAndCanvas(layer: Layer, canvas, tol?, secondTol?) {
  compareCanvases(layer.getNativeCanvasElement(), canvas, tol, secondTol);
}

export function cloneAndCompareLayer(layer: Layer, tol?, secondTol?) {
  var layer2 = layer.clone();
  layer.getStage().add(layer2);
  layer2.hide();
  compareLayers(layer, layer2, tol, secondTol);
}

export function compareLayers(layer1: Layer, layer2: Layer, tol?, secondTol?) {
  compareLayerAndCanvas(
    layer1,
    layer2.getNativeCanvasElement(),
    tol,
    secondTol
  );
}

export function createCanvas() {
  var node = canvas.createCanvas(300, 300);
  node.width = 578 * Konva.pixelRatio;
  node.height = 200 * Konva.pixelRatio;
  node.getContext('2d').scale(Konva.pixelRatio, Konva.pixelRatio);
  return node;
}

export function showHit(layer) {
  if (isNode) {
    return;
  }
  var canvas = layer.hitCanvas._canvas;
  canvas.style.position = 'relative';

  getContainer().appendChild(canvas);
}

export function simulateMouseDown(stage, pos) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;

  stage._mousedown({
    clientX: pos.x,
    clientY: pos.y + top,
    button: pos.button || 0,
  });
}

export function simulateMouseMove(stage, pos) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var evt = {
    clientX: pos.x,
    clientY: pos.y + top,
    button: pos.button || 0,
  };

  stage._mousemove(evt);
  Konva.DD._drag(evt);
}

export function simulateMouseUp(stage, pos) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var evt = {
    clientX: pos.x,
    clientY: pos.y + top,
    button: pos.button || 0,
  };

  Konva.DD._endDragBefore(evt);
  stage._mouseup(evt);
  Konva.DD._endDragAfter(evt);
}

export function simulateTouchStart(stage, pos, changed?) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var touches;
  var changedTouches;
  if (Array.isArray(pos)) {
    touches = pos.map(function (touch) {
      return {
        identifier: touch.id,
        clientX: touch.x,
        clientY: touch.y + top,
      };
    });
    changedTouches = (changed || pos).map(function (touch) {
      return {
        identifier: touch.id,
        clientX: touch.x,
        clientY: touch.y + top,
      };
    });
  } else {
    changedTouches = touches = [
      {
        clientX: pos.x,
        clientY: pos.y + top,
        id: 0,
      },
    ];
  }
  var evt = {
    touches: touches,
    changedTouches: changedTouches,
  };

  stage._touchstart(evt);
}

export function simulateTouchMove(stage, pos, changed?) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var touches;
  var changedTouches;
  if (Array.isArray(pos)) {
    touches = pos.map(function (touch) {
      return {
        identifier: touch.id,
        clientX: touch.x,
        clientY: touch.y + top,
      };
    });
    changedTouches = (changed || pos).map(function (touch) {
      return {
        identifier: touch.id,
        clientX: touch.x,
        clientY: touch.y + top,
      };
    });
  } else {
    changedTouches = touches = [
      {
        clientX: pos.x,
        clientY: pos.y + top,
        id: 0,
      },
    ];
  }
  var evt = {
    touches: touches,
    changedTouches: changedTouches,
  };

  stage._touchmove(evt);
  Konva.DD._drag(evt);
}

export function simulateTouchEnd(stage, pos, changed?) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var touches;
  var changedTouches;
  if (Array.isArray(pos)) {
    touches = pos.map(function (touch) {
      return {
        identifier: touch.id,
        clientX: touch.x,
        clientY: touch.y + top,
      };
    });
    changedTouches = (changed || pos).map(function (touch) {
      return {
        identifier: touch.id,
        clientX: touch.x,
        clientY: touch.y + top,
      };
    });
  } else {
    changedTouches = touches = [
      {
        clientX: pos.x,
        clientY: pos.y + top,
        id: 0,
      },
    ];
  }
  var evt = {
    touches: touches,
    changedTouches: changedTouches,
  };

  Konva.DD._endDragBefore(evt);
  stage._touchend(evt);
  Konva.DD._endDragAfter(evt);
}

export function simulatePointerDown(stage: Stage, pos) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  stage._pointerdown({
    clientX: pos.x,
    clientY: pos.y + top,
    button: pos.button || 0,
    pointerId: pos.pointerId || 1,
  } as any);
}

export function simulatePointerMove(stage: Stage, pos) {
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var evt = {
    clientX: pos.x,
    clientY: pos.y + top,
    button: pos.button || 0,
    pointerId: pos.pointerId || 1,
  };

  stage._pointermove(evt as any);
  Konva.DD._drag(evt);
}

export function simulatePointerUp(stage: Stage, pos) {
  debugger;
  var top = isNode ? 0 : stage.content.getBoundingClientRect().top;
  var evt = {
    clientX: pos.x,
    clientY: pos.y + top,
    button: pos.button || 0,
    pointerId: pos.pointerId || 1,
  };

  Konva.DD._endDragBefore(evt);
  stage._pointerup(evt as any);
  Konva.DD._endDragAfter(evt);
}

function isClose(a, b) {
  return Math.abs(a - b) < 0.000001;
}

export const assertAlmostEqual = function (val1, val2) {
  if (!isClose(val1, val2)) {
    throw new Error('Expected ' + val1 + ' to be almost equal to ' + val2);
  }
};
