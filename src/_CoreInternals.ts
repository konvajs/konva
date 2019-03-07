// what is core parts of Konva?

import { Konva as Global } from './Global';

import { Collection, Util } from './Util';
import { Node, ids, names } from './Node';
import { Container } from './Container';

import { Stage, stages } from './Stage';

import { Layer } from './Layer';
import { FastLayer } from './FastLayer';

import { Group } from './Group';

import { DD } from './DragAndDrop';

import { Shape, shapes } from './Shape';

import { Animation } from './Animation';
import { Tween, Easings } from './Tween';

export const Konva = Object.assign(Global, {
  Collection,
  Util,
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
  Easings
});
