// noinspection JSCheckFunctionSignatures

import Konva from '../src/index.ts';
const container = document.querySelector('#container');

function inTextProcess(options) {
    // !options.id ? text.id(nanoid()) : '';

    return new Konva.Text({
        x: container.clientWidth / 2,
        y: container.clientHeight / 2,
        ...options
    });
}

export function createText(source) {
    if (Object.prototype.toString.call(source) === '[object Object]') {
        return new Promise((resolve, reject) => {
            const textObject = inTextProcess(source);
            resolve(textObject);
        });
    } else if (Array.isArray(source)) {
        return new Promise((resolve, reject) => {
            let textList = source.map(item => inTextProcess(item));
            resolve(textList);
        });
    }
}

