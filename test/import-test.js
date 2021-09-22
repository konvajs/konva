function equal(val1, val2, message) {
  if (val1 !== val2) {
    throw new Error('Not passed: ' + message);
  }
}

// try to import only core
const Konva = require('../cmj').default;

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
