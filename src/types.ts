export interface GetSet<Type, This> {
  (this: This): Type;
  (this: This, v: Type): This;
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
