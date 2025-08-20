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

export namespace Konva {
  export type Vector2d = Core.Vector2d;
  export type Node = Core.Node;
  export type NodeConfig = Core.NodeConfig;
  export type KonvaEventObject<EventType> = Core.KonvaEventObject<EventType>;

  export type KonvaPointerEvent = Core.KonvaPointerEvent;

  export type KonvaEventListener<This, EventType> = Core.KonvaEventListener<This, EventType>;

  export type Container = Core.Container;
  export type ContainerConfig = Core.ContainerConfig;

  export type Transform = Core.Transform;

  export type Context = Core.Context;

  export type Stage = Core.Stage;
  export type StageConfig = Core.StageConfig;

  export type Layer = Core.Layer;
  export type LayerConfig = Core.LayerConfig;

  export type FastLayer = Core.FastLayer;

  export type Group = Core.Group;
  export type GroupConfig = Core.GroupConfig;

  export type Shape = Core.Shape;
  export type ShapeConfig = Core.ShapeConfig;

  export type Animation = Core.Animation;

  export type Tween = Core.Tween;
  export type TweenConfig = Core.TweenConfig;

  export type Arc = import('./shapes/Arc.ts').Arc;
  export type ArcConfig = import('./shapes/Arc.ts').ArcConfig;
  export type Arrow = import('./shapes/Arrow.ts').Arrow;
  export type ArrowConfig = import('./shapes/Arrow.ts').ArrowConfig;
  export type Circle = import('./shapes/Circle.ts').Circle;
  export type CircleConfig = import('./shapes/Circle.ts').CircleConfig;
  export type Ellipse = import('./shapes/Ellipse.ts').Ellipse;
  export type EllipseConfig = import('./shapes/Ellipse.ts').EllipseConfig;
  export type Image = import('./shapes/Image.ts').Image;
  export type ImageConfig = import('./shapes/Image.ts').ImageConfig;
  export type Label = import('./shapes/Label.ts').Label;
  export type LabelConfig = import('./shapes/Label.ts').LabelConfig;
  export type Tag = import('./shapes/Label.ts').Tag;
  export type TagConfig = import('./shapes/Label.ts').TagConfig;
  export type Line = import('./shapes/Line.ts').Line;
  export type LineConfig = import('./shapes/Line.ts').LineConfig;
  export type Path = import('./shapes/Path.ts').Path;
  export type PathConfig = import('./shapes/Path.ts').PathConfig;
  export type Rect = import('./shapes/Rect.ts').Rect;
  export type RectConfig = import('./shapes/Rect.ts').RectConfig;
  export type RegularPolygon =
    import('./shapes/RegularPolygon.ts').RegularPolygon;
  export type RegularPolygonConfig =
    import('./shapes/RegularPolygon.ts').RegularPolygonConfig;
  export type Ring = import('./shapes/Ring.ts').Ring;
  export type RingConfig = import('./shapes/Ring.ts').RingConfig;
  export type Sprite = import('./shapes/Sprite.ts').Sprite;
  export type SpriteConfig = import('./shapes/Sprite.ts').SpriteConfig;
  export type Star = import('./shapes/Star.ts').Star;
  export type StarConfig = import('./shapes/Star.ts').StarConfig;
  export type Text = import('./shapes/Text.ts').Text;
  export type TextConfig = import('./shapes/Text.ts').TextConfig;
  export type TextPath = import('./shapes/TextPath.ts').TextPath;
  export type TextPathConfig = import('./shapes/TextPath.ts').TextPathConfig;
  export type Transformer = import('./shapes/Transformer.ts').Transformer;
  export type TransformerConfig =
    import('./shapes/Transformer.ts').TransformerConfig;
  export type Wedge = import('./shapes/Wedge.ts').Wedge;
  export type WedgeConfig = import('./shapes/Wedge.ts').WedgeConfig;
}
