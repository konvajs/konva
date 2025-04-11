import { Path, PathConfig } from './Path';

const CLOUD = {
  topPath: `a 8 8 0 0 1 14 5`,
  topOffset: `m -2 -5`,
  topWidth: 12,
  rightPath: `a 8 8 0 0 1 -5 14`,
  rightOffset: `m 5 -2`,
  bottomPath: `a 8 8 0 0 1 -14 -5`,
  bottomOffset: `m 2 5`,
  leftPath: `a 8 8 0 0 1 5 -14`,
  leftOffset: `m -5 2`,
  leftHeight: 12,
};

/**
 * Cloud shape
 *
 * Example:
 * ```javascript
 * const cloud = new Cloud({
 *     x: 10,
 *     y: 10,
 *     width: 200,
 *     height: 100,
 *     draggable: true,
 *     stroke: '#0058ff',
 *     name: 'clouding',
 * })
 * ```
 *
 * If you want to expand the cloud by dragging the mouse, you can use the following code:
 * ```javascript
 * const width = cursorPos.x - cloud.x()
 * const height = cursorPos.y - cloud.y()
 * cloud.adjustPath(width, height)
 * ```
 */
export class Cloud extends Path {
  constructor(config: PathConfig) {
    super(config);
    this.adjustPath(config.width || 0, config.height || 0);

    this.on('transformend', (e) => {
      const { width, height } = this.getClientRect();
      const a = Math.abs(e.target.rotation());
      const sinA = Math.sin((a * Math.PI) / 180);
      const cosA = Math.cos((a * Math.PI) / 180);
      const h = (width * sinA - height * cosA) / (sinA ** 2 - cosA ** 2);
      const w = (width * cosA - height * sinA) / (cosA ** 2 - sinA ** 2);
      this.adjustPath(w, h);
      this.width(width);
      this.height(height);
      this.scaleX(1);
      this.scaleY(1);
    });
  }
  adjustPath(width: number, height: number) {
    const topPathCounter = Math.floor(Math.abs(width) / CLOUD.topWidth);
    const leftPathCounter = Math.floor(Math.abs(height) / CLOUD.leftHeight);
    const path =
      `${CLOUD.topPath} ${CLOUD.topOffset} `.repeat(topPathCounter) +
      `${CLOUD.rightPath} ${CLOUD.rightOffset} `.repeat(leftPathCounter) +
      `${CLOUD.bottomPath} ${CLOUD.bottomOffset} `.repeat(topPathCounter) +
      `${CLOUD.leftPath} ${CLOUD.leftOffset} `.repeat(leftPathCounter);

    this.setAttr('data', path);
  }
}
