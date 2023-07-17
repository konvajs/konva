import { Factory } from '../Factory';
import { Shape, ShapeConfig } from '../Shape';
import { _registerNode } from '../Global';
import { GetSet, PathSegment } from '../types';
import {
  getCubicArcLength,
  getQuadraticArcLength,
  t2length,
} from '../BezierFunctions';
export interface PathConfig extends ShapeConfig {
  data?: string;
}
/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} config.data SVG data string
 * @@shapeParams
 * @@nodeParams
 * @example
 * var path = new Konva.Path({
 *   x: 240,
 *   y: 40,
 *   data: 'M12.582,9.551C3.251,16.237,0.921,29.021,7.08,38.564l-2.36,1.689l4.893,2.262l4.893,2.262l-0.568-5.36l-0.567-5.359l-2.365,1.694c-4.657-7.375-2.83-17.185,4.352-22.33c7.451-5.338,17.817-3.625,23.156,3.824c5.337,7.449,3.625,17.813-3.821,23.152l2.857,3.988c9.617-6.893,11.827-20.277,4.935-29.896C35.591,4.87,22.204,2.658,12.582,9.551z',
 *   fill: 'green',
 *   scaleX: 2,
 *   scaleY: 2
 * });
 */
export class Path extends Shape<PathConfig> {
  dataArray: any[] = [];
  pathLength = 0;
  constructor(config?: PathConfig) {
    super(config);
    this._readDataAttribute();
    this.on('dataChange.konva', function () {
      this._readDataAttribute();
    });
  }
  _readDataAttribute() {
    this.dataArray = Path.parsePathData(this.data());
    this.pathLength = Path.getPathLength(this.dataArray);
  }
  _sceneFunc(context) {
    var ca = this.dataArray;
    // context position
    context.beginPath();
    var isClosed = false;
    for (var n = 0; n < ca.length; n++) {
      var c = ca[n].command;
      var p = ca[n].points;
      switch (c) {
        case 'L':
          context.lineTo(p[0], p[1]);
          break;
        case 'M':
          context.moveTo(p[0], p[1]);
          break;
        case 'C':
          context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
          break;
        case 'Q':
          context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
          break;
        case 'A':
          var cx = p[0],
            cy = p[1],
            rx = p[2],
            ry = p[3],
            theta = p[4],
            dTheta = p[5],
            psi = p[6],
            fs = p[7];
          var r = rx > ry ? rx : ry;
          var scaleX = rx > ry ? 1 : rx / ry;
          var scaleY = rx > ry ? ry / rx : 1;
          context.translate(cx, cy);
          context.rotate(psi);
          context.scale(scaleX, scaleY);
          context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
          context.scale(1 / scaleX, 1 / scaleY);
          context.rotate(-psi);
          context.translate(-cx, -cy);
          break;
        case 'z':
          isClosed = true;
          context.closePath();
          break;
      }
    }
    if (!isClosed && !this.hasFill()) {
      context.strokeShape(this);
    } else {
      context.fillStrokeShape(this);
    }
  }
  getSelfRect() {
    var points: any[] = [];
    this.dataArray.forEach(function (data) {
      if (data.command === 'A') {
        // Approximates by breaking curve into line segments
        var start = data.points[4];
        // 4 = theta
        var dTheta = data.points[5];
        // 5 = dTheta
        var end = data.points[4] + dTheta;
        var inc = Math.PI / 180.0;
        // 1 degree resolution
        if (Math.abs(start - end) < inc) {
          inc = Math.abs(start - end);
        }
        if (dTheta < 0) {
          // clockwise
          for (let t = start - inc; t > end; t -= inc) {
            const point = Path.getPointOnEllipticalArc(
              data.points[0],
              data.points[1],
              data.points[2],
              data.points[3],
              t,
              0
            );
            points.push(point.x, point.y);
          }
        } else {
          // counter-clockwise
          for (let t = start + inc; t < end; t += inc) {
            const point = Path.getPointOnEllipticalArc(
              data.points[0],
              data.points[1],
              data.points[2],
              data.points[3],
              t,
              0
            );
            points.push(point.x, point.y);
          }
        }
      } else if (data.command === 'C') {
        // Approximates by breaking curve into 100 line segments
        for (let t = 0.0; t <= 1; t += 0.01) {
          const point = Path.getPointOnCubicBezier(
            t,
            data.start.x,
            data.start.y,
            data.points[0],
            data.points[1],
            data.points[2],
            data.points[3],
            data.points[4],
            data.points[5]
          );
          points.push(point.x, point.y);
        }
      } else {
        // TODO: how can we calculate bezier curves better?
        points = points.concat(data.points);
      }
    });
    var minX = points[0];
    var maxX = points[0];
    var minY = points[1];
    var maxY = points[1];
    var x, y;
    for (var i = 0; i < points.length / 2; i++) {
      x = points[i * 2];
      y = points[i * 2 + 1];
      // skip bad values
      if (!isNaN(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (!isNaN(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  /**
   * Return length of the path.
   * @method
   * @name Konva.Path#getLength
   * @returns {Number} length
   * @example
   * var length = path.getLength();
   */
  getLength() {
    return this.pathLength;
  }
  /**
   * Get point on path at specific length of the path
   * @method
   * @name Konva.Path#getPointAtLength
   * @param {Number} length length
   * @returns {Object} point {x,y} point
   * @example
   * var point = path.getPointAtLength(10);
   */
  getPointAtLength(length) {
    return Path.getPointAtLengthOfDataArray(length, this.dataArray);
  }
  data: GetSet<string, this>;
  static getLineLength(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
  static getPathLength(dataArray: PathSegment[]) {
    let pathLength = 0;
    for (var i = 0; i < dataArray.length; ++i) {
      pathLength += dataArray[i].pathLength;
    }
    return pathLength;
  }
  static getPointAtLengthOfDataArray(length: number, dataArray) {
    var point,
      i = 0,
      ii = dataArray.length;
    if (!ii) {
      return null;
    }
    while (i < ii && length > dataArray[i].pathLength) {
      length -= dataArray[i].pathLength;
      ++i;
    }
    if (i === ii) {
      point = dataArray[i - 1].points.slice(-2);
      return {
        x: point[0],
        y: point[1],
      };
    }
    if (length < 0.01) {
      point = dataArray[i].points.slice(0, 2);
      return {
        x: point[0],
        y: point[1],
      };
    }
    var cp = dataArray[i];
    var p = cp.points;
    switch (cp.command) {
      case 'L':
        return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
      case 'C':
        return Path.getPointOnCubicBezier(
          t2length(length, Path.getPathLength(dataArray), (i) => {
            return getCubicArcLength(
              [cp.start.x, p[0], p[2], p[4]],
              [cp.start.y, p[1], p[3], p[5]],
              i
            );
          }),
          cp.start.x,
          cp.start.y,
          p[0],
          p[1],
          p[2],
          p[3],
          p[4],
          p[5]
        );
      case 'Q':
        return Path.getPointOnQuadraticBezier(
          t2length(length, Path.getPathLength(dataArray), (i) => {
            return getQuadraticArcLength(
              [cp.start.x, p[0], p[2]],
              [cp.start.y, p[1], p[3]],
              i
            );
          }),
          cp.start.x,
          cp.start.y,
          p[0],
          p[1],
          p[2],
          p[3]
        );
      case 'A':
        var cx = p[0],
          cy = p[1],
          rx = p[2],
          ry = p[3],
          theta = p[4],
          dTheta = p[5],
          psi = p[6];
        theta += (dTheta * length) / cp.pathLength;
        return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
    }
    return null;
  }
  static getPointOnLine(dist, P1x, P1y, P2x, P2y, fromX?, fromY?) {
    if (fromX === undefined) {
      fromX = P1x;
    }
    if (fromY === undefined) {
      fromY = P1y;
    }
    var m = (P2y - P1y) / (P2x - P1x + 0.00000001);
    var run = Math.sqrt((dist * dist) / (1 + m * m));
    if (P2x < P1x) {
      run *= -1;
    }
    var rise = m * run;
    var pt;
    if (P2x === P1x) {
      // vertical line
      pt = {
        x: fromX,
        y: fromY + rise,
      };
    } else if ((fromY - P1y) / (fromX - P1x + 0.00000001) === m) {
      pt = {
        x: fromX + run,
        y: fromY + rise,
      };
    } else {
      var ix, iy;
      var len = this.getLineLength(P1x, P1y, P2x, P2y);
      // if (len < 0.00000001) {
      //   return {
      //     x: P1x,
      //     y: P1y,
      //   };
      // }
      var u = (fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y);
      u = u / (len * len);
      ix = P1x + u * (P2x - P1x);
      iy = P1y + u * (P2y - P1y);
      var pRise = this.getLineLength(fromX, fromY, ix, iy);
      var pRun = Math.sqrt(dist * dist - pRise * pRise);
      run = Math.sqrt((pRun * pRun) / (1 + m * m));
      if (P2x < P1x) {
        run *= -1;
      }
      rise = m * run;
      pt = {
        x: ix + run,
        y: iy + rise,
      };
    }
    return pt;
  }
  static getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
    function CB1(t) {
      return t * t * t;
    }
    function CB2(t) {
      return 3 * t * t * (1 - t);
    }
    function CB3(t) {
      return 3 * t * (1 - t) * (1 - t);
    }
    function CB4(t) {
      return (1 - t) * (1 - t) * (1 - t);
    }
    var x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
    var y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
    return {
      x: x,
      y: y,
    };
  }
  static getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
    function QB1(t) {
      return t * t;
    }
    function QB2(t) {
      return 2 * t * (1 - t);
    }
    function QB3(t) {
      return (1 - t) * (1 - t);
    }
    var x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
    var y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
    return {
      x: x,
      y: y,
    };
  }
  static getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
    var cosPsi = Math.cos(psi),
      sinPsi = Math.sin(psi);
    var pt = {
      x: rx * Math.cos(theta),
      y: ry * Math.sin(theta),
    };
    return {
      x: cx + (pt.x * cosPsi - pt.y * sinPsi),
      y: cy + (pt.x * sinPsi + pt.y * cosPsi),
    };
  }
  /*
   * get parsed data array from the data
   *  string.  V, v, H, h, and l data are converted to
   *  L data for the purpose of high performance Path
   *  rendering
   */
  static parsePathData(data): PathSegment[] {
    // Path Data Segment must begin with a moveTo
    //m (x y)+  Relative moveTo (subsequent points are treated as lineTo)
    //M (x y)+  Absolute moveTo (subsequent points are treated as lineTo)
    //l (x y)+  Relative lineTo
    //L (x y)+  Absolute LineTo
    //h (x)+    Relative horizontal lineTo
    //H (x)+    Absolute horizontal lineTo
    //v (y)+    Relative vertical lineTo
    //V (y)+    Absolute vertical lineTo
    //z (closepath)
    //Z (closepath)
    //c (x1 y1 x2 y2 x y)+ Relative Bezier curve
    //C (x1 y1 x2 y2 x y)+ Absolute Bezier curve
    //q (x1 y1 x y)+       Relative Quadratic Bezier
    //Q (x1 y1 x y)+       Absolute Quadratic Bezier
    //t (x y)+    Shorthand/Smooth Relative Quadratic Bezier
    //T (x y)+    Shorthand/Smooth Absolute Quadratic Bezier
    //s (x2 y2 x y)+       Shorthand/Smooth Relative Bezier curve
    //S (x2 y2 x y)+       Shorthand/Smooth Absolute Bezier curve
    //a (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+     Relative Elliptical Arc
    //A (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+  Absolute Elliptical Arc
    // return early if data is not defined
    if (!data) {
      return [];
    }
    // command string
    var cs = data;
    // command chars
    var cc = [
      'm',
      'M',
      'l',
      'L',
      'v',
      'V',
      'h',
      'H',
      'z',
      'Z',
      'c',
      'C',
      'q',
      'Q',
      't',
      'T',
      's',
      'S',
      'a',
      'A',
    ];
    // convert white spaces to commas
    cs = cs.replace(new RegExp(' ', 'g'), ',');
    // create pipes so that we can split the data
    for (var n = 0; n < cc.length; n++) {
      cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
    }
    // create array
    var arr = cs.split('|');
    var ca: any[] = [];
    var coords: any[] = [];
    // init context point
    var cpx = 0;
    var cpy = 0;
    var re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
    var match;
    for (n = 1; n < arr.length; n++) {
      var str = arr[n];
      var c = str.charAt(0);
      str = str.slice(1);
      coords.length = 0;
      while ((match = re.exec(str))) {
        coords.push(match[0]);
      }
      // while ((match = re.exec(str))) {
      //   coords.push(match[0]);
      // }
      var p: any[] = [];
      for (var j = 0, jlen = coords.length; j < jlen; j++) {
        // extra case for merged flags
        if (coords[j] === '00') {
          p.push(0, 0);
          continue;
        }
        var parsed = parseFloat(coords[j]);
        if (!isNaN(parsed)) {
          p.push(parsed);
        } else {
          p.push(0);
        }
      }
      while (p.length > 0) {
        if (isNaN(p[0])) {
          // case for a trailing comma before next command
          break;
        }
        var cmd: any = null!;
        var points: any[] = [];
        var startX = cpx,
          startY = cpy;
        // Move var from within the switch to up here (jshint)
        var prevCmd, ctlPtx, ctlPty; // Ss, Tt
        var rx, ry, psi, fa, fs, x1, y1; // Aa
        // convert l, H, h, V, and v to L
        switch (c) {
          // Note: Keep the lineTo's above the moveTo's in this switch
          case 'l':
            cpx += p.shift();
            cpy += p.shift();
            cmd = 'L';
            points.push(cpx, cpy);
            break;
          case 'L':
            cpx = p.shift();
            cpy = p.shift();
            points.push(cpx, cpy);
            break;
          // Note: lineTo handlers need to be above this point
          case 'm':
            var dx = p.shift();
            var dy = p.shift();
            cpx += dx;
            cpy += dy;
            cmd = 'M';
            // After closing the path move the current position
            // to the the first point of the path (if any).
            if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
              for (var idx = ca.length - 2; idx >= 0; idx--) {
                if (ca[idx].command === 'M') {
                  cpx = ca[idx].points[0] + dx;
                  cpy = ca[idx].points[1] + dy;
                  break;
                }
              }
            }
            points.push(cpx, cpy);
            c = 'l';
            // subsequent points are treated as relative lineTo
            break;
          case 'M':
            cpx = p.shift();
            cpy = p.shift();
            cmd = 'M';
            points.push(cpx, cpy);
            c = 'L';
            // subsequent points are treated as absolute lineTo
            break;
          case 'h':
            cpx += p.shift();
            cmd = 'L';
            points.push(cpx, cpy);
            break;
          case 'H':
            cpx = p.shift();
            cmd = 'L';
            points.push(cpx, cpy);
            break;
          case 'v':
            cpy += p.shift();
            cmd = 'L';
            points.push(cpx, cpy);
            break;
          case 'V':
            cpy = p.shift();
            cmd = 'L';
            points.push(cpx, cpy);
            break;
          case 'C':
            points.push(p.shift(), p.shift(), p.shift(), p.shift());
            cpx = p.shift();
            cpy = p.shift();
            points.push(cpx, cpy);
            break;
          case 'c':
            points.push(
              cpx + p.shift(),
              cpy + p.shift(),
              cpx + p.shift(),
              cpy + p.shift()
            );
            cpx += p.shift();
            cpy += p.shift();
            cmd = 'C';
            points.push(cpx, cpy);
            break;
          case 'S':
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === 'C') {
              ctlPtx = cpx + (cpx - prevCmd.points[2]);
              ctlPty = cpy + (cpy - prevCmd.points[3]);
            }
            points.push(ctlPtx, ctlPty, p.shift(), p.shift());
            cpx = p.shift();
            cpy = p.shift();
            cmd = 'C';
            points.push(cpx, cpy);
            break;
          case 's':
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === 'C') {
              ctlPtx = cpx + (cpx - prevCmd.points[2]);
              ctlPty = cpy + (cpy - prevCmd.points[3]);
            }
            points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
            cpx += p.shift();
            cpy += p.shift();
            cmd = 'C';
            points.push(cpx, cpy);
            break;
          case 'Q':
            points.push(p.shift(), p.shift());
            cpx = p.shift();
            cpy = p.shift();
            points.push(cpx, cpy);
            break;
          case 'q':
            points.push(cpx + p.shift(), cpy + p.shift());
            cpx += p.shift();
            cpy += p.shift();
            cmd = 'Q';
            points.push(cpx, cpy);
            break;
          case 'T':
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === 'Q') {
              ctlPtx = cpx + (cpx - prevCmd.points[0]);
              ctlPty = cpy + (cpy - prevCmd.points[1]);
            }
            cpx = p.shift();
            cpy = p.shift();
            cmd = 'Q';
            points.push(ctlPtx, ctlPty, cpx, cpy);
            break;
          case 't':
            ctlPtx = cpx;
            ctlPty = cpy;
            prevCmd = ca[ca.length - 1];
            if (prevCmd.command === 'Q') {
              ctlPtx = cpx + (cpx - prevCmd.points[0]);
              ctlPty = cpy + (cpy - prevCmd.points[1]);
            }
            cpx += p.shift();
            cpy += p.shift();
            cmd = 'Q';
            points.push(ctlPtx, ctlPty, cpx, cpy);
            break;
          case 'A':
            rx = p.shift();
            ry = p.shift();
            psi = p.shift();
            fa = p.shift();
            fs = p.shift();
            x1 = cpx;
            y1 = cpy;
            cpx = p.shift();
            cpy = p.shift();
            cmd = 'A';
            points = this.convertEndpointToCenterParameterization(
              x1,
              y1,
              cpx,
              cpy,
              fa,
              fs,
              rx,
              ry,
              psi
            );
            break;
          case 'a':
            rx = p.shift();
            ry = p.shift();
            psi = p.shift();
            fa = p.shift();
            fs = p.shift();
            x1 = cpx;
            y1 = cpy;
            cpx += p.shift();
            cpy += p.shift();
            cmd = 'A';
            points = this.convertEndpointToCenterParameterization(
              x1,
              y1,
              cpx,
              cpy,
              fa,
              fs,
              rx,
              ry,
              psi
            );
            break;
        }
        ca.push({
          command: cmd || c,
          points: points,
          start: {
            x: startX,
            y: startY,
          },
          pathLength: this.calcLength(startX, startY, cmd || c, points),
        });
      }
      if (c === 'z' || c === 'Z') {
        ca.push({
          command: 'z',
          points: [],
          start: undefined,
          pathLength: 0,
        });
      }
    }
    return ca;
  }
  static calcLength(x, y, cmd, points) {
    var len, p1, p2, t;
    var path = Path;
    switch (cmd) {
      case 'L':
        return path.getLineLength(x, y, points[0], points[1]);
      case 'C':
        return getCubicArcLength(
          [x, points[0], points[2], points[4]],
          [y, points[1], points[3], points[5]],
          1
        );
      case 'Q':
        return getQuadraticArcLength(
          [x, points[0], points[2]],
          [y, points[1], points[3]],
          1
        );
      case 'A':
        // Approximates by breaking curve into line segments
        len = 0.0;
        var start = points[4];
        // 4 = theta
        var dTheta = points[5];
        // 5 = dTheta
        var end = points[4] + dTheta;
        var inc = Math.PI / 180.0;
        // 1 degree resolution
        if (Math.abs(start - end) < inc) {
          inc = Math.abs(start - end);
        }
        // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
        p1 = path.getPointOnEllipticalArc(
          points[0],
          points[1],
          points[2],
          points[3],
          start,
          0
        );
        if (dTheta < 0) {
          // clockwise
          for (t = start - inc; t > end; t -= inc) {
            p2 = path.getPointOnEllipticalArc(
              points[0],
              points[1],
              points[2],
              points[3],
              t,
              0
            );
            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
            p1 = p2;
          }
        } else {
          // counter-clockwise
          for (t = start + inc; t < end; t += inc) {
            p2 = path.getPointOnEllipticalArc(
              points[0],
              points[1],
              points[2],
              points[3],
              t,
              0
            );
            len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
            p1 = p2;
          }
        }
        p2 = path.getPointOnEllipticalArc(
          points[0],
          points[1],
          points[2],
          points[3],
          end,
          0
        );
        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
        return len;
    }
    return 0;
  }
  static convertEndpointToCenterParameterization(
    x1,
    y1,
    x2,
    y2,
    fa,
    fs,
    rx,
    ry,
    psiDeg
  ) {
    // Derived from: http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    var psi = psiDeg * (Math.PI / 180.0);
    var xp =
      (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
    var yp =
      (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 +
      (Math.cos(psi) * (y1 - y2)) / 2.0;
    var lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
    if (lambda > 1) {
      rx *= Math.sqrt(lambda);
      ry *= Math.sqrt(lambda);
    }
    var f = Math.sqrt(
      (rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
        (rx * rx * (yp * yp) + ry * ry * (xp * xp))
    );
    if (fa === fs) {
      f *= -1;
    }
    if (isNaN(f)) {
      f = 0;
    }
    var cxp = (f * rx * yp) / ry;
    var cyp = (f * -ry * xp) / rx;
    var cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
    var cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
    var vMag = function (v) {
      return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    };
    var vRatio = function (u, v) {
      return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
    };
    var vAngle = function (u, v) {
      return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
    };
    var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
    var u = [(xp - cxp) / rx, (yp - cyp) / ry];
    var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
    var dTheta = vAngle(u, v);
    if (vRatio(u, v) <= -1) {
      dTheta = Math.PI;
    }
    if (vRatio(u, v) >= 1) {
      dTheta = 0;
    }
    if (fs === 0 && dTheta > 0) {
      dTheta = dTheta - 2 * Math.PI;
    }
    if (fs === 1 && dTheta < 0) {
      dTheta = dTheta + 2 * Math.PI;
    }
    return [cx, cy, rx, ry, theta, dTheta, psi, fs];
  }
}
Path.prototype.className = 'Path';
Path.prototype._attrsAffectingSize = ['data'];
_registerNode(Path);
/**
 * get/set SVG path data string.  This method
 *  also automatically parses the data string
 *  into a data array.  Currently supported SVG data:
 *  M, m, L, l, H, h, V, v, Q, q, T, t, C, c, S, s, A, a, Z, z
 * @name Konva.Path#data
 * @method
 * @param {String} data svg path string
 * @returns {String}
 * @example
 * // get data
 * var data = path.data();
 *
 * // set data
 * path.data('M200,100h100v50z');
 */
Factory.addGetterSetter(Path, 'data');
