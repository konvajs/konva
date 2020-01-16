import { Line } from '../shapes/Line'
import { RectToRect } from './RectToRect'
import { GetLineToRect } from './GetLineToRect'

export const GetRectToRect = function(a, b) {
  // Check if the rectangles intersect before calculating
  if (RectToRect(a, b)) {
    var results = [
      GetLineToRect(new Line({
        points: a.getTopLine()
      }), b),
      GetLineToRect(new Line({
        points: a.getRightLine()
      }), b),
      GetLineToRect(new Line({
        points: a.getBottomLine()
      }), b),
      GetLineToRect(new Line({
        points: a.getLeftLine()
      }), b)
    ]
    var out = []
    // Only return non falsey results
    for (var i = 0; i < results.length; i++) {
      if (results[i]) {
        out = out.concat(results[i])
      }
    }
    return out
  }
}
