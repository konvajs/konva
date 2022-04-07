import { Path } from './Path';

/**
    * Calculate the cos of an angle, avoiding returning floats for known results
    * @static
    * @memberOf fabric.util
    * @param {Number} angle the angle in radians or in degree
    * @return {Number}
    */
function cos(angle) {
  if (angle === 0) { return 1; }
  if (angle < 0) {
    angle = -angle;
  }
  var angleSlice = angle / (Math.PI / 2);
  switch (angleSlice) {
    case 1: case 3: return 0;
    case 2: return -1;
  }
  return Math.cos(angle);
}

/**
 * Calculate the sin of an angle, avoiding returning floats for known results
 * @static
 * @memberOf fabric.util
 * @param {Number} angle the angle in radians or in degree
 * @return {Number}
 */
function sin(angle) {
  if (angle === 0) { return 0; }
  var angleSlice = angle / (Math.PI / 2), sign = 1;
  if (angle < 0) {
    sign = -1;
  }
  switch (angleSlice) {
    case 1: return sign;
    case 2: return 0;
    case 3: return -sign;
  }
  return Math.sin(angle);
}


function PointLerp(p1: any, p2: any, t = 0.5) {
  t = Math.max(Math.min(1, t), 0);
  return { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
}


function segmentToBezier(th2, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY) {
  var costh2 = cos(th2),
    sinth2 = sin(th2),
    costh3 = cos(th3),
    sinth3 = sin(th3),
    toX = cosTh * rx * costh3 - sinTh * ry * sinth3 + cx1,
    toY = sinTh * rx * costh3 + cosTh * ry * sinth3 + cy1,
    cp1X = fromX + mT * (-cosTh * rx * sinth2 - sinTh * ry * costh2),
    cp1Y = fromY + mT * (-sinTh * rx * sinth2 + cosTh * ry * costh2),
    cp2X = toX + mT * (cosTh * rx * sinth3 + sinTh * ry * costh3),
    cp2Y = toY + mT * (sinTh * rx * sinth3 - cosTh * ry * costh3);

  return ['C',
    cp1X, cp1Y,
    cp2X, cp2Y,
    toX, toY
  ];
}

/* Adapted from http://dxr.mozilla.org/mozilla-central/source/content/svg/content/src/nsSVGPathDataParser.cpp
 * by Andrea Bogazzi code is under MPL. if you don't have a copy of the license you can take it here
 * http://mozilla.org/MPL/2.0/
 */
function arcToSegments(toX, toY, rx, ry, large, sweep, rotateX) {
  var PI = Math.PI, th = rotateX * PI / 180,
    sinTh = sin(th),
    cosTh = cos(th),
    fromX = 0, fromY = 0;

  rx = Math.abs(rx);
  ry = Math.abs(ry);

  var px = -cosTh * toX * 0.5 - sinTh * toY * 0.5,
    py = -cosTh * toY * 0.5 + sinTh * toX * 0.5,
    rx2 = rx * rx, ry2 = ry * ry, py2 = py * py, px2 = px * px,
    pl = rx2 * ry2 - rx2 * py2 - ry2 * px2,
    root = 0;

  if (pl < 0) {
    var s = Math.sqrt(1 - pl / (rx2 * ry2));
    rx *= s;
    ry *= s;
  }
  else {
    root = (large === sweep ? -1.0 : 1.0) *
      Math.sqrt(pl / (rx2 * py2 + ry2 * px2));
  }

  var cx = root * rx * py / ry,
    cy = -root * ry * px / rx,
    cx1 = cosTh * cx - sinTh * cy + toX * 0.5,
    cy1 = sinTh * cx + cosTh * cy + toY * 0.5,
    mTheta = calcVectorAngle(1, 0, (px - cx) / rx, (py - cy) / ry),
    dtheta = calcVectorAngle((px - cx) / rx, (py - cy) / ry, (-px - cx) / rx, (-py - cy) / ry);

  if (sweep === 0 && dtheta > 0) {
    dtheta -= 2 * PI;
  }
  else if (sweep === 1 && dtheta < 0) {
    dtheta += 2 * PI;
  }

  // Convert into cubic bezier segments <= 90deg
  var segments = Math.ceil(Math.abs(dtheta / PI * 2)),
    result = [], mDelta = dtheta / segments,
    mT = 8 / 3 * Math.sin(mDelta / 4) * Math.sin(mDelta / 4) / Math.sin(mDelta / 2),
    th3 = mTheta + mDelta;

  for (var i = 0; i < segments; i++) {
    result[i] = segmentToBezier(mTheta, th3, cosTh, sinTh, rx, ry, cx1, cy1, mT, fromX, fromY);
    fromX = result[i][5];
    fromY = result[i][6];
    mTheta = th3;
    th3 += mDelta;
  }
  return result;
}

/*
 * Private
 */
function calcVectorAngle(ux, uy, vx, vy) {
  var ta = Math.atan2(uy, ux),
    tb = Math.atan2(vy, vx);
  if (tb >= ta)
    return tb - ta;
  else
    return 2 * Math.PI - (ta - tb);
}


/**
 * Converts arc to a bunch of bezier curves
 * @param {Number} fx starting point x
 * @param {Number} fy starting point y
 * @param {Array} coords Arc command
 */
function fromArcToBeziers(fx, fy, coords) {
  var rx = coords[1],
    ry = coords[2],
    rot = coords[3],
    large = coords[4],
    sweep = coords[5],
    tx = coords[6],
    ty = coords[7],
    segsNorm = arcToSegments(tx - fx, ty - fy, rx, ry, large, sweep, rot);

  for (var i = 0, len = segsNorm.length; i < len; i++) {
    segsNorm[i][1] += fx;
    segsNorm[i][2] += fy;
    segsNorm[i][3] += fx;
    segsNorm[i][4] += fy;
    segsNorm[i][5] += fx;
    segsNorm[i][6] += fy;
  }
  return segsNorm;
};


function getPointOnCubicBezierIterator(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
  return function (pct) {
    return Path.getPointOnCubicBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y)
  };
}

function getTangentCubicIterator(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
  return function (pct) {
    var invT = 1 - pct,
      tangentX = (3 * invT * invT * (p2x - p1x)) + (6 * invT * pct * (p3x - p2x)) +
        (3 * pct * pct * (p4x - p3x)),
      tangentY = (3 * invT * invT * (p2y - p1y)) + (6 * invT * pct * (p3y - p2y)) +
        (3 * pct * pct * (p4y - p3y));
    return Math.atan2(tangentY, tangentX);
  };
}



function getPointOnQuadraticBezierIterator(p1x, p1y, p2x, p2y, p3x, p3y) {
  return function (pct) {
    return Path.getPointOnQuadraticBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y)
  };
}

function getTangentQuadraticIterator(p1x, p1y, p2x, p2y, p3x, p3y) {
  return function (pct) {
    var invT = 1 - pct,
      tangentX = (2 * invT * (p2x - p1x)) + (2 * pct * (p3x - p2x)),
      tangentY = (2 * invT * (p2y - p1y)) + (2 * pct * (p3y - p2y));
    return Math.atan2(tangentY, tangentX);
  };
}


// this will run over a path segment ( a cubic or quadratic segment) and approximate it
// with 100 segemnts. This will good enough to calculate the length of the curve
function pathIterator(iterator, x1, y1) {
  var tempP = { x: x1, y: y1 }, p, tmpLen = 0, perc;
  for (perc = 1; perc <= 100; perc += 1) {
    p = iterator(perc / 100);
    tmpLen += Path.getLineLength(tempP.x, tempP.y, p.x, p.y);
    tempP = p;
  }
  return tmpLen;
}

/**
 * Given a pathInfo, and a distance in pixels, find the percentage from 0 to 1
 * that correspond to that pixels run over the path.
 * The percentage will be then used to find the correct point on the canvas for the path.
 * @param {Array} segInfo fabricJS collection of information on a parsed path
 * @param {Number} distance from starting point, in pixels.
 * @return {Object} info object with x and y ( the point on canvas ) and angle, the tangent on that point;
 */
function findPercentageForDistance(segInfo, distance) {
  var perc = 0, tmpLen = 0, iterator = segInfo.iterator, tempP = { x: segInfo.x, y: segInfo.y },
    p, nextLen, nextStep = 0.01, angleFinder = segInfo.angleFinder, lastPerc;
  // nextStep > 0.0001 covers 0.00015625 that 1/64th of 1/100
  // the path
  while (tmpLen < distance && nextStep > 0.0001) {
    p = iterator(perc);
    lastPerc = perc;
    nextLen = Path.getLineLength(tempP.x, tempP.y, p.x, p.y);
    // compare tmpLen each cycle with distance, decide next perc to test.
    if ((nextLen + tmpLen) > distance) {
      // we discard this step and we make smaller steps.
      perc -= nextStep;
      nextStep /= 2;
    }
    else {
      tempP = p;
      perc += nextStep;
      tmpLen += nextLen;
    }
  }
  p.angle = angleFinder(lastPerc);
  return p;
}

/**
    *
    * @param {string} pathString
    * @return {(string|number)[][]} An array of SVG path commands
    * @example <caption>Usage</caption>
    * parsePath('M 3 4 Q 3 5 2 1 4 0 Q 9 12 2 1 4 0') === [
    *   ['M', 3, 4],
    *   ['Q', 3, 5, 2, 1, 4, 0],
    *   ['Q', 9, 12, 2, 1, 4, 0],
    * ];
    *
    */
function parsePath(pathString) {
  var commaWsp = '(?:\\s+,?\\s*|,\\s*)';
  var result = [],
    coords = [],
    currentPath,
    parsed,
    re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:[eE][-+]?\d+)?)/ig,
    rNumber = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?\\s*',
    rNumberCommaWsp = '(' + rNumber + ')' + commaWsp,
    rFlagCommaWsp = '([01])' + commaWsp + '?',
    rArcSeq = rNumberCommaWsp + '?' + rNumberCommaWsp + '?' + rNumberCommaWsp + rFlagCommaWsp + rFlagCommaWsp +
      rNumberCommaWsp + '?(' + rNumber + ')',
    regArcArgumentSequence = new RegExp(rArcSeq, 'g'),
    match,
    coordsStr,
    // one of commands (m,M,l,L,q,Q,c,C,etc.) followed by non-command characters (i.e. command values)
    path;
  if (!pathString || !pathString.match) {
    return result;
  }
  path = pathString.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);

  var commandLengths = {
    m: 2,
    l: 2,
    h: 1,
    v: 1,
    c: 6,
    s: 4,
    q: 4,
    t: 2,
    a: 7
  }
  var repeatedCommands = {
    m: 'l',
    M: 'L'
  };
  for (var i = 0, coordsParsed, len = path.length; i < len; i++) {
    currentPath = path[i];

    coordsStr = currentPath.slice(1).trim();
    coords.length = 0;

    var command = currentPath.charAt(0);
    coordsParsed = [command];

    if (command.toLowerCase() === 'a') {
      // arcs have special flags that apparently don't require spaces so handle special
      for (var args; (args = regArcArgumentSequence.exec(coordsStr));) {
        for (var j = 1; j < args.length; j++) {
          coords.push(args[j]);
        }
      }
    }
    else {
      while ((match = re.exec(coordsStr))) {
        coords.push(match[0]);
      }
    }

    for (var j = 0, jlen = coords.length; j < jlen; j++) {
      parsed = parseFloat(coords[j]);
      if (!isNaN(parsed)) {
        coordsParsed.push(parsed);
      }
    }

    var commandLength = commandLengths[command.toLowerCase()],
      repeatedCommand = repeatedCommands[command] || command;

    if (coordsParsed.length - 1 > commandLength) {
      for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
        result.push([command].concat(coordsParsed.slice(k, k + commandLength)));
        command = repeatedCommand;
      }
    }
    else {
      result.push(coordsParsed);
    }
  }

  return result;
}

export const PathUtil = {
  /**
* This function take a parsed SVG path and make it simpler for fabricJS logic.
* simplification consist of: only UPPERCASE absolute commands ( relative converted to absolute )
* S converted in C, T converted in Q, A converted in C.
* @param {Array} path the array of commands of a parsed svg path for fabric.Path
* @return {Array} the simplified array of commands of a parsed svg path for fabric.Path
*/
  makePathSimpler(s: string) {
    var path = parsePath(s)
    // x and y represent the last point of the path. the previous command point.
    // we add them to each relative command to make it an absolute comment.
    // we also swap the v V h H with L, because are easier to transform.
    var x = 0, y = 0, len = path.length,
      // x1 and y1 represent the last point of the subpath. the subpath is started with
      // m or M command. When a z or Z command is drawn, x and y need to be resetted to
      // the last x1 and y1.
      x1 = 0, y1 = 0, current, i, converted,
      // previous will host the letter of the previous command, to handle S and T.
      // controlX and controlY will host the previous reflected control point
      destinationPath = [], previous, controlX, controlY;
    for (i = 0; i < len; ++i) {
      converted = false;
      current = path[i].slice(0);
      switch (current[0]) { // first letter
        case 'l': // lineto, relative
          current[0] = 'L';
          current[1] += x;
          current[2] += y;
        // falls through
        case 'L':
          x = current[1];
          y = current[2];
          break;
        case 'h': // horizontal lineto, relative
          current[1] += x;
        // falls through
        case 'H':
          current[0] = 'L';
          current[2] = y;
          x = current[1];
          break;
        case 'v': // vertical lineto, relative
          current[1] += y;
        // falls through
        case 'V':
          current[0] = 'L';
          y = current[1];
          current[1] = x;
          current[2] = y;
          break;
        case 'm': // moveTo, relative
          current[0] = 'M';
          current[1] += x;
          current[2] += y;
        // falls through
        case 'M':
          x = current[1];
          y = current[2];
          x1 = current[1];
          y1 = current[2];
          break;
        case 'c': // bezierCurveTo, relative
          current[0] = 'C';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
          current[5] += x;
          current[6] += y;
        // falls through
        case 'C':
          controlX = current[3];
          controlY = current[4];
          x = current[5];
          y = current[6];
          break;
        case 's': // shorthand cubic bezierCurveTo, relative
          current[0] = 'S';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
        // falls through
        case 'S':
          // would be sScC but since we are swapping sSc for C, we check just that.
          if (previous === 'C') {
            // calculate reflection of previous control points
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }
          else {
            // If there is no previous command or if the previous command was not a C, c, S, or s,
            // the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          x = current[3];
          y = current[4];
          current[0] = 'C';
          current[5] = current[3];
          current[6] = current[4];
          current[3] = current[1];
          current[4] = current[2];
          current[1] = controlX;
          current[2] = controlY;
          // current[3] and current[4] are NOW the second control point.
          // we keep it for the next reflection.
          controlX = current[3];
          controlY = current[4];
          break;
        case 'q': // quadraticCurveTo, relative
          current[0] = 'Q';
          current[1] += x;
          current[2] += y;
          current[3] += x;
          current[4] += y;
        // falls through
        case 'Q':
          controlX = current[1];
          controlY = current[2];
          x = current[3];
          y = current[4];
          break;
        case 't': // shorthand quadraticCurveTo, relative
          current[0] = 'T';
          current[1] += x;
          current[2] += y;
        // falls through
        case 'T':
          if (previous === 'Q') {
            // calculate reflection of previous control point
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }
          else {
            // If there is no previous command or if the previous command was not a Q, q, T or t,
            // assume the control point is coincident with the current point
            controlX = x;
            controlY = y;
          }
          current[0] = 'Q';
          x = current[1];
          y = current[2];
          current[1] = controlX;
          current[2] = controlY;
          current[3] = x;
          current[4] = y;
          break;
        case 'a':
          current[0] = 'A';
          current[6] += x;
          current[7] += y;
        // falls through
        case 'A':
          converted = true;
          destinationPath = destinationPath.concat(fromArcToBeziers(x, y, current));
          x = current[6];
          y = current[7];
          break;
        case 'z':
        case 'Z':
          x = x1;
          y = y1;
          break;
        default:
      }
      if (!converted) {
        destinationPath.push(current);
      }
      previous = current[0];
    }
    return destinationPath;
  },
  /**
* Run over a parsed and simplifed path and extrac some informations.
* informations are length of each command and starting point
* @param {Array} path fabricJS parsed path commands
* @return {Array} path commands informations
*/
  getPathSegmentsInfo(path) {
    var totalLength = 0, len = path.length, current,
      //x2 and y2 are the coords of segment start
      //x1 and y1 are the coords of the current point
      x1 = 0, y1 = 0, x2 = 0, y2 = 0, info = [], iterator, tempInfo, angleFinder;
    for (var i = 0; i < len; i++) {
      current = path[i];
      tempInfo = {
        x: x1,
        y: y1,
        command: current[0],
      };
      switch (current[0]) { //first letter
        case 'M':
          tempInfo.length = 0;
          x2 = x1 = current[1];
          y2 = y1 = current[2];
          break;
        case 'L':
          tempInfo.length = Path.getLineLength(x1, y1, current[1], current[2]);
          x1 = current[1];
          y1 = current[2];
          break;
        case 'C':
          iterator = getPointOnCubicBezierIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          );
          angleFinder = getTangentCubicIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4],
            current[5],
            current[6]
          );
          tempInfo.iterator = iterator;
          tempInfo.angleFinder = angleFinder;
          tempInfo.length = pathIterator(iterator, x1, y1);
          x1 = current[5];
          y1 = current[6];
          break;
        case 'Q':
          iterator = getPointOnQuadraticBezierIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4]
          );
          angleFinder = getTangentQuadraticIterator(
            x1,
            y1,
            current[1],
            current[2],
            current[3],
            current[4]
          );
          tempInfo.iterator = iterator;
          tempInfo.angleFinder = angleFinder;
          tempInfo.length = pathIterator(iterator, x1, y1);
          x1 = current[3];
          y1 = current[4];
          break;
        case 'Z':
        case 'z':
          // we add those in order to ease calculations later
          tempInfo.destX = x2;
          tempInfo.destY = y2;
          tempInfo.length = Path.getLineLength(x1, y1, x2, y2);
          x1 = x2;
          y1 = y2;
          break;
      }
      totalLength += tempInfo.length;
      info.push(tempInfo);
    }
    info.push({ length: totalLength, x: x1, y: y1 });
    return info;
  },
  getPointOnPath(path, distance, infos) {
    if (!infos) {
      infos = this.getPathSegmentsInfo(path);
    }
    var i = 0;
    while ((distance - infos[i].length > 0) && i < (infos.length - 2)) {
      distance -= infos[i].length;
      i++;
    }
    // var distance = infos[infos.length - 1] * perc;
    var segInfo = infos[i], segPercent = distance / segInfo.length,
      command = segInfo.command, segment = path[i], info;

    switch (command) {
      case 'M':
        return { x: segInfo.x, y: segInfo.y, angle: 0 };
      case 'Z':
      case 'z':
        info = PointLerp({ x: segInfo.x, y: segInfo.y }, { x: segInfo.destX, y: segInfo.destY }, segPercent);
        info.angle = Math.atan2(segInfo.destY - segInfo.y, segInfo.destX - segInfo.x);
        return info;
      case 'L':
        info = PointLerp({ x: segInfo.x, y: segInfo.y }, { x: segment[1], y: segment[2] }, segPercent);
        info.angle = Math.atan2(segment[2] - segInfo.y, segment[1] - segInfo.x);
        return info;
      case 'C':
        return findPercentageForDistance(segInfo, distance);
      case 'Q':
        return findPercentageForDistance(segInfo, distance);
    }
  }
}