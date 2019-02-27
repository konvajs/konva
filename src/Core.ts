const KonvaInternals = require('./_CoreInternals');

// add Konva to global variable
// umd build will actually do it
// but it may now it case of modules and bundlers
KonvaInternals._injectGlobal(KonvaInternals);

exports.__esModule = true;
exports['default'] = KonvaInternals;

module.exports = exports['default'];
