import { Factory } from '../Factory.ts';
import type { LineConfig } from './Line.ts';
import { Line } from './Line.ts';
import type { GetSet } from '../types.ts';
import { getNumberValidator } from '../Validators.ts';
import { _registerNode } from '../Global.ts';
import { Path } from './Path.ts';
import type { Context } from '../Context.ts';

export interface ArrowConfig extends LineConfig {
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
  _getStrokePadding() {
    // Arrowheads have joins even when the shaft is a single straight line.
    return super._getStrokePadding(
      this.pointerAtBeginning() || this.pointerAtEnding()
        ? this.miterLimit() || 10
        : undefined
    );
  }
  _sceneFunc(ctx: Context) {
    super._sceneFunc(ctx);
    const points = this.points();
    const n = points.length;
    if (n < 4) return;
    const length = this.pointerLength();
    const width = this.pointerWidth();

    if (this.pointerAtEnding()) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(points[n - 2], points[n - 1]);
      ctx.rotate(this._getPointerAngle(false));
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
      ctx.rotate(this._getPointerAngle(true));
      ctx.moveTo(0, 0);
      ctx.lineTo(-length, width / 2);
      ctx.lineTo(-length, -width / 2);
      ctx.closePath();
      ctx.restore();
      this.__fillStroke(ctx);
    }
  }

  _getPointerAngle(atBeginning: boolean) {
    const points = this.points();
    const n = points.length;
    const fromTension = this.tension() !== 0 && n > 4;
    const tp = fromTension ? this.getTensionPoints() : points;
    const ex = atBeginning ? points[0] : points[n - 2],
      ey = atBeginning ? points[1] : points[n - 1];
    let dx = 0,
      dy = 0;
    if (fromTension && atBeginning) {
      dx = ex - (tp[0] + tp[2]) / 2;
      dy = ey - (tp[1] + tp[3]) / 2;
    } else if (fromTension) {
      const x = tp[tp.length - 4],
        y = tp[tp.length - 3];
      const controlX = tp[tp.length - 2],
        controlY = tp[tp.length - 1];
      const lastLength = Path.calcLength(x, y, 'Q', [
        controlX,
        controlY,
        ex,
        ey,
      ]);
      const previous = Path.getPointOnQuadraticBezier(
        lastLength ? Math.max(0, 1 - this.pointerLength() / lastLength) : 0,
        x,
        y,
        controlX,
        controlY,
        ex,
        ey
      );
      dx = ex - previous.x;
      dy = ey - previous.y;
    }
    // repeated endpoints give a zero tangent, so walk towards the other end
    // of the line until a distinct point is found
    for (
      let i = atBeginning ? 0 : tp.length - 2;
      !dx && !dy && i >= 0 && i < tp.length;
      i += atBeginning ? 2 : -2
    ) {
      dx = ex - tp[i];
      dy = ey - tp[i + 1];
    }
    const turn = Math.PI * 2;
    return (Math.atan2(dy, dx) + turn) % turn;
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
    const points = this.points();
    if (points.length < 4) return lineRect;
    let minX = lineRect.x,
      minY = lineRect.y;
    let maxX = minX + lineRect.width,
      maxY = minY + lineRect.height;
    for (const beginning of [false, true]) {
      if (!(beginning ? this.pointerAtBeginning() : this.pointerAtEnding()))
        continue;
      const index = beginning ? 0 : points.length - 2;
      const angle = this._getPointerAngle(beginning);
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      const x = points[index] - this.pointerLength() * cos;
      const y = points[index + 1] - this.pointerLength() * sin;
      const dx = Math.abs((this.pointerWidth() * sin) / 2);
      const dy = Math.abs((this.pointerWidth() * cos) / 2);
      minX = Math.min(minX, x - dx);
      minY = Math.min(minY, y - dy);
      maxX = Math.max(maxX, x + dx);
      maxY = Math.max(maxY, y + dy);
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  pointerLength: GetSet<number, this>;
  pointerWidth: GetSet<number, this>;
  pointerAtEnding: GetSet<boolean, this>;
  pointerAtBeginning: GetSet<boolean, this>;
}

Arrow.prototype.className = 'Arrow';
Arrow.prototype._attrsAffectingSize = [
  ...Line.prototype._attrsAffectingSize,
  'pointerLength',
  'pointerWidth',
  'pointerAtBeginning',
  'pointerAtEnding',
];
_registerNode(Arrow, true);

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
 * @param {Boolean} pointerAtBeginning Whether to draw a pointer at the beginning of the arrow. The default is false.
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
 * @param {Boolean} pointerAtEnding Whether to draw a pointer at the end of the arrow. The default is true.
 * @returns {Boolean}
 * @example
 * // get value
 * var pointerAtEnding = line.pointerAtEnding();
 *
 * // set value
 * line.pointerAtEnding(false);
 */

Factory.addGetterSetter(Arrow, 'pointerAtEnding', true);
