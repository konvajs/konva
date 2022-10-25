
import Konva from '../src/index.ts';
export function createRect() {
    return new Konva.Rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#F78AE0'
    });
}