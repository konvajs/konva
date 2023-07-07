import { Factory } from '../Factory';
import { Node, Filter } from '../Node';

export interface ColorCurveType {
    red?: number|number[]
    green?: number|number[]
    blue?: number|number[]
}

export const RGBA = {
    R: 0,
    G: 1,
    B: 2,
    A: 3,
    size: 4
}

export const DEFAULT_COLOR_CURVE = {
    red: 1,
    green: 1,
    blue: 1
}

function applyToChannel(imageData: ImageData, channel: number, value?: number|number[]) {
    if (!value) return
    const data = imageData.data
    const length = data.length
    if (typeof value === "number") {
        if (value < 0) return
        for (let i = 0; i < length; i += RGBA.size) {
            const idx = i + channel
            data[idx] = data[idx] * value
            if (data[idx] > 255) data[idx] %= 256
        }
    } else {
        if (value.length !== 256) return
        for (let i = 0; i < length; i += RGBA.size) {
            const idx = i + channel
            data[idx] = value[data[idx] % 256]
        }
    }

}

/**
 * ColorCurve Filter.
 * @function
 * @memberof Konva.Filters
 * @param {Object} imageData
 * @author ourfor
 * @example
 * node.cache();
 * node.filters([Konva.Filters.ColorCurve]);
 * // number: color -> color * 0.8
 * node.colorCurve({red: 0.8});
 * // number[]: color -> map[color]
 * const blue = []
 * for (let i=0; i < 256; i++) blue.push(i <= 128 ? (-1/64) * i * i + 3 * i : (1/64)*i*i - 5*i + 512)
 * node.colorCurve({blue})
 */

export const ColorCurve: Filter = function (imageData: ImageData) {
    const curve = this.colorCurve()
    if (!curve) return
    applyToChannel(imageData, RGBA.R, curve.red)
    applyToChannel(imageData, RGBA.G, curve.green)
    applyToChannel(imageData, RGBA.B, curve.blue)
}

/**
 * get/set filter color curve.
 * Use with {@link Konva.Filters.ColorCurve} filter.
 * @name Konva.Node#colorCurve
 * @method
 * @param {ColorCurveType} colorCurve an object contains red、green and blue
 * @param {Number|Array<Integer>} colorCurve.red a number from 0 to 255 or an array of 256 color values, applied to the red channel
 * @param {Number|Array<Integer>} colorCurve.green a number from 0 to 255 or an array of 256 color values, applied to the green channel
 * @param {Number|Array<Integer>} colorCurve.blue a number from 0 to 255 or an array of 256 color values, applied to the blue channel
 * @returns {ColorCurveType}
 */
Factory.addGetterSetter(
    Node,
    'colorCurve',
    DEFAULT_COLOR_CURVE,
    null,
    Factory.afterSetFilter
);
