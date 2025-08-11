// try to import only core
const Konva = require('../').default;
require('../lib/canvas-backend');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
