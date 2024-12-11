// we need to import core of the Konva and then extend it with all additional objects

import { Konva as Core } from './_CoreInternals';

// shapes
import { Arc } from './shapes/Arc';
import { Arrow } from './shapes/Arrow';
import { Circle } from './shapes/Circle';
import { Ellipse } from './shapes/Ellipse';
import { Image } from './shapes/Image';
import { Label, Tag } from './shapes/Label';
import { Line } from './shapes/Line';
import { Path } from './shapes/Path';
import { Rect } from './shapes/Rect';
import { RegularPolygon } from './shapes/RegularPolygon';
import { Ring } from './shapes/Ring';
import { Sprite } from './shapes/Sprite';
import { Star } from './shapes/Star';
import { Text } from './shapes/Text';
import { TextPath } from './shapes/TextPath';
import { Transformer } from './shapes/Transformer';
import { Wedge } from './shapes/Wedge';

// filters
import { Blur } from './filters/Blur';
import { Brighten } from './filters/Brighten';
import { Contrast } from './filters/Contrast';
import { Emboss } from './filters/Emboss';
import { Enhance } from './filters/Enhance';
import { Grayscale } from './filters/Grayscale';
import { HSL } from './filters/HSL';
import { HSV } from './filters/HSV';
import { Invert } from './filters/Invert';
import { Kaleidoscope } from './filters/Kaleidoscope';
import { Mask } from './filters/Mask';
import { Noise } from './filters/Noise';
import { Pixelate } from './filters/Pixelate';
import { Posterize } from './filters/Posterize';
import { RGB } from './filters/RGB';
import { RGBA } from './filters/RGBA';
import { Sepia } from './filters/Sepia';
import { Solarize } from './filters/Solarize';
import { Threshold } from './filters/Threshold';

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
