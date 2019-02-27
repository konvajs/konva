var Konva = require('./_FullInternals');
// add Konva to global variable
// umd build will actually do it
// but it may now it case of modules and bundlers
Konva._injectGlobal(Konva);
exports['default'] = Konva;
Konva.default = Konva;
module.exports = exports['default'];
