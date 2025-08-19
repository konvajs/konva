// the purpose of that file is very stupid
// I was not able to generate correct typescript declarations from the main source code
// because right now Konva is an object. Typescript can not define types from object like this:
// const stage : Konva.Stage = new Konva.Stage();
// we can convert Konva to namespace
// but I was not able to find a way to extend it
// so here we just need to define full API of Konva manually

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

declare namespace Konva {
  export let enableTrace: number;
  export let pixelRatio: number;
  export let autoDrawEnabled: boolean;
  export let dragDistance: number;
  export let angleDeg: boolean;
  export let showWarnings: boolean;
  export let capturePointerEventsEnabled: boolean;
  export let dragButtons: Array<number>;
  export let hitOnDragEnabled: boolean;
  export const isDragging: () => boolean;
  export const isDragReady: () => boolean;
  export const getAngle: (angle: number) => number;

  export type Vector2d = import('./types.ts').Vector2d;

  export const Node: typeof import('./Node.ts').Node;
  export type Node = import('./Node.ts').Node;
  export type NodeConfig = import('./Node.ts').NodeConfig;

  export type KonvaEventObject<EventType> =
    import('./Node.ts').KonvaEventObject<EventType>;

  export type KonvaPointerEvent =
    import('./PointerEvents.ts').KonvaPointerEvent;

  export type KonvaEventListener<This, EventType> =
    import('./Node.ts').KonvaEventListener<This, EventType>;

  export const Container: typeof import('./Container.ts').Container;
  export type Container = import('./Container.ts').Container<Node>;
  export type ContainerConfig = import('./Container.ts').ContainerConfig;

  export const Transform: typeof import('./Util.ts').Transform;
  export type Transform = import('./Util.ts').Transform;

  export const Util: typeof import('./Util.ts').Util;

  export const Context: typeof import('./Context.ts').Context;
  export type Context = import('./Context.ts').Context;

  export const Stage: typeof import('./Stage.ts').Stage;
  export type Stage = import('./Stage.ts').Stage;
  export type StageConfig = import('./Stage.ts').StageConfig;
  export const stages: typeof import('./Stage.ts').stages;

  export const Layer: typeof import('./Layer.ts').Layer;
  export type Layer = import('./Layer.ts').Layer;
  export type LayerConfig = import('./Layer.ts').LayerConfig;

  export const FastLayer: typeof import('./FastLayer.ts').FastLayer;
  export type FastLayer = import('./FastLayer.ts').FastLayer;

  export const Group: typeof import('./Group.ts').Group;
  export type Group = import('./Group.ts').Group;
  export type GroupConfig = import('./Group.ts').GroupConfig;

  export const DD: typeof import('./DragAndDrop.ts').DD;

  export const Shape: typeof import('./Shape.ts').Shape;
  export type Shape = import('./Shape.ts').Shape;
  export type ShapeConfig = import('./Shape.ts').ShapeConfig;
  export const shapes: typeof import('./Shape.ts').shapes;

  export const Animation: typeof import('./Animation.ts').Animation;
  export type Animation = import('./Animation.ts').Animation;

  export const Tween: typeof import('./Tween.ts').Tween;
  export type Tween = import('./Tween.ts').Tween;
  export type TweenConfig = import('./Tween.ts').TweenConfig;
  export const Easings: typeof import('./Tween.ts').Easings;

  export const Arc: typeof import('./shapes/Arc.ts').Arc;
  export type Arc = import('./shapes/Arc.ts').Arc;
  export type ArcConfig = import('./shapes/Arc.ts').ArcConfig;
  export const Arrow: typeof import('./shapes/Arrow.ts').Arrow;
  export type Arrow = import('./shapes/Arrow.ts').Arrow;
  export type ArrowConfig = import('./shapes/Arrow.ts').ArrowConfig;
  export const Circle: typeof import('./shapes/Circle.ts').Circle;
  export type Circle = import('./shapes/Circle.ts').Circle;
  export type CircleConfig = import('./shapes/Circle.ts').CircleConfig;
  export const Ellipse: typeof import('./shapes/Ellipse.ts').Ellipse;
  export type Ellipse = import('./shapes/Ellipse.ts').Ellipse;
  export type EllipseConfig = import('./shapes/Ellipse.ts').EllipseConfig;
  export const Image: typeof import('./shapes/Image.ts').Image;
  export type Image = import('./shapes/Image.ts').Image;
  export type ImageConfig = import('./shapes/Image.ts').ImageConfig;
  export const Label: typeof import('./shapes/Label.ts').Label;
  export type Label = import('./shapes/Label.ts').Label;
  export type LabelConfig = import('./shapes/Label.ts').LabelConfig;
  export const Tag: typeof import('./shapes/Label.ts').Tag;
  export type Tag = import('./shapes/Label.ts').Tag;
  export type TagConfig = import('./shapes/Label.ts').TagConfig;
  export const Line: typeof import('./shapes/Line.ts').Line;
  export type Line = import('./shapes/Line.ts').Line;
  export type LineConfig = import('./shapes/Line.ts').LineConfig;
  export const Path: typeof import('./shapes/Path.ts').Path;
  export type Path = import('./shapes/Path.ts').Path;
  export type PathConfig = import('./shapes/Path.ts').PathConfig;
  export const Rect: typeof import('./shapes/Rect.ts').Rect;
  export type Rect = import('./shapes/Rect.ts').Rect;
  export type RectConfig = import('./shapes/Rect.ts').RectConfig;
  export const RegularPolygon: typeof import('./shapes/RegularPolygon.ts').RegularPolygon;
  export type RegularPolygon =
    import('./shapes/RegularPolygon.ts').RegularPolygon;
  export type RegularPolygonConfig =
    import('./shapes/RegularPolygon.ts').RegularPolygonConfig;
  export const Ring: typeof import('./shapes/Ring.ts').Ring;
  export type Ring = import('./shapes/Ring.ts').Ring;
  export type RingConfig = import('./shapes/Ring.ts').RingConfig;
  export const Sprite: typeof import('./shapes/Sprite.ts').Sprite;
  export type Sprite = import('./shapes/Sprite.ts').Sprite;
  export type SpriteConfig = import('./shapes/Sprite.ts').SpriteConfig;
  export const Star: typeof import('./shapes/Star.ts').Star;
  export type Star = import('./shapes/Star.ts').Star;
  export type StarConfig = import('./shapes/Star.ts').StarConfig;
  export const Text: typeof import('./shapes/Text.ts').Text;
  export type Text = import('./shapes/Text.ts').Text;
  export type TextConfig = import('./shapes/Text.ts').TextConfig;
  export const TextPath: typeof import('./shapes/TextPath.ts').TextPath;
  export type TextPath = import('./shapes/TextPath.ts').TextPath;
  export type TextPathConfig = import('./shapes/TextPath.ts').TextPathConfig;
  export const Transformer: typeof import('./shapes/Transformer.ts').Transformer;
  export type Transformer = import('./shapes/Transformer.ts').Transformer;
  export type TransformerConfig =
    import('./shapes/Transformer.ts').TransformerConfig;
  export const Wedge: typeof import('./shapes/Wedge.ts').Wedge;
  export type Wedge = import('./shapes/Wedge.ts').Wedge;
  export type WedgeConfig = import('./shapes/Wedge.ts').WedgeConfig;

  export const Filters: {
    Blur: typeof Blur;
    Brighten: typeof Brighten;
    Contrast: typeof Contrast;
    Emboss: typeof Emboss;
    Enhance: typeof Enhance;
    Grayscale: typeof Grayscale;
    HSL: typeof HSL;
    HSV: typeof HSV;
    Invert: typeof Invert;
    Kaleidoscope: typeof Kaleidoscope;
    Mask: typeof Mask;
    Noise: typeof Noise;
    Pixelate: typeof Pixelate;
    Posterize: typeof Posterize;
    RGB: typeof RGB;
    RGBA: typeof RGBA;
    Sepia: typeof Sepia;
    Solarize: typeof Solarize;
    Threshold: typeof Threshold;
  };
}

export default Konva;
