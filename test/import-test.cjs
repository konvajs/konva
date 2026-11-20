function equal(val1, val2, message) {
  if (val1 !== val2) {
    throw new Error('Not passed: ' + message);
  }
}

// the package resolves itself through its exports map, like a consumer would
const Konva = require('konva').default;
equal(Konva.getCanvasBackend(), null, 'no backend before one is imported');
// a document defined after Konva loads, as jsdom does, is the web backend
globalThis.document = {};
equal(Konva.getCanvasBackend(), 'web', 'a later document makes it web');
delete globalThis.document;
require('konva/canvas-backend');
equal(Konva.getCanvasBackend(), 'node-canvas', 'canvas-backend sets it');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
