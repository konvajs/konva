function equal(val1, val2, message) {
  if (val1 !== val2) {
    throw new Error('Not passed: ' + message);
  }
}

// try to import only core
import Konva from '../lib/Core.js';
import { Rect } from '../lib/shapes/Rect.js';
import '../lib/index-node.js';

equal(Rect !== undefined, true, 'Rect is defined');

equal(Konva.Rect, Rect, 'Rect is injected');

// // just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
