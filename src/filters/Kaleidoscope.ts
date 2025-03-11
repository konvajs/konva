import { Factory } from '../Factory';
import { Filter, Node } from '../Node';
import { Util } from '../Util';
import { getNumberValidator } from '../Validators';

/*
 * ToPolar Filter. Converts image data to polar coordinates. Performs
 *  w*h*4 pixel reads and w*h pixel writes. The r axis is placed along
 *  what would be the y axis and the theta axis along the x axis.
 * @function
 * @author ippo615
 * @memberof Konva.Filters
 * @param {ImageData} src, the source image data (what will be transformed)
 * @param {ImageData} dst, the destination image data (where it will be saved)
 * @param {Object} opt
 * @param {Number} [opt.polarCenterX] horizontal location for the center of the circle,
 *  default is in the middle
 * @param {Number} [opt.polarCenterY] vertical location for the center of the circle,
 *  default is in the middle
 */

const ToPolar = function (src, dst, opt) {
  const srcPixels = src.data,
    dstPixels = dst.data,
    xSize = src.width,
    ySize = src.height,
    xMid = opt.polarCenterX || xSize / 2,
    yMid = opt.polarCenterY || ySize / 2;

  // Find the largest radius
  let rMax = Math.sqrt(xMid * xMid + yMid * yMid);
  let x = xSize - xMid;
  let y = ySize - yMid;
  const rad = Math.sqrt(x * x + y * y);
  rMax = rad > rMax ? rad : rMax;

  // We'll be uisng y as the radius, and x as the angle (theta=t)
  const rSize = ySize,
    tSize = xSize;

  // We want to cover all angles (0-360) and we need to convert to
  // radians (*PI/180)
  const conversion = ((360 / tSize) * Math.PI) / 180;

  // var x1, x2, x1i, x2i, y1, y2, y1i, y2i, scale;

  for (let theta = 0; theta < tSize; theta += 1) {
    const sin = Math.sin(theta * conversion);
    const cos = Math.cos(theta * conversion);
    for (let radius = 0; radius < rSize; radius += 1) {
      x = Math.floor(xMid + ((rMax * radius) / rSize) * cos);
      y = Math.floor(yMid + ((rMax * radius) / rSize) * sin);
      let i = (y * xSize + x) * 4;
      const r = srcPixels[i + 0];
      const g = srcPixels[i + 1];
      const b = srcPixels[i + 2];
      const a = srcPixels[i + 3];

      // Store it
      //i = (theta * xSize  +  radius) * 4;
      i = (theta + radius * xSize) * 4;
      dstPixels[i + 0] = r;
      dstPixels[i + 1] = g;
      dstPixels[i + 2] = b;
      dstPixels[i + 3] = a;
    }
  }
};

/*
 * FromPolar Filter. Converts image data from polar coordinates back to rectangular.
 *  Performs w*h*4 pixel reads and w*h pixel writes.
 * @function
 * @author ippo615
 * @memberof Konva.Filters
 * @param {ImageData} src, the source image data (what will be transformed)
 * @param {ImageData} dst, the destination image data (where it will be saved)
 * @param {Object} opt
 * @param {Number} [opt.polarCenterX] horizontal location for the center of the circle,
 *  default is in the middle
 * @param {Number} [opt.polarCenterY] vertical location for the center of the circle,
 *  default is in the middle
 * @param {Number} [opt.polarRotation] amount to rotate the image counterclockwis,
 *  0 is no rotation, 360 degrees is a full rotation
 */

const FromPolar = function (src, dst, opt) {
  const srcPixels = src.data,
    dstPixels = dst.data,
    xSize = src.width,
    ySize = src.height,
    xMid = opt.polarCenterX || xSize / 2,
    yMid = opt.polarCenterY || ySize / 2;

  // Find the largest radius
  let rMax = Math.sqrt(xMid * xMid + yMid * yMid);
  let x = xSize - xMid;
  let y = ySize - yMid;
  const rad = Math.sqrt(x * x + y * y);
  rMax = rad > rMax ? rad : rMax;

  // We'll be uisng x as the radius, and y as the angle (theta=t)
  const rSize = ySize,
    tSize = xSize,
    phaseShift = opt.polarRotation || 0;

  // We need to convert to degrees and we need to make sure
  // it's between (0-360)
  // var conversion = tSize/360*180/Math.PI;
  //var conversion = tSize/360*180/Math.PI;

  let x1, y1;

  for (x = 0; x < xSize; x += 1) {
    for (y = 0; y < ySize; y += 1) {
      const dx = x - xMid;
      const dy = y - yMid;
      const radius = (Math.sqrt(dx * dx + dy * dy) * rSize) / rMax;
      let theta = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + phaseShift) % 360;
      theta = (theta * tSize) / 360;
      x1 = Math.floor(theta);
      y1 = Math.floor(radius);
      let i = (y1 * xSize + x1) * 4;
      const r = srcPixels[i + 0];
      const g = srcPixels[i + 1];
      const b = srcPixels[i + 2];
      const a = srcPixels[i + 3];

      // Store it
      i = (y * xSize + x) * 4;
      dstPixels[i + 0] = r;
      dstPixels[i + 1] = g;
      dstPixels[i + 2] = b;
      dstPixels[i + 3] = a;
    }
  }
};

//Konva.Filters.ToPolar = Util._FilterWrapDoubleBuffer(ToPolar);
//Konva.Filters.FromPolar = Util._FilterWrapDoubleBuffer(FromPolar);

// create a temporary canvas for working - shared between multiple calls

/*
 * Kaleidoscope Filter.
 * @function
 * @name Kaleidoscope
 * @author ippo615
 * @memberof Konva.Filters
 * @example
 * node.cache();
 * node.filters([Konva.Filters.Kaleidoscope]);
 * node.kaleidoscopePower(3);
 * node.kaleidoscopeAngle(45);
 */
export const Kaleidoscope: Filter = function (imageData) {
  const xSize = imageData.width,
    ySize = imageData.height;

  let x, y, xoff, i, r, g, b, a, srcPos, dstPos;
  let power = Math.round(this.kaleidoscopePower());
  const angle = Math.round(this.kaleidoscopeAngle());
  const offset = Math.floor((xSize * (angle % 360)) / 360);

  if (power < 1) {
    return;
  }

  // Work with our shared buffer canvas
  const tempCanvas = Util.createCanvasElement();
  tempCanvas.width = xSize;
  tempCanvas.height = ySize;
  const scratchData = tempCanvas
    .getContext('2d')!
    .getImageData(0, 0, xSize, ySize);
  Util.releaseCanvas(tempCanvas);
  // Convert thhe original to polar coordinates
  ToPolar(imageData, scratchData, {
    polarCenterX: xSize / 2,
    polarCenterY: ySize / 2,
  });

  // Determine how big each section will be, if it's too small
  // make it bigger
  let minSectionSize = xSize / Math.pow(2, power);
  while (minSectionSize <= 8) {
    minSectionSize = minSectionSize * 2;
    power -= 1;
  }
  minSectionSize = Math.ceil(minSectionSize);
  let sectionSize = minSectionSize;

  // Copy the offset region to 0
  // Depending on the size of filter and location of the offset we may need
  // to copy the section backwards to prevent it from rewriting itself
  let xStart = 0,
    xEnd = sectionSize,
    xDelta = 1;
  if (offset + minSectionSize > xSize) {
    xStart = sectionSize;
    xEnd = 0;
    xDelta = -1;
  }
  for (y = 0; y < ySize; y += 1) {
    for (x = xStart; x !== xEnd; x += xDelta) {
      xoff = Math.round(x + offset) % xSize;
      srcPos = (xSize * y + xoff) * 4;
      r = scratchData.data[srcPos + 0];
      g = scratchData.data[srcPos + 1];
      b = scratchData.data[srcPos + 2];
      a = scratchData.data[srcPos + 3];
      dstPos = (xSize * y + x) * 4;
      scratchData.data[dstPos + 0] = r;
      scratchData.data[dstPos + 1] = g;
      scratchData.data[dstPos + 2] = b;
      scratchData.data[dstPos + 3] = a;
    }
  }

  // Perform the actual effect
  for (y = 0; y < ySize; y += 1) {
    sectionSize = Math.floor(minSectionSize);
    for (i = 0; i < power; i += 1) {
      for (x = 0; x < sectionSize + 1; x += 1) {
        srcPos = (xSize * y + x) * 4;
        r = scratchData.data[srcPos + 0];
        g = scratchData.data[srcPos + 1];
        b = scratchData.data[srcPos + 2];
        a = scratchData.data[srcPos + 3];
        dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
        scratchData.data[dstPos + 0] = r;
        scratchData.data[dstPos + 1] = g;
        scratchData.data[dstPos + 2] = b;
        scratchData.data[dstPos + 3] = a;
      }
      sectionSize *= 2;
    }
  }

  // Convert back from polar coordinates
  FromPolar(scratchData, imageData, { polarRotation: 0 });
};

/**
 * get/set kaleidoscope power. Use with {@link Konva.Filters.Kaleidoscope} filter.
 * @name Konva.Node#kaleidoscopePower
 * @method
 * @param {Integer} power of kaleidoscope
 * @returns {Integer}
 */
Factory.addGetterSetter(
  Node,
  'kaleidoscopePower',
  2,
  getNumberValidator(),
  Factory.afterSetFilter
);

/**
 * get/set kaleidoscope angle. Use with {@link Konva.Filters.Kaleidoscope} filter.
 * @name Konva.Node#kaleidoscopeAngle
 * @method
 * @param {Integer} degrees
 * @returns {Integer}
 */
Factory.addGetterSetter(
  Node,
  'kaleidoscopeAngle',
  0,
  getNumberValidator(),
  Factory.afterSetFilter
);
