import { Factory } from '../Factory';
import { Line, LineConfig } from './Line';
import { GetSet } from '../types';
import { getNumberValidator } from '../Validators';
import { _registerNode } from '../Global';
import { Path } from './Path';
import { Context } from '../Context';

export interface ArrowConfig extends LineConfig {
  points: number[];
  tension?: number;
  closed?: boolean;
  pointerLength?: number;
  pointerWidth?: number;
  pointerAtBeginning?: boolean;
  pointerAtEnding?: boolean;
}

/**
 * Arrow constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Line
 * @param {Object} config
 * @param {Array} config.points Flat array of points coordinates. You should define them as [x1, y1, x2, y2, x3, y3].
 * @param {Number} [config.tension] Higher values will result in a more curvy line.  A value of 0 will result in no interpolation.
 *   The default is 0
 * @param {Number} config.pointerLength Arrow pointer length. Default value is 10.
 * @param {Number} config.pointerWidth Arrow pointer width. Default value is 10.
 * @param {Boolean} config.pointerAtBeginning Do we need to draw pointer on beginning position?. Default false.
 * @param {Boolean} config.pointerAtEnding Do we need to draw pointer on ending position?. Default true.
 * @@shapeParams
 * @@nodeParams
 * @example
 * var line = new Konva.Line({
 *   points: [73, 70, 340, 23, 450, 60, 500, 20],
 *   stroke: 'red',
 *   tension: 1,
 *   pointerLength : 10,
 *   pointerWidth : 12
 * });
 */
export class Arrow extends Line<ArrowConfig> {
  _sceneFunc(ctx: Context) {
    super._sceneFunc(ctx);
    const PI2 = Math.PI * 2;
    const points = this.points();

    let tp = points;
    const fromTension = this.tension() !== 0 && points.length > 4;
    if (fromTension) {
      tp = this.getTensionPoints();
    }
    const length = this.pointerLength();

    const n = points.length;

    let dx, dy;
    if (fromTension) {
      const lp = [
        tp[tp.length - 4],
        tp[tp.length - 3],
        tp[tp.length - 2],
        tp[tp.length - 1],
        points[n - 2],
        points[n - 1],
      ];
      const lastLength = Path.calcLength(
        tp[tp.length - 4],
        tp[tp.length - 3],
        'C',
        lp
      );
      const previous = Path.getPointOnQuadraticBezier(
        Math.min(1, 1 - length / lastLength),
        lp[0],
        lp[1],
        lp[2],
        lp[3],
        lp[4],
        lp[5]
      );

      dx = points[n - 2] - previous.x;
      dy = points[n - 1] - previous.y;
    } else {
      dx = points[n - 2] - points[n - 4];
      dy = points[n - 1] - points[n - 3];
    }

    const radians = (Math.atan2(dy, dx) + PI2) % PI2;

    const width = this.pointerWidth();

    if (this.pointerAtEnding()) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(points[n - 2], points[n - 1]);
      ctx.rotate(radians);
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, width / 2);
      ctx.lineTo(-length, -width / 2);
      ctx.closePath();
      ctx.restore();
      this.__fillStroke(ctx);
    }

    if (this.pointerAtBeginning()) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(points[0], points[1]);
      if (fromTension) {
        dx = (tp[0] + tp[2]) / 2 - points[0];
        dy = (tp[1] + tp[3]) / 2 - points[1];
      } else {
        dx = points[2] - points[0];
        dy = points[3] - points[1];
      }

      ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, width / 2);
      ctx.lineTo(-length, -width / 2);
      ctx.closePath();
      ctx.restore();
      this.__fillStroke(ctx);
    }
  }

  __fillStroke(ctx: Context) {
    // here is a tricky part
    // we need to disable dash for arrow pointers
    const isDashEnabled = this.dashEnabled();
    if (isDashEnabled) {
      // manually disable dash for head
      // it is better not to use setter here,
      // because it will trigger attr change event
      this.attrs.dashEnabled = false;
      ctx.setLineDash([]);
    }

    ctx.fillStrokeShape(this);

    // restore old value
    if (isDashEnabled) {
      this.attrs.dashEnabled = true;
    }
  }

  getSelfRect() {
    const lineRect = super.getSelfRect();
    const offset = this.pointerWidth() / 2;
    return {
      x: lineRect.x - offset,
      y: lineRect.y - offset,
      width: lineRect.width + offset * 2,
      height: lineRect.height + offset * 2,
    };
  }

  pointerLength: GetSet<number, this>;
  pointerWidth: GetSet<number, this>;
  pointerAtEnding: GetSet<boolean, this>;
  pointerAtBeginning: GetSet<boolean, this>;
}

Arrow.prototype.className = 'Arrow';
_registerNode(Arrow);

/**
 * get/set pointerLength
 * @name Konva.Arrow#pointerLength
 * @method
 * @param {Number} Length of pointer of arrow. The default is 10.
 * @returns {Number}
 * @example
 * // get length
 * var pointerLength = line.pointerLength();
 *
 * // set length
 * line.pointerLength(15);
 */

Factory.addGetterSetter(Arrow, 'pointerLength', 10, getNumberValidator());
/**
 * get/set pointerWidth
 * @name Konva.Arrow#pointerWidth
 * @method
 * @param {Number} Width of pointer of arrow.
 *   The default is 10.
 * @returns {Number}
 * @example
 * // get width
 * var pointerWidth = line.pointerWidth();
 *
 * // set width
 * line.pointerWidth(15);
 */

Factory.addGetterSetter(Arrow, 'pointerWidth', 10, getNumberValidator());
/**
 * get/set pointerAtBeginning
 * @name Konva.Arrow#pointerAtBeginning
 * @method
 * @param {Number} Should pointer displayed at beginning of arrow. The default is false.
 * @returns {Boolean}
 * @example
 * // get value
 * var pointerAtBeginning = line.pointerAtBeginning();
 *
 * // set value
 * line.pointerAtBeginning(true);
 */

Factory.addGetterSetter(Arrow, 'pointerAtBeginning', false);
/**
 * get/set pointerAtEnding
 * @name Konva.Arrow#pointerAtEnding
 * @method
 * @param {Number} Should pointer displayed at ending of arrow. The default is true.
 * @returns {Boolean}
 * @example
 * // get value
 * var pointerAtEnding = line.pointerAtEnding();
 *
 * // set value
 * line.pointerAtEnding(false);
 */

Factory.addGetterSetter(Arrow, 'pointerAtEnding', true);
