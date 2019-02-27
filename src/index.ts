const Konva = require('./_FullInternals');

// add Konva to global variable
// umd build will actually do it
// but it may now it case of modules and bundlers
Konva._injectGlobal(Konva);

exports.__esModule = true;
exports['default'] = Konva;

module.exports = exports['default'];
