// try to import only core
const Konva = require('../cmj').default;

// just do a simple action
const stage = new Konva.Stage();
stage.toDataURL();
