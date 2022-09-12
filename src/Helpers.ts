export const ORIGIN = { x: 0, y: 0 };
Object.freeze(ORIGIN);

export function addVectors(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type Dir4 = "up" | "down" | "left" | "right";
