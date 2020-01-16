import { Line } from '../shapes/Line'
import { LineToRect } from './LineToRect'
import { GetLineToLine } from './GetLineToLine'

export const GetLineToRect = function(line, rect) {
  // Check the line and rect intersect

  if (LineToRect(line, rect)) {
    var results = [
      GetLineToLine(new Line({
        points: rect.getTopLine()
      }), line),
      GetLineToLine(new Line({
        points: rect.getRightLine()
      }), line),
      GetLineToLine(new Line({
        points: rect.getBottomLine()
      }), line),
      GetLineToLine(new Line({
        points: rect.getLeftLine()
      }), line),
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
