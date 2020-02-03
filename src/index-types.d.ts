// the purpose of that file is very stupid
// I was not able to generate correct typescript declarations from the main source code
// because right now Konva is an object. Typescript can not define types from object like this:
// const stage : Konva.Stage = new Konva.Stage();
// we can convert Konva to namespace
// but I was not able to find a way to extend it
// so here we just need to define full API of Konva manually

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

declare namespace Konva {
  export let pixelRatio: number;
  export let dragDistance: number;
  export let angleDeg: boolean;
  export let showWarnings: boolean;
  export let dragButtons: Array<number>;
  export const isDragging: () => boolean;
  export const isDragReady: () => boolean;

  export type Vector2d = import('./types').Vector2d;

  export const Node: typeof import('./Node').Node;
  export type Node = import('./Node').Node;
  export type NodeConfig = import('./Node').NodeConfig;

  export type KonvaEventObject<EventType> = import('./Node').KonvaEventObject<
    EventType
  >;

  export type KonvaPointerEvent = import('./PointerEvents').KonvaPointerEvent;

  export type KonvaEventListener<
    This,
    EventType
  > = import('./Node').KonvaEventListener<This, EventType>;

  export const Container: typeof import('./Container').Container;
  export type Container = import('./Container').Container<Node>;
  export type ContainerConfig = import('./Container').ContainerConfig;

  export const Collection: typeof import('./Util').Collection;
  export type Collection<Node> = import('./Util').Collection<Node>;
  export const Util: typeof import('./Util').Util;
  
  export const Context: typeof import('./Context').Context;
  export type Context = import('./Context').Context;

  export const Stage: typeof import('./Stage').Stage;
  export type Stage = import('./Stage').Stage;
  export const stages: typeof import('./Stage').stages;

  export const Layer: typeof import('./Layer').Layer;
  export type Layer = import('./Layer').Layer;
  export type LayerConfig = import('./BaseLayer').LayerConfig;

  export const FastLayer: typeof import('./FastLayer').FastLayer;
  export type FastLayer = import('./FastLayer').FastLayer;

  export const Group: typeof import('./Group').Group;
  export type Group = import('./Group').Group;

  export const DD: typeof import('./DragAndDrop').DD;

  export const Shape: typeof import('./Shape').Shape;
  export type Shape = import('./Shape').Shape;
  export type ShapeConfig = import('./Shape').ShapeConfig;
  export const shapes: typeof import('./Shape').shapes;

  export const Animation: typeof import('./Animation').Animation;
  export type Animation = import('./Animation').Animation;

  export const Tween: typeof import('./Tween').Tween;
  export type Tween = import('./Tween').Tween;
  export const Easings: typeof import('./Tween').Easings;

  export const Arc: typeof import('./shapes/Arc').Arc;
  export type Arc = import('./shapes/Arc').Arc;
  export type ArcConfig = import('./shapes/Arc').ArcConfig;
  export const Arrow: typeof import('./shapes/Arrow').Arrow;
  export type Arrow = import('./shapes/Arrow').Arrow;
  export type ArrowConfig = import('./shapes/Arrow').ArrowConfig;
  export const Circle: typeof import('./shapes/Circle').Circle;
  export type Circle = import('./shapes/Circle').Circle;
  export type CircleConfig = import('./shapes/Circle').CircleConfig;
  export const Ellipse: typeof import('./shapes/Ellipse').Ellipse;
  export type Ellipse = import('./shapes/Ellipse').Ellipse;
  export type EllipseConfig = import('./shapes/Ellipse').EllipseConfig;
  export const Image: typeof import('./shapes/Image').Image;
  export type Image = import('./shapes/Image').Image;
  export type ImageConfig = import('./shapes/Image').ImageConfig;
  export const Label: typeof import('./shapes/Label').Label;
  export type Label = import('./shapes/Label').Label;
  export type LabelConfig = import('./shapes/Label').LabelConfig;
  export const Tag: typeof import('./shapes/Label').Tag;
  export type Tag = import('./shapes/Label').Tag;
  export type TagConfig = import('./shapes/Label').TagConfig;
  export const Line: typeof import('./shapes/Line').Line;
  export type Line = import('./shapes/Line').Line;
  export type LineConfig = import('./shapes/Line').LineConfig;
  export const Path: typeof import('./shapes/Path').Path;
  export type Path = import('./shapes/Path').Path;
  export type PathConfig = import('./shapes/Path').PathConfig;
  export const Rect: typeof import('./shapes/Rect').Rect;
  export type Rect = import('./shapes/Rect').Rect;
  export type RectConfig = import('./shapes/Rect').RectConfig;
  export const RegularPolygon: typeof import('./shapes/RegularPolygon').RegularPolygon;
  export type RegularPolygon = import('./shapes/RegularPolygon').RegularPolygon;
  export type RegularPolygonConfig = import('./shapes/RegularPolygon').RegularPolygonConfig;
  export const Ring: typeof import('./shapes/Ring').Ring;
  export type Ring = import('./shapes/Ring').Ring;
  export type RingConfig = import('./shapes/Ring').RingConfig;
  export const Sprite: typeof import('./shapes/Sprite').Sprite;
  export type Sprite = import('./shapes/Sprite').Sprite;
  export type SpriteConfig = import('./shapes/Sprite').SpriteConfig;
  export const Star: typeof import('./shapes/Star').Star;
  export type Star = import('./shapes/Star').Star;
  export type StarConfig = import('./shapes/Star').StarConfig;
  export const Text: typeof import('./shapes/Text').Text;
  export type Text = import('./shapes/Text').Text;
  export type TextConfig = import('./shapes/Text').TextConfig;
  export const TextPath: typeof import('./shapes/TextPath').TextPath;
  export type TextPath = import('./shapes/TextPath').TextPath;
  export type TextPathConfig = import('./shapes/TextPath').TextPathConfig;
  export const Transformer: typeof import('./shapes/Transformer').Transformer;
  export type Transformer = import('./shapes/Transformer').Transformer;
  export type TransformerConfig = import('./shapes/Transformer').TransformerConfig;
  export const Wedge: typeof import('./shapes/Wedge').Wedge;
  export type Wedge = import('./shapes/Wedge').Wedge;
  export type WedgeConfig = import('./shapes/Wedge').WedgeConfig;

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
