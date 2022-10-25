// noinspection JSCheckFunctionSignatures
import Konva from '../src/index.ts';
import { nanoid } from 'nanoid';

export class imageSprite {
    constructor(options) {
        // this._stage = options.stage;
        this._stageWidthMedian = options.stage.getWidth() / 2;
        this._stageHeightMedian = options.stage.getHeight() / 2;
        console.log(options.stage);
    }

    createTexture(source) {
        if (Object.prototype.toString.call(source) === '[object Object]') {
            return ( async () => {
                const imageObj = await this.addImageProcess(source.url);
                delete source.url;
                return this.generateImageObject(imageObj, source);
            } )();
        } else if (Array.isArray(source)) {
            const loadSource = [];
            source.forEach((option) => {
                const preloading = ( async () => {
                        const imageObj = await this.addImageProcess(option.url);
                        delete option.url;
                        return this.generateImageObject(imageObj, option);
                    }
                )();
                loadSource.push(preloading);
            });

            // 图片全部加载完
            return Promise.all(loadSource).then((data) => {
                // console.log(data)
                return data;
            });
        }
    }

    generateImageObject(imageObj, options) {
        let optionsConfig = options || {};
        delete optionsConfig.url;
        const config = {
            x: this._stageWidthMedian,
            y: this._stageHeightMedian,
            image: imageObj,
            ...optionsConfig
        };
        const texture = new Konva.Image(config);
        texture.offsetX(texture.width() / 2);
        texture.offsetY(texture.height() / 2);
        !optionsConfig.id ? texture.id(nanoid()) : '';
        return texture;
    }

    addImageProcess(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            // img.crossOrigin = 'anonymous'; // to avoid CORS if used with Canvas
            img.onload = () => resolve(img);
            img.onerror = e => reject(e);
            img.src = src;
        });
    }
}

