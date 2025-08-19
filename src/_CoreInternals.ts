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

export default Konva;
