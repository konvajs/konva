// what is core parts of Konva?
import { Konva as Global } from './Global';

import { Util, Transform } from './Util';
import { Factory } from './Factory';
import * as Validators from './Validators';

import { Node } from './Node';
import { Container } from './Container';

import { Stage, stages } from './Stage';

import { Layer } from './Layer';
import { FastLayer } from './FastLayer';

import { Group } from './Group';

import { DD } from './DragAndDrop';

import { Shape, shapes } from './Shape';

import { Animation } from './Animation';
import { Tween, Easings } from './Tween';

import { Context } from './Context';
import { Canvas } from './Canvas';

export const Konva = Util._assign(Global, {
  Util,
  Factory,
  Validators,
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
