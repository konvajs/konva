// what is core parts of Konva?
import { Konva as Global } from './Global.js';

import { Util, Transform } from './Util.js';
import { Node, ids, names } from './Node.js';
import { Container } from './Container.js';

import { Stage, stages } from './Stage.js';

import { Layer } from './Layer.js';
import { FastLayer } from './FastLayer.js';

import { Group } from './Group.js';

import { DD } from './DragAndDrop.js';

import { Shape, shapes } from './Shape.js';

import { Animation } from './Animation.js';
import { Tween, Easings } from './Tween.js';

import { Context } from './Context.js';
import { Canvas } from './Canvas.js';

export const Konva = Util._assign(Global, {
  Util,
  Transform,
  Node,
  ids,
  names,
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
