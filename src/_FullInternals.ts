// we need to import core of the Konva and then extend it with all additional objects

import { Konva as Core } from './_CoreInternals.js';

// shapes
import { Arc } from './shapes/Arc.js';
import { Arrow } from './shapes/Arrow.js';
import { Circle } from './shapes/Circle.js';
import { Ellipse } from './shapes/Ellipse.js';
import { Image } from './shapes/Image.js';
import { Label, Tag } from './shapes/Label.js';
import { Line } from './shapes/Line.js';
import { Path } from './shapes/Path.js';
import { Rect } from './shapes/Rect.js';
import { RegularPolygon } from './shapes/RegularPolygon.js';
import { Ring } from './shapes/Ring.js';
import { Sprite } from './shapes/Sprite.js';
import { Star } from './shapes/Star.js';
import { Text } from './shapes/Text.js';
import { TextPath } from './shapes/TextPath.js';
import { Transformer } from './shapes/Transformer.js';
import { Wedge } from './shapes/Wedge.js';

// filters
import { Blur } from './filters/Blur.js';
import { Brighten } from './filters/Brighten.js';
import { Contrast } from './filters/Contrast.js';
import { Emboss } from './filters/Emboss.js';
import { Enhance } from './filters/Enhance.js';
import { Grayscale } from './filters/Grayscale.js';
import { HSL } from './filters/HSL.js';
import { HSV } from './filters/HSV.js';
import { Invert } from './filters/Invert.js';
import { Kaleidoscope } from './filters/Kaleidoscope.js';
import { Mask } from './filters/Mask.js';
import { Noise } from './filters/Noise.js';
import { Pixelate } from './filters/Pixelate.js';
import { Posterize } from './filters/Posterize.js';
import { RGB } from './filters/RGB.js';
import { RGBA } from './filters/RGBA.js';
import { Sepia } from './filters/Sepia.js';
import { Solarize } from './filters/Solarize.js';
import { Threshold } from './filters/Threshold.js';

export const Konva = Core.Util._assign(Core, {
  Arc,
  Arrow,
  Circle,
  Ellipse,
  Image,
  Label,
  Tag,
  Line,
  Path,
  Rect,
  RegularPolygon,
  Ring,
  Sprite,
  Star,
  Text,
  TextPath,
  Transformer,
  Wedge,
  /**
   * @namespace Filters
   * @memberof Konva
   */
  Filters: {
    Blur,
    Brighten,
    Contrast,
    Emboss,
    Enhance,
    Grayscale,
    HSL,
    HSV,
    Invert,
    Kaleidoscope,
    Mask,
    Noise,
    Pixelate,
    Posterize,
    RGB,
    RGBA,
    Sepia,
    Solarize,
    Threshold,
  },
});
