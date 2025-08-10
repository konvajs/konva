// try to import only core
const Konva = require('../').default;
require('../lib/setup-node-canvas');

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
