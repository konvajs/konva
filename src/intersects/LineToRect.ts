
export const LineToRect = function(line, rect) {
  // Destructure line
  var p = line.points()
  var x1 = p[0];
  var y1 = p[1];
  var x2 = p[2];
  var y2 = p[3];

  // Destrcuture rect
  var rx1 = rect.x();
  var ry1 = rect.y();
  var rx2 = rect.getRight();
  var ry2 = rect.getBottom();

  // Check if the start or the end of the line is inside of the rect
  if ((x1 >= rx1 && x1 <= rx2 && y1 >= ry1 && y1 <= ry2) || (x2 >= rx1 && x2 <= rx2 && y2 >= ry1 && y2 <= ry2)) {
    return true;
  }

  if (x1 < rx1 && x2 >= rx1) {
    //  Left edge
    var t = y1 + (y2 - y1) * (rx1 - x1) / (x2 - x1);

    if (t > ry1 && t <= ry2) {
      return true;
    }
  } else if (x1 > rx2 && x2 <= rx2) {
    //  Right edge
    var t = y1 + (y2 - y1) * (rx2 - x1) / (x2 - x1);

    if (t >= ry1 && t <= ry2) {
      return true;
    }
  }

  if (y1 < ry1 && y2 >= ry1) {
    //  Top edge
    t = x1 + (x2 - x1) * (ry1 - y1) / (y2 - y1);

    if (t >= rx1 && t <= rx2) {
      return true;
    }
  } else if (y1 > ry2 && y2 <= ry2) {
    //  Bottom edge
    t = x1 + (x2 - x1) * (ry2 - y1) / (y2 - y1);

    if (t >= rx1 && t <= rx2) {
      return true;
    }
  }

  return false;
}
