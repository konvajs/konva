import * as Konva from './_CoreInternals';

// add Konva to global viriable
// umd build will actually do it
// but it may now it case of modules and bundlers
Konva._injectGlobal(Konva);

export default Konva;
