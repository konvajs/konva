// we need to import core of the Konva and then extend it with all additional objects

import { Konva as Core } from './_CoreInternals.ts';

// shapes
import { Arc } from './shapes/Arc.ts';
import { Arrow } from './shapes/Arrow.ts';
import { Circle } from './shapes/Circle.ts';
import { Ellipse } from './shapes/Ellipse.ts';
import { Image } from './shapes/Image.ts';
import { Label, Tag } from './shapes/Label.ts';
import { Line } from './shapes/Line.ts';
import { Path } from './shapes/Path.ts';
import { Rect } from './shapes/Rect.ts';
import { RegularPolygon } from './shapes/RegularPolygon.ts';
import { Ring } from './shapes/Ring.ts';
import { Sprite } from './shapes/Sprite.ts';
import { Star } from './shapes/Star.ts';
import { Text } from './shapes/Text.ts';
import { TextPath } from './shapes/TextPath.ts';
import { Transformer } from './shapes/Transformer.ts';
import { Wedge } from './shapes/Wedge.ts';

// filters
import { Blur } from './filters/Blur.ts';
import { Brighten } from './filters/Brighten.ts';
import { Contrast } from './filters/Contrast.ts';
import { Emboss } from './filters/Emboss.ts';
import { Enhance } from './filters/Enhance.ts';
import { Grayscale } from './filters/Grayscale.ts';
import { HSL } from './filters/HSL.ts';
import { HSV } from './filters/HSV.ts';
import { Invert } from './filters/Invert.ts';
import { Kaleidoscope } from './filters/Kaleidoscope.ts';
import { Mask } from './filters/Mask.ts';
import { Noise } from './filters/Noise.ts';
import { Pixelate } from './filters/Pixelate.ts';
import { Posterize } from './filters/Posterize.ts';
import { RGB } from './filters/RGB.ts';
import { RGBA } from './filters/RGBA.ts';
import { Sepia } from './filters/Sepia.ts';
import { Solarize } from './filters/Solarize.ts';
import { Threshold } from './filters/Threshold.ts';

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
