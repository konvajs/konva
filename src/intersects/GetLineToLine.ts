
export const GetLineToLine = function(a, b) {

  var aPoints = a.points();
  var x1 = aPoints[0];
  var y1 = aPoints[1];
  var x2 = aPoints[2];
  var y2 = aPoints[3];

  var bPoints = b.points();
  var x3 = bPoints[0];
  var y3 = bPoints[1];
  var x4 = bPoints[2];
  var y4 = bPoints[3];

  var numA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  var numB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
  var deNom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  //  Make sure there is not a division by zero - this also indicates that the lines are parallel.
  //  If numA and numB were both equal to zero the lines would be on top of each other (coincidental).
  //  This check is not done because it is not necessary for this implementation (the parallel check accounts for this).

  if (deNom === 0) {
    return false;
  }

  //  Calculate the intermediate fractional point that the lines potentially intersect.

  var uA = numA / deNom;
  var uB = numB / deNom;

  //  The fractional point will be between 0 and 1 inclusive if the lines intersect.
  //  If the fractional calculation is larger than 1 or smaller than 0 the lines would need to be longer to intersect.

  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return [x1 + (uA * (x2 - x1)), y1 + (uA * (y2 - y1))]
  }

  return false;
}
