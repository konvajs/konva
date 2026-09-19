// SetType widens what the setter accepts beyond what the getter returns,
// like text.width('auto'). Attribute setters also take null and undefined to
// reset the attribute, so SetType includes them by default; accessors that
// read the value instead of storing it, like node.position(), pass a SetType
// that leaves them out, because they throw on null and undefined.
export interface GetSet<Type, This, SetType = Type | null | undefined> {
  (): Type;
  (v: SetType): This;
}

export interface Vector2d {
  x: number;
  y: number;
}

export interface PathSegment {
  command:
    | 'm'
    | 'M'
    | 'l'
    | 'L'
    | 'v'
    | 'V'
    | 'h'
    | 'H'
    | 'z'
    | 'Z'
    | 'c'
    | 'C'
    | 'q'
    | 'Q'
    | 't'
    | 'T'
    | 's'
    | 'S'
    | 'a'
    | 'A';
  start: Vector2d;
  points: number[];
  pathLength: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IFrame {
  time: number;
  timeDiff: number;
  lastTime: number;
  frameRate: number;
}

export type AnimationFn = (frame: IFrame) => boolean | void;

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}
