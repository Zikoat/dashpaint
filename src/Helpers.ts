export const ORIGIN = { x: 0, y: 0 };
Object.freeze(ORIGIN);

export const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];
Object.freeze(DIRECTIONS);

export function addVectors(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtractVectors(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function isEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function normalizeVector(vector: Point): Point {
  const normalized = {
    x: Math.sign(vector.x),
    y: Math.sign(vector.y),
  };

  if (Math.abs(normalized.x) + Math.abs(normalized.y) !== 1) throw Error("bug");

  return normalized;
}

export function scaleVector(vector: Point, scalar: number): Point {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
}

export function vectorLength(vector: Point): number {
  return Math.abs(vector.x + vector.y);
}

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type Dir4 = "up" | "down" | "left" | "right";
