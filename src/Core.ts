import * as Konva from './_CoreInternals';

// add Konva to global variable
// umd build will actually do it
// but it may now it case of modules and bundlers
Konva._injectGlobal(Konva);

module.exports = Konva;
