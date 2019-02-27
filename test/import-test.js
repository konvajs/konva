function equal(val1, val2, message) {
  if (val1 !== val2) {
    throw new Error('Not passed: ' + message);
  }
}

// try to import only core
let Konva = require('../lib/Core').default;

// no external shapes
equal(Konva.Rect, undefined, 'no external shapes');

let Rect = require('../lib/shapes/Rect').Rect;

equal(Rect !== undefined, true, 'Rect is defined');

// now import from package.json
let NewKonva = require('../').default;

equal(NewKonva.Rect, Rect, 'Same rects');

// check global injection
equal(global.Konva, NewKonva, 'injected');
