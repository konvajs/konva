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
  /**
   * Defer automatic Konva.Transformer updates across many synchronous node changes
   * and run them once when the returned function is called.
   * A Transformer normally updates after every change of an attached node, so a loop
   * over N selected nodes costs N updates, each measuring all N nodes. In a batch it costs one.
   * A single setAttrs(), position(), destroyChildren(), removeChildren() call or animation frame is
   * already batched; use this for anything else, for example a React commit or an undo.
   * Attributes and change events stay synchronous. Inside the batch, the Transformer's own
   * x(), y(), width(), height() and getClientRect() are computed on read; its anchors are laid out
   * when the batch finishes, or earlier if something draws or measures them.
   * Change events fire inside the batch, so a listener sees the new attributes and the
   * Transformer's box, but not its anchors; call transformer.update() there if it needs them.
   * Batches nest. Call the returned function in a finally block, and do not keep a batch
   * open across an await or an animation frame.
   * @method
   * @name Konva.beginUpdateBatch
   * @returns {Function} finishes the batch and runs the pending updates
   * @example
   * const finish = Konva.beginUpdateBatch();
   * try {
   *   selectedNodes.forEach((node) => node.width(100));
   * } finally {
   *   finish();
   * }
   */
  beginUpdateBatch: Node._beginUpdateBatch,
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
  export type IRect = import('./types.ts').IRect;
  export type GetSet<Type, This> = import('./types.ts').GetSet<Type, This>;
  export type Filter = import('./Node.ts').Filter;
  export type LineCap = import('./Shape.ts').LineCap;
  export type LineJoin = import('./Shape.ts').LineJoin;
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
