import { Shape } from './Shape';
import { Stage } from './Stage';

export interface GetSet<Type, This> {
  (): Type;
  (v: Type): This;
}

export interface Vector2d {
  x: number;
  y: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KonvaEventObject<E> {
  target: Shape | Stage;
  evt: E;
  currentTarget: Node;
  cancelBubble: boolean;
}

export type HandlerFunc<E = Event> = (e: KonvaEventObject<E>) => void;

export enum KonvaNodeEvent {
  mouseover = 'mouseover',
  mouseout = 'mouseout',
  mousemove = 'mousemove',
  mouseleave = 'mouseleave',
  mouseenter = 'mouseenter',
  mousedown = 'mousedown',
  mouseup = 'mouseup',
  wheel = 'wheel',
  contextmenu = 'contextmenu',
  click = 'click',
  dblclick = 'dblclick',
  touchstart = 'touchstart',
  touchmove = 'touchmove',
  touchend = 'touchend',
  tap = 'tap',
  dbltap = 'dbltap',
  dragstart = 'dragstart',
  dragmove = 'dragmove',
  dragend = 'dragend'
}

type KonvaEvent = KonvaNodeEvent;

type KonvaEventString = KonvaEvent | string;
