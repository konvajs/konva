// what is core parts of Konva?
import { Konva as Global } from './Global.ts';

import { Util, Transform } from './Util.ts';
import { Node } from './Node.ts';
import { Container } from './Container.ts';

import { Stage, stages } from './Stage.ts';

import { Layer } from './Layer.ts';
import { FastLayer } from './FastLayer.ts';

import { Group } from './Group.ts';

import { DD } from './DragAndDrop.ts';

import { Shape, shapes } from './Shape.ts';

import { Animation } from './Animation.ts';
import { Tween, Easings } from './Tween.ts';

import { Context } from './Context.ts';
import { Canvas } from './Canvas.ts';

export const Konva = Util._assign(Global, {
  Util,
  Transform,
  Node,
  Container,
  Stage,
  stages,
  Layer,
  FastLayer,
  Group,
  DD,
  Shape,
  shapes,
  Animation,
  Tween,
  Easings,
  Context,
  Canvas,
});

export namespace Konva {
  export type Vector2d = import('./types.ts').Vector2d;
  export type Node = import('./Node.ts').Node;
  export type NodeConfig = import('./Node.ts').NodeConfig;
  export type KonvaEventObject<EventType> =
    import('./Node.ts').KonvaEventObject<EventType>;

  export type KonvaPointerEvent =
    import('./PointerEvents.ts').KonvaPointerEvent;

  export type KonvaEventListener<This, EventType> =
    import('./Node.ts').KonvaEventListener<This, EventType>;

  export type Container = import('./Container.ts').Container<Node>;
  export type ContainerConfig = import('./Container.ts').ContainerConfig;

  export type Transform = import('./Util.ts').Transform;

  export type Context = import('./Context.ts').Context;

  export type Stage = import('./Stage.ts').Stage;
  export type StageConfig = import('./Stage.ts').StageConfig;

  export type Layer = import('./Layer.ts').Layer;
  export type LayerConfig = import('./Layer.ts').LayerConfig;

  export type FastLayer = import('./FastLayer.ts').FastLayer;

  export type Group = import('./Group.ts').Group;
  export type GroupConfig = import('./Group.ts').GroupConfig;

  export type Shape = import('./Shape.ts').Shape;
  export type ShapeConfig = import('./Shape.ts').ShapeConfig;

  export type Animation = import('./Animation.ts').Animation;

  export type Tween = import('./Tween.ts').Tween;
  export type TweenConfig = import('./Tween.ts').TweenConfig;
}

export default Konva;
