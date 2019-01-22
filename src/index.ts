import * as Konva from './internals';

// add Konva to global viriable
// umd build will actually do it
// but it may now it case of modules and bundlers
Konva.glob.Konva = Konva;

export default Konva;
