import { Line } from '../shapes/Line'

const getRight = function(rect) {
  return rect.x + rect.width
}

const getBottom = function(rect) {
  return rect.y + rect.height
}

const getLeftLine = function(rect) {
  var r = rect.getClientRect()
  return [r.x, r.y, r.x, getBottom(r)]
}

const getRightLine = function(rect) {
  var r = rect.getClientRect()
  return [getRight(r), r.y, getRight(r), getBottom(r)]
}

const getTopLine = function(rect) {
  var r = rect.getClientRect()
  return [r.x, r.y, getRight(r), r.y]
}

const getBottomLine = function(rect) {
  var r = rect.getClientRect()
  console.log(r.x)
  return [r.x, getBottom(r), getRight(r), getBottom(r)]
}

const RectangleToRectangle = function(rectA, rectB) {
  var a = rectA.getClientRect();
  var b = rectB.getClientRect();
  if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) {
    return false;
  }
  // debugger;
  return !(getRight(a) < b.x || getBottom(a) < b.y || a.x > getRight(b) || a.y > getBottom(b));
}

export const RectToRect = function(rectA, rectB) {
  // Check if the rectangles intersect before calculating
  if (RectangleToRectangle(rectA, rectB)) {
    var top = getTopLine(rectA);
    var right = getRightLine(rectA);
    var left = getLeftLine(rectA);
    var bottom = getBottomLine(rectA);
    return bottom
  }
}
