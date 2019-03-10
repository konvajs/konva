// main enter file of full Konva version

var Konva = require('./_FullInternals').Konva;
// add Konva to global variable
Konva._injectGlobal(Konva);
exports['default'] = Konva;
module.exports = exports['default'];
