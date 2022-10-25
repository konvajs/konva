import { Transformer } from '../src/shapes/Transformer';

const ANCHORS_NAMES = [
    'top-center',
    // 'top-right',
    'middle-right',
    'middle-left',
    // 'bottom-left',
    'bottom-center'
    // 'bottom-right',
];

export class TransformerX extends Transformer {
    constructor() {
        super();
    }

    // _createElements() {
    //     console.log('_createElements');
    //     this._createBack();
    //
    //     ANCHORS_NAMES.forEach(
    //         function (name) {
    //             this._createAnchor(name);
    //         }.bind(this)
    //     );
    //
    //     this._createAnchor('rotater');
    // }
}