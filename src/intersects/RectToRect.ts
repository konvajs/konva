
export const RectToRect = function(a, b) {
  if (a.width() <= 0 || a.height() <= 0 || b.width() <= 0 || b.height() <= 0) {
    return false;
  }
  return !(a.getRight() < b.x() || a.getBottom() < b.y() || a.x() > b.getRight() || a.y() > b.getBottom());
}
